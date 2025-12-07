import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  alpha,
  styled,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: "100%",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 3),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.08
  )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const NotificationTypeColors = {
  INFO: { bg: "#e3f2fd", color: "#1976d2" },
  SUCCESS: { bg: "#e8f5e9", color: "#388e3c" },
  WARNING: { bg: "#fff3e0", color: "#f57c00" },
  ERROR: { bg: "#ffebee", color: "#d32f2f" },
  DEFAULT: { bg: "#f5f5f5", color: "#757575" },
};

/**
 * NotificationDetailDialog Component
 * @param {Boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {Object} notification - Notification data
 */
const NotificationDetailDialog = ({ open, onClose, notification }) => {
  if (!notification) return null;

  const { title, message, createdAt, type = "INFO", isRead } = notification;

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Get type config
  const getTypeConfig = (notificationType) => {
    return (
      NotificationTypeColors[notificationType?.toUpperCase()] ||
      NotificationTypeColors.DEFAULT
    );
  };

  const typeConfig = getTypeConfig(type);

  // Get type label
  const getTypeLabel = (notificationType) => {
    const labels = {
      INFO: "Thông tin",
      SUCCESS: "Thành công",
      WARNING: "Cảnh báo",
      ERROR: "Lỗi",
    };
    return labels[notificationType?.toUpperCase()] || notificationType;
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <StyledDialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          <NotificationIcon
            sx={{ fontSize: 28, color: typeConfig.color }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.3,
              }}
            >
              Chi tiết thông báo
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: alpha("#000", 0.04),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Type and Status */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={getTypeLabel(type)}
            size="small"
            sx={{
              bgcolor: typeConfig.bg,
              color: typeConfig.color,
              fontWeight: 600,
              border: "none",
            }}
          />
          {!isRead && (
            <Chip
              label="Chưa đọc"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Title */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1.5,
              lineHeight: 1.4,
            }}
          >
            {title}
          </Typography>

          {/* Time */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "text.secondary",
            }}
          >
            <TimeIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              {formatDate(createdAt)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Message Content */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: alpha("#000", 0.02),
            border: `1px solid ${alpha("#000", 0.06)}`,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Additional Info (if needed) */}
        {notification.additionalData && (
          <Box sx={{ mt: 2.5 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
            >
              Thông tin bổ sung:
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                backgroundColor: alpha(typeConfig.color, 0.05),
                border: `1px solid ${alpha(typeConfig.color, 0.1)}`,
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(notification.additionalData, null, 2)}
              </pre>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          pt: 2,
          borderTop: `1px solid ${alpha("#000", 0.06)}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1.5,
            px: 3,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default NotificationDetailDialog;


