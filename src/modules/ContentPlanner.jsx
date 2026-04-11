import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { ModuleLayout } from '../components/ui/ModuleUI'
import {
  PlusCircle, Trash2, Loader2, RefreshCw, CalendarDays, Filter,
  FileEdit, Save, X, ChevronDown, Instagram, Youtube
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Idea', 'Scripting', 'Ready', 'Done']

const PLATFORM_LIST = ['Instagram', 'Facebook', 'TikTok', 'Threads', 'Twitter', 'LinkedIn', 'YouTube']
const PLATFORM_EMOJI = {
  Instagram: '📸', Facebook: '📘', TikTok: '🎵', Threads: '🧵',
  Twitter: '𝕏', LinkedIn: '💼', YouTube: '▶️'
}

const FUNNEL_LIST = ['TOFU', 'MOFU', 'BOFU']
const FUNNEL_STYLE = {
  TOFU: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', label: '🔝 TOFU' },
  MOFU: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: '🤝 MOFU' },
  BOFU: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: '💰 BOFU' },
}

const STATUS_COLORS = {
  'Idea':      { bg: 'rgba(113,113,122,0.15)', text: '#a1a1aa', border: 'rgba(113,113,122,0.3)' },
  'Scripting': { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'Ready':     { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  'Done':      { bg: 'rgba(34,197,94,0.12)',   text: '#34d399', border: 'rgba(34,197,94,0.3)' },
}

function StatusBadge({ value, onChange }) {
  const c = STATUS_COLORS[value] || STATUS_COLORS['Idea']
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer focus:outline-none transition-all"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {STATUS_OPTIONS.map(s => (
        <option key={s} value={s} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{s}</option>
      ))}
    </select>
  )
}

/* ── Draft Editor Component ── */
function DraftEditor({ item, onClose, onSaved }) {
  const [draft, setDraft] = useState({
    hook: item.hook || '',
    foreshadow: item.foreshadow || '',
    body: item.body || '',
    cta: item.cta || '',
    caption: item.caption || '',
    script: item.script || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSaveDraft() {
    setSaving(true)
    const { error } = await supabase
      .from('content_planner')
      .update(draft)
      .eq('id', item.id)
    if (error) {
      toast.error('Gagal menyimpan draft: ' + error.message)
    } else {
      toast.success('Draft konten disimpan ✓')
      onSaved({ ...item, ...draft })
    }
    setSaving(false)
  }

  const fields = [
    { key: 'hook', label: '🪝 Hook (Kalimat Pembuka)', placeholder: 'Kalimat pembuka yang bikin orang berhenti scroll...', rows: 2 },
    { key: 'foreshadow', label: '🔮 Foreshadow', placeholder: 'Teaser singkat yang membuat penonton penasaran...', rows: 2 },
    { key: 'body', label: '📝 Body (Isi Konten)', placeholder: 'Poin-poin utama konten, jelaskan value yang diberikan...', rows: 5 },
    { key: 'cta', label: '📢 CTA (Call to Action)', placeholder: 'Ajakan untuk audiens (follow, like, comment, beli, dsb)...', rows: 2 },
    { key: 'caption', label: '💬 Caption', placeholder: 'Caption lengkap untuk posting konten ini...', rows: 3 },
    { key: 'script', label: '🎬 Script Lengkap (opsional)', placeholder: 'Script video full jika ada...', rows: 5 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col animate-scale-in"
           style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              <FileEdit className="w-4 h-4 inline mr-2" style={{ color: '#f2ca50' }} />
              Draft: {item.judul}
            </h3>
            {item.pilar && (
              <span className="badge mt-1" style={{ background: 'var(--gold-glow)', color: '#f2ca50', border: '1px solid rgba(242,202,80,0.25)' }}>
                {item.pilar}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {fields.map(({ key, label, placeholder, rows }) => (
            <div key={key}>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <textarea
                value={draft[key]}
                onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                rows={rows}
                placeholder={placeholder}
                className="input-base resize-none text-sm"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => exportDraft(item, draft, 'word')} className="btn-secondary text-xs py-1.5" title="Export ke Word">
              Export Word
            </button>
            <button type="button" onClick={() => exportDraft(item, draft, 'pdf')} className="btn-secondary text-xs py-1.5" title="Print / Print to PDF">
              Export PDF
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost">Tutup</button>
            <button onClick={handleSaveDraft} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


function generateDraftExportHTML(item, draft) {
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
  <title>Draft Content — ${item.judul}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body{font-family:'Inter',sans-serif;max-width:800px;margin:30px auto;padding:20px;color:#111;line-height:1.6;}
    .header{border-bottom:2px solid #f2ca50;padding-bottom:20px;margin-bottom:30px;}
    .title{font-size:28px;font-weight:700;margin:0 0 10px 0;letter-spacing:-0.5px;}
    .meta{font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;display:flex;gap:15px;}
    .badge{display:inline-block;padding:2px 8px;border-radius:4px;background:#f5f5f5;font-weight:600;}
    .section{margin-bottom:30px;page-break-inside:avoid;}
    .s-title{font-size:14px;font-weight:600;color:#f2ca50;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;}
    .s-content{background:#fafaf8;padding:20px;border:1px solid #eaeaea;border-radius:6px;white-space:pre-wrap;font-size:15px;color:#333;}
    @media print{body{padding:0;} .s-content{border:1px solid #ccc;}}
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size:12px;color:#888;margin-bottom:8px;">Muslim Growth Academy (MGA)</div>
    <h1 class="title">${item.judul}</h1>
    <div class="meta">
      <span>Status: <span class="badge">${item.status}</span></span>
      ${item.pilar ? `<span>Pilar: <span class="badge">${item.pilar}</span></span>` : ''}
    </div>
  </div>
  
  ${draft.hook ? `<div class="section"><div class="s-title">🪝 Hook</div><div class="s-content">${draft.hook}</div></div>` : ''}
  ${draft.foreshadow ? `<div class="section"><div class="s-title">🔮 Foreshadow</div><div class="s-content">${draft.foreshadow}</div></div>` : ''}
  ${draft.body ? `<div class="section"><div class="s-title">📝 Body / Isi Konten</div><div class="s-content">${draft.body}</div></div>` : ''}
  ${draft.cta ? `<div class="section"><div class="s-title">📢 Call to Action</div><div class="s-content">${draft.cta}</div></div>` : ''}
  ${draft.caption ? `<div class="section"><div class="s-title">💬 Caption</div><div class="s-content">${draft.caption}</div></div>` : ''}
  ${draft.script ? `<div class="section"><div class="s-title">🎬 Video Script</div><div class="s-content">${draft.script}</div></div>` : ''}
</body>
</html>`
}

function exportDraft(item, draft, format) {
  const html = generateDraftExportHTML(item, draft)
  if (format === 'word') {
    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-word;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Draft-${item.judul.replace(/[^a-z0-9]/gi, '_')}.doc`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Draft diexport ke Word ✓')
  } else {
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.setTimeout(() => win.print(), 500)
    toast.success('Print / Export PDF ✓')
  }
}

function generatePlannerExcel(items) {
  import('xlsx').then(XLSX => {
    const data = items.map(i => ({
      Judul: i.judul,
      Pilar: i.pilar || '-',
      Status: i.status,
      Deadline: i.deadline ? new Date(i.deadline).toLocaleDateString('id-ID') : '-',
      Hook: i.hook || '-',
      Foreshadow: i.foreshadow || '-',
      Body: i.body || '-',
      CTA: i.cta || '-',
      Caption: i.caption || '-',
      Script: i.script || '-'
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Content Planner")
    XLSX.writeFile(wb, "MGA-Content-Planner.xlsx")
    toast.success('Planner diexport ke Excel ✓')
  }).catch(e => {
    toast.error('Gagal export excel. Pastikan koneksi internet aktif untuk load library.')
  })
}

function generatePlannerPDF(items) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Content Planner — MGA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body{font-family:'Inter',sans-serif;margin:30px;color:#222;}
    h1{font-size:24px;color:#c9a23c;margin-bottom:20px;border-bottom:2px solid #f2ca50;padding-bottom:10px;}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px;}
    th{background:#fdf9e8;color:#a1811a;text-align:left;padding:10px;border-bottom:2px solid #f2ca50;}
    td{padding:10px;border-bottom:1px solid #eee;vertical-align:top;}
    .status{display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;}
  </style>
</head>
<body>
  <h1>📅 Content Planner Overview</h1>
  <table>
    <tr><th>Judul Konten</th><th>Pilar</th><th>Status</th><th>Deadline</th><th>Draft Info</th></tr>
    ${items.map(i => `
    <tr>
      <td style="font-weight:500;">${i.judul}</td>
      <td>${i.pilar || '-'}</td>
      <td><span class="status" style="background:#f5f5f5;">${i.status}</span></td>
      <td>${i.deadline ? new Date(i.deadline).toLocaleDateString('id-ID') : '-'}</td>
      <td style="font-size:10px;color:#666;">${[
        i.hook ? 'Hook' : null,
        i.body ? 'Body' : null,
        i.script ? 'Script' : null
      ].filter(Boolean).join(', ') || '-'}</td>
    </tr>
    `).join('')}
  </table>
  <div style="margin-top:40px;font-size:10px;color:#999;text-align:center;">Generated by Muslim Growth Academy (MGA)</div>
</body>
</html>`
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.setTimeout(() => win.print(), 500)
  toast.success('Print / Export PDF ✓')
}

export default function ContentPlanner() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPlatform, setFilterPlatform] = useState('All')
  const [showAddRow, setShowAddRow] = useState(false)
  const [newItem, setNewItem] = useState({ judul: '', pilar: '', status: 'Idea', deadline: '', platform: 'Instagram', funnel: 'TOFU' })
  const [addingSaving, setAddingSaving] = useState(false)
  const [draftItem, setDraftItem] = useState(null) // item being draft-edited

  const fetchItems = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('content_planner')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Gagal memuat data: ' + error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleStatusChange(id, newStatus) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
    const { error } = await supabase
      .from('content_planner')
      .update({ status: newStatus })
      .eq('id', id)
    if (error) {
      toast.error('Gagal update status: ' + error.message)
      fetchItems()
    }
  }

  async function handleDelete(id) {
    setItems(prev => prev.filter(i => i.id !== id))
    const { error } = await supabase.from('content_planner').delete().eq('id', id)
    if (error) {
      toast.error('Gagal hapus: ' + error.message)
      fetchItems()
    } else {
      toast.success('Konten dihapus.')
    }
  }

  async function handleAddItem() {
    if (!newItem.judul.trim()) {
      toast.error('Judul konten wajib diisi.')
      return
    }
    setAddingSaving(true)
    const { error } = await supabase.from('content_planner').insert({
      user_id: user.id,
      judul: newItem.judul,
      pilar: newItem.pilar,
      status: newItem.status,
      deadline: newItem.deadline || null,
      platform: newItem.platform || 'Instagram',
      funnel: newItem.funnel || 'TOFU',
    })
    if (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } else {
      toast.success('Ide konten ditambahkan ✓')
      setNewItem({ judul: '', pilar: '', status: 'Idea', deadline: '', platform: 'Instagram', funnel: 'TOFU' })
      setShowAddRow(false)
      await fetchItems()
    }
    setAddingSaving(false)
  }

  function handleDraftSaved(updatedItem) {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
    setDraftItem(null)
  }

  const filtered = items.filter(i => {
    if (filterStatus !== 'All' && i.status !== filterStatus) return false
    if (filterPlatform !== 'All' && (i.platform || 'Instagram') !== filterPlatform) return false
    return true
  })

  const stats = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = items.filter(i => i.status === s).length
    return acc
  }, {})

  // Check if an item has any draft content
  function hasDraft(item) {
    return !!(item.hook || item.foreshadow || item.body || item.cta || item.caption || item.script)
  }

  return (
    <ModuleLayout
      title="📅 Content Planner"
      subtitle="Kelola semua ide konten, tulis draft lengkap, dan pantau status konten Anda."
    >
      {/* Draft Editor Modal */}
      {draftItem && (
        <DraftEditor item={draftItem} onClose={() => setDraftItem(null)} onSaved={handleDraftSaved} />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map(s => {
          const c = STATUS_COLORS[s]
          const isActive = filterStatus === s
          return (
            <div key={s}
              className="glass-card px-4 py-3 cursor-pointer transition-all"
              style={isActive ? { borderColor: 'rgba(242,202,80,0.4)', background: 'var(--gold-glow)' } : {}}
              onClick={() => setFilterStatus(prev => prev === s ? 'All' : s)}>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats[s]}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: c.text }}>{s}</p>
            </div>
          )
        })}
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button id="add-idea-btn" type="button" onClick={() => setShowAddRow(v => !v)} className="btn-primary">
            <PlusCircle className="w-4 h-4" /> Tambah Ide
          </button>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="input-base text-sm py-1.5 w-auto">
              <option value="All">Semua Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Platform filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {['All', ...PLATFORM_LIST].map(p => (
              <button key={p} type="button" onClick={() => setFilterPlatform(p)}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-all"
                style={{
                  background: filterPlatform === p ? 'rgba(242,202,80,0.12)' : 'transparent',
                  color: filterPlatform === p ? '#f2ca50' : 'var(--text-muted)',
                  border: filterPlatform === p ? '1px solid rgba(242,202,80,0.2)' : '1px solid var(--border-color)',
                }}>
                {p === 'All' ? '🌐 Semua' : `${PLATFORM_EMOJI[p] || ''} ${p}`}
              </button>
            ))}
          </div>
          <button type="button" onClick={fetchItems} className="btn-ghost ml-auto sm:ml-0" title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[rgba(255,255,255,0.1)] pt-3 sm:pt-0 sm:pl-4">
          <button onClick={() => generatePlannerExcel(filtered)} className="btn-secondary text-xs py-1.5 px-3">
            Export Excel
          </button>
          <button onClick={() => generatePlannerPDF(filtered)} className="btn-secondary text-xs py-1.5 px-3">
            Export PDF
          </button>
        </div>
      </div>

      {/* Add row form */}
      {showAddRow && (
        <div className="glass-card p-4 animate-slide-up" style={{ borderColor: 'rgba(242,202,80,0.3)' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Tambah Ide Konten Baru</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label-base">Judul Konten *</label>
              <input type="text" value={newItem.judul}
                onChange={e => setNewItem(p => ({ ...p, judul: e.target.value }))}
                placeholder="Judul atau topik konten..." className="input-base" />
            </div>
            <div>
              <label className="label-base">Pilar Konten</label>
              <input type="text" value={newItem.pilar}
                onChange={e => setNewItem(p => ({ ...p, pilar: e.target.value }))}
                placeholder="Contoh: Mindset, Tips..." className="input-base" />
            </div>
            <div>
              <label className="label-base">Status</label>
              <select value={newItem.status}
                onChange={e => setNewItem(p => ({ ...p, status: e.target.value }))}
                className="input-base">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Deadline (opsional)</label>
              <input type="date" value={newItem.deadline}
                onChange={e => setNewItem(p => ({ ...p, deadline: e.target.value }))}
                className="input-base" />
            </div>
            <div>
              <label className="label-base">Platform</label>
              <select value={newItem.platform}
                onChange={e => setNewItem(p => ({ ...p, platform: e.target.value }))}
                className="input-base">
                {PLATFORM_LIST.map(p => <option key={p} value={p}>{PLATFORM_EMOJI[p]} {p}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Funnel</label>
              <select value={newItem.funnel}
                onChange={e => setNewItem(p => ({ ...p, funnel: e.target.value }))}
                className="input-base">
                {FUNNEL_LIST.map(f => <option key={f} value={f}>{FUNNEL_STYLE[f].label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleAddItem} disabled={addingSaving} className="btn-primary">
              {addingSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {addingSaving ? 'Menyimpan...' : 'Tambah'}
            </button>
            <button type="button" onClick={() => setShowAddRow(false)} className="btn-ghost">Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#f2ca50' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {filterStatus === 'All' ? 'Belum ada ide konten.' : `Tidak ada konten dengan status "${filterStatus}".`}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Tambah ide baru atau generate dari Content Ideas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Judul Ide', 'Platform', 'Funnel', 'Pilar', 'Status', 'Deadline', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="group transition-colors"
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3">
                      <p className="font-medium leading-snug max-w-xs" style={{ color: 'var(--text-primary)' }}>{item.judul}</p>
                      {hasDraft(item) && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block"
                              style={{ background: 'rgba(34,197,94,0.12)', color: '#34d399' }}>
                          Draft tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        {PLATFORM_EMOJI[item.platform] || '📸'} {item.platform || 'Instagram'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const fs = FUNNEL_STYLE[item.funnel] || FUNNEL_STYLE.TOFU
                        return (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase"
                            style={{ background: fs.bg, color: fs.color }}>
                            {item.funnel || 'TOFU'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {item.pilar ? (
                        <span className="badge" style={{ background: 'var(--gold-glow)', color: '#f2ca50', border: '1px solid rgba(242,202,80,0.25)' }}>
                          {item.pilar}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={item.status} onChange={(val) => handleStatusChange(item.id, val)} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.deadline
                        ? new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setDraftItem(item)}
                          className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-all"
                          style={{ color: '#f2ca50', background: 'var(--gold-glow)', border: '1px solid rgba(242,202,80,0.2)' }}
                          title="Edit Draft">
                          <FileEdit className="w-3.5 h-3.5" /> Draft
                        </button>
                        <button type="button" onClick={() => handleDelete(item.id)}
                          className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-center pb-2" style={{ color: 'var(--text-muted)' }}>
        Total: {items.length} ide • Menampilkan: {filtered.length}
      </p>
    </ModuleLayout>
  )
}
