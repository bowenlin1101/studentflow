// Every answer is stored as structured data. Aggregated across students and campuses,
// it shows real local prices, conversion rates and demand by campus moment.
export type Category = 'tutoring' | 'fitness' | 'baked_goods'
export type Year = '1st' | '2nd' | '3rd' | '4th' | 'Grad'
export type WorkStyle = 'making' | 'teaching' | 'coaching'
export type HoursBand = '1-2' | '3-5' | '6-10' | '10+'
export type FinalsBand = '0' | '1-2' | '3-5' | 'same'
export type Budget = '0' | 'under50' | 'under200' | 'more'
export type Positioning = 'affordable' | 'middle' | 'premium'
export type Comfort = 'not_at_all' | 'close_friends' | 'anywhere'
export type Notice = 'same_day' | '1_day' | '2_days'
export type Feeling = 'want_more' | 'happy' | 'want_less'
export type Response = 'not_interested' | 'interested' | 'would_pay' | 'preordered'
export type Moment = 'finals' | 'valentines' | 'move_in' | 'formal' | 'graduation' | 'homecoming'
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type Block = 'morning' | 'afternoon' | 'evening'

/** A tappable answer: a known option id, or "other" with free text. */
export interface Choice<T extends string = string> { value: T | 'other'; other?: string }

export interface Student {
  name: string; year: Year; major: string; campus: string
  studyPermit: 'yes' | 'no' | 'not_sure'
  hoursPerWeek: HoursBand; hoursFinals: FinalsBand; startupBudget: Budget; workStyle: WorkStyle
  helpWith: string[]; passion: string; groups: { type: string; name: string }[]
}

export interface Idea { id: string; name: string; category: Category; fit: number; reason: string; demand: string }

export interface ValidationEntry { id: string; contact: string; response: Response; quote?: string }
export interface Validation {
  target: Choice; targetClass?: string; alternative: Choice; differentiators: string[]; differentiatorOther?: string
  log: ValidationEntry[]
}
export type Verdict = 'go' | 'tweak' | 'rethink'

export interface Ingredient { id: string; name: string; cost: number; on: boolean }
export interface PricingInputs {
  ingredients: Ingredient[]; batchYield: number; itemsPerOrder: number
  perSessionCost: number; minutesPerOrder: number
  startupItems: { id: string; name: string; cost: number; on: boolean }[]
  benchmarkLow: number; benchmarkHigh: number
  positioning: Positioning; monthlyGoal: number; bundles: boolean; price?: number
}

export interface Bundle { name: string; price: number; qty: number }
export interface Listing {
  id: string; sellerId: string; title: string; hook: string; category: Category; heroImage: string
  includes: string[]; price: number; unit: string; bundles: Bundle[]
  availability: { day: Day; block: Block }[]; meetLocation: string; story: string
  faq: { q: string; a: string }[]; allergens?: string[]; launchDeal?: 'ten_off' | 'free_extra' | 'none'
  momentTags: Moment[]; waiver?: boolean; paused?: boolean
}

export interface LaunchPlanStep { day: number; title: string; channel: string; message: string; done?: boolean }
export interface Schedule { examWeeks: string[]; capacityPerWeek: number; notice: Notice; batchDays: Day[]; pausedForFinals: boolean }
