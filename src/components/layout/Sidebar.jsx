import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Divider,
  Box
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  People as PeopleIcon,
  VideoLibrary as EpisodeIcon,
  Subscriptions as SeasonIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Movies', icon: <MovieIcon />, path: '/movies' },
  { text: 'Shows', icon: <TvIcon />, path: '/shows' },
  { text: 'Seasons', icon: <SeasonIcon />, path: '/seasons' },
  { text: 'Episodes', icon: <EpisodeIcon />, path: '/episodes' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
];

const Sidebar = ({ open, onClose, mobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) {
      onClose();
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;