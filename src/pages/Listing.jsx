import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, BadgeCheck, ShieldCheck, Repeat, FileSignature } from 'lucide-react'
import { useStore, money, money2, fmtDay, fmtWhen, D, H, LOCK_MS, cancelFee } from '../store'
import { SPOTS } from '../data'
import { ListingArt, Avatar, Btn, inputCls, Modal } from '../ui'
import { MomentTag } from './Marketplace'
import { buyerFee } from '../launch/lib/pricing'

export default function ListingPage() {
  const { id } = useParams()
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const l = s.listings.find((x) => x.id === id)
  const seller = l && s.users[l.sellerId]
  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime() + (i + 1) * D }), [now])
  const [bundleIdx, setBundleIdx] = useState(0)
  const [day, setDay] = useState(days[0])
  const [hour, setHour] = useState(14)
  const [loc, setLoc] = useState(l?.meetLocation || SPOTS[0])
  const [confirm, setConfirm] = useState(false)
  if (!l) return <div>Listing not found.</div>
  const own = l.sellerId === me.id
  const isService = l.kind === 'service'
  const verb = isService ? 'Book' : 'Order'
  const rebook = s.orders.some((o) => o.sellerId === l.sellerId && o.buyerId === me.id && o.outcome === 'completed')
  const fee = buyerFee(rebook)
  const bundles = l.bundles?.length ? l.bundles : [{ name: isService ? '1 session' : 'Single order', price: l.price, qty: 1 }]
  const b = bundles[bundleIdx]
  const total = b.price + fee
  const handoffAt = day + hour * H
  const first = seller.name.split(' ')[0]

  const message = () => { dispatch({ type: 'startConv', listingId: l.id, buyerId: me.id }); nav('/messages') }
  const place = () => {
    dispatch({ type: 'placeOrder', listingId: l.id, buyerId: me.id, qty: 1, price: b.price, bundle: b.name, handoffAt, location: loc })
    setConfirm(false); toast(rebook ? `Booked again with ${first}` : 'Order placed'); nav('/orders/latest')
  }

  return (
    <div>
      <button onClick={() => nav(-1)} className="mb-6 text-muted hover:text-ink" aria-label="Back"><ArrowLeft size={20} /></button>
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="relative">
            <ListingArt listing={l} className="aspect-[16/10] w-full rounded-3xl" />
            <MomentTag id={l.moment} className="absolute left-4 top-4 text-[13px]" />
          </div>
          <div className="mt-8 flex items-start justify-between gap-6">
            <h1 className="font-display text-3xl font-bold leading-tight">{l.title}</h1>
            <div className="shrink-0 text-right font-display text-2xl font-bold tnum">{bundles.length > 1 ? 'From ' : ''}{money(l.price)}<div className="text-[13px] font-normal text-muted">{l.unit}</div></div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            {l.reviews ? <span className="inline-flex items-center gap-1"><Star size={13} className="fill-accent text-accent" />{l.rating.toFixed(1)} · {l.reviews} reviews · {l.sales} sold</span> : <span className="font-semibold text-accent">New on campus</span>}
            <span>Next: {l.nextSlot}</span><span>{l.meetLocation}</span>
          </div>
          <p className="mt-5 max-w-[60ch] leading-relaxed text-muted">{l.description}</p>

          {!!l.includes?.length && (
            <div className="mt-6 flex flex-wrap gap-2">{l.includes.map((x) => <span key={x} className="rounded-full bg-surface px-3 py-1 text-[13px]">{x}</span>)}</div>
          )}
          {(l.allergens?.length || l.waiver) && (
            <div className="mt-6 flex flex-wrap gap-4 text-[13px]">
              {!!l.allergens?.length && <span><b>Contains:</b> {l.allergens.join(', ')}</span>}
              {l.waiver && <span className="inline-flex items-center gap-1.5"><FileSignature size={14} className="text-brand" /> Waiver included at booking</span>}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <Avatar user={seller} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 font-medium">{seller.name}<BadgeCheck size={15} className="text-brand" aria-label="Verified Western student" /></div>
              <div className="text-[13px] text-muted">{seller.year} year · {seller.major}{l.story ? ` · ${l.story}` : ''}</div>
            </div>
            {!own && <Btn variant="outline" size="sm" onClick={message}>Message</Btn>}
          </div>

          {!!l.faq?.length && (
            <div className="mt-10">
              <h2 className="mb-3 font-display text-lg font-bold">Questions people ask</h2>
              <div className="grid gap-4">{l.faq.map((f) => <div key={f.q}><div className="font-medium">{f.q}</div><div className="text-[14px] text-muted">{f.a}</div></div>)}</div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-3xl bg-surface p-6">
            {own ? (
              <>
                <div className="grid grid-cols-3 text-center tnum">
                  {[['Views', l.views], ['Sales', l.sales], ['Rating', l.reviews ? l.rating.toFixed(1) : '–']].map(([k, v]) => (
                    <div key={k}><div className="font-display text-xl font-bold">{typeof v === 'number' ? v.toLocaleString() : v}</div><div className="text-xs text-muted">{k}</div></div>
                  ))}
                </div>
                <Btn variant="outline" className="mt-6 w-full" onClick={() => nav('/sell')}>Seller dashboard</Btn>
              </>
            ) : l.paused ? (
              <div className="text-center">
                <p className="text-sm text-muted">{first} is paused for finals. Join the waitlist and you’ll get first pick when they’re back.</p>
                <Btn className="mt-4 w-full" onClick={() => toast(`You’re on ${first}’s waitlist`)}>Join waitlist</Btn>
              </div>
            ) : (
              <div className="space-y-3">
                {rebook && <div className="flex items-center gap-2 rounded-xl bg-brandsoft px-3 py-2 text-[13px] font-medium text-brand"><Repeat size={15} /> Book again with {first}: no Buyer Protection fee</div>}
                {bundles.length > 1 && (
                  <div className="grid gap-2" role="radiogroup" aria-label="Options">
                    {bundles.map((x, i) => (
                      <button key={x.name} role="radio" aria-checked={i === bundleIdx} onClick={() => setBundleIdx(i)} className={`flex justify-between rounded-xl border px-4 py-3 text-sm ${i === bundleIdx ? 'border-brand bg-brandsoft/50' : 'border-line'}`}>
                        <span>{x.name}</span><span className="font-semibold tnum">{money2(x.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <select id="day" value={day} onChange={(e) => setDay(+e.target.value)} className={inputCls} aria-label="Day">
                    {days.map((d) => <option key={d} value={d}>{fmtDay(d)}</option>)}
                  </select>
                  <select id="hour" value={hour} onChange={(e) => setHour(+e.target.value)} className={inputCls} aria-label="Time">
                    {Array.from({ length: 13 }, (_, i) => 9 + i).map((h) => <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</option>)}
                  </select>
                </div>
                <select id="loc" value={loc} onChange={(e) => setLoc(e.target.value)} className={inputCls} aria-label="Meeting spot">
                  {SPOTS.map((x) => <option key={x}>{x}</option>)}
                </select>
                <div className="space-y-1 pt-3 text-sm tnum">
                  <div className="flex justify-between text-muted"><span>{b.name}</span><span>{money2(b.price)}</span></div>
                  <div className="flex justify-between text-muted"><span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> Buyer Protection</span><span>{fee ? money2(fee) : <s>$1.00</s>}</span></div>
                  <div className="flex justify-between pt-1 font-display text-lg font-bold text-ink"><span>Total</span><span>{money2(total)}</span></div>
                </div>
                <Btn className="w-full" size="lg" onClick={() => setConfirm(true)}>{rebook ? `Book again with ${first}` : verb}</Btn>
                <p className="text-center text-xs text-muted">Charged only after the code swap.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={`Confirm ${verb.toLowerCase()}`}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm tnum">
          <dt className="text-muted">{verb === 'Book' ? 'Session' : 'Item'}</dt><dd>{l.title} · {b.name}</dd>
          <dt className="text-muted">When</dt><dd>{fmtWhen(handoffAt)}</dd>
          <dt className="text-muted">Where</dt><dd>{loc}</dd>
          <dt className="text-muted">Card</dt><dd>Visa ·· 4242 (demo)</dd>
          <dt className="text-muted">Hold</dt><dd className="font-semibold">{money2(total)} <span className="font-normal text-muted">incl. {fee ? '$1.00 Buyer Protection' : 'no Buyer Protection fee (rebook)'}</span></dd>
        </dl>
        {l.waiver && <p className="mt-4 text-xs text-muted">By booking you agree to {first}’s activity waiver.</p>}
        <p className="mt-2 text-xs text-muted">Free to cancel until {fmtWhen(handoffAt - LOCK_MS)}. After that, {money2(cancelFee(b.price))} goes to {first}.</p>
        <Btn className="mt-5 w-full" size="lg" onClick={place}>Confirm</Btn>
      </Modal>
    </div>
  )
}
