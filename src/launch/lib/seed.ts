import type { Category, Moment } from './types'

// Seeded results from a (sample) campus survey: what students most want from other students.
export const SURVEY = { respondents: 412, top: [
  { category: 'tutoring' as Category, pct: 41, label: 'Tutoring' },
  { category: 'fitness' as Category, pct: 27, label: 'Sports and fitness' },
  { category: 'baked_goods' as Category, pct: 22, label: 'Baked goods' },
] }

export const MOMENTS: { id: Moment; label: string; date: string }[] = [
  { id: 'finals', label: 'Finals week', date: 'Dec 9–22' },
  { id: 'valentines', label: 'Valentine’s', date: 'Feb 14' },
  { id: 'formal', label: 'Formal season', date: 'Mar' },
  { id: 'graduation', label: 'Graduation', date: 'Jun' },
  { id: 'move_in', label: 'Move-in', date: 'Sep' },
  { id: 'homecoming', label: 'Homecoming', date: 'Oct' },
]
export const CURRENT_MOMENT: Moment = 'finals'

export const CAMPUS_EVENTS = [
  { id: 'e1', name: 'Last day of classes', when: 'Fri, Dec 4' },
  { id: 'e2', name: 'Fall exam period', when: 'Dec 9–22' },
  { id: 'e3', name: 'Winter term starts', when: 'Mon, Jan 4' },
  { id: 'e4', name: 'Clubs Week', when: 'Jan 18–22' },
  { id: 'e5', name: 'Valentine’s Day', when: 'Sun, Feb 14' },
  { id: 'e6', name: 'Reading Week', when: 'Feb 13–21' },
]

export const EXAM_WEEKS = [
  { id: 'fall-1', label: 'Dec 7–13', on: true },
  { id: 'fall-2', label: 'Dec 14–20', on: true },
  { id: 'winter-mid', label: 'Feb 22–28 (midterms)', on: false },
  { id: 'winter-1', label: 'Apr 12–18', on: true },
  { id: 'winter-2', label: 'Apr 19–25', on: true },
]

// Names used by the fast-fill buttons
export const SAMPLE_CONTACTS = [
  { contact: 'Jess (floor-mate)', response: 'preordered', quote: 'I’d take a box every Sunday honestly.' },
  { contact: 'Dev (Nutrition 2244)', response: 'would_pay', quote: 'The dining hall cookies are sad. Yes.' },
  { contact: 'Aisha (Dance club)', response: 'preordered', quote: 'Can you do 24 for our end-of-term social?' },
  { contact: 'Marcus (roommate)', response: 'interested', quote: '' },
  { contact: 'Lena (Biochem study group)', response: 'would_pay', quote: 'If you do a gluten-free one I’m in.' },
  { contact: 'Tom (Intramural soccer)', response: 'not_interested', quote: 'I’m not big on sweets.' },
] as const

// Data for the Stage 7 monthly check-in (Maya after one month)
export const MONTH_ONE = {
  orders: 18, singles: 14, bundles: 4, revenue: 291, rating: 4.9, reviews: 11, bookedWeeks: 3, weeks: 4,
  complaint: { theme: 'nut-free option', count: 3, quote: 'Would love a nut-free version for my roommate.' },
  repeatCustomers: 6,
}
