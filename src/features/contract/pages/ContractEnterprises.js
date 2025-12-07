import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
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
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import contractApi from "../api/contract.api";
import projectApi from "../../project/api/project.api";
import paymentApprovalApi from "../../payment/api/paymentApproval.api";
import ContractDetail from "./ContractEnterpriseDetail";
import CommonTable from "../../../shared/components/CommonTable";

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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 300px)',
  overflowY: 'auto',
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
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    position: 'sticky',
    top: 0,
    zIndex: 10,
    '& .MuiTableCell-root': {
      fontWeight: 700,
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
      padding: theme.spacing(2),
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateY(-1px)',
        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
      '&:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(2),
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

export default function Contracts() {
  const { id: enterpriseId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
  };

  const userId = getUserId();
  const { isOwner, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);

  // Data states
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [paymentApprovals, setPaymentApprovals] = useState([]);
  
  // Filter states
  const [filterState, setFilterState] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Action states
  const [submittingContractId, setSubmittingContractId] = useState(null);
  const [deletingContractId, setDeletingContractId] = useState(null);
  
  // Modal states
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedContract, setSelectedContract] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  
  // Create form data
  const [createFormData, setCreateFormData] = useState({
    name: "",
    paymentApprovalId: "",
    startDate: "",
    endDate: "",
    totalValue: "",
    currency: "VND",
    paymentTerms: "",
    guaranteeTerms: "",
    terminationTerms: "",
    notes: "",
    attachments: [],
  });

  // Check permission
  if (!permissionsLoading && !isOwner) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Bạn không có quyền truy cập vào mục này. Chỉ chủ doanh nghiệp mới có quyền này.
        </Alert>
      </Box>
    );
  }

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectApi.getProjectsByEnterprise();
        const projectsList = response?.data || response || [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách dự án";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    };

    if (!permissionsLoading && isOwner) {
      loadProjects();
    }
  }, [enterpriseId, permissionsLoading, isOwner]);

  // Load payment approvals
  useEffect(() => {
    const loadPaymentApprovals = async () => {
      try {
        console.log("[CONTRACTS] 🔄 Đang gọi API GET paymentApprovals...");
        const response = await paymentApprovalApi.getPaymentApprovals(null, {}, 0, 100);
        const approvalsList = response?.data || response || [];
        console.log("[CONTRACTS] ✅ API GET paymentApprovals thành công. Số lượng:", Array.isArray(approvalsList) ? approvalsList.length : 0);
        console.log("[CONTRACTS] 📊 Payment Approvals data:", approvalsList);
        setPaymentApprovals(Array.isArray(approvalsList) ? approvalsList : []);
      } catch (error) {
        console.error("[CONTRACTS] ❌ Error loading payment approvals:", error);
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách phê duyệt thanh toán";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    };

    if (!permissionsLoading && isOwner) {
      loadPaymentApprovals();
    }
  }, [permissionsLoading, isOwner]);

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        
        const filters = {
          enterpriseId,
          owner: true,
        };

        if (filterProjectId) {
          filters.projectId = filterProjectId;
        }

        if (filterState) {
          filters.state = filterState;
        }

        if (filterKeyword) {
          filters.keyword = filterKeyword;
        }

        const response = await contractApi.getContracts(filters, page, rowsPerPage);
        
        // Handle paginated response
        if (response?.content && Array.isArray(response.content)) {
          setContracts(response.content);
          setTotalCount(response.totalElements || response.total || 0);
        } else if (Array.isArray(response)) {
          setContracts(response);
          setTotalCount(response.length);
        } else if (response?.data && Array.isArray(response.data)) {
          setContracts(response.data);
          setTotalCount(response.totalElements || response.total || response.data.length);
        } else {
          setContracts([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("[CONTRACTS] ❌ Error fetching contracts:", error);
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách hợp đồng";
        enqueueSnackbar(errorMessage, { variant: "error" });
        setContracts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && isOwner) {
      fetchContracts();
    }
  }, [enterpriseId, permissionsLoading, isOwner, filterState, filterKeyword, filterProjectId, page, rowsPerPage, enqueueSnackbar]);

  const handleOpenDetail = (contract) => {
    setSelectedContract(contract);
    setViewMode("detail");
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedContract(null);
  };

  const handleEditFromDetail = () => {
    setEditOpen(true);

  };

  const handleOpenEdit = (contract) => {
    console.log("[CONTRACTS] ✏️ Mở form SỬA hợp đồng:", contract);
    console.log("[CONTRACTS] 📊 Payment Approvals hiện tại:", paymentApprovals);
    console.log("[CONTRACTS] 📊 Số lượng Payment Approvals:", paymentApprovals.length);
    setEditingContract(contract);
    setCreateFormData({
      name: contract.name || "",
      paymentApprovalId: contract.paymentApprovalId?.toString() || "",
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().slice(0, 16) : "",
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().slice(0, 16) : "",
      totalValue: contract.totalValue?.toString() || "",
      currency: contract.currency || "VND",
      paymentTerms: contract.paymentTerms || "",
      guaranteeTerms: contract.guaranteeTerms || "",
      terminationTerms: contract.terminationTerms || "",
      notes: contract.notes || "",
      attachments: contract.attachments || [],
    });
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (!editSubmitting) {
      setEditOpen(false);
      setEditingContract(null);
      setCreateFormData({
        name: "",
        paymentApprovalId: "",
        startDate: "",
        endDate: "",
        totalValue: "",
        currency: "VND",
        paymentTerms: "",
        guaranteeTerms: "",
        terminationTerms: "",
        notes: "",
        attachments: [],
      });
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (!createFormData.name.trim()) {
        enqueueSnackbar("Vui lòng nhập tên hợp đồng", { variant: "error" });
        return;
      }

      if (!createFormData.startDate) {
        enqueueSnackbar("Vui lòng chọn ngày bắt đầu", { variant: "error" });
        return;
      }

      if (!createFormData.endDate) {
        enqueueSnackbar("Vui lòng chọn ngày kết thúc", { variant: "error" });
        return;
      }

      if (!createFormData.totalValue || parseFloat(createFormData.totalValue) <= 0) {
        enqueueSnackbar("Vui lòng nhập tổng giá trị hợp đồng hợp lệ", { variant: "error" });
        return;
      }

      setEditSubmitting(true);

      const startDateISO = new Date(createFormData.startDate).toISOString();
      const endDateISO = new Date(createFormData.endDate).toISOString();

      const contractData = {
        name: createFormData.name,
        paymentApprovalId: createFormData.paymentApprovalId ? parseInt(createFormData.paymentApprovalId) : null,
        startDate: startDateISO,
        endDate: endDateISO,
        totalValue: parseFloat(createFormData.totalValue),
        currency: createFormData.currency,
        paymentTerms: createFormData.paymentTerms || null,
        guaranteeTerms: createFormData.guaranteeTerms || null,
        terminationTerms: createFormData.terminationTerms || null,
        notes: createFormData.notes || null,
        attachments: createFormData.attachments || [],
      };

      await contractApi.updateContract(editingContract.id, contractData);

      enqueueSnackbar("Cập nhật hợp đồng thành công", { variant: "success" });
      
      // Refresh list
      const filters = {
        enterpriseId,
        owner: true,
      };
      if (filterProjectId) filters.projectId = filterProjectId;
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await contractApi.getContracts(filters, page, rowsPerPage);
      if (response?.content && Array.isArray(response.content)) {
        setContracts(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalCount(response.length);
      } else if (response?.data && Array.isArray(response.data)) {
        setContracts(response.data);
        setTotalCount(response.totalElements || response.total || response.data.length);
      }

      handleCloseEdit();
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error updating contract:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi cập nhật hợp đồng. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteContract = async (contractId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này?")) {
      return;
    }

    try {
      setDeletingContractId(contractId);
      
      await contractApi.deleteContract(contractId);
      
      enqueueSnackbar("Đã xóa hợp đồng thành công", { variant: "success" });
      
      // Refresh list
      const filters = {
        enterpriseId,
        owner: true,
      };
      if (filterProjectId) filters.projectId = filterProjectId;
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await contractApi.getContracts(filters, page, rowsPerPage);
      if (response?.content && Array.isArray(response.content)) {
        setContracts(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalCount(response.length);
      } else if (response?.data && Array.isArray(response.data)) {
        setContracts(response.data);
        setTotalCount(response.totalElements || response.total || response.data.length);
      }
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error deleting contract:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi xóa hợp đồng. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setDeletingContractId(null);
    }
  };

  const handleOpenCreate = () => {
    console.log("[CONTRACTS] 📝 Mở form TẠO hợp đồng");
    console.log("[CONTRACTS] 📊 Payment Approvals hiện tại:", paymentApprovals);
    console.log("[CONTRACTS] 📊 Số lượng Payment Approvals:", paymentApprovals.length);
    setCreateFormData({
      name: "",
      paymentApprovalId: "",
      startDate: "",
      endDate: "",
      totalValue: "",
      currency: "VND",
      paymentTerms: "",
      guaranteeTerms: "",
      terminationTerms: "",
      notes: "",
      attachments: [],
    });
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (!createSubmitting) {
      setCreateOpen(false);
      setCreateFormData({
        name: "",
        paymentApprovalId: "",
        startDate: "",
        endDate: "",
        totalValue: "",
        currency: "VND",
        paymentTerms: "",
        guaranteeTerms: "",
        terminationTerms: "",
        notes: "",
        attachments: [],
      });
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async () => {
    try {
      // Validate required fields
      if (!createFormData.name.trim()) {
        enqueueSnackbar("Vui lòng nhập tên hợp đồng", { variant: "error" });
        return;
      }

      if (!createFormData.startDate) {
        enqueueSnackbar("Vui lòng chọn ngày bắt đầu", { variant: "error" });
        return;
      }

      if (!createFormData.endDate) {
        enqueueSnackbar("Vui lòng chọn ngày kết thúc", { variant: "error" });
        return;
      }

      if (!createFormData.totalValue || parseFloat(createFormData.totalValue) <= 0) {
        enqueueSnackbar("Vui lòng nhập tổng giá trị hợp đồng hợp lệ", { variant: "error" });
        return;
      }

      setCreateSubmitting(true);

      // Convert dates to ISO string
      const startDateISO = new Date(createFormData.startDate).toISOString();
      const endDateISO = new Date(createFormData.endDate).toISOString();

      const contractData = {
        ...createFormData,
        startDate: startDateISO,
        endDate: endDateISO,
        paymentApprovalId: createFormData.paymentApprovalId ? parseInt(createFormData.paymentApprovalId) : null,
        totalValue: parseFloat(createFormData.totalValue),
      };

      await contractApi.createContract(contractData, enterpriseId);

      enqueueSnackbar("Tạo hợp đồng thành công", { variant: "success" });
      
      // Refresh list
      const filters = {
        enterpriseId,
        owner: true,
      };
      if (filterProjectId) filters.projectId = filterProjectId;
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await contractApi.getContracts(filters, page, rowsPerPage);
      if (response?.content && Array.isArray(response.content)) {
        setContracts(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalCount(response.length);
      } else if (response?.data && Array.isArray(response.data)) {
        setContracts(response.data);
        setTotalCount(response.totalElements || response.total || response.data.length);
      }

      handleCloseCreate();
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error creating contract:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi tạo hợp đồng. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSubmitContract = async (contractId) => {
    try {
      setSubmittingContractId(contractId);
      
      await contractApi.submitContract(contractId, enterpriseId);
      
      enqueueSnackbar("Đã gửi duyệt hợp đồng", { variant: "success" });
      
      // Refresh list
      const filters = {
        enterpriseId,
        owner: true,
      };
      if (filterProjectId) filters.projectId = filterProjectId;
      if (filterState) filters.state = filterState;
      if (filterKeyword) filters.keyword = filterKeyword;

      const response = await contractApi.getContracts(filters, page, rowsPerPage);
      if (response?.content && Array.isArray(response.content)) {
        setContracts(response.content);
        setTotalCount(response.totalElements || response.total || 0);
      } else if (Array.isArray(response)) {
        setContracts(response);
        setTotalCount(response.length);
      } else if (response?.data && Array.isArray(response.data)) {
        setContracts(response.data);
        setTotalCount(response.totalElements || response.total || response.data.length);
      }
    } catch (error) {
      console.error("[CONTRACTS] ❌ Error submitting contract:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Lỗi khi gửi duyệt hợp đồng. Vui lòng thử lại.",
        { variant: "error" }
      );
    } finally {
      setSubmittingContractId(null);
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
      SIGNED: "Đã ký",
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
      SIGNED: "primary",
      IN_PROGRESS: "warning",
      COMPLETED: "success",
      CANCELED: "error",
    };
    return colors[state] || "default";
  };

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

  // Show detail view if viewMode is "detail"
  if (viewMode === "detail" && selectedContract) {
    return (
      <ContractDetail
        contract={selectedContract}
        onBack={handleCloseDetail}
        onEdit={selectedContract.state === "DRAFT" ? handleEditFromDetail : undefined}
      />
    );
  }

  return (
    <Box>
        {/* Filters */}
      <FilterCard>
        <CardContent>
          {/* Keyword Search Row */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginBottom: 2 }}>
            {/* Keyword Search */}
            <TextField
              placeholder="Tìm kiếm hợp đồng ..."
              size="medium"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                }
              }}
              onBlur={() => setPage(0)}
              sx={{ 
                flex: 1,
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
          </Box>

          {/* Filter Controls Row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            {/* Project Filter */}
            <Box sx={{ width: "calc(25% - 6px)" }}>
              <TextField
                select
                label="Dự án"
                value={filterProjectId}
                onChange={(e) => {
                  setFilterProjectId(e.target.value);
                  setPage(0);
                }}
                size="small"
                fullWidth
                displayEmpty
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
              >
                <MenuItem value="">-- Bỏ chọn --</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Filter by State */}
            <Box sx={{ width: "calc(20% - 6px)" }}>
              <TextField
                select
                label="Trạng thái"
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setPage(0);
                }}
                size="small"
                fullWidth
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
              >
                <MenuItem value="">-- Tất cả --</MenuItem>
                <MenuItem value="DRAFT">Bản nháp</MenuItem>
                <MenuItem value="SUBMITTED">Đã gửi</MenuItem>
                <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                <MenuItem value="CANCELED">Đã hủy</MenuItem>
              </TextField>
            </Box>

            {/* Create Button */}
            <Box sx={{ width: "calc(20% - 6px)" }}>
              <StyledButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                fullWidth
                sx={{ height: 40 }}
              >
                Tạo Hợp Đồng
              </StyledButton>
            </Box>
          </Box>
        </CardContent>
      </FilterCard>

      {/* Content */}
      {loading ? (
        <LoadingBox>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </LoadingBox>
      ) : contracts.length === 0 ? (
        <EmptyStateBox>
          <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có hợp đồng nào
          </Typography>
        </EmptyStateBox>
      ) : (
        <CommonTable
          columns={[
            {
              field: "name",
              headerName: "Tên Hợp Đồng",
              render: (value, row) => row.name,
            },
            {
              field: "state",
              headerName: "Trạng thái",
              render: (value, row) => (
                <Chip
                  label={getStateLabel(row.state)}
                  color={getStateColor(row.state)}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              field: "totalValue",
              headerName: "Tổng Giá Trị",
              align: "right",
              render: (value, row) => `${row.totalValue ? row.totalValue.toLocaleString("vi-VN") : 0} ${row.currency || "VND"}`,
            },
            {
              field: "startDate",
              headerName: "Ngày Bắt Đầu",
              render: (value, row) => formatDate(row.startDate),
            },
            {
              field: "endDate",
              headerName: "Ngày Kết Thúc",
              render: (value, row) => formatDate(row.endDate),
            },
            {
              field: "actions",
              headerName: "Hành động",
              align: "center",
              render: (value, contract) => (
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                  {contract.state === "DRAFT" && (
                    <Tooltip title="Gửi duyệt" arrow>
                      <ActionButton 
                        size="small"
                        onClick={() => handleSubmitContract(contract.id)}
                        disabled={submittingContractId === contract.id}
                        sx={{ color: "primary.main" }}
                      >
                        <SendIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Chi tiết" arrow>
                    <ActionButton 
                      size="small"
                      onClick={() => handleOpenDetail(contract)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                        },
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>

                  {contract.state === "DRAFT" && (
                    <Tooltip title="Sửa" arrow>
                      <ActionButton 
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(contract)}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  )}
                  {contract.state === "DRAFT" && (
                    <Tooltip title="Xóa" arrow>
                      <ActionButton 
                        size="small"
                        onClick={() => handleDeleteContract(contract.id)}
                        disabled={deletingContractId === contract.id}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  )}
                </Box>
              ),
            },
          ]}
          data={contracts}
          loading={loading}
          rowsPerPage={rowsPerPage}
          page={page}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          emptyMessage="Chưa có hợp đồng nào"
          maxHeight="calc(100vh - 380px)"
          minHeight="calc(100vh - 380px)"
        />
      )}

      {/* Create Contract Dialog */}
      <Dialog 
        open={createOpen} 
        onClose={handleCloseCreate} 
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
          Tạo hợp đồng mới
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
            {/* Tên hợp đồng */}
            <TextField
              label="Tên hợp đồng *"
              name="name"
              value={createFormData.name}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.9375rem',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9375rem',
                  color: 'text.secondary',
                },
              }}
            />

            {/* Phê duyệt thanh toán */}
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>Phê duyệt thanh toán (Tùy chọn)</InputLabel>
              <Select
                name="paymentApprovalId"
                value={createFormData.paymentApprovalId}
                onChange={handleCreateInputChange}
                label="Phê duyệt thanh toán (Tùy chọn)"
                sx={{ 
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                  '& .MuiSelect-select': {
                    fontSize: '0.9375rem',
                    color: 'text.primary',
                  },
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.9375rem' }}>-- Không chọn --</MenuItem>
                {paymentApprovals.map((approval) => (
                  <MenuItem key={approval.id} value={approval.id.toString()} sx={{ fontSize: '0.9375rem' }}>
                    {approval.name} - {approval.amount ? approval.amount.toLocaleString("vi-VN") : 0}₫
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Ngày bắt đầu và Ngày kết thúc */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày bắt đầu *"
                  name="startDate"
                  type="datetime-local"
                  value={createFormData.startDate}
                  onChange={handleCreateInputChange}
                  fullWidth
                  size="small"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '0.9375rem',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.9375rem',
                      color: 'text.primary',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9375rem',
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày kết thúc *"
                  name="endDate"
                  type="datetime-local"
                  value={createFormData.endDate}
                  onChange={handleCreateInputChange}
                  fullWidth
                  size="small"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '0.9375rem',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.9375rem',
                      color: 'text.primary',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9375rem',
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Tổng giá trị và Tiền tệ */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Tổng giá trị *"
                  name="totalValue"
                  type="number"
                  value={createFormData.totalValue}
                  onChange={handleCreateInputChange}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: "0", step: "1000" }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '0.9375rem',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.9375rem',
                      color: 'text.primary',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9375rem',
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>Tiền tệ</InputLabel>
                  <Select
                    name="currency"
                    value={createFormData.currency}
                    onChange={handleCreateInputChange}
                    label="Tiền tệ"
                    sx={{ 
                      borderRadius: 2,
                      fontSize: '0.9375rem',
                      '& .MuiSelect-select': {
                        fontSize: '0.9375rem',
                        color: 'text.primary',
                      },
                    }}
                  >
                    <MenuItem value="VND" sx={{ fontSize: '0.9375rem' }}>VND</MenuItem>
                    <MenuItem value="USD" sx={{ fontSize: '0.9375rem' }}>USD</MenuItem>
                    <MenuItem value="EUR" sx={{ fontSize: '0.9375rem' }}>EUR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Điều khoản thanh toán */}
            <TextField
              label="Điều khoản thanh toán"
              name="paymentTerms"
              value={createFormData.paymentTerms}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.9375rem',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9375rem',
                  color: 'text.secondary',
                },
              }}
            />

            {/* Điều khoản bảo hành */}
            <TextField
              label="Điều khoản bảo hành"
              name="guaranteeTerms"
              value={createFormData.guaranteeTerms}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.9375rem',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9375rem',
                  color: 'text.secondary',
                },
              }}
            />

            {/* Điều khoản chấm dứt */}
            <TextField
              label="Điều khoản chấm dứt"
              name="terminationTerms"
              value={createFormData.terminationTerms}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.9375rem',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9375rem',
                  color: 'text.secondary',
                },
              }}
            />

            {/* Ghi chú */}
            <TextField
              label="Ghi chú"
              name="notes"
              value={createFormData.notes}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.9375rem',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.9375rem',
                  color: 'text.secondary',
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 2,
        }}>
          <Button 
            onClick={handleCloseCreate}
            disabled={createSubmitting}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={createSubmitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {createSubmitting ? "Đang tạo..." : "Tạo hợp đồng"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contract Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={handleCloseEdit} 
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
          Sửa hợp đồng
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Tên hợp đồng */}
            <TextField
              label="Tên hợp đồng *"
              name="name"
              value={createFormData.name}
              onChange={handleCreateInputChange}
              fullWidth
              size="medium"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Phê duyệt thanh toán */}
            <FormControl fullWidth size="small">
              <InputLabel>Phê duyệt thanh toán (Tùy chọn)</InputLabel>
              <Select
                name="paymentApprovalId"
                value={createFormData.paymentApprovalId}
                onChange={handleCreateInputChange}
                label="Phê duyệt thanh toán (Tùy chọn)"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">-- Không chọn --</MenuItem>
                {paymentApprovals.map((approval) => (
                  <MenuItem key={approval.id} value={approval.id.toString()}>
                    {approval.name} - {approval.amount ? approval.amount.toLocaleString("vi-VN") : 0}₫
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Ngày bắt đầu và Ngày kết thúc */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày bắt đầu *"
                  name="startDate"
                  type="datetime-local"
                  value={createFormData.startDate}
                  onChange={handleCreateInputChange}
                  fullWidth
                  size="small"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngày kết thúc *"
                  name="endDate"
                  type="datetime-local"
                  value={createFormData.endDate}
                  onChange={handleCreateInputChange}
                  fullWidth
                  size="small"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Tổng giá trị và Tiền tệ */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Tổng giá trị *"
                  name="totalValue"
                  type="number"
                  value={createFormData.totalValue}
                  onChange={handleCreateInputChange}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: "0", step: "1000" }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tiền tệ</InputLabel>
                  <Select
                    name="currency"
                    value={createFormData.currency}
                    onChange={handleCreateInputChange}
                    label="Tiền tệ"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="VND">VND</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Điều khoản thanh toán */}
            <TextField
              label="Điều khoản thanh toán"
              name="paymentTerms"
              value={createFormData.paymentTerms}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Điều khoản bảo hành */}
            <TextField
              label="Điều khoản bảo hành"
              name="guaranteeTerms"
              value={createFormData.guaranteeTerms}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Điều khoản chấm dứt */}
            <TextField
              label="Điều khoản chấm dứt"
              name="terminationTerms"
              value={createFormData.terminationTerms}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Ghi chú */}
            <TextField
              label="Ghi chú"
              name="notes"
              value={createFormData.notes}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 2,
        }}>
          <Button 
            onClick={handleCloseEdit}
            disabled={editSubmitting}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editSubmitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {editSubmitting ? "Đang cập nhật..." : "Cập nhật hợp đồng"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
