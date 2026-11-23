import { FEES, SUBSCRIPTION, CAMPUS, WEEKS_PER_MONTH } from './config'

type Fees = typeof FEES

/** Seller rate for the seller's Nth completed sale (N starts at 1). Rebooks use the repeat rate. */
export function sellerRate(saleNumber: number, isRebook = false, fees: Fees = FEES): number {
  if (isRebook) return fees.repeatCustomerRate
  if (fees.sellerRateMode === 'flat') return fees.sellerFlatRate
  const n = Math.max(1, Math.floor(saleNumber))
  const tier = fees.sellerTiers.find((t) => n <= t.upToSales)
  return (tier ?? fees.sellerTiers[fees.sellerTiers.length - 1]).rate
}

export function buyerFee(isRebook = false, fees: Fees = FEES): number {
  return isRebook && fees.buyerFeeWaivedOnRebook ? 0 : fees.buyerFlatFee
}

export interface OrderMoney {
  price: number
  rate: number
  buyerFee: number
  buyerPays: number
  platformFee: number
  sellerTakeHome: number
  stripeCost: number
  platformNet: number
}

/** Money breakdown for one order at price p. */
export function orderMoney(p: number, opts: { saleNumber?: number; isRebook?: boolean; fees?: Fees } = {}): OrderMoney {
  const fees = opts.fees ?? FEES
  const isRebook = !!opts.isRebook
  const rate = sellerRate(opts.saleNumber ?? 1, isRebook, fees)
  const bf = buyerFee(isRebook, fees)
  const buyerPays = round(p + bf)
  const platformFee = round(p * rate)
  const sellerTakeHome = round(p - platformFee)
  const stripeCost = round(buyerPays * fees.stripePercent + fees.stripeFixed)
  const platformNet = round(platformFee + bf - stripeCost)
  return { price: p, rate, buyerFee: bf, buyerPays, platformFee, sellerTakeHome, stripeCost, platformNet }
}

export interface PlanInputs {
  price: number
  unitCost: number // materials per order
  hoursPerOrder: number // prep, cleanup, travel included
  monthlyGoal: number
  startupCosts: number
  hoursPerWeek: number
  saleNumber?: number
}

export interface PlanResult extends OrderMoney {
  profitPerOrder: number
  effectiveHourly: number
  ordersForGoal: number
  hoursForGoal: number
  paybackOrders: number
  hoursAvailablePerMonth: number
  warnings: { belowMinWage: boolean; overHours: boolean; negativePlatformNet: boolean }
}

export function plan(i: PlanInputs, minimumWage = CAMPUS.minimumWage): PlanResult {
  const m = orderMoney(i.price, { saleNumber: i.saleNumber ?? 1 })
  const profitPerOrder = round(m.sellerTakeHome - i.unitCost)
  const effectiveHourly = i.hoursPerOrder > 0 ? round(profitPerOrder / i.hoursPerOrder) : 0
  const ordersForGoal = profitPerOrder > 0 ? Math.ceil(i.monthlyGoal / profitPerOrder) : Infinity
  const hoursForGoal = ordersForGoal === Infinity ? Infinity : round(ordersForGoal * i.hoursPerOrder)
  const paybackOrders = i.startupCosts <= 0 ? 0 : profitPerOrder > 0 ? Math.ceil(i.startupCosts / profitPerOrder) : Infinity
  const hoursAvailablePerMonth = round(i.hoursPerWeek * WEEKS_PER_MONTH)
  return {
    ...m, profitPerOrder, effectiveHourly, ordersForGoal, hoursForGoal, paybackOrders, hoursAvailablePerMonth,
    warnings: {
      belowMinWage: effectiveHourly < minimumWage,
      overHours: hoursForGoal > hoursAvailablePerMonth,
      negativePlatformNet: m.platformNet < 0,
    },
  }
}

/** Smallest price at which StudentFlow's net on a first-tier order is not negative. */
export function minimumOrderForPositiveNet(fees: Fees = FEES): number {
  for (let p = 0.5; p < 100; p += 0.5) if (orderMoney(p, { fees }).platformNet >= 0) return p
  return 100
}

/** Subscription starts after the trial: 3 sales or 30 days, whichever comes later. */
export function subscriptionStart(firstListedAt: number, thirdSaleAt: number | null): number | null {
  if (thirdSaleAt == null) return null
  const thirtyDays = firstListedAt + SUBSCRIPTION.trialDays * 86400e3
  return Math.max(thirtyDays, thirdSaleAt)
}

export function round(n: number): number {
  return Math.round(n * 100) / 100
}
