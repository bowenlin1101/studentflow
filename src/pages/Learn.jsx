import React, { useState } from 'react'
import { Lock, PlayCircle, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, fmtWhen, fmtTime, D, H, canSell } from '../store'
import { DOCS } from '../data'
import { Avatar, Btn, Modal, Tabs, inputCls } from '../ui'

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
    <div className="space-y-10">
      {cats.map((c) => (
        <section key={c}>
          <h2 className="mb-2 text-[13px] font-medium text-muted">{c}</h2>
          <div className="grid gap-1">
            {DOCS.filter((d) => d.cat === c).map((d, i) => {
              const locked = !unlocked && i > 0
              return (
                <button key={d.id} onClick={() => (locked ? nav('/pricing') : setDoc(d))} className="flex items-center gap-4 rounded-2xl px-3 py-3 text-left hover:bg-surface">
                  <span className={`flex-1 font-medium ${locked ? 'text-muted' : ''}`}>{d.title}</span>
                  {locked ? <Lock size={14} className="text-muted" /> : <span className="text-[13px] text-muted">{d.mins} min</span>}
                </button>
              )
            })}
          </div>
        </section>
      ))}
      <section>
        <h2 className="mb-3 text-[13px] font-medium text-muted">Recordings</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {s.recordings.map((r) => (
            <div key={r.id}>
              <div className="brand-grad flex aspect-video items-center justify-center rounded-2xl text-white/90"><PlayCircle size={36} strokeWidth={1.4} /></div>
              <div className="mt-2 font-medium leading-snug">{r.title}</div>
              <div className="text-[13px] text-muted">{r.mins} min</div>
            </div>
          ))}
        </div>
      </section>
      <Modal open={!!doc} onClose={() => setDoc(null)} title={doc?.title} wide>
        {doc && <div className="space-y-3 leading-relaxed text-muted">{doc.body.map((p, i) => <p key={i}>{p}</p>)}</div>}
      </Modal>
    </div>
  )
}

function Webinars({ unlocked }) {
  const { s, me, dispatch, toast } = useStore()
  const nav = useNavigate()
  return (
    <div className="grid gap-1">
      {s.webinars.map((w) => {
        const on = (s.registered[w.id] || []).includes(me.id)
        const d = new Date(w.at)
        return (
          <div key={w.id} className="flex items-center gap-4 rounded-2xl px-3 py-3 hover:bg-surface">
            <div className="w-12 shrink-0 text-center">
              <div className="text-[11px] font-medium uppercase text-muted">{d.toLocaleDateString('en-CA', { month: 'short' })}</div>
              <div className="font-display text-2xl font-bold leading-none tnum">{d.getDate()}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium leading-snug">{w.title}</div>
              <div className="text-[13px] text-muted">{s.users[w.host].name} · {fmtTime(w.at)}</div>
            </div>
            {unlocked
              ? <Btn size="sm" variant={on ? 'ghost' : 'outline'} onClick={() => { dispatch({ type: 'register', id: w.id, userId: me.id }); toast(on ? 'Removed' : 'You’re in') }}>{on ? 'Going ✓' : 'Join'}</Btn>
              : <button onClick={() => nav('/pricing')} className="text-muted" aria-label="Unlock with Founder plan"><Lock size={14} /></button>}
          </div>
        )
      })}
    </div>
  )
}

function Coaching() {
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [pick, setPick] = useState(null)
  const [topic, setTopic] = useState('')
  if (me.plan !== 'coach') return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h2 className="font-display text-2xl font-bold">3 expert sessions a month</h2>
      <p className="mt-2 text-muted">Coaching plan, $100/month.</p>
      <Btn className="mt-6" onClick={() => nav('/pricing')}>See plans</Btn>
    </div>
  )
  const c = me.credits
  const leftThisMonth = Math.max(0, c.monthly - c.usedThisMonth)
  const available = leftThisMonth + c.rolledOver
  const experts = Object.values(s.users).filter((u) => u.role === 'expert')
  const upcoming = s.sessions.filter((x) => x.studentId === me.id && x.at > now).sort((a, b) => a.at - b.at)
  const book = () => {
    dispatch({ type: 'book', expertId: pick.expertId, studentId: me.id, at: pick.at, topic: topic || 'General advice' })
    toast('Session booked'); setPick(null); setTopic('')
  }
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <div className="text-[13px] text-muted">Sessions left</div>
          <div className="font-display text-5xl font-bold tnum">{available}</div>
        </div>
        <div className="pb-1 text-[13px] text-muted">
          {leftThisMonth} this month · {c.rolledOver} rolled over (max {c.cap})
          <button onClick={() => { dispatch({ type: 'newMonth', userId: me.id }); toast('Next month: unused sessions rolled over') }} className="ml-3 text-brand">Demo: next month</button>
        </div>
      </div>

      {!!upcoming.length && (
        <div className="grid gap-1">
          {upcoming.map((x) => (
            <div key={x.id} className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-3">
              <Avatar user={s.users[x.expertId]} size={36} />
              <div className="min-w-0 flex-1"><div className="truncate font-medium">{x.topic}</div><div className="text-[13px] text-muted tnum">{s.users[x.expertId].name} · {fmtWhen(x.at)}</div></div>
              <a href={x.zoom} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand">Zoom <ArrowUpRight size={13} /></a>
              <button onClick={() => { dispatch({ type: 'cancelSession', id: x.id }); toast('Cancelled, credit returned') }} className="text-[13px] text-muted hover:text-danger">Cancel</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {experts.map((e) => (
          <div key={e.id}>
            <div className="flex items-center gap-3">
              <Avatar user={e} size={44} />
              <div><div className="font-medium">{e.name}</div><div className="text-[13px] text-muted">{e.expertise}</div></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {openSlots(s, e.id, now).slice(0, 4).map((t) => (
                <button key={t} disabled={!available} onClick={() => setPick({ expertId: e.id, at: t })} className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand disabled:opacity-40 tnum">
                  {new Date(t).toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric' })}, {fmtTime(t)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!pick} onClose={() => setPick(null)} title="Book session">
        {pick && (
          <div className="space-y-4">
            <div className="text-sm text-muted tnum">{s.users[pick.expertId].name} · {fmtWhen(pick.at)} · 45 min</div>
            <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls} placeholder="What do you want help with?" />
            <Btn className="w-full" size="lg" onClick={book}>Book · uses 1 session</Btn>
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
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-display text-3xl font-bold">Learn</h1>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'library', label: 'Library' }, { id: 'webinars', label: 'Webinars' }, ...(me.role === 'expert' ? [] : [{ id: 'coaching', label: 'Coaching' }])]} />
      {tab === 'library' && <Library unlocked={unlocked} />}
      {tab === 'webinars' && <Webinars unlocked={unlocked} />}
      {tab === 'coaching' && <Coaching />}
    </div>
  )
}
