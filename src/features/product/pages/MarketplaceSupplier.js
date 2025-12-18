/**
 * Marketplace - Quản lý sản phẩm/dịch vụ
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  useMediaQuery,
  Alert,
  Snackbar,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';
import {
  Store as StoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Storefront as StorefrontIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as PriceIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import productApi from '../api/product.api';
import categoryApi from '../api/category.api';
import CommonTable from '../../../shared/components/CommonTable';

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
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
  },
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
  [theme.breakpoints.down('sm')]: {
    '& .MuiTypography-h4': {
      fontSize: '1.5rem',
    },
  },
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
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(1, 2),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 400px)',
  '& .table-wrapper': {
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: alpha(theme.palette.divider, 0.1),
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: alpha(theme.palette.primary.main, 0.3),
      borderRadius: '4px',
      '&:hover': {
        background: alpha(theme.palette.primary.main, 0.5),
      },
    },
  },
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 1000,
  '& .MuiTableHead-root': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.grey[100], 0.98)
        : alpha(theme.palette.grey[800], 0.95),
    '& .MuiTableCell-root': {
      fontWeight: 600,
      fontSize: '0.85rem',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      color: theme.palette.text.primary,
      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      padding: theme.spacing(1.75, 2),
      whiteSpace: 'nowrap',
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateY(-1px)',
        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
      },
      '&:last-of-type .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      padding: theme.spacing(1.75, 2),
      fontSize: '0.95rem',
    },
  },
}));

const ProductImage = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${alpha(theme.palette.divider, 0.12)}`,
  backgroundColor: theme.palette.grey[100],
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const StatusChip = styled(Chip)(({ theme, active }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '28px',
  backgroundColor: active
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.warning.main, 0.1),
  color: active
    ? theme.palette.success.main
    : theme.palette.warning.main,
  border: `1px solid ${active ? theme.palette.success.main : theme.palette.warning.main}`,
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  height: '24px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const ActionButton = styled(IconButton)(({ theme, color }) => ({
  transition: 'all 0.2s ease',
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: color === 'error'
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.15)',
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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6, 2),
  },
}));

export default function Marketplace() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id: supplierId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState("");
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: '' });
  const [detailDialog, setDetailDialog] = useState({ open: false, product: null, loading: false });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // If API fails, use default categories
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, searchTerm ? 500 : 0); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [supplierId, page, rowsPerPage, filterCategory, filterStatus, searchTerm, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Build filters
      const filters = {
        supplierIds: [supplierId],
        keyword: searchTerm.trim() || undefined, // API sẽ tìm theo cả tên và mã
        categoryIds: filterCategory !== 'ALL' ? [filterCategory] : undefined,
        isActive: filterStatus === 'ALL' ? undefined : filterStatus === 'active',
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || (Array.isArray(filters[key]) && filters[key].length === 0)) {
          delete filters[key];
        }
      });

      // Build sort parameter
      let sortParam = null;
      if (sortOrder === 'price_asc') {
        sortParam = 'price,asc';
      } else if (sortOrder === 'price_desc') {
        sortParam = 'price,desc';
      }

      const response = await productApi.getProducts(filters, page, rowsPerPage, sortParam);

      // Debug logging
      console.log('📦 Products API Response:', response);

      // Handle response structure - axiosClient đã return response.data
      let data = [];
      let total = 0;

      // Cấu trúc: { data: [...], metadata: { total, totalPage, page, size } }
      if (response?.data && Array.isArray(response.data) && response?.metadata) {
        data = response.data;
        total = response.metadata.total ?? response.metadata.totalElements ?? 0;
        console.log('📦 Custom format with metadata - total:', total);
      }
      // Nếu response là Page object (có content và totalElements) - Spring Page format
      else if (response?.content && Array.isArray(response.content)) {
        data = response.content;
        total = response.totalElements ?? response.total ?? 0;
        console.log('📦 Spring Page object - totalElements:', total);
      }
      // Nếu response có data.content (nested structure)
      else if (response?.data?.content && Array.isArray(response.data.content)) {
        data = response.data.content;
        total = response.data.totalElements ?? response.data.total ?? response.data.metadata?.total ?? 0;
        console.log('📦 Nested page object - totalElements:', total);
      }
      // Nếu response.data là array trực tiếp (không có metadata)
      else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
        total = response.totalElements ?? response.total ?? response.data.length;
        console.log('📦 Array in data property - total:', total);
      }
      // Nếu response là array trực tiếp
      else if (Array.isArray(response)) {
        data = response;
        total = response.length;
        console.log('📦 Direct array - length:', total);
      }

      console.log('📦 Final data count:', data.length, 'Total count:', total);

      setProducts(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error?.response?.data?.message || error.message || 'Không thể tải danh sách sản phẩm');
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
    }
  };

  // Products are already filtered by API
  const filteredProducts = products;

  // Get available statuses from products
  const availableStatuses = React.useMemo(() => {
    const statuses = new Set();
    products.forEach(product => {
      const isActive = product.isActive !== false;
      statuses.add(isActive ? 'active' : 'inactive');
    });
    return Array.from(statuses);
  }, [products]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('ALL');
    setFilterStatus('ALL');
    setSortOrder('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm || filterCategory !== 'ALL' || filterStatus !== 'ALL' || sortOrder;

  const handleEditProduct = (product) => {
    const productId = product.id || product._id;
    if (productId) {
      navigate(`/supplier/${supplierId}/edit-product/${productId}`);
    }
  };

  const handleDeleteClick = (product) => {
    const productId = product.id || product._id;
    setDeleteDialog({
      open: true,
      productId,
      productName: product.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.productId) return;

    try {
      await productApi.deleteProduct(deleteDialog.productId);
      setSnackbar({ open: true, message: 'Xóa sản phẩm thành công!', severity: 'success' });
      setDeleteDialog({ open: false, productId: null, productName: '' });
      fetchProducts(); // Reload products
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể xóa sản phẩm',
        severity: 'error'
      });
    }
  };

  const handleViewDetail = async (product) => {
    const productId = product.id || product._id;
    if (!productId) return;

    setDetailDialog({ open: true, product: null, loading: true });

    try {
      const response = await productApi.getProductById(productId);
      const productDetail = response?.data || response;
      setDetailDialog({ open: true, product: productDetail, loading: false });
    } catch (error) {
      console.error('Error fetching product detail:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể tải chi tiết sản phẩm',
        severity: 'error'
      });
      setDetailDialog({ open: false, product: null, loading: false });
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialog({ open: false, product: null, loading: false });
  };


  const handleToggleStatus = async (product) => {
    try {
      const productId = product.id || product._id;
      if (!productId) {
        setSnackbar({
          open: true,
          message: 'Không tìm thấy ID sản phẩm',
          severity: 'error',
        });
        return;
      }

      const newStatus = product.isActive !== false ? false : true;
      await productApi.changeProductState(productId, newStatus);
      setSnackbar({
        open: true,
        message: newStatus ? 'Kích hoạt sản phẩm thành công!' : 'Tạm dừng sản phẩm thành công!',
        severity: 'success'
      });
      fetchProducts(); // Reload products
    } catch (error) {
      console.error('Error changing product state:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể thay đổi trạng thái sản phẩm',
        severity: 'error'
      });
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Chưa phân loại';
    const category = categories.find(cat => cat.id === categoryId || cat._id === categoryId);
    return category?.name || 'Chưa phân loại';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  if (loading && products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm, dịch vụ..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(0);
                  }
                }}
                onBlur={() => setPage(0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                  },
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filterCategory}
                  label="Danh mục"
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id || category._id} value={category.id || category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <MenuItem value="ALL">Tất cả</MenuItem>
                  {availableStatuses.includes('active') && (
                    <MenuItem value="active">Đang bán</MenuItem>
                  )}
                  {availableStatuses.includes('inactive') && (
                    <MenuItem value="inactive">Tạm dừng</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth   size="small">
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sắp xếp"
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    minWidth : 120,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <MenuItem value="">Mặc định</MenuItem>
                  <MenuItem value="price_asc">Giá: Thấp → Cao</MenuItem>
                  <MenuItem value="price_desc">Giá: Cao → Thấp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Create Button - Separate Row */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/supplier/${supplierId}/create-product`)}
            >
              Tạo dịch vụ
            </StyledButton>
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 8, gap: 2 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải...
          </Typography>
        </Box>
      ) : products.length === 0 ? (
        <EmptyStateBox>
          <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có sản phẩm/dịch vụ
          </Typography>
        </EmptyStateBox>
      ) : (
        <CommonTable
          columns={[
            {
              field: 'stt',
              headerName: 'STT',
              width: 60,
              align: 'center',
              headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
              cellSx: { fontSize: '0.9rem', textAlign: 'center' },
              render: (value, row, rowIndex) => rowIndex + page * rowsPerPage + 1,
            },
            {
              field: 'images',
              headerName: 'Hình ảnh',
              width: 100,
              align: 'center',
              render: (value, row) => (
                <ProductImage
                  src={row.images && row.images.length > 0 ? row.images[0] : null}
                  alt={row.name}
                  variant="rounded"
                >
                  <ImageIcon />
                </ProductImage>
              ),
            },
            {
              field: 'name',
              headerName: 'Tên dịch vụ',
              flex: 1.5,
              render: (value) => (
                <Typography variant="body2" color="text.primary">
                  {value}
                </Typography>
              ),
            },
            
            {
              field: 'categoryId',
              headerName: 'Danh mục',
              width: 160,
              render: (value) => (
                <CategoryChip
                  label={getCategoryName(value)}
                  size="small"
                />
              ),
            },
            {
              field: 'price',
              headerName: 'Giá',
              width: 150,
              align: 'right',
              render: (value) => (
                <Typography variant="body2" color="text.primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0,
                  }).format(value || 0)}
                </Typography>
              ),
            },
            {
              field: 'isActive',
              headerName: 'Trạng thái',
              width: 140,
              align: 'center',
              render: (value, row) => (
                <Tooltip title={value !== false ? 'Nhấn để tạm dừng' : 'Nhấn để kích hoạt'}>
                  <Switch
                    checked={value !== false}
                    onChange={() => handleToggleStatus(row)}
                    size="small"
                    color="success"
                    disabled={loading}
                  />
                </Tooltip>
              ),
            },
            {
              field: 'actions',
              headerName: 'Thao tác',
              width: 150,
              align: 'center',
              render: (value, row) => {
                const productId = row.id || row._id;
                return (
                  <Box display="flex" gap={1} justifyContent="center">
                    {/* <Tooltip title="Xem chi tiết">
                      <ActionButton
                        size="small"
                        color="info"
                        onClick={() => handleViewDetail(row)}
                        disabled={!productId || loading}
                      >
                        <InfoIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip> */}
                    <Tooltip title="Chi tiết">
                      <ActionButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditProduct(row)}
                        disabled={!productId || loading}
                      >
                        <InfoIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <ActionButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row)}
                        disabled={!productId || loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ]}
          data={products}
          loading={loading}
          rowsPerPage={rowsPerPage}
          page={page}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newPageSize) => {
            setRowsPerPage(newPageSize);
            setPage(0);
          }}
          emptyMessage="Không có dịch vụ nào"
          maxHeight={600}
          minHeight={600}
        />
      )}

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, productId: null, productName: '' })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 600 }}>
          Xác nhận xóa dịch vụ
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa dịch vụ <strong>"{deleteDialog.productName}"</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, productId: null, productName: '' })}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
            startIcon={<DeleteIcon />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Detail Dialog - Layout giống trang EditProduct */}
      <Dialog
        open={detailDialog.open}
        onClose={handleCloseDetailDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          {detailDialog.loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress size={50} thickness={4} />
            </Box>
          ) : detailDialog.product ? (
            <Box>
              {/* Header - giống EditProduct */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4,
                  p: 3,
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha('#ff6b9d', 0.06)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #ff6b9d 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
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
                    Chi tiết sản phẩm/dịch vụ
                  </Typography>

                </Box>
                <IconButton
                  onClick={handleCloseDetailDialog}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: 'error.main',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Grid container spacing={3}>


                {/* Detail Section - Right Side (giống EditProduct nhưng chỉ hiển thị) */}
                <Grid item xs={12} md={8}>
                  <Paper
                    sx={{
                      borderRadius: 2.5,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      background: theme.palette.background.paper,
                      p: 3,
                    }}
                  >
                    <Box sx={{ maxWidth: 700, ml: 'auto' }}>
                      <Grid container spacing={2.5}>
                        {/* Tên sản phẩm */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                              Tên sản phẩm/Dịch vụ
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {detailDialog.product.name || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>



                        {/* Mô tả */}
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              minHeight: 100,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                              Mô tả
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {detailDialog.product.description || 'Không có mô tả'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Danh mục */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                              Danh mục
                            </Typography>
                            <Chip
                              label={detailDialog.product.category?.name || getCategoryName(detailDialog.product.categoryId)}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Grid>

                        {/* Giá */}
                        <Grid item xs={12} sm={3}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                              Giá
                            </Typography>
                            <Typography variant="body1" fontWeight={700} color="primary.main">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                                maximumFractionDigits: 0,
                              }).format(detailDialog.product.price || 0)}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Đơn vị */}
                        <Grid item xs={12} sm={3}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                              Đơn vị
                            </Typography>
                            <Typography variant="body1">
                              {detailDialog.product.unit || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>



                        {/* Hình ảnh */}
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                              Hình ảnh {detailDialog.product.images?.length > 0 && `(${detailDialog.product.images.length}/5)`}
                            </Typography>
                            {detailDialog.product.images && detailDialog.product.images.length > 0 ? (
                              <Grid container spacing={2}>
                                {detailDialog.product.images.map((image, index) => (
                                  <Grid item xs={6} sm={4} md={3} key={index}>
                                    <Box
                                      sx={{
                                        position: 'relative',
                                        borderRadius: 1.5,
                                        overflow: 'hidden',
                                        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                        border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-4px)',
                                          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
                                          borderColor: alpha(theme.palette.primary.main, 0.3),
                                        },
                                      }}
                                    >
                                      <img
                                        src={image}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                          width: '100%',
                                          height: 150,
                                          objectFit: 'cover',
                                          transition: 'transform 0.3s ease',
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Box
                                sx={{
                                  p: 3,
                                  borderRadius: 1.5,
                                  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">
                                  Chưa có hình ảnh
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>


                      </Grid>
                    </Box>
                  </Paper>

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
                      onClick={handleCloseDetailDialog}
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
                      Đóng
                    </Button>
                    <Button
                      onClick={() => {
                        handleCloseDetailDialog();
                        handleEditProduct(detailDialog.product);
                      }}
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1.5,
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
                        minWidth: 180,
                      }}
                    >
                      Chỉnh sửa sản phẩm
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <Typography color="text.secondary">Không có dữ liệu</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
