import React, { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import QRCode from 'qrcode'
import { inputCls } from '../ui'

/** One-tap options with an optional "Other" free-text field. Large targets for phones. */
export function Choices({ options, value, onChange, multi = false, other, onOther, max, columns = 1, name }) {
  const sel = multi ? value || [] : value
  const isOn = (id) => (multi ? sel.includes(id) : sel === id)
  const toggle = (id) => {
    if (!multi) return onChange(id)
    if (sel.includes(id)) onChange(sel.filter((x) => x !== id))
    else if (!max || sel.length < max) onChange([...sel, id])
  }
  const all = onOther !== undefined ? [...options, { id: 'other', label: 'Other' }] : options
  return (
    <div>
      <div role={multi ? 'group' : 'radiogroup'} aria-label={name} className={`grid gap-2.5 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
        {all.map((o) => (
          <button key={o.id} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={isOn(o.id)} onClick={() => toggle(o.id)}
            className={`flex min-h-[56px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-medium transition ${isOn(o.id) ? 'border-brand bg-brandsoft/70 text-ink' : 'border-line bg-surface hover:border-brand/40'}`}>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${multi ? 'rounded-md' : 'rounded-full'} border-2 ${isOn(o.id) ? 'border-brand bg-brand text-white' : 'border-line'}`}>{isOn(o.id) && <Check size={13} strokeWidth={3} />}</span>
            <span className="min-w-0 flex-1">{o.label}{o.hint && <span className="mt-0.5 block text-[13px] font-normal text-muted">{o.hint}</span>}</span>
          </button>
        ))}
      </div>
      {onOther !== undefined && isOn('other') && (
        <input autoFocus value={other || ''} onChange={(e) => onOther(e.target.value)} placeholder="Tell us in a few words" className={`${inputCls} mt-3 h-12`} aria-label="Other" />
      )}
      {multi && max && <p className="mt-2 text-xs text-muted">Pick up to {max}.</p>}
    </div>
  )
}

export function TextAnswer({ value, onChange, placeholder, multiline, id }) {
  const C = multiline ? 'textarea' : 'input'
  return <C id={id} rows={multiline ? 3 : undefined} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} ${multiline ? '' : 'h-14'} text-[16px]`} autoFocus />
}

export function CopyBox({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false)
  const [sel, setSel] = useState(false)
  const copy = () => {
    try {
      navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500) }, () => setSel(true))
    } catch { setSel(true) }
  }
  return (
    <div className="rounded-2xl bg-bg p-4">
      <p className={`whitespace-pre-line text-[14px] leading-relaxed ${sel ? 'select-all' : ''}`}>{text}</p>
      <button type="button" onClick={copy} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand">
        {done ? <><Check size={14} /> Copied</> : <><Copy size={14} /> {label}</>}
      </button>
    </div>
  )
}

export function QR({ text, size = 132 }) {
  const [src, setSrc] = useState('')
  useEffect(() => { QRCode.toDataURL(text, { margin: 1, width: size * 2, color: { dark: '#181b3a', light: '#ffffff' } }).then(setSrc).catch(() => {}) }, [text, size])
  return src ? <img src={src} width={size} height={size} alt={`QR code for ${text}`} className="rounded-xl" /> : <div style={{ width: size, height: size }} className="rounded-xl bg-bg" />
}

/** The result card at the end of each stage. */
export function OutputCard({ eyebrow, title, children }) {
  return (
    <div className="rounded-3xl bg-surface p-6 sm:p-8">
      {eyebrow && <div className="text-[13px] font-semibold text-accent">{eyebrow}</div>}
      {title && <h2 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>}
      <div className="mt-5">{children}</div>
    </div>
  )
}

export function Stat({ label, value, sub, hero }) {
  return (
    <div className={hero ? 'rounded-2xl bg-brand p-4 text-white' : 'rounded-2xl bg-bg p-4'}>
      <div className={`text-[12px] ${hero ? 'text-white/80' : 'text-muted'}`}>{label}</div>
      <div className={`mt-0.5 font-display font-bold tnum ${hero ? 'text-4xl' : 'text-2xl'}`}>{value}</div>
      {sub && <div className={`mt-0.5 text-[12px] ${hero ? 'text-white/80' : 'text-muted'}`}>{sub}</div>}
    </div>
  )
}

export function Nudge({ tone = 'warn', children }) {
  return <div className={`rounded-2xl px-4 py-3 text-[14px] ${tone === 'warn' ? 'bg-warnsoft' : tone === 'good' ? 'bg-successsoft' : 'bg-brandsoft'}`}>{children}</div>
}
