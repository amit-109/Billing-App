import React, { useState } from 'react';
import {
  Box, TextField, Button, Autocomplete, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography, Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

export default function CustomerSelector({ customers, selectedCustomer, onCustomerSelect, onCustomerAdd, showAddButton = true }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      setError('Name and phone are required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/customers', newCustomer);
      onCustomerAdd(response.data);
      setDialogOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Autocomplete
          value={selectedCustomer}
          onChange={(_, newValue) => onCustomerSelect(newValue)}
          options={customers}
          getOptionLabel={(option) => `${option.name} (${option.phone})`}
          renderInput={(params) => (
            <TextField {...params} label="Select Customer" required />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box>
                <Typography>{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.phone} • {option.email || 'No email'}
                </Typography>
              </Box>
            </li>
          )}
          sx={{ flex: 1 }}
        />
        {showAddButton && (
          <Button 
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add New
          </Button>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              multiline
              rows={2}
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCustomer} variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}