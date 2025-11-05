import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Typography, Alert, LinearProgress, Tabs, Tab, TextField
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

export default function ProductImport({ open, onClose, onImportSuccess }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jsonData, setJsonData] = useState('');

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/products/import/excel', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess(response.data.message);
      onImportSuccess(response.data.products);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    try {
      const products = JSON.parse(jsonData);
      if (!Array.isArray(products)) throw new Error('Data must be an array');

      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/products/import/json', { products }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess(response.data.message);
      onImportSuccess(response.data.products);
      setJsonData('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid JSON format');
    } finally {
      setLoading(false);
    }
  };

  const sampleJson = `[
  {
    "name": "Product 1",
    "price": 100,
    "stock": 50,
    "category": "Electronics",
    "description": "Sample product"
  }
]`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Products</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Excel Upload" />
          <Tab label="JSON Import" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Upload Excel (.xlsx, .xls) or CSV file with columns: name, price, stock, category, description
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={loading}
              fullWidth
            >
              Choose Excel File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
              />
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Paste JSON array of products:
            </Typography>
            <TextField
              multiline
              rows={8}
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder={sampleJson}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {tab === 1 && (
          <Button onClick={handleJsonImport} variant="contained" disabled={loading || !jsonData}>
            Import JSON
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}