from rapidfuzz import fuzz
# from pymongo import MongoClient
from Barcode.scanner import BarcodeDecoder
from extractors.label_extractor import LabelExtractor
from Validation.business_validator import BusinessValidator
from OCR.PaddleOcr import PaddleOcr

from Services.google_sheets_service import GoogleSheetsService

class ProcessProductService:
    def __init__(self, product_collection, label_config, sheets_creds_file, sheet_id):
        self.barcode_decoder = BarcodeDecoder()
        self.paddle_ocr = PaddleOcr()
        self.label_extractor = LabelExtractor(label_config)
        self.business_validator = BusinessValidator()
        self.sheets_service = GoogleSheetsService(sheets_creds_file, sheet_id)

        # MongoDB connection
        # client = MongoClient(mongo_connection_string)
        # db = client['inventry_db']
        self.products_collection = product_collection

    def process_product_image(self, image):
        """
        Process product image:
        - Scan barcode
        - Look up in MongoDB
        - Return product details
        """

        barcode_result = self.barcode_decoder.decode_image(image)

        if barcode_result is None:
            return self.identify_product_from_ocr(image)

        if not barcode_result['success']:
            # Barcode failed, fallback to OCR
            return self.identify_product_from_ocr(image)
        
        # Handle if barcode_result is None
        # if barcode_result is None:
        #     return {
        #         "barcode_found": False,
        #         "product": None
        #     }

        # if not barcode_result['success']:
        #     return {
        #         "barcode_found": False,
        #         "product": None
        #     }

        # Step 2: Look up in MongoDB
        barcode_number = barcode_result['barcode']
        
        product = self.products_collection.find_one({"barcode": barcode_number})
        
        if product:
            product.pop('_id', None)
            return {
                "barcode_found": True,
                "product_found": True,
                "product": product,
                "barcode": barcode_number,
                "method": "barcode"
            }
        else:
            # Barcode found but no product, try OCR fallback
            print("It goes with product finding with oc")
            return self.identify_product_from_ocr(image)

    def process_label_image(self, image):
        """
        Process label image:
        - Extract text with OCR
        - Parse fields
        - Validate fields
        - Return validation result
        """
        # Step 1: Extract text from image
        ocr_text = self.paddle_ocr.extract_text(image)
        
        # Step 2: Parse fields
        extracted = self.label_extractor.extract_fields(ocr_text)
        
        # Step 3: Validate
        validation = self.business_validator.validate_all(extracted)
        
        return {
            "label": extracted,
            "validation": validation
        }

    def process_complete(self, product_image, label_image):
        """
        Process BOTH images and return unified response
        
        Input:
        - product_image: photo with barcode
        - label_image: photo with MRP/Batch/etc
        
        Output:
        {
            "product": {...},
            "label": {...},
            "validation": {...}
        }
        """
        # Step 1: Process product image
        product_result = self.process_product_image(product_image)
        
        # Step 2: Process label image
        label_result = self.process_label_image(label_image)
        
        # Step 3: Combine results
        return {
            "product": product_result,
            "label": label_result['label'],
            "validation": label_result['validation']
        }

    def identify_product_from_ocr(self, image):
        """
        Fallback: If barcode not found, use OCR + fuzzy match
        """
        # Extract text from image
        ocr_text = self.paddle_ocr.extract_text(image)
        print("product detailed",ocr_text)

       # Get all products from MongoDB
        all_products = list(self.products_collection.find())
        
        best_match = None
        best_score = 0
        
        # Fuzzy match each line against products
        for line in ocr_text.split('\n'):
            for product in all_products:
                score = fuzz.ratio(line.lower(), product['product_name'].lower())
                
                if score > best_score:
                    best_score = score
                    best_match = product
        
        # If good match (>70%), return it
        if best_score > 70 and best_match:
            best_match.pop('_id', None)
            return {
                "barcode_found": False,
                "product_found": True,
                "product": best_match,
                "method": "ocr_fuzzy_match",
                "confidence": best_score
            }
        else:
            return {
                "barcode_found": False,
                "product_found": False,
                "product": None,
                "method": "ocr_fuzzy_match"
            }



    def save_to_sheets(self, product_result, label_result, validation):
        """
        Save extracted data to Google Sheets
        """
        product_name = product_result['product']['product_name'] if product_result['product'] else "Unknown"
        barcode = product_result['barcode'] if product_result['barcode_found'] else "N/A"
        val_list = validation['warnings']
        Validation = ", ".join(val_list)
        
        row_data = [
            product_name,
            barcode,
            label_result['mrp'],
            label_result['batch'],
            label_result['mfg'],
            label_result['exp'],
            Validation
        ]
        
        self.sheets_service.append_row(row_data)

        return {"saved": True}