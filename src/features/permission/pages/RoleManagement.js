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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import axiosClient from "../../../app/axios/axiosClient";
import PermissionGate from "../../../shared/components/PermissionGate";
import { useToast } from "../../../app/providers/ToastContext";
import { CommonTable } from "../../../shared/components/CommonTable";
import CommonDialog from "../../../shared/components/CommonDialog";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";
import {
  StyledTableContainer,
  StyledButton,
  StyledCard,
  SectionHeader,
  EmptyStateBox,
} from "../../../shared/layouts/sharedStyles";

/**
 * RoleManagement - Quản lý quyền tham gia (Role & Permissions)
 * API Role: GET/POST/PUT/DELETE /role
 * API Permissions: GET /permissions?type=ENTERPRISE|PROJECT
 * 
 * Props:
 * - enterpriseId: ID của doanh nghiệp
 * - userPermissions: Danh sách quyền của user
 * - hasPermission: Function kiểm tra xem user có quyền cụ thể
 * - hasAnyPermission: Function kiểm tra user có ít nhất một quyền
 * - requiredPermission: Mã quyền cần để truy cập tab này
 */
export default function RoleManagement({ 
  enterpriseId, 
  userPermissions = [],
  hasPermission = () => true,
  hasAnyPermission = () => true,
  requiredPermission = PERMISSION_CODES.ROLE_MANAGE
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showToast } = useToast();
  
  // Kiểm tra quyền của user
  const hasAccessPermission = hasPermission(requiredPermission);
  
  // Roles States
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Form state
  const [roleForm, setRoleForm] = useState({
    name: "",
    type: "ENTERPRISE",
    permissionIds: []
  });

  // Permissions States
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Delete Confirmation Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ====== FETCH ROLES ======
  useEffect(() => {
    // Chỉ fetch nếu user có quyền
    if (hasAccessPermission) {
      fetchRoles();
    }
  }, [enterpriseId, hasAccessPermission, page, rowsPerPage]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");
      
      
      const response = await axiosClient.get("/role", {
        headers: {
          "enterprise-id": enterpriseId
        },
        params: {
          page: page,
          size: rowsPerPage
        }
      });
      
      
      const data = response.data || response;
      setRoles(Array.isArray(data) ? data : []);
      
      // Lấy total từ response.metadata.total
      const total = response?.metadata?.total || data.length || 0;
      setTotalCount(total);
    } catch (err) {
      const message = "Không thể tải danh sách quyền. " + (err?.response?.data?.message || err.message || "");
      showToast(`${message}`, 'error', 3000);
      setRoles([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ====== FETCH PERMISSIONS BY TYPE ======
  const fetchPermissions = async (type) => {
    try {
      setLoadingPermissions(true);
      
      const response = await axiosClient.get(`/permissions?type=${type}`, {
        headers: {
          "enterprise-id": enterpriseId
        }
      });
      
      
      const data = response.data || response;
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = "Không thể tải danh sách quyền.";
      showToast(`${message}`, 'error', 3000);
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
        type: role.type || "ENTERPRISE",
        permissionIds: role.permissions?.map(p => p.id) || []
      });
      // Fetch permissions for this type
      await fetchPermissions(role.type || "ENTERPRISE");
    } else {
      setEditingRole(null);
      setRoleForm({
        name: "",
        type: "ENTERPRISE",
        permissionIds: []
      });
      // Fetch permissions for ENTERPRISE by default
      await fetchPermissions("ENTERPRISE");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setRoleForm({
      name: "",
      type: "ENTERPRISE",
      permissionIds: []
    });
    setPermissions([]);
    setError("");
  };

  // ====== HANDLE TYPE CHANGE ======
  const handleTypeChange = async (newType) => {
    setRoleForm({
      ...roleForm,
      type: newType,
      permissionIds: [] // Reset permissions when type changes
    });
    await fetchPermissions(newType);
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
      setError("");

      // Validate form
      if (!roleForm.name || !roleForm.name.trim()) {
        showToast('Vui lòng nhập tên quyền', 'error', 3000);
        return;
      }

      if (roleForm.permissionIds.length === 0) {
        showToast('Vui lòng chọn ít nhất một quyền con', 'error', 3000);
        return;
      }
      
      const requestBody = {
        name: roleForm.name.trim(),
        type: roleForm.type,
        permissionIds: roleForm.permissionIds
      };
      
      if (editingRole) {
        // Update existing role
        
        await axiosClient.put(
          `/role/${editingRole.id}`, 
          requestBody
        );
        
      } else {
        // Create new role
        
        await axiosClient.post(
          "/role",
          requestBody
        );
        
      }
      
      handleCloseDialog();
      showToast(`${editingRole ? 'Cập nhật vai trò thành công!' : 'Tạo vai trò mới thành công!'}`, 'success', 3000);
      // Reset về trang đầu khi tạo mới hoặc giữ trang hiện tại khi update
      if (editingRole) {
        await fetchRoles();
      } else {
        setPage(0);
        await fetchRoles();
      }
    } catch (err) {
      let errorMessage = "Không thể lưu quyền.";
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
      
      showToast(`${errorMessage}`, 'error', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // ====== DELETE ROLE ======
  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    setItemToDelete(role);
    setDeleteDialogOpen(true);
  };

  // ====== PAGINATION HANDLERS ======
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = event?.target?.value || event;
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  // ====== HELPER FUNCTIONS ======
  const getTypeLabel = (type) => {
    return type === "ENTERPRISE" ? "Doanh nghiệp" : "Dự án";
  };

  const getTypeColor = (type) => {
    return type === "ENTERPRISE" ? "primary" : "secondary";
  };

  return (
    <PermissionGate 
      hasPermission={hasAccessPermission}
      featureName="quản lý vai trò"
    >
      <Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', m: 2}}>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
          size="large"
        >
          Tạo vai trò mới
        </StyledButton>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : roles.length === 0 ? (
        <EmptyStateBox>
          <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Chưa có vai trò nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy tạo vai trò đầu tiên để bắt đầu quản lý quyền hạn!
          </Typography>
        </EmptyStateBox>
      ) : isMobile ? (
          // Mobile view: Cards
          <Grid container spacing={3}>
            {roles.map((role) => (
              <Grid item xs={12} key={role.id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {role.name}
                          </Typography>
                          <Chip 
                            label={getTypeLabel(role.type)} 
                            size="small" 
                            color={getTypeColor(role.type)}
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip 
                            label={`${role.permissions?.length || 0} quyền`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        {role.permissions && role.permissions.length > 0 && (
                          <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                                color="primary"
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                      <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(role)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteRole(role.id)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.error.main, 0.1) 
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
                render:(value, row, rowIndex) => rowIndex + 1,
              },
              {
                field: 'name',
                headerName: 'Tên vai trò',
                flex: 1,
                minWidth: 150,
                render: (value) => (
                  <Typography variant="body1" fontWeight={600}>
                    {value}
                  </Typography>
                ),
              },
              {
                field: 'permissions',
                headerName: 'Số quyền',
                width: 120,
                align: 'center',
                render: (value) => (
                  <Chip 
                    label={value?.length || 0} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 60 }}
                  />
                ),
              },
              {
                field: 'permissionsList',
                headerName: 'Danh sách quyền',
                flex: 1,
                minWidth: 250,
                render: (_, row) => (
                  row.permissions && row.permissions.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {row.permissions.slice(0, 3).map((perm) => (
                        <Chip
                          key={perm.id}
                          label={perm.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {row.permissions.length > 3 && (
                        <Chip
                          label={`+${row.permissions.length - 3} khác`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có quyền
                    </Typography>
                  )
                ),
              },
              {
                field: 'actions',
                headerName: 'Hành động',
                width: 100,
                align: 'right',
                render: (_, row) => (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(row);
                      }}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(row.id);
                      }}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.error.main, 0.1) 
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ),
              },
            ]}
            data={roles}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onRowClick={(row) => handleOpenDialog(row)}
            emptyMessage="Không có vai trò nào"
            minHeight={550}
            maxHeight={550}
          />
        )}

      {/* Role Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
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
          {editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            
            <TextField
              label="Tên vai trò"
              fullWidth
              required
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              disabled={submitting}
              placeholder="Nhập tên vai trò"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* Permissions Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Chọn quyền
                <Chip 
                  label={`Đã chọn: ${roleForm.permissionIds.length}`} 
                  size="small" 
                  sx={{ ml: 2, fontWeight: 600 }}
                />
              </Typography>
              
              {loadingPermissions ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
                  <CircularProgress size={50} thickness={4} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải danh sách quyền...
                  </Typography>
                </Box>
              ) : permissions.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Không có quyền con nào cho Doanh nghiệp
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
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: alpha(theme.palette.divider, 0.1),
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(theme.palette.primary.main, 0.5),
                      borderRadius: '4px',
                      '&:hover': {
                        background: theme.palette.primary.main,
                      },
                    },
                  }}
                >
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
                        sx={{
                          py: 0.5,
                          borderRadius: 1,
                          px: 1,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.action.hover, 0.5),
                          },
                        }}
                      />
                    ))}
                  </FormGroup>
                </Paper>
              )}
            </Box>

            {/* Selected Permissions Preview */}
            {roleForm.permissionIds.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                  Quyền đã chọn:
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
                  {roleForm.permissionIds.map(permId => {
                    const perm = permissions.find(p => p.id === permId);
                    return perm ? (
                      <Chip
                        key={permId}
                        label={perm.name}
                        size="small"
                        onDelete={() => handlePermissionToggle(permId)}
                        disabled={submitting}
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
            onClick={handleCloseDialog} 
            disabled={submitting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>
          <StyledButton
            onClick={handleSaveRole} 
            variant="contained"
            disabled={submitting || !roleForm.name.trim() || roleForm.permissionIds.length === 0}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Đang lưu..." : (editingRole ? "Cập nhật" : "Tạo mới")}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <CommonDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onSubmit={async () => {
          try {
            setIsDeleting(true);
            await axiosClient.delete(`/role/${itemToDelete.id}`);
            showToast(`Xóa vai trò thành công!`, 'success', 3000);
            setPage(0); // Reset về trang đầu sau khi xóa
            setDeleteDialogOpen(false);
            setItemToDelete(null);
            await fetchRoles();
          } catch (err) {
            const message = err.response?.data?.message || "Không thể xóa. Vui lòng thử lại!";
            showToast(`${message}`, 'error', 3000);
          } finally {
            setIsDeleting(false);
          }
        }}
        loading={isDeleting}
        submitLabel="Xóa"
        cancelLabel="Hủy"
        submitColor="error"
        centerButtons={true}
        PaperProps={{
          sx: { maxWidth: '400px' }
        }}
      >
        <Typography sx={{ textAlign: 'center', mt: 2 }}>
          Bạn có chắc chắn muốn xóa <strong>{itemToDelete?.name}</strong>?
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
          Hành động này không thể hoàn tác.
        </Typography>
      </CommonDialog>
      </Box>
    </PermissionGate>
  );
}
