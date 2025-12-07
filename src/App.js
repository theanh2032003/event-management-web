import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme';
import AppRoutes from './routes';
import { ToastProvider } from './app/providers/ToastContext';
import { PermissionProvider } from './shared/contexts/PermissionContext';
import { AuthProvider } from './app/providers/AuthContext';
import { SidebarProvider } from './shared/contexts/SidebarContext';

function AppContent() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <SidebarProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </SidebarProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
