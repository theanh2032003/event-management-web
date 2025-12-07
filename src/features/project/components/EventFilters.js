import React from "react";
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Button,
  styled,
  alpha,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: 0,
  borderRadius: 0,
  boxShadow: 'none',
  border: 'none',
  background: 'transparent',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.8),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.8),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const ClearButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  },
}));

const ResultCountBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

/**
 * EventFilters - Component cho search và filter events
 */
const EventFilters = ({
  searchTerm,
  setSearchTerm,
  filterState,
  setFilterState,
  filterFeeType,
  setFilterFeeType,
  filterCategory,
  setFilterCategory,
  loading,
  eventsCount,
  filteredCount,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchTerm ||
    filterState !== "ALL" ||
    filterFeeType !== "ALL" ||
    filterCategory !== "ALL";

  return (
    <StyledPaper>
      <Grid container spacing={2}>
        {/* Search by name */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledTextField
            fullWidth
            size="small"
            placeholder="Nhập tên sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Filter by State */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledFormControl fullWidth size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterState}
              label="Trạng thái"
              onChange={(e) => setFilterState(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
              <MenuItem value="NOT_STARTED">Chưa bắt đầu</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang diễn ra</MenuItem>
              <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
              <MenuItem value="CANCELED">Đã hủy</MenuItem>
            </Select>
          </StyledFormControl>
        </Grid>

        {/* Filter by Fee Type */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledFormControl fullWidth size="small">
            <InputLabel>Loại phí</InputLabel>
            <Select
              value={filterFeeType}
              label="Loại phí"
              onChange={(e) => setFilterFeeType(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="ALL">Tất cả loại phí</MenuItem>
              <MenuItem value="FREE">Miễn phí</MenuItem>
              <MenuItem value="PAID">Trả phí</MenuItem>
            </Select>
          </StyledFormControl>
        </Grid>

        {/* Filter by Category */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledFormControl fullWidth size="small">
            <InputLabel>Loại sự kiện</InputLabel>
            <Select
              value={filterCategory}
              label="Loại sự kiện"
              onChange={(e) => setFilterCategory(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="ALL">Tất cả loại</MenuItem>
              <MenuItem value="CONFERENCE">Hội nghị</MenuItem>
              <MenuItem value="SEMINAR">Hội thảo</MenuItem>
              <MenuItem value="WORKSHOP">Workshop</MenuItem>
              <MenuItem value="CONCERT">Hòa nhạc</MenuItem>
              <MenuItem value="EXHIBITION">Triển lãm</MenuItem>
              <MenuItem value="FESTIVAL">Lễ hội</MenuItem>
              <MenuItem value="SPORTS">Thể thao</MenuItem>
              <MenuItem value="CULTURAL">Văn hóa</MenuItem>
              <MenuItem value="BUSINESS">Kinh doanh</MenuItem>
              <MenuItem value="EDUCATION">Giáo dục</MenuItem>
              <MenuItem value="CHARITY">Từ thiện</MenuItem>
              <MenuItem value="NETWORKING">Giao lưu</MenuItem>
              <MenuItem value="ENTERTAINMENT">Giải trí</MenuItem>
              <MenuItem value="OTHER">Khác</MenuItem>
            </Select>
          </StyledFormControl>
        </Grid>
      </Grid>

      {/* Results count & Clear button */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {hasActiveFilters && (
          <ClearButton
            size="small"
            onClick={onClearFilters}
            startIcon={<ClearIcon />}
            variant="outlined"
          >
            Xóa bộ lọc
          </ClearButton>
        )}
      </Box>
    </StyledPaper>
  );
};

export default EventFilters;
