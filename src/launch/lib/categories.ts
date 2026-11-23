import type { Category, Day } from './types'
import { photos } from './photos'

type Opt = { id: string; label: string }
const o = (...labels: string[]): Opt[] => labels.map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label }))

export interface CategoryDef {
  id: Category; label: string; noun: string; unit: string; orderNoun: string
  targets: Opt[]; alternatives: Opt[]; differentiators: Opt[]
  dmTemplate: (target: string, name: string, edge: string) => string
  perSessionHint: string; timeHint: string; defaultMinutes: number
  startupItems: { id: string; name: string; cost: number }[]
  benchmarks: { label: string; range: string }[]; benchmarkLow: number; benchmarkHigh: number
  prices: { affordable: number; middle: number; premium: number }
  earnRange: [number, number]
  bundleLabel: string; bundles: (p: number) => { name: string; price: number; qty: number }[]
  shotList: string[]; photoOptions: { id: string; label: string }[]
  includes: string[]; faq: { q: string; a: (ctx: { spot: string; notice: string }) => string }[]
  hookTemplates: (target: string) => string[]
  groupPitch: (price: number) => string; dropPitch: string
}

const tenOff = (n: number) => Math.round(n * 0.9 * 2) / 2

export const CATEGORIES: Record<Category, CategoryDef> = {
  tutoring: {
    id: 'tutoring', label: 'Tutoring', noun: 'tutoring', unit: '/session', orderNoun: 'session',
    targets: o('Students in a specific class', 'First-years', 'Students prepping for an exam (MCAT, LSAT)'),
    alternatives: o('Campus learning help centre', 'YouTube', 'Office hours', 'Nothing, they struggle'),
    differentiators: o('I aced that exact class', 'I’m available late before exams', 'I explain things simply'),
    dmTemplate: (t, n, e) => `Hey! I’m ${n}. I’m starting small tutoring sessions for ${t}. ${e ? e + '. ' : ''}Would a 1-hour session before the midterm help you? Happy to answer questions first.`,
    perSessionHint: 'Printing practice questions, bus fare, a coffee for the session.',
    timeHint: 'A 1-hour session usually takes about 80 minutes with prep and walking to meet.',
    defaultMinutes: 80,
    startupItems: [{ id: 'whiteboard', name: 'Mini whiteboard + markers', cost: 25 }, { id: 'print', name: 'Printing practice sets', cost: 10 }],
    benchmarks: [{ label: 'Online tutoring services', range: '$30–60/hr' }, { label: 'Learning help centre', range: 'Free (long waits before exams)' }],
    benchmarkLow: 30, benchmarkHigh: 60,
    prices: { affordable: 22, middle: 28, premium: 38 }, earnRange: [180, 520],
    bundleLabel: 'Want to offer session packages?',
    bundles: (p) => [{ name: '4-session pack', price: tenOff(p * 4), qty: 4 }],
    shotList: ['Whiteboard mid-explanation', 'Your study notes, neat and readable', 'You and a student working together'],
    photoOptions: [{ id: 'tutor-whiteboard', label: 'Whiteboard mid-explanation' }, { id: 'tutor-notes', label: 'Study notes' }, { id: 'tutor-group', label: 'Working together' }, { id: 'tutor-laptop', label: 'Online session' }],
    includes: ['1-hour session', 'Practice questions', 'Summary notes after', 'Message support before the exam'],
    faq: [
      { q: 'Can you help with my assignment?', a: () => 'I’ll help you understand the material and practise similar questions. I won’t do graded work.' },
      { q: 'Where do we meet?', a: ({ spot }) => `Usually at ${spot}. Online works too.` },
      { q: 'How far ahead should I book?', a: ({ notice }) => `${notice} notice is best. Exam weeks fill up fast.` },
      { q: 'What if I need to cancel?', a: () => 'Cancel up to 12 hours before for a full refund.' },
    ],
    hookTemplates: (t) => [`I help stressed ${t} pass their midterm`, `I help ${t} actually understand the material`, `I help ${t} get ready for exams without cramming`],
    groupPitch: (p) => `Group review before the midterm: up to 4 people, $${Math.round(p * 2.5)} total. Split it with your study group.`,
    dropPitch: 'Midterm review slots open now. Book by Sunday to get your pick of times.',
  },
  fitness: {
    id: 'fitness', label: 'Fitness', noun: 'fitness coaching', unit: '/session', orderNoun: 'session',
    targets: o('Beginners who feel lost at the gym', 'Students training for a race or tryout', 'Friends who want a workout partner'),
    alternatives: o('Figure it out alone', 'Gym personal trainer', 'Apps or YouTube', 'Nothing'),
    differentiators: o('I’ve played competitively', 'I’m patient with beginners', 'I’m cheaper and more flexible'),
    dmTemplate: (t, n, e) => `Hey! I’m ${n}. I’m running 1:1 sessions for ${t} at the Rec Centre. ${e ? e + '. ' : ''}Want to try one this week? I’ll build you a simple plan to keep.`,
    perSessionHint: 'Equipment wear, a resistance band you hand out, transport.',
    timeHint: 'A 1-hour session is usually about 75 minutes with planning and getting there.',
    defaultMinutes: 75,
    startupItems: [{ id: 'bands', name: 'Resistance bands set', cost: 30 }, { id: 'cones', name: 'Agility cones', cost: 15 }],
    benchmarks: [{ label: 'Gym personal trainer', range: '$50–80/session' }, { label: 'Fitness apps', range: '$15–30/month' }],
    benchmarkLow: 50, benchmarkHigh: 80,
    prices: { affordable: 20, middle: 28, premium: 38 }, earnRange: [150, 480],
    bundleLabel: 'Want to offer a multi-session plan?',
    bundles: (p) => [{ name: '4-session plan', price: tenOff(p * 4), qty: 4 }],
    shotList: ['You mid-session with a client', 'The spot you train at', 'Equipment laid out and ready'],
    photoOptions: [{ id: 'fit-deadlift', label: 'Mid-lift, coaching form' }, { id: 'fit-barbell', label: 'Training session' }, { id: 'fit-core', label: 'Home workout' }, { id: 'fit-gym', label: 'The gym floor' }],
    includes: ['1-hour session', 'A plan to keep', 'Form check videos', 'Check-in message after'],
    faq: [
      { q: 'I’m a complete beginner. Is that OK?', a: () => 'Yes. Most of my clients start from zero. We go at your pace.' },
      { q: 'Where do sessions happen?', a: ({ spot }) => `At ${spot}. You’ll need your own access if it’s the Rec Centre.` },
      { q: 'Do I need to sign anything?', a: () => 'Yes, a short waiver at booking. It’s included in the checkout.' },
      { q: 'What should I bring?', a: () => 'Water, running shoes and comfy clothes.' },
    ],
    hookTemplates: (t) => [`I help ${t} feel confident in the gym`, `I help ${t} build a routine that sticks`, `I help ${t} hit their first real PR`],
    groupPitch: (p) => `Small-group session for your team or floor: up to 5 people, $${Math.round(p * 3)} total.`,
    dropPitch: 'New-term reset: 4-session plans open this week only.',
  },
  baked_goods: {
    id: 'baked_goods', label: 'Baked goods', noun: 'baking', unit: '/box of 6', orderNoun: 'box',
    targets: o('Students who miss home baking', 'Clubs and events', 'Parents sending care packages'),
    alternatives: o('Store-bought', 'Local bakery', 'Dining hall dessert', 'Nothing'),
    differentiators: o('Homemade taste', 'Custom orders', 'Delivered on campus'),
    dmTemplate: (t, n, e) => `Hey! I’m ${n}. I’m baking small batches for ${t}. ${e ? e + '. ' : ''}Would you want a box of 6 this week? I can drop it off on campus.`,
    perSessionHint: '',
    timeHint: 'A batch usually takes about 45 minutes per box with mixing, baking, packing and walking to meet.',
    defaultMinutes: 45,
    startupItems: [{ id: 'pans', name: 'Baking sheets (2)', cost: 24 }, { id: 'boxes', name: 'Pastry boxes (25)', cost: 18 }, { id: 'scale', name: 'Kitchen scale', cost: 15 }],
    benchmarks: [{ label: 'Bakery cookie', range: '$3–4 each ($18–24 for 6)' }, { label: 'Grocery store cookies', range: '$5–7 for 12' }],
    benchmarkLow: 18, benchmarkHigh: 24,
    prices: { affordable: 12, middle: 15, premium: 19 }, earnRange: [120, 400],
    bundleLabel: 'Want to offer bundles?',
    bundles: (p) => [{ name: 'Box of 6', price: p, qty: 1 }, { name: 'Box of 12', price: tenOff(p * 2), qty: 2 }],
    shotList: ['A cookie broken open showing the inside', 'A full box from above', 'Natural light, plain background'],
    photoOptions: [{ id: 'cookie-broken', label: 'Broken open, showing the inside' }, { id: 'cookie-basket', label: 'A full basket' }, { id: 'cookie-sprinkle', label: 'One hero cookie' }, { id: 'brownies', label: 'Brownies stacked' }],
    includes: ['6 cookies', 'Gift box', 'Ingredient list', 'Delivered on campus'],
    faq: [
      { q: 'What allergens are in them?', a: () => 'Listed on the order page. I bake in a home kitchen that also handles nuts.' },
      { q: 'How fresh are they?', a: ({ notice }) => `Baked the day before pick-up. Order with ${notice.toLowerCase()} notice.` },
      { q: 'Can I order for an event?', a: () => 'Yes! Boxes of 24+ for clubs and events. Message me a week ahead.' },
      { q: 'Where do I pick up?', a: ({ spot }) => `At ${spot}, or I can drop off on campus.` },
    ],
    hookTemplates: (t) => [`I help ${t} get a taste of home`, `I bake small-batch cookies for ${t}`, `I help ${t} treat themselves between classes`],
    groupPitch: (p) => `Cookies for your next club meeting: 24 for $${Math.round(p * 4 * 0.9)}. Order a week ahead.`,
    dropPitch: 'Valentine’s box: 6 heart cookies in a gift box. Order by Feb 10 for Feb 13–14 pick-up.',
  },
}

export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const BAKING_INGREDIENTS = [
  { id: 'flour', name: 'Flour (2 cups)', cost: 0.8 }, { id: 'sugar', name: 'Sugar (1.5 cups)', cost: 0.9 },
  { id: 'butter', name: 'Butter (1 cup)', cost: 2.6 }, { id: 'eggs', name: 'Eggs (2)', cost: 0.9 },
  { id: 'chips', name: 'Chocolate chips (1 bag)', cost: 3.5 }, { id: 'packaging', name: 'Boxes and stickers (4)', cost: 3.0 },
]

export const photoFor = (id: string) => photos[id] ?? photos['cookie-broken']
