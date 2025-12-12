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

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: theme.spacing(1.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.05rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
  lineHeight: 1.6,
  padding: theme.spacing(1.5, 0),
}));

export default function EditProduct() {
  const theme = useTheme();
  const { id: supplierId, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
        const product = productResponse;
        
        if (product) {
          setProduct(product);
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
        const response = await locationApi.getLocations(supplierId);
        const data = Array.isArray(response) ? response : response?.data || [];
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

    // Chỉ fetch locations khi category có isLocationCategory === true
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId || cat.id === Number(formData.categoryId));
    if (selectedCategory?.isLocationCategory === true) {
      fetchLocations();
    } else {
      setLocations([]);
    }
  }, [supplierId, formData.categoryId, categories]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset form data to original product data
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
    setErrors({});
    setIsEditMode(false);
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
      
      // Refresh product data
      const updatedProduct = await productApi.getProductById(productId);
      setProduct(updatedProduct);
      
      setSnackbar({
        open: true,
        message: 'Cập nhật sản phẩm thành công!',
        severity: 'success',
      });

      setIsEditMode(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleCancel}
            sx={{
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, #ff6b9d)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Chi tiết sản phẩm'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isEditMode ? (
            <Button
              variant="contained"
              onClick={handleEditClick}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                disabled={submitting}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
              >
                Hủy
              </Button>
              <GradientButton
                onClick={handleSubmit}
                disabled={submitting || uploadingImages}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </GradientButton>
            </>
          )}
        </Box>
      </HeaderBox>

      {/* Form Section - Full Width */}
      <Box>
        <StyledCard>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4.5 } }}>
                <Grid container spacing={3}>
                  {/* Tên sản phẩm */}
                  <Grid item xs={12}>
                    <SectionTitle>Tên sản phẩm/Dịch vụ *</SectionTitle>
                    {!isEditMode ? (
                      <InfoValue>{product?.name || 'Chưa có tên'}</InfoValue>
                    ) : (
                      <StyledTextField
                        fullWidth
                        size="medium"
                        value={formData.name}
                        onChange={handleChange('name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={submitting}
                        placeholder="Nhập tên sản phẩm/dịch vụ"
                      />
                    )}
                  </Grid>

                  {/* Danh mục */}
                  <Grid item xs={12}>
                    <SectionTitle>Danh mục *</SectionTitle>
                    {!isEditMode ? (
                      <InfoValue>
                        {product?.category ? 
                          (typeof product.category === 'object' ? product.category.name : product.category) 
                          : 'Chưa chọn danh mục'}
                      </InfoValue>
                    ) : (
                      <StyledFormControl fullWidth size="medium" required error={!!errors.categoryId} disabled={submitting}>
                        {/* <InputLabel>Chọn danh mục</InputLabel> */}
                        <Select
                          value={formData.categoryId}
                          onChange={handleChange('categoryId')}
                          label="Chọn danh mục"
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
                    )}                </Grid>

                  {/* Location dropdown - chỉ hiển thị khi category có isLocationCategory = true và đang ở edit mode */}
                  {isEditMode && categories.find(cat => cat.id === formData.categoryId || cat.id === Number(formData.categoryId))?.isLocationCategory === true && (
                    <Grid item xs={12}>
                      <SectionTitle>Địa điểm</SectionTitle>
                      <StyledFormControl fullWidth size="medium" error={!!errors.locationId} disabled={submitting}>
                        <InputLabel>Chọn địa điểm</InputLabel>
                        <Select
                          value={formData.locationId}
                          onChange={handleLocationChange}
                          label="Chọn địa điểm"
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

                 

                  {/* Giá */}
                  <Grid item xs={12}>
                    <SectionTitle>Giá *</SectionTitle>
                    {!isEditMode ? (
                      <InfoValue>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          maximumFractionDigits: 0,
                        }).format(product?.price || 0)}
                      </InfoValue>
                    ) : (
                      <StyledTextField
                        fullWidth
                        size="medium"
                        type="number"
                        value={formData.price}
                        onChange={handleChange('price')}
                        error={!!errors.price}
                        helperText={errors.price}
                        InputProps={{
                          inputProps: { min: 0, step: 1000 },
                        }}
                        disabled={submitting}
                        placeholder="Nhập giá"
                      />
                    )}
                  </Grid>

                  {/* Đơn vị */}
                  <Grid item xs={12}>
                    <SectionTitle>Đơn vị</SectionTitle>
                    {!isEditMode ? (
                      <InfoValue>{product?.unit || 'Chưa có'}</InfoValue>
                    ) : (
                      <StyledTextField
                        fullWidth
                        size="medium"
                        value={formData.unit}
                        onChange={handleChange('unit')}
                        disabled={submitting}
                        placeholder="VD: giờ, ngày, tháng, buổi"
                      />
                    )}
                  </Grid>
                  {/* Mô tả */}
                  <Grid item xs={12}>
                    <SectionTitle>Mô tả sản phẩm/dịch vụ</SectionTitle>
                    {!isEditMode ? (
                      <InfoValue sx={{ whiteSpace: 'pre-wrap' }}>
                        {product?.description || 'Chưa có mô tả'}
                      </InfoValue>
                    ) : (
                      <StyledTextField
                        fullWidth
                        size="medium"
                        value={formData.description}
                        onChange={handleChange('description')}
                        error={!!errors.description}
                        helperText={errors.description }
                        multiline
                        rows={6}
                        disabled={submitting}
                        placeholder="Nhập mô tả chi tiết"
                        InputProps={{
                          sx: {
                            alignItems: 'flex-start',
                            padding: '14px',
                            minHeight: 160,
                          }
                        }}
                      />
                    )}
                  </Grid>
                  {/* Hình ảnh */}
                  <Grid item xs={12}>
                    <SectionTitle>
                      Hình ảnh {isEditMode && formData.images.length > 0 && `(${formData.images.length}/5)`}
                    </SectionTitle>
                    <Box>
                      {uploadingImages && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Đang upload hình ảnh...
                          </Typography>
                        </Box>
                      )}
                      {formData.images.length > 0 ? (
                        <Grid container spacing={2.5} sx={{ mb: 2 }}>
                          {formData.images.map((image, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                              <ImagePreviewBox>
                                <img src={image} alt={`Hình ${index + 1}`} />
                                {isEditMode && (
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
                                )}
                              </ImagePreviewBox>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Chưa có hình ảnh
                        </Typography>
                      )}
                      {isEditMode && formData.images.length < 5 && (
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
            </CardContent>
          </StyledCard>

        </Box>

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

