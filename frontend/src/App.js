import React, { useState, useEffect } from 'react';
import InvoiceUpload from './components/InvoiceUpload';
import InvoiceList from './components/InvoiceList';
import ManualCorrectionForm from './components/ManualCorrectionForm';
import { getAllInvoices, getInvoiceById } from './services/api';
import './App.css';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await getAllInvoices();
      setInvoices(data.invoices);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (result) => {
    setUploadSuccess(result);
    fetchInvoices();
    
    // Auto-open correction form for newly uploaded invoice
    setTimeout(async () => {
      const invoice = await getInvoiceById(result.invoice_id);
      setSelectedInvoice(invoice);
      setShowCorrectionForm(true);
      setUploadSuccess(null);
    }, 500);
  };

  const handleEdit = async (invoiceId) => {
    try {
      const invoice = await getInvoiceById(invoiceId);
      setSelectedInvoice(invoice);
      setShowCorrectionForm(true);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
    }
  };

  const handleCloseCorrectionForm = () => {
    setShowCorrectionForm(false);
    setSelectedInvoice(null);
  };

  const handleSaveSuccess = () => {
    fetchInvoices();
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>SmartInvoice</h1>
        <p>Automated Invoice Processing System</p>
      </header>

      <main className="app-main">
        <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
        
        {uploadSuccess && (
          <div className="success-message">
            <p>✓ Invoice uploaded successfully! Opening correction form...</p>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading invoices...</div>
        ) : (
          <InvoiceList
            invoices={invoices}
            onEdit={handleEdit}
            onRefresh={fetchInvoices}
          />
        )}

        {showCorrectionForm && selectedInvoice && (
          <ManualCorrectionForm
            invoice={selectedInvoice}
            onClose={handleCloseCorrectionForm}
            onSave={handleSaveSuccess}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>SmartInvoice - Automated invoice processing for small and mid-range organizations</p>
      </footer>
    </div>
  );
}

export default App;
