import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
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
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  Button,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Description as ContractIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import contractApi from "../api/contract.api";
import supplierApi from "../../supplier/api/supplier.api";
import enterpriseApi from "../../enterprise/api/enterprise.api";
import quoteApi from "../../quote/api/quote.api";
import paymentApprovalApi from "../../payment/api/paymentApproval.api";
import ContractPDFView from "../components/ContractPDFView";

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

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
};

export default function Contracts() {
  const { id: supplierId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data states
  const [contracts, setContracts] = useState([]);
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
  
  // Modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [enterpriseInfo, setEnterpriseInfo] = useState(null);
  const [quoteInfo, setQuoteInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        
        const filters = {
          owner: false, // Supplier side
        };
        
        if (filterState) {
          filters.state = filterState;
        }
        if (filterKeyword) {
          filters.keyword = filterKeyword;
        }

        const response = await contractApi.getContracts(filters, page, rowsPerPage);
        
        // Handle different response formats
        if (response?.data && Array.isArray(response.data)) {
          setContracts(response.data);
          setTotalCount(response.metadata?.total || response.data.length);
        } else if (response?.content && Array.isArray(response.content)) {
          setContracts(response.content);
          setTotalCount(response.totalElements || response.total || 0);
        } else if (Array.isArray(response)) {
          setContracts(response);
          setTotalCount(response.length);
        } else {
          setContracts([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("[CONTRACTS] ❌ Error fetching contracts:", error);
        enqueueSnackbar(
          error?.response?.data?.message || "Lỗi khi tải danh sách hợp đồng. Vui lòng thử lại.",
          { variant: "error" }
        );
        setContracts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [page, rowsPerPage, filterState, filterKeyword, enqueueSnackbar]);

  const handleOpenDetail = async (contract) => {
    setSelectedContract(contract);
    setDetailOpen(true);
    setLoadingInfo(true);
    setSupplierInfo(null);
    setEnterpriseInfo(null);
    setQuoteInfo(null);

    try {
      // Fetch supplier info
      const currentWorkspace = localStorage.getItem('currentWorkspace');
      let supplierIdToFetch = null;
      
      if (currentWorkspace) {
        try {
          const workspace = JSON.parse(currentWorkspace);
          if (workspace.type === 'supplier' && workspace.id) {
            supplierIdToFetch = workspace.id.toString();
          }
        } catch (e) {
          console.error('Error parsing currentWorkspace:', e);
        }
      }

      if (!supplierIdToFetch && supplierId) {
        supplierIdToFetch = supplierId.toString();
      }

      if (supplierIdToFetch) {
        try {
          const supplierResponse = await supplierApi.getSupplierById(supplierIdToFetch);
          // Handle different response formats
          let supplierData = supplierResponse?.data?.data || supplierResponse?.data || supplierResponse;
          
          // If response is axios response object, extract data
          if (supplierResponse?.data && typeof supplierResponse.data === 'object' && !supplierResponse.data.data) {
            supplierData = supplierResponse.data;
          }
          
          setSupplierInfo(supplierData);
          console.log("[CONTRACTS] ✅ Supplier info fetched:", {
            name: supplierData?.name,
            address: supplierData?.address,
            email: supplierData?.email,
            phone: supplierData?.phone,
            taxCode: supplierData?.taxCode,
            fullData: supplierData
          });
        } catch (error) {
          console.error("[CONTRACTS] ❌ Error fetching supplier:", error);
          enqueueSnackbar("Không thể tải thông tin nhà cung cấp", { variant: "warning" });
        }
      }

      // Fetch enterprise info
      const enterpriseIdToFetch = contract?.enterpriseId || contract?.enterprise?.id;
      if (enterpriseIdToFetch) {
        try {
          const enterpriseResponse = await enterpriseApi.getEnterpriseById(enterpriseIdToFetch);
          // Handle different response formats
          let enterpriseData = enterpriseResponse?.data?.data || enterpriseResponse?.data || enterpriseResponse;
          
          // If response is axios response object, extract data
          if (enterpriseResponse?.data && typeof enterpriseResponse.data === 'object' && !enterpriseResponse.data.data) {
            enterpriseData = enterpriseResponse.data;
          }
          
          setEnterpriseInfo(enterpriseData);
          console.log("[CONTRACTS] ✅ Enterprise info fetched:", {
            name: enterpriseData?.name,
            address: enterpriseData?.address,
            email: enterpriseData?.email,
            phone: enterpriseData?.phone,
            taxCode: enterpriseData?.taxCode,
            fullData: enterpriseData
          });
        } catch (error) {
          console.error("[CONTRACTS] ❌ Error fetching enterprise:", error);
          enqueueSnackbar("Không thể tải thông tin doanh nghiệp", { variant: "warning" });
        }
      }

      // Fetch quote info if contract has quoteId or paymentApprovalId
      let quoteIdToFetch = contract?.quoteId || contract?.quote?.id;
      
      // If no direct quoteId, try to get from paymentApproval
      if (!quoteIdToFetch && contract?.paymentApprovalId) {
        try {
          const projectId = contract?.projectId || contract?.project?.id;
          const paymentApprovalResponse = await paymentApprovalApi.getPaymentApprovalById(projectId, contract.paymentApprovalId);
          const paymentApprovalData = paymentApprovalResponse?.data || paymentApprovalResponse;
          quoteIdToFetch = paymentApprovalData?.quoteId;
          console.log("[CONTRACTS] ✅ PaymentApproval info fetched, quoteId:", quoteIdToFetch);
        } catch (error) {
          console.error("[CONTRACTS] ❌ Error fetching paymentApproval:", error);
          // Continue without quoteId from paymentApproval
        }
      }
      
      if (quoteIdToFetch) {
        try {
          const quoteResponse = await quoteApi.getQuoteById(quoteIdToFetch);
          // Handle different response formats
          let quoteData = quoteResponse?.data?.data || quoteResponse?.data || quoteResponse;
          
          // If response is axios response object, extract data
          if (quoteResponse?.data && typeof quoteResponse.data === 'object' && !quoteResponse.data.data) {
            quoteData = quoteResponse.data;
          }
          
          setQuoteInfo(quoteData);
          console.log("[CONTRACTS] ✅ Quote info fetched:", {
            id: quoteData?.id,
            paymentTerms: quoteData?.paymentTerms,
            guarantee: quoteData?.guarantee,
            fullData: quoteData
          });
        } catch (error) {
          console.error("[CONTRACTS] ❌ Error fetching quote:", error);
          enqueueSnackbar("Không thể tải thông tin báo giá", { variant: "warning" });
        }
      }
    } catch (error) {
      console.error("[CONTRACTS] Error fetching contract info:", error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedContract(null);
    setSupplierInfo(null);
    setEnterpriseInfo(null);
    setQuoteInfo(null);
    setZoomLevel(100);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleDownloadPDF = () => {
    const contractContent = document.getElementById('contract-pdf-content');
    
    if (!contractContent) {
      enqueueSnackbar("Không thể tải hợp đồng", { variant: "error" });
      return;
    }

    try {
      // Clone the contract content to preserve original
      const clonedContent = contractContent.cloneNode(true);
      
      // Remove zoom transform from cloned content
      clonedContent.style.transform = 'scale(1)';
      clonedContent.style.width = '100%';
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      // Get the contract HTML content
      const contractHTML = clonedContent.innerHTML;
      
      // Get all styles from the original document
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(style => {
          if (style.tagName === 'STYLE') {
            return `<style>${style.innerHTML}</style>`;
          } else {
            return `<link rel="stylesheet" href="${style.href}">`;
          }
        })
        .join('');
      
      // Create the full HTML document with all styles
      const fullHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Hợp đồng - ${selectedContract?.name || 'Contract'}</title>
            ${styles}
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                * {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body {
                font-family: "Times New Roman", serif;
                margin: 0;
                padding: 0;
                background: white;
                color: #000000;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${contractHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(fullHTML);
      printWindow.document.close();
      
      enqueueSnackbar("Đang mở cửa sổ in. Vui lòng chọn 'Lưu dưới dạng PDF' trong dialog in.", { 
        variant: "info",
        autoHideDuration: 5000 
      });
    } catch (error) {
      console.error("[CONTRACTS] Error generating PDF:", error);
      enqueueSnackbar("Lỗi khi tạo file PDF. Vui lòng thử lại.", { variant: "error" });
    }
  };

  const handleStateChange = async (contractId, newState, currentState) => {
    // Validate state transition
    const validTransitions = {
      'SUBMITTED': ['COMPLETED', 'CANCELED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELED'],
    };

    if (!validTransitions[currentState] || !validTransitions[currentState].includes(newState)) {
      enqueueSnackbar("Chuyển đổi trạng thái không hợp lệ", { variant: "error" });
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang "${getStateLabel(newState)}"?`)) {
      return;
    }

    try {
      setStateChanging(contractId);
      
      await contractApi.updateContractState(contractId, { state: newState });
      
      enqueueSnackbar("Đã cập nhật trạng thái hợp đồng", { variant: "success" });
      
      // Refresh list
      const filters = {
        owner: false,
      };
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await contractApi.getContracts(filters, page, rowsPerPage);
      if (response?.data && Array.isArray(response.data)) {
        setContracts(response.data);
        setTotalCount(response.metadata?.total || response.data.length);
      } else if (response?.content && Array.isArray(response.content)) {
        setContracts(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalCount(response.length);
      }
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error changing contract state:", error);
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
      DRAFT: "Bản nháp",
      SUBMITTED: "Đã gửi",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      CANCELED: "Đã hủy",
    };
    return labels[state] || state;
  };

  const getStateColor = (state) => {
    const colors = {
      DRAFT: "default",
      SUBMITTED: "info",
      IN_PROGRESS: "warning",
      COMPLETED: "success",
      CANCELED: "error",
    };
    return colors[state] || "default";
  };

  // Get available state transitions for supplier
  const getAvailableStates = (currentState) => {
    const transitions = {
      'SUBMITTED': ['COMPLETED', 'CANCELED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELED'],
    };
    return transitions[currentState] || [];
  };

  // Check if state can be changed
  const canChangeState = (currentState) => {
    return ['SUBMITTED', 'IN_PROGRESS'].includes(currentState);
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
              placeholder="Tìm theo tên hợp đồng..."
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterState}
                label="Trạng thái"
                onChange={(e) => setFilterState(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="DRAFT">Bản nháp</MenuItem>
                <MenuItem value="SUBMITTED">Đã gửi</MenuItem>
                <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                <MenuItem value="CANCELED">Đã hủy</MenuItem>
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
            Đang tải danh sách hợp đồng...
          </Typography>
        </LoadingBox>
      ) : contracts.length === 0 ? (
        <EmptyStateBox>
          <ContractIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có hợp đồng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Các hợp đồng với doanh nghiệp sẽ hiển thị ở đây
          </Typography>
        </EmptyStateBox>
      ) : (
        <>
          <StyledTableContainer>
            <Box className="table-wrapper">
              <StyledTable stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên hợp đồng</TableCell>
                    <TableCell align="right">Tổng giá trị</TableCell>
                    <TableCell>Ngày bắt đầu</TableCell>
                    <TableCell>Ngày kết thúc</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{contract.name || "N/A"}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {formatCurrency(contract.totalValue)} {contract.currency || "VND"}
                      </TableCell>
                      <TableCell>{formatDate(contract.startDate)}</TableCell>
                      <TableCell>{formatDate(contract.endDate)}</TableCell>
                      <TableCell>
                        {canChangeState(contract.state) ? (
                          <Select
                            value={contract.state || "DRAFT"}
                            onChange={(e) => handleStateChange(contract.id, e.target.value, contract.state)}
                            size="small"
                            disabled={stateChanging === contract.id}
                            sx={{ 
                              minWidth: 150, 
                              borderRadius: 1.5,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            <MenuItem value={contract.state} disabled>
                              {getStateLabel(contract.state)}
                            </MenuItem>
                            {getAvailableStates(contract.state).map((state) => (
                              <MenuItem key={state} value={state}>
                                {getStateLabel(state)}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Chip
                            label={getStateLabel(contract.state)}
                            color={getStateColor(contract.state)}
                            size="small"
                            variant={contract.state === "SUBMITTED" ? "filled" : "outlined"}
                            sx={{
                              fontWeight: 600,
                              ...(contract.state === "SUBMITTED" && {
                                backgroundColor: alpha(theme.palette.info.main, 0.15),
                                color: theme.palette.info.main,
                                border: `1px solid ${alpha(theme.palette.info.main, 0.4)}`
                              }),
                              ...(contract.state === "COMPLETED" && {
                                backgroundColor: alpha(theme.palette.success.main, 0.15),
                                color: theme.palette.success.main,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`
                              }),
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                          <Tooltip title="Xem chi tiết">
                            <ActionButton 
                              size="small"
                              onClick={() => handleOpenDetail(contract)}
                              color="info"
                              sx={{
                                backgroundColor: alpha(theme.palette.info.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.info.main, 0.2),
                                },
                              }}
                            >
                              <InfoIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
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
        maxWidth={false}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 0 },
            boxShadow: 'none',
            maxHeight: '100vh',
            height: { xs: '100vh', sm: '100vh' },
            margin: 0,
            maxWidth: '100vw',
            width: '100vw',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          fontSize: "1.25rem",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          pb: 2,
          pt: 2.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ContractIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedContract?.name || 'Chi tiết hợp đồng'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Thu nhỏ">
              <IconButton
                size="small"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                sx={{
                  color: theme.palette.text.secondary,
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                }}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Typography 
              variant="body2" 
              sx={{ 
                minWidth: 60, 
                textAlign: 'center', 
                fontWeight: 600,
                color: theme.palette.text.primary,
                px: 1,
              }}
            >
              {zoomLevel}%
            </Typography>
            <Tooltip title="Phóng to">
              <IconButton
                size="small"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                sx={{
                  color: theme.palette.text.secondary,
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                }}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 0,
          overflow: 'hidden',
          backgroundColor: '#e0e0e0',
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {loadingInfo ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '600px',
              backgroundColor: '#f5f5f5',
              flex: 1,
            }}>
              <CircularProgress />
            </Box>
          ) : selectedContract ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'flex-start',
              backgroundColor: '#e0e0e0',
              p: { xs: 1, sm: 2, md: 3 },
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.divider, 0.1),
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '5px',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}>
              <Box
                id="contract-pdf-content"
                sx={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease',
                  width: { xs: '100%', sm: '210mm' }, // A4 width on larger screens
                  maxWidth: '210mm',
                  minHeight: '297mm', // A4 height
                  backgroundColor: '#ffffff',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  margin: '0 auto',
                  position: 'relative',
                  my: { xs: 1, sm: 2 },
                }}
              >
                <ContractPDFView 
                  contract={selectedContract}
                  supplier={supplierInfo}
                  enterprise={enterpriseInfo || selectedContract.enterprise}
                  quote={quoteInfo}
                />
              </Box>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ 
          p: 2.5, 
          px: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          gap: 2,
          backgroundColor: '#ffffff',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <Button 
            onClick={handleCloseDetail}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
              borderColor: alpha(theme.palette.divider, 0.5),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Đóng
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            variant="contained"
            startIcon={<PdfIcon />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
              },
            }}
          >
            Tải PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
