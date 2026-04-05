import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { ModuleLayout, FormCard, Field, TextareaField } from '../components/ui/ModuleUI'
import {
  Plus, Trash2, Edit3, Save, X, Loader2,
  Briefcase, Handshake, Target, Calendar, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

const TIPE_OPTIONS = ['Endorsement', 'Kolaborasi', 'Target Brand']
const STATUS_OPTIONS = ['Prospect', 'Negosiasi', 'In Progress', 'Done', 'Rejected']

const STATUS_STYLE = {
  Prospect:      { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  Negosiasi:     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'In Progress': { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
  Done:          { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  Rejected:      { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
}

const TIPE_ICON = {
  Endorsement:   Briefcase,
  Kolaborasi:    Handshake,
  'Target Brand': Target,
}

function ProjectCard({ project, onEdit, onDelete }) {
  const st = STATUS_STYLE[project.status] || STATUS_STYLE.Prospect
  const TipeIcon = TIPE_ICON[project.tipe] || Briefcase

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(242,202,80,0.1)' }}>
            <TipeIcon className="w-5 h-5" style={{ color: '#f2ca50' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{project.nama}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.tipe}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(project)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(project.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase" style={{ background: st.bg, color: st.color }}>{project.status}</span>
        {project.brand && (
          <span className="px-2 py-0.5 rounded-lg text-xs" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            🏢 {project.brand}
          </span>
        )}
        {project.fee && (
          <span className="px-2 py-0.5 rounded-lg text-xs font-medium" style={{ color: '#f2ca50' }}>
            💰 {project.fee}
          </span>
        )}
        {project.deadline && (
          <span className="px-2 py-0.5 rounded-lg text-xs flex items-center gap-1"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <Calendar className="w-3 h-3" /> {new Date(project.deadline).toLocaleDateString('id-ID')}
          </span>
        )}
      </div>

      {project.notes && (
        <p className="text-xs mt-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          {project.notes}
        </p>
      )}
    </div>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterTipe, setFilterTipe] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [form, setForm] = useState({
    nama: '', tipe: 'Endorsement', status: 'Prospect', brand: '', fee: '', deadline: '', notes: ''
  })

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  function resetForm() {
    setForm({ nama: '', tipe: 'Endorsement', status: 'Prospect', brand: '', fee: '', deadline: '', notes: '' })
    setEditId(null)
    setShowForm(false)
  }

  function startEdit(p) {
    setForm({
      nama: p.nama, tipe: p.tipe, status: p.status, brand: p.brand || '',
      fee: p.fee || '', deadline: p.deadline || '', notes: p.notes || ''
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.nama.trim()) { toast.error('Nama project wajib diisi'); return }
    setSaving(true)
    try {
      const payload = { ...form, user_id: user.id, deadline: form.deadline || null }
      if (editId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editId)
        if (error) throw error
        toast.success('Project diperbarui ✓')
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) throw error
        toast.success('Project ditambahkan ✓')
      }
      resetForm()
      fetchProjects()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus project ini?')) return
    await supabase.from('projects').delete().eq('id', id)
    toast.success('Dihapus ✓')
    fetchProjects()
  }

  const filtered = projects.filter(p => {
    if (filterTipe !== 'all' && p.tipe !== filterTipe) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

  // Stats
  const totalFee = projects.filter(p => p.status === 'Done' && p.fee).reduce((sum, p) => {
    const num = parseInt(p.fee.replace(/[^0-9]/g, '')) || 0
    return sum + num
  }, 0)

  return (
    <ModuleLayout title="📋 Projects" subtitle="Kelola project endorsement, kolaborasi, dan target brand Anda.">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Project', value: projects.length, color: '#f2ca50' },
          { label: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, color: '#8b5cf6' },
          { label: 'Done', value: projects.filter(p => p.status === 'Done').length, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Tipe:</span>
        {['all', ...TIPE_OPTIONS].map(t => (
          <button key={t} onClick={() => setFilterTipe(t)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: filterTipe === t ? 'rgba(242,202,80,0.1)' : 'transparent', color: filterTipe === t ? '#f2ca50' : 'var(--text-muted)', border: filterTipe === t ? '1px solid rgba(242,202,80,0.2)' : '1px solid var(--border-color)' }}>
            {t === 'all' ? 'Semua' : t}
          </button>
        ))}
        <span className="text-xs font-semibold ml-2" style={{ color: 'var(--text-muted)' }}>Status:</span>
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: filterStatus === s ? 'rgba(242,202,80,0.1)' : 'transparent', color: filterStatus === s ? '#f2ca50' : 'var(--text-muted)', border: filterStatus === s ? '1px solid rgba(242,202,80,0.2)' : '1px solid var(--border-color)' }}>
            {s === 'all' ? 'Semua' : s}
          </button>
        ))}
      </div>

      {/* Add Button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-secondary w-full justify-center">
          <Plus className="w-4 h-4" /> Tambah Project Baru
        </button>
      )}

      {/* Form */}
      {showForm && (
        <FormCard>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit' : 'Tambah'} Project</h3>
            <button onClick={resetForm} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
          </div>
          <Field id="proj-nama" label="Nama Project" value={form.nama} onChange={v => setForm(f => ({ ...f, nama: v }))} placeholder="Contoh: Endorsement Skincare Alami" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Tipe</label>
              <select value={form.tipe} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))} className="input-base">
                {TIPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-base">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field id="proj-brand" label="Brand / Partner" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} placeholder="Nama brand" />
            <Field id="proj-fee" label="Fee / Budget" value={form.fee} onChange={v => setForm(f => ({ ...f, fee: v }))} placeholder="Rp 5.000.000" />
          </div>
          <div>
            <label className="label-base">Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-base" />
          </div>
          <TextareaField id="proj-notes" label="Catatan" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Detail project, deliverables, dll..." rows={3} />
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId ? 'Update' : 'Simpan'} Project
          </button>
        </FormCard>
      )}

      {/* Project Cards */}
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: '#f2ca50' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada project. Mulai tambahkan project Anda!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onEdit={startEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </ModuleLayout>
  )
}
