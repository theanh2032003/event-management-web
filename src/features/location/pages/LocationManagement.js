import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import locationApi from "../api/location.api";
import { uploadToCloudinary } from "../../../shared/utils/uploadToCloudinary";
import { useToast } from '../../../app/providers/ToastContext';
import LocationFormDialog from '../components/LocationFormDialog';
import SubLocationDetailDialog from '../components/SubLocationDetailDialog';
import PermissionGate from "../../../shared/components/PermissionGate";
import { CommonTable } from "../../../shared/components/CommonTable";
import CommonDialog from "../../../shared/components/CommonDialog";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";
import { debounce } from 'lodash';

// Memoized ImageUpload component to prevent unnecessary re-renders
// Styles for reusable components
const imageUploadStyles = {
  wrapper: {
    width: 70,
    height: 70,
    borderRadius: 2,
    border: '2px dashed',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    bgcolor: 'background.default',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: 'action.hover',
    },
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    bgcolor: 'background.paper',
    boxShadow: 2,
    '&:hover': {
      bgcolor: 'error.main',
      color: 'error.contrastText',
    },
  }
};

const ImageUpload = memo(({ imagePreview, handleRemoveImage, handleLocationImageUpload, uploadingImages }) => {
  const handleRemove = useCallback((e) => {
    e.preventDefault();
    handleRemoveImage();
  }, [handleRemoveImage]);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        Hình ảnh địa điểm {uploadingImages && <CircularProgress size={16} sx={{ ml: 1 }} />}
      </Typography>
      <Box sx={imageUploadStyles.wrapper} component="label">
        {imagePreview ? (
          <>
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={imageUploadStyles.image}
            />
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={imageUploadStyles.removeButton}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <CloudUploadIcon sx={{ fontSize: 25, mb: 1 }} />
          </Box>
        )}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleLocationImageUpload}
          disabled={uploadingImages}
        />
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  return prevProps.imagePreview === nextProps.imagePreview &&
         prevProps.uploadingImages === nextProps.uploadingImages;
});

export default function LocationManagement({ 
  enterpriseId: propEnterpriseId,
  userPermissions = [],
  hasPermission = () => true,
  requiredPermission = PERMISSION_CODES.LOCATION_MANAGE
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id: urlEnterpriseId } = useParams();
  
  // Use enterpriseId from URL params if available, otherwise use prop
  const enterpriseId = urlEnterpriseId || propEnterpriseId;

  // Kiểm tra quyền của user
  const hasAccessPermission = hasPermission(requiredPermission);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Sub-location states
  const [viewingLocation, setViewingLocation] = useState(null);
  const [subLocations, setSubLocations] = useState([]);
  const [subLocationDialogOpen, setSubLocationDialogOpen] = useState(false);
  const [editingSubLocation, setEditingSubLocation] = useState(null);
  const [viewingSubLocation, setViewingSubLocation] = useState(null);
  const [subLocationDetailDialogOpen, setSubLocationDetailDialogOpen] = useState(false);
  const [subLocationForm, setSubLocationForm] = useState({
    name: "",
    detail: "",
    description: "",
    images: []
  });
  const [subLocationImagePreviews, setSubLocationImagePreviews] = useState([]);
  
  // Delete location dialog
  const [deleteLocationDialogOpen, setDeleteLocationDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);

  const { showToast } = useToast();

  // Fetch locations on component mount
  useEffect(() => {
    // Chỉ fetch nếu user có quyền
    if (hasAccessPermission) {
      fetchLocations();
    }
  }, [page, rowsPerPage, hasAccessPermission]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationApi.getLocations('', page, rowsPerPage, 'name,asc');
      setLocations(response?.data || response || []);
      setTotalElements(response?.metadata?.total || 0);
    } catch (err) {
      setError('Không thể tải danh sách địa điểm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setName(location.name || "");
      setAddress(location.address || "");
      setCapacity(location.capacity ?? "");
      setPricePerHour(location.pricePerHour ?? "");
      setImagePreview(location.image || null);
    } else {
      setEditingLocation(null);
      setName("");
      setAddress("");
      setCapacity("");
      setPricePerHour("");
      setImagePreview(null);
    }
    setDialogOpen(true);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleCapacityChange = (e) => {
    setCapacity(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPricePerHour(e.target.value);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLocation(null);
    setName("");
    setAddress("");
    setCapacity("");
    setPricePerHour("");
    setImagePreview(null);
  };

  const handleSaveLocation = async () => {
    try {
      const locationData = {
        name,
        address,
        capacity,
        pricePerHour,
        image: imagePreview,
      };

      if (editingLocation) {
        await locationApi.updateLocation(editingLocation.id, locationData);
        showToast('Cập nhật địa điểm thành công!', 'success', 3000);
      } else {
        await locationApi.createLocation(locationData);
        showToast('Tạo địa điểm thành công!', 'success', 3000);
      }
      
      await fetchLocations();
      handleCloseDialog();
    } catch (err) {
      showToast('Có lỗi xảy ra khi lưu địa điểm!', 'error', 3000);
    }
  };

  const handleDeleteLocation = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    setLocationToDelete(location);
    setDeleteLocationDialogOpen(true);
  };

  const handleConfirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      setIsDeletingLocation(true);
      await locationApi.deleteLocation(locationToDelete.id);
      setDeleteLocationDialogOpen(false);
      setLocationToDelete(null);
      showToast('Xóa địa điểm thành công!', 'success', 3000);
      await fetchLocations();
    } catch (err) {
      showToast('Lỗi khi xóa địa điểm. Vui lòng thử lại.', 'error', 3000);
    } finally {
      setIsDeletingLocation(false);
    }
  };

  const handleCloseDeleteLocationDialog = () => {
    setDeleteLocationDialogOpen(false);
    setLocationToDelete(null);
    setIsDeletingLocation(false);
  };

  const handleToggleAvailable = async (locationId, currentAvailable) => {
    try {
      await locationApi.changeAvailableEnterprise(locationId, !currentAvailable);
      showToast('Cập nhật trạng thái địa điểm thành công!', 'success', 3000);
      await fetchLocations();
    } catch (err) {
      showToast('Lỗi khi cập nhật trạng thái. Vui lòng thử lại.', 'error', 3000);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
  }, []);

  const handleLocationImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh!', 'error', 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh không được vượt quá 5MB!', 'error', 3000);
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setImagePreview(uploadedUrl);
        showToast('Tải ảnh lên thành công!', 'success', 3000);
      } else {
        showToast('Không thể tải ảnh lên. Vui lòng thử lại!', 'error', 3000);
      }
    } catch (error) {
      showToast('Có lỗi xảy ra khi tải ảnh!', 'error', 3000);
    } finally {
      setUploadingImages(false);
    }
  }, [showToast]);

  // Sub-location handlers
  const handleViewDetail = (location) => {
    // Navigate to location detail page
    navigate(`/enterprise/${enterpriseId}/settings/locations/${location.id}`);
  };

  const handleBackToList = () => {
    setViewingLocation(null);
    setSubLocations([]);
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
        showToast('Tải ảnh lên thành công!', 'success', 3000);
      } else {
        showToast('Không thể tải ảnh lên. Vui lòng thử lại!', 'error', 3000);
      }
    } catch (error) {
      showToast('Có lỗi xảy ra khi tải ảnh!', 'error', 3000);
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
      showToast('Vui lòng nhập tên địa điểm con!', 'error', 3000);
      return;
    }

    try {
      const payload = {
        locationId: viewingLocation.id,
        name: subLocationForm.name,
        detail: subLocationForm.detail,
        description: subLocationForm.description,
        images: subLocationForm.images,
      };

      if (editingSubLocation) {
        await locationApi.updateSubLocation(editingSubLocation.id, payload);
        showToast('Cập nhật địa điểm con thành công!', 'success', 3000);
      } else {
        await locationApi.createSubLocation(viewingLocation.id, payload);
        showToast('Tạo địa điểm con thành công!', 'success', 3000);
      }

      // Refresh sub-location list
      const response = await locationApi.filterSublocationByLocation(viewingLocation.id);
      setSubLocations(response.data || []);

      handleCloseSubLocationDialog();
    } catch (error) {
      showToast('Có lỗi xảy ra khi lưu địa điểm con!', 'error', 3000);
    }
  };

  const handleDeleteSubLocation = async (subLocationId) => {
    try {
      await locationApi.deleteSubLocation(subLocationId);
      setSubLocations((prev) => prev.filter((sl) => sl.id !== subLocationId));
      showToast('Xóa địa điểm con thành công!', 'success', 3000);
    } catch (error){
      showToast('Có lỗi xảy ra khi xóa địa điểm con!', 'error', 3000);
    }
  };

  const handleViewSubLocationDetail = (subLocation) => {
    setViewingSubLocation(subLocation);
    setSubLocationDetailDialogOpen(true);
  };

  const handleCloseSubLocationDetailDialog = () => {
    setSubLocationDetailDialogOpen(false);
    setViewingSubLocation(null);
  };

  const handleBackToSubLocationList = () => {
    setViewingSubLocation(null);
  };

  return (
    <PermissionGate 
      hasPermission={hasAccessPermission}
      featureName="quản lý địa điểm"
    >
      <Box>
      {!viewingLocation ? (
        /* Main List View */
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", m: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Thêm địa điểm
            </Button>
          </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={fetchLocations} sx={{ ml: 2 }}>
            Thử lại
          </Button>
        </Alert>
      ) : locations.length === 0 ? (
        <Alert severity="info">
          Chưa có địa điểm nào. Nhấn "Thêm địa điểm" để tạo mới.
        </Alert>
      ) : isMobile ? (
        <Grid container spacing={2}>
          {locations.map((location) => (
            <Grid item xs={12} key={location.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>{location.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{location.address}</Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={location.available ?? false}
                            onChange={() => handleToggleAvailable(location.id, location.available)}
                            size="small"
                          />
                        }
                        label={location.available ? "Có sẵn" : "Không có sẵn"}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(location)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteLocation(location.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <CommonTable
          columns={[
            {
                field: 'id',
                headerName: 'STT',
                width: 70,
                align: 'center',
                render:(value, row, rowIndex) => rowIndex + 1,
            },
            {
              field: 'name',
              headerName: 'Tên địa điểm',
              flex: 1,
              minWidth: 150,
              render: (value) => (
                <Typography variant="body2" fontWeight={500}>
                  {value || 'N/A'}
                </Typography>
              ),
            },
            {
              field: 'address',
              headerName: 'Địa chỉ',
              flex: 1,
              minWidth: 250,
              render: (value) => (
                <Typography variant="body2" color="text.secondary">
                  {value || 'N/A'}
                </Typography>
              ),
            },
            {
              field: 'capacity',
              headerName: 'Sức chứa',
              width: 120,
              align: 'center',
              render: (value) => (
                <Typography variant="body2" color="text.secondary">
                  {value || '-'}
                </Typography>
              ),
            },
            {
              field: 'available',
              headerName: 'Trạng thái',
              width: 120,
              align: 'center',
              render: (value, row) => (
                <Box onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={value ?? false}
                    onChange={() => handleToggleAvailable(row.id, value)}
                    size="small"
                  />
                </Box>
              ),
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              width: 120,
              align: 'center',
              render: (_, row) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(row)}
                    title="Chỉnh sửa"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteLocation(row.id)}
                    color="error"
                    title="Xóa"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            },
          ]}
          data={locations}
          rowsPerPage={rowsPerPage}
          page={page}
          totalCount={totalElements}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onRowClick={(row) => handleViewDetail(row)}
          maxHeight={550}
          minHeight={550}
        />
      )}
    </>
  ) : (
    /* Detail View */
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <IconButton onClick={handleBackToList} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Chi tiết địa điểm</Typography>
      </Box>

      {/* Location Details Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tên địa điểm
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {viewingLocation.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Địa chỉ
              </Typography>
              <Typography variant="body1">
                {viewingLocation.address}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sức chứa
              </Typography>
              <Typography variant="body1">
                {viewingLocation.capacity || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Giá/giờ
              </Typography>
              <Typography variant="body1">
                {viewingLocation.pricePerHour ? `${viewingLocation.pricePerHour} VNĐ` : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="body1">
                {viewingLocation.email || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Trạng thái
              </Typography>
              <Typography 
                variant="body1" 
                fontWeight={500}
              >
                {viewingLocation.available ? 'Có sẵn' : 'Không có sẵn'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sub Locations Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Danh sách địa điểm con
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenSubLocationDialog()}
        >
          Thêm địa điểm con
        </Button>
      </Box>

      {subLocations.length === 0 ? (
        <Alert severity="info">
          Chưa có địa điểm con nào. Nhấn "Thêm địa điểm con" để tạo mới.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600, width: '25%' }}>
                  Tên địa điểm con
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: '25%' }}>
                  Chi tiết
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: '30%' }}>
                  Mô tả
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: '10%' }}>
                  Ảnh
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: '10%' }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subLocations.map((subLocation) => (
                <TableRow key={subLocation.id} hover>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {subLocation?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {subLocation?.detail || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={subLocation?.description || ''}
                    >
                      {subLocation?.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {subLocation?.images?.length || 0} ảnh
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewSubLocationDetail(subLocation)}
                        color="primary"
                        title="Xem chi tiết"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenSubLocationDialog(subLocation)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteSubLocation(subLocation.id)} 
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )}

      <LocationFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        isMobile={isMobile}
        editingLocation={editingLocation}
        formData={{ name, address, capacity, pricePerHour, imagePreview }}
        onNameChange={handleNameChange}
        onAddressChange={handleAddressChange}
        onCapacityChange={handleCapacityChange}
        onPriceChange={handlePriceChange}
        onRemoveImage={handleRemoveImage}
        onImageUpload={handleLocationImageUpload}
        onSave={handleSaveLocation}
        uploadingImages={uploadingImages}
      />

      {/* Sub-Location Dialog */}
      <Dialog open={subLocationDialogOpen} onClose={handleCloseSubLocationDialog} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          {editingSubLocation ? "Chỉnh sửa địa điểm con" : "Thêm địa điểm con mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField 
              label="Tên địa điểm con" 
              fullWidth 
              required
              value={subLocationForm.name} 
              onChange={(e) => handleSubLocationFormChange('name', e.target.value)} 
            />
            
            <TextField 
              label="Chi tiết" 
              fullWidth 
              multiline
              rows={2}
              value={subLocationForm.detail} 
              onChange={(e) => handleSubLocationFormChange('detail', e.target.value)}
              placeholder="Ví dụ: Khán đài có mái che, sức chứa khoảng 300 người"
            />
            
            <TextField 
              label="Mô tả" 
              fullWidth 
              multiline
              rows={3}
              value={subLocationForm.description} 
              onChange={(e) => handleSubLocationFormChange('description', e.target.value)}
              placeholder="Ví dụ: Khu vực khán đài chính, phù hợp cho VIP và ban tổ chức"
            />
            
            {/* Multiple Image Upload */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Hình ảnh địa điểm con {uploadingImages && <CircularProgress size={16} sx={{ ml: 1 }} />}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Existing images */}
                {subLocationImagePreviews.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={`Preview ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSubLocationImage(index)}
                      disabled={uploadingImages}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': { 
                          bgcolor: 'error.main', 
                          color: 'error.contrastText' 
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                
                {/* Upload button */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    cursor: uploadingImages ? 'not-allowed' : 'pointer',
                    opacity: uploadingImages ? 0.5 : 1,
                    '&:hover': {
                      borderColor: uploadingImages ? 'divider' : 'primary.main',
                      bgcolor: uploadingImages ? 'background.default' : 'action.hover',
                    }
                  }}
                  component="label"
                >
                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <CloudUploadIcon sx={{ fontSize: 30, mb: 0.5 }} />
                    <Typography variant="caption" display="block">
                      Thêm ảnh
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
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Có thể chọn nhiều ảnh cùng lúc. Kích thước tối đa 5MB/ảnh.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
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

      {/* Sub-Location Detail Dialog */}
      <SubLocationDetailDialog
        open={subLocationDetailDialogOpen}
        onClose={handleCloseSubLocationDetailDialog}
        subLocation={viewingSubLocation}
        isMobile={isMobile}
      />

      {/* Delete Location Confirmation Dialog */}
      <CommonDialog
        open={deleteLocationDialogOpen}
        title="Xác nhận xóa"
        onClose={handleCloseDeleteLocationDialog}
        onSubmit={handleConfirmDeleteLocation}
        loading={isDeletingLocation}
        submitLabel="Xóa"
        cancelLabel="Hủy"
        centerButtons={true}
        submitColor="error"
        PaperProps={{
          sx: { maxWidth: '400px' }
        }}
      >
        <Typography sx={{ textAlign: 'center', mt: 2 }}>
          Bạn có chắc chắn muốn xóa địa điểm <strong>{locationToDelete?.name}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
          Hành động này không thể hoàn tác.
        </Typography>
      </CommonDialog>
      </Box>
    </PermissionGate>
  );
}
