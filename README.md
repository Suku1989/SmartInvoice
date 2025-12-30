# SmartInvoice

Automated invoice processing application for small or mid range organisations.

## Features

### Invoice Upload & Extraction
- Upload invoices in PDF or Image formats (JPEG, PNG)
- Automatic OCR and data extraction using Tesseract.js
- Extracts key information:
  - Invoice Number
  - Invoice Date
  - Vendor Name
  - GST Number
  - Line Items (Description, Quantity, Unit Price, Amount)
  - Subtotal, Tax, and Grand Total

### Manual Correction UI
- User-friendly interface to review and correct extracted data
- Edit all invoice fields including line items
- Add or remove line items as needed
- Automatically opens after invoice upload for immediate review

### Review & Export
- Invoice review screen with complete invoice listing
- Filter and view all uploaded invoices
- Edit any invoice at any time
- Export functionality:
  - Export to Excel (.xlsx)
  - Export to CSV
- Invoice status tracking:
  - **Uploaded**: Newly uploaded invoices
  - **Verified**: Invoices that have been reviewed and confirmed
  - **Exported**: Invoices that have been exported

### Security Features
- Rate limiting to prevent API abuse
  - Upload endpoint: 10 requests per 15 minutes
  - General API: 100 requests per 15 minutes
- File type and size validation
- Local data storage (no external API calls)
- Input validation and error handling

## Technology Stack

### Backend
- Node.js with Express.js
- SQLite database for invoice storage
- Tesseract.js for OCR
- pdf-parse for PDF text extraction
- Multer for file uploads
- ExcelJS for Excel export
- express-rate-limit for API protection

### Frontend
- React.js
- Axios for API calls
- Responsive CSS design

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Suku1989/SmartInvoice.git
   cd SmartInvoice
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Create necessary directories** (if not already created)
   ```bash
   mkdir -p uploads
   ```

## Usage

### Development Mode

1. **Start the backend server**
   ```bash
   npm start
   ```
   The backend API will be available at `http://localhost:5000`

2. **In a new terminal, start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Set environment variable and start the server**
   ```bash
   NODE_ENV=production npm start
   ```
   The application will be available at `http://localhost:5000`

## API Endpoints

- `POST /api/upload` - Upload and process invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get specific invoice with line items
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/export/excel` - Export all invoices to Excel
- `GET /api/export/csv` - Export all invoices to CSV

## Project Structure

```
SmartInvoice/
├── backend/
│   ├── controllers/
│   │   ├── invoiceController.js   # Invoice CRUD operations
│   │   └── ocrController.js       # OCR extraction logic
│   ├── models/
│   │   └── database.js            # SQLite database setup
│   └── routes/
│       └── invoiceRoutes.js       # API routes
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── InvoiceUpload.js          # Upload component
│       │   ├── InvoiceList.js            # List/Review component
│       │   └── ManualCorrectionForm.js   # Edit form component
│       ├── services/
│       │   └── api.js                    # API service
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
├── uploads/                        # Uploaded invoice files
├── server.js                       # Main server file
├── package.json
└── README.md
```

## Database Schema

### Invoices Table
- `id` - Unique identifier (UUID)
- `invoice_no` - Invoice number
- `invoice_date` - Invoice date
- `vendor_name` - Vendor/supplier name
- `gst_no` - GST number
- `subtotal` - Subtotal amount
- `tax` - Tax amount
- `grand_total` - Grand total amount
- `status` - Invoice status (Uploaded/Verified/Exported)
- `file_path` - Path to uploaded file
- `file_type` - MIME type of uploaded file
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Line Items Table
- `id` - Auto-increment ID
- `invoice_id` - Foreign key to invoices table
- `description` - Item description
- `quantity` - Item quantity
- `unit_price` - Price per unit
- `amount` - Total amount (quantity × unit_price)

## Features in Detail

### OCR Extraction
The application uses Tesseract.js to extract text from uploaded invoices. The extraction patterns support:
- Various invoice formats
- Multiple date formats
- Indian GST number format (15 characters)
- Common currency formats (₹, Rs., etc.)
- Line item tables with quantity, price, and amounts

### Manual Correction
After upload, invoices automatically open in the correction form where users can:
- Review extracted data
- Fix any incorrect extractions
- Add missing information
- Manage line items (add/edit/remove)
- Update invoice status

### Export Capabilities
Export all invoices in two formats:
- **Excel**: Well-formatted spreadsheet with headers and styling
- **CSV**: Simple comma-separated values for universal compatibility

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues or questions, please create an issue on the GitHub repository.
