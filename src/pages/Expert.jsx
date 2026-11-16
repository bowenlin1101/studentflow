import React, { useState } from 'react'
import { ExternalLink, CalendarDays, Users, Clock } from 'lucide-react'
import { useStore, fmtWhen, fmtDay } from '../store'
import { Avatar, Badge, Btn, PageHead, Panel } from '../ui'
import { openSlots } from './Learn'

const DAYS = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']]
const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i)
const hl = (h) => `${h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`

export default function Expert() {
  const { s, me, now, dispatch, toast } = useStore()
  const [tpl, setTpl] = useState(() => JSON.parse(JSON.stringify(s.availability[me.id] || {})))
  const [dirty, setDirty] = useState(false)
  if (me.role !== 'expert') return <div className="text-muted">The expert portal is for Studentflow experts. Switch persona to Dr. Sarah Okafor to see it.</div>
  const toggle = (d, h) => {
    const cur = new Set(tpl[d] || []); cur.has(h) ? cur.delete(h) : cur.add(h)
    setTpl({ ...tpl, [d]: [...cur].sort((a, b) => a - b) }); setDirty(true)
  }
  const sessions = s.sessions.filter((x) => x.expertId === me.id).sort((a, b) => a.at - b.at)
  const upcoming = sessions.filter((x) => x.at > now)
  const weekly = Object.values(tpl).reduce((a, h) => a + h.length, 0)
  const open = openSlots(s, me.id, now).length
  const hosting = s.webinars.filter((w) => w.host === me.id)
  return (
    <div>
      <PageHead eyebrow="Expert portal" title={`Welcome back, ${me.name.split(' ').slice(0, 2).join(' ')}`} sub={`${me.expertise}. Students book your open hours using their Coaching credits. Every session runs on Zoom.`} />
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[[CalendarDays, 'Upcoming sessions', upcoming.length], [Clock, 'Weekly hours offered', weekly], [Users, 'Open slots (2 weeks)', open]].map(([I, k, v]) => (
          <Panel key={k} className="p-4"><div className="flex items-center gap-2 text-xs font-semibold text-muted"><I size={14} />{k}</div><div className="mt-2 font-display text-[26px] font-bold leading-none tnum">{v}</div></Panel>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="min-w-0 p-5">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Weekly availability</h2>
            <Btn size="sm" disabled={!dirty} onClick={() => { dispatch({ type: 'availability', expertId: me.id, template: tpl }); setDirty(false); toast('Availability saved') }}>Save changes</Btn>
          </div>
          <p className="mb-4 text-sm text-muted">Click an hour to open or close it. Students can book open hours at least 12 hours ahead.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
              <thead><tr><th />{DAYS.map(([d, n]) => <th key={d} className="pb-1 font-semibold text-muted">{n}</th>)}</tr></thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td className="pr-2 text-right text-muted tnum">{hl(h)}</td>
                    {DAYS.map(([d, n]) => {
                      const on = (tpl[d] || []).includes(h)
                      return <td key={d}><button onClick={() => toggle(d, h)} aria-pressed={on} aria-label={`${n} ${hl(h)}`} className={`h-7 w-full rounded-md transition ${on ? 'bg-brand' : 'bg-surface2 hover:bg-brandsoft'}`} /></td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel className="p-5">
            <h2 className="font-display text-lg font-semibold">Booked sessions</h2>
            <div className="mt-3 space-y-2">
              {upcoming.map((x) => (
                <div key={x.id} className="rounded-xl bg-surface2 p-3">
                  <div className="flex items-center gap-3"><Avatar user={s.users[x.studentId]} size={32} />
                    <div className="min-w-0 flex-1 text-sm"><div className="font-semibold">{s.users[x.studentId].name}</div><div className="text-xs text-muted">{s.users[x.studentId].program}</div></div></div>
                  <div className="mt-2 text-sm">{x.topic}</div>
                  <div className="mt-1 flex items-center justify-between text-xs"><span className="text-muted tnum">{fmtWhen(x.at)}</span><a href={x.zoom} target="_blank" rel="noreferrer" className="font-semibold text-brand">Start Zoom <ExternalLink size={11} className="inline" /></a></div>
                </div>
              ))}
              {!upcoming.length && <p className="text-sm text-muted">No bookings yet.</p>}
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="font-display text-lg font-semibold">Your webinars</h2>
            {hosting.map((w) => <div key={w.id} className="mt-3 text-sm"><div className="font-semibold">{w.title}</div><div className="text-xs text-muted tnum">{fmtDay(w.at)} · {w.registered} registered</div></div>)}
            {!hosting.length && <p className="mt-2 text-sm text-muted">Not hosting any upcoming webinars.</p>}
          </Panel>
        </div>
      </div>
    </div>
  )
}
