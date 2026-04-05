import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileText, BarChart3, ArrowLeft, Search, Trash2,
  Eye, X, ChevronDown, ChevronUp, RefreshCw, Shield,
  Sun, Moon, Target, BookOpen, CalendarDays
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ─────────────────────────── Stat Card ─────────────────────────── */
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ background: accent || 'rgba(242, 202, 80, 0.12)' }}>
        <Icon className="w-5 h-5" style={{ color: '#f2ca50' }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  )
}

/* ──────────────────────── User Detail Modal ────────────────────── */
function UserDetailModal({ user, content, onClose }) {
  if (!user) return null

  const pillars = user.final_pillars || user.content_pillars || []
  const offers = Array.isArray(user.offers) ? user.offers : []
  const platformStats = user.platform_stats || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
           style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                 style={{ background: 'linear-gradient(135deg, #f2ca50, #c9a23c)', color: '#1a1a1a' }}>
              {(user.email?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {user.email}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ID: {user.id?.slice(0, 8)}... &bull; Role: {user.role || 'user'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Data */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#f2ca50' }}>Core Identity</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Niche', user.niche_final || user.niche || '—'],
              ['Target Audience', user.target_audience || '—'],
              ['Tone of Voice', user.tone_of_voice || '—'],
              ['Brand Message', user.brand_message || '—'],
            ].map(([label, val]) => (
              <div key={label} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Pillars */}
          {pillars.length > 0 && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: '#f2ca50' }}>Content Pillars</h4>
              <div className="flex flex-wrap gap-2">
                {pillars.map((p, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ border: '1px solid rgba(242,202,80,0.3)', color: '#f2ca50' }}>{p}</span>
                ))}
              </div>
            </>
          )}

          {/* Bio */}
          {user.saved_bio && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: '#f2ca50' }}>Saved Bio</h4>
              <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {user.saved_bio}
              </div>
            </>
          )}

          {/* Value Ladder */}
          {offers.length > 0 && offers.some(o => o.name) && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: '#f2ca50' }}>Value Ladder</h4>
              <div className="space-y-2">
                {offers.filter(o => o.name).map((o, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                       style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded mr-2"
                            style={{ background: 'rgba(242,202,80,0.15)', color: '#f2ca50' }}>{o.level}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{o.name}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#f2ca50' }}>{o.price || '—'}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Content Planner */}
          {content.length > 0 && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wide pt-2" style={{ color: '#f2ca50' }}>
                Content Planner ({content.length} items)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Judul</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Pilar</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td className="py-2 px-3" style={{ color: 'var(--text-primary)' }}>{c.judul}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--text-muted)' }}>{c.pilar || '—'}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  background: c.status === 'Done' ? 'rgba(34,197,94,0.15)' : 'rgba(242,202,80,0.15)',
                                  color: c.status === 'Done' ? '#22c55e' : '#f2ca50'
                                }}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ MAIN ADMIN DASHBOARD ═══════════════════ */
export default function AdminDashboard() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [allContent, setAllContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('email')
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserContent, setSelectedUserContent] = useState([])
  const [tab, setTab] = useState('users') // 'users' | 'stats'

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('user_profiles')
        .select('*')
        .order('updated_at', { ascending: false })

      if (pErr) throw pErr

      const { data: content, error: cErr } = await supabase
        .from('content_planner')
        .select('*')
        .order('created_at', { ascending: false })

      if (cErr) throw cErr

      setUsers(profiles || [])
      setAllContent(content || [])
    } catch (err) {
      toast.error('Gagal memuat data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // View user detail
  async function viewUser(u) {
    const userContent = allContent.filter(c => c.user_id === u.id)
    setSelectedUserContent(userContent)
    setSelectedUser(u)
  }

  // Delete user (profile only — auth user remains but has no data)
  async function deleteUserProfile(userId) {
    if (!confirm('Hapus semua data profil user ini? (Akun auth tetap ada)')) return
    try {
      await supabase.from('content_planner').delete().eq('user_id', userId)
      await supabase.from('user_profiles').delete().eq('id', userId)
      toast.success('Data user dihapus ✓')
      fetchData()
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message)
    }
  }

  // Filtered & sorted users
  const filteredUsers = users
    .filter(u => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        u.email?.toLowerCase().includes(q) ||
        (u.niche_final || u.niche || '').toLowerCase().includes(q) ||
        (u.target_audience || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase()
      const valB = (b[sortField] || '').toString().toLowerCase()
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })

  // Stats
  const totalUsers = users.length
  const totalContent = allContent.length
  const usersWithNiche = users.filter(u => u.niche_final || u.niche).length
  const usersWithBio = users.filter(u => u.saved_bio).length
  const contentByStatus = {
    Idea: allContent.filter(c => c.status === 'Idea').length,
    Scripting: allContent.filter(c => c.status === 'Scripting').length,
    Ready: allContent.filter(c => c.status === 'Ready').length,
    Done: allContent.filter(c => c.status === 'Done').length,
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#f2ca50', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat data admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
              style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(242, 202, 80, 0.12)' }}>
              <Shield className="w-4 h-4" style={{ color: '#f2ca50' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Muslim Growth Academy</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
                  title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Users" value={totalUsers} />
          <StatCard icon={FileText} label="Total Konten" value={totalContent} />
          <StatCard icon={Target} label="Sudah Punya Niche" value={usersWithNiche} />
          <StatCard icon={BookOpen} label="Sudah Punya Bio" value={usersWithBio} />
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'users', label: 'Daftar User', icon: Users },
            { id: 'stats', label: 'Statistik', icon: BarChart3 },
          ].map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(242, 202, 80, 0.1)' : 'transparent',
                color: tab === t.id ? '#f2ca50' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(242, 202, 80, 0.2)' : '1px solid transparent',
              }}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ TAB: Users ═══════════════ */}
        {tab === 'users' && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Cari berdasarkan email, niche, atau audience..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="input-base pl-10 w-full"
              />
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none"
                          style={{ color: 'var(--text-muted)' }} onClick={() => toggleSort('email')}>
                        Email <SortIcon field="email" />
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>Niche</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>Konten</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>Progress</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>Role</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                          {searchQuery ? 'Tidak ada user yang cocok.' : 'Belum ada user terdaftar.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => {
                        const userContentCount = allContent.filter(c => c.user_id === u.id).length
                        const hasNiche = u.niche_final || u.niche
                        const hasBio = u.saved_bio
                        const hasPillars = (u.final_pillars || u.content_pillars || []).length > 0
                        const progress = [hasNiche, hasBio, hasPillars].filter(Boolean).length

                        return (
                          <tr key={u.id}
                              className="transition-colors"
                              style={{ borderBottom: '1px solid var(--border-color)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                     style={{ background: 'linear-gradient(135deg, #f2ca50, #c9a23c)', color: '#1a1a1a' }}>
                                  {(u.email?.[0] || 'U').toUpperCase()}
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                              {u.niche_final || u.niche || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{ background: 'rgba(242,202,80,0.1)', color: '#f2ca50' }}>
                                {userContentCount}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                {[
                                  { done: hasNiche, label: 'N' },
                                  { done: hasBio, label: 'B' },
                                  { done: hasPillars, label: 'P' },
                                ].map((s, i) => (
                                  <span key={i} className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
                                        title={s.label === 'N' ? 'Niche' : s.label === 'B' ? 'Bio' : 'Pillars'}
                                        style={{
                                          background: s.done ? 'rgba(34,197,94,0.15)' : 'rgba(113,113,122,0.1)',
                                          color: s.done ? '#22c55e' : 'var(--text-muted)'
                                        }}>
                                    {s.label}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                      background: u.role === 'admin' ? 'rgba(242,202,80,0.15)' : 'rgba(113,113,122,0.1)',
                                      color: u.role === 'admin' ? '#f2ca50' : 'var(--text-muted)'
                                    }}>
                                {u.role || 'user'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => viewUser(u)} className="p-1.5 rounded-lg transition-colors"
                                        style={{ color: 'var(--text-muted)' }} title="Lihat detail"
                                        onMouseEnter={e => e.currentTarget.style.color = '#f2ca50'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                  <Eye className="w-4 h-4" />
                                </button>
                                {u.role !== 'admin' && (
                                  <button onClick={() => deleteUserProfile(u.id)} className="p-1.5 rounded-lg transition-colors"
                                          style={{ color: 'var(--text-muted)' }} title="Hapus data user"
                                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Footer count */}
              <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                Menampilkan {filteredUsers.length} dari {totalUsers} user
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ TAB: Stats ═══════════════ */}
        {tab === 'stats' && (
          <div className="space-y-6">
            {/* Content Status Distribution */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Distribusi Status Konten</h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(contentByStatus).map(([status, count]) => {
                  const colors = {
                    Idea: '#3b82f6',
                    Scripting: '#f59e0b',
                    Ready: '#8b5cf6',
                    Done: '#22c55e',
                  }
                  const pct = totalContent > 0 ? Math.round((count / totalContent) * 100) : 0
                  return (
                    <div key={status} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <p className="text-2xl font-bold" style={{ color: colors[status] }}>{count}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{status}</p>
                      <div className="w-full h-1.5 rounded-full mt-2" style={{ background: 'var(--bg-surface)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[status] }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{pct}%</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* User Progress Overview */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Progress Funnel</h3>
              <div className="space-y-3">
                {[
                  { label: 'Registered', count: totalUsers, icon: Users },
                  { label: 'Has Niche', count: usersWithNiche, icon: Target },
                  { label: 'Has Bio', count: usersWithBio, icon: BookOpen },
                  { label: 'Has Content Plan', count: [...new Set(allContent.map(c => c.user_id))].length, icon: CalendarDays },
                ].map((step, i) => {
                  const pct = totalUsers > 0 ? Math.round((step.count / totalUsers) * 100) : 0
                  return (
                    <div key={step.label} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: 'rgba(242, 202, 80, 0.1)' }}>
                        <step.icon className="w-4 h-4" style={{ color: '#f2ca50' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{step.label}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-primary)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f2ca50' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Users by Content */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Users (by Content)</h3>
              <div className="space-y-2">
                {users
                  .map(u => ({
                    ...u,
                    contentCount: allContent.filter(c => c.user_id === u.id).length
                  }))
                  .sort((a, b) => b.contentCount - a.contentCount)
                  .slice(0, 10)
                  .map((u, i) => (
                    <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg"
                         style={{ background: i === 0 ? 'rgba(242,202,80,0.06)' : 'transparent' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-5 text-center" style={{ color: i < 3 ? '#f2ca50' : 'var(--text-muted)' }}>
                          {i + 1}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{u.email}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#f2ca50' }}>{u.contentCount}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          content={selectedUserContent}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
