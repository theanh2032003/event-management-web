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
import InputAdornment from '@mui/material/InputAdornment';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import EmailIcon from '@mui/icons-material/Email';
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

const ForgotPasswordContainer = styled(Stack)(({ theme }) => ({
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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (emailError) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    
    try {
      await authApi.resendOtp(email);
      setSuccessMessage(`Mã OTP đã được gửi đến ${email}`);
      
      // Navigate to OTP verification page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email } });
      }, 2000);
    } catch (error) {
      console.error('Send OTP error:', error);
      if (error.response?.status === 500 || error.response?.data?.status === 'INTERNAL_SERVER_ERROR') {
        setSuccessMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
      } else {
        setSuccessMessage('Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    return isValid;
  };

  const handleBackToSignIn = () => {
    navigate('/signin');
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
      <ForgotPasswordContainer direction="column" justifyContent="center">
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
              Quên mật khẩu
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9375rem',
                fontWeight: 400,
              }}
            >
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </Typography>
          </Box>
          
          {successMessage && (
            <Alert 
              severity={successMessage.includes('không thể') ? 'error' : 'success'} 
              sx={{ mb: theme.spacing(2) }}
            >
              {successMessage}
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
              <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                Email
              </FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon 
                        sx={{ 
                          color: emailError ? 'error.main' : 'action.active',
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
              {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
            </Button>
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
              <Link
                component="button"
                variant="body2"
                onClick={handleBackToSignIn}
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
                type="button"
              >
                Quay lại đăng nhập
              </Link>
            </Typography>
          </Box>
        </Card>
      </ForgotPasswordContainer>
    </>
  );
}