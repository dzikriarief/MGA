import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../supabaseClient'
import {
  Target, BookOpen, FileText, Lightbulb, CalendarDays,
  Camera, Edit3, ChevronRight, TrendingUp, Users, Package,
  Youtube, Instagram, Twitter, Linkedin, Save, Loader2, Plus, Trash2, X,
  Download, FileDown, Search, Tag, Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Platform Config ── */
const PLATFORMS = [
  { key: 'youtube',   label: 'YouTube',   icon: Youtube,   color: '#FF0000' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { key: 'tiktok',    label: 'TikTok',    icon: () => <span className="text-sm font-bold">T</span>, color: '#00f2ea' },
  { key: 'threads',   label: 'Threads',   icon: () => <span className="text-sm font-bold">@</span>, color: '#000000' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,  color: '#0A66C2' },
  { key: 'twitter',   label: 'Twitter/X', icon: Twitter,   color: '#1DA1F2' },
]

const DEFAULT_OFFERS = [
  { level: 'Free', name: '', description: '', price: 'Gratis' },
  { level: 'Low Ticket', name: '', description: '', price: '' },
  { level: 'Mid Ticket', name: '', description: '', price: '' },
  { level: 'High Ticket', name: '', description: '', price: '' },
  { level: 'Premium', name: '', description: '', price: '' },
]

/* ── Module Nav Cards ── */
const MODULE_CARDS = [
  { id: 'niche',       label: 'Value Discovery',    icon: Target,       desc: 'Temukan posisi unik Anda' },
  { id: 'competitors', label: 'Riset Competitors',  icon: Search,       desc: 'Riset akun kompetitor & market' },
  { id: 'persona',     label: 'Persona & Pillar',   icon: BookOpen,     desc: 'Bangun persona & pilar konten' },
  { id: 'bio',         label: 'Bio Generator',      icon: FileText,     desc: 'Generate bio yang menarik' },
  { id: 'offers',      label: 'Offers',             icon: Tag,          desc: 'Rancang penawaran brand' },
  { id: 'ideas',       label: 'Content Generator',  icon: Lightbulb,    desc: 'Ide & script multi-platform' },
  { id: 'planner',     label: 'Content Planner',    icon: CalendarDays, desc: 'Kelola rencana konten' },
  { id: 'projects',    label: 'Projects',           icon: Briefcase,    desc: 'Kelola project & endorse' },
]

/* ── Donut Chart (SVG) ── */
function DonutChart({ value, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="#f2ca50" strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out" />
    </svg>
  )
}

/* ── Export Helper: Generate HTML → download ── */
function generateExportHTML(profile, plannerStats, platformStats, userDisplayName) {
  const niche = profile?.niche_final || profile?.niche || '—'
  const audience = profile?.target_audience || '—'
  const tone = profile?.tone_of_voice || '—'
  const bio = profile?.saved_bio || '—'
  const brandMsg = profile?.brand_message || '—'
  const pitch = profile?.elevator_pitch || '—'
  const pillars = profile?.final_pillars || profile?.content_pillars || []
  const offers = Array.isArray(profile?.offers) ? profile.offers : []
  const platformData = platformStats || {}

  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' lang="id">
<head>
  <meta charset="UTF-8"/>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <title>Brand Guideline — ${userDisplayName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
    
    :root {
      --gold: #c5a021;
      --gold-soft: #fdfaf0;
      --dark: #1a1a1a;
      --muted: #71717a;
      --border: #f1f1f1;
      --bg: #fcfcfc;
    }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      max-width: 850px;
      margin: 0 auto;
      padding: 60px 40px;
      color: var(--dark);
      line-height: 1.7;
      background-color: var(--bg);
    }
    
    .cover {
      text-align: center;
      margin-bottom: 80px;
      padding: 60px 20px;
      border: 1px solid var(--border);
      background: #fff;
      position: relative;
    }
    
    .cover-line {
      position: absolute;
      top: 20px; left: 20px; bottom: 20px; right: 20px;
      border: 1px solid var(--border);
      pointer-events: none;
    }
    
    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: var(--gold);
      letter-spacing: 4px;
      margin-bottom: 20px;
    }
    
    .title-main {
      font-family: 'Playfair Display', serif;
      font-size: 52px;
      font-weight: 600;
      margin: 0;
      line-height: 1.1;
      letter-spacing: -1px;
    }
    
    .owner-name {
      font-size: 16px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-top: 15px;
    }
    
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 2.5px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-label::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    
    .manifesto {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-style: italic;
      line-height: 1.3;
      color: var(--dark);
      margin: 60px 0;
      text-align: center;
      padding: 0 40px;
    }
    
    .grid-identity {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 20px;
    }
    
    .identity-row {
      display: table-row;
    }
    
    .identity-cell {
      display: table-cell;
      width: 50%;
      padding-right: 20px;
      vertical-align: top;
    }
    
    .card-minimal {
      background: #fff;
      padding: 30px;
      border: 1px solid var(--border);
      border-radius: 2px;
    }
    
    .card-minimal .label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
    }
    
    .card-minimal .value {
      font-size: 16px;
      font-weight: 500;
      color: var(--dark);
    }
    
    .pillar-list {
      margin: 30px 0;
      padding: 0;
      list-style: none;
    }
    
    .pillar-item {
      padding: 15px 0;
      border-bottom: 1px solid var(--border);
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .pillar-item::before {
      content: "";
      width: 8px;
      height: 8px;
      background: var(--gold);
    }
    
    .ladder-visual {
      margin-top: 40px;
    }
    
    .ladder-step {
      background: #fff;
      border: 1px solid var(--border);
      margin-bottom: 10px;
      padding: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .step-info {
      flex: 1;
    }
    
    .step-level {
      font-size: 9px;
      font-weight: 700;
      background: var(--gold);
      color: #fff;
      padding: 2px 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-block;
      margin-bottom: 8px;
    }
    
    .step-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--dark);
    }
    
    .step-price {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 600;
      color: var(--gold);
      margin-left: 20px;
    }
    
    .step-desc {
      font-size: 13px;
      color: var(--muted);
      margin-top: 5px;
      max-width: 80%;
    }
    
    .footer-minimal {
      margin-top: 100px;
      text-align: center;
      font-size: 10px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    @media print {
      body { padding: 0; background: #fff; }
      .card-minimal, .cover, .ladder-step { border: 1px solid #ddd !important; }
    }
  </style>
</head>
<body>

  <div class="cover">
    <div class="cover-line"></div>
    <div class="logo-text">MGA</div>
    <h1 class="title-main">Personal Brand<br/>Guideline</h1>
    <div class="owner-name">${userDisplayName}</div>
  </div>

  ${brandMsg !== '—' ? `<div class="manifesto">"${brandMsg}"</div>` : ''}

  <div class="section-label">Core Identity</div>
  
  <div style="display: flex; gap: 20px; margin-bottom: 20px;">
    <div class="card-minimal" style="flex: 1;">
      <div class="label">Niche Area</div>
      <div class="value">${niche}</div>
    </div>
    <div class="card-minimal" style="flex: 1;">
      <div class="label">Target Audience</div>
      <div class="value">${audience}</div>
    </div>
  </div>
  
  <div class="card-minimal" style="margin-bottom: 60px;">
    <div class="label">Brand Persona & Tone</div>
    <div class="value" style="font-style: italic;">${tone}</div>
  </div>

  <div class="section-label">Elevator Pitch</div>
  <div style="padding: 0 40px 60px 40px; font-size: 18px; color: #444;">
    ${pitch.replace(/\n/g, '<br/>')}
  </div>

  <div class="section-label">Content Pillars</div>
  <div class="pillar-list" style="margin-bottom: 60px; padding: 0 40px;">
    ${pillars.length > 0 
      ? pillars.map(p => `<div class="pillar-item">${p}</div>`).join('') 
      : '<div class="pillar-item">Belum ada pilar konten ditentukan.</div>'}
  </div>

  <div class="section-label">Value Ladder</div>
  <div class="ladder-visual" style="margin-bottom: 60px;">
    ${offers.length > 0 ? offers.map(o => `
      <div class="ladder-step">
        <div class="step-info">
          <div class="step-level">${o.level}</div>
          <div class="step-name">${o.name || 'Untitled Product'}</div>
          <div class="step-desc">${o.description || 'No description available.'}</div>
        </div>
        <div class="step-price">${o.price || '—'}</div>
      </div>
    `).join('') : '<p style="text-align:center; color: #999;">Belum ada penawaran yang dilist.</p>'}
  </div>

  <div class="section-label">Official Bio</div>
  <div class="card-minimal" style="font-size: 14px; background: var(--gold-soft); border-color: var(--gold); margin-bottom: 60px;">
    <div style="white-space: pre-wrap;">${bio}</div>
  </div>

  <div class="footer-minimal">
    Muslim Growth Academy &bull; Strategic Branding &bull; ${new Date().getFullYear()}
  </div>

</body>
</html>`
}

export default function CommandCenter({ onModuleChange }) {
  const { user } = useAuth()
  const { profile, saving, updateProfile } = useProfile()

  const [plannerStats, setPlannerStats] = useState({ total: 0, idea: 0, scripting: 0, ready: 0, done: 0 })
  const [expandedPlatform, setExpandedPlatform] = useState(null)
  const [platformStats, setPlatformStats] = useState({})
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [tempPlatform, setTempPlatform] = useState({ followers: 0, growth: 0 })
  const [offers, setOffers] = useState(DEFAULT_OFFERS)
  const [editingOffers, setEditingOffers] = useState(false)
  const [savingOffers, setSavingOffers] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Load planner stats
  const fetchStats = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('content_planner')
      .select('status')
      .eq('user_id', user.id)
    if (data) {
      setPlannerStats({
        total: data.length,
        idea:      data.filter(d => d.status === 'Idea').length,
        scripting: data.filter(d => d.status === 'Scripting').length,
        ready:     data.filter(d => d.status === 'Ready').length,
        done:      data.filter(d => d.status === 'Done').length,
      })
    }
  }, [user])

  useEffect(() => { fetchStats() }, [fetchStats])

  // Load platform stats & offers from profile
  useEffect(() => {
    if (profile) {
      if (profile.platform_stats && typeof profile.platform_stats === 'object') {
        setPlatformStats(profile.platform_stats)
      }
      if (Array.isArray(profile.offers) && profile.offers.length > 0) {
        setOffers(profile.offers)
      }
    }
  }, [profile])

  // Compute growth score
  const totalFollowers = Object.values(platformStats).reduce((s, p) => s + (p?.followers || 0), 0)
  const totalGrowth = Object.values(platformStats).reduce((s, p) => s + (p?.growth || 0), 0)
  const activePlatforms = Object.values(platformStats).filter(p => (p?.followers || 0) > 0).length
  const growthScore = Math.min(100, Math.round((activePlatforms / 6) * 40 + Math.min(totalGrowth, 60)))

  // Save platform stat
  async function savePlatformStat(key) {
    const updated = { ...platformStats, [key]: { ...tempPlatform } }
    setPlatformStats(updated)
    setEditingPlatform(null)
    await updateProfile({ platform_stats: updated })
    toast.success(`${key} stats disimpan ✓`)
  }

  // Save offers
  async function saveOffers() {
    setSavingOffers(true)
    await updateProfile({ offers })
    setSavingOffers(false)
    setEditingOffers(false)
    toast.success('Value Ladder disimpan ✓')
  }

  // Add custom offer step
  function addOfferStep() {
    setOffers(prev => [...prev, { level: 'Custom', name: '', description: '', price: '' }])
  }

  function removeOfferStep(idx) {
    setOffers(prev => prev.filter((_, i) => i !== idx))
  }

  // Avatar upload
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: urlData.publicUrl + '?t=' + Date.now() })
      toast.success('Foto profil berhasil diupload ✓')
    } catch (err) {
      toast.error('Gagal upload: ' + err.message)
    } finally {
      setAvatarUploading(false)
    }
  }

  // ── Export Functions ──
  function handleExport(format) {
    const html = generateExportHTML(profile, plannerStats, platformStats, displayName)

    if (format === 'word') {
      const blob = new Blob(
        ['\ufeff' + html],
        { type: 'application/vnd.ms-word;charset=utf-8' }
      )
      downloadBlob(blob, 'Personal-Brand-Guideline-MGA.doc')
      toast.success('Exported to Word ✓')
    } else {
      // PDF via print
      const win = window.open('', '_blank')
      win.document.write(html)
      win.document.close()
      win.setTimeout(() => {
        win.print()
      }, 500)
      toast.success('Print / Save as PDF ✓')
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const pillars = profile?.final_pillars || profile?.content_pillars || []
  const avatarUrl = profile?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Command Center
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Pusat kendali personal brand Anda. Pantau semua data dari satu tempat.
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs py-2" onClick={() => handleExport('word')}>
              <FileDown className="w-3.5 h-3.5" /> Export Word
            </button>
            <button className="btn-primary text-xs py-2" onClick={() => handleExport('pdf')}>
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* ══════════════ BRAND IDENTITY CARD ══════════════ */}
        <div className="glass-card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0 relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                   style={{ background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #f2ca50, #c9a23c)' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>{displayName[0]?.toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {avatarUploading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</h2>
              {profile?.brand_message && (
                <p className="text-xs mt-1 italic" style={{ color: '#f2ca50' }}>"{profile.brand_message}"</p>
              )}

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoRow label="Niche" value={profile?.niche_final || profile?.niche || '—'}
                         action={() => onModuleChange('niche')} />
                <InfoRow label="Target Audience" value={profile?.target_audience || '—'}
                         action={() => onModuleChange('niche')} />
                <InfoRow label="Tone of Voice" value={profile?.tone_of_voice || '—'}
                         action={() => onModuleChange('persona')} />
                <InfoRow label="Bio" value={profile?.saved_bio?.slice(0, 60) || '—'}
                         action={() => onModuleChange('bio')} full />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ CONTENT PILLARS ══════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Pilar Konten
            </h3>
            <button className="btn-ghost text-xs" style={{ color: '#f2ca50' }} onClick={() => onModuleChange('persona')}>
              Kelola Pilar <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          {pillars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {pillars.map((p, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pilar {i + 1}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Belum ada pilar konten. <button className="underline" style={{ color: '#f2ca50' }} onClick={() => onModuleChange('persona')}>Buat sekarang →</button>
              </p>
            </div>
          )}
        </div>

        {/* ══════════════ VALUE LADDER ══════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              <Package className="w-3.5 h-3.5 inline mr-1.5" />Value Ladder / Offers
            </h3>
            <button className="btn-ghost text-xs" style={{ color: '#f2ca50' }}
                    onClick={() => setEditingOffers(v => !v)}>
              {editingOffers ? 'Tutup' : 'Edit'} <Edit3 className="w-3 h-3 ml-1" />
            </button>
          </div>

          {/* Ladder visualization */}
          <div className="flex flex-col sm:flex-row gap-2">
            {offers.map((offer, idx) => (
              <div key={idx}
                className="glass-card p-3 flex-1 relative group"
                style={{ borderLeft: '3px solid', borderLeftColor: `hsl(${40 + idx * 8}, 80%, ${65 - idx * 8}%)` }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f2ca50' }}>
                  {editingOffers ? (
                    <input className="input-base text-[10px] py-1 font-semibold uppercase tracking-wider w-full"
                      style={{ color: '#f2ca50' }}
                      value={offer.level}
                      onChange={e => {
                        const u = [...offers]; u[idx].level = e.target.value; setOffers(u)
                      }}
                      placeholder="Level name" />
                  ) : offer.level}
                </p>
                {editingOffers ? (
                  <div className="mt-2 space-y-1.5">
                    <input className="input-base text-xs py-1.5" placeholder="Nama produk/layanan"
                      value={offer.name} onChange={e => {
                        const u = [...offers]; u[idx].name = e.target.value; setOffers(u)
                      }} />
                    <input className="input-base text-xs py-1.5" placeholder="Harga"
                      value={offer.price} onChange={e => {
                        const u = [...offers]; u[idx].price = e.target.value; setOffers(u)
                      }} />
                    <input className="input-base text-xs py-1.5" placeholder="Deskripsi singkat"
                      value={offer.description} onChange={e => {
                        const u = [...offers]; u[idx].description = e.target.value; setOffers(u)
                      }} />
                    <button onClick={() => removeOfferStep(idx)}
                      className="text-red-400 text-xs flex items-center gap-1 mt-1 hover:text-red-300">
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {offer.name || <span style={{ color: 'var(--text-muted)' }}>Belum diisi</span>}
                    </p>
                    {offer.price && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{offer.price}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {editingOffers && (
            <div className="flex items-center gap-2 mt-3">
              <button className="btn-primary text-xs py-2" onClick={saveOffers} disabled={savingOffers}>
                {savingOffers ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Simpan
              </button>
              <button className="btn-secondary text-xs py-2" onClick={addOfferStep}>
                <Plus className="w-3 h-3" /> Tambah Step
              </button>
            </div>
          )}
        </div>

        {/* ══════════════ CONTENT LIBRARY + GROWTH ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Content Library Stats */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Content Library
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Ide', value: plannerStats.total, color: 'var(--text-primary)' },
                { label: 'Scripting', value: plannerStats.scripting, color: '#60a5fa' },
                { label: 'Siap Posting', value: plannerStats.ready, color: '#fbbf24' },
                { label: 'Selesai', value: plannerStats.done, color: '#34d399' },
              ].map(s => (
                <div key={s.label} className="glass-card p-4 cursor-pointer" onClick={() => onModuleChange('planner')}>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <button className="btn-ghost text-xs mt-2" style={{ color: '#f2ca50' }} onClick={() => onModuleChange('planner')}>
              Buka Content Planner <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          {/* Platform Growth Tracker */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />Growth Tracker
            </h3>
            <div className="glass-card p-5">
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <DonutChart value={growthScore} size={100} strokeWidth={8} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold" style={{ color: '#f2ca50' }}>{growthScore}%</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Score</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {totalFollowers.toLocaleString()} Total Followers
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {activePlatforms} platform aktif • +{totalGrowth}% total growth
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {PLATFORMS.map(({ key, label, icon: PIcon, color }) => {
                  const stat = platformStats[key] || { followers: 0, growth: 0 }
                  const isExpanded = expandedPlatform === key
                  const isEditing = editingPlatform === key

                  return (
                    <div key={key}>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                        style={{
                          background: isExpanded ? 'var(--bg-surface-hover)' : 'transparent',
                          color: 'var(--text-primary)',
                        }}
                        onClick={() => { setExpandedPlatform(isExpanded ? null : key); setEditingPlatform(null) }}
                      >
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: color + '20', color }}>
                          {typeof PIcon === 'function' ? <PIcon /> : <PIcon className="w-3.5 h-3.5" />}
                        </div>
                        <span className="flex-1 text-left text-sm truncate">{label}</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {(stat.followers || 0).toLocaleString()}
                        </span>
                        {stat.growth > 0 && (
                          <span className="text-xs text-green-400">+{stat.growth}%</span>
                        )}
                        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                       style={{ color: 'var(--text-muted)' }} />
                      </button>

                      {isExpanded && (
                        <div className="ml-9 mr-3 mt-1 mb-2 p-3 rounded-lg animate-slide-up" style={{ background: 'var(--bg-input)' }}>
                          {isEditing ? (
                            <div className="space-y-2">
                              <div>
                                <label className="label-base text-xs">Followers</label>
                                <input type="number" className="input-base text-sm py-1.5"
                                  value={tempPlatform.followers}
                                  onChange={e => setTempPlatform(p => ({ ...p, followers: Number(e.target.value) }))} />
                              </div>
                              <div>
                                <label className="label-base text-xs">Growth (%)</label>
                                <input type="number" className="input-base text-sm py-1.5"
                                  value={tempPlatform.growth}
                                  onChange={e => setTempPlatform(p => ({ ...p, growth: Number(e.target.value) }))} />
                              </div>
                              <div className="flex gap-2">
                                <button className="btn-primary text-xs py-1.5" onClick={() => savePlatformStat(key)}>
                                  <Save className="w-3 h-3" /> Simpan
                                </button>
                                <button className="btn-ghost text-xs" onClick={() => setEditingPlatform(null)}>Batal</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                  <Users className="w-3 h-3 inline mr-1" />
                                  {(stat.followers || 0).toLocaleString()} followers
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                  Growth: {stat.growth || 0}% bulan ini
                                </p>
                              </div>
                              <button className="btn-ghost text-xs" style={{ color: '#f2ca50' }}
                                onClick={() => { setEditingPlatform(key); setTempPlatform({ followers: stat.followers || 0, growth: stat.growth || 0 }) }}>
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ PROJECTS (COMING SOON) ══════════════ */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Projects
          </h3>
          <div className="glass-card p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2"
                 style={{ background: 'var(--gold-glow)', color: '#f2ca50', border: '1px solid rgba(242,202,80,0.2)' }}>
              Coming Soon
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Kelola endorsement, kolaborasi, dan project brand Anda di sini.
            </p>
          </div>
        </div>

        {/* ══════════════ MODULE NAVIGATION CARDS ══════════════ */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Modul
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MODULE_CARDS.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => onModuleChange(id)}
                className="glass-card p-4 text-left transition-all duration-150 hover:shadow-lg group"
                style={{ '--tw-shadow-color': 'rgba(242,202,80,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242,202,80,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                     style={{ background: 'var(--gold-glow)', color: '#f2ca50' }}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: '#f2ca50' }}>
                  Buka <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Helper: Info Row in Brand Card ── */
function InfoRow({ label, value, action, full }) {
  return (
    <div className={`flex items-start gap-2 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs font-medium flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)', minWidth: '90px' }}>
        {label}
      </span>
      <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>{value}</span>
      {action && (
        <button onClick={action} className="flex-shrink-0 mt-0.5" style={{ color: '#f2ca50' }}>
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
