import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { ModuleLayout, FormCard, Field, TextareaField, GenerateButton, InfoBanner } from '../components/ui/ModuleUI'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Users, Eye, TrendingUp, DollarSign, Loader2, Instagram, Youtube,
  BarChart3, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const PLATFORM_TABS = [
  { key: 'Short-form', label: 'Short-form (Instagram)', icon: Instagram },
  { key: 'Long-form', label: 'Long-form (YouTube)', icon: Youtube },
]

function TopKontenEditor({ items, onChange }) {
  function update(idx, field, val) {
    const copy = [...items]
    copy[idx] = { ...copy[idx], [field]: val }
    onChange(copy)
  }
  function add() { onChange([...items, { title: '', link: '' }]) }
  function remove(idx) { onChange(items.filter((_, i) => i !== idx)) }

  return (
    <div>
      <label className="label-base">Top 10 Konten (Link)</label>
      <div className="space-y-2 mt-1">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
            <input value={item.title} onChange={e => update(i, 'title', e.target.value)}
              placeholder="Judul konten" className="input-base text-sm py-1.5 flex-1" />
            <input value={item.link} onChange={e => update(i, 'link', e.target.value)}
              placeholder="https://..." className="input-base text-sm py-1.5 flex-1" />
            <button type="button" onClick={() => remove(i)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {items.length < 10 && (
        <button type="button" onClick={add} className="text-xs font-medium mt-2 flex items-center gap-1"
          style={{ color: '#f2ca50' }}>
          <Plus className="w-3 h-3" /> Tambah konten
        </button>
      )}
    </div>
  )
}

function CompetitorCard({ comp, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const topKonten = Array.isArray(comp.top_konten) ? comp.top_konten : []

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
          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: comp.platform === 'Short-form' ? 'rgba(131,56,236,0.12)' : 'rgba(255,0,0,0.1)',
              color: comp.platform === 'Short-form' ? '#8338ec' : '#ff0000' }}>
            {comp.platform === 'Short-form' ? 'IG' : 'YT'}
          </span>
          <button onClick={() => onEdit(comp)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(comp.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="p-2.5 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <p className="text-lg font-bold" style={{ color: '#f2ca50' }}>{(comp.followers || 0).toLocaleString()}</p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Followers</p>
        </div>
        <div className="p-2.5 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{comp.niche || '—'}</p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Niche</p>
        </div>
        <div className="p-2.5 rounded-lg text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{topKonten.length}</p>
          <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Top Konten</p>
        </div>
      </div>

      {comp.bio && <p className="text-xs mt-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{comp.bio}</p>}
      {comp.produk && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}><strong>Produk:</strong> {comp.produk}</p>}

      {topKonten.length > 0 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs font-medium mt-3 flex items-center gap-1 w-full" style={{ color: '#f2ca50' }}>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Sembunyikan' : 'Lihat'} Top Konten
        </button>
      )}
      {expanded && topKonten.length > 0 && (
        <div className="mt-2 space-y-1">
          {topKonten.map((k, i) => (
            <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded" style={{ background: 'var(--bg-primary)' }}>
              <span className="font-mono w-4 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
              <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{k.title || 'Untitled'}</span>
              {k.link && <a href={k.link} target="_blank" rel="noreferrer" className="text-xs" style={{ color: '#f2ca50' }}>🔗</a>}
            </div>
          ))}
        </div>
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
  const [form, setForm] = useState({ username: '', name: '', niche: '', bio: '', produk: '', followers: 0, top_konten: [], notes: '' })

  // TAM-SAM-SOM state
  const [activeSection, setActiveSection] = useState('research') // 'research' | 'tamsamsom'
  const [market, setMarket] = useState({ tam_value: 0, tam_desc: '', sam_value: 0, sam_desc: '', som_value: 0, som_desc: '', avg_revenue_user: 0, assumptions: '' })
  const [marketSaving, setMarketSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('competitors').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setCompetitors(data || [])

    const { data: mkt } = await supabase.from('market_estimation').select('*').eq('user_id', user.id).single()
    if (mkt) setMarket(mkt)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm() {
    setForm({ username: '', name: '', niche: '', bio: '', produk: '', followers: 0, top_konten: [], notes: '' })
    setEditId(null)
    setShowForm(false)
  }

  function startEdit(comp) {
    setForm({
      username: comp.username, name: comp.name || '', niche: comp.niche || '',
      bio: comp.bio || '', produk: comp.produk || '', followers: comp.followers || 0,
      top_konten: Array.isArray(comp.top_konten) ? comp.top_konten : [], notes: comp.notes || ''
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

  async function saveMarket() {
    setMarketSaving(true)
    try {
      const monthlyEst = (market.som_value || 0) * (market.avg_revenue_user || 0)
      const payload = { ...market, user_id: user.id, monthly_revenue_est: monthlyEst, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('market_estimation').upsert(payload, { onConflict: 'user_id' })
      if (error) throw error
      toast.success('Estimasi pasar disimpan ✓')
    } catch (err) { toast.error(err.message) }
    finally { setMarketSaving(false) }
  }

  const filtered = competitors.filter(c => c.platform === platformTab)
  const monthlyRevenue = (market.som_value || 0) * (market.avg_revenue_user || 0)

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
                <Field id="comp-followers" label="Followers" value={form.followers} onChange={v => setForm(f => ({ ...f, followers: v }))} type="number" placeholder="10000" />
              </div>
              <TextareaField id="comp-bio" label="Bio" value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Bio/deskripsi akun..." rows={2} />
              <Field id="comp-produk" label="Produk / Layanan" value={form.produk} onChange={v => setForm(f => ({ ...f, produk: v }))} placeholder="Ebook, course, coaching..." />
              <TopKontenEditor items={form.top_konten} onChange={v => setForm(f => ({ ...f, top_konten: v }))} />
              <TextareaField id="comp-notes" label="Catatan Riset" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Insights, strategi yang mereka pakai..." rows={2} />
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
                <CompetitorCard key={c.id} comp={c} onEdit={startEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ TAM-SAM-SOM SECTION ═══ */}
      {activeSection === 'tamsamsom' && (
        <>
          {/* Guide Banner */}
          <InfoBanner>
            <strong>Cara menghitung TAM-SAM-SOM:</strong><br/>
            • <strong>TAM</strong> = Total orang di Indonesia yang tertarik dengan niche Anda (misal: 10 juta orang tertarik keuangan syariah)<br/>
            • <strong>SAM</strong> = Dari TAM, berapa yang aktif di platform Anda dan bisa dijangkau (misal: 500rb yang aktif di Instagram)<br/>
            • <strong>SOM</strong> = Dari SAM, berapa yang realistis bisa jadi customer Anda dalam 1 tahun (misal: 5.000 orang)<br/>
            • <strong>Avg Revenue/User</strong> = Rata-rata pendapatan per customer per bulan (dari produk/jasa Anda)<br/>
            <em>Gunakan data dari riset kompetitor sebagai referensi!</em>
          </InfoBanner>

          <FormCard>
            {/* TAM */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
                  <BarChart3 className="w-4 h-4" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>TAM — Total Addressable Market</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total ukuran pasar secara keseluruhan</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">Jumlah (orang)</label>
                  <input type="number" value={market.tam_value} onChange={e => setMarket(m => ({ ...m, tam_value: parseFloat(e.target.value) || 0 }))} className="input-base" placeholder="10000000" />
                </div>
                <div>
                  <label className="label-base">Keterangan</label>
                  <input value={market.tam_desc || ''} onChange={e => setMarket(m => ({ ...m, tam_desc: e.target.value }))} className="input-base" placeholder="Sumber data, asumsi..." />
                </div>
              </div>
            </div>

            {/* SAM */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>SAM — Serviceable Available Market</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Segmen yang bisa dijangkau platform Anda</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">Jumlah (orang)</label>
                  <input type="number" value={market.sam_value} onChange={e => setMarket(m => ({ ...m, sam_value: parseFloat(e.target.value) || 0 }))} className="input-base" placeholder="500000" />
                </div>
                <div>
                  <label className="label-base">Keterangan</label>
                  <input value={market.sam_desc || ''} onChange={e => setMarket(m => ({ ...m, sam_desc: e.target.value }))} className="input-base" placeholder="Cara menghitung..." />
                </div>
              </div>
            </div>

            {/* SOM */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
                  <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>SOM — Serviceable Obtainable Market</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target realistis yang bisa Anda capai</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">Jumlah (orang)</label>
                  <input type="number" value={market.som_value} onChange={e => setMarket(m => ({ ...m, som_value: parseFloat(e.target.value) || 0 }))} className="input-base" placeholder="5000" />
                </div>
                <div>
                  <label className="label-base">Avg Revenue / User / Bulan (Rp)</label>
                  <input type="number" value={market.avg_revenue_user} onChange={e => setMarket(m => ({ ...m, avg_revenue_user: parseFloat(e.target.value) || 0 }))} className="input-base" placeholder="150000" />
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(242,202,80,0.08)', border: '1px solid rgba(242,202,80,0.2)' }}>
              <p className="text-xs uppercase font-semibold tracking-wide mb-1" style={{ color: '#f2ca50' }}>Estimasi Revenue / Bulan</p>
              <p className="text-3xl font-bold" style={{ color: '#f2ca50' }}>Rp {monthlyRevenue.toLocaleString('id-ID')}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>SOM ({(market.som_value || 0).toLocaleString()}) × Rp {(market.avg_revenue_user || 0).toLocaleString('id-ID')}/user</p>
            </div>

            <TextareaField id="market-assumptions" label="Asumsi & Catatan" value={market.assumptions || ''} onChange={v => setMarket(m => ({ ...m, assumptions: v }))} placeholder="Tulis asumsi perhitungan Anda di sini..." rows={3} />

            <button onClick={saveMarket} disabled={marketSaving} className="btn-primary">
              {marketSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Estimasi
            </button>
          </FormCard>
        </>
      )}
    </ModuleLayout>
  )
}
