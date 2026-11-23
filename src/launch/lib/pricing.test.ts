import { describe, it, expect } from 'vitest'
import { sellerRate, buyerFee, orderMoney, plan, minimumOrderForPositiveNet, subscriptionStart } from './pricing'
import { FEES } from './config'

describe('seller rate tiers', () => {
  it('charges 8% on sales 1 to 10', () => {
    expect(sellerRate(1)).toBe(0.08)
    expect(sellerRate(10)).toBe(0.08)
  })
  it('drops to 6% from sale 11', () => {
    expect(sellerRate(11)).toBe(0.06)
    expect(sellerRate(100)).toBe(0.06)
    expect(sellerRate(101)).toBe(0.06)
  })
  it('uses the repeat-customer rate on a rebook, whatever the tier', () => {
    expect(sellerRate(1, true)).toBe(0.04)
    expect(sellerRate(500, true)).toBe(0.04)
  })
  it('supports flat mode', () => {
    expect(sellerRate(50, false, { ...FEES, sellerRateMode: 'flat' })).toBe(FEES.sellerFlatRate)
  })
})

describe('buyer protection fee', () => {
  it('is $1 on a first order', () => expect(buyerFee(false)).toBe(1))
  it('is waived when the same buyer rebooks', () => expect(buyerFee(true)).toBe(0))
  it('is charged on a rebook if the waiver is turned off', () => expect(buyerFee(true, { ...FEES, buyerFeeWaivedOnRebook: false })).toBe(1))
})

describe('order money', () => {
  it('splits a $30 tutoring session correctly', () => {
    const m = orderMoney(30)
    expect(m.buyerPays).toBe(31)
    expect(m.platformFee).toBe(2.4)
    expect(m.sellerTakeHome).toBe(27.6)
    expect(m.stripeCost).toBe(1.2) // 31 * 2.9% + 0.30 = 1.199
    expect(m.platformNet).toBe(2.2)
  })
  it('rebook: no buyer fee and 4% seller rate', () => {
    const m = orderMoney(30, { isRebook: true })
    expect(m.buyerPays).toBe(30)
    expect(m.platformFee).toBe(1.2)
    expect(m.platformNet).toBe(0.03) // 1.20 - (0.87 + 0.30)
  })
  it('goes negative on a tiny rebook order', () => {
    expect(orderMoney(3, { isRebook: true }).platformNet).toBeLessThan(0)
  })
  it('a minimum order size keeps net positive on first-time orders', () => {
    const min = minimumOrderForPositiveNet()
    expect(orderMoney(min).platformNet).toBeGreaterThanOrEqual(0)
  })
})

describe('plan', () => {
  const base = { price: 15, unitCost: 4, hoursPerOrder: 0.75, monthlyGoal: 250, startupCosts: 40, hoursPerWeek: 5 }
  it('computes profit, hourly, goal and payback', () => {
    const r = plan(base)
    expect(r.sellerTakeHome).toBe(13.8)
    expect(r.profitPerOrder).toBe(9.8)
    expect(r.effectiveHourly).toBe(13.07)
    expect(r.ordersForGoal).toBe(26) // ceil(250 / 9.8)
    expect(r.hoursForGoal).toBe(19.5)
    expect(r.paybackOrders).toBe(5) // ceil(40 / 9.8)
  })
  it('flags pay below minimum wage', () => {
    expect(plan(base, 17.6).warnings.belowMinWage).toBe(true)
    expect(plan({ ...base, price: 30 }, 17.6).warnings.belowMinWage).toBe(false)
  })
  it('flags a goal that needs more hours than the student has', () => {
    expect(plan({ ...base, hoursPerWeek: 2 }).warnings.overHours).toBe(true) // 19.5 > 8.6
    expect(plan({ ...base, hoursPerWeek: 5 }).warnings.overHours).toBe(false) // 19.5 <= 21.5
  })
  it('handles a price that never turns a profit', () => {
    const r = plan({ ...base, price: 3 })
    expect(r.ordersForGoal).toBe(Infinity)
    expect(r.paybackOrders).toBe(Infinity)
  })
})

describe('subscription start', () => {
  const d = 86400e3
  it('waits for the third sale', () => expect(subscriptionStart(0, null)).toBeNull())
  it('starts at 30 days if the third sale came sooner', () => expect(subscriptionStart(0, 5 * d)).toBe(30 * d))
  it('starts at the third sale if that came later', () => expect(subscriptionStart(0, 45 * d)).toBe(45 * d))
})

import { verdict } from './generators'
describe('demand verdict', () => {
  const L = (...r: string[]) => r.map((response) => ({ response: response as any }))
  it('go on 2 pre-orders', () => expect(verdict(L('preordered', 'preordered', 'not_interested')).verdict).toBe('go'))
  it('go on 4 would-pay', () => expect(verdict(L('would_pay', 'would_pay', 'would_pay', 'would_pay')).verdict).toBe('go'))
  it('tweak on interest without money', () => expect(verdict(L('interested', 'interested', 'would_pay', 'not_interested')).verdict).toBe('tweak'))
  it('rethink when mostly not interested', () => expect(verdict(L('not_interested', 'not_interested', 'not_interested', 'interested')).verdict).toBe('rethink'))
})
