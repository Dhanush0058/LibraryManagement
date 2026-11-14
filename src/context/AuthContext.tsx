import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isSuperAdmin: boolean;
  isLibrarian: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchPersona: (role: UserRole) => void;
  resetPasswordRequest: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'libracare_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      // Default to Super Admin profile for demonstration readiness
      const profiles = db.getProfiles();
      return profiles[0] || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, _pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const profiles = db.getProfiles();
    const found = profiles.find(p => p.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: 'Invalid credentials or user not authorized.' };
    }

    if (!found.is_active) {
      return { success: false, message: 'This authority account has been deactivated by Super Admin.' };
    }

    setUser(found);
    db.logAudit('USER_LOGIN', 'AUTH', found.id, { email: found.email, role: found.role }, found);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      db.logAudit('USER_LOGOUT', 'AUTH', user.id, { email: user.email }, user);
    }
    setUser(null);
  };

  const switchPersona = (role: UserRole) => {
    const profiles = db.getProfiles();
    const target = profiles.find(p => p.role === role && p.is_active);
    if (target) {
      setUser(target);
      db.logAudit('SWITCH_PERSONA_DEMO', 'AUTH', target.id, { newRole: role }, target);
    }
  };

  const resetPasswordRequest = async (email: string): Promise<{ success: boolean; message: string }> => {
    const profiles = db.getProfiles();
    const found = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'No registered authority account found with this email.' };
    }
    db.logAudit('PASSWORD_RESET_REQUESTED', 'AUTH', found.id, { email: found.email });
    return {
      success: true,
      message: `A secure password reset authorization link has been logged and dispatched to ${email}.`
    };
  };

  const role = user?.role || null;
  const isSuperAdmin = role === 'super_admin';
  const isLibrarian = role === 'librarian' || isSuperAdmin;
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isSuperAdmin,
        isLibrarian,
        isAuthenticated,
        login,
        logout,
        switchPersona,
        resetPasswordRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
