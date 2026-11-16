import React, { useState } from 'react'
import { Lock, Play, ArrowUpRight } from 'lucide-react'
import { TopicImage } from '../art'
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
  const [featured, ...rest] = DOCS
  return (
    <div className="space-y-12">
      <button onClick={() => setDoc(featured)} className="group grid w-full overflow-hidden rounded-3xl bg-surface text-left sm:grid-cols-[1.2fr_1fr]">
        <TopicImage topic={featured.topic} label={featured.title} className="aspect-[16/10] sm:aspect-auto sm:min-h-[240px]" />
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="text-[13px] font-medium text-accent">Start here</div>
          <div className="mt-2 font-display text-2xl font-bold leading-tight group-hover:text-brand">{featured.title}</div>
          <div className="mt-2 text-[13px] text-muted">{featured.cat} · {featured.mins} min read</div>
        </div>
      </button>

      <section>
        <h2 className="mb-4 text-[13px] font-medium text-muted">Guides</h2>
        <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((d) => {
            const locked = !unlocked && DOCS.filter((x) => x.cat === d.cat)[0].id !== d.id
            return (
              <button key={d.id} onClick={() => (locked ? nav('/pricing') : setDoc(d))} className="group text-left">
                <TopicImage topic={d.topic} label={d.title} className={`aspect-[16/10] rounded-2xl ${locked ? 'opacity-60' : 'transition group-hover:opacity-90'}`}>
                  {locked && <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted"><Lock size={14} /></span>}
                </TopicImage>
                <div className="mt-3 font-medium leading-snug">{d.title}</div>
                <div className="mt-0.5 text-[13px] text-muted">{d.cat} · {d.mins} min</div>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-[13px] font-medium text-muted">Webinar recordings</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {s.recordings.map((r) => (
            <div key={r.id}>
              <TopicImage topic={r.topic} label={r.title} className="aspect-video rounded-2xl">
                <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/80 text-bg"><Play size={18} className="ml-0.5 fill-current" /></span></span>
                <span className="absolute bottom-2 right-2 rounded-md bg-ink/80 px-1.5 py-0.5 text-[11px] font-medium text-bg tnum">{r.mins}:00</span>
              </TopicImage>
              <div className="mt-3 font-medium leading-snug">{r.title}</div>
              <div className="text-[13px] text-muted">{s.users[r.host].name}</div>
            </div>
          ))}
        </div>
      </section>

      <Modal open={!!doc} onClose={() => setDoc(null)} title={doc?.title} wide>
        {doc && (
          <div>
            <TopicImage topic={doc.topic} label={doc.title} className="-mx-5 -mt-1 mb-5 aspect-[16/7]" />
            <div className="space-y-3 leading-relaxed text-muted">{doc.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Webinars({ unlocked }) {
  const { s, me, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [next, ...later] = s.webinars
  const Join = ({ w }) => {
    const on = (s.registered[w.id] || []).includes(me.id)
    return unlocked
      ? <Btn size="sm" variant={on ? 'ghost' : 'primary'} onClick={() => { dispatch({ type: 'register', id: w.id, userId: me.id }); toast(on ? 'Removed' : 'You’re in') }}>{on ? 'Going ✓' : 'Join'}</Btn>
      : <Btn size="sm" variant="outline" onClick={() => nav('/pricing')}><Lock size={13} /> Founder</Btn>
  }
  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-3xl bg-surface">
        <TopicImage topic={next.topic} label={next.title} className="aspect-[16/7] sm:aspect-[16/5]">
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Next live session</span>
        </TopicImage>
        <div className="flex flex-wrap items-center gap-4 p-6">
          <div className="min-w-0 flex-1">
            <div className="font-display text-xl font-bold leading-tight">{next.title}</div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-muted"><Avatar user={s.users[next.host]} size={22} />{s.users[next.host].name} · {fmtWhen(next.at)}</div>
          </div>
          <Join w={next} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {later.map((w) => (
          <div key={w.id}>
            <TopicImage topic={w.topic} label={w.title} className="aspect-[16/10] rounded-2xl">
              <span className="absolute left-3 top-3 rounded-xl bg-surface px-2.5 py-1 text-center leading-none">
                <span className="block text-[10px] font-medium uppercase text-muted">{new Date(w.at).toLocaleDateString('en-CA', { month: 'short' })}</span>
                <span className="block font-display text-lg font-bold tnum">{new Date(w.at).getDate()}</span>
              </span>
            </TopicImage>
            <div className="mt-3 font-medium leading-snug">{w.title}</div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="text-[13px] text-muted">{s.users[w.host].name}</span>
              <Join w={w} />
            </div>
          </div>
        ))}
      </div>
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
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 font-display text-3xl font-bold">Learn</h1>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'library', label: 'Library' }, { id: 'webinars', label: 'Webinars' }, ...(me.role === 'expert' ? [] : [{ id: 'coaching', label: 'Coaching' }])]} />
      {tab === 'library' && <Library unlocked={unlocked} />}
      {tab === 'webinars' && <Webinars unlocked={unlocked} />}
      {tab === 'coaching' && <Coaching />}
    </div>
  )
}
