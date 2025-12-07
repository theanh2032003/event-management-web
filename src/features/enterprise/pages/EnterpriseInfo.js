/**
 * Enterprise Info Page - Thông tin doanh nghiệp
 * 
 * Chỉ owner mới có quyền truy cập
 * Hiển thị và cho phép chỉnh sửa:
 * - Tên doanh nghiệp
 * - Email doanh nghiệp
 * - Số điện thoại
 * - Địa chỉ
 * - Logo
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
  Lock as LockIcon,
} from '@mui/icons-material';
import enterpriseApi from '../api/enterprise.api';
import { uploadToCloudinary } from '../../../shared/utils/uploadToCloudinary';
import useEnterpriseUserPermissions from '../../permission/hooks/useEnterpriseUserPermissions';
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
}));

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
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

const LockedOverlay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(6),
  textAlign: 'center',
}));

export default function EnterpriseInfo() {
  const theme = useTheme();
  const { id: enterpriseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [errors, setErrors] = useState({});

  const [enterpriseData, setEnterpriseData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    description: '',
    fanpage: '',
    website: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    description: '',
    fanpage: '',
    website: '',
  });

  // Check permissions
  const { isOwner, loading: permLoading } = useEnterpriseUserPermissions();

  const fetchEnterpriseInfo = async () => {
    try {
      setLoading(true);

      const response = await enterpriseApi.getEnterpriseById(enterpriseId);
      const data = response?.data?.data || response?.data || response;

      setEnterpriseData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        logo: data.avatar || '',
        description: data.description || '',
        fanpage: data.fanpage || '',
        website: data.website || '',
      });

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        logo: data.avatar || '',
        description: data.description || '',
        fanpage: data.fanpage || '',
        website: data.website || '',
      });

      setLogoPreview(data.avatar || null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải thông tin doanh nghiệp',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    if (enterpriseId && !permLoading && isOwner) {
      fetchEnterpriseInfo();
    } else if (enterpriseId && !permLoading && !isOwner) {
      setLoading(false);
    }
  }, [enterpriseId, permLoading, isOwner]);

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

    setLogoFile(file);
    setUploadingLogo(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, logo: uploadedUrl }));
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải logo lên. Vui lòng thử lại.',
          severity: 'error',
        });
        setLogoFile(null);
        setLogoPreview(null);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải logo lên. Vui lòng thử lại.',
        severity: 'error',
      });
      setLogoFile(null);
      setLogoPreview(null);
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
    setFormData({ ...enterpriseData });
    if (enterpriseData.logo) {
      setLogoPreview(enterpriseData.logo);
    } else {
      setLogoPreview(null);
    }
    setLogoFile(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...enterpriseData });
    setLogoPreview(enterpriseData.logo || null);
    setLogoFile(null);
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
        newErrors.name = 'Vui lòng nhập tên doanh nghiệp';
      }

      if (!formData.email || !formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email doanh nghiệp';
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
        setSaving(false);
        return;
      }

      // Update enterprise
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        avatar: formData.logo || '',
        description: formData.description?.trim() || '',
        fanpage: formData.fanpage?.trim() || '',
        website: formData.website?.trim() || '',
      };

      await enterpriseApi.updateEnterprise(enterpriseId, updateData);

      setEnterpriseData({ ...formData });
      setLogoPreview(formData.logo || null);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin doanh nghiệp thành công!',
        severity: 'success',
      });

      // Refresh data
      await fetchEnterpriseInfo();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể cập nhật thông tin doanh nghiệp',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || permLoading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // Check if user is owner - AFTER loading is complete
  if (!isOwner) {
    return (
      <PageContainer maxWidth="sm">
        <FormCard>
          <CardContent>
            <LockedOverlay>
              <LockIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.warning.main,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Truy cập bị từ chối
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Bạn không có quyền xem thông tin doanh nghiệp. Chỉ có chủ sở hữu mới có thể truy cập.
              </Typography>
            </LockedOverlay>
          </CardContent>
        </FormCard>
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

      {/* Enterprise Form Card */}
      <FormCard>
        <CardContent>
          {/* Logo Section */}
          <LogoSection>
            <AvatarWrapper>
              <StyledAvatar
                src={logoPreview || enterpriseData.logo}
                alt={enterpriseData.name}
              >
                {!logoPreview && !enterpriseData.logo && enterpriseData.name?.charAt(0) || 'E'}
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
              Logo doanh nghiệp
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
              <FormLabel>Tên doanh nghiệp *</FormLabel>
              <TextField
                name="name"
                value={isEditing ? formData.name : enterpriseData.name}
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
              <FormLabel>Email doanh nghiệp *</FormLabel>
              <TextField
                name="email"
                value={isEditing ? formData.email : enterpriseData.email}
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
                value={isEditing ? formData.phone : enterpriseData.phone}
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

            {/* Address Field */}
            <FullWidthField>
              <FormLabel>Địa chỉ</FormLabel>
              <TextField
                name="address"
                value={isEditing ? formData.address : enterpriseData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={2}
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Nhập địa chỉ doanh nghiệp..."
              />
            </FullWidthField>

            {/* Description Field */}
            <FullWidthField>
              <FormLabel>Mô tả</FormLabel>
              <TextField
                name="description"
                value={isEditing ? formData.description : enterpriseData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={2}
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Nhập mô tả doanh nghiệp..."
              />
            </FullWidthField>

            {/* Fanpage Field */}
            <FormField>
              <FormLabel>Facebook Fanpage</FormLabel>
              <TextField
                name="fanpage"
                value={isEditing ? formData.fanpage : enterpriseData.fanpage}
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
                value={isEditing ? formData.website : enterpriseData.website}
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
                variant="contained"
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
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </>
            )}
          </ButtonGroup>
        </CardContent>
      </FormCard>
    </PageContainer>
  );
}
