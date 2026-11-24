import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { seed } from './data'
import { sellerRate, buyerFee as buyerFeeFor } from './launch/lib/pricing'
import { SUBSCRIPTION, FEES } from './launch/lib/config'
import { addToAverage } from './launch/lib/reviews'

export const H = 3600e3
export const D = 24 * H
export const LOCK_MS = 12 * H
export const CHECKIN_WINDOW = 30 * 60e3
export const NOSHOW_GRACE = 15 * 60e3
export const cancelFee = (total) => Math.min(15, Math.round(total * 0.25 * 100) / 100)

const KEY = 'studentflow-demo-v3'
const uid = (p) => p + Math.random().toString(36).slice(2, 8)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const genCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

function load() {
  try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); if (p && p.v === 3) return p } } catch {}
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
        users: { ...s.users, [id]: { id, name, email: a.email, year: '1st', major: 'Western', program: 'Western University', role: 'student', hue: Math.floor(Math.random() * 360) } } }
    }
    case 'signOut': return { ...s, signedIn: false }
    case 'persona': return { ...s, currentUserId: a.userId, signedIn: true }
    case 'clock': return { ...s, now: a.to ?? s.now + a.by }
    case 'clockReset': return { ...s, now: s.baseNow }
    case 'toast': return { ...s, toasts: [...s.toasts, { id: uid('t'), text: a.text }] }
    case 'untoast': return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) }

    case 'placeOrder': {
      const l = s.listings.find((x) => x.id === a.listingId)
      const done = s.orders.filter((o) => o.sellerId === l.sellerId && o.outcome === 'completed')
      const rebook = done.some((o) => o.buyerId === a.buyerId)
      const price = a.price ?? l.price
      const o = log({
        id: 'SF-' + (2100 + s.orders.length), listingId: l.id, buyerId: a.buyerId, sellerId: l.sellerId,
        price, qty: a.qty, total: price * a.qty, handoffAt: a.handoffAt, location: a.location, note: a.note || '',
        rate: sellerRate(done.length + 1, rebook), buyerFee: buyerFeeFor(rebook), rebook, bundle: a.bundle || null,
        createdAt: now, buyerCode: genCode(), sellerCode: genCode(), buyerConfirmed: false, sellerConfirmed: false,
        buyerCheckIn: null, sellerCheckIn: null, outcome: null, tracking: null,
      }, now, rebook ? 'Rebooked. Buyer Protection waived, card authorized, payment held.' : 'Order placed. Card authorized, payment held.')
      let convs = s.conversations
      let c = convs.find((x) => x.listingId === l.id && x.buyerId === a.buyerId)
      const sys = { from: 'system', text: `Order ${o.id} placed. Payment is held until both codes are swapped.`, t: now }
      if (c) convs = convs.map((x) => (x === c ? { ...x, messages: [...x.messages, sys] } : x))
      else convs = [...convs, { id: uid('c'), listingId: l.id, buyerId: a.buyerId, sellerId: l.sellerId, messages: [sys] }]
      return { ...s, orders: [o, ...s.orders], conversations: convs, lastOrderId: o.id }
    }
    case 'publishListing': {
      const exists = s.listings.some((l) => l.id === a.listing.id)
      const listings = exists ? s.listings.map((l) => (l.id === a.listing.id ? { ...l, ...a.listing } : l)) : [a.listing, ...s.listings]
      const u = s.users[a.listing.sellerId]
      return { ...s, listings, users: { ...s.users, [u.id]: { ...u, shop: a.shop || u.shop, sellerSince: u.sellerSince || now } }, lastPublished: a.listing.id }
    }
    case 'unpublishListing': return { ...s, listings: s.listings.filter((l) => l.id !== a.id) }
    case 'pauseListing': return { ...s, listings: s.listings.map((l) => (l.id === a.id ? { ...l, paused: a.paused } : l)) }
    case 'simulateSale': {
      // demo: a completed sale for a seller's listing
      const l = s.listings.find((x) => x.id === a.listingId)
      const done = s.orders.filter((o) => o.sellerId === l.sellerId && o.outcome === 'completed').length
      const buyers = ['u_alex', 'u_jordan', 'u_emily', 'u_omar', 'u_sam']
      const o = { id: 'SF-' + (2100 + s.orders.length), listingId: l.id, buyerId: buyers[done % buyers.length], sellerId: l.sellerId, price: l.price, qty: 1, total: l.price,
        handoffAt: now, location: l.meetLocation || 'UCC Atrium', createdAt: now, rate: sellerRate(done + 1), buyerFee: 1, rebook: false,
        buyerCode: genCode(), sellerCode: genCode(), buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now, timeline: [{ t: now, text: 'Demo sale: both codes matched.' }] }
      return { ...s, orders: [o, ...s.orders], listings: s.listings.map((x) => (x.id === l.id ? { ...x, sales: x.sales + 1 } : x)) }
    }
    case 'simulateWeek': {
      // demo: a first week after messaging 10 people: views, two buyer chats and one sale
      const l = s.listings.find((x) => x.id === a.listingId)
      if (!l) return s
      const s2 = reducer(s, { type: 'simulateSale', listingId: l.id })
      const chats = [
        { buyer: 'u_alex', lines: ['Hi! Do you do a box of 12 for Friday?', 'Yes! I can have it ready Friday afternoon at the UCC.'] },
        { buyer: 'u_emily', lines: ['Are these nut-free?', 'They don’t contain nuts, but my kitchen handles them. I’m testing a nut-free batch soon!'] },
      ].map((c, i) => ({ id: uid('c'), listingId: l.id, buyerId: c.buyer, sellerId: l.sellerId, messages: [
        { from: c.buyer, text: c.lines[0], t: now - (2 - i) * H }, { from: l.sellerId, text: c.lines[1], t: now - (2 - i) * H + 600e3 },
      ] }))
      return { ...s2, conversations: [...chats, ...s2.conversations],
        listings: s2.listings.map((x) => (x.id === l.id ? { ...x, views: x.views + 46, impressions: x.impressions + 380 } : x)) }
    }
    case 'review': {
      // side 'buyer' = the buyer rating the seller; side 'seller' = the seller rating the buyer
      const o = s.orders.find((x) => x.id === a.orderId)
      if (!o || o.outcome !== 'completed' || o[a.side + 'Review']) return s
      const review = { stars: a.stars, text: (a.text || '').trim(), tags: a.tags || [], at: now }
      const orders = s.orders.map((x) => (x.id === o.id ? { ...x, [a.side + 'Review']: review } : x))
      if (a.side === 'buyer') {
        const listings = s.listings.map((l) => {
          if (l.id !== o.listingId) return l
          const agg = addToAverage(l.rating, l.reviews, a.stars)
          const entry = { ...review, by: o.buyerId, orderId: o.id }
          return { ...l, rating: agg.avg, reviews: agg.count, reviewList: [entry, ...(l.reviewList || [])] }
        })
        return { ...s, orders, listings }
      }
      const b = s.users[o.buyerId]
      const prev = b.buyerRating || { avg: 0, count: 0 }
      const agg = addToAverage(prev.avg, prev.count, a.stars)
      return { ...s, orders, users: { ...s.users, [b.id]: { ...b, buyerRating: { avg: agg.avg, count: agg.count } } } }
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
          `Both codes matched. Payment captured and ${money(payout(o))} released to the seller.`)
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
export const canSell = (u) => u && u.role === 'student'
export const sellerFee = (o) => Math.round(o.total * (o.rate ?? 0.08) * 100) / 100
export const payout = (o) => Math.round((o.total - sellerFee(o)) * 100) / 100
export const buyerTotal = (o) => o.total + (o.buyerFee ?? 0)

/** Trial: free until the 3rd completed sale or 30 days after first listing, whichever is later; then $15/month. */
export function sellerStatus(s, userId) {
  const u = s.users[userId]
  const sales = s.orders.filter((o) => o.sellerId === userId && o.outcome === 'completed').sort((a, b) => a.completedAt - b.completedAt)
  const since = u?.sellerSince ?? s.now
  const third = sales[FEES.trialEndsAfterSales - 1]?.completedAt ?? null
  const trialEndsAt = third == null ? null : Math.max(third, since + SUBSCRIPTION.trialDays * D)
  const subscribed = trialEndsAt != null && s.now >= trialEndsAt
  return { sales: sales.length, needed: FEES.trialEndsAfterSales, trialEndsAt, subscribed, monthly: SUBSCRIPTION.monthly, nextRate: sellerRate(sales.length + 1) }
}
