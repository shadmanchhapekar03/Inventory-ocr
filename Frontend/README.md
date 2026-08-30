# Inventory Management System - Frontend

A modern, production-ready Next.js frontend for inventory management with AI-powered image recognition and data extraction.

## Features

### 📸 Smart Upload
- Drag-and-drop or click-to-upload interface for product and label images
- Real-time upload progress tracking
- Support for JPG, PNG, and WebP formats
- Client-side image preview

### 🤖 AI-Powered Extraction
- Barcode scanning and recognition
- OCR (Optical Character Recognition) for label data extraction
- Automatic detection of:
  - Product name (from barcode lookup or OCR)
  - Barcode number
  - MRP (Maximum Retail Price)
  - Batch number
  - Manufacturing date
  - Expiry date
  - Quantity

### ✏️ Review & Edit
- Comprehensive review page with extracted data
- Editable form fields for manual corrections
- Real-time validation with warnings and error messages
- Validation checks:
  - Expiry date validation (product not expired)
  - Manufacturing date validation (MFG < EXP)
  - Required field validation

### 📊 Data Management
- Complete inventory table with sorting and filtering
- Search by product name or barcode
- Date range filtering
- Pagination (10 items per page)
- CSV export functionality
- Professional, responsive design

### 🔄 Google Sheets Integration
- Automatic save to Google Sheets
- Seamless data synchronization
- Historical tracking

## Tech Stack

- **Framework**: Next.js 16.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form
- **API Client**: Axios
- **Notifications**: React Toastify
- **State Management**: React Hooks

## Installation

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Setup

1. **Clone and navigate to the project**
```bash
cd Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

## Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
app/
├── page.tsx              # Home page with overview
├── layout.tsx            # Root layout with navigation
├── upload/
│   └── page.tsx          # Upload page
├── review/
│   └── page.tsx          # Review & edit page
├── data/
│   └── page.tsx          # Data table & management
└── settings/
    └── page.tsx          # Settings & configuration

components/
├── Navbar.tsx            # Navigation bar
├── UploadZone.tsx        # Drag-drop upload component
├── ProductForm.tsx       # Editable product form
├── DataTable.tsx         # Sortable, filterable table
└── ValidationWarning.tsx # Validation alerts

lib/
├── api.ts                # API client & types

public/                   # Static assets
```

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000` via these endpoints:

### POST /process-product
Processes both product and label images.

**Request:**
```
Form data:
- product_image: File (image with barcode)
- label_image: File (image with MRP/dates/batch)
```

**Response:**
```json
{
  "review_id": "temp_id_123",
  "product": {
    "barcode_found": true,
    "product_found": true,
    "product": { "product_name": "...", ... },
    "barcode": "9783981305449",
    "method": "barcode"
  },
  "label": {
    "mrp": "50.00",
    "batch": "B3412DPA02",
    "mfg": "14/12/23",
    "exp": "13/06/24",
    "quantity": "71"
  },
  "validation": {
    "valid": true,
    "warnings": [],
    "errors": []
  }
}
```

### POST /confirm-and-save
Saves reviewed product data to Google Sheets.

**Request:**
```json
{
  "product_name": "Pure Sip Fruit Juice",
  "barcode": "9783981305449",
  "mrp": "50.00",
  "batch": "B3412DPA02",
  "mfg": "14/12/23",
  "exp": "13/06/24",
  "quantity": "71"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data saved to Google Sheets"
}
```

### GET /get-sheets-data
Fetches all product records from Google Sheets.

**Response:**
```json
[
  {
    "product_name": "Pure Sip Fruit Juice",
    "barcode": "9783981305449",
    "mrp": 50.00,
    "batch": "B3412DPA02",
    "mfg": "14/12/23",
    "exp": "13/06/24",
    "quantity": 71,
    "date_added": "2026-08-29T06:15:00Z"
  },
  ...
]
```

## Features in Detail

### Upload Page
- Side-by-side drag-drop zones for product and label images
- Clear visual feedback during upload
- Progress bar showing extraction progress
- Tips for best results
- Clear button to reset selections

### Review Page
- Shows extraction method (barcode vs OCR)
- Displays whether barcode/product was found
- Comprehensive validation status
- Warnings and errors clearly highlighted
- Editable form with all extracted fields
- Preview of raw extracted data
- Confirm & Save button
- Cancel & Start Over button

### Data Page
- Search by product name or barcode (real-time)
- Sort by any column (ascending/descending)
- Filter by date range
- Pagination with navigation buttons
- Export to CSV with current filters applied
- Shows record count and page info
- Hover effects on table rows
- Refresh button to reload data

### Settings Page
- API URL configuration
- System information display
- Feature list
- Help & support section
- Best practices and troubleshooting

## Responsive Design

The frontend is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

All components adapt gracefully to smaller screens with:
- Stacked layouts on mobile
- Touch-friendly buttons and inputs
- Optimized table scrolling on mobile
- Mobile-first CSS approach

## Error Handling

Comprehensive error handling throughout:
- Network error messages
- Validation error alerts
- File upload error handling
- Graceful fallbacks
- Toast notifications for all actions
- User-friendly error messages

## Performance Optimizations

- Server-side static generation for pages
- Optimized images and lazy loading
- Efficient re-renders with React hooks
- Form validation on both client and server
- Debounced search for large datasets
- CSS optimization with Tailwind

## Security

- Type-safe API calls with TypeScript
- Input validation on all forms
- Secure environment variable handling
- CORS-enabled API communication
- No sensitive data stored in local state
- Session storage for temporary data (cleared after review)

## Deployment

### Vercel (Recommended)
```bash
# Build production bundle
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### "Failed to connect to API"
- Ensure backend server is running on `http://localhost:8000`
- Check network connectivity
- Verify API URL in settings

### "Images not processing"
- Check image file sizes (should be under 10MB)
- Ensure images are in supported formats (JPG, PNG, WebP)
- Verify barcode is clear and centered in product image
- Check that label image shows MRP/batch/dates clearly

### "Data not showing in table"
- Click the Refresh button to reload data
- Check that products were actually saved
- Verify Google Sheets connection is working
- Check browser console for errors (F12)

### "Form validation errors"
- Dates should be in DD/MM/YY format
- Ensure all required fields are filled
- Check for manufacturing date before expiry date

## Development

### Add a New Page
1. Create file in `app/[page]/page.tsx`
2. Add navigation link in `components/Navbar.tsx`
3. Create components in `components/`
4. Import and use components in page

### Add a New Component
1. Create `components/[ComponentName].tsx`
2. Export as default
3. Use `'use client'` directive for client components
4. Import and use in pages

### Add API Endpoint
1. Add function to `lib/api.ts`
2. Define request/response types
3. Import in component
4. Call function with try-catch

## Support & Maintenance

For issues, feature requests, or questions:
1. Check the Settings > Help & Support section
2. Review the troubleshooting guide
3. Check browser console for error details
4. Verify backend API is running and healthy

## License

This project is part of the Inventory Management System. All rights reserved.

## Version

Current Version: 1.0.0
Built with Next.js 16.3.3 and TypeScript
Last Updated: August 29, 2026
