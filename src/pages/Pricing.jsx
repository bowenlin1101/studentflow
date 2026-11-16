import React from 'react'
import { Check } from 'lucide-react'
import { useStore } from '../store'
import { PLANS } from '../data'
import { Btn, PageHead } from '../ui'

const FEATURES = {
  free: ['Browse and search the marketplace', 'Buy with held payments and code swap', 'Message sellers', 'First guide in each topic'],
  founder: ['Everything in Free', 'Post unlimited listings', 'Seller dashboard: sales, impressions, conversion', 'Full resource library', 'Weekly live webinars + recordings'],
  coach: ['Everything in Founder', '3 × 45-min expert sessions a month on Zoom', 'Unused sessions roll over (up to 5)', 'Priority webinar Q&A'],
}

export default function Pricing() {
  const { me, dispatch, toast } = useStore()
  return (
    <div>
      <PageHead eyebrow="Plans" title="Pick the plan that fits your stage" sub="Buying is always free. Cancel any time. Sellers pay a 7.5% fee per completed sale." />
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(PLANS).map(([k, p]) => {
          const current = me.plan === k
          return (
            <div key={k} className={`flex flex-col rounded-2xl border p-6 ${k === 'coach' ? 'border-brand bg-brandsoft/40' : 'border-line bg-surface'}`}>
              <div className="flex items-center justify-between"><div className="font-display text-lg font-semibold">{p.name}</div>{k === 'coach' && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">Most support</span>}</div>
              <div className="mt-3 font-display text-4xl font-bold tnum">${p.price}<span className="text-base font-medium text-muted">/month</span></div>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">{FEATURES[k].map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-success" />{f}</li>)}</ul>
              {me.role !== 'expert' && (
                <Btn className="mt-6 w-full" variant={current ? 'outline' : k === 'coach' ? 'primary' : 'outline'} disabled={current}
                  onClick={() => { dispatch({ type: 'plan', userId: me.id, plan: k }); toast(`Switched to ${p.name} (demo, no charge)`) }}>
                  {current ? 'Current plan' : k === 'free' ? 'Downgrade' : `Choose ${p.name}`}
                </Btn>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
