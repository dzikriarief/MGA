import React, { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  ModuleLayout, FormCard, Field, TextareaField, GenerateButton, InfoBanner
} from '../components/ui/ModuleUI'
import { Save, Loader2, Info, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BioGenerator() {
  const { profile, saving, updateProfile } = useProfile()

  const [bio, setBio] = useState('')
  const [brandMessage, setBrandMessage] = useState('')
  const [generated, setGenerated] = useState(false)

  // Auto-fill from profile
  const niche = profile?.niche_final || profile?.niche || ''
  const targetAudience = profile?.target_audience || ''
  const tone = profile?.tone_of_voice || 'Casual'

  useEffect(() => {
    if (profile) {
      if (profile.saved_bio) setBio(profile.saved_bio)
      if (profile.brand_message) setBrandMessage(profile.brand_message)
    }
  }, [profile])

  function buildPrompt() {
    return `Kamu adalah copywriter ahli yang spesialisasi dalam personal branding di media sosial.

Profil saya:
- Niche: ${niche}
- Tone of Voice: ${tone}
- Target Audiens: ${targetAudience || 'umum'}
- Brand Message: ${brandMessage || '[belum diisi]'}

Tugas: Buat 5 variasi bio untuk profil Instagram dan TikTok saya.

Setiap bio harus:
✅ Maksimal 150 karakter (untuk Instagram bio limit)
✅ Mencerminkan tone "${tone}"
✅ Menyebutkan nilai yang saya tawarkan untuk audiens
✅ Punya hook yang menarik
✅ Bisa langsung dipakai

Juga buat 1 **Personal Brand Message** — satu kalimat premis yang menjelaskan personal brand saya secara keseluruhan.

Format setiap bio:
**Bio [Nomor]: [Nama Gaya]**
[Teks bio]
*Karakter: [jumlah karakter]*

**Personal Brand Message:**
[Satu kalimat yang jelas dan kuat]

Buat 5 pilihan bio dengan gaya yang berbeda (emotional, results-focused, curiosity-driven, authority, dll)`
  }

  async function handleGenerate() {
    if (!niche) {
      toast.error('Lengkapi Niche di modul Niche Finder terlebih dahulu.')
      return false
    }
    await generateAndRedirect(buildPrompt())
    setGenerated(true)
  }

  async function handleSave() {
    if (!bio.trim() && !brandMessage.trim()) {
      toast.error('Isi minimal salah satu field.')
      return
    }
    await updateProfile({
      saved_bio: bio,
      brand_message: brandMessage,
    })
    toast.success('Bio & Brand Message tersimpan ✓')
  }

  const hasProfileData = niche || targetAudience

  return (
    <ModuleLayout
      title="📝 Bio Generator"
      subtitle="Generate bio Instagram/TikTok yang menarik dan craft personal brand message Anda."
    >
      {/* Auto-fill notice */}
      {hasProfileData ? (
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
             style={{ color: '#f2ca50', background: 'var(--gold-glow)', border: '1px solid rgba(242,202,80,0.2)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Data otomatis diambil dari profil Anda: <strong className="ml-1">Niche</strong>, <strong className="ml-1">Target Audience</strong>, <strong className="ml-1">Tone</strong>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
             style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Lengkapi data di <strong className="ml-1">Niche Finder</strong> dan <strong className="ml-1">Persona & Pillar</strong> terlebih dahulu.
        </div>
      )}

      {/* Read-only profile data display */}
      <FormCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Niche</p>
            <p className="text-sm font-medium truncate" style={{ color: niche ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {niche || '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Target Audience</p>
            <p className="text-sm font-medium truncate" style={{ color: targetAudience ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {targetAudience || '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Tone of Voice</p>
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tone}</p>
          </div>
        </div>

        <GenerateButton onClick={handleGenerate} label="Generate 5 Variasi Bio" />
      </FormCard>

      {generated && (
        <InfoBanner>
          Paste hasil ChatGPT di bawah, pilih bio terbaik dan personal brand message, lalu simpan.
        </InfoBanner>
      )}

      {/* ── Final section ── */}
      <div className="glass-card p-5 space-y-4" style={{ borderLeft: '3px solid #f2ca50' }}>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4" style={{ color: '#f2ca50' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Bio & Brand Message Final
          </p>
        </div>

        <Field
          id="brand-message"
          label="Personal Brand Message (satu kalimat premis)"
          value={brandMessage}
          onChange={setBrandMessage}
          placeholder="Contoh: Membantu Muslim millennial produktif membangun bisnis digital yang berkah."
        />

        <TextareaField
          id="saved-bio"
          label="Bio Pilihan Anda"
          value={bio}
          onChange={setBio}
          placeholder="Paste bio terpilih dari ChatGPT di sini, atau tulis sendiri..."
          rows={4}
        />

        <button
          id="save-bio-btn"
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Bio & Message
        </button>
      </div>
    </ModuleLayout>
  )
}
