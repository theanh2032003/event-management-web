import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  Badge,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  ListItemText,
  alpha,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import notificationApi from '../api/notification.api';

/**
 * NotificationDropdown Component
 * Hiển thị dropdown menu với danh sách thông báo
 * 
 * @param {number} userId - User ID
 * @param {number} pollInterval - Polling interval (ms)
 */
const NotificationDropdown = ({ userId, pollInterval = 30000 }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page] = useState(0);
  const [size] = useState(10);

  const open = Boolean(anchorEl);

  /**
   * Format date to DD/MM/YYYY HH:mm
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async () => {
    if (!userId) {
      console.warn('NotificationDropdown: No userId provided');
      return;
    }

    setLoading(true);
    try {
      const response = await notificationApi.getNotifications(userId, page, size);
      
      console.log('📋 Full API Response:', response);
      
      // Backend returns: { content: [...], totalElements, totalPages, ... }
      const notificationList = response?.content || [];
      
      console.log('📋 Notifications list:', notificationList);
      
      setNotifications(notificationList);
      
      // Count unread notifications
      const unread = notificationList.filter(n => !n.read).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

 

  /**
   * Handle bell icon click - open dropdown and fetch notifications
   */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Fetch notifications when opening dropdown
    if (!open) {
      fetchNotifications();
    }
  };

  /**
   * Handle close dropdown
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle click on a notification item
   */
  const handleNotificationClick = async (notification) => {
    console.log('🔔 Clicked notification:', notification);
    
    // Mark as read if unread
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // You can add navigation logic here based on notification.type
    // e.g., navigate to related page
  };

  /**
   * Mark all as read
   */
  const handleMarkAllAsRead = async () => {
    if (!userId) {
      console.warn('NotificationDropdown: No userId provided for mark all as read');
      return;
    }
    
    try {
      await notificationApi.markAllAsRead(userId, 'USER');
      // Update local state - mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  /**
   * Manual refresh
   */
  const handleRefresh = () => {
    fetchNotifications();
  };

  // Initial fetch of unread count
  // useEffect(() => {
  //   if (userId) {
  //     fetchUnreadCount();
  //   }
  // }, [userId]);

  // // Set up polling for unread count
  // useEffect(() => {
  //   if (!userId || !pollInterval) return;

  //   const interval = setInterval(fetchUnreadCount, pollInterval);
  //   return () => clearInterval(interval);
  // }, [userId, pollInterval]);

  return (
    <>
      {/* Bell Icon Button */}
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} thông báo chưa đọc`}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
          invisible={unreadCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '90vw',
            maxHeight: 600,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            mt: 1,
            overflowX: 'hidden',  // ✅ Ẩn scrollbar ngang ở Menu
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ 
          px: 2.5, 
          py: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${alpha('#1976d2', 0.05)}, ${alpha('#9c27b0', 0.05)})`,
          overflow: 'hidden',  // ✅ Ngăn overflow ở header
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              fontSize: '1.1rem', 
              color: 'primary.main',
              overflow: 'hidden',  // ✅ Ngăn text overflow
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Thông báo
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            flexShrink: 0,  // ✅ Prevent buttons from shrinking
          }}>
            <IconButton 
              size="small" 
              onClick={handleRefresh} 
              disabled={loading}
              sx={{ 
                '&:hover': { bgcolor: alpha('#1976d2', 0.1) } 
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            {unreadCount > 0 && (
              <IconButton 
                size="small" 
                onClick={handleMarkAllAsRead} 
                title="Đánh dấu tất cả đã đọc"
                sx={{ 
                  '&:hover': { bgcolor: alpha('#1976d2', 0.1) } 
                }}
              >
                <MarkReadIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
        
        <Divider />

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <Box sx={{ 
            maxHeight: 450, 
            overflowY: 'auto',
            overflowX: 'hidden',  // ✅ Ẩn scrollbar ngang ở list
          }}>
            {notifications.map((notification, index) => (
              <MenuItem
                key={notification.id || index}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'block',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',  // ✅ Break long words
                  overflowWrap: 'break-word',  // ✅ Wrap long text
                  backgroundColor: notification.read ? 'transparent' : alpha('#1976d2', 0.06),
                  borderLeft: notification.read ? 'none' : `3px solid #1976d2`,
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',  // ✅ Include padding in width calculation
                  '&:hover': {
                    backgroundColor: notification.read 
                      ? alpha('#000', 0.04)
                      : alpha('#1976d2', 0.12),
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5,
                  width: '100%',  // ✅ Đảm bảo full width
                  overflow: 'hidden',  // ✅ Ngăn overflow
                }}>
                  {/* Unread indicator dot */}
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 'error.main',
                        flexShrink: 0,
                        mt: 0.5,
                        boxShadow: `0 0 8px ${alpha('#f44336', 0.4)}`,
                      }}
                    />
                  )}
                  
                  <Box sx={{ 
                    flex: 1, 
                    minWidth: 0,  // ✅ Allow flex item to shrink below content size
                    overflow: 'hidden',  // ✅ Ngăn overflow
                  }}>
                    {/* Title */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.read ? 500 : 700,
                        mb: 0.5,
                        fontSize: '0.95rem',
                        color: notification.read ? 'text.primary' : 'primary.main',
                        wordBreak: 'break-word',  // ✅ Break long words
                        overflowWrap: 'break-word',  // ✅ Wrap long text
                      }}
                    >
                      {notification.title}
                    </Typography>
                    
                    {/* Content */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.875rem',
                        mb: 0.75,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',  // ✅ Break long words
                      }}
                    >
                      {notification.content}
                    </Typography>
                    
                    {/* Created At */}
                    <Typography
                      variant="caption"
                      sx={{ 
                        fontSize: '0.75rem',
                        color: 'primary.main',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexWrap: 'wrap',  // ✅ Wrap if needed
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 4, 
                          height: 4, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          display: 'inline-block',
                        }} 
                      />
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 6, 
            px: 3,
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha('#1976d2', 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}>
              <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="body1" color="text.primary" fontWeight={600} gutterBottom>
              Không có thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Bạn chưa có thông báo nào
            </Typography>
          </Box>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ 
              p: 1.5, 
              display: 'flex', 
              justifyContent: 'center',
              background: alpha('#f5f5f5', 0.5),
              overflow: 'hidden',  // ✅ Ngăn overflow ở footer
            }}>
              <Button 
                size="small" 
                variant="text"
                onClick={() => {
                  handleClose();
                  navigate('/notifications');
                }}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  px: 3,
                  py: 0.75,
                  borderRadius: 2,
                  overflow: 'hidden',  // ✅ Ngăn button overflow
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: alpha('#1976d2', 0.1),
                  },
                }}
              >
                Xem tất cả thông báo
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationDropdown;

