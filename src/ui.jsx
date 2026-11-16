import React, { useEffect } from 'react'
import { X, Star, Lock } from 'lucide-react'
import { ListingImage } from './art'
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
  primary: 'bg-brand text-white hover:brightness-110',
  accent: 'bg-accent text-white hover:brightness-105',
  ghost: 'text-ink hover:bg-surface2',
  outline: 'border border-line bg-surface text-ink hover:bg-surface2',
  danger: 'border border-danger/40 text-danger hover:bg-dangersoft',
  soft: 'bg-brandsoft text-brand hover:brightness-95',
}
export function Btn({ variant = 'primary', size = 'md', className = '', children, ...p }) {
  const sz = size === 'sm' ? 'h-8 px-3 text-[13px]' : size === 'lg' ? 'h-12 px-6 text-[15px]' : 'h-10 px-4 text-sm'
  return (
    <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${sz} ${BTN[variant]} ${className}`}>
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

export function ListingArt({ listing, className = '' }) {
  return <ListingImage listing={listing} className={className} rounded="" />
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

export function PageHead({ title, right }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {right}
    </div>
  )
}

export function Panel({ className = '', children }) {
  return <div className={`rounded-3xl bg-surface ${className}`}>{children}</div>
}

export function Gate({ title, children }) {
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Lock size={22} className="mx-auto text-muted" />
      <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
      {children && <p className="mt-2 text-muted">{children}</p>}
      <Btn className="mt-6" onClick={() => nav('/pricing')}>See plans</Btn>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="noscrollbar mb-8 flex gap-6 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition ${value === t.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
