from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')

class DB():
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client["inventry_db"]

    def get_products_collection(self):
        return self.db["products"]


# Sample Products
sample_product = {
    "barcode": "9783981305449",
    "product_name": "Yippee",
    "brand": "maggie",
    "pack_size": "1"
}

# products = [
#     {"barcode": "9783981305449", "product_name": "Pure Sip Fruit Juice","brand": "Juice","pack_size": "1"},
#     {"barcode": "8901030895512", "product_name": "Coca Cola 750ml","brand": "Juice","pack_size": "1"},
#     {"barcode": "8901234567890", "product_name": "Maggie Noodles","brand": "food","pack_size": "1"}
# ]

# print(result.inserted_id)
database = DB()
# search_barcode = "9783981305449"
result = database.get_products_collection().insert_one(sample_product)

# product = database.get_products_collection().find_one({"barcode": search_barcode})

# if product:
#     print(f"product found: {product['product_name']}")
# else:
#     print("Not found")

