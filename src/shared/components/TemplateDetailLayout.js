import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Grid,
  Divider,
  Tooltip,
  styled,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

// Styled Components
const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2, 2, 0, 0),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderBottom: "none",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ContentBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(0, 0, 2, 2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  minHeight: "400px",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  border: "1px solid " + alpha(theme.palette.divider, 0.2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2.5),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.75, 2),
    fontSize: "0.875rem",
  },
}));

const BackIconButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    transform: "translateX(-2px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  [theme.breakpoints.down("sm")]: {
    width: 40,
    height: 40,
  },
}));

/**
 * TemplateDetailLayout - Component layout chung cho các trang chi tiết
 * 
 * @param {Object} props
 * @param {string} props.title - Tiêu đề chính (VD: "Hợp đồng #123")
 * @param {Object} props.status - Trạng thái { label: string, color: string }
 * @param {string} props.createdBy - Người tạo (tên hoặc ID)
 * @param {string|Date} props.createdDate - Ngày tạo
 * @param {Array} props.actions - Mảng các action buttons [{label, icon, onClick, variant, color, disabled}]
 * @param {React.ReactNode} props.children - Nội dung chi tiết (tabs, tables, forms...)
 * @param {Object} props.additionalInfo - Thông tin bổ sung hiển thị ở header (optional)
 * @param {React.ReactNode} props.headerExtra - Nội dung tùy chỉnh thêm vào header (optional)
 * 
 * @example
 * <TemplateDetailLayout
 *   title="Hợp đồng #123 - Mua thiết bị âm thanh"
 *   status={{ label: "Đã ký", color: "success" }}
 *   createdBy="Nguyễn Văn A"
 *   createdDate="2025-11-17T10:30:00"
 *   actions={[
 *     { label: "Sửa", icon: <EditIcon />, onClick: handleEdit, variant: "outlined" },
 *     { label: "Xóa", icon: <DeleteIcon />, onClick: handleDelete, variant: "outlined", color: "error" },
 *   ]}
 *   additionalInfo={{
 *     "Tổng giá trị": "50,000,000 VND",
 *     "Nhà cung cấp": "Công ty ABC"
 *   }}
 * >
 *   <Box>
 *     <Typography>Nội dung chi tiết...</Typography>
 *   </Box>
 * </TemplateDetailLayout>
 */
const TemplateDetailLayout = ({
  title,
  status,
  createdBy,
  createdDate,
  actions = [],
  children,
  additionalInfo = {},
  headerExtra,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Format date - only date without time
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Separate back action from other actions
  const backAction = actions.find(
    (action) => 
      action.label?.toLowerCase().includes("quay lại") || 
      action.label?.toLowerCase().includes("back")
  );
  const otherActions = actions.filter(
    (action) => 
      !action.label?.toLowerCase().includes("quay lại") && 
      !action.label?.toLowerCase().includes("back")
  );

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
      {/* Header Section - Summary */}
      <HeaderBox>
        {/* Top Bar: Back Button | Title & Status | Action Buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}
        >
          {/* Back Button - Left */}
          {backAction && (
            <Tooltip title={backAction.label || "Quay lại"}>
              <BackIconButton
                onClick={backAction.onClick}
                disabled={backAction.disabled}
                sx={{ flexShrink: 0 }}
              >
                <ArrowBackIcon />
              </BackIconButton>
            </Tooltip>
          )}

          {/* Title & Status - Center (flex grow) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
                mb: status ? 1 : 0,
              }}
            >
              {title}
            </Typography>

            {/* Status */}
           
          </Box>

          {/* Action Buttons - Right */}
          {otherActions.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexShrink: 0,
                flexWrap: "wrap",
                justifyContent: isMobile ? "flex-start" : "flex-end",
              }}
            >
              {otherActions.map((action, index) => (
                <ActionButton
                  key={index}
                  variant={action.variant || "contained"}
                  color={action.color || "primary"}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  startIcon={action.icon}
                  size={isMobile ? "small" : "medium"}
                >
                  {action.label}
                </ActionButton>
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2.5, opacity: 0.3 }} />

        {/* Meta Information */}
        <Grid container spacing={2}>
          {/* Created By */}
          {createdBy && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoBox>
                <PersonIcon
                  sx={{ fontSize: 20, color: "secondary.main", flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    Người tạo
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {createdBy}
                  </Typography>
                </Box>
              </InfoBox>
            </Grid>
          )}
          
          {/* Created Date */}
          {createdDate && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoBox>
                <CalendarIcon
                  sx={{ fontSize: 20, color: "primary.main", flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    Ngày tạo
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {formatDate(createdDate)}
                  </Typography>
                </Box>
              </InfoBox>
            </Grid>
          )}

          {/* Additional Info */}
         
        </Grid>

        {/* Header Extra Content */}
        {headerExtra && (
          <>
            <Divider sx={{ my: 2.5, opacity: 0.3 }} />
            {headerExtra}
          </>
        )}
      </HeaderBox>

      {/* Content Section */}
      <ContentBox elevation={0}>
        {children}
      </ContentBox>
    </Box>
  );
};

export default TemplateDetailLayout;
