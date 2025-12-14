import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import NotificationDropdown from '../../features/notification/components/NotificationDropdown';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Add as AddIcon,
  RequestQuote as QuoteIcon,
  Description as ContractIcon,
  LocationOn as LocationIcon,
  Menu as MenuIcon,
  AccountCircle,
  Storefront as StorefrontIcon,
  Logout,
  Person as PersonIcon,
  SwapHoriz as SwapHorizIcon,
  Receipt as QuoteReceiptIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

const StyledDrawer = styled(Drawer)(({ theme, collapsed }) => ({
  width: collapsed ? collapsedDrawerWidth : drawerWidth,
  flexShrink: 0,
  transition: 'width 0.3s ease',
  '& .MuiDrawer-paper': {
    width: collapsed ? collapsedDrawerWidth : drawerWidth,
    boxSizing: 'border-box',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'width 0.3s ease',
    overflowX: 'hidden',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme, collapsed }) => ({
  width: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)`,
  marginLeft: `${collapsed ? collapsedDrawerWidth : drawerWidth}px`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  transition: 'width 0.3s ease, margin-left 0.3s ease',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

const MenuItemStyled = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected 
      ? theme.palette.primary.dark 
      : alpha(theme.palette.primary.main, 0.08),
  },
  transition: 'all 0.2s ease',
}));

export default function SupplierLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [supplierName, setSupplierName] = useState('Nhà cung cấp');
  const navigate = useNavigate();
  const location = useLocation();
  const { id: supplierId } = useParams();

  // Helper function to get user ID
  const getUserId = () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) return parseInt(userId, 10);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 1;
      }
      return 1;
    } catch (error) {
      console.error('Error getting userId:', error);
      return 1;
    }
  };

  // Load supplier name from localStorage
  useEffect(() => {
    try {
      const currentWorkspace = localStorage.getItem('currentWorkspace');
      if (currentWorkspace) {
        const workspace = JSON.parse(currentWorkspace);
        if (workspace.type === 'supplier' && workspace.name) {
          setSupplierName(workspace.name);
        }
      }
    } catch (error) {
      console.error('Error loading supplier name:', error);
    }
  }, []);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: `/supplier/${supplierId}/dashboard`,
    },
    {
      text: 'Yêu cầu báo giá',
      icon: <QuoteIcon />,
      path: `/supplier/${supplierId}/rfq`,
    },
    {
      text: 'Báo giá',
      icon: <QuoteReceiptIcon />,
      path: `/supplier/${supplierId}/quotations`,
    },
    {
      text: 'Hợp đồng',
      icon: <ContractIcon />,
      path: `/supplier/${supplierId}/contracts`,
    },
    {
      text: 'Quản lý dịch vụ',
      icon: <StoreIcon />,
      path: `/supplier/${supplierId}/marketplace`,
    },
    {
      text: 'Quản lý địa điểm',
      icon: <LocationIcon />,
      path: `/supplier/${supplierId}/locations`,
    },
    {
      text: 'Thông tin',
      icon: <BusinessIcon />,
      path: `/supplier/${supplierId}/info`,
    },
  ];

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(`/supplier/${supplierId}/profile`);
  };

  const handleSwitchWorkspace = () => {
    handleMenuClose();
    navigate('/select-workspace');
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/signin');
  };

  const isSelected = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: sidebarCollapsed ? 1 : 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
          <StorefrontIcon
            sx={{
              fontSize: 32,
              color: theme.palette.primary.main,
              mr: sidebarCollapsed ? 0 : 1.5,
            }}
          />
          {!sidebarCollapsed && (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                flex: 1,
              }}
            >
              {supplierName}
            </Typography>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: sidebarCollapsed ? 1 : 2, py: 1 }}>
          {menuItems.map((item) => {
            const selected = isSelected(item.path);
            const menuItem = (
              <MenuItemStyled
                button
                key={item.text}
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  px: sidebarCollapsed ? 1 : 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selected ? 'inherit' : theme.palette.text.secondary,
                    minWidth: sidebarCollapsed ? 0 : 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: selected ? 600 : 400,
                    }}
                  />
                )}
              </MenuItemStyled>
            );

            return sidebarCollapsed ? (
              <Tooltip key={item.text} title={item.text} placement="right" arrow>
                {menuItem}
              </Tooltip>
            ) : (
              menuItem
            );
          })}
        </List>
      </Box>
      <Divider />
        <Box
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <IconButton
            onClick={handleSidebarToggle}
            sx={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              transition: 'all 0.3s ease',
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar
        position="fixed"
        collapsed={sidebarCollapsed}
        sx={{
          [theme.breakpoints.down('md')]: {
            width: '100%',
            marginLeft: 0,
          },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Title will be set by child components */}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notification Dropdown */}
            <NotificationDropdown
              userId={getUserId()}
              pollInterval={30000}
            />
            
            {/* Profile Menu */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleSwitchWorkspace}>
                <ListItemIcon>
                  <SwapHorizIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Chuyển workspace</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Đăng xuất</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
      
      <Box
        component="nav"
        sx={{ 
          width: { 
            xs: 0,
            md: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth 
          }, 
          flexShrink: 0, 
          position: 'relative',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <StyledDrawer
          variant="permanent"
          collapsed={sidebarCollapsed}
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
          open
        >
          {drawer}
        </StyledDrawer>

        {/* Collapse/Expand button - outside sidebar */}
        <IconButton
          onClick={handleSidebarToggle}
          sx={{
            position: 'fixed',
            left: (sidebarCollapsed ? collapsedDrawerWidth : drawerWidth) - 3,
            top: 'calc(56px + 12px)',
            width: 26,
            height: 26,
            backgroundColor: '#fff',
            color: theme.palette.primary.main,
            borderRadius: '4px',
            boxShadow: theme.shadows[2],
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            '&:hover': {
              backgroundColor: alpha('#fff', 0.9),
              boxShadow: theme.shadows[4],
            },
            transition: 'left 0.3s ease',
            zIndex: 1000,
          }}
        >
          {sidebarCollapsed ? '>' : '<'}
        </IconButton>

      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            md: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
          },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          transition: 'width 0.3s ease',
          [theme.breakpoints.down('md')]: {
            width: '100%',
          },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

