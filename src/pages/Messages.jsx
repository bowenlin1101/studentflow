import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useStore, fmtTime, fmtDay, orderStatus, STATUS } from '../store'
import { Avatar, Badge, Btn, ListingArt, PageHead, inputCls } from '../ui'

export default function Messages() {
  const { s, me, now, dispatch } = useStore()
  const nav = useNavigate()
  const convs = s.conversations.filter((c) => c.buyerId === me.id || c.sellerId === me.id)
    .sort((a, b) => (b.messages.at(-1)?.t || 0) - (a.messages.at(-1)?.t || 0))
  const [openId, setOpenId] = useState(s.openConvId && convs.some((c) => c.id === s.openConvId) ? s.openConvId : null)
  const [text, setText] = useState('')
  const end = useRef()
  const active = convs.find((c) => c.id === openId)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [openId, active?.messages.length])
  useEffect(() => { if (!openId && convs.length && window.innerWidth >= 768) setOpenId(convs[0].id) }, []) // eslint-disable-line

  const send = (e) => {
    e.preventDefault(); if (!text.trim()) return
    dispatch({ type: 'message', convId: active.id, from: me.id, text: text.trim() }); setText('')
  }

  if (!convs.length) return (
    <div><PageHead eyebrow="Messages" title="Messages" />
      <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No conversations yet. Open any listing and tap “Message seller”.</div></div>
  )

  return (
    <div>
      <PageHead eyebrow="Messages" title="Messages" sub="Chat with buyers and sellers. Keep payments on Studentflow so you are covered by the code swap." />
      <div className="grid h-[70vh] min-h-[480px] overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[320px_1fr]">
        <ul className={`overflow-y-auto border-line md:border-r ${active ? 'hidden md:block' : ''}`}>
          {convs.map((c) => {
            const other = s.users[c.buyerId === me.id ? c.sellerId : c.buyerId]
            const l = s.listings.find((x) => x.id === c.listingId)
            const last = c.messages.at(-1)
            return (
              <li key={c.id}>
                <button onClick={() => setOpenId(c.id)} className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left hover:bg-surface2 ${openId === c.id ? 'bg-brandsoft/50' : ''}`}>
                  <Avatar user={other} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="truncate font-semibold">{other.name}</span><span className="shrink-0 text-[11px] text-muted">{last ? fmtDay(last.t) : ''}</span></div>
                    <div className="truncate text-xs font-semibold text-brand">{l.title}</div>
                    <div className="truncate text-xs text-muted">{last ? last.text : 'No messages yet'}</div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        {active ? (() => {
          const other = s.users[active.buyerId === me.id ? active.sellerId : active.buyerId]
          const l = s.listings.find((x) => x.id === active.listingId)
          const order = s.orders.find((o) => o.listingId === l.id && o.buyerId === active.buyerId && !o.outcome)
          return (
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="flex items-center gap-3 border-b border-line p-3">
                <button className="rounded-lg p-1 md:hidden" onClick={() => setOpenId(null)} aria-label="Back"><ArrowLeft size={18} /></button>
                <ListingArt listing={l} className="h-10 w-12 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <button onClick={() => nav('/listing/' + l.id)} className="block truncate text-sm font-semibold hover:text-brand">{l.title}</button>
                  <div className="text-xs text-muted">with {other.name}</div>
                </div>
                {order ? <Btn size="sm" variant="soft" onClick={() => nav('/orders/' + order.id)}><Badge tone={STATUS[orderStatus(order, now)].tone} className="!bg-transparent !p-0">{order.id}</Badge> View order</Btn>
                  : active.buyerId === me.id && <Btn size="sm" onClick={() => nav('/listing/' + l.id)}>Order</Btn>}
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto bg-bg/50 p-4">
                {active.messages.map((m, i) => m.from === 'system' ? (
                  <div key={i} className="mx-auto flex max-w-sm items-center justify-center gap-1.5 rounded-full bg-surface2 px-3 py-1 text-center text-[11.5px] text-muted"><ShieldCheck size={12} />{m.text}</div>
                ) : (
                  <div key={i} className={`flex ${m.from === me.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${m.from === me.id ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md bg-surface2'}`}>
                      {m.text}<div className={`mt-0.5 text-[10.5px] ${m.from === me.id ? 'text-white/70' : 'text-muted'}`}>{fmtTime(m.t)}</div>
                    </div>
                  </div>
                ))}
                <div ref={end} />
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
                <input id="msg" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${other.name.split(' ')[0]}…`} className={inputCls} />
                <Btn type="submit" aria-label="Send" disabled={!text.trim()}><Send size={16} /></Btn>
              </form>
            </div>
          )
        })() : <div className="hidden items-center justify-center text-muted md:flex">Select a conversation</div>}
      </div>
    </div>
  )
}
