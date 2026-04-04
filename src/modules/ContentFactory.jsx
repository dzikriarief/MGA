import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { generateAndRedirect } from '../utils/generateAndRedirect'
import {
  ModuleLayout, FormCard, Field, SelectField, TextareaField, GenerateButton, InfoBanner
} from '../components/ui/ModuleUI'
import { PlusCircle, Loader2, CheckCircle, Clapperboard, Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'

const PLATFORM_OPTIONS = [
  { value: 'IG Reels', label: 'Instagram Reels' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'YouTube Shorts', label: 'YouTube Shorts' },
]

export default function ContentIdeas() {
  const { user, profile } = useAuth()

  // Tabs: 'ideas' | 'script'
  const [activeTab, setActiveTab] = useState('ideas')

  // ── Ideas tab state ──
  const [pilar, setPilar] = useState('')
  const [jumlahIde, setJumlahIde] = useState('10')
  const [ideas, setIdeas] = useState([])
  const [rawIdeas, setRawIdeas] = useState('')
  const [saving, setSaving] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState(false)

  // ── Script tab state ──
  const [scriptJudul, setScriptJudul] = useState('')
  const [scriptPlatform, setScriptPlatform] = useState('IG Reels')
  const [generatedScript, setGeneratedScript] = useState(false)

  // Pillars from profile
  const savedPillars = profile?.final_pillars?.length > 0
    ? profile.final_pillars
    : (profile?.content_pillars || [])

  // ── Ideas: Build prompt ──
  function buildIdeaPrompt() {
    return `Kamu adalah Content Strategist dan Viral Content Expert untuk media sosial Indonesia (Instagram, TikTok, LinkedIn).

Pilar konten saya: **${pilar}**

Tugas: Buat ${jumlahIde} ide konten viral yang kreatif dan relevan untuk pilar "${pilar}" ini.

Untuk setiap ide konten:
1. **Judul Konten** — judulnya harus hook yang menarik (bisa pakai angka, pertanyaan, atau statement)
2. **Format Konten** — (pilih: Carousel, Reels/Short Video, Single Image, Story, TikTok)
3. **Hook Pembuka** — kalimat pertama yang bikin orang berhenti scroll (1-2 kalimat)
4. **Level Viral** — (rendah/sedang/tinggi) + alasan singkat

Buat daftar semua ${jumlahIde} ide dengan format yang terstruktur dan mudah dibaca.
Gunakan bahasa Indonesia yang natural dan relevan dengan audiens Indonesia.`
  }

  // ── Script: Build prompt ──
  function buildScriptPrompt() {
    const platformGuide = {
      'IG Reels': 'Instagram Reels (durasi 30-60 detik, energik, visual-driven, trending audio)',
      'TikTok': 'TikTok (durasi 15-60 detik, autentik, fun, POV/storytelling style)',
      'LinkedIn': 'LinkedIn (professional, thought-leadership, lebih panjang dan substantif)',
      'YouTube Shorts': 'YouTube Shorts (durasi 30-60 detik, value-packed, punchy delivery)',
    }[scriptPlatform]

    return `Kamu adalah Viral Content Creator dan Copywriter expert untuk media sosial Indonesia.

Judul / Topik Konten: **${scriptJudul}**
Platform: **${platformGuide}**

Buat untuk saya:

## 1. VIDEO SCRIPT

**HOOK (5 detik pertama)**
[Kalimat pembuka yang sangat menarik dan bikin orang berhenti scroll — buat 2 pilihan]

**FORESHADOW**
[Teaser singkat yang membuat penonton penasaran dan ingin menonton sampai habis]

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

  async function handleGenerateIdeas() {
    if (!pilar) {
      toast.error('Pilih pilar konten terlebih dahulu.')
      return false
    }
    await generateAndRedirect(buildIdeaPrompt())
    setGeneratedIdeas(true)
  }

  async function handleGenerateScript() {
    if (!scriptJudul.trim()) {
      toast.error('Masukkan judul/topik konten terlebih dahulu.')
      return false
    }
    await generateAndRedirect(buildScriptPrompt())
    setGeneratedScript(true)
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
      title="💡 Content Ideas"
      subtitle="Generate ide konten viral dan script/caption lengkap untuk konten Anda."
    >
      {/* ── Tab Switcher ── */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
        {[
          { key: 'ideas', label: 'Ide Konten', icon: Lightbulb },
          { key: 'script', label: 'Script & Caption', icon: Clapperboard },
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
            {/* Pillar selector: clickable chips */}
            <div>
              <label className="label-base">Pilih Pilar Konten</label>
              {savedPillars.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {savedPillars.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPilar(p)}
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
                <Field
                  id="pilar-input"
                  label=""
                  value={pilar}
                  onChange={setPilar}
                  placeholder="Contoh: Mindset Keuangan, Tips Produktivitas..."
                />
              )}
              {savedPillars.length > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Atau ketik manual:
                  <input
                    type="text"
                    value={pilar}
                    onChange={e => setPilar(e.target.value)}
                    placeholder="Tulis pilar custom..."
                    className="input-base text-sm py-1.5 mt-1"
                  />
                </p>
              )}
            </div>

            <Field
              id="jumlah-ide"
              label="Jumlah Ide"
              value={jumlahIde}
              onChange={setJumlahIde}
              type="number"
              placeholder="10"
            />

            <GenerateButton onClick={handleGenerateIdeas} label={`Generate ${jumlahIde} Ide Konten`} />
          </FormCard>

          {generatedIdeas && (
            <>
              <InfoBanner>
                Paste hasil dari ChatGPT di kolom di bawah, satu ide per baris. Kemudian klik "Parse Ide" untuk menyimpan ke planner.
              </InfoBanner>

              <div className="glass-card p-5 space-y-4">
                <div>
                  <label htmlFor="raw-ideas" className="label-base">Paste Ide dari ChatGPT (satu per baris)</label>
                  <textarea
                    id="raw-ideas"
                    value={rawIdeas}
                    onChange={e => setRawIdeas(e.target.value)}
                    rows={8}
                    placeholder={"Ide Konten 1: Judul ide pertama...\nIde Konten 2: Judul ide kedua...\n..."}
                    className="input-base resize-none"
                  />
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
                        <button
                          type="button"
                          onClick={() => handleSaveToPlan(idea)}
                          disabled={saving}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                          style={{ color: '#f2ca50', border: '1px solid rgba(242,202,80,0.25)', background: 'var(--gold-glow)' }}
                        >
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
            <Field
              id="script-judul"
              label="Judul / Topik Konten"
              value={scriptJudul}
              onChange={setScriptJudul}
              placeholder="Contoh: 3 Kesalahan Fatal Saat Mulai Investasi di Usia 20an..."
            />
            <SelectField
              id="script-platform"
              label="Platform"
              value={scriptPlatform}
              onChange={setScriptPlatform}
              options={PLATFORM_OPTIONS}
            />

            <GenerateButton onClick={handleGenerateScript} label="Generate Script & Caption" />
          </FormCard>

          {generatedScript && (
            <InfoBanner>
              Script dan caption siap di ChatGPT! Setelah mendapat hasilnya, buka <strong>Content Planner</strong> untuk menyimpan dan mengelola draft konten Anda.
            </InfoBanner>
          )}
        </>
      )}
    </ModuleLayout>
  )
}
