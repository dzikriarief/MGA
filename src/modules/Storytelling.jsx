import React, { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  ModuleLayout, FormCard, Field, TextareaField, SelectField, GenerateButton, InfoBanner
} from '../components/ui/ModuleUI'
import { Save, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const TONE_OPTIONS = ['Casual', 'Professional', 'Islamic/Pesantren', 'Authoritative']

export default function Persona() {
  const { profile, saving, updateProfile } = useProfile()

  const [kelebihan, setKelebihan] = useState('')
  const [kelemahan, setKelemahan] = useState('')
  const [tone, setTone] = useState('Casual')
  const [generated, setGenerated] = useState(false)

  // Final result fields
  const [finalPillars, setFinalPillars] = useState('')
  const [elevatorPitch, setElevatorPitch] = useState('')

  useEffect(() => {
    if (profile) {
      if (profile.kelebihan) setKelebihan(profile.kelebihan)
      if (profile.kelemahan) setKelemahan(profile.kelemahan)
      if (profile.tone_of_voice) setTone(profile.tone_of_voice)
      // Load final results
      if (Array.isArray(profile.final_pillars) && profile.final_pillars.length > 0) {
        setFinalPillars(profile.final_pillars.join('\n'))
      } else if (Array.isArray(profile.content_pillars) && profile.content_pillars.length > 0) {
        setFinalPillars(profile.content_pillars.join('\n'))
      }
      if (profile.elevator_pitch) setElevatorPitch(profile.elevator_pitch)
    }
  }, [profile])

  function buildPrompt() {
    const niche = profile?.niche_final || profile?.niche || '[belum diisi]'
    const audience = profile?.target_audience || '[belum diisi]'

    return `Kamu adalah Personal Branding Strategist dan Storytelling Expert. Bantu saya membangun fondasi personal brand yang kuat.

Informasi tentang saya:
- Niche: ${niche}
- Target Audience: ${audience}
- Kelebihan / Strengths: ${kelebihan}
- Kelemahan / Weaknesses: ${kelemahan}
- Tone of Voice yang diinginkan: ${tone}

Tugas kamu:

1. **5 Content Pillars** — Buat 5 pilar konten utama yang cocok untuk personal brand saya. Untuk setiap pilar:
   - Nama pilar (singkat, 2-4 kata)
   - Deskripsi singkat pilar (1-2 kalimat)
   - Contoh 2 ide konten untuk pilar ini

2. **Elevator Pitch** — Tulis elevator pitch personal brand saya dalam 3 versi:
   - Versi singkat (1 kalimat, untuk bio media sosial)
   - Versi medium (3-4 kalimat, untuk perkenalan di event)
   - Versi lengkap (1 paragraf, untuk halaman About)

3. **Persona Statement** — Jelaskan persona brand saya (karakter, values, cara berkomunikasi)

Semua konten harus menggunakan tone "${tone}".
Format jawaban dengan rapi, gunakan heading dan bullet points.`
  }

  async function handleGenerate() {
    if (!kelebihan || !kelemahan) {
      toast.error('Lengkapi field Kelebihan dan Kelemahan terlebih dahulu.')
      return false
    }
    await generateAndRedirect(buildPrompt())
    setGenerated(true)
  }

  async function handleSaveInputs() {
    await updateProfile({
      kelebihan,
      kelemahan,
      tone_of_voice: tone,
    })
    toast.success('Data persona disimpan ✓')
  }

  async function handleSaveFinal() {
    const pillarsArray = finalPillars
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)

    if (pillarsArray.length === 0) {
      toast.error('Masukkan minimal 1 pilar konten.')
      return
    }

    await updateProfile({
      content_pillars: pillarsArray,
      final_pillars: pillarsArray,
      elevator_pitch: elevatorPitch,
    })
    toast.success('Pilar konten & elevator pitch tersimpan ✓')
  }

  return (
    <ModuleLayout
      title="🎭 Persona & Pilar Konten"
      subtitle="Bangun persona brand Anda, temukan 5 pilar konten utama, dan craft elevator pitch yang solid."
    >
      <FormCard>
        <TextareaField
          id="kelebihan"
          label="Kelebihan / Strengths Anda"
          value={kelebihan}
          onChange={setKelebihan}
          placeholder="Contoh: empati tinggi, komunikasi efektif, pengalaman 5 tahun di industri teknologi, disiplin..."
          rows={3}
        />
        <TextareaField
          id="kelemahan"
          label="Kelemahan / Weaknesses Anda (jujur = lebih relatable)"
          value={kelemahan}
          onChange={setKelemahan}
          placeholder="Contoh: perfeksionis, mudah overwhelmed, introvert, masih belajar public speaking..."
          rows={3}
        />
        <SelectField
          id="tone-of-voice"
          label="Tone of Voice"
          value={tone}
          onChange={setTone}
          options={TONE_OPTIONS}
        />

        <div className="flex items-center gap-3 pt-1">
          <GenerateButton onClick={handleGenerate} label="Generate Persona & Pilar" />
          <button
            id="save-persona-btn"
            type="button"
            onClick={handleSaveInputs}
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Data
          </button>
        </div>
      </FormCard>

      {generated && (
        <InfoBanner>
          Setelah ChatGPT memberikan hasil pilar konten dan elevator pitch, masukkan hasilnya di bagian <strong>Keputusan Final</strong> di bawah.
        </InfoBanner>
      )}

      {/* ── Final Result Section ── */}
      <div className="glass-card p-5 space-y-4" style={{ borderLeft: '3px solid #f2ca50' }}>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4" style={{ color: '#f2ca50' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keputusan Final — Pilar & Elevator Pitch
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Masukkan hasil final brainstorming dengan AI. Data pilar akan digunakan di modul Content Ideas.
        </p>

        <TextareaField
          id="final-pillars"
          label="Pilar Konten (satu per baris)"
          value={finalPillars}
          onChange={setFinalPillars}
          placeholder={"Contoh:\nIslamic Productivity\nDigital Business\nMindset & Growth\nBehind the Scenes\nCommunity Building"}
          rows={5}
        />
        <TextareaField
          id="elevator-pitch"
          label="Elevator Pitch"
          value={elevatorPitch}
          onChange={setElevatorPitch}
          placeholder="Versi terbaik elevator pitch Anda dari hasil brainstorming AI..."
          rows={3}
        />

        <button
          id="save-persona-final"
          type="button"
          onClick={handleSaveFinal}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Simpan Final
        </button>
      </div>
    </ModuleLayout>
  )
}
