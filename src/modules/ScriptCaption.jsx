import React, { useState } from 'react'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  ModuleLayout, FormCard, Field, SelectField, GenerateButton, InfoBanner
} from '../components/ui/ModuleUI'

const PLATFORM_OPTIONS = [
  { value: 'IG Reels', label: 'Instagram Reels' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'LinkedIn', label: 'LinkedIn' },
]

export default function ScriptCaption() {
  const [judul, setJudul] = useState('')
  const [platform, setPlatform] = useState('IG Reels')
  const [generated, setGenerated] = useState(false)

  function buildPrompt() {
    const platformGuide = {
      'IG Reels': 'Instagram Reels (durasi 30-60 detik, energik, visual-driven, trending audio)',
      'TikTok': 'TikTok (durasi 15-60 detik, autentik, fun, POV/storytelling style)',
      'LinkedIn': 'LinkedIn (professional, thought-leadership, lebih panjang dan substantif)',
    }[platform]

    return `Kamu adalah Viral Content Creator dan Copywriter expert untuk media sosial Indonesia.

Judul / Topik Konten: **${judul}**
Platform: **${platformGuide}**

Buat untuk saya:

## 1. VIDEO SCRIPT

**HOOK (5 detik pertama)**
[Kalimat pembuka yang sangat menarik dan bikin orang berhenti scroll — buat 2 pilihan]

**BODY / ISI KONTEN**
[Poin-poin utama konten, detail, value yang diberikan ke penonton — format bullet/numbered]

**CALL TO ACTION (CTA)**
[3 pilihan CTA yang natural dan tidak hard-selling]

---

## 2. CAPTION

**Caption Utama:**
[Caption lengkap yang engaging, menggunakan tone yang sesuai platform]

**Hashtags:**
[30 hashtag relevan dalam bahasa Indonesia dan Inggris, dari yang besar sampai niche]

---

Pastikan semua konten relevan untuk audiens Indonesia dan menggunakan bahasa yang natural.`
  }

  async function handleGenerate() {
    if (!judul.trim()) {
      const { toast } = await import('react-hot-toast')
      toast.error('Masukkan judul/topik konten terlebih dahulu.')
      return
    }
    await generateAndRedirect(buildPrompt())
    setGenerated(true)
  }

  return (
    <ModuleLayout
      title="🎬 Script & Caption Generator"
      subtitle="Generate video script lengkap (Hook–Body–CTA) dan caption beserta hashtag untuk konten Anda."
    >
      <FormCard>
        <Field
          id="judul-konten"
          label="Judul / Topik Konten"
          value={judul}
          onChange={setJudul}
          placeholder="Contoh: 3 Kesalahan Fatal Saat Mulai Investasi di Usia 20an..."
        />
        <SelectField
          id="platform-select"
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={PLATFORM_OPTIONS}
        />

        <GenerateButton onClick={handleGenerate} label="Generate Script & Caption" />
      </FormCard>

      {generated && (
        <InfoBanner>
          Script dan caption siap di ChatGPT! Setelah mendapat hasilnya, Anda bisa copy bagian yang diinginkan dan gunakan langsung untuk konten Anda.
        </InfoBanner>
      )}

      {/* Platform tips */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>💡 Tips per Platform</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { platform: 'IG Reels', tip: 'Gunakan trending audio, durasi 30-60 detik, tambahkan text overlay yang menarik' },
            { platform: 'TikTok', tip: 'Autentik > polished. Hook dalam 3 detik pertama. Gunakan POV atau storytelling' },
            { platform: 'LinkedIn', tip: 'Sharing insight profesional. Panjang post 150-300 kata. Akhiri dengan pertanyaan' },
          ].map(({ platform: p, tip }) => (
            <div key={p} className="p-3 rounded-lg"
                 style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#f2ca50' }}>{p}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </ModuleLayout>
  )
}
