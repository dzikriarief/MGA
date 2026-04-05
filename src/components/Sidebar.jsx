import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../supabaseClient'
import {
  LayoutDashboard,
  Target,
  BookOpen,
  FileText,
  Lightbulb,
  CalendarDays,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'command',     label: 'Command Center',       icon: LayoutDashboard, section: null },
  { id: 'divider-1',  type: 'divider', sectionLabel: 'ECOSYSTEM' },
  { id: 'niche',      label: 'Niche Finder',          icon: Target },
  { id: 'persona',    label: 'Persona & Pillar',      icon: BookOpen },
  { id: 'bio',        label: 'Bio Generator',          icon: FileText },
  { id: 'ideas',      label: 'Content Ideas',          icon: Lightbulb },
  { id: 'planner',    label: 'Content Planner',        icon: CalendarDays },
]

export default function Sidebar({ activeModule, onModuleChange }) {
  const { user, profile } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Berhasil keluar.')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarLetter = displayName[0]?.toUpperCase()

  const NavContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo: MG-OS ── */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <img src="/logo.png" alt="MGA Logo" className="w-9 h-9 rounded-xl object-contain bg-zinc-900 border border-zinc-800/10" />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-base font-extrabold leading-tight truncate" style={{ color: '#f2ca50' }}>
              MGA
            </p>
            <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
              Muslim Growth Academy
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.type === 'divider') {
            return (
              <div key={item.id} className="pt-4 pb-2 px-3">
                {!collapsed && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                    {item.sectionLabel}
                  </p>
                )}
                {collapsed && <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 4px' }} />}
              </div>
            )
          }

          const { id, label, icon: Icon } = item
          const isActive = activeModule === id
          const isCommand = id === 'command'

          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => { onModuleChange(id); setMobileOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${collapsed ? 'justify-center' : ''}
              `}
              style={{
                background: isActive
                  ? (isCommand ? 'rgba(242, 202, 80, 0.12)' : 'rgba(242, 202, 80, 0.08)')
                  : 'transparent',
                color: isActive ? '#f2ca50' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(242, 202, 80, 0.2)' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-surface-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#f2ca50' }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Admin link ── */}
      {isAdmin && (
        <div className="px-2 pt-2">
          <button
            onClick={() => { navigate('/admin'); setMobileOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ background: 'rgba(242, 202, 80, 0.08)', color: '#f2ca50', border: '1px solid rgba(242, 202, 80, 0.15)' }}
            title={collapsed ? 'Admin Panel' : undefined}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {!collapsed && 'Admin Panel'}
          </button>
        </div>
      )}

      {/* ── Bottom: Theme + User + Sign out ── */}
      <div className="px-2 pb-3 pt-2 space-y-1" style={{ borderTop: '1px solid var(--border-color)' }}>
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
        </button>

        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #f2ca50, #c9a23c)', color: '#1a1a1a' }}>
              {avatarLetter}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          id="signout-btn"
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && 'Keluar'}
        </button>

        {/* Version label */}
        {!collapsed && (
          <div className="px-3 pt-1">
            <span className="os-badge">MGA v1.0</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        id="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg transition-colors"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full flex flex-col animate-slide-up"
               style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
            {NavContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-200 relative ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
        style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)' }}
      >
        {NavContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            transform: 'translateY(-50%)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#f2ca50'; e.currentTarget.style.color = '#f2ca50' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  )
}
