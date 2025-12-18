import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PERMISSION_CODES, PERMISSION_TYPES } from '../../../shared/constants/permissions';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TableContainer,
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
  InputAdornment,
} from "@mui/material";
import { useToast } from '../../../app/providers/ToastContext';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import contractApi from "../api/contract.api";
import projectApi from "../../project/api/project.api";
import paymentApprovalApi from "../../payment/api/paymentApproval.api";
import ContractDetail from "./ContractEnterpriseDetail";
import CommonTable from "../../../shared/components/CommonTable";
import CommonDialog from "../../../shared/components/CommonDialog";

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


const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

export default function Contracts() {
  const { id: enterpriseId } = useParams();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
  };

  const userId = getUserId();
  const { isOwner, hasPermission, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);

  // Check owner first, then permission
  const canManageContracts = isOwner || hasPermission(PERMISSION_CODES.CONTRACT_MANAGE);

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmContractId, setDeleteConfirmContractId] = useState(null);

  const isUnauthorized = !permissionsLoading && !isOwner;

  // Modal states
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedContract, setSelectedContract] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" or "edit"
  const [formSubmitting, setFormSubmitting] = useState(false);
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

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectApi.getProjectsByEnterprise();
        const projectsList = response?.data || response || [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách dự án";
        showToast(errorMessage, 'error', 3000);
      }
    };

    if (!permissionsLoading && canManageContracts) {
      loadProjects();
    }
  }, [enterpriseId, permissionsLoading, canManageContracts]);

  // Load payment approvals
  useEffect(() => {
    const loadPaymentApprovals = async () => {
      try {
        const response = await paymentApprovalApi.getPaymentApprovals(null, { states: ['APPROVED_ALL'] }, 0, 100);
        const approvalsList = response?.data || response || [];
        setPaymentApprovals(Array.isArray(approvalsList) ? approvalsList : []);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách phê duyệt thanh toán";
        showToast(errorMessage, 'error', 3000);
      }
    };

    if (!permissionsLoading && canManageContracts) {
      loadPaymentApprovals();
    }
  }, [permissionsLoading, canManageContracts]);

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
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách hợp đồng";
        showToast(errorMessage, 'error', 3000);
        setContracts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && canManageContracts) {
      fetchContracts();
    }
  }, [enterpriseId, permissionsLoading, canManageContracts, filterState, filterKeyword, filterProjectId, page, rowsPerPage, showToast]);

  const handleOpenDetail = (contract) => {
    setSelectedContract(contract);
    setViewMode("detail");
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedContract(null);
  };

  const handleEditFromDetail = () => {
    setFormOpen(true);
  };

  const handleOpenEdit = (contract) => {
    setEditingContract(contract);
    setFormMode("edit");
    setCreateFormData({
      name: contract.name || "",
      paymentApprovalId: contract.paymentApprovalId?.toString() || "",
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().slice(0, 16) : "",
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().slice(0, 16) : "",
      totalValue: contract.totalValue ? contract.totalValue.toLocaleString('vi-VN') : "",
      currency: contract.currency || "VND",
      paymentTerms: contract.paymentTerms || "",
      guaranteeTerms: contract.guaranteeTerms || "",
      terminationTerms: contract.terminationTerms || "",
      notes: contract.notes || "",
      attachments: contract.attachments || [],
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (!formSubmitting) {
      setFormOpen(false);
      setFormMode("create");
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
        showToast("Vui lòng nhập tên hợp đồng", 'error', 3000);
        return;
      }

      if (!createFormData.startDate) {
        showToast("Vui lòng chọn ngày bắt đầu", 'error', 3000);
        return;
      }

      if (!createFormData.endDate) {
        showToast("Vui lòng chọn ngày kết thúc", 'error', 3000);
        return;
      }

      // Parse totalValue removing formatting
      const totalValueNumeric = createFormData.totalValue.replace(/\D/g, '');
      if (!totalValueNumeric || parseFloat(totalValueNumeric) <= 0) {
        showToast("Vui lòng nhập tổng giá trị hợp đồng hợp lệ", 'error', 3000);
        return;
      }

      setFormSubmitting(true);

      const startDateISO = new Date(createFormData.startDate).toISOString();
      const endDateISO = new Date(createFormData.endDate).toISOString();

      const contractData = {
        name: createFormData.name,
        paymentApprovalId: createFormData.paymentApprovalId ? parseInt(createFormData.paymentApprovalId) : null,
        startDate: startDateISO,
        endDate: endDateISO,
        totalValue: parseFloat(totalValueNumeric),
        currency: createFormData.currency,
        paymentTerms: createFormData.paymentTerms || null,
        guaranteeTerms: createFormData.guaranteeTerms || null,
        terminationTerms: createFormData.terminationTerms || null,
        notes: createFormData.notes || null,
        attachments: createFormData.attachments || [],
      };

      // Call appropriate API based on formMode
      if (formMode === "edit" && editingContract) {
        await contractApi.updateContract(editingContract.id, contractData);
        showToast("Cập nhật hợp đồng thành công", 'success', 3000);
      } else {
        await contractApi.createContract(contractData, enterpriseId);
        showToast("Tạo hợp đồng thành công", 'success', 3000);
      }

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

      handleCloseForm();
    } catch (error) {
      showToast(
        error?.response?.data?.message || `Lỗi khi ${formMode === "edit" ? "cập nhật" : "tạo"} hợp đồng. Vui lòng thử lại.`,
        'error',
        3000
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteContract = (contractId) => {
    setDeleteConfirmContractId(contractId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmContractId) return;

    try {
      setDeletingContractId(deleteConfirmContractId);

      await contractApi.deleteContract(deleteConfirmContractId);

      showToast("Đã xóa hợp đồng thành công", 'success', 3000);

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
      showToast(
        error?.response?.data?.message || "Lỗi khi xóa hợp đồng. Vui lòng thử lại.",
        'error',
        3000
      );
    } finally {
      setDeletingContractId(null);
      setDeleteConfirmOpen(false);
      setDeleteConfirmContractId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteConfirmContractId(null);
  };

  const handleOpenCreate = () => {
    setFormMode("create");
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
    setFormOpen(true);
  };

  const handlePaymentApprovalsOpen = async () => {
    try {
      const response = await paymentApprovalApi.getPaymentApprovals(null, { states: ['APPROVED_ALL'] }, 0, 100);
      const approvalsList = response?.data || response || [];
      setPaymentApprovals(Array.isArray(approvalsList) ? approvalsList : []);
    } catch (error) {
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;

    // If changing paymentApprovalId, auto-fill totalValue from approval amount
    if (name === 'paymentApprovalId' && value) {
      const selectedApproval = paymentApprovals.find(
        approval => approval.id.toString() === value
      );
      if (selectedApproval && selectedApproval.amount) {
        setCreateFormData(prev => ({
          ...prev,
          [name]: value,
          totalValue: selectedApproval.amount.toLocaleString('vi-VN'),
        }));
        return;
      }
    }

    // Format currency for totalValue field
    if (name === 'totalValue') {
      // Remove all non-digit characters
      const numericValue = value.replace(/\D/g, '');
      // Format with thousand separators
      const formattedValue = numericValue ? parseInt(numericValue).toLocaleString('vi-VN') : '';
      setCreateFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    setCreateFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async () => {
    try {
      // Validate required fields
      if (!createFormData.name.trim()) {
        showToast("Vui lòng nhập tên hợp đồng", 'error', 3000);
        return;
      }

      if (!createFormData.startDate) {
        showToast("Vui lòng chọn ngày bắt đầu", 'error', 3000);
        return;
      }

      if (!createFormData.endDate) {
        showToast("Vui lòng chọn ngày kết thúc", 'error', 3000);
        return;
      }

      if (!createFormData.totalValue || parseFloat(createFormData.totalValue) <= 0) {
        showToast("Vui lòng nhập tổng giá trị hợp đồng hợp lệ", 'error', 3000);
        return;
      }

      // Use handleEditSubmit which now handles both create and edit
      await handleEditSubmit();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Lỗi khi tạo hợp đồng. Vui lòng thử lại.",
        'error',
        3000
      );
    }
  };

  const handleSubmitContract = async (contractId) => {
    try {
      setSubmittingContractId(contractId);

      await contractApi.submitContract(contractId, enterpriseId);

      showToast("Đã gửi duyệt hợp đồng", 'success', 3000);

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
      showToast(
        error?.response?.data?.message || "Lỗi khi gửi duyệt hợp đồng. Vui lòng thử lại.",
        'error',
        3000
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
      SUBMITTED: "Đang chờ",
      // SIGNED: "Đã ký",
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

  if (isUnauthorized) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Bạn không có quyền truy cập vào mục này
        </Alert>
      </Box>
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
          <Grid container spacing={2} alignItems="center">
            {/* Keyword Search */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Tìm kiếm hợp đồng ..."
                size="small"
                fullWidth
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
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

            {/* Project Filter */}
            <Grid item xs={12} sm={6} md={3}>
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
                  minWidth: 200,
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
              >
                <MenuItem value="">-- Bỏ chọn --</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Filter by State */}
            <Grid item xs={12} sm={6} md={2}>
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
                  minWidth: 100,
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
              >
                <MenuItem value="">-- Tất cả --</MenuItem>
                <MenuItem value="DRAFT">Bản nháp</MenuItem>
                <MenuItem value="SUBMITTED">Đang chờ</MenuItem>
                <MenuItem value="COMPLETED">Đã ký</MenuItem>
                <MenuItem value="CANCELED">Đã hủy</MenuItem>
              </TextField>
            </Grid>

            {/* Create Button */}
            <Grid item xs={12} sm={12} md={3}>
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
            </Grid>
          </Grid>
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
              field: 'supplierName',
              headerName: 'Nhà cung cấp',
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
              headerName: "Chi tiết",
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

      {/* Form Dialog - Create or Edit */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
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
          {formMode === "create" ? "Tạo hợp đồng" : "Sửa hợp đồng"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: formMode === "create" ? 2.5 : 3, mt: 2 }}>
            {/* Tên hợp đồng */}
            <TextField
              label="Tên hợp đồng"
              name="name"
              value={createFormData.name}
              onChange={handleCreateInputChange}
              fullWidth
              size={formMode === "create" ? "small" : "medium"}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                },
                '& .MuiInputBase-input': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  color: 'text.secondary',
                },
              }}
            />

            {/* Phê duyệt thanh toán */}
            <FormControl fullWidth size="small">
              <InputLabel sx={formMode === "create" ? { fontSize: '0.9375rem', color: 'text.secondary' } : {}}>Phê duyệt thanh toán {formMode === "edit" ? "(Tùy chọn)" : ""}</InputLabel>
              <Select
                name="paymentApprovalId"
                value={createFormData.paymentApprovalId}
                onChange={handleCreateInputChange}
                onOpen={handlePaymentApprovalsOpen}
                label={`Phê duyệt thanh toán`}
                required={formMode === "create"}
                sx={{
                  borderRadius: 2,
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  '& .MuiSelect-select': {
                    fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                    color: 'text.primary',
                  },
                }}
              >
                {paymentApprovals.map((approval) => (
                  <MenuItem key={approval.id} value={approval.id.toString()} sx={formMode === "create" ? { fontSize: '0.9375rem' } : {}}>
                    {approval.name} - {approval.amount ? approval.amount.toLocaleString("vi-VN") : 0}₫
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Ngày bắt đầu và Ngày kết thúc */}
            <Grid container spacing={formMode === "create" ? 1.5 : 2}>
              <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
                <TextField
                  label="Ngày bắt đầu"
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
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      color: 'text.primary',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
                <TextField
                  label="Ngày kết thúc"
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
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      color: 'text.primary',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Tổng giá trị và Tiền tệ */}
            <Grid container spacing={formMode === "create" ? 1.5 : 2}>
              <Grid item xs={12} sm={8} sx={{ width: '100%' }}>
                <TextField
                  label="Tổng giá trị *"
                  name="totalValue"
                  type="text"
                  value={createFormData.totalValue}
                  onChange={handleCreateInputChange}
                  placeholder="0"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      color: 'text.primary',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      color: 'text.secondary',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={{ width: '100%' }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={formMode === "create" ? { fontSize: '0.9375rem', color: 'text.secondary' } : {}}>Tiền tệ</InputLabel>
                  <Select
                    name="currency"
                    value={createFormData.currency}
                    onChange={handleCreateInputChange}
                    label="Tiền tệ"
                    sx={{
                      borderRadius: 2,
                      fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                      '& .MuiSelect-select': {
                        fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                        color: 'text.primary',
                      },
                    }}
                  >
                    <MenuItem value="VND" sx={formMode === "create" ? { fontSize: '0.9375rem' } : {}}>VND</MenuItem>
                    <MenuItem value="USD" sx={formMode === "create" ? { fontSize: '0.9375rem' } : {}}>USD</MenuItem>
                    <MenuItem value="EUR" sx={formMode === "create" ? { fontSize: '0.9375rem' } : {}}>EUR</MenuItem>
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
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                },
                '& .MuiInputBase-input': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
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
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                },
                '& .MuiInputBase-input': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
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
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                },
                '& .MuiInputBase-input': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
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
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                },
                '& .MuiInputBase-input': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
                  color: 'text.primary',
                },
                '& .MuiInputLabel-root': {
                  fontSize: formMode === "create" ? '0.9375rem' : 'inherit',
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
            onClick={handleCloseForm}
            disabled={formSubmitting}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={formSubmitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {formSubmitting ? (formMode === "create" ? "Đang tạo..." : "Đang cập nhật...") : (formMode === "create" ? "Tạo hợp đồng" : "Cập nhật hợp đồng")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <CommonDialog
        open={deleteConfirmOpen}
        title="Xác nhận xóa"
        onClose={handleCancelDelete}
        onSubmit={handleConfirmDelete}
        loading={deletingContractId !== null}
        submitLabel="Xóa"
        submitColor="error"
        centerButtons
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <Typography sx={{ textAlign: 'center', mb: 2 }}>
          Bạn có chắc chắn muốn xóa hợp đồng này?
        </Typography>
        <Typography sx={{ textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
          Hành động này không thể hoàn tác.
        </Typography>
      </CommonDialog>
    </Box>
  );
}
