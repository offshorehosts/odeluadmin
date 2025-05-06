import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header toggleSidebar={handleDrawerToggle} />
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={handleDrawerToggle} 
      />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` } 
        }}
      >
        <Toolbar /> {/* This creates space below the app bar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;