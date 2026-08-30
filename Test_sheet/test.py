import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from Services.google_sheets_service import GoogleSheetsService
from dotenv import load_dotenv

load_dotenv()

creds_file = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
sheet_id = os.getenv('GOOGLE_SHEET_ID')

sheets_service = GoogleSheetsService(creds_file,sheet_id)

test_data = [
    "Pure Sip Fruit Juice",
    "9783981305449",
    "10.00",
    "B3412DPA02",
    "14/12/23",
    "13/06/24"
]

response = sheets_service.append_row(test_data)

print("Row appended!")
print(response)
