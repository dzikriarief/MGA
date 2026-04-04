import React, { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  ModuleLayout, FormCard, Field, TextareaField, GenerateButton, InfoBanner
} from '../components/ui/ModuleUI'
import { Save, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NicheFinder() {
  const { profile, saving, updateProfile } = useProfile()

  // 4 Intersection Inputs
  const [halDisukai, setHalDisukai] = useState('')
  const [keahlian, setKeahlian] = useState('')
  const [businessOpportunity, setBusinessOpportunity] = useState('')
  const [marketSize, setMarketSize] = useState('')
  // Masalah Audiens
  const [masalahAudiens, setMasalahAudiens] = useState('')
  // Final Results
  const [nicheFinal, setNicheFinal] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [nicheReason, setNicheReason] = useState('')
  const [generated, setGenerated] = useState(false)

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      if (profile.hal_disukai) setHalDisukai(profile.hal_disukai)
      if (profile.keahlian) setKeahlian(profile.keahlian)
      if (profile.business_opportunity) setBusinessOpportunity(profile.business_opportunity)
      if (profile.market_size) setMarketSize(profile.market_size)
      if (profile.masalah_audiens) setMasalahAudiens(profile.masalah_audiens)
      if (profile.niche_final) setNicheFinal(profile.niche_final)
      if (profile.target_audience) setTargetAudience(profile.target_audience)
      if (profile.niche_reason) setNicheReason(profile.niche_reason)
    }
  }, [profile])

  function buildPrompt() {
    return `Kamu adalah Personal Branding Coach berpengalaman yang ahli dalam membantu orang menemukan niche yang tepat.

Saya ingin menemukan niche personal brand yang kuat dan menguntungkan. Berikut 4 irisan penting tentang saya:

🔥 **Passion / Hal yang Saya Sukai:**
${halDisukai}

💡 **Keahlian / Skill yang Saya Miliki:**
${keahlian}

💰 **Business Opportunity (Peluang Bisnis):**
${businessOpportunity}

📊 **Market Size (Kebutuhan Pasar):**
${marketSize}

🎯 **Masalah Audiens yang Ingin Saya Selesaikan:**
${masalahAudiens}

Berdasarkan 4 irisan + masalah audiens di atas, tolong:

1. **Temukan 3 niche spesifik** yang berada di irisan keempat hal tersebut (passion + skill + business + market)
2. Untuk setiap niche, jelaskan:
   - Nama niche (spesifik, bukan generik)
   - Mengapa niche ini cocok (hubungkan ke keempat irisan)
   - Target audiens ideal (usia, demografi, behaviour)
   - Potensi monetisasi (produk/jasa yang bisa dijual)
   - Tingkat persaingan: rendah / sedang / tinggi
   - Skor potensi viral: 1-10
3. **Rekomendasikan niche terbaik** di antara ketiganya dan berikan alasan komprehensif
4. Berikan **1 elevator pitch** (2 kalimat) untuk niche yang direkomendasikan

Format jawaban dengan heading, bullet points, dan emoji agar mudah dibaca.`
  }

  async function handleGenerate() {
    if (!halDisukai || !keahlian) {
      toast.error('Minimal isi Passion dan Keahlian untuk generate.')
      return false
    }
    await generateAndRedirect(buildPrompt())
    setGenerated(true)
  }

  // Save research inputs
  async function handleSaveInputs() {
    await updateProfile({
      hal_disukai: halDisukai,
      keahlian: keahlian,
      business_opportunity: businessOpportunity,
      market_size: marketSize,
      masalah_audiens: masalahAudiens,
    })
    toast.success('Data riset niche disimpan ✓')
  }

  // Save final niche decision
  async function handleSaveFinal() {
    if (!nicheFinal.trim()) {
      toast.error('Masukkan niche final Anda terlebih dahulu.')
      return
    }
    await updateProfile({
      niche_final: nicheFinal,
      niche: nicheFinal,           // also update the legacy field
      target_audience: targetAudience,
      niche_reason: nicheReason,
    })
    toast.success('Niche final tersimpan ke profil Anda ✓')
  }

  return (
    <ModuleLayout
      title="🎯 Niche Finder"
      subtitle="Temukan posisi unik Anda di pasar dengan menggabungkan 4 irisan penting: Passion, Keahlian, Peluang Bisnis, dan Kebutuhan Pasar."
    >
      {/* ── 4 Intersection Grid ── */}
      <FormCard>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          4 Irisan Penting
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="hal-disukai"
            label="🔥 Passion / Hal yang Disukai"
            value={halDisukai}
            onChange={setHalDisukai}
            placeholder="Contoh: desain minimalis, Islamic education, self-improvement..."
          />
          <Field
            id="keahlian"
            label="💡 Keahlian / Skill"
            value={keahlian}
            onChange={setKeahlian}
            placeholder="Contoh: UI/UX design 5 tahun, public speaking, copywriting..."
          />
          <Field
            id="business-opportunity"
            label="💰 Business Opportunity"
            value={businessOpportunity}
            onChange={setBusinessOpportunity}
            placeholder="Contoh: kursus online, konsultasi 1-on-1, produk digital..."
          />
          <Field
            id="market-size"
            label="📊 Market Size / Kebutuhan Pasar"
            value={marketSize}
            onChange={setMarketSize}
            placeholder="Contoh: 50jt Muslim millennial Indonesia butuh konten produktivitas..."
          />
        </div>
      </FormCard>

      {/* ── Masalah Audiens ── */}
      <FormCard>
        <Field
          id="masalah-audiens"
          label="🎯 Masalah Audiens yang Ingin Anda Selesaikan"
          value={masalahAudiens}
          onChange={setMasalahAudiens}
          placeholder="Contoh: orang Muslim yang kesulitan membangun personal brand yang Islami dan profesional..."
        />

        <div className="flex items-center gap-3 pt-2">
          <GenerateButton onClick={handleGenerate} label="Generate Niche dengan AI" />
          <button
            id="save-niche-inputs"
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
          ChatGPT sudah terbuka di tab baru dan prompt sudah tercopy. Paste dengan <strong>Ctrl+V</strong> di ChatGPT, analisis hasilnya, lalu masukkan keputusan final Anda di bawah.
        </InfoBanner>
      )}

      {/* ── Final Result Section ── */}
      <div className="glass-card p-5 space-y-4" style={{ borderLeft: '3px solid #f2ca50' }}>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4" style={{ color: '#f2ca50' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keputusan Final Niche Anda
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Setelah brainstorming dengan AI, masukkan pilihan final Anda di bawah. Data ini akan digunakan di seluruh modul lainnya.
        </p>

        <Field
          id="niche-final"
          label="Niche Final"
          value={nicheFinal}
          onChange={setNicheFinal}
          placeholder="Contoh: Islamic Productivity Coach untuk Muslim millennial profesional"
        />
        <Field
          id="target-audience"
          label="Target Audience"
          value={targetAudience}
          onChange={setTargetAudience}
          placeholder="Contoh: Muslim usia 22-35, pekerja kantoran, ingin produktif sesuai nilai Islam"
        />
        <TextareaField
          id="niche-reason"
          label="Alasan Memilih Niche Ini"
          value={nicheReason}
          onChange={setNicheReason}
          placeholder="Kenapa Anda memilih niche ini? Apa yang membuat Anda yakin?"
          rows={3}
        />

        <button
          id="save-niche-final"
          type="button"
          onClick={handleSaveFinal}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Simpan Niche Final
        </button>
      </div>
    </ModuleLayout>
  )
}
