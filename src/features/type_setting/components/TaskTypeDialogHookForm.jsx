import React, { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  TextField,
  Chip,
  Select,
  MenuItem,
} from "@mui/material";

// Color palette presets
const COLOR_PRESETS = [
  '#9E9E9E', '#3F51B5', '#42A5F5', '#81C784',
  '#FFB300', '#E53935', '#D84315', '#43A047'
];

// ColorBox component - memoized
const ColorBox = React.memo(({ color, selected, onClick }) => (
  <Box
    onClick={() => onClick(color)}
    sx={{
      width: 56,
      height: 56,
      borderRadius: 2,
      bgcolor: color,
      cursor: 'pointer',
      border: selected ? '2px solid #f48d33ff' : '2px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      color: '#fff',
      '&:hover': { opacity: 0.85 },
      transition: 'all 0.15s ease'
    }}
  />
), (prevProps, nextProps) => {
  return prevProps.color === nextProps.color && prevProps.selected === nextProps.selected;
});

// ColorPicker component - memoized
const ColorPicker = React.memo(({ selectedColor, onColorSelect, currentColor }) => {
  const handleColorChange = useCallback((e) => {
    onColorSelect(e.target.value);
  }, [onColorSelect]);

  return (
    <Box>
      <Typography fontWeight={600} sx={{ mb: 1, fontSize: '0.9rem' }}>
        Chọn màu
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {COLOR_PRESETS.map((c) => (
          <ColorBox
            key={c}
            color={c}
            selected={currentColor === c}
            onClick={onColorSelect}
          />
        ))}
      </Box>

      <input
        id="hidden-color-input"
        type="color"
        value={currentColor}
        onChange={handleColorChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}, (prevProps, nextProps) => {
  return prevProps.selectedColor === nextProps.selectedColor && prevProps.currentColor === nextProps.currentColor;
});

// PreviousTypeMultiSelect component - memoized with dropdown
const PreviousTypeMultiSelect = React.memo(({ availableTypes, selectedTypeIds, onSelectionChange }) => {
  const handleSelectChange = useCallback((event) => {
    const value = event.target.value;
    onSelectionChange(typeof value === 'string' ? value.split(',') : value);
  }, [onSelectionChange]);

  return (
    <Box>
      <Typography fontWeight={600} sx={{ mb: 1, fontSize: '0.9rem' }}>
        Loại công việc có thể chuyển từ
      </Typography>

      {/* Dropdown Select with Chips Display */}
      <Select
        multiple
        value={selectedTypeIds}
        onChange={handleSelectChange}
        displayEmpty
        sx={{
          width: '100%',
          borderRadius: 1.5,
          minHeight: '60px',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f48d33ff',
            borderWidth: 2,
          },
        }}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return <Typography sx={{ color: '#999' }}>Tất cả loại công việc</Typography>;
          }
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((typeId) => {
                const type = availableTypes.find(t => t.id === typeId);
                return (
                  <Chip
                    key={typeId}
                    label={type?.name || `Type ${typeId}`}
                    size="small"
                    sx={{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': {
                        display: 'none',
                      },
                    }}
                  />
                );
              })}
            </Box>
          );
        }}
      >
        {availableTypes.map((type) => (
          <MenuItem key={type.id} value={type.id}>
            {type.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.selectedTypeIds.length === nextProps.selectedTypeIds.length &&
    prevProps.selectedTypeIds.every((id, idx) => id === nextProps.selectedTypeIds[idx]) &&
    prevProps.availableTypes.length === nextProps.availableTypes.length
  );
});

// Memoized TextField wrapper for react-hook-form
const FormTextField = React.memo(({ 
  label, 
  placeholder, 
  multiline = false, 
  rows = 1,
  field 
}, ref) => (
  <TextField
    ref={ref}
    label={label}
    placeholder={placeholder}
    multiline={multiline}
    rows={rows}
    fullWidth
    variant="outlined"
    size="medium"
    {...field}
    slotProps={{
      input: {
        sx: {
          borderRadius: 1.5,
          "&.MuiInputLabel-shrink": {
            fontSize: "0.9rem",
          },
          '&.Mui-focused fieldset': {
            borderColor: '#f48d33ff',
            borderWidth: 2,
          },
        },
      },
      inputLabel: {
        sx: {
          fontSize: '0.9rem',
        },
      },
    }}
  />
));

FormTextField.displayName = 'FormTextField';

const TaskTypeDialogHookForm = React.memo(({
  open,
  onClose,
  onSubmit,
  editingTaskType,
  submitting,
  register,
  watch,
  setValue,
  taskTypeName,
  taskTypeColor,
}) => {
  const theme = useTheme();

  const handleColorSelect = useCallback((color) => {
    setValue('taskTypeColor', color);
  }, [setValue]);

  const handleSaveClick = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  const isNameEmpty = !taskTypeName || !taskTypeName.trim();
  const isDisabled = submitting || isNameEmpty;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.4rem',
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        {editingTaskType ? "Chỉnh sửa loại công việc" : "Thêm loại công việc mới"}
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Tên */}
          <FormTextField
            label="Tên loại công việc"
            placeholder="Ví dụ: Thiết kế poster"
            field={register('taskTypeName', { required: true })}
          />

          {/* Chọn màu */}
          <ColorPicker
            selectedColor={taskTypeColor}
            onColorSelect={handleColorSelect}
            currentColor={taskTypeColor}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2,
          pb: 2,
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 1.5
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          disabled={isDisabled}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            padding: 1,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          {submitting ? "Đang lưu..." : editingTaskType ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

TaskTypeDialogHookForm.displayName = 'TaskTypeDialogHookForm';

export default TaskTypeDialogHookForm;
