import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RequestListPage from './pages/RequestListPage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';
import AdminPage from './pages/AdminPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-xs text-white">Loading platform context...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestListPage />} />
            <Route path="/requests/create" element={<CreateRequestPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
