// One-line answer summaries, shown when a question collapses in the stage timeline,
// plus the label on each stage's "Next" button.
import { STAGES, priceModel } from './stages'
import { verdict } from './lib/generators'
import { MOMENTS, CAMPUS_EVENTS } from './lib/seed'
import { money, money2 } from '../store'

const labelOf = (list, id, other) => (id === 'other' ? other || 'Other' : list.find((x) => x.id === id)?.label || '')
const L_HELP = { class: 'Explaining a class', workouts: 'Workouts or sports', baking: 'Baking or cooking' }
const L_STYLE = { making: 'Making things', teaching: 'Teaching or explaining', coaching: 'Coaching people in person' }
const L_HOURS = { '1-2': '1–2 hours', '3-5': '3–5 hours', '6-10': '6–10 hours', '10+': '10+ hours' }
const L_FINALS = { 0: 'None', '1-2': '1–2 hours', '3-5': '3–5 hours', same: 'Same as normal' }
const L_BUDGET = { 0: '$0', under50: 'Under $50', under200: 'Under $200', more: 'More' }
const L_PERMIT = { yes: 'Yes (explore mode)', no: 'No', not_sure: 'Not sure (explore mode)' }
const L_COMFORT = { not_at_all: 'Not at all', close_friends: 'Close friends only', anywhere: 'Anywhere' }
const L_NOTICE = { same_day: 'Same day', '1_day': '1 day', '2_days': '2+ days' }
const L_DEAL = { ten_off: '10% off', free_extra: 'A free extra', none: 'No deal' }
const L_FEEL = { want_more: 'Want more', happy: 'Happy as is', want_less: 'Want less' }
const L_POS = { affordable: 'Affordable', middle: 'Middle', premium: 'Premium' }
const join = (xs) => xs.filter(Boolean).join(', ')
const cap = (s, n = 70) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s)

const SUMMARY = {
  0: [(L) => L.student.name, (L) => L.student.school, (L) => `${L.student.year} year`, (L) => L_PERMIT[L.student.studyPermit]],
  1: [
    (L) => join([...L.student.helpWith.filter((x) => x !== 'other').map((x) => L_HELP[x]), L.student.helpWith.includes('other') && L.student.helpOther]),
    (L) => cap(L.student.passion),
    (L) => L_STYLE[L.student.workStyle],
    (L) => `${L_HOURS[L.student.hoursPerWeek]} a week`,
    (L) => L_FINALS[L.student.hoursFinals],
    (L) => L_BUDGET[L.student.startupBudget],
  ],
  2: [
    (L, d) => labelOf(d.targets, L.validation.target, L.validation.targetOther) + (L.validation.targetClass ? ` (${L.validation.targetClass})` : ''),
    (L, d) => labelOf(d.alternatives, L.validation.alternative, L.validation.alternativeOther),
    (L, d) => join(L.validation.differentiators.map((x) => labelOf(d.differentiators, x, L.validation.diffOther))),
    () => 'Message and 5 questions ready',
    (L) => { const v = verdict(L.validation.log); return `${L.validation.log.length} conversations · ${v.pre} pre-orders · ${v.pay} would pay` },
  ],
  3: [
    (L) => (L.category === 'baked_goods' ? `${money2(priceModel(L).unitCost)} in ingredients per order` : `${money2(L.pricing.perSessionCost)} per session`),
    (L, d) => `${L.pricing.minutesPerOrder || d.defaultMinutes} minutes per order`,
    (L) => `${money2(priceModel(L).startup)} to start`,
    (L) => `$${L.pricing.benchmarkLow}–$${L.pricing.benchmarkHigh} elsewhere`,
    (L, d) => `${L_POS[L.pricing.positioning]} · ${money(d.prices[L.pricing.positioning])}`,
    (L) => `${money(L.pricing.monthlyGoal)} a month`,
    (L, d) => (L.pricing.bundles ? join(d.bundles(priceModel(L).price).map((b) => b.name)) : 'No bundles'),
  ],
  4: [
    (L) => cap(L.listing.hook),
    (L, d) => d.photoOptions.find((p) => p.id === L.listing.photo)?.label,
    (L) => join([...L.listing.includes.filter((x) => x !== 'other'), L.listing.includeOther]),
    (L) => `${L.listing.faq.length} questions answered`,
    (L) => `${L.listing.availability.length} time slots a week`,
    (L) => L.listing.spot,
    (L) => cap(L.listing.story),
    (L) => L_DEAL[L.listing.deal],
    () => 'Done',
    (L) => join(L.listing.moments.map((m) => MOMENTS.find((x) => x.id === m)?.label)) || 'None',
  ],
  5: [
    (L) => join(L.launch.groups.map((g) => L.launch.groupNames[g] || g)),
    (L) => join(L.launch.people),
    (L) => L_COMFORT[L.launch.comfort],
    (L) => join(L.launch.events.map((e) => CAMPUS_EVENTS.find((x) => x.id === e)?.name)) || 'None picked',
  ],
  6: [(L) => `${L.schedule.examWeeks.length} exam weeks`, (L) => `${L.schedule.capacity} orders a week`, (L) => L_NOTICE[L.schedule.notice], (L) => `Bake on ${L.schedule.batchDay}`],
  7: [(L) => L_FEEL[L.checkin.feeling]],
}
STAGES.forEach((st) => st.steps.forEach((step, i) => { step.a = SUMMARY[st.n]?.[i] }))

export const NEXT_LABEL = [
  'Next: Find your idea', 'Next: Validate your idea', 'Next: Set your price', 'Next: Build your listing',
  'Next: Find your first 10 customers', 'Next: Plan it around school', 'Next: Your monthly check-in', 'Finish: back to all stages',
]
