from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class GoogleSheetsService:
    def __init__(self, creds_file, sheet_id):
        """
        Initialize Google Sheets service
        creds_file: path to JSON credentials file
        sheet_id: Google Sheet ID
        """
        self.sheet_id = sheet_id
        self.service = None
        self.is_initialized = False
        self.mock_data = []  # Fallback mock data

        try:
            # Load credentials if file exists
            if creds_file and os.path.exists(creds_file):
                credentials = Credentials.from_service_account_file(creds_file)
                # Create client
                self.service = build('sheets', 'v4', credentials=credentials)
                self.is_initialized = True
                print("[OK] Google Sheets service initialized successfully")
            else:
                print(f"[WARN] Google Sheets credentials file not found: {creds_file}")
                print("[WARN] Using mock data mode for testing")
                self.is_initialized = False
        except Exception as e:
            print(f"[WARN] Error initializing Google Sheets: {e}")
            print("[WARN] Using mock data mode for testing")
            self.is_initialized = False

    def append_row(self, data):
        """
        Add a row to the sheet at the last row (bottom), after all existing data.
        Keeps header at row 1.
        data = [product_name, barcode, mrp, batch, mfg, exp, validation]
        """
        try:
            if not self.is_initialized or not self.service:
                # Use mock mode - store in memory
                self.mock_data.append(data)
                print(f"[INFO] Data stored in mock mode (no Google Sheets connection)")
                return {"updates": {"updatedRows": 1}}

            # Get existing data to check header
            existing_rows = self.get_all_rows()
            header = existing_rows[0] if existing_rows else ["Product", "Barcode", "MRP", "Batch", "MFG", "EXP", "Validation"]

            # Build new rows: header + existing data + new row at bottom
            data_rows = existing_rows[1:] if len(existing_rows) > 1 else []
            new_rows = [header] + data_rows + [data]

            # Update the entire sheet
            request = self.service.spreadsheets().values().update(
                spreadsheetId=self.sheet_id,
                range='Sheet1!A:G',
                valueInputOption='RAW',
                body={'values': new_rows}
            )

            response = request.execute()
            print(f"[OK] Row added to Google Sheets (at bottom): {data}")
            return response
        except Exception as e:
            print(f"[ERROR] Error adding row: {e}")
            # Fallback to mock mode
            self.mock_data.append(data)
            return {"updates": {"updatedRows": 1, "note": "stored in mock mode"}}

    def get_all_rows(self):
        """
        Get all rows from the Google Sheet
        Returns: List of rows
        """
        try:
            if not self.is_initialized or not self.service:
                # Return mock data
                return self._get_mock_data()

            # Real Google Sheets read
            request = self.service.spreadsheets().values().get(
                spreadsheetId=self.sheet_id,
                range='Sheet1!A:G'
            )

            response = request.execute()
            values = response.get('values', [])
            print(f"[OK] Retrieved {len(values)} rows from Google Sheets")
            return values
        except Exception as e:
            print(f"[ERROR] Error fetching from Google Sheets: {e}")
            # Fallback to mock data
            return self._get_mock_data()

    def _get_mock_data(self):
        """
        Return mock data for testing
        """
        mock_rows = [
            # Header row
            ["Product Name", "Barcode", "MRP", "Batch", "MFG Date", "EXP Date", "Quantity"],
            # Sample data
            ["Pure Sip Fruit Juice", "9783981305449", "50.00", "B3412DPA02", "14/12/23", "13/06/24", "71"],
            ["Coca Cola 750ml", "8901234567890", "65.00", "B5678ABC", "01/08/26", "01/08/27", "45"],
            ["Maggi Noodles", "9876543210123", "30.00", "LOT2024", "15/08/26", "15/08/27", "120"],
        ]

        # Add any stored mock data
        if self.mock_data:
            # Format stored data with header
            for row in self.mock_data:
                if len(row) >= 7:
                    mock_rows.append(row)

        return mock_rows

    def ensure_headers(self):
        """
        Ensure the header row exists and is correct: Product, Barcode, MRP, Batch, MFG, EXP, Validation.
        Fixes any sheet where header was overwritten with data.
        """
        try:
            if not self.is_initialized or not self.service:
                print("[WARN] Google Sheets not initialized, cannot ensure headers")
                return False

            # Correct header titles according to the user's request
            header = ["Product", "Barcode", "MRP", "Batch", "MFG", "EXP", "Validation"]

            rows = self.get_all_rows()

            if not rows:
                # Empty sheet - just set header
                request = self.service.spreadsheets().values().update(
                    spreadsheetId=self.sheet_id,
                    range='Sheet1!A:G',
                    valueInputOption='RAW',
                    body={'values': [header]}
                )
                request.execute()
                print("[OK] Header set on empty sheet")
                return True

            # Check if first row is the correct header
            first_row = rows[0]
            is_correct_header = (
                len(first_row) >= 7 and
                first_row[0] == "Product" and
                first_row[1] == "Barcode"
            )

            if is_correct_header:
                print("[OK] Header already correct")
                return True

            # Header missing or wrong - replace first row with correct header
            # Keep remaining rows as data (even if first row was data before)
            data_rows = rows[1:] if len(rows) > 1 else []
            new_rows = [header] + data_rows

            request = self.service.spreadsheets().values().update(
                spreadsheetId=self.sheet_id,
                range='Sheet1!A:G',
                valueInputOption='RAW',
                body={'values': new_rows}
            )
            request.execute()
            print("[OK] Header fixed: Product, Barcode, MRP, Batch, MFG, EXP, Validation")
            return True

        except Exception as e:
            print(f"[ERROR] Error ensuring headers: {e}")
            return False
