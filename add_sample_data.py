#!/usr/bin/env python3
"""
Script to add sample data to Google Sheets
This helps you test the data display functionality
"""

from Services.google_sheets_service import GoogleSheetsService
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Get credentials from environment
creds_file = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
sheet_id = os.getenv('GOOGLE_SHEET_ID')

print("📋 Google Sheets Sample Data Loader")
print("=" * 50)

if not creds_file or not os.path.exists(creds_file):
    print("❌ Error: Credentials file not found")
    print(f"   Expected at: {creds_file}")
    exit(1)

if not sheet_id:
    print("❌ Error: GOOGLE_SHEET_ID not found in .env")
    exit(1)

print(f"✅ Credentials file: {creds_file}")
print(f"✅ Sheet ID: {sheet_id}")
print()

# Initialize service
sheets_service = GoogleSheetsService(creds_file, sheet_id)

# Sample data to add
sample_data = [
    ["Pure Sip Fruit Juice", "9783981305449", "50.00", "B3412DPA02", "14/12/23", "13/06/24", "71", datetime.now().isoformat()],
    ["Coca Cola 750ml", "8901234567890", "65.00", "B5678ABC", "01/08/26", "01/08/27", "45", datetime.now().isoformat()],
    ["Maggi Noodles", "9876543210123", "30.00", "LOT2024", "15/08/26", "15/08/27", "120", datetime.now().isoformat()],
    ["Bournvita Chocolate", "8904000123456", "120.00", "B2024LOT", "20/08/26", "20/08/27", "500", datetime.now().isoformat()],
    ["Amul Butter 100g", "8901234567123", "45.00", "AMUL001", "25/08/26", "25/09/26", "250", datetime.now().isoformat()],
]

print("📥 Adding sample data to Google Sheets...")
print()

for idx, row in enumerate(sample_data, 1):
    try:
        sheets_service.append_row(row)
        print(f"✅ Row {idx}: {row[0]} - {row[1]}")
    except Exception as e:
        print(f"❌ Row {idx} failed: {e}")

print()
print("=" * 50)
print("📊 Retrieving all data...")

try:
    all_rows = sheets_service.get_all_rows()
    print(f"✅ Total rows in sheet: {len(all_rows)}")

    if all_rows:
        print("\n📋 Header Row:")
        print(all_rows[0])

        print(f"\n📊 Data Rows ({len(all_rows)-1} products):")
        for idx, row in enumerate(all_rows[1:], 1):
            print(f"  {idx}. {row}")
except Exception as e:
    print(f"❌ Error retrieving data: {e}")

print()
print("✅ Done! Now refresh your Data page to see the products.")
