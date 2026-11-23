import React, { useState } from 'react'
import { Plus, Trash2, BadgeCheck, Star, Clock, MapPin, AlertTriangle, PartyPopper, Check } from 'lucide-react'
import { CATEGORIES, DAYS, photoFor } from './lib/categories'
import { CAMPUS, FEES, SUBSCRIPTION } from './lib/config'
import { plan } from './lib/pricing'
import { generateNow, verdict, REVIEW_REQUEST } from './lib/generators'
import { SURVEY, MOMENTS, CAMPUS_EVENTS, EXAM_WEEKS, MONTH_ONE, SAMPLE_CONTACTS } from './lib/seed'
import { categoryDefaults } from './store'
import { Choices, TextAnswer, CopyBox, QR, OutputCard, Stat, Nudge } from './ui'
import { Btn, inputCls } from '../ui'
import { money, money2, useStore } from '../store'

const opts = (...pairs) => pairs.map(([id, label, hint]) => ({ id, label, hint }))
const HOURS = { '1-2': 1.5, '3-5': 4, '6-10': 8, '10+': 12 }
const BLOCKS = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']]
export const isExplore = (L) => L.student.studyPermit === 'yes' || L.student.studyPermit === 'not_sure'
const labelOf = (list, id, other) => (id === 'other' ? other || 'Other' : list.find((x) => x.id === id)?.label || '')

/** Everything the price card needs, from the stored answers. */
export function priceModel(L) {
  const cat = L.category || 'baked_goods'
  const d = CATEGORIES[cat]
  const p = L.pricing
  const unitCost = cat === 'baked_goods'
    ? (p.ingredients.filter((i) => i.on).reduce((a, i) => a + i.cost, 0) / Math.max(1, p.batchYield)) * p.itemsPerOrder
    : p.perSessionCost
  const startup = p.startupItems.filter((i) => i.on).reduce((a, i) => a + i.cost, 0)
  const price = p.price ?? d.prices[p.positioning || 'middle']
  const r = plan({ price, unitCost: Math.round(unitCost * 100) / 100, hoursPerOrder: (p.minutesPerOrder || d.defaultMinutes) / 60, monthlyGoal: p.monthlyGoal, startupCosts: startup, hoursPerWeek: HOURS[L.student.hoursPerWeek] || 4 })
  return { cat, d, price, unitCost, startup, r, bundles: p.bundles ? d.bundles(price) : [] }
}

/** The listing as it will appear in the marketplace. */
export function buildListing(L, me, now) {
  const { cat, d, price, bundles } = priceModel(L)
  const li = L.listing
  const includes = [...li.includes.map((x) => x), ...(li.includeOther ? [li.includeOther] : [])].filter((x) => x !== 'other')
  const slot = li.availability[0]
  return {
    id: L.listingId || 'l_' + me.id.replace('u_', '') + '_launch', sellerId: me.id, title: li.hook || 'Your hook goes here', hook: li.hook,
    category: d.label, kind: cat === 'baked_goods' ? 'product' : 'service', fulfillment: cat === 'baked_goods' ? 'meetup' : 'in-person',
    price, unit: d.unit, description: `${li.hook || ''}. ${includes.length ? 'Includes ' + includes.join(', ').toLowerCase() + '.' : ''}`.trim(),
    photo: li.photo || d.photoOptions[0].id, includes, bundles, availability: li.availability, meetLocation: li.spot || 'UCC Atrium', story: li.story,
    faq: generateNow('faq', { category: cat, picked: li.faq, spot: li.spot || 'UCC Atrium', notice: noticeLabel(L.schedule.notice) }),
    allergens: cat === 'baked_goods' ? li.allergens.filter((a) => a !== 'none') : undefined, launchDeal: li.deal, moment: li.moments[0] || null,
    waiver: cat === 'fitness', rating: 0, reviews: 0, impressions: 0, views: 0, sales: 0, createdAt: now, active: true,
    nextSlot: slot ? `${slot.day}, ${slot.block}` : 'Message to book', paused: L.schedule.paused,
  }
}
const noticeLabel = (n) => ({ same_day: 'Same-day', '1_day': '1 day', '2_days': '2+ days' }[n] || '1 day')

function ideasFor(L) {
  const st = L.student
  return generateNow('ideas', { helpWith: st.helpWith, passion: st.passion, workStyle: st.workStyle, hoursPerWeek: st.hoursPerWeek, budget: st.startupBudget, major: st.major })
}

function IdeaCard({ idea, picked, onPick }) {
  const d = CATEGORIES[idea.category]
  return (
    <button type="button" onClick={onPick} aria-pressed={picked} className={`group overflow-hidden rounded-3xl border-2 text-left transition ${picked ? 'border-brand' : 'border-transparent'} bg-surface`}>
      <img src={photoFor(d.photoOptions[0].id)} alt="" className="aspect-[16/9] w-full object-cover" />
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-display text-lg font-bold">{idea.name}</div>
          <div className="shrink-0 font-display text-2xl font-bold text-brand tnum">{idea.fit}<span className="text-sm text-muted">% fit</span></div>
        </div>
        <div className="text-[13px] text-muted">{d.label}</div>
        <p className="mt-2 text-[14px]">{idea.reason}</p>
        <p className="mt-2 text-[12px] text-muted">{idea.demand}</p>
      </div>
    </button>
  )
}

function Logger({ L }) {
  const [name, setName] = useState('')
  const [resp, setResp] = useState('')
  const [quote, setQuote] = useState('')
  const log = L.validation.log
  const add = () => { if (!name || !resp) return; L.patch('validation', { log: [...log, { id: 'v' + Date.now(), contact: name, response: resp, quote }] }); setName(''); setResp(''); setQuote('') }
  const R = opts(['not_interested', 'Not interested'], ['interested', 'Interested'], ['would_pay', 'Would pay'], ['preordered', 'Pre-ordered'])
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {log.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
            <span className="min-w-0 flex-1"><b className="font-medium">{l.contact}</b>{l.quote && <span className="block truncate text-muted">“{l.quote}”</span>}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.response === 'preordered' ? 'bg-success text-white' : l.response === 'would_pay' ? 'bg-successsoft text-success' : l.response === 'interested' ? 'bg-brandsoft text-brand' : 'bg-bg text-muted'}`}>{R.find((r) => r.id === l.response).label}</span>
            <button type="button" onClick={() => L.patch('validation', { log: log.filter((x) => x.id !== l.id) })} className="text-muted hover:text-danger" aria-label={`Remove ${l.contact}`}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border-2 border-dashed border-line p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Who did you talk to?" className={`${inputCls} h-12`} aria-label="Contact name" />
        <div className="mt-3 flex flex-wrap gap-2">{R.map((r) => <button key={r.id} type="button" onClick={() => setResp(r.id)} aria-pressed={resp === r.id} className={`rounded-full px-3.5 py-2 text-[13px] font-medium ${resp === r.id ? 'bg-ink text-bg' : 'bg-surface'}`}>{r.label}</button>)}</div>
        <input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Anything they said (optional)" className={`${inputCls} mt-3 h-11`} aria-label="Quote" />
        <Btn type="button" variant="outline" size="sm" className="mt-3" onClick={add} disabled={!name || !resp}><Plus size={14} /> Add conversation</Btn>
      </div>
      {!log.length && <Btn type="button" variant="soft" size="sm" onClick={() => L.patch('validation', { log: SAMPLE_CONTACTS.map((c, i) => ({ id: 'v' + i, ...c })) })}>Demo: add 6 sample conversations</Btn>}
    </div>
  )
}

export function FeedCardPreview({ listing, me }) {
  return (
    <div className="pointer-events-none">
      <div className="relative">
        <img src={photoFor(listing.photo)} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        {listing.moment && <span className="absolute left-3 top-3 -rotate-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-white">{MOMENTS.find((m) => m.id === listing.moment)?.label}</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3"><div className="font-medium leading-snug">{listing.title}</div><div className="shrink-0 font-semibold tnum">{listing.bundles.length > 1 ? 'From ' : ''}{money(listing.price)}</div></div>
      <div className="mt-1 flex items-center gap-1 text-[13px] text-muted">{me.name.split(' ')[0]} · {me.year || '2nd'} year {me.major}<BadgeCheck size={14} className="text-brand" /></div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted"><span className="font-semibold text-accent">New</span><span className="inline-flex items-center gap-1"><Clock size={12} />{listing.nextSlot}</span><span className="inline-flex items-center gap-1"><MapPin size={12} />{listing.meetLocation}</span></div>
    </div>
  )
}

function PriceCard({ L }) {
  const { d, price, unitCost, startup, r, bundles, cat } = priceModel(L)
  const min = Math.max(5, Math.round(d.prices.affordable * 0.6)), max = Math.round(d.prices.premium * 1.6)
  const fmtN = (n) => (n === Infinity ? '—' : n)
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between"><label htmlFor="price" className="text-[13px] text-muted">Your price {d.unit}</label><span className="font-display text-4xl font-bold tnum">{money(price)}</span></div>
        <input id="price" type="range" min={min} max={max} step={cat === 'baked_goods' ? 0.5 : 1} value={price} onChange={(e) => L.patch('pricing', { price: +e.target.value })} className="mt-2 w-full accent-[rgb(var(--brand))]" />
        <div className="flex justify-between text-[11px] text-muted tnum"><span>{money(min)}</span><span>Elsewhere: {d.benchmarks[0].range}</span><span>{money(max)}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1 sm:row-span-2"><Stat hero label="You make per hour" value={money2(r.effectiveHourly)} sub={`after fees and ${money2(unitCost)} materials`} /></div>
        <Stat label="Take-home per order" value={money2(r.sellerTakeHome)} sub={`after ${Math.round(r.rate * 100)}% fee`} />
        <Stat label="Profit per order" value={money2(r.profitPerOrder)} />
        <Stat label={`Orders for ${money(L.pricing.monthlyGoal)}/mo`} value={fmtN(r.ordersForGoal)} sub={`${fmtN(r.hoursForGoal)} hrs a month`} />
        <Stat label="Pays back start-up in" value={r.paybackOrders === 0 ? '—' : `${fmtN(r.paybackOrders)} orders`} sub={startup ? `${money2(startup)} to start` : 'Nothing to buy'} />
      </div>
      {r.warnings.belowMinWage && <Nudge>That works out under Ontario’s minimum wage ({money2(CAMPUS.minimumWage)}/hr). Try a higher price, a bundle, or a faster process.</Nudge>}
      {r.warnings.overHours && <Nudge>Your goal needs about {fmtN(r.hoursForGoal)} hours a month, but you said you have about {r.hoursAvailablePerMonth}. Try a lower goal or a higher price.</Nudge>}
      {!!bundles.length && <div className="flex flex-wrap gap-2 text-[13px]">{bundles.map((b) => <span key={b.name} className="rounded-full bg-bg px-3 py-1.5 tnum"><b className="font-medium">{b.name}</b> · {money2(b.price)}</span>)}</div>}
      <p className="text-[13px] text-muted">Students selling similar things here earn roughly {money(d.earnRange[0])}–{money(d.earnRange[1])} a month, depending on hours and price. Estimates only.</p>
    </div>
  )
}

function AvailabilityGrid({ L }) {
  const av = L.listing.availability
  const on = (day, block) => av.some((a) => a.day === day && a.block === block)
  const toggle = (day, block) => L.patch('listing', { availability: on(day, block) ? av.filter((a) => !(a.day === day && a.block === block)) : [...av, { day, block }] })
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[340px] border-separate border-spacing-1 text-xs">
        <thead><tr><th />{DAYS.map((d) => <th key={d} className="font-medium text-muted">{d}</th>)}</tr></thead>
        <tbody>{BLOCKS.map(([b, label]) => (
          <tr key={b}><td className="pr-1 text-muted">{label}</td>{DAYS.map((d) => (
            <td key={d}><button type="button" onClick={() => toggle(d, b)} aria-pressed={on(d, b)} aria-label={`${d} ${label}`} className={`h-11 w-full rounded-xl transition ${on(d, b) ? 'bg-brand' : 'bg-surface hover:bg-brandsoft'}`} /></td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  )
}

const checklist = (L, listing) => [
  ['Hero photo chosen', !!L.listing.photo], ['Price clear', listing.price > 0], ['Availability set', L.listing.availability.length > 0],
  ['Story filled', !!L.listing.story], ['FAQ added', L.listing.faq.length > 0], ['Compliance done', L.listing.complianceOk],
]

// ---------------------------------------------------------------------------
const OLD = [
  {
    n: 0, title: 'Welcome', gets: 'Your profile', blurb: 'Tell us who you are.',
    steps: [
      { q: 'What’s your name?', ok: (L) => !!L.student.name.trim(), body: (L) => <TextAnswer id="name" value={L.student.name} onChange={(v) => L.patch('student', { name: v })} placeholder="First name" /> },
      { q: 'What school do you go to?', ok: (L) => !!L.student.school, body: (L) => <Choices name="School" options={opts(['Western University', 'Western University', 'London, Ontario'])} value={L.student.school} onChange={(v) => L.patch('student', { school: v })} /> },
      { q: 'What year are you in?', ok: (L) => !!L.student.year, body: (L) => <Choices name="Year" columns={2} options={opts(['1st', '1st year'], ['2nd', '2nd year'], ['3rd', '3rd year'], ['4th', '4th year'], ['Grad', 'Grad student'])} value={L.student.year} onChange={(v) => L.patch('student', { year: v })} /> },
      { q: 'Are you in Canada on a study permit?', hint: 'We ask because study permits have rules about self-employment.', ok: (L) => !!L.student.studyPermit, body: (L) => <Choices name="Study permit" options={opts(['yes', 'Yes'], ['no', 'No'], ['not_sure', 'Not sure'])} value={L.student.studyPermit} onChange={(v) => L.patch('student', { studyPermit: v })} /> },
    ],
    output: ({ L }) => (
      <OutputCard eyebrow="You’re set up" title={`Nice to meet you, ${L.student.name || 'there'}.`}>
        <p className="text-muted">{L.student.year} year at {L.student.school}. Next, we’ll find an idea that fits the skills you already have.</p>
        {isExplore(L) && <div className="mt-5"><Nudge tone="info"><b>You’re in explore mode.</b> Study permits often limit self-employment. Before you sell, check with {CAMPUS.internationalOffice}. You can still try every stage here; publishing stays off until you’ve checked.</Nudge></div>}
      </OutputCard>
    ),
    next: 'Find my idea',
  },
  {
    n: 1, title: 'Pick', gets: 'Your best-fit idea', blurb: 'Find an idea that fits your skills and time.',
    steps: [
      { q: 'What do friends usually ask you for help with?', hint: 'Pick all that apply.', ok: (L) => L.student.helpWith.length > 0, body: (L) => <Choices name="Help with" multi options={opts(['class', 'Explaining a class'], ['workouts', 'Workouts or sports'], ['baking', 'Baking or cooking'])} value={L.student.helpWith} onChange={(v) => L.patch('student', { helpWith: v })} other={L.student.helpOther} onOther={(v) => L.patch('student', { helpOther: v })} /> },
      { q: 'What could you talk about for an hour without getting bored?', ok: (L) => !!L.student.passion.trim(), body: (L) => <TextAnswer id="passion" value={L.student.passion} onChange={(v) => L.patch('student', { passion: v })} placeholder="e.g. Organic chemistry, marathon training, sourdough" /> },
      { q: 'Which sounds most like you?', ok: (L) => !!L.student.workStyle, body: (L) => <Choices name="Work style" options={opts(['making', 'Making things'], ['teaching', 'Teaching or explaining'], ['coaching', 'Coaching people in person'])} value={L.student.workStyle} onChange={(v) => L.patch('student', { workStyle: v })} /> },
      { q: 'Realistically, how many hours a week could you give this in a normal week?', ok: (L) => !!L.student.hoursPerWeek, body: (L) => <Choices name="Hours" columns={2} options={opts(['1-2', '1–2 hours'], ['3-5', '3–5 hours'], ['6-10', '6–10 hours'], ['10+', '10+ hours'])} value={L.student.hoursPerWeek} onChange={(v) => L.patch('student', { hoursPerWeek: v })} /> },
      { q: 'And during finals?', ok: (L) => !!L.student.hoursFinals, body: (L) => <Choices name="Finals hours" columns={2} options={opts(['0', 'None'], ['1-2', '1–2 hours'], ['3-5', '3–5 hours'], ['same', 'Same as normal'])} value={L.student.hoursFinals} onChange={(v) => L.patch('student', { hoursFinals: v })} /> },
      { q: 'How much could you spend to get started?', ok: (L) => !!L.student.startupBudget, body: (L) => <Choices name="Budget" columns={2} options={opts(['0', '$0'], ['under50', 'Under $50'], ['under200', 'Under $200'], ['more', 'More'])} value={L.student.startupBudget} onChange={(v) => L.patch('student', { startupBudget: v })} /> },
    ],
    preview: (L) => L.student.helpWith.length ? (() => { const top = ideasFor(L)[0]; return <div><div className="text-[13px] text-muted">Looking promising</div><div className="mt-1 font-display text-lg font-bold">{top.name}</div><div className="text-[13px] text-brand tnum">{top.fit}% fit so far</div></div> })() : null,
    onEnterOutput: (L) => { const ideas = ideasFor(L); L.set({ ideas, ideaId: L.ideaId && ideas.some((i) => i.id === L.ideaId) ? L.ideaId : ideas[0].id, category: L.category || ideas[0].category }) },
    output: ({ L }) => {
      const ideas = L.ideas.length ? L.ideas : ideasFor(L)
      const pick = (i) => L.set({ ideaId: i.id, category: i.category, pricing: { ...L.pricing, ...categoryDefaults(i.category), price: undefined } })
      return (
        <OutputCard eyebrow="Your ideas" title="Here’s what fits you best">
          <p className="-mt-2 mb-5 text-[14px] text-muted">Top requests on campus ({SURVEY.respondents} students surveyed): {SURVEY.top.map((t) => `${t.label} ${t.pct}%`).join(' · ')}</p>
          <div className="grid gap-4 md:grid-cols-3">{ideas.map((i) => <IdeaCard key={i.id} idea={i} picked={L.ideaId === i.id} onPick={() => pick(i)} />)}</div>
        </OutputCard>
      )
    },
    next: 'Check if people want this', canNext: (L) => !!L.ideaId,
  },
  {
    n: 2, title: 'Validate', gets: 'A demand verdict', blurb: 'Check people want it before you build it.',
    steps: [
      { q: 'Who exactly would buy this? Pick one group.', ok: (L) => !!L.validation.target, body: (L, d) => (
        <>
          <Choices name="Target" options={d.targets} value={L.validation.target} onChange={(v) => L.patch('validation', { target: v })} other={L.validation.targetOther} onOther={(v) => L.patch('validation', { targetOther: v })} />
          {L.validation.target === 'students_in_a_specific_class' && <input value={L.validation.targetClass} onChange={(e) => L.patch('validation', { targetClass: e.target.value })} placeholder="Which class? e.g. CHEM 1301" className={`${inputCls} mt-3 h-12`} aria-label="Class" />}
        </>
      ) },
      { q: 'What do they do right now instead?', ok: (L) => !!L.validation.alternative, body: (L, d) => <Choices name="Alternative" options={d.alternatives} value={L.validation.alternative} onChange={(v) => L.patch('validation', { alternative: v })} other={L.validation.alternativeOther} onOther={(v) => L.patch('validation', { alternativeOther: v })} /> },
      { q: 'Why would someone pick you over that?', hint: 'Pick all that are true.', ok: (L) => L.validation.differentiators.length > 0, body: (L, d) => <Choices name="Why you" multi options={d.differentiators} value={L.validation.differentiators} onChange={(v) => L.patch('validation', { differentiators: v })} other={L.validation.diffOther} onOther={(v) => L.patch('validation', { diffOther: v })} /> },
      { q: 'Your outreach kit', hint: 'Send the message to 5–10 people, then ask these questions.', ok: () => true, body: (L, d) => {
        const target = L.validation.target === 'students_in_a_specific_class' && L.validation.targetClass ? `${L.validation.targetClass} students` : labelOf(d.targets, L.validation.target, L.validation.targetOther)
        const edge = labelOf(d.differentiators, L.validation.differentiators[0], L.validation.diffOther)
        return (
          <div className="space-y-5">
            <div><div className="mb-2 text-[13px] font-semibold">Message to send</div><CopyBox text={generateNow('dm', { category: L.category, target, name: L.student.name || 'Maya', edge })} label="Copy message" /></div>
            <div><div className="mb-2 text-[13px] font-semibold">5 questions to ask</div>
              <CopyBox text={generateNow('interviewQuestions', { category: L.category, target }).map((q, i) => `${i + 1}. ${q}`).join('\n')} label="Copy questions" />
              <p className="mt-2 text-[13px] text-muted">These ask what people already did, not what they might do. “Would you buy this?” gets polite yeses; past behaviour shows real demand.</p>
            </div>
          </div>
        )
      } },
      { q: 'Who did you talk to?', hint: 'Log each conversation. Pre-orders count most.', ok: (L) => L.validation.log.length > 0, body: (L) => <Logger L={L} /> },
    ],
    preview: (L) => { if (!L.validation.log.length) return null; const v = verdict(L.validation.log); return <div><div className="text-[13px] text-muted">So far</div><div className="mt-1 font-display text-lg font-bold">{v.pre} pre-orders · {v.pay} would pay</div><div className="text-[13px] capitalize text-brand">Leaning {v.verdict}</div></div> },
    output: ({ L, go }) => {
      const v = verdict(L.validation.log)
      const head = { go: 'Go: people want this', tweak: 'Tweak: interest, but not enough money yet', rethink: 'Rethink: not much demand here' }[v.verdict]
      return (
        <OutputCard eyebrow="Demand check" title={head}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat hero={v.pre > 0} label="Pre-ordered" value={v.pre} /><Stat label="Would pay" value={v.pay} /><Stat label="Interested" value={v.interested} /><Stat label="Not interested" value={v.no} />
          </div>
          <p className="mt-5 text-[14px] text-muted">A pre-order counts about 8 times as much as “interested”, because it means someone already committed money. Go needs 2+ pre-orders or 4+ people who would pay.</p>
          {v.verdict === 'tweak' && <div className="mt-4"><Nudge tone="info">Try a narrower group or a different offer, then talk to 5 more people.</Nudge></div>}
          {v.verdict === 'rethink' && <div className="mt-4"><Nudge>Most people passed. Go back to your ideas and try your second pick. <button type="button" className="font-semibold text-brand" onClick={() => go(1)}>Back to ideas</button></Nudge></div>}
        </OutputCard>
      )
    },
    next: 'Set my price',
  },
  {
    n: 3, title: 'Price', gets: 'Your price and hourly pay', blurb: 'Set a price that’s worth your time.',
    steps: [
      { q: (L) => (L.category === 'baked_goods' ? 'What do you need for one batch?' : 'Do you spend anything per session?'), hint: (L, d) => (L.category === 'baked_goods' ? 'Typical prices are filled in. Edit anything.' : d.perSessionHint), ok: () => true, body: (L) => L.category === 'baked_goods' ? (
        <div className="space-y-3">
          {L.pricing.ingredients.map((ing, i) => (
            <div key={ing.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-2.5">
              <input type="checkbox" checked={ing.on} onChange={(e) => L.patch('pricing', { ingredients: L.pricing.ingredients.map((x, k) => (k === i ? { ...x, on: e.target.checked } : x)) })} className="h-5 w-5 accent-[rgb(var(--brand))]" aria-label={ing.name} />
              <span className="flex-1 text-[15px]">{ing.name}</span>
              <span className="text-muted">$</span><input type="number" step="0.1" min="0" value={ing.cost} onChange={(e) => L.patch('pricing', { ingredients: L.pricing.ingredients.map((x, k) => (k === i ? { ...x, cost: +e.target.value } : x)) })} className={`${inputCls} h-10 w-20 tnum`} aria-label={`${ing.name} cost`} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[13px] font-medium">How many does one batch make?<input type="number" min="1" value={L.pricing.batchYield} onChange={(e) => L.patch('pricing', { batchYield: +e.target.value || 1 })} className={`${inputCls} mt-1 h-12 tnum`} /></label>
            <label className="text-[13px] font-medium">How many in one order?<input type="number" min="1" value={L.pricing.itemsPerOrder} onChange={(e) => L.patch('pricing', { itemsPerOrder: +e.target.value || 1 })} className={`${inputCls} mt-1 h-12 tnum`} /></label>
          </div>
          <p className="text-[13px] text-muted tnum">That’s {money2(priceModel(L).unitCost / L.pricing.itemsPerOrder)} per cookie and {money2(priceModel(L).unitCost)} per order.</p>
        </div>
      ) : (
        <label className="block text-[13px] font-medium">Per session, in dollars<input type="number" min="0" step="0.5" value={L.pricing.perSessionCost} onChange={(e) => L.patch('pricing', { perSessionCost: +e.target.value })} className={`${inputCls} mt-1 h-14 text-[16px] tnum`} autoFocus /></label>
      ) },
      { q: 'How long does one order take from start to finish?', hint: (L, d) => `Include prep, cleanup and walking to meet. ${d.timeHint}`, ok: () => true, body: (L, d) => {
        const m = L.pricing.minutesPerOrder || d.defaultMinutes
        return <div><div className="font-display text-5xl font-bold tnum">{m} <span className="text-xl text-muted">min</span></div><input type="range" min="15" max="180" step="5" value={m} onChange={(e) => L.patch('pricing', { minutesPerOrder: +e.target.value })} className="mt-4 w-full accent-[rgb(var(--brand))]" aria-label="Minutes per order" /></div>
      } },
      { q: 'Anything you need to buy once to get started?', ok: () => true, body: (L) => (
        <div className="space-y-2">{L.pricing.startupItems.map((it, i) => (
          <div key={it.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-2.5">
            <input type="checkbox" checked={it.on} onChange={(e) => L.patch('pricing', { startupItems: L.pricing.startupItems.map((x, k) => (k === i ? { ...x, on: e.target.checked } : x)) })} className="h-5 w-5 accent-[rgb(var(--brand))]" aria-label={it.name} />
            <span className="flex-1 text-[15px]">{it.name}</span><span className="text-muted">$</span>
            <input type="number" min="0" value={it.cost} onChange={(e) => L.patch('pricing', { startupItems: L.pricing.startupItems.map((x, k) => (k === i ? { ...x, cost: +e.target.value } : x)) })} className={`${inputCls} h-10 w-20 tnum`} aria-label={`${it.name} cost`} />
          </div>
        ))}<p className="pt-1 text-[13px] text-muted tnum">Start-up total: {money2(priceModel(L).startup)}</p></div>
      ) },
      { q: 'What would they pay somewhere else?', hint: 'Here’s what we see near campus. Edit if you know better.', ok: () => true, body: (L, d) => (
        <div className="space-y-3">
          {d.benchmarks.map((b) => <div key={b.label} className="flex justify-between rounded-2xl bg-surface px-4 py-3 text-[15px]"><span>{b.label}</span><span className="font-semibold tnum">{b.range}</span></div>)}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="text-[13px] font-medium">Low end ($)<input type="number" value={L.pricing.benchmarkLow} onChange={(e) => L.patch('pricing', { benchmarkLow: +e.target.value })} className={`${inputCls} mt-1 h-12 tnum`} /></label>
            <label className="text-[13px] font-medium">High end ($)<input type="number" value={L.pricing.benchmarkHigh} onChange={(e) => L.patch('pricing', { benchmarkHigh: +e.target.value })} className={`${inputCls} mt-1 h-12 tnum`} /></label>
          </div>
        </div>
      ) },
      { q: 'Where do you want to sit?', ok: (L) => !!L.pricing.positioning, body: (L, d) => <Choices name="Positioning" options={opts(['affordable', `Affordable · ${money(d.prices.affordable)}`, 'More customers, thinner margins, more hours'], ['middle', `Middle · ${money(d.prices.middle)}`, 'The usual starting point'], ['premium', `Premium · ${money(d.prices.premium)}`, 'Fewer customers, higher expectations; photos and reviews matter more'])} value={L.pricing.positioning} onChange={(v) => L.patch('pricing', { positioning: v, price: d.prices[v] })} /> },
      { q: 'How much would you like to make per month?', ok: (L) => L.pricing.monthlyGoal > 0, body: (L) => (
        <div>
          <Choices name="Goal" columns={2} options={opts(['100', '$100'], ['250', '$250'], ['500', '$500'], ['custom', 'Custom'])} value={L.pricing.goalCustom ? 'custom' : String(L.pricing.monthlyGoal)} onChange={(v) => (v === 'custom' ? L.patch('pricing', { goalCustom: String(L.pricing.monthlyGoal) }) : L.patch('pricing', { monthlyGoal: +v, goalCustom: '' }))} />
          {L.pricing.goalCustom !== '' && <input type="number" min="10" value={L.pricing.goalCustom} onChange={(e) => L.patch('pricing', { goalCustom: e.target.value, monthlyGoal: +e.target.value || 0 })} className={`${inputCls} mt-3 h-12 tnum`} aria-label="Custom monthly goal" />}
        </div>
      ) },
      { q: (L, d) => d.bundleLabel, ok: () => true, body: (L, d) => { const { price } = priceModel(L); return <Choices name="Bundles" options={opts(['yes', 'Yes', d.bundles(price).map((b) => `${b.name} at ${money2(b.price)}`).join(' · ')], ['no', 'Not now'])} value={L.pricing.bundles ? 'yes' : 'no'} onChange={(v) => L.patch('pricing', { bundles: v === 'yes' })} /> } },
    ],
    preview: (L) => { if (!L.category) return null; const { price, r } = priceModel(L); return <div><div className="text-[13px] text-muted">At {money(price)}</div><div className="mt-1 font-display text-2xl font-bold tnum">{money2(r.effectiveHourly)}/hr</div><div className="text-[13px] text-muted tnum">{money2(r.sellerTakeHome)} take-home per order</div></div> },
    output: ({ L }) => <OutputCard eyebrow="Your price" title="Drag the price and watch your pay change"><PriceCard L={L} /></OutputCard>,
    next: 'Build my listing',
  },
  {
    n: 4, title: 'Listing', gets: 'A live listing', blurb: 'Build a listing that looks pro in minutes.',
    steps: [
      { q: 'Finish this sentence: I help ___ ___.', hint: 'Tap a suggestion or write your own.', ok: (L) => !!L.listing.hook.trim(), body: (L, d) => {
        const t = L.validation.target === 'students_in_a_specific_class' && L.validation.targetClass ? `${L.validation.targetClass} students` : labelOf(d.targets, L.validation.target, L.validation.targetOther) || 'students'
        return <div className="space-y-3">{generateNow('hooks', { category: L.category, target: t }).map((h) => <button key={h} type="button" onClick={() => L.patch('listing', { hook: h })} className={`block w-full rounded-2xl border-2 px-4 py-3 text-left text-[15px] ${L.listing.hook === h ? 'border-brand bg-brandsoft/70' : 'border-line bg-surface'}`}>{h}</button>)}<TextAnswer value={L.listing.hook} onChange={(v) => L.patch('listing', { hook: v })} placeholder="Or write your own" /></div>
      } },
      { q: 'What’s the one photo that would make someone say “I want that”?', hint: (L, d) => `Shot list: ${d.shotList.join(' · ')}. Natural light, plain background.`, ok: (L) => !!L.listing.photo, body: (L, d) => (
        <div className="grid grid-cols-2 gap-3">{d.photoOptions.map((p) => (
          <button key={p.id} type="button" onClick={() => L.patch('listing', { photo: p.id })} aria-pressed={L.listing.photo === p.id} className={`overflow-hidden rounded-2xl border-4 text-left ${L.listing.photo === p.id ? 'border-brand' : 'border-transparent'}`}>
            <img src={photoFor(p.id)} alt="" className="aspect-[4/3] w-full object-cover" /><span className="block bg-surface px-3 py-2 text-[13px]">{p.label}</span>
          </button>
        ))}</div>
      ) },
      { q: 'What’s included?', ok: (L) => L.listing.includes.length > 0, body: (L, d) => <Choices name="Includes" multi columns={2} options={d.includes.map((x) => ({ id: x, label: x }))} value={L.listing.includes} onChange={(v) => L.patch('listing', { includes: v })} other={L.listing.includeOther} onOther={(v) => L.patch('listing', { includeOther: v })} /> },
      { q: 'What do people ask before buying?', hint: 'We’ll write the answers.', ok: (L) => L.listing.faq.length > 0, body: (L, d) => <Choices name="FAQ" multi max={3} options={d.faq.map((f) => ({ id: f.q, label: f.q }))} value={L.listing.faq} onChange={(v) => L.patch('listing', { faq: v })} /> },
      { q: 'When can you usually meet?', hint: 'Tap the times that work most weeks.', ok: (L) => L.listing.availability.length > 0, body: (L) => <AvailabilityGrid L={L} /> },
      { q: 'Where on campus?', ok: (L) => !!L.listing.spot, body: (L) => <Choices name="Spot" columns={2} options={CAMPUS.spots.map((x) => ({ id: x, label: x }))} value={L.listing.spot} onChange={(v) => L.patch('listing', { spot: v })} /> },
      { q: 'Tell people who you are in one line.', ok: (L) => !!L.listing.story.trim(), body: (L) => {
        const sug = generateNow('story', { name: L.student.name, year: L.student.year || '2nd', major: L.student.major || 'Western', category: L.category, passion: L.student.passion })
        return <div className="space-y-3"><button type="button" onClick={() => L.patch('listing', { story: sug })} className="block w-full rounded-2xl border-2 border-dashed border-line px-4 py-3 text-left text-[15px] text-muted hover:border-brand">Use: “{sug}”</button><TextAnswer multiline value={L.listing.story} onChange={(v) => L.patch('listing', { story: v })} placeholder="Year, major, and why you do this" /></div>
      } },
      { q: 'Want a launch deal for your first 5 customers?', ok: (L) => !!L.listing.deal, body: (L) => <Choices name="Deal" options={opts(['ten_off', '10% off'], ['free_extra', 'A free extra'], ['none', 'No deal'])} value={L.listing.deal} onChange={(v) => L.patch('listing', { deal: v })} /> },
      { q: (L) => ({ baked_goods: 'Allergens and food rules', tutoring: 'Academic integrity', fitness: 'Where will sessions happen?' }[L.category]), hint: 'Required before you publish.', ok: (L) => L.listing.complianceOk, body: (L) => (
        <div className="space-y-4">
          {L.category === 'baked_goods' && <Choices name="Allergens" multi columns={2} options={opts(['wheat', 'Wheat'], ['dairy', 'Dairy'], ['eggs', 'Eggs'], ['nuts', 'Nuts'], ['soy', 'Soy'], ['none', 'None'])} value={L.listing.allergens} onChange={(v) => L.patch('listing', { allergens: v })} />}
          {L.category === 'fitness' && <><Choices name="Session place" columns={2} options={opts(['Western Rec Centre', 'Western Rec Centre'], ['TD Stadium field', 'TD Stadium field'], ['Outdoors', 'Outdoors / park'], ['Online', 'Online'])} value={L.listing.sessionPlace} onChange={(v) => L.patch('listing', { sessionPlace: v })} /><p className="text-[13px] text-muted">Buyers sign a waiver at booking. Your listing will show “Waiver included”.</p></>}
          <label className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3.5 text-[15px]">
            <input type="checkbox" checked={L.listing.complianceOk} onChange={(e) => L.patch('listing', { complianceOk: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--brand))]" />
            <span>{{ baked_goods: 'I’ve checked Ontario’s rules for selling food made at home and Western’s food sale policy.', tutoring: 'I’ll help students learn and practise. I won’t complete graded work or take exams for anyone.', fitness: 'The location allows outside coaching, or I have permission to train clients there.' }[L.category]}</span>
          </label>
          {L.category === 'baked_goods' && <p className="text-[13px] text-muted">Rules for home food businesses are set by Ontario and your local health unit. Link to guidance coming soon.</p>}
        </div>
      ) },
      { q: 'Tag it with a campus moment?', hint: 'Optional. Moments get featured in the feed.', ok: () => true, body: (L) => <Choices name="Moments" multi columns={2} options={MOMENTS.map((m) => ({ id: m.id, label: m.label, hint: m.date }))} value={L.listing.moments} onChange={(v) => L.patch('listing', { moments: v })} /> },
    ],
    preview: (L, me, now) => (L.listing.hook || L.listing.photo ? <FeedCardPreview listing={buildListing(L, me, now)} me={me} /> : null),
    output: ({ L, me, now, publish, published }) => {
      const listing = buildListing(L, me, now)
      const checks = checklist(L, listing)
      const explore = isExplore(L)
      return (
        <OutputCard eyebrow="Your listing" title={published ? 'Your listing is live' : 'Here’s how it looks'}>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div><div className="mb-2 text-[12px] font-semibold text-muted">In the feed</div><FeedCardPreview listing={listing} me={me} /></div>
            <div className="min-w-0 rounded-2xl bg-bg p-5">
              <div className="mb-2 text-[12px] font-semibold text-muted">Full page</div>
              <div className="font-display text-xl font-bold">{listing.title}</div>
              <div className="mt-1 text-[13px] text-muted tnum">{listing.bundles.map((b) => `${b.name} ${money2(b.price)}`).join(' · ') || money2(listing.price)}{listing.launchDeal === 'ten_off' ? ' · 10% off for first 5' : listing.launchDeal === 'free_extra' ? ' · free extra for first 5' : ''}</div>
              <p className="mt-3 text-[14px]">{listing.story}</p>
              {!!listing.includes.length && <div className="mt-3 flex flex-wrap gap-1.5">{listing.includes.map((x) => <span key={x} className="rounded-full bg-surface px-2.5 py-0.5 text-[12px]">{x}</span>)}</div>}
              {listing.allergens?.length > 0 && <p className="mt-3 text-[13px]"><b>Contains:</b> {listing.allergens.join(', ')}</p>}
              {listing.waiver && <p className="mt-3 text-[13px]">Waiver included</p>}
              <div className="mt-3 space-y-2">{listing.faq.map((f) => <div key={f.q} className="text-[13px]"><b className="font-medium">{f.q}</b> <span className="text-muted">{f.a}</span></div>)}</div>
            </div>
          </div>
          <ul className="mt-6 grid gap-2 sm:grid-cols-3">{checks.map(([k, ok]) => <li key={k} className="flex items-center gap-2 text-[14px]"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${ok ? 'bg-success text-white' : 'bg-warnsoft text-warn'}`}>{ok ? <Check size={12} strokeWidth={3} /> : '!'}</span>{k}</li>)}</ul>
          {explore && <div className="mt-5"><Nudge tone="info">You’re in explore mode. Check with {CAMPUS.internationalOffice} about your study permit before publishing.</Nudge></div>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Btn size="lg" onClick={publish} disabled={explore || !L.listing.complianceOk}>{published ? 'Update listing' : 'Publish listing'}</Btn>
            {!L.listing.complianceOk && <span className="text-[13px] text-muted">Finish the compliance step to publish.</span>}
          </div>
        </OutputCard>
      )
    },
    next: 'Find my first 10 customers', canNext: (L) => !!L.listingId,
  },
  {
    n: 5, title: 'First 10 customers', gets: 'A 2-week launch plan', blurb: 'Get your first sales from people you know.',
    steps: [
      { q: 'Which groups are you part of?', hint: 'Add names so your messages are ready to send.', ok: (L) => L.launch.groups.length > 0, body: (L) => (
        <div className="space-y-3">
          <Choices name="Groups" multi columns={2} options={opts(['clubs', 'Clubs'], ['team', 'Sports team'], ['dorm', 'Dorm floor'], ['classes', 'Classes'], ['greek', 'Greek life'], ['chats', 'Group chats'])} value={L.launch.groups} onChange={(v) => L.patch('launch', { groups: v })} />
          {L.launch.groups.map((g) => <input key={g} value={L.launch.groupNames[g] || ''} onChange={(e) => L.patch('launch', { groupNames: { ...L.launch.groupNames, [g]: e.target.value } })} placeholder={`Name of your ${g === 'dorm' ? 'floor' : g.replace(/s$/, '')}`} className={`${inputCls} h-12`} aria-label={`${g} name`} />)}
        </div>
      ) },
      { q: 'Name 5 people who’d probably try this first.', hint: 'We filled in anyone who said they’d pay.', ok: (L) => L.launch.people.some((p) => p.trim()), body: (L) => {
        const fans = L.validation.log.filter((l) => l.response === 'preordered' || l.response === 'would_pay').map((l) => l.contact.split(' (')[0])
        const people = L.launch.people.every((p) => !p) && fans.length ? [...fans, '', '', '', '', ''].slice(0, 5) : L.launch.people
        return <div className="space-y-2">{people.map((p, i) => <input key={i} value={p} onChange={(e) => L.patch('launch', { people: people.map((x, k) => (k === i ? e.target.value : x)) })} placeholder={`Person ${i + 1}`} className={`${inputCls} h-12`} aria-label={`Person ${i + 1}`} />)}</div>
      } },
      { q: 'How comfortable are you posting about this?', ok: (L) => !!L.launch.comfort, body: (L) => <Choices name="Comfort" options={opts(['not_at_all', 'Not at all', 'We’ll stick to 1:1 messages and referrals'], ['close_friends', 'Close friends only'], ['anywhere', 'Anywhere'])} value={L.launch.comfort} onChange={(v) => L.patch('launch', { comfort: v })} /> },
      { q: 'Any campus events coming up?', hint: 'Pick the ones worth planning around.', ok: () => true, body: (L) => <Choices name="Events" multi options={CAMPUS_EVENTS.map((e) => ({ id: e.id, label: e.name, hint: e.when }))} value={L.launch.events} onChange={(v) => L.patch('launch', { events: v })} /> },
    ],
    output: ({ L, me, s, simulateSale }) => {
      const listing = s.listings.find((l) => l.id === L.listingId)
      const link = `studentflow.ca/l/${(L.listingId || 'your-listing').replace('l_', '')}`
      const steps = generateNow('launchPlan', { category: L.category, comfort: L.launch.comfort || 'close_friends', groups: L.launch.groups.map((g) => ({ type: g, name: L.launch.groupNames[g] || g })), people: L.launch.people, price: listing?.price || priceModel(L).price, title: listing?.title || L.listing.hook, link })
      const sales = s.orders.filter((o) => o.sellerId === me.id && o.outcome === 'completed').length
      const need = FEES.trialEndsAfterSales
      return (
        <OutputCard eyebrow="Your launch plan" title="Two weeks to your first 10 customers">
          <div className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl bg-bg p-4">
            <QR text={'https://' + link} size={104} />
            <div className="min-w-0 flex-1"><div className="text-[13px] text-muted">Share link</div><div className="truncate font-medium">{link}</div><p className="mt-1 text-[13px] text-muted">Print the QR code for a flyer or put it on your boxes.</p></div>
          </div>
          <ol className="space-y-4">{steps.map((st, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[64px_1fr]">
              <div className="font-display text-sm font-bold text-accent">Day {st.day}</div>
              <div><div className="font-medium">{st.title} <span className="text-[12px] font-normal text-muted">· {st.channel}</span></div><div className="mt-2"><CopyBox text={st.message} /></div></div>
            </li>
          ))}</ol>
          <div className={`mt-8 rounded-2xl p-5 ${sales >= need ? 'bg-successsoft' : 'bg-accentsoft'}`}>
            {sales >= need ? (
              <div className="flex items-start gap-3"><PartyPopper size={28} className="shrink-0 text-accent" /><div><div className="font-display text-xl font-bold">{need} sales. You’re officially in business!</div><p className="mt-1 text-[14px]">Your tools stay free for at least 30 days from when you listed; after that it’s ${SUBSCRIPTION.monthly}/month. Your next sales are charged 8% until sale 10, then 6%.</p></div></div>
            ) : (
              <>
                <div className="flex items-baseline justify-between"><div className="font-medium tnum">{sales} of {need} sales</div><div className="text-[13px] text-muted">Your tools are free until your first {need} sales.</div></div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(sales / need) * 100}%` }} /></div>
                {listing && <Btn size="sm" variant="outline" className="mt-4" onClick={simulateSale}>Demo: simulate a sale</Btn>}
              </>
            )}
          </div>
        </OutputCard>
      )
    },
    next: 'Plan it around school',
  },
  {
    n: 6, title: 'Run it with school', gets: 'A weekly schedule', blurb: 'Fit it around classes and exams.',
    steps: [
      { q: 'When are your exam weeks?', hint: 'Filled in from Western’s academic calendar.', ok: () => true, body: (L) => <Choices name="Exam weeks" multi options={EXAM_WEEKS.map((w) => ({ id: w.id, label: w.label }))} value={L.schedule.examWeeks} onChange={(v) => L.patch('schedule', { examWeeks: v })} /> },
      { q: 'How many orders a week could you handle before it gets stressful?', ok: () => true, body: (L) => <div><div className="font-display text-5xl font-bold tnum">{L.schedule.capacity}<span className="text-xl text-muted"> a week</span></div><input type="range" min="1" max="25" value={L.schedule.capacity} onChange={(e) => L.patch('schedule', { capacity: +e.target.value })} className="mt-4 w-full accent-[rgb(var(--brand))]" aria-label="Orders per week" /></div> },
      { q: 'How much notice do you need for an order?', ok: (L) => !!L.schedule.notice, body: (L) => <Choices name="Notice" options={opts(['same_day', 'Same day'], ['1_day', '1 day'], ['2_days', '2+ days'])} value={L.schedule.notice} onChange={(v) => L.patch('schedule', { notice: v })} /> },
      { q: 'Which day works best for baking?', skip: (L) => L.category !== 'baked_goods', ok: (L) => !!L.schedule.batchDay, body: (L) => <Choices name="Batch day" columns={2} options={DAYS.map((d) => ({ id: d, label: d }))} value={L.schedule.batchDay} onChange={(v) => L.patch('schedule', { batchDay: v })} /> },
    ],
    output: ({ L, pause }) => {
      const av = L.listing.availability
      const baked = L.category === 'baked_goods'
      const batchDays = baked ? [L.schedule.batchDay || 'Sat', ...(L.schedule.capacity > 10 ? ['Wed'] : [])] : []
      return (
        <OutputCard eyebrow="Your week" title={`Up to ${L.schedule.capacity} orders a week, ${({ same_day: 'same-day', '1_day': '1 day', '2_days': '2+ days' })[L.schedule.notice] || '1 day'} notice`}>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[12px]">
            {DAYS.map((d) => (
              <div key={d} className="space-y-1.5">
                <div className="font-medium text-muted">{d}</div>
                {batchDays.includes(d) && <div className="rounded-lg bg-accent px-1 py-2 font-semibold text-white">Bake</div>}
                {BLOCKS.map(([b, lab]) => av.some((a) => a.day === d && a.block === b) ? <div key={b} className="rounded-lg bg-brand px-1 py-2 text-white"><span className="sm:hidden">{{ morning: 'AM', afternoon: 'PM', evening: 'Eve' }[b]}</span><span className="hidden sm:inline">{lab}</span></div> : null)}
                {!batchDays.includes(d) && !av.some((a) => a.day === d) && <div className="rounded-lg bg-bg px-1 py-2 text-muted">Off</div>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-muted">Blue times are synced to your listing. Exam weeks: {L.schedule.examWeeks.map((id) => EXAM_WEEKS.find((w) => w.id === id)?.label).join(', ') || 'none'}.</p>
          <label className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-bg p-4">
            <span><span className="block font-medium">Pause for finals</span><span className="text-[13px] text-muted">Your listing switches to a waitlist instead of disappearing.</span></span>
            <input type="checkbox" role="switch" checked={L.schedule.paused} onChange={(e) => pause(e.target.checked)} className="h-6 w-6 accent-[rgb(var(--brand))]" aria-label="Pause for finals" />
          </label>
        </OutputCard>
      )
    },
    next: 'Do my monthly check-in',
  },
  {
    n: 7, title: 'Improve or grow', gets: 'Monthly check-in', blurb: 'See what’s working, every month.',
    steps: [
      { q: 'How do you feel about it?', hint: 'Here’s your first month so far.', ok: (L) => !!L.checkin.feeling, body: (L) => (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3"><Stat label="Orders" value={MONTH_ONE.orders} /><Stat label="Earned" value={money(MONTH_ONE.revenue)} /><Stat label="Rating" value={<span className="inline-flex items-center gap-1">{MONTH_ONE.rating}<Star size={18} className="fill-accent text-accent" /></span>} /></div>
          <Choices name="Feeling" options={opts(['want_more', 'Want more'], ['happy', 'Happy as is'], ['want_less', 'Want less'])} value={L.checkin.feeling} onChange={(v) => L.patch('checkin', { feeling: v })} />
        </div>
      ) },
    ],
    output: ({ L }) => {
      const tips = generateNow('checkin', { feeling: L.checkin.feeling || 'happy', price: priceModel(L).price, category: L.category || 'baked_goods' })
      return (
        <OutputCard eyebrow="Monthly check-in" title={L.checkin.feeling === 'want_more' ? 'Two ways to grow next month' : 'You’re doing great'}>
          <div className="grid gap-4 md:grid-cols-2">{tips.map((t) => <div key={t.title} className="rounded-2xl bg-bg p-5"><div className="font-display text-lg font-bold">{t.title}</div><p className="mt-1 text-[14px] text-muted">{t.body}</p></div>)}</div>
          <p className="mt-5 text-[13px] text-muted">{MONTH_ONE.repeatCustomers} regulars rebooked this month. Their orders cost you {Math.round(FEES.repeatCustomerRate * 100)}% instead of 8%.</p>
        </OutputCard>
      )
    },
    next: 'Back to overview',
  },
]

// ---------------------------------------------------------------------------
// The flow: list first, then message 10 people, then reflect on what happened.
// 0 Welcome · 1 Pick · 2 Price · 3 Listing · 4 Reach out · 5 Reflect · 6 Run it with school

function CopyButton({ text }) {
  const [done, setDone] = useState(false)
  const copy = () => { try { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1400) }, () => {}) } catch {} }
  return <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-brand hover:bg-brandsoft">{done ? <><Check size={13} /> Copied</> : 'Copy message'}</button>
}

const targetOk = (L) => { const d = L.category && CATEGORIES[L.category]; return !!d && (L.validation.target === 'other' ? !!L.validation.targetOther.trim() : d.targets.some((t) => t.id === L.validation.target)) }
const targetLabel = (L, d) => (L.validation.target === 'students_in_a_specific_class' && L.validation.targetClass ? `${L.validation.targetClass} students` : labelOf(d.targets, L.validation.target, L.validation.targetOther) || 'students')
const people = (L) => L.launch.people.map((p) => p.trim()).filter(Boolean)
const linkFor = (L) => `studentflow.ca/l/${(L.listingId || 'your-listing').replace('l_', '')}`

const welcome = OLD[0]

const pick = {
  ...OLD[1], gets: 'Your idea and first customers', blurb: 'Find an idea that fits your skills, and who it’s for.',
  output: (ctx) => {
    const { L } = ctx
    const d = L.category && CATEGORIES[L.category]
    return (
      <div className="space-y-4">
        {OLD[1].output(ctx)}
        {d && (
          <OutputCard eyebrow="Your first customers" title="Who exactly is this for?">
            <p className="-mt-2 mb-4 text-[14px] text-muted">Pick one group. Your listing and your first 10 messages will speak to them.</p>
            <Choices name="Target customer" options={d.targets} value={L.validation.target} onChange={(v) => L.patch('validation', { target: v })} other={L.validation.targetOther} onOther={(v) => L.patch('validation', { targetOther: v })} />
            {L.validation.target === 'students_in_a_specific_class' && <input value={L.validation.targetClass} onChange={(e) => L.patch('validation', { targetClass: e.target.value })} placeholder="Which class? e.g. CHEM 1301" className={`${inputCls} mt-3 h-12`} aria-label="Class" />}
          </OutputCard>
        )}
      </div>
    )
  },
  canNext: (L) => !!L.ideaId && targetOk(L),
}

const price = OLD[3]
const listing = { ...OLD[4], canNext: (L) => !!L.listingId }

const reachOut = {
  title: 'Reach out', gets: 'Messages to 10 people', blurb: 'Your listing is live. Now tell 10 people who’d want it.',
  steps: [
    OLD[5].steps[0],
    { q: 'Name 10 people who fit your customer.', hint: 'Friends, floor-mates, classmates, people in your clubs. First names are fine.', ok: (L) => people(L).length > 0, body: (L) => (
      <div className="grid gap-2 sm:grid-cols-2">{L.launch.people.map((p, i) => (
        <input key={i} value={p} onChange={(e) => L.patch('launch', { people: L.launch.people.map((x, k) => (k === i ? e.target.value : x)) })} placeholder={`Person ${i + 1}`} className={`${inputCls} h-12`} aria-label={`Person ${i + 1}`} />
      ))}</div>
    ) },
    OLD[5].steps[2],
  ],
  output: ({ L, s }) => {
    const d = CATEGORIES[L.category]
    const live = s.listings.find((l) => l.id === L.listingId)
    const link = linkFor(L)
    const ask = { baked_goods: 'Want a box this week?', tutoring: 'Want to book a session?', fitness: 'Want to try a session?' }[L.category]
    const deal = L.listing.deal === 'ten_off' ? 'My first 5 customers get 10% off. ' : L.listing.deal === 'free_extra' ? 'My first 5 customers get a free extra. ' : ''
    const msg = (name) => `Hey ${name}! I just launched something on StudentFlow: “${live ? live.title : L.listing.hook}”. ${deal}${ask} ${link}`
    const names = people(L)
    const sentCount = names.filter((n) => L.launch.sent[L.launch.people.indexOf(n)]).length
    const toggle = (n) => { const i = L.launch.people.indexOf(n); L.patch('launch', { sent: L.launch.sent.map((x, k) => (k === i ? !x : x)) }) }
    const group = L.launch.groups[0] && (L.launch.groupNames[L.launch.groups[0]] || L.launch.groups[0])
    return (
      <OutputCard eyebrow="Your outreach" title={`Message ${names.length} people this week`}>
        <div className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl bg-bg p-4">
          <QR text={'https://' + link} size={96} />
          <div className="min-w-0 flex-1"><div className="text-[13px] text-muted">Your share link</div><div className="truncate font-medium">{link}</div><p className="mt-1 text-[13px] text-muted">Put the QR code on a flyer or your boxes.</p></div>
        </div>
        <div className="mb-3 flex items-baseline justify-between"><div className="font-medium">Send one at a time. Personal beats a group post.</div><div className="text-[13px] font-semibold text-accent tnum">{sentCount} of {names.length} sent</div></div>
        <ul className="grid gap-2">{names.map((n) => {
          const sent = L.launch.sent[L.launch.people.indexOf(n)]
          return (
            <li key={n} className={`flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 ${sent ? 'bg-successsoft' : 'bg-bg'}`}>
              <span className="min-w-0 flex-1 font-medium">{n}</span>
              <CopyButton text={msg(n)} />
              <button type="button" onClick={() => toggle(n)} aria-pressed={!!sent} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${sent ? 'bg-success text-white' : 'bg-surface text-ink'}`}>{sent ? 'Sent ✓' : 'Mark sent'}</button>
            </li>
          )
        })}</ul>
        <div className="mt-5"><div className="mb-2 text-[13px] font-semibold">The message</div><CopyBox text={msg(names[0] || '[name]')} label="Copy message" /></div>
        {L.launch.comfort !== 'not_at_all' && group && <div className="mt-4"><div className="mb-2 text-[13px] font-semibold">For {group}</div><CopyBox text={d.groupPitch(live?.price || priceModel(L).price)} /></div>}
        <p className="mt-5 text-[13px] text-muted">Give it about a week, then come back to reflect on what happened.</p>
      </OutputCard>
    )
  },
  canNext: (L) => L.launch.sent.some(Boolean),
}

const RESP = [['no_reply', 'No reply'], ['not_interested', 'Not interested'], ['interested', 'Interested'], ['chatted', 'Chatted'], ['bought', 'Bought']]
function ResponseLog({ L }) {
  const { dispatch, toast } = useStore()
  const names = people(L)
  const set = (n, r) => L.patch('reflect', { responses: { ...L.reflect.responses, [n]: r } })
  const simulate = () => {
    L.fill(5, { name: L.student.name })
    if (L.listingId && !L.reflect.simulated) { dispatch({ type: 'simulateWeek', listingId: L.listingId }); L.patch('reflect', { simulated: true }) }
    toast('Demo: one week later')
  }
  return (
    <div className="space-y-3">
      {!names.length && <p className="text-muted">Add the people you messaged in Reach out first.</p>}
      {names.map((n) => (
        <div key={n} className="rounded-2xl bg-bg p-3">
          <div className="mb-2 font-medium">{n}</div>
          <div className="flex flex-wrap gap-1.5">{RESP.map(([id, label]) => (
            <button key={id} type="button" onClick={() => set(n, id)} aria-pressed={L.reflect.responses[n] === id} className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${L.reflect.responses[n] === id ? (id === 'bought' ? 'bg-success text-white' : 'bg-ink text-bg') : 'bg-surface'}`}>{label}</button>
          ))}</div>
        </div>
      ))}
      {!L.reflect.simulated && L.listingId && <Btn type="button" variant="soft" size="sm" onClick={simulate}>Demo: simulate my first week</Btn>}
    </div>
  )
}

export function reflectNumbers(L, s, me) {
  const names = people(L)
  const r = names.map((n) => L.reflect.responses[n])
  const live = s.listings.find((l) => l.id === L.listingId)
  return {
    sent: names.filter((n) => L.launch.sent[L.launch.people.indexOf(n)]).length || names.length,
    replied: r.filter((x) => x && x !== 'no_reply').length,
    interested: r.filter((x) => x === 'interested' || x === 'chatted' || x === 'bought').length,
    chats: s.conversations.filter((c) => c.listingId === L.listingId).length,
    sales: s.orders.filter((o) => o.sellerId === me.id && o.listingId === L.listingId && o.outcome === 'completed').length,
    views: live?.views || 0,
  }
}

const reflect = {
  title: 'Reflect', gets: 'Your results and what to change', blurb: 'A week later: what happened, and what to try next. Come back every month.',
  steps: [
    { q: 'How did each person respond?', hint: 'Tap what happened, including anyone who didn’t reply.', ok: (L) => Object.keys(L.reflect.responses).length > 0, body: (L) => <ResponseLog L={L} /> },
    { q: 'How do you feel about it so far?', ok: (L) => !!L.checkin.feeling, body: (L) => <Choices name="Feeling" options={opts(['want_more', 'Want more customers'], ['happy', 'Happy as is'], ['want_less', 'Want less'])} value={L.checkin.feeling} onChange={(v) => L.patch('checkin', { feeling: v })} /> },
  ],
  output: ({ L, s, me, go, simulateSale }) => {
    const num = reflectNumbers(L, s, me)
    const { price } = priceModel(L)
    const live = s.listings.find((l) => l.id === L.listingId)
    const out = generateNow('reflect', { ...num, price, benchmarkLow: L.pricing.benchmarkLow, feeling: L.checkin.feeling, category: L.category })
    const funnel = [['Messaged', num.sent], ['Replied', num.replied], ['Chatted', num.chats], ['Bought', num.sales]]
    const top = Math.max(...funnel.map((f) => f[1]), 1)
    const totalSales = s.orders.filter((o) => o.sellerId === me.id && o.outcome === 'completed').length
    return (
      <OutputCard eyebrow="Your first week" title={out.headline}>
        <div className="space-y-2.5">{funnel.map(([k, v], i) => (
          <div key={k} className="grid grid-cols-[130px_1fr_40px] items-center gap-3 text-[14px] sm:grid-cols-[170px_1fr_48px]">
            <span className="text-muted">{k}</span>
            <span className="h-3 overflow-hidden rounded-full bg-bg"><span className={`block h-full rounded-full ${i === 3 && v > 0 ? 'bg-success' : 'bg-brand'}`} style={{ width: `${Math.max(2, (v / top) * 100)}%`, opacity: 1 - i * 0.12 }} /></span>
            <span className="text-right font-semibold tnum">{v}</span>
          </div>
        ))}</div>
        <p className="mt-3 text-[13px] text-muted tnum">Your listing was opened {num.views} times this week, including people who found it in the feed.</p>
        <div className="mt-7 grid gap-3 md:grid-cols-2">{out.tips.map((t) => (
          <div key={t.title} className="rounded-2xl bg-bg p-5">
            <div className="font-display text-lg font-bold">{t.title}</div>
            <p className="mt-1 text-[14px] text-muted">{t.body}</p>
            {t.action && <Btn size="sm" variant="outline" className="mt-3" onClick={() => go(t.action.stage)}>{t.action.label}</Btn>}
          </div>
        ))}</div>
        {out.verdict === 'sold' && <div className="mt-4"><div className="mb-2 text-[13px] font-semibold">Review request</div><CopyBox text={REVIEW_REQUEST(L.student.name, live?.title || 'my listing')} label="Copy review request" /></div>}
        <div className={`mt-6 rounded-2xl p-5 ${totalSales >= FEES.trialEndsAfterSales ? 'bg-successsoft' : 'bg-accentsoft'}`}>
          {totalSales >= FEES.trialEndsAfterSales ? (
            <div className="flex items-start gap-3"><PartyPopper size={26} className="shrink-0 text-accent" /><div><div className="font-display text-lg font-bold">{FEES.trialEndsAfterSales} sales. You’re officially in business!</div><p className="mt-1 text-[14px]">Your tools stay free for at least 30 days from when you listed; after that it’s ${SUBSCRIPTION.monthly}/month.</p></div></div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2"><div className="font-medium tnum">{totalSales} of {FEES.trialEndsAfterSales} sales</div><div className="text-[13px] text-muted">Your tools are free until your first {FEES.trialEndsAfterSales} sales.</div></div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(totalSales / FEES.trialEndsAfterSales) * 100}%` }} /></div>
              {live && <Btn size="sm" variant="outline" className="mt-4" onClick={simulateSale}>Demo: simulate a sale</Btn>}
            </>
          )}
        </div>
        <p className="mt-5 text-[13px] text-muted">Come back to Reflect each month. Your numbers update as you sell.</p>
      </OutputCard>
    )
  },
}

const school = OLD[6]

export const STAGES = [welcome, pick, price, listing, reachOut, reflect, school].map((st, n) => ({ ...st, n }))
