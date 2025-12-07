/**
 * Supplier Info Page - Thông tin nhà cung cấp
 * 
 * Hiển thị và cho phép chỉnh sửa:
 * - Tên nhà cung cấp
 * - Email
 * - Số điện thoại
 * - Mã số thuế
 * - Mô tả
 * - Logo
 * - Fanpage
 * - Website
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  styled,
  alpha,
  Container,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import supplierApi from '../api/supplier.api';
import { uploadToCloudinary } from '../../../shared/utils/uploadToCloudinary';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(5),
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1rem',
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  maxWidth: 900,
  margin: '0 auto',
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  '&:hover .upload-overlay': {
    opacity: 1,
  },
}));

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: '50%',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  '& svg': {
    color: 'white',
    fontSize: '2.5rem',
  },
}));

const FormContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const FormField = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
}));

const FullWidthField = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  gridColumn: '1 / -1',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  fontSize: '3rem',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const FormLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.85rem',
  color: theme.palette.text.primary,
  marginBottom: '0.25rem',
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.action.disabledText,
  },
}));

export default function SupplierInfo() {
  const theme = useTheme();
  const { id: supplierId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [errors, setErrors] = useState({});

  const [supplierData, setSupplierData] = useState({
    name: '',
    email: '',
    phone: '',
    taxCode: '',
    description: '',
    avatar: '',
    fanpage: '',
    website: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    taxCode: '',
    description: '',
    avatar: '',
    fanpage: '',
    website: '',
  });

  const fetchSupplierInfo = async () => {
    try {
      console.log('[SUPPLIER_INFO] 🔄 Fetching supplier info...');
      setLoading(true);

      const response = await supplierApi.getSupplierById(supplierId);
      const data = response?.data?.data || response?.data || response;

      console.log('[SUPPLIER_INFO] ✅ Supplier data fetched:', data);

      setSupplierData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        taxCode: data.taxCode || '',
        description: data.description || '',
        avatar: data.avatar || '',
        fanpage: data.fanpage || '',
        website: data.website || '',
      });

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        taxCode: data.taxCode || '',
        description: data.description || '',
        avatar: data.avatar || '',
        fanpage: data.fanpage || '',
        website: data.website || '',
      });

      setLogoPreview(data.avatar || null);
    } catch (err) {
      console.error('[SUPPLIER_INFO] ❌ Error fetching supplier info:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải thông tin nhà cung cấp',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchSupplierInfo();
    }
  }, [supplierId]);

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn file ảnh',
        severity: 'warning',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Kích thước ảnh không được vượt quá 5MB',
        severity: 'warning',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingLogo(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, avatar: uploadedUrl }));
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải logo lên. Vui lòng thử lại.',
          severity: 'error',
        });
        setLogoPreview(supplierData.avatar || null);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải logo lên. Vui lòng thử lại.',
        severity: 'error',
      });
      setLogoPreview(supplierData.avatar || null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...supplierData });
    setLogoPreview(supplierData.avatar || null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...supplierData });
    setLogoPreview(supplierData.avatar || null);
    setErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrors({});

      // Validate
      const newErrors = {};

      if (!formData.name || !formData.name.trim()) {
        newErrors.name = 'Vui lòng nhập tên nhà cung cấp';
      }

      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Email không hợp lệ';
        }
      }

      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Số điện thoại không hợp lệ';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSnackbar({
          open: true,
          message: 'Vui lòng kiểm tra lại thông tin nhập vào',
          severity: 'warning',
        });
        setSaving(false);
        return;
      }

      // Update supplier
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        taxCode: formData.taxCode?.trim() || '',
        description: formData.description?.trim() || '',
        avatar: formData.avatar || '',
        fanpage: formData.fanpage?.trim() || '',
        website: formData.website?.trim() || '',
      };

      console.log('[SUPPLIER_INFO] Updating supplier:', updateData);
      await supplierApi.updateSupplier(supplierId, updateData);

      setSupplierData({ ...formData });
      setLogoPreview(formData.avatar || null);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin nhà cung cấp thành công!',
        severity: 'success',
      });

      // Refresh data
      await fetchSupplierInfo();
    } catch (err) {
      console.error('[SUPPLIER_INFO] ❌ Error updating supplier:', err);
      
      // Handle specific error cases
      let errorMessage = 'Không thể cập nhật thông tin nhà cung cấp';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for validation errors
        if (errorData.taxCode) {
          errorMessage = errorData.taxCode;
          setErrors({ taxCode: errorData.taxCode });
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="sm">
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionProps={{
          timeout: {
            enter: 300,
            exit: 300,
          },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            minWidth: 320,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Supplier Form Card */}
      <FormCard>
        <CardContent>
          {/* Logo Section */}
          <LogoSection>
            <AvatarWrapper>
              <StyledAvatar
                src={logoPreview || supplierData.avatar}
                alt={supplierData.name}
              >
                {!logoPreview && !supplierData.avatar && (supplierData.name?.charAt(0) || 'S')}
              </StyledAvatar>
              {isEditing && (
                <UploadOverlay className="upload-overlay" component="label" sx={{ cursor: 'pointer' }}>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploadingLogo}
                  />
                  <CloudUploadIcon />
                </UploadOverlay>
              )}
            </AvatarWrapper>
            <Typography sx={{ textAlign: 'center', fontWeight: 500 }}>
              Logo nhà cung cấp
            </Typography>
            {uploadingLogo && (
              <Typography variant="caption" sx={{ color: 'info.main' }}>
                Đang tải...
              </Typography>
            )}
          </LogoSection>

          {/* Form Content */}
          <FormContent>
            {/* Name Field */}
            <FormField>
              <FormLabel>Tên nhà cung cấp *</FormLabel>
              <TextField
                name="name"
                value={isEditing ? formData.name : supplierData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </FormField>

            {/* Email Field */}
            <FormField>
              <FormLabel>Email *</FormLabel>
              <TextField
                name="email"
                value={isEditing ? formData.email : supplierData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                required
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormField>

            {/* Phone Field */}
            <FormField>
              <FormLabel>Số điện thoại</FormLabel>
              <TextField
                name="phone"
                value={isEditing ? formData.phone : supplierData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Nhập số điện thoại..."
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </FormField>

            {/* Tax Code Field */}
            <FormField>
              <FormLabel>Mã số thuế</FormLabel>
              <TextField
                name="taxCode"
                value={isEditing ? formData.taxCode : supplierData.taxCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Nhập mã số thuế..."
                error={!!errors.taxCode}
                helperText={errors.taxCode}
              />
            </FormField>

            {/* Description Field */}
            <FullWidthField>
              <FormLabel>Mô tả</FormLabel>
              <TextField
                name="description"
                value={isEditing ? formData.description : supplierData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={3}
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Nhập mô tả về nhà cung cấp..."
              />
            </FullWidthField>

            {/* Fanpage Field */}
            <FormField>
              <FormLabel>Facebook Fanpage</FormLabel>
              <TextField
                name="fanpage"
                value={isEditing ? formData.fanpage : supplierData.fanpage}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="https://facebook.com/..."
              />
            </FormField>

            {/* Website Field */}
            <FormField>
              <FormLabel>Website</FormLabel>
              <TextField
                name="website"
                value={isEditing ? formData.website : supplierData.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="https://example.com"
              />
            </FormField>
          </FormContent>

          {/* Action Buttons */}
          <ButtonGroup>
            {!isEditing ? (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Hủy
                </Button>
                <GradientButton
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </GradientButton>
              </>
            )}
          </ButtonGroup>
        </CardContent>
      </FormCard>
    </PageContainer>
  );
}

