import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  styled,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  ConfirmationNumber as TicketIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';
import checkinApi from '../api/checkin.api';
import ticketApi from '../api/ticket.api';
import { formatDateTime } from '../../../shared/utils/dateFormatter';
import { CommonTable } from '../../../shared/components/CommonTable';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderRadius: theme.spacing(2),
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const StatIcon = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.75rem',
}));

const StatContent = styled(Box)(() => ({
  flex: 1,
}));

export default function EventCheckinHistory({ eventId, enterpriseId, eventData }) {
  const [checkinList, setCheckinList] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Statistics
  const [totalSold, setTotalSold] = useState(0);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);

  // Fetch ticket types and total sold tickets
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ticket types
        const typesResponse = await ticketApi.getTicketTypes(eventId);
        const types = typesResponse.data || typesResponse || [];
        setTicketTypes(types);
        
        // Fetch all sold tickets to get total count
        const ticketsResponse = await ticketApi.getEventTickets(eventId, { page: 0, size: 1 });
        const ticketsData = ticketsResponse.data || ticketsResponse;
        const totalSoldCount = ticketsData.totalElements || 0;
        setTotalSold(totalSoldCount);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  // Fetch check-in list
  useEffect(() => {
    fetchCheckinList();
  }, [eventId, page, rowsPerPage, searchKeyword, selectedTicketType]);

  const fetchCheckinList = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const params = {
        page: page,
        size: rowsPerPage,
      };

      if (searchKeyword) {
        params.keyword = searchKeyword;
      }

      if (selectedTicketType) {
        params.ticketTypeId = selectedTicketType;
      }

      const response = await checkinApi.getCheckedInTickets(eventId, params);
      const data = response.data || response;
      
      setCheckinList(data.content || data || []);
      setTotalElements(data.totalElements || data.length || 0);
      setTotalCheckedIn(data.totalElements || data.length || 0);
    } catch (err) {
      console.error('Error fetching check-in list:', err);
      setCheckinList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
    setPage(0);
  };

  const handleTicketTypeChange = (event) => {
    setSelectedTicketType(event.target.value);
    setPage(0);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const checkInRate = totalSold > 0 ? ((totalCheckedIn / totalSold) * 100).toFixed(1) : 0;

  const columns = [
    {
      field: 'stt',
      headerName: 'STT',
      width: 50,
      render: (value, row, index) => page * rowsPerPage + index + 1,
    },
    {
      field: 'code',
      headerName: 'Mã vé',
      render: (value, row) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {value || `#${row.id}`}
        </Typography>
      ),
    },
    {
      field: 'owner',
      headerName: 'Chủ vé',
      render: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value?.name || '-'}
        </Typography>
      ),
    },
    {
      field: 'ownerEmail',
      headerName: 'Email',
      render: (value, row) => (
        <Typography variant="body2">
          {row.owner?.email || '-'}
        </Typography>
      ),
    },
    {
      field: 'ownerPhone',
      headerName: 'Số điện thoại',
      render: (value, row) => (
        <Typography variant="body2">
          {row.owner?.phone || '-'}
        </Typography>
      ),
    },
    {
      field: 'checkedInBy',
      headerName: 'Người check-in',
      render: (value) => (
        <Typography variant="body2">
          {value?.name || '-'}
        </Typography>
      ),
    },
    {
      field: 'purchasedAt',
      headerName: 'Thời gian mua',
      render: (value) => (
        <Typography variant="body2">
          {formatDateTime(value)}
        </Typography>
      ),
    },
    {
      field: 'usedAt',
      headerName: 'Thời gian check-in',
      render: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {formatDateTime(value)}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
     

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 2 }}>
              <StatBox>
                <StatIcon sx={{ backgroundColor: alpha('#2196F3', 0.1), color: '#2196F3' }}>
                  <TicketIcon fontSize="large" />
                </StatIcon>
                <StatContent>
                  <Typography variant="body2" color="text.secondary">
                    Tổng vé đã bán
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalSold.toLocaleString()}
                  </Typography>
                </StatContent>
              </StatBox>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 2 }}>
              <StatBox>
                <StatIcon sx={{ backgroundColor: alpha('#4CAF50', 0.1), color: '#4CAF50' }}>
                  <CheckCircleIcon fontSize="large" />
                </StatIcon>
                <StatContent>
                  <Typography variant="body2" color="text.secondary">
                    Đã check-in
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalCheckedIn.toLocaleString()}
                  </Typography>
                </StatContent>
              </StatBox>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent sx={{ p: 2 }}>
              <StatBox>
                <StatIcon sx={{ backgroundColor: alpha('#FF9800', 0.1), color: '#FF9800' }}>
                  <EventAvailableIcon fontSize="large" />
                </StatIcon>
                <StatContent>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ check-in
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {checkInRate}%
                  </Typography>
                </StatContent>
              </StatBox>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Filters */}
      {/* <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm khách "
              value={searchKeyword}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
        </Grid>
      </Paper> */}

      {/* Table */}
      <CommonTable
        columns={columns}
        data={checkinList}
        loading={loading}
        rowsPerPage={rowsPerPage}
        page={page}
        totalCount={totalElements}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyMessage="Chưa có dữ liệu check-in"
        maxHeight="600px"
      />
    </Box>
  );
}
