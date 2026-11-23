import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Pause, Play, ArrowRight } from 'lucide-react'
import { useStore, money, money2, D, orderStatus, STATUS, fmtWhen, canSell, payout, sellerFee, sellerStatus } from '../store'
import { FEES } from '../launch/lib/config'
import { sellerRate } from '../launch/lib/pricing'
import { CATEGORIES } from '../data'
import { Btn, Badge, Gate, Field, inputCls, ListingArt, Tabs } from '../ui'
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
      const p = out.find((d) => o.completedAt > d.t - D && o.completedAt <= d.t)
      if (p) { p.gross += o.total; p.orders += 1 }
    }
    out.forEach((d) => { d.net = Math.round(d.gross * (1 - sellerRate(11)) * 100) / 100 })
    return out
  }, [me.id, listings, orders, now, days])
}

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl bg-surface px-3 py-2 text-xs shadow-lg tnum">
      <div className="text-muted">{new Date(d.t).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
      <div className="mt-0.5 font-semibold">{money2(d.net)} · {d.orders} orders</div>
    </div>
  )
}

function Tile({ label, value, sub }) {
  return (
    <div className="rounded-3xl bg-surface p-5">
      <div className="text-[13px] text-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold leading-tight tnum">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted tnum">{sub}</div>}
    </div>
  )
}

function Overview({ me, s, now, nav }) {
  const [days, setDays] = useState(30)
  const series = useSeries(me, s.listings, s.orders, now, days)
  const sum = (k) => series.reduce((a, d) => a + d[k], 0)
  const imp = sum('imp'), views = sum('views'), msgs = sum('msgs'), ords = sum('orders'), gross = sum('gross'), net = sum('net')
  const pending = s.orders.filter((o) => o.sellerId === me.id && !o.outcome).sort((a, b) => a.handoffAt - b.handoffAt)
  const funnel = [['Impressions', imp], ['Listing views', views], ['Messages', msgs], ['Orders', ords]]
  return (
    <div>
      {!!pending.length && (
        <div className="mb-8">
          <h2 className="mb-2 text-[13px] font-medium text-muted">Needs your attention</h2>
          <div className="grid gap-1">
            {pending.map((o) => {
              const l = s.listings.find((x) => x.id === o.listingId); const st = orderStatus(o, now)
              return (
                <button key={o.id} onClick={() => nav('/orders/' + o.id)} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left hover:bg-brandsoft/60">
                  <Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm">{l.title} · <span className="text-muted">{s.users[o.buyerId].name}</span></span>
                  <span className="hidden text-[13px] text-muted sm:block tnum">{fmtWhen(o.handoffAt)}</span>
                  <ArrowRight size={16} className="text-muted" />
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-muted">Performance</h2>
        <div className="flex gap-1 text-[13px] font-medium">
          {[7, 30, 90].map((d) => <button key={d} onClick={() => setDays(d)} className={`rounded-full px-3 py-1 ${days === d ? 'bg-ink text-bg' : 'text-muted'}`}>{d} days</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Net revenue" value={money(Math.round(net))} sub={`${money(Math.round(gross))} gross − ${money(Math.round(gross - net))} fees`} />
        <Tile label="Orders" value={ords.toLocaleString()} sub={`Avg order ${money2(ords ? gross / ords : 0)}`} />
        <Tile label="Impressions" value={imp.toLocaleString()} sub={`${views.toLocaleString()} listing views`} />
        <Tile label="View → order" value={`${views ? (ords / views * 100).toFixed(1) : '0.0'}%`} sub={`Click-through ${imp ? (views / imp * 100).toFixed(1) : '0.0'}%`} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 rounded-3xl bg-surface p-5">
          <div className="font-medium">Net revenue per day</div>
          <div className="text-xs text-muted">After the 7.5% fee. Hover for orders and impressions.</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 700, height: 256 }}>
              <AreaChart data={series} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={tok('brand')} stopOpacity="0.22" /><stop offset="1" stopColor={tok('brand')} stopOpacity="0" /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke={tok('line')} />
                <XAxis dataKey="label" tick={{ fill: tok('muted'), fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tick={{ fill: tok('muted'), fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => '$' + v} width={52} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: tok('muted'), strokeDasharray: '3 3' }} />
                <Area isAnimationActive={false} type="monotone" dataKey="net" stroke={tok('brand')} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, stroke: tok('surface'), strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-surface p-5">
          <div className="font-medium">Conversion funnel</div>
          <div className="text-xs text-muted">From appearing in search to a completed code swap.</div>
          <div className="mt-5 space-y-4">
            {funnel.map(([k, v], i) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm"><span>{k}</span><span className="font-semibold tnum">{v.toLocaleString()} {i > 0 && <span className="font-normal text-muted">({(v / funnel[i - 1][1] * 100 || 0).toFixed(0)}%)</span>}</span></div>
                <div className="h-2.5 rounded-full bg-bg"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(1.5, v / (imp || 1) * 100)}%`, opacity: 1 - i * 0.15 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Listings({ me, s, nav, dispatch, toast }) {
  const mine = s.listings.filter((l) => l.sellerId === me.id)
  if (!mine.length) return <p className="py-16 text-center text-muted">No listings yet.</p>
  return (
    <div className="overflow-x-auto rounded-3xl bg-surface">
      <table className="w-full min-w-[760px] text-sm tnum">
        <thead><tr className="border-b border-line text-left text-xs text-muted">
          <th className="p-4 font-medium">Listing</th><th className="p-4 text-right font-medium">Price</th><th className="p-4 text-right font-medium">Impressions</th>
          <th className="p-4 text-right font-medium">Views</th><th className="p-4 text-right font-medium">CTR</th><th className="p-4 text-right font-medium">Sales</th><th className="p-4 text-right font-medium">Revenue</th><th className="p-4" />
        </tr></thead>
        <tbody>
          {mine.map((l) => (
            <tr key={l.id} className={`border-b border-line last:border-0 ${l.active ? '' : 'opacity-50'}`}>
              <td className="p-3"><button onClick={() => nav('/listing/' + l.id)} className="flex items-center gap-3 text-left">
                <ListingArt listing={l} className="h-11 w-14 shrink-0 rounded-xl" />
                <span className="font-medium hover:text-brand">{l.title}</span></button></td>
              <td className="p-4 text-right">{money(l.price)}</td>
              <td className="p-4 text-right">{l.impressions.toLocaleString()}</td>
              <td className="p-4 text-right">{l.views.toLocaleString()}</td>
              <td className="p-4 text-right">{l.impressions ? (l.views / l.impressions * 100).toFixed(1) + '%' : '–'}</td>
              <td className="p-4 text-right">{l.sales}</td>
              <td className="p-4 text-right font-semibold">{money(Math.round(l.sales * l.price * (l.id === 'l_totes' ? 20 : 1)))}</td>
              <td className="p-4 text-right"><button onClick={() => { dispatch({ type: 'toggleListing', id: l.id }); toast(l.active ? 'Paused' : 'Live') }} className="rounded-full p-2 text-muted hover:bg-bg" aria-label={l.active ? 'Pause listing' : 'Resume listing'}>{l.active ? <Pause size={15} /> : <Play size={15} />}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Payouts({ me, s, nav }) {
  const done = s.orders.filter((o) => o.sellerId === me.id && o.outcome === 'completed').sort((a, b) => b.completedAt - a.completedAt)
  const gross = done.reduce((a, o) => a + o.total, 0)
  if (!done.length) return <p className="py-16 text-center text-muted">Payouts appear after each code swap.</p>
  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Tile label="Gross sales" value={money2(gross)} />
        <Tile label="StudentFlow fees" value={money2(done.reduce((a, o) => a + sellerFee(o), 0))} sub="8% on sales 1–10, then 6%, 4% on rebooks" />
        <Tile label="Paid out" value={money2(done.reduce((a, o) => a + payout(o), 0))} />
      </div>
      <div className="overflow-x-auto rounded-3xl bg-surface">
        <table className="w-full min-w-[600px] text-sm tnum">
          <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="p-4 font-medium">Order</th><th className="p-4 font-medium">Completed</th><th className="p-4 text-right font-medium">Gross</th><th className="p-4 text-right font-medium">Fee</th><th className="p-4 text-right font-medium">Payout</th></tr></thead>
          <tbody>
            {done.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="p-4"><button className="font-medium hover:text-brand" onClick={() => nav('/orders/' + o.id)}>{o.id}</button> <span className="text-muted">· {s.listings.find((l) => l.id === o.listingId).title}</span></td>
                <td className="p-4 text-muted">{fmtWhen(o.completedAt)}</td>
                <td className="p-4 text-right">{money2(o.total)}</td>
                <td className="p-4 text-right text-muted">−{money2(sellerFee(o))} <span className="text-xs">({Math.round(o.rate * 100)}%)</span></td>
                <td className="p-4 text-right font-semibold">{money2(payout(o))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TrialBar({ st }) {
  const pct = Math.min(100, (st.sales / st.needed) * 100)
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-surface px-5 py-4 text-sm">
      {st.subscribed ? (
        <span><b>Seller plan</b> · ${st.monthly}/month · your next sale is charged {Math.round(st.nextRate * 100)}%</span>
      ) : (
        <>
          <span className="font-medium tnum">{Math.min(st.sales, st.needed)} of {st.needed} sales</span>
          <span className="h-2 w-40 overflow-hidden rounded-full bg-bg"><span className="block h-full rounded-full bg-accent" style={{ width: pct + '%' }} /></span>
          <span className="text-muted">
            {st.trialEndsAt
              ? `Tools free until ${new Date(st.trialEndsAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}, then $${st.monthly}/month.`
              : `Your tools are free until your first ${st.needed} sales (and at least 30 days).`}
          </span>
        </>
      )}
    </div>
  )
}

function Customers({ me, s }) {
  const done = s.orders.filter((o) => o.sellerId === me.id && o.outcome === 'completed')
  const byBuyer = {}
  done.forEach((o) => {
    if (!byBuyer[o.buyerId]) byBuyer[o.buyerId] = { id: o.buyerId, orders: 0, spent: 0, last: 0 }
    const b = byBuyer[o.buyerId]
    b.orders += o.qty > 1 && o.rebook ? 2 : 1
    b.spent += o.total
    b.last = Math.max(b.last, o.completedAt)
  })
  const list = Object.values(byBuyer).sort((a, b) => b.last - a.last)
  const regulars = list.filter((b) => b.orders > 1).length
  const year = new Date(s.now).getFullYear()
  const ytd = done.filter((o) => new Date(o.completedAt).getFullYear() === year)
  const fees = ytd.reduce((a, o) => a + sellerFee(o), 0)
  const earned = ytd.reduce((a, o) => a + payout(o), 0)
  const tier = Math.round(sellerRate(done.length + 1) * 100)
  return (
    <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        <div className="rounded-3xl bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <div className="font-medium">Customers</div>
            <div className="text-[13px] text-muted tnum">{regulars} regular{regulars === 1 ? '' : 's'}</div>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            Regulars who rebook here cost you less: {Math.round(FEES.repeatCustomerRate * 100)}% instead of {tier}%, and they skip the ${FEES.buyerFlatFee} Buyer Protection.
          </p>
          <div className="mt-4 grid gap-1">
            {list.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm tnum">
                <span className="min-w-0 flex-1 truncate font-medium">{s.users[b.id]?.name}</span>
                <span className="text-muted">{b.orders} order{b.orders > 1 ? 's' : ''}</span>
                <span className="w-20 text-right">{money2(b.spent)}</span>
              </div>
            ))}
            {!list.length && <p className="py-6 text-center text-sm text-muted">Customers appear after your first completed sale.</p>}
          </div>
        </div>
        <p className="px-2 text-xs text-muted">Only sales made on StudentFlow count toward reviews, badges and rankings.</p>
      </div>
      <div className="h-fit rounded-3xl bg-surface p-5">
        <div className="font-medium">Tax summary {year}</div>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-sm tnum">
          <dt className="text-muted">Sales</dt><dd>{money2(ytd.reduce((a, o) => a + o.total, 0))}</dd>
          <dt className="text-muted">StudentFlow fees</dt><dd>−{money2(fees)}</dd>
          <dt className="font-medium">Earned</dt><dd className="font-semibold">{money2(earned)}</dd>
        </dl>
        <Btn variant="outline" size="sm" className="mt-5 w-full" disabled>Download summary (coming soon)</Btn>
        <p className="mt-3 text-xs text-muted">Keep this for your tax return. Fees and supplies are usually deductible.</p>
      </div>
    </div>
  )
}

export function SellDashboard() {
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState('overview')
  if (me.role === 'expert') return <Gate need="a student" title="Selling is for students" />
  if (!canSell(me)) return <Gate title="Selling is for students" />
  const st = sellerStatus(s, me.id)
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">{me.shop || 'Your shop'}</h1>
        <Btn onClick={() => nav('/launch')}><Plus size={16} /> New listing</Btn>
      </div>
      <TrialBar st={st} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'listings', label: 'Listings' }, { id: 'payouts', label: 'Payouts' }, { id: 'customers', label: 'Customers & tax' }]} />
      {tab === 'overview' && <Overview me={me} s={s} now={now} nav={nav} />}
      {tab === 'listings' && <Listings me={me} s={s} nav={nav} dispatch={dispatch} toast={toast} />}
      {tab === 'payouts' && <Payouts me={me} s={s} nav={nav} />}
      {tab === 'customers' && <Customers me={me} s={s} />}
    </div>
  )
}

export function NewListing() {
  const { me, dispatch, toast } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ title: '', category: 'Services', kind: 'service', fulfillment: 'in-person', price: '', unit: '/hr', description: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  if (!canSell(me)) return <Gate title="Selling is for students" />
  const preview = { ...f, id: 'preview', sellerId: me.id, title: f.title || 'Title', price: +f.price || 0 }
  const valid = f.title.trim().length >= 5 && +f.price > 0 && f.description.trim().length >= 20
  const publish = (e) => {
    e.preventDefault(); if (!valid) return
    dispatch({ type: 'createListing', listing: { ...f, sellerId: me.id, price: +f.price } })
    toast('Listing published'); nav('/sell')
  }
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold">New listing</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <form onSubmit={publish} className="max-w-xl space-y-5">
          <Field label="Title"><input id="title" value={f.title} onChange={set('title')} className={inputCls} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><select id="cat" value={f.category} onChange={set('category')} className={inputCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Type">
              <select id="kind" value={f.kind} onChange={(e) => { const k = e.target.value; setF({ ...f, kind: k, fulfillment: k === 'product' ? 'meetup' : k === 'digital' ? 'digital' : 'in-person', unit: k === 'service' ? '/hr' : k === 'digital' ? 'download' : 'each' }) }} className={inputCls}>
                <option value="product">Product</option><option value="service">Service</option><option value="digital">Digital</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (CAD)"><input id="price" type="number" min="1" step="0.5" value={f.price} onChange={set('price')} className={`${inputCls} tnum`} /></Field>
            <Field label="Per"><select id="unit" value={f.unit} onChange={set('unit')} className={inputCls}>{['each', '/hr', '/session', 'pack', 'project', 'week', 'download'].map((u) => <option key={u}>{u}</option>)}</select></Field>
          </div>
          <Field label="Description"><textarea id="desc" rows={4} value={f.description} onChange={set('description')} className={inputCls} /></Field>
          <div className="flex items-center gap-4 pt-2">
            <Btn type="submit" size="lg" disabled={!valid}>Publish</Btn>
            {+f.price > 0 && <span className="text-[13px] text-muted tnum">You get {money2(+f.price * (1 - sellerRate(1)))} per sale</span>}
          </div>
        </form>
        <div className="pointer-events-none hidden lg:block"><ListingCard l={preview} /></div>
      </div>
    </div>
  )
}
