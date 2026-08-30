from datetime import datetime

class BusinessValidator:
    
    def __init__(self):
        pass
    
    def validate_mfg_exp(self, mfg, exp):
        """
        Check if MFG date is before EXP date
        mfg = "14/12/23"
        exp = "13/06/24"
        
        Returns: True if valid, False if invalid
        """
        try:
            # Convert strings to datetime objects
            mfg_date = datetime.strptime(mfg, "%d/%m/%y")
            exp_date = datetime.strptime(exp, "%d/%m/%y")
            
            # Check: MFG must be less than EXP
            if mfg_date < exp_date:
                return True  # Valid
            else:
                return False  # Invalid
        except:
            return False  # Format error

    def validate_mrp(self, mrp):
        """Rule 2: MRP > 0"""
        try:
            mrp_value = float(mrp)
            return mrp_value > 0
        except:
            return False
    
    def validate_required_fields(self, extracted_data):
        """Rule 3: Check required fields"""
        required = ["mrp", "batch", "mfg", "exp"]
        missing = []
        
        for field in required:
            if field not in extracted_data or extracted_data[field] is None:
                missing.append(field)
        
        return missing  # Returns list of missing fields
    
    def check_expiry_warning(self, exp):
        """Rule 4: Warn if expired"""
        try:
            exp_date = datetime.strptime(exp, "%d/%m/%y")
            today = datetime.now()
            
            if exp_date < today:
                return "Product expired"
            else:
                return None
        except:
            return None

    def validate_all(self, extracted_data):
        """
        Run all validations together
        Returns: {
            "valid": True/False,
            "missing_fields": [],
            "warnings": []
        }
        """
        warnings = []
        missing_fields = self.validate_required_fields(extracted_data)
        
        # If required fields missing, mark as invalid
        if missing_fields:
            return {
                "valid": False,
                "missing_fields": missing_fields,
                "warnings": []
            }
        
        # Rule 1: MFG < EXP
        if not self.validate_mfg_exp(extracted_data['mfg'], extracted_data['exp']):
            warnings.append("MFG date is after EXP date (invalid)")
        
        # Rule 2: MRP > 0
        if not self.validate_mrp(extracted_data['mrp']):
            warnings.append("MRP must be greater than 0")
        
        # Rule 4: Check expiry
        expiry_warning = self.check_expiry_warning(extracted_data['exp'])
        if expiry_warning:
            warnings.append(expiry_warning)
        
        # If any warnings, still valid but with warnings
        is_valid = len(warnings) == 0
        
        return {
            "valid": is_valid,
            "missing_fields": [],
            "warnings": warnings
        }