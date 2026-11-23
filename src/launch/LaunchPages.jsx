import React, { useEffect, useRef } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, X, Wand2, RotateCcw, User, Trophy } from 'lucide-react'
import { useStore } from '../store'
import { Btn } from '../ui'
import { useLaunch } from './store'
import { STAGES, buildListing, isExplore } from './stages'
import { CATEGORIES } from './lib/categories'
import { NEXT_LABEL } from './summaries'

const STEP_CTA = ['See my profile', 'See my ideas', 'See my price', 'Preview my listing', 'Get my messages', 'See my results', 'See my week']

function visibleSteps(def, L) { return def.steps.filter((st) => !(st.skip && st.skip(L))) }

export function useLaunchActions() {
  const L = useLaunch()
  const { s, me, now, dispatch, toast } = useStore()
  const nav = useNavigate()
  const go = (n) => nav('/launch/' + n)
  const publish = () => {
    const listing = buildListing(L, me, now)
    const d = CATEGORIES[L.category]
    const shop = `${(L.student.name || me.name).split(' ')[0]}’s ${{ baked_goods: 'Bakes', tutoring: 'Tutoring', fitness: 'Coaching' }[d.id]}`
    dispatch({ type: 'publishListing', listing, shop })
    L.set({ listingId: listing.id }); L.complete(3)
    toast('Published. Your listing is live in the feed.')
    nav('/market')
  }
  const simulateSale = () => { if (L.listingId) { dispatch({ type: 'simulateSale', listingId: L.listingId }); toast('Demo: a sale completed') } }
  const pause = (on) => { L.patch('schedule', { paused: on }); if (L.listingId) dispatch({ type: 'pauseListing', id: L.listingId, paused: on }); toast(on ? 'Paused: your listing now takes a waitlist' : 'Back to taking orders') }
  return { L, s, me, now, dispatch, toast, nav, go, publish, simulateSale, pause, published: !!L.listingId && s.listings.some((l) => l.id === L.listingId) }
}

export function DemoBar({ n }) {
  const L = useLaunch()
  const { me, dispatch, toast } = useStore()
  const nav = useNavigate()
  if (!L.demoBar) return <button onClick={() => L.set({ demoBar: true })} className="fixed z-40 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-bg shadow-lg" style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', right: 'max(16px, env(safe-area-inset-right, 0px))' }}>Demo</button>
  const fill = () => {
    if (n == null) return
    L.fill(n, me); L.setStep(n, 999)
    if (n === 5 && L.listingId && !L.reflect.simulated) { dispatch({ type: 'simulateWeek', listingId: L.listingId }); L.patch('reflect', { simulated: true }) }
    toast(`Filled stage ${n}`)
  }
  const loadMaya = () => { L.reset(); dispatch({ type: 'persona', userId: 'u_maya' }); L.fill(0, { name: 'Maya Rodriguez', year: '2nd', major: 'Foods & Nutrition' }); toast('Loaded Maya, 2nd-year Foods & Nutrition'); nav('/launch/0') }
  const reset = () => { L.reset(); dispatch({ type: 'reset' }); toast('Demo reset'); nav('/launch') }
  return (
    <div className="fixed inset-x-0 z-40 flex justify-center px-4" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap rounded-full bg-ink px-2 py-1.5 text-[12px] font-semibold text-bg shadow-xl noscrollbar">
        <span className="hidden px-2 opacity-60 sm:inline">Demo</span>
        <select aria-label="Jump to stage" value={n ?? ''} onChange={(e) => nav('/launch/' + e.target.value)} className="rounded-full bg-white/10 px-2 py-1 text-bg">
          <option value="" disabled>Jump to…</option>
          {STAGES.map((st) => <option key={st.n} value={st.n} className="text-ink">{st.n}. {st.title}</option>)}
        </select>
        {n != null && <button onClick={fill} className="flex items-center gap-1 rounded-full px-2.5 py-1 hover:bg-white/10"><Wand2 size={13} /> Fill<span className="hidden sm:inline"> this stage</span></button>}
        <button onClick={loadMaya} className="flex items-center gap-1 rounded-full px-2.5 py-1 hover:bg-white/10"><User size={13} /> <span className="hidden sm:inline">Load </span>Maya</button>
        <button onClick={reset} className="flex items-center gap-1 rounded-full px-2.5 py-1 hover:bg-white/10"><RotateCcw size={13} /> Reset<span className="hidden sm:inline"> demo</span></button>
        <button onClick={() => L.set({ demoBar: false })} className="rounded-full p-1 hover:bg-white/10" aria-label="Hide demo bar"><X size={14} /></button>
      </div>
    </div>
  )
}

export function LaunchHub() {
  const L = useLaunch()
  const { s, me } = useStore()
  const nav = useNavigate()
  const allDone = STAGES.every((st) => L.done[st.n])
  const next = STAGES.find((st) => !L.done[st.n]) ?? STAGES.find((st) => st.title === 'Reflect') // everything done: send them back to Reflect, the monthly check-in
  const started = Object.keys(L.done).length > 0 || Object.keys(L.steps).length > 0
  const live = L.listingId && s.listings.find((l) => l.id === L.listingId)
  const start = () => { if (!L.student.name) L.patch('student', { name: me.name.split(' ')[0], year: me.year || '', major: me.major || '' }); nav('/launch/' + next.n) }
  return (
    <div className="pb-16">
      <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Turn something you’re good at into a side business</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">Six short stages, one question at a time. Pick an idea, price it, list it, message 10 people, then see what worked.</p>
        </div>
        <Btn size="lg" onClick={start}>{allDone ? 'See my latest results' : started ? `Continue: ${next.n}. ${next.title}` : 'Start'} <ArrowRight size={18} /></Btn>
      </div>
      {live && (
        <button onClick={() => nav('/listing/' + live.id)} className="mb-8 flex w-full items-center gap-4 rounded-3xl bg-successsoft p-4 text-left">
          <Check size={20} className="text-success" /><span className="flex-1"><b>Your listing is live:</b> {live.title}</span><ArrowRight size={18} />
        </button>
      )}
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((st) => {
          const done = L.done[st.n]
          return (
            <li key={st.n}>
              <button onClick={() => nav('/launch/' + st.n)} className={`flex h-full w-full flex-col rounded-3xl p-5 text-left transition hover:-translate-y-0.5 ${done ? 'bg-brandsoft/70' : st.n === next.n && !allDone ? 'bg-surface ring-2 ring-brand' : 'bg-surface'}`}>
                <span className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold ${done ? 'bg-brand text-white' : 'bg-bg text-ink'}`}>{done ? <Check size={18} strokeWidth={3} /> : st.n === 0 ? 'Hi' : st.n}</span>
                  {st.n === next.n && !done && !allDone && <span className="-rotate-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-white">Up next</span>}
                </span>
                <span className="mt-4 font-display text-xl font-bold">{st.title}</span>
                <span className="mt-1 text-[14px] text-muted">{st.blurb}</span>
                <span className="mt-auto pt-4 text-[13px] font-semibold text-brand">You get: {st.gets}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <DemoBar n={null} />
    </div>
  )
}

function StageRail({ n }) {
  const L = useLaunch()
  const doneCount = STAGES.filter((st) => L.done[st.n]).length
  return (
    <nav aria-label="Stages" className="hidden lg:block">
      <div className="sticky top-24">
        <div className="mb-4 text-[13px] text-muted tnum">{doneCount} of {STAGES.length} stages done</div>
        <ol className="relative">
          {STAGES.map((st, i) => {
            const cur = st.n === n, done = L.done[st.n]
            return (
              <li key={st.n} className="relative pb-5 pl-11">
                {i < STAGES.length - 1 && <span className={`absolute left-[15px] top-8 h-[calc(100%-24px)] w-0.5 rounded ${done ? 'bg-brand' : 'bg-line'}`} />}
                <NavLink to={'/launch/' + st.n} aria-current={cur ? 'step' : undefined} className="group block">
                  <span className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition ${cur ? 'bg-brand text-white ring-4 ring-brandsoft' : done ? 'bg-brand text-white' : 'bg-surface text-muted'}`}>
                    {done && !cur ? <Check size={15} strokeWidth={3} /> : st.n === 0 ? 'Hi' : st.n}
                  </span>
                  <span className={`block pt-1 text-[14px] font-semibold leading-tight ${cur ? 'text-ink' : 'text-muted group-hover:text-ink'}`}>{st.title}</span>
                  {cur && <span className="mt-0.5 block text-[12px] text-muted">{st.gets}</span>}
                </NavLink>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

function MobileStageBar({ n }) {
  const L = useLaunch()
  const doneCount = STAGES.filter((st) => L.done[st.n]).length
  return (
    <div className="mb-6 lg:hidden">
      <div className="flex items-baseline justify-between text-[13px]"><span className="font-semibold">{n === 0 ? 'Welcome' : `Stage ${n} of ${STAGES.length - 1} · ${STAGES[n].title}`}</span><span className="text-muted tnum">{doneCount}/{STAGES.length} done</span></div>
      <div className="mt-2 flex gap-1">{STAGES.map((st) => <span key={st.n} className={`h-1.5 flex-1 rounded-full ${L.done[st.n] ? 'bg-brand' : st.n === n ? 'bg-brand/40' : 'bg-line'}`} />)}</div>
    </div>
  )
}

function Reward({ def }) {
  const pieces = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    return { x: Math.cos(a) * (70 + (i % 3) * 18), y: Math.sin(a) * (60 + (i % 2) * 22), c: ['#3f54e8', '#ff8533', '#22a06b', '#f5b400'][i % 4], r: i * 37 }
  })
  return (
    <div className="relative flex flex-col items-center py-6 text-center" role="status">
      <div className="relative">
        {pieces.map((p, i) => (
          <span key={i} aria-hidden="true" className="sf-confetti absolute left-1/2 top-1/2 h-2.5 w-1.5 rounded-sm" style={{ background: p.c, '--x': p.x + 'px', '--y': p.y + 'px', '--r': p.r + 'deg' }} />
        ))}
        <div className="sf-badge flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white shadow-lg ring-8 ring-accentsoft">
          <Trophy size={34} strokeWidth={2} />
        </div>
      </div>
      <div className="mt-5 font-display text-2xl font-bold">{def.n === 0 ? 'You’re set up!' : `${def.title} complete!`}</div>
      <div className="mt-1 text-muted">You unlocked: <b className="text-ink">{def.gets}</b></div>
    </div>
  )
}

export function StageRunner() {
  const { n: nParam } = useParams()
  const n = Math.max(0, Math.min(STAGES.length - 1, +nParam || 0))
  const ctx = useLaunchActions()
  const { L, me, now, go, nav } = ctx
  const def = STAGES[n]
  const steps = visibleSteps(def, L)
  const idx = Math.min(L.steps[n] ?? 0, steps.length)
  const atOutput = idx >= steps.length
  const d = L.category ? CATEGORIES[L.category] : null
  const focusRef = useRef(null)
  const first = useRef(true)
  useEffect(() => { window.scrollTo(0, 0); first.current = true }, [n])
  useEffect(() => {
    if (first.current) { first.current = false; if (!atOutput) return }
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    focusRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  }, [idx, n, atOutput])
  useEffect(() => { if (atOutput && def.onEnterOutput) def.onEnterOutput(L) }, [atOutput, n]) // eslint-disable-line

  const shell = (main) => (
    <div className="mx-auto grid max-w-6xl gap-10 pb-28 lg:grid-cols-[200px_1fr]">
      <StageRail n={n} />
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => nav('/launch')} className="text-[13px] font-medium text-muted hover:text-ink">All stages</button>
          {isExplore(L) && <span className="rounded-full bg-brandsoft px-2.5 py-0.5 text-[12px] font-semibold text-brand">Explore mode</span>}
        </div>
        <MobileStageBar n={n} />
        {main}
      </div>
      <DemoBar n={n} />
    </div>
  )

  if (n >= 2 && !L.category) return shell(
    <div className="py-10">
      <h1 className="font-display text-3xl font-bold">Pick an idea first</h1>
      <p className="mt-2 text-muted">This stage is tailored to your idea, so start with Pick.</p>
      <Btn className="mt-6" onClick={() => go(1)}>Go to Pick</Btn>
    </div>
  )

  const resolve = (v) => (typeof v === 'function' ? v(L, d) : v)
  const answered = Math.min(idx, steps.length)
  const pct = Math.round((answered / steps.length) * 100)
  const nextStage = () => {
    L.complete(n)
    if (n === STAGES.length - 1) return nav('/launch')
    if (!L.done[n + 1]) L.setStep(n + 1, 0)
    go(n + 1)
  }
  const canNext = def.canNext ? def.canNext(L) : true
  const preview = !atOutput && def.preview ? def.preview(L, me, now) : null

  return shell(
    <>
      <header>
        <div className="text-[13px] font-semibold text-accent">{n === 0 ? 'Welcome' : `Stage ${n}`}</div>
        <h1 className="mt-1 font-display text-[32px] font-bold leading-tight sm:text-[40px]">{def.title}</h1>
        <p className="mt-1 text-muted">{def.blurb}</p>
      </header>
      {/* Stays pinned under the app header while the student scrolls through the questions */}
      <div className="sf-sticky-progress sticky z-20 -mx-4 mt-3 bg-bg px-4 py-3 sm:mx-0 sm:px-0">
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px]">
          <span className="font-semibold">{n === 0 ? 'Welcome' : `Stage ${n} · ${def.title}`}</span>
          <span className={`font-semibold tnum ${atOutput ? 'text-accent' : 'text-muted'}`}>{atOutput ? 'Stage complete' : `${answered} of ${steps.length} answered`}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Questions answered">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500" style={{ width: pct + '%' }} />
        </div>
      </div>

      {preview && <aside className="mt-6 rounded-3xl bg-surface p-5" aria-label="Live preview">{preview}</aside>}

      <ol className="relative mt-8">
        {steps.map((step, i) => {
          const done = i < idx, cur = i === idx
          const answer = done && step.a ? step.a(L, d) : null
          return (
            <li key={i} ref={cur ? focusRef : undefined} className="relative scroll-mt-44 md:scroll-mt-32 pb-6 pl-12">
              <span className={`absolute left-[15px] top-9 h-[calc(100%-28px)] w-0.5 rounded ${done ? 'bg-brand' : 'bg-line'}`} />
              <span className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition ${done ? 'bg-brand text-white' : cur ? 'bg-surface text-brand ring-2 ring-brand' : 'bg-surface text-muted'}`}>
                {done ? <Check size={15} strokeWidth={3} /> : i + 1}
              </span>
              {done ? (
                <button onClick={() => L.setStep(n, i)} className="group block w-full text-left">
                  <span className="block pt-1 text-[13px] text-muted">{resolve(step.q)}</span>
                  <span className="mt-0.5 flex items-baseline gap-2"><span className="font-medium">{answer || 'Answered'}</span><span className="text-[12px] font-semibold text-brand opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">Edit</span></span>
                </button>
              ) : cur ? (
                <div className="sf-step-in rounded-3xl bg-surface p-5 sm:p-7">
                  <h2 className="font-display text-[24px] font-bold leading-tight sm:text-[28px]">{resolve(step.q)}</h2>
                  {step.hint && <p className="mt-2 text-muted">{resolve(step.hint)}</p>}
                  <div className="mt-5">{step.body(L, d)}</div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    {i > 0 ? <button onClick={() => L.setStep(n, i - 1)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-ink"><ArrowLeft size={16} /> Back</button> : <span />}
                    <Btn size="lg" disabled={!step.ok(L)} onClick={() => L.setStep(n, i + 1)}>{i === steps.length - 1 ? STEP_CTA[n] : 'Next question'} <ArrowRight size={18} /></Btn>
                  </div>
                </div>
              ) : (
                <span className="block pt-1 text-[15px] text-muted/70">{resolve(step.q)}</span>
              )}
            </li>
          )
        })}
        <li ref={atOutput ? focusRef : undefined} className="relative scroll-mt-44 md:scroll-mt-32 pl-12">
          <span className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${atOutput ? 'bg-accent text-white' : 'bg-surface text-muted'}`}><Trophy size={15} /></span>
          {!atOutput && <span className="block pt-1 text-[15px] text-muted/70">You get: {def.gets}</span>}
        </li>
      </ol>

      {atOutput && (
        <div className="mt-2">
          <Reward def={def} />
          {def.output({ ...ctx, go })}
          <div className="mt-6 flex flex-col items-stretch gap-2 sm:items-end">
            <Btn size="lg" onClick={nextStage} disabled={!canNext} className="sm:min-w-[320px]">{NEXT_LABEL[n]} <ArrowRight size={18} /></Btn>
            {!canNext && n === 3 && <p className="text-[13px] text-muted sm:text-right">Publish your listing to continue.</p>}
            {!canNext && n === 4 && <p className="text-[13px] text-muted sm:text-right">Mark at least one message as sent to continue.</p>}
            {!canNext && n === 1 && <p className="text-[13px] text-muted sm:text-right">Pick an idea and who it’s for to continue.</p>}
          </div>
        </div>
      )}
    </>
  )
}
