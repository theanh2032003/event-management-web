/**
 * LocationManagement - Quản lý địa điểm
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

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

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)',
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

export default function LocationManagement() {
  const theme = useTheme();
  const { id: supplierId } = useParams();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    // Fetch locations
    const fetchLocations = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const data = await supplierApi.getLocations(supplierId);
        
        // Mock data
        setLocations([
          {
            id: 1,
            name: 'Chi nhánh Hà Nội',
            address: '123 Đường ABC, Quận XYZ, Hà Nội',
            description: 'Kho chứa và văn phòng chính',
            status: 'active',
          },
          {
            id: 2,
            name: 'Chi nhánh TP.HCM',
            address: '456 Đường DEF, Quận 1, TP.HCM',
            description: 'Văn phòng và kho hàng',
            status: 'active',
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
      }
    };

    fetchLocations();
  }, [supplierId]);

  // Filter locations
  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchTerm || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || location.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('ALL');
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'ALL';

  const handleCreateLocation = () => {
    // TODO: Implement create location
    alert('Chức năng tạo địa điểm đang được phát triển');
  };

  const handleEditLocation = (location) => {
    // TODO: Implement edit location
    alert('Chức năng sửa địa điểm đang được phát triển');
  };

  const handleDeleteLocation = (locationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
      setLocations(locations.filter(l => l.id !== locationId));
      alert('Địa điểm đã được xóa!');
    }
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
          <LocationIcon sx={{ fontSize: 32, color: 'white' }} />
        </IconBox>
        <TitleBox>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Quản lý địa điểm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các địa điểm cung cấp dịch vụ của bạn
          </Typography>
        </TitleBox>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateLocation}
          disabled={loading}
          size="large"
        >
          Thêm địa điểm
        </StyledButton>
      </HeaderBox>

      {/* Filters & Search */}
      <FiltersPaper>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Box flex={1} minWidth={200}>
            <StyledTextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo tên, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box minWidth={200}>
            <StyledFormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Tạm dừng</MenuItem>
              </Select>
            </StyledFormControl>
          </Box>
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: theme.spacing(1, 2),
              borderRadius: theme.spacing(1),
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="body2" fontWeight={600} color="primary.main">
              Hiển thị {filteredLocations.length} / {locations.length} địa điểm
            </Typography>
          </Box>
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Thêm địa điểm để quản lý các vị trí cung cấp dịch vụ của bạn
          </Typography>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateLocation}
          >
            Thêm địa điểm
          </StyledButton>
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
        <Grid container spacing={3}>
          {filteredLocations.map((location) => (
            <Grid item xs={12} md={6} key={location.id}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      {location.name}
                    </Typography>
                    <Chip
                      label={location.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      color={location.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {location.address}
                  </Typography>
                  {location.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {location.description}
                    </Typography>
                  )}
                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditLocation(location)}
                      fullWidth
                      sx={{ textTransform: 'none' }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteLocation(location.id)}
                      fullWidth
                      sx={{ textTransform: 'none' }}
                    >
                      Xóa
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
