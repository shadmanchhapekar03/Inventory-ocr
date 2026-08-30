class LableValidator():
    
    def __init__(self, required_fields=None):
        # Default required fields
        self.required_fields = required_fields or ["mrp", "batch", "mfg", "exp"]
    
    def validate(self, extracted_data):
        """
        Check if all required fields exist
        Returns: {"valid": True/False, "missing_fields": [...]}
        """
        missing_fields = []
        
        for field in self.required_fields:
            # If field missing or None, add to missing list
            if field not in extracted_data or extracted_data[field] is None:
                missing_fields.append(field)
        
        return {
            "valid": len(missing_fields) == 0,
            "missing_fields": missing_fields
        }