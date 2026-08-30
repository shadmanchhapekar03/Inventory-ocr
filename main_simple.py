"""
Simplified inventory backend for testing frontend
- CORS enabled
- Mock endpoints that return sample data
- No heavy dependencies (cv2, paddleocr, etc.)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database for testing
mock_products = [
    {
        "product_name": "Pure Sip Fruit Juice",
        "barcode": "9783981305449",
        "mrp": 50.00,
        "batch": "B3412DPA02",
        "mfg": "14/12/23",
        "exp": "13/06/24",
        "quantity": 71,
        "date_added": "2026-08-29T07:15:00Z"
    },
    {
        "product_name": "Coca Cola 750ml",
        "barcode": "8901234567890",
        "mrp": 65.00,
        "batch": "B5678ABC",
        "mfg": "01/08/26",
        "exp": "01/08/27",
        "quantity": 45,
        "date_added": "2026-08-28T10:30:00Z"
    },
]

@app.get("/")
def home():
    return {"message": "Inventory API Running - Testing Mode"}

@app.post("/process-product")
async def process_product(product_image: UploadFile = File(...), label_image: UploadFile = File(...)):
    """
    Mock endpoint for testing frontend
    Returns sample extracted data
    """
    try:
        # Verify files received
        if not product_image:
            raise HTTPException(status_code=400, detail="Product image required")
        if not label_image:
            raise HTTPException(status_code=400, detail="Label image required")

        # Return mock extracted data
        return {
            "review_id": f"review_{datetime.now().timestamp()}",
            "product": {
                "barcode_found": True,
                "product_found": True,
                "product": {
                    "product_name": "Test Product",
                    "price": 100.00
                },
                "barcode": "1234567890123",
                "method": "barcode"
            },
            "label": {
                "mrp": "100.00",
                "batch": "BATCH123",
                "mfg": "01/01/26",
                "exp": "31/12/26",
                "quantity": "50"
            },
            "validation": {
                "valid": True,
                "warnings": [],
                "errors": []
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/confirm-and-save")
async def confirm_and_save(data: dict):
    """
    Mock endpoint for saving data
    """
    try:
        # Add to mock database
        mock_products.append({
            "product_name": data.get('product_name', 'Unknown'),
            "barcode": data.get('barcode', 'N/A'),
            "mrp": float(data.get('mrp', 0)),
            "batch": data.get('batch', ''),
            "mfg": data.get('mfg', ''),
            "exp": data.get('exp', ''),
            "quantity": int(data.get('quantity', 0)),
            "date_added": datetime.now().isoformat() + "Z"
        })

        return {
            "success": True,
            "message": "Data saved successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/get-sheets-data")
async def get_sheets_data():
    """
    Get all products from mock database
    """
    try:
        return mock_products
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
