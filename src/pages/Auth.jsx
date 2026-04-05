import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, User, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const { session } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) throw error
        toast.success('Akun berhasil dibuat! Cek email Anda untuk konfirmasi.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Selamat datang kembali! 👋')
      }
    } catch (err) {
      const messages = {
        'Invalid login credentials': 'Email atau password salah.',
        'Email not confirmed': 'Silakan konfirmasi email Anda terlebih dahulu.',
        'User already registered': 'Email sudah terdaftar. Silakan masuk.',
        'Password should be at least 6 characters': 'Password minimal 6 karakter.',
      }
      toast.error(messages[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Theme toggle (floating) */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl transition-all"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between"
           style={{ background: isDark
             ? 'linear-gradient(135deg, #0a0a0b 0%, #131316 50%, #1c1c21 100%)'
             : 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #ffffff 100%)'
           }}>
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl"
               style={{ background: 'rgba(242, 202, 80, 0.12)' }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
               style={{ background: 'rgba(242, 202, 80, 0.08)' }} />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <img src="/logo.png" alt="MGA Logo" className="w-11 h-11 rounded-2xl object-contain bg-zinc-900 border border-zinc-800/10 shadow-lg" />
            <div>
              <span className="text-lg font-extrabold" style={{ color: '#f2ca50' }}>MGA</span>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Muslim Growth Academy</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Bangun Personal<br />
            <span style={{ color: '#f2ca50' }}>Brand yang Berkah</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Sistem operasi untuk pertumbuhan personal brand Muslim.
            Temukan niche, bangun konten, dan kembangkan audiens — dipandu oleh AI.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🎯', title: 'Niche Finder', desc: '4 irisan penting untuk niche yang tepat' },
            { icon: '💡', title: 'Content Factory', desc: 'Generate ratusan ide konten viral' },
            { icon: '📊', title: 'Growth Tracker', desc: 'Pantau pertumbuhan di semua platform' },
          ].map((f) => (
            <div key={f.title} className="glass-card flex items-center gap-3 px-4 py-3">
              <span className="text-xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <span className="os-badge">MGA v1.0</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/logo.png" alt="MGA Logo" className="w-8 h-8 rounded-xl object-contain bg-zinc-900 border border-zinc-800/10" />
            <span className="text-base font-extrabold" style={{ color: '#f2ca50' }}>MGA</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {mode === 'signin' ? 'Selamat datang kembali' : 'Buat akun baru'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'signin'
              ? 'Masuk ke sistem pertumbuhan brand Anda.'
              : 'Bergabung dan mulai bangun personal brand Anda.'}
          </p>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
              })
              if (error) toast.error('Gagal login dengan Google: ' + error.message)
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-md mb-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid var(--border-color)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>atau gunakan email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="label-base">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Ahmad Fauzi" className="input-base pl-10" required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label-base">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@email.com" className="input-base pl-10" required autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-base">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Minimal 6 karakter' : '••••••••'}
                  className="input-base pl-10 pr-10" required minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" id="auth-submit-btn" disabled={loading}
              className="btn-primary w-full justify-center mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Memproses...' : mode === 'signin' ? 'Masuk' : 'Buat Akun'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {mode === 'signin' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button id="auth-toggle-btn" type="button"
              onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
              className="font-medium transition-colors" style={{ color: '#f2ca50' }}>
              {mode === 'signin' ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
