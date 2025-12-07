import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Chip,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  CircularProgress,
  Avatar,
  styled,
  alpha,
} from "@mui/material";
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
} from "@mui/icons-material";
import { uploadToCloudinary } from "../../../shared/utils/uploadToCloudinary";
import { useSnackbar } from 'notistack';

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      margin: 0,
      maxHeight: '100vh',
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      },
    },
  },
}));

const AvatarUploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  minHeight: 120,
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
  '&:hover .remove-button': {
    opacity: 1,
  },
}));

const ImagePreview = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: alpha(theme.palette.error.main, 0.9),
  color: 'white',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.error.main,
  },
}));

const UploadButton = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: theme.spacing(1),
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

/**
 * EventDialog - Form tạo/chỉnh sửa event
 */
const EventDialog = ({
  open,
  onClose,
  event,
  groupTaskStates,
  groupTaskTypes,
  locations = [],
  loadingDropdowns,
  onSave,
  formatDateTimeLocal,
  getCurrentDateTimeLocal,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { enqueueSnackbar } = useSnackbar();

  const [eventForm, setEventForm] = useState({
    name: "",
    avatar: "",
    description: "",
    category: "CONFERENCE",
    feeType: "FREE",
    visibility: "PUBLIC",
    accessType: "OPEN",
    startedAt: getCurrentDateTimeLocal(),
    endedAt: getCurrentDateTimeLocal(),
    groupTaskStateId: "",
    groupTaskTypeId: "",
    locationId: "",
    images: [],
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Set default dropdown values khi data available
  useEffect(() => {
    if (!loadingDropdowns && groupTaskStates.length > 0 && !eventForm.groupTaskStateId) {
      setEventForm((prev) => ({ ...prev, groupTaskStateId: groupTaskStates[0].id }));
    }
  }, [loadingDropdowns, groupTaskStates, eventForm.groupTaskStateId]);

  useEffect(() => {
    if (!loadingDropdowns && groupTaskTypes.length > 0 && !eventForm.groupTaskTypeId) {
      setEventForm((prev) => ({ ...prev, groupTaskTypeId: groupTaskTypes[0].id }));
    }
  }, [loadingDropdowns, groupTaskTypes, eventForm.groupTaskTypeId]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup all blob URLs when component unmounts
      // Use a ref-like approach: store current imagePreviews in cleanup
      const currentPreviews = imagePreviews;
      currentPreviews.forEach(preview => {
        if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load event data khi edit
  useEffect(() => {
    if (event) {
      setEventForm({
        name: event.name || "",
        avatar: event.avatar || "",
        description: event.description || "",
        category: event.category || "CONFERENCE",
        feeType: event.feeType || "FREE",
        visibility: event.visibility || "PUBLIC",
        accessType: event.accessType || "OPEN",
        startedAt: event.startedAt ? formatDateTimeLocal(event.startedAt) : getCurrentDateTimeLocal(),
        endedAt: event.endedAt ? formatDateTimeLocal(event.endedAt) : getCurrentDateTimeLocal(),
        groupTaskStateId: event.groupTaskStateId || "",
        groupTaskTypeId: event.groupTaskTypeId || "",
        locationId: event.locationId || event.location?.id || "",
        images: event.images || [],
      });
      setAvatarPreview(event.avatar || null);
      // Use images array directly as previews (they are URLs from server)
      setImagePreviews(event.images || []);
    } else {
      // Reset form khi create mới
      // Cleanup old blob URLs before reset
      setImagePreviews(prev => {
        prev.forEach(preview => {
          if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });
        return [];
      });
      setEventForm({
        name: "",
        avatar: "",
        description: "",
        category: "CONFERENCE",
        feeType: "FREE",
        visibility: "PUBLIC",
        accessType: "OPEN",
        startedAt: getCurrentDateTimeLocal(),
        endedAt: getCurrentDateTimeLocal(),
        groupTaskStateId: groupTaskStates.length > 0 ? groupTaskStates[0].id : "",
        groupTaskTypeId: groupTaskTypes.length > 0 ? groupTaskTypes[0].id : "",
        locationId: "",
        images: [],
      });
      setAvatarPreview(null);
      setError("");
    }
  }, [event, open, groupTaskStates, groupTaskTypes, formatDateTimeLocal, getCurrentDateTimeLocal]);

  // Avatar upload handler
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Vui lòng chọn file ảnh!', { variant: 'warning' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Kích thước ảnh không được vượt quá 5MB!', { variant: 'warning' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setEventForm({ ...eventForm, avatar: uploadedUrl });
        enqueueSnackbar('Tải ảnh đại diện lên thành công!', { variant: 'success' });
      } else {
        enqueueSnackbar('Không thể tải ảnh lên. Vui lòng thử lại!', { variant: 'error' });
        setAvatarPreview(null);
      }
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi tải ảnh!', { variant: 'error' });
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setEventForm({ ...eventForm, avatar: "" });
  };

  // Multiple images upload handler
  const handleImagesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar(`File ${file.name} không phải là ảnh!`, { variant: 'warning' });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar(`File ${file.name} vượt quá 5MB!`, { variant: 'warning' });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create temporary previews using blob URLs
    const blobPreviews = validFiles.map(file => URL.createObjectURL(file));
    // Show previews immediately
    setImagePreviews(prev => [...prev, ...blobPreviews]);

    setUploadingImages(true);
    try {
      const uploadPromises = validFiles.map((file) => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      const successfulUrls = uploadedUrls.filter((url) => url !== null);
      const failedIndices = uploadedUrls.map((url, index) => url === null ? index : -1).filter(i => i !== -1);
      
      if (successfulUrls.length > 0) {
        // Update form with successful URLs
        setEventForm(prev => ({
          ...prev,
          images: [...prev.images, ...successfulUrls],
        }));
        
        // Replace blob URLs with actual URLs from server
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          let urlIndex = 0;
          // Replace blob previews with actual URLs
          for (let i = 0; i < newPreviews.length; i++) {
            if (blobPreviews.includes(newPreviews[i])) {
              const blobIndex = blobPreviews.indexOf(newPreviews[i]);
              if (uploadedUrls[blobIndex] !== null) {
                // Revoke blob URL and replace with server URL
                URL.revokeObjectURL(newPreviews[i]);
                newPreviews[i] = uploadedUrls[blobIndex];
              }
            }
          }
          return newPreviews;
        });
        
        enqueueSnackbar(`Tải ${successfulUrls.length} ảnh lên thành công!`, { variant: 'success' });
      }
      
      // Clean up failed upload blob URLs
      failedIndices.forEach(index => {
        URL.revokeObjectURL(blobPreviews[index]);
      });
      
      // Remove failed previews
      if (failedIndices.length > 0) {
        setImagePreviews(prev => {
          const blobToRemove = failedIndices.map(i => blobPreviews[i]);
          return prev.filter(preview => !blobToRemove.includes(preview));
        });
      }
      
      if (successfulUrls.length === 0) {
        enqueueSnackbar('Không thể tải ảnh lên. Vui lòng thử lại!', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi tải ảnh!', { variant: 'error' });
      // Clean up all blob previews on error
      blobPreviews.forEach(preview => URL.revokeObjectURL(preview));
      setImagePreviews(prev => prev.filter(preview => !blobPreviews.includes(preview)));
    } finally {
      setUploadingImages(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = eventForm.images.filter((_, i) => i !== index);
    const previewToRemove = imagePreviews[index];
    
    // If it's a blob URL, revoke it
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setEventForm({ ...eventForm, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (!eventForm.name.trim()) {
      setError("Tên sự kiện là bắt buộc");
      return;
    }

    if (!eventForm.startedAt) {
      setError("Thời gian bắt đầu là bắt buộc");
      return;
    }

    if (!eventForm.endedAt) {
      setError("Thời gian kết thúc là bắt buộc");
      return;
    }

    if (new Date(eventForm.startedAt) >= new Date(eventForm.endedAt)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    if (!eventForm.groupTaskStateId) {
      setError("Nhóm trạng thái công việc là bắt buộc");
      return;
    }

    if (!eventForm.groupTaskTypeId) {
      setError("Nhóm loại công việc là bắt buộc");
      return;
    }

    if (!eventForm.locationId) {
      setError("Địa điểm là bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(eventForm, event);
      handleClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi lưu sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError("");
      onClose();
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        fontSize: '1.5rem', 
        fontWeight: 600,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        pb: 2,
      }}>
        {event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <StyledTextField
            label="Tên sự kiện"
            fullWidth
            required
            value={eventForm.name}
            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            disabled={submitting}
            placeholder="Nhập tên sự kiện"
          />

          {/* Avatar Upload */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Ảnh đại diện {uploadingAvatar && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </Typography>
            <AvatarUploadBox>
              {avatarPreview ? (
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 80, height: 80 }}
                    variant="rounded"
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar || submitting}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  component="label"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Upload
                  </Typography>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar || submitting}
                  />
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Ảnh đại diện cho sự kiện (tối đa 5MB)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hoặc nhập URL: <TextField
                    size="small"
                    value={eventForm.avatar}
                    onChange={(e) => {
                      setEventForm({ ...eventForm, avatar: e.target.value });
                      setAvatarPreview(e.target.value || null);
                    }}
                    disabled={submitting || uploadingAvatar}
                    placeholder="https://example.com/image.jpg"
                    sx={{ mt: 1, width: '100%' }}
                  />
                </Typography>
              </Box>
            </AvatarUploadBox>
          </Box>

          <StyledTextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            disabled={submitting}
            placeholder="Mô tả chi tiết về sự kiện"
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Loại sự kiện</InputLabel>
                <Select
                  value={eventForm.category}
                  label="Loại sự kiện"
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  disabled={submitting}
                  required
                >
                  <MenuItem value="CONFERENCE">Hội nghị</MenuItem>
                  <MenuItem value="SEMINAR">Hội thảo</MenuItem>
                  <MenuItem value="WORKSHOP">Workshop</MenuItem>
                  <MenuItem value="CONCERT">Hòa nhạc</MenuItem>
                  <MenuItem value="EXHIBITION">Triển lãm</MenuItem>
                  <MenuItem value="FESTIVAL">Lễ hội</MenuItem>
                  <MenuItem value="SPORTS">Thể thao</MenuItem>
                  <MenuItem value="CULTURAL">Văn hóa</MenuItem>
                  <MenuItem value="BUSINESS">Kinh doanh</MenuItem>
                  <MenuItem value="EDUCATION">Giáo dục</MenuItem>
                  <MenuItem value="CHARITY">Từ thiện</MenuItem>
                  <MenuItem value="NETWORKING">Giao lưu</MenuItem>
                  <MenuItem value="ENTERTAINMENT">Giải trí</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Loại phí</InputLabel>
                <Select
                  value={eventForm.feeType}
                  label="Loại phí"
                  onChange={(e) => setEventForm({ ...eventForm, feeType: e.target.value })}
                  disabled={submitting}
                  required
                >
                  <MenuItem value="FREE">Miễn phí</MenuItem>
                  <MenuItem value="PAID">Trả phí</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Quyền truy cập</InputLabel>
                <Select
                  value={eventForm.visibility}
                  label="Quyền truy cập"
                  onChange={(e) => setEventForm({ ...eventForm, visibility: e.target.value })}
                  disabled={submitting}
                  required
                >
                  <MenuItem value="PUBLIC">Công khai</MenuItem>
                  <MenuItem value="PRIVATE">Riêng tư</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kiểu truy cập</InputLabel>
                <Select
                  value={eventForm.accessType}
                  label="Kiểu truy cập"
                  onChange={(e) => setEventForm({ ...eventForm, accessType: e.target.value })}
                  disabled={submitting}
                  required
                >
                  <MenuItem value="OPEN">Mở</MenuItem>
                  <MenuItem value="INVITE_ONLY">Chỉ mời</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Thời gian bắt đầu"
                type="datetime-local"
                fullWidth
                required
                value={eventForm.startedAt || ""}
                onChange={(e) => setEventForm({ ...eventForm, startedAt: e.target.value })}
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
                helperText="Chọn ngày và giờ bắt đầu sự kiện"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Thời gian kết thúc"
                type="datetime-local"
                fullWidth
                required
                value={eventForm.endedAt || ""}
                onChange={(e) => setEventForm({ ...eventForm, endedAt: e.target.value })}
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
                helperText="Chọn ngày và giờ kết thúc sự kiện"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Nhóm trạng thái công việc</InputLabel>
                <Select
                  value={eventForm.groupTaskStateId}
                  label="Nhóm trạng thái công việc"
                  onChange={(e) => setEventForm({ ...eventForm, groupTaskStateId: e.target.value })}
                  disabled={submitting || loadingDropdowns}
                  required
                >
                  {groupTaskStates.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
                {loadingDropdowns && (
                  <FormHelperText>Đang tải dữ liệu...</FormHelperText>
                )}
                {!loadingDropdowns && groupTaskStates.length === 0 && (
                  <FormHelperText error>Không có dữ liệu</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Nhóm loại công việc</InputLabel>
                <Select
                  value={eventForm.groupTaskTypeId}
                  label="Nhóm loại công việc"
                  onChange={(e) => setEventForm({ ...eventForm, groupTaskTypeId: e.target.value })}
                  disabled={submitting || loadingDropdowns}
                  required
                >
                  {groupTaskTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {loadingDropdowns && (
                  <FormHelperText>Đang tải dữ liệu...</FormHelperText>
                )}
                {!loadingDropdowns && groupTaskTypes.length === 0 && (
                  <FormHelperText error>Không có dữ liệu</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Địa điểm</InputLabel>
                <Select
                  value={eventForm.locationId}
                  label="Địa điểm"
                  onChange={(e) => setEventForm({ ...eventForm, locationId: e.target.value })}
                  disabled={submitting || loadingDropdowns}
                  required
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                        width: 'auto',
                        minWidth: '400px',
                      },
                    },
                  }}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}{loc.address ? ` - ${loc.address}` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {loadingDropdowns && (
                  <FormHelperText>Đang tải địa điểm...</FormHelperText>
                )}
                {!loadingDropdowns && locations.length === 0 && (
                  <FormHelperText error>Không có địa điểm khả dụng</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Multiple Images Upload */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
              Hình ảnh sự kiện {uploadingImages && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </Typography>
            <ImageUploadBox>
              {/* Existing images */}
              {imagePreviews.map((preview, index) => (
                <ImagePreviewBox key={index}>
                  <ImagePreview src={preview} alt={`Preview ${index + 1}`} />
                  <RemoveImageButton
                    className="remove-button"
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    disabled={uploadingImages || submitting}
                  >
                    <DeleteIcon fontSize="small" />
                  </RemoveImageButton>
                </ImagePreviewBox>
              ))}
              
              {/* Upload button */}
              <UploadButton
                component="label"
                sx={{
                  opacity: uploadingImages ? 0.5 : 1,
                  cursor: uploadingImages ? 'not-allowed' : 'pointer',
                }}
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImagesUpload}
                  disabled={uploadingImages || submitting}
                />
                <AddPhotoAlternateIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  Thêm ảnh
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Tối đa 5MB
                </Typography>
              </UploadButton>
            </ImageUploadBox>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Có thể chọn nhiều ảnh cùng lúc. Kích thước tối đa 5MB/ảnh.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Button 
          onClick={handleClose} 
          disabled={submitting || uploadingImages || uploadingAvatar}
          startIcon={<CloseIcon />}
          sx={{ textTransform: 'none' }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || uploadingImages || uploadingAvatar}
          startIcon={submitting ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
          }}
        >
          {submitting ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EventDialog;
