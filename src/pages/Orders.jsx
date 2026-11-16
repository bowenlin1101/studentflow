import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Check, Clock, KeyRound, ShieldCheck, Lock, AlertTriangle, FastForward, Users, Truck, MessageCircle } from 'lucide-react'
import { useStore, orderStatus, STATUS, money2, fmtWhen, fmtRel, fmtTime, FEE_RATE, LOCK_MS, CHECKIN_WINDOW, NOSHOW_GRACE, cancelFee } from '../store'
import { Avatar, Badge, Btn, ListingArt, PageHead, Panel, Tabs, inputCls, Modal } from '../ui'

const PERSONA_IDS = ['u_alex', 'u_priya', 'u_jordan']

function OrderRow({ o }) {
  const { s, me, now } = useStore()
  const nav = useNavigate()
  const l = s.listings.find((x) => x.id === o.listingId)
  const st = orderStatus(o, now)
  const other = s.users[o.buyerId === me.id ? o.sellerId : o.buyerId]
  const selling = o.sellerId === me.id
  return (
    <button onClick={() => nav('/orders/' + o.id)} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-3 text-left hover:border-brand/50 hover:shadow-sm sm:p-4">
      <ListingArt listing={l} className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-28" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge>
          <span className="text-xs text-muted tnum">{o.id}</span>
        </div>
        <div className="mt-1 truncate font-semibold">{l.title}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
          <span>{selling ? 'Buyer' : 'Seller'}: {other.name}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} />{o.outcome ? fmtWhen(o.completedAt || o.handoffAt) : `${fmtWhen(o.handoffAt)} (${fmtRel(o.handoffAt, now)})`}</span>
        </div>
      </div>
      <div className="shrink-0 text-right font-display text-lg font-bold tnum">{money2(selling ? o.total * (1 - FEE_RATE) : o.total)}
        <div className="text-[11px] font-medium text-muted">{selling ? 'your payout' : 'total'}</div>
      </div>
    </button>
  )
}

export function OrdersPage() {
  const { s, me } = useStore()
  const buying = s.orders.filter((o) => o.buyerId === me.id)
  const selling = s.orders.filter((o) => o.sellerId === me.id)
  const [tab, setTab] = useState(buying.length || !selling.length ? 'buying' : 'selling')
  const list = (tab === 'buying' ? buying : selling).sort((a, b) => (!!a.outcome - !!b.outcome) || (a.outcome ? b.handoffAt - a.handoffAt : a.handoffAt - b.handoffAt))
  const active = list.filter((o) => !o.outcome), past = list.filter((o) => o.outcome)
  return (
    <div>
      <PageHead eyebrow="Orders" title="Your orders" sub="Every order is confirmed when both sides swap their 4-character codes." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'buying', label: 'Buying', count: buying.length }, { id: 'selling', label: 'Selling', count: selling.length }]} />
      {!list.length && <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No {tab} orders yet.</div>}
      {!!active.length && <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Upcoming</h2>}
      <div className="grid gap-3">{active.map((o) => <OrderRow key={o.id} o={o} />)}</div>
      {!!past.length && <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted">Past</h2>}
      <div className="grid gap-3">{past.map((o) => <OrderRow key={o.id} o={o} />)}</div>
    </div>
  )
}

function Stepper({ o, st, now }) {
  const done = st === 'completed'
  const failed = ['cancelled', 'late_cancel', 'noshow_buyer', 'noshow_seller', 'review'].includes(st)
  const steps = [
    { label: 'Payment held', at: o.createdAt, on: true },
    { label: '12-hour lock', at: o.handoffAt - LOCK_MS, on: now >= o.handoffAt - LOCK_MS || done },
    { label: 'Both checked in', on: (o.buyerCheckIn && o.sellerCheckIn) || done },
    { label: 'Codes swapped', on: done },
    { label: 'Seller paid', on: done },
  ]
  return (
    <ol className="grid grid-cols-5 gap-1">
      {steps.map((x, i) => (
        <li key={x.label} className="min-w-0">
          <div className={`h-1.5 rounded-full ${x.on ? (failed ? 'bg-muted/50' : 'bg-brand') : 'bg-surface2'}`} />
          <div className={`mt-2 text-[11px] font-semibold leading-tight sm:text-xs ${x.on ? 'text-ink' : 'text-muted'}`}>{x.label}</div>
          {x.at && i < 2 && <div className="hidden text-[11px] text-muted sm:block tnum">{fmtWhen(x.at)}</div>}
        </li>
      ))}
    </ol>
  )
}

function CodeInput({ o, side, other, enabled }) {
  const { dispatch, toast } = useStore()
  const [v, setV] = useState('')
  const [err, setErr] = useState('')
  const target = side === 'buyer' ? o.sellerCode : o.buyerCode
  const submit = (e) => {
    e.preventDefault()
    if (v.toUpperCase() !== target) { setErr(`That code doesn’t match. Ask ${other.name.split(' ')[0]} to read it out again.`); return }
    dispatch({ type: 'order', id: o.id, op: 'enterCode', side }); toast('Code confirmed'); setV(''); setErr('')
  }
  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <input id={`code-${o.id}`} value={v} disabled={!enabled} maxLength={4} onChange={(e) => setV(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="____" className={`${inputCls} h-12 text-center font-mono text-xl font-bold tracking-[0.5em]`} aria-label={`${other.name}'s code`} />
        <Btn type="submit" size="lg" disabled={!enabled || v.length !== 4}>Confirm</Btn>
      </div>
      {err && <p className="mt-2 text-[13px] text-danger">{err}</p>}
    </form>
  )
}

export function OrderDetail() {
  let { id } = useParams()
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [tracking, setTracking] = useState('')
  if (id === 'latest') id = s.lastOrderId
  const o = s.orders.find((x) => x.id === id)
  if (!o) return <div>Order not found.</div>
  const l = s.listings.find((x) => x.id === o.listingId)
  const side = o.buyerId === me.id ? 'buyer' : o.sellerId === me.id ? 'seller' : null
  if (!side) return <div>You are not part of this order. <button className="text-brand" onClick={() => nav('/orders')}>Back to orders</button></div>
  const otherSide = side === 'buyer' ? 'seller' : 'buyer'
  const other = s.users[side === 'buyer' ? o.sellerId : o.buyerId]
  const st = orderStatus(o, now)
  const remote = /Shipped|Digital|Online/.test(o.location)
  const shipped = /Shipped/.test(o.location)
  const live = !o.outcome
  const windowOpen = remote || now >= o.handoffAt - CHECKIN_WINDOW
  const myCode = side === 'buyer' ? o.buyerCode : o.sellerCode
  const iEntered = o[side + 'Confirmed'], theyEntered = o[otherSide + 'Confirmed']
  const late = now >= o.handoffAt - LOCK_MS
  const fee = o.total * FEE_RATE
  const canNoShow = live && !remote && now >= o.handoffAt + NOSHOW_GRACE && !o[otherSide + 'CheckIn']
  const otherIsPersona = PERSONA_IDS.includes(other.id)
  const conv = s.conversations.find((c) => c.listingId === o.listingId && c.buyerId === o.buyerId)

  const headline = {
    held: side === 'buyer' ? `Your payment is held. You can cancel for free until ${fmtWhen(o.handoffAt - LOCK_MS)}.` : `The buyer’s payment is held. It locks in ${fmtRel(o.handoffAt - LOCK_MS, now).replace('in ', '')}.`,
    locked: side === 'buyer' ? `Locked in. Cancelling now pays the seller ${money2(cancelFee(o.total))}. Check-in opens 30 minutes before the hand-off.` : 'Locked in. The buyer can no longer cancel for free. Check-in opens 30 minutes before the hand-off.',
    due: remote ? 'Swap codes once the item or service has been delivered.' : 'Tap “I’m here” when you arrive, then swap codes with the other person.',
    completed: side === 'buyer' ? 'Done! Thanks for buying from a fellow student.' : `Done! ${money2(o.total - fee)} is on its way to your bank account.`,
    cancelled: o.cancelledBy === 'seller' ? 'The seller cancelled. The full hold was released.' : 'The buyer cancelled before the lock. The full hold was released.',
    late_cancel: `The buyer cancelled inside the 12-hour lock. ${money2(o.lateFee)} went to the seller.`,
    noshow_seller: 'The seller did not check in. The buyer was refunded in full.',
    noshow_buyer: `The buyer did not check in. ${money2(o.lateFee)} went to the seller for their time.`,
    review: 'A no-show was reported but nobody checked in. The Studentflow team will review this within 24 hours.',
  }[st]

  return (
    <div>
      <button onClick={() => nav('/orders')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} /> All orders</button>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <ListingArt listing={l} className="h-16 w-20 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge><span className="text-sm text-muted tnum">{o.id} · you are the {side}</span></div>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight">{l.title}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Panel className="p-5">
            <Stepper o={o} st={st} now={now} />
            <p className={`mt-5 rounded-xl p-3 text-sm ${st === 'completed' ? 'bg-successsoft' : st === 'locked' ? 'bg-warnsoft' : st === 'due' ? 'bg-accentsoft' : 'bg-surface2'}`}>{headline}</p>
          </Panel>

          {live && (
            <Panel className="p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><KeyRound size={18} className="text-accent" /> Code swap</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-ink p-5 text-bg">
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Your code</div>
                  <div className="mt-2 font-mono text-[44px] font-bold leading-none tracking-[0.3em]">{myCode}</div>
                  <p className="mt-3 text-[12.5px] leading-relaxed opacity-80">
                    {side === 'buyer' ? 'Read this to the seller only after you have your item or the service is done. It confirms you received it.' : 'Read this to the buyer when you hand over the item. It confirms you delivered it.'}
                  </p>
                  <div className="mt-3 text-xs font-semibold">{theyEntered ? <span className="text-success">✓ {other.name.split(' ')[0]} entered your code</span> : <span className="opacity-70">Waiting for {other.name.split(' ')[0]} to enter it</span>}</div>
                </div>
                <div className="rounded-2xl border border-line p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">{other.name.split(' ')[0]}’s code</div>
                  {iEntered ? (
                    <div className="mt-3 flex items-center gap-2 font-semibold text-success"><Check size={20} /> Confirmed</div>
                  ) : (
                    <div className="mt-3">
                      <CodeInput o={o} side={side} other={other} enabled={windowOpen} />
                      {!windowOpen && <p className="mt-2 text-[12.5px] text-muted">Opens 30 minutes before the hand-off ({fmtTime(o.handoffAt - CHECKIN_WINDOW)}).</p>}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          )}

          {live && !remote && (
            <Panel className="p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><MapPin size={18} className="text-brand" /> Check in at {o.location}</h2>
              <p className="mt-1 text-sm text-muted">{fmtWhen(o.handoffAt)}. Checking in records your time and location, which protects you if the other person doesn’t show.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {['buyer', 'seller'].map((sd) => {
                  const u = s.users[sd === 'buyer' ? o.buyerId : o.sellerId]
                  return (
                    <div key={sd} className="flex items-center gap-3 rounded-xl bg-surface2 p-3">
                      <Avatar user={u} size={32} />
                      <div className="min-w-0 flex-1 text-sm"><div className="font-semibold">{u.name}{sd === side && ' (you)'}</div>
                        <div className="text-xs text-muted">{o[sd + 'CheckIn'] ? `Checked in at ${fmtTime(o[sd + 'CheckIn'])}` : 'Not checked in'}</div></div>
                      {o[sd + 'CheckIn'] && <Check size={18} className="text-success" />}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn variant="accent" disabled={!windowOpen || !!o[side + 'CheckIn']} onClick={() => { dispatch({ type: 'order', id: o.id, op: 'checkIn', side }); toast('Checked in') }}>
                  <MapPin size={16} /> {o[side + 'CheckIn'] ? 'You’re checked in' : 'I’m here'}
                </Btn>
                {canNoShow && <Btn variant="danger" onClick={() => dispatch({ type: 'order', id: o.id, op: 'noShow', side })}><AlertTriangle size={16} /> Report no-show</Btn>}
              </div>
              {!canNoShow && live && <p className="mt-3 text-xs text-muted">If the other person hasn’t checked in 15 minutes after the hand-off time, you can report a no-show.</p>}
            </Panel>
          )}

          {live && shipped && side === 'seller' && (
            <Panel className="p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Truck size={18} className="text-brand" /> Shipping</h2>
              {o.tracking ? <p className="mt-2 text-sm">Tracking: <b className="tnum">{o.tracking}</b></p> : (
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); tracking && dispatch({ type: 'order', id: o.id, op: 'tracking', value: tracking }) }}>
                  <input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Canada Post tracking number" className={inputCls} />
                  <Btn type="submit">Add</Btn>
                </form>
              )}
              <p className="mt-2 text-xs text-muted">Print your code on the packing slip. If the buyer doesn’t dispute within 72 hours of delivery, the payment releases automatically.</p>
            </Panel>
          )}

          <Panel className="p-5">
            <h2 className="font-display text-lg font-semibold">Activity</h2>
            <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
              {[{ t: o.createdAt, text: 'Order placed. Card authorized, payment held.' }, ...(o.timeline || []).filter((x) => !x.text.startsWith('Order placed'))]
                .concat(o.outcome === 'completed' && !(o.timeline || []).length ? [{ t: o.completedAt, text: 'Both codes matched. Payment captured and seller paid.' }] : [])
                .map((e, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" />
                    <div>{e.text}</div><div className="text-xs text-muted tnum">{fmtWhen(e.t)}</div>
                  </li>
                ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel className="p-5">
            <div className="flex items-center gap-3">
              <Avatar user={other} size={40} />
              <div className="min-w-0 flex-1"><div className="text-xs text-muted">{side === 'buyer' ? 'Seller' : 'Buyer'}</div><div className="font-semibold">{other.name}</div></div>
              {conv && <Btn size="sm" variant="outline" onClick={() => { dispatch({ type: 'openConv', id: conv.id }); nav('/messages') }}><MessageCircle size={14} /> Chat</Btn>}
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-sm">
              <dt className="text-muted">When</dt><dd className="tnum">{fmtWhen(o.handoffAt)}</dd>
              <dt className="text-muted">Where</dt><dd>{o.location}</dd>
              <dt className="text-muted">Quantity</dt><dd className="tnum">{o.qty}</dd>
              {o.note && <><dt className="text-muted">Note</dt><dd>{o.note}</dd></>}
            </dl>
          </Panel>

          <Panel className="p-5 text-sm tnum">
            <h3 className="mb-3 font-semibold">Payment</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-muted">Order total</span><span>{money2(o.total)}</span></div>
              {side === 'seller' && <>
                <div className="flex justify-between"><span className="text-muted">Studentflow fee (7.5%)</span><span>−{money2(fee)}</span></div>
                <div className="flex justify-between border-t border-line pt-1.5 font-semibold"><span>{st === 'completed' ? 'Paid out' : 'Your payout'}</span><span>{money2(o.total - fee)}</span></div>
              </>}
              {(st === 'late_cancel' || st === 'noshow_buyer') && <div className="flex justify-between font-semibold"><span>Paid to seller</span><span>{money2(o.lateFee)}</span></div>}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-surface2 p-3 text-xs text-muted">
              {live ? <><Lock size={14} className="mt-0.5 shrink-0" /> Held on the buyer’s card. Captured only when both codes are entered.</> : <><ShieldCheck size={14} className="mt-0.5 shrink-0" /> Settled.</>}
            </div>
            {live && <button onClick={() => setCancelOpen(true)} className="mt-3 text-[13px] font-semibold text-danger hover:underline">Cancel order</button>}
          </Panel>

          {live && (
            <Panel className="border-dashed p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Demo controls</div>
              <div className="grid gap-2">
                {!windowOpen && <Btn variant="soft" size="sm" onClick={() => dispatch({ type: 'clock', to: o.handoffAt - 10 * 60e3 })}><FastForward size={14} /> Jump to 10 min before hand-off</Btn>}
                {windowOpen && !remote && !o[otherSide + 'CheckIn'] && <Btn variant="soft" size="sm" onClick={() => dispatch({ type: 'order', id: o.id, op: 'checkIn', side: otherSide })}>Simulate: {other.name.split(' ')[0]} checks in</Btn>}
                {windowOpen && !theyEntered && <Btn variant="soft" size="sm" onClick={() => { dispatch({ type: 'order', id: o.id, op: 'enterCode', side: otherSide }); toast(`${other.name.split(' ')[0]} entered your code`) }}>Simulate: {other.name.split(' ')[0]} enters your code</Btn>}
                {!iEntered && windowOpen && <p className="text-xs text-muted">{other.name.split(' ')[0]}’s code (normally read out in person): <b className="font-mono text-ink">{side === 'buyer' ? o.sellerCode : o.buyerCode}</b></p>}
                {!remote && now < o.handoffAt + NOSHOW_GRACE && <Btn variant="ghost" size="sm" onClick={() => dispatch({ type: 'clock', to: o.handoffAt + NOSHOW_GRACE + 60e3 })}><FastForward size={14} /> Skip past hand-off (test no-show)</Btn>}
                {otherIsPersona && <Btn variant="outline" size="sm" onClick={() => dispatch({ type: 'persona', userId: other.id })}><Users size={14} /> View as {other.name.split(' ')[0]}</Btn>}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this order?">
        <p className="text-sm">
          {side === 'seller' ? 'The buyer’s hold will be released in full. Frequent seller cancellations lower your listing ranking.'
            : late ? `You are inside the 12-hour lock. ${money2(cancelFee(o.total))} (25% of the order, up to $15) goes to the seller and the rest of the hold is released.`
            : 'You are before the 12-hour lock, so the full hold is released. No charge.'}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setCancelOpen(false)}>Keep order</Btn>
          <Btn variant="danger" onClick={() => { dispatch({ type: 'order', id: o.id, op: 'cancel', side }); setCancelOpen(false); toast('Order cancelled') }}>Cancel order</Btn>
        </div>
      </Modal>
    </div>
  )
}
