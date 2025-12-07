import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import notificationApi from '../api/notification.api';

/**
 * NotificationBell Component
 * Displays a bell icon with a badge showing unread notification count
 * 
 * @param {number} userId - User ID to fetch notifications for
 * @param {number} pollInterval - Polling interval in milliseconds (default: 30000 = 30s)
 * @param {string} navigateTo - Path to navigate to when bell is clicked (default: '/notifications')
 */
const NotificationBell = ({ 
  userId, 
  pollInterval = 30000, 
  navigateTo = '/notifications' 
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  /**
   * Handle bell click - navigate to notifications page
   */
  const handleClick = () => {
    navigate(navigateTo);
  };

  return (
    <Tooltip title="Thông báo" arrow>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} thông báo chưa đọc`}
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
    </Tooltip>
  );
};

export default NotificationBell;

