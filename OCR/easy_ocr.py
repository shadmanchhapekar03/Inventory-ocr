import easyocr

# reader = easyocr.Reader(['en'])

# results = reader.readtext("Photos/image.png")

# for detection in results:
#     bbox, text, confidence = detection
#     print(f"Text: {text}")
#     print(f"Confidence: {confidence:.2f}")
#     print("-" * 50)

import cv2
import numpy as np

img = cv2.imread("Photos/blur.jpg")

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# score = cv2.Laplacian(gray, cv2.CV_64F).var()

kernel = np.array([
    [-1,-1,-1],
    [-1, 9,-1],
    [-1,-1,-1]
])

sharpened = cv2.filter2D(gray, -1, kernel)

score_before = cv2.Laplacian(gray, cv2.CV_64F).var()
score_after = cv2.Laplacian(sharpened, cv2.CV_64F).var()

print(score_before)

reader = easyocr.Reader(['en'])

results = reader.readtext(gray)

for detection in results:
    bbox, text, confidence = detection
    print(f"Text: {text}")
    print(f"Confidence: {confidence:.2f}")
    print("-" * 50)

print(score_after)

results = reader.readtext(sharpened)

for detection in results:
    bbox, text, confidence = detection
    print(f"Text: {text}")
    print(f"Confidence: {confidence:.2f}")
    print("-" * 50)