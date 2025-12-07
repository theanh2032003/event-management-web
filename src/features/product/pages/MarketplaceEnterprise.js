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
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import { debounce } from "lodash";
import productApi from "../api/product.api";
import categoryApi from "../api/category.api";

// Styled Components - Matching EventManagement style
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

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
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
  paddingTop: "100%", // 1:1 aspect ratio
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
            "Nhà cung cấp chưa thêm mô tả cho sản phẩm này."}
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
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get user permissions
  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
  };

  const userId = getUserId();
  const { isOwner, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 12;
  
  // Filter state
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [categories, setCategories] = useState([]);
  
  // Scroll ref
  const productsGridRef = useRef(null);

  // Check permission
  if (!permissionsLoading && !isOwner) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Bạn không có quyền truy cập vào Thị Trường. Chỉ chủ doanh nghiệp mới có quyền này.
        </Alert>
      </Box>
    );
  }

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        const categoryList = Array.isArray(response) ? response : response.data || [];
        setCategories(categoryList);
      } catch (error) {
        console.error("Error loading categories:", error);
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh mục";
        enqueueSnackbar(errorMessage, { variant: "error" });
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Fetch products with lazy load
  const fetchProducts = useCallback(async (pageNum = 0, isLoadMore = false) => {
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
      const fetchedProducts = response.data || response.products || [];

      if (isLoadMore) {
        setProducts(prev => [...prev, ...fetchedProducts]);
      } else {
        setProducts(fetchedProducts);
      }

      const totalPages = response.totalPages || Math.ceil((response.total || 0) / pageSize);
      setHasMore(pageNum < totalPages - 1);
      setPage(pageNum);
    } catch (error) {
      console.error("[MARKETPLACE] Error fetching products:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách sản phẩm";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, keyword, enqueueSnackbar]);

  // Initial fetch
  useEffect(() => {
    setPage(0);
    setProducts([]);
    fetchProducts(0, false);
  }, [keyword, selectedCategory, sortOrder]);

  // Handle scroll for lazy load
  const handleProductsScroll = useCallback((e) => {
    const scrollContainer = e.target;
    const isNearBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;

    if (isNearBottom && hasMore && !loading) {
      fetchProducts(page + 1, true);
    }
  }, [page, hasMore, loading, fetchProducts]);

  // Debounce search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setKeyword(value);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

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

  return (
    <Box>
      {/* Filters - Shopee Style */}
      <FilterCard>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" >
            {/* Search */}
            <Grid item xs={12} md={6} sx={{width: '50%'}}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm..."
                variant="outlined"
                size="medium"
                onChange={handleSearchChange}
                defaultValue=""
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary", fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                  },
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={3} sx={{width: '20%'}}>
              <FormControl fullWidth size="medium" variant="outlined">
                <InputLabel id="category-label" sx={{ fontSize: '1rem' }}>Danh mục</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Danh mục"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 5 + 8,
                      },
                    },
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: '1rem' }}>
                    <em>Tất cả danh mục</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: '1rem' }}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Filter */}
            <Grid item xs={12} sm={6} md={3} sx={{width: '20%'}}>
              <FormControl fullWidth size="medium" variant="outlined">
                <InputLabel id="sort-label" sx={{ fontSize: '1rem' }}>Sắp xếp</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Sắp xếp"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 5 + 8,
                      },
                    },
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.6),
                    transition: 'all 0.2s ease',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: '1rem' }}>Mặc định</MenuItem>
                  <MenuItem value="price_asc" sx={{ fontSize: '1rem' }}>Giá: Thấp → Cao</MenuItem>
                  <MenuItem value="price_desc" sx={{ fontSize: '1rem' }}>Giá: Cao → Thấp</MenuItem>
                  <MenuItem value="name_asc" sx={{ fontSize: '1rem' }}>Tên: A → Z</MenuItem>
                  <MenuItem value="name_desc" sx={{ fontSize: '1rem' }}>Tên: Z → A</MenuItem>
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
            Đang tải sản phẩm...
          </Typography>
        </LoadingBox>
      ) : products.length === 0 ? (
        <EmptyStateBox>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Không tìm thấy sản phẩm
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Không có sản phẩm nào phù hợp với bộ lọc bạn đã chọn.
          </Typography>
        </EmptyStateBox>
      ) : (
        <Box
          sx={{
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
            paddingRight: 1,
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.divider, 0.1),
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.5),
              borderRadius: 4,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.7),
              },
            },
          }}
          onScroll={handleProductsScroll}
          ref={productsGridRef}
        >
          <Grid 
            container 
            spacing={2}
            sx={{
              justifyContent: 'center',
            }}
          >
            {products.map((product) => (
              <Grid 
                item 
                xs={6} 
                sm={4} 
                md={3} 
                key={product.id} 
                sx={{ 
                  display: "flex",
                  [theme.breakpoints.up('lg')]: {
                    flexBasis: '20%',
                    maxWidth: '20%',
                  },
                  [theme.breakpoints.up('xl')]: {
                    flexBasis: '16.666667%',
                    maxWidth: '16.666667%',
                  },
                }}
              >
                <StyledProductCard
                  product={product}
                  onViewDetail={handleViewDetail}
                />
              </Grid>
            ))}
          </Grid>

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
                Không còn sản phẩm nào
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
