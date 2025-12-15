import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  styled,
  alpha,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useToast } from '../../../app/providers/ToastContext';
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import productApi from "../api/product.api";
import supplierApi from "../../supplier/api/supplier.api";
import QuoteRequestModal from "../components/QuoteRequestModal";
import ProductSummaryCard from "../components/ProductSummaryCard";
import ProductDescriptionCard from "../components/ProductDescriptionCard";
import SupplierInfoCard from "../components/SupplierInfoCard";

/**
 * Product Detail Page
 * Hiển thị chi tiết đầy đủ của một sản phẩm với layout chuyên nghiệp
 */

/**
 * Product Detail Page
 * Hiển thị chi tiết đầy đủ của một sản phẩm với layout chuyên nghiệp
 */

// Main container với responsive layout
const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 120px)',
  backgroundColor: theme.palette.background.default,
}));

// Content wrapper với max-width và auto margin để căn giữa
const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
  padding: theme.spacing(0, 2.5),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0, 2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1.5),
  },
}));

// Header box với breadcrumb
const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 0),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(1.5),
  },
}));

// Breadcrumb styling
const Breadcrumb = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
}));

// Section spacing
const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

export default function ProductDetail() {
  const { id: enterpriseId, productId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get user permissions
  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
  };

  const userId = getUserId();
  const { isOwner, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openQuoteModal, setOpenQuoteModal] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [loadingSupplier, setLoadingSupplier] = useState(false);

  // Check permission
  if (!permissionsLoading && !isOwner) {
    return (
      <Box sx={{ pb: 4 }}>
        <Alert severity="warning">
          Bạn không có quyền truy cập vào Thị Trường. Chỉ chủ doanh nghiệp mới có quyền này.
        </Alert>
      </Box>
    );
  }

  // Fetch product detail
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Call API to get product detail by ID
        const response = await productApi.getProductById(productId);
        
        // Map API response to component state - only use data from backend
        const productData = {
          id: response.id,
          name: response.name,
          code: response.code,
          description: response.description || "Không có mô tả",
          price: response.price || 0,
          unit: response.unit || "Chiếc",
          images: Array.isArray(response.images) && response.images.length > 0 
            ? response.images 
            : (response.images ? [response.images] : [`https://via.placeholder.com/800x800?text=${encodeURIComponent(response.name)}`]),
          category: (typeof response.category === 'object' && response.category?.name) 
            ? response.category.name 
            : "Khác",
          supplierId: response.supplierId,
          createdAt: response.createdAt,
        };

        setProduct(productData);

        // Fetch supplier info if supplierId exists
        if (response.supplierId) {
          try {
            setLoadingSupplier(true);
            const supplierResponse = await supplierApi.getSupplierById(response.supplierId);
            setSupplierInfo(supplierResponse?.data || supplierResponse);
          } catch (error) {
          } finally {
            setLoadingSupplier(false);
          }
        }
      } catch (error) {
        showToast("Lỗi khi tải chi tiết sản phẩm", "error", 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [enterpriseId, productId, showToast]);

  if (permissionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Alert severity="error">
        Không tìm thấy sản phẩm
      </Alert>
    );
  }

  return (
    <MainContainer>
      <ContentWrapper>
        {/* Header với Back Button và Breadcrumb */}
        <HeaderBox>
          <IconButton
            onClick={() => navigate(`/enterprise/${enterpriseId}/marketplace`)}
            size="small"
            sx={{ 
              mr: 0.5,
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Breadcrumb onClick={() => navigate(`/enterprise/${enterpriseId}/marketplace`)}>
              Marketplace
            </Breadcrumb>
          
            <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>›</Typography>
            <Typography 
              sx={{ 
                fontSize: '1.1rem', 
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              {product.name}
            </Typography>
          </Box>
        </HeaderBox>

        {/* Product Summary Card */}
        <Section>
          <ProductSummaryCard
            product={product}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            onRequestQuote={() => setOpenQuoteModal(true)}
          />
        </Section>

        {/* Product Description Card */}
        <Section>
          <ProductDescriptionCard description={product.description} />
        </Section>

        {/* Supplier Info Card */}
        <Section>
          <SupplierInfoCard 
            supplierInfo={supplierInfo} 
            loading={loadingSupplier} 
          />
        </Section>
      </ContentWrapper>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={openQuoteModal}
        onClose={() => setOpenQuoteModal(false)}
        product={product}
        enterpriseId={enterpriseId}
      />
    </MainContainer>
  );
}
