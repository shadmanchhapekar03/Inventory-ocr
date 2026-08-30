import cv2
from pyzbar.pyzbar import decode
import numpy as np

# image = cv2.imread("C:/Users/DELL/OneDrive/Documents/Inventory_project/barcode.png")
# # print(image.shape)

# decoded = decode(image)

# if len(decoded) > 0:
#     try:
#         barcode = decoded[0].data.decode()
#         print(f"Barcode: {barcode}")
#     except:
#         ValueError("barcode not found")

class BarcodeDecoder():

    def decode_image(self, image):

        decoded = decode(image)

        if len(decoded) > 0:
            try:
                barcode = decoded[0].data.decode()
                b_type = decoded[0].type
                success = True if barcode else False
                return {
                    "success": success,
                    "barcode": barcode,
                    "type": b_type
                    }
            except:
                return {
                    "success": False, 
                    "error": "barcode not found"
                    }
        else:
            return None