import React, { useMemo, useState } from 'react'
import { Search, MapPin, Truck, Download, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, money } from '../store'
import { CATEGORIES } from '../data'
import { ListingArt, Stars, Avatar, PageHead, inputCls } from '../ui'

export const FULFILL = {
  meetup: { label: 'Campus pick-up', icon: MapPin },
  shipping: { label: 'Ships', icon: Truck },
  'in-person': { label: 'In person', icon: MapPin },
  online: { label: 'Online', icon: Video },
  digital: { label: 'Digital download', icon: Download },
}

export function ListingCard({ l }) {
  const { s } = useStore()
  const nav = useNavigate()
  const seller = s.users[l.sellerId]
  const F = FULFILL[l.fulfillment]
  return (
    <button onClick={() => nav('/listing/' + l.id)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:-translate-y-0.5 hover:shadow-lg">
      <ListingArt listing={l} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug group-hover:text-brand">{l.title}</h3>
          <div className="shrink-0 text-right font-display text-lg font-bold tnum">{money(l.price)}<span className="block text-[11px] font-medium text-muted">{l.unit}</span></div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <Stars value={l.rating} count={l.reviews} />
          <span className="inline-flex items-center gap-1"><F.icon size={12} /> {F.label}</span>
        </div>
        <div className="mt-auto flex items-center gap-2 border-t border-line pt-3 text-xs">
          <Avatar user={seller} size={22} />
          <span className="truncate font-semibold">{seller.shop || seller.name}</span>
          <span className="truncate text-muted">· {seller.name}</span>
        </div>
      </div>
    </button>
  )
}

export default function Marketplace() {
  const { s, me } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState('popular')
  const [kind, setKind] = useState('all')

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    let r = s.listings.filter((l) => l.active && (cat === 'All' || l.category === cat) && (kind === 'all' || l.kind === kind)
      && (!t || [l.title, l.description, l.category, s.users[l.sellerId].shop].join(' ').toLowerCase().includes(t)))
    if (sort === 'popular') r = [...r].sort((a, b) => b.sales - a.sales)
    if (sort === 'low') r = [...r].sort((a, b) => a.price - b.price)
    if (sort === 'rating') r = [...r].sort((a, b) => b.rating - a.rating)
    if (sort === 'new') r = [...r].sort((a, b) => b.createdAt - a.createdAt)
    return r
  }, [s.listings, s.users, q, cat, sort, kind])

  return (
    <div>
      <PageHead eyebrow="Western marketplace" title={`Hi ${me.name.split(' ')[0]}, what do you need?`}
        sub="Everything here is sold by verified Western students. Pay safely: your money is only released when you swap codes." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tutoring, hoodies, textbooks…" className={`${inputCls} h-12 pl-10 text-[15px]`} />
        </div>
        <div className="flex gap-2">
          <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={`${inputCls} h-12 w-auto`} aria-label="Type">
            <option value="all">Products & services</option><option value="product">Products</option><option value="service">Services</option><option value="digital">Digital</option>
          </select>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className={`${inputCls} h-12 w-auto`} aria-label="Sort">
            <option value="popular">Most popular</option><option value="rating">Top rated</option><option value="low">Lowest price</option><option value="new">Newest</option>
          </select>
        </div>
      </div>
      <div className="noscrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${cat === c ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:text-ink'}`}>{c}</button>
        ))}
      </div>
      <div className="mb-3 text-[13px] text-muted tnum">{results.length} listing{results.length === 1 ? '' : 's'}</div>
      {results.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{results.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No listings match “{q}”. Try a broader search, or message us what you need: students post new listings every day.</div>
      )}
    </div>
  )
}
