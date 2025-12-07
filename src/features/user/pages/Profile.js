/**
 * Profile Page - Trang thông tin cá nhân của user
 * 
 * Hiển thị và cho phép chỉnh sửa:
 * - Thông tin cá nhân (tên, email, số điện thoại)
 * - Avatar
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
  Alert,
  Snackbar,
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
} from '@mui/icons-material';
import userApi from '../api/user.api';
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
  maxWidth: 600,
  margin: '0 auto',
}));

const AvatarSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

export default function Profile() {
  const theme = useTheme();
  const { id: enterpriseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Extract userId from token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[PROFILE] ❌ No token found');
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('[PROFILE] ❌ Invalid token format');
        return null;
      }
      
      // Add base64 padding if needed
      let payload = parts[1];
      switch (payload.length % 4) {
        case 0:
          break;
        case 2:
          payload += '==';
          break;
        case 3:
          payload += '=';
          break;
        default:
          console.log('[PROFILE] ❌ Invalid token padding');
          return null;
      }
      
      const decoded = JSON.parse(atob(payload));
      const userId = decoded?.sub || decoded?.userId || decoded?.id || decoded?.['user-id'];
      console.log('[PROFILE] ✅ Extracted userId from token:', userId);
      console.log('[PROFILE] Token payload:', decoded);
      return userId;
    } catch (err) {
      console.error('[PROFILE] ❌ Error extracting userId from token:', err);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      console.log('[PROFILE] 🔄 Starting fetchProfile...');
      setLoading(true);
      setError('');
      
      const userId = getUserIdFromToken();
      console.log('[PROFILE] userId:', userId, 'enterpriseId:', enterpriseId);
      
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Không thể xác định người dùng',
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      if (!enterpriseId) {
        setSnackbar({
          open: true,
          message: 'Không thể xác định doanh nghiệp',
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      console.log('[PROFILE] 🔐 Calling userApi.getUserById...');
      const response = await userApi.getUserById( userId);
      
      // Handle different response formats
      const profileData = response?.data?.data || response?.data || response;
      
      console.log('[PROFILE] ✅ User data fetched:', profileData);
      
      // API returns 'name' when GET, but we use 'fullName' internally
      const fullName = profileData.fullName || profileData.name || '';
      
      setProfile({
        fullName: fullName,
        email: profileData.email || '',
        phone: profileData.phone || '',
        avatar: profileData.avatar || '',
      });
      setFormData({
        fullName: fullName,
        email: profileData.email || '',
        phone: profileData.phone || '',
        avatar: profileData.avatar || '',
      });
      setAvatarPreview(profileData.avatar || null);
    } catch (err) {
      console.error('[PROFILE] ❌ Error fetching profile:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể tải thông tin profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data
  useEffect(() => {
    console.log('[PROFILE] useEffect triggered, enterpriseId:', enterpriseId);
    if (enterpriseId) {
      fetchProfile();
    }
  }, [enterpriseId]);

  // Handle avatar upload
  const handleAvatarChange = async (event) => {
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

    // Clear error
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Set file and upload
    setAvatarFile(file);
    setUploadingAvatar(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, avatar: uploadedUrl }));
        // Không hiển thị thông báo thành công
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải ảnh lên. Vui lòng thử lại.',
          severity: 'error',
        });
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.',
        severity: 'error',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...profile });
    if (profile.avatar) {
      setAvatarPreview(profile.avatar);
    } else {
      setAvatarPreview(null);
    }
    setAvatarFile(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...profile });
    setAvatarPreview(profile.avatar || null);
    setAvatarFile(null);
    setError('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setErrors({});
      
      // Validate
      const newErrors = {};
      
      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập tên';
      }
      
      // Validate phone if provided
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Số điện thoại không hợp lệ (ví dụ: 0901234567 hoặc +84901234567)';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSaving(false);
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Không thể xác định người dùng',
          severity: 'error',
        });
        setSaving(false);
        return;
      }

      // Update profile - only send name, phone, and avatar
      const updateData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone?.trim() || '',
        avatar: formData.avatar || '',
      };

      console.log('[PROFILE] Updating user - userId:', userId, 'enterpriseId:', enterpriseId, 'data:', updateData);
      await userApi.updateUser(enterpriseId, userId, updateData);
      
      // Update local state
      setProfile({ ...formData });
      setAvatarPreview(formData.avatar || null);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Cập nhật profile thành công!',
        severity: 'success',
      });
      
      // Refresh profile data to get latest from server
      await fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Không thể cập nhật profile',
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
      {/* Header */}
      <HeaderSection>
        <Title>Thông tin tài khoản</Title>
       
      </HeaderSection>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

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
        sx={{
          '& .MuiSnackbar-root': {
            animation: 'slideInRight 0.3s ease-out',
          },
          '@keyframes slideInRight': {
            '0%': {
              transform: 'translateX(400px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateX(0)',
              opacity: 1,
            },
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

      {/* Profile Form Card */}
      <FormCard>
        <CardContent>
          {/* Avatar Section */}
          <AvatarSection>
            <StyledAvatar
              src={avatarPreview || profile.avatar}
              alt={profile.fullName}
            >
              {!avatarPreview && !profile.avatar && 'A'}
            </StyledAvatar>
            <Typography sx={{ textAlign: 'center', fontWeight: 500 }}>
              {isEditing ? 'Ảnh đại diện' : 'Ảnh đại diện'}
            </Typography>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Đang tải...' : 'Tải ảnh'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
              </Box>
            )}
          </AvatarSection>

          {/* Form Content */}
          <Box sx={{ padding: 3 }}>
            {/* Name Field */}
            <FormRow>
              <FormLabel>Họ và tên *</FormLabel>
              <TextField
                name="fullName"
                value={isEditing ? formData.fullName : profile.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                required
                error={!!errors.fullName}
                helperText={errors.fullName}
              />
            </FormRow>

            {/* Email Field - Read Only */}
            <FormRow>
              <FormLabel>Email</FormLabel>
              <TextField
                value={profile.email}
                disabled
                fullWidth
                size="small"
                variant="standard"
              />
            </FormRow>

            {/* Phone Field */}
            <FormRow>
              <FormLabel>Số điện thoại</FormLabel>
              <TextField
                name="phone"
                value={isEditing ? formData.phone : profile.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                size="small"
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Nhập số điện thoại..."
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </FormRow>
          </Box>

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

