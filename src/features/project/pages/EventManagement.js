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
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon,
  Inbox as InboxIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Custom hook
import { useEventManagement } from "../hooks/useEventManagement";

// Utils
import { formatDate } from "../../../shared/utils/dateFormatter";

// Components
import EventFilters from "../components/EventFilters";
import CommonTable from "../../../shared/components/CommonTable";
import EventCardList from "../components/EventCardList";
import EventDialog from "../components/EventDialog";

// Styled Components
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

/**
 * EventManagement - Main container component
 * Quản lý danh sách sự kiện của enterprise
 */
const EventManagement = ({ hasPermission = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // State cho dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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

  // Dialog handlers
  const handleOpenDialog = (event = null) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
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

  const handleTableRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      headerName: 'Loại',
      width: 120,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.85rem', textAlign: 'center', height: '80px' },
      render: (value) => getCategoryLabel(value),
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
      field: 'state',
      headerName: 'Trạng thái',
      width: 130,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.8rem', textAlign: 'center', height: '80px' },
      render: (value, row) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 2,
            py: 0.75,
            borderRadius: 1,
            backgroundColor: 
              value === 'UPCOMING' ? 'info.light' :
              value === 'ONGOING' ? 'success.light' :
              value === 'ENDED' ? 'error.light' : 'default.light',
            color: 
              value === 'UPCOMING' ? 'info.main' :
              value === 'ONGOING' ? 'success.main' :
              value === 'ENDED' ? 'error.main' : 'default.main',
            fontSize: '0.9rem',
          }}
        >
          {value === 'NOT_STARTED' ? 'Sắp tới' : 
           value === 'IN_PROGRESS' ? 'Đang diễn ra' :
           value === 'COMPLETED' ? 'Đã kết thúc' : 
           value === 'CANCELED' ? 'Đã hủy' : 
           value}
        </Box>
      ),
    },
    {
      field: 'feeType',
      headerName: 'Loại vé',
      width: 110,
      align: 'center',
      headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
      cellSx: { fontSize: '0.9rem', textAlign: 'center', height: '80px' },
      render: (value) => getFeeTypeLabel(value),
    },
    // {
    //   field: 'actions',
    //   headerName: 'Hành động',
    //   width: 150,
    //   align: 'center',
    //   headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
    //   cellSx: { fontSize: '0.9rem', textAlign: 'center', overflow: 'visible' },
    //   sortable: false,
    //   render: (value, row) => (
    //     <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
    //       <Tooltip title="Sửa">
    //         <IconButton
    //           size="small"
    //           color="primary"
    //           onClick={() => handleOpenDialog(row)}
    //         >
    //           <EditIcon sx={{ fontSize: 18 }} />
    //         </IconButton>
    //       </Tooltip>
    //       <Tooltip title="Xóa">
    //         <IconButton
    //           size="small"
    //           color="error"
    //           onClick={() => handleDeleteClick(row.id)}
    //         >
    //           <DeleteIcon sx={{ fontSize: 18 }} />
    //         </IconButton>
    //       </Tooltip>
    //     </Box>
    //   ),
    // },
  ];

  return (
    <Box>
      {/* Permission Alert */}
      {!hasPermission && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ⚠️ Bạn không có quyền truy cập chức năng này
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vui lòng liên hệ với quản trị viên để được cấp quyền
          </Typography>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters & Search */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'flex-start', 
        mb: 3, 
        backgroundColor: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        p: 3,
        minHeight: '100px',
        maxHeight: '100px',
      }}>
        <Box sx={{ flex: 1 }}>
          <EventFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterState={filterState}
            setFilterState={setFilterState}
            filterFeeType={filterFeeType}
            setFilterFeeType={setFilterFeeType}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            loading={loading || !hasPermission}
            eventsCount={totalCount}
            filteredCount={filteredEvents.length}
            onClearFilters={clearFilters}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 3, paddingTop: '0px' }}>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading || !hasPermission}
            size="large"
          >
            Tạo mới
          </StyledButton>
        </Box>
      </Box>

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
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Tạo sự kiện mới
          </StyledButton>
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
