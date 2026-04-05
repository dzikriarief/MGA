import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import { ModuleLayout, FormCard, Field, TextareaField, GenerateButton, InfoBanner } from '../components/ui/ModuleUI'
import {
  Plus, Trash2, Edit3, Save, X, Loader2, Tag,
  DollarSign, Zap, Archive, ChevronDown, ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Draft:    { bg: 'rgba(113,113,122,0.12)', color: '#71717a' },
  Active:   { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  Archived: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
}

function OfferCard({ offer, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_COLORS[offer.status] || STATUS_COLORS.Draft

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase" style={{ background: st.bg, color: st.color }}>{offer.status}</span>
            {offer.harga && <span className="text-xs font-semibold" style={{ color: '#f2ca50' }}>{offer.harga}</span>}
          </div>
          <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>{offer.nama}</h3>
          {offer.tagline && <p className="text-xs italic mt-0.5" style={{ color: 'var(--text-muted)' }}>"{offer.tagline}"</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button onClick={() => onEdit(offer)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(offer.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)} className="text-xs font-medium mt-3 flex items-center gap-1 w-full" style={{ color: '#f2ca50' }}>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Sembunyikan' : 'Lihat'} Detail
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {offer.deskripsi && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              {offer.deskripsi}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Format Delivery', offer.format_delivery],
              ['Target Audience', offer.target_audience],
            ].map(([label, val]) => val && (
              <div key={label} className="p-2 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{val}</p>
              </div>
            ))}
          </div>
          {offer.unique_value && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(242,202,80,0.06)', border: '1px solid rgba(242,202,80,0.15)' }}>
              <p className="text-[10px] uppercase font-semibold" style={{ color: '#f2ca50' }}>Unique Value Proposition</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{offer.unique_value}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Offers() {
  const { user, profile } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({
    nama: '', tagline: '', deskripsi: '', harga: '', format_delivery: '', target_audience: '', unique_value: '', status: 'Draft'
  })

  const fetchOffers = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('brand_offers').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setOffers(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchOffers() }, [fetchOffers])

  function resetForm() {
    setForm({ nama: '', tagline: '', deskripsi: '', harga: '', format_delivery: '', target_audience: '', unique_value: '', status: 'Draft' })
    setEditId(null)
    setShowForm(false)
  }

  function startEdit(offer) {
    setForm({
      nama: offer.nama, tagline: offer.tagline || '', deskripsi: offer.deskripsi || '', harga: offer.harga || '',
      format_delivery: offer.format_delivery || '', target_audience: offer.target_audience || '',
      unique_value: offer.unique_value || '', status: offer.status || 'Draft'
    })
    setEditId(offer.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.nama.trim()) { toast.error('Nama offer wajib diisi'); return }
    setSaving(true)
    try {
      const payload = { ...form, user_id: user.id }
      if (editId) {
        const { error } = await supabase.from('brand_offers').update(payload).eq('id', editId)
        if (error) throw error
        toast.success('Offer diperbarui ✓')
      } else {
        const { error } = await supabase.from('brand_offers').insert(payload)
        if (error) throw error
        toast.success('Offer ditambahkan ✓')
      }
      resetForm()
      fetchOffers()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus offer ini?')) return
    await supabase.from('brand_offers').delete().eq('id', id)
    toast.success('Dihapus ✓')
    fetchOffers()
  }

  function buildOfferPrompt() {
    const niche = profile?.niche_final || profile?.niche || ''
    const audience = profile?.target_audience || ''
    return `Kamu adalah Brand Strategist dan Product Designer expert.

Saya memiliki personal brand di niche: **${niche}**
Target audience saya: **${audience}**

Tolong bantu saya merancang konsep penawaran/produk personal brand yang kuat. Untuk setiap offer, berikan:

1. **Nama Produk/Jasa** — nama yang menarik dan memorable
2. **Tagline** — satu kalimat penjelas
3. **Deskripsi** — penjelasan lengkap apa yang didapat customer
4. **Format Delivery** — cara penyampaian (ebook, video course, 1-on-1 coaching, workshop, dll)
5. **Target Audience Spesifik** — siapa yang paling cocok untuk offer ini
6. **Unique Value Proposition** — apa yang membedakan dari kompetitor
7. **Range Harga yang Disarankan** — dengan justifikasi

Buat 3 konsep offer yang berbeda level (low-ticket, mid-ticket, high-ticket).
Gunakan bahasa Indonesia yang profesional.`
  }

  function handleGenerateOffer() {
    const niche = profile?.niche_final || profile?.niche
    if (!niche) { toast.error('Lengkapi niche Anda di modul Niche Finder terlebih dahulu.'); return false }
    generateAndRedirect(buildOfferPrompt())
  }

  const filteredOffers = filterStatus === 'all' ? offers : offers.filter(o => o.status === filterStatus)

  return (
    <ModuleLayout title="💎 Offers" subtitle="Rancang dan kelola penawaran personal brand Anda — dari konsep hingga harga.">
      {/* AI Generate */}
      <FormCard>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Belum punya ide? Gunakan AI untuk brainstorm konsep offer berdasarkan niche dan audience Anda.
        </p>
        <GenerateButton onClick={handleGenerateOffer} label="Brainstorm Konsep Offer" />
      </FormCard>

      {/* Filter + Add */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 flex-1">
          {['all', 'Draft', 'Active', 'Archived'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterStatus === s ? 'rgba(242,202,80,0.1)' : 'transparent',
                color: filterStatus === s ? '#f2ca50' : 'var(--text-muted)',
                border: filterStatus === s ? '1px solid rgba(242,202,80,0.2)' : '1px solid var(--border-color)'
              }}>
              {s === 'all' ? 'Semua' : s}
            </button>
          ))}
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> Tambah Offer
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <FormCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit' : 'Tambah'} Offer</h3>
            <button onClick={resetForm} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
          </div>
          <Field id="offer-nama" label="Nama Offer" value={form.nama} onChange={v => setForm(f => ({ ...f, nama: v }))} placeholder="Contoh: Personal Brand Accelerator Program" />
          <Field id="offer-tagline" label="Tagline" value={form.tagline} onChange={v => setForm(f => ({ ...f, tagline: v }))} placeholder="Satu kalimat penjelas..." />
          <TextareaField id="offer-desc" label="Deskripsi Lengkap" value={form.deskripsi} onChange={v => setForm(f => ({ ...f, deskripsi: v }))} placeholder="Jelaskan apa yang didapat customer..." rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Field id="offer-harga" label="Harga" value={form.harga} onChange={v => setForm(f => ({ ...f, harga: v }))} placeholder="Rp 499.000" />
            <Field id="offer-format" label="Format Delivery" value={form.format_delivery} onChange={v => setForm(f => ({ ...f, format_delivery: v }))} placeholder="Video course, ebook, dll" />
          </div>
          <Field id="offer-target" label="Target Audience" value={form.target_audience} onChange={v => setForm(f => ({ ...f, target_audience: v }))} placeholder="Siapa yang paling cocok?" />
          <TextareaField id="offer-uvp" label="Unique Value Proposition" value={form.unique_value} onChange={v => setForm(f => ({ ...f, unique_value: v }))} placeholder="Apa yang membedakan offer Anda?" rows={2} />
          <div>
            <label className="label-base">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-base">
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId ? 'Update' : 'Simpan'} Offer
          </button>
        </FormCard>
      )}

      {/* Offer Cards */}
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: '#f2ca50' }} /></div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada offer. Mulai rancang penawaran Anda!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map(o => (
            <OfferCard key={o.id} offer={o} onEdit={startEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </ModuleLayout>
  )
}
