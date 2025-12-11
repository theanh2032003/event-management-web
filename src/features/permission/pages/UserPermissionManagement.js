import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Grid,
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
  Switch,
  styled,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  AssignmentInd as AssignmentIndIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import PermissionGate from "../../../shared/components/PermissionGate";
import { CommonTable } from "../../../shared/components/CommonTable";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";
import {
  StyledButton,
  StyledCard,
  SectionHeader,
  EmptyStateBox,
} from "../../../shared/layouts/sharedStyles";
import roleApi from "../api/role.api";
import userApi from "../../user/api/user.api";

/**
 * UserPermissionManagement - Quản lý nhân sự và gán vai trò
 * API: POST /enterprise/user - Thêm user vào enterprise
 * API: GET /enterprise/user - Lấy danh sách users
 * API: GET /api/user/{userId}/permission - Lấy roles và permissions của user
 * API: POST /api/user/assign - Gán vai trò cho user
 * API: GET /role - Lấy danh sách roles
 * API: PATCH /enterprise/user/{userId}/block - Block/Active user
 * 
 * Props:
 * - enterpriseId: ID của doanh nghiệp
 * - userPermissions: Danh sách quyền của user
 * - hasPermission: Function kiểm tra xem user có quyền cụ thể
 * - requiredPermission: Mã quyền cần để truy cập tab này
 */
export default function UserPermissionManagement({ 
  enterpriseId,
  userPermissions = [],
  hasPermission = () => true,
  requiredPermission = PERMISSION_CODES.ENTERPRISE_USER_MANAGE
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Kiểm tra quyền của user
  const hasAccessPermission = hasPermission(requiredPermission);
  
  // States for users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // States for add user
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submittingAddUser, setSubmittingAddUser] = useState(false);
  
  // States for assign permission
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: "",
    // type: "ENTERPRISE",
    projectId: "",
    roleIds: []
  });
  
  // States for roles
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

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
    // Chỉ fetch nếu user có quyền
    if (hasAccessPermission) {
      fetchUsers();
    }
  }, [enterpriseId, hasAccessPermission]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await userApi.getUsers();      
      
      const data = response.data || response;
      const usersList = Array.isArray(data) ? data : [];
      
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
    } catch (err) {
      setError("Không thể tải danh sách người dùng. " + (err?.response?.data?.message || err.message || ""));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ====== FETCH USER PERMISSIONS ======
  const fetchUserPermissions = async (userId) => {
    try {
      const response = await roleApi.getEnterpriseUserPermissions(userId);
      
      const data = response.data || response;
      return Array.isArray(data.roles) ? data.roles : [];
    } catch (err) {
      return [];
    }
  };

  // ====== ADD USER FUNCTIONS ======
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenAddUserDialog = () => {
    setEmailInput("");
    setEmailError("");
    setAddUserDialogOpen(true);
  };

  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
    setEmailInput("");
    setEmailError("");
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmailInput(email);
    
    if (email && !validateEmail(email)) {
      setEmailError("Email không hợp lệ");
    } else {
      setEmailError("");
    }
  };

  const handleAddUser = async () => {
    // Validate
    if (!emailInput.trim()) {
      setEmailError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(emailInput)) {
      setEmailError("Email không hợp lệ");
      return;
    }

    try {
      setSubmittingAddUser(true);
      const userId = getCurrentUserId();
      
      await userApi.createUser(
        { token: emailInput.trim() }
      );
      
      toast.success("Đã thêm người dùng vào doanh nghiệp.");
      handleCloseAddUserDialog();
      await fetchUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể thêm người dùng";
      setEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmittingAddUser(false);
    }
  };

  // ====== FETCH ROLES ======
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      
      const response = await roleApi.getRoles();
      
      const data = response.data || response;
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  // ====== TOGGLE USER BLOCK/ACTIVE ======
  const handleToggleUserStatus = async (userId, currentState) => {
    try {
      // Determine new state (toggle between ACTIVE and BLOCKED)
      const newState = currentState === "ACTIVE" ? "BLOCK" : "ACTIVE";
      // Verify token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }
      
      await userApi.blockUser(userId);
      
      toast.success(`Đã ${newState === "ACTIVE" ? "kích hoạt" : "khóa"} người dùng`);
      
      // Update user state in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, state: newState } : user
        )
      );
    } catch (err) {
      // Check if it's a network error
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        toast.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!");
        return;
      }
      const errorMessage = err.response?.data?.message || err.message || "Không thể thay đổi trạng thái người dùng";
      toast.error(errorMessage);
    }
  };



  // ====== ASSIGN PERMISSION FUNCTIONS ======
  const handleOpenAssignDialog = async (userId = "") => {
    setAssignDialogOpen(true);
    setLoadingRoles(true);
    
    try {
      // Fetch all roles
      await fetchRoles();
      
      // If userId is provided, fetch current roles for that user
      let currentRoleIds = [];
      if (userId) {
        const userRoles = await fetchUserPermissions(userId);
        currentRoleIds = userRoles.map(role => role.id);
      }
      
      setAssignForm({
        userId: userId,
        projectId: "",
        roleIds: currentRoleIds
      });
    } catch (err) {
      console.error("❌ Error loading dialog data:", err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setAssignForm({
      userId: "",
      projectId: "",
      roleIds: []
    });
    setRoles([]);
  };

  // const handleTypeChange = (newType) => {
  //   setAssignForm({
  //     ...assignForm,
  //     type: newType,
  //     // projectId: newType === "ENTERPRISE" ? "" : assignForm.projectId
  //   });
  // };

  const handleAssignPermission = async () => {
    // Validate
    if (!assignForm.userId) {
      toast.error("Vui lòng chọn người dùng");
      return;
    }

    try {
      setSubmittingAssign(true);
      
      const requestBody = {
        userId: parseInt(assignForm.userId),
        roleIds: assignForm.roleIds 
      };
      
      await roleApi.assign(
        requestBody
      );
      
      toast.success("Cập nhật vai trò thành công!");
      handleCloseAssignDialog();
      // Refresh users list to update roles
      await fetchUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể cập nhật vai trò";
      toast.error(errorMessage);
    } finally {
      setSubmittingAssign(false);
    }
  };

  return (
    <PermissionGate 
      hasPermission={hasAccessPermission}
      featureName="quản lý nhân sự"
    >
      <Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', m: 2}}>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddUserDialog}
          disabled={loading}
          size="large"
        >
          Thêm nhân sự
        </StyledButton>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : users.length === 0 ? (
        <EmptyStateBox>
          <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có người dùng nào
          </Typography>
        </EmptyStateBox>
      ) : isMobile ? (
        // Mobile view: Cards
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} key={user.id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 32, color: "success.main" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {user.name || user.email}
                        </Typography>
                        {!user.isOwner && (
                          <Switch
                            checked={user.state === "ACTIVE"}
                            onChange={() => handleToggleUserStatus(user.id, user.state)}
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {user.email}
                      </Typography>
                      {user.isOwner ? (
                        <Chip
                          label="Chủ doanh nghiệp"
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : user.roles && user.roles.length > 0 ? (
                        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {user.roles.map((role) => (
                            <Chip
                              key={role.id}
                              label={role.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Chưa có vai trò
                        </Typography>
                      )}
                    </Box>
                    {!user.isOwner && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenAssignDialog(user.id)}
                        title="Gán vai trò"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.success.main, 0.1) 
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop view: CommonTable
        <CommonTable
          columns={[
            {
              field: 'id',
              headerName: 'STT',
              width: 70,
              align: 'center',
              headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
              cellSx: { fontSize: '0.9rem', textAlign: 'center' },
              render: (value, row, rowIndex) => rowIndex + 1,
            },
            {
              field: 'name',
              headerName: 'Tên',
              flex: 1,
              minWidth: 150,
              render: (value) => (
                <Typography variant="body2" fontWeight={600}>
                  {value || "N/A"}
                </Typography>
              ),
            },
            {
              field: 'email',
              headerName: 'Email',
              flex: 1,
              minWidth: 180,
              render: (value) => (
                <Typography variant="body2" color="text.secondary">
                  {value}
                </Typography>
              ),
            },
            {
              field: 'roles',
              headerName: 'Vai trò',
              flex: 1,
              minWidth: 200,
              render: (value, row) => {
                // Nếu là chủ doanh nghiệp, hiển thị "Chủ doanh nghiệp"
                if (row.isOwner) {
                  return (
                    <Chip
                      label="Chủ doanh nghiệp"
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
              width: 120,
              align: 'center',
              headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
              cellSx: { fontSize: '0.9rem', textAlign: 'center' },
              render: (value, row) => {
                // Chủ doanh nghiệp không thể khóa
                if (row.isOwner) {
                  return (
                    <Chip
                      label="Hoạt động"
                      size="small"
                      variant="filled"
                    />
                  );
                }
                
                return (
                  <Switch
                    checked={value === "ACTIVE"}
                    onChange={() => handleToggleUserStatus(row.id, value)}
                    size="small"
                    title={value === "ACTIVE" ? "Đang hoạt động" : "Đang khóa"}
                  />
                );
              },
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              width: 80,
              align: 'center',
              headerCellSx: { fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' },
              cellSx: { fontSize: '0.9rem', textAlign: 'center' },
              render: (_, row) => {
                // Chủ doanh nghiệp không hiển thị nút hành động
                if (row.isOwner) {
                  return null;
                }
                
                return (
                  <IconButton
                    size="small"
                    onClick={() => handleOpenAssignDialog(row.id)}
                    title="Gán vai trò"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                );
              },
            },
          ]}
          data={users}
          loading={loading}
          emptyMessage="Chưa có người dùng nào"
          rowsPerPage={10}
          page={0}
          totalCount={users.length}
          maxHeight={550}
          minHeight={550}
        />
      )}

      {/* Add User Dialog */}
      <Dialog 
        open={addUserDialogOpen} 
        onClose={handleCloseAddUserDialog}
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
          Thêm người dùng vào doanh nghiệp
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <TextField
            label="Email người dùng *"
            type="email"
            fullWidth
            required
            value={emailInput}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError || "Nhập email của người dùng cần thêm"}
            disabled={submittingAddUser}
            placeholder="user@example.com"
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
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
            onClick={handleCloseAddUserDialog} 
            disabled={submittingAddUser}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <StyledButton
            onClick={handleAddUser} 
            variant="contained"
            disabled={submittingAddUser || !emailInput.trim() || !!emailError}
            startIcon={submittingAddUser ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          >
            {submittingAddUser ? "Đang thêm..." : "Thêm nhân sự"}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Assign Role Dialog */}
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
          {assignForm.userId ? 'Chỉnh sửa vai trò' : 'Gán vai trò người dùng'}
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
                    height: 300, 
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
                  }}
                >
                  {assignForm.roleIds.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <Chip
                        key={roleId}
                        label={role.name}
                        size="small"
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
            disabled={submittingAssign || !assignForm.userId}
            startIcon={submittingAssign ? <CircularProgress size={20} color="inherit" /> : <AssignmentIndIcon />}
          >
            {submittingAssign ? "Đang lưu..." : "Lưu gán"}
          </StyledButton>
        </DialogActions>
      </Dialog>
      </Box>
    </PermissionGate>
  );
}
