const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../invoices.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create invoices table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT,
      invoice_date TEXT,
      vendor_name TEXT,
      gst_no TEXT,
      subtotal REAL,
      tax REAL,
      grand_total REAL,
      status TEXT DEFAULT 'Uploaded',
      file_path TEXT,
      file_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create line_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS line_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT,
      description TEXT,
      quantity REAL,
      unit_price REAL,
      amount REAL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
