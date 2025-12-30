/**
 * LocationManagement - Quản lý địa điểm
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  styled,
  alpha,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  InputAdornment,
  useTheme,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { CommonTable } from '../../../shared/components/CommonTable';
import locationApi from '../api/location.api';
import { useToast } from '../../../app/providers/ToastContext';
import { Drawer } from '@mui/material';

// Styled Components
const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const IconBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const TitleBox = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.25, 3),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const FiltersPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: theme.palette.background.paper,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
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
    backgroundColor: alpha(theme.palette.background.default, 0.6),
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

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 3),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 600,
}));

export default function LocationManagement() {
  const theme = useTheme();
  const toast = useToast();
  const { id: supplierId } = useParams();
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Drawer state for location detail
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingLocationId, setDeletingLocationId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  
  // Form states
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    capacity: '',
    pricePerHour: '',
    imagePreview: null,
  });

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect for search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch locations when debounced search or filters change
  useEffect(() => {
    fetchLocations();
  }, [supplierId, page, rowsPerPage, debouncedSearchTerm, filterStatus]);

  // Initial load effect
  useEffect(() => {
    if (initialLoading) {
      fetchLocations().finally(() => setInitialLoading(false));
    }
  }, []);

  const fetchLocations = async () => {
    try {
      setTableLoading(true);
      // Prepare API parameters
      const available = filterStatus === 'ALL' ? null : (filterStatus === 'active' ? true : false);
      const keyword = debouncedSearchTerm.trim() || undefined;
      
      const response = await locationApi.getLocations(available, page, rowsPerPage, keyword);
      const data = Array.isArray(response) ? response : response.data || [];
      setLocations(data);
      setTotalCount(response?.metadata?.total || data.length);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Không thể tải danh sách địa điểm');
    } finally {
      setTableLoading(false);
    }
  };

  // Use locations directly from API (no client-side filtering needed)
  const filteredLocations = locations;

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('ALL');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'ALL';

  const handleOpenDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name: location.name || '',
        address: location.address || '',
        capacity: location.capacity || '',
        pricePerHour: location.pricePerHour || '',
        imagePreview: location.image || null,
      });
    } else {
      setEditingLocation(null);
      setLocationForm({
        name: '',
        address: '',
        capacity: '',
        pricePerHour: '',
        imagePreview: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLocation(null);
    setLocationForm({
      name: '',
      address: '',
      capacity: '',
      pricePerHour: '',
      imagePreview: null,
    });
  };

  const handleFormChange = (field, value) => {
    setLocationForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocationForm(prev => ({
          ...prev,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setLocationForm(prev => ({
      ...prev,
      imagePreview: null,
    }));
  };

  const handleSaveLocation = async () => {
    if (!locationForm.name.trim() || !locationForm.address.trim()) {
      toast.error('Vui lòng nhập tên và địa chỉ địa điểm');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: locationForm.name,
        address: locationForm.address,
        capacity: locationForm.capacity ? parseInt(locationForm.capacity) : null,
        pricePerHour: locationForm.pricePerHour ? parseFloat(locationForm.pricePerHour) : null,
      };

      if (editingLocation) {
        await locationApi.updateLocationSupplier(editingLocation.id, data);
        toast.success('Cập nhật địa điểm thành công');
        // Giữ nguyên trang hiện tại khi update
        await fetchLocations();
      } else {
        await locationApi.createLocationSupplier(data);
        toast.success('Tạo địa điểm thành công');
        // Reset về trang đầu khi tạo mới
        setPage(0);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Không thể lưu địa điểm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    setDeleteConfirmOpen(true);
    setDeletingLocationId(locationId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLocationId) return;

    setDeleteSubmitting(true);
    try {
      await locationApi.deleteLocationSupplier(deletingLocationId);
      
      toast.success('Địa điểm đã được xóa');
      setDeleteConfirmOpen(false);
      setDeletingLocationId(null);
      // Reset về trang đầu sau khi xóa
      setPage(0);
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Không thể xóa địa điểm');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingLocationId(null);
  };

  const handleStatusChange = async (location) => {
    const newStatus = location.available === true ? false : true;
    setUpdatingStatusId(location.id);
    try {
      const isAvailable = newStatus === true;
      await locationApi.changeAvailableSupplier(location.id, isAvailable);
      
      // Fetch lại data để render lại
      await fetchLocations();
      
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Error updating location status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = event?.target?.value || event;
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  // Drawer handlers
  const handleViewDetail = (location) => {
    setSelectedLocation(location);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedLocation(null);
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters & Search */}
      <FiltersPaper>
        {/* Keyword Search Row */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginBottom: 2 }}>
          <StyledTextField
            placeholder="Tìm kiếm theo tên, địa chỉ..."
            size="medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={tableLoading}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Filter Controls Row */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          {/* Status Filter */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <StyledFormControl fullWidth size="medium">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={tableLoading}
              >
                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Tạm dừng</MenuItem>
              </Select>
            </StyledFormControl>
          </Box>

          {/* Create Button */}
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={tableLoading}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Thêm địa điểm
          </StyledButton>
        </Box>

        {/* Results count & Clear button */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: theme.spacing(1),
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Box>
      </FiltersPaper>

      {/* Content */}
      {locations.length === 0 ? (
        <EmptyStateBox>
          <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có địa điểm
          </Typography>
        </EmptyStateBox>
      ) : filteredLocations.length === 0 ? (
        <EmptyStateBox>
          <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Không tìm thấy địa điểm
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Không có địa điểm nào phù hợp với bộ lọc bạn đã chọn.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearFilters}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Xóa bộ lọc
          </Button>
        </EmptyStateBox>
      ) : (
        <CommonTable
          columns={[
            {
              field: 'stt',
              headerName: 'STT',
              width: 60,
              render: (_, __, index) => index + 1,
            },
            {
              field: 'name',
              headerName: 'Tên địa điểm',
              flex: 1,
              minWidth: 200,
              render: (value) => (
                <Typography variant="body2" color="text.primary">
                  {value}
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
              width: 140,
              render: (value, location) => (
                <Box display="flex" alignItems="center" gap={1} onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={value === true}
                    onChange={() => handleStatusChange(location)}
                    disabled={updatingStatusId === location.id}
                    size="small"
                  />
                </Box>
              ),
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              width: 100,
              render: (_, location) => (
                <Box display="flex" gap={0.5} onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(location)}
                    title="Sửa"
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteLocation(location.id)}
                    title="Xóa"
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            },
          ]}
          data={filteredLocations}
          loading={tableLoading}
          rowsPerPage={rowsPerPage}
          page={page}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onRowClick={(row) => handleViewDetail(row)}
          emptyMessage="Không có địa điểm"
          minHeight={600}
          maxHeight={600}
        />
      )}

      {/* Location Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogTitle>
          {editingLocation ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}
        </StyledDialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Image Upload */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Hình ảnh địa điểm {uploadingImage && <CircularProgress size={16} sx={{ ml: 1 }} />}
              </Typography>
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
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'background.default',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                component="label"
              >
                {locationForm.imagePreview ? (
                  <>
                    <Box
                      component="img"
                      src={locationForm.imagePreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': { bgcolor: 'error.main', color: 'error.contrastText' }
                      }}
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
                  disabled={uploadingImage}
                />
              </Box>
            </Box>

            {/* Form Fields */}
            <TextField
              label="Tên địa điểm"
              fullWidth
              required
              value={locationForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              disabled={submitting}
            />

            <TextField
              label="Địa chỉ"
              fullWidth
              required
              multiline
              rows={2}
              value={locationForm.address}
              onChange={(e) => handleFormChange('address', e.target.value)}
              disabled={submitting}
            />

            

            <TextField
              label="Sức chứa (người)"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              value={locationForm.capacity}
              onChange={(e) => handleFormChange('capacity', e.target.value)}
              disabled={submitting}
            />

            <TextField
              label="Giá/giờ (VNĐ)"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: 1000 }}
              value={locationForm.pricePerHour}
              onChange={(e) => handleFormChange('pricePerHour', e.target.value)}
              disabled={submitting}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveLocation}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (editingLocation ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Bạn có chắc chắn muốn xóa địa điểm này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCancelDelete}
            disabled={deleteSubmitting}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            disabled={deleteSubmitting}
            variant="contained"
            color="error"
          >
            {deleteSubmitting ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

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
        <Box sx={{ p: 3, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Chi tiết địa điểm</Typography>
          </Box>

          {selectedLocation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              {/* Location Image */}
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

              {/* Name */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  Tên địa điểm
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  {selectedLocation.name}
                </Typography>
              </Box>

              {/* Address */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  Địa chỉ
                </Typography>
                <Typography variant="body2">
                  {selectedLocation.address || '-'}
                </Typography>
              </Box>

              {/* Capacity */}
              {selectedLocation.capacity && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    Sức chứa
                  </Typography>
                  <Typography variant="body2">
                    {selectedLocation.capacity} người
                  </Typography>
                </Box>
              )}

              {/* Price */}
              {selectedLocation.pricePerHour && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    Giá/giờ
                  </Typography>
                  <Typography variant="body2">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(selectedLocation.pricePerHour)}
                  </Typography>
                </Box>
              )}

              {/* Status */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  Trạng thái
                </Typography>
                <Chip
                  label={selectedLocation.available === true ? 'Hoạt động' : 'Tạm dừng'}
                  color={selectedLocation.available === true ? 'success' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
