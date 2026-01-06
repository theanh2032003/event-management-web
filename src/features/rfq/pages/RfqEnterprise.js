import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  Container,
  useMediaQuery,
  styled,
  alpha,
  TextField,
  Card,
  Grid,
  CardContent,
  Autocomplete,
} from "@mui/material";
import {
  RequestQuote as RequestQuoteIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import { useToast } from "../../../app/providers/ToastContext";
import rfqApi from "../api/rfq.api";
import QuoteRequestModal from "../../product/components/QuoteRequestModal";
import QuoteRequestDetail from "./RfqEnterpriseDetail";
import { CommonTable } from "../../../shared/components/CommonTable";
import { CommonDialog } from "../../../shared/components/CommonDialog";
import projectApi from "../../project/api/project.api";
import supplierApi from "../../supplier/api/supplier.api";

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

export default function QuoteRequests() {
  const { id: enterpriseId, rfqId } = useParams();
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
  const { isOwner, permissions, loading: permissionsLoading } = useEnterpriseUserPermissions(userId);
  const hasRfqManagePermission = permissions?.some(p => p.code === 'rfq_manage') || false;
  // Allow access if user is owner OR has rfq_manage permission
  const isUnauthorized = !permissionsLoading && !isOwner && !hasRfqManagePermission;

  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateChanging, setStateChanging] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    keyword: '',
    state: '',
    projectId: '',
    supplierId: '',
  });

  // Data for dropdowns
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [states, setStates] = useState([]);
  const [projectKeyword, setProjectKeyword] = useState('');
  const [supplierKeyword, setSupplierKeyword] = useState('');
  const [stateKeyword, setStateKeyword] = useState('');
  const [projectSearchTimer, setProjectSearchTimer] = useState(null);
  const [supplierSearchTimer, setSupplierSearchTimer] = useState(null);
  const [stateSearchTimer, setStateSearchTimer] = useState(null);

  // Modal states
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRfqId, setDeletingRfqId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch quote requests
  useEffect(() => {
    const fetchQuoteRequests = async () => {
      try {
        setLoading(true);
        const filterParams = {
          ...(filters.keyword && { keyword: filters.keyword }),
          ...(filters.state && { state: filters.state }),
          ...(filters.projectId && { projectId: filters.projectId }),
          ...(filters.supplierId && { supplierId: filters.supplierId }),
        };

        const response = await rfqApi.getRfqs(filterParams, page, rowsPerPage);

        // Handle response structure
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
            total = response?.metadata?.total || data.length;
          } else if (response.data.content) {
            data = response.data.content;
            total = response.data.totalElements || response.data.total || 0;
          }
        }

        setQuoteRequests(Array.isArray(data) ? data : []);
        setTotalCount(total);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách yêu cầu báo giá";
        showToast(errorMessage, 'error');
        setQuoteRequests([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && !isUnauthorized) {
      fetchQuoteRequests();
    }
  }, [enterpriseId, permissionsLoading, isUnauthorized, showToast, page, rowsPerPage, filters]);

  // Auto-load detail view if rfqId is in URL params
  useEffect(() => {
    if (rfqId && !isNaN(parseInt(rfqId)) && !permissionsLoading && !isUnauthorized) {
      setDetailLoading(true);
      rfqApi.getRfqById(parseInt(rfqId))
        .then((detailedRfq) => {
          setSelectedRfq(detailedRfq);
          setViewMode("detail");
          setDetailLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching RFQ detail:", error);
          setViewMode("list");
          setDetailLoading(false);
        });
    }
  }, [rfqId, permissionsLoading, isUnauthorized]);

  const handleEditClick = (rfq) => {
    setSelectedRfq(rfq);
    setEditModalOpen(true);
  };

  const handleOpenDetail = (rfq) => {
    navigate(`/enterprise/${enterpriseId}/quote-requests/${rfq.id}`);
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedRfq(null);
    navigate(`/enterprise/${enterpriseId}/quote-requests`);
  };

  const handleEditFromDetail = () => {
    setEditModalOpen(true);
  };

  const handleDeleteClick = (rfq) => {
    setSelectedRfq(rfq);
    setDeletingRfqId(rfq.id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRfqId) return;

    try {
      setDeleteLoading(true);
      await rfqApi.deleteRfq(deletingRfqId);

      // Reload data from server
      const response = await rfqApi.getRfqs({}, page, rowsPerPage);

      let data = [];
      let total = 0;

      if (response?.content && Array.isArray(response.content)) {
        data = response.content;
        total = response.totalElements || response.total || 0;
      } else if (Array.isArray(response)) {
        data = response;
        total = response.length;
      } else if (response?.data) {
        data = Array.isArray(response.data) ? response.data : response.data.content || [];
        total = response?.metadata?.total || data.length;
      }

      setQuoteRequests(Array.isArray(data) ? data : []);
      setTotalCount(total);

      // Close modal first
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setDeletingRfqId(null);
      setSelectedRfq(null);

      // Show success toast after modal is closed
      setTimeout(() => {
        showToast("Xóa yêu cầu báo giá thành công", 'success', 4000);
      }, 600);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi xóa yêu cầu báo giá";
      showToast(errorMessage, 'error', 5000);
      setDeleteLoading(false);
    }
  };

  const handleSaveEdit = async (updatedData) => {
    // Reload data from server to get updated project info
    try {
      const response = await rfqApi.getRfqs({}, page, rowsPerPage);

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
          total = response?.metadata?.total || response.data.length;
        } else if (response.data.content) {
          data = response.data.content;
          total = response.data.totalElements || response.data.total || 0;
        }
      }

      setQuoteRequests(Array.isArray(data) ? data : []);
      setTotalCount(total);
      // showToast("Đã cập nhật và tải lại danh sách", 'success');
    } catch (error) {
      // Fallback to old way if reload fails
      setQuoteRequests(prev =>
        prev.map(rfq => rfq.id === selectedRfq.id ? { ...rfq, ...updatedData } : rfq)
      );
    }
    setEditModalOpen(false);
    setSelectedRfq(null);
  };

  const handleStateChange = async (rfqId, newState) => {
    try {
      setStateChanging(rfqId);
      await rfqApi.enterpriseChangeState(rfqId, { state: newState });
      showToast("Cập nhật trạng thái thành công", 'success');

      // Reload data to get updated list
      const response = await rfqApi.getRfqs({}, page, rowsPerPage);

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
          total = response?.metadata?.total || response.data.length;
        } else if (response.data.content) {
          data = response.data.content;
          total = response.data.totalElements || response.data.total || 0;
        }
      }

      setQuoteRequests(Array.isArray(data) ? data : []);
      setTotalCount(total);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi cập nhật trạng thái";
      showToast(errorMessage, 'error');
    } finally {
      setStateChanging(null);
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case "DRAFT":
        return "Bản nháp";
      case "SENT":
        return "Đã gửi";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "DRAFT":
        return "warning";
      case "SENT":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filter changes
  };

  const renderAutocompleteFilter = (field, label, options, keywordState, setKeywordState, searchHandler, openHandler) => {
    return (
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.name || ''}
        value={options.find((p) => p.id === filters[field]) || null}
        onChange={(e, value) => handleFilterChange(field, value?.id || "")}
        onInputChange={(e, value, reason) => {
          if (reason === 'input') {
            searchHandler(value);
          }
        }}
        onOpen={() => openHandler()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size="small"
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
        )}
        sx={{ minWidth: 200, width: '100%' }}
        disablePortal
        noOptionsText="Không có dữ liệu"
        ListboxProps={{
          style: {
            maxHeight: '48px * 5 + 8px',
            overflow: 'auto',
          },
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 'calc(48px * 5 + 8px)',
            },
          },
        }}
      />
    );
  };

  const handleProjectDropdownOpen = async () => {
    setProjectKeyword('');
    try {
      const response = await projectApi.getProjects({}, 0, 100);
      let projectData = [];
      if (response?.content && Array.isArray(response.content)) {
        projectData = response.content;
      } else if (Array.isArray(response)) {
        projectData = response;
      } else if (response?.data) {
        projectData = Array.isArray(response.data) ? response.data : response.data.content || [];
      }
      setProjects(projectData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleProjectSearch = async (keyword) => {
    setProjectKeyword(keyword);
    if (projectSearchTimer) clearTimeout(projectSearchTimer);

    const timer = setTimeout(async () => {
      try {
        const response = await projectApi.getProjectsByEnterprise(keyword || '', 0, 100);
        let projectData = [];
        if (response?.content && Array.isArray(response.content)) {
          projectData = response.content;
        } else if (Array.isArray(response)) {
          projectData = response;
        } else if (response?.data) {
          projectData = Array.isArray(response.data) ? response.data : response.data.content || [];
        }
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }, 300);

    setProjectSearchTimer(timer);
  };

  const handleSupplierSearch = async (keyword) => {
    setSupplierKeyword(keyword);
    if (supplierSearchTimer) clearTimeout(supplierSearchTimer);

    const timer = setTimeout(async () => {
      try {
        const response = await supplierApi.getSuppliers(keyword || '', 0, 100);
        let supplierData = [];
        if (response?.content && Array.isArray(response.content)) {
          supplierData = response.content;
        } else if (Array.isArray(response)) {
          supplierData = response;
        } else if (response?.data) {
          supplierData = Array.isArray(response.data) ? response.data : response.data.content || [];
        }
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }, 300);

    setSupplierSearchTimer(timer);
  };

  const handleStateSearch = async (keyword) => {
    setStateKeyword(keyword);
    if (stateSearchTimer) clearTimeout(stateSearchTimer);

    const timer = setTimeout(async () => {
      // Filter states based on keyword
      const stateOptions = [
        { id: 'DRAFT', name: 'Bản nháp' },
        { id: 'SENT', name: 'Đã gửi' },
      ];

      const filtered = stateOptions.filter(s =>
        s.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setStates(filtered);
    }, 300);

    setStateSearchTimer(timer);
  };

  const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  }));

  const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  maxWidth: 900,
  margin: '0 auto',
  }));

  const LockedOverlay = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(6),
    textAlign: 'center',
  }));

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
      <PageContainer maxWidth="sm">
        <FormCard>
          <CardContent>
            <LockedOverlay>
              <LockIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.warning.main,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Truy cập bị từ chối
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Bạn không có quyền truy cập yêu cầu báo giá.
              </Typography>
            </LockedOverlay>
          </CardContent>
        </FormCard>
      </PageContainer>
    );
  }

  // Show detail view if viewMode is "detail"
  if (viewMode === "detail" && selectedRfq) {
    return (
      <QuoteRequestDetail
        rfq={selectedRfq}
        onBack={handleCloseDetail}
        onEdit={selectedRfq.state === "DRAFT" ? handleEditFromDetail : undefined}
        loading={detailLoading}
      />
    );
  }

  return (
    <Box>
      {/* Filter Box */}
      <FilterCard>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Keyword Search */}
            <Grid item xs={12} md={3}>
              <TextField
                placeholder="Tìm kiếm từ khóa..."
                size="small"
                fullWidth
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
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

            {/* Filter Controls */}
            <Grid item xs={12} sm={4} md={3}>
              {renderAutocompleteFilter(
                'state',
                'Trạng thái',
                states,
                stateKeyword,
                setStateKeyword,
                handleStateSearch,
                () => handleStateSearch('')
              )}
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              {renderAutocompleteFilter(
                'projectId',
                'Chọn dự án',
                projects,
                projectKeyword,
                setProjectKeyword,
                handleProjectSearch,
                () => handleProjectSearch('')
              )}
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              {renderAutocompleteFilter(
                'supplierId',
                'Chọn nhà cung cấp',
                suppliers,
                supplierKeyword,
                setSupplierKeyword,
                handleSupplierSearch,
                () => handleSupplierSearch('')
              )}
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
      ) : quoteRequests.length === 0 ? (
        <EmptyStateBox>
          <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có yêu cầu báo giá nào
          </Typography>
        </EmptyStateBox>
      ) : (
        <CommonTable
          columns={[
            {
              field: "STT",
              headerName: "STT",
              render: (value, row, index) => index + 1
            },
            {
              field: 'productName',
              headerName: 'Sản phẩm',
              render: (value, row) => row.product?.name || row.productName,
            },
            {
              field: 'quantity',
              headerName: 'Số lượng',
              align: 'center',
              render: (value, row) => `${row.quantity} ${row.product?.unit || ''}`,
            },
            {
              field: 'projectName',
              headerName: 'Dự án',
              render: (value, row) => row.project?.name || row.projectName || '—',
            },
            {
              field: 'expiredAt',
              headerName: 'Thời gian có hiệu lực',
              render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '—',
            },
            {
              field: 'state',
              headerName: 'Trạng thái',
              render: (value, row) => (
                row.state === "SENT" || row.state === "CANCELLED" ? (
                  <Chip
                    label={getStateLabel(row.state)}
                    color={getStateColor(row.state)}
                    size="small"
                    variant="outlined"
                    icon={row.state === "SENT" ? <CheckCircleIcon /> : undefined}
                    sx={{
                      fontWeight: 600,
                      ...(row.state === "SENT" && {
                        borderColor: theme.palette.success.main,
                        color: theme.palette.success.main,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        '& .MuiChip-icon': {
                          color: theme.palette.success.main,
                        },
                      }),
                    }}
                  />
                ) : (
                  <Select
                    value={row.state}
                    onChange={(e) => handleStateChange(row.id, e.target.value)}
                    size="small"
                    disabled={stateChanging === row.id}
                    sx={{ minWidth: 120, borderRadius: 1 }}
                  >
                    <MenuItem value="DRAFT">Bản nháp</MenuItem>
                    <MenuItem value="SENT">Gửi</MenuItem>
                  </Select>
                )
              ),
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              align: 'center',
              render: (value, row) => (
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                  <Tooltip title="Xem chi tiết" arrow>
                    <ActionButton
                      size="small"
                      onClick={() => handleOpenDetail(row)}
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
                  {row.state === "DRAFT" && (
                    <Tooltip title="Chỉnh sửa" arrow>
                      <ActionButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(row)}
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
                  {row.state === "DRAFT" && (
                    <Tooltip title="Xoá" arrow>
                      <ActionButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row)}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  )}
                </Box>
              ),
            },
          ]}
          data={quoteRequests}
          loading={loading}
          rowsPerPage={rowsPerPage}
          page={page}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            const value = event?.target?.value || event;
            setRowsPerPage(parseInt(value, 10));
            setPage(0);
          }}
          emptyMessage="Chưa có yêu cầu báo giá nào"
          maxHeight="calc(100vh - 380px)"
          minHeight="calc(100vh - 380px)"
        />
      )}

      {/* Edit Modal */}
      {selectedRfq && (
        <QuoteRequestModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedRfq(null);
          }}
          rfq={selectedRfq}
          enterpriseId={enterpriseId}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <CommonDialog
        open={deleteModalOpen}
        title="Xác nhận xóa yêu cầu báo giá"
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingRfqId(null);
          setSelectedRfq(null);
        }}
        onSubmit={handleConfirmDelete}
        loading={deleteLoading}
        submitLabel="Xóa"
        submitColor="error"
        cancelLabel="Hủy"
        centerButtons={true}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400,
          },
        }}
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa yêu cầu báo giá này?
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
          >
            Hành động này không thể hoàn tác
          </Typography>
        </Box>
      </CommonDialog>
    </Box>
  );
}
