import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  ConfirmationNumber as TicketIcon,
  AccountBalance as FinanceIcon,
  Feedback as FeedbackIcon,
  Store as SupplierIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import KpiCard from '../components/KpiCard';
import ChartWrapper from '../components/ChartWrapper';
import statisticApi from '../api/statistic.api';

/**
 * Enterprise Statistics - Trang thống kê của doanh nghiệp
 */
export default function EnterpriseStatistics({ hasPermission = true }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null,
    ticketing: null,
    finance: null,
    attendees: null,
    feedback: null,
    suppliers: null,
  });

  // Load data based on current tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        switch (currentTab) {
          case 0: // Overview
            if (!data.overview) {
              const overviewData = await statisticApi.getOverall();
              setData(prev => ({ ...prev, overview: overviewData }));
            }
            break;
          case 1: // Ticketing
            if (!data.ticketing) {
              const ticketingData = await statisticApi.getTicketing();
              setData(prev => ({ ...prev, ticketing: ticketingData }));
            }
            break;
          case 2: // Finance
            if (!data.finance) {
              const financeData = await statisticApi.getFinance();
              setData(prev => ({ ...prev, finance: financeData }));
            }
            break;
          case 3: // Attendees
            if (!data.attendees) {
              const attendeesData = await statisticApi.getAttendees();
              setData(prev => ({ ...prev, attendees: attendeesData }));
            }
            break;
          case 4: // Feedback
            if (!data.feedback) {
              const feedbackData = await statisticApi.getFeedback();
              setData(prev => ({ ...prev, feedback: feedbackData }));
            }
            break;
          case 5: // Suppliers
            if (!data.suppliers) {
              const suppliersData = await statisticApi.getSuppliers();
              setData(prev => ({ ...prev, suppliers: suppliersData }));
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentTab, data]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Generate 12 months data with API data merged
  const generateMonthsData = (apiData) => {
    // Generate base 12 months
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const period = `${year}-${month}`;
      
      months.push({
        period,
        revenue: null,
        expenditure: null
      });
    }
    
    // Merge API data if available
    if (apiData && apiData.length > 0) {
      const apiMap = {};
      apiData.forEach(item => {
        apiMap[item.period] = item;
      });
      
      months.forEach(month => {
        if (apiMap[month.period]) {
          month.revenue = apiMap[month.period].revenue || 0;
          month.expenditure = apiMap[month.period].expenditure || 0;
        }
      });
    }
    
    return months;
  };

  // Generate 12 months data for participant trends
  const generateParticipantMonthsData = (apiData) => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const period = `${year}-${month}`;
      
      months.push({
        period,
        totalParticipants: null
      });
    }
    
    // Merge API data if available
    if (apiData && apiData.length > 0) {
      const apiMap = {};
      apiData.forEach(item => {
        apiMap[item.period] = item;
      });
      
      months.forEach(month => {
        if (apiMap[month.period]) {
          month.totalParticipants = apiMap[month.period].totalParticipants || 0;
        }
      });
    }
    
    return months;
  };

  // Chart colors
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  // Tab panel component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ 
          py: 4, 
          px: { xs: 2, md: 4 },
          bgcolor: 'white',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          minHeight: { xs: 600, md: 800 }
        }}>
          {children}
        </Box>
      )}
    </div>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Permission Alert */}
      {!hasPermission && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'warning.light', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.main',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
            ⚠️ Bạn không có quyền truy cập chức năng này
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vui lòng liên hệ với quản trị viên để được cấp quyền
          </Typography>
        </Box>
      )}

      {/* Tabs Navigation */}
      <Box sx={{ 
        borderBottom: 2, 
        borderColor: 'primary.main', 
        mb: 3,
        bgcolor: 'white',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'auto',
        opacity: hasPermission ? 1 : 0.6,
        pointerEvents: hasPermission ? 'auto' : 'none',
      }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          allowScrollButtonsMobile
          disabled={!hasPermission}
          sx={{
            px: 2,
            minHeight: 64,
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: 64,
              minWidth: { xs: 'auto', sm: 140 },
              px: { xs: 2, sm: 3 },
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.08)',
              },
              '&.Mui-selected': {
                color: '#667eea',
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            },
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': {
                opacity: 0.3,
              }
            }
          }}
        >
          <Tab icon={<TrendingUpIcon />} label="Tổng quan" iconPosition="start" />
          <Tab icon={<TicketIcon />} label="Bán vé" iconPosition="start" />
          <Tab icon={<FinanceIcon />} label="Tài chính" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="Người tham gia" iconPosition="start" />
          <Tab icon={<FeedbackIcon />} label="Phản hồi" iconPosition="start" />
          <Tab icon={<SupplierIcon />} label="Nhà cung cấp" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight={400}
          bgcolor="white"
          borderRadius={3}
          boxShadow="0 4px 12px rgba(0,0,0,0.08)"
          p={4}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {/* Overview Tab */}
      <TabPanel value={currentTab} index={0}>
        {data.overview && (
          <>
            <Grid
              container
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
                gridAutoRows: "116px"
              }}
            >
              {data.overview && (
                <>
                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Tổng dự án"
                      value={parseFloat((data.overview.totalProjects || 0).toFixed(2))}
                      icon={EventIcon}
                      color="primary"
                      format="number"
                    />
                  </Grid>

                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Tổng người check-in"
                      value={parseFloat((data.overview.totalUserCheckins || 0).toFixed(2))}
                      icon={PeopleIcon}
                      color="info"
                      format="number"
                    />
                  </Grid>

                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Tổng ticket"
                      value={parseFloat((data.overview.totalTickets || 0).toFixed(2))}
                      icon={TicketIcon}
                      color="success"
                      format="number"
                    />
                  </Grid>

                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Doanh thu"
                      value={parseFloat((data.overview.revenue || 0).toFixed(2))}
                      icon={MoneyIcon}
                      color="success"
                      format="currency"
                    />
                  </Grid>

                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Chi phí"
                      value={parseFloat((data.overview.expenditure || 0).toFixed(2))}
                      icon={FinanceIcon}
                      color="error"
                      format="currency"
                    />
                  </Grid>

                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Lợi nhuận"
                      value={parseFloat((data.overview.profit || 0).toFixed(2))}
                      icon={TrendingUpIcon}
                      color="primary"
                      format="currency"
                    />
                  </Grid>

                  <Grid item sx={{ height: "100%" }}>
                    <KpiCard sx={{ height: "100%" }}
                      title="Đánh giá TB"
                      value={parseFloat((data.overview.avgStar || 0).toFixed(2))}
                      icon={FeedbackIcon}
                      color="warning"
                      format="number"
                      subtitle="/ 5.0"
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Grid container  sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
                alignItems: "stretch"
              }}>
              <Grid  item sx={{ height: "100%", maxWidth: { md: "100%" } }}>
                <ChartWrapper title="Doanh thu vs Chi phí">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 400 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={generateMonthsData(data.overview.financeTrend)} margin={{ right: 30, left: 0, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'} />
                        <Tooltip 
                          formatter={(value) => value === null ? '-' : formatCurrency(value)}
                          labelFormatter={(label) => `Tháng: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#667eea" name="Doanh thu" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenditure" fill="#764ba2" name="Chi phí" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>

              <Grid  item sx={{ height: "100%", maxWidth: { md: "100%" }  }}>
                <ChartWrapper title="Xu hướng người tham gia">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 400 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={generateParticipantMonthsData(data.overview.participantTrends)} margin={{ right: 30, left: 0, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => value === null ? '-' : value.toLocaleString('vi-VN')}
                          labelFormatter={(label) => `Tháng: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="totalParticipants" stroke="#667eea" name="Người tham gia" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>

            </Grid>
          </>
        )}
      </TabPanel>

      {/* Ticketing Tab */}
      <TabPanel value={currentTab} index={1}>
        {data.ticketing && (
          <>
            <Grid
              container
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
                gridAutoRows: "116px"
              }}
            >
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Vé đã bán"
                  value={parseFloat((data.ticketing.totalTicketsSold || 0).toFixed(2))}
                  icon={TicketIcon}
                  color="success"
                  format="number"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Doanh thu vé"
                  value={parseFloat((data.ticketing.totalRevenue || 0).toFixed(2))}
                  icon={MoneyIcon}
                  color="primary"
                  format="currency"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tỷ lệ vé trả phí"
                  value={parseFloat(((data.ticketing.paidTicketRate || 0) * 100).toFixed(2))}
                  icon={TrendingUpIcon}
                  color="info"
                  format="percent"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Sự kiện bán chạy"
                  value={data.ticketing.bestSellingEvent || '-'}
                  icon={EventIcon}
                  color="warning"
                />
              </Grid>
            </Grid>

            <Grid container sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                  md: "repeat(1, 1fr)",
                },
                gap: 3,
                alignItems: "stretch"
              }}>
              <Grid item sx={{ height: "100%" }}>
                <ChartWrapper title="Vé bán theo sự kiện">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 600 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={600}>
                      <BarChart data={(data.ticketing.ticketsByEvent || []).map(item => ({
                        ...item,
                        eventNameTruncated: item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName
                      }))} margin={{ right: 30, left: 0, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="eventNameTruncated" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => value === null ? '-' : value.toLocaleString('vi-VN')}
                          labelFormatter={(label) => {
                            const fullItem = data.ticketing.ticketsByEvent.find(item => {
                              const truncated = item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName;
                              return truncated === label;
                            });
                            return fullItem ? `Sự kiện: ${fullItem.eventName}` : `Sự kiện: ${label}`;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="ticketsSold" fill="#667eea" name="Tổng vé" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="freeTickets" fill="#43e97b" name="Vé miễn phí" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="paidTickets" fill="#764ba2" name="Vé trả phí" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* Finance Tab */}
      <TabPanel value={currentTab} index={2}>
        {data.finance && (
          <>
            <Grid
              container
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
                gridAutoRows: "116px"
              }}
            >
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tổng doanh thu"
                  value={parseFloat((data.finance.totalRevenue || 0).toFixed(2))}
                  icon={MoneyIcon}
                  color="success"
                  format="currency"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tổng chi phí"
                  value={parseFloat((data.finance.totalExpense || 0).toFixed(2))}
                  icon={FinanceIcon}
                  color="error"
                  format="currency"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Lợi nhuận"
                  value={parseFloat((data.finance.profit || 0).toFixed(2))}
                  icon={TrendingUpIcon}
                  color="primary"
                  format="currency"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Chờ duyệt"
                  value={parseFloat((data.finance.pendingApprovals || 0).toFixed(2))}
                  icon={EventIcon}
                  color="warning"
                  format="number"
                />
              </Grid>
            </Grid>

            {data.finance.monthlyStatistics && (
              <Grid container sx={{
                  mb: 4,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(1, 1fr)",
                    md: "repeat(1, 1fr)",
                  },
                  gap: 3,
                  alignItems: "stretch"
                }}>
                <Grid item sx={{ height: "100%" }}>
                  <ChartWrapper title="Xu hướng doanh thu & chi phí">
                    <Box sx={{ width: '100%', height: { xs: 300, md: 400 }, minHeight: 300 }}>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data.finance.monthlyStatistics || []} margin={{ right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value) => value === null ? '-' : formatCurrency(value)} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#667eea" name="Doanh thu" strokeWidth={2} dot={{ fill: '#667eea', r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="expense" stroke="#764ba2" name="Chi phí" strokeWidth={2} dot={{ fill: '#764ba2', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </ChartWrapper>
                </Grid>
              </Grid>
            )}

            {data.finance.eventProfits && (
              <Grid container sx={{
                  mb: 4,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(1, 1fr)",
                    md: "repeat(1, 1fr)",
                  },
                  gap: 3,
                  alignItems: "stretch"
                }}>
                <Grid item sx={{ height: "100%" }}>
                  <ChartWrapper title="Lợi nhuận theo sự kiện">
                    <Box sx={{ width: '100%', height: { xs: 400, md: 550 }, minHeight: 400 }}>
                      <ResponsiveContainer width="100%" height={550}>
                        <LineChart data={data.finance.eventProfits || []} margin={{ right: 30, left: 0, bottom: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="projectName" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip 
                            formatter={(value) => value === null ? '-' : formatCurrency(value)}
                            labelFormatter={(label) => `Sự kiện: ${label}`}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line type="monotone" dataKey="revenue" stroke="#667eea" name="Doanh thu" strokeWidth={2} dot={{ fill: '#667eea', r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="expense" stroke="#764ba2" name="Chi phí" strokeWidth={2} dot={{ fill: '#764ba2', r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="profit" stroke="#43e97b" name="Lợi nhuận" strokeWidth={2} dot={{ fill: '#43e97b', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </ChartWrapper>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </TabPanel>

      {/* Attendees Tab */}
      <TabPanel value={currentTab} index={3}>
        {data.attendees && (
          <>
            <Grid
              container
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
                gridAutoRows: "116px"
              }}
            >
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Đã check-in"
                  value={data.attendees.totalCheckin || 0}
                  icon={TicketIcon}
                  color="success"
                  format="number"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tỷ lệ check-in"
                  value={parseFloat(((data.attendees.checkinRate || 0) * 100).toFixed(2))}
                  icon={TrendingUpIcon}
                  color="info"
                  format="percent"
                />
              </Grid>
            </Grid>

            <Grid container sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
                alignItems: "stretch"
              }}>
              <Grid item sx={{ height: "100%" }}>
                <ChartWrapper title="Check-in theo sự kiện">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 600 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={600}>
                      <BarChart data={(data.attendees.checkinByEvent || []).map(item => ({
                        ...item,
                        eventNameTruncated: item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName
                      }))} margin={{ right: 30, left: 0, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="eventNameTruncated" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => value === null ? '-' : value.toLocaleString('vi-VN')}
                          labelFormatter={(label) => {
                            const fullItem = data.attendees.checkinByEvent.find(item => {
                              const truncated = item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName;
                              return truncated === label;
                            });
                            return fullItem ? `Sự kiện: ${fullItem.eventName}` : `Sự kiện: ${label}`;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="totalTickets" fill="#667eea" name="Tổng vé" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="checkedIn" fill="#764ba2" name="Đã check-in" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <ChartWrapper title="Tỷ lệ check-in theo sự kiện">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 600 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={600}>
                      <BarChart data={(data.attendees.checkinByEvent || []).map(item => ({
                        ...item,
                        checkinRatePercent: parseFloat(((item.checkinRate || 0) * 100).toFixed(2)),
                        eventNameTruncated: item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName
                      }))} margin={{ right: 30, left: 0, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="eventNameTruncated" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                        <YAxis label={{ value: 'Tỷ lệ (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value) => value === null ? '-' : `${value.toFixed(2)}%`}
                          labelFormatter={(label) => {
                            const fullItem = data.attendees.checkinByEvent.find(item => {
                              const truncated = item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName;
                              return truncated === label;
                            });
                            return fullItem ? `Sự kiện: ${fullItem.eventName}` : `Sự kiện: ${label}`;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="checkinRatePercent" fill="#43e97b" name="Tỷ lệ check-in" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* Feedback Tab */}
      <TabPanel value={currentTab} index={4}>
        {data.feedback && (
          <>
            <Grid
              container
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(2, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
                gridAutoRows: "116px"
              }}
            >
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Đánh giá TB"
                  value={parseFloat((data.feedback.averageStar || 0).toFixed(2))}
                  icon={FeedbackIcon}
                  color="warning"
                  format="number"
                  subtitle="/ 5.0"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tổng phản hồi"
                  value={data.feedback.totalFeedback || 0}
                  icon={PeopleIcon}
                  color="primary"
                  format="number"
                />
              </Grid>
            </Grid>

            <Grid container sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                  md: "repeat(1, 1fr)",
                },
                gap: 3,
                alignItems: "stretch"
              }}>
              <Grid item sx={{ height: "100%" }}>
                <ChartWrapper title="Đánh giá theo sự kiện">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 600 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={600}>
                      <BarChart data={(data.feedback.feedbackByEvent || []).map(item => ({
                        ...item,
                        eventNameTruncated: item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName
                      }))} margin={{ right: 30, left: 0, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="eventNameTruncated" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => value === null ? '-' : value.toLocaleString('vi-VN')}
                          labelFormatter={(label) => {
                            const fullItem = data.feedback.feedbackByEvent.find(item => {
                              const truncated = item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName;
                              return truncated === label;
                            });
                            return fullItem ? `Sự kiện: ${fullItem.eventName}` : `Sự kiện: ${label}`;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="averageStar" fill="#667eea" name="Đánh giá TB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="feedbackCount" fill="#764ba2" name="Số phản hồi" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* Suppliers Tab */}
      <TabPanel value={currentTab} index={5}>
        {data.suppliers && (
          <>
            <Grid
              container
              sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
                alignItems: "stretch",
                gridAutoRows: "116px"
              }}
            >
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tổng nguồn cung"
                  value={parseFloat((data.suppliers.totalSupplies || 0).toFixed(2))}
                  icon={SupplierIcon}
                  color="primary"
                  format="number"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tổng báo giá"
                  value={parseFloat((data.suppliers.totalQuotes || 0).toFixed(2))}
                  icon={EventIcon}
                  color="info"
                  format="number"
                />
              </Grid>
              <Grid item sx={{ height: "100%" }}>
                <KpiCard sx={{ height: "100%" }}
                  title="Tổng chi tiêu"
                  value={parseFloat((data.suppliers.totalSpent || 0).toFixed(2))}
                  icon={MoneyIcon}
                  color="success"
                  format="currency"
                />
              </Grid>
            </Grid>

            <Grid container sx={{
                mb: 4,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(1, 1fr)",
                  md: "repeat(1, 1fr)",
                },
                gap: 3,
                alignItems: "stretch"
              }}>
              <Grid item sx={{ height: "100%" }}>
                <ChartWrapper title="Nguồn cung theo sự kiện">
                  <Box sx={{ width: '100%', height: { xs: 400, md: 600 }, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height={600}>
                      <BarChart data={(data.suppliers.eventSupplierStatistics || []).map(item => ({
                        ...item,
                        eventNameTruncated: item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName
                      }))} margin={{ right: 100, left: 0, bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="eventNameTruncated" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" label={{ value: 'Tổng nguồn cung', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Tổng chi tiêu (VND)', angle: 90, position: 'insideRight', offset: -30 }} />
                        <Tooltip 
                          formatter={(value) => {
                            if (value === null) return '-';
                            return value.toLocaleString('vi-VN');
                          }}
                          labelFormatter={(label) => {
                            const fullItem = data.suppliers.eventSupplierStatistics.find(item => {
                              const truncated = item.eventName.length > 45 ? item.eventName.substring(0, 42) + '...' : item.eventName;
                              return truncated === label;
                            });
                            return fullItem ? `Sự kiện: ${fullItem.eventName}` : `Sự kiện: ${label}`;
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar yAxisId="left" dataKey="totalSupplies" fill="#667eea" name="Tổng nguồn cung" radius={[4, 4, 0, 0]} width={30} />
                        <Bar yAxisId="right" dataKey="totalSpent" fill="#764ba2" name="Tổng chi tiêu" radius={[4, 4, 0, 0]} width={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartWrapper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>
    </Box>
  );
}