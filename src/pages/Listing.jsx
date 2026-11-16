import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, ShieldCheck, Lock, CreditCard, Info } from 'lucide-react'
import { useStore, money, money2, fmtDay, fmtWhen, D, H, LOCK_MS, cancelFee } from '../store'
import { SPOTS } from '../data'
import { ListingArt, Stars, Avatar, Btn, Badge, Field, inputCls, Panel, Modal } from '../ui'
import { FULFILL } from './Marketplace'

export default function ListingPage() {
  const { id } = useParams()
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const l = s.listings.find((x) => x.id === id)
  const seller = l && s.users[l.sellerId]
  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime() + (i + 1) * D }), [now])
  const shipping = l?.fulfillment === 'shipping'
  const digital = l?.fulfillment === 'digital'
  const [qty, setQty] = useState(l?.unit === 'each' && l?.category === 'Merch' && l.id === 'l_totes' ? 20 : 1)
  const [day, setDay] = useState(days[0])
  const [hour, setHour] = useState(14)
  const [loc, setLoc] = useState(l?.fulfillment === 'online' ? 'Online (Zoom)' : SPOTS[0])
  const [note, setNote] = useState('')
  const [confirm, setConfirm] = useState(false)
  if (!l) return <div>Listing not found.</div>
  const own = l.sellerId === me.id
  const total = l.price * qty
  const handoffAt = shipping ? now + 7 * D : digital ? now + H : day + hour * H
  const lockAt = handoffAt - LOCK_MS
  const qtyLabel = l.unit === '/hr' ? 'Hours' : l.unit === 'pack' ? 'Packs' : 'Quantity'

  const message = () => { dispatch({ type: 'startConv', listingId: l.id, buyerId: me.id }); nav('/messages') }
  const place = () => {
    dispatch({ type: 'placeOrder', listingId: l.id, buyerId: me.id, qty, handoffAt, note,
      location: shipping ? 'Shipped (Canada Post)' : digital ? 'Digital delivery' : loc })
    setConfirm(false); toast('Order placed. Payment held.'); nav('/orders/latest')
  }

  return (
    <div>
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} /> Back</button>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <ListingArt listing={l} big className="aspect-[16/9] w-full rounded-2xl" />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{l.category}</Badge>
            <Badge>{FULFILL[l.fulfillment].label}</Badge>
            {(l.tags || []).map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight">{l.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted">
            <Stars value={l.rating} count={l.reviews} /><span className="tnum">{l.sales} sold</span>
          </div>
          <p className="mt-5 max-w-[65ch] text-[15px] leading-relaxed">{l.description}</p>

          <Panel className="mt-8 flex flex-wrap items-center gap-4 p-5">
            <Avatar user={seller} size={48} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-semibold">{seller.shop || seller.name}</div>
              <div className="text-sm text-muted">{seller.name} · {seller.program}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-success"><ShieldCheck size={13} /> Verified @uwo.ca student</div>
            </div>
            {!own && <Btn variant="outline" onClick={message}><MessageCircle size={16} /> Message seller</Btn>}
          </Panel>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">Recent reviews</h2>
            {l.reviews ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[['Verified buyer · Health Sci', 'Exactly as described and super easy pick-up. Code swap took 10 seconds.'],
                  ['Verified buyer · Engineering', 'Great communication through the chat. Would buy again.']].map(([w, t]) => (
                  <Panel key={w} className="p-4"><div className="text-xs font-semibold text-muted">★★★★★ · {w}</div><p className="mt-1.5 text-sm">{t}</p></Panel>
                ))}
              </div>
            ) : <p className="mt-2 text-sm text-muted">No reviews yet. Only buyers who complete a code swap can leave a review.</p>}
          </div>
        </div>

        <div>
          <Panel className="sticky top-24 p-5">
            <div className="flex items-baseline justify-between">
              <div className="font-display text-3xl font-bold tnum">{money(l.price)}</div>
              <div className="text-sm text-muted">{l.unit}</div>
            </div>
            {own ? (
              <div className="mt-4 rounded-xl bg-surface2 p-4 text-sm">
                <div className="font-semibold">This is your listing</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center tnum">
                  <div><div className="font-display text-xl font-bold">{l.impressions.toLocaleString()}</div><div className="text-xs text-muted">Impressions</div></div>
                  <div><div className="font-display text-xl font-bold">{l.views.toLocaleString()}</div><div className="text-xs text-muted">Views</div></div>
                  <div><div className="font-display text-xl font-bold">{l.sales}</div><div className="text-xs text-muted">Sales</div></div>
                </div>
                <Btn variant="outline" className="mt-4 w-full" onClick={() => nav('/sell')}>Open seller dashboard</Btn>
              </div>
            ) : me.role === 'expert' ? (
              <p className="mt-4 text-sm text-muted">Experts can browse but not buy in this demo.</p>
            ) : (
              <div className="mt-5 space-y-4">
                <Field label={qtyLabel}>
                  <input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} className={`${inputCls} tnum`} />
                </Field>
                {shipping ? (
                  <div className="rounded-xl bg-surface2 p-3 text-[13px] text-muted">Ships by Canada Post. Your code is printed on the packing slip; enter it when the box arrives.</div>
                ) : digital ? (
                  <div className="rounded-xl bg-surface2 p-3 text-[13px] text-muted">Delivered as a download. Swap codes in chat once you have opened the file.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Field label="Hand-off day">
                        <select id="day" value={day} onChange={(e) => setDay(+e.target.value)} className={inputCls}>
                          {days.map((d) => <option key={d} value={d}>{fmtDay(d)}</option>)}
                        </select>
                      </Field>
                      <Field label="Time">
                        <select id="hour" value={hour} onChange={(e) => setHour(+e.target.value)} className={inputCls}>
                          {Array.from({ length: 13 }, (_, i) => 9 + i).map((h) => <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Meeting spot">
                      <select id="loc" value={loc} onChange={(e) => setLoc(e.target.value)} className={inputCls}>
                        {SPOTS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </Field>
                  </>
                )}
                <Field label="Note to seller (optional)">
                  <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Size, colour, topics to cover…" className={inputCls} />
                </Field>
                <div className="space-y-1.5 border-t border-line pt-4 text-sm tnum">
                  <div className="flex justify-between"><span className="text-muted">{qty} × {money2(l.price)}</span><span>{money2(total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Buyer fees</span><span>$0.00</span></div>
                  <div className="flex justify-between font-display text-lg font-bold"><span>Total</span><span>{money2(total)}</span></div>
                </div>
                <Btn className="w-full" size="lg" onClick={() => setConfirm(true)}>Place order</Btn>
                <div className="flex gap-2 rounded-xl bg-brandsoft/60 p-3 text-[12.5px] leading-relaxed text-ink">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" />
                  <span>Your card is only authorized now. You are charged when you and the seller swap codes. {!shipping && !digital && <>Free cancellation until <b>{fmtWhen(lockAt)}</b>.</>}</span>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Confirm your order">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <CreditCard size={20} className="text-brand" />
            <div className="flex-1"><div className="font-semibold">Visa ending 4242</div><div className="text-xs text-muted">Demo card. No real charge.</div></div>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted">Item</dt><dd className="font-semibold">{l.title}</dd>
            <dt className="text-muted">Hand-off</dt><dd>{shipping ? 'Shipped, about 7 days' : digital ? 'Digital delivery' : `${fmtWhen(handoffAt)} · ${loc}`}</dd>
            <dt className="text-muted">Amount held</dt><dd className="font-semibold tnum">{money2(total)}</dd>
          </dl>
          {!shipping && !digital && (
            <div className="flex gap-2 rounded-xl bg-warnsoft p-3 text-[12.5px] text-ink">
              <Lock size={15} className="mt-0.5 shrink-0 text-warn" />
              <span>From {fmtWhen(lockAt)} the order is locked. Cancelling after that, or not showing up, pays the seller {money2(cancelFee(total))}.</span>
            </div>
          )}
          <div className="flex gap-2 text-[12.5px] text-muted"><Info size={15} className="mt-0.5 shrink-0" /> You will get a 4-character code. Only give it to the seller once you have your item.</div>
          <Btn className="w-full" size="lg" onClick={place}>Authorize {money2(total)}</Btn>
        </div>
      </Modal>
    </div>
  )
}
