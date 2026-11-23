import React from 'react'
import { Check } from 'lucide-react'
import { PageHead } from '../ui'
import { FEES, SUBSCRIPTION } from '../launch/lib/config'

const pct = (n) => `${Math.round(n * 1000) / 10}%`

export default function Pricing() {
  const [t1, t2] = FEES.sellerTiers
  return (
    <div className="mx-auto max-w-4xl">
      <PageHead title="How StudentFlow makes money" />
      <p className="-mt-4 mb-8 text-lg text-muted">We give you the tools. We only make money when you make money.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-surface p-7">
          <div className="font-medium">Buying</div>
          <div className="mt-2 font-display text-4xl font-bold tnum">${FEES.buyerFlatFee.toFixed(2)}<span className="text-base font-medium text-muted"> per order</span></div>
          <ul className="mt-5 space-y-2.5 text-sm">
            {['Buyer Protection: money held until the code swap', 'Waived when you book the same seller again', 'Browsing and messaging are free'].map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-muted" />{f}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl bg-brandsoft/60 p-7">
          <div className="font-medium">Selling</div>
          <div className="mt-2 font-display text-4xl font-bold tnum">${SUBSCRIPTION.monthly}<span className="text-base font-medium text-muted">/month after your trial</span></div>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              `Free until your first ${FEES.trialEndsAfterSales} sales or ${SUBSCRIPTION.trialDays} days, whichever is later`,
              `${pct(t1.rate)} on your first ${t1.upToSales} sales, then ${pct(t2.rate)}`,
              `${pct(FEES.repeatCustomerRate)} when a regular rebooks you`,
              'Guided launch, listing tools, analytics and tax summary included',
            ].map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-muted" />{f}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
