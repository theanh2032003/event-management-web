import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Switch,
  styled,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Inbox as InboxIcon,
} from "@mui/icons-material";
import { useToast } from "../../../app/providers/ToastContext";
import axiosClient from "../../../app/axios/axiosClient";
import projectUserApi from "../../user/api/projectUser.api";
import roleApi from "../api/role.api";
import userApi from "../../user/api/user.api";
import { CommonTable } from "../../../shared/components/CommonTable";

// Styled Components
const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const EmptyStateBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.action.hover, 0.4)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
}));

/**
 * EventUserPermission - Quản lý user và phân quyền cho event
 */
export default function EventUserPermission({ eventData, enterpriseId, eventId }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toast = useToast();

  // States for users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(0);
  const [usersPageSize, setUsersPageSize] = useState(5);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersTotalData, setUsersTotalData] = useState(0);

  // States for add user
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [submittingAddUser, setSubmittingAddUser] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearchPage, setUserSearchPage] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userSearchTotal, setUserSearchTotal] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  // States for assign permission
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: "",
    roleIds: []
  });

  // States for roles (in assign dialog)
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesPage, setRolesPage] = useState(0);
  const [rolesPageSize, setRolesPageSize] = useState(5);
  const [rolesTotalPages, setRolesTotalPages] = useState(0);
  const [rolesTotalData, setRolesTotalData] = useState(0);


  // Get current user ID
  const getCurrentUserId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || 1;
      } catch (e) {
        return 1;
      }
    }
    return 1;
  };

  // ====== FETCH USERS ======
  useEffect(() => {
    console.log("🔍 EventUserPermission mounted with eventId:", eventId, "enterpriseId:", enterpriseId);
    fetchUsers(0, usersPageSize);
  }, [eventId, enterpriseId]);

  const fetchUsers = async (page = 0, size = 5) => {
    try {
      setLoading(true);
      console.log("📡 Fetching users with eventId:", eventId, "page:", page, "size:", size);

      const response = await projectUserApi.getUsers(eventId, page, size);
      console.log("✅ Users API response:", response);
      const data = response.data || response;
      
      // Get users list from data
      const usersList = Array.isArray(data) ? data : [];
      
      // Get metadata from response
      const metadata = response.metadata || response;
      const totalPages = metadata.totalPage || 0;
      const totalData = metadata.total || 0;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        usersList.map(async (user) => {
          const userRoles = await fetchUserPermissions(user.id);
          return {
            ...user,
            roles: userRoles
          };
        })
      );

      setUsers(usersWithRoles);
      setUsersTotalPages(totalPages);
      setUsersTotalData(totalData);
      // Show toast only after successful data load (gives time to see network request)
      setTimeout(() => {
      }, 500);
    } catch (err) {
      // Show error toast immediately
      setTimeout(() => {
        toast.error("Không thể tải danh sách người dùng. ");
      }, 300);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ====== FETCH USER PERMISSIONS ======
  const fetchUserPermissions = async (userId) => {
    try {
      const response = await roleApi.getUserPermissions(eventId, userId);
      const data = response.data || response;
      return data.roles || [];
    } catch (err) {
      return [];
    }
  };

  // ====== FETCH ROLES (for assign dialog - lazy load) ======
  const fetchRoles = async (page = 0, size = 5) => {
    try {
      setLoadingRoles(true);
      console.log("📡 Fetching roles with enterpriseId:", enterpriseId, "eventId:", eventId, "page:", page);

      const response = await roleApi.getProjectRoles(enterpriseId, eventId, page, size);
      console.log("✅ Roles API response:", response);
      const data = response.data || response;
      
      // Get roles list from data
      const rolesList = Array.isArray(data) ? data : [];
      
      // Get metadata from response
      const metadata = response.metadata || response;
      const totalPages = metadata.totalPage || 0;
      const totalData = metadata.total || 0;

      setRoles(rolesList);
      setRolesTotalPages(totalPages);
      setRolesTotalData(totalData);
    } catch (err) {
      toast.error("Không thể tải danh sách vai trò");
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  // ====== ADD USER ======
  const handleOpenAddUserDialog = () => {
    setAddUserDialogOpen(true);
    setAvailableUsers([]);
    setSelectedUserIds([]);
    setUserSearchPage(0);
    setUserPageSize(10);
    setHasMoreUsers(true);
    fetchAvailableUsers(0, 10);
  };

  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
    setAvailableUsers([]);
    setSelectedUserIds([]);
    setUserSearchPage(0);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ====== FETCH AVAILABLE USERS ======
  const fetchAvailableUsers = async (page = 0, size = 10) => {
    try {
      if (page === 0) {
        setLoadingAvailableUsers(true);
      }
      console.log("📡 Fetching available users, page:", page);

      // Fetch all users from enterprise using userApi
      const response = await userApi.getUsers();
      console.log("✅ Available users API response:", response);
      const allUsers = response.data || response;
      const usersArray = Array.isArray(allUsers) ? allUsers : [];

      // Filter out users already in this event
      const existingUserIds = users.map(u => u.id);
      const filteredUsers = usersArray.filter(u => !existingUserIds.includes(u.id));

      if (page === 0) {
        setAvailableUsers(filteredUsers);
      } else {
        setAvailableUsers(prev => [...prev, ...filteredUsers]);
      }

      // Check if there are more users to load (simple pagination)
      const paginatedUsers = filteredUsers.slice(page * size, (page + 1) * size);
      setHasMoreUsers((page + 1) * size < filteredUsers.length);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoadingAvailableUsers(false);
    }
  };

  const handleLoadMoreUsers = () => {
    const nextPage = userSearchPage + 1;
    setUserSearchPage(nextPage);
    fetchAvailableUsers(nextPage, userPageSize);
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddUser = async () => {
    if (selectedUserIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một người dùng");
      return;
    }

    try {
      setSubmittingAddUser(true);
      console.log("📡 Adding users with eventId:", eventId, "userIds:", selectedUserIds);

      await projectUserApi.addUsers(eventId, selectedUserIds);

      handleCloseAddUserDialog();
      fetchUsers();
      setTimeout(() => {
        toast.success("Thêm nhân sự thành công!");
      }, 500);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Không thể thêm nhân sự";
      setTimeout(() => {
        toast.error(message);
      }, 300);
    } finally {
      setSubmittingAddUser(false);
    }
  };

  // ====== ASSIGN PERMISSION ======
  const handleOpenAssignDialog = async (user) => {
    try {
      // Fetch latest user permissions from API
      const userRoles = await fetchUserPermissions(user.id);
      
      setAssignForm({
        userId: user.id,
        roleIds: userRoles.map(r => r.id) || []
      });
      setRolesPage(0);
      setRolesPageSize(5);
      fetchRoles(0, 5);
      setAssignDialogOpen(true);
    } catch (err) {
      console.error("❌ Error opening assign dialog:", err);
      // Fallback to user roles from state
      setAssignForm({
        userId: user.id,
        roleIds: user.roles.map(r => r.id) || []
      });
      setRolesPage(0);
      setRolesPageSize(5);
      fetchRoles(0, 5);
      setAssignDialogOpen(true);
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setAssignForm({
      userId: "",
      roleIds: []
    });
  };

  const handleAssignPermission = async () => {
    // ✅ Không yêu cầu chọn role - gọi API ngay cả khi roleIds rỗng
    try {
      setSubmittingAssign(true);
      console.log("📡 Assigning permission with eventId:", eventId, "userId:", assignForm.userId, "roleIds:", assignForm.roleIds);

      await projectUserApi.assignRole(eventId, {
        userId: assignForm.userId,
        roleIds: assignForm.roleIds  // Có thể là mảng rỗng
      });

      handleCloseAssignDialog();
      fetchUsers();
      setTimeout(() => {
        toast.success("Cập nhật quyền thành công!");
      }, 500);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Không thể cập nhật quyền";
      setTimeout(() => {
        toast.error(message);
      }, 300);
    } finally {
      setSubmittingAssign(false);
    }
  };

  // ====== TOGGLE USER STATE ======
  const handleToggleUserState = async (userId, currentState) => {
    try {
      const newState = currentState === "ACTIVE" ? "BLOCK" : "ACTIVE";
      console.log("📡 Toggling user state with eventId:", eventId, "userId:", userId, "newState:", newState);
      
      await projectUserApi.changeUserState(eventId, userId, newState);

      fetchUsers();
      setTimeout(() => {
        toast.success(`Thay đổi trạng thái thành công!`);
      }, 500);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Không thể thay đổi trạng thái";
      setTimeout(() => {
        toast.error(message);
      }, 300);
    }
  };

  // ====== REMOVE USER ======
  const handleRemoveUser = async (userId) => {
    if (userId === getCurrentUserId()) {
      toast.warning("Không thể xóa chính mình");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này khỏi sự kiện?")) {
      return;
    }

    try {
      console.log("📡 Removing user with eventId:", eventId, "userId:", userId);
      await projectUserApi.changeUserState(eventId, userId, "REMOVED");

      fetchUsers();
      setTimeout(() => {
        toast.success("Xóa người dùng thành công!");
      }, 500);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Không thể xóa người dùng";
      setTimeout(() => {
        toast.error( message);
      }, 300);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', m: 2}}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddUserDialog}
        >
          Thêm thành viên
        </StyledButton>
      </Box>

      {/* Users Table with CommonTable */}
      <CommonTable
        columns={[
          {
            field: 'name',
            headerName: 'Tên',
            width: '25%',
            render: (value) => value || 'N/A',
          },
          {
            field: 'email',
            headerName: 'Email',
            width: '25%',
          },
          {
            field: 'roles',
            headerName: 'Vai trò',
            flex: 1,
            minWidth: 200,
            render: (value, row) => {
              if (row.isOwner) {
                return (
                  <Chip
                    label="Chủ sự kiện"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                );
              }
              
              const roles = row.roles || [];
              return roles.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {roles.map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có vai trò
                </Typography>
              );
            },
          },
        
          {
            field: 'state',
            headerName: 'Trạng thái',
            width: '15%',
            align: 'center',
            render: (state, user) => {
              if (user.isOwner) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    Hoạt động
                  </Typography>
                );
              }

              return (
                <Switch
                  checked={state === 'ACTIVE' || state === 'active'}
                  onChange={() => handleToggleUserState(user.id, state)}
                  size="small"
                  title={
                    state === 'ACTIVE' || state === 'active' ? 'Bật' : 'Tắt'
                  }
                />
              );
            },
          },
          
          {
            field: 'actions',
            headerName: 'Hành động',
            width: '10%',
            align: 'center',
            render: (_, user) => (
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                {!user.isOwner && (
                  <IconButton
                    size="small"
                    onClick={() => handleOpenAssignDialog(user)}
                    title="Phân quyền"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ),
          },
        ]}
        data={users}
        loading={loading}
        rowsPerPage={usersPageSize}
        page={usersPage}
        totalCount={usersTotalData}
        onPageChange={(newPage) => {
          setUsersPage(newPage);
          fetchUsers(newPage, usersPageSize);
        }}
        onRowsPerPageChange={(newSize) => {
          setUsersPageSize(newSize);
          setUsersPage(0);
          fetchUsers(0, newSize);
        }}
        emptyMessage="Chưa có thành viên nào"
        maxHeight={500}
        minHeight={500}
      />

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onClose={handleCloseAddUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          fontWeight: 700,
        }}>Thêm thành viên vào sự kiện</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{mt: 2}}>
            <InputLabel>Chọn người dùng</InputLabel>
            <Select
              multiple
              label="Chọn người dùng"
              value={selectedUserIds}
              onChange={(e) => setSelectedUserIds(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const user = availableUsers.find(u => u.id === userId);
                    return user ? (
                      <Chip key={userId} label={user.name} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
              disabled={loadingAvailableUsers}
            >
              {loadingAvailableUsers ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Đang tải...
                </MenuItem>
              ) : availableUsers.length === 0 ? (
                <MenuItem disabled>Không có người dùng khả dụng</MenuItem>
              ) : (
                availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedUserIds.includes(user.id)} />
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUserDialog}>Hủy</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={submittingAddUser || selectedUserIds.length === 0}
            color="primary"
          >
            {submittingAddUser ? <CircularProgress size={24} /> : `Thêm`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Permission Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            [theme.breakpoints.down('sm')]: {
              borderRadius: 0,
              margin: 0,
              maxHeight: '100vh',
            },
          }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            fontWeight: 700,
            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2,
          }}
        >
          Phân quyền cho thành viên
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Select Roles as Checkboxes */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Chọn vai trò
                <Chip 
                  label={`Đã chọn: ${assignForm.roleIds.length}`} 
                  size="small" 
                  color="primary"
                  sx={{ ml: 2, fontWeight: 600 }}
                />
              </Typography>
              {loadingRoles ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
                  <CircularProgress size={50} thickness={4} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải danh sách vai trò...
                  </Typography>
                </Box>
              ) : roles.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  Không có vai trò nào
                </Alert>
              ) : (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    maxHeight: 400, 
                    overflow: 'auto', 
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {roles.map((role) => (
                      <Box
                        key={role.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          }
                        }}
                      >
                        <Checkbox
                          checked={assignForm.roleIds.indexOf(role.id) > -1}
                          onChange={(e) => {
                            const newRoleIds = e.target.checked
                              ? [...assignForm.roleIds, role.id]
                              : assignForm.roleIds.filter(id => id !== role.id);
                            setAssignForm({ ...assignForm, roleIds: newRoleIds });
                          }}
                          disabled={submittingAssign}
                          sx={{
                            '&.Mui-checked': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {role.name}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>

            {assignForm.roleIds.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                  Vai trò đã chọn:
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  {assignForm.roleIds.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <Chip
                        key={roleId}
                        label={role.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            gap: 2,
          }}
        >
          <Button 
            onClick={handleCloseAssignDialog} 
            disabled={submittingAssign}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <StyledButton
            onClick={handleAssignPermission} 
            variant="contained"
            color="primary"
            disabled={submittingAssign}
          >
            {submittingAssign ? "Đang lưu..." : "Lưu"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
