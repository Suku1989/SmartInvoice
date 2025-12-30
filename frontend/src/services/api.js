import axios from 'axios';

const API_URL = '/api';

export const uploadInvoice = async (file) => {
  const formData = new FormData();
  formData.append('invoice', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getAllInvoices = async () => {
  const response = await axios.get(`${API_URL}/invoices`);
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await axios.get(`${API_URL}/invoices/${id}`);
  return response.data;
};

export const updateInvoice = async (id, data) => {
  const response = await axios.put(`${API_URL}/invoices/${id}`, data);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${API_URL}/invoices/${id}`);
  return response.data;
};

export const exportToExcel = () => {
  window.open(`${API_URL}/export/excel`, '_blank');
};

export const exportToCSV = () => {
  window.open(`${API_URL}/export/csv`, '_blank');
};
