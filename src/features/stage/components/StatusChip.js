import React from "react";
import { Chip } from "@mui/material";
import {
  HourglassEmpty as PendingIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as DoneIcon,
  Cancel as CancelledIcon,
} from "@mui/icons-material";

/**
 * Status labels and colors
 */
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    color: "default",
    icon: <PendingIcon fontSize="small" />,
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: "primary",
    icon: <InProgressIcon fontSize="small" />,
  },
  SUCCESS: {
    label: "Hoàn thành",
    color: "success",
    icon: <DoneIcon fontSize="small" />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "error",
    icon: <CancelledIcon fontSize="small" />,
  },
  REJECTED: {
    label: "Từ chối",
    color: "error",
    icon: <CancelledIcon fontSize="small" />,
  },
};

/**
 * StatusChip - Display status with colored chip
 * @param {string} status - Status value (PENDING, IN_PROGRESS, SUCCESS, CANCELLED,REJECTED)
 * @param {string} size - Chip size (small, medium)
 */
const StatusChip = ({ status, size = "small" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{ fontWeight: 500 }}
    />
  );
};

export default StatusChip;
