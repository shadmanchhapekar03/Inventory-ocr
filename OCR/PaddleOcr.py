from paddleocr import PaddleOCR
import cv2
import numpy as np
import time
from rapidfuzz import fuzz

class PaddleOcr():
    def __init__(self):
        start = time.perf_counter()
        self.ocr = PaddleOCR()
        end = time.perf_counter()
        print(f"Model Load Time: {end - start:.3f} seconds")

    def fuzzy_search_product(self, ocr_text, products_collection):
            all_products = list(products_collection.find())
            print(f"all_products: {all_products}")
            # Split text into lines
            lines = ocr_text.split('\n')
            
            best_match = None
            best_score = 0
            
            # Search each line against each product
            for line in lines:
                for product in all_products:
                    if product:
                        product["_id"] = str(product["_id"])
                    score = fuzz.ratio(line.lower(), product['product_name'].lower())
                    
                    if score > best_score:
                        best_score = score
                        best_match = product
            
            # Accept if score 70+
            if best_score > 70:
                print(f"Score: {best_score}")
                print(f"match: {best_match}")
                return {"match": best_match, "score": best_score}
            else:
                return {"match": best_match, "score": best_score}


    def extract_text(self,image):

        # gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        texts = []

        result = self.ocr.predict(image)
        print("Extracted Success")
        
        for page in result:
            texts.extend(page["rec_texts"])

        return "\n".join(texts) if texts else None

# with open("Photos/nutrition.jpg", 'rb') as image_path:
#     content = image_path.read()

# nparr = np.frombuffer(content, np.uint8)
# image = cv2.imdecode(nparr,cv2.IMREAD_COLOR)
# ocr = PaddleOcr()


# start_time = time.perf_counter()
# result = ocr.extract_text(image)
# end_time = time.perf_counter()

# print(f"Imported text: {result}")
# print(f"OCR Time: {end_time - start_time:.3f} seconds")

# OCR Time: 43.267 seconds