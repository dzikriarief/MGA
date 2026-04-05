import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminGuard({ children }) {
  const { session, profile } = useAuth()

  // Still loading
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#f2ca50', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  // Not logged in
  if (!session) return <Navigate to="/auth" replace />

  // Not admin
  if (profile?.role !== 'admin') return <Navigate to="/" replace />

  return children
}
