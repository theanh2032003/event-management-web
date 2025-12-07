import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  styled,
  alpha,
  useTheme,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import activityLogApi from '../api/activityLog.api';

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 400px)',
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      fontWeight: 700,
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
      padding: theme.spacing(2),
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
      '&:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(1, 2),
      verticalAlign: 'top',
    },
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  fontSize: '0.85rem',
  fontWeight: 600,
  backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 3),
  borderRadius: theme.spacing(2),
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
}));



export default function EventActivityLog({ eventData, enterpriseId, eventId }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch activity logs
  useEffect(() => {
    fetchActivityLogs();
  }, [eventId, page, rowsPerPage]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const data = await activityLogApi.getActivityLogs(
        {
          projectId: eventId,
        },
        page,
        rowsPerPage,
        ['STAGE', 'TASK']
      );

      const result = data?.data || data;
      if (Array.isArray(result)) {
        setActivities(result);
        setTotalCount(result.length);
      } else {
        setActivities(result?.content || []);
        setTotalCount(result?.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      enqueueSnackbar('Lỗi tải lịch sử hoạt động', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format time relative to now
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Get user initial
  const getUserInitial = (userName) => {
    return userName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Parse JSON safely
  const parseJSON = (jsonString) => {
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (e) {
      return null;
    }
  };

  // Translate stage status to Vietnamese
  const translateStageStatus = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xử lý',
      'IN_PROGRESS': 'Đang tiến hành',
      'SUCCESS': 'Thành công',
      'CANCELED': 'Đã hủy',
      'REJECTED': 'Bị từ chối',
    };
    return statusMap[status] || status;
  };

  // Format activity message based on type
  const formatActivityMessage = (activity) => {
    const actionMap = {
      'CREATE': 'đã tạo',
      'UPDATE': 'đã chỉnh sửa',
      'DELETE': 'đã xóa',
      'SUBMIT': 'đã gửi',
      'APPROVE': 'đã phê duyệt',
      'REJECT': 'đã từ chối',
      'ASSIGN': 'đã gán',
      'CHANGE_STATUS': 'đã thay đổi trạng thái',
    };

    const typeMap = {
      'TASK': 'công việc',
      'SCHEDULE': 'lịch trình',
      'PROJECT': 'dự án',
      'USER': 'thành viên',
      'ROLE': 'vai trò',
      'STAGE': 'giai đoạn',
    };

    const action = actionMap[activity.action] || activity.action;
    const type = typeMap[activity.type] || activity.type;
    const preValueObj = parseJSON(activity.preValue);
    const postValueObj = parseJSON(activity.postValue);
    const objectName = preValueObj?.name || postValueObj?.name || 'N/A';

    // For CHANGE_STATUS, extract before and after values based on type
    let statusChange = '';
    if (activity.action === 'CHANGE_STATUS') {
      let beforeStatus = '';
      let afterStatus = '';

      if (activity.type === 'STAGE') {
        beforeStatus = translateStageStatus(preValueObj?.status || 'N/A');
        afterStatus = translateStageStatus(postValueObj?.status || 'N/A');
      } else if (activity.type === 'TASK') {
        beforeStatus = preValueObj?.taskState?.name || 'N/A';
        afterStatus = postValueObj?.taskState?.name || 'N/A';
      }

      if (beforeStatus || afterStatus) {
        statusChange = ` từ ${beforeStatus} sang ${afterStatus}`;
      }
    }

    return { action, type, objectName, statusChange };
  };

  if (loading && activities.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {activities.length === 0 ? (
        <EmptyStateBox>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có hoạt động
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Các hoạt động trong sự kiện sẽ được ghi lại ở đây
          </Typography>
        </EmptyStateBox>
      ) : (
        <>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Hoạt động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity, index) => {
                  const { action, type, objectName, statusChange } = formatActivityMessage(activity);

                  return (
                    <TableRow key={activity.id || index} hover>
                      <TableCell colSpan={5}>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexShrink: 0 }}>
                            <UserAvatar
                              src={activity.userAvatar || undefined}
                              alt={activity.userName}
                            >
                              {!activity.userAvatar && getUserInitial(activity.userName)}
                            </UserAvatar>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                {activity.userName || 'Người dùng'}
                              </Typography>
                              <Typography variant="body2">
                                {action}
                              </Typography>
                              {activity.type && (
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {type}
                                </Typography>
                              )}
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                {objectName}
                              </Typography>
                              {statusChange && (
                                <Typography variant="body2">
                                  {statusChange.split(' từ ').map((part, idx) => (
                                    <span key={idx}>
                                      {idx > 0 && ' từ '}
                                      {idx === 1 ? (
                                        <>
                                          <span style={{ fontWeight: 700 }}>{part.split(' sang ')[0]}</span>
                                          {' sang '}
                                          <span style={{ fontWeight: 700 }}>{part.split(' sang ')[1]}</span>
                                        </>
                                      ) : (
                                        part
                                      )}
                                    </span>
                                  ))}
                                </Typography>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(activity.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </StyledTableContainer>
          
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số hoạt động mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: theme.spacing(0, 0, 2, 2),
              backgroundColor: alpha(theme.palette.background.default, 0.5),
            }}
          />
        </>
      )}
    </Box>
  );
}
