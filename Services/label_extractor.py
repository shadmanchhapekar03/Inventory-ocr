from OCR.PaddleOcr import PaddleOcr
from Parsers.label_parser import LabelParser
from Validation.validator import LableValidator

class LabelExtractor:
    def __init__(self):
        self.ocr = PaddleOcr()
        self.parser = LabelParser()
        self.validator = LableValidator()

    def extract_label(self, image):
        """
        Complete flow:
        Image → OCR → Parse → Validate → Result
        """

        # Step 1: Extract text from image
        ocr_text = self.ocr.extract_text(image)
        print(f"OCR Text: {ocr_text}")

        # Step 2: Parse fields from text
        extracted_fields = self.parser.extract_fields(ocr_text)
        print(f"Extracted Fields: {extracted_fields}")

        # Step 3: Validate fields
        validation_result = self.validator.validate(extracted_fields)
        print(f"Validation: {validation_result}")

        # Step 4: Return complete result
        return {
            "fields": extracted_fields,
            "validation": validation_result,
            "valid": validation_result['valid']
        }