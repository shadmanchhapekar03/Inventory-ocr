# Inventory OCR – Automated Product Data Extraction System

## 📌 Project Overview

**Inventory OCR** is an AI-powered application designed to simplify inventory management by reducing the manual effort required to enter product information into a database.

The project targets users and businesses that regularly perform manual data entry by typing product details into their inventory systems. Instead of entering the information manually, users can upload product images, extract the relevant details using OCR technology, verify the extracted information, and store it directly in MongoDB.

**Live Project:** https://inventry-ocr.netlify.app/

## 🚀 Key Features

### 1. Single Product Image Extraction (Working)

- Upload the front and back images of a product.
- Extract product-related information using PaddleOCR.
- Process and organize the extracted text using Python functions.
- Display the extracted information for verification.
- Store the verified product data in MongoDB.

### 2. Bulk Image Upload & Verification (Under Development)

- Upload multiple product images in a single operation.
- Process the uploaded images for text extraction.
- Review and verify the extracted product information.
- Store the verified records in MongoDB.

> **Note:** The bulk image upload and verification functionality is currently under development and is not fully functional. The single-product image extraction and storage functionality is working.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **PaddleOCR** | Optical Character Recognition (OCR) for extracting text from product images |
| **Python** | Backend processing and image-to-data extraction |
| **FastAPI** | Backend API development and communication |
| **React.js** | Frontend development and user interface |
| **MongoDB** | Storing extracted and verified product information |

## 🏗️ Application Workflow

1. **Image Upload:** The user uploads the front and back images of a product.
2. **Image Processing:** The backend receives and processes the uploaded images.
3. **Text Extraction:** PaddleOCR extracts relevant text from the images.
4. **Data Processing:** Python functions organize the extracted information into structured data.
5. **Data Verification:** The user reviews the extracted information.
6. **Database Storage:** Verified product information is stored in MongoDB.

## 🧩 Development Approach

The project follows an object-oriented programming (OOP) approach to maintain structured and reusable code.

Key programming concepts used:

- **Classes:** Organizing related functionality into logical components.
- **Objects:** Creating instances of classes to manage processing operations.
- **Code Reusability:** Using reusable methods and functions to avoid unnecessary code duplication.
- **Modular Development:** Separating different responsibilities to make the application easier to maintain and extend.

## 🎯 Project Objective

The primary objective is to reduce repetitive manual data-entry work, improve operational efficiency, and simplify inventory data management through OCR-based automation.

By converting product images into structured digital information, the application helps minimize manual effort and provides a foundation for more scalable inventory management solutions.
