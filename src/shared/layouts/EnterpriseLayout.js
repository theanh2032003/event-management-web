import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import NotificationDropdown from '../../features/notification/components/NotificationDropdown';
import { useSidebar } from '../contexts/SidebarContext';
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
  Event as EventIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  AccountCircle,
  Business as BusinessIcon,
  Logout,
  Person as PersonIcon,
  SwapHoriz as SwapHorizIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Storefront as StorefrontIcon,
  Description as ContractIcon,
  RequestQuote as QuoteRequestIcon,
  Receipt as QuoteIcon,
  Payment as PaymentApprovalIcon,
} from '@mui/icons-material';

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

const StyledDrawer = styled(({ collapsed, ...other }) => <Drawer {...other} />)(({ theme, collapsed }) => ({
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

const StyledAppBar = styled(({ collapsed, ...other }) => <AppBar {...other} />)(({ theme, collapsed }) => ({
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

const MenuItemStyled = styled(({ selected, ...other }) => <ListItem {...other} />)(({ theme, selected }) => ({
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

export default function EnterpriseLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [enterpriseName, setEnterpriseName] = useState('Doanh nghiệp');
  const navigate = useNavigate();
  const location = useLocation();
  const { id: enterpriseId } = useParams();

  // Update context when sidebar collapses
  const { setSidebarCollapsed: setContextSidebarCollapsed } = useSidebar();
  useEffect(() => {
    setContextSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed, setContextSidebarCollapsed]);

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

  // Load enterprise name from localStorage
  useEffect(() => {
    try {
      const currentWorkspace = localStorage.getItem('currentWorkspace');
      if (currentWorkspace) {
        const workspace = JSON.parse(currentWorkspace);
        if (workspace.type === 'enterprise' && workspace.name) {
          setEnterpriseName(workspace.name);
        }
      }
    } catch (error) {
      console.error('Error loading enterprise name:', error);
    }
  }, []);

  const menuItems = [
    {
      text: 'Thống kê',
      icon: <ChartIcon />,
      path: `/enterprise/${enterpriseId}/statistics`,
    },
    {
      text: 'Sự kiện',
      icon: <EventIcon />,
      path: `/enterprise/${enterpriseId}/event-management`,
    },
    {
      text: 'Thị Trường',
      icon: <StorefrontIcon />,
      path: `/enterprise/${enterpriseId}/marketplace`,
    },
    {
      text: 'Yêu cầu Báo giá',
      icon: <QuoteRequestIcon />,
      path: `/enterprise/${enterpriseId}/quote-requests`,
    },
    {
      text: 'Báo giá',
      icon: <QuoteIcon />,
      path: `/enterprise/${enterpriseId}/quotations`,
    },
    
    {
      text: 'Duyệt chi',
      icon: <PaymentApprovalIcon />,
      path: `/enterprise/${enterpriseId}/payment-approvals`,
    },
    {
      text: 'Hợp đồng',
      icon: <ContractIcon />,
      path: `/enterprise/${enterpriseId}/contracts`,
    },
    {
      text: 'Doanh nghiệp',
      icon: <BusinessIcon />,
      path: `/enterprise/${enterpriseId}/info`,
    },
    {
      text: 'Cài đặt',
      icon: <SettingsIcon />,
      path: `/enterprise/${enterpriseId}/settings`,
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(`/enterprise/${enterpriseId}/profile`);
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
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <BusinessIcon
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
                {enterpriseName}
              </Typography>
          )}
          </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: sidebarCollapsed ? 1 : 2, py: 1 }}>
          {menuItems.map((item) => {
            const selected = isSelected(item.path);
            const menuItem = (
              <MenuItemStyled
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <StyledAppBar
        position="fixed"
        collapsed={sidebarCollapsed}
        sx={{
          zIndex: 1200,
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
          width: { 
            xs: '100%',
            md: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
          },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          transition: 'width 0.3s ease',
          ml: 0,
          [theme.breakpoints.down('md')]: {
            width: '100%',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ 
          p: 3,
          maxWidth: '100%',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
