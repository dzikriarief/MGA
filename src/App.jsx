import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import AuthPage from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

function AppToaster() {
  const { isDark } = useTheme()
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1c1c21' : '#ffffff',
          color: isDark ? '#fafafa' : '#18181b',
          border: `1px solid ${isDark ? '#2a2a30' : '#e4e4e7'}`,
          borderRadius: '10px',
          fontSize: '14px',
          maxWidth: '420px',
          boxShadow: isDark
            ? '0 4px 12px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.08)',
        },
        success: {
          iconTheme: { primary: '#f2ca50', secondary: isDark ? '#1c1c21' : '#ffffff' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: isDark ? '#1c1c21' : '#ffffff' },
        },
      }}
    />
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AppToaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
