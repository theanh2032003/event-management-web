import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Divider,
  Chip,
  TablePagination,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import notificationApi from '../api/notification.api';

/**
 * Notifications Page
 * Hiển thị tất cả thông báo với phân trang
 */
const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Get user ID from localStorage
   */
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
    setLoading(true);
    try {
      const userId = getUserId();
      const response = await notificationApi.getNotifications(userId, page, rowsPerPage);
      
      console.log('📋 Notifications Page Response:', response);
      
      const notificationList = response?.content || [];
      setNotifications(notificationList);
      setTotalElements(response?.totalElements || 0);
      
      // Count unread
      const unread = notificationList.filter(n => !n.read).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      toast.error('Không thể tải danh sách thông báo');
      setNotifications([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle page change
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Handle click on a notification
   */
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('Đã đánh dấu đã đọc');
      } catch (error) {
        console.error('Error marking as read:', error);
        toast.error('Không thể đánh dấu đã đọc');
      }
    }
  };

  /**
   * Mark all as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      const userId = getUserId();
      await notificationApi.markAllAsRead(userId, 'USER');
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  /**
   * Refresh notifications
   */
  const handleRefresh = () => {
    fetchNotifications();
  };

  // Fetch on mount and when page/rowsPerPage changes
  useEffect(() => {
    fetchNotifications();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Back Button */}
          <Tooltip title="Quay lại">
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.lighter' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          
          <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} chưa đọc`}
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={handleRefresh} disabled={loading} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <>
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id || index}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 3,
                      py: 2,
                      backgroundColor: notification.read ? 'transparent' : alpha('#1976d2', 0.08),
                      '&:hover': {
                        backgroundColor: notification.read
                          ? alpha('#000', 0.04)
                          : alpha('#1976d2', 0.12),
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {/* Unread indicator dot */}
                    {!notification.read && (
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: 'error.main',
                          flexShrink: 0,
                          mr: 2,
                        }}
                      />
                    )}

                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: notification.read ? 400 : 700,
                            mb: 0.5,
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {notification.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            {formatDate(notification.createdAt)}
                            {notification.type && (
                              <>
                                <span>•</span>
                                <Chip
                                  label={notification.type}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </>
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {/* Pagination */}
            <Divider />
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`
              }
            />
          </>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              px: 2,
            }}
          >
            <NotificationsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không có thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa có thông báo nào
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;
