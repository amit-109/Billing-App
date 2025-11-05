import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Autocomplete, Chip
} from '@mui/material';
import { Add, Print } from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalBills: 0, totalCustomers: 0 });
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [billForm, setBillForm] = useState({
    customer: '',
    items: [],
    paymentMethod: 'cash',
    discount: 0,
    tax: 0
  });
  const [currentItem, setCurrentItem] = useState({ product: '', quantity: 1, price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, customersRes, productsRes] = await Promise.all([
        axios.get('/api/bills'),
        axios.get('/api/customers'),
        axios.get('/api/products')
      ]);
      
      setBills(billsRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
      
      // Calculate stats
      const totalSales = billsRes.data.reduce((sum, bill) => sum + bill.total, 0);
      setStats({
        totalSales,
        totalBills: billsRes.data.length,
        totalCustomers: customersRes.data.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddItem = () => {
    if (currentItem.product && currentItem.quantity > 0) {
      const product = products.find(p => p._id === currentItem.product);
      const item = {
        ...currentItem,
        price: currentItem.price || product.price,
        total: currentItem.quantity * (currentItem.price || product.price)
      };
      setBillForm({
        ...billForm,
        items: [...billForm.items, item]
      });
      setCurrentItem({ product: '', quantity: 1, price: 0 });
    }
  };

  const handleCreateBill = async () => {
    try {
      await axios.post('/api/bills', billForm);
      setOpenBillDialog(false);
      setBillForm({ customer: '', items: [], paymentMethod: 'cash', discount: 0, tax: 0 });
      fetchData();
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4">
                ₹{stats.totalSales.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bills
              </Typography>
              <Typography variant="h4">
                {stats.totalBills}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4">
                {stats.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Bill Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenBillDialog(true)}
        >
          Create New Bill
        </Button>
      </Box>

      {/* Recent Bills */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Bills
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.slice(0, 10).map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell>{bill.billNumber}</TableCell>
                  <TableCell>{bill.customer?.name}</TableCell>
                  <TableCell>₹{bill.total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Print />}>
                      Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Bill Dialog */}
      <Dialog open={openBillDialog} onClose={() => setOpenBillDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={billForm.customer}
                  onChange={(e) => setBillForm({ ...billForm, customer: e.target.value })}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Add Items */}
            <Grid item xs={12}>
              <Typography variant="h6">Add Items</Typography>
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => option.name}
                value={products.find(p => p._id === currentItem.product) || null}
                onChange={(e, value) => setCurrentItem({ ...currentItem, product: value?._id || '', price: value?.price || 0 })}
                renderInput={(params) => <TextField {...params} label="Product" />}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={currentItem.price}
                onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={2}>
              <Button fullWidth variant="outlined" onClick={handleAddItem}>
                Add
              </Button>
            </Grid>

            {/* Items List */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {billForm.items.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${products.find(p => p._id === item.product)?.name} x${item.quantity} = ₹${item.total}`}
                    onDelete={() => setBillForm({
                      ...billForm,
                      items: billForm.items.filter((_, i) => i !== index)
                    })}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={billForm.paymentMethod}
                  onChange={(e) => setBillForm({ ...billForm, paymentMethod: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Discount"
                type="number"
                value={billForm.discount}
                onChange={(e) => setBillForm({ ...billForm, discount: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Tax"
                type="number"
                value={billForm.tax}
                onChange={(e) => setBillForm({ ...billForm, tax: parseFloat(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBillDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBill} variant="contained">Create Bill</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;