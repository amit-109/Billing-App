import React, { useEffect, useState, useMemo } from 'react';
import { Typography, CircularProgress, Box, Alert, TextField, Button, Snackbar, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // create form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // table
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        if (mounted) setProducts(res.data || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || err.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name, price: parseFloat(price) || 0, stock: parseInt(stock) || 0, category, description };
      const res = await axios.post('/api/products', payload);
      setProducts((prev) => [res.data, ...prev]);
      setName(''); setPrice(''); setStock(''); setCategory(''); setDescription('');
      setSuccessMsg('Product created');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p) => {
    setEditProduct({ ...p });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editProduct) return;
    try {
      const res = await axios.put(`/api/products/${editProduct._id}`, editProduct);
      setProducts((prev) => prev.map((x) => (x._id === res.data._id ? res.data : x)));
      setEditOpen(false);
      setSuccessMsg('Product updated');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSuccessMsg('Product deleted');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!s) return true;
      return (p.name || '').toLowerCase().includes(s) || (p.category || '').toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s);
    });
  }, [products, search, categoryFilter]);

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filtered.length);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Products</Typography>

      <Box component="form" onSubmit={handleCreate} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required sx={{ minWidth: 160 }} />
          <TextField label="Price" value={price} onChange={(e) => setPrice(e.target.value)} required type="number" sx={{ width: 120 }} />
          <TextField label="Stock" value={stock} onChange={(e) => setStock(e.target.value)} type="number" sx={{ width: 120 }} />
          <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ minWidth: 200 }} />
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1 }}>
          <TextField
            placeholder="Search products"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small"
            sx={{ ml: 1, flex: 1 }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} label="Category" onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p._id)} disabled={deleting}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
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
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editProduct && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              <TextField label="Name" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} required sx={{ flex: 1 }} />
              <TextField label="Price" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })} required sx={{ width: 160 }} type="number" />
              <TextField label="Stock" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })} sx={{ width: 120 }} type="number" />
              <TextField label="Category" value={editProduct.category || ''} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} sx={{ minWidth: 160 }} />
              <TextField label="Description" value={editProduct.description || ''} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} sx={{ minWidth: 200 }} />
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