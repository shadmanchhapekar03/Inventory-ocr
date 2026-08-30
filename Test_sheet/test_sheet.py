from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
import os
from dotenv import load_dotenv

load_dotenv()

creds_file = os.getenv('GOOGLE_SHEETS_CREDENTIALS')

# Load credentials
credentials = Credentials.from_service_account_file(creds_file)

print(f"Credentials loaded: {credentials.service_account_email}")
print("✓ Google Sheets API ready!")