import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import axios from 'axios';
import CustomerSelector from './CustomerSelector';

export default function CreateBill() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  // Fetch customers and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/products')
        ]);
        setCustomers(customersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchData();
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalTax = (tax / 100) * subtotal;
  const total = subtotal + totalTax - discount;

  const handleProductSelect = (product) => {
    if (!product) return;
    
    const existingItem = items.find(item => item.product._id === product._id);
    if (existingItem) {
      setItems(items.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { 
        product,
        quantity: 1,
        price: product.price
      }]);
    }
    setProductSearch('');
  };

  const handleQuantityChange = (index, value) => {
    const newQuantity = Math.max(1, parseInt(value) || 0);
    setItems(items.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handlePriceChange = (index, value) => {
    const newPrice = Math.max(0, parseFloat(value) || 0);
    setItems(items.map((item, i) => 
      i === index ? { ...item, price: newPrice } : item
    ));
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleScannerToggle = async () => {
    try {
      if (!scanning) {
        // Request camera permission and initialize scanner
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Initialize barcode scanner here - you can use libraries like quagga.js
        // For now we'll simulate a scan
        setTimeout(() => {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          handleProductSelect(randomProduct);
          stream.getTracks().forEach(track => track.stop());
          setScanning(false);
        }, 1000);
      }
      setScanning(!scanning);
    } catch (err) {
      setError('Camera access denied or not available');
      setScanning(false);
    }
  };

  const saveBill = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const billData = {
        customer: selectedCustomer._id,
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        discount,
        tax
      };

      const response = await axios.post('/api/bills', billData);
      setCurrentBill(response.data);
      setSuccess('Bill created successfully');
      setPrintDialogOpen(true);
      // Clear form
      setSelectedCustomer(null);
      setItems([]);
      setDiscount(0);
      setTax(0);
    } catch (err) {
      setError('Failed to save bill: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const PrintBill = ({ bill }) => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #000', pb: 1 }}>
        Bill #{bill.billNumber}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>Customer Details:</Typography>
          <Typography variant="body2"><strong>Name:</strong> {selectedCustomer?.name}</Typography>
          <Typography variant="body2"><strong>Phone:</strong> {selectedCustomer?.phone}</Typography>
          {selectedCustomer?.email && (
            <Typography variant="body2"><strong>Email:</strong> {selectedCustomer?.email}</Typography>
          )}
          {selectedCustomer?.address && (
            <Typography variant="body2"><strong>Address:</strong> {selectedCustomer?.address}</Typography>
          )}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2"><strong>Date:</strong> {new Date().toLocaleString()}</Typography>
          <Typography variant="body2"><strong>Bill No:</strong> {bill.billNumber}</Typography>
        </Box>
      </Box>
      
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.product._id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">₹{item.price}</TableCell>
                <TableCell align="right">₹{item.quantity * item.price}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">Subtotal:</TableCell>
              <TableCell align="right">₹{subtotal}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">Tax ({tax}%):</TableCell>
              <TableCell align="right">₹{totalTax}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">Discount:</TableCell>
              <TableCell align="right">₹{discount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
              <TableCell align="right"><strong>₹{total}</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mt: 2 }}>Payment Method: {paymentMethod.toUpperCase()}</Typography>
      <Typography variant="body2">Thank you for your business!</Typography>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Create Bill</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Customer Selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
        <CustomerSelector 
          customers={customers}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
          onCustomerAdd={(newCustomer) => {
            setCustomers([...customers, newCustomer]);
            setSelectedCustomer(newCustomer);
          }}
        />
        {selectedCustomer && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Phone:</strong> {selectedCustomer.phone}
              {selectedCustomer.email && <span> • <strong>Email:</strong> {selectedCustomer.email}</span>}
            </Typography>
            {selectedCustomer.address && (
              <Typography variant="body2">
                <strong>Address:</strong> {selectedCustomer.address}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Product Search and Items */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Product Search/Scan */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Autocomplete
            value={null}
            inputValue={productSearch}
            onInputChange={(_, value) => setProductSearch(value)}
            onChange={(_, newValue) => handleProductSelect(newValue)}
            options={products}
            getOptionLabel={(option) => `${option.name} (₹${option.price})`}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search Products"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            )}
            sx={{ flex: 1 }}
          />
          <Button 
            variant={scanning ? "contained" : "outlined"} 
            color={scanning ? "error" : "primary"}
            onClick={handleScannerToggle}
            startIcon={<QrCodeScannerIcon />}
          >
            {scanning ? "Stop Scan" : "Scan"}
          </Button>
        </Box>

        {/* Items Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.product._id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      size="small"
                      sx={{ width: 80 }}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      size="small"
                      sx={{ width: 100 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell align="right">₹{item.quantity * item.price}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeItem(index)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals and Payment */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Payment</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Payment"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tax %"
            type="number"
            value={tax}
            onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
            size="small"
            sx={{ width: 100 }}
          />

          <TextField
            label="Discount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
            size="small"
            sx={{ width: 100 }}
          />

          <Typography sx={{ ml: 'auto' }}>
            <strong>Total: ₹{total}</strong>
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={saveBill}
            disabled={loading || items.length === 0 || !selectedCustomer}
          >
            Save Bill
          </Button>
        </Box>
      </Paper>

      {/* Print Preview Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bill Preview</DialogTitle>
        <DialogContent>
          {currentBill && <PrintBill bill={currentBill} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Close</Button>
          <Button
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            variant="contained"
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}