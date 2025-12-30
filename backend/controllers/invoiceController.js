const db = require('../models/database');
const { extractInvoiceData } = require('./ocrController');
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require('exceljs');
const path = require('path');

// Upload and extract invoice
async function uploadInvoice(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const invoiceId = uuidv4();
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Extract data using OCR
    const extractedData = await extractInvoiceData(filePath, fileType);

    // Insert invoice into database
    const insertInvoice = `
      INSERT INTO invoices (
        id, invoice_no, invoice_date, vendor_name, gst_no, 
        subtotal, tax, grand_total, status, file_path, file_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertInvoice,
      [
        invoiceId,
        extractedData.invoice_no,
        extractedData.invoice_date,
        extractedData.vendor_name,
        extractedData.gst_no,
        extractedData.subtotal,
        extractedData.tax,
        extractedData.grand_total,
        'Uploaded',
        filePath,
        fileType
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save invoice' });
        }

        // Insert line items
        if (extractedData.line_items && extractedData.line_items.length > 0) {
          const insertLineItem = `
            INSERT INTO line_items (invoice_id, description, quantity, unit_price, amount)
            VALUES (?, ?, ?, ?, ?)
          `;

          let insertErrors = [];
          let insertCount = 0;
          const totalItems = extractedData.line_items.length;

          extractedData.line_items.forEach((item, index) => {
            db.run(insertLineItem, [
              invoiceId,
              item.description,
              item.quantity,
              item.unit_price,
              item.amount
            ], (insertErr) => {
              insertCount++;
              if (insertErr) {
                console.error(`Failed to insert line item ${index}:`, insertErr);
                insertErrors.push(insertErr.message);
              }

              // After all inserts attempted
              if (insertCount === totalItems) {
                res.json({
                  success: true,
                  invoice_id: invoiceId,
                  extracted_data: extractedData,
                  line_items_errors: insertErrors.length > 0 ? insertErrors : undefined
                });
              }
            });
          });
        } else {
          res.json({
            success: true,
            invoice_id: invoiceId,
            extracted_data: extractedData
          });
        }
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process invoice' });
  }
}

// Get all invoices
function getAllInvoices(req, res) {
  const query = `
    SELECT id, invoice_no, invoice_date, vendor_name, gst_no, 
           subtotal, tax, grand_total, status, created_at, updated_at
    FROM invoices
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch invoices' });
    }
    res.json({ invoices: rows });
  });
}

// Get single invoice with line items
function getInvoiceById(req, res) {
  const { id } = req.params;

  const invoiceQuery = `
    SELECT * FROM invoices WHERE id = ?
  `;

  const lineItemsQuery = `
    SELECT * FROM line_items WHERE invoice_id = ?
  `;

  db.get(invoiceQuery, [id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch invoice' });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    db.all(lineItemsQuery, [id], (err, lineItems) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch line items' });
      }

      res.json({
        ...invoice,
        line_items: lineItems
      });
    });
  });
}

// Update invoice
function updateInvoice(req, res) {
  const { id } = req.params;
  const {
    invoice_no,
    invoice_date,
    vendor_name,
    gst_no,
    subtotal,
    tax,
    grand_total,
    status,
    line_items
  } = req.body;

  const updateQuery = `
    UPDATE invoices
    SET invoice_no = ?, invoice_date = ?, vendor_name = ?, gst_no = ?,
        subtotal = ?, tax = ?, grand_total = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    updateQuery,
    [invoice_no, invoice_date, vendor_name, gst_no, subtotal, tax, grand_total, status, id],
    function(err) {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update invoice' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Update line items if provided
      if (line_items && Array.isArray(line_items)) {
        // Delete existing line items
        db.run('DELETE FROM line_items WHERE invoice_id = ?', [id], (deleteErr) => {
          if (deleteErr) {
            console.error('Failed to delete line items:', deleteErr);
            return res.status(500).json({ error: 'Failed to update line items' });
          }

          // Insert new line items
          const insertLineItem = `
            INSERT INTO line_items (invoice_id, description, quantity, unit_price, amount)
            VALUES (?, ?, ?, ?, ?)
          `;

          let insertErrors = [];
          let insertCount = 0;
          const totalItems = line_items.length;

          if (totalItems === 0) {
            return res.json({ success: true, message: 'Invoice updated successfully' });
          }

          line_items.forEach((item, index) => {
            db.run(insertLineItem, [
              id,
              item.description,
              item.quantity,
              item.unit_price,
              item.amount
            ], (insertErr) => {
              insertCount++;
              if (insertErr) {
                insertErrors.push(`Item ${index}: ${insertErr.message}`);
              }
              
              // Check if all inserts completed
              if (insertCount === totalItems) {
                if (insertErrors.length > 0) {
                  console.error('Line item insertion errors:', insertErrors);
                  return res.status(500).json({ 
                    error: 'Some line items failed to update',
                    details: insertErrors
                  });
                }
                res.json({ success: true, message: 'Invoice updated successfully' });
              }
            });
          });
        });
      } else {
        res.json({ success: true, message: 'Invoice updated successfully' });
      }
    }
  );
}

// Delete invoice
function deleteInvoice(req, res) {
  const { id } = req.params;

  db.run('DELETE FROM invoices WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete invoice' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  });
}

// Export to Excel
async function exportToExcel(req, res) {
  try {
    const query = `
      SELECT id, invoice_no, invoice_date, vendor_name, gst_no, 
             subtotal, tax, grand_total, status, created_at
      FROM invoices
      ORDER BY created_at DESC
    `;

    db.all(query, [], async (err, invoices) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch invoices' });
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Invoices');

      // Add headers
      worksheet.columns = [
        { header: 'Invoice No', key: 'invoice_no', width: 15 },
        { header: 'Date', key: 'invoice_date', width: 12 },
        { header: 'Vendor Name', key: 'vendor_name', width: 30 },
        { header: 'GST No', key: 'gst_no', width: 18 },
        { header: 'Subtotal', key: 'subtotal', width: 12 },
        { header: 'Tax', key: 'tax', width: 12 },
        { header: 'Grand Total', key: 'grand_total', width: 15 },
        { header: 'Status', key: 'status', width: 12 }
      ];

      // Add rows
      invoices.forEach(invoice => {
        worksheet.addRow(invoice);
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=invoices.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export to Excel' });
  }
}

// Export to CSV
function exportToCSV(req, res) {
  const query = `
    SELECT invoice_no, invoice_date, vendor_name, gst_no, 
           subtotal, tax, grand_total, status
    FROM invoices
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, invoices) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch invoices' });
    }

    // Create CSV content
    const headers = ['Invoice No', 'Date', 'Vendor Name', 'GST No', 'Subtotal', 'Tax', 'Grand Total', 'Status'];
    let csv = headers.join(',') + '\n';

    invoices.forEach(invoice => {
      const row = [
        invoice.invoice_no || '',
        invoice.invoice_date || '',
        `"${invoice.vendor_name || ''}"`,
        invoice.gst_no || '',
        invoice.subtotal || 0,
        invoice.tax || 0,
        invoice.grand_total || 0,
        invoice.status || ''
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csv);
  });
}

module.exports = {
  uploadInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  exportToExcel,
  exportToCSV
};
