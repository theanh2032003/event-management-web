import React from 'react';
import {
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Box,
  Typography,
  styled,
  alpha,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputBase,
  Stack,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

// Styled TableCell with larger font
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.9rem', // Default font size, can be overridden by cellSx
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  padding: theme.spacing(1.5),
  backgroundColor: '#ffffffff',
  fontSize: '0.9rem', // Default font size, can be overridden by headerCellSx
}));

// Styled select to match MUI look but compact
const CompactSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '6px 10px',
    fontSize: '0.95rem',
    minWidth: 56,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
}));

// Pill button for page numbers
const PagePill = styled(Button)(({ theme, active }) => ({
  minWidth: 36,
  height: 36,
  borderRadius: '50%',
  padding: '6px 10px',
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: 'none',
  border: 'none',
  backgroundColor: active ? '#e0e0e0' : 'transparent',
  color: theme.palette.text.primary,
  fontWeight: active ? 600 : 500,
  transition: 'none',

  '&:hover': {
    backgroundColor: active ? '#e0e0e0' : '#f5f5f5',
  },

  '&.Mui-disabled': {
    backgroundColor: '#ffffffff',
    // color: theme.palette.text.primary,
    opacity: 0.7,
  },
}));


// Compact icon button wrapper
const NavIconButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  background: '#ffffffff',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    opacity: 0.7,
  },
}));

// Container
const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  background: theme.palette.background.paper,
  border: '1px solid #f1f1f1',
  borderTop: 'none',
  borderRadius: '0 0 8px 8px',
}));

// Small info text
const InfoText = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

// Custom Pagination Component
const CustomTablePagination = ({ page, pageSize, totalCount, onPageChange, onPageSizeChange }) => {
  const theme = useTheme();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRow = totalCount === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    // pages are 1-based for display
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const current = page + 1;
      const left = Math.max(2, current - 1);
      const right = Math.min(totalPages - 1, current + 1);

      pages.push(1);
      if (left > 2) pages.push('left-ellipsis');
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push('right-ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <PaginationContainer>
      {/* Left: rows per page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Số lượng</Typography>
        <FormControl variant="outlined" size="small">
          <CompactSelect
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
            input={<InputBase />}
            sx={{
              borderRadius: 1,
              background: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.default,
              boxShadow: 'none',
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </CompactSelect>
        </FormControl>
      </Box>

      {/* Middle: info */}
      <InfoText sx={{ flex: 1, textAlign: 'center' }}>
        {startRow}–{endRow} of {totalCount}
      </InfoText>

      {/* Right: page controls */}
      <Stack direction="row" spacing={1} alignItems="center">
        <NavIconButton
          onClick={() => onPageChange?.(Math.max(0, page - 1))}
          disabled={page <= 0}
          aria-label="previous page"
        >
          <ChevronLeftIcon />
        </NavIconButton>

        {pages.map((p, idx) => {
          if (p === 'left-ellipsis' || p === 'right-ellipsis') {
            return (
              <Typography
                key={`ell-${idx}`}
                sx={{
                  minWidth: 32,
                  textAlign: 'center',
                  color: theme.palette.text.secondary,
                  fontSize: '0.95rem',
                }}
              >
                …
              </Typography>
            );
          }

          const isActive = p === page + 1;
          return (
            <PagePill
              key={p}
              onClick={() => onPageChange?.(p - 1)}
              disabled={isActive}
              active={isActive ? 1 : 0}
              variant={isActive ? 'contained' : 'outlined'}
              size="small"
            >
              {p}
            </PagePill>
          );
        })}

        <NavIconButton
          onClick={() => onPageChange?.(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          aria-label="next page"
        >
          <ChevronRightIcon />
        </NavIconButton>
      </Stack>
    </PaginationContainer>
  );
};

/**
 * CommonTable - Table tái sử dụng với pagination, sorting
 * 
 * @param {Array} columns - Mảng config cột: [{field, headerName, width, flex, render, cellSx, headerCellSx}, ...]
 *   - cellSx: object - CSS override cho cell (fontSize, fontWeight, color, etc.)
 *   - headerCellSx: object - CSS override cho header cell (fontSize, fontWeight, color, etc.)
 * @param {Array} data - Mảng dữ liệu
 * @param {boolean} loading - Show loading spinner
 * @param {number} rowsPerPage - Số hàng trên trang
 * @param {number} page - Trang hiện tại
 * @param {number} totalCount - Tổng số record
 * @param {Function} onPageChange - Callback khi thay đổi trang
 * @param {Function} onRowsPerPageChange - Callback khi thay đổi số hàng/trang
 * @param {Function} onRowClick - Callback khi click vào row: (row, rowIndex) => void
 * @param {string} emptyMessage - Thông báo khi không có dữ liệu
 * @param {string|number} height - Chiều cao cố định của table, ví dụ: '500px' hoặc 500
 * @param {string|number} minHeight - Chiều cao tối thiểu, ví dụ: '300px' hoặc 300
 * @param {string|number} maxHeight - Chiều cao tối đa của table (với scroll), ví dụ: '500px' hoặc 500
 */
export const CommonTable = ({
  columns,
  data = [],
  loading = false,
  rowsPerPage = 10,
  page = 0,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
  height = null,
  minHeight = null,
  maxHeight = null,
}) => {
  const handleChangePage = (newPage) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    onRowsPerPageChange?.(newRowsPerPage);
    onPageChange?.(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="textSecondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  // Convert height values to px string if it's a number
  const convertHeight = (val) => 
    val ? (typeof val === 'number' ? `${val}px` : val) : null;
  
  const heightPx = convertHeight(height);
  const minHeightPx = convertHeight(minHeight);
  const maxHeightPx = convertHeight(maxHeight);

  return (
    <Box>
      <Box
        sx={{
          overflow: 'hidden',
          border: `1px solid #f1f1f1`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          ...(heightPx && { height: heightPx }),
          ...(minHeightPx && { minHeight: minHeightPx }),
          ...(maxHeightPx && { maxHeight: maxHeightPx }),
          ...(maxHeightPx && {
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#e0e0e0',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }),
        }}
      >
        <MuiTable stickyHeader={!!maxHeightPx}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableHeadCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{
                    width: column.width,
                    flex: column.flex,
                    minWidth: column.minWidth,
                    ...column.headerCellSx,
                  }}
                >
                  {column.headerName || column.label}
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                hover 
                key={row.id || index}
                onClick={() => onRowClick?.(row, index)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <StyledTableCell
                    key={column.field}
                    align={column.align || 'left'}
                    sx={{
                      width: column.width,
                      flex: column.flex,
                      minWidth: column.minWidth,
                      ...column.cellSx,
                    }}
                  >
                    {column.render
                      ? column.render(row[column.field], row, index)
                      : row[column.field]}
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </Box>
      <CustomTablePagination
        page={page}
        pageSize={rowsPerPage}
        totalCount={totalCount || data.length}
        onPageChange={handleChangePage}
        onPageSizeChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default CommonTable;
