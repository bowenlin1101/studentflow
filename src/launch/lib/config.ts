// All money and campus settings for the demo live here so they are easy to change.
export const FEES = {
  buyerFlatFee: 1.0, // "Buyer Protection", paid by the buyer per order (covers Stripe)
  buyerFeeWaivedOnRebook: true, // waived when the same buyer rebooks the same seller
  sellerRateMode: 'tiered' as 'tiered' | 'flat',
  sellerFlatRate: 0.08,
  sellerTiers: [
    // by the seller's sale number (lifetime completed sales, counting this one)
    { upToSales: 10, rate: 0.08 },
    { upToSales: Infinity, rate: 0.06 },
  ],
  repeatCustomerRate: 0.04, // seller rate when the same buyer rebooks the same seller on-platform
  stripePercent: 0.029, // paid by StudentFlow
  stripeFixed: 0.3,
  trialEndsAfterSales: 3,
}

export const SUBSCRIPTION = {
  monthly: 15, // CAD, starts after the trial
  trialDays: 30, // trial ends after 3 sales or 30 days, whichever comes later
}

export const CAMPUS = {
  name: 'Western University',
  short: 'Western',
  city: 'London, Ontario',
  currency: 'CAD',
  minimumWage: 17.6, // Ontario general minimum wage (Oct 2025). Update when the province changes it.
  spots: ['Weldon Library', 'UCC Atrium', 'Western Rec Centre', 'TD Stadium field', 'Social Science Centre', 'Natural Sciences Centre', 'Online (Zoom)'],
  internationalOffice: 'Western International (international student services)',
}

export const WEEKS_PER_MONTH = 4.3
