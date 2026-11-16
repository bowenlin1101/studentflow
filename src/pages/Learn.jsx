import React, { useState } from 'react'
import { FileText, PlayCircle, Video, CalendarDays, Lock, Clock, Users, ExternalLink, Sparkles, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, fmtWhen, fmtDay, fmtTime, D, H, canSell } from '../store'
import { DOCS } from '../data'
import { Avatar, Badge, Btn, Modal, PageHead, Panel, Tabs, Field, inputCls } from '../ui'

export function openSlots(s, expertId, now, days = 14) {
  const tpl = s.availability[expertId] || {}
  const taken = new Set(s.sessions.filter((x) => x.expertId === expertId).map((x) => x.at))
  const out = []
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  for (let i = 0; i < days; i++) {
    const day = start.getTime() + i * D
    const dow = new Date(day).getDay()
    for (const h of tpl[dow] || []) { const t = day + h * H; if (t > now + 12 * H && !taken.has(t)) out.push(t) }
  }
  return out
}

function Library({ unlocked }) {
  const { s } = useStore()
  const nav = useNavigate()
  const [doc, setDoc] = useState(null)
  const cats = [...new Set(DOCS.map((d) => d.cat))]
  return (
    <div className="space-y-8">
      {!unlocked && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-accentsoft p-4 text-sm">
          <Lock size={18} className="text-accent" /><span className="flex-1">You can read the first guide in each topic for free. Founder ($45/month) unlocks the full library and webinar recordings.</span>
          <Btn size="sm" variant="accent" onClick={() => nav('/pricing')}>Upgrade</Btn>
        </div>
      )}
      {cats.map((c) => (
        <section key={c}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{c}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCS.filter((d) => d.cat === c).map((d, i) => {
              const locked = !unlocked && i > 0
              return (
                <button key={d.id} onClick={() => !locked && setDoc(d)} className={`flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left ${locked ? 'opacity-60' : 'hover:border-brand/50 hover:shadow-sm'}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brandsoft text-brand">{locked ? <Lock size={18} /> : <FileText size={18} />}</span>
                  <span className="min-w-0"><span className="block font-semibold leading-snug">{d.title}</span><span className="mt-1 block text-xs text-muted">{d.mins} min read</span></span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Video lessons</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.recordings.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="brand-grad flex aspect-video items-center justify-center text-white/90"><PlayCircle size={44} strokeWidth={1.4} /></div>
              <div className="p-4"><div className="font-semibold leading-snug">{r.title}</div>
                <div className="mt-1 text-xs text-muted">{s.users[r.host].name} · {r.mins} min · webinar recording</div>
                <Badge tone="muted" className="mt-2">Recording placeholder</Badge></div>
            </div>
          ))}
        </div>
      </section>
      <Modal open={!!doc} onClose={() => setDoc(null)} title={doc?.title} wide>
        {doc && <div className="space-y-3 text-[15px] leading-relaxed"><Badge tone="brand">{doc.cat} · {doc.mins} min</Badge>{doc.body.map((p, i) => <p key={i}>{p}</p>)}</div>}
      </Modal>
    </div>
  )
}

function Webinars({ unlocked }) {
  const { s, me, dispatch, toast } = useStore()
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Upcoming · Wednesdays at 7 PM</h2>
        <div className="space-y-3">
          {s.webinars.map((w, i) => {
            const on = (s.registered[w.id] || []).includes(me.id)
            const d = new Date(w.at)
            return (
              <Panel key={w.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="w-14 shrink-0 rounded-xl bg-brandsoft py-2 text-center text-brand">
                  <div className="text-[11px] font-semibold uppercase">{d.toLocaleDateString('en-CA', { month: 'short' })}</div>
                  <div className="font-display text-2xl font-bold leading-none tnum">{d.getDate()}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-snug">{w.title}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted"><span>{s.users[w.host].name}</span><span className="tnum">{fmtTime(w.at)}</span><span className="inline-flex items-center gap-1 tnum"><Users size={12} />{w.registered + (on ? 1 : 0)} going</span></div>
                </div>
                {i === 0 && on && <a href="https://zoom.us" target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand">Zoom link <ExternalLink size={11} className="inline" /></a>}
                {unlocked
                  ? <Btn size="sm" variant={on ? 'outline' : 'primary'} onClick={() => { dispatch({ type: 'register', id: w.id, userId: me.id }); toast(on ? 'Registration cancelled' : 'Registered. Zoom link added to your calendar.') }}>{on ? 'Registered ✓' : 'Register'}</Btn>
                  : <Badge tone="accent"><Lock size={11} /> Founder</Badge>}
              </Panel>
            )
          })}
        </div>
      </div>
      <Panel className="h-fit p-5">
        <Video size={22} className="text-accent" />
        <h3 className="mt-2 font-display text-lg font-semibold">How webinars work</h3>
        <ul className="mt-2 space-y-2 text-sm text-muted">
          <li>Live on Zoom every Wednesday, 7–8 PM, with 15 minutes of Q&A.</li>
          <li>Recordings appear in the library within 48 hours.</li>
          <li>Hosted by the same experts you can book 1:1 on the Coaching plan.</li>
        </ul>
      </Panel>
    </div>
  )
}

function Coaching() {
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [pick, setPick] = useState(null)
  const [topic, setTopic] = useState('')
  if (me.plan !== 'coach') return (
    <Panel className="mx-auto max-w-xl p-8 text-center">
      <Sparkles size={26} className="mx-auto text-accent" />
      <h2 className="mt-3 font-display text-xl font-semibold">3 expert sessions every month</h2>
      <p className="mt-2 text-muted">Founder + Coaching ($100/month) gives you three 45-minute Zoom sessions a month with industry experts. Unused sessions roll over, up to 5 banked.</p>
      <Btn className="mt-5" onClick={() => nav('/pricing')}>See Coaching plan</Btn>
    </Panel>
  )
  const c = me.credits
  const leftThisMonth = Math.max(0, c.monthly - c.usedThisMonth)
  const available = leftThisMonth + c.rolledOver
  const experts = Object.values(s.users).filter((u) => u.role === 'expert')
  const mine = s.sessions.filter((x) => x.studentId === me.id).sort((a, b) => a.at - b.at)
  const upcoming = mine.filter((x) => x.at > now), past = mine.filter((x) => x.at <= now)
  const book = () => {
    dispatch({ type: 'book', expertId: pick.expertId, studentId: me.id, at: pick.at, topic: topic || 'General advice' })
    toast('Session booked. Zoom link sent to your @uwo.ca inbox.'); setPick(null); setTopic('')
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Sessions available</div>
          <div className="mt-2 font-display text-5xl font-bold tnum">{available}</div>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: c.monthly + c.cap }, (_, i) => {
              const isMonth = i < c.monthly
              const filled = isMonth ? i < leftThisMonth : i - c.monthly < c.rolledOver
              return <span key={i} className={`h-2.5 flex-1 rounded-full ${filled ? (isMonth ? 'bg-brand' : 'bg-accent') : 'bg-surface2'} ${i === c.monthly ? 'ml-2' : ''}`} />
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand" />{leftThisMonth} of {c.monthly} this month</div>
            <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent" />{c.rolledOver} of {c.cap} rolled over</div>
          </div>
          <p className="mt-3 text-xs text-muted">Unused sessions roll over to next month, up to 5 banked. Rolled-over sessions are used first.</p>
          <button onClick={() => { dispatch({ type: 'newMonth', userId: me.id }); toast('New month: unused sessions rolled over') }} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand"><RefreshCw size={12} /> Demo: start next month</button>
        </Panel>
        <Panel className="p-5">
          <h3 className="font-semibold">Your sessions</h3>
          {!upcoming.length && <p className="mt-2 text-sm text-muted">No upcoming sessions. Pick a time with an expert below.</p>}
          <div className="mt-3 space-y-2">
            {upcoming.map((x) => (
              <div key={x.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface2 p-3">
                <Avatar user={s.users[x.expertId]} size={34} />
                <div className="min-w-0 flex-1 text-sm"><div className="font-semibold">{x.topic}</div><div className="text-xs text-muted tnum">{s.users[x.expertId].name} · {fmtWhen(x.at)}</div></div>
                <a href={x.zoom} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand">Join Zoom <ExternalLink size={11} className="inline" /></a>
                <button onClick={() => { dispatch({ type: 'cancelSession', id: x.id }); toast('Session cancelled. Credit returned.') }} className="text-xs font-semibold text-muted hover:text-danger">Cancel</button>
              </div>
            ))}
            {past.map((x) => <div key={x.id} className="px-3 text-xs text-muted">Done: {x.topic} with {s.users[x.expertId].name}, {fmtDay(x.at)}</div>)}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {experts.map((e) => {
          const slots = openSlots(s, e.id, now).slice(0, 6)
          return (
            <Panel key={e.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar user={e} size={48} />
                <div className="min-w-0"><div className="font-display text-lg font-semibold">{e.name}</div><div className="text-sm font-semibold text-brand">{e.expertise}</div></div>
              </div>
              <p className="mt-3 text-sm text-muted">{e.bio}</p>
              <div className="mt-4 text-xs font-semibold text-muted">Next open times · 45 min on Zoom</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {slots.map((t) => (
                  <button key={t} disabled={!available} onClick={() => setPick({ expertId: e.id, at: t })} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:border-brand hover:bg-brandsoft disabled:opacity-40 tnum">
                    {new Date(t).toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric' })} · {fmtTime(t)}
                  </button>
                ))}
                {!slots.length && <span className="text-xs text-muted">No open times in the next 2 weeks.</span>}
              </div>
            </Panel>
          )
        })}
      </div>

      <Modal open={!!pick} onClose={() => setPick(null)} title="Book a session">
        {pick && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3"><Avatar user={s.users[pick.expertId]} size={40} /><div><div className="font-semibold">{s.users[pick.expertId].name}</div><div className="text-muted tnum">{fmtWhen(pick.at)} · 45 min · Zoom</div></div></div>
            <Field label="What do you want help with?"><input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls} placeholder="e.g. Pricing my tutoring packages" /></Field>
            <p className="text-xs text-muted">Uses 1 of your {available} available sessions. Cancel up to 24 hours before to get it back.</p>
            <Btn className="w-full" size="lg" onClick={book}>Book session</Btn>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function Learn() {
  const { me } = useStore()
  const [tab, setTab] = useState(me.plan === 'coach' ? 'coaching' : 'library')
  const unlocked = canSell(me) || me.role === 'expert'
  return (
    <div>
      <PageHead eyebrow="Learn" title="Build your business, step by step" sub="Guides written for student founders, weekly live webinars, and 1:1 time with people who have done it." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'library', label: 'Library' }, { id: 'webinars', label: 'Webinars' }, ...(me.role === 'expert' ? [] : [{ id: 'coaching', label: '1:1 Coaching' }])]} />
      {tab === 'library' && <Library unlocked={unlocked} />}
      {tab === 'webinars' && <Webinars unlocked={unlocked} />}
      {tab === 'coaching' && <Coaching />}
    </div>
  )
}
