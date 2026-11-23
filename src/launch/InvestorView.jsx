import React, { useEffect, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { useStore, money2 } from '../store'
import { orderMoney, minimumOrderForPositiveNet } from './lib/pricing'
import { FEES, SUBSCRIPTION } from './lib/config'
import { inputCls } from '../ui'

/** Hidden unit-economics panel. Press I, or triple-tap the logo. */
export default function InvestorView() {
  const { s } = useStore()
  const [open, setOpen] = useState(false)
  const [listingId, setListingId] = useState('')
  const [saleNumber, setSaleNumber] = useState(1)
  const [rebook, setRebook] = useState(false)
  const [custom, setCustom] = useState('')

  useEffect(() => {
    const key = (e) => {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if (e.key === 'i' || e.key === 'I') setOpen((o) => !o)
      if (e.key === 'Escape') setOpen(false)
    }
    const tap = () => setOpen((o) => !o)
    window.addEventListener('keydown', key)
    window.addEventListener('sf-investor', tap)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('sf-investor', tap) }
  }, [])
  if (!open) return null

  const listings = s.listings
  const l = listings.find((x) => x.id === listingId) || listings.find((x) => x.id === s.lastPublished) || listings.find((x) => x.id === 'l_cookies') || listings[0]
  const price = custom !== '' ? +custom || 0 : l.price
  const m = orderMoney(price, { saleNumber, isRebook: rebook })
  const minOrder = minimumOrderForPositiveNet()
  const rows = [
    ['Buyer pays', m.buyerPays, `${money2(price)} + ${money2(m.buyerFee)} Buyer Protection`],
    ['Seller keeps', m.sellerTakeHome, `after ${Math.round(m.rate * 1000) / 10}% fee`],
    ['Stripe cost', -m.stripeCost, `${Math.round(FEES.stripePercent * 1000) / 10}% + ${money2(FEES.stripeFixed)}, paid by StudentFlow`],
    ['StudentFlow net', m.platformNet, `${money2(m.platformFee)} fee + ${money2(m.buyerFee)} protection − Stripe`],
  ]
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Investor view">
        <div className="flex items-start justify-between">
          <div><div className="text-[13px] font-semibold text-accent">Investor view</div><h2 className="font-display text-2xl font-bold">Money on one order</h2></div>
          <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-muted hover:bg-bg" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-3">
          <select value={l.id} onChange={(e) => { setListingId(e.target.value); setCustom('') }} className={inputCls} aria-label="Sample listing">
            {listings.map((x) => <option key={x.id} value={x.id}>{x.title} · {money2(x.price)}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[13px] font-medium">Price<input type="number" min="1" step="0.5" value={custom !== '' ? custom : l.price} onChange={(e) => setCustom(e.target.value)} className={`${inputCls} mt-1 tnum`} /></label>
            <label className="text-[13px] font-medium">Seller’s sale # <span className="font-normal text-muted">({saleNumber <= FEES.sellerTiers[0].upToSales ? '8%' : '6%'})</span><input type="number" min="1" value={saleNumber} onChange={(e) => setSaleNumber(+e.target.value || 1)} className={`${inputCls} mt-1 tnum`} /></label>
          </div>
          <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={rebook} onChange={(e) => setRebook(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand))]" /> Same buyer rebooking (4%, no Buyer Protection)</label>
        </div>
        <dl className="mt-5 divide-y divide-line rounded-2xl bg-bg tnum">
          {rows.map(([k, v, sub], i) => (
            <div key={k} className={`flex items-center justify-between gap-4 px-4 py-3 ${i === 3 ? 'font-semibold' : ''}`}>
              <dt><span className="block">{k}</span><span className="text-[12px] font-normal text-muted">{sub}</span></dt>
              <dd className={`font-display text-xl ${i === 3 && v < 0 ? 'text-danger' : ''}`}>{v < 0 ? '−' : ''}{money2(Math.abs(v))}</dd>
            </div>
          ))}
        </dl>
        {m.platformNet < 0 && <div className="mt-4 flex gap-2 rounded-2xl bg-dangersoft px-4 py-3 text-[14px]"><AlertTriangle size={18} className="shrink-0 text-danger" />Negative on this order. Consider a minimum order of {money2(minOrder)} for first-time orders, or bundling small items.</div>}
        <p className="mt-4 text-[12px] text-muted">Plus ${SUBSCRIPTION.monthly}/month per active seller after the trial (3 sales or 30 days, whichever is later).</p>
      </div>
    </div>
  )
}
