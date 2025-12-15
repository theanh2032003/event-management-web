import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Chip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  DialogTitle,
  styled,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AttachFile as AttachFileIcon,
  EventNote as EventNoteIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useToast } from '../../../app/providers/ToastContext';
import rfqApi from "../../rfq/api/rfq.api";
import projectApi from "../../project/api/project.api";

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const UploadArea = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 80,
  height: 80,
  border: "2px solid",
  borderColor: alpha(theme.palette.primary.main, 0.5),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  cursor: "pointer",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    borderColor: theme.palette.primary.main,
    transform: "scale(1.05)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  "&:active": {
    transform: "scale(1)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.8),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 3),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

/**
 * Quote Request Modal
 * Modal để tạo RFQ (Request for Quotation) hoặc sửa RFQ hiện có
 */
export default function QuoteRequestModal({ open, onClose, product, rfq, enterpriseId, onSave }) {
  const { showToast } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const isEditMode = !!rfq; // Nếu có rfq props = mode sửa

  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    note: "",
    expiredAt: "",
    projectId: "",
    files: [],
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      if (isEditMode && rfq) {
        // Edit mode: populate with existing rfq data
        setFormData({
          name: rfq.name || "",
          quantity: rfq.quantity || 1,
          note: rfq.note || "",
          expiredAt: rfq.expiredAt ? rfq.expiredAt.split("T")[0] : "",
          projectId: rfq.projectId || "",
          files: rfq.files || [],
        });
      } else {
        // Create mode: populate with product name
        setFormData({
          name: product?.name || "",
          quantity: 1,
          note: "",
          expiredAt: "",
          projectId: "",
          files: [],
        });
      }
      
      // Load projects
      loadProjects();
    }
  }, [open, product, rfq, isEditMode, showToast]);

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await projectApi.getProjectsByEnterprise();
      const projectsList = response?.data || response || [];
      setProjects(Array.isArray(projectsList) ? projectsList : []);
    } catch (error) {
      setProjects([]);
      // Don't show error snackbar for projects loading
    } finally {
      setProjectsLoading(false);
    }
  };

  // Validation state
  const [errors, setErrors] = React.useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Tên yêu cầu là bắt buộc";
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }
    if (!formData.expiredAt) {
      newErrors.expiredAt = "Ngày hết hạn là bắt buộc";
    }
    if (!formData.projectId) {
      newErrors.projectId = "Vui lòng chọn dự án";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        showToast(`⚠️ File ${file.name} vượt quá 5MB`, 'error', 3000);
        return false;
      }
      return true;
    });

    // Add to files list
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));

    // Reset input
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error', 3000);
        return;
      }

      if (isEditMode) {
        // Edit mode
        if (!rfq || !rfq.id) {
          showToast('Dữ liệu RFQ không hợp lệ', 'error', 3000);
          return;
        }

        setLoading(true);

        const updateData = {
          name: formData.name.trim(),
          productId: rfq.productId,
          projectId: parseInt(formData.projectId),
          quantity: parseInt(formData.quantity),
          note: formData.note && formData.note.trim() ? formData.note.trim() : "",
          files: formData.files,
          expiredAt: new Date(formData.expiredAt).toISOString(),
        };

        await rfqApi.updateRfq(rfq.id, updateData);
        showToast('Cập nhật yêu cầu báo giá thành công!', 'success', 3000);
        
        // Call onSave callback if provided
        if (onSave) {
          onSave(updateData);
        }
      } else {
        // Create mode
        if (!product || !product.id) {
          showToast('Sản phẩm không hợp lệ', 'error', 3000);
          return;
        }

        setLoading(true);

        // Prepare files
        let uploadedFileUrls = [];
        if (formData.files && formData.files.length > 0) {
          try {
            uploadedFileUrls = formData.files.map((file) => {
              const url = URL.createObjectURL(file);
              return url;
            });
          } catch (fileError) {
            // Continue - files are optional
          }
        }

        // Build RFQ data
        const rfqData = {
          name: formData.name.trim(),
          productId: parseInt(product.id),
          quantity: parseInt(formData.quantity),
          note: formData.note && formData.note.trim() ? formData.note.trim() : "",
          projectId: parseInt(formData.projectId),
          files: uploadedFileUrls,
          expiredAt: new Date(formData.expiredAt).toISOString(),
        };

        // Call API with projectId
        const response = await rfqApi.createRfq(rfqData);
        
        showToast('Yêu cầu báo giá được tạo thành công!', 'success', 3000);
      }

      // Reset form
      setFormData({
        name: product?.name || "",
        quantity: 1,
        note: "",
        expiredAt: "",
        projectId: "",
        files: [],
      });
      setErrors({});

      // Close modal
      onClose();
    } catch (error) {
      const errorMsg = isEditMode 
        ? error?.response?.data?.message || error?.message || "Lỗi khi cập nhật yêu cầu báo giá"
        : error?.response?.data?.message || error?.message || "Lỗi khi tạo yêu cầu báo giá";
      showToast(`❌ ${errorMsg}`, 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: theme.spacing(3),
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          pr: 2,
          pt: 3,
          pb: 2,
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              mb: 0.5,
              background: `${theme.palette.primary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            {isEditMode ? "Sửa Yêu Cầu Báo Giá" : "Tạo Yêu Cầu Báo Giá"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
        }}
      >
        <Stack spacing={3} sx={{mt: 2}}>

          {/* RFQ Name */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} sx={{width: '100%'}}>
                <TextField
                  label="Tên yêu cầu *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="VD: Yêu cầu báo giá - Tháng 11"
                  error={!!errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{width: '100%'}}>
                <StyledTextField
                  label="Số lượng *"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: 1, step: 1 }}
                  fullWidth
                  size="small"
                  helperText={errors.quantity || ""}
                  error={!!errors.quantity}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{width: '100%'}}>
                <TextField
                  label="Ngày hết hạn *"
                  name="expiredAt"
                  type="date"
                  value={formData.expiredAt}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.expiredAt}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{width: '100%'}}>
                <FormControl
                  fullWidth
                  size="small"
                  error={!!errors.projectId}
                >
                  <InputLabel>Chọn Sự Kiện *</InputLabel>
                  <Select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    onOpen={loadProjects}
                    label="Chọn Sự Kiện *"
                    disabled={projectsLoading}
                  >
                    <MenuItem value="">
                      <em>-- Chọn sự kiện --</em>
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.projectId && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "error.main",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {errors.projectId}
                    </Typography>
                  )}
                  {projectsLoading && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      Đang tải danh sách dự án...
                    </Typography>
                  )}
                  {!projectsLoading && projects.length === 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "warning.main",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      Không có dự án nào. Vui lòng tạo dự án trước.
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

          {/* Notes */}
            <TextField
              label="Ghi chú"
              name="note"
              value={formData.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              size="small"
              placeholder="Nhập ghi chú..."
            />

          {/* File Upload */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tệp đính kèm
              </Typography>
            </Box>
            
            <UploadArea component="label">
              <input
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt"
              />
              <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </UploadArea>

            {/* File List */}
            {formData.files && formData.files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Các tệp đã chọn ({formData.files.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.files.map((file, index) => (
                    <Chip
                      key={`${file.name}-${index}`}
                      label={`${file.name} (${(file.size / 1024).toFixed(1)}KB)`}
                      onDelete={() => handleRemoveFile(index)}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
        </Stack>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          gap: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <StyledButton 
          onClick={onClose} 
          disabled={loading} 
          variant="outlined"
          sx={{
            borderColor: alpha(theme.palette.divider, 0.3),
            color: 'text.primary',
            '&:hover': {
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              backgroundColor: alpha(theme.palette.error.main, 0.05),
            },
          }}
        >
          Hủy
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          {loading ? "Đang xử lý..." : (isEditMode ? "Lưu" : "Gửi Yêu Cầu")}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
}
