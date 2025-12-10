import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

// Import các component con
import TaskCategoryManagement from "../../type_setting/pages/TaskTypeManagement";
import RoleManagement from "../../permission/pages/RoleManagement";
import UserPermissionManagement from "../../permission/pages/UserPermissionManagement";
import LocationManagement from "../../location/pages/LocationManagement";

// Import hooks và constants
import useEnterpriseUserPermissions from "../../permission/hooks/useEnterpriseUserPermissions";
import { PERMISSION_CODES } from "../../../shared/constants/permissions";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), 0 4px 24px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  background: theme.palette.background.paper,
}));

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
    '& .MuiTypography-h4': {
      fontSize: '1.5rem',
    },
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minHeight: 64,
    color: theme.palette.text.secondary,
    transition: 'all 0.3s ease',
    padding: theme.spacing(1.5, 2),
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: 56,
      fontSize: '0.875rem',
      padding: theme.spacing(1, 1.5),
      '& .MuiTab-iconWrapper': {
        fontSize: '1.2rem',
      },
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  '& .MuiTab-iconWrapper': {
    marginRight: theme.spacing(1),
    marginBottom: 0,
  },
}));

/**
 * Enterprise Settings - Trang cài đặt của doanh nghiệp
 * Tổng hợp các tab cài đặt: User, Stage, Task State, Task Category, Role, User Permission
 * 
 * Tính năng:
 * - Fetch user permissions khi vào trang
 * - Hiển thị thông báo lỗi nếu không lấy được quyền
 * - Pass permissions cho các component con để kiểm tra quyền
 */
export default function EnterpriseSettings() {
  const { id: enterpriseId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Determine current tab based on URL path
  const getInitialTab = () => {
    if (pathname.includes('group-task-types')) return 1;
    if (pathname.includes('group-task-states')) return 0;
    if (pathname.includes('roles')) return 2;
    if (pathname.includes('users')) return 3;
    if (pathname.includes('locations')) return 4;
    return 0;
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab());

  const tabConfig = useMemo(() => [
    { path: 'group-task-states' },
    { path: 'group-task-types' },
    { path: 'roles' },
    { path: 'users' },
    { path: 'locations' },
  ], []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    const newPath = `/enterprise/${enterpriseId}/settings/${tabConfig[newValue].path}`;
    navigate(newPath);
  };

  // Lấy user ID từ localStorage
  const getUserId = () => {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    const extractedId = user?.id || user?._id || user?.userId || localStorage.getItem('userId');
    console.log('[SETTINGS] 👤 Extracted userId:', extractedId);
    console.log('[SETTINGS] 📦 User object:', user);
    return extractedId;
  };

  const userId = useMemo(() => getUserId(), []);

  // Fetch user permissions (Enterprise Level)
  const { 
    permissions, 
    loading: permissionsLoading, 
    error: permissionsError, 
    hasPermission,
    hasAnyPermission,
    isOwner
  } = useEnterpriseUserPermissions(userId);

  const tabFullConfig = useMemo(() => [
 
    {
      label: "Nhóm mảng công việc",
      icon: <CategoryIcon />,
      component: TaskCategoryManagement,
      requiredPermission: PERMISSION_CODES.TASK_TYPE_MANAGE,
    },
    {
      label: "Vai trò tham gia",
      icon: <GroupIcon />,
      component: RoleManagement,
      requiredPermission: PERMISSION_CODES.ROLE_MANAGE,
    },
    {
      label: "Người dùng & Quyền hạn",
      icon: <PeopleIcon />,
      component: UserPermissionManagement,
      requiredPermission: PERMISSION_CODES.ENTERPRISE_USER_MANAGE,
    },
    {
      label: "Địa điểm",
      icon: <LocationOnIcon />,
      component: LocationManagement,
      requiredPermission: PERMISSION_CODES.LOCATION_MANAGE,
    },
  ], []);

  // Không filter tabs - hiển thị tất cả tabs
  // Kiểm tra quyền khi user chọn tab
  const CurrentComponent = tabFullConfig[currentTab]?.component;
  const currentRequiredPermission = tabFullConfig[currentTab]?.requiredPermission;

  return (
    <Box sx={{ pb: 4 }}>

      <StyledCard>
        {/* Hiển thị thông báo lỗi nếu lấy quyền thất bại */}
        {permissionsError && (
          <Alert severity="error" sx={{ m: 2 }}>
            Lỗi khi tải quyền truy cập: {permissionsError}
          </Alert>
        )}

        {/* Hiển thị tất cả tabs */}
        <StyledTabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ px: { xs: 1, sm: 3 } }}
        >
          {tabFullConfig.map((tab, index) => (
            <StyledTab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </StyledTabs>

        {/* Hiển thị nội dung tab với kiểm tra quyền */}
        <CardContent sx={{ padding: 0 }}>
          {permissionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            CurrentComponent && (
              <CurrentComponent 
                enterpriseId={enterpriseId}
                userPermissions={permissions}
                hasPermission={hasPermission}
                hasAnyPermission={hasAnyPermission}
                requiredPermission={currentRequiredPermission}
              />
            )
          )}
        </CardContent>
      </StyledCard>
    </Box>
  );
}
