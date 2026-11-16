import React from 'react'
import { Check } from 'lucide-react'
import { useStore } from '../store'
import { PLANS } from '../data'
import { Btn, PageHead } from '../ui'

const FEATURES = {
  free: ['Browse and buy', 'Message sellers'],
  founder: ['Sell on the marketplace', 'Seller dashboard', 'Full library + webinars'],
  coach: ['Everything in Founder', '3 expert sessions a month', 'Unused sessions roll over'],
}

export default function Pricing() {
  const { me, dispatch, toast } = useStore()
  return (
    <div>
      <PageHead title="Plans" />
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(PLANS).map(([k, p]) => {
          const current = me.plan === k
          return (
            <div key={k} className={`flex flex-col rounded-3xl p-7 ${k === 'coach' ? 'bg-brandsoft/60' : 'bg-surface'}`}>
              <div className="flex items-center justify-between"><div className="font-display text-lg font-semibold">{p.name}</div></div>
              <div className="mt-3 font-display text-4xl font-bold tnum">${p.price}<span className="text-base font-medium text-muted">/month</span></div>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">{FEATURES[k].map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-muted" />{f}</li>)}</ul>
              {me.role !== 'expert' && (
                <Btn className="mt-6 w-full" variant={current ? 'outline' : k === 'coach' ? 'primary' : 'outline'} disabled={current}
                  onClick={() => { dispatch({ type: 'plan', userId: me.id, plan: k }); toast(`Now on ${p.name}`) }}>
                  {current ? 'Current' : 'Choose'}
                </Btn>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
