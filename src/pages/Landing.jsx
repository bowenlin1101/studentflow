import React, { useState } from 'react'
import { ShieldCheck, GraduationCap, Store, ShoppingBag, ArrowRight, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Logo, Btn, inputCls, Avatar, Panel } from '../ui'
import { PLANS } from '../data'

const DEMO = [
  { id: 'u_alex', tag: 'Buyer', desc: 'Browse, chat, check out and swap codes' },
  { id: 'u_priya', tag: 'Seller', desc: 'Listings, orders and sales analytics' },
  { id: 'u_jordan', tag: 'Seller + coaching', desc: 'Book expert sessions with credits' },
  { id: 'u_okafor', tag: 'Expert', desc: 'Set availability, see bookings' },
]

export default function Landing() {
  const { s, dispatch } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')

  const submitEmail = (e) => {
    e.preventDefault()
    const v = email.trim().toLowerCase()
    if (!/^[^\s@]+@uwo\.ca$/.test(v)) { setErr('Use your Western email address ending in @uwo.ca. Studentflow is open to verified Western students only.'); return }
    setErr(''); setStep('code')
  }
  const submitCode = (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) { setErr('Enter the 6-digit code from your inbox. In this demo any 6 digits work.'); return }
    const v = email.trim().toLowerCase()
    const existing = Object.values(s.users).find((u) => u.email === v)
    dispatch(existing ? { type: 'signIn', userId: existing.id } : { type: 'signUp', email: v })
    nav('/market')
  }
  const enter = (id) => { dispatch({ type: 'signIn', userId: id }); nav(s.users[id].role === 'expert' ? '/expert' : '/market') }

  return (
    <div className="min-h-screen">
      <div className="gutter mx-auto flex h-16 max-w-[1200px] items-center"><Logo size={30} /></div>
      <section className="gutter mx-auto grid max-w-[1200px] gap-10 pb-12 pt-8 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brandsoft px-3 py-1 text-xs font-semibold text-brand">
            <ShieldCheck size={14} /> Now live at Western University
          </div>
          <h1 className="font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[56px]">
            Test your business idea on <span className="text-brand">30,000</span> classmates.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
            Learn how to start from expert-led guides and webinars, post your product or service to a students-only
            marketplace, and get real orders and feedback in your first week.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [GraduationCap, 'Learn', 'Guides, weekly webinars and 1:1 sessions with industry experts.'],
              [Store, 'Sell', 'List products or services, chat with buyers, track every sale.'],
              [ShoppingBag, 'Buy', 'Find tutoring, merch, food and more from verified students.'],
            ].map(([I, t, d]) => (
              <div key={t}>
                <I size={22} className="text-accent" />
                <div className="mt-2 font-display text-lg font-semibold">{t}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <Panel className="h-fit p-6 shadow-sm sm:p-8">
          {step === 'email' ? (
            <form onSubmit={submitEmail} noValidate>
              <h2 className="font-display text-2xl font-semibold">Sign in or join</h2>
              <p className="mt-1 text-muted">We will send a one-time code to your Western inbox.</p>
              <label htmlFor="email" className="mb-1.5 mt-6 block text-[13px] font-semibold">Western email</label>
              <input id="email" type="email" autoComplete="email" placeholder="you@uwo.ca" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              {err && <p className="mt-2 text-[13px] text-danger">{err}</p>}
              <Btn className="mt-4 w-full" size="lg" type="submit">Send code <ArrowRight size={16} /></Btn>
            </form>
          ) : (
            <form onSubmit={submitCode} noValidate>
              <h2 className="font-display text-2xl font-semibold">Check your inbox</h2>
              <p className="mt-1 text-muted">We sent a 6-digit code to <b className="text-ink">{email}</b>.</p>
              <label htmlFor="otp" className="mb-1.5 mt-6 block text-[13px] font-semibold">Verification code</label>
              <input id="otp" inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={`${inputCls} tracking-[0.4em] tnum`} />
              {err && <p className="mt-2 text-[13px] text-danger">{err}</p>}
              <Btn className="mt-4 w-full" size="lg" type="submit"><KeyRound size={16} /> Verify and continue</Btn>
              <button type="button" onClick={() => { setStep('email'); setErr('') }} className="mt-3 w-full text-[13px] text-muted hover:text-ink">Use a different email</button>
            </form>
          )}
          <div className="mt-8 border-t border-line pt-6">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Investor demo: jump in as</div>
            <div className="grid gap-2">
              {DEMO.map((d) => {
                const u = s.users[d.id]
                return (
                  <button key={d.id} onClick={() => enter(d.id)} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left hover:border-brand hover:bg-brandsoft/50">
                    <Avatar user={u} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{u.name} <span className="font-normal text-muted">· {d.tag}</span></span>
                      <span className="block truncate text-xs text-muted">{d.desc}</span>
                    </span>
                    <ArrowRight size={16} className="text-muted" />
                  </button>
                )
              })}
            </div>
          </div>
        </Panel>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="gutter mx-auto max-w-[1200px] py-14">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Every order is confirmed by a code swap</h2>
          <p className="mt-2 max-w-2xl text-muted">Buyers and sellers each get a 4-character code. Money only moves when both codes are entered, so every sale on Studentflow is verified.</p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Order placed', 'The buyer’s card is authorized and the payment is held. Free cancellation until 12 hours before the hand-off.'],
              ['12-hour lock', 'The order locks in. A late buyer cancellation pays the seller 25% of the order (up to $15).'],
              ['Check in', 'Both tap “I’m here” at the meeting spot. This decides who is responsible if someone doesn’t show.'],
              ['Swap codes', 'Each person enters the other’s code. Payment is captured and the seller is paid, minus 7.5%.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white">{i + 1}</span>
                <div><div className="font-semibold">{t}</div><p className="mt-1 text-[13px] leading-relaxed text-muted">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gutter mx-auto max-w-[1200px] py-14">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Plans</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Object.entries(PLANS).map(([k, p]) => (
            <div key={k} className={`rounded-2xl border p-6 ${k === 'coach' ? 'border-brand bg-brandsoft/40' : 'border-line bg-surface'}`}>
              <div className="font-semibold">{p.name}</div>
              <div className="mt-2 font-display text-3xl font-bold tnum">${p.price}<span className="text-base font-medium text-muted">/month</span></div>
              <p className="mt-2 text-[13px] text-muted">{p.blurb}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="gutter mx-auto max-w-[1200px] border-t border-line py-6 text-xs text-muted">Investor prototype · sample data · no real payments.</footer>
    </div>
  )
}
