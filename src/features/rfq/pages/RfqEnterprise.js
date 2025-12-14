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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  TextField,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  RequestQuote as RequestQuoteIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import rfqApi from "../api/rfq.api";
import QuoteRequestModal from "../../product/components/QuoteRequestModal";
import QuoteRequestDetail from "./RfqEnterpriseDetail";
import { CommonTable } from "../../../shared/components/CommonTable";
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
  const { id: enterpriseId } = useParams();
  const navigate = useNavigate();
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

  // Fetch projects and suppliers
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [projectRes, supplierRes] = await Promise.all([
          projectApi.getProjects(projectKeyword ? { keyword: projectKeyword } : {}, 0, 100),
          supplierApi.getSuppliers(supplierKeyword || '', 0, 100),
        ]);

        // Handle projects
        let projectData = [];
        if (projectRes?.content && Array.isArray(projectRes.content)) {
          projectData = projectRes.content;
        } else if (Array.isArray(projectRes)) {
          projectData = projectRes;
        } else if (projectRes?.data) {
          projectData = Array.isArray(projectRes.data) ? projectRes.data : projectRes.data.content || [];
        }
        setProjects(projectData);

        // Handle suppliers
        let supplierData = [];
        if (supplierRes?.content && Array.isArray(supplierRes.content)) {
          supplierData = supplierRes.content;
        } else if (Array.isArray(supplierRes)) {
          supplierData = supplierRes;
        } else if (supplierRes?.data) {
          supplierData = Array.isArray(supplierRes.data) ? supplierRes.data : supplierRes.data.content || [];
        }
        setSuppliers(supplierData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    if (!permissionsLoading && isOwner) {
      const timer = setTimeout(() => {
        fetchDropdownData();
      }, 300); // Debounce 300ms
      
      return () => clearTimeout(timer);
    }
  }, [permissionsLoading, isOwner, projectKeyword, supplierKeyword]);

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
            total = response.totalElements || response.total || response.data.length;
          } else if (response.data.content) {
            data = response.data.content;
            total = response.data.totalElements || response.data.total || 0;
          }
        }
        
        setQuoteRequests(Array.isArray(data) ? data : []);
        setTotalCount(total);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách yêu cầu báo giá";
        enqueueSnackbar(errorMessage, { variant: "error" });
        setQuoteRequests([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && isOwner) {
      fetchQuoteRequests();
    }
  }, [enterpriseId, permissionsLoading, isOwner, enqueueSnackbar, page, rowsPerPage, filters]);

  const handleOpenDetail = (rfq) => {
    setSelectedRfq(rfq);
    setViewMode("detail");
  };

  const handleEditClick = (rfq) => {
    setSelectedRfq(rfq);
    setEditModalOpen(true);
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedRfq(null);
  };

  const handleEditFromDetail = () => {
    setEditModalOpen(true);
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
          total = response.totalElements || response.total || response.data.length;
        } else if (response.data.content) {
          data = response.data.content;
          total = response.data.totalElements || response.data.total || 0;
        }
      }
      
      setQuoteRequests(Array.isArray(data) ? data : []);
      setTotalCount(total);
      enqueueSnackbar("✅ Đã cập nhật và tải lại danh sách", { variant: "success" });
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
      enqueueSnackbar("✅ Cập nhật trạng thái thành công", { variant: "success" });
      
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
          total = response.totalElements || response.total || response.data.length;
        } else if (response.data.content) {
          data = response.data.content;
          total = response.data.totalElements || response.data.total || 0;
        }
      }
      
      setQuoteRequests(Array.isArray(data) ? data : []);
      setTotalCount(total);
    } catch (error) {
      console.error("[RFQ STATE CHANGE] Error:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi cập nhật trạng thái";
      enqueueSnackbar(errorMessage, { variant: "error" });
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
            size="medium"
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
        { id: 'CANCELLED', name: 'Đã hủy' },
      ];
      
      const filtered = stateOptions.filter(s => 
        s.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setStates(filtered);
    }, 300);
    
    setStateSearchTimer(timer);
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
  if (viewMode === "detail" && selectedRfq) {
    return (
      <QuoteRequestDetail
        rfq={selectedRfq}
        onBack={handleCloseDetail}
        onEdit={selectedRfq.state === "DRAFT" ? handleEditFromDetail : undefined}
      />
    );
  }

  return (
    <Box>
      {/* Filter Box */}
      <FilterCard>
        <CardContent>
          {/* Keyword Search Row */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginBottom: 2 }}>
            {/* Keyword Search */}
            <TextField
              placeholder="Tìm kiếm từ khóa..."
              size="medium"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
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
            {/* State Filter */}
            <Box sx={{ width: "calc(20% - 4px)" }}>
              {renderAutocompleteFilter(
                'state',
                'Trạng thái',
                states,
                stateKeyword,
                setStateKeyword,
                handleStateSearch,
                () => handleStateSearch('')
              )}
            </Box>

            {/* Project Filter */}
            <Box sx={{ width: "calc(20% - 4px)" }}>
              {renderAutocompleteFilter(
                'projectId',
                'Chọn dự án',
                projects,
                projectKeyword,
                setProjectKeyword,
                handleProjectSearch,
                () => handleProjectSearch('')
              )}
            </Box>

            {/* Supplier Filter */}
            <Box sx={{ width: "calc(20% - 4px)" }}>
              {renderAutocompleteFilter(
                'supplierId',
                'Chọn nhà cung cấp',
                suppliers,
                supplierKeyword,
                setSupplierKeyword,
                handleSupplierSearch,
                () => handleSupplierSearch('')
              )}
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
                  <Tooltip title="Xem chi tiết yêu cầu báo giá" arrow>
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
                    <Tooltip title="Chỉnh sửa yêu cầu báo giá" arrow>
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
            setRowsPerPage(parseInt(event.target.value, 10));
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
    </Box>
  );
}
