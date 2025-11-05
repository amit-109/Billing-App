import React, { useEffect, useState, useMemo } from 'react';
import { Typography, CircularProgress, Box, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;
    const fetchBills = async () => {
      try {
        const res = await axios.get('/api/bills');
        if (mounted) setBills(res.data || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || err.message || 'Failed to load bills');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBills();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return bills.filter(b => {
      if (paymentFilter && b.paymentMethod !== paymentFilter) return false;
      if (!s) return true;
      return (b.billNumber || '').toLowerCase().includes(s) || (b.customer?.name || '').toLowerCase().includes(s);
    });
  }, [bills, search, paymentFilter]);

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filtered.length);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Bills</Typography>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1 }}>
          <TextField
            placeholder="Search bills or customer"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small"
            sx={{ ml: 1, flex: 1 }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <TextField
            select
            size="small"
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(0); }}
            sx={{ width: 160 }}
          >
            <option value="">All</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </TextField>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((b) => (
                <TableRow key={b._id} hover>
                  <TableCell>{b.billNumber}</TableCell>
                  <TableCell>{b.customer?.name}</TableCell>
                  <TableCell>₹{b.total}</TableCell>
                  <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{b.paymentMethod}</TableCell>
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
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
    </Box>
  );
}