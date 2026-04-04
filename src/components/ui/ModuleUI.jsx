import React, { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import AIPicker from '../AIPicker'

/**
 * Standard layout wrapper for each module.
 */
export function ModuleLayout({ title, subtitle, children }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-slide-up">
        <div className="mb-6">
          <h1 className="section-title">{title}</h1>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        <div className="space-y-5">{children}</div>
      </div>
    </div>
  )
}

/**
 * Gold gradient "Generate" button with AI Picker popup.
 * onClick should copy prompt to clipboard (via generateAndRedirect), then
 * this component shows the AI picker automatically.
 */
export function GenerateButton({ onClick, loading, label = 'Generate dengan AI' }) {
  const [showPicker, setShowPicker] = useState(false)

  async function handleClick() {
    if (onClick) {
      const result = await onClick()
      // If onClick returns false (validation failed), don't show picker
      if (result === false) return
    }
    setShowPicker(true)
  }

  return (
    <>
      <button
        id="generate-btn"
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {loading ? 'Memproses...' : label}
      </button>
      <AIPicker isOpen={showPicker} onClose={() => setShowPicker(false)} />
    </>
  )
}

/**
 * Standard form field card.
 */
export function FormCard({ children }) {
  return (
    <div className="glass-card p-5 space-y-4">
      {children}
    </div>
  )
}

/**
 * Reusable labeled text input.
 */
export function Field({ label, id, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="label-base">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
      />
    </div>
  )
}

/**
 * Reusable labeled textarea.
 */
export function TextareaField({ label, id, value, onChange, placeholder, rows = 4, readOnly = false }) {
  return (
    <div>
      <label htmlFor={id} className="label-base">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={`input-base resize-none ${readOnly ? 'cursor-default opacity-70' : ''}`}
      />
    </div>
  )
}

/**
 * Reusable labeled select.
 */
export function SelectField({ label, id, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="label-base">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-base"
      >
        {options.map(opt =>
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
    </div>
  )
}

/**
 * Info banner shown after generate action — gold themed.
 */
export function InfoBanner({ children }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg animate-scale-in"
         style={{
           background: 'var(--gold-glow)',
           border: '1px solid rgba(242, 202, 80, 0.2)',
           color: '#f2ca50',
         }}>
      <span className="text-lg leading-none mt-0.5">💡</span>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{children}</p>
    </div>
  )
}
