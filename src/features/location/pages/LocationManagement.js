import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
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
  Drawer,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import locationApi from "../api/location.api";
import { uploadToCloudinary } from "../../../shared/utils/uploadToCloudinary";
import { useToast } from '../../../app/providers/ToastContext';
import LocationFormDialog from '../components/LocationFormDialog';
import PermissionGate from "../../../shared/components/PermissionGate";
import { CommonTable } from "../../../shared/components/CommonTable";
import CommonDialog from "../../../shared/components/CommonDialog";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";

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

  // Drawer state for location detail
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
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
      const response = await locationApi.getLocations(null , page, rowsPerPage);
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

  // Drawer handlers
  const handleViewDetail = (location) => {
    setSelectedLocation(location);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedLocation(null);
  };

  return (
    <PermissionGate 
      hasPermission={hasAccessPermission}
      featureName="quản lý địa điểm"
    >
      <Box>
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
                <Card 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetail(location)}
                >
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
                      <Box onClick={(e) => e.stopPropagation()}>
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

        {/* Location Detail Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 450 },
              maxWidth: '100%',
            },
          }}
        >
          <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Chi tiết địa điểm</Typography>
            </Box>

            {selectedLocation && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedLocation.image && (
                  <Box
                    component="img"
                    src={selectedLocation.image}
                    alt={selectedLocation.name}
                    sx={{
                      width: '100%',
                      height: 250,
                      objectFit: 'cover',
                      borderRadius: 2,
                      mb: 2,
                    }}
                  />
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tên địa điểm
                  </Typography>
                  <Typography variant="h6" fontWeight={500}>
                    {selectedLocation.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Địa chỉ
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.address || '-'}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6} sx={{width: '100%'}}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sức chứa
                    </Typography>
                    <Typography variant="body2">
                      {selectedLocation.capacity || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{width: '100%'}}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Giá/giờ
                    </Typography>
                    <Typography variant="body2">
                      {selectedLocation.pricePerHour ? `${selectedLocation.pricePerHour} VNĐ` : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{width: '100%'}}> 
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body2">
                      {selectedLocation.email || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Trạng thái
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedLocation.available ? 'Có sẵn' : 'Không có sẵn'}
                    </Typography>
                  </Grid>
                </Grid>

              </Box>
            )}
          </Box>
        </Drawer>
      </Box>
    </PermissionGate>
  );
}
