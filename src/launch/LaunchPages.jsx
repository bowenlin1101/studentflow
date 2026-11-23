import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, X, Wand2, RotateCcw, User } from 'lucide-react'
import { useStore } from '../store'
import { Btn } from '../ui'
import { useLaunch } from './store'
import { STAGES, buildListing, isExplore } from './stages'
import { CATEGORIES } from './lib/categories'

const STEP_CTA = ['See my profile', 'See my ideas', 'See my verdict', 'See my price', 'Preview my listing', 'Get my launch plan', 'See my week', 'See my check-in']

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
    L.set({ listingId: listing.id }); L.complete(4)
    toast('Published. Your listing is live in the feed.')
    nav('/market')
  }
  const simulateSale = () => { if (L.listingId) { dispatch({ type: 'simulateSale', listingId: L.listingId }); toast('Demo: a sale completed') } }
  const pause = (on) => { L.patch('schedule', { paused: on }); if (L.listingId) dispatch({ type: 'pauseListing', id: L.listingId, paused: on }); toast(on ? 'Paused: your listing now takes a waitlist' : 'Back to taking orders') }
  return { L, s, me, now, dispatch, toast, nav, go, publish, simulateSale, pause, published: !!L.listingId && s.listings.some((l) => l.id === L.listingId) }
}

function Progress({ n }) {
  const L = useLaunch()
  return (
    <ol className="noscrollbar mb-8 flex items-center gap-1.5 overflow-x-auto pb-1" aria-label="Stages">
      {STAGES.map((st) => {
        const cur = st.n === n, done = L.done[st.n]
        return (
          <li key={st.n} className="flex shrink-0 items-center gap-1.5">
            <NavLink to={'/launch/' + st.n} aria-current={cur ? 'step' : undefined} title={st.title}
              className={`flex h-9 min-w-[36px] items-center justify-center gap-1.5 rounded-full px-2.5 text-[13px] font-bold transition ${cur ? 'bg-brand text-white' : done ? 'bg-brandsoft text-brand' : 'bg-surface text-muted'}`}>
              {done && !cur ? <Check size={14} strokeWidth={3} /> : st.n === 0 ? 'Hi' : st.n}
              {cur && <span className="hidden font-medium sm:inline">{st.title}</span>}
            </NavLink>
            {st.n < 7 && <span className={`h-0.5 w-3 rounded ${done ? 'bg-brand' : 'bg-line'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

export function DemoBar({ n }) {
  const L = useLaunch()
  const { me, dispatch, toast } = useStore()
  const nav = useNavigate()
  if (!L.demoBar) return <button onClick={() => L.set({ demoBar: true })} className="fixed z-40 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-bg shadow-lg" style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', right: 'max(16px, env(safe-area-inset-right, 0px))' }}>Demo</button>
  const fill = () => { if (n == null) return; L.fill(n, me); L.setStep(n, 999); toast(`Filled stage ${n}`) }
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
  const next = STAGES.find((st) => !L.done[st.n]) ?? STAGES[7]
  const started = Object.keys(L.done).length > 0 || Object.keys(L.steps).length > 0
  const live = L.listingId && s.listings.find((l) => l.id === L.listingId)
  const start = () => { if (!L.student.name) L.patch('student', { name: me.name.split(' ')[0], year: me.year || '', major: me.major || '' }); nav('/launch/' + next.n) }
  return (
    <div className="pb-16">
      <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Turn something you’re good at into a side business</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">Seven short stages, one question at a time. Each one ends with something real: an idea, a price, a live listing, your first customers.</p>
        </div>
        <Btn size="lg" onClick={start}>{allDone ? 'Review my check-in' : started ? `Continue: ${next.n}. ${next.title}` : 'Start'} <ArrowRight size={18} /></Btn>
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

export function StageRunner() {
  const { n: nParam } = useParams()
  const n = Math.max(0, Math.min(7, +nParam || 0))
  const ctx = useLaunchActions()
  const { L, me, now, go, nav } = ctx
  const def = STAGES[n]
  const steps = visibleSteps(def, L)
  const idx = Math.min(L.steps[n] ?? 0, steps.length)
  const atOutput = idx >= steps.length
  const d = L.category ? CATEGORIES[L.category] : null
  const [, force] = useState(0)
  useEffect(() => { window.scrollTo(0, 0) }, [n, idx])
  useEffect(() => { if (atOutput && def.onEnterOutput) def.onEnterOutput(L) }, [atOutput, n]) // eslint-disable-line

  if (n >= 2 && !L.category) return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <Progress n={n} />
      <h1 className="font-display text-3xl font-bold">Pick an idea first</h1>
      <p className="mt-2 text-muted">This stage is tailored to your idea, so start with stage 1.</p>
      <Btn className="mt-6" onClick={() => go(1)}>Go to Pick</Btn>
      <DemoBar n={n} />
    </div>
  )

  const step = steps[idx]
  const resolve = (v) => (typeof v === 'function' ? v(L, d) : v)
  const nextStage = () => {
    L.complete(n)
    if (n === 7) return nav('/launch')
    if (!L.done[n + 1]) L.setStep(n + 1, 0)
    go(n + 1)
  }
  const canNext = def.canNext ? def.canNext(L) : true
  const preview = !atOutput && def.preview ? def.preview(L, me, now) : null

  return (
    <div className="mx-auto max-w-5xl pb-28">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => nav('/launch')} className="text-[13px] font-medium text-muted hover:text-ink">All stages</button>
        {isExplore(L) && <span className="rounded-full bg-brandsoft px-2.5 py-0.5 text-[12px] font-semibold text-brand">Explore mode</span>}
      </div>
      <Progress n={n} />
      {atOutput ? (
        <div>
          {def.output({ ...ctx, go })}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => L.setStep(n, steps.length - 1)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-ink"><ArrowLeft size={16} /> Change answers</button>
            <Btn size="lg" onClick={nextStage} disabled={!canNext}>{def.next} <ArrowRight size={18} /></Btn>
          </div>
          {!canNext && n === 4 && <p className="mt-2 text-right text-[13px] text-muted">Publish your listing to continue.</p>}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-accent tnum">{def.title} · Question {idx + 1} of {steps.length}</div>
            <h1 className="mt-2 font-display text-[28px] font-bold leading-tight sm:text-[34px]">{resolve(step.q)}</h1>
            {step.hint && <p className="mt-2 text-muted">{resolve(step.hint)}</p>}
            <div className="mt-6" key={n + '-' + idx}>{step.body(L, d)}</div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <button onClick={() => (idx === 0 ? (n === 0 ? nav('/launch') : go(n - 1)) : L.setStep(n, idx - 1))} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-ink"><ArrowLeft size={16} /> Back</button>
              <Btn size="lg" disabled={!step.ok(L)} onClick={() => { L.setStep(n, idx + 1); force((x) => x + 1) }}>{idx === steps.length - 1 ? STEP_CTA[n] : 'Next'} <ArrowRight size={18} /></Btn>
            </div>
          </div>
          {preview && <aside className="h-fit rounded-3xl bg-surface p-5 lg:sticky lg:top-24" aria-label="Live preview">{preview}</aside>}
        </div>
      )}
      <DemoBar n={n} />
    </div>
  )
}
