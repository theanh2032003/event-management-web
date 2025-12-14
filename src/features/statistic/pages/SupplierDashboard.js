/**
 * Supplier Dashboard - Trang tổng quan của nhà cung cấp
 * 
 * Hiển thị:
 * - Thống kê tổng quan (sản phẩm, yêu cầu báo giá, hợp đồng, doanh thu)
 * - Biểu đồ doanh thu và top sản phẩm
 * - Quick actions
 * 
 * Responsive: Tự động điều chỉnh layout cho mobile/tablet/desktop
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  styled,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Store as StoreIcon,
  Add as AddIcon,
  RequestQuote as QuoteIcon,
  Description as ContractIcon,
  TrendingUp as TrendingUpIcon,
  Money as MoneyIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);
};

// Mock Data
const MOCK_DATA = {
  overview: {
    totalQuotes: 245,
    convertedToContract: 87,
    conversionRate: 35.51,
    totalProducts: 42,
    totalRevenue: 2750000000,
    totalRFQ: 28,
  },
  monthlyRevenue: [
    { month: 'Tháng 1', revenue: 145000000 },
    { month: 'Tháng 2', revenue: 165000000 },
    { month: 'Tháng 3', revenue: 189000000 },
    { month: 'Tháng 4', revenue: 205000000 },
    { month: 'Tháng 5', revenue: 198000000 },
    { month: 'Tháng 6', revenue: 225000000 },
    { month: 'Tháng 7', revenue: 265000000 },
    { month: 'Tháng 8', revenue: 245000000 },
    { month: 'Tháng 9', revenue: 210000000 },
    { month: 'Tháng 10', revenue: 238000000 },
    { month: 'Tháng 11', revenue: 220000000 },
    { month: 'Tháng 12', revenue: 250000000 },
  ],
  topProducts: [
    { productName: 'Máy quay video 4K', totalRevenue: 450000000, totalQuantity: 85 },
    { productName: 'Hệ thống âm thanh', totalRevenue: 380000000, totalQuantity: 62 },
    { productName: 'Ánh sáng LED sân khấu', totalRevenue: 320000000, totalQuantity: 120 },
    { productName: 'Thiết bị truyền hình', totalRevenue: 280000000, totalQuantity: 45 },
    { productName: 'Bàn trộn kỹ thuật số', totalRevenue: 240000000, totalQuantity: 28 },
  ],
  recentQuotes: [
    { id: 1, quote: 'RFQ-001', status: 'PENDING', value: 125000000, date: '2025-11-25' },
    { id: 2, quote: 'RFQ-002', status: 'APPROVED', value: 85000000, date: '2025-11-24' },
    { id: 3, quote: 'RFQ-003', status: 'PENDING', value: 210000000, date: '2025-11-23' },
    { id: 4, quote: 'RFQ-004', status: 'CONVERTED', value: 95000000, date: '2025-11-22' },
    { id: 5, quote: 'RFQ-005', status: 'REJECTED', value: 45000000, date: '2025-11-21' },
  ],
};

export default function SupplierDashboard() {
  const { id: supplierId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [supplierV1Data, setSupplierV1Data] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch only getSuppliersV1 API
      const v1Data = await statisticApi.getSuppliersV1();
      setSupplierV1Data(v1Data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSupplierV1Data(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'APPROVED':
        return '#4CAF50';
      case 'CONVERTED':
        return '#2196F3';
      case 'REJECTED':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'CONVERTED':
        return 'Đã chuyển đổi';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  // Use API data or fallback to mock data
  const overviewData = {
    totalQuotes: supplierV1Data?.totalQuote || 0,
    convertedToContract: supplierV1Data?.totalQuote || 0,
    conversionRate: supplierV1Data?.conversionRate ? (supplierV1Data.conversionRate * 100) : 0,
    totalProducts: supplierV1Data?.totalProduct || 0,
    totalRevenue: supplierV1Data?.totalRevenue || 0,
    totalRFQ: supplierV1Data?.totalRFQ || 0,
  };

  // Transform monthly revenue from revenueByMonth object
  const monthlyRevenue = supplierV1Data?.revenueByMonth && Object.keys(supplierV1Data.revenueByMonth).length > 0
    ? Object.entries(supplierV1Data.revenueByMonth).map(([month, revenue]) => ({
        month: `Tháng ${month}`,
        revenue: revenue || 0,
      }))
    : MOCK_DATA.monthlyRevenue;

  // Transform top products
  const topProducts = supplierV1Data?.topProducts && supplierV1Data.topProducts.length > 0
    ? supplierV1Data.topProducts.map(product => ({
        productName: product.productName,
        totalRevenue: product.revenue || 0,
        totalQuantity: 0, // API không cung cấp số lượng
      }))
    : MOCK_DATA.topProducts;

  const recentQuotes = MOCK_DATA.recentQuotes;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>

      {/* KPI Cards */}
      <Grid
        container
        sx={{
          mb: 4,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          alignItems: 'stretch',
          gridAutoRows: '116px',
        }}
      >
        <Grid item sx={{ height: '100%' }}>
          <KpiCard
            sx={{ height: '100%' }}
            title="Tổng yêu cầu báo giá"
            value={parseFloat((overviewData?.totalQuotes || 0).toFixed(2))}
            icon={QuoteIcon}
            color="primary"
            format="number"
          />
        </Grid>
        <Grid item sx={{ height: '100%' }}>
          <KpiCard
            sx={{ height: '100%' }}
            title="Báo giá chuyển đổi"
            value={parseFloat((overviewData?.convertedToContract || 0).toFixed(2))}
            icon={ContractIcon}
            color="success"
            format="number"
          />
        </Grid>
        <Grid item sx={{ height: '100%' }}>
          <KpiCard
            sx={{ height: '100%' }}
            title="Tỷ lệ chuyển đổi"
            value={parseFloat((overviewData?.conversionRate || 0).toFixed(2))}
            icon={TrendingUpIcon}
            color="info"
            format="percent"
          />
        </Grid>
        <Grid item sx={{ height: '100%' }}>
          <KpiCard
            sx={{ height: '100%' }}
            title="Tổng sản phẩm"
            value={parseFloat((overviewData?.totalProducts || 0).toFixed(2))}
            icon={StoreIcon}
            color="warning"
            format="number"
          />
        </Grid>
        <Grid item sx={{ height: '100%' }}>
          <KpiCard
            sx={{ height: '100%' }}
            title="Tổng tiền thu được"
            value={parseFloat((overviewData?.totalRevenue || 0).toFixed(2))}
            icon={MoneyIcon}
            color="success"
            format="currency"
          />
        </Grid>
        <Grid item sx={{ height: '100%' }}>
          <KpiCard
            sx={{ height: '100%' }}
            title="Yêu cầu chờ xử lý"
            value={parseFloat((overviewData?.totalRFQ || 0).toFixed(2))}
            icon={QuoteIcon}
            color="error"
            format="number"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid
        container
        sx={{
          mb: 4,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        {/* Monthly Revenue Chart */}
        <Grid item sx={{ height: '100%' }}>
          <ChartWrapper title="Doanh thu các tháng trong năm">
            <Box sx={{ width: '100%', height: { xs: 350, md: 400 }, minHeight: 350 }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyRevenue} margin={{ right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#667eea"
                    name="Doanh thu"
                    strokeWidth={2}
                    dot={{ fill: '#667eea', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartWrapper>
        </Grid>

        {/* Top 5 Products */}
        <Grid item sx={{ height: '100%' }}>
          <ChartWrapper title="Top 5 sản phẩm có doanh thu cao nhất">
            <Box sx={{ width: '100%', height: { xs: 350, md: 400 }, minHeight: 350 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts} margin={{ right: 30, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="productName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis tickFormatter={(value) => (value / 1000000).toFixed(0) + 'M'} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#667eea" name="Doanh thu" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalQuantity" fill="#764ba2" name="Số lượng" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartWrapper>
        </Grid>
      </Grid>

      {/* Recent Quotes and Quick Actions */}
      <Grid
        container
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* Recent Quotes Table */}
        <Grid item>
          <Card sx={{ bgcolor: 'white', borderRadius: '12px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Báo giá gần đây
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#666' }}>
                        Mã báo giá
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#666' }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#666' }}>
                        Giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotes.map((quote) => (
                      <tr key={quote.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: 500 }}>{quote.quote}</td>
                        <td style={{ padding: '12px' }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '4px',
                              backgroundColor: getStatusColor(quote.status) + '20',
                              color: getStatusColor(quote.status),
                              fontWeight: 600,
                              fontSize: '0.8rem',
                            }}
                          >
                            {getStatusLabel(quote.status)}
                          </Box>
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'right',
                            color: '#667eea',
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(quote.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}

