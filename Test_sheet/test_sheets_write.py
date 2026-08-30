from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

load_dotenv()

creds_file = os.getenv('GOOGLE_SHEETS_CREDENTIALS')
sheet_id = os.getenv('GOOGLE_SHEET_ID')

# Load credentials
credentials = Credentials.from_service_account_file(creds_file)

# Create Sheets API client
service = build('sheets', 'v4', credentials=credentials)

# Write header row
headers = [["Product", "Barcode", "MRP", "Batch", "MFG", "EXP", "Validation"]]

request = service.spreadsheets().values().update(
    spreadsheetId=sheet_id,
    range='Sheet1!A1',
    valueInputOption='RAW',
    body={'values': headers}
)

response = request.execute()
print("Headers written!")
print(response)