import React, { useEffect, useState, useMemo } from 'react';
import { Typography, CircularProgress, Box, Alert, TextField, Button, Stack, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/customers');
        if (mounted) setCustomers(res.data || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || err.message || 'Failed to load customers');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCustomers();
    return () => { mounted = false; };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name, phone, email, address };
      const res = await axios.post('/api/customers', payload);
      setCustomers((prev) => [res.data, ...prev]);
      setName(''); setPhone(''); setEmail(''); setAddress('');
      setSuccessMsg('Customer created');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c) => {
    setEditCustomer({ ...c });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editCustomer) return;
    try {
      const res = await axios.put(`/api/customers/${editCustomer._id}`, editCustomer);
      setCustomers((prev) => prev.map((p) => (p._id === res.data._id ? res.data : p)));
      setEditOpen(false);
      setSuccessMsg('Customer updated');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      setSuccessMsg('Customer deleted');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter(c => (c.name || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.phone || '').toLowerCase().includes(s));
  }, [customers, search]);

  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filtered.length);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Customers</Typography>

      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required sx={{ flex: 1, minWidth: 160 }} />
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required sx={{ width: 160 }} />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ width: 220 }} />
          <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} sx={{ width: 220 }} />
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1 }}>
          <TextField
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small"
            sx={{ ml: 1, flex: 1 }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.address}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(c)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(c._id)} disabled={deleting}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={5} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} message={successMsg} />
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {editCustomer && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              <TextField label="Name" value={editCustomer.name} onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })} required sx={{ flex: 1 }} />
              <TextField label="Phone" value={editCustomer.phone} onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })} required sx={{ width: 200 }} />
              <TextField label="Email" value={editCustomer.email || ''} onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })} sx={{ width: 240 }} />
              <TextField label="Address" value={editCustomer.address || ''} onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })} sx={{ minWidth: 240 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}