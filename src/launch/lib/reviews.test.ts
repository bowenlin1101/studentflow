import { describe, it, expect } from 'vitest'
import { addToAverage, otherReviewVisible, daysUntilReveal } from './reviews'

const D = 86400e3
const r = (stars: number) => ({ stars, text: '', tags: [], at: 0 })

describe('rating average', () => {
  it('starts a new seller at the first rating', () => expect(addToAverage(0, 0, 4)).toEqual({ avg: 4, count: 1 }))
  it('blends into an existing average', () => expect(addToAverage(4.8, 30, 5)).toEqual({ avg: 4.81, count: 31 }))
  it('a low rating pulls the average down', () => expect(addToAverage(5, 1, 3)).toEqual({ avg: 4, count: 2 }))
})

describe('blind reveal', () => {
  const base = { completedAt: 0 }
  it('hides their review until I post mine', () => {
    expect(otherReviewVisible({ ...base, sellerReview: r(5) }, 'buyer', 1 * D)).toBe(false)
  })
  it('shows it once both have posted', () => {
    expect(otherReviewVisible({ ...base, sellerReview: r(5), buyerReview: r(4) }, 'buyer', 1 * D)).toBe(true)
  })
  it('shows it anyway after 7 days', () => {
    expect(otherReviewVisible({ ...base, sellerReview: r(5) }, 'buyer', 7 * D)).toBe(true)
  })
  it('nothing to show if they have not posted', () => {
    expect(otherReviewVisible({ ...base, buyerReview: r(5) }, 'buyer', 30 * D)).toBe(false)
  })
  it('counts down the days to reveal', () => {
    expect(daysUntilReveal(base, 2.5 * D)).toBe(5)
    expect(daysUntilReveal(base, 9 * D)).toBe(0)
  })
})
