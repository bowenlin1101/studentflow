import React, { useMemo, useState } from 'react'
import { Search, MapPin, Truck, Download, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, money } from '../store'
import { CATEGORIES } from '../data'
import { ListingArt, inputCls } from '../ui'

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
  return (
    <button onClick={() => nav('/listing/' + l.id)} className="group text-left">
      <ListingArt listing={l} className="aspect-[4/3] w-full rounded-2xl transition group-hover:opacity-90" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug">{l.title}</h3>
        <span className="shrink-0 font-semibold tnum">{money(l.price)}</span>
      </div>
      <div className="mt-0.5 text-[13px] text-muted">{seller.shop || seller.name}</div>
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
      <h1 className="mb-6 font-display text-3xl font-bold">Marketplace</h1>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className={`${inputCls} h-12 !rounded-full pl-11 text-[15px]`} />
      </div>
      <div className="mb-8 flex items-center gap-3">
        <div className="noscrollbar flex flex-1 gap-1 overflow-x-auto">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${cat === c ? 'bg-ink text-bg' : 'text-muted hover:text-ink'}`}>{c}</button>
          ))}
        </div>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="shrink-0 bg-transparent text-[13px] font-medium text-muted focus:outline-none" aria-label="Sort">
          <option value="popular">Popular</option><option value="rating">Top rated</option><option value="low">Lowest price</option><option value="new">Newest</option>
        </select>
      </div>
      {results.length ? (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{results.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      ) : (
        <p className="py-16 text-center text-muted">No results for “{q}”.</p>
      )}
    </div>
  )
}
