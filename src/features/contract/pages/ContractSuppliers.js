import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
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
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  Button,
  InputAdornment,
} from "@mui/material";
import { useToast } from "../../../app/providers/ToastContext";
import {
  Description as ContractIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import contractApi from "../api/contract.api";
import supplierApi from "../../supplier/api/supplier.api";
import enterpriseApi from "../../enterprise/api/enterprise.api";
import quoteApi from "../../quote/api/quote.api";
import paymentApprovalApi from "../../payment/api/paymentApproval.api";
import ContractPDFView from "../components/ContractPDFView";
import { CommonTable } from "../../../shared/components/CommonTable";
import { CommonDialog } from "../../../shared/components/CommonDialog";

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


const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
};

export default function Contracts() {
  const { id: supplierId } = useParams();
  const { showToast } = useToast();
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
  const [confirmStateOpen, setConfirmStateOpen] = useState(false);
  const [pendingStateChange, setPendingStateChange] = useState(null);

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
        showToast((error?.response?.data?.message || "Lỗi khi tải danh sách hợp đồng. Vui lòng thử lại."),
          "error",
          3000
        );
        setContracts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [page, rowsPerPage, filterState, filterKeyword]);

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
        } catch (error) {
          showToast("Không thể tải thông tin nhà cung cấp", "error", 3000);
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
        } catch (error) {
          showToast("Không thể tải thông tin doanh nghiệp", "error", 3000);
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
        } catch (error) {
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
        } catch (error) {
          showToast("Không thể tải thông tin báo giá", "error", 3000);
        }
      }
    } catch (error) {
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
      showToast("Không thể tải hợp đồng", "error", 3000);
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

      showToast("ℹĐang mở cửa sổ in. Vui lòng chọn 'Lưu dưới dạng PDF' trong dialog in.", "success", 5000);
    } catch (error) {
      showToast("Lỗi khi tạo file PDF. Vui lòng thử lại.", "error", 3000);
    }
  };

  const handleStateChange = (contractId, newState, currentState) => {
    // Validate state transition
    const validTransitions = {
      'SUBMITTED': ['COMPLETED', 'CANCELED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELED'],
    };

    if (!validTransitions[currentState] || !validTransitions[currentState].includes(newState)) {
      showToast("Chuyển đổi trạng thái không hợp lệ", "error", 3000);
      return;
    }

    // Open confirmation dialog
    setPendingStateChange({ contractId, newState, currentState });
    setConfirmStateOpen(true);
  };

  const handleConfirmStateChange = async () => {
    if (!pendingStateChange) return;

    const { contractId, newState } = pendingStateChange;

    try {
      setStateChanging(contractId);

      await contractApi.updateContractState(contractId, { state: newState });

      showToast("Đã cập nhật trạng thái hợp đồng", "success", 3000);

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
      showToast((error?.response?.data?.message || "Lỗi khi thay đổi trạng thái. Vui lòng thử lại."),
        "error",
        3000
      );
    } finally {
      setStateChanging(null);
      setConfirmStateOpen(false);
      setPendingStateChange(null);
    }
  };

  const handleCancelStateChange = () => {
    setConfirmStateOpen(false);
    setPendingStateChange(null);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = event?.target?.value || event;
    setRowsPerPage(parseInt(value, 10));
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
      SUBMITTED: "Đã nhận",
      // IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Đã ký",
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
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm hợp đồng..."
                size="small"
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
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

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterState}
                  label="Trạng thái"
                  onChange={(e) => setFilterState(e.target.value)}
                  sx={{
                    minWidth: 120,
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
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="SUBMITTED">Đã nhận</MenuItem>
                  <MenuItem value="COMPLETED">Đã ký</MenuItem>
                  <MenuItem value="CANCELED">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
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
        <CommonTable
          columns={[
            {
                field: 'id',
                headerName: 'STT',
                width: 70,
                align: 'center',
                render:(value, row, rowIndex) => rowIndex + 1,
            },
            {
              field: 'name',
              headerName: 'Tên hợp đồng',
              flex: 1.2,
              minWidth: 180,
              render: (value) => (
                <Typography sx={{ fontWeight: 500 }}>{value || "N/A"}</Typography>
              ),
            },
            {
              field: 'totalValue',
              headerName: 'Tổng giá trị',
              flex: 0.9,
              minWidth: 130,
              align: 'right',
              render: (value, row) => (
                <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {formatCurrency(value)} {row.currency || "VND"}
                </Typography>
              ),
              cellSx: { textAlign: 'right' },
            },
            {
              field: 'enterpriseName',
              headerName: 'Doanh nghiệp',
              flex: 0.8,
              minWidth: 120,
              render: (value) => (
                <Typography sx={{ fontWeight: 500 }}>{value || "N/A"}</Typography>
              ),
            },
            {
              field: 'quote',
              headerName: 'Dịch vụ',
              flex: 0.8,
              minWidth: 120,
              render: (value) => (
                <Typography sx={{ fontWeight: 500 }}>{value.productName || "N/A"}</Typography>
              ),
            },
            {
              field: 'startDate',
              headerName: 'Ngày bắt đầu',
              flex: 0.8,
              minWidth: 120,
              render: (value) => formatDate(value),
            },
            {
              field: 'endDate',
              headerName: 'Ngày kết thúc',
              flex: 0.8,
              minWidth: 120,
              render: (value) => formatDate(value),
            },
            {
              field: 'state',
              headerName: 'Trạng thái',
              flex: 0.9,
              minWidth: 140,
              render: (value, row) => {
                if (canChangeState(value)) {
                  return (
                    <Select
                      value={value || "DRAFT"}
                      onChange={(e) => handleStateChange(row.id, e.target.value, value)}
                      size="small"
                      disabled={stateChanging === row.id}
                      sx={{
                        minWidth: 140,
                        borderRadius: 1.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem value={value} disabled>
                        {getStateLabel(value)}
                      </MenuItem>
                      {getAvailableStates(value).map((state) => (
                        <MenuItem key={state} value={state}>
                          {getStateLabel(state)}
                        </MenuItem>
                      ))}
                    </Select>
                  );
                }
                return (
                  <Chip
                    label={getStateLabel(value)}
                    color={getStateColor(value)}
                    size="small"
                    variant={value === "SUBMITTED" ? "filled" : "outlined"}
                    sx={{
                      fontWeight: 600,
                      ...(value === "SUBMITTED" && {
                        backgroundColor: alpha(theme.palette.info.main, 0.15),
                        color: theme.palette.info.main,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.4)}`
                      }),
                      ...(value === "COMPLETED" && {
                        backgroundColor: alpha(theme.palette.success.main, 0.15),
                        color: theme.palette.success.main,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`
                      }),
                    }}
                  />
                );
              },
            },
            {
              field: 'actions',
              headerName: 'Chi tiết',
              width: 100,
              align: 'center',
              render: (_, row) => (
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDetail(row)}
                    color="info"
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.2),
                      },
                    }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ),
            },
          ]}
          data={contracts}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          emptyMessage="Chưa có hợp đồng"
        />
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

      {/* State Change Confirmation Dialog */}
      <CommonDialog
        open={confirmStateOpen}
        title="Xác nhận chuyển trạng thái"
        onClose={handleCancelStateChange}
        onSubmit={handleConfirmStateChange}
        submitLabel={stateChanging ? "Đang cập nhật..." : "Xác nhận"}
        cancelLabel="Hủy"
        submitColor="primary"
        loading={stateChanging !== null}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          Bạn có chắc chắn muốn chuyển trạng thái sang <strong>"{pendingStateChange ? getStateLabel(pendingStateChange.newState) : ""}"</strong>?
        </Typography>
      </CommonDialog>
    </Box>
  );
}
