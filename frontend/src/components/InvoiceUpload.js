import React, { useState, useRef } from 'react';
import { uploadInvoice } from '../services/api';

function InvoiceUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Invalid file type. Only PDF and images (JPEG, PNG) are allowed.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await uploadInvoice(file);
      setFile(null);
      // Reset file input using ref
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload invoice');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Invoice</h2>
      <div className="upload-form">
        <div className="file-input-group">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={uploading}
          />
          {file && <span className="file-name">{file.name}</span>}
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="upload-btn"
        >
          {uploading ? 'Processing...' : 'Upload & Extract'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default InvoiceUpload;
