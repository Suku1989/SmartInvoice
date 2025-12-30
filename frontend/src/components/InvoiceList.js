import React, { useState } from 'react';
import { deleteInvoice, exportToExcel, exportToCSV } from '../services/api';

function InvoiceList({ invoices, onEdit, onRefresh }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setDeleting(id);
      try {
        await deleteInvoice(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete invoice');
      } finally {
        setDeleting(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Uploaded':
        return '#ffa500';
      case 'Verified':
        return '#4caf50';
      case 'Exported':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  return (
    <div className="invoice-list-container">
      <div className="list-header">
        <h2>Invoice Review</h2>
        <div className="export-buttons">
          <button onClick={exportToExcel} className="export-btn excel-btn">
            Export to Excel
          </button>
          <button onClick={exportToCSV} className="export-btn csv-btn">
            Export to CSV
          </button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices found. Upload an invoice to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Vendor Name</th>
                <th>GST No</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_no || '-'}</td>
                  <td>{invoice.invoice_date || '-'}</td>
                  <td>{invoice.vendor_name || '-'}</td>
                  <td>{invoice.gst_no || '-'}</td>
                  <td>₹{invoice.subtotal?.toFixed(2) || '0.00'}</td>
                  <td>₹{invoice.tax?.toFixed(2) || '0.00'}</td>
                  <td>₹{invoice.grand_total?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(invoice.status) }}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => onEdit(invoice.id)} 
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.id)} 
                        className="delete-btn"
                        disabled={deleting === invoice.id}
                      >
                        {deleting === invoice.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;
