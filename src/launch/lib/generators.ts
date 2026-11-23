// Every "AI-written" output in the demo comes through generate(). Today each kind is a
// deterministic template, so the pitch never depends on a network. Later, swap the body of
// generate() for a Claude API call; the UI only depends on the kinds and return types.
import { CATEGORIES } from './categories'
import { SURVEY, MONTH_ONE } from './seed'
import type { Category, Comfort, Feeling, Idea, LaunchPlanStep, Response, Student, Verdict } from './types'

export interface GenInputs {
  ideas: { helpWith: string[]; passion: string; workStyle?: string; hoursPerWeek?: string; budget?: string; major?: string }
  dm: { category: Category; target: string; name: string; edge: string }
  interviewQuestions: { category: Category; target: string }
  hooks: { category: Category; target: string }
  faq: { category: Category; picked: string[]; spot: string; notice: string }
  story: { name: string; year: string; major: string; category: Category; passion: string }
  launchPlan: { category: Category; comfort: Comfort; groups: { type: string; name: string }[]; people: string[]; price: number; title: string; link: string }
  checkin: { feeling: Feeling; price: number; category: Category }
  reflect: ReflectInputs
}
export interface GenOutputs {
  ideas: Idea[]
  dm: string
  interviewQuestions: string[]
  hooks: string[]
  faq: { q: string; a: string }[]
  story: string
  launchPlan: LaunchPlanStep[]
  checkin: { title: string; body: string; action?: string }[]
  reflect: Reflection
}
export type Kind = keyof GenInputs

const T: { [K in Kind]: (i: GenInputs[K]) => GenOutputs[K] } = {
  reflect: (i) => reflection(i),
  ideas: (i) => {
    const s = (cat: Category, chip: string, style: string) => {
      let fit = 45
      if (i.helpWith.includes(chip)) fit += 30
      if (i.workStyle === style) fit += 15
      if (i.hoursPerWeek && i.hoursPerWeek !== '1-2') fit += 5
      if (cat === 'baked_goods' && i.budget === '0') fit -= 12
      return Math.max(35, Math.min(97, fit))
    }
    const topic = i.passion?.trim()
    const demand = (c: Category) => { const d = SURVEY.top.find((t) => t.category === c)!; return `${d.pct}% of ${SURVEY.respondents} surveyed students want ${d.label.toLowerCase()} from a fellow student` }
    const out: Idea[] = [
      { id: 'baked', category: 'baked_goods', name: 'Small-batch cookie boxes', fit: s('baked_goods', 'baking', 'making'),
        reason: i.helpWith.includes('baking') ? `Friends already ask you for baking${topic ? `, and you could talk about ${topic.toLowerCase()} for hours` : ''}. Home-baked boxes are a top-3 request here.` : 'Baked goods are a top-3 request on campus, and start-up costs are low.', demand: demand('baked_goods') },
      { id: 'tutor', category: 'tutoring', name: i.major ? `${i.major} tutoring` : 'First-year course tutoring', fit: s('tutoring', 'class', 'teaching'),
        reason: i.helpWith.includes('class') ? 'Friends ask you to explain classes, and tutoring is the #1 request on campus.' : 'Tutoring is the most requested service on campus, and it costs nothing to start.', demand: demand('tutoring') },
      { id: 'fit', category: 'fitness', name: 'Beginner gym sessions', fit: s('fitness', 'workouts', 'coaching'),
        reason: i.helpWith.includes('workouts') ? 'People ask you about workouts, and lots of first-years feel lost at the Rec Centre.' : 'Fitness coaching is the #2 request, and the Rec Centre is right there.', demand: demand('fitness') },
    ]
    return out.sort((a, b) => b.fit - a.fit)
  },
  dm: (i) => CATEGORIES[i.category].dmTemplate(i.target.toLowerCase(), i.name, i.edge),
  interviewQuestions: (i) => {
    const thing = { tutoring: 'help with a class', fitness: 'help with training', baked_goods: 'a treat or baked goods' }[i.category]
    return [
      `When did you last pay for ${thing}? What was that like?`,
      `What did you do the last time you needed ${thing} and couldn’t get it?`,
      'What’s the most annoying part of how you handle it now?',
      'How much did you spend on it last month, roughly?',
      `Who else do you know who has this problem?`,
    ]
  },
  hooks: (i) => CATEGORIES[i.category].hookTemplates(i.target.toLowerCase()),
  faq: (i) => CATEGORIES[i.category].faq.filter((f) => i.picked.includes(f.q)).map((f) => ({ q: f.q, a: f.a({ spot: i.spot, notice: i.notice }) })),
  story: (i) => {
    const why = { tutoring: 'I remember how confusing it was the first time', fitness: 'I love helping people feel at home in the gym', baked_goods: 'I bake every Sunday and my floor eats most of it' }[i.category]
    return `${i.year}-year ${i.major} student at Western. ${why}.`
  },
  launchPlan: (i) => {
    const c = CATEGORIES[i.category]
    const first = i.people.filter(Boolean)[0] || 'a friend'
    const group = i.groups[0]?.name || 'your club'
    const steps: LaunchPlanStep[] = [
      { day: 1, title: `Message ${first} and 4 others 1:1`, channel: 'Direct message', message: `Hey ${first.split(' ')[0]}! I just launched ${i.title} on StudentFlow. You said you’d try it, so you get first dibs: ${i.link}` },
      { day: 2, title: 'Ask two friends to pass it on', channel: 'Direct message', message: `Could you send this to one person who’d like it? It really helps me get started: ${i.link}` },
      { day: 4, title: `Pitch ${group}`, channel: 'Group order', message: c.groupPitch(i.price) },
    ]
    if (i.comfort !== 'not_at_all') steps.push({ day: 5, title: i.comfort === 'anywhere' ? 'Post to your story with the QR code' : 'Share in your close-friends story', channel: 'Social', message: `Launched! ${i.title}. First 5 customers get the launch deal. ${i.link}` })
    steps.push(
      { day: 8, title: 'Open a pre-order drop for the next campus moment', channel: 'Pre-order', message: c.dropPitch },
      { day: 10, title: 'Ask your first customers for a review', channel: 'Automatic', message: 'Sent for you after each completed sale: “How was it? A quick review helps other students find me.”' },
      { day: 14, title: 'Check what sold and adjust', channel: 'Dashboard', message: 'Look at which bundle sold best and what people asked in chat.' },
    )
    return steps
  },
  checkin: (i) => {
    const m = MONTH_ONE
    if (i.feeling !== 'want_more') return [
      { title: 'Staying small is a win', body: `You made $${m.revenue} this month with a ${m.rating} rating. If this pace fits around school, keep it. Nothing needs to grow.` },
      { title: 'Protect your time', body: 'Turn on finals pause before Dec 9 so your listing switches to a waitlist instead of taking orders.', action: 'Set up finals pause' },
    ]
    const tips = []
    if (m.bookedWeeks >= 3) tips.push({ title: `Raise your price to $${(i.price + 2).toFixed(0)}`, body: `You were fully booked ${m.bookedWeeks} of ${m.weeks} weeks and your rating is ${m.rating}. A $2 increase usually doesn’t slow orders at this point.`, action: 'Update price' })
    if (m.singles / m.orders > 0.6) tips.push({ title: 'Push the bigger bundle', body: `${m.singles} of ${m.orders} orders were single boxes. Feature the box of 12 at the top of your listing.`, action: 'Feature bundle' })
    tips.push({ title: `Add a ${m.complaint.theme}`, body: `${m.complaint.count} reviews asked for it: “${m.complaint.quote}”` })
    return tips.slice(0, 2)
  },
}

export function generate<K extends Kind>(kind: K, inputs: GenInputs[K]): Promise<GenOutputs[K]> {
  return Promise.resolve(T[kind](inputs))
}
/** Synchronous access for live previews. */
export function generateNow<K extends Kind>(kind: K, inputs: GenInputs[K]): GenOutputs[K] {
  return T[kind](inputs)
}

export function verdict(log: { response: Response }[]): { verdict: Verdict; pre: number; pay: number; interested: number; no: number; score: number } {
  const c = (r: Response) => log.filter((l) => l.response === r).length
  const pre = c('preordered'), pay = c('would_pay'), interested = c('interested'), no = c('not_interested')
  const score = pre * 4 + pay * 2 + interested * 0.5 // pre-orders weigh most: money beats opinions
  const v: Verdict = pre >= 2 || pay + pre >= 4 ? 'go' : log.length >= 3 && no / log.length > 0.6 ? 'rethink' : 'tweak'
  return { verdict: v, pre, pay, interested, no, score }
}


// ---------------------------------------------------------------------------
// Reflect: what happened after the student messaged 10 people, and what to change.
export interface ReflectInputs {
  sent: number; replied: number; interested: number; chats: number; sales: number; views: number
  price: number; benchmarkLow: number; feeling: Feeling | ''; category: Category
}
export interface ReflectTip { title: string; body: string; action?: { label: string; stage: number } }
export interface Reflection { verdict: 'sold' | 'interest' | 'low'; headline: string; tips: ReflectTip[] }

// Stage numbers the suggestions link back to
const STAGE = { pick: 1, price: 2, listing: 3, reach: 4, school: 6 }

export function reflection(i: ReflectInputs): Reflection {
  const verdict: Reflection['verdict'] = i.sales > 0 ? 'sold' : i.interested + i.chats >= 3 ? 'interest' : 'low'
  const c = CATEGORIES[i.category]
  const tips: ReflectTip[] = []
  if (verdict === 'sold') {
    tips.push({ title: 'Ask for a review and a referral', body: 'Reviews are what make strangers trust a new listing. Send this to your first customers today.' })
  }
  if (verdict === 'interest') {
    if (i.price > c.prices.middle) tips.push({ title: `Try ${'$'}${c.prices.middle} for your first few sales`, body: 'People were interested but didn’t buy. A lower launch price often turns maybes into first orders, and reviews let you raise it later.', action: { label: 'Edit my price', stage: STAGE.price } })
    tips.push({ title: 'Sharpen your photo and hook', body: `${i.views} people opened your listing but only ${i.chats} started a chat. A clearer photo and a more specific first line usually lift that.`, action: { label: 'Edit my listing', stage: STAGE.listing } })
    tips.push({ title: 'Follow up with the maybes', body: 'People who said “interested” often just need a nudge with a specific time: “I have a slot Sunday at 2. Want it?”', action: { label: 'Back to my messages', stage: STAGE.reach } })
  }
  if (verdict === 'low') {
    tips.push({ title: 'Try a different group', body: `Only ${i.replied} of ${i.sent} people replied. Message 10 people from a different group, like a club or class that has this problem more often.`, action: { label: 'Message a new group', stage: STAGE.reach } })
    tips.push({ title: 'Or try your second idea', body: 'Some ideas just don’t land on a given campus. That’s useful to learn in a week instead of a semester.', action: { label: 'Back to my ideas', stage: STAGE.pick } })
  }
  if (verdict !== 'low' && i.feeling === 'want_more') {
    tips.push({ title: 'Pitch a group order', body: c.groupPitch(i.price) })
    tips.push({ title: 'Open a pre-order drop', body: c.dropPitch })
  }
  if (i.feeling === 'happy' || i.feeling === 'want_less') {
    tips.push({ title: 'Staying small is a win', body: 'If this pace fits around school, keep it. Turn on finals pause so your listing takes a waitlist instead of orders during exams.', action: { label: 'Set up finals pause', stage: STAGE.school } })
  }
  const headline = {
    sold: i.sales === 1 ? 'You made your first sale!' : `You made ${i.sales} sales!`,
    interest: 'People are interested. Now turn them into buyers.',
    low: 'Not much interest yet. Here’s what to try.',
  }[verdict]
  return { verdict, headline, tips: tips.slice(0, 4) }
}

export const REVIEW_REQUEST = (name: string, title: string) =>
  `Hey! Thanks so much for your order. If you liked it, could you leave a quick review on StudentFlow? It really helps other students find me. And if you know anyone who’d want one, send them my way!`
