import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  styled,
  alpha,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon,
  Inbox as InboxIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import { useToast } from "../../../app/providers/ToastContext";

// Custom hook
import { useEventManagement } from "../hooks/useEventManagement";

// Utils
import { formatDate } from "../../../shared/utils/dateFormatter";

// Components
import EventFilters from "../components/EventFilters";
import CommonTable from "../../../shared/components/CommonTable";
import EventCardList from "../components/EventCardList";
import EventDialog from "../components/EventDialog";

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

/**
 * EventManagement - Main container component
 * Quản lý danh sách sự kiện của enterprise
 */
const EventManagement = ({ hasPermission = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const showToast = useToast();

  // State cho dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Search input temp state
  const [searchInput, setSearchInput] = useState("");

  // Hook chứa tất cả business logic
  const {
    // States
    filteredEvents,
    events,
    loading,
    error,
    setError,
    enterpriseId,
    // Dropdown data
    groupTaskTypes,
    locations,
    loadingDropdowns,
    // Filter & Search
    searchTerm,
    setSearchTerm,
    filterState,
    setFilterState,
    filterFeeType,
    setFilterFeeType,
    filterCategory,
    setFilterCategory,
    clearFilters,
    // Pagination
    page,
    rowsPerPage,
    totalCount,
    handleChangePage,
    handleChangeRowsPerPage,
    // Actions
    handleSaveEvent,
    handleDeleteEvent,
    handleUpdateEventState,
    // Helpers
    formatDateTimeLocal,
    getCurrentDateTimeLocal,
  } = useEventManagement();

  // Search handlers
  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput);
    }
  };

  const handleKeywordSearch = () => {
    setSearchTerm(searchInput);
  };

  // Sync searchInput with searchTerm on mount
  React.useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Dialog handlers
  const handleOpenDialog = (event = null) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  // Edit handler for mobile view
  const handleEdit = (event) => {
    handleOpenDialog(event);
  };

  // Row click handler - navigate to event detail
  const handleRowClick = (row) => {
    if (row.id && enterpriseId) {
      navigate(`/enterprise/${enterpriseId}/event-management/${row.id}`);
    }
  };

  // Delete handler - show confirmation dialog
  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      await handleDeleteEvent(eventToDelete);
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  // Pagination handlers - wrapper để kompatibel với CommonTable
  const handleTablePageChange = (newPage) => {
    handleChangePage(null, newPage);
  };

  const handleTableRowsPerPageChange = (newRowsPerPage) => {
    handleChangeRowsPerPage(newRowsPerPage);
  };

  // Get current user
  const getCurrentUserId = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Check if current user is enterprise owner from token
  const isEnterpriseOwner = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
      // JWT token format: header.payload.signature
      // Decode payload (second part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.owner === true;
    } catch (e) {
      return false;
    }
  };

  // Check if current user is owner of event or owner of enterprise
  const isEventOwner = (event) => {
    const currentUserId = getCurrentUserId();
    const isOwner = isEnterpriseOwner();
    
    // Check if user is event creator OR enterprise owner
    return currentUserId && event && (
      event.createdUserId === currentUserId || 
      isOwner
    );
  };

  // Helper functions for labels
  const getCategoryLabel = (category) => {
    const labels = {
      CONFERENCE: "Hội nghị",
      SEMINAR: "Hội thảo",
      WORKSHOP: "Workshop",
      CONCERT: "Hòa nhạc",
      EXHIBITION: "Triển lãm",
      FESTIVAL: "Lễ hội",
      SPORTS: "Thể thao",
      CULTURAL: "Văn hóa",
      BUSINESS: "Kinh doanh",
      EDUCATION: "Giáo dục",
      CHARITY: "Từ thiện",
      NETWORKING: "Giao lưu",
      ENTERTAINMENT: "Giải trí",
      OTHER: "Khác",
    };
    return labels[category] || category;
  };

  const getStateLabel = (state) => {
    const labels = {
      NOT_STARTED: "Sắp diễn ra",
      IN_PROGRESS: "Đang diễn ra",
      COMPLETED: "Đã kết thúc",
      CANCELED: "Đã hủy",
    };
    return labels[state] || state;
  };

  // Handle state change
  const handleStateChange = (eventId, newState) => {
    handleUpdateEventState(eventId, newState);
  };

  const getFeeTypeLabel = (feeType) => {
    const labels = {
      FREE: "Miễn phí",
      PAID: "Trả phí",
    };
    return labels[feeType] || feeType;
  };

  // CommonTable columns configuration
  const columns = [
    {
      field: 'stt',
      headerName: 'STT',
      width: 70,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.9rem', textAlign: 'center', height: '80px' },
      render: (value, row, rowIndex) => rowIndex + 1,
    },
    {
      field: 'name',
      headerName: 'Tên sự kiện',
      flex: 1,
      minWidth: 200,
      align: 'left',
      headerCellSx: { fontSize: '0.95rem', fontWeight: 500 },
      cellSx: { fontSize: '0.9rem', overflow: 'visible', whiteSpace: 'normal', height: '80px' },
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={row.avatar}
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              bgcolor: 'primary.main',
              flexShrink: 0,
            }}
          >
            {!row.avatar && (value?.charAt(0)?.toUpperCase() || '?')}
          </Avatar>
          <Typography variant="body2" noWrap sx={{ fontSize: '0.9rem' }}>{value}</Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Phân loại',
      width: 120,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.85rem', textAlign: 'center', height: '80px' },
      render: (value) => getCategoryLabel(value),
    },
    {
      field: 'state',
      headerName: 'Trạng thái',
      width: 180,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.85rem', textAlign: 'center', height: '80px', padding: 0 },
      render: (value, row) => {
        const isOwner = isEventOwner(row);
        
        if (!isOwner) {
          // Only show text if not owner
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {getStateLabel(value)}
              </Typography>
            </Box>
          );
        }

        // Show dropdown if owner
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <TextField
              select
              value={value || ''}
              onChange={(e) => handleStateChange(row.id, e.target.value)}
              size="small"
              disabled={loading || !hasPermission}
              sx={{
                minWidth: 100,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.85rem',
                  borderRadius: 1,
                },
              }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="NOT_STARTED">Sắp diễn ra</option>
              <option value="IN_PROGRESS">Đang diễn ra</option>
              <option value="COMPLETED">Đã kết thúc</option>
              <option value="CANCELED">Đã hủy</option>
            </TextField>
          </Box>
        );
      },
    },
    {
      field: 'startedAt',
      headerName: 'Ngày bắt đầu',
      width: 160,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.9rem', textAlign: 'center', height: '80px' },
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      field: 'endedAt',
      headerName: 'Ngày kết thúc',
      width: 160,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.9rem', textAlign: 'center', height: '80px' },
      render: (value) => value ? formatDate(value) : '-',
    },
  ];

  return (
    <Box>
      {/* Permission Alert */}
      {!hasPermission && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Bạn không có quyền truy cập chức năng này
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vui lòng liên hệ với quản trị viên để được cấp quyền
          </Typography>
        </Alert>
      )}

      {/* Error Alert */}
      {/* {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )} */}

      {/* Filter Bar */}
      <FilterCard>
        <CardContent>
          {/* Keyword Search Row */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginBottom: 2 }}>
            <TextField
              placeholder="Tìm kiếm sự kiện ..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onBlur={handleKeywordSearch}
              disabled={loading || !hasPermission}
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
            {/* Filter by Category */}
            <Box sx={{ width: "calc(25% - 6px)" }}>
              <TextField
                select
                label="Loại sự kiện"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                size="small"
                fullWidth
                disabled={loading || !hasPermission}
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
                SelectProps={{
                  native: true,
                }}
              >
                <option value="ALL">Tất cả loại</option>
                <option value="CONFERENCE">Hội nghị</option>
                <option value="SEMINAR">Hội thảo</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="CONCERT">Hòa nhạc</option>
                <option value="EXHIBITION">Triển lãm</option>
                <option value="FESTIVAL">Lễ hội</option>
                <option value="SPORTS">Thể thao</option>
                <option value="CULTURAL">Văn hóa</option>
                <option value="CHARITY">Từ thiện</option>
                <option value="NETWORKING">Giao lưu</option>
                <option value="ENTERTAINMENT">Giải trí</option>
                <option value="OTHER">Khác</option>
              </TextField>
            </Box>

         

            {/* Create Button */}
            <Box sx={{ width: "calc(20% - 6px)" }}>
              <StyledButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={loading || !hasPermission}
                fullWidth
                sx={{ height: 40 }}
              >
                Tạo mới
              </StyledButton>
            </Box>
          </Box>
        </CardContent>
      </FilterCard>

      {/* Content */}
      {!hasPermission ? (
        <EmptyStateBox>
          <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Không có quyền truy cập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn không có quyền để xem danh sách sự kiện. Vui lòng liên hệ quản trị viên.
          </Typography>
        </EmptyStateBox>
      ) : loading ? (
        <LoadingBox>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </LoadingBox>
      ) : events.length === 0 ? (
        <EmptyStateBox>
          <EventNoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có sự kiện nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy tạo sự kiện đầu tiên để bắt đầu quản lý!
          </Typography>
        </EmptyStateBox>
      ) : filteredEvents.length === 0 ? (
        <EmptyStateBox>
          <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Không tìm thấy sự kiện
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Không có sự kiện nào phù hợp với bộ lọc bạn đã chọn.
          </Typography>
          <StyledButton
            variant="outlined"
            color="primary"
            onClick={clearFilters}
          >
            Xóa bộ lọc
          </StyledButton>
        </EmptyStateBox>
      ) : isMobile ? (
        // Mobile view: Cards
        <EventCardList
          events={filteredEvents}
          enterpriseId={enterpriseId}
          onEdit={handleEdit}
          onDelete={handleDeleteEvent}
          onUpdateState={handleUpdateEventState}
          formatDate={formatDate}
          getCategoryLabel={getCategoryLabel}
          getFeeTypeLabel={getFeeTypeLabel}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : (
        // Desktop view: CommonTable
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CommonTable
            columns={columns}
            data={filteredEvents}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleTablePageChange}
            onRowsPerPageChange={handleTableRowsPerPageChange}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="Không có dữ liệu"
            minHeight={600}
            maxHeight={600}
          />
        </Paper>
      )}

      {/* Event Dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        event={editingEvent}
        groupTaskTypes={groupTaskTypes}
        locations={locations}
        loadingDropdowns={loadingDropdowns}
        onSave={handleSaveEvent}
        formatDateTimeLocal={formatDateTimeLocal}
        getCurrentDateTimeLocal={getCurrentDateTimeLocal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Xác nhận xóa sự kiện
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            variant="contained"
            color="primary"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagement;
