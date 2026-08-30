import re

class LabelExtractor:
    def __init__(self, config):
        """
        config = dictionary with field patterns
        Example: {
            "mrp": { "keyword": "MRP", "pattern": r'(\d+)', "offset": 1 }
        }
        """
        self.config = config
    
    def extract_fields(self, text):
        """
        Main method: takes OCR text, returns extracted fields
        """
        lines = text.split('\n')
        results = {}
        
        # For each field in config
        for field_name, field_config in self.config.items():
            value = self._find_and_extract(lines, field_config)
            results[field_name] = value
        
        return results
    
    def _find_and_extract(self, lines, field_config):
        """
        Find keyword in lines, then extract value based on pattern
        """
        keyword = field_config['keyword']
        pattern = field_config['pattern']
        offset = field_config.get('offset', 1)  # Default: next line
        offset_range = field_config.get('offset_range', 3)
        exclude_units = field_config.get('exclude_units', False)
        
        # Search for keyword
        for i, line in enumerate(lines):
            if keyword.lower() in line.lower():
                # Search in range: offset to offset+offset_range
                for j in range(offset, offset + offset_range):
                    search_index = i + j
                    
                    if search_index < len(lines):
                        search_line = lines[search_index]

                        # Skip lines with units if exclude_units is True
                        if exclude_units:
                            if re.search(r'(g|mg|ml|kcal|%)', search_line, re.IGNORECASE):
                                continue

                        match = re.search(pattern, search_line)
                        if match:
                            return match.group(1)
        
        return None



# ocr_text = """MRP ₹
# 10.00
# Lot No.
# B3412DPA00
# MFD.
# 14/12/23
# Use By
# 13/06/24
# NET QUANTITY:
# 71 g"""