import React, { useState } from 'react'
import { X, ExternalLink, Check, Copy } from 'lucide-react'

const AI_OPTIONS = [
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    color: '#10a37f',
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
    desc: 'OpenAI\'s GPT-4o',
  },
  {
    key: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/',
    color: '#d97757',
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M4.709 15.955l4.397-2.398L4.71 8.044l7.29-4.047L19.291 8.044l-4.397 5.513L19.291 15.955l-7.291 4.048z"/>
      </svg>
    ),
    desc: 'Anthropic\'s Claude',
  },
  {
    key: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/',
    color: '#4285f4',
    icon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 0C5.352 0 0 5.352 0 12s5.352 12 12 12 12-5.352 12-12S18.648 0 12 0zm0 21.6c-5.292 0-9.6-4.308-9.6-9.6S6.708 2.4 12 2.4s9.6 4.308 9.6 9.6-4.308 9.6-9.6 9.6z"/>
        <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" opacity="0.4"/>
      </svg>
    ),
    desc: 'Google\'s Gemini',
  },
]

/**
 * AI Picker Modal — lets user choose which AI to brainstorm with.
 * Prompt is already copied to clipboard when this opens.
 */
export default function AIPicker({ isOpen, onClose }) {
  const [copied, setCopied] = useState(true) // already copied when modal opens

  if (!isOpen) return null

  function handleSelect(ai) {
    window.open(ai.url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
         onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl overflow-hidden animate-scale-in"
           style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              🚀 Prompt Siap!
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Pilih AI untuk brainstorming
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copied confirmation */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
               style={{ background: 'var(--gold-glow)', color: '#f2ca50', border: '1px solid rgba(242,202,80,0.2)' }}>
            <Check className="w-3.5 h-3.5" />
            Prompt sudah disalin ke clipboard ✓
          </div>
        </div>

        {/* AI Options */}
        <div className="px-5 py-4 space-y-2">
          {AI_OPTIONS.map((ai) => {
            const IconComp = ai.icon
            return (
              <button
                key={ai.key}
                onClick={() => handleSelect(ai)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-150 group"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = ai.color
                  e.currentTarget.style.background = `${ai.color}08`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.style.background = 'var(--bg-surface)'
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: `${ai.color}15`, color: ai.color }}>
                  <IconComp />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ai.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ai.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: ai.color }} />
              </button>
            )
          })}
        </div>

        {/* Footer tip */}
        <div className="px-5 pb-4">
          <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
            Setelah AI terbuka, tekan <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>Ctrl+V</kbd> untuk paste prompt
          </p>
        </div>
      </div>
    </div>
  )
}
