const { createWorker } = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

async function extractTextFromImage(imagePath) {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromPDF(pdfPath) {
  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

function parseInvoiceData(text) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract Invoice Number
  let invoiceNo = '';
  const invoiceNoPatterns = [
    /invoice\s*(?:no|number|#)[:\s]*([A-Z0-9-]+)/i,
    /inv\s*(?:no|#)[:\s]*([A-Z0-9-]+)/i,
    /bill\s*(?:no|number)[:\s]*([A-Z0-9-]+)/i
  ];
  for (const pattern of invoiceNoPatterns) {
    const match = text.match(pattern);
    if (match) {
      invoiceNo = match[1];
      break;
    }
  }

  // Extract Date
  let invoiceDate = '';
  const datePatterns = [
    /date[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
    /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      invoiceDate = match[1];
      break;
    }
  }

  // Extract Vendor Name (usually near top of invoice)
  let vendorName = '';
  const vendorPatterns = [
    /(?:vendor|company|seller)[:\s]*([A-Za-z0-9\s&.,]+)/i,
    /from[:\s]*([A-Za-z0-9\s&.,]+)/i
  ];
  for (const pattern of vendorPatterns) {
    const match = text.match(pattern);
    if (match) {
      vendorName = match[1].trim();
      break;
    }
  }
  
  // If no vendor found, try to get the first substantial line
  if (!vendorName && lines.length > 0) {
    vendorName = lines[0].trim();
  }

  // Extract GST Number
  let gstNo = '';
  const gstPatterns = [
    /GST(?:IN)?[:\s]*([A-Z0-9]{15})/i,
    /GSTIN[:\s]*([A-Z0-9]{15})/i,
    /([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/
  ];
  for (const pattern of gstPatterns) {
    const match = text.match(pattern);
    if (match) {
      gstNo = match[1];
      break;
    }
  }

  // Extract Total, Tax, Grand Total
  let subtotal = 0;
  let tax = 0;
  let grandTotal = 0;

  const totalPatterns = [
    /(?:sub)?total[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i,
    /amount[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i
  ];
  const taxPatterns = [
    /(?:tax|gst|vat)[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i,
    /cgst[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i,
    /sgst[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i
  ];
  const grandTotalPatterns = [
    /(?:grand\s*)?total[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i,
    /net\s*amount[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i,
    /total\s*amount[:\s]*(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/i
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      subtotal = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  let taxSum = 0;
  for (const pattern of taxPatterns) {
    const regex = new RegExp(pattern, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      taxSum += parseFloat(match[1].replace(/,/g, ''));
    }
  }
  tax = taxSum;

  for (const pattern of grandTotalPatterns) {
    const match = text.match(pattern);
    if (match) {
      grandTotal = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Extract line items (basic extraction)
  const lineItems = [];
  const itemPattern = /([A-Za-z\s]+)\s+(\d+)\s+(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)\s+(?:rs\.?|₹)?\s*([0-9,]+\.?\d*)/gi;
  let itemMatch;
  while ((itemMatch = itemPattern.exec(text)) !== null) {
    lineItems.push({
      description: itemMatch[1].trim(),
      quantity: parseFloat(itemMatch[2]),
      unit_price: parseFloat(itemMatch[3].replace(/,/g, '')),
      amount: parseFloat(itemMatch[4].replace(/,/g, ''))
    });
  }

  return {
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    vendor_name: vendorName,
    gst_no: gstNo,
    subtotal: subtotal || 0,
    tax: tax || 0,
    grand_total: grandTotal || subtotal + tax || 0,
    line_items: lineItems
  };
}

async function extractInvoiceData(filePath, fileType) {
  let text = '';
  
  if (fileType === 'application/pdf') {
    text = await extractTextFromPDF(filePath);
  } else {
    text = await extractTextFromImage(filePath);
  }
  
  return parseInvoiceData(text);
}

module.exports = { extractInvoiceData };
