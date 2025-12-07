import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EmailIcon from '@mui/icons-material/Email';
import { useTheme } from '@mui/material/styles';

function ForgotPassword({ open, handleClose }) {
  const theme = useTheme();
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            handleClose();
          },
          sx: { 
            backgroundImage: 'none',
            borderRadius: theme.spacing(3),
            minWidth: '400px',
            [theme.breakpoints.down('sm')]: {
              minWidth: '90%',
              margin: theme.spacing(2),
            },
          },
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 600,
          pb: theme.spacing(1),
        }}
      >
        Đặt lại mật khẩu
      </DialogTitle>
      <DialogContent
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: theme.spacing(2.5),
          pt: theme.spacing(2),
        }}
      >
        <DialogContentText sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          Vui lòng nhập địa chỉ email để đặt lại mật khẩu mới
        </DialogContentText>
        <TextField
          autoFocus
          required
          id="email"
          name="email"
          placeholder="your@email.com"
          type="email"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon 
                  sx={{ 
                    color: 'action.active',
                    fontSize: 20
                  }} 
                />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
              },
            },
            '& .MuiInputBase-input': {
              paddingLeft: theme.spacing(1),
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ 
        pb: theme.spacing(3), 
        px: theme.spacing(3),
        gap: theme.spacing(1),
      }}>
        <Button 
          onClick={handleClose}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Hủy
        </Button>
        <Button 
          variant="contained" 
          type="submit"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: theme.spacing(3),
            boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0px 6px 16px rgba(25, 118, 210, 0.4)',
            },
          }}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
