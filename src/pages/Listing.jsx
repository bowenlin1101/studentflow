import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { useStore, money, money2, fmtDay, fmtWhen, D, H, LOCK_MS, cancelFee } from '../store'
import { SPOTS } from '../data'
import { ListingArt, Avatar, Btn, inputCls, Modal } from '../ui'

export default function ListingPage() {
  const { id } = useParams()
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const l = s.listings.find((x) => x.id === id)
  const seller = l && s.users[l.sellerId]
  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime() + (i + 1) * D }), [now])
  const shipping = l?.fulfillment === 'shipping'
  const digital = l?.fulfillment === 'digital'
  const [qty, setQty] = useState(l?.id === 'l_totes' ? 20 : 1)
  const [day, setDay] = useState(days[0])
  const [hour, setHour] = useState(14)
  const [loc, setLoc] = useState(l?.fulfillment === 'online' ? 'Online (Zoom)' : SPOTS[0])
  const [confirm, setConfirm] = useState(false)
  if (!l) return <div>Listing not found.</div>
  const own = l.sellerId === me.id
  const total = l.price * qty
  const handoffAt = shipping ? now + 7 * D : digital ? now + H : day + hour * H
  const lockAt = handoffAt - LOCK_MS

  const message = () => { dispatch({ type: 'startConv', listingId: l.id, buyerId: me.id }); nav('/messages') }
  const place = () => {
    dispatch({ type: 'placeOrder', listingId: l.id, buyerId: me.id, qty, handoffAt, note: '',
      location: shipping ? 'Shipped (Canada Post)' : digital ? 'Digital delivery' : loc })
    setConfirm(false); toast('Order placed'); nav('/orders/latest')
  }

  return (
    <div>
      <button onClick={() => nav(-1)} className="mb-6 text-muted hover:text-ink" aria-label="Back"><ArrowLeft size={20} /></button>
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <ListingArt listing={l} className="aspect-[16/10] w-full rounded-3xl" />
          <div className="mt-8 flex items-start justify-between gap-6">
            <h1 className="font-display text-3xl font-bold leading-tight">{l.title}</h1>
            <div className="shrink-0 text-right font-display text-2xl font-bold tnum">{money(l.price)}<div className="text-[13px] font-normal text-muted">{l.unit}</div></div>
          </div>
          {l.reviews > 0 && <div className="mt-2 flex items-center gap-1 text-[13px] text-muted"><Star size={13} className="fill-accent text-accent" />{l.rating.toFixed(1)} · {l.sales} sold</div>}
          <p className="mt-5 max-w-[60ch] leading-relaxed text-muted">{l.description}</p>
          <div className="mt-8 flex items-center gap-3">
            <Avatar user={seller} size={40} />
            <div className="min-w-0 flex-1"><div className="font-medium">{seller.shop || seller.name}</div><div className="text-[13px] text-muted">{seller.name}</div></div>
            {!own && me.role !== 'expert' && <Btn variant="outline" size="sm" onClick={message}>Message</Btn>}
          </div>
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
            ) : me.role === 'expert' ? (
              <p className="text-sm text-muted">Experts can browse but not buy.</p>
            ) : (
              <div className="space-y-3">
                <input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} className={`${inputCls} tnum`} aria-label="Quantity" />
                {!shipping && !digital && (
                  <>
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
                  </>
                )}
                <div className="flex justify-between pt-3 font-display text-lg font-bold tnum"><span>Total</span><span>{money2(total)}</span></div>
                <Btn className="w-full" size="lg" onClick={() => setConfirm(true)}>Buy</Btn>
                <p className="text-center text-xs text-muted">You’re only charged after the code swap.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Confirm order">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted">Item</dt><dd>{l.title}</dd>
          <dt className="text-muted">When</dt><dd>{shipping ? 'Ships in ~7 days' : digital ? 'Digital delivery' : `${fmtWhen(handoffAt)}`}</dd>
          {!shipping && !digital && <><dt className="text-muted">Where</dt><dd>{loc}</dd></>}
          <dt className="text-muted">Card</dt><dd>Visa ·· 4242 (demo)</dd>
          <dt className="text-muted">Hold</dt><dd className="font-semibold tnum">{money2(total)}</dd>
        </dl>
        {!shipping && !digital && <p className="mt-4 text-xs text-muted">Free to cancel until {fmtWhen(lockAt)}. After that, {money2(cancelFee(total))} goes to the seller.</p>}
        <Btn className="mt-5 w-full" size="lg" onClick={place}>Confirm</Btn>
      </Modal>
    </div>
  )
}
