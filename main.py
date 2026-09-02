from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import os

from Barcode.scanner import BarcodeDecoder
from OCR.PaddleOcr import PaddleOcr
from extractors.label_extractor import LabelExtractor
# from Validation.validator import LableValidator ------> old one
from Validation.business_validator import BusinessValidator
from Services.process_product import ProcessProductService
from DataBase.mongo import DB

from pymongo import MongoClient

creds_file = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
sheet_id = os.getenv('GOOGLE_SHEET_ID')

connection_string = "mongodb+srv://shadmannc0516_db_user:7OFzUAvfgkqv3Riv@cluster0.eduf2yl.mongodb.net/?appName=Cluster0"

client = MongoClient(connection_string)

db = client['inventry_db']

products_collection = db['products']

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

decoder = BarcodeDecoder()



@app.get("/")
def home():
    return {
        "Welcome u can now start uploading images"
    }
# Learning how to upload image and extract barcode

# @app.post("/upload")
# async def upload(file: UploadFile = File(...)):
#     content = await file.read()
#     nparr = np.frombuffer(content,np.uint8)
#     image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#     barcode = decoder.decode_image(image)
#     return barcode

# Learning how to search the barcode from db

# @app.post("/search-barcode")
# async def search_barcode(barcode: str):
#     product = products_collection.find_one({"barcode": barcode})

#     if product:
#         product.pop('_id')
#         return {
#             "found": True,
#             "product": product
#         }
#     else:
#         return {
#             "found": False
#         }

# The result of upload and search_barcode

@app.post("/scan-product")
async def scan_product(file: UploadFile = File(...)):
    content = await file.read()

    nparr = np.frombuffer(content, np.uint8)
    image = cv2.imdecode(nparr,cv2.IMREAD_COLOR)

    barcode = decoder.decode_image(image)

    if barcode['success']:
        product = products_collection.find_one({"barcode": barcode['barcode']})

        if product:
            product.pop('_id')
            return {
                "success": barcode['success'],
                "barcode_found": True,
                "barcode": barcode['barcode'],
                "product_found": True,
                "product": product
                }
        else:
            return {
                    "success": barcode['success'],
                    "barcode-found": True,
                    "barcode": barcode['barcode'],
                    "product-found": False,
                }
    else:
        return {
            "success": barcode['success'],
            "barcode-found": False,
            "barcode": barcode['barcode']
        }

# Mock products
# mock_products = [
#     {"name": "Pure Sip Fruit Juice"},
#     {"name": "Coca Cola 750ml"},
#     {"name": "Maggi Noodles"}
# ]

dataBase = DB()

@app.post("/identify-product")
async def identify_product(file: UploadFile = File(...)):

    content = await file.read()
    nparr = np.frombuffer(content, np.uint8)
    image = cv2.imdecode(nparr,cv2.IMREAD_COLOR)

    # OCR extraction
    ocr_text = PaddleOcr().extract_text(image)
    # print(f"OCR extracted: {ocr_text}")

    # Search with fuzzy match
    result = PaddleOcr().fuzzy_search_product(ocr_text, dataBase.get_products_collection())
    print(f"Result: {result}")
    if result:
        return {
            "method": "ocr",
            "product_found": True,
            "product": result['match'],
            "confidence": result['score']
        }
    else:
        return {
            "method": "ocr",
            "product_found": False
        }

config = {
    "mrp": {
        "keyword": "MRP",
        "pattern": r'(\d+\.\d+|\d+)(?!\w)',
        "offset": 1,
        "offset_range": 9
    },
    "batch": {
        "keyword": "Lot No",
        "pattern": r'([A-Z0-9]+)',
        "offset": 1,
        "offset_range": 2,
        "exclude_units": True
    },
    "mfg": {
        "keyword": "MFD",
        "pattern": r'(\d{2}/\d{2}/\d{2})',
        "offset": 1,
        "offset_range": 2
    },
    "exp": {
        "keyword": "Use By",
        "pattern": r'(\d{2}/\d{2}/\d{2})',
        "offset": 1,
        "offset_range": 1
    },
    "quantity": {
        "keyword": "NET QUANTITY",
        "pattern": r'(\d+)',#r'(\d+\s*(?:g|kg|ml|l))',
        "offset": 1,
        "offset_range": 5
    }
}

process_service = ProcessProductService(
    dataBase.get_products_collection(),
    config,
    creds_file,
    sheet_id
    )

@app.post("/extract-label")
async def extract_label(file: UploadFile = File(...)):
    content = await file.read()
    nparr = np.frombuffer(content, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    ocr_text = PaddleOcr().extract_text(image)

    extractor = LabelExtractor(config)
    extracted = extractor.extract_fields(ocr_text)

    # # Add validation -------> old validator
    # validator = LableValidator()
    # validation = validator.validate(extracted)

    # Step 3: Validate all rules
    business_validator = BusinessValidator()
    validation = business_validator.validate_all(extracted)

    return {
        "label": extracted,
        "validation": validation
    }


@app.post("/process-product")
async def process_product(product_image: UploadFile = File(...), label_image: UploadFile = File(...)):
    # Read product image
    product_content = await product_image.read()
    product_nparr = np.frombuffer(product_content, np.uint8)
    product_img = cv2.imdecode(product_nparr, cv2.IMREAD_COLOR)
    
    # Read label image
    label_content = await label_image.read()
    label_nparr = np.frombuffer(label_content, np.uint8)
    label_img = cv2.imdecode(label_nparr, cv2.IMREAD_COLOR)
    
    # Process both images
    result = process_service.process_complete(product_img, label_img)
    # print("the Result",result)

    # if result['validation']:
    #     process_service.save_to_sheets(result['product'], result['label'], result['validation'])
    #     print("The row had been added")
    
    
    return {
        "review_id": "temp_id_123",  # We'll improve this later
        "product": result['product'],
        "label": result['label'],
        "validation": result['validation']
    }

@app.post("/confirm-and-save")
async def confirm_and_save(data: dict):
    """
    User reviewed the data and confirmed it.
    Now save to Google Sheets.

    Input: {
        "product_name": "Pure Sip Fruit Juice",
        "barcode": "9783981305449",
        "mrp": "10.00",
        "batch": "B3412DPA02",
        "mfg": "14/12/23",
        "exp": "13/06/24",
        "quantity": "71"
    }
    """
    try:
        row_data = [
            data.get('product_name', 'Unknown'),
            data.get('barcode', 'N/A'),
            data.get('mrp', ''),
            data.get('batch', ''),
            data.get('mfg', ''),
            data.get('exp', ''),
            data.get('quantity', '')
        ]

        # Save to sheets
        process_service.sheets_service.append_row(row_data)

        return {
            "success": True,
            "message": "Data saved to Google Sheets"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/get-sheets-data")
async def get_sheets_data():
    """
    Fetch all product records from Google Sheets.
    Returns data in the format expected by the frontend.
    Falls back to mock data if Google Sheets unavailable.

    Handles both column structures:
    - Old: [Product Name, Barcode, MRP, Batch, MFG Date, EXP Date, Quantity, Date Added]
    - New: [Product, Barcode, MRP, Batch, MFG, EXP, Validation]
    """
    try:
        from datetime import datetime

        print("📥 Fetching data from Google Sheets service...")

        # Get all values from sheets (includes mock data fallback)
        all_rows = process_service.sheets_service.get_all_rows()

        if not all_rows:
            print("[WARN] No data found, returning empty array")
            return []

        print(f"📊 Total rows from sheet: {len(all_rows)}")

        # Get header row to determine column structure
        header_row = all_rows[0] if all_rows else []
        print(f"📋 Header row: {header_row}")

        # Convert to JSON format with proper types
        products = []

        # Skip header row (first row)
        data_rows = all_rows[1:] if len(all_rows) > 1 else []

        if not data_rows:
            print("[WARN] No product rows found")
            return []

        for idx, row in enumerate(data_rows):
            try:
                # Ensure row has enough columns, pad with empty strings if needed
                while len(row) < 8:
                    row.append('')

                # Extract fields - handle both old and new column structures
                # Column 0: Product Name (or Product)
                product_name = str(row[0]) if len(row) > 0 and row[0] else "Unknown"

                # Column 1: Barcode
                barcode = str(row[1]) if len(row) > 1 and row[1] else "N/A"

                # Column 2: MRP
                try:
                    mrp = float(row[2]) if len(row) > 2 and row[2] else 0.0
                except (ValueError, TypeError):
                    mrp = 0.0

                # Column 3: Batch
                batch = str(row[3]) if len(row) > 3 and row[3] else ""

                # Column 4: MFG (Manufacturing Date)
                mfg = str(row[4]) if len(row) > 4 and row[4] else ""

                # Column 5: EXP (Expiry Date)
                exp = str(row[5]) if len(row) > 5 and row[5] else ""

                # Column 6: Quantity (or Validation in new structure)
                # Try to parse as quantity first, fall back to 0
                try:
                    quantity = int(float(row[6])) if len(row) > 6 and row[6] else 0
                except (ValueError, TypeError):
                    quantity = 0

                # Column 7: Date Added (or use current time)
                date_added = str(row[7]) if len(row) > 7 and row[7] else datetime.now().isoformat()

                product = {
                    "product_name": product_name,
                    "barcode": barcode,
                    "mrp": mrp,
                    "batch": batch,
                    "mfg": mfg,
                    "exp": exp,
                    "quantity": quantity,
                    "date_added": date_added
                }

                products.append(product)
                print(f"[OK] Row {idx + 1}: {product_name} | {barcode} | ₹{mrp}")

            except Exception as e:
                print(f"[WARN] Skipping invalid row {idx + 1}: {row}")
                print(f"   Error: {e}")
                continue

        print(f"[OK] Successfully processed {len(products)} products")
        return products

    except Exception as e:
        print(f"[ERROR] Error fetching sheets data: {e}")
        import traceback
        traceback.print_exc()
        # Return empty array instead of error object
        return []
    
@app.post("/process-bulk")
async def process_bulk(
    product_images: list[UploadFile] = File(...),
    label_images: list[UploadFile] = File(...)
):
    """
    Process multiple product-label pairs in parallel
    
    product_images: list of product photos
    label_images: list of label photos
    """
    # Convert uploaded files to numpy arrays
    product_arrays = []
    label_arrays = []
    
    # Process product images
    for file in product_images:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        product_arrays.append(image)
    
    # Process label images
    for file in label_images:
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        label_arrays.append(image)
    
    # Process all pairs in parallel
    results = process_service.process_bulk(product_arrays, label_arrays)
    
    return {
        "total": len(results),
        "results": results
    }