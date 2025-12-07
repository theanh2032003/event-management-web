import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSidebar } from "../../../shared/contexts/SidebarContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  styled,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  EventNote as EventNoteIcon,
  LocalOffer as LocalOfferIcon,
  People as PeopleIcon,
  Lock as LockIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import projectApi from "../api/project.api";
import EventOverview from "./EventOverview";
import EventTask from "../../stage/pages/EventTask";
import EventSchedule from "../../schedule/pages/EventSchedule";
import EventTicketTypeManagement from "../../ticket/pages/EventTicketTypeManagement";
import EventRoleManagement from "../../permission/pages/EventRoleManagement";
import EventUserPermission from "../../permission/pages/EventUserPermission";
import EventFeedback from "../../feedback/pages/Feedback";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiTabs-scrollButtons': {
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minHeight: 56,
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  padding: theme.spacing(1.5, 2),
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  '& .MuiTab-iconWrapper': {
    marginRight: theme.spacing(1),
    marginBottom: 0,
  },
}));

export default function EventDetail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams();
  const { id: enterpriseId, eventId } = params;
  console.log("🔍 EventDetail params:", params, "eventId:", eventId, "enterpriseId:", enterpriseId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get sidebar collapse state from context
  const { sidebarCollapsed } = useSidebar();
  
  // Get tab from URL, default to 0
  const tab = parseInt(searchParams.get('tab') || '0', 10);

  // Sidebar width from EnterpriseLayout - changes with collapse state
  const sidebarWidth = sidebarCollapsed ? 64 : 260;
  const contentPadding = 24;

  // Fetch event data from API
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getById(eventId);
        const eventData = response?.data?.data || response?.data || response;
        setEvent(eventData);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải sự kiện');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue }, { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="error">
          {error || 'Không tìm thấy sự kiện.'}
        </Typography>
      </Box>
    );
  }

  const tabConfig = [
    { label: "Tổng quan", icon: <EventNoteIcon /> },
    { label: "Công việc", icon: <EventNoteIcon /> },
    { label: "Lịch trình", icon: <ScheduleIcon /> },
    { label: "Cài đặt vé", icon: <LocalOfferIcon /> },
    { label: "Người tham gia", icon: <PeopleIcon /> },
    { label: "Phân quyền", icon: <LockIcon /> },
    { label: "Đánh giá", icon: <StarIcon /> },
  ];

  return (
    <Box sx={{ minHeight: "calc(100vh - 128px)", backgroundColor: "#f5f5f5"}}>
      {/* Box nằm trên AppBar */}
      <Box
        sx={{
          position: "fixed",
          top: '64px',
          left: { xs: 0, md: `calc(${sidebarWidth}px + ${contentPadding}px)` },
          right: { xs: 0, md: 'auto' },
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - ${contentPadding * 2}px)` },
          height: { xs: 0, md: '25px' },
          backgroundColor: "#f8fafc",
          zIndex: (theme) => theme.zIndex.drawer + 3,
          transition: 'width 0.3s ease, left 0.3s ease, right 0.3s ease',
        }}
      />

      {/* AppBar cố định */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: { xs: 0, md: 'calc(25px + 64px)' },
          left: { xs: 0, md: `calc(${sidebarWidth}px + ${contentPadding}px)` },
          right: { xs: 0, md: 'auto' },
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - ${contentPadding * 2}px)` },
          backgroundColor: "#fff",
          color: "#333",
          borderBottom: '1px solid #e0e0e0',
          zIndex: (theme) => theme.zIndex.drawer + 2,
          transition: 'width 0.3s ease, left 0.3s ease, right 0.3s ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: 0 }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={handleBack} 
              sx={{ 
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                flex: 1, 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {event?.name}
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Tabs cố định bên dưới AppBar */}
      <Box
        sx={{
          position: "fixed",
          top: { xs: '56px', md: 'calc(25px + 64px + 64px)' },
          left: { xs: 0, md: `calc(${sidebarWidth}px + ${contentPadding}px)` },
          right: { xs: 0, md: 'auto' },
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - ${contentPadding * 2}px)` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#fff",
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'width 0.3s ease, left 0.3s ease, right 0.3s ease',
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <StyledTabs
            value={tab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              px: { xs: 0, sm: 2 },
            }}
          >
            {tabConfig.map((tabItem, index) => (
              <StyledTab
                key={index}
                icon={tabItem.icon}
                label={tabItem.label}
                iconPosition="start"
              />
            ))}
          </StyledTabs>
        </Container>
      </Box>

      {/* Nội dung scrollable - đẩy xuống để không bị che */}
      <Box 
        sx={{ 
          pt: { xs: '112px', md: '128px' },
          px: 0,
        }}
      >
        <Box sx={{ px: 0 }}>
          <Card 
            sx={{ 
              borderRadius: 2, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              minHeight: 'calc(100vh - 270px)',
              backgroundColor: '#fff',
              mt: 1
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <TabPanel value={tab} index={0}>
                <EventOverview eventData={event} />
              </TabPanel>

              <TabPanel value={tab} index={1}>
                <EventTask 
                  projectId={eventId} 
                  enterpriseId={enterpriseId} 
                  eventData={event} 
                />
              </TabPanel>

              <TabPanel value={tab} index={2}>
                <EventSchedule 
                  projectId={eventId} 
                  enterpriseId={enterpriseId} 
                  eventData={event} 
                />
              </TabPanel>

              <TabPanel value={tab} index={3}>
                <EventTicketTypeManagement 
                  eventId={eventId} 
                  enterpriseId={enterpriseId} 
                  eventData={event} 
                />
              </TabPanel>

              <TabPanel value={tab} index={4}>
                <EventUserPermission 
                  eventId={eventId} 
                  enterpriseId={enterpriseId} 
                  eventData={event} 
                />
                {console.log("📋 Rendering EventUserPermission with eventId:", eventId)}
              </TabPanel>

              <TabPanel value={tab} index={5}>
                <EventRoleManagement 
                  eventId={eventId} 
                  enterpriseId={enterpriseId} 
                  eventData={event} 
                />
              </TabPanel>

              <TabPanel value={tab} index={6}>
                <EventFeedback 
                  eventId={eventId} 
                  enterpriseId={enterpriseId} 
                  eventData={event} 
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}