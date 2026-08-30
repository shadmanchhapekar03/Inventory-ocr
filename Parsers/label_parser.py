import re
#================================== Older version
# class LabelParser:
    
#     def __init__(self, field_config=None):
#         # Default config - can be overridden
#         self.field_config = field_config or {
#             "mrp": r'MRP[:\s]*(\d+)',  # MRP: 250 or MRP 250
#             "batch": r'BATCH[:\s]*([A-Z0-9]+)',  # BATCH: B123 or BATCH B123
#             "mfg": r'MF[A]*[:\s]*DATE[:\s]*(\d{2}-\d{2}-\d{2})',  # MFA Date: 30-07-20
#             "exp": r'EXP[:\s]*DATE[:\s]*(\d{2}-\d{2}-\d{2})'  # EXP: DATE: ...
#         }
    
#     def extract_fields(self, text):
#         """
#         Dynamically extract all configured fields
#         Returns: {"mrp": "25", "batch": "B123", ...}
#         """

#         # Remove extra newlines for better matching
#         text = text.replace('\n', ' ')

#         results = {}
        
#         for field_name, pattern in self.field_config.items():
#             match = re.search(pattern, text, re.IGNORECASE)
#             results[field_name] = match.group(1) if match else None
        
#         return results

#===================================== Next Version

import re
from rapidfuzz import fuzz

class LabelParser:
    
    def extract_fields(self, text):
        lines = text.split('\n')
        
        mrp = self._smart_extract(lines, ['mrp', 'price', 'm.r.p'], r'\d+')
        batch = self._smart_extract(lines, ['batch', 'batch no', 'lot'], r'[A-Z0-9]{4,10}')
        mfg = self._smart_extract(lines, ['mfg', 'mfa', 'mfd', 'manufactured'], r'\d{2}[-/]\d{2}[-/]\d{2,4}')
        exp = self._smart_extract(lines, ['exp', 'expiry', 'best before'], r'\d{2}[-/]\d{2}[-/]\d{2,4}')
        
        return {"mrp": mrp, "batch": batch, "mfg": mfg, "exp": exp}
    
    def _smart_extract(self, lines, keywords, pattern):
        """Fuzzy match keywords + extract value"""
        for i, line in enumerate(lines):
            # Fuzzy match keyword
            for keyword in keywords:
                score = fuzz.ratio(keyword.lower(), line.lower())
                if score > 60:  # 60% match
                    # Look for value in this line or next
                    for search_line in [line, lines[i+1] if i+1 < len(lines) else ""]:
                        match = re.search(pattern, search_line, re.IGNORECASE)
                        if match:
                            return match.group(0)
        return None