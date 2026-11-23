import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIES, BAKING_INGREDIENTS } from './lib/categories'
import { EXAM_WEEKS } from './lib/seed'

export const SAMPLE_PEOPLE = ['Jess', 'Dev', 'Aisha', 'Marcus', 'Lena', 'Tom', 'Priya', 'Sam', 'Noor', 'Kai']
import { generateNow } from './lib/generators'
import type { Category, Idea, ValidationEntry, PricingInputs, Day, Block, Moment } from './lib/types'

export interface LaunchState {
  steps: Record<number, number> // current question index per stage
  furthest: Record<number, number> // furthest question reached per stage
  done: Record<number, boolean>
  student: { name: string; school: string; year: string; studyPermit: string; helpWith: string[]; helpOther: string; passion: string; workStyle: string; hoursPerWeek: string; hoursFinals: string; startupBudget: string; major: string }
  ideas: Idea[]; ideaId: string | null; category: Category | null
  validation: { target: string; targetOther: string; targetClass: string; alternative: string; alternativeOther: string; differentiators: string[]; diffOther: string; log: ValidationEntry[] }
  pricing: PricingInputs & { goalCustom: string }
  listing: { hook: string; photo: string; includes: string[]; includeOther: string; faq: string[]; availability: { day: Day; block: Block }[]; spot: string; story: string; deal: string; allergens: string[]; complianceOk: boolean; sessionPlace: string; moments: Moment[] }
  launch: { groups: string[]; groupNames: Record<string, string>; people: string[]; sent: boolean[]; comfort: string; events: string[] }
  reflect: { responses: Record<string, string>; simulated: boolean }
  schedule: { examWeeks: string[]; capacity: number; notice: string; batchDay: string; paused: boolean }
  checkin: { feeling: string }
  listingId: string | null
  demoBar: boolean
  // actions
  patch: <K extends Section>(k: K, v: Partial<LaunchState[K]>) => void
  set: (v: Partial<LaunchState>) => void
  setStep: (stage: number, i: number) => void
  complete: (stage: number) => void
  reset: () => void
  fill: (stage: number, me: { name: string; year?: string; major?: string }) => void
}
type Section = 'student' | 'validation' | 'pricing' | 'listing' | 'launch' | 'reflect' | 'schedule' | 'checkin'

const initial = () => ({
  steps: {} as Record<number, number>, furthest: {} as Record<number, number>, done: {} as Record<number, boolean>,
  student: { name: '', school: 'Western University', year: '', studyPermit: '', helpWith: [], helpOther: '', passion: '', workStyle: '', hoursPerWeek: '', hoursFinals: '', startupBudget: '', major: '' },
  ideas: [] as Idea[], ideaId: null as string | null, category: null as Category | null,
  validation: { target: '', targetOther: '', targetClass: '', alternative: '', alternativeOther: '', differentiators: [], diffOther: '', log: [] as ValidationEntry[] },
  pricing: {
    ingredients: BAKING_INGREDIENTS.map((x) => ({ ...x, on: true })), batchYield: 24, itemsPerOrder: 6, perSessionCost: 0, minutesPerOrder: 0,
    startupItems: [], benchmarkLow: 0, benchmarkHigh: 0, positioning: 'middle', monthlyGoal: 250, goalCustom: '', bundles: true, price: undefined,
  } as LaunchState['pricing'],
  listing: { hook: '', photo: '', includes: [], includeOther: '', faq: [], availability: [], spot: '', story: '', deal: '', allergens: [], complianceOk: false, sessionPlace: '', moments: [] } as LaunchState['listing'],
  launch: { groups: [], groupNames: {}, people: Array(10).fill(''), sent: Array(10).fill(false), comfort: '', events: [] } as LaunchState['launch'],
  reflect: { responses: {}, simulated: false } as LaunchState['reflect'],
  schedule: { examWeeks: EXAM_WEEKS.filter((w) => w.on).map((w) => w.id), capacity: 6, notice: '', batchDay: '', paused: false },
  checkin: { feeling: '' },
  listingId: null as string | null,
  demoBar: true,
})

/** Set category-dependent defaults when an idea is chosen. */
export function categoryDefaults(c: Category) {
  const d = CATEGORIES[c]
  return {
    minutesPerOrder: d.defaultMinutes, benchmarkLow: d.benchmarkLow, benchmarkHigh: d.benchmarkHigh,
    startupItems: d.startupItems.map((x) => ({ ...x, on: c === 'baked_goods' ? x.id !== 'scale' : true })),
  }
}

export const useLaunch = create<LaunchState>()(persist((setState, get) => ({
  ...initial(),
  patch: (k, v) => setState((s) => ({ [k]: { ...(s[k] as object), ...v } }) as Partial<LaunchState>),
  set: (v) => setState(v),
  setStep: (stage, i) => setState((s) => ({ steps: { ...s.steps, [stage]: i }, furthest: { ...(s.furthest || {}), [stage]: Math.max(s.furthest?.[stage] ?? 0, i) } })),
  complete: (stage) => setState((s) => ({ done: { ...s.done, [stage]: true } })),
  reset: () => setState({ ...initial() }),
  fill: (stage, me) => {
    // Sample answers for the pitch demo (Maya). Stages: 0 Welcome, 1 Pick, 2 Price, 3 Listing, 4 Reach out, 5 Reflect, 6 School
    const s = get()
    const cat: Category = s.category ?? 'baked_goods'
    const d = CATEGORIES[cat]
    if (stage === 0) setState({ student: { ...s.student, name: me.name.split(' ')[0], school: 'Western University', year: me.year || '2nd', studyPermit: 'no', major: me.major || 'Foods & Nutrition' } })
    if (stage === 1) {
      const student = { ...s.student, helpWith: ['baking'], passion: 'Recipe testing and why brown butter changes everything', workStyle: 'making', hoursPerWeek: '3-5', hoursFinals: '1-2', startupBudget: 'under50', major: s.student.major || me.major || 'Foods & Nutrition' }
      const ideas = generateNow('ideas', { helpWith: student.helpWith, passion: student.passion, workStyle: student.workStyle, hoursPerWeek: student.hoursPerWeek, budget: student.startupBudget, major: student.major })
      const c = ideas[0].category
      setState({ student, ideas, ideaId: ideas[0].id, category: c, pricing: { ...s.pricing, ...categoryDefaults(c) },
        validation: { ...s.validation, target: CATEGORIES[c].targets[0].id } })
    }
    if (stage === 2) setState({ pricing: { ...s.pricing, ...(s.pricing.benchmarkLow ? {} : categoryDefaults(cat)), positioning: 'middle', monthlyGoal: 250, bundles: true, price: d.prices.middle } })
    if (stage === 3) setState({ listing: { ...s.listing, hook: d.hookTemplates(d.targets[0].label.toLowerCase())[0], photo: d.photoOptions[0].id, includes: d.includes.slice(0, 3),
      faq: [], availability: [{ day: 'Sun', block: 'afternoon' }, { day: 'Wed', block: 'evening' }, { day: 'Fri', block: 'afternoon' }],
      spot: cat === 'fitness' ? 'Western Rec Centre' : cat === 'tutoring' ? 'Weldon Library' : 'UCC Atrium',
      story: generateNow('story', { name: s.student.name, year: s.student.year || '2nd', major: s.student.major || 'Foods & Nutrition', category: cat, passion: s.student.passion }),
      deal: 'ten_off', allergens: cat === 'baked_goods' ? ['wheat', 'dairy', 'eggs'] : [], complianceOk: true, sessionPlace: cat === 'fitness' ? 'Western Rec Centre' : '', moments: ['finals'] } })
    if (stage === 4) setState({ launch: { ...s.launch, groups: ['clubs', 'dorm'], groupNames: { clubs: 'Dance club', dorm: 'Saugeen 4th floor' },
      people: [...SAMPLE_PEOPLE], sent: Array(10).fill(true), comfort: 'close_friends' } })
    if (stage === 5) {
      const people = s.launch.people.some(Boolean) ? s.launch.people : [...SAMPLE_PEOPLE]
      const outcomes = ['bought', 'chatted', 'interested', 'chatted', 'interested', 'not_interested', 'interested', 'no_reply', 'no_reply', 'no_reply']
      const responses: Record<string, string> = {}
      people.filter(Boolean).forEach((p, i) => { responses[p] = outcomes[i % outcomes.length] })
      setState({ launch: { ...s.launch, people, sent: people.map((p) => !!p) }, reflect: { ...s.reflect, responses }, checkin: { feeling: 'want_more' } })
    }
    if (stage === 6) setState({ schedule: { ...s.schedule, capacity: 8, notice: '1_day', batchDay: 'Sat' } })
  },
}), { name: 'studentflow-launch-v2', partialize: (s) => { const { patch, set, setStep, complete, reset, fill, ...rest } = s; return rest as unknown as LaunchState } }))
