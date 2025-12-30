import React, { useState, useEffect } from 'react';
import { updateInvoice } from '../services/api';

function ManualCorrectionForm({ invoice, onClose, onSave }) {
  const [formData, setFormData] = useState({
    invoice_no: '',
    invoice_date: '',
    vendor_name: '',
    gst_no: '',
    subtotal: 0,
    tax: 0,
    grand_total: 0,
    status: 'Uploaded',
    line_items: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_no: invoice.invoice_no || '',
        invoice_date: invoice.invoice_date || '',
        vendor_name: invoice.vendor_name || '',
        gst_no: invoice.gst_no || '',
        subtotal: invoice.subtotal || 0,
        tax: invoice.tax || 0,
        grand_total: invoice.grand_total || 0,
        status: invoice.status || 'Uploaded',
        line_items: invoice.line_items || []
      });
    }
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...formData.line_items];
    
    if (field === 'description') {
      updatedLineItems[index] = {
        ...updatedLineItems[index],
        [field]: value
      };
    } else {
      // For numeric fields, handle empty string and invalid values
      const numValue = value === '' ? 0 : parseFloat(value);
      updatedLineItems[index] = {
        ...updatedLineItems[index],
        [field]: isNaN(numValue) ? 0 : numValue
      };
    }

    // Recalculate amount if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      updatedLineItems[index].amount = 
        updatedLineItems[index].quantity * updatedLineItems[index].unit_price;
    }

    setFormData(prev => ({
      ...prev,
      line_items: updatedLineItems
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, {
        description: '',
        quantity: 0,
        unit_price: 0,
        amount: 0
      }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateInvoice(invoice.id, formData);
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Invoice Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="correction-form">
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                name="invoice_no"
                value={formData.invoice_no}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Invoice Date</label>
              <input
                type="text"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vendor Name</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                name="gst_no"
                value={formData.gst_no}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="line-items-section">
            <h3>Line Items</h3>
            {formData.line_items.map((item, index) => (
              <div key={index} className="line-item-row">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  readOnly
                />
                <button type="button" onClick={() => removeLineItem(index)} className="remove-btn">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addLineItem} className="add-line-item-btn">
              + Add Line Item
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subtotal</label>
              <input
                type="number"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleChange}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Tax</label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Grand Total</label>
              <input
                type="number"
                name="grand_total"
                value={formData.grand_total}
                onChange={handleChange}
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Uploaded">Uploaded</option>
              <option value="Verified">Verified</option>
              <option value="Exported">Exported</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManualCorrectionForm;
