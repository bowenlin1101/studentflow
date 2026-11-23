import React, { useState } from 'react'
import { ShieldCheck, ArrowRight, KeyRound, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { FEES, SUBSCRIPTION } from '../launch/lib/config'
import { Logo, Btn, inputCls, Avatar, ListingArt } from '../ui'
import { TopicImage } from '../art'

const DEMO = [
  { id: 'u_maya', tag: 'New founder', desc: 'Guided launch: “I like baking” to a live listing' },
  { id: 'u_alex', tag: 'Buyer', desc: 'Browse, book, rebook and swap codes' },
  { id: 'u_priya', tag: 'Seller', desc: 'Listings, orders, customers and tax summary' },
]

export default function Landing() {
  const { s, dispatch } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const listing = (id) => s.listings.find((l) => l.id === id)

  const submitEmail = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@uwo\.ca$/.test(email.trim().toLowerCase())) { setErr('Use your Western email address ending in @uwo.ca.'); return }
    setErr(''); setStep('code')
  }
  const submitCode = (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) { setErr('Enter the 6-digit code. In this demo any 6 digits work.'); return }
    const v = email.trim().toLowerCase()
    const existing = Object.values(s.users).find((u) => u.email === v)
    dispatch(existing ? { type: 'signIn', userId: existing.id } : { type: 'signUp', email: v })
    nav('/market')
  }
  const enter = (id) => { dispatch({ type: 'signIn', userId: id }); nav(id === 'u_maya' ? '/launch' : '/market') }

  return (
    <div className="min-h-screen">
      <div className="gutter mx-auto flex h-20 max-w-[1150px] items-center"><Logo size={30} /></div>

      <section className="gutter mx-auto grid max-w-[1150px] items-center gap-12 pb-20 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
        <div className="min-w-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brandsoft px-3 py-1 text-xs font-semibold text-brand">
            <ShieldCheck size={14} /> Now live at Western University
          </div>
          <h1 className="font-display text-[42px] font-bold leading-[1.04] tracking-tight sm:text-[58px]">
            Test your business idea on <span className="text-brand">30,000</span> classmates.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
            Answer a few friendly questions and StudentFlow turns a skill you already have into a priced, live listing on a students-only marketplace. We give you the tools. We only make money when you make money.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-4 gap-3" aria-hidden="true">
            {['l_cookies', 'l_lift', 'l_calc', 'l_cakes'].map((id) => <ListingArt key={id} listing={listing(id)} className="aspect-square rounded-2xl" />)}
          </div>
        </div>

        <div className="rounded-3xl bg-surface p-6 sm:p-8">
          {step === 'email' ? (
            <form onSubmit={submitEmail} noValidate>
              <h2 className="font-display text-2xl font-bold">Sign in or join</h2>
              <p className="mt-1 text-muted">We’ll send a one-time code to your Western inbox.</p>
              <div className="mt-6 flex gap-2">
                <input id="email" type="email" autoComplete="email" placeholder="you@uwo.ca" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} h-12 !rounded-full px-5`} aria-label="Western email" />
                <Btn size="lg" type="submit" aria-label="Send code"><ArrowRight size={18} /></Btn>
              </div>
            </form>
          ) : (
            <form onSubmit={submitCode} noValidate>
              <h2 className="font-display text-2xl font-bold">Check your inbox</h2>
              <p className="mt-1 text-muted">Code sent to <b className="font-medium text-ink">{email}</b></p>
              <div className="mt-6 flex gap-2">
                <input id="otp" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={`${inputCls} h-12 !rounded-full px-5 tracking-[0.3em] tnum`} aria-label="Verification code" />
                <Btn size="lg" type="submit"><KeyRound size={16} /> Verify</Btn>
              </div>
              <button type="button" onClick={() => { setStep('email'); setErr('') }} className="mt-3 px-5 text-[13px] text-muted hover:text-ink">Use a different email</button>
            </form>
          )}
          {err && <p className="mt-2 px-5 text-[13px] text-danger">{err}</p>}

          <div className="mt-8 border-t border-line pt-6">
            <div className="mb-3 text-[13px] text-muted">Investor demo: jump in as</div>
            <div className="grid gap-1">
              {DEMO.map((d) => {
                const u = s.users[d.id]
                return (
                  <button key={d.id} onClick={() => enter(d.id)} className="group flex items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-bg">
                    <Avatar user={u} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{u.name} <span className="font-normal text-muted">· {d.tag}</span></span>
                      <span className="block truncate text-[13px] text-muted">{d.desc}</span>
                    </span>
                    <ArrowRight size={16} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="gutter mx-auto max-w-[1150px] pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            [<TopicImage key="t" topic="launch" label="Launch" className="aspect-[16/10] rounded-3xl" />, 'Launch', '7 short stages take you from an idea to a price, a listing and your first 10 customers.'],
            [<ListingArt key="l" listing={listing('l_lift')} className="aspect-[16/10] rounded-3xl" />, 'Sell', 'Chat with buyers, swap codes at hand-off, and track every sale and payout.'],
            [<ListingArt key="b" listing={listing('l_cookies')} className="aspect-[16/10] rounded-3xl" />, 'Buy', 'Tutoring, workouts and baked goods from verified Western students.'],
          ].map(([img, t, d]) => (
            <div key={t}>
              {img}
              <div className="mt-4 font-display text-xl font-bold">{t}</div>
              <p className="mt-1 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="gutter mx-auto max-w-[1150px] py-20">
          <h2 className="font-display text-3xl font-bold">Every order is confirmed by a code swap</h2>
          <p className="mt-2 max-w-2xl text-muted">Buyers and sellers each get a 4-character code. Money only moves when both codes are entered, so every sale on Studentflow is verified.</p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Order placed', 'The buyer’s card is authorized and the payment is held. Free cancellation until 12 hours before the hand-off.'],
              ['12-hour lock', 'The order locks in. A late buyer cancellation pays the seller 25% of the order (up to $15).'],
              ['Check in', 'Both tap “I’m here” at the meeting spot. This decides who is responsible if someone doesn’t show.'],
              ['Swap codes', 'Each person enters the other’s code. Payment is captured and the seller is paid, minus a small fee.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white">{i + 1}</span>
                <div className="mt-4 font-medium">{t}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gutter mx-auto max-w-[1150px] py-20">
        <h2 className="font-display text-3xl font-bold">We only make money when you make money</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Free to start', `No cost until your first ${FEES.trialEndsAfterSales} sales or ${SUBSCRIPTION.trialDays} days, whichever is later. Then $${SUBSCRIPTION.monthly}/month.`],
            ['Small fee per sale', `8% on your first 10 sales, then 6%. Just 4% when a regular rebooks you.`],
            ['$1 Buyer Protection', 'Buyers pay $1 per order so their money is held until the code swap. Waived on rebooks.'],
          ].map(([t, d], i) => (
            <div key={t} className={`rounded-3xl p-7 ${i === 0 ? 'bg-brandsoft/60' : 'bg-surface'}`}>
              <div className="font-display text-xl font-bold">{t}</div>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="gutter mx-auto max-w-[1150px] border-t border-line py-6 text-xs text-muted">Investor prototype · sample data · no real payments.</footer>
    </div>
  )
}
