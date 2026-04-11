import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  ModuleLayout, FormCard, Field, SelectField, TextareaField, GenerateButton, InfoBanner
} from '../components/ui/ModuleUI'
import { PlusCircle, Loader2, CheckCircle, Clapperboard, Lightbulb, RotateCcw, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

/* ═════════ CONTENT FUNNEL ═════════ */
const FUNNEL_OPTIONS = [
  { key: 'TOFU', label: 'TOFU — Awareness', desc: 'Menjaring audiens baru, viral, edukasi ringan', color: '#3b82f6', emoji: '🔝' },
  { key: 'MOFU', label: 'MOFU — Consideration', desc: 'Membangun trust, case study, proof, storytelling', color: '#f59e0b', emoji: '🤝' },
  { key: 'BOFU', label: 'BOFU — Conversion', desc: 'Mendorong action, offer, CTA langsung', color: '#22c55e', emoji: '💰' },
]

const FUNNEL_PROMPT_GUIDE = `
<FUNNEL_STRATEGY>
Setiap ide konten HARUS memiliki label funnel:
- **TOFU (Top of Funnel)**: Konten awareness — menjaring audiens baru, viral potential tinggi, edukasi ringan, hook kuat. Tujuan: reach & followers.
- **MOFU (Middle of Funnel)**: Konten consideration — membangun trust & authority, case study, storytelling, behind the scenes, proof of expertise. Tujuan: engagement & trust.
- **BOFU (Bottom of Funnel)**: Konten conversion — mendorong action, soft-selling, testimonial, offer, CTA langsung. Tujuan: leads & sales.
Rencanakan distribusi funnel yang seimbang agar user punya strategi konten yang lengkap.
</FUNNEL_STRATEGY>`

/* ═══════════════════════ PLATFORM REGISTRY ═══════════════════════
   Central source of truth for all platform characteristics.
   Used by ALL prompt builders for consistency. */
const PLATFORMS = {
  Instagram:  { emoji: '📸', label: 'Instagram',  color: '#E1306C', shortLabel: 'IG' },
  Facebook:   { emoji: '📘', label: 'Facebook',   color: '#1877F2', shortLabel: 'FB' },
  TikTok:     { emoji: '🎵', label: 'TikTok',     color: '#000000', shortLabel: 'TT' },
  Threads:    { emoji: '🧵', label: 'Threads',    color: '#000000', shortLabel: 'TH' },
  Twitter:    { emoji: '𝕏',  label: 'Twitter / X', color: '#1DA1F2', shortLabel: 'X' },
  LinkedIn:   { emoji: '💼', label: 'LinkedIn',    color: '#0A66C2', shortLabel: 'LI' },
  YouTube:    { emoji: '▶️', label: 'YouTube',     color: '#FF0000', shortLabel: 'YT' },
}

const PLATFORM_KEYS = Object.keys(PLATFORMS)

/* Platform DNA — deep characteristics for each platform.
   This is injected into prompts to ensure platform-specific output. */
const PLATFORM_DNA = {
  Instagram: `<PLATFORM_SPEC name="Instagram">
FORMATS: Reels (15-90s video), Carousel (5-10 slide), Single Image, Stories
AUDIENCE: Visual-first, 18-35, Indonesia urban, love aesthetics & storytelling
TONE: Casual-warm, relatable, visual hooks, emoji moderate
ALGORITHM: Prioritizes Reels, saves, shares. Carousel = high saves.
BEST HOOKS: Pattern interrupt, bold statement, curiosity gap
CAPTION: Max 2200 chars. First 125 visible. Front-load value.
HASHTAGS: 15-25 mix (big 500K+, mid 50K-500K, niche <50K). Bahasa Indonesia + English.
</PLATFORM_SPEC>`,

  Facebook: `<PLATFORM_SPEC name="Facebook">
FORMATS: Reels (15-90s), Text post, Poll, Link share, Album
AUDIENCE: 25-45, broader demo, community-driven, family-friendly
TONE: Conversational, warm, storytelling-heavy, shareable
ALGORITHM: Prioritizes engagement (comments, shares), groups content
BEST HOOKS: Open-ended questions, emotional stories, controversial takes
CAPTION: Longer text works. Personal stories = high shares.
HASHTAGS: 3-5 max, less important than on IG.
</PLATFORM_SPEC>`,

  TikTok: `<PLATFORM_SPEC name="TikTok">
FORMATS: Short video (15s-3min), duet, stitch, green screen
AUDIENCE: 16-30, trend-savvy, raw & authentic, fast-paced
TONE: Ultra-casual, POV style, humor welcome, fast transitions
ALGORITHM: FYP-driven, watch time > followers, trending sounds
BEST HOOKS: "Wait for it", direct eye contact, pattern interrupt in 1s
CAPTION: Short (150 chars). Viral CTA. Curiosity-based.
HASHTAGS: 3-5 trending + niche. Use trending sounds & effects.
</PLATFORM_SPEC>`,

  Threads: `<PLATFORM_SPEC name="Threads">
FORMATS: Text thread (up to 500 chars), image, carousel
AUDIENCE: Early adopters, 20-35, intellectual, niche communities
TONE: Opinionated, concise, conversational, thread-style
ALGORITHM: Reply & repost driven, engagement-first
BEST HOOKS: Hot take opener, contrarian view, "unpopular opinion"
CAPTION: Max 500 chars. Punchy, one-idea-per-post. No hashtags needed.
FORMAT TIP: Break ideas into multiple posts for thread engagement.
</PLATFORM_SPEC>`,

  Twitter: `<PLATFORM_SPEC name="Twitter / X">
FORMATS: Tweet (280 chars), thread (chain tweets), image, poll
AUDIENCE: 20-40, news-savvy, opinionated, professional mix
TONE: Sharp, witty, direct, controversial okay, intellectual
ALGORITHM: Retweets & replies matter. Threads = high engagement.
BEST HOOKS: Bold claim, stat, question, "Here's what nobody tells you"
CAPTION: 280 chars max. Precision > volume. Threads for depth.
HASHTAGS: 1-3 max, topical only.
</PLATFORM_SPEC>`,

  LinkedIn: `<PLATFORM_SPEC name="LinkedIn">
FORMATS: Text post, Document carousel (PDF), Article, Newsletter, short video
AUDIENCE: 25-55, professionals, B2B, thought leaders, career-focused
TONE: Professional-casual, authority, value-driven, story + lesson format
ALGORITHM: Dwell time (long reads), comments, shares within network
BEST HOOKS: Personal failure/lesson, data insight, "I stopped doing X and Y happened"
CAPTION: Longer = better (1000-3000 chars). Line breaks for readability. Storytelling format.
HASHTAGS: 3-5 professional hashtags only.
</PLATFORM_SPEC>`,

  YouTube: `<PLATFORM_SPEC name="YouTube">
FORMATS: Long-form (8-20min), Shorts (15-60s), Live stream
AUDIENCE: All ages, search-intent driven, value-seekers, binge-watchers
TONE: Educational-entertaining (edutainment), host energy, clear structure
ALGORITHM: CTR (thumbnail + title), watch time, session time
BEST HOOKS: Promise + proof in first 30s, "In this video you'll learn..."
TITLE: Searchable, benefit-driven, 50-60 chars max, power words
DESCRIPTION: 200+ words, keywords, timestamps, links. SEO-optimized.
HASHTAGS: 3-5 in description. Tags more important.
</PLATFORM_SPEC>`,
}

/* ═════════════ PLATFORM CHIP SELECTOR ═════════════ */
function PlatformSelector({ selected, onChange, multi = false }) {
  function toggle(key) {
    if (multi) {
      if (selected.includes(key)) {
        if (selected.length === 1) return // at least 1
        onChange(selected.filter(k => k !== key))
      } else {
        onChange([...selected, key])
      }
    } else {
      onChange(key)
    }
  }

  return (
    <div>
      <label className="label-base">{multi ? 'Pilih Platform (multi-select)' : 'Platform'}</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {PLATFORM_KEYS.map(key => {
          const p = PLATFORMS[key]
          const isActive = multi ? selected.includes(key) : selected === key
          return (
            <button key={key} type="button" onClick={() => toggle(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isActive ? 'rgba(242,202,80,0.15)' : 'var(--bg-input)',
                color: isActive ? '#f2ca50' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(242,202,80,0.4)' : '1px solid var(--border-color)',
              }}>
              <span>{p.emoji}</span> {p.label}
            </button>
          )
        })}
      </div>
      {multi && <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Klik platform untuk toggle. Minimal 1 harus dipilih.</p>}
    </div>
  )
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function ContentGenerator() {
  const { user, profile } = useAuth()

  // Tabs
  const [activeTab, setActiveTab] = useState('ideas')

  // ── Ideas tab state ──
  const [pilar, setPilar] = useState('')
  const [jumlahIde, setJumlahIde] = useState('5')
  const [ideaPlatforms, setIdeaPlatforms] = useState(['Instagram'])
  const [ideaFunnel, setIdeaFunnel] = useState('') // empty = all funnels
  const [ideas, setIdeas] = useState([])
  const [rawIdeas, setRawIdeas] = useState('')
  const [saving, setSaving] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState(false)

  // ── Script tab state ──
  const [scriptJudul, setScriptJudul] = useState('')
  const [scriptPlatform, setScriptPlatform] = useState('Instagram')
  const [generatedScript, setGeneratedScript] = useState(false)

  // ── Angle Twisting tab state ──
  const [angleTopic, setAngleTopic] = useState('')
  const [anglePlatform, setAnglePlatform] = useState('Instagram')
  const [angleFunnel, setAngleFunnel] = useState('')
  const [generatedAngle, setGeneratedAngle] = useState(false)

  // Pillars from profile
  const savedPillars = profile?.final_pillars?.length > 0
    ? profile.final_pillars
    : (profile?.content_pillars || [])

  /* ═══════════════ PROMPT BUILDERS ═══════════════
     Strategy: Structured XML tags + Chain-of-Thought + Platform DNA injection.
     Each prompt is self-contained and token-efficient by only injecting
     the DNA of selected platforms (not all 7). */

  // ── IDEAS: Multi-platform prompt with CoT ──
  function buildIdeaPrompt() {
    const platformSpecs = ideaPlatforms.map(p => PLATFORM_DNA[p]).join('\n\n')
    const platformNames = ideaPlatforms.map(p => PLATFORMS[p].label).join(', ')

    return `<SYSTEM_CONTEXT>
Kamu adalah Content Strategist Senior yang ahli multi-platform content di Indonesia.
Kamu memahami mendalam algoritma, audiens, dan format terbaik setiap platform.
</SYSTEM_CONTEXT>

<TASK>
Buat ${jumlahIde} ide konten untuk pilar "${pilar}" yang dioptimalkan untuk platform: ${platformNames}.
</TASK>

${platformSpecs}

${FUNNEL_PROMPT_GUIDE}

<THINKING_PROCESS>
Sebelum membuat ide, pikirkan langkah berikut (tidak perlu ditampilkan):
1. Analisa karakteristik audiens tiap platform yang dipilih
2. Identifikasi format konten terbaik untuk pilar "${pilar}" di tiap platform
3. Buat ide yang bisa diadaptasi lintas platform TAPI tetap punya elemen unik per platform
4. Pastikan setiap hook disesuaikan dengan stopping power platform masing-masing
5. Rencanakan distribusi funnel (TOFU/MOFU/BOFU) yang strategis${ideaFunnel ? `\n6. FOKUS pada funnel: ${ideaFunnel}` : ''}
</THINKING_PROCESS>

<OUTPUT_FORMAT>
Untuk setiap ide konten, berikan:

**IDE [nomor]: [Judul Konten — hook yang menarik]**
**Funnel: [TOFU/MOFU/BOFU]** — [alasan kenapa masuk funnel ini]

| Platform | Format | Hook Pembuka | Level Viral |
|----------|--------|--------------|-------------|
${ideaPlatforms.map(p => `| ${PLATFORMS[p].emoji} ${PLATFORMS[p].label} | [format terbaik] | [hook spesifik platform ini] | [rendah/sedang/tinggi + alasan] |`).join('\n')}

**🎯 Mengapa ide ini bekerja:** [1 kalimat alasan strategis]

---

PENTING:
- Hook HARUS berbeda per platform (sesuai behavior user platform tersebut)
- Format HARUS sesuai best practice platform (misal: IG = Reels/Carousel, YouTube = Long-form/Shorts)
- Setiap ide HARUS punya label funnel (TOFU/MOFU/BOFU)${ideaFunnel ? `\n- FOKUSKAN semua ide pada funnel: ${ideaFunnel}` : '\n- Distribusikan ide secara seimbang antara TOFU, MOFU, dan BOFU'}
- Gunakan bahasa Indonesia yang natural
- Buat total ${jumlahIde} ide
</OUTPUT_FORMAT>`
  }

  // ── SCRIPT: Single-platform deep prompt with CoT ──
  function buildScriptPrompt() {
    const spec = PLATFORM_DNA[scriptPlatform]

    return `<SYSTEM_CONTEXT>
Kamu adalah Viral Content Creator dan Copywriter expert untuk ${PLATFORMS[scriptPlatform].label} Indonesia.
</SYSTEM_CONTEXT>

${spec}

<TASK>
Judul / Topik Konten: "${scriptJudul}"
Platform: ${PLATFORMS[scriptPlatform].label}
</TASK>

${FUNNEL_PROMPT_GUIDE}

<THINKING_PROCESS>
Sebelum menulis, analisa:
1. Format terbaik untuk topik ini di ${PLATFORMS[scriptPlatform].label}
2. Tipe hook yang paling stopping power di platform ini
3. Panjang optimal konten berdasarkan algoritma platform
4. CTA yang sesuai culture platform
5. Tentukan di funnel mana konten ini paling cocok (TOFU/MOFU/BOFU)
</THINKING_PROCESS>

<OUTPUT_FORMAT>
## 1. SCRIPT ${PLATFORMS[scriptPlatform].label.toUpperCase()}

**📌 Format yang Direkomendasikan:** [format terbaik untuk topik ini]

**🪝 HOOK (5 detik pertama)**
Pilihan A: [hook versi 1 — sesuai karakteristik platform]
Pilihan B: [hook versi 2 — angle berbeda]

**🔮 FORESHADOW**
[Teaser yang bikin penonton stay — disesuaikan dgn behavior user ${PLATFORMS[scriptPlatform].label}]

**📝 BODY / ISI KONTEN**
[Poin-poin utama — structured, value-packed, format sesuai platform]

**📢 CTA (Call to Action)**
Pilihan 1: [CTA natural sesuai platform]
Pilihan 2: [CTA alternatif]
Pilihan 3: [CTA engagement-driven]

---

## 2. CAPTION ${PLATFORMS[scriptPlatform].label.toUpperCase()}

**Caption Utama:**
[Caption yang dioptimalkan untuk ${PLATFORMS[scriptPlatform].label} — panjang, tone, dan style sesuai platform]

**Hashtags:**
[Hashtag yang sesuai best practice platform ini]

---

PENTING: Sesuaikan panjang, tone, dan gaya dengan DNA platform ${PLATFORMS[scriptPlatform].label}.
Gunakan bahasa Indonesia yang natural.
</OUTPUT_FORMAT>`
  }

  // ── ANGLE TWISTING: Platform-aware prompt ──
  function buildAnglePrompt() {
    const spec = PLATFORM_DNA[anglePlatform]

    return `<SYSTEM_CONTEXT>
Kamu adalah Content Strategist expert yang ahli angle twisting konten multi-platform.
</SYSTEM_CONTEXT>

${spec}

<TASK>
Topik original: "${angleTopic}"
Target platform: ${PLATFORMS[anglePlatform].label}

Buat 9 variasi angle yang dioptimalkan khusus untuk ${PLATFORMS[anglePlatform].label}.
</TASK>

<THINKING_PROCESS>
Untuk setiap angle, pikirkan:
1. Bagaimana angle ini cocok dengan behavior user ${PLATFORMS[anglePlatform].label}?
2. Format konten apa yang terbaik untuk angle ini di platform ini?
3. Hook seperti apa yang paling stopping power?
</THINKING_PROCESS>

<OUTPUT_FORMAT>
Untuk SETIAP angle, berikan:
- **Judul Konten** (hook menarik — optimized for ${PLATFORMS[anglePlatform].label})
- **Format** (format terbaik di ${PLATFORMS[anglePlatform].label})
- **Hook Pembuka** (1-2 kalimat — sesuai gaya ${PLATFORMS[anglePlatform].label})
- **Mengapa angle ini cocok** di ${PLATFORMS[anglePlatform].label} (1 kalimat)

---

### 1. 🎯 ACTIONABLE
Tipe how-to, langkah-langkah aplikatif. Contoh: "Kalau kamu naik transportasi umum setiap hari, kamu bisa ngumpulin X juta..."

### 2. ✨ INSPIRATIONAL
Cerita/pengalaman pribadi, tokoh panutan, pelajaran hidup.

### 3. 📊 ANALYTICAL
Analisa mendalam strategi brand/tokoh/perusahaan dengan data pendukung.

### 4. ⚠️ NEGATIVE / PAIN
Negativity bias, ketakutan, stopping power. Contoh: "Kalau nggak mau bangkrut, jangan lakukan ini..."

### 5. 🌟 POSITIVE / DREAM
Mimpi, tujuan, hasil positif yang diinginkan audiens.

### 6. 🔄 OPPOSITE / CONTRARIAN
Unpopular opinion, lawan status quo. Contoh: "Berhenti belajar time management"

### 7. 👁️ OBSERVATION
Kacamata pengamat personal, kata ganti pengalaman pribadi.

### 8. ⚔️ A VERSUS B
Bandingkan dua hal/metode, jelaskan mana yang lebih baik dan mengapa.

### 9. 📋 LIST
Daftar 5-7 poin. Contoh: "5 buku yang mengubah hidup gue"

---

${angleFunnel ? `FOKUS funnel: ${angleFunnel}. Sesuaikan semua angle untuk tujuan funnel ini.` : 'Untuk setiap angle, tentukan apakah cocok untuk TOFU, MOFU, atau BOFU.'}
Bahasa Indonesia natural. Sesuai style ${PLATFORMS[anglePlatform].label}.
</OUTPUT_FORMAT>`
  }

  async function handleGenerateIdeas() {
    if (!pilar) { toast.error('Pilih pilar konten terlebih dahulu.'); return false }
    if (ideaPlatforms.length === 0) { toast.error('Pilih minimal 1 platform.'); return false }
    await generateAndRedirect(buildIdeaPrompt())
    setGeneratedIdeas(true)
  }

  async function handleGenerateScript() {
    if (!scriptJudul.trim()) { toast.error('Masukkan judul/topik konten terlebih dahulu.'); return false }
    await generateAndRedirect(buildScriptPrompt())
    setGeneratedScript(true)
  }

  async function handleGenerateAngle() {
    if (!angleTopic.trim()) { toast.error('Masukkan topik/ide konten terlebih dahulu.'); return false }
    await generateAndRedirect(buildAnglePrompt())
    setGeneratedAngle(true)
  }

  async function handleSaveToPlan(idea) {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('content_planner').insert({
        user_id: user.id,
        judul: idea,
        pilar: pilar,
        status: 'Idea',
        platform: ideaPlatforms[0] || 'Instagram',
        funnel: ideaFunnel || 'TOFU',
      })
      if (error) throw error
      toast.success(`"${idea.slice(0, 40)}..." disimpan ke planner ✓`)
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleParseIdeas() {
    const lines = rawIdeas.split('\n').map(l => l.trim()).filter(l => l.length > 3)
    setIdeas(lines)
    toast.success(`${lines.length} ide berhasil diparsing.`)
  }

  return (
    <ModuleLayout
      title="💡 Content Generator"
      subtitle="Generate ide konten multi-platform, script/caption, dan angle twisting."
    >
      {/* ── Tab Switcher ── */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
        {[
          { key: 'ideas', label: 'Ide Konten', icon: Lightbulb },
          { key: 'script', label: 'Script & Caption', icon: Clapperboard },
          { key: 'angle', label: 'Angle Twisting', icon: RotateCcw },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === key ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === key ? '#f2ca50' : 'var(--text-secondary)',
              boxShadow: activeTab === key ? 'var(--shadow-card)' : 'none',
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════ IDEAS TAB ══════════════ */}
      {activeTab === 'ideas' && (
        <>
          <FormCard>
            {/* Pillar selector */}
            <div>
              <label className="label-base">Pilih Pilar Konten</label>
              {savedPillars.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {savedPillars.map((p, i) => (
                    <button
                      key={i} type="button" onClick={() => setPilar(p)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: pilar === p ? 'rgba(242,202,80,0.15)' : 'var(--bg-input)',
                        color: pilar === p ? '#f2ca50' : 'var(--text-secondary)',
                        border: pilar === p ? '1px solid rgba(242,202,80,0.4)' : '1px solid var(--border-color)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <Field id="pilar-input" label="" value={pilar} onChange={setPilar} placeholder="Contoh: Mindset Keuangan, Tips Produktivitas..." />
              )}
              {savedPillars.length > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Atau ketik manual:
                  <input type="text" value={pilar} onChange={e => setPilar(e.target.value)}
                    placeholder="Tulis pilar custom..." className="input-base text-sm py-1.5 mt-1" />
                </p>
              )}
            </div>

            {/* Multi-platform selector */}
            <PlatformSelector selected={ideaPlatforms} onChange={setIdeaPlatforms} multi={true} />

            <Field id="jumlah-ide" label="Jumlah Ide" value={jumlahIde} onChange={setJumlahIde} type="number" placeholder="5" />

            {/* Funnel selector */}
            <div>
              <label className="label-base">🔻 Funnel Konten (opsional — kosongkan untuk mix otomatis)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                <button type="button" onClick={() => setIdeaFunnel('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: !ideaFunnel ? 'rgba(242,202,80,0.15)' : 'var(--bg-input)', color: !ideaFunnel ? '#f2ca50' : 'var(--text-secondary)', border: !ideaFunnel ? '1px solid rgba(242,202,80,0.4)' : '1px solid var(--border-color)' }}>
                  🔄 Mix (TOFU+MOFU+BOFU)
                </button>
                {FUNNEL_OPTIONS.map(f => (
                  <button key={f.key} type="button" onClick={() => setIdeaFunnel(f.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: ideaFunnel === f.key ? `${f.color}18` : 'var(--bg-input)', color: ideaFunnel === f.key ? f.color : 'var(--text-secondary)', border: ideaFunnel === f.key ? `1px solid ${f.color}40` : '1px solid var(--border-color)' }}>
                    {f.emoji} {f.key}
                  </button>
                ))}
              </div>
              {ideaFunnel && <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{FUNNEL_OPTIONS.find(f => f.key === ideaFunnel)?.desc}</p>}
            </div>

            <InfoBanner>
              💡 <strong>Tips Token-Efficient:</strong> Untuk {ideaPlatforms.length > 3 ? 'banyak platform, kurangi jumlah ide (3-5)' : 'sedikit platform, bisa generate lebih banyak ide (5-10)'}
              agar output AI tetap berkualitas dan tidak terpotong.
            </InfoBanner>

            <GenerateButton onClick={handleGenerateIdeas} label={`Generate ${jumlahIde} Ide × ${ideaPlatforms.length} Platform`} />
          </FormCard>

          {generatedIdeas && (
            <>
              <InfoBanner>
                Paste hasil dari AI di kolom di bawah, satu ide per baris. Kemudian klik "Parse Ide" untuk menyimpan ke planner.
              </InfoBanner>

              <div className="glass-card p-5 space-y-4">
                <div>
                  <label htmlFor="raw-ideas" className="label-base">Paste Ide dari AI (satu per baris)</label>
                  <textarea id="raw-ideas" value={rawIdeas} onChange={e => setRawIdeas(e.target.value)} rows={8}
                    placeholder={"Ide Konten 1: Judul ide pertama...\nIde Konten 2: Judul ide kedua...\n..."} className="input-base resize-none" />
                </div>
                <button id="parse-ideas-btn" type="button" onClick={handleParseIdeas} className="btn-secondary">
                  <CheckCircle className="w-4 h-4" /> Parse Ide
                </button>

                {ideas.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{ideas.length} ide ditemukan</p>
                    {ideas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                        <span className="text-xs font-mono mt-0.5 select-none w-5 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                        <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{idea}</p>
                        <button type="button" onClick={() => handleSaveToPlan(idea)} disabled={saving}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                          style={{ color: '#f2ca50', border: '1px solid rgba(242,202,80,0.25)', background: 'var(--gold-glow)' }}>
                          <PlusCircle className="w-3.5 h-3.5" /> Simpan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════ SCRIPT TAB ══════════════ */}
      {activeTab === 'script' && (
        <>
          <FormCard>
            <Field id="script-judul" label="Judul / Topik Konten" value={scriptJudul} onChange={setScriptJudul}
              placeholder="Contoh: 3 Kesalahan Fatal Saat Mulai Investasi di Usia 20an..." />
            <PlatformSelector selected={scriptPlatform} onChange={setScriptPlatform} />
            <GenerateButton onClick={handleGenerateScript} label={`Generate Script ${PLATFORMS[scriptPlatform]?.label || ''}`} />
          </FormCard>

          {generatedScript && (
            <InfoBanner>
              Script dan caption siap! Setelah mendapat hasilnya, buka <strong>Content Planner</strong> untuk menyimpan dan mengelola draft konten Anda.
            </InfoBanner>
          )}
        </>
      )}

      {/* ══════════════ ANGLE TWISTING TAB ══════════════ */}
      {activeTab === 'angle' && (
        <>
          <InfoBanner>
            <strong>Angle Twisting</strong> — Ubah 1 topik konten menjadi 9 konten berbeda.
            Pilih platform target agar hook dan format dioptimalkan untuk platform tersebut.
          </InfoBanner>

          <FormCard>
            <Field id="angle-topic" label="Topik / Ide Konten Original" value={angleTopic} onChange={setAngleTopic}
              placeholder="Contoh: Pentingnya investasi sejak muda" />
            <PlatformSelector selected={anglePlatform} onChange={setAnglePlatform} />
            <GenerateButton onClick={handleGenerateAngle} label={`Generate 9 Angle untuk ${PLATFORMS[anglePlatform]?.label || ''}`} />
          </FormCard>

          {generatedAngle && (
            <InfoBanner>
              9 angle sudah di-generate! Paste hasilnya di tab <strong>Ide Konten</strong> untuk menyimpan ke Content Planner.
            </InfoBanner>
          )}
        </>
      )}
    </ModuleLayout>
  )
}
