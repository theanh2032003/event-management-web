import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Grid,
  Divider,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  styled,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  formatDateTimeLocal,
  getCurrentDateTimeLocal,
  formatDateTime,
} from "../../../shared/utils/dateFormatter";
import locationApi from "../../location/api/location.api";
import { useToast } from "../../../app/providers/ToastContext";

// Styled Components
const DialogHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2.5),
  background: theme.palette.primary.main,
  borderBottom: `none`,
}));

const DialogHeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1.1rem",
  color: theme.palette.primary.contrastText,
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.875rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: theme.spacing(1.5),
  border: `2px dashed ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  bgcolor: alpha(theme.palette.action.hover, 0.5),
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    bgcolor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const ImagePreview = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

/**
 * ScheduleDialog - Modal for creating/editing schedules
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {object|null} schedule - Schedule to edit (null for create)
 * @param {object|null} parentSchedule - Parent schedule (for child schedules)
 * @param {function} onSave - Save handler
 * @param {boolean} submitting - Submitting state
 * @param {boolean} isMobile - Mobile view flag
 * @param {string} enterpriseId - Enterprise ID for fetching locations
 */
const ScheduleDialog = ({
  open,
  onClose,
  schedule,
  parentSchedule,
  onSave,
  submitting,
  isMobile,
  enterpriseId,
}) => {
  const theme = useTheme();
  const toast = useToast();
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = React.useRef(null);
  
  // Location states
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    images: [],
    locationId: "",
    startedAt: "",
    endedAt: "",
    parentId: null,
  });

  // Fetch locations when dialog opens
  useEffect(() => {
    if (open && enterpriseId) {
      fetchLocations();
    }
  }, [open, enterpriseId]);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await locationApi.getLocations(enterpriseId);
      // API returns {data: Array, metadata: {}} structure
      const locationData = response?.data || response;
      setLocations(Array.isArray(locationData) ? locationData : []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      toast.error("Không thể tải danh sách địa điểm");
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Initialize form when dialog opens or schedule changes
  useEffect(() => {
    if (open) {
      if (schedule) {
        // Edit mode
        setScheduleForm({
          title: schedule.title || "",
          description: schedule.description || "",
          images: schedule.images || [],
          locationId: schedule.locationId || schedule.location?.id || "",
          startedAt: formatDateTimeLocal(schedule.startedAt),
          endedAt: formatDateTimeLocal(schedule.endedAt),
          parentId: schedule.parentId || null,
        });
      } else {
        // Create mode
        const defaultStart = parentSchedule
          ? formatDateTimeLocal(parentSchedule.startedAt)
          : getCurrentDateTimeLocal();
        
        const defaultEnd = parentSchedule
          ? formatDateTimeLocal(parentSchedule.endedAt)
          : getCurrentDateTimeLocal();

        setScheduleForm({
          title: "",
          description: "",
          images: [],
          locationId: "",
          startedAt: defaultStart,
          endedAt: defaultEnd,
          parentId: parentSchedule ? parentSchedule.id : null,
        });
      }
    }
  }, [open, schedule, parentSchedule]);

  // Image handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImages(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setScheduleForm({
          ...scheduleForm,
          images: [...scheduleForm.images, base64String],
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Lỗi tải hình ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = scheduleForm.images.filter((_, i) => i !== index);
    setScheduleForm({ ...scheduleForm, images: newImages });
  };

  // Validate and save
  const handleSave = () => {
    const errors = {};

    // Validation
    if (!scheduleForm.title.trim()) {
      errors.title = "Tiêu đề là bắt buộc";
    }

    if (!scheduleForm.description.trim()) {
      errors.description = "Mô tả là bắt buộc";
    }

    if (!scheduleForm.locationId) {
      errors.locationId = "Địa điểm là bắt buộc";
    }

    if (!scheduleForm.startedAt) {
      errors.startedAt = "Thời gian bắt đầu là bắt buộc";
    }

    if (!scheduleForm.endedAt) {
      errors.endedAt = "Thời gian kết thúc là bắt buộc";
    }

    if (scheduleForm.startedAt && scheduleForm.endedAt && new Date(scheduleForm.startedAt) >= new Date(scheduleForm.endedAt)) {
      errors.endedAt = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    // Validate child schedule time range
    if (parentSchedule && scheduleForm.startedAt && scheduleForm.endedAt) {
      const parentStart = new Date(parentSchedule.startedAt);
      const parentEnd = new Date(parentSchedule.endedAt);
      const childStart = new Date(scheduleForm.startedAt);
      const childEnd = new Date(scheduleForm.endedAt);

      if (childStart < parentStart) {
        errors.startedAt = "Thời gian bắt đầu phải >= thời gian bắt đầu của lịch trình chính";
      }
      if (childEnd > parentEnd) {
        errors.endedAt = "Thời gian kết thúc phải <= thời gian kết thúc của lịch trình chính";
      }
    }

    // If there are errors, set them and don't save
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Clear errors if validation passes
    setFieldErrors({});
    onSave(scheduleForm, schedule?.id);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      {/* Custom Header */}
      <DialogHeader>
        <DialogHeaderTitle>
          {schedule 
            ? "Chỉnh sửa lịch trình" 
            : parentSchedule
              ? `Thêm lịch trình con`
              : "Tạo lịch trình chính"
          }
        </DialogHeaderTitle>
      </DialogHeader>

      {/* Content */}
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Basic Information Section */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Tiêu đề"
                  fullWidth
                  required
                  value={scheduleForm.title}
                  onChange={(e) => {
                    setScheduleForm({ ...scheduleForm, title: e.target.value });
                    if (fieldErrors.title) {
                      setFieldErrors({ ...fieldErrors, title: "" });
                    }
                  }}
                  disabled={submitting}
                  placeholder="Nhập tiêu đề lịch trình"
                  size="medium"
                  error={!!fieldErrors.title}
                  helperText={fieldErrors.title}
                />

                <TextField
                  label="Mô tả"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={scheduleForm.description}
                  onChange={(e) => {
                    setScheduleForm({
                      ...scheduleForm,
                      description: e.target.value,
                    });
                    if (fieldErrors.description) {
                      setFieldErrors({ ...fieldErrors, description: "" });
                    }
                  }}
                  disabled={submitting}
                  placeholder="Mô tả chi tiết về lịch trình"
                  size="small"
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: '100%' }}>
                <Grid container spacing={2}>
                  {/* Start time */}
                  <Grid item xs={12} sm={6} sx={{width: '40%'}}>
                    <TextField
                      label="Bắt đầu"
                      type="datetime-local"
                      fullWidth
                      required
                      size="medium"
                      value={scheduleForm.startedAt || ""}
                      onChange={(e) => {
                        setScheduleForm({
                          ...scheduleForm,
                          startedAt: e.target.value,
                        });
                        if (fieldErrors.startedAt) {
                          setFieldErrors({ ...fieldErrors, startedAt: "" });
                        }
                      }}
                      disabled={submitting}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: parentSchedule 
                          ? formatDateTimeLocal(parentSchedule.startedAt)
                          : undefined,
                        max: parentSchedule
                          ? formatDateTimeLocal(parentSchedule.endedAt)
                          : undefined,
                      }}
                      error={!!fieldErrors.startedAt}
                      helperText={fieldErrors.startedAt || (parentSchedule ? "Phải nằm trong khoảng thời gian của lịch trình chính" : "")}
                    />
                  </Grid>

                  {/* End time */}
                  <Grid item xs={12} sm={6} sx={{width: '40%'}}>
                    <TextField
                      label="Kết thúc"
                      type="datetime-local"
                      fullWidth
                      required
                      size="medium"
                      value={scheduleForm.endedAt || ""}
                      onChange={(e) => {
                        setScheduleForm({ ...scheduleForm, endedAt: e.target.value });
                        if (fieldErrors.endedAt) {
                          setFieldErrors({ ...fieldErrors, endedAt: "" });
                        }
                      }}
                      disabled={submitting}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: parentSchedule 
                          ? formatDateTimeLocal(parentSchedule.startedAt)
                          : undefined,
                        max: parentSchedule
                          ? formatDateTimeLocal(parentSchedule.endedAt)
                          : undefined,
                      }}
                      error={!!fieldErrors.endedAt}
                      helperText={fieldErrors.endedAt || (parentSchedule ? "Phải nằm trong khoảng thời gian của lịch trình chính" : "")}
                    />
                  </Grid>
                </Grid>

                {/* Location Selection */}
                <FormControl fullWidth size="medium" error={!!fieldErrors.locationId}>
                  <InputLabel id="location-select-label">Địa điểm *</InputLabel>
                  <Select
                    labelId="location-select-label"
                    value={scheduleForm.locationId}
                    label="Địa điểm *"
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, locationId: e.target.value });
                      if (fieldErrors.locationId) {
                        setFieldErrors({ ...fieldErrors, locationId: "" });
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {loadingLocations ? (
                      <MenuItem disabled>Đang tải...</MenuItem>
                    ) : locations.length === 0 ? (
                      <MenuItem disabled>Không có địa điểm nào</MenuItem>
                    ) : (
                      locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name} - {location.address}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {fieldErrors.locationId ? (
                    <FormHelperText>{fieldErrors.locationId}</FormHelperText>
                  ) : parentSchedule ? (
                    <FormHelperText>
                      {parentSchedule.location?.name ? `Địa điểm của lịch trình chính: ${parentSchedule.location.name}` : "Lịch trình chính chưa có địa điểm"}
                    </FormHelperText>
                  ) : null}
                </FormControl>
              </Box>

          {/* Images Section */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {/* Upload Box */}
                  <ImageUploadBox
                    component="label"
                    sx={{
                      opacity: uploadingImages || submitting ? 0.6 : 1,
                      pointerEvents: uploadingImages || submitting ? "none" : "auto",
                    }}
                  >
                    {uploadingImages ? (
                      <CircularProgress size={32} />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          color: "text.secondary",
                        }}
                      >
                        <CloudUploadIcon sx={{ fontSize: 28 }} />
                        <Typography variant="caption" sx={{ textAlign: "center" }}>
                          Tải lên
                        </Typography>
                      </Box>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages || submitting}
                    />
                  </ImageUploadBox>

                  {/* Image Previews */}
                  {scheduleForm.images.map((img, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <ImageUploadBox>
                        <ImagePreview src={img} alt={`Preview ${index + 1}`} />
                      </ImageUploadBox>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        disabled={submitting}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            bgcolor: "error.main",
                            color: "error.contrastText",
                            borderColor: "error.main",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{
            px: 3,
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={submitting}
          startIcon={<SaveIcon />}
          sx={{
            px: 3,
          }}
        >
          {submitting
            ? "Đang lưu..."
            : schedule
              ? "Lưu thay đổi"
              : "Tạo lịch trình"
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog;
