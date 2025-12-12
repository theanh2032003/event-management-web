/**
 * EditProduct - Chỉnh sửa sản phẩm/dịch vụ
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  styled,
  alpha,
  useTheme,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Storefront as StorefrontIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import productApi from '../api/product.api';
import categoryApi from '../api/category.api';
import locationApi from '../../location/api/location.api';
import { uploadToCloudinary } from '../../../shared/utils/uploadToCloudinary';

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha('#ff6b9d', 0.06)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
}));

const IconBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #ff6b9d 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const TitleBox = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const PreviewCard = styled(StyledCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha('#ff6b9d', 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const ImageUploadButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #ff6b9d 100%)`,
  color: 'white',
  fontWeight: 600,
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #ff4d8a 100%)`,
    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    boxShadow: 'none',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.25, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #ff6b9d 100%)`,
  color: 'white',
  fontWeight: 600,
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #ff4d8a 100%)`,
    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    boxShadow: 'none',
  },
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '& img': {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
}));

export default function EditProduct() {
  const theme = useTheme();
  const { id: supplierId, productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    categoryId: '',
    price: '',
    unit: '',
    images: [],
    locationId: '',
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await categoryApi.getCategories();
        // axiosClient đã return response.data
        const categoriesData = Array.isArray(categoriesResponse) 
          ? categoriesResponse 
          : (Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []);
        setCategories(categoriesData);

        // Fetch product
        const productResponse = await productApi.getProductById(productId);
        // axiosClient đã return response.data, nên productResponse là product object trực tiếp
        const product = productResponse;
        
        if (product) {
          setFormData({
            name: product.name || '',
            code: product.code || '',
            description: product.description || '',
            categoryId: product.categoryId || product.category?.id || '',
            price: product.price || '',
            unit: product.unit || '',
            images: product.images || [],
            locationId: product.locationId || '',
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Không thể tải thông tin sản phẩm',
          severity: 'error',
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Fetch locations when category ID = 3 is selected
  useEffect(() => {
    const fetchLocations = async () => {
      if (!supplierId) return;
      
      try {
        const response = await locationApi.getSupplierLocationsSimple(supplierId);
        const data = response?.content || response?.data || response || [];
        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải danh sách địa điểm',
          severity: 'warning',
        });
      }
    };

    // Chỉ fetch locations khi category ID = 3
    if (formData.categoryId === 3 || formData.categoryId === '3') {
      fetchLocations();
    } else {
      setLocations([]);
    }
  }, [supplierId, formData.categoryId]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleLocationChange = async (event) => {
    const locationId = event.target.value;
    
    if (!locationId) {
      // Khi bỏ chọn location, xóa các trường liên quan
      setFormData({ 
        ...formData, 
        locationId: '',
        name: '',
        price: '',
        unit: '',
        description: '',
        images: [],
      });
      return;
    }

    try {
      // Call API to get full location details
      const response = await locationApi.getLocationById(locationId);
      const locationDetail = response?.data || response;
      
      if (locationDetail) {
        // Auto-fill form with location data from API
        const capacity = locationDetail.capacity || '';
        const address = locationDetail.address || '';
        const description = `Địa chỉ: ${address}${capacity ? ` - Sức chứa: ${capacity} người` : ''}`;
        
        // Xử lý hình ảnh từ location - thay thế hoàn toàn hình cũ
        let locationImages = [];
        if (locationDetail.images && Array.isArray(locationDetail.images) && locationDetail.images.length > 0) {
          locationImages = locationDetail.images;
        } else if (locationDetail.image) {
          locationImages = [locationDetail.image];
        }
        
        // Thay thế hoàn toàn form data với dữ liệu từ location mới
        setFormData({
          ...formData,
          locationId,
          name: locationDetail.name || '',
          price: locationDetail.pricePerHour || '',
          unit: 'giờ',
          description,
          images: locationImages, // Thay thế hoàn toàn, không giữ ảnh cũ
        });
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin địa điểm',
        severity: 'error',
      });
      // Still set the locationId even if fetch fails
      setFormData({ ...formData, locationId });
    }
    
    if (errors.locationId) {
      setErrors({ ...errors, locationId: '' });
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      setSnackbar({
        open: true,
        message: 'Chỉ được upload tối đa 5 hình ảnh',
        severity: 'warning',
      });
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      
      setFormData({
        ...formData,
        images: [...formData.images, ...validUrls],
      });

      if (validUrls.length < files.length) {
        setSnackbar({
          open: true,
          message: `Đã upload ${validUrls.length}/${files.length} hình ảnh`,
          severity: 'warning',
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi khi upload hình ảnh',
        severity: 'error',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.categoryId) newErrors.categoryId = 'Danh mục là bắt buộc';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        description: formData.description.trim() || null,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        unit: formData.unit.trim() || null,
        images: formData.images.length > 0 ? formData.images : [],
      };

      await productApi.updateProduct(productId, productData);
      
      setSnackbar({
        open: true,
        message: 'Cập nhật sản phẩm thành công!',
        severity: 'success',
      });

      // Redirect after success
      setTimeout(() => {
        navigate(`/supplier/${supplierId}/marketplace`);
      }, 1000);
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể cập nhật sản phẩm',
        severity: 'error',
      });
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/supplier/${supplierId}/marketplace`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HeaderBox>
        <IconBox>
          <StorefrontIcon sx={{ fontSize: 32, color: 'white' }} />
        </IconBox>
        <TitleBox>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, #ff6b9d)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Chỉnh sửa sản phẩm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cập nhật thông tin sản phẩm/dịch vụ
          </Typography>
        </TitleBox>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          disabled={submitting}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: theme.spacing(1.5),
          }}
        >
          Quay lại
        </Button>
      </HeaderBox>

      <Grid container spacing={3}>
        {/* Preview Section - Left Side */}
        <Grid item xs={12} md={4} order={{ xs: 2, md: 1 }}>
          <PreviewCard sx={{ position: 'sticky', top: 24 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                fontWeight={700}
                sx={{
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, #ff6b9d)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Xem trước
              </Typography>
              {formData.images.length > 0 ? (
                <Box
                  sx={{
                    width: '100%',
                    height: 320,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    mb: 2.5,
                    bgcolor: 'grey.100',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    position: 'relative',
                  }}
                >
                  <img
                    src={formData.images[0]}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 320,
                    borderRadius: 2.5,
                    mb: 2.5,
                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha('#ff6b9d', 0.02)} 100%)`,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <StorefrontIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Chưa có hình ảnh
                  </Typography>
                </Box>
              )}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                {formData.name || 'Tên sản phẩm'}
              </Typography>
              {formData.code && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    mb: 1,
                    fontFamily: 'monospace',
                    backgroundColor: alpha(theme.palette.grey[200], 0.5),
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    width: 'fit-content',
                  }}
                >
                  Mã: {formData.code}
                </Typography>
              )}
              {formData.categoryId && (
                <Chip
                  label={categories.find(c => (c.id || c._id) === formData.categoryId)?.name || 'Danh mục'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2, display: 'block', width: 'fit-content' }}
                />
              )}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  my: 2,
                  minHeight: 60,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {formData.description || 'Mô tả sản phẩm...'}
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha('#ff6b9d', 0.1)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                  Giá bán
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, #ff6b9d)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {formData.price
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      }).format(parseFloat(formData.price))
                    : '0 VNĐ'}
                  {formData.unit && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                      / {formData.unit}
                    </Typography>
                  )}
                </Typography>
              </Box>
            </CardContent>
          </PreviewCard>
        </Grid>

        {/* Form Section - Right Side */}
        <Grid item xs={12} md={8} order={{ xs: 1, md: 2 }}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ maxWidth: 700, ml: 'auto' }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      size="small"
                      label="Tên sản phẩm/Dịch vụ"
                      value={formData.name}
                      onChange={handleChange('name')}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                      disabled={submitting}
                    />
                  </Grid>

                 

                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth size="small" required error={!!errors.categoryId} disabled={submitting}>
                      <InputLabel>Danh mục</InputLabel>
                      <Select
                        value={formData.categoryId}
                        onChange={handleChange('categoryId')}
                        label="Danh mục"
                      >
                        <MenuItem value="">
                          <em>Chọn danh mục</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id || category._id} value={category.id || category._id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.categoryId}
                        </Typography>
                      )}
                    </StyledFormControl>
                  </Grid>

                  {/* Location dropdown - chỉ hiển thị khi category ID = 3 */}
                  {(formData.categoryId === 3 || formData.categoryId === '3') && (
                    <Grid item xs={12} sm={6}>
                      <StyledFormControl fullWidth size="small" error={!!errors.locationId} disabled={submitting}>
                        <InputLabel>Chọn địa điểm</InputLabel>
                        <Select
                          value={formData.locationId}
                          onChange={handleLocationChange}
                          label="Chọn địa điểm"
                          sx={{
                            minWidth: 140,
                          }}
                        >
                          <MenuItem value="">
                            <em>-- Chọn địa điểm --</em>
                          </MenuItem>
                          {locations.map((location) => (
                            <MenuItem key={location.id || location._id} value={location.id || location._id}>
                              {location.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.locationId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.locationId}
                          </Typography>
                        )}
                      </StyledFormControl>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      size="small"
                      label="Mô tả"
                      value={formData.description}
                      onChange={handleChange('description')}
                      error={!!errors.description}
                      helperText={errors.description}
                      multiline
                      rows={3}
                      disabled={submitting}
                      InputProps={{
                        sx: {
                          alignItems: 'flex-start',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <StyledTextField
                      fullWidth
                      size="small"
                      label="Giá"
                      type="number"
                      value={formData.price}
                      onChange={handleChange('price')}
                      error={!!errors.price}
                      helperText={errors.price}
                      InputProps={{
                        inputProps: { min: 0, step: 1000 },
                      }}
                      required
                      disabled={submitting}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <StyledTextField
                      fullWidth
                      size="small"
                      label="Đơn vị"
                      value={formData.unit}
                      onChange={handleChange('unit')}
                      placeholder="VNĐ, giờ, ngày..."
                      helperText="giờ, ngày"
                      disabled={submitting}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                        Hình ảnh {formData.images.length > 0 && `(${formData.images.length}/5)`}
                      </Typography>
                      {uploadingImages && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Đang upload hình ảnh...
                          </Typography>
                        </Box>
                      )}
                      {formData.images.length > 0 && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {formData.images.map((image, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                              <ImagePreviewBox>
                                <img src={image} alt={`Preview ${index + 1}`} />
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveImage(index)}
                                  disabled={submitting}
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: theme.palette.error.main,
                                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                                    '&:hover': {
                                      backgroundColor: theme.palette.error.main,
                                      color: 'white',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </ImagePreviewBox>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                      {formData.images.length < 5 && (
                        <Box>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            id="image-upload-input"
                            onChange={handleImageUpload}
                            disabled={uploadingImages || submitting}
                          />
                          <label htmlFor="image-upload-input">
                            <ImageUploadButton
                              component="span"
                              fullWidth
                              startIcon={<CloudUploadIcon />}
                              disabled={uploadingImages || submitting}
                              variant="contained"
                            >
                              {formData.images.length === 0 
                                ? 'Chọn hình ảnh' 
                                : `Thêm hình ảnh (${5 - formData.images.length} còn lại)`}
                            </ImageUploadButton>
                          </label>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                            Tối đa 5 hình ảnh, định dạng JPG, PNG
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Action Buttons */}
          <Box 
            display="flex" 
            gap={2} 
            justifyContent="flex-end" 
            sx={{ 
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              disabled={submitting}
              sx={{ 
                textTransform: 'none', 
                minWidth: 120,
                borderRadius: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Hủy
            </Button>
            <GradientButton 
              onClick={handleSubmit}
              disabled={submitting || uploadingImages}
              sx={{ minWidth: 180 }}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </GradientButton>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

