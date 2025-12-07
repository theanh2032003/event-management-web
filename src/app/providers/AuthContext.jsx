import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const AuthContext = createContext();

/**
 * AuthProvider - Quản lý auth state và token validation
 * - Check token on app init
 * - Nếu có token -> assume valid và redirect vào workspace
 * - Nếu token thực sự invalid, API interceptor sẽ handle 401 error
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * Check auth on app init ONLY (not on every re-render)
   - Nếu có token -> assume valid (API sẽ validate khi gọi)
   - Nếu không có token -> redirect signin
   - IMPORTANT: Use empty dependency array to run only once on mount
   - IMPORTANT: Không redirect nếu đã ở trong một workspace route
   */
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        let lastWorkspaceId = localStorage.getItem('lastWorkspaceId');
        let lastWorkspaceType = localStorage.getItem('lastWorkspaceType');

        // If no lastWorkspaceId, try to get from currentWorkspace
        if (!lastWorkspaceId || !lastWorkspaceType) {
          try {
            const currentWorkspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            if (currentWorkspace) {
              lastWorkspaceId = currentWorkspace.id;
              lastWorkspaceType = currentWorkspace.type;
              console.log('📍 [AuthProvider] Using currentWorkspace:', lastWorkspaceId, lastWorkspaceType);
            }
          } catch (e) {
            console.log('⚠️ [AuthProvider] currentWorkspace parse error:', e);
          }
        }

        console.log('🔍 [AuthProvider] checkAuth started');
        console.log('  - Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
        console.log('  - RefreshToken:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NONE');
        console.log('  - User:', userStr ? userStr.substring(0, 50) : 'NONE');
        console.log('  - LastWorkspaceId:', lastWorkspaceId || 'NONE');
        console.log('  - LastWorkspaceType:', lastWorkspaceType || 'NONE');

        // Check if user has either token OR refreshToken
        if (!token && !refreshToken) {
          // Không có token hoặc refreshToken -> redirect login
          console.log('⚠️ [AuthProvider] No token or refreshToken, redirecting to /signin');
          setIsAuthenticated(false);
          setAuthChecked(true);
          navigate('/signin', { replace: true });
          return;
        }

        // Token or refreshToken exists -> assume valid
        console.log('✅ [AuthProvider] Token/RefreshToken found, setting authenticated');
        setIsAuthenticated(true);
        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch (e) {
            console.error('❌ [AuthProvider] Failed to parse user:', e);
          }
        }

        // Check if already in a workspace route (don't redirect if user is already in a workspace path)
        const currentPath = window.location.pathname;
        const isInWorkspacePath = /^\/(enterprise|supplier)\//.test(currentPath);
        
        console.log('  - CurrentPath:', currentPath);
        console.log('  - IsInWorkspacePath:', isInWorkspacePath);

        if (isInWorkspacePath) {
          // Already in a workspace route -> don't redirect, just mark auth as checked
          console.log('✅ [AuthProvider] Already in workspace route, not redirecting');
          setAuthChecked(true);
          return;
        }

        // Not in workspace route -> redirect to workspace
        // Nếu có lastWorkspaceId, redirect vào workspace đó (only on first load)
        if (lastWorkspaceId && lastWorkspaceType) {
          // Determine redirect path based on workspace type
          let redirectPath;
          if (lastWorkspaceType === 'supplier') {
            redirectPath = `/${lastWorkspaceType}/${lastWorkspaceId}/dashboard`;
          } else {
            // Default for enterprise and other types
            redirectPath = `/${lastWorkspaceType}/${lastWorkspaceId}/statistics`;
          }
          console.log(`✅ [AuthProvider] Redirecting to workspace: ${redirectPath}`);
          navigate(redirectPath, { replace: true });
        } else {
          // Không có lastWorkspace -> redirect select-workspace
          console.log('📋 [AuthProvider] No lastWorkspace, redirecting to /select-workspace');
          navigate('/select-workspace', { replace: true });
        }

        setAuthChecked(true);
      } catch (err) {
        console.error('❌ [AuthProvider] Auth check error:', err);
        setIsAuthenticated(false);
        setAuthChecked(true);
        navigate('/signin', { replace: true });
      }
    };

    console.log('🔍 [AuthProvider] useEffect mounting');
    checkAuth();
  }, []); // Empty dependency array = run only once on mount

  /**
   * Logout - clear token và redirect login
   */
  const logout = () => {
    console.log('🚪 [AuthProvider] Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastWorkspaceId');
    localStorage.removeItem('lastWorkspaceType');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/signin', { replace: true });
  };

  /**
   * Login - set token và user
   */
  const login = (token, user) => {
    console.log('🔐 [AuthProvider] Logging in');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setUser(user);
  };

  /**
   * Update workspace info khi user chọn workspace
   */
  const setWorkspace = (workspaceId, workspaceType) => {
    console.log(`📍 [AuthProvider] Setting workspace: ${workspaceType}/${workspaceId}`);
    localStorage.setItem('lastWorkspaceId', workspaceId);
    localStorage.setItem('lastWorkspaceType', workspaceType);
  };

  const value = {
    authChecked,
    isAuthenticated,
    user,
    login,
    logout,
    setWorkspace,
  };

  // Don't render children until auth check is complete
  // This prevents Routes from rendering with stale auth state
  if (!authChecked) {
    console.log('⏳ [AuthProvider] Still checking auth, showing loading...');
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook để sử dụng AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
