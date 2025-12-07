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
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Receipt as ReceiptIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import quoteApi from "../api/quote.api";
import QuotationDetail from "./QuotationDetailEnterprise";
import { CommonTable } from "../../../shared/components/CommonTable";
import projectApi from "../../project/api/project.api";
import supplierApi from "../../supplier/api/supplier.api";

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

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

export default function Quotations() {
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

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  
  // Filter states
  const [filters, setFilters] = useState({
    keyword: '',
    states: [],
    projectIds: [],
    supplierIds: [],
  });
  
  // Data for dropdowns
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [states, setStates] = useState([]);
  const [projectKeyword, setProjectKeyword] = useState('');
  const [supplierKeyword, setSupplierKeyword] = useState('');
  const [statesKeyword, setStatesKeyword] = useState('');
  const [projectSearchTimer, setProjectSearchTimer] = useState(null);
  const [supplierSearchTimer, setSupplierSearchTimer] = useState(null);
  const [statesSearchTimer, setStatesSearchTimer] = useState(null);

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
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [permissionsLoading, isOwner, projectKeyword, supplierKeyword]);

  // Fetch quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const filterParams = {
          ...(filters.keyword && { keyword: filters.keyword }),
          ...(filters.states && { states: filters.states }),
          ...(filters.projectIds && { projectIds: filters.projectIds }),
          ...(filters.supplierIds && { supplierIds: filters.supplierIds }),
        };
        const response = await quoteApi.getQuotes(filterParams, 0, 50);
        const data = response?.data || response || [];
        setQuotations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[QUOTATIONS] ❌ Error fetching quotations:", error);
        const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách báo giá";
        enqueueSnackbar(errorMessage, { variant: "error" });
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };

    if (!permissionsLoading && isOwner) {
      fetchQuotations();
    }
  }, [enterpriseId, permissionsLoading, isOwner, enqueueSnackbar, filters]);

  const handleOpenDetail = (quote) => {
    setSelectedQuote(quote);
    setViewMode("detail");
  };

  const handleCloseDetail = () => {
    setViewMode("list");
    setSelectedQuote(null);
  };

  const getStatusLabel = (state) => {
    switch (state) {
      case "SUBMITTED":
        return "Đã gửi";
      case "APPROVED":
        return "Chấp nhận";
      case "REJECTED":
        return "Từ chối";
      default:
        return state || "Không xác định";
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case "SUBMITTED":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
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
  };

  const renderAutocompleteFilter = (field, label, options, keywordState, setKeywordState, searchHandler, openHandler, multiple = false) => {
    return (
      <Autocomplete
        multiple={multiple}
        options={options}
        getOptionLabel={(option) => option.name || ''}
        value={multiple ? options.filter((p) => filters[field]?.includes(p.id)) || [] : options.find((p) => p.id === filters[field]?.[0]) || null}
        onChange={(e, value) => {
          if (multiple) {
            handleFilterChange(field, value?.map(v => v.id) || []);
          } else {
            handleFilterChange(field, value?.id ? [value.id] : []);
          }
        }}
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
    setStatesKeyword(keyword);
    if (statesSearchTimer) clearTimeout(statesSearchTimer);
    
    const timer = setTimeout(async () => {
      // Filter states based on keyword
      const stateOptions = [
        { id: 'SUBMITTED', name: 'Đã gửi' },
        { id: 'APPROVED', name: 'Chấp nhận' },
        { id: 'REJECTED', name: 'Từ chối' },
      ];
      
      const filtered = stateOptions.filter(s => 
        s.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setStates(filtered);
    }, 300);
    
    setStatesSearchTimer(timer);
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
  if (viewMode === "detail" && selectedQuote) {
    return <QuotationDetail quotation={selectedQuote} onBack={handleCloseDetail} />;
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
              placeholder="Tìm kiếm báo giá..."
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
                'states',
                'Trạng thái',
                states,
                statesKeyword,
                setStatesKeyword,
                handleStateSearch,
                () => handleStateSearch(''),
                true
              )}
            </Box>

            {/* Project Filter */}
            <Box sx={{ width: "calc(20% - 4px)" }}>
              {renderAutocompleteFilter(
                'projectIds',
                'Chọn dự án',
                projects,
                projectKeyword,
                setProjectKeyword,
                handleProjectSearch,
                () => handleProjectSearch(''),
                false
              )}
            </Box>

            {/* Supplier Filter */}
            <Box sx={{ width: "calc(20% - 4px)" }}>
              {renderAutocompleteFilter(
                'supplierIds',
                'Chọn nhà cung cấp',
                suppliers,
                supplierKeyword,
                setSupplierKeyword,
                handleSupplierSearch,
                () => handleSupplierSearch(''),
                false
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
      ) : quotations.length === 0 ? (
        <EmptyStateBox>
          <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có báo giá nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Các báo giá nhận được sẽ hiển thị ở đây
          </Typography>
        </EmptyStateBox>
      ) : (
        <CommonTable
          columns={[
            {
              field: 'id',
              headerName: 'STT',
              align: 'center',
              render: (value, row, index) => index + 1,
            },
            {
              field: 'name',
              headerName: 'Tên báo giá',
              render: (value) => value || 'Không có tên',
            },
            {
              field: 'quantity',
              headerName: 'Số lượng',
              align: 'center',
              render: (value) => value || 0,
            },
            {
              field: 'unitPrice',
              headerName: 'Đơn giá',
              align: 'right',
              render: (value) => value ? value.toLocaleString("vi-VN") + '₫' : '0₫',
            },
            {
              field: 'finalPrice',
              headerName: 'Tổng tiền',
              align: 'right',
              render: (value) => value ? value.toLocaleString("vi-VN") + '₫' : '0₫',
            },
            {
              field: 'updatedAt',
              headerName: 'Ngày nhận báo giá',
              render: (value) => value ? new Date(value).toLocaleString("vi-VN") : 'N/A',
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              align: 'center',
              render: (value, row) => (
                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                  <Tooltip title="Chi tiết">
                    <ActionButton 
                      size="small"
                      onClick={() => handleOpenDetail(row)}
                    >
                      <InfoIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                </Box>
              ),
            },
          ]}
          data={quotations}
          loading={loading}
          emptyMessage="Chưa có báo giá nào"
          maxHeight="calc(100vh - 380px)"
          minHeight="calc(100vh - 380px)"
        />
      )}

    </Box>
  );
}
