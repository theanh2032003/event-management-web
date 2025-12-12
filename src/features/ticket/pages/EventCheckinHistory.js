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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  '& .MuiTableCell-head': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const checkInRate = totalSold > 0 ? ((totalCheckedIn / totalSold) * 100).toFixed(1) : 0;

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
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Mã vé</TableCell>
              <TableCell>Chủ vé</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Người check-in</TableCell>
              <TableCell>Thời gian mua</TableCell>
              <TableCell>Thời gian check-in</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : checkinList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu check-in
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              checkinList.map((ticket, index) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {ticket.code || `#${ticket.id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {ticket.owner?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ticket.owner?.email || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ticket.owner?.phone || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ticket.checkedInBy?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(ticket.purchasedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDateTime(ticket.usedAt)}
                    </Typography>
                  </TableCell>
                
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} trong ${count !== -1 ? count : `nhiều hơn ${to}`}`
          }
        />
      </StyledTableContainer>
    </Box>
  );
}
