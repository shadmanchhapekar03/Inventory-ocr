import pytesseract
import cv2
from rapidfuzz import fuzz

class OCRReader():
    def __init__(self):
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    def extract_text(self, image):
        # Better preprocessing for tilted images
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Upscale (make text bigger)
        upscaled = cv2.resize(gray, None, fx=2, fy=2)
        
        # Better contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(upscaled)
        
        # Extract text
        text = pytesseract.image_to_string(enhanced)
        return text

    def fuzzy_search_product(self, ocr_text, products):
        # Split text into lines
        lines = ocr_text.split('\n')
        
        best_match = None
        best_score = 0
        
        # Search each line against each product
        for line in lines:
            for product in products:
                score = fuzz.ratio(line.lower(), product['name'].lower())
                
                if score > best_score:
                    best_score = score
                    best_match = product
        
        # Accept if score 70+
        if best_score > 70:
            return {"match": best_match, "score": best_score}
        else:
            return None