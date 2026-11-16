import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { seed } from './data'

export const H = 3600e3
export const D = 24 * H
export const FEE_RATE = 0.075
export const LOCK_MS = 12 * H
export const CHECKIN_WINDOW = 30 * 60e3
export const NOSHOW_GRACE = 15 * 60e3
export const cancelFee = (total) => Math.min(15, Math.round(total * 0.25 * 100) / 100)

const KEY = 'studentflow-demo-v1'
const uid = (p) => p + Math.random().toString(36).slice(2, 8)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const genCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

function load() {
  try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); if (p && p.v === 1) return p } } catch {}
  return seed()
}

export function orderStatus(o, now) {
  if (o.outcome) return o.outcome
  if (now < o.handoffAt - LOCK_MS) return 'held'
  if (now < o.handoffAt - CHECKIN_WINDOW) return 'locked'
  return 'due'
}

export const STATUS = {
  held: { label: 'Payment held', tone: 'brand' },
  locked: { label: 'Locked in', tone: 'warn' },
  due: { label: 'Hand-off now', tone: 'accent' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
  late_cancel: { label: 'Cancelled late', tone: 'muted' },
  noshow_seller: { label: 'Seller no-show', tone: 'danger' },
  noshow_buyer: { label: 'Buyer no-show', tone: 'danger' },
  review: { label: 'Under review', tone: 'warn' },
}

function log(o, now, text) { return { ...o, timeline: [...(o.timeline || []), { t: now, text }] } }

function reducer(s, a) {
  const now = s.now
  switch (a.type) {
    case 'reset': return { ...seed(), signedIn: true, currentUserId: s.currentUserId }
    case 'signIn': return { ...s, signedIn: true, currentUserId: a.userId }
    case 'signUp': {
      const handle = a.email.split('@')[0]
      const name = handle.split(/[._-]/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join(' ') || 'New Student'
      const id = uid('u_')
      return { ...s, signedIn: true, currentUserId: id,
        users: { ...s.users, [id]: { id, name, email: a.email, program: 'Western University', plan: 'free', role: 'student', hue: Math.floor(Math.random() * 360) } } }
    }
    case 'signOut': return { ...s, signedIn: false }
    case 'persona': return { ...s, currentUserId: a.userId, signedIn: true }
    case 'clock': return { ...s, now: a.to ?? s.now + a.by }
    case 'clockReset': return { ...s, now: s.baseNow }
    case 'toast': return { ...s, toasts: [...s.toasts, { id: uid('t'), text: a.text }] }
    case 'untoast': return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) }
    case 'plan': return { ...s, users: { ...s.users, [a.userId]: { ...s.users[a.userId], plan: a.plan,
      credits: a.plan === 'coach' ? (s.users[a.userId].credits || { monthly: 3, usedThisMonth: 0, rolledOver: 0, cap: 5 }) : s.users[a.userId].credits } } }

    case 'placeOrder': {
      const l = s.listings.find((x) => x.id === a.listingId)
      const o = log({
        id: 'SF-' + (2100 + s.orders.length), listingId: l.id, buyerId: a.buyerId, sellerId: l.sellerId,
        price: l.price, qty: a.qty, total: l.price * a.qty, handoffAt: a.handoffAt, location: a.location, note: a.note,
        createdAt: now, buyerCode: genCode(), sellerCode: genCode(), buyerConfirmed: false, sellerConfirmed: false,
        buyerCheckIn: null, sellerCheckIn: null, outcome: null, tracking: null,
      }, now, 'Order placed. Card authorized, payment held.')
      let convs = s.conversations
      let c = convs.find((x) => x.listingId === l.id && x.buyerId === a.buyerId)
      const sys = { from: 'system', text: `Order ${o.id} placed. Payment is held until both codes are swapped.`, t: now }
      if (c) convs = convs.map((x) => (x === c ? { ...x, messages: [...x.messages, sys] } : x))
      else convs = [...convs, { id: uid('c'), listingId: l.id, buyerId: a.buyerId, sellerId: l.sellerId, messages: [sys] }]
      return { ...s, orders: [o, ...s.orders], conversations: convs, lastOrderId: o.id }
    }
    case 'order': {
      return { ...s, orders: s.orders.map((o) => (o.id === a.id ? orderReducer(o, a, now) : o)) }
    }
    case 'message': {
      return { ...s, conversations: s.conversations.map((c) => (c.id === a.convId
        ? { ...c, messages: [...c.messages, { from: a.from, text: a.text, t: now }] } : c)) }
    }
    case 'startConv': {
      const exists = s.conversations.find((c) => c.listingId === a.listingId && c.buyerId === a.buyerId)
      if (exists) return { ...s, openConvId: exists.id }
      const l = s.listings.find((x) => x.id === a.listingId)
      const c = { id: uid('c'), listingId: l.id, buyerId: a.buyerId, sellerId: l.sellerId, messages: [] }
      return { ...s, conversations: [c, ...s.conversations], openConvId: c.id }
    }
    case 'openConv': return { ...s, openConvId: a.id }
    case 'createListing': {
      const l = { ...a.listing, id: uid('l_'), createdAt: now, rating: 0, reviews: 0, impressions: 0, views: 0, sales: 0, active: true }
      return { ...s, listings: [l, ...s.listings] }
    }
    case 'toggleListing': return { ...s, listings: s.listings.map((l) => (l.id === a.id ? { ...l, active: !l.active } : l)) }
    case 'book': {
      const u = s.users[a.studentId]; const c = { ...u.credits }
      if (c.rolledOver > 0) c.rolledOver -= 1; else c.usedThisMonth += 1
      return { ...s, users: { ...s.users, [u.id]: { ...u, credits: c } },
        sessions: [...s.sessions, { id: uid('s'), expertId: a.expertId, studentId: a.studentId, at: a.at, topic: a.topic, zoom: 'https://zoom.us/j/8' + Math.floor(1e7 + Math.random() * 9e7) }] }
    }
    case 'cancelSession': {
      const ss = s.sessions.find((x) => x.id === a.id); const u = s.users[ss.studentId]
      const c = { ...u.credits }; if (c.usedThisMonth > 0) c.usedThisMonth -= 1; else c.rolledOver = Math.min(c.cap, c.rolledOver + 1)
      return { ...s, users: { ...s.users, [u.id]: { ...u, credits: c } }, sessions: s.sessions.filter((x) => x.id !== a.id) }
    }
    case 'newMonth': {
      // demo: roll unused sessions into the bank (capped at 5)
      const u = s.users[a.userId]; const c = u.credits
      const unused = Math.max(0, c.monthly - c.usedThisMonth)
      return { ...s, users: { ...s.users, [u.id]: { ...u, credits: { ...c, usedThisMonth: 0, rolledOver: Math.min(c.cap, c.rolledOver + unused) } } } }
    }
    case 'availability': return { ...s, availability: { ...s.availability, [a.expertId]: a.template } }
    case 'register': {
      const list = s.registered[a.id] || []
      const on = list.includes(a.userId)
      return { ...s, registered: { ...s.registered, [a.id]: on ? list.filter((x) => x !== a.userId) : [...list, a.userId] } }
    }
    default: return s
  }
}

function orderReducer(o, a, now) {
  const side = a.side // 'buyer' | 'seller'
  switch (a.op) {
    case 'checkIn':
      return log({ ...o, [side + 'CheckIn']: now }, now, `${cap(side)} checked in at ${o.location}.`)
    case 'enterCode': {
      const next = { ...o, [side + 'Confirmed']: true }
      let out = log(next, now, `${cap(side)} entered the ${side === 'buyer' ? 'seller' : 'buyer'}’s code.`)
      if (next.buyerConfirmed && next.sellerConfirmed) {
        out = log({ ...out, outcome: 'completed', completedAt: now }, now,
          `Both codes matched. Payment captured and ${money(o.total * (1 - FEE_RATE))} released to the seller.`)
      }
      return out
    }
    case 'cancel': {
      const late = now >= o.handoffAt - LOCK_MS
      if (side === 'seller') return log({ ...o, outcome: 'cancelled', cancelledBy: 'seller' }, now, 'Seller cancelled. Buyer’s hold released in full.')
      if (!late) return log({ ...o, outcome: 'cancelled', cancelledBy: 'buyer' }, now, 'Buyer cancelled before the 12-hour lock. Hold released in full.')
      const fee = cancelFee(o.total)
      return log({ ...o, outcome: 'late_cancel', cancelledBy: 'buyer', lateFee: fee }, now,
        `Buyer cancelled inside the 12-hour lock. ${money(fee)} paid to the seller, the rest refunded.`)
    }
    case 'noShow': {
      const other = side === 'buyer' ? 'seller' : 'buyer'
      if (!o[side + 'CheckIn']) return log({ ...o, outcome: 'review' }, now, `${cap(side)} reported a no-show without checking in. Sent to Studentflow for review.`)
      if (side === 'buyer') return log({ ...o, outcome: 'noshow_seller' }, now, 'Seller did not check in. Buyer refunded in full.')
      const fee = cancelFee(o.total)
      return log({ ...o, outcome: 'noshow_buyer', lateFee: fee }, now, `Buyer did not check in. ${money(fee)} paid to the seller, the rest refunded.`)
    }
    case 'tracking': return log({ ...o, tracking: a.value }, now, `Seller added tracking number ${a.value}.`)
    default: return o
  }
}
const cap = (x) => x[0].toUpperCase() + x.slice(1)

const Ctx = createContext(null)
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ ...state, toasts: [] })) } catch {} }, [state])
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}
export function useStore() {
  const { state, dispatch } = useContext(Ctx)
  const me = state.users[state.currentUserId]
  const toast = (text) => dispatch({ type: 'toast', text })
  return { s: state, dispatch, me, now: state.now, toast }
}

export const money = (n = 0) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-CA', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
export const money2 = (n = 0) => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtDay = (t) => new Date(t).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
export const fmtTime = (t) => new Date(t).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
export const fmtWhen = (t) => `${fmtDay(t)}, ${fmtTime(t)}`
export function fmtRel(t, now) {
  const d = t - now, a = Math.abs(d)
  const u = a < H ? [Math.round(a / 60e3), 'min'] : a < 2 * D ? [Math.round(a / H), 'h'] : [Math.round(a / D), 'd']
  const txt = `${u[0]}${u[1] === 'min' ? ' min' : u[1]}`
  return d >= 0 ? `in ${txt}` : `${txt} ago`
}
export const canSell = (u) => u && (u.plan === 'founder' || u.plan === 'coach')
