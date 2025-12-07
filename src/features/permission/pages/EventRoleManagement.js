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
  Divider,
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  styled,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Inbox as InboxIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import axiosClient from "../../../app/axios/axiosClient";
import roleApi from "../api/role.api";
import { useToast } from "../../../app/providers/ToastContext";
import useProjectUserPermissions from "../hooks/useProjectUserPermissions";
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

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '1.25rem',
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
 * EventRoleManagement - Quản lý vai trò tham gia cho event
 * API Role: GET/POST/PUT/DELETE /role (scoped to event/project)
 * API Permissions: GET /permissions?type=PROJECT
 */
export default function EventRoleManagement({ enterpriseId, eventId, eventData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toast = useToast();

  // Permission checking
  const [userId, setUserId] = useState(null);
  const { hasPermission, isOwner } = useProjectUserPermissions(eventId, userId);

  // Roles States
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Pagination states for roles table
  const [rolesPage, setRolesPage] = useState(0);
  const [rolesPageSize, setRolesPageSize] = useState(5);
  const [rolesTotalPages, setRolesTotalPages] = useState(0);
  const [rolesTotalData, setRolesTotalData] = useState(0);

  // Form state
  const [roleForm, setRoleForm] = useState({
    name: "",
    type: "PROJECT",
    permissionIds: []
  });

  // Permissions States
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Get current user ID from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      } catch (e) {
      }
    }
  }, []);

  // ====== FETCH ROLES ======
  useEffect(() => {
    
    if (!eventId || !userId) {
      setLoading(false);
      setRoles([]);
      return;
    }

    const canAccess = hasPermission('project_role_manage') || isOwner || eventData?.createdUserId === userId;

    if (canAccess) {
      fetchRoles(0, rolesPageSize);
    } else {
      setLoading(false);
      setRoles([]);
    }
  }, [eventId, enterpriseId, hasPermission, isOwner, eventData?.createdUserId, userId, rolesPageSize]);

  const fetchRoles = async (page = 0, size = 5) => {
    try {
      setLoading(true);

      // Validate eventId before API call
      if (!eventId) {
        setRoles([]);
        setLoading(false);
        return;
      }

      // Fetch roles using roleApi with pagination
      const response = await roleApi.getProjectRoles(enterpriseId, eventId, page, size);
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
      // If 404 or not found, assume no roles yet
      if (err.response?.status === 404) {
        setRoles([]);
        setRolesTotalPages(0);
        setRolesTotalData(0);
      } else {
        const message = err?.response?.data?.message || err.message || "Không thể tải danh sách vai trò";
        setTimeout(() => {
          toast.error(message);
        }, 300);
        setRoles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ====== FETCH PERMISSIONS BY TYPE ======
  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true);

      // Fetch permissions using roleApi
      const response = await roleApi.getPermissions('PROJECT');
      const data = response.data || response;
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // ====== DIALOG HANDLERS ======
  const handleOpenDialog = async (role = null) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name || "",
        type: role.type || "PROJECT",
        permissionIds: role.permissions?.map(p => p.id) || []
      });
      // Fetch permissions for this type
      await fetchPermissions(role.type || "PROJECT");
    } else {
      setEditingRole(null);
      setRoleForm({
        name: "",
        type: "PROJECT",
        permissionIds: []
      });
      // Fetch permissions for PROJECT by default
      await fetchPermissions("PROJECT");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setRoleForm({
      name: "",
      type: "PROJECT",
      permissionIds: []
    });
    setPermissions([]);
  };

  // ====== HANDLE PERMISSION TOGGLE ======
  const handlePermissionToggle = (permissionId) => {
    setRoleForm(prev => {
      const isSelected = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: isSelected
          ? prev.permissionIds.filter(id => id !== permissionId)
          : [...prev.permissionIds, permissionId]
      };
    });
  };

  // ====== SAVE ROLE ======
  const handleSaveRole = async () => {
    try {
      setSubmitting(true);

      // Validate eventId
      if (!eventId) {
        toast.error("Không thể xác định sự kiện");
        return;
      }

      // Validate form
      if (!roleForm.name || !roleForm.name.trim()) {
        toast.warning("Vui lòng nhập tên vai trò");
        return;
      }

      if (roleForm.permissionIds.length === 0) {
        toast.warning("Vui lòng chọn ít nhất một quyền");
        return;
      }

      const requestBody = {
        name: roleForm.name.trim(),
        type: 'PROJECT',
        permissionIds: roleForm.permissionIds
      };

      if (editingRole) {
        // Update existing role using roleApi
        await roleApi.updateRole(eventId, editingRole.id, requestBody);
        setTimeout(() => {
          toast.success("Cập nhật vai trò thành công!");
        }, 300);
      } else {
        // Create new role using roleApi
        await roleApi.createRole(eventId, requestBody);
        setTimeout(() => {
          toast.success("Tạo vai trò mới thành công!");
        }, 300);
      }

      handleCloseDialog();
      await fetchRoles(0, rolesPageSize);
    } catch (err) {
      let errorMessage = "Không thể lưu vai trò.";
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setTimeout(() => {
        toast.error(errorMessage);
      }, 300);
    } finally {
      setSubmitting(false);
    }
  };

  // ====== DELETE ROLE ======
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
      return;
    }

    try {
      // Delete role using roleApi
      await roleApi.deleteRole(eventId, roleId);
      setTimeout(() => {
        toast.success("Xóa vai trò thành công!");
      }, 300);
      await fetchRoles(0, rolesPageSize);
    } catch (err) {
      const message = err.response?.data?.message || "Không thể xóa vai trò";
      setTimeout(() => {
        toast.error(message);
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
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end", alignItems: "center", m: 2}}>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Tạo vai trò mới
        </StyledButton>
      </Box>

      {/* Permission Denied Alert */}
      {!hasPermission('project_role_manage') && !isOwner && eventData?.createdUserId !== userId && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          Bạn không có quyền truy cập vai trò sự kiện này
        </Alert>
      )}

      {/* Content - Only show if has permission */}
      {(hasPermission('project_role_manage') || isOwner || eventData?.createdUserId === userId) ? (
        <>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 8, gap: 2 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Đang tải vai trò...
              </Typography>
            </Box>
          ) : roles.length === 0 ? (
            <EmptyStateBox>
              <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Chưa có vai trò nào cho sự kiện này
              </Typography>
            </EmptyStateBox>
          ) : isMobile ? (
            // Mobile view: Cards
            <Grid container spacing={2}>
          {roles.map((role) => (
            <Grid item xs={12} key={role.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {role.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Số quyền: {role.permissions?.length || 0}
                      </Typography>
                      {role.permissions && role.permissions.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.permissions.slice(0, 3).map((perm) => (
                            <Chip
                              key={perm.id}
                              label={perm.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {role.permissions.length > 3 && (
                            <Chip
                              label={`+${role.permissions.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteRole(role.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop view: CommonTable
        <CommonTable
          columns={[
            {
              field: 'name',
              headerName: 'Tên vai trò',
              width: '30%',
              render: (value) => (
                <Typography variant="body1" fontWeight={500}>
                  {value}
                </Typography>
              ),
            },
            {
              field: 'permissionCount',
              headerName: 'Số quyền',
              width: '15%',
              align: 'center',
              render: (_, role) => (
                <Chip
                  label={role.permissions?.length || 0}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              field: 'permissions',
              headerName: 'Danh sách quyền',
              width: '40%',
              render: (permissions) => {
                if (!permissions || permissions.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có quyền
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {permissions.slice(0, 3).map((perm) => (
                      <Chip
                        key={perm.id}
                        label={perm.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {permissions.length > 3 && (
                      <Chip
                        label={`+${permissions.length - 3} khác`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                );
              },
            },
            {
              field: 'actions',
              headerName: 'Hành động',
              width: '15%',
              align: 'center',
              render: (_, role) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRole(role.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            },
          ]}
          data={roles}
          loading={loading}
          rowsPerPage={rolesPageSize}
          page={rolesPage}
          totalCount={rolesTotalData}
          onPageChange={(newPage) => {
            setRolesPage(newPage);
            fetchRoles(newPage, rolesPageSize);
          }}
          onRowsPerPageChange={(newSize) => {
            setRolesPageSize(newSize);
            setRolesPage(0);
            fetchRoles(0, newSize);
          }}
          emptyMessage="Không có vai trò nào"
          maxHeight={500}
          minHeight={500}
        />
      )}

      {/* Role Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <StyledDialogTitle>
          {editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
        </StyledDialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Tên vai trò"
              fullWidth
              required
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              disabled={submitting}
              placeholder="Nhập tên vai trò"
            />

            {/* Permissions Section */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Chọn quyền cho sự kiện (Đã chọn: {roleForm.permissionIds.length})
              </Typography>

              {loadingPermissions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : permissions.length === 0 ? (
                <Alert severity="info">
                  Không có quyền con nào cho sự kiện
                </Alert>
              ) : (
                <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {permissions.map((permission) => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={roleForm.permissionIds.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            disabled={submitting}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {permission.name}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </Paper>
              )}
            </Box>

            {/* Selected Permissions Preview */}
            {roleForm.permissionIds.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Quyền đã chọn:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {roleForm.permissionIds.map(permId => {
                    const perm = permissions.find(p => p.id === permId);
                    return perm ? (
                      <Chip
                        key={permId}
                        label={perm.name}
                        size="small"
                        onDelete={() => handlePermissionToggle(permId)}
                        disabled={submitting}
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            disabled={submitting || !roleForm.name.trim() || roleForm.permissionIds.length === 0}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? "Đang lưu..." : (editingRole ? "Cập nhật" : "Tạo mới")}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      ) : null}
    </Box>
  );
}
