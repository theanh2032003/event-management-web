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
  Stack,
  InputAdornment,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Receipt as QuoteReceiptIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  DescriptionOutlined as DescriptionIcon,
  ScheduleOutlined as ScheduleIcon,
  CalculateOutlined as CalculateIcon,
  PaymentsOutlined as PaymentsIcon,
  ShieldOutlined as ShieldIcon,
  EventNote as EventNoteIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  LocalAtm as LocalAtmIcon,
  AccountBalance as AccountBalanceIcon,
  Percent as PercentIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import quoteApi from "../api/quote.api";

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
  if (value === null || value === undefined || value === "") return "";
  const sanitized = sanitizeCurrencyValue(value);
  if (!sanitized) return "";
  const num = parseInt(sanitized, 10);
  return num.toLocaleString("vi-VN");
};

const FilterCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 320px)',
  '.table-wrapper': {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
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
      fontWeight: 700,
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

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
}));

const FormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.85),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
    '&.Mui-disabled': {
      backgroundColor: alpha(theme.palette.action.disabledBackground, 0.4),
      color: theme.palette.text.secondary,
    },
  },
}));

const FormControlStyled = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.85),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
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

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const SectionIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
}));

const HighlightStat = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(
    theme.palette.secondary.main,
    0.12
  )})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
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

export default function Quotations() {
  const { id: supplierId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data states
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filterState, setFilterState] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Action states
  const [stateChanging, setStateChanging] = useState(null);
  const [deletingQuoteId, setDeletingQuoteId] = useState(null);
  
  // Modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  
  // Edit form data
  const [editFormData, setEditFormData] = useState({
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

  // Fetch quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        
        const filters = {};
        if (filterState) {
          filters.state = filterState;
        }
        if (filterKeyword) {
          filters.keyword = filterKeyword;
        }

        const response = await quoteApi.getQuotes(filters, page, rowsPerPage);
        
        // Handle different response formats
        if (response?.data && Array.isArray(response.data)) {
          setQuotes(response.data);
          setTotalCount(response.metadata?.total || response.data.length);
        } else if (response?.content && Array.isArray(response.content)) {
          setQuotes(response.content);
          setTotalCount(response.totalElements || response.total || 0);
        } else if (Array.isArray(response)) {
          setQuotes(response);
          setTotalCount(response.length);
        } else {
          setQuotes([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("[QUOTES] ❌ Error fetching quotes:", error);
        enqueueSnackbar(
          error?.response?.data?.message || "Lỗi khi tải danh sách báo giá. Vui lòng thử lại.",
          { variant: "error" }
        );
        setQuotes([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [page, rowsPerPage, filterState, filterKeyword, enqueueSnackbar]);

  const handleOpenDetail = (quote) => {
    setSelectedQuote(quote);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedQuote(null);
  };

  const handleOpenEdit = (quote) => {
    setEditingQuote(quote);
    setEditFormData({
      name: quote.name || "",
      expiredAt: quote.expiredAt ? new Date(quote.expiredAt).toISOString().slice(0, 16) : "",
      quantity: quote.quantity?.toString() || "",
      unitPrice: quote.unitPrice?.toString() || "",
      totalPrice: quote.totalPrice?.toString() || "",
      tax: quote.tax?.toString() || "",
      discount: quote.discount?.toString() || "",
      shippingFee: quote.shippingFee?.toString() || "",
      otherFee: quote.otherFee?.toString() || "",
      finalPrice: quote.finalPrice?.toString() || "",
      paymentMethod: quote.paymentMethod || "VNPAY",
      paymentTerms: quote.paymentTerms || "",
      guarantee: quote.guarantee || "",
      files: quote.files || [],
    });
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (!editSubmitting) {
      setEditOpen(false);
      setEditingQuote(null);
      setEditFormData({
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => {
      const newData = { ...prev };
      
      // Handle currency fields
      if (currencyFields.has(name)) {
        const sanitized = sanitizeCurrencyValue(value);
        newData[name] = sanitized;
      } else {
        newData[name] = value;
      }
      
      // Auto-calculate totalPrice and finalPrice
      if (name === "quantity" || name === "unitPrice") {
        const qty = parseFloat(newData.quantity) || 0;
        const unitPriceNum = currencyFields.has("unitPrice") 
          ? getCurrencyNumber(newData.unitPrice) 
          : parseFloat(newData.unitPrice) || 0;
        newData.totalPrice = (qty * unitPriceNum).toString();
      }
      
      if (name === "totalPrice" || name === "tax" || name === "discount" || name === "shippingFee" || name === "otherFee") {
        const totalPrice = parseFloat(newData.totalPrice) || 0;
        const tax = currencyFields.has("tax") ? getCurrencyNumber(newData.tax) : (parseFloat(newData.tax) || 0);
        const discount = currencyFields.has("discount") ? getCurrencyNumber(newData.discount) : (parseFloat(newData.discount) || 0);
        const shippingFee = currencyFields.has("shippingFee") ? getCurrencyNumber(newData.shippingFee) : (parseFloat(newData.shippingFee) || 0);
        const otherFee = currencyFields.has("otherFee") ? getCurrencyNumber(newData.otherFee) : (parseFloat(newData.otherFee) || 0);
        newData.finalPrice = (totalPrice + tax - discount + shippingFee + otherFee).toString();
      }
      
      return newData;
    });
  };

  const handleEditSubmit = async () => {
    try {
      // Validation
      if (!editFormData.name.trim()) {
        enqueueSnackbar("Vui lòng nhập tên báo giá", { variant: "error" });
        return;
      }

      if (!editFormData.expiredAt) {
        enqueueSnackbar("Vui lòng chọn ngày hết hạn", { variant: "error" });
        return;
      }

      const quantity = parseFloat(editFormData.quantity) || 0;
      if (!quantity || quantity <= 0) {
        enqueueSnackbar("Vui lòng nhập số lượng hợp lệ", { variant: "error" });
        return;
      }

      const unitPriceNum = getCurrencyNumber(editFormData.unitPrice) || parseFloat(editFormData.unitPrice) || 0;
      if (!unitPriceNum || unitPriceNum <= 0) {
        enqueueSnackbar("Vui lòng nhập đơn giá hợp lệ", { variant: "error" });
        return;
      }

      setEditSubmitting(true);

      // Calculate values
      const totalPrice = quantity * unitPriceNum;
      const tax = getCurrencyNumber(editFormData.tax) || parseFloat(editFormData.tax) || 0;
      const discount = getCurrencyNumber(editFormData.discount) || parseFloat(editFormData.discount) || 0;
      const shippingFee = getCurrencyNumber(editFormData.shippingFee) || parseFloat(editFormData.shippingFee) || 0;
      const otherFee = getCurrencyNumber(editFormData.otherFee) || parseFloat(editFormData.otherFee) || 0;
      const finalPrice = totalPrice + tax - discount + shippingFee + otherFee;

      const expiredAtISO = new Date(editFormData.expiredAt).toISOString();

      const quoteData = {
        rfqId: editingQuote.rfqId || editingQuote.rfq?.id,
        name: editFormData.name.trim(),
        expiredAt: expiredAtISO,
        quantity: quantity,
        unitPrice: unitPriceNum,
        totalPrice: totalPrice,
        tax: tax,
        discount: discount,
        shippingFee: shippingFee,
        otherFee: otherFee,
        finalPrice: finalPrice,
        paymentMethod: editFormData.paymentMethod,
        paymentTerms: editFormData.paymentTerms?.trim() || null,
        guarantee: editFormData.guarantee?.trim() || null,
        files: editFormData.files || [],
      };

      console.log("📝 [EDIT QUOTE] Dữ liệu từ form:", editFormData);
      console.log("📤 [EDIT QUOTE] Dữ liệu gửi lên API:", quoteData);
      console.log("🆔 [EDIT QUOTE] Quote ID:", editingQuote.id);

      const response = await quoteApi.updateQuote(editingQuote.id, quoteData);
      
      console.log("📥 [EDIT QUOTE] Response từ API:", response);

      enqueueSnackbar("✅ Cập nhật báo giá thành công!", { variant: "success" });
      
      // Refresh list
      const filters = {};
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const listResponse = await quoteApi.getQuotes(filters, page, rowsPerPage);
      if (listResponse?.data && Array.isArray(listResponse.data)) {
        setQuotes(listResponse.data);
        setTotalCount(listResponse.metadata?.total || listResponse.data.length);
      } else if (listResponse?.content && Array.isArray(listResponse.content)) {
        setQuotes(listResponse.content);
        setTotalCount(listResponse.totalElements || listResponse.total || 0);
      } else if (Array.isArray(listResponse)) {
        setQuotes(listResponse);
        setTotalCount(listResponse.length);
      }

      handleCloseEdit();
    } catch (error) {
      console.error("[QUOTES] ❌ Error updating quote:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "❌ Lỗi khi cập nhật báo giá. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo giá này?")) {
      return;
    }

    try {
      setDeletingQuoteId(quoteId);
      
      await quoteApi.deleteQuote(quoteId);
      
      enqueueSnackbar("Đã xóa báo giá thành công", { variant: "success" });
      
      // Refresh list
      const filters = {};
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await quoteApi.getQuotes(filters, page, rowsPerPage);
      if (response?.data && Array.isArray(response.data)) {
        setQuotes(response.data);
        setTotalCount(response.metadata?.total || response.data.length);
      } else if (response?.content && Array.isArray(response.content)) {
        setQuotes(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setQuotes(response);
        setTotalCount(response.length);
      }
    } catch (error) {
      console.error("[QUOTES] ❌ Error deleting quote:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi xóa báo giá. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setDeletingQuoteId(null);
    }
  };

  const handleStateChange = async (quoteId, newState) => {
    try {
      setStateChanging(quoteId);
      
      await quoteApi.supplierChangeState(quoteId, { state: newState });
      
      enqueueSnackbar("Đã cập nhật trạng thái báo giá", { variant: "success" });
      
      // Refresh list
      const filters = {};
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await quoteApi.getQuotes(filters, page, rowsPerPage);
      if (response?.data && Array.isArray(response.data)) {
        setQuotes(response.data);
        setTotalCount(response.metadata?.total || response.data.length);
      } else if (response?.content && Array.isArray(response.content)) {
        setQuotes(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setQuotes(response);
        setTotalCount(response.length);
      }
    } catch (error) {
      console.error("[QUOTES] ❌ Error changing quote state:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi thay đổi trạng thái. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setStateChanging(null);
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
   
    };
    return labels[state] || state;
  };

  const getStateColor = (state) => {
    const colors = {
      DRAFT: "default",
      SUBMITTED: "info",
      APPROVED: "success",
      REJECTED: "error",
    };
    return colors[state] || "default";
  };

  return (
    <Box>
      {/* Header */}
      <HeaderBox>
        <IconBox>
          <QuoteReceiptIcon sx={{ fontSize: 32, color: 'white' }} />
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
            Báo giá
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các báo giá đã tạo
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
              placeholder="Tìm theo tên..."
              sx={{ minWidth: 250, flex: 1 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterState}
                label="Trạng thái"
                onChange={(e) => setFilterState(e.target.value)}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="DRAFT">Nháp</MenuItem>
                <MenuItem value="SUBMITTED">Đã gửi</MenuItem>
            
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </FilterCard>

      {/* Content */}
      {loading ? (
        <LoadingBox>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải danh sách báo giá...
          </Typography>
        </LoadingBox>
      ) : quotes.length === 0 ? (
        <EmptyStateBox>
          <QuoteReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có báo giá
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Các báo giá bạn tạo sẽ hiển thị ở đây
          </Typography>
        </EmptyStateBox>
      ) : (
        <>
          <StyledTableContainer>
            <Box className="table-wrapper">
              <StyledTable stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tên báo giá</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                  <TableCell align="right">Giá cuối</TableCell>
                  <TableCell>Hạn chót</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{quote.name || "N/A"}</TableCell>
                    <TableCell>{quote.quantity?.toLocaleString("vi-VN") || "N/A"}</TableCell>
                    <TableCell align="right">{formatCurrency(quote.unitPrice)}₫</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {formatCurrency(quote.finalPrice)}₫
                    </TableCell>
                    <TableCell>{formatDate(quote.expiredAt)}</TableCell>
                    <TableCell>
                      {quote.state === "DRAFT" ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label="Nháp"
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                          <Tooltip title="Gửi báo giá">
                            <ActionButton
                              size="small"
                              onClick={() => handleStateChange(quote.id, "SUBMITTED")}
                              disabled={stateChanging === quote.id}
                              color="success"
                              sx={{
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.success.main, 0.2),
                                },
                              }}
                            >
                              {stateChanging === quote.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <SendIcon fontSize="small" />
                              )}
                            </ActionButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Chip
                          label={getStateLabel(quote.state)}
                          color={getStateColor(quote.state)}
                          size="small"
                          variant={quote.state === "SUBMITTED" ? "filled" : "outlined"}
                          icon={quote.state === "SUBMITTED" ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : undefined}
                          sx={{
                            fontWeight: 600,
                            ...(quote.state === "SUBMITTED" && {
                              backgroundColor: alpha(theme.palette.success.main, 0.15),
                              color: theme.palette.success.main,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`
                            })
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                        <Tooltip title="Xem chi tiết">
                          <ActionButton 
                            size="small"
                            onClick={() => handleOpenDetail(quote)}
                            color="info"
                          >
                            <InfoIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                        {quote.state === "DRAFT" && (
                          <>
                            <Tooltip title="Sửa">
                              <ActionButton 
                                size="small"
                                onClick={() => handleOpenEdit(quote)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <ActionButton 
                                size="small"
                                onClick={() => handleDeleteQuote(quote.id)}
                                disabled={deletingQuoteId === quote.id}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
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
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong tổng ${count !== -1 ? count : `hơn ${to}`}`
              }
              sx={{
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: theme.palette.background.paper,
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
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: "1.25rem",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pb: 2,
        }}>
          Chi tiết báo giá
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedQuote && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  borderRadius: 2,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    Tên báo giá
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedQuote.name || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Số lượng
                </Typography>
                <Typography variant="body2">
                  {selectedQuote.quantity?.toLocaleString("vi-VN") || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Đơn giá
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(selectedQuote.unitPrice)}₫
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Tổng giá
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(selectedQuote.totalPrice)}₫
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Thuế
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(selectedQuote.tax)}₫
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Giảm giá
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(selectedQuote.discount)}₫
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Giá cuối cùng
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1.1rem', color: theme.palette.primary.main }}>
                  {formatCurrency(selectedQuote.finalPrice)}₫
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Hạn chót
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(selectedQuote.expiredAt)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Trạng thái
                </Typography>
                <Chip
                  label={getStateLabel(selectedQuote.state)}
                  color={getStateColor(selectedQuote.state)}
                  size="small"
                  variant={selectedQuote.state === "SUBMITTED" ? "filled" : "outlined"}
                  icon={selectedQuote.state === "SUBMITTED" ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : undefined}
                  sx={{
                    fontWeight: 600,
                    ...(selectedQuote.state === "SUBMITTED" && {
                      backgroundColor: alpha(theme.palette.success.main, 0.15),
                      color: theme.palette.success.main,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`
                    })
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                  Phương thức thanh toán
                </Typography>
                <Typography variant="body2">
                  {selectedQuote.paymentMethod || "N/A"}
                </Typography>
              </Grid>

              {selectedQuote.paymentTerms && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    Điều khoản thanh toán
                  </Typography>
                  <Typography variant="body2">
                    {selectedQuote.paymentTerms}
                  </Typography>
                </Grid>
              )}

              {selectedQuote.guarantee && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    Bảo hành
                  </Typography>
                  <Typography variant="body2">
                    {selectedQuote.guarantee}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 2,
        }}>
          <Button 
            onClick={handleCloseDetail}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Đóng
          </Button>
          {selectedQuote && selectedQuote.state === "DRAFT" && (
            <Button 
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => {
                handleCloseDetail();
                handleOpenEdit(selectedQuote);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Sửa báo giá
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={handleCloseEdit} 
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
            <QuoteReceiptIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
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
                Chỉnh sửa báo giá
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cập nhật thông tin và điều chỉnh chi phí nhanh chóng
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseEdit}
            size="small"
            disabled={editSubmitting}
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
            {/* Tên báo giá và Ngày hết hạn */}
            <SectionCard elevation={0}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Tên báo giá *"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    size="small"
                    required
                    placeholder="VD: Báo giá Đèn Follow Spot 2500W - Tháng 11/2025"
                    helperText="Mô tả ngắn gọn cho báo giá này"
                    fullWidth
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
                    value={editFormData.expiredAt}
                    onChange={handleEditInputChange}
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
                    value={editFormData.quantity}
                    onChange={handleEditInputChange}
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
                    value={formatCurrency(editFormData.unitPrice)}
                    onChange={handleEditInputChange}
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
                    value={formatCurrency(editFormData.totalPrice)}
                    fullWidth
                    size="small"
                    helperText="Tự động tính từ số lượng × đơn giá"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <QuoteReceiptIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
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
                    value={formatCurrency(editFormData.tax)}
                    onChange={handleEditInputChange}
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
                    value={formatCurrency(editFormData.discount)}
                    onChange={handleEditInputChange}
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
                    value={formatCurrency(editFormData.shippingFee)}
                    onChange={handleEditInputChange}
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
                    value={formatCurrency(editFormData.otherFee)}
                    onChange={handleEditInputChange}
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
                    value={formatCurrency(editFormData.finalPrice)}
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
                    value={editFormData.paymentMethod}
                    onChange={handleEditInputChange}
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
                  value={editFormData.paymentTerms}
                  onChange={handleEditInputChange}
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
                  value={editFormData.guarantee}
                  onChange={handleEditInputChange}
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
            onClick={handleCloseEdit}
            disabled={editSubmitting}
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
            onClick={handleEditSubmit}
            disabled={editSubmitting}
            startIcon={editSubmitting ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
            sx={{
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {editSubmitting ? "Đang cập nhật..." : "Cập nhật báo giá"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
