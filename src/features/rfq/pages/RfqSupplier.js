import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TablePagination,
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
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.grey[800], 0.95)
      : alpha(theme.palette.grey[100], 0.98),
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(10px)',
    '& .MuiTableCell-head': {
      fontWeight: 700,
      fontSize: '0.875rem',
      color: theme.palette.mode === 'dark' 
        ? theme.palette.grey[100]
        : theme.palette.grey[800],
      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.5)}`,
      padding: theme.spacing(1.5, 2),
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.grey[800], 0.95)
        : alpha(theme.palette.grey[100], 0.98),
      whiteSpace: 'nowrap',
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
    },
  },
  '& .MuiTableCell-body': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    padding: theme.spacing(2),
    verticalAlign: 'middle',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'scale(1.001)',
    },
    '&:last-child .MuiTableCell-body': {
      borderBottom: 'none',
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
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
      {/* Header */}
      <HeaderBox>
        <IconBox>
          <RequestQuoteIcon sx={{ fontSize: 32, color: 'white' }} />
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
            Yêu cầu báo giá
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem và xử lý các yêu cầu báo giá từ doanh nghiệp
          </Typography>
        </TitleBox>
      </HeaderBox>

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
        <>
          <StyledTableContainer component={Paper}>
            <Box className="table-wrapper">
              <StyledTable stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Tên yêu cầu</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Doanh nghiệp</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Số lượng</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Ngày hết hạn</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Ngày tạo</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rfqs.map((rfq) => {
                    const isExpired = rfq.expiredAt ? new Date(rfq.expiredAt) < new Date() : false;
                    return (
                    <TableRow key={rfq.id} hover>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {rfq.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rfq.enterprise?.name || rfq.enterpriseName || "N/A"}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 500,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {rfq.quantity?.toLocaleString("vi-VN") || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography 
                            variant="body2"
                            sx={{
                              color: new Date(rfq.expiredAt) < new Date() 
                                ? theme.palette.error.main 
                                : theme.palette.text.primary,
                              fontWeight: 500,
                            }}
                          >
                            {formatDate(rfq.expiredAt)}
                          </Typography>
                          {new Date(rfq.expiredAt) < new Date() && (
                            <Chip
                              label="Hết hạn"
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(rfq.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {isExpired ? (
                          <Chip 
                            label="Đã hết hạn" 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                            <Tooltip title="Xem chi tiết yêu cầu báo giá" arrow>
                              <ActionButton 
                                size="small"
                                onClick={() => handleOpenDetail(rfq)}
                                sx={{
                                  color: theme.palette.info.main,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <InfoIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Tạo báo giá cho yêu cầu này" arrow>
                              <ActionButton 
                                size="small"
                                onClick={() => handleOpenCreateQuote(rfq)}
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </StyledTable>
            </Box>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng ${count !== -1 ? count : `hơn ${to}`}`
              }
              sx={{
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.palette.background.paper,
                flexShrink: 0,
              }}
            />
          </StyledTableContainer>
        </>
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
              startIcon={<AddIcon />}
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
              Tạo báo giá từ RFQ này
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
            <ReceiptIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
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
                Tạo báo giá từ RFQ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điền thông tin để tạo báo giá cho doanh nghiệp
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseCreateQuote}
            size="small"
            disabled={createQuoteSubmitting}
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
          <Stack spacing={3}>
            {/* RFQ Info */}
            {selectedRfq && (
              <SectionCard elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <RequestQuoteIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Báo giá cho
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedRfq.name || selectedRfq.product?.name || "N/A"}
                </Typography>
                {selectedRfq.enterprise && (
                  <Typography variant="body2" color="text.secondary">
                    Doanh nghiệp: {selectedRfq.enterprise.name}
                  </Typography>
                )}
              </SectionCard>
            )}

            {/* Tên báo giá và Ngày hết hạn */}
            <SectionCard elevation={0}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Tên báo giá *"
                    name="name"
                    value={createQuoteFormData.name}
                    onChange={handleCreateQuoteInputChange}
                    size="small"
                    required
                    placeholder="VD: Báo giá Đèn Follow Spot 2500W - Tháng 11/2025"
                    helperText="Mô tả ngắn gọn cho báo giá này"
                    sx={{
                      width: quoteNameFieldWidth,
                      maxWidth: "100%",
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          <EventNoteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </Box>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StyledTextField
                    label="Ngày hết hạn *"
                    name="expiredAt"
                    type="datetime-local"
                    value={createQuoteFormData.expiredAt}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Báo giá có hiệu lực đến ngày này"
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </Box>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* Section: Thông tin giá */}
            <SectionCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Thông tin giá
                </Typography>
              </Box>
              
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Số lượng *"
                    name="quantity"
                    type="number"
                    value={createQuoteFormData.quantity}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    required
                    inputProps={{ min: "0", step: "1" }}
                    helperText="Số lượng sản phẩm cần báo giá"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Đơn giá *"
                    name="unitPrice"
                    type="text"
                    value={formatCurrency(createQuoteFormData.unitPrice)}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    required
                    helperText="Giá cho mỗi đơn vị sản phẩm"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalAtmIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Tổng giá"
                    name="totalPrice"
                    type="text"
                    value={formatCurrency(createQuoteFormData.totalPrice)}
                    fullWidth
                    size="small"
                    helperText="Tự động tính từ số lượng × đơn giá"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* Section: Chi phí bổ sung */}
            <SectionCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PercentIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Chi phí bổ sung
                </Typography>
              </Box>
              
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Thuế"
                    name="tax"
                    type="text"
                    value={formatCurrency(createQuoteFormData.tax)}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    placeholder="0"
                    helperText="Thuế VAT (nếu có)"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Giảm giá"
                    name="discount"
                    type="text"
                    value={formatCurrency(createQuoteFormData.discount)}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    placeholder="0"
                    helperText="Số tiền giảm giá (nếu có)"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phí vận chuyển"
                    name="shippingFee"
                    type="text"
                    value={formatCurrency(createQuoteFormData.shippingFee)}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    placeholder="0"
                    helperText="Chi phí vận chuyển hàng hóa"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalShippingIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Phí khác"
                    name="otherFee"
                    type="text"
                    value={formatCurrency(createQuoteFormData.otherFee)}
                    onChange={handleCreateQuoteInputChange}
                    fullWidth
                    size="small"
                    placeholder="0"
                    helperText="Các chi phí khác (nếu có)"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Giá cuối cùng"
                    name="finalPrice"
                    type="text"
                    value={formatCurrency(createQuoteFormData.finalPrice)}
                    fullWidth
                    size="small"
                    helperText="Tổng giá sau khi cộng/trừ các chi phí"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        '&.Mui-disabled': {
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                        },
                      },
                    }}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>₫</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* Section: Điều khoản và bảo hành */}
            <SectionCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Điều khoản và bảo hành
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                <StyledFormControl fullWidth size="small">
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
                    <MenuItem value="MOBILE_PAYMENT">Thanh toán qua điện thoại</MenuItem>
                    <MenuItem value="CHECK">Séc</MenuItem>
                  </Select>
                </StyledFormControl>
                <StyledTextField
                  label="Điều khoản thanh toán"
                  name="paymentTerms"
                  value={createQuoteFormData.paymentTerms}
                  onChange={handleCreateQuoteInputChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  placeholder="VD: Thanh toán 50% khi ký hợp đồng, 50% còn lại khi giao hàng..."
                  helperText="Mô tả chi tiết về điều khoản thanh toán"
                />
                <StyledTextField
                  label="Bảo hành"
                  name="guarantee"
                  value={createQuoteFormData.guarantee}
                  onChange={handleCreateQuoteInputChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  placeholder="VD: Bảo hành 12 tháng, đổi mới trong 30 ngày đầu..."
                  helperText="Thông tin về chính sách bảo hành sản phẩm"
                />
              </Stack>
            </SectionCard>
          </Stack>
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
            startIcon={createQuoteSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            sx={{
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {createQuoteSubmitting ? "Đang tạo..." : "Tạo báo giá"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

