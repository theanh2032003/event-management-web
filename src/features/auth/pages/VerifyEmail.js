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

const VerifyContainer = styled(Stack)(({ theme }) => ({
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

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [otpError, setOtpError] = React.useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = React.useState('');
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [countdown, setCountdown] = React.useState(120); // 2 phút = 120 giây
  const [startCountdown, setStartCountdown] = React.useState(true); // Bắt đầu đếm ngược khi component mount
  const timerRef = React.useRef(null);
  
  // Get email from location state or use a default
  const email = location.state?.email || 'your@email.com';
  const successMessage = location.state?.message;

  // Hàm format thời gian từ giây sang MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Đếm ngược
  React.useEffect(() => {
    // Clear timer cũ nếu có
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!startCountdown) {
      return;
    }

    // Tạo timer mới để đếm ngược
    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          // Dừng timer khi countdown về 0
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setStartCountdown(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startCountdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (otpError) {
      return;
    }
    
    setIsVerifying(true);
    
    const data = new FormData(event.currentTarget);
    const otp = data.get('otp');
    
    try {
      await authApi.verifyOtp(email, otp);
      
      // Navigate to sign in page after successful verification
      navigate('/signin', {
        state: { message: 'Tài khoản đã được xác thực thành công! Vui lòng đăng nhập.' }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError(true);
      setOtpErrorMessage('Mã OTP không hợp lệ. Vui lòng thử lại.');
    } finally {
      setIsVerifying(false);
    }
  };

  const validateInputs = () => {
    const otp = document.getElementById('otp');
    let isValid = true;

    if (!otp.value || otp.value.length !== 6) {
      setOtpError(true);
      setOtpErrorMessage('Vui lòng nhập mã OTP 6 số.');
      isValid = false;
    } else {
      setOtpError(false);
      setOtpErrorMessage('');
    }

    return isValid;
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      await authApi.resendOtp(email);
      setResendMessage('Mã OTP mới đã được gửi đến email của bạn.');
      // Reset và bắt đầu đếm ngược 2 phút sau khi gửi thành công
      setCountdown(120);
      setStartCountdown(true);
    } catch (error) {
      console.error('Resend OTP error:', error);
      setResendMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
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
      <VerifyContainer direction="column" justifyContent="center">
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
              Xác thực tài khoản
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9375rem',
                fontWeight: 400,
              }}
            >
              Chúng tôi đã gửi mã xác thực đến email: <strong>{email}</strong>
            </Typography>
          </Box>
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: theme.spacing(2) }}>
              {successMessage}
            </Alert>
          )}
          
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
                autoFocus
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
              disabled={isVerifying}
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
              {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: theme.spacing(1) }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Không nhận được mã?{' '}
                <Button
                  variant="text"
                  onClick={handleResendOtp}
                  disabled={isResending || countdown > 0}
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: countdown > 0 ? 'text.disabled' : 'primary.main',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: countdown > 0 ? 'none' : 'underline',
                    },
                    '&:disabled': {
                      color: 'text.disabled',
                    }
                  }}
                >
                  {isResending 
                    ? 'Đang gửi...' 
                    : countdown > 0 
                      ? `Gửi lại (${formatTime(countdown)})`
                      : 'Gửi lại'
                  }
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
      </VerifyContainer>
    </>
  );
}