import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Eye, ShoppingBag, DollarSign, Percent, ArrowRight, Pause, Play } from 'lucide-react'
import { useStore, money, money2, FEE_RATE, D, orderStatus, STATUS, fmtWhen, canSell } from '../store'
import { CATEGORIES } from '../data'
import { Btn, Badge, Gate, PageHead, Panel, Field, inputCls, ListingArt, Tabs } from '../ui'
import { ListingCard } from './Marketplace'

const tok = (n) => { try { return 'rgb(' + getComputedStyle(document.documentElement).getPropertyValue('--' + n).trim().split(/\s+/).join(',') + ')' } catch { return '#3f54e8' } }

function rng(seed) { let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32) }

function useSeries(me, listings, orders, now, days) {
  return useMemo(() => {
    const r = rng(me.id)
    const mine = listings.filter((l) => l.sellerId === me.id)
    const scale = mine.reduce((a, l) => a + l.impressions, 0) / 30 / 2
    const avg = mine.length ? mine.reduce((a, l) => a + l.price, 0) / mine.length : 0
    const out = []
    for (let i = days - 1; i >= 0; i--) {
      const t = now - i * D
      const dow = new Date(t).getDay()
      const wk = dow === 0 || dow === 6 ? 0.7 : 1.1
      const imp = Math.round(scale * wk * (0.75 + r() * 0.5) * (1 + (days - i) / days * 0.4))
      const views = Math.round(imp * (0.12 + r() * 0.04))
      const msgs = Math.round(views * (0.18 + r() * 0.08))
      const ord = Math.round(views * (0.07 + r() * 0.05))
      out.push({ t, label: new Date(t).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), imp, views, msgs, orders: ord, gross: ord * avg })
    }
    for (const o of orders) {
      if (o.sellerId !== me.id || o.outcome !== 'completed') continue
      const p = out.find((d) => Math.abs(d.t - o.completedAt) < D / 2 || (o.completedAt >= d.t - D && o.completedAt < d.t))
      if (p) { p.gross += o.total; p.orders += 1 }
    }
    out.forEach((d) => { d.net = Math.round(d.gross * (1 - FEE_RATE) * 100) / 100; d.fee = d.gross * FEE_RATE })
    return out
  }, [me.id, listings, orders, now, days])
}

function Tile({ icon: I, label, value, sub }) {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted"><I size={14} />{label}</div>
      <div className="mt-2 font-display text-[26px] font-bold leading-none tnum">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-muted">{sub}</div>}
    </Panel>
  )
}

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lg tnum">
      <div className="font-semibold">{new Date(d.t).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
      <div className="mt-1 flex justify-between gap-4"><span className="text-muted">Net revenue</span><b>{money2(d.net)}</b></div>
      <div className="flex justify-between gap-4"><span className="text-muted">Orders</span><b>{d.orders}</b></div>
      <div className="flex justify-between gap-4"><span className="text-muted">Impressions</span><b>{d.imp.toLocaleString()}</b></div>
    </div>
  )
}

export function SellDashboard() {
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [days, setDays] = useState(30)
  const series = useSeries(me, s.listings, s.orders, now, days)
  if (me.role === 'expert') return <Gate need="a student" title="Selling is for students">Experts coach; students sell.</Gate>
  if (!canSell(me)) return (
    <Gate need="Founder" title="Start selling with Founder ($45/month)">
      Post products and services to 30,000+ Western students, chat with buyers, and track every sale. Founder also unlocks the full resource library.
    </Gate>
  )
  const mine = s.listings.filter((l) => l.sellerId === me.id)
  const sum = (k) => series.reduce((a, d) => a + d[k], 0)
  const imp = sum('imp'), views = sum('views'), msgs = sum('msgs'), ords = sum('orders'), gross = sum('gross'), net = sum('net')
  const pending = s.orders.filter((o) => o.sellerId === me.id && !o.outcome).sort((a, b) => a.handoffAt - b.handoffAt)
  const funnel = [['Impressions', imp], ['Listing views', views], ['Messages', msgs], ['Orders', ords]]
  const recent = s.orders.filter((o) => o.sellerId === me.id && o.outcome === 'completed').sort((a, b) => b.completedAt - a.completedAt).slice(0, 5)

  return (
    <div>
      <PageHead eyebrow="Seller dashboard" title={me.shop || `${me.name.split(' ')[0]}’s shop`}
        sub="How your listings are doing on the Western marketplace."
        right={<Btn onClick={() => nav('/sell/new')}><Plus size={16} /> New listing</Btn>} />

      {!!pending.length && (
        <Panel className="mb-6 p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Needs your attention</h2><span className="text-xs text-muted">{pending.length} open order{pending.length > 1 ? 's' : ''}</span></div>
          <div className="grid gap-2">
            {pending.map((o) => {
              const l = s.listings.find((x) => x.id === o.listingId); const st = orderStatus(o, now)
              return (
                <button key={o.id} onClick={() => nav('/orders/' + o.id)} className="flex items-center gap-3 rounded-xl bg-surface2 p-3 text-left hover:bg-brandsoft/60">
                  <Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm"><b>{s.users[o.buyerId].name}</b> · {l.title}</span>
                  <span className="hidden text-xs text-muted sm:block tnum">{fmtWhen(o.handoffAt)}</span>
                  <ArrowRight size={16} className="text-muted" />
                </button>
              )
            })}
          </div>
        </Panel>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Performance</h2>
        <div className="flex rounded-lg bg-surface2 p-0.5 text-xs font-semibold">
          {[7, 30, 90].map((d) => <button key={d} onClick={() => setDays(d)} className={`rounded-md px-3 py-1.5 ${days === d ? 'bg-surface shadow-sm' : 'text-muted'}`}>{d} days</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile icon={DollarSign} label="Net revenue" value={money(Math.round(net))} sub={`${money(Math.round(gross))} gross − ${money(Math.round(gross - net))} fees`} />
        <Tile icon={ShoppingBag} label="Orders" value={ords.toLocaleString()} sub={`Avg order ${money2(ords ? gross / ords : 0)}`} />
        <Tile icon={Eye} label="Impressions" value={imp.toLocaleString()} sub={`${views.toLocaleString()} listing views`} />
        <Tile icon={Percent} label="View → order" value={`${views ? (ords / views * 100).toFixed(1) : '0.0'}%`} sub={`Click-through ${imp ? (views / imp * 100).toFixed(1) : '0.0'}%`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="min-w-0 p-5">
          <h3 className="font-semibold">Net revenue per day</h3>
          <p className="text-xs text-muted">After the 7.5% Studentflow fee. Hover for orders and impressions.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={tok('brand')} stopOpacity="0.28" /><stop offset="1" stopColor={tok('brand')} stopOpacity="0" /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke={tok('line')} />
                <XAxis dataKey="label" tick={{ fill: tok('muted'), fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={{ fill: tok('muted'), fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => '$' + v} width={52} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: tok('muted'), strokeDasharray: '3 3' }} />
                <Area isAnimationActive={false} type="monotone" dataKey="net" stroke={tok('brand')} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, stroke: tok('surface'), strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="p-5">
          <h3 className="font-semibold">Conversion funnel</h3>
          <p className="text-xs text-muted">From appearing in search to a completed code swap.</p>
          <div className="mt-5 space-y-4">
            {funnel.map(([k, v], i) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm"><span>{k}</span><span className="font-semibold tnum">{v.toLocaleString()} {i > 0 && <span className="font-normal text-muted">({(v / funnel[i - 1][1] * 100 || 0).toFixed(0)}%)</span>}</span></div>
                <div className="h-2.5 rounded-full bg-surface2"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(1.5, v / (imp || 1) * 100)}%`, opacity: 1 - i * 0.15 }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Your listings</h2>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm tnum">
          <thead><tr className="border-b border-line text-left text-xs text-muted">
            <th className="p-3 font-semibold">Listing</th><th className="p-3 text-right font-semibold">Price</th><th className="p-3 text-right font-semibold">Impressions</th>
            <th className="p-3 text-right font-semibold">Views</th><th className="p-3 text-right font-semibold">CTR</th><th className="p-3 text-right font-semibold">Sales</th><th className="p-3 text-right font-semibold">Revenue</th><th className="p-3" />
          </tr></thead>
          <tbody>
            {mine.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="p-3"><button onClick={() => nav('/listing/' + l.id)} className="flex items-center gap-3 text-left">
                  <ListingArt listing={l} className="h-10 w-12 shrink-0 rounded-lg" />
                  <span><span className="block font-semibold hover:text-brand">{l.title}</span>{!l.active && <Badge>Paused</Badge>}</span></button></td>
                <td className="p-3 text-right">{money(l.price)}</td>
                <td className="p-3 text-right">{l.impressions.toLocaleString()}</td>
                <td className="p-3 text-right">{l.views.toLocaleString()}</td>
                <td className="p-3 text-right">{l.impressions ? (l.views / l.impressions * 100).toFixed(1) + '%' : '–'}</td>
                <td className="p-3 text-right">{l.sales}</td>
                <td className="p-3 text-right font-semibold">{money(Math.round(l.sales * l.price * (l.id === 'l_totes' ? 20 : 1)))}</td>
                <td className="p-3 text-right"><button onClick={() => { dispatch({ type: 'toggleListing', id: l.id }); toast(l.active ? 'Listing paused' : 'Listing live') }} className="rounded-lg p-1.5 text-muted hover:bg-surface2" aria-label={l.active ? 'Pause listing' : 'Resume listing'}>{l.active ? <Pause size={15} /> : <Play size={15} />}</button></td>
              </tr>
            ))}
            {!mine.length && <tr><td colSpan={8} className="p-8 text-center text-muted">No listings yet. <button className="font-semibold text-brand" onClick={() => nav('/sell/new')}>Create your first one</button>.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Recent payouts</h2>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[560px] text-sm tnum">
          <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="p-3 font-semibold">Order</th><th className="p-3 font-semibold">Completed</th><th className="p-3 text-right font-semibold">Gross</th><th className="p-3 text-right font-semibold">Fee (7.5%)</th><th className="p-3 text-right font-semibold">Payout</th></tr></thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="p-3"><button className="font-semibold hover:text-brand" onClick={() => nav('/orders/' + o.id)}>{o.id}</button> <span className="text-muted">· {s.listings.find((l) => l.id === o.listingId).title}</span></td>
                <td className="p-3 text-muted">{fmtWhen(o.completedAt)}</td>
                <td className="p-3 text-right">{money2(o.total)}</td>
                <td className="p-3 text-right text-muted">−{money2(o.total * FEE_RATE)}</td>
                <td className="p-3 text-right font-semibold">{money2(o.total * (1 - FEE_RATE))}</td>
              </tr>
            ))}
            {!recent.length && <tr><td colSpan={5} className="p-6 text-center text-muted">Payouts appear here after each code swap.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function NewListing() {
  const { me, dispatch, toast, s } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ title: '', category: 'Services', kind: 'service', fulfillment: 'in-person', price: '', unit: '/hr', description: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  if (!canSell(me)) return <Gate need="Founder" title="Upgrade to post listings">Selling is part of the Founder plan ($45/month).</Gate>
  const preview = { ...f, id: 'preview', sellerId: me.id, title: f.title || 'Your listing title', price: +f.price || 0, rating: 0, reviews: 0, sales: 0 }
  const valid = f.title.trim().length >= 5 && +f.price > 0 && f.description.trim().length >= 20
  const publish = (e) => {
    e.preventDefault(); if (!valid) return
    dispatch({ type: 'createListing', listing: { ...f, sellerId: me.id, price: +f.price } })
    toast('Listing published'); nav('/sell')
  }
  return (
    <div>
      <PageHead eyebrow="New listing" title="What are you selling?" sub="Clear titles and real photos get the most views. You can edit or pause this listing any time." />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={publish} className="space-y-5">
          <Field label="Title" hint="Lead with the result, e.g. “8 edited LinkedIn headshots in 48 hours”.">
            <input id="title" value={f.title} onChange={set('title')} className={inputCls} placeholder="Custom embroidered faculty hoodie" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><select id="cat" value={f.category} onChange={set('category')} className={inputCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Type">
              <select id="kind" value={f.kind} onChange={(e) => { const k = e.target.value; setF({ ...f, kind: k, fulfillment: k === 'product' ? 'meetup' : k === 'digital' ? 'digital' : 'in-person', unit: k === 'service' ? '/hr' : k === 'digital' ? 'download' : 'each' }) }} className={inputCls}>
                <option value="product">Physical product</option><option value="service">Service</option><option value="digital">Digital product</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (CAD)"><input id="price" type="number" min="1" step="0.5" value={f.price} onChange={set('price')} className={`${inputCls} tnum`} placeholder="35" /></Field>
            <Field label="Priced per"><select id="unit" value={f.unit} onChange={set('unit')} className={inputCls}>{['each', '/hr', '/session', 'pack', 'project', 'week', 'download'].map((u) => <option key={u}>{u}</option>)}</select></Field>
            <Field label="Hand-off"><select id="ful" value={f.fulfillment} onChange={set('fulfillment')} className={inputCls}>
              <option value="meetup">Campus pick-up</option><option value="shipping">Shipping</option><option value="in-person">In person</option><option value="online">Online (Zoom)</option><option value="digital">Digital download</option>
            </select></Field>
          </div>
          <Field label="Description" hint="At least 20 characters. Say what’s included, how long it takes and where hand-offs happen.">
            <textarea id="desc" rows={5} value={f.description} onChange={set('description')} className={inputCls} placeholder="What buyers get, turnaround time, options…" />
          </Field>
          <Field label="Photos"><div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Drag photos here (coming in the full build)</div></Field>
          {+f.price > 0 && <p className="rounded-xl bg-surface2 p-3 text-sm">You’ll receive <b className="tnum">{money2(+f.price * (1 - FEE_RATE))}</b> per sale after the 7.5% Studentflow fee.</p>}
          <div className="flex gap-2"><Btn type="submit" size="lg" disabled={!valid}>Publish listing</Btn><Btn type="button" variant="ghost" size="lg" onClick={() => nav('/sell')}>Cancel</Btn></div>
        </form>
        <div><div className="sticky top-24"><div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Preview</div><div className="pointer-events-none"><ListingCard l={preview} /></div></div></div>
      </div>
    </div>
  )
}
