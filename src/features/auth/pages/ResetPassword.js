import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import theme from '../../../theme';
import authApi from '../api/auth.api';
import EventMALogo from '../../../assets/images/EventMAlogo.png';
import BackGround from '../../../assets/images/BackGround.png';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2.5),
  margin: 'auto',
  borderRadius: theme.spacing(3),
  backgroundColor: 'background.paper',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    'hsla(220, 30%, 5%, 0.1) 0px 10px 30px 0px, hsla(220, 25%, 10%, 0.1) 0px 20px 60px -10px',
  [theme.breakpoints.up('xs')]: {
    width: '95%',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
  },
  [theme.breakpoints.up('sm')]: {
    width: '90%',
    maxWidth: '450px',
    padding: theme.spacing(3.5),
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.up('md')]: {
    width: '85%',
    maxWidth: '500px',
    padding: theme.spacing(4),
    gap: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    width: '80%',
    maxWidth: '520px',
    padding: theme.spacing(4.5),
    gap: theme.spacing(3),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      'hsla(220, 30%, 5%, 0.7) 0px 10px 30px 0px, hsla(220, 25%, 10%, 0.15) 0px 20px 60px -10px',
  }),
}));

const ResetPasswordContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(1),
  position: 'relative',
  [theme.breakpoints.up('xs')]: {
    padding: theme.spacing(0.5),
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(3),
  },
}));

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [otpError, setOtpError] = React.useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get email from location state or use a default
  const email = location.state?.email || 'your@email.com';

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (otpError || passwordError || confirmPasswordError) {
      return;
    }
    
    setIsSubmitting(true);
    
    const data = new FormData(event.currentTarget);
    const otp = data.get('otp');
    const password = data.get('password');
    
    try {
      await authApi.resetPassword(email, otp, password);
      
      // Navigate to sign in page after successful password reset
      navigate('/signin', {
        state: { message: 'Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.' }
      });
    } catch (error) {
      console.error('Reset password error:', error);
      setOtpError(true);
      setOtpErrorMessage('Mã OTP không hợp lệ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateInputs = () => {
    const otp = document.getElementById('otp');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    let isValid = true;

    // Validate OTP
    if (!otp.value || otp.value.length !== 6) {
      setOtpError(true);
      setOtpErrorMessage('Vui lòng nhập mã OTP 6 số.');
      isValid = false;
    } else {
      setOtpError(false);
      setOtpErrorMessage('');
    }

    // Validate password
    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    // Validate confirm password
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Mật khẩu xác nhận không khớp.');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      await authApi.resendOtp(email);
      setResendMessage('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setResendMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundImage: `url(${BackGround})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: theme.palette.mode === 'dark' ? 0.2 : 0.3,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))'
              : 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
          },
        }}
      />
      <ResetPasswordContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Box sx={{ textAlign: 'center', mb: theme.spacing(4) }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: theme.spacing(3),
            }}>
              <img 
                src={EventMALogo} 
                alt="EventMA Logo" 
                style={{
                  height: 'auto',
                  maxWidth: '100px',
                  width: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h4"
              sx={{ 
                width: '100%', 
                fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', 
                mb: theme.spacing(1),
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              Đặt lại mật khẩu
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9375rem',
                fontWeight: 400,
              }}
            >
              Chúng tôi đã gửi mã OTP đến email: <strong>{email}</strong>
            </Typography>
          </Box>
          
          {resendMessage && (
            <Alert severity={resendMessage.includes('không thể') ? 'error' : 'success'} sx={{ mb: theme.spacing(2) }}>
              {resendMessage}
            </Alert>
          )}
          
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: theme.spacing(2),
            }}
          >
            <FormControl fullWidth>
              <FormLabel htmlFor="otp" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Mã OTP
              </FormLabel>
              <TextField
                error={otpError}
                helperText={otpErrorMessage}
                id="otp"
                name="otp"
                placeholder="Nhập mã OTP"
                autoComplete="one-time-code"
                required
                fullWidth
                variant="outlined"
                color={otpError ? 'error' : 'primary'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon 
                        sx={{ 
                          color: otpError ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                    letterSpacing: '0.2em'
                  }
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
            </FormControl>
           
            <FormControl fullWidth>
              <FormLabel htmlFor="password" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Mật khẩu mới
              </FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        sx={{ 
                          color: passwordError ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{
                          color: 'action.active',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
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
                    paddingRight: theme.spacing(0.5),
                  }
                }}
              />
            </FormControl>
           
            <FormControl fullWidth>
              <FormLabel htmlFor="confirmPassword" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Xác nhận mật khẩu mới
              </FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={confirmPasswordError ? 'error' : 'primary'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        sx={{ 
                          color: confirmPasswordError ? 'error.main' : 'action.active',
                          fontSize: 20
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{
                          color: 'action.active',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
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
                    paddingRight: theme.spacing(0.5),
                  }
                }}
              />
            </FormControl>
           
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
              disabled={isSubmitting}
              sx={{
                mt: theme.spacing(1),
                py: theme.spacing(1.75),
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0px 4px 14px rgba(25, 118, 210, 0.4)',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  boxShadow: '0px 6px 20px rgba(25, 118, 210, 0.5)',
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
                '&:disabled': {
                  boxShadow: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  opacity: 0.6,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
           
            <Box sx={{ textAlign: 'center', mt: theme.spacing(1) }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Không nhận được mã?{' '}
                <Button
                  variant="text"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {isResending ? 'Đang gửi...' : 'Gửi lại'}
                </Button>
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              textAlign: 'center', 
              mt: theme.spacing(3),
              pt: theme.spacing(2.5),
              pb: theme.spacing(1),
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              <Button
                variant="text"
                onClick={() => navigate('/signin')}
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'primary.main',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  }
                }}
              >
                Quay lại đăng nhập
              </Button>
            </Typography>
          </Box>
        </Card>
      </ResetPasswordContainer>
    </>
  );
}