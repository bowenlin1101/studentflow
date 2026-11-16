// Seed data for the investor prototype. Everything is relative to "now" so the demo always looks fresh.
const H = 3600e3
const D = 24 * H

export const CATEGORIES = ['Tutoring', 'Merch', 'Textbooks', 'Creative', 'Food', 'Home', 'Services', 'Tech']

export const SPOTS = [
  'UCC Atrium', 'Weldon Library entrance', 'Ivey Building lobby', 'Natural Sciences Centre',
  'Western Rec Centre', 'Social Science Centre', 'Online (Zoom)',
]

export const PLANS = {
  free: { name: 'Free', price: 0, blurb: 'Browse, buy and message sellers' },
  founder: { name: 'Founder', price: 45, blurb: 'Sell on the marketplace + full resource library' },
  coach: { name: 'Founder + Coaching', price: 100, blurb: 'Everything in Founder + 3 expert sessions a month' },
}

export function seed() {
  const now = Math.floor(Date.now() / H) * H
  const users = {
    u_alex: { id: 'u_alex', name: 'Alex Rivera', email: 'alex.rivera@uwo.ca', program: 'BMSc, Year 2', plan: 'free', role: 'student', hue: 210 },
    u_priya: { id: 'u_priya', name: 'Priya Patel', email: 'priya.patel@uwo.ca', program: 'Ivey HBA, Year 4', plan: 'founder', role: 'student', shop: 'Mustang Prints', hue: 330 },
    u_jordan: { id: 'u_jordan', name: 'Jordan Lee', email: 'jordan.lee@uwo.ca', program: 'Computer Science, Year 3', plan: 'coach', role: 'student', shop: 'Lee Studio', hue: 160,
      credits: { monthly: 3, usedThisMonth: 1, rolledOver: 2, cap: 5 } },
    u_okafor: { id: 'u_okafor', name: 'Dr. Sarah Okafor', email: 'sarah.okafor@studentflow.ca', role: 'expert', hue: 20,
      expertise: 'Retail & e-commerce', bio: '12 years scaling direct-to-consumer brands. Helps founders with pricing, sourcing and first 100 customers.' },
    u_bell: { id: 'u_bell', name: 'Marcus Bell', role: 'expert', hue: 260, expertise: 'Finance & fundraising',
      bio: 'Former startup CFO. Unit economics, bookkeeping set-up and pitching to angel investors.' },
    u_haddad: { id: 'u_haddad', name: 'Lina Haddad', role: 'expert', hue: 300, expertise: 'Marketing & brand',
      bio: 'Brand strategist. Social content, campus ambassador programs and launch campaigns.' },
    u_sharma: { id: 'u_sharma', name: 'Dev Sharma', role: 'expert', hue: 190, expertise: 'Product & tech',
      bio: 'Product lead turned advisor. No-code MVPs, user interviews and app launches.' },
    u_emily: { id: 'u_emily', name: 'Emily Zhang', program: 'Math, Year 4', role: 'student', plan: 'founder', shop: 'Calc Clinic', hue: 45 },
    u_sam: { id: 'u_sam', name: 'Sam Nguyen', program: 'Economics, Year 3', role: 'student', plan: 'founder', shop: 'Sam’s Textbooks', hue: 100 },
    u_chloe: { id: 'u_chloe', name: 'Chloe Martin', program: 'MIT, Year 2', role: 'student', plan: 'founder', shop: 'Wick & Willow', hue: 15 },
    u_omar: { id: 'u_omar', name: 'Omar Farouk', program: 'Kinesiology, Year 3', role: 'student', plan: 'founder', shop: 'Move Day Crew', hue: 230 },
    u_ben: { id: 'u_ben', name: 'Ben Carter', program: 'Foods & Nutrition, Year 4', role: 'student', plan: 'founder', shop: 'Prep’d', hue: 130 },
  }

  const at = (days, hour) => { const d = new Date(now + days * D); d.setHours(hour, 0, 0, 0); return d.getTime() }
  const L = (id, sellerId, title, category, kind, fulfillment, price, unit, description, extra = {}) => ({
    id, sellerId, title, category, kind, fulfillment, price, unit, description,
    rating: 4.8, reviews: 12, impressions: 1800, views: 240, sales: 18, createdAt: now - 20 * D, active: true, ...extra,
  })

  const listings = [
    L('l_hoodie', 'u_priya', 'Custom embroidered faculty hoodie', 'Merch', 'product', 'meetup', 58, 'each',
      'Heavyweight hoodie with your faculty, year and name embroidered on the sleeve. Pick from 6 colours. Made to order in 5 days, picked up on campus.',
      { rating: 4.9, reviews: 41, impressions: 6400, views: 910, sales: 63, tags: ['made to order', 'gift'] }),
    L('l_stickers', 'u_priya', 'Western sticker pack (12 vinyl)', 'Merch', 'product', 'meetup', 12, 'pack',
      'Waterproof vinyl stickers: UC Hill, the Mustang, Concrete Beach and more. Laptop-safe.',
      { rating: 4.7, reviews: 28, impressions: 3900, views: 520, sales: 88 }),
    L('l_totes', 'u_priya', 'Screen-printed club tote bags (bulk)', 'Merch', 'product', 'shipping', 14, 'each',
      'Minimum 20 bags. Send us your club logo and we will print and ship within 10 days. Great for frosh kits.',
      { rating: 5.0, reviews: 6, impressions: 1100, views: 140, sales: 7 }),
    L('l_calc', 'u_emily', 'Calculus 1000 tutoring', 'Tutoring', 'service', 'in-person', 35, '/hr',
      'Got 97% in Calc 1000 and 1501. One-on-one sessions in Weldon, focused on past midterms and problem sets.',
      { rating: 4.9, reviews: 54, impressions: 5200, views: 800, sales: 120 }),
    L('l_econ', 'u_sam', 'ECON 1021 textbook + study notes', 'Textbooks', 'product', 'meetup', 45, 'each',
      'Mankiw 9th edition, lightly highlighted. Includes my 40-page summary notes that got me an A.',
      { rating: 4.6, reviews: 9, impressions: 1500, views: 260, sales: 14 }),
    L('l_headshots', 'u_jordan', 'LinkedIn headshots on UC Hill', 'Creative', 'service', 'in-person', 40, '/session',
      '20-minute session, 8 edited photos delivered in 48 hours. Perfect for co-op and internship applications.',
      { rating: 4.9, reviews: 33, impressions: 4100, views: 650, sales: 47 }),
    L('l_website', 'u_jordan', 'Club & startup website in a week', 'Tech', 'service', 'online', 250, 'project',
      'A clean, mobile-friendly site for your club or side project. Includes domain set-up and one round of revisions.',
      { rating: 5.0, reviews: 11, impressions: 2300, views: 310, sales: 12 }),
    L('l_resume', 'u_jordan', 'Résumé template pack for tech co-op', 'Tech', 'digital', 'digital', 9, 'download',
      'Three ATS-friendly résumé templates plus a cover-letter outline. Instant download after the code swap.',
      { rating: 4.5, reviews: 19, impressions: 2800, views: 400, sales: 61 }),
    L('l_candles', 'u_chloe', 'Hand-poured soy candles', 'Home', 'product', 'meetup', 18, 'each',
      'Small-batch candles in reusable jars. Scents: Library Rain, Campus Maple, Exam Season (lavender).',
      { rating: 4.8, reviews: 22, impressions: 2600, views: 380, sales: 39 }),
    L('l_moving', 'u_omar', 'Move-out help (2 people + van)', 'Services', 'service', 'in-person', 60, '/hr',
      'Two of us and a cargo van. Residence move-outs, Ikea runs and storage drop-offs around London.',
      { rating: 4.7, reviews: 15, impressions: 1900, views: 270, sales: 21 }),
    L('l_mealprep', 'u_ben', 'Weekly meal-prep box (5 lunches)', 'Food', 'product', 'meetup', 42, 'week',
      'Five high-protein lunches, macros listed. Pick-up Sundays at the Rec Centre. Vegetarian option available.',
      { rating: 4.8, reviews: 30, impressions: 3300, views: 520, sales: 74 }),
    L('l_minifridge', 'u_sam', 'Mini fridge (used one year)', 'Home', 'product', 'meetup', 70, 'each',
      'Danby 3.1 cu ft, works perfectly. Pick-up near Saugeen-Maitland Hall.',
      { rating: 4.6, reviews: 4, impressions: 900, views: 160, sales: 2 }),
  ]

  const code = (s) => s
  const mkOrder = (o) => ({
    qty: 1, buyerConfirmed: false, sellerConfirmed: false, buyerCheckIn: null, sellerCheckIn: null,
    outcome: null, tracking: null, note: '', ...o,
    total: o.price * (o.qty || 1),
  })

  const orders = [
    mkOrder({ id: 'SF-2041', listingId: 'l_hoodie', buyerId: 'u_alex', sellerId: 'u_priya', price: 58,
      handoffAt: at(1, 14), location: 'UCC Atrium', createdAt: now - 2 * D,
      buyerCode: code('K7QM'), sellerCode: code('R2XD'), note: 'Purple, size M, "Rivera" on the sleeve' }),
    mkOrder({ id: 'SF-2044', listingId: 'l_calc', buyerId: 'u_alex', sellerId: 'u_emily', price: 35, qty: 2,
      handoffAt: now + 6 * H, location: 'Weldon Library entrance', createdAt: now - 1 * D,
      buyerCode: 'P4VN', sellerCode: 'H8TC', note: '2-hour session before the midterm' }),
    mkOrder({ id: 'SF-1987', listingId: 'l_econ', buyerId: 'u_alex', sellerId: 'u_sam', price: 45,
      handoffAt: now - 6 * D, location: 'Social Science Centre', createdAt: now - 8 * D,
      buyerCode: 'M3ZB', sellerCode: 'W9KF', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 6 * D + 600e3 }),
    mkOrder({ id: 'SF-2050', listingId: 'l_headshots', buyerId: 'u_priya', sellerId: 'u_jordan', price: 40,
      handoffAt: at(2, 16), location: 'UC Hill (meet at UCC Atrium)', createdAt: now - 3 * H,
      buyerCode: 'T6HR', sellerCode: 'Q3NJ', note: 'For my Ivey recruiting profile' }),
    mkOrder({ id: 'SF-2038', listingId: 'l_stickers', buyerId: 'u_chloe', sellerId: 'u_priya', price: 12, qty: 3,
      handoffAt: now + 3 * H, location: 'Natural Sciences Centre', createdAt: now - 1 * D,
      buyerCode: 'Z5LA', sellerCode: 'F7GU' }),
    mkOrder({ id: 'SF-2012', listingId: 'l_hoodie', buyerId: 'u_ben', sellerId: 'u_priya', price: 58,
      handoffAt: now - 3 * D, location: 'UCC Atrium', createdAt: now - 7 * D,
      buyerCode: 'D2EW', sellerCode: 'J8PS', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 3 * D + 420e3 }),
    mkOrder({ id: 'SF-2003', listingId: 'l_totes', buyerId: 'u_omar', sellerId: 'u_priya', price: 14, qty: 25,
      handoffAt: now - 5 * D, location: 'Shipped (Canada Post)', createdAt: now - 15 * D, tracking: '7023 4410 9981 2207',
      buyerCode: 'N4CY', sellerCode: 'B6RV', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 5 * D }),
    mkOrder({ id: 'SF-2027', listingId: 'l_website', buyerId: 'u_emily', sellerId: 'u_jordan', price: 250,
      handoffAt: now - 2 * D, location: 'Online (Zoom)', createdAt: now - 9 * D,
      buyerCode: 'G5WQ', sellerCode: 'U3MK', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 2 * D }),
  ]

  const conversations = [
    { id: 'c1', listingId: 'l_hoodie', buyerId: 'u_alex', sellerId: 'u_priya', messages: [
      { from: 'u_alex', text: 'Hi! Do you have the purple in a medium? And can you fit "Rivera" on the sleeve?', t: now - 2 * D - 2 * H },
      { from: 'u_priya', text: 'Yes to both! Up to 12 letters fits on the sleeve. Want me to send a mock-up first?', t: now - 2 * D - 90 * 60e3 },
      { from: 'u_alex', text: 'That would be great, ordering now.', t: now - 2 * D - 60 * 60e3 },
      { from: 'system', text: 'Order SF-2041 placed. Payment is held until both codes are swapped.', t: now - 2 * D },
      { from: 'u_priya', text: 'Mock-up looks good on my end. See you at the UCC Atrium tomorrow!', t: now - 5 * H },
    ] },
    { id: 'c2', listingId: 'l_calc', buyerId: 'u_alex', sellerId: 'u_emily', messages: [
      { from: 'u_alex', text: 'Could we focus on related rates and optimization?', t: now - 1 * D - H },
      { from: 'u_emily', text: 'Absolutely. Bring the 2024 midterm if you have it.', t: now - 1 * D - 30 * 60e3 },
      { from: 'system', text: 'Order SF-2044 placed. Payment is held until both codes are swapped.', t: now - 1 * D },
    ] },
    { id: 'c3', listingId: 'l_headshots', buyerId: 'u_priya', sellerId: 'u_jordan', messages: [
      { from: 'u_priya', text: 'Hey Jordan, is golden hour on UC Hill possible?', t: now - 4 * H },
      { from: 'u_jordan', text: 'Yes, 4pm works well this time of year. Wear something solid-coloured.', t: now - 3.5 * H },
      { from: 'system', text: 'Order SF-2050 placed. Payment is held until both codes are swapped.', t: now - 3 * H },
    ] },
    { id: 'c4', listingId: 'l_stickers', buyerId: 'u_chloe', sellerId: 'u_priya', messages: [
      { from: 'u_chloe', text: 'Can I get 3 packs? One for each of my roommates.', t: now - 1 * D - 2 * H },
      { from: 'u_priya', text: 'Of course! I will bring them to the NSC.', t: now - 1 * D - H },
    ] },
  ]

  const weekly = (pairs) => {
    // availability template: { [weekday 0-6]: [hours] }
    const t = {}; for (const [d, hs] of pairs) t[d] = hs; return t
  }
  const availability = {
    u_okafor: weekly([[1, [10, 11, 15]], [3, [13, 14]], [5, [10, 11]]]),
    u_bell: weekly([[2, [16, 17]], [4, [16, 17, 18]]]),
    u_haddad: weekly([[1, [18, 19]], [3, [18, 19]], [6, [11, 12]]]),
    u_sharma: weekly([[2, [9, 10]], [4, [12, 13]], [5, [15]]]),
  }

  const next = (dow, hour) => {
    const d = new Date(now); d.setHours(hour, 0, 0, 0)
    let add = (dow - d.getDay() + 7) % 7; if (add === 0 && d.getTime() <= now) add = 7
    return d.getTime() + add * D
  }

  const sessions = [
    { id: 's1', expertId: 'u_okafor', studentId: 'u_jordan', at: next(3, 13), topic: 'Pricing my website packages', zoom: 'https://zoom.us/j/84120931' },
    { id: 's0', expertId: 'u_sharma', studentId: 'u_jordan', at: now - 9 * D, topic: 'Scoping an MVP for a booking app', zoom: 'https://zoom.us/j/84120111', done: true },
  ]

  const webinars = [
    { id: 'w1', title: 'Your first 10 customers on campus', host: 'u_haddad', at: next(3, 19), registered: 148, tags: ['Marketing'], topic: 'marketing' },
    { id: 'w2', title: 'Pricing a service so it actually pays', host: 'u_okafor', at: next(3, 19) + 7 * D, registered: 96, tags: ['Pricing'], topic: 'pricing' },
    { id: 'w3', title: 'Bookkeeping for student founders (and HST basics)', host: 'u_bell', at: next(3, 19) + 14 * D, registered: 71, tags: ['Finance'], topic: 'finance' },
    { id: 'w4', title: 'Building an MVP in a weekend with no-code', host: 'u_sharma', at: next(3, 19) + 21 * D, registered: 54, tags: ['Product'], topic: 'product' },
  ]
  const recordings = [
    { id: 'r1', title: 'Validating an idea before you build it', host: 'u_sharma', at: now - 5 * D, mins: 52, topic: 'validate' },
    { id: 'r2', title: 'Registering a business in Ontario', host: 'u_bell', at: now - 12 * D, mins: 47, topic: 'legal' },
    { id: 'r3', title: 'Photographing products with your phone', host: 'u_haddad', at: now - 19 * D, mins: 38, topic: 'marketing' },
  ]

  return {
    v: 1, now, baseNow: now, currentUserId: 'u_alex', signedIn: false,
    users, listings, orders, conversations, availability, sessions, webinars, recordings,
    registered: { w1: ['u_jordan'] }, toasts: [],
  }
}

export const DOCS = [
  { id: 'd1', topic: 'validate', cat: 'Validate', title: 'The 48-hour idea test', mins: 6, body: [
    'Before you build anything, write a one-line promise: who it is for, what problem it solves, and what it costs.',
    'Post it as a listing on the marketplace with a "pre-order" or "waitlist" note. Views, messages and saves tell you more than any survey.',
    'Talk to five people who clicked but did not buy. Ask what almost made them buy, and what stopped them.',
    'Decide in 48 hours: build it, change it, or drop it.',
  ] },
  { id: 'd2', topic: 'product', cat: 'Validate', title: 'Running customer interviews that don’t lie to you', mins: 9, body: [
    'Ask about the past, not the future. "When did you last need this?" beats "Would you use this?"',
    'Never pitch during an interview. You are there to learn, not to sell.',
    'Write down exact quotes. They become your marketing copy later.',
  ] },
  { id: 'd3', topic: 'launch', cat: 'Launch', title: 'Writing a listing that converts', mins: 5, body: [
    'Lead with the outcome ("8 edited headshots in 48 hours"), not the process.',
    'Use a real photo. Listings with a clear photo get about 3x the clicks on the marketplace.',
    'State hand-off details up front: where, when and how long it takes.',
  ] },
  { id: 'd4', topic: 'handoff', cat: 'Launch', title: 'Safe, smooth campus hand-offs', mins: 4, body: [
    'Meet in busy, public places such as the UCC Atrium or the Weldon entrance.',
    'Tap "I’m here" when you arrive. It protects you if the other person does not show.',
    'Only read out your code once you have the item or the service is done. Your code is your signature.',
  ] },
  { id: 'd5', topic: 'pricing', cat: 'Finance', title: 'Pricing: cost-plus vs. value-based', mins: 8, body: [
    'Add up materials, your time at a fair hourly rate, and the 7.5% Studentflow fee. That is your floor.',
    'Then ask what the result is worth to the buyer. A $40 headshot that lands a co-op job is cheap.',
    'Raise prices when you are booked out two weeks ahead.',
  ] },
  { id: 'd6', topic: 'finance', cat: 'Finance', title: 'Tracking money from day one', mins: 7, body: [
    'Open a separate bank account for the business, even as a sole proprietor.',
    'Export your Studentflow sales report monthly. It already lists fees and net payouts.',
    'Keep receipts for supplies; they reduce the income you pay tax on.',
  ] },
  { id: 'd7', topic: 'legal', cat: 'Legal', title: 'Registering a business in Ontario', mins: 6, body: [
    'Operating under your own legal name? You do not need to register. Using a business name (like "Mustang Prints")? Register it through the Ontario Business Registry.',
    'A sole proprietorship is the simplest structure for most student businesses. Incorporate later if liability or investment requires it.',
    'Check with an accountant or the Western Morrissette Institute before making structural decisions.',
  ] },
  { id: 'd8', topic: 'tax', cat: 'Legal', title: 'HST: when you need to register', mins: 5, body: [
    'You are a "small supplier" until your taxable sales pass $30,000 over four consecutive calendar quarters.',
    'Once you cross the threshold you must register for a GST/HST number and charge 13% HST in Ontario.',
    'You can register voluntarily earlier to claim input tax credits on your business expenses.',
  ] },
  { id: 'd9', topic: 'marketing', cat: 'Marketing', title: 'Instagram for campus businesses', mins: 6, body: [
    'Post the people, not just the product. Customers wearing your hoodie on UC Hill beats a flat-lay.',
    'Partner with clubs: a bulk order for one club is often your best marketing to all its members.',
  ] },
]
