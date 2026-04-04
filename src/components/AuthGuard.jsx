import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }) {
  const { session } = useAuth()

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f2ca50' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Memeriksa sesi...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return children
}
