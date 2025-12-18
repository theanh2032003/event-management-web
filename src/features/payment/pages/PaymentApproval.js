import React, { useState, useEffect } from "react";
import { Form, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  styled,
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
  useTheme,
  useMediaQuery,
  alpha,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import { useToast } from "../../../app/providers/ToastContext";
import {
  Edit as EditIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AccountBalance as PaymentIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Lock as LockIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import paymentApprovalApi from "../api/paymentApproval.api";
import projectApi from "../../project/api/project.api";
import quoteApi from "../../quote/api/quote.api";
import taskApi from "../../stage/api/task.api";
import PaymentApprovalDetail from "./PaymentApprovalDetail";
import { CommonTable } from "../../../shared/components/CommonTable";


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

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 120px)',
  overflow: 'hidden',
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const ContentScroll = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  minHeight: 0,
}));

export default function PaymentApproval() {
  const { id: enterpriseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return user?.id || user?._id || user?.userId || localStorage.getItem('userId');
  };

  const userId = getUserId();
  const { isOwner, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateChanging, setStateChanging] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filterStates, setFilterStates] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterKeywordInput, setFilterKeywordInput] = useState(""); // Temp input before search
  const [filterSupplierIds, setFilterSupplierIds] = useState([]);

  // Quote & Task data
  const [quotes, setQuotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingQuotesAndTasks, setLoadingQuotesAndTasks] = useState(false);

  // Modal states
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editProjectId, setEditProjectId] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    projectId: "",
    name: "",
    quoteId: "",
    taskId: "",
    type: "QUOTE",
    amount: "",
    purpose: "",
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approvePaymentId, setApprovePaymentId] = useState(null);
  const [approvePayment, setApprovePayment] = useState(null);
  const [approveNewState, setApproveNewState] = useState("");
  const [approveAvailableChanges, setApproveAvailableChanges] = useState([]);
  const [approveNote, setApproveNote] = useState("");
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectApi.getProjectsByEnterprise();
        const projectsList = response?.data || response || [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách dự án";
        showToast(`${errorMessage}`, "error", 3000);
      }
    };

    if (!permissionsLoading && isOwner) {
      loadProjects();
    }
  }, [enterpriseId, permissionsLoading, isOwner, showToast]);

  // Helper function to fetch payments
  const refreshPayments = async (newPage = 0, newRowsPerPage = rowsPerPage) => {
    try {
      setLoading(true);

      const filters = {};
      if (filterStates.length > 0) filters.states = filterStates;
      if (filterType) filters.type = filterType;
      if (filterKeyword) filters.keyword = filterKeyword;
      if (filterSupplierIds.length > 0) filters.supplierIds = filterSupplierIds;

      const response = await paymentApprovalApi.getPaymentApprovals(selectedProjectId || null, filters, newPage, newRowsPerPage);

      // Xử lý response structure
      let data = [];
      let total = 0;

      if (response?.content && Array.isArray(response.content)) {
        data = response.content;
        total = response.totalElements || response.total || 0;
      } else if (Array.isArray(response)) {
        data = response;
        total = response.length;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
          total = response.totalElements || response.total || response.data.length;
        } else if (response.data.content) {
          data = response.data.content;
          total = response.data.totalElements || response.data.total || 0;
        }
      }

      setPayments(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setPage(newPage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách phê duyệt thanh toán";
      showToast(`${errorMessage}`, "error", 3000);
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments
  useEffect(() => {
    if (!permissionsLoading && isOwner) {
      refreshPayments(page, rowsPerPage);
    }
  }, [selectedProjectId, filterStates, filterType, filterKeyword, filterSupplierIds, page, rowsPerPage, permissionsLoading, isOwner, showToast]);

  // Handle quote selection in create form - auto-fill amount from selected quote
  useEffect(() => {
    if (createFormData.quoteId && quotes.length > 0) {
      const selectedQuote = quotes.find(q => q.id.toString() === createFormData.quoteId);
      if (selectedQuote && selectedQuote.finalPrice) {
        setCreateFormData(prev => ({
          ...prev,
          amount: selectedQuote.finalPrice.toString()
        }));
      }
    }
  }, [createFormData.quoteId, quotes]);

  // Handle quote selection in edit form - auto-fill amount from selected quote
  useEffect(() => {
    if (editFormData?.quoteId && quotes.length > 0) {
      const selectedQuote = quotes.find(q => q.id.toString() === editFormData.quoteId);
      if (selectedQuote && selectedQuote.finalPrice) {
        setEditFormData(prev => ({
          ...prev,
          amount: selectedQuote.finalPrice.toString()
        }));
      }
    }
  }, [editFormData?.quoteId, quotes]);

  const handleOpenDetail = (payment) => {
    navigate(`/enterprise/${enterpriseId}/payment-approvals/${payment.id}`);
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedPayment(null);
  };

  const handleEditFromDetail = () => {
    setViewMode("list");
    handleOpenEdit(selectedPayment);
  };

  const handleStateChange = async (paymentId, newState) => {
    // Chỉ xử lý submit (không yêu cầu note)
    if (newState === "PENDING") {
      try {
        setStateChanging(paymentId);

        // Gọi hàm submit
        await paymentApprovalApi.submit(paymentId);

        showToast("Gửi duyệt cấp 1 thành công", "success", 3000);

        // Cập nhật payment trong list
        setPayments(prev =>
          prev.map(p => p.id === paymentId ? { ...p, state: "PENDING" } : p)
        );

        // Cập nhật selected payment nếu đang xem detail
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment(prev => ({ ...prev, state: "PENDING" }));
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi gửi duyệt";
        showToast(`${errorMessage}`, "error", 3000);
      } finally {
        setStateChanging(null);
      }
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case "DRAFT":
        return "Nháp";
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED_LV1":
        return "Duyệt cấp 1";
      case "REJECTED_LV1":
        return "Từ chối cấp 1";
      case "APPROVED_ALL":
        return "Duyệt";
      case "REJECTED_LV2":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const getAvailableStateChanges = (payment) => {
    const changes = [];

    // Nếu có quyền duyệt cấp 2, chỉ hiện trạng thái cấp 2
    if (payment.canApproveLv2) {
      changes.push({ value: "APPROVED_ALL", label: "Duyệt" });
      changes.push({ value: "REJECTED_LV2", label: "Từ chối" });
    }
    // Nếu có quyền duyệt cấp 1 (và không có cấp 2), chỉ hiện trạng thái cấp 1
    else if (payment.canApproveLv1) {
      changes.push({ value: "APPROVED_LV1", label: "Duyệt cấp 1" });
      changes.push({ value: "REJECTED_LV1", label: "Từ chối cấp 1" });
    }
    // Nếu chỉ có quyền submit, không hiện trạng thái duyệt (submit được xử lý riêng)

    return changes;
  };

  // Handle keyword search - apply filter on Enter or blur
  const handleKeywordSearch = () => {
    setFilterKeyword(filterKeywordInput);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleKeywordSearch();
    }
  };

  const handleOpenEdit = (payment) => {
    setEditPaymentId(payment.id);
    setEditProjectId(payment.projectId);
    setEditFormData({
      projectId: payment.projectId.toString(),
      name: payment.name,
      quoteId: payment.quoteId?.toString() || "",
      taskId: payment.taskId?.toString() || "",
      type: payment.type,
      amount: payment.amount.toString(),
      purpose: payment.purpose || "",
    });
    setEditOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      if (!editFormData.name.trim()) {
        showToast("Vui lòng nhập tên phê duyệt", "error", 3000);
        return;
      }
      if (!editFormData.amount || isNaN(editFormData.amount) || parseFloat(editFormData.amount) <= 0) {
        showToast("Vui lòng nhập số tiền hợp lệ", "error", 3000);
        return;
      }

      setEditSubmitting(true);

      const updateData = {
        name: editFormData.name.trim(),
        quoteId: editFormData.quoteId ? parseInt(editFormData.quoteId) : null,
        taskId: editFormData.taskId ? parseInt(editFormData.taskId) : null,
        type: editFormData.type,
        amount: parseFloat(editFormData.amount),
        purpose: editFormData.purpose.trim() || null,
      };

      await paymentApprovalApi.updatePaymentApproval(editProjectId, editPaymentId, updateData);

      showToast("Cập nhật phê duyệt thanh toán thành công", "success", 3000);

      // Fetch lại data từ đầu
      await refreshPayments(0, rowsPerPage);

      setEditOpen(false);
      setEditFormData(null);
      setEditPaymentId(null);
      setEditProjectId(null);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi cập nhật phê duyệt thanh toán";
      showToast(`${errorMessage}`, "error", 3000);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (paymentId) => {
    setDeleteTargetId(paymentId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteSubmitting(true);

      await paymentApprovalApi.deletePaymentApproval(deleteTargetId);

      showToast("Xoá phê duyệt thanh toán thành công", "success", 3000);

      // Fetch lại data từ đầu
      await refreshPayments(0, rowsPerPage);

      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      if (viewMode === "detail") {
        handleCloseDetail();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi xoá phê duyệt thanh toán";
      showToast(`${errorMessage}`, "error", 3000);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      ...createFormData,
      [name]: value
    };

    // Reset quote/task khi project thay đổi
    if (name === "projectId") {
      newData.quoteId = "";
      newData.taskId = "";
    }

    setCreateFormData(newData);
  };

  // Handle project dropdown open in create form - load projects
  const handleCreateProjectOpen = async () => {
    try {
      const response = await projectApi.getProjectsByEnterprise();
      const projectsData = response?.data || response || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách dự án";
      showToast(`${errorMessage}`, "error", 3000);
    }
  };

  // Handle quotes dropdown open in create form - load quotes
  const handleCreateQuotesOpen = async () => {
    if (!createFormData.projectId) return;
    try {
      const quotesResponse = await quoteApi.getQuotes({ projectId: createFormData.projectId }, 0, 100);
      const quotesData = quotesResponse?.data || quotesResponse || [];
      setQuotes(Array.isArray(quotesData) ? quotesData : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách báo giá";
      showToast(`${errorMessage}`, "error", 3000);
    }
  };

  // Handle tasks dropdown open in create form - load tasks
  const handleCreateTasksOpen = async () => {
    if (!createFormData.projectId) return;
    try {
      const tasksResponse = await taskApi.getTasks({ projectId: createFormData.projectId }, 0, 100);
      const tasksData = tasksResponse?.data || tasksResponse || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách công việc";
      showToast(`${errorMessage}`, "error", 3000);
    }
  };

  // Handle project dropdown open in edit form - load projects
  const handleEditProjectOpen = async () => {
    try {
      const response = await projectApi.getProjectsByEnterprise();
      const projectsData = response?.data || response || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách dự án";
      showToast(`${errorMessage}`, "error", 3000);
    }
  };

  // Handle quotes dropdown open in edit form - load quotes
  const handleEditQuotesOpen = async () => {
    if (!editFormData?.projectId) return;
    try {
      const quotesResponse = await quoteApi.getQuotes({ projectId: editFormData.projectId }, 0, 100);
      const quotesData = quotesResponse?.data || quotesResponse || [];
      setQuotes(Array.isArray(quotesData) ? quotesData : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách báo giá";
      showToast(`${errorMessage}`, "error", 3000);
    }
  };

  // Handle tasks dropdown open in edit form - load tasks
  const handleEditTasksOpen = async () => {
    if (!editFormData?.projectId) return;
    try {
      const tasksResponse = await taskApi.getTasks({ projectId: editFormData.projectId }, 0, 100);
      const tasksData = tasksResponse?.data || tasksResponse || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách công việc";
      showToast(`${errorMessage}`, "error", 3000);
    }
  };

  const handleApproveSubmit = async () => {
    try {
      if (!approveNewState) {
        showToast("Vui lòng chọn trạng thái duyệt", "error", 3000);
        return;
      }

      setApproveSubmitting(true);

      // Gọi API duyệt dựa trên trạng thái được chọn
      if (["APPROVED_LV1", "REJECTED_LV1"].includes(approveNewState)) {
        // Duyệt cấp 1
        await paymentApprovalApi.approvalLv1(approvePaymentId, {
          state: approveNewState,
          note: approveNote.trim()
        });
      } else if (["APPROVED_ALL", "REJECTED_LV2"].includes(approveNewState)) {
        // Duyệt cấp 2
        await paymentApprovalApi.approvalLv2(approvePaymentId, {
          state: approveNewState,
          note: approveNote.trim()
        });
      } else {
        throw new Error("Trạng thái duyệt không hợp lệ");
      }

      showToast("Duyệt phê duyệt thanh toán thành công", "success", 3000);

      // Cập nhật payment trong list
      setPayments(prev =>
        prev.map(p =>
          p.id === approvePaymentId ? { ...p, state: approveNewState } : p
        )
      );

      // Cập nhật selected payment nếu đang xem detail
      if (selectedPayment?.id === approvePaymentId) {
        setSelectedPayment(prev => ({ ...prev, state: approveNewState }));
      }

      // Đóng dialog
      setApproveOpen(false);
      setApprovePaymentId(null);
      setApprovePayment(null);
      setApproveNewState("");
      setApproveNote("");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi duyệt phê duyệt thanh toán";
      showToast(`${errorMessage}`, "error", 3000);
    } finally {
      setApproveSubmitting(false);
    }
  };

  const handleCreateSubmit = async () => {
    try {
      if (!createFormData.name.trim()) {
        showToast("Vui lòng nhập tên phê duyệt", "error", 3000);
        return;
      }
      if (!createFormData.amount || isNaN(createFormData.amount) || parseFloat(createFormData.amount) <= 0) {
        showToast("Vui lòng nhập số tiền hợp lệ", "error", 3000);
        return;
      }

      setCreateSubmitting(true);

      const paymentData = {
        name: createFormData.name.trim(),
        quoteId: createFormData.quoteId ? parseInt(createFormData.quoteId) : null,
        taskId: createFormData.taskId ? parseInt(createFormData.taskId) : null,
        type: createFormData.type,
        amount: parseFloat(createFormData.amount),
        purpose: createFormData.purpose.trim() || null,
      };

      const projectIdToUse = createFormData.projectId || selectedProjectId;
      await paymentApprovalApi.createPaymentApproval(projectIdToUse, paymentData);

      showToast("Tạo phê duyệt thanh toán thành công", "success", 3000);

      // Fetch lại data từ đầu
      await refreshPayments(0, rowsPerPage);

      // Reset form and close modal
      setCreateFormData({
        projectId: "",
        name: "",
        quoteId: "",
        taskId: "",
        type: "QUOTE",
        amount: "",
        purpose: "",
      });
      setCreateOpen(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tạo phê duyệt thanh toán";
      showToast(`${errorMessage}`, "error", 3000);
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (permissionsLoading) {
    return (
      <LoadingBox>
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          Đang tải...
        </Typography>
      </LoadingBox>
    );
  }

  // Show detail view
  if (viewMode === "detail" && selectedPayment) {
    return (
      <PaymentApprovalDetail
        payment={selectedPayment}
        onBack={handleCloseDetail}
        onEdit={selectedPayment.state === "DRAFT" ? handleEditFromDetail : undefined}
      />
    );
  }

  return (
    <Box>
      {/* Filter Bar */}
      <FilterCard>
        <CardContent>
          {/* Keyword Search Row */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginBottom: 2 }}>
            {/* Keyword Search */}
            <TextField
              placeholder="Tìm kiếm phiếu duyệt chi ..."
              size="small"
              value={filterKeywordInput}
              onChange={(e) => setFilterKeywordInput(e.target.value)}
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
                flex: 1,
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
          </Box>

          {/* Filter Controls Row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            {/* Project Filter */}
            <Box sx={{ width: "calc(25% - 6px)" }}>
              <TextField
                select
                label="Sự kiện"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                size="small"
                fullWidth
                displayEmpty
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
              >
                <MenuItem value="">-- Bỏ chọn --</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Filter by Type */}
            <Box sx={{ width: "calc(20% - 6px)" }}>
              <TextField
                select
                label="Loại"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                size="small"
                fullWidth
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
              >
                <MenuItem value="">-- Tất cả --</MenuItem>
                <MenuItem value="QUOTE">Báo Giá</MenuItem>
                <MenuItem value="TASK">Công Việc</MenuItem>
              </TextField>
            </Box>

            {/* Filter by States (Multi-select) */}
            <Box sx={{ width: "calc(20% - 6px)" }}>
              <TextField
                select
                multiple
                label="Trạng thái"
                value={filterStates}
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                  // If empty string is selected, clear all states
                  if (value.includes('')) {
                    setFilterStates([]);
                  } else {
                    setFilterStates(value);
                  }
                }}
                size="small"
                fullWidth
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
              >
                <MenuItem value="">-- Bỏ chọn --</MenuItem>
                <MenuItem value="DRAFT">Nháp</MenuItem>
                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                <MenuItem value="APPROVED_LV1">Đã duyệt cấp 1</MenuItem>
                <MenuItem value="REJECTED_LV1">Từ chối cấp 1</MenuItem>
                <MenuItem value="APPROVED_ALL">Đã duyệt</MenuItem>
                <MenuItem value="REJECTED_LV2">Từ chối cấp 2</MenuItem>
              </TextField>
            </Box>

            {/* Create Button */}
            <Box sx={{ width: "calc(20% - 6px)" }}>
              <StyledButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
                fullWidth
                sx={{ height: 40 }}
              >
                Tạo Phê Duyệt
              </StyledButton>
            </Box>
          </Box>
        </CardContent>
      </FilterCard>

      {loading ? (
        <LoadingBox>
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </LoadingBox>
     
      ) : payments.length > 0 ? (
        <CommonTable
          columns={[
            {
              field: "name",
              headerName: "Tên Phê Duyệt",
              render: (value, row) => row.name,
            },
            {
              field: "type",
              headerName: "Loại",
              render: (value, row) => (
                <Chip
                  label={row.type === "QUOTE" ? "Báo Giá" : "Công Việc"}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              field: "amount",
              headerName: "Số Tiền",
              align: "right",
              render: (value, row) => `${row.amount ? row.amount.toLocaleString("vi-VN") : 0}₫`,
            },

            {
              field: "state",
              headerName: "Trạng thái",
              render: (value, row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={getStateLabel(row.state)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ),
            },
            {
              field: "actions",
              headerName: "Hành động",
              align: "center",
              render: (value, payment) => (
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                  {payment.state === "DRAFT" && payment.canSubmit && (
                    <Tooltip title="Gửi duyệt" arrow>
                      <ActionButton
                        size="small"
                        onClick={() => handleStateChange(payment.id, "PENDING")}
                        disabled={stateChanging === payment.id}
                        sx={{ color: "primary.main" }}
                      >
                        <SendIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  )}

                  {payment.state !== "DRAFT" &&
                    !["APPROVED_ALL", "REJECTED_LV2"].includes(payment.state) &&
                    (payment.canApproveLv1 || payment.canApproveLv2) && (
                      <Tooltip title="Duyệt" arrow>
                        <ActionButton
                          size="small"
                          onClick={() => {
                            const availableChanges = getAvailableStateChanges(payment);
                            setApprovePaymentId(payment.id);
                            setApprovePayment(payment);
                            setApproveAvailableChanges(availableChanges);
                            setApproveNewState("");
                            setApproveNote("");
                            setApproveOpen(true);
                          }}
                          disabled={stateChanging === payment.id}
                          sx={{ color: "success.main" }}
                        >
                          <ApproveIcon fontSize="small" />
                        </ActionButton>
                      </Tooltip>
                    )}

                  {(payment.state === "APPROVED_ALL" || payment.state === "REJECTED_LV2") && (
                    <Tooltip title={payment.state === "APPROVED_ALL" ? "Đã duyệt" : "Bị từ chối"} arrow>
                      <span>
                        <ActionButton
                          size="small"
                          disabled
                          sx={{ color: payment.state === "APPROVED_ALL" ? "success.main" : "error.main" }}
                        >
                          {payment.state === "APPROVED_ALL" ? <ApproveIcon fontSize="small" /> : <RejectIcon fontSize="small" />}
                        </ActionButton>
                      </span>
                    </Tooltip>
                  )}

                  <Tooltip title="Chi tiết" arrow>
                    <ActionButton
                      size="small"
                      onClick={() => handleOpenDetail(payment)}
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
                  {payment.state === "DRAFT" && (
                    <Tooltip title="Sửa" arrow>
                      <ActionButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(payment)}
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
                  {(payment.state === "DRAFT" || payment.state === "PENDING") && (
                    <Tooltip title="Xoá" arrow>
                      <ActionButton
                        size="small"
                        onClick={() => handleOpenDeleteConfirm(payment.id)}
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
          data={payments}
          loading={loading}
          rowsPerPage={rowsPerPage}
          page={page}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          emptyMessage="Chưa có phê duyệt thanh toán nào"
          maxHeight="calc(100vh - 380px)"
          minHeight="calc(100vh - 380px)"
        />
      ) : (
        <EmptyStateBox>
          <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Không có phê duyệt thanh toán nào
          </Typography>

        </EmptyStateBox>
      )}

      {/* Edit Payment Modal */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          Sửa Phê Duyệt Thanh Toán
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {editFormData && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {/* Chọn Project */}
              <FormControl fullWidth size="small">
                <InputLabel id="project-label">Sự kiện</InputLabel>
                <Select
                  labelId="project-label"
                  label="Sự kiện *"
                  name="projectId"
                  value={editFormData.projectId}
                  onChange={handleEditInputChange}
                  size="small"
                  fullWidth
                  disabled
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tên phê duyệt */}
              <TextField
                label="Tên Phê Duyệt *"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                fullWidth
                size="small"
              />

              {/* Loại */}
              <FormControl fullWidth size="small">
                <InputLabel id="type-label">Loại</InputLabel>
                <Select
                  labelId="type-label"
                  label="Loại *"
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditInputChange}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="QUOTE">Báo Giá</MenuItem>
                  <MenuItem value="TASK">Công Việc</MenuItem>
                </Select>
              </FormControl>

              {/* Chọn Quote - Chỉ hiển thị nếu loại là QUOTE */}
              {editFormData.type === "QUOTE" && (
                <FormControl>
                  <InputLabel id="quote-label">Báo Giá</InputLabel>
                  <Select
                    labelId="quote-label"
                    label="Báo Giá *"
                    name="quoteId"
                    value={editFormData.quoteId}
                    onChange={handleEditInputChange}
                    onOpen={handleEditQuotesOpen}
                    size="small"
                    fullWidth
                  >
                    {quotes.map((quote) => (
                      <MenuItem key={quote.id} value={quote.id.toString()}>
                        {`${quote.name || `Quote #${quote.id}`} - ${quote.finalPrice ? quote.finalPrice.toLocaleString("vi-VN") : 0}₫`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}


              {/* Số tiền */}
              <TextField
                label="Số Tiền"
                name="amount"
                type="number"
                value={editFormData.amount}
                onChange={handleEditInputChange}
                fullWidth
                size="small"
                inputProps={{ min: "0", step: "1000" }}
              />

              {/* Mục đích */}
              <TextField
                label="Mục Đích"
                name="purpose"
                value={editFormData.purpose}
                onChange={handleEditInputChange}
                fullWidth
                size="small"
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setEditOpen(false)}
            disabled={editSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editSubmitting}
          >
            {editSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Xác Nhận Xoá
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xoá phê duyệt thanh toán này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleteSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteSubmitting}
          >
            {deleteSubmitting ? "Đang xoá..." : "Xoá"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Payment Dialog */}
      <Dialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          Phê Duyệt Thanh Toán {approvePayment ? approvePayment.name : ""}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {approvePayment && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

              {/* Chọn trạng thái duyệt */}
              <Box>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel id="approve-new-state-label">Hành động duyệt</InputLabel>
                  <Select
                    labelId="approve-new-state-label"
                    label="Hành động duyệt *"
                    value={approveNewState}
                    onChange={(e) => setApproveNewState(e.target.value)}
                    size="small"
                    fullWidth
                  >
                    {approveAvailableChanges.map(change => (
                      <MenuItem key={change.value} value={change.value}>
                        {change.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Ghi chú duyệt */}
              <TextField
                label="Ghi chú duyệt"
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={4}
                placeholder="Nhập ghi chú duyệt hoặc lý do từ chối..."
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setApproveOpen(false)}
            disabled={approveSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleApproveSubmit}
            disabled={approveSubmitting || !approveNewState}
          >
            {approveSubmitting ? "Đang duyệt..." : "Duyệt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Payment Modal */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          // Reset form when closing
          setCreateFormData({
            projectId: "",
            name: "",
            quoteId: "",
            taskId: "",
            type: "QUOTE",
            amount: "",
            purpose: "",
          });
          setQuotes([]);
          setTasks([]);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          Tạo Phê Duyệt Thanh Toán
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Chọn Project */}
            <FormControl fullWidth size="small">
              <InputLabel id="create-project-label">Sự kiện</InputLabel>
              <Select
                labelId="create-project-label"
                label="Sự kiện"
                name="projectId"
                value={createFormData.projectId}
                onChange={handleCreateInputChange}
                onOpen={handleCreateProjectOpen}
                size="small"
                fullWidth
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tên phê duyệt */}
            <TextField
              label="Tên Phê Duyệt"
              name="name"
              value={createFormData.name}
              onChange={handleCreateInputChange}
              fullWidth
              required
              size="small"
            />

            {/* Loại */}
            <FormControl fullWidth size="small">
              <InputLabel id="create-type-label">Loại</InputLabel>
              <Select
                labelId="create-type-label"
                label="Loại"
                name="type"
                value={createFormData.type}
                onChange={handleCreateInputChange}
                size="small"
                fullWidth
              >
                <MenuItem value="QUOTE">Báo Giá</MenuItem>
                <MenuItem value="TASK">Công Việc</MenuItem>
              </Select>
            </FormControl>

            {/* Chọn Quote - Chỉ hiển thị nếu loại là QUOTE */}
            {createFormData.type === "QUOTE" && (
              <FormControl fullWidth size="small">
                <InputLabel id="create-quote-label" sx={{ textAlign: 'center' }}>Báo Giá</InputLabel>
                <Select
                  labelId="create-quote-label"
                  label="Báo Giá"
                  name="quoteId"
                  value={createFormData.quoteId}
                  onChange={handleCreateInputChange}
                  onOpen={handleCreateQuotesOpen}
                  size="small"
                  fullWidth
                  disabled={!createFormData.projectId || loadingQuotesAndTasks}
                >
                  <MenuItem value="">-- Không chọn --</MenuItem>
                  {quotes.map((quote) => (
                    <MenuItem key={quote.id} value={quote.id.toString()}>
                      {`${quote.name || `Quote #${quote.id}`} - ${quote.finalPrice ? quote.finalPrice.toLocaleString("vi-VN") : 0}₫`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            


            {/* Số tiền */}
            <TextField
              label="Số Tiền *"
              name="amount"
              type="number"
              value={createFormData.amount}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              inputProps={{ min: "0", step: "1000" }}
            />

            {/* Mục đích */}
            <TextField
              label="Ghi chú"
              name="purpose"
              value={createFormData.purpose}
              onChange={handleCreateInputChange}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setCreateOpen(false);
              // Reset form when closing
              setCreateFormData({
                projectId: "",
                name: "",
                quoteId: "",
                taskId: "",
                type: "QUOTE",
                amount: "",
                purpose: "",
              });
              setQuotes([]);
              setTasks([]);
            }}
            disabled={createSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={createSubmitting}
          >
            {createSubmitting ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
