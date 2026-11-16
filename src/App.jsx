import React, { useEffect, useRef, useState } from 'react'
import { MemoryRouter, Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Clock, ChevronDown, RotateCcw, LogOut, Check, Store, GraduationCap, ShoppingBag, MessageCircle, Package, CalendarClock } from 'lucide-react'
import { StoreProvider, useStore, fmtWhen, H } from './store'
import { Logo, Avatar, Badge } from './ui'
import { PLANS } from './data'
import Landing from './pages/Landing'
import Marketplace from './pages/Marketplace'
import ListingPage from './pages/Listing'
import { OrdersPage, OrderDetail } from './pages/Orders'
import Messages from './pages/Messages'
import { SellDashboard, NewListing } from './pages/Sell'
import Learn from './pages/Learn'
import Expert from './pages/Expert'
import Pricing from './pages/Pricing'

const PERSONAS = [
  { id: 'u_alex', tag: 'Buyer' },
  { id: 'u_priya', tag: 'Seller' },
  { id: 'u_jordan', tag: 'Seller + coaching' },
  { id: 'u_okafor', tag: 'Expert' },
]

function PersonaMenu() {
  const { s, me, dispatch, now } = useStore()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const f = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f)
  }, [])
  const offset = Math.round((now - s.baseNow) / H)
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-surface" aria-expanded={open}>
        <Avatar user={me} size={30} />
        <ChevronDown size={16} className="text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-line bg-surface p-2 shadow-xl">
          <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Demo: switch persona</div>
          {PERSONAS.map((p) => {
            const u = s.users[p.id]
            return (
              <button key={p.id} onClick={() => { dispatch({ type: 'persona', userId: p.id }); setOpen(false); nav(u.role === 'expert' ? '/expert' : '/market') }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface2">
                <Avatar user={u} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{u.name}</span>
                  <span className="block text-xs text-muted">{p.tag}{u.plan ? ` · ${PLANS[u.plan].name}` : ''}</span>
                </span>
                {s.currentUserId === p.id && <Check size={16} className="text-brand" />}
              </button>
            )
          })}
          <div className="my-2 border-t border-line" />
          <div className="px-3 pb-2">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted"><Clock size={13} /> Demo clock</div>
            <div className="text-sm font-semibold tnum">{fmtWhen(now)} {offset !== 0 && <span className="font-normal text-muted">(+{offset}h)</span>}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 3, 12, 24].map((h) => (
                <button key={h} onClick={() => dispatch({ type: 'clock', by: h * H })} className="rounded-lg bg-surface2 px-2.5 py-1 text-xs font-semibold hover:bg-brandsoft hover:text-brand">+{h}h</button>
              ))}
              <button onClick={() => dispatch({ type: 'clockReset' })} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-muted hover:bg-surface2">Now</button>
            </div>
          </div>
          <div className="my-2 border-t border-line" />
          <button onClick={() => { dispatch({ type: 'reset' }); setOpen(false); dispatch({ type: 'toast', text: 'Demo data reset' }) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface2"><RotateCcw size={15} /> Reset demo data</button>
          <button onClick={() => { dispatch({ type: 'signOut' }); nav('/') }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface2"><LogOut size={15} /> Sign out</button>
        </div>
      )}
    </div>
  )
}

function Shell({ children }) {
  const { s, me, now } = useStore()
  const expert = me.role === 'expert'
  const myOrders = s.orders.filter((o) => (o.buyerId === me.id || o.sellerId === me.id) && !o.outcome).length
  const links = expert
    ? [{ to: '/expert', label: 'Expert portal', icon: CalendarClock }, { to: '/learn', label: 'Webinars', icon: GraduationCap }]
    : [
        { to: '/market', label: 'Marketplace', icon: ShoppingBag },
        { to: '/learn', label: 'Learn', icon: GraduationCap },
        { to: '/sell', label: 'Sell', icon: Store },
        { to: '/orders', label: 'Orders', icon: Package, count: myOrders },
        { to: '/messages', label: 'Messages', icon: MessageCircle },
      ]
  const shifted = now !== s.baseNow
  return (
    <div className="min-h-screen">
      <div style={{ content: '""', position: 'fixed', inset: '0 0 auto', height: 'env(safe-area-inset-top, 0px)', zIndex: 30 }} className="bg-bg" />
      <header className="sticky z-30 bg-bg/85 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="gutter mx-auto flex h-16 max-w-[1200px] items-center gap-4">
          <NavLink to={expert ? '/expert' : '/market'} aria-label="Studentflow home"><Logo size={28} /></NavLink>
          <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `relative px-3 py-2 text-sm font-medium ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`}>
                {l.label}{l.count ? <span className="absolute right-1 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" /> : null}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {shifted && <Badge tone="warn" className="hidden sm:inline-flex"><Clock size={12} /> {fmtWhen(now)}</Badge>}
            <PersonaMenu />
          </div>
        </div>
        <nav className="gutter noscrollbar flex gap-1 overflow-x-auto pb-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium ${isActive ? 'text-ink' : 'text-muted'}`}>
              {l.label}{l.count ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="gutter mx-auto max-w-[1200px] pb-24 pt-6">{children}</main>
    </div>
  )
}

function ToastItem({ t }) {
  const { dispatch } = useStore()
  useEffect(() => { const x = setTimeout(() => dispatch({ type: 'untoast', id: t.id }), 3000); return () => clearTimeout(x) }, [t.id, dispatch])
  return <div className="pointer-events-auto rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg shadow-lg">{t.text}</div>
}

function Toasts() {
  const { s } = useStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4" style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }} aria-live="polite">
      {s.toasts.slice(-2).map((t) => <ToastItem key={t.id} t={t} />)}
    </div>
  )
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppRoutes() {
  const { s, me } = useStore()
  if (!s.signedIn) return <Landing />
  return (
    <Shell>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Navigate to={me.role === 'expert' ? '/expert' : '/market'} replace />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/sell" element={<SellDashboard />} />
        <Route path="/sell/new" element={<NewListing />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/expert" element={<Expert />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <MemoryRouter>
        <AppRoutes />
        <Toasts />
      </MemoryRouter>
    </StoreProvider>
  )
}
