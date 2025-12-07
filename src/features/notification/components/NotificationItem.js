import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Box,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import {
  Notifications as NotificationIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Styled Components
const StyledListItem = styled(ListItem)(({ theme, isRead }) => ({
  padding: 0,
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: isRead
    ? theme.palette.background.paper
    : alpha(theme.palette.primary.main, 0.04),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: isRead
      ? alpha(theme.palette.action.hover, 0.08)
      : alpha(theme.palette.primary.main, 0.08),
    transform: "translateX(4px)",
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const NotificationTypeColors = {
  INFO: "#2196f3",
  SUCCESS: "#4caf50",
  WARNING: "#ff9800",
  ERROR: "#f44336",
  DEFAULT: "#757575",
};

/**
 * NotificationItem Component
 * @param {Object} notification - Notification data
 * @param {Function} onClick - Click handler
 * @param {Boolean} selected - Whether item is selected
 */
const NotificationItem = ({ notification, onClick, selected = false }) => {
  const { id, title, message, createdAt, isRead, type = "INFO" } = notification;

  // Format time ago
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get type color
  const getTypeColor = (notificationType) => {
    return NotificationTypeColors[notificationType?.toUpperCase()] || NotificationTypeColors.DEFAULT;
  };

  return (
    <StyledListItem
      isRead={isRead ? 1 : 0}
      selected={selected}
      disablePadding
    >
      <ListItemButton
        onClick={() => onClick(notification)}
        sx={{
          p: 2,
          borderRadius: 1.5,
        }}
      >
        <ListItemAvatar>
          {!isRead ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                sx={{
                  bgcolor: alpha(getTypeColor(type), 0.15),
                  color: getTypeColor(type),
                }}
              >
                <NotificationIcon />
              </Avatar>
            </StyledBadge>
          ) : (
            <Avatar
              sx={{
                bgcolor: alpha(getTypeColor(type), 0.1),
                color: alpha(getTypeColor(type), 0.6),
              }}
            >
              <NotificationIcon />
            </Avatar>
          )}
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: isRead ? 500 : 700,
                  color: isRead ? "text.primary" : "primary.main",
                  flex: 1,
                }}
              >
                {title}
              </Typography>
              {!isRead && (
                <CircleIcon
                  sx={{
                    fontSize: 8,
                    color: "primary.main",
                  }}
                />
              )}
            </Box>
          }
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {message}
              </Typography>
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: "text.disabled",
                  fontStyle: "italic",
                }}
              >
                {formatTimeAgo(createdAt)}
              </Typography>
            </>
          }
          primaryTypographyProps={{
            component: "div",
          }}
          secondaryTypographyProps={{
            component: "div",
          }}
        />
      </ListItemButton>
    </StyledListItem>
  );
};

export default NotificationItem;


