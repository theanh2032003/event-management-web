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
import { useSnackbar } from "notistack";
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
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  border: "2px dashed",
  borderColor: alpha(theme.palette.primary.main, 0.3),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  "&:active": {
    transform: "translateY(0)",
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
  const { enqueueSnackbar } = useSnackbar();
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
  }, [open, product, rfq, isEditMode]);

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
        enqueueSnackbar(`File ${file.name} vượt quá 5MB`, { variant: "warning" });
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
      console.log("[RFQ SUBMIT] ===== START SUBMIT =====");
      console.log("[RFQ SUBMIT] Edit mode:", isEditMode);

      // Validate form first
      if (!validateForm()) {
        console.warn("[RFQ SUBMIT] ⚠️ Form validation failed");
        enqueueSnackbar("Vui lòng điền đầy đủ thông tin bắt buộc", { variant: "warning" });
        return;
      }

      if (isEditMode) {
        // Edit mode
        if (!rfq || !rfq.id) {
          console.error("[RFQ SUBMIT] ❌ RFQ or rfq.id is missing!");
          enqueueSnackbar("Dữ liệu RFQ không hợp lệ", { variant: "error" });
          return;
        }

        setLoading(true);
        console.log("[RFQ SUBMIT] ✅ Starting edit process...");

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
        enqueueSnackbar("✅ Cập nhật yêu cầu báo giá thành công!", { variant: "success" });
        
        // Call onSave callback if provided
        if (onSave) {
          onSave(updateData);
        }

        console.log("[RFQ SUBMIT] ===== EDIT COMPLETED =====");
      } else {
        // Create mode
        if (!product || !product.id) {
          console.error("[RFQ SUBMIT] ❌ Product or product.id is missing!");
          enqueueSnackbar("Sản phẩm không hợp lệ", { variant: "error" });
          return;
        }

        setLoading(true);
        console.log("[RFQ SUBMIT] ✅ All validations passed, starting upload process...");

        // Prepare files
        let uploadedFileUrls = [];
        if (formData.files && formData.files.length > 0) {
          try {
            console.log(`[RFQ SUBMIT] Processing ${formData.files.length} files...`);
            uploadedFileUrls = formData.files.map((file) => {
              const url = URL.createObjectURL(file);
              console.log(`[RFQ SUBMIT] File: ${file.name}, URL: ${url}`);
              return url;
            });
          } catch (fileError) {
            console.error("[RFQ SUBMIT] ❌ Error processing files:", fileError);
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
        
        enqueueSnackbar("✅ Yêu cầu báo giá được tạo thành công!", { variant: "success" });

        console.log("[RFQ SUBMIT] ===== SUBMIT COMPLETED =====");
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
      console.error("[RFQ SUBMIT] ❌ ===== ERROR =====");
      console.error("[RFQ SUBMIT] Error object:", error);
      console.error("[RFQ SUBMIT] Error status:", error?.response?.status);
      console.error("[RFQ SUBMIT] Error data:", error?.response?.data);
      console.error("[RFQ SUBMIT] Error message:", error?.message);

      const errorMsg = isEditMode 
        ? error?.response?.data?.message || error?.message || "Lỗi khi cập nhật yêu cầu báo giá"
        : error?.response?.data?.message || error?.message || "Lỗi khi tạo yêu cầu báo giá";
      enqueueSnackbar(`❌ ${errorMsg}`, { variant: "error" });
    } finally {
      setLoading(false);
      console.log("[RFQ SUBMIT] Loading finished");
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
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isEditMode ? "Sửa Yêu Cầu Báo Giá" : "Tạo Yêu Cầu Báo Giá (RFQ)"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chia sẻ nhu cầu của bạn để nhà cung cấp phản hồi nhanh chóng
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
        }}
      >
        <Stack spacing={3}>
          {/* Product Info */}
          {product && (
            <SectionCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <DescriptionIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Sản phẩm
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography
                  variant="h6"
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  }}
                >
                  {product.price
                    ? `${product.price.toLocaleString("vi-VN")}₫`
                    : "N/A"}
                </Typography>
                {product.unit && (
                  <Typography variant="body2" color="text.secondary">
                    / {product.unit}
                  </Typography>
                )}
              </Box>
            </SectionCard>
          )}

          {/* RFQ Name */}
          <SectionCard elevation={0}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <StyledTextField
                  label="Tên yêu cầu *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="VD: Yêu cầu báo giá - Tháng 11"
                  helperText={errors.name || "Mô tả ngắn gọn cho yêu cầu này"}
                  error={!!errors.name}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <EventNoteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </Box>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label="Ngày hết hạn *"
                  name="expiredAt"
                  type="date"
                  value={formData.expiredAt}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText={
                    errors.expiredAt ||
                    "Nhà cung cấp phải báo giá trước ngày này"
                  }
                  error={!!errors.expiredAt}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </Box>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledFormControl
                  fullWidth
                  size="small"
                  error={!!errors.projectId}
                >
                  <InputLabel>Chọn Dự Án / Sự Kiện *</InputLabel>
                  <Select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    label="Chọn Dự Án / Sự Kiện *"
                    disabled={projectsLoading}
                  >
                    <MenuItem value="">
                      <em>-- Chọn dự án --</em>
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
                </StyledFormControl>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Notes */}
          <SectionCard elevation={0}>
            <StyledTextField
              label="Ghi chú / Yêu cầu đặc biệt"
              name="note"
              value={formData.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              size="small"
              placeholder="Nhập bất kỳ yêu cầu hoặc thông tin đặc biệt..."
            />
          </SectionCard>

          {/* File Upload */}
          <SectionCard elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AttachFileIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tải lên tệp đính kèm
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
              <CloudUploadIcon sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Kéo thả tệp hoặc click để chọn
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 5MB/file)
              </Typography>
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
          </SectionCard>
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
