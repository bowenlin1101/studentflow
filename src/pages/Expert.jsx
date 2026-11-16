import React, { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useStore, fmtWhen } from '../store'
import { Avatar, Btn } from '../ui'

const DAYS = [[1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [0, 'Sun']]
const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i)
const hl = (h) => `${h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`

export default function Expert() {
  const { s, me, now, dispatch, toast } = useStore()
  const [tpl, setTpl] = useState(() => JSON.parse(JSON.stringify(s.availability[me.id] || {})))
  const [dirty, setDirty] = useState(false)
  if (me.role !== 'expert') return <div className="text-muted">For experts only.</div>
  const toggle = (d, h) => {
    const cur = new Set(tpl[d] || []); cur.has(h) ? cur.delete(h) : cur.add(h)
    setTpl({ ...tpl, [d]: [...cur].sort((a, b) => a - b) }); setDirty(true)
  }
  const sessions = s.sessions.filter((x) => x.expertId === me.id).sort((a, b) => a.at - b.at)
  const upcoming = sessions.filter((x) => x.at > now)
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">Availability</h1>
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-separate border-spacing-1 text-xs">
              <thead><tr><th />{DAYS.map(([d, n]) => <th key={d} className="pb-1 font-medium text-muted">{n}</th>)}</tr></thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td className="pr-2 text-right text-muted tnum">{hl(h)}</td>
                    {DAYS.map(([d, n]) => {
                      const on = (tpl[d] || []).includes(h)
                      return <td key={d}><button onClick={() => toggle(d, h)} aria-pressed={on} aria-label={`${n} ${hl(h)}`} className={`h-7 w-full rounded-md transition ${on ? 'bg-brand' : 'bg-surface hover:bg-brandsoft'}`} /></td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Btn className="mt-4" disabled={!dirty} onClick={() => { dispatch({ type: 'availability', expertId: me.id, template: tpl }); setDirty(false); toast('Saved') }}>Save</Btn>
        </div>
        <div>
          <h2 className="mb-3 text-[13px] font-medium text-muted">Upcoming</h2>
          <div className="grid gap-1">
            {upcoming.map((x) => (
              <div key={x.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                <Avatar user={s.users[x.studentId]} size={36} />
                <div className="min-w-0 flex-1"><div className="truncate font-medium">{x.topic}</div><div className="text-[13px] text-muted tnum">{s.users[x.studentId].name} · {fmtWhen(x.at)}</div></div>
                <a href={x.zoom} target="_blank" rel="noreferrer" className="text-muted hover:text-brand" aria-label="Start Zoom"><ExternalLink size={15} /></a>
              </div>
            ))}
            {!upcoming.length && <p className="text-sm text-muted">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
