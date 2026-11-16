import React, { useEffect } from 'react'
import { X, Star, GraduationCap, Shirt, BookOpen, Palette, UtensilsCrossed, Lamp, Wrench, Laptop, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs><linearGradient id="sfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a72ff" /><stop offset="1" stopColor="#2f43d6" /></linearGradient></defs>
      <rect width="40" height="40" rx="10" fill="url(#sfg)" />
      <path d="M9 17c3.5-4.5 7-4.5 10.5 0s7 4.5 10.5 0" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M9 25c3.5-4.5 7-4.5 10.5 0s7 4.5 10.5 0" stroke="#ff8533" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}
export function Logo({ size = 30 }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span className="font-display font-bold tracking-tight text-ink" style={{ fontSize: size * 0.72 }}>studentflow</span>
    </span>
  )
}

const BTN = {
  primary: 'bg-brand text-white hover:brightness-110 shadow-sm',
  accent: 'bg-accent text-white hover:brightness-105 shadow-sm',
  ghost: 'text-ink hover:bg-surface2',
  outline: 'border border-line bg-surface text-ink hover:bg-surface2',
  danger: 'border border-danger/40 text-danger hover:bg-dangersoft',
  soft: 'bg-brandsoft text-brand hover:brightness-95',
}
export function Btn({ variant = 'primary', size = 'md', className = '', children, ...p }) {
  const sz = size === 'sm' ? 'h-8 px-3 text-[13px]' : size === 'lg' ? 'h-12 px-6 text-[15px]' : 'h-10 px-4 text-sm'
  return (
    <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${sz} ${BTN[variant]} ${className}`}>
      {children}
    </button>
  )
}

const TONE = {
  brand: 'bg-brandsoft text-brand', accent: 'bg-accentsoft text-accent', success: 'bg-successsoft text-success',
  warn: 'bg-warnsoft text-warn', danger: 'bg-dangersoft text-danger', muted: 'bg-surface2 text-muted',
}
export function Badge({ tone = 'muted', children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONE[tone]} ${className}`}>{children}</span>
}

export function Avatar({ user, size = 36 }) {
  if (!user) return null
  const initials = user.name.replace('Dr. ', '').split(' ').map((p) => p[0]).slice(0, 2).join('')
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${user.hue} 70% 58%), hsl(${user.hue + 30} 65% 45%))` }}>
      {initials}
    </span>
  )
}

const CAT_ICON = { Tutoring: GraduationCap, Merch: Shirt, Textbooks: BookOpen, Creative: Palette, Food: UtensilsCrossed, Home: Lamp, Services: Wrench, Tech: Laptop }
const CAT_HUE = { Tutoring: 228, Merch: 262, Textbooks: 200, Creative: 330, Food: 145, Home: 28, Services: 185, Tech: 240 }
export function ListingArt({ listing, className = '', big }) {
  const Icon = CAT_ICON[listing.category] || Palette
  const h = CAT_HUE[listing.category] ?? 230
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(140deg, hsl(${h} 85% 92%), hsl(${h + 25} 75% 80%))` }}>
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 80 C40 60 60 100 100 80 S160 60 200 80" stroke="white" strokeWidth="6" fill="none" />
        <path d="M0 98 C40 78 60 118 100 98 S160 78 200 98" stroke="#ff8533" strokeOpacity=".5" strokeWidth="6" fill="none" />
      </svg>
      <Icon size={big ? 72 : 40} strokeWidth={1.6} style={{ color: `hsl(${h} 60% 32%)` }} className="relative" />
    </div>
  )
}

export function Stars({ value, count }) {
  if (!count) return <span className="text-xs text-muted">New</span>
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted tnum">
      <Star size={13} className="fill-accent text-accent" /> <b className="text-ink">{value.toFixed(1)}</b> ({count})
    </span>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className={`max-h-[92vh] w-full overflow-auto rounded-t-2xl bg-surface p-5 shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface2" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}
export const inputCls = 'w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none'

export function PageHead({ eyebrow, title, sub, right }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</div>}
        <h1 className="font-display text-[28px] font-bold leading-tight sm:text-[32px]">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function Panel({ className = '', children }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>
}

export function Gate({ need, title, children }) {
  const nav = useNavigate()
  return (
    <Panel className="mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accentsoft text-accent"><Lock size={22} /></span>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted">{children}</p>
      <Btn className="mt-5" onClick={() => nav('/pricing')}>See {need} plan</Btn>
    </Panel>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="noscrollbar mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface2 p-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${value === t.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
          {t.label}{t.count != null && <span className="ml-1.5 text-muted tnum">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
