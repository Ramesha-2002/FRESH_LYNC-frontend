import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    const stored = localStorage.getItem('fl_user');
    try {
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && !parsed._id) parsed._id = parsed.id;
        if (parsed && parsed._id && !parsed.id) parsed.id = parsed._id;
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const setUser = (val) => {
    if (typeof val === 'function') {
      setUserState(prev => {
        const res = val(prev);
        if (res) {
          const cloned = { ...res };
          if (cloned.id && !cloned._id) cloned._id = cloned.id;
          if (cloned._id && !cloned.id) cloned.id = cloned._id;
          return cloned;
        }
        return res;
      });
    } else {
      const res = val;
      if (res) {
        const cloned = { ...res };
        if (cloned.id && !cloned._id) cloned._id = cloned.id;
        if (cloned._id && !cloned.id) cloned.id = cloned._id;
        setUserState(cloned);
      } else {
        setUserState(res);
      }
    }
  };

  const [token, setToken]         = useState(localStorage.getItem('fl_token'));
  const [loading, setLoading]     = useState(true);

  // On mount, rehydrate user from token
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('fl_token');
      if (stored) {
        try {
          const me = await authService.getMe();
          setUser(me);
        } catch {
          localStorage.removeItem('fl_token');
          localStorage.removeItem('fl_user');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('fl_token', data.token);
    localStorage.setItem('fl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (accessToken, role) => {
    const data = await authService.googleLogin(accessToken, role);
    localStorage.setItem('fl_token', data.token);
    localStorage.setItem('fl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem('fl_token', data.token);
    localStorage.setItem('fl_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('fl_token');
    localStorage.removeItem('fl_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    console.log('[AuthContext] updateUser called with:', updated);
    if (updated) {
      const cloned = { ...updated };
      if (cloned.id && !cloned._id) cloned._id = cloned.id;
      if (cloned._id && !cloned.id) cloned.id = cloned._id;
      setUser(cloned);
      localStorage.setItem('fl_user', JSON.stringify(cloned));
      console.log('[AuthContext] user state and localStorage updated to:', cloned);
    } else {
      setUser(null);
      localStorage.removeItem('fl_user');
      console.log('[AuthContext] user state cleared');
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
