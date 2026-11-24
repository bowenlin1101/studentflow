// Two-way ratings after a completed order. Reviews stay hidden until both sides post,
// or until REVEAL_DAYS pass, so neither review can influence the other.
export const REVEAL_DAYS = 7
const DAY = 86400e3

export const REVIEW_TAGS = {
  // what a buyer can say about a seller
  seller: ['As described', 'On time', 'Friendly', 'Great value', 'Would order again'],
  // what a seller can say about a buyer
  buyer: ['On time', 'Friendly', 'Clear about what they wanted', 'Easy to work with'],
}

export interface Review { stars: number; text: string; tags: string[]; at: number }
export interface ReviewedOrder { completedAt?: number; buyerReview?: Review | null; sellerReview?: Review | null }

/** New average and count after adding one rating. */
export function addToAverage(avg: number, count: number, stars: number): { avg: number; count: number } {
  const c = Math.max(0, count)
  const next = c + 1
  return { avg: Math.round((((avg || 0) * c + stars) / next) * 100) / 100, count: next }
}

/** Can `side` see the review the other side wrote about them? */
export function otherReviewVisible(o: ReviewedOrder, side: 'buyer' | 'seller', now: number): boolean {
  const mine = side === 'buyer' ? o.buyerReview : o.sellerReview
  const theirs = side === 'buyer' ? o.sellerReview : o.buyerReview
  if (!theirs) return false
  if (mine) return true
  return o.completedAt != null && now >= o.completedAt + REVEAL_DAYS * DAY
}

/** Days left before reviews are revealed anyway. */
export function daysUntilReveal(o: ReviewedOrder, now: number): number {
  if (o.completedAt == null) return REVEAL_DAYS
  return Math.max(0, Math.ceil((o.completedAt + REVEAL_DAYS * DAY - now) / DAY))
}
