import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Container,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  styled,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Storefront as StorefrontIcon,
  ShoppingCart as ShoppingCartIcon,
  Inbox as InboxIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useToast } from '../../../app/providers/ToastContext';
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import { PERMISSION_CODES, PERMISSION_TYPES } from '../../../shared/constants/permissions';
import { debounce } from "lodash";
import productApi from "../api/product.api";
import categoryApi from "../api/category.api";

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

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 3),
  gap: theme.spacing(2),
}));

const FilterCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// Responsive grid cho danh sách sản phẩm
const ProductsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),

  // Mobile <600px
  gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
  justifyItems: "center",

  // Small devices ≥600px (2 cột)
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    justifyItems: "stretch",
  },

  // Medium devices ≥900px (3 cột)
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },

  // Large devices ≥1200px (4 cột)
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
}));


const ProductCard = styled(Card)(({ theme }) => ({
  height: 400,
  width:320,
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  overflow: "hidden",
  position: "relative",
  background: theme.palette.background.paper,
  transition: "all 0.2s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const ProductImageWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  // image 4:3
  paddingTop: "75%",
  backgroundColor: alpha(theme.palette.grey[100], 0.5),
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
}));

const ProductOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  background: alpha(theme.palette.common.black, 0.4),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s ease",
  zIndex: 2,
}));

const HoverActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
}));

const HoverActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  padding: theme.spacing(0.75, 2),
  fontSize: "0.875rem",
  background: theme.palette.primary.main,
  color: theme.palette.common.white,
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
  "&:hover": {
    background: theme.palette.primary.dark,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const HoverGhostButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  padding: theme.spacing(0.75, 2),
  fontSize: "0.875rem",
  color: theme.palette.common.white,
  border: `1px solid ${alpha(theme.palette.common.white, 0.9)}`,
  background: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    background: alpha(theme.palette.common.white, 0.25),
    borderColor: theme.palette.common.white,
  },
}));

const ProductDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  flexGrow: 1,
  padding: theme.spacing(1.5),
}));

const ProductDescription = styled(Typography)(({ theme }) => ({
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
}));

const ProductFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1.5, 1.5),
  gap: theme.spacing(1),
}));

const StyledProductCard = memo(({ product, onViewDetail }) => {
  const theme = useTheme();

  const productImage = product.images?.[0] || product.image || null;
  const displayPrice = product.price
    ? `${product.price.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫`
    : "Đang cập nhật";

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  return (
    <ProductCard onClick={() => onViewDetail(product)} role="button">
      <ProductImageWrapper>
        {productImage ? (
          <Box
            component="img"
            src={productImage}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          </Box>
        )}

        <ProductOverlay className="product-overlay">
          <HoverActions>
            <HoverActionButton
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(product);
              }}
            >
              Chi tiết
            </HoverActionButton>
          </HoverActions>
        </ProductOverlay>
      </ProductImageWrapper>

      <ProductDetails>
        <Typography
          variant="body1"
          component="h3"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(product);
          }}
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.8rem",
            mb: 0.5,
            color: theme.palette.text.primary,
            cursor: "pointer",
            transition: "color 0.2s ease",
            "&:hover": {
              color: theme.palette.primary.main,
            },
          }}
        >
          {product.name}
        </Typography>

        {categoryName && (
          <Chip
            label={categoryName}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              fontWeight: 500,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              alignSelf: "flex-start",
              mb: 0.5,
            }}
          />
        )}

        <ProductDescription>
          {product.description ||
            "Nhà cung cấp chưa thêm mô tả cho dịch vụ này."}
        </ProductDescription>

        <ProductFooter>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, flex: 1 }}>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: "1.125rem",
                color: theme.palette.primary.main,
              }}
            >
              {displayPrice}
            </Typography>
            {product.unit && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                / {product.unit}
              </Typography>
            )}
          </Box>
        </ProductFooter>
      </ProductDetails>
    </ProductCard>
  );
});

StyledProductCard.displayName = "StyledProductCard";

export default function EnterpriseMarketplace() {
  const { id: enterpriseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get user permissions
  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
  };

  const userId = getUserId();
  const { isOwner, hasPermission, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);
  const canAccessMarketplace = isOwner || hasPermission(PERMISSION_CODES.MARKETPLACE_VIEW, PERMISSION_TYPES.ENTERPRISE);

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Filter state
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState(""); // Temp input before search
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [categories, setCategories] = useState([]);

  // Scroll ref
  const productsGridRef = useRef(null);

  // Load categories
  useEffect(() => {
    if (!permissionsLoading && !canAccessMarketplace) return;

    const loadCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        const categoryList = Array.isArray(response) ? response : response.data || [];
        setCategories(categoryList);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh mục";
        showToast(errorMessage, "error", 3000);
        setCategories([]);
      }
    };
    loadCategories();
  }, [canAccessMarketplace, permissionsLoading, showToast]);

  // Fetch products with lazy load
  const fetchProducts = useCallback(async (pageNum = 0, isLoadMore = false) => {
    if (!permissionsLoading && !canAccessMarketplace) return;

    try {
      setLoading(true);

      const filters = {};
      if (keyword) {
        filters.keyword = keyword;
      }
      if (selectedCategory) {
        filters.categoryIds = [parseInt(selectedCategory)];
      }

      // Build sort parameter
      let sortParam = null;
      if (sortOrder === 'price_asc') {
        sortParam = 'price,asc';
      } else if (sortOrder === 'price_desc') {
        sortParam = 'price,desc';
      } else if (sortOrder === 'name_asc') {
        sortParam = 'name,asc';
      } else if (sortOrder === 'name_desc') {
        sortParam = 'name,desc';
      }

      const response = await productApi.getProducts(filters, pageNum, pageSize, sortParam);

      // Handle different response structures
      let fetchedProducts = [];
      let total = 0;
      let totalPages = 0;

      // Case 1: Paginated response with content array
      if (response?.content && Array.isArray(response.content)) {
        fetchedProducts = response.content;
        total = response.totalElements || response.total || 0;
        totalPages = response.totalPages || Math.ceil(total / pageSize);
      }
      // Case 2: Response has data.content
      else if (response?.data?.content && Array.isArray(response.data.content)) {
        fetchedProducts = response.data.content;
        total = response.data.totalElements || response.data.total || 0;
        totalPages = response.data.totalPages || Math.ceil(total / pageSize);
      }
      // Case 3: Response has data array directly
      else if (response?.data && Array.isArray(response.data)) {
        fetchedProducts = response.data;
        total = response.totalElements || response.total || response.data.length;
        totalPages = response.totalPages || Math.ceil(total / pageSize);
      }
      // Case 4: Response is array directly
      else if (Array.isArray(response)) {
        fetchedProducts = response;
        total = response.length;
        totalPages = 1;
      }
      // Case 5: Response has products array
      else if (response?.products && Array.isArray(response.products)) {
        fetchedProducts = response.products;
        total = response.total || response.products.length;
        totalPages = response.totalPages || Math.ceil(total / pageSize);
      }

      if (isLoadMore) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }

      setHasMore(pageNum < totalPages - 1);
      setPage(pageNum);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách sản phẩm";
      showToast(errorMessage, "error", 3000);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, keyword, sortOrder, showToast, permissionsLoading, canAccessMarketplace]);

  // Initial fetch
  useEffect(() => {
    if (!permissionsLoading && !canAccessMarketplace) return;

    setPage(0);
    setProducts([]);
    fetchProducts(0, false);
  }, [keyword, selectedCategory, sortOrder, fetchProducts, canAccessMarketplace, permissionsLoading]);

  // Handle scroll for lazy load
  const handleProductsScroll = useCallback((e) => {
    const scrollContainer = e.target;
    const isNearBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;

    if (isNearBottom && hasMore && !loading) {
      fetchProducts(page + 1, true);
    }
  }, [page, hasMore, loading, fetchProducts]);

  // Search handlers
  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter") {
      setKeyword(keywordInput);
    }
  };

  const handleKeywordSearch = () => {
    setKeyword(keywordInput);
  };

  
    const PageContainer = styled(Container)(({ theme }) => ({
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    }));
  
    const FormCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    maxWidth: 900,
    margin: '0 auto',
    }));
  
    const LockedOverlay = styled(Box)(({ theme }) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(6),
      textAlign: 'center',
    }));

  // Sync keywordInput with keyword on mount
  React.useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const handleViewDetail = useCallback((product) => {
    navigate(`/enterprise/${enterpriseId}/marketplace/${product.id}`);
  }, [navigate, enterpriseId]);

  if (permissionsLoading) {
    return (
      <LoadingBox>
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Đang tải dữ liệu...
        </Typography>
      </LoadingBox>
    );
  }

  if (!permissionsLoading && !canAccessMarketplace) {
    return (
      <PageContainer maxWidth="sm">
        <FormCard>
          <CardContent>
            <LockedOverlay>
              <LockIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.warning.main,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Truy cập bị từ chối
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Bạn không có quyền truy cập trị trường.
              </Typography>
            </LockedOverlay>
          </CardContent>
        </FormCard>
      </PageContainer>
    );
  }

  return (
    <Box>
      {/* Filters -  */}
      <FilterCard>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm, dịch vụ ..."
                variant="outlined"
                size="small"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                onBlur={handleKeywordSearch}
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" variant="outlined"
                              sx={{ minWidth: 110 }}   >
                <InputLabel id="category-label" sx={{ fontSize: '0.875rem' }}>Danh mục</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Danh mục"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 40 * 5 + 8,
                      },
                    },
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
                  <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
                    <em>Tất cả danh mục</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '0.875rem' }}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" variant="outlined" 
                              sx={{ minWidth: 100 }}   >
                <InputLabel id="sort-label" sx={{ fontSize: '0.875rem' }}>Sắp xếp</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Sắp xếp"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 40 * 5 + 8,
                      },
                    },
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
                  <MenuItem value="" sx={{ fontSize: '0.875rem' }}>Mặc định</MenuItem>
                  <MenuItem value="price_asc" sx={{ fontSize: '0.875rem' }}>Giá: Thấp → Cao</MenuItem>
                  <MenuItem value="price_desc" sx={{ fontSize: '0.875rem' }}>Giá: Cao → Thấp</MenuItem>
                  <MenuItem value="name_asc" sx={{ fontSize: '0.875rem' }}>Tên: A → Z</MenuItem>
                  <MenuItem value="name_desc" sx={{ fontSize: '0.875rem' }}>Tên: Z → A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </FilterCard>

      {/* Content */}
      {loading && products.length === 0 ? (
        <LoadingBox>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải...
          </Typography>
        </LoadingBox>
      ) : products.length === 0 ? (
        <EmptyStateBox>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Không tìm thấy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Không có dịch vụ nào phù hợp với bộ lọc bạn đã chọn.
          </Typography>
        </EmptyStateBox>
      ) : (
        <Box
          sx={{
            maxHeight: "calc(100vh - 280px)",
            overflowY: "auto",
            paddingRight: 1,
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: alpha(theme.palette.divider, 0.1),
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.primary.main, 0.5),
              borderRadius: 4,
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.7),
              },
            },
          }}
          onScroll={handleProductsScroll}
          ref={productsGridRef}
        >
          <ProductsGrid>
            {products.map((product) => (
              <Box
                key={product.id}
                sx={{
                  height: "100%",
                  display: "flex",
                }}
              >
                <StyledProductCard
                  product={product}
                  onViewDetail={handleViewDetail}
                />
              </Box>
            ))}
          </ProductsGrid>

          {/* Loading more indicator */}
          {loading && products.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {/* No more data */}
          {!hasMore && products.length > 0 && (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Không còn dịch vụ nào
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
