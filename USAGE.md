# SmartInvoice Usage Guide

## Quick Start

### Running the Application

#### Option 1: Development Mode (Recommended for Testing)

1. **Terminal 1 - Backend Server:**
   ```bash
   npm start
   ```
   The backend API will run on `http://localhost:5000`

2. **Terminal 2 - Frontend Development Server:**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will open automatically at `http://localhost:3000`

#### Option 2: Production Mode

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Start the server:**
   ```bash
   NODE_ENV=production npm start
   ```
   The application will be available at `http://localhost:5000`

## Using the Application

### 1. Upload an Invoice

1. Click the **"Choose File"** button in the Upload Invoice section
2. Select a PDF or image file (JPEG, PNG) containing an invoice
3. Click **"Upload & Extract"**
4. The system will:
   - Upload the file
   - Run OCR to extract text
   - Parse invoice data (Invoice No, Date, Vendor, GST, amounts, etc.)
   - Automatically open the Manual Correction Form

### 2. Manual Correction (Review and Edit)

After upload, the Manual Correction Form opens automatically:

1. **Review Extracted Data:**
   - Invoice Number
   - Invoice Date
   - Vendor Name
   - GST Number
   - Subtotal, Tax, Grand Total

2. **Edit Any Incorrect Fields:**
   - Click in any field to modify the value
   - All fields are editable

3. **Manage Line Items:**
   - **Add Line Item:** Click "+ Add Line Item" button
   - **Edit Line Item:** Modify Description, Quantity, or Unit Price
   - **Remove Line Item:** Click "Remove" button next to the item
   - Amount is automatically calculated as Quantity × Unit Price

4. **Set Invoice Status:**
   - **Uploaded:** Initial status (default)
   - **Verified:** Mark as reviewed and correct
   - **Exported:** Mark as exported

5. **Save Changes:**
   - Click "Save Changes" to update the invoice
   - Click "Cancel" to discard changes

### 3. Review Invoices

The Invoice Review section displays all uploaded invoices in a table:

- **View Details:** See all invoice information at a glance
- **Status Badges:** Color-coded status indicators
  - Orange: Uploaded
  - Green: Verified
  - Blue: Exported
- **Edit:** Click "Edit" button to open the Manual Correction Form
- **Delete:** Click "Delete" button to remove an invoice (with confirmation)

### 4. Export Invoices

Export all invoices to external formats:

1. **Export to Excel:**
   - Click "Export to Excel" button
   - Downloads `invoices.xlsx` file
   - Formatted spreadsheet with headers and styling

2. **Export to CSV:**
   - Click "Export to CSV" button
   - Downloads `invoices.csv` file
   - Universal format compatible with all spreadsheet applications

## Features in Detail

### OCR Extraction Capabilities

The system can extract:

**Basic Information:**
- Invoice Number (various formats: Invoice No, Inv #, Bill No, etc.)
- Invoice Date (multiple date formats)
- Vendor/Company Name
- GST Number (15-character Indian format)

**Financial Data:**
- Subtotal/Amount
- Tax (GST/CGST/SGST/VAT)
- Grand Total/Net Amount

**Line Items:**
- Item Description
- Quantity
- Unit Price
- Amount

### Supported File Formats

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Documents:**
- PDF (.pdf)

**File Size Limit:** 10MB

### Invoice Status Workflow

1. **Uploaded** → Initial status after upload
2. **Verified** → After manual review and confirmation
3. **Exported** → After exporting data to Excel/CSV

You can change the status at any time by editing the invoice.

## Tips for Best Results

### For OCR Extraction:

1. **Use Clear Images:**
   - High resolution (300 DPI or higher)
   - Good contrast
   - Well-lit, no shadows

2. **Document Orientation:**
   - Keep invoice right-side up
   - Avoid skewed or rotated images

3. **File Format:**
   - PDF files often give better results for printed documents
   - Clear scans or photos work well

4. **Standard Formats:**
   - Structured invoices with clear labels work best
   - Standard invoice layouts are easier to extract

### After Extraction:

1. **Always Review:**
   - OCR is not 100% accurate
   - Check all extracted fields
   - Correct any errors using the Manual Correction Form

2. **Complete Missing Data:**
   - Add any fields that weren't extracted
   - Fill in line items if they weren't captured

3. **Verify Calculations:**
   - Check that totals match
   - Verify tax calculations
   - Ensure line item amounts are correct

## Troubleshooting

### Backend Server Issues

**Server won't start:**
- Check if port 5000 is already in use
- Try: `lsof -ti:5000 | xargs kill -9` to free the port
- Verify all dependencies are installed: `npm install`

**Database errors:**
- The database file `invoices.db` is created automatically
- Delete `invoices.db` to reset the database
- Tables are created automatically on first run

### Frontend Issues

**Frontend won't start:**
- Ensure dependencies are installed: `cd frontend && npm install`
- Check if port 3000 is available
- Clear cache: `rm -rf frontend/node_modules frontend/.cache`

**API connection errors:**
- Verify backend server is running on port 5000
- Check the proxy setting in `frontend/package.json`

### Upload Issues

**File upload fails:**
- Check file format (PDF, JPEG, PNG only)
- Verify file size (max 10MB)
- Ensure uploads directory exists and is writable

**OCR extraction is poor:**
- Use higher quality images
- Try PDF format instead of images
- Ensure text is clearly visible
- Manually correct extracted data

## API Reference

For developers who want to integrate with the SmartInvoice API:

### Endpoints

**Upload Invoice:**
```
POST /api/upload
Content-Type: multipart/form-data
Body: invoice (file)
```

**Get All Invoices:**
```
GET /api/invoices
```

**Get Invoice by ID:**
```
GET /api/invoices/:id
```

**Update Invoice:**
```
PUT /api/invoices/:id
Content-Type: application/json
Body: { invoice_no, invoice_date, vendor_name, gst_no, subtotal, tax, grand_total, status, line_items }
```

**Delete Invoice:**
```
DELETE /api/invoices/:id
```

**Export to Excel:**
```
GET /api/export/excel
```

**Export to CSV:**
```
GET /api/export/csv
```

## Data Privacy & Security

- All invoice data is stored locally in SQLite database
- Uploaded files are stored in the `uploads/` directory
- No data is sent to external services (OCR runs locally)
- Database and uploads are excluded from version control (.gitignore)

## Backup & Restore

### Backup:
```bash
# Backup database
cp invoices.db invoices_backup_$(date +%Y%m%d).db

# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### Restore:
```bash
# Restore database
cp invoices_backup_YYYYMMDD.db invoices.db

# Restore uploaded files
tar -xzf uploads_backup_YYYYMMDD.tar.gz
```

## Support

For issues, questions, or feature requests:
- Create an issue on the GitHub repository
- Check the README.md for additional documentation
- Review this usage guide for common scenarios
