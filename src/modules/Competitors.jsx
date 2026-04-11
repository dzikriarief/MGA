import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { ModuleLayout, FormCard, Field, TextareaField, GenerateButton, InfoBanner } from '../components/ui/ModuleUI'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Users, TrendingUp, DollarSign, Loader2, Instagram, Youtube,
  BarChart3, ExternalLink, Copy, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

const PLATFORM_TABS = [
  { key: 'Short-form', label: 'Short-form (Instagram)', icon: Instagram },
  { key: 'Long-form', label: 'Long-form (YouTube)', icon: Youtube },
]

/* ═══════════ PRODUCT EDITOR ═══════════ */
function ProductEditor({ items, onChange }) {
  const list = Array.isArray(items) ? items : []
  function update(idx, field, val) {
    const copy = [...list]; copy[idx] = { ...copy[idx], [field]: val }; onChange(copy)
  }
  function add() { onChange([...list, { name: '', price: '' }]) }
  function remove(idx) { onChange(list.filter((_, i) => i !== idx)) }

  return (
    <div>
      <label className="label-base">Produk / Layanan & Harga</label>
      <div className="space-y-2 mt-1">
        {list.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={item.name} onChange={e => update(i, 'name', e.target.value)}
              placeholder="Nama produk/jasa" className="input-base text-sm py-1.5 flex-1" />
            <input value={item.price} onChange={e => update(i, 'price', e.target.value)}
              placeholder="Rp 500.000" className="input-base text-sm py-1.5 w-32" />
            <button type="button" onClick={() => remove(i)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="text-xs font-medium mt-2 flex items-center gap-1" style={{ color: '#f2ca50' }}>
        <Plus className="w-3 h-3" /> Tambah produk
      </button>
    </div>
  )
}

/* ═══════════ TOP KONTEN EDITOR (with views + breakdown) ═══════════ */
function TopKontenEditor({ items, onChange }) {
  const list = Array.isArray(items) ? items : []
  function update(idx, field, val) {
    const copy = [...list]; copy[idx] = { ...copy[idx], [field]: val }; onChange(copy)
  }
  function add() { onChange([...list, { title: '', link: '', views: '', breakdown: '' }]) }
  function remove(idx) { onChange(list.filter((_, i) => i !== idx)) }

  return (
    <div>
      <label className="label-base">Top 10 Konten (Link, Views & Breakdown)</label>
      <div className="space-y-3 mt-1">
        {list.map((item, i) => (
          <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
              <input value={item.title} onChange={e => update(i, 'title', e.target.value)}
                placeholder="Judul konten" className="input-base text-sm py-1.5 flex-1" />
              <button type="button" onClick={() => remove(i)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-7">
              <input value={item.link || ''} onChange={e => update(i, 'link', e.target.value)}
                placeholder="https://..." className="input-base text-xs py-1" />
              <input value={item.views || ''} onChange={e => update(i, 'views', e.target.value)}
                placeholder="Views (misal: 1.2M)" className="input-base text-xs py-1" />
            </div>
            <div className="pl-7">
              <input value={item.breakdown || ''} onChange={e => update(i, 'breakdown', e.target.value)}
                placeholder="Breakdown: ide apa, hook apa, style editing gimana..." className="input-base text-xs py-1 w-full" />
            </div>
          </div>
        ))}
      </div>
      {list.length < 10 && (
        <button type="button" onClick={add} className="text-xs font-medium mt-2 flex items-center gap-1" style={{ color: '#f2ca50' }}>
          <Plus className="w-3 h-3" /> Tambah konten
        </button>
      )}
    </div>
  )
}

/* ═══════════ CHIP SELECTOR ═══════════ */
function ChipSelector({ label, options, value, onChange }) {
  return (
    <div>
      <label className="label-base">{label}</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: value === opt ? 'rgba(242,202,80,0.15)' : 'var(--bg-input)',
              color: value === opt ? '#f2ca50' : 'var(--text-secondary)',
              border: value === opt ? '1px solid rgba(242,202,80,0.4)' : '1px solid var(--border-color)',
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════ COMPETITOR CARD ═══════════ */
function CompetitorCard({ comp, isLongForm, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const topKonten = Array.isArray(comp.top_konten) ? comp.top_konten : []
  const products = Array.isArray(comp.products) ? comp.products : []
  const followerLabel = isLongForm ? 'Subscribers' : 'Followers'

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #f2ca50, #c9a23c)', color: '#1a1a1a' }}>
            {(comp.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>@{comp.username}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{comp.name || 'Unnamed'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(comp)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(comp.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{ background: comp.platform === 'Short-form' ? 'rgba(131,56,236,0.12)' : 'rgba(255,0,0,0.1)', color: comp.platform === 'Short-form' ? '#8338ec' : '#ff0000' }}>
          {comp.platform === 'Short-form' ? 'IG' : 'YT'}
        </span>
        {comp.scope && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{comp.scope}</span>}
        {comp.niche_relevance && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{comp.niche_relevance}</span>}
        {comp.ticket_level && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{comp.ticket_level}</span>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="p-2.5 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <p className="text-lg font-bold" style={{ color: '#f2ca50' }}>{(comp.followers || 0).toLocaleString()}</p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{followerLabel}</p>
        </div>
        <div className="p-2.5 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{comp.niche || '—'}</p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Niche</p>
        </div>
        <div className="p-2.5 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{products.length || 0}</p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Produk</p>
        </div>
      </div>

      {comp.bio && <p className="text-xs mt-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{comp.bio}</p>}

      {/* Products */}
      {products.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Produk/Layanan</p>
          {products.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{p.name || 'Unnamed'}</span>
              <span className="font-medium" style={{ color: '#f2ca50' }}>{p.price || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expand for top konten */}
      <button onClick={() => setExpanded(!expanded)} className="text-xs font-medium mt-3 flex items-center gap-1 w-full" style={{ color: '#f2ca50' }}>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Sembunyikan' : `Lihat Top Konten (${topKonten.length})`}
      </button>
      {expanded && topKonten.length > 0 && (
        <div className="mt-2 space-y-2">
          {topKonten.map((k, i) => (
            <div key={i} className="p-2 rounded text-xs space-y-0.5" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono w-4 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                <span className="flex-1 truncate font-medium" style={{ color: 'var(--text-primary)' }}>{k.title || 'Untitled'}</span>
                {k.views && <span style={{ color: '#f2ca50' }}>👁 {k.views}</span>}
                {k.link && <a href={k.link} target="_blank" rel="noreferrer" style={{ color: '#f2ca50' }}><ExternalLink className="w-3 h-3" /></a>}
              </div>
              {k.breakdown && <p className="pl-6" style={{ color: 'var(--text-muted)' }}>💡 {k.breakdown}</p>}
            </div>
          ))}
        </div>
      )}

      {comp.notes && (
        <p className="text-xs mt-2 p-2.5 rounded-lg italic" style={{ background: 'rgba(242,202,80,0.04)', border: '1px solid rgba(242,202,80,0.1)', color: 'var(--text-muted)' }}>
          📝 {comp.notes}
        </p>
      )}
    </div>
  )
}

/* ═══════════════════════ MAIN MODULE ═══════════════════════ */
export default function Competitors() {
  const { user, profile } = useAuth()
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [platformTab, setPlatformTab] = useState('Short-form')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    username: '', name: '', niche: '', bio: '', produk: '', followers: 0,
    top_konten: [], notes: '', scope: 'Lokal', niche_relevance: 'Satu Niche',
    ticket_level: 'Low Ticket', products: []
  })

  // Section tabs
  const [activeSection, setActiveSection] = useState('research') // 'research' | 'tamsamsom'
  // Revenue guide toggle
  const [showGuide, setShowGuide] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('competitors').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setCompetitors(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm() {
    setForm({
      username: '', name: '', niche: '', bio: '', produk: '', followers: 0,
      top_konten: [], notes: '', scope: 'Lokal', niche_relevance: 'Satu Niche',
      ticket_level: 'Low Ticket', products: []
    })
    setEditId(null)
    setShowForm(false)
  }

  function startEdit(comp) {
    setForm({
      username: comp.username, name: comp.name || '', niche: comp.niche || '',
      bio: comp.bio || '', produk: comp.produk || '', followers: comp.followers || 0,
      top_konten: Array.isArray(comp.top_konten) ? comp.top_konten : [],
      notes: comp.notes || '', scope: comp.scope || 'Lokal',
      niche_relevance: comp.niche_relevance || 'Satu Niche',
      ticket_level: comp.ticket_level || 'Low Ticket',
      products: Array.isArray(comp.products) ? comp.products : []
    })
    setEditId(comp.id)
    setPlatformTab(comp.platform || 'Short-form')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.username.trim()) { toast.error('Username wajib diisi'); return }
    setSaving(true)
    try {
      const payload = { ...form, user_id: user.id, platform: platformTab, followers: parseInt(form.followers) || 0 }
      if (editId) {
        const { error } = await supabase.from('competitors').update(payload).eq('id', editId)
        if (error) throw error
        toast.success('Kompetitor diperbarui ✓')
      } else {
        const { error } = await supabase.from('competitors').insert(payload)
        if (error) throw error
        toast.success('Kompetitor ditambahkan ✓')
      }
      resetForm()
      fetchData()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data kompetitor ini?')) return
    await supabase.from('competitors').delete().eq('id', id)
    toast.success('Dihapus ✓')
    fetchData()
  }

  /* ═══ Revenue Reverse-Engineering Calculator ═══ */
  function calcRevenueEstimates() {
    const results = competitors.map(c => {
      const fol = c.followers || 0
      const products = Array.isArray(c.products) ? c.products : []
      // Parse average product price
      let avgPrice = 0
      if (products.length > 0) {
        const prices = products.map(p => parseInt(String(p.price || '0').replace(/[^0-9]/g, '')) || 0).filter(p => p > 0)
        avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
      }
      const estBuyers = Math.round(fol * 0.001)
      const estRevenue = estBuyers * avgPrice
      return { ...c, avgPrice, estBuyers, estRevenue }
    }).filter(c => c.avgPrice > 0)
    return results
  }

  function buildDeepResearchPrompt() {
    const niche = profile?.niche_final || profile?.niche || '[belum diisi]'
    const compList = competitors.map(c => `@${c.username} (${c.niche}, ${(c.followers || 0).toLocaleString()} followers)`).join('\n')
    return `Lakukan riset mendalam tentang market dan revenue di niche "${niche}" di Indonesia.

Data kompetitor yang sudah saya kumpulkan:
${compList || '(belum ada data kompetitor)'}

Tugas:
1. Analisa revenue model yang umum digunakan creator/brand di niche "${niche}"
2. Estimasi rata-rata pendapatan bulanan creator dengan 10K, 50K, 100K, 500K followers
3. Identifikasi sweet spot harga produk untuk niche ini
4. Analisa tren pertumbuhan market niche ini di Indonesia (2024-2025)
5. Rekomendasi strategi monetisasi terbaik untuk pemula di niche ini

Berikan data kuantitatif sebanyak mungkin, sertakan sumber jika ada.`
  }

  async function handleCopyResearchPrompt() {
    const prompt = buildDeepResearchPrompt()
    await navigator.clipboard.writeText(prompt)
    toast.success('Prompt riset tersalin! Pilih AI di bawah.')
  }

  const filtered = competitors.filter(c => c.platform === platformTab)
  const revenueData = calcRevenueEstimates()
  const totalEstRevenue = revenueData.reduce((sum, c) => sum + c.estRevenue, 0)

  const followerLabel = platformTab === 'Long-form' ? 'Subscribers' : 'Followers'

  return (
    <ModuleLayout title="🔍 Riset Competitors" subtitle="Kumpulkan data riset kompetitor dan estimasi potensi revenue di niche Anda.">
      {/* Section Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
        {[
          { key: 'research', label: 'Riset Akun', icon: Users },
          { key: 'tamsamsom', label: 'Revenue Estimator', icon: DollarSign },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
            style={{ background: activeSection === key ? 'var(--bg-surface)' : 'transparent', color: activeSection === key ? '#f2ca50' : 'var(--text-secondary)', boxShadow: activeSection === key ? 'var(--shadow-card)' : 'none' }}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ═══ RESEARCH SECTION ═══ */}
      {activeSection === 'research' && (
        <>
          {/* Platform Tabs */}
          <div className="flex gap-2">
            {PLATFORM_TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setPlatformTab(key)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: platformTab === key ? 'rgba(242,202,80,0.1)' : 'var(--bg-surface)', color: platformTab === key ? '#f2ca50' : 'var(--text-secondary)', border: platformTab === key ? '1px solid rgba(242,202,80,0.25)' : '1px solid var(--border-color)' }}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* Add / Edit Form */}
          {showForm ? (
            <FormCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit' : 'Tambah'} Kompetitor</h3>
                <button onClick={resetForm} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field id="comp-username" label="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="@username" />
                <Field id="comp-name" label="Nama" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nama lengkap" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field id="comp-niche" label="Niche" value={form.niche} onChange={v => setForm(f => ({ ...f, niche: v }))} placeholder="Niche mereka" />
                <Field id="comp-followers" label={followerLabel} value={form.followers} onChange={v => setForm(f => ({ ...f, followers: v }))} type="number" placeholder="10000" />
              </div>
              <TextareaField id="comp-bio" label="Bio" value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Bio/deskripsi akun..." rows={2} />

              {/* Chip selectors */}
              <ChipSelector label="Jangkauan Akun" options={['Lokal', 'Global']} value={form.scope} onChange={v => setForm(f => ({ ...f, scope: v }))} />
              <ChipSelector label="Relevansi Niche" options={['Satu Niche', 'Masih Berhubungan', 'Beda Niche']} value={form.niche_relevance} onChange={v => setForm(f => ({ ...f, niche_relevance: v }))} />
              <ChipSelector label="Ticket Level" options={['Low Ticket', 'High Ticket', 'Keduanya']} value={form.ticket_level} onChange={v => setForm(f => ({ ...f, ticket_level: v }))} />

              {/* Products */}
              <ProductEditor items={form.products} onChange={v => setForm(f => ({ ...f, products: v }))} />

              {/* Top Konten */}
              <TopKontenEditor items={form.top_konten} onChange={v => setForm(f => ({ ...f, top_konten: v }))} />

              <TextareaField id="comp-notes" label="📝 Catatan Riset (insights, strategi, keyword winning, pesan utama yang selalu diulang)" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Apa strategi utama mereka? Keyword apa yang sering dipakai? Pesan apa yang selalu diulang? Insight unik apa yang Anda temukan?" rows={3} />

              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editId ? 'Update' : 'Simpan'} Kompetitor
              </button>
            </FormCard>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-secondary w-full justify-center">
              <Plus className="w-4 h-4" /> Tambah Kompetitor {platformTab === 'Short-form' ? 'Instagram' : 'YouTube'}
            </button>
          )}

          {/* Competitor Cards */}
          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: '#f2ca50' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada kompetitor {platformTab === 'Short-form' ? 'Instagram' : 'YouTube'} yang ditambahkan.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map(c => (
                <CompetitorCard key={c.id} comp={c} isLongForm={platformTab === 'Long-form'} onEdit={startEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ REVENUE ESTIMATOR SECTION ═══ */}
      {activeSection === 'tamsamsom' && (
        <>
          {/* Collapsible Guide */}
          <div className="glass-card overflow-hidden">
            <button onClick={() => setShowGuide(!showGuide)} className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold"
              style={{ color: '#f2ca50' }}>
              <span>📖 Cara Menghitung Revenue Estimation</span>
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showGuide && (
              <div className="px-5 pb-4 text-xs space-y-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <p className="pt-3"><strong>Formula Reverse-Engineering:</strong></p>
                <div className="p-3 rounded-lg font-mono text-center" style={{ background: 'rgba(242,202,80,0.06)', border: '1px solid rgba(242,202,80,0.15)', color: '#f2ca50' }}>
                  Followers × 0.1% × Harga Produk = Est. Revenue/Bulan
                </div>
                <p>• <strong>0.1%</strong> = Asumsi konservatif pembeli bulanan dari total followers</p>
                <p>• Masukkan data produk & harga di setiap kompetitor untuk kalkulasi otomatis</p>
                <p>• Data ini menjadi patokan <strong>Sweet Spot harga produk</strong> Anda</p>
                <p>• Untuk riset lebih dalam, gunakan fitur <strong>AI Deep Research</strong> di bawah</p>
              </div>
            )}
          </div>

          {/* Auto-calculated Revenue Table */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>📊 Revenue Estimation (Auto-Calculated)</h3>
              <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Based on competitor data</p>
            </div>

            {revenueData.length === 0 ? (
              <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
                <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Tambahkan data produk & harga di kompetitor untuk melihat estimasi revenue.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {['Kompetitor', 'Followers', 'Avg Harga', 'Est. Buyers/bln', 'Est. Revenue/bln'].map(h => (
                          <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>@{c.username}</td>
                          <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{(c.followers || 0).toLocaleString()}</td>
                          <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>Rp {c.avgPrice.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{c.estBuyers.toLocaleString()}</td>
                          <td className="px-3 py-2 font-bold" style={{ color: '#f2ca50' }}>Rp {c.estRevenue.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total & Sweet Spot */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(242,202,80,0.08)', border: '1px solid rgba(242,202,80,0.2)' }}>
                    <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: '#f2ca50' }}>Avg Revenue/bln (Kompetitor)</p>
                    <p className="text-xl font-bold" style={{ color: '#f2ca50' }}>Rp {Math.round(totalEstRevenue / revenueData.length).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: '#22c55e' }}>Sweet Spot Harga Produk</p>
                    <p className="text-xl font-bold" style={{ color: '#22c55e' }}>
                      Rp {Math.round(revenueData.reduce((a, b) => a + b.avgPrice, 0) / revenueData.length).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI Deep Research */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: '#f2ca50' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Deep Research</h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Generate prompt riset otomatis berdasarkan data kompetitor yang sudah diinput, lalu gunakan AI pilihan Anda.
            </p>
            <button onClick={handleCopyResearchPrompt} className="btn-primary w-full justify-center">
              <Copy className="w-4 h-4" /> Copy Prompt Riset ke Clipboard
            </button>
            <div className="flex gap-2">
              <a href="https://gemini.google.com/app" target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(66,133,244,0.1)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.2)' }}>
                🔬 Gemini Deep Research
              </a>
              <a href="https://claude.ai" target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(204,120,50,0.1)', color: '#cc7832', border: '1px solid rgba(204,120,50,0.2)' }}>
                🧠 Claude AI
              </a>
            </div>
          </div>
        </>
      )}
    </ModuleLayout>
  )
}
