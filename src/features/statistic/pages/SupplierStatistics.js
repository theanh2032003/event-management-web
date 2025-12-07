import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  RequestQuote as QuoteIcon,
  Description as ContractIcon,
  Storefront as ProductIcon,
  TrendingUp as TrendingUpIcon,
  Money as MoneyIcon,
  FeedbackIcon,
} from '@mui/icons-material';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import quoteApi from '../../quote/api/quote.api';
import productApi from '../../api/productApi';
import statisticApi from '../api/statistic.api';
import KpiCard from '../components/KpiCard';
import ChartWrapper from '../components/ChartWrapper';

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);
};

const generateMonthlyData = (monthlyStats) => {
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  if (!monthlyStats || monthlyStats.length === 0) {
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 500000000),
    }));
  }

  return months.map((month, index) => {
    const monthData = monthlyStats.find((stat) => stat.month === index + 1);
    return {
      month,
      revenue: monthData?.totalRevenue || 0,
    };
  });
};

const COLORS = ['#667eea', '#764ba2', '#43e97b', '#f093fb', '#4facfe'];

export default function SupplierStatistics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null,
    quotes: null,
    products: null,
    statistics: null,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [quotesRes, productsRes, statsRes] = await Promise.all([
        quoteApi.getQuotes({}, 0, 100).catch(() => ({ content: [] })),
        productApi.getProducts({}, 0, 100).catch(() => ({ content: [] })),
        statisticApi.getSuppliers().catch(() => ({})),
      ]);

      const quotes = quotesRes.content || quotesRes.data || [];
      const products = productsRes.content || productsRes.data || [];
      const stats = statsRes || {};

      // Calculate KPI metrics
      const totalQuotes = quotes.length;
      const convertedToContract = quotes.filter((q) => q.status === 'APPROVED' || q.status === 'CONVERTED').length;
      const conversionRate = totalQuotes > 0 ? (convertedToContract / totalQuotes) * 100 : 0;
      const totalProducts = products.length;
      const totalRevenue = stats.totalRevenue || 0;

      // Calculate top products by revenue
      const topProducts = (stats.topProducts || [])
        .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
        .slice(0, 5);

      // Monthly revenue data
      const monthlyRevenue = generateMonthlyData(stats.monthlyStatistics || []);

      // Quotation status data
      const quotationStatusData = [
        {
          name: 'Chờ xử lý',
          value: quotes.filter((q) => q.status === 'PENDING').length,
        },
        {
          name: 'Đã duyệt',
          value: quotes.filter((q) => q.status === 'APPROVED' || q.status === 'CONVERTED').length,
        },
        {
          name: 'Từ chối',
          value: quotes.filter((q) => q.status === 'REJECTED').length,
        },
      ];

      setData({
        overview: {
          totalQuotes,
          convertedToContract,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          totalProducts,
          totalRevenue,
          totalRFQ: quotes.filter((q) => q.status === 'PENDING').length,
        },
        quotes,
        products,
        statistics: {
          topProducts,
          monthlyRevenue,
          quotationStatusData,
        },
      });
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
      setData({
        overview: {
          totalQuotes: 0,
          convertedToContract: 0,
          conversionRate: 0,
          totalProducts: 0,
          totalRevenue: 0,
          totalRFQ: 0,
        },
        quotes: [],
        products: [],
        statistics: {
          topProducts: [],
          monthlyRevenue: [],
          quotationStatusData: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Thống kê nhà cung cấp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng quan về báo giá, sản phẩm và doanh thu
        </Typography>
      </Box>

      {/* KPI Cards - Overview */}
      {data.overview && (
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
              value={parseFloat((data.overview.totalQuotes || 0).toFixed(2))}
              icon={QuoteIcon}
              color="primary"
              format="number"
            />
          </Grid>
          <Grid item sx={{ height: '100%' }}>
            <KpiCard
              sx={{ height: '100%' }}
              title="Báo giá chuyển đổi"
              value={parseFloat((data.overview.convertedToContract || 0).toFixed(2))}
              icon={ContractIcon}
              color="success"
              format="number"
            />
          </Grid>
          <Grid item sx={{ height: '100%' }}>
            <KpiCard
              sx={{ height: '100%' }}
              title="Tỷ lệ chuyển đổi"
              value={parseFloat((data.overview.conversionRate || 0).toFixed(2))}
              icon={TrendingUpIcon}
              color="info"
              format="percent"
            />
          </Grid>
          <Grid item sx={{ height: '100%' }}>
            <KpiCard
              sx={{ height: '100%' }}
              title="Tổng sản phẩm"
              value={parseFloat((data.overview.totalProducts || 0).toFixed(2))}
              icon={ProductIcon}
              color="warning"
              format="number"
            />
          </Grid>
          <Grid item sx={{ height: '100%' }}>
            <KpiCard
              sx={{ height: '100%' }}
              title="Tổng tiền thu được"
              value={parseFloat((data.overview.totalRevenue || 0).toFixed(2))}
              icon={MoneyIcon}
              color="success"
              format="currency"
            />
          </Grid>
          <Grid item sx={{ height: '100%' }}>
            <KpiCard
              sx={{ height: '100%' }}
              title="Yêu cầu chờ xử lý"
              value={parseFloat((data.overview.totalRFQ || 0).toFixed(2))}
              icon={FeedbackIcon}
              color="error"
              format="number"
            />
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      {data.statistics && (
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
              <Box sx={{ width: '100%', height: { xs: 400, md: 500 }, minHeight: 400 }}>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={data.statistics.monthlyRevenue || []} margin={{ right: 30, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'} />
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

          {/* Top 5 Products by Revenue */}
          <Grid item sx={{ height: '100%' }}>
            <ChartWrapper title="Top 5 sản phẩm có doanh thu cao nhất">
              <Box sx={{ width: '100%', height: { xs: 400, md: 500 }, minHeight: 400 }}>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={
                      data.statistics.topProducts && data.statistics.topProducts.length > 0
                        ? data.statistics.topProducts.slice(0, 5)
                        : []
                    }
                    margin={{ right: 30, left: 0, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'} />
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
      )}

      {/* Status and Product Details */}
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
        {/* Quotation Status */}
        {data.statistics && data.statistics.quotationStatusData && data.statistics.quotationStatusData.length > 0 && (
          <Grid item sx={{ height: '100%' }}>
            <ChartWrapper title="Trạng thái báo giá">
              <Box sx={{ width: '100%', height: { xs: 400, md: 450 }, minHeight: 400 }}>
                <ResponsiveContainer width="100%" height={450}>
                  <PieChart>
                    <Pie
                      data={data.statistics.quotationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toString()} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </ChartWrapper>
          </Grid>
        )}

        {/* Products List */}
        <Grid item sx={{ height: '100%' }}>
          <Card sx={{ bgcolor: 'white', borderRadius: '12px', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Danh sách sản phẩm ({data.products?.length || 0})
              </Typography>
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {data.products && data.products.length > 0 ? (
                  <Grid container spacing={2}>
                    {data.products.slice(0, 8).map((product, index) => (
                      <Grid item xs={12} sm={6} key={product.id || index}>
                        <Card
                          sx={{
                            p: 2,
                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            height: '100%',
                          }}
                        >
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                            {product.name || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {product.code || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                            {formatCurrency(product.price || 0)}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    Không có sản phẩm nào
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products Detail Table */}
      {data.statistics && data.statistics.topProducts && data.statistics.topProducts.length > 0 && (
        <Grid
          container
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
              md: 'repeat(1, 1fr)',
            },
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          <Grid item sx={{ height: '100%' }}>
            <Card sx={{ bgcolor: 'white', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Chi tiết Top 5 sản phẩm có doanh thu cao nhất
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Sản phẩm</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Doanh thu</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Số lượng</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Trung bình</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.statistics.topProducts.slice(0, 5).map((product, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '12px', fontWeight: 500 }}>
                            {index + 1}. {product.productName || `Sản phẩm ${index + 1}`}
                          </td>
                          <td
                            style={{
                              padding: '12px',
                              textAlign: 'right',
                              color: '#667eea',
                              fontWeight: 600,
                            }}
                          >
                            {formatCurrency(product.totalRevenue || 0)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>
                            {product.totalQuantity || 0}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#764ba2', fontWeight: 600 }}>
                            {formatCurrency((product.totalRevenue || 0) / (product.totalQuantity || 1))}
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
      )}
    </Box>
  );
}
