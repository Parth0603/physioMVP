import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse, ProfileUpdateRequest } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: any) => Promise<AuthResponse>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load current user', error);
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authService.login(email, password);
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const userData = await authService.getCurrentUser();
    setUser(userData);
    return res;
  };

  const register = async (payload: any): Promise<AuthResponse> => {
    const res = await authService.register(payload);
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const userData = await authService.getCurrentUser();
    setUser(userData);
    return res;
  };

  const updateProfile = async (data: ProfileUpdateRequest): Promise<User> => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const refreshUser = async (): Promise<void> => {
    if (token) {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        updateProfile,
        refreshUser,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
