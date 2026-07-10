import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToken, saveUser, getToken, getUser, clearAuth } from '../utils/storage';
import { getProfile } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        try {
          // Validate token by fetching fresh profile
          const res = await getProfile();
          const freshUser = res.data?.user || storedUser;
          setUser(freshUser);
          saveUser(freshUser);
          setToken(storedToken);
        } catch {
          // Token invalid or expired
          clearAuth();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Called after successful OTP verification.
   */
  const login = useCallback((tokenValue, userData) => {
    saveToken(tokenValue);
    saveUser(userData);
    setToken(tokenValue);
    setUser(userData);
    navigate('/dashboard');
  }, [navigate]);

  /**
   * Logout — clears all auth state.
   */
  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  /**
   * Check if current user has one of the given roles.
   */
  const hasRole = useCallback((...roles) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
