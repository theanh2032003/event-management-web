import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  RequestQuote as RequestQuoteIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventNoteIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  LocalAtm as LocalAtmIcon,
  AccountBalance as AccountBalanceIcon,
  Security as SecurityIcon,
  Percent as PercentIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import rfqApi from "../api/rfq.api";
import quoteApi from "../../quote/api/quote.api";
import { CommonTable } from "../../../shared/components/CommonTable";

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

// Helpers cho giá/currency
const currencyFields = new Set([
  "unitPrice",
  "tax",
  "discount",
  "shippingFee",
  "otherFee"
]);

const sanitizeCurrencyValue = (value) =>
  value?.toString().replace(/[^\d]/g, "") || "";

const getCurrencyNumber = (value) => {
  const sanitized = sanitizeCurrencyValue(value);
  if (!sanitized) return 0;
  return parseInt(sanitized, 10) || 0;
};

const formatCurrency = (value) => {
  const sanitized = sanitizeCurrencyValue(value);
  if (!sanitized) return "";
  const num = parseInt(sanitized, 10);
  return num.toLocaleString("vi-VN");
};

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



const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.8),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&.Mui-disabled': {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.3),
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.5),
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

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const bigInputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 52,
    fontSize: 15,
  },
  '& input': {
    padding: '14px 14px',
  },
  '& textarea': {
    padding: '14px',
    fontSize: 15,
    lineHeight: 1.6,
  },
  '& .MuiInputLabel-root': {
    fontSize: 14,
  },
};


export default function RFQ() {
  const { id: supplierId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data states
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [createQuoteOpen, setCreateQuoteOpen] = useState(false);
  const [createQuoteSubmitting, setCreateQuoteSubmitting] = useState(false);
  
  // Create quote form data
  const [createQuoteFormData, setCreateQuoteFormData] = useState({
    name: "",
    expiredAt: "",
    quantity: "",
    unitPrice: "",
    totalPrice: "",
    tax: "",
    discount: "",
    shippingFee: "",
    otherFee: "",
    finalPrice: "",
    paymentMethod: "VNPAY",
    paymentTerms: "",
    guarantee: "",
    files: [],
  });

  const quoteNameFieldWidth = isMobile
    ? "100%"
    : `${Math.max(
        360,
        Math.min(((createQuoteFormData.name?.length || 0) + 10) * 12, 820)
      )}px`;

  // Fetch RFQs
  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        setLoading(true);
        
        const filters = {};
        if (filterProjectId) {
          filters.projectId = filterProjectId;
        }
        if (filterKeyword) {
          filters.keyword = filterKeyword;
        }

        const response = await rfqApi.getRfqs(filters, page, rowsPerPage);
        
        // Handle different response formats
        if (response?.data && Array.isArray(response.data)) {
          setRfqs(response.data);
          setTotalCount(response.metadata?.total || response.data.length);
        } else if (response?.content && Array.isArray(response.content)) {
          setRfqs(response.content);
          setTotalCount(response.totalElements || response.total || 0);
        } else if (Array.isArray(response)) {
          setRfqs(response);
          setTotalCount(response.length);
        } else {
          setRfqs([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("[RFQ] ❌ Error fetching RFQs:", error);
        enqueueSnackbar(
          error?.response?.data?.message || "Lỗi khi tải danh sách yêu cầu báo giá. Vui lòng thử lại.",
          { variant: "error" }
        );
        setRfqs([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRfqs();
  }, [page, rowsPerPage, filterKeyword, filterProjectId, enqueueSnackbar]);

  const handleOpenDetail = (rfq) => {
    setSelectedRfq(rfq);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedRfq(null);
  };

  const handleOpenCreateQuote = (rfq) => {
    setSelectedRfq(rfq);
    // Lấy giá sản phẩm từ RFQ nếu có
    const productPrice = rfq.product?.price || 0;
    const unitPrice = productPrice > 0 ? productPrice.toString() : "";

    // Tính tổng giá nếu có số lượng và đơn giá
    const quantity = parseFloat(rfq.quantity) || 0;
    const price = getCurrencyNumber(unitPrice);
    const totalPrice =
      quantity > 0 && price > 0 ? (quantity * price).toString() : "";
    const finalPrice = totalPrice || "";

    setCreateQuoteFormData({
      name: `Báo giá cho ${rfq.name || "RFQ"}`,
      expiredAt: rfq.expiredAt
        ? new Date(rfq.expiredAt).toISOString().slice(0, 16)
        : "",
      quantity: rfq.quantity?.toString() || "",
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      tax: "",
      discount: "",
      shippingFee: "",
      otherFee: "",
      finalPrice: finalPrice,
      paymentMethod: "VNPAY",
      paymentTerms: "",
      guarantee: "",
      files: [],
    });
    setCreateQuoteOpen(true);
  };

  const handleCloseCreateQuote = () => {
    if (!createQuoteSubmitting) {
      setCreateQuoteOpen(false);
      setSelectedRfq(null);
      setCreateQuoteFormData({
        name: "",
        expiredAt: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
        tax: "",
        discount: "",
        shippingFee: "",
        otherFee: "",
        finalPrice: "",
        paymentMethod: "VNPAY",
        paymentTerms: "",
        guarantee: "",
        files: [],
      });
    }
  };

  const handleCreateQuoteInputChange = (e) => {
    const { name, value } = e.target;
    setCreateQuoteFormData((prev) => {
      const moneyFields = ["unitPrice", "tax", "discount", "shippingFee", "otherFee"];
      const newData = { ...prev };

      // Chuẩn hóa input cho các trường tiền tệ: chỉ giữ số, bỏ dấu chấm
      if (moneyFields.includes(name)) {
        const numeric = value.replace(/[^\d]/g, "");
        newData[name] = numeric;
      } else {
        newData[name] = value;
      }

      // Auto-calculate totalPrice khi thay đổi quantity hoặc unitPrice (không thập phân)
      if (name === "quantity" || name === "unitPrice") {
        const qty = parseFloat(newData.quantity) || 0;
        const unitPrice = parseFloat(newData.unitPrice) || 0;
        newData.totalPrice = qty > 0 && unitPrice > 0 ? (qty * unitPrice).toFixed(0) : "";
      }

      // Auto-calculate finalPrice khi thay đổi bất kỳ field liên quan chi phí
      if (
        name === "quantity" ||
        name === "unitPrice" ||
        name === "totalPrice" ||
        name === "tax" ||
        name === "discount" ||
        name === "shippingFee" ||
        name === "otherFee"
      ) {
        const totalPrice = parseFloat(newData.totalPrice) || 0;
        const tax = parseFloat(newData.tax) || 0;
        const discount = parseFloat(newData.discount) || 0;
        const shippingFee = parseFloat(newData.shippingFee) || 0;
        const otherFee = parseFloat(newData.otherFee) || 0;
        const final = totalPrice + tax - discount + shippingFee + otherFee;
        newData.finalPrice = final > 0 ? final.toFixed(0) : "";
      }

      return newData;
    });
  };

  const handleCreateQuoteSubmit = async () => {
    try {
      if (!createQuoteFormData.name.trim()) {
        enqueueSnackbar("Vui lòng nhập tên báo giá", { variant: "error" });
        return;
      }

      if (!createQuoteFormData.expiredAt) {
        enqueueSnackbar("Vui lòng chọn ngày hết hạn", { variant: "error" });
        return;
      }

      if (!createQuoteFormData.quantity || parseFloat(createQuoteFormData.quantity) <= 0) {
        enqueueSnackbar("Vui lòng nhập số lượng hợp lệ", { variant: "error" });
        return;
      }

      if (!createQuoteFormData.unitPrice || parseFloat(createQuoteFormData.unitPrice) <= 0) {
        enqueueSnackbar("Vui lòng nhập đơn giá hợp lệ", { variant: "error" });
        return;
      }

      setCreateQuoteSubmitting(true);

      const expiredAtISO = new Date(createQuoteFormData.expiredAt).toISOString();

      const quoteData = {
        rfqId: selectedRfq.id,
        name: createQuoteFormData.name,
        expiredAt: expiredAtISO,
        quantity: parseFloat(createQuoteFormData.quantity),
        unitPrice: parseFloat(createQuoteFormData.unitPrice),
        totalPrice: parseFloat(createQuoteFormData.totalPrice) || 0,
        tax: parseFloat(createQuoteFormData.tax) || 0,
        discount: parseFloat(createQuoteFormData.discount) || 0,
        shippingFee: parseFloat(createQuoteFormData.shippingFee) || 0,
        otherFee: parseFloat(createQuoteFormData.otherFee) || 0,
        finalPrice: parseFloat(createQuoteFormData.finalPrice) || 0,
        paymentMethod: createQuoteFormData.paymentMethod,
        paymentTerms: createQuoteFormData.paymentTerms || null,
        guarantee: createQuoteFormData.guarantee || null,
        files: createQuoteFormData.files || [],
      };

      await quoteApi.createQuote(quoteData);

      enqueueSnackbar("Tạo báo giá thành công", { variant: "success" });
      
      // Refresh RFQ list
      const filters = {};
      if (filterProjectId) filters.projectId = filterProjectId;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await rfqApi.getRfqs(filters, page, rowsPerPage);
      if (response?.data && Array.isArray(response.data)) {
        setRfqs(response.data);
        setTotalCount(response.metadata?.total || response.data.length);
      } else if (response?.content && Array.isArray(response.content)) {
        setRfqs(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setRfqs(response);
        setTotalCount(response.length);
      }

      handleCloseCreateQuote();
    } catch (error) {
      console.error("[RFQ] ❌ Error creating quote:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi tạo báo giá. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setCreateQuoteSubmitting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStateLabel = (state) => {
    const labels = {
      DRAFT: "Nháp",
      SUBMITTED: "Đã gửi",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
      EXPIRED: "Hết hạn",
    };
    return labels[state] || state;
  };

  const getStateColor = (state) => {
    const colors = {
      DRAFT: "default",
      SUBMITTED: "info",
      APPROVED: "success",
      REJECTED: "error",
      EXPIRED: "warning",
    };
    return colors[state] || "default";
  };

  return (
    <Box>

      {/* Filters */}
      <FilterCard>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <TextField
              label="Tìm kiếm"
              size="small"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="Tìm theo tên yêu cầu, doanh nghiệp..."
              sx={{ 
                minWidth: 250, 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
              }}
            />

            {/* <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Dự án</InputLabel>
              <Select
                value={filterProjectId}
                label="Dự án"
                onChange={(e) => setFilterProjectId(e.target.value)}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="">Tất cả dự án</MenuItem>
              </Select>
            </FormControl> */}
          </Box>
        </CardContent>
      </FilterCard>

      {/* Content */}
      {loading ? (
        <LoadingBox>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải danh sách yêu cầu báo giá...
          </Typography>
        </LoadingBox>
      ) : rfqs.length === 0 ? (
        <EmptyStateBox>
          <RequestQuoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có yêu cầu báo giá
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Các yêu cầu báo giá từ doanh nghiệp sẽ hiển thị ở đây
          </Typography>
        </EmptyStateBox>
      ) : (
        <CommonTable
          columns={[
            {
              field: 'name',
              headerName: 'Tên yêu cầu',
              flex: 1.5,
              minWidth: 200,
              render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {value || "N/A"}
                </Typography>
              ),
            },
            {
              field: 'enterprise',
              headerName: 'Doanh nghiệp',
              flex: 1.2,
              minWidth: 150,
              render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {value?.name || "N/A"}
                </Typography>
              ),
            },
            {
              field: 'quantity',
              headerName: 'Số lượng',
              width: 120,
              align: 'center',
              render: (value) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {value?.toLocaleString("vi-VN") || "N/A"}
                </Typography>
              ),
            },
            {
              field: 'expiredAt',
              headerName: 'Ngày hết hạn',
              flex: 1.1,
              minWidth: 150,
              render: (value) => {
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(value)}
                    </Typography>
                  </Box>
                );
              },
            },
            {
              field: 'createdAt',
              headerName: 'Ngày tạo',
              flex: 1,
              minWidth: 150,
              render: (value) => (
                <Typography variant="body2" color="text.secondary">
                  {formatDate(value)}
                </Typography>
              ),
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              width: 140,
              align: 'center',
              render: (value, row) => {
                const isExpired = new Date(row.expiredAt) < new Date();
                return isExpired ? (
                  <Chip
                    label="Đã hết hạn"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                    <Tooltip title="Xem chi tiết yêu cầu báo giá" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetail(row)}
                        sx={{
                          color: theme.palette.info.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Tạo báo giá cho yêu cầu này" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCreateQuote(row)}
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ]}
          data={rfqs}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          emptyMessage="Không có yêu cầu báo giá"
        />
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={detailOpen} 
        onClose={handleCloseDetail} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.spacing(3),
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pr: 2,
          pt: 3,
          pb: 2,
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RequestQuoteIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Chi tiết yêu cầu báo giá
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thông tin chi tiết về yêu cầu báo giá từ doanh nghiệp
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseDetail}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedRfq && (
            <Stack spacing={3}>
              {/* Thông tin yêu cầu */}
              <SectionCard elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RequestQuoteIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Thông tin yêu cầu
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Tên yêu cầu */}
                  <Grid item xs={12}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Tên yêu cầu
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {selectedRfq.name || "N/A"}
                    </Typography>
                  </Grid>

                  {/* Doanh nghiệp & Trạng thái */}
                  {selectedRfq.enterprise && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Doanh nghiệp
                      </Typography>
                      <Box sx={{ mt: 0.75 }}>
                        <Chip
                          label={selectedRfq.enterprise.name || "N/A"}
                          sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                            color: theme.palette.secondary.main,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            height: 32,
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Trạng thái
                    </Typography>
                    <Box sx={{ mt: 0.75 }}>
                      <Chip
                        label={getStateLabel(selectedRfq.state)}
                        color={getStateColor(selectedRfq.state)}
                        size="medium"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Grid>

                  {/* Số lượng & Ngày tạo */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Số lượng
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: theme.palette.primary.main }}>
                      {selectedRfq.quantity?.toLocaleString("vi-VN") || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {formatDateTime(selectedRfq.createdAt)}
                    </Typography>
                  </Grid>

                  {/* Ngày hết hạn */}
                  <Grid item xs={12}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Ngày hết hạn
                    </Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color:
                            new Date(selectedRfq.expiredAt) < new Date()
                              ? theme.palette.error.main
                              : theme.palette.text.primary,
                        }}
                      >
                        {formatDateTime(selectedRfq.expiredAt)}
                      </Typography>
                      {new Date(selectedRfq.expiredAt) < new Date() && (
                        <Chip
                          label="Hết hạn"
                          size="small"
                          color="error"
                          icon={<CheckCircleIcon />}
                          sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Ghi chú */}
                  {selectedRfq.note && (
                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Ghi chú / Yêu cầu đặc biệt
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.75, lineHeight: 1.7 }}>
                        {selectedRfq.note}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </SectionCard>

              {/* Sản phẩm/Dịch vụ */}
              {selectedRfq.product && (
                <SectionCard elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InventoryIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Sản phẩm/Dịch vụ
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {selectedRfq.product.name || "N/A"}
                  </Typography>
                  {selectedRfq.product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {selectedRfq.product.description}
                    </Typography>
                  )}
                </SectionCard>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 2,
          background: alpha(theme.palette.background.default, 0.5),
        }}>
          <Button 
            onClick={handleCloseDetail}
            variant="outlined"
            sx={{ 
              borderRadius: theme.spacing(1.5), 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
              borderColor: alpha(theme.palette.divider, 0.3),
              color: 'text.primary',
              '&:hover': {
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
              },
            }}
          >
            Đóng
          </Button>
          {selectedRfq && (
            <Button 
              variant="contained"
              color="primary"
              onClick={() => {
                handleCloseDetail();
                handleOpenCreateQuote(selectedRfq);
              }}
              sx={{ 
                borderRadius: theme.spacing(1.5), 
                textTransform: 'none', 
                fontWeight: 600,
                px: 3,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Tạo báo giá
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Quote Dialog */}
      <Dialog 
        open={createQuoteOpen} 
        onClose={handleCloseCreateQuote} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.spacing(3),
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pr: 2,
          pt: 3,
          pb: 2,
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5,
                  background: theme.palette.primary.main,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tạo báo giá
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={4} sx={{ mt: 3, width: '100%' }}>

            {/* Tên báo giá */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <StyledTextField
                label="Tên báo giá *"
                name="name"
                value={createQuoteFormData.name}
                onChange={handleCreateQuoteInputChange}
                required
                fullWidth
                placeholder="VD: Báo giá Đèn Follow Spot 2500W - Tháng 11/2025"
                sx={bigInputSx}
              />
            </Grid>

            {/* Ngày hết hạn */}
            <Grid item xs={12} md={4} sx={{width: '100%'}}>
              <StyledTextField
                label="Ngày hết hạn *"
                name="expiredAt"
                type="datetime-local"
                value={createQuoteFormData.expiredAt}
                onChange={handleCreateQuoteInputChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={bigInputSx}
              />
            </Grid>

            {/* Số lượng */}
            <Grid item xs={12} sm={6} sx={{width: '100%'}}>
              <StyledTextField
                label="Số lượng"
                name="quantity"
                type="number"
                value={createQuoteFormData.quantity}
                onChange={handleCreateQuoteInputChange}
                required
                fullWidth
                sx={bigInputSx}
              />
            </Grid>

            {/* Đơn giá */}
            <Grid item xs={12} sm={6} sx={{width: '100%'}}>
              <StyledTextField
                label="Đơn giá"
                name="unitPrice"
                value={formatCurrency(createQuoteFormData.unitPrice)}
                onChange={handleCreateQuoteInputChange}
                required
                fullWidth
                sx={{
                  ...bigInputSx
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography fontWeight={600}>₫</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Tổng giá */}
            <Grid item xs={12} sx={{width: '100%'}}>
              <StyledTextField
                label="Tổng giá"
                value={formatCurrency(createQuoteFormData.totalPrice)}
                fullWidth
                sx={{
                  ...bigInputSx
                }}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography fontWeight={600}>₫</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Thuế */}
            {/* <Grid item xs={12} sm={6}  sx={{width: '100%'}}>
              <StyledTextField
                label="Thuế"
                name="tax"
                value={formatCurrency(createQuoteFormData.tax)}
                onChange={handleCreateQuoteInputChange}
                fullWidth
                sx={bigInputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography>₫</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid> */}
            {/* Phí khác */}
            <Grid item xs={12} sm={6} sx={{width: '100%'}}>
              <StyledTextField
                label="Phụ phí"
                name="otherFee"
                value={formatCurrency(createQuoteFormData.otherFee)}
                onChange={handleCreateQuoteInputChange}
                fullWidth
                sx={bigInputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography>₫</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Giảm giá */}
            <Grid item xs={12} sm={6} sx={{width: '100%'}}>
              <StyledTextField
                label="Giảm giá"
                name="discount"
                value={formatCurrency(createQuoteFormData.discount)}
                onChange={handleCreateQuoteInputChange}
                fullWidth
                sx={bigInputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography>₫</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Giá cuối cùng */}
            <Grid item xs={12}  sx={{width: '100%'}}>
              <StyledTextField
                label="Giá cuối cùng"
                value={formatCurrency(createQuoteFormData.finalPrice)}
                fullWidth
                sx={{
                  ...bigInputSx
                }}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography>
                        ₫
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Phương thức thanh toán */}
            <Grid item xs={12} sm={6}  sx={{width: '100%'}}>
              <StyledFormControl fullWidth sx={{ minHeight: 52 }}>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  name="paymentMethod"
                  value={createQuoteFormData.paymentMethod}
                  onChange={handleCreateQuoteInputChange}
                  label="Phương thức thanh toán"
                >
                  <MenuItem value="VNPAY">VNPAY</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
                  <MenuItem value="CASH">Tiền mặt</MenuItem>
                  <MenuItem value="MOMO">Ví MOMO</MenuItem>
                  <MenuItem value="CREDIT_CARD">Thẻ tín dụng</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>

            {/* Điều khoản */}
            <Grid item xs={12} sx={{width: '100%'}}>
              <StyledTextField
                label="Điều khoản thanh toán"
                name="paymentTerms"
                value={createQuoteFormData.paymentTerms}
                onChange={handleCreateQuoteInputChange}
                multiline
                rows={2}
                fullWidth
                sx={bigInputSx}
              />
            </Grid>

            {/* Bảo hành */}
            <Grid item xs={12}  sx={{width: '100%'}}>
              <StyledTextField
                label="Bảo hành"
                name="guarantee"
                value={createQuoteFormData.guarantee}
                onChange={handleCreateQuoteInputChange}
                multiline
                rows={2}
                fullWidth
                sx={bigInputSx}
              />
            </Grid>

          </Grid>
        </DialogContent>


        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 2,
          background: alpha(theme.palette.background.default, 0.5),
        }}>
          <StyledButton
            onClick={handleCloseCreateQuote}
            disabled={createQuoteSubmitting}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.divider, 0.3),
              color: 'text.primary',
              '&:hover': {
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
              },
            }}
          >
            Hủy
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleCreateQuoteSubmit}
            disabled={createQuoteSubmitting}
            startIcon={createQuoteSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {createQuoteSubmitting ? "Đang tạo..." : "Tạo"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

