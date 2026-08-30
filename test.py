#======================For OCR========================
# import os
# import pytesseract
# import cv2

# # Point pytesseract at the installed Windows Tesseract executable.
# tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# if os.path.exists(tesseract_path):
#     pytesseract.pytesseract.tesseract_cmd = tesseract_path
# else:
#     raise FileNotFoundError(f"Tesseract not found at: {tesseract_path}")

# # image = "C:/Users/DELL/OneDrive/Documents/Inventory_project/little_blur_barcode.jpg"
# image_path = "fruit_juice.jpg"
# image = cv2.imread(image_path)
# if image is None:
#     raise FileNotFoundError(f"Image not found: {image_path}")

# image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
# image = cv2.medianBlur(image, 5)

# text = pytesseract.image_to_string(image)
# print(text)

#======================Fuzzy search========================
# from rapidfuzz import fuzz
# from pymongo import MongoClient

# connection_string = "mongodb+srv://shadmannc0516_db_user:7OFzUAvfgkqv3Riv@cluster0.eduf2yl.mongodb.net/?appName=Cluster0"

# client = MongoClient(connection_string)

# db = client['inventry_db']

# products_collection = db['products']

# def fuzzy_search_product(ocr_text, mock_products):
#     best_match = None
#     best_score = 0
    
#     for product in mock_products:
#         score = fuzz.ratio(ocr_text.lower(), product['name'].lower())
        
#         if score > best_score:
#             best_score = score
#             best_match = product
    
#     if best_score > 80:
#         return {"match": best_match, "score": best_score}
#     else:
#         return None

## Mock products
# mock_products = [
#     {"name": "Pure Sip Fruit Juice"},
#     {"name": "Coca Cola 750ml"},
#     {"name": "Maggi Noodles"}
# ]

# result = fuzzy_search_product("pure fruit juice", mock_products)
# print(result)

#=====================OCR Testing Tesseract===============

# import cv2
# from tesseract_ocr import OCRReader

# # Load image
# image = cv2.imread('Photos/nutrition.jpg')

# # Extract text
# ocr_reader = OCRReader()
# ocr_text = ocr_reader.extract_text(image)

# print("OCR extracted:")
# print(ocr_text)
# print("\n" + "="*50 + "\n")

# # Mock products
# mock_products = [
#     {"name": "Food Fone"},
#     {"name": "Nutrition Label"},
#     {"name": "Coca Cola"}
# ]

# # Fuzzy match
# result = ocr_reader.fuzzy_search_product(ocr_text, mock_products)
# print("Fuzzy match result:")
# print(result)

#=====================OCR Testing EasyOCR===============

# import cv2
# import numpy as np

# def get_blur_score(image):
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     return cv2.Laplacian(gray, cv2.CV_64F).var()

# def sharpen_image(image):
#     kernel = np.array([
#         [-1,-1,-1],
#         [-1, 9,-1],
#         [-1,-1,-1]
#     ])
#     return cv2.filter2D(image,-1, kernel)

# def detect_skew_angle(image):

#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#     thresh = cv2.threshold(
#         gray,
#         0,
#         255,
#         cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
#     )[1]

#     coords = np.column_stack(np.where(thresh > 0))

#     angle = cv2.minAreaRect(coords)[-1]

#     if angle < -45:
#         angle = 90 + angle

#     return angle

# img = cv2.imread("Photos/rotate.jpg")

# # blur_score = sharpen_image(img)
# # blur_score = get_blur_score(blur_score)

# angle = detect_skew_angle(img)

# import easyocr

# reader = easyocr.Reader(['en'])

# result = reader.readtext(
#     img,
#     rotation_info=[90,180,270]
# )

# texts = []

# for _, text, conf in result:

#     if conf > 0.2:
#         texts.append(text)

# ocr_text = " ".join(texts)

# print(ocr_text)

# from rapidfuzz import process

# products = [
#     "Samsung Galaxy",
#     "Britannia Biscuit",
#     "Parle G",
#     "Dairy Milk"
# ]

# match = process.extractOne(
#     ocr_text,
#     products
# )

# print(match)


# ==========================Google cloud vision Testing======================

# import os
# from google.cloud import vision

# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'inventrybased-fbc796ec8d23.json'

# client = vision.ImageAnnotatorClient()

# with open('Photos/nutrition.jpg', 'rb') as image_path:
#     content = image_path.read()

# image = vision.Image(content=content)
# response = client.text_detection(image=image)
# texts = response.text_annotations

# if texts:
#     print("Detected Text:")
#     print(texts[0].description.strip())
# else:
#     print("No text detected.")

# # Check for errors
# if response.error.message:
#     raise Exception(
#         f"Google Vision API Error: {response.error.message}"
#     )

# ===============Paddle OCR==========================

# from paddleocr import PaddleOCR

# ocr = PaddleOCR(
#     # use_doc_orientation_classify=True,
#     # use_doc_unwarping=True,
#     # use_textline_orientation=True
# )

# print("Models loaded successfully")

# # Run OCR
# result = ocr.predict("Photos/fruit_juice.jpg")

# # Print detected text
# for page in result:
#     for text in page["rec_texts"]:
#         print(text)

#======================= Testing the Ocr for mrp and all===============================
# extractors/label_extractor.py

# import re

# class LabelExtractor:
#     def __init__(self, config):
#         """
#         config = dictionary with field patterns
#         Example: {
#             "mrp": { "keyword": "MRP", "pattern": r'(\d+)', "offset": 1 }
#         }
#         """
#         self.config = config
    
#     def extract_fields(self, text):
#         """
#         Main method: takes OCR text, returns extracted fields
#         """
#         lines = text.split('\n')
#         results = {}
        
#         # For each field in config
#         for field_name, field_config in self.config.items():
#             value = self._find_and_extract(lines, field_config)
#             results[field_name] = value
        
#         return results
    
#     def _find_and_extract(self, lines, field_config):
#         """
#         Find keyword in lines, then extract value based on pattern
#         """
#         keyword = field_config['keyword']
#         pattern = field_config['pattern']
#         offset = field_config.get('offset', 1)  # Default: next line
#         offset_range = field_config.get('offset_range', 3)
#         exclude_units = field_config.get('exclude_units', False)
        
#         # Search for keyword
#         for i, line in enumerate(lines):
#             if keyword.lower() in line.lower():
#                 # Search in range: offset to offset+offset_range
#                 for j in range(offset, offset + offset_range):
#                     search_index = i + j
                    
#                     if search_index < len(lines):
#                         search_line = lines[search_index]

#                         # Skip lines with units if exclude_units is True
#                         if exclude_units:
#                             if re.search(r'(g|mg|ml|kcal|%)', search_line, re.IGNORECASE):
#                                 continue

#                         match = re.search(pattern, search_line)
#                         if match:
#                             return match.group(1)
        
#         return None

# config = {
#     "mrp": {
#         "keyword": "MRP",
#         "pattern": r'(\d+\.\d+|\d+)(?!\w)',
#         "offset": 1,
#         "offset_range": 9
#     },
#     "batch": {
#         "keyword": "Lot No",
#         "pattern": r'([A-Z0-9]+)',
#         "offset": 1,
#         "offset_range": 2,
#         "exclude_units": True
#     },
#     "mfg": {
#         "keyword": "MFD",
#         "pattern": r'(\d{2}/\d{2}/\d{2})',
#         "offset": 1,
#         "offset_range": 2
#     },
#     "exp": {
#         "keyword": "Use By",
#         "pattern": r'(\d{2}/\d{2}/\d{2})',
#         "offset": 1,
#         "offset_range": 1
#     },
#     "quantity": {
#         "keyword": "NET QUANTITY",
#         "pattern": r'(\d+)',
#         "offset": 1,
#         "offset_range": 5
#     }
# }

# # ocr_text = """MRP ₹
# # 10.00
# # Lot No.
# # B3412DPA00
# # MFD.
# # 14/12/23
# # Use By
# # 13/06/24
# # NET QUANTITY:
# # 71 g"""

# import cv2
# import numpy as np

# import sys
# import os

# sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# from OCR.PaddleOcr import PaddleOcr
# ocr = PaddleOcr()


# with open('C:/Users/DELL/OneDrive/Documents/Inventory_project/Photos/mrp.png', 'rb') as img_path:
#     content = img_path.read()

# nparr = np.frombuffer(content, np.uint8)
# image = cv2.imdecode(nparr,cv2.IMREAD_COLOR)
# ocr_text = ocr.extract_text(image)
# print("OCR: " + ocr_text)


# extractor = LabelExtractor(config)

# result = extractor.extract_fields(ocr_text)

# print("Extracted:")
# print(result)

from pymongo import MongoClient

connection_string = "mongodb+srv://shadmannc0516_db_user:7OFzUAvfgkqv3Riv@cluster0.eduf2yl.mongodb.net/?appName=Cluster0"

client = MongoClient(connection_string)
db = client['inventry_db']
products_collection = db['products']

# Find this barcode
result = products_collection.find_one({"barcode": "9783981305449"})

if result:
    print("Found:")
    print(result)
else:
    print("Not found!")

# Show all products
print("\nAll products in DB:")
all_products = list(products_collection.find())
for product in all_products:
    print(f"Barcode: {product.get('barcode')}, Name: {product.get('product_name', product.get('name'))}")