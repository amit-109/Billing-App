import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemIcon,
  ListItemText, Box, IconButton, Button, useTheme, useMediaQuery, ListItemButton,
  Tooltip, Avatar
} from '@mui/material';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Menu as MenuIcon, Dashboard, People, Inventory,
  Receipt, ExitToApp, Add
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const Layout = ({ children, isDark, toggleTheme }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // keep drawer open on desktop
  const open = isDesktop ? true : drawerOpen;

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Create Bill', icon: <Add />, path: '/create-bill' },
    { text: 'Bills', icon: <Receipt />, path: '/bills' },
    { text: 'Customers', icon: <People />, path: '/customers' },
    { text: 'Products', icon: <Inventory />, path: '/products' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {user?.shopName} - Billing System
          </Typography>
          {typeof toggleTheme === 'function' && (
            <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
                {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={user?.name || 'Account'}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>{(user?.name || 'U').charAt(0)}</Avatar>
          </Tooltip>
          <Button color="inherit" onClick={logout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={open}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{ width: DRAWER_WIDTH, pt: 2, px: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>{user?.shopName || 'Shop'}</Typography>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={RouterLink}
                to={item.path}
                onClick={() => !isDesktop && setDrawerOpen(false)}
                sx={{ px: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: 8,
          ml: { md: `${DRAWER_WIDTH}px` }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;