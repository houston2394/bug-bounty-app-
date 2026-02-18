import React from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { Dashboard as DashboardIcon, Target, Security, BugReport, Description, School, Terminal } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Targets', icon: <Target />, path: '/targets' },
  { text: 'Recon', icon: <Terminal />, path: '/recon' },
  { text: 'Vulnerabilities', icon: <Security />, path: '/vulnerabilities' },
  { text: 'Reports', icon: <Description />, path: '/reports' },
  { text: 'Learning', icon: <School />, path: '/learning' },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: '#1a1a1a',
          borderBottom: '2px solid #00ff41'
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ color: '#00ff41' }}>
            🚀 Bug Bounty System
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#0a0a0a',
            borderRight: '1px solid #333'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" sx={{ color: '#00ff41' }}>
            Bug Bounty
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#00ff4133',
                      borderLeft: '3px solid #00ff41',
                    },
                    '&:hover': {
                      backgroundColor: '#ffffff11',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#00ff41' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: '#ffffff'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#0a0a0a',
          p: 3,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;