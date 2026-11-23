import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, MapPin, MessageCircle, FastForward } from 'lucide-react'
import { useStore, orderStatus, STATUS, money2, fmtWhen, fmtTime, payout, sellerFee, buyerTotal, LOCK_MS, CHECKIN_WINDOW, NOSHOW_GRACE, cancelFee } from '../store'
import { Badge, Btn, ListingArt, Tabs, inputCls, Modal } from '../ui'

const PERSONA_IDS = ['u_alex', 'u_priya', 'u_maya']

function OrderRow({ o }) {
  const { s, me, now } = useStore()
  const nav = useNavigate()
  const l = s.listings.find((x) => x.id === o.listingId)
  const st = orderStatus(o, now)
  const selling = o.sellerId === me.id
  return (
    <button onClick={() => nav('/orders/' + o.id)} className="flex w-full items-center gap-4 rounded-2xl p-2 text-left hover:bg-surface">
      <ListingArt listing={l} className="h-14 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{l.title}</div>
        <div className="text-[13px] text-muted tnum">{fmtWhen(o.outcome ? (o.completedAt || o.handoffAt) : o.handoffAt)}</div>
      </div>
      <Badge tone={STATUS[st].tone} className="hidden sm:inline-flex">{STATUS[st].label}</Badge>
      <div className="w-20 shrink-0 text-right font-semibold tnum">{money2(selling ? payout(o) : buyerTotal(o))}</div>
    </button>
  )
}

export function OrdersPage() {
  const { s, me } = useStore()
  const buying = s.orders.filter((o) => o.buyerId === me.id)
  const selling = s.orders.filter((o) => o.sellerId === me.id)
  const [tab, setTab] = useState(buying.length || !selling.length ? 'buying' : 'selling')
  const list = [...(tab === 'buying' ? buying : selling)].sort((a, b) => (!!a.outcome - !!b.outcome) || (a.outcome ? b.handoffAt - a.handoffAt : a.handoffAt - b.handoffAt))
  const active = list.filter((o) => !o.outcome), past = list.filter((o) => o.outcome)
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-display text-3xl font-bold">Orders</h1>
      {selling.length > 0 && <Tabs value={tab} onChange={setTab} tabs={[{ id: 'buying', label: 'Buying' }, { id: 'selling', label: 'Selling' }]} />}
      {!list.length && <p className="py-16 text-center text-muted">No orders yet.</p>}
      <div className="grid gap-1">{active.map((o) => <OrderRow key={o.id} o={o} />)}</div>
      {!!past.length && <h2 className="mb-2 mt-10 text-[13px] font-medium text-muted">Past</h2>}
      <div className="grid gap-1">{past.map((o) => <OrderRow key={o.id} o={o} />)}</div>
    </div>
  )
}

function CodeInput({ o, side, enabled }) {
  const { dispatch, toast } = useStore()
  const [v, setV] = useState('')
  const [err, setErr] = useState(false)
  const target = side === 'buyer' ? o.sellerCode : o.buyerCode
  const submit = (e) => {
    e.preventDefault()
    if (v.toUpperCase() !== target) { setErr(true); return }
    dispatch({ type: 'order', id: o.id, op: 'enterCode', side }); toast('Code confirmed'); setV(''); setErr(false)
  }
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input id={`code-${o.id}`} value={v} disabled={!enabled} maxLength={4} onChange={(e) => { setErr(false); setV(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')) }}
        placeholder="····" aria-label="Their code" aria-invalid={err}
        className={`${inputCls} h-12 text-center font-mono text-xl font-bold tracking-[0.4em] ${err ? '!border-danger' : ''}`} />
      <Btn type="submit" size="lg" disabled={!enabled || v.length !== 4}>Confirm</Btn>
    </form>
  )
}

export function OrderDetail() {
  let { id } = useParams()
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  if (id === 'latest') id = s.lastOrderId
  const o = s.orders.find((x) => x.id === id)
  if (!o) return <div>Order not found.</div>
  const l = s.listings.find((x) => x.id === o.listingId)
  const side = o.buyerId === me.id ? 'buyer' : o.sellerId === me.id ? 'seller' : null
  if (!side) return <div>You’re not part of this order.</div>
  const otherSide = side === 'buyer' ? 'seller' : 'buyer'
  const other = s.users[side === 'buyer' ? o.sellerId : o.buyerId]
  const first = other.name.split(' ')[0]
  const st = orderStatus(o, now)
  const remote = /Shipped|Digital|Online/.test(o.location)
  const live = !o.outcome
  const windowOpen = remote || now >= o.handoffAt - CHECKIN_WINDOW
  const myCode = side === 'buyer' ? o.buyerCode : o.sellerCode
  const iEntered = o[side + 'Confirmed'], theyEntered = o[otherSide + 'Confirmed']
  const late = now >= o.handoffAt - LOCK_MS
  const fee = sellerFee(o)
  const canNoShow = live && !remote && now >= o.handoffAt + NOSHOW_GRACE && !o[otherSide + 'CheckIn']
  const conv = s.conversations.find((c) => c.listingId === o.listingId && c.buyerId === o.buyerId)

  const line = {
    held: `Free to cancel until ${fmtWhen(o.handoffAt - LOCK_MS)}`,
    locked: 'Locked in. Check-in opens 30 min before.',
    due: remote ? 'Swap codes once it’s delivered.' : 'Check in, then swap codes.',
    completed: side === 'seller' ? `${money2(o.total - fee)} paid out.` : 'All done.',
    cancelled: 'Cancelled. Hold released.',
    late_cancel: `Cancelled late. ${money2(o.lateFee)} paid to seller.`,
    noshow_seller: 'Seller didn’t show. Refunded.',
    noshow_buyer: `Buyer didn’t show. ${money2(o.lateFee)} paid to seller.`,
    review: 'Under review by Studentflow.',
  }[st]

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => nav('/orders')} className="mb-6 text-muted hover:text-ink" aria-label="Back to orders"><ArrowLeft size={20} /></button>

      <div className="flex items-center gap-4">
        <ListingArt listing={l} className="h-16 w-20 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold leading-tight">{l.title}</h1>
          <div className="mt-1 flex items-center gap-2"><Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge><span className="text-[13px] text-muted">{line}</span></div>
        </div>
      </div>

      {live && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-ink p-6 text-bg">
            <div className="text-[13px] opacity-70">Your code</div>
            <div className="mt-1 font-mono text-[44px] font-bold leading-none tracking-[0.25em]">{myCode}</div>
            <div className="mt-4 text-[13px] opacity-70">{theyEntered ? `✓ ${first} entered it` : side === 'buyer' ? 'Share once you have it' : 'Share at hand-off'}</div>
          </div>
          <div className="rounded-3xl bg-surface p-6">
            <div className="mb-3 text-[13px] text-muted">{first}’s code</div>
            {iEntered ? <div className="flex items-center gap-2 font-semibold text-success"><Check size={18} /> Confirmed</div>
              : <><CodeInput o={o} side={side} enabled={windowOpen} />{!windowOpen && <div className="mt-2 text-xs text-muted">Opens at {fmtTime(o.handoffAt - CHECKIN_WINDOW)}</div>}</>}
          </div>
        </div>
      )}

      {live && !remote && (
        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-3xl bg-surface p-5">
          <MapPin size={18} className="text-muted" />
          <div className="min-w-0 flex-1">
            <div className="font-medium">{o.location}</div>
            <div className="mt-0.5 flex gap-4 text-[13px] text-muted">
              {['buyer', 'seller'].map((sd) => (
                <span key={sd} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${o[sd + 'CheckIn'] ? 'bg-success' : 'bg-line'}`} />{sd === side ? 'You' : first}
                </span>
              ))}
            </div>
          </div>
          {canNoShow
            ? <Btn variant="danger" size="sm" onClick={() => dispatch({ type: 'order', id: o.id, op: 'noShow', side })}>Report no-show</Btn>
            : <Btn variant="accent" size="sm" disabled={!windowOpen || !!o[side + 'CheckIn']} onClick={() => { dispatch({ type: 'order', id: o.id, op: 'checkIn', side }); toast('Checked in') }}>
                {o[side + 'CheckIn'] ? 'Checked in' : 'I’m here'}</Btn>}
        </div>
      )}

      <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm tnum">
        <dt className="text-muted">{side === 'buyer' ? 'Seller' : 'Buyer'}</dt>
        <dd className="flex items-center gap-2">{other.name}{conv && <button onClick={() => { dispatch({ type: 'openConv', id: conv.id }); nav('/messages') }} className="text-muted hover:text-brand" aria-label="Open chat"><MessageCircle size={15} /></button>}</dd>
        <dt className="text-muted">When</dt><dd>{fmtWhen(o.handoffAt)}</dd>
        <dt className="text-muted">{side === 'buyer' ? 'You pay' : 'Order'}</dt><dd>{money2(side === 'buyer' ? buyerTotal(o) : o.total)}{o.qty > 1 && <span className="text-muted"> · {o.qty} × {money2(o.price)}</span>}{side === 'buyer' && <span className="text-muted"> · {o.buyerFee ? `incl. ${money2(o.buyerFee)} Buyer Protection` : 'Buyer Protection waived (rebook)'}</span>}</dd>
        {side === 'seller' && <><dt className="text-muted">You get</dt><dd>{money2(o.total - fee)} <span className="text-muted">after {Math.round((o.rate ?? 0.08) * 100)}% fee{o.rebook ? ' (regular customer rate)' : ''}</span></dd></>}
      </dl>

      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-muted">Activity</summary>
        <ol className="mt-3 space-y-2">
          {[{ t: o.createdAt, text: 'Order placed, payment held.' }, ...(o.timeline || []).filter((x) => !x.text.startsWith('Order placed'))].map((e, i) => (
            <li key={i} className="flex gap-4"><span className="w-36 shrink-0 text-muted tnum">{fmtWhen(e.t)}</span><span>{e.text}</span></li>
          ))}
        </ol>
      </details>

      {live && <button onClick={() => setCancelOpen(true)} className="mt-6 text-[13px] text-muted hover:text-danger">Cancel order</button>}

      {live && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-dashed border-line pt-4">
          <span className="w-full text-xs text-muted">Demo</span>
          {!windowOpen && <Btn variant="soft" size="sm" onClick={() => dispatch({ type: 'clock', to: o.handoffAt - 10 * 60e3 })}><FastForward size={14} /> Skip to hand-off</Btn>}
          {windowOpen && !remote && !o[otherSide + 'CheckIn'] && <Btn variant="soft" size="sm" onClick={() => dispatch({ type: 'order', id: o.id, op: 'checkIn', side: otherSide })}>{first} checks in</Btn>}
          {windowOpen && !theyEntered && <Btn variant="soft" size="sm" onClick={() => { dispatch({ type: 'order', id: o.id, op: 'enterCode', side: otherSide }); toast(`${first} entered your code`) }}>{first} enters your code</Btn>}
          {windowOpen && !iEntered && <span className="self-center text-xs text-muted">{first}’s code: <b className="font-mono text-ink" data-testid="their-code">{side === 'buyer' ? o.sellerCode : o.buyerCode}</b></span>}
          {PERSONA_IDS.includes(other.id) && <Btn variant="ghost" size="sm" onClick={() => dispatch({ type: 'persona', userId: other.id })}>View as {first}</Btn>}
        </div>
      )}

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel order?">
        <p className="text-sm text-muted">
          {side === 'seller' ? 'The buyer gets a full refund.' : late ? `${money2(cancelFee(o.total))} goes to the seller. The rest is refunded.` : 'Full refund. No charge.'}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setCancelOpen(false)}>Keep</Btn>
          <Btn variant="danger" onClick={() => { dispatch({ type: 'order', id: o.id, op: 'cancel', side }); setCancelOpen(false); toast('Order cancelled') }}>Cancel order</Btn>
        </div>
      </Modal>
    </div>
  )
}
