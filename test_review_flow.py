import requests
import json

BASE_URL = "http://localhost:8000"

# Step 1: Upload images for review (don't save yet)
print("Step 1: Uploading images for review...")

with open('Photos/yeppie front.png', 'rb') as product_f, \
     open('Photos/mrp.png', 'rb') as label_f:
    
    files = {
        'product_image': product_f,
        'label_image': label_f
    }
    
    response = requests.post(f"{BASE_URL}/process-product", files=files)
    review_data = response.json()

print("Review Data:")
print(json.dumps(review_data, indent=2))

# Step 2: User can edit the data
print("\n\nStep 2: User edits data...")
edited_data = {
    "product_name": review_data['product']['product']['product_name'],  # User can change
    "barcode": review_data['product']['barcode'],
    "mrp": review_data['label']['mrp'],
    "batch": review_data['label']['batch'],
    "mfg": review_data['label']['mfg'],
    "exp": review_data['label']['exp'],
    "quantity": review_data['label']['quantity']
}

print("Edited Data:")
print(json.dumps(edited_data, indent=2))

# Step 3: User confirms and saves
print("\n\nStep 3: Confirming and saving...")
response = requests.post(f"{BASE_URL}/confirm-and-save", json=edited_data)
save_result = response.json()

print("Save Result:")
print(json.dumps(save_result, indent=2))