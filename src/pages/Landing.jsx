import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Logo, Btn, inputCls, Avatar, ListingArt } from '../ui'

const DEMO = [['u_alex', 'Buyer'], ['u_priya', 'Seller'], ['u_jordan', 'Coaching'], ['u_okafor', 'Expert']]
const SHOWCASE = ['l_hoodie', 'l_headshots', 'l_mealprep', 'l_calc']

export default function Landing() {
  const { s, dispatch } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')

  const submitEmail = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@uwo\.ca$/.test(email.trim().toLowerCase())) { setErr('Use your @uwo.ca email.'); return }
    setErr(''); setStep('code')
  }
  const submitCode = (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) { setErr('Enter the 6-digit code. Any 6 digits work in the demo.'); return }
    const v = email.trim().toLowerCase()
    const existing = Object.values(s.users).find((u) => u.email === v)
    dispatch(existing ? { type: 'signIn', userId: existing.id } : { type: 'signUp', email: v })
    nav('/market')
  }
  const enter = (id) => { dispatch({ type: 'signIn', userId: id }); nav(s.users[id].role === 'expert' ? '/expert' : '/market') }

  return (
    <div className="min-h-screen">
      <div className="gutter mx-auto flex h-20 max-w-[1100px] items-center"><Logo size={30} /></div>
      <section className="gutter mx-auto grid max-w-[1100px] items-center gap-12 pb-20 pt-10 lg:grid-cols-2 lg:pt-20">
        <div className="min-w-0">
          <h1 className="font-display text-[44px] font-bold leading-[1.05] tracking-tight sm:text-[60px]">
            Start your business at <span className="text-brand">Western</span>.
          </h1>
          <p className="mt-5 text-lg text-muted">Learn, sell and buy with verified students.</p>

          <form onSubmit={step === 'email' ? submitEmail : submitCode} noValidate className="mt-10 max-w-md">
            {step === 'email' ? (
              <div className="flex gap-2">
                <input id="email" type="email" autoComplete="email" placeholder="you@uwo.ca" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} h-12 !rounded-full px-5`} aria-label="Western email" />
                <Btn size="lg" type="submit" aria-label="Send code"><ArrowRight size={18} /></Btn>
              </div>
            ) : (
              <div className="flex gap-2">
                <input id="otp" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={`${inputCls} h-12 !rounded-full px-5 tracking-[0.3em] tnum`} aria-label="Verification code" />
                <Btn size="lg" type="submit">Verify</Btn>
              </div>
            )}
            <p className={`mt-2 px-5 text-[13px] ${err ? 'text-danger' : 'text-muted'}`}>{err || (step === 'email' ? 'We’ll email you a code.' : `Code sent to ${email}`)}</p>
          </form>

          <div className="mt-12">
            <div className="mb-3 text-[13px] text-muted">Or try the demo as</div>
            <div className="flex flex-wrap gap-2">
              {DEMO.map(([id, tag]) => (
                <button key={id} onClick={() => enter(id)} className="flex items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-4 text-sm hover:bg-brandsoft">
                  <Avatar user={s.users[id]} size={28} /><span className="font-medium">{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden grid-cols-2 gap-4 lg:grid">
          {SHOWCASE.map((id, i) => <ListingArt key={id} listing={s.listings.find((l) => l.id === id)} className={`aspect-square rounded-3xl ${i % 2 ? 'translate-y-8' : ''}`} />)}
        </div>
      </section>

      <section className="gutter mx-auto max-w-[1100px] border-t border-line py-16">
        <h2 className="font-display text-2xl font-bold">Every sale is confirmed with a code swap</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-4">
          {[['Buy', 'Payment is held'], ['12 hours before', 'Order locks in'], ['Meet up', 'Both check in'], ['Swap codes', 'Seller gets paid']].map(([t, d], i) => (
            <li key={t}>
              <div className="font-display text-sm font-bold text-accent tnum">0{i + 1}</div>
              <div className="mt-1 font-medium">{t}</div>
              <div className="text-[13px] text-muted">{d}</div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
