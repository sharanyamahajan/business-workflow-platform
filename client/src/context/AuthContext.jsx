import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  { label: 'Employee (Aarav)', email: 'aarav.sharma@company.com', role: 'EMPLOYEE', dept: 'Engineering' },
  { label: 'Employee (Priya)', email: 'priya.mehta@company.com', role: 'EMPLOYEE', dept: 'Engineering' },
  { label: 'Reporting Manager (Rajesh)', email: 'rajesh.kumar@company.com', role: 'REPORTING_MANAGER', dept: 'Engineering' },
  { label: 'IT Staff (Vikram)', email: 'vikram.singh@company.com', role: 'DEPARTMENT_STAFF', dept: 'IT & Infra' },
  { label: 'Finance Staff (Neha)', email: 'neha.verma@company.com', role: 'DEPARTMENT_STAFF', dept: 'Finance' },
  { label: 'Director (Ananya)', email: 'ananya.roy@company.com', role: 'DEPARTMENT_HEAD', dept: 'Engineering' },
  { label: 'Operations Manager (Siddharth)', email: 'siddharth.patel@company.com', role: 'OPERATIONS_MANAGER', dept: 'Operations' },
  { label: 'System Admin', email: 'admin@company.com', role: 'SYSTEM_ADMIN', dept: 'IT' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      switchDemoUser('aarav.sharma@company.com');
    }
  }, []);

  const fetchCurrentUser = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const switchDemoUser = async (email) => {
    setLoading(true);
    try {
      await login(email, 'Password123!');
    } catch (err) {
      console.error('Failed demo login:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
