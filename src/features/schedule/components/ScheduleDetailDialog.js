import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import scheduleApi from "../api/schedule.api";
import { formatDateTime } from "../../../shared/utils/dateFormatter";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(2),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  alignItems: "flex-start",
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: theme.spacing(1.5),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  fontSize: "1.1rem",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

/**
 * ScheduleDetailDialog - Popup hiển thị chi tiết lịch trình
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {number} scheduleId - ID của lịch trình
 * @param {number} projectId - ID của dự án
 */
const ScheduleDetailDialog = ({ open, onClose, scheduleId, projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheduleData, setScheduleData] = useState(null);

  // Fetch schedule detail when dialog opens
  useEffect(() => {
    if (open && scheduleId && projectId) {
      fetchScheduleDetail();
    }
  }, [open, scheduleId, projectId]);

  const fetchScheduleDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await scheduleApi.getDetail(projectId, scheduleId);
      console.log("📦 Schedule detail response:", response);
      setScheduleData(response.data || response);
    } catch (err) {
      console.error("❌ Error fetching schedule detail:", err);
      setError(
        err?.response?.data?.message ||
          "Không thể tải thông tin chi tiết lịch trình"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const handleClose = () => {
    setScheduleData(null);
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Chi tiết lịch trình
        </Typography>
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{ minWidth: "auto", p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <CircularProgress size={50} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              Đang tải thông tin lịch trình...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : scheduleData ? (
          <Box>
            {/* Title */}
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 3 }}
            >
              {scheduleData.title}
            </Typography>

            {/* Description */}
            {scheduleData.description && (
              <Box sx={{ mb: 3 }}>
                <SectionTitle variant="subtitle1">
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                  Mô tả
                </SectionTitle>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-wrap",
                    maxHeight: 200,
                    overflowY: "auto",
                    lineHeight: 1.8,
                    p: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[100], 0.5),
                    borderRadius: 2,
                  }}
                >
                  {scheduleData.description}
                </Typography>
              </Box>
            )}

            {/* Event Image */}
            {scheduleData.images && scheduleData.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <SectionTitle variant="subtitle1">
                  <ImageIcon sx={{ fontSize: 20 }} />
                  Hình ảnh
                </SectionTitle>
                <Card sx={{ maxWidth: "100%", borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={scheduleData.images[0]}
                    alt={scheduleData.title}
                    sx={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </Card>
              </Box>
            )}

            {/* Time Information */}
            <Box sx={{ mb: 3 }}>
              <SectionTitle variant="subtitle1">
                <CalendarIcon sx={{ fontSize: 20 }} />
                Thời gian
              </SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoBox>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        Bắt đầu
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDateTime(scheduleData.startedAt)}
                      </Typography>
                    </Box>
                  </InfoBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBox>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        Kết thúc
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDateTime(scheduleData.endedAt)}
                      </Typography>
                    </Box>
                  </InfoBox>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Location Information */}
            <Box sx={{ mb: 3 }}>
              <SectionTitle variant="subtitle1">
                <LocationIcon sx={{ fontSize: 20 }} />
                Thông tin địa điểm
              </SectionTitle>
              {scheduleData.location ? (
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {scheduleData.location.name}
                    </Typography>
                    <List dense disablePadding>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Địa chỉ"
                          secondary={scheduleData.location.address}
                          secondaryTypographyProps={{
                            sx: { fontWeight: 500 },
                          }}
                        />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <MoneyIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Giá thuê / giờ"
                          secondary={formatCurrency(
                            scheduleData.location.pricePerHour
                          )}
                          secondaryTypographyProps={{
                            sx: { fontWeight: 500, color: "success.main" },
                          }}
                        />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <GroupIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Sức chứa"
                          secondary={`${scheduleData.location.capacity || 0} người`}
                          secondaryTypographyProps={{
                            sx: { fontWeight: 500 },
                          }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </StyledCard>
              ) : (
                <Alert severity="info" icon={<LocationIcon />}>
                  Địa điểm: Chưa xác định
                </Alert>
              )}
            </Box>

            {/* Parent Schedule Info */}
            {scheduleData.parentId && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="Lịch trình con"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          startIcon={<CloseIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDetailDialog;
