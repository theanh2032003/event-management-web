import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Grid,
  styled,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Drawer,
  InputAdornment,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import locationApi from "../api/location.api";
import PermissionGate from "../../../shared/components/PermissionGate";
import CommonDialog from "../../../shared/components/CommonDialog";
import SubLocationDetailDialog from '../components/SubLocationDetailDialog';
import { PERMISSION_CODES } from "../../../shared/constants/permissions";
import { uploadToCloudinary } from "../../../shared/utils/uploadToCloudinary";
import { useSnackbar } from 'notistack';

const SubLocationCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
    borderColor: theme.palette.primary.main,
  },
}));

const ImageGallery = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ImageThumbnail = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 120,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    '& .delete-btn': {
      opacity: 1,
    },
  },
}));

export default function LocationDetail() {
  const { id: enterpriseId, locationId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [location, setLocation] = useState(null);
  const [subLocations, setSubLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");

  // Sub-location form dialog
  const [subLocationDialogOpen, setSubLocationDialogOpen] = useState(false);
  const [editingSubLocation, setEditingSubLocation] = useState(null);
  const [subLocationForm, setSubLocationForm] = useState({
    name: "",
    detail: "",
    description: "",
    images: []
  });
  const [subLocationImagePreviews, setSubLocationImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSubLocationDialogOpen, setDeleteSubLocationDialogOpen] = useState(false);
  const [subLocationToDelete, setSubLocationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSubLocation, setIsDeletingSubLocation] = useState(false);

  // Right drawer for sub-location details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSubLocation, setSelectedSubLocation] = useState(null);

  // Fetch location and sub-locations
  useEffect(() => {
    fetchLocationDetail();
  }, [enterpriseId, locationId]);

  const fetchLocationDetail = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch location by ID
      const response = await locationApi.getLocationDetails(locationId);
      const locationData = response.data || response;
      
      if (!locationData) {
        setError("Không tìm thấy địa điểm");
        setLocation(null);
      } else {
        setLocation(locationData);
        await fetchSubLocations(locationId);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. " + (err?.message || ""));
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubLocations = async (locId) => {
    try {
      const response = await locationApi.filterSublocationByLocation(locId);
      const data = response.data || response;
      setSubLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      setSubLocations([]);
    }
  };

  const handleDeleteSubLocation = (subLocation) => {
    setSubLocationToDelete(subLocation);
    setDeleteSubLocationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subLocationToDelete) return;

    try {
      setIsDeleting(true);
      await locationApi.deleteSubLocation(subLocationToDelete.id);
      setDeleteDialogOpen(false);
      setSubLocationToDelete(null);
      enqueueSnackbar('Xóa địa điểm con thành công!', { variant: 'success' });
      await fetchSubLocations(locationId);
    } catch (err) {
      enqueueSnackbar('Lỗi khi xóa địa điểm con. Vui lòng thử lại.', { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSubLocationToDelete(null);
    setIsDeleting(false);
  };

  const handleCloseDeleteSubLocationDialog = () => {
    setDeleteSubLocationDialogOpen(false);
    setSubLocationToDelete(null);
    setIsDeletingSubLocation(false);
  };

  const handleConfirmDeleteSubLocation = async () => {
    if (!subLocationToDelete) return;

    try {
      setIsDeletingSubLocation(true);
      await locationApi.deleteSubLocation(subLocationToDelete.id);
      setDeleteSubLocationDialogOpen(false);
      setSubLocationToDelete(null);
      enqueueSnackbar('Xóa địa điểm con thành công!', { variant: 'success' });
      await fetchSubLocations(locationId);
      handleCloseDrawer();
    } catch (err) {
      enqueueSnackbar('Lỗi khi xóa địa điểm con. Vui lòng thử lại.', { variant: 'error' });
    } finally {
      setIsDeletingSubLocation(false);
    }
  };

  const handleViewSubLocationDetail = (subLocation) => {
    setSelectedSubLocation(subLocation);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedSubLocation(null);
  };

  const handleBack = () => {
    navigate(`/enterprise/${enterpriseId}/settings/locations`);
  };

  const handleOpenSubLocationDialog = (subLocation = null) => {
    if (subLocation) {
      setEditingSubLocation(subLocation);
      setSubLocationForm({
        name: subLocation.name || "",
        detail: subLocation.detail || "",
        description: subLocation.description || "",
        images: subLocation.images || []
      });
      setSubLocationImagePreviews(subLocation.images || []);
    } else {
      setEditingSubLocation(null);
      setSubLocationForm({
        name: "",
        detail: "",
        description: "",
        images: []
      });
      setSubLocationImagePreviews([]);
    }
    setSubLocationDialogOpen(true);
  };

  const handleCloseSubLocationDialog = () => {
    setSubLocationDialogOpen(false);
    setEditingSubLocation(null);
    setSubLocationForm({
      name: "",
      detail: "",
      description: "",
      images: []
    });
    setSubLocationImagePreviews([]);
  };

  const handleSubLocationFormChange = (field, value) => {
    setSubLocationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubLocationImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      const successfulUrls = uploadedUrls.filter((url) => url !== null);
      if (successfulUrls.length > 0) {
        setSubLocationForm((prev) => ({
          ...prev,
          images: [...prev.images, ...successfulUrls],
        }));
        setSubLocationImagePreviews(prev => [...prev, ...successfulUrls]);
        enqueueSnackbar('Tải ảnh lên thành công!', { variant: 'success' });
      } else {
        enqueueSnackbar('Không thể tải ảnh lên. Vui lòng thử lại!', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi tải ảnh!', { variant: 'error' });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveSubLocationImage = (index) => {
    const newImages = subLocationForm.images.filter((_, i) => i !== index);
    const newPreviews = subLocationImagePreviews.filter((_, i) => i !== index);
    setSubLocationForm({ ...subLocationForm, images: newImages });
    setSubLocationImagePreviews(newPreviews);
  };

  const handleSaveSubLocation = async () => {
    if (!subLocationForm.name.trim()) {
      enqueueSnackbar('Vui lòng nhập tên địa điểm con!', { variant: 'warning' });
      return;
    }

    try {
      const payload = {
        locationId: location.id,
        name: subLocationForm.name,
        detail: subLocationForm.detail,
        images: subLocationForm.images,
        description: subLocationForm.description,
      };

      if (editingSubLocation) {
        await locationApi.updateSubLocation(editingSubLocation.id, payload);
        enqueueSnackbar('Cập nhật địa điểm con thành công!', { variant: 'success' });
      } else {
        await locationApi.createSubLocation(location.id, payload);
        enqueueSnackbar('Tạo địa điểm con thành công!', { variant: 'success' });
      }

      // Refresh sub-location list
      const response = await locationApi.filterSublocationByLocation(locationId);
      setSubLocations(response.data || []);

      handleCloseSubLocationDialog();
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi lưu địa điểm con!', { variant: 'error' });
    }
  };

  // Filter sub-locations based on search
  const filteredSubLocations = subLocations.filter(sub =>
    sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.detail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !location) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="error">
          {error || "Không tìm thấy địa điểm."}
        </Typography>
      </Box>
    );
  }

  return (
    <PermissionGate 
      hasPermission={true}
      featureName="xem chi tiết địa điểm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
        {/* HEADER WITH TITLE AND BUTTON */}
        <Box sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => navigate(`/enterprise/${enterpriseId}/settings/locations`)}
              sx={{ color: 'primary.main' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              {location?.name}
            </Typography>
          </Box>
          <Button 
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => handleOpenSubLocationDialog()}
          >
            Thêm địa điểm con
          </Button>
        </Box>

        {/* MAIN CONTENT AREA */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 0 }}>
          {/* LEFT: Summary Card */}
          <Box sx={{ 
            width: { xs: '100%', md: '35%' }, 
            p: 2.5, 
            overflowY: 'auto',
            // borderRight: { md: '1px solid #aeb7c3', xs: 'none' },
            borderColor: 'divider'
          }}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {location?.image && (
                <CardMedia
                  component="img"
                  height="220"
                  image={location.image}
                  alt={location?.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ p: 2.5 }}>
                {/* Status Badge */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={location?.available ? 'Hoạt động' : 'Không hoạt động'}
                    color={location?.available ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Info Items */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                      Địa chỉ
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {location?.address || 'Chưa có'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                      Sức chứa
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {location?.capacity || '-'} người
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                      Giá/giờ
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      {location?.pricePerHour ? `${location?.pricePerHour.toLocaleString('vi-VN')} VNĐ` : '-'}
                    </Typography>
                  </Box>

                  {location?.email && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {location.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* RIGHT: Sub-locations List */}
          <Box sx={{ 
            flex: 1, 
            p: 2.5, 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Sub-locations Table */}
            {filteredSubLocations.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center'
              }}>
                <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600}>
                  {subLocations.length === 0 ? 'Chưa có địa điểm con' : 'Không tìm thấy kết quả'}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 1 }}>Tên</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 1 }}>Chi tiết</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem', py: 1, width: '60px' }}>Ảnh</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSubLocations.map((subLocation) => (
                      <TableRow
                        key={subLocation.id}
                        onClick={() => handleViewSubLocationDetail(subLocation)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderLeft: '3px solid',
                            borderColor: 'primary.main'
                          },
                          transition: 'bgcolor 0.2s',
                          borderLeft: '3px solid transparent'
                        }}
                      >
                        <TableCell sx={{ py: 1, fontWeight: 600, maxWidth: '200px' }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {subLocation.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {subLocation?.detail || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1, width: '60px' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {subLocation?.images?.length || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>

        {/* RIGHT DRAWER: Sub-location Detail */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={{
            sx: { width: { xs: '100%', sm: '400px' }, zIndex: 1200 }
          }}
        >
          {selectedSubLocation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Drawer Header */}
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}>
                <Typography variant="h6" fontWeight={700}>
                  Chi tiết
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => setEditingSubLocation(selectedSubLocation)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteSubLocation(selectedSubLocation)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Drawer Content - Edit Mode or View Mode */}
              {editingSubLocation?.id === selectedSubLocation?.id ? (
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Images Section */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Hình ảnh {uploadingImages && <CircularProgress size={14} sx={{ ml: 1, display: 'inline-flex' }} />}
                      </Typography>
                      
                      {/* Current Images */}
                      {subLocationForm.images && subLocationForm.images.length > 0 && (
                        <ImageGallery>
                          {subLocationForm.images.map((image, index) => (
                            <ImageThumbnail
                              key={index}
                              sx={{ backgroundImage: `url(${image})` }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveSubLocationImage(index)}
                                disabled={uploadingImages}
                                className="delete-btn"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'background.paper',
                                  boxShadow: 1,
                                  opacity: 0,
                                  transition: 'opacity 0.3s',
                                  '&:hover': { 
                                    bgcolor: 'error.main', 
                                    color: 'error.contrastText' 
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ImageThumbnail>
                          ))}
                        </ImageGallery>
                      )}
                      
                      {/* Upload Area */}
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          border: '2px dashed',
                          borderColor: 'divider',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'background.default',
                          cursor: uploadingImages ? 'not-allowed' : 'pointer',
                          opacity: uploadingImages ? 0.6 : 1,
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: uploadingImages ? 'divider' : 'primary.main',
                            bgcolor: uploadingImages ? 'background.default' : 'action.hover',
                          }
                        }}
                        component="label"
                      >
                        <CloudUploadIcon sx={{ fontSize: 28, color: 'text.secondary', mb: 0.5 }} />
                        <Typography variant="caption" fontWeight={600}>
                          Tải ảnh lên
                        </Typography>
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleSubLocationImageUpload}
                          disabled={uploadingImages}
                        />
                      </Box>
                    </Box>

                    <TextField 
                      label="Tên địa điểm con" 
                      fullWidth 
                      required
                      size="small"
                      value={subLocationForm.name} 
                      onChange={(e) => handleSubLocationFormChange('name', e.target.value)}
                      variant="outlined"
                    />
                    
                    <TextField 
                      label="Chi tiết" 
                      fullWidth 
                      multiline
                      rows={2}
                      size="small"
                      value={subLocationForm.detail} 
                      onChange={(e) => handleSubLocationFormChange('detail', e.target.value)}
                      variant="outlined"
                    />
                    
                    <TextField 
                      label="Mô tả" 
                      fullWidth 
                      multiline
                      rows={2}
                      size="small"
                      value={subLocationForm.description} 
                      onChange={(e) => handleSubLocationFormChange('description', e.target.value)}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
                    <Button 
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setEditingSubLocation(null);
                        setSubLocationForm({
                          name: selectedSubLocation.name || "",
                          detail: selectedSubLocation.detail || "",
                          description: selectedSubLocation.description || "",
                          images: selectedSubLocation.images || []
                        });
                      }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      fullWidth
                      variant="contained"
                      onClick={async () => {
                        if (!subLocationForm.name.trim()) {
                          enqueueSnackbar('Vui lòng nhập tên địa điểm con!', { variant: 'warning' });
                          return;
                        }
                        try {
                          const payload = {
                            locationId: location.id,
                            name: subLocationForm.name,
                            detail: subLocationForm.detail,
                            images: subLocationForm.images,
                            description: subLocationForm.description,
                          };
                          await locationApi.updateSubLocation(selectedSubLocation.id, payload);
                          enqueueSnackbar('Cập nhật địa điểm con thành công!', { variant: 'success' });
                          const response = await locationApi.filterSublocationByLocation(locationId);
                          setSubLocations(response.data || []);
                          const updated = (response.data || []).find(s => s.id === selectedSubLocation.id);
                          if (updated) {
                            setSelectedSubLocation(updated);
                          }
                          setEditingSubLocation(null);
                        } catch (error) {
                          enqueueSnackbar('Có lỗi xảy ra khi lưu!', { variant: 'error' });
                        }
                      }}
                    >
                      Lưu
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                  {/* Images */}
                  {selectedSubLocation?.images && selectedSubLocation.images.length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={selectedSubLocation.images[0]}
                        alt={selectedSubLocation.name}
                        sx={{ borderRadius: 1.5, objectFit: 'cover', mb: 1 }}
                      />
                      {selectedSubLocation.images.length > 1 && (
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                          {selectedSubLocation.images.slice(1).map((img, idx) => (
                            <Box
                              key={idx}
                              component="img"
                              src={img}
                              alt={`${idx + 2}`}
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 1,
                                objectFit: 'cover',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Title */}
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    {selectedSubLocation.name}
                  </Typography>

                  {/* Detail */}
                  {selectedSubLocation?.detail && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                        Chi tiết
                      </Typography>
                      <Typography variant="body2">
                        {selectedSubLocation.detail}
                      </Typography>
                    </Box>
                  )}

                  {/* Description */}
                  {selectedSubLocation?.description && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
                        Mô tả
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSubLocation.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Drawer>

        {/* Sub-Location Form Dialog */}
        <Dialog 
          open={subLocationDialogOpen} 
          onClose={handleCloseSubLocationDialog} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
            {editingSubLocation ? "Chỉnh sửa địa điểm con" : "Thêm địa điểm con mới"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField 
                label="Tên địa điểm con" 
                fullWidth 
                required
                value={subLocationForm.name} 
                onChange={(e) => handleSubLocationFormChange('name', e.target.value)}
                variant="outlined"
              />
              
              <TextField 
                label="Chi tiết" 
                fullWidth 
                multiline
                rows={2}
                value={subLocationForm.detail} 
                onChange={(e) => handleSubLocationFormChange('detail', e.target.value)}
                placeholder="Ví dụ: Khán đài có mái che, sức chứa khoảng 300 người"
                variant="outlined"
              />
              
              <TextField 
                label="Mô tả" 
                fullWidth 
                multiline
                rows={2}
                value={subLocationForm.description} 
                onChange={(e) => handleSubLocationFormChange('description', e.target.value)}
                placeholder="Ví dụ: Khu vực khán đài chính, phù hợp cho VIP"
                variant="outlined"
              />
              
              {/* Image Upload Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Hình ảnh {uploadingImages && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Typography>
                
                {/* Image Gallery Grid */}
                    <ImageGallery>
                    {/* Upload Button - always first */}
                    <Box
                        sx={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '100%',
                        borderRadius: 1,
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                        cursor: uploadingImages ? 'not-allowed' : 'pointer',
                        opacity: uploadingImages ? 0.6 : 1,
                        transition: 'all 0.3s',
                        overflow: 'hidden',
                        '&:hover': {
                            borderColor: uploadingImages ? 'divider' : 'primary.main',
                            bgcolor: uploadingImages ? 'background.default' : 'action.hover',
                        }
                        }}
                        component="label"
                    >
                        <Box sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}>
                        <CloudUploadIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 0.5 }} />
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
                            Tải ảnh
                        </Typography>
                        </Box>
                        <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleSubLocationImageUpload}
                        disabled={uploadingImages}
                        />
                    </Box>

                    {/* Image Thumbnails */}
                    {subLocationImagePreviews.length > 0 && (
                        subLocationImagePreviews.map((image, index) => (
                        <Box
                            key={index}
                            sx={{
                            position: 'relative',
                            width: '100%',
                            paddingBottom: '100%',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: theme => alpha(theme.palette.divider, 0.2),
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                '& .delete-btn': {
                                opacity: 1,
                                },
                            },
                            }}
                        >
                            <IconButton
                            size="small"
                            onClick={() => handleRemoveSubLocationImage(index)}
                            disabled={uploadingImages}
                            className="delete-btn"
                            sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                width: 28,
                                height: 28,
                                '&:hover': { 
                                bgcolor: 'error.main', 
                                color: 'error.contrastText' 
                                }
                            }}
                            >
                            <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        ))
                    )}
                    </ImageGallery>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleCloseSubLocationDialog} disabled={uploadingImages}>
              Hủy
            </Button>
            <Button 
              onClick={handleSaveSubLocation} 
              variant="contained"
              disabled={uploadingImages}
            >
              {editingSubLocation ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog for Sub-Location */}
        <Dialog 
          open={deleteSubLocationDialogOpen}
          onClose={handleCloseDeleteSubLocationDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
            Xác nhận xóa
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>
              Bạn có chắc chắn muốn xóa địa điểm con <strong>{subLocationToDelete?.name}</strong>?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleCloseDeleteSubLocationDialog} disabled={isDeletingSubLocation}>
              Hủy
            </Button>
            <Button 
              onClick={handleConfirmDeleteSubLocation} 
              variant="contained"
              color="error"
              disabled={isDeletingSubLocation}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGate>
  );
}
