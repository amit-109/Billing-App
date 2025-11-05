import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Add, Print } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalBills: 0, totalCustomers: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, customersRes] = await Promise.all([
        axios.get('/api/bills'),
        axios.get('/api/customers')
      ]);
      
      setBills(billsRes.data);
      
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
          onClick={() => navigate('/create-bill')}
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


    </Box>
  );
};

export default Dashboard;