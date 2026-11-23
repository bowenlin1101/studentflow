import React, { useMemo, useState } from 'react'
import { Search, Star, MapPin, Clock, BadgeCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, money, D } from '../store'
import { CATEGORIES } from '../data'
import { ListingArt, inputCls } from '../ui'
import { MOMENTS, CURRENT_MOMENT } from '../launch/lib/seed'

const momentLabel = (id) => MOMENTS.find((m) => m.id === id)?.label

export function MomentTag({ id, className = '' }) {
  if (!id) return null
  return <span className={`inline-block -rotate-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-white shadow-sm ${className}`}>{momentLabel(id)}</span>
}

export function ListingCard({ l, highlight }) {
  const { s } = useStore()
  const nav = useNavigate()
  const seller = s.users[l.sellerId]
  const from = l.bundles?.length > 1 ? 'From ' : ''
  return (
    <button onClick={() => nav('/listing/' + l.id)} className={`group text-left ${highlight ? 'animate-[pop_0.9s_ease-out]' : ''}`}>
      <div className="relative">
        <ListingArt listing={l} className={`aspect-[4/3] w-full rounded-2xl transition group-hover:opacity-90 ${highlight ? 'ring-4 ring-accent' : ''}`} />
        <MomentTag id={l.moment} className="absolute left-3 top-3" />
        {l.paused && <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-bg">Waitlist</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug">{l.title}</h3>
        <span className="shrink-0 font-semibold tnum">{from}{money(l.price)}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[13px] text-muted">
        <span className="truncate">{seller.name.split(' ')[0]} · {seller.year} year {seller.major}</span>
        <BadgeCheck size={14} className="shrink-0 text-brand" aria-label="Verified Western student" />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {l.reviews ? <span className="inline-flex items-center gap-1 tnum"><Star size={12} className="fill-accent text-accent" />{l.rating.toFixed(1)} ({l.reviews})</span> : <span className="font-semibold text-accent">New</span>}
        <span className="inline-flex items-center gap-1"><Clock size={12} />{l.nextSlot}</span>
        <span className="inline-flex items-center gap-1"><MapPin size={12} />{l.meetLocation}</span>
      </div>
    </button>
  )
}

function Row({ title, items, highlightId }) {
  if (!items.length) return null
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{items.map((l) => <ListingCard key={l.id} l={l} highlight={l.id === highlightId} />)}</div>
    </section>
  )
}

export default function Marketplace() {
  const { s, now, me } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const live = s.listings.filter((l) => l.active)
  const highlightId = s.lastPublished
  const mine = s.listings.find((l) => l.id === s.lastPublished && l.sellerId === me.id)

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    return live.filter((l) => (cat === 'All' || l.category === cat)
      && (!t || [l.title, l.description, l.category, s.users[l.sellerId].shop].join(' ').toLowerCase().includes(t)))
      .sort((a, b) => b.sales - a.sales)
  }, [live, s.users, q, cat])

  const browsing = !q.trim() && cat === 'All'
  const newest = [...live].filter((l) => now - l.createdAt < 10 * D).sort((a, b) => b.createdAt - a.createdAt).slice(0, 4)
  const moment = live.filter((l) => l.moment === CURRENT_MOMENT).sort((a, b) => b.sales - a.sales).slice(0, 4)
  const trending = [...live].sort((a, b) => b.sales - a.sales).filter((l) => !moment.includes(l)).slice(0, 4)

  return (
    <div>
      {mine && (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-3xl bg-brand p-5 text-white">
          <div className="min-w-0 flex-1"><div className="font-display text-xl font-bold">You’re live on campus!</div><div className="text-white/85">“{mine.title}” is in New on campus below.</div></div>
          <button onClick={() => nav('/launch/4')} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand">Next: Message 10 people</button>
        </div>
      )}
      <h1 className="mb-1 font-display text-3xl font-bold">Marketplace</h1>
      <p className="mb-6 text-muted">Everything here is sold by verified Western students.</p>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tutoring, workouts, cookies…" className={`${inputCls} h-12 !rounded-full pl-11 text-[15px]`} />
      </div>
      <div className="noscrollbar mb-10 flex gap-1 overflow-x-auto">
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${cat === c ? 'bg-ink text-bg' : 'text-muted hover:text-ink'}`}>{c}</button>
        ))}
      </div>
      {browsing ? (
        <>
          <Row title={`${momentLabel(CURRENT_MOMENT)} picks`} items={moment} highlightId={highlightId} />
          <Row title="New on campus" items={newest} highlightId={highlightId} />
          <Row title="Trending" items={trending} highlightId={highlightId} />
        </>
      ) : results.length ? (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{results.map((l) => <ListingCard key={l.id} l={l} highlight={l.id === highlightId} />)}</div>
      ) : (
        <p className="py-16 text-center text-muted">No results for “{q}”.</p>
      )}
    </div>
  )
}
