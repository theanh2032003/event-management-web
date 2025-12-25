/**
 * ProductDialog - Dialog tạo/sửa sản phẩm/dịch vụ
 * Gộp logic của CreateProduct và EditProduct vào 1 dialog reusable
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  alpha,
  useTheme,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import productApi from '../api/product.api';
import categoryApi from '../api/category.api';
import locationApi from '../../location/api/location.api';
import { uploadToCloudinary } from '../../../shared/utils/uploadToCloudinary';
import { useToast } from '../../../app/providers/ToastContext';

const IMAGE_BOX_SIZE = 120;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
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

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  width: IMAGE_BOX_SIZE,
  height: IMAGE_BOX_SIZE,
  borderRadius: 12,
  overflow: 'hidden',
  position: 'relative',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  width: IMAGE_BOX_SIZE,
  height: IMAGE_BOX_SIZE,
  borderRadius: 12,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.25, 3),
  background: ` ${theme.palette.primary.main}`,
  color: 'white',
  fontWeight: 600,
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  // transition: 'all 0.3s ease',
  '&:hover': {
    background: `${theme.palette.primary.dark}`,
    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
    // transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    boxShadow: 'none',
  },
}));

export default function ProductDialog({
  open,
  onClose,
  mode, // 'create' or 'edit'
  product = null,
  supplierId,
  onSuccess = () => {},
}) {
  const theme = useTheme();
  const toast = useToast();

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
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch categories khi dialog mở
  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [open]);

  // Khởi tạo form data khi dialog mở
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && product) {
      // Mode edit: load dữ liệu sản phẩm
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
    } else {
      // Mode create: reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        categoryId: '',
        price: '',
        unit: '',
        images: [],
        locationId: '',
      });
    }
    setErrors({});
  }, [open, mode, product]);

  // Fetch locations khi category thay đổi
  useEffect(() => {
    if (!open || !supplierId) return;

    const fetchLocations = async () => {
      try {
        const response = await locationApi.getLocations(true);
        const data = Array.isArray(response) ? response : response?.data || [];
        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Không thể tải địa điểm', { duration: 3000 });
      }
    };

    const selectedCategory = categories.find(
      (cat) => cat.id === formData.categoryId || cat.id === Number(formData.categoryId)
    );

    if (selectedCategory?.isLocationCategory === true) {
      fetchLocations();
    } else {
      setLocations([]);
      if (formData.locationId) {
        setFormData((prev) => ({ ...prev, locationId: '' }));
      }
    }
  }, [open, supplierId, formData.categoryId, categories]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleLocationChange = async (event) => {
    const locationId = event.target.value;

    if (!locationId) {
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
      const response = await locationApi.getLocationDetails(locationId);
      const locationDetail = response?.data || response;

      if (locationDetail) {
        const capacity = locationDetail.capacity || '';
        const address = locationDetail.address || '';
        const description = `Địa chỉ: ${address}${capacity ? ` - Sức chứa: ${capacity} người` : ''}`;

        let locationImages = [];
        if (locationDetail.images && Array.isArray(locationDetail.images) && locationDetail.images.length > 0) {
          locationImages = locationDetail.images;
        } else if (locationDetail.image) {
          locationImages = [locationDetail.image];
        }

        setFormData({
          ...formData,
          locationId,
          name: locationDetail.name || '',
          price: locationDetail.pricePerHour || '',
          unit: 'giờ',
          description,
          images: locationImages,
        });
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết địa điểm', { duration: 3000 });
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
      toast.warning('Chỉ được upload tối đa 5 hình ảnh');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);

      setFormData({
        ...formData,
        images: [...formData.images, ...validUrls],
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Lỗi khi upload hình ảnh');
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
    if (!formData.name.trim()) newErrors.name = 'Tên dịch vụ là bắt buộc';
    if (!formData.categoryId) newErrors.categoryId = 'Danh mục là bắt buộc';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
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

      if (mode === 'create') {
        await productApi.createProduct(productData);
      } else if (mode === 'edit') {
        await productApi.updateProduct(product.id, productData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error?.response?.data?.message || 'Không thể lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle = mode === 'create' 
    ? 'Tạo dịch vụ'
    : 'Chỉnh sửa dịch vụ';

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.3rem',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha('#ff6b9d', 0.06)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {dialogTitle}
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="medium"
                  label="Tên dịch vụ"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  disabled={loading}
                />
                 <TextField
                  fullWidth
                  size="medium"
                  label="Mã sản phẩm"
                  value={formData.code}
                  onChange={handleChange('code')}
                  disabled={loading}
                  placeholder="Tuỳ chọn"
                />

                <FormControl fullWidth size="medium" required error={!!errors.categoryId} disabled={loading}>
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
                </FormControl>

              {categories.find((cat) => cat.id === formData.categoryId || cat.id === Number(formData.categoryId))
                ?.isLocationCategory === true && (
                  <FormControl fullWidth size="medium" disabled={loading}>
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
                  </FormControl>
              )}
                <TextField
                  fullWidth
                  size="medium"
                  label="Đơn vị"
                  value={formData.unit}
                  onChange={handleChange('unit')}
                  placeholder="VNĐ, giờ, ngày..."
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  size="medium"
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
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  size="medium"
                  label="Mô tả"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                  disabled={loading}
                />

                {/* Images Section */}
                <Grid item xs={12}>

                  {uploadingImages && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Đang upload hình ảnh...
                      </Typography>
                    </Box>
                  )}

                  <Grid container spacing={2}>
                    {/* Preview Images */}
                    {formData.images.map((image, index) => (
                      <Grid item key={index}>
                        <ImagePreviewBox>
                          <img src={image} alt={`Preview ${index + 1}`} />
                          <IconButton
                            size="medium"
                            onClick={() => handleRemoveImage(index)}
                            disabled={loading}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: theme.palette.error.main,
                                color: 'white',
                              },
                              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ImagePreviewBox>
                      </Grid>
                    ))}

                    {/* Upload Box */}
                    {formData.images.length < 5 && (
                      <Grid item>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          id={`image-upload-${mode}`}
                          onChange={handleImageUpload}
                          disabled={uploadingImages || loading}
                        />
                        <label htmlFor={`image-upload-${mode}`} style={{ display: 'block' }}>
                          <ImageUploadBox
                            component="div"
                            sx={{
                              '&:hover': {
                                cursor: uploadingImages || loading ? 'not-allowed' : 'pointer',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                opacity: uploadingImages || loading ? 0.5 : 1,
                              }}
                            >
                              <CloudUploadIcon
                                sx={{
                                  fontSize: 48,
                                  color: theme.palette.primary.main,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  textAlign: 'center',
                                  color: theme.palette.text.secondary,
                                  fontWeight: 500,
                                }}
                              >
                                {formData.images.length === 0 ? 'Tải ảnh' : `Thêm (${5 - formData.images.length})`}
                              </Typography>
                            </Box>
                          </ImageUploadBox>
                        </label>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
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
          disabled={loading || uploadingImages}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </GradientButton>
      </DialogActions>
    </StyledDialog>
  );
}
