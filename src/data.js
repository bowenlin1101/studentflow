// Seed data for the investor prototype. Everything is relative to "now" so the demo always looks fresh.
const H = 3600e3
const D = 24 * H

export const CATEGORIES = ['Tutoring', 'Fitness', 'Baked goods']
export const CAT_KEY = { Tutoring: 'tutoring', Fitness: 'fitness', 'Baked goods': 'baked_goods' }
export const CAT_LABEL = { tutoring: 'Tutoring', fitness: 'Fitness', baked_goods: 'Baked goods' }

export const SPOTS = ['Weldon Library', 'UCC Atrium', 'Western Rec Centre', 'TD Stadium field', 'Social Science Centre', 'Natural Sciences Centre', 'Online (Zoom)']

export const PLANS = {
  trial: { name: 'Free trial', price: 0, blurb: 'Free until your 3rd sale or 30 days, whichever is later' },
  seller: { name: 'Seller', price: 15, blurb: 'Every tool, every listing, every analytic' },
}

export function seed() {
  const now = Math.floor(Date.now() / H) * H
  const users = {
    u_alex: { id: 'u_alex', name: 'Alex Rivera', email: 'alex.rivera@uwo.ca', year: '2nd', major: 'Medical Sciences', program: 'Medical Sciences, 2nd year', role: 'student', hue: 210, buyerRating: { avg: 5, count: 3 } },
    u_priya: { id: 'u_priya', name: 'Priya Patel', email: 'priya.patel@uwo.ca', year: '4th', major: 'Ivey HBA', program: 'Ivey HBA, 4th year', role: 'student', shop: 'Case & Co. Tutoring', hue: 330, sellerSince: now - 75 * D },
    u_maya: { id: 'u_maya', name: 'Maya Rodriguez', email: 'maya.rodriguez@uwo.ca', year: '2nd', major: 'Foods & Nutrition', program: 'Foods & Nutrition, 2nd year', role: 'student', hue: 20 },
    u_jordan: { id: 'u_jordan', name: 'Jordan Lee', year: '3rd', major: 'Computer Science', program: 'Computer Science, 3rd year', role: 'student', shop: 'Jordan Codes', hue: 160 },
    u_emily: { id: 'u_emily', name: 'Emily Zhang', year: '4th', major: 'Mathematics', program: 'Mathematics, 4th year', role: 'student', shop: 'Calc Clinic', hue: 45 },
    u_omar: { id: 'u_omar', name: 'Omar Farouk', year: '3rd', major: 'Kinesiology', program: 'Kinesiology, 3rd year', role: 'student', shop: 'First Rep Coaching', hue: 230 },
    u_sofia: { id: 'u_sofia', name: 'Sofia Rossi', year: '2nd', major: 'Kinesiology', program: 'Kinesiology, 2nd year', role: 'student', shop: 'Strong Start', hue: 300 },
    u_chloe: { id: 'u_chloe', name: 'Chloe Martin', year: '2nd', major: 'MIT', program: 'MIT, 2nd year', role: 'student', shop: 'Sunrise Flow', hue: 15 },
    u_kai: { id: 'u_kai', name: 'Kai Thompson', year: '1st', major: 'Health Sciences', program: 'Health Sciences, 1st year', role: 'student', shop: 'Dorm Room Fit', hue: 190 },
    u_ben: { id: 'u_ben', name: 'Ben Carter', year: '4th', major: 'Foods & Nutrition', program: 'Foods & Nutrition, 4th year', role: 'student', shop: 'Prep’d Bakes', hue: 130 },
    u_noah: { id: 'u_noah', name: 'Noah Kim', year: '2nd', major: 'Engineering', program: 'Engineering, 2nd year', role: 'student', shop: 'Exam Fuel Brownies', hue: 260 },
    u_ava: { id: 'u_ava', name: 'Ava Singh', year: '3rd', major: 'Music', program: 'Music, 3rd year', role: 'student', shop: 'Ava Bakes Cakes', hue: 350 },
    u_sam: { id: 'u_sam', name: 'Sam Nguyen', year: '3rd', major: 'Economics', program: 'Economics, 3rd year', role: 'student', shop: 'Snap Treats', hue: 100 },
  }

  const L = (id, sellerId, title, category, kind, fulfillment, price, unit, description, extra = {}) => ({
    id, sellerId, title, category, kind, fulfillment, price, unit, description,
    rating: 4.8, reviews: 12, impressions: 1800, views: 240, sales: 18, createdAt: now - 20 * D, active: true,
    moment: null, meetLocation: 'UCC Atrium', nextSlot: 'Tomorrow, 2 PM', bundles: [], ...extra,
  })

  const listings = [
    L('l_calc', 'u_emily', 'Calculus 1000 midterm prep', 'Tutoring', 'service', 'in-person', 30, '/session',
      'Got 97% in Calc 1000 and 1501. One-on-one sessions in Weldon, focused on past midterms and problem sets.',
      { photo: 'tutor-whiteboard', rating: 4.9, reviews: 54, impressions: 5200, views: 800, sales: 120, moment: 'finals', meetLocation: 'Weldon Library', nextSlot: 'Today, 7 PM', bundles: [{ name: '4-session pack', price: 108, qty: 4 }] }),
    L('l_case', 'u_priya', 'Ivey case interview prep', 'Tutoring', 'service', 'in-person', 35, '/session',
      'Mock case interviews with written feedback. I placed at a top consulting firm last summer.',
      { photo: 'tutor-group', rating: 4.9, reviews: 23, impressions: 4100, views: 650, sales: 31, meetLocation: 'UCC Atrium', nextSlot: 'Thu, 4 PM' }),
    L('l_econ', 'u_priya', 'ECON 1021 exam review', 'Tutoring', 'service', 'in-person', 25, '/session',
      'Two-hour review of every exam topic, with my 40-page summary notes. Small groups welcome.',
      { photo: 'tutor-notes', rating: 4.7, reviews: 18, impressions: 3300, views: 520, sales: 26, moment: 'finals', meetLocation: 'Weldon Library', nextSlot: 'Tomorrow, 2 PM', bundles: [{ name: '4-session pack', price: 90, qty: 4 }] }),
    L('l_cs', 'u_jordan', 'CS 1026 Python help', 'Tutoring', 'service', 'online', 28, '/session',
      'Stuck on an assignment concept? I explain it with small examples, then you code it yourself. No graded work done for you.',
      { photo: 'tutor-laptop', rating: 4.8, reviews: 15, impressions: 2300, views: 310, sales: 19, moment: 'finals', meetLocation: 'Online (Zoom)', nextSlot: 'Tonight, 9 PM' }),
    L('l_lift', 'u_omar', 'Beginner lifting: feel at home at the Rec', 'Fitness', 'service', 'in-person', 25, '/session',
      'Three sessions and you’ll know your way around the weight room, with a simple plan to keep. Waiver included.',
      { photo: 'fit-deadlift', rating: 4.8, reviews: 22, impressions: 2600, views: 380, sales: 39, meetLocation: 'Western Rec Centre', nextSlot: 'Wed, 8 AM', waiver: true, bundles: [{ name: '4-session plan', price: 90, qty: 4 }] }),
    L('l_strength', 'u_sofia', '4-week strength plan for women', 'Fitness', 'service', 'in-person', 30, '/session',
      'Weekly sessions plus a written plan. Patient with beginners, focused on form first.',
      { photo: 'fit-barbell', rating: 5.0, reviews: 6, impressions: 900, views: 160, sales: 7, createdAt: now - 4 * D, meetLocation: 'Western Rec Centre', nextSlot: 'Fri, 5 PM', waiver: true }),
    L('l_yoga', 'u_chloe', 'Sunrise yoga, small groups', 'Fitness', 'service', 'in-person', 12, '/session',
      'Gentle 45-minute flow before class. Mats provided. Great reset during exam season.',
      { photo: 'fit-yoga', rating: 4.9, reviews: 31, impressions: 3100, views: 470, sales: 64, moment: 'finals', meetLocation: 'TD Stadium field', nextSlot: 'Sat, 7 AM', waiver: true }),
    L('l_core', 'u_kai', 'Dorm-room workouts (online)', 'Fitness', 'service', 'online', 15, '/session',
      'No gym needed. 30-minute live sessions over Zoom you can do in a residence room.',
      { photo: 'fit-core', rating: 0, reviews: 0, impressions: 400, views: 60, sales: 2, createdAt: now - 2 * D, meetLocation: 'Online (Zoom)', nextSlot: 'Tomorrow, 6 PM', waiver: true }),
    L('l_cookies', 'u_ben', 'Brown-butter chocolate chip cookies', 'Baked goods', 'product', 'meetup', 15, '/box of 6',
      'Small-batch, baked the night before. Contains wheat, dairy, eggs. Made in a kitchen that handles nuts.',
      { photo: 'cookie-basket', rating: 4.8, reviews: 30, impressions: 3300, views: 520, sales: 74, moment: 'finals', meetLocation: 'Western Rec Centre', nextSlot: 'Sun, 1 PM', allergens: ['wheat', 'dairy', 'eggs'], bundles: [{ name: 'Box of 6', price: 15, qty: 1 }, { name: 'Box of 12', price: 27, qty: 2 }] }),
    L('l_brownies', 'u_noah', 'Fudge brownies for exam fuel', 'Baked goods', 'product', 'meetup', 16, '/box of 6',
      'Dense, fudgy and cut big. Pre-order for exam week drop-offs at Weldon.',
      { photo: 'brownies', rating: 4.7, reviews: 14, impressions: 2100, views: 330, sales: 28, moment: 'finals', meetLocation: 'Weldon Library', nextSlot: 'Thu, 12 PM', allergens: ['wheat', 'dairy', 'eggs', 'soy'] }),
    L('l_cakes', 'u_ava', 'Custom birthday cakes', 'Baked goods', 'product', 'meetup', 45, 'each',
      'Six-inch layer cakes, decorated to order. Order 5 days ahead.',
      { photo: 'cake', rating: 5.0, reviews: 9, impressions: 1500, views: 260, sales: 12, createdAt: now - 6 * D, meetLocation: 'UCC Atrium', nextSlot: 'Sat, 3 PM', allergens: ['wheat', 'dairy', 'eggs'] }),
    L('l_krispies', 'u_sam', 'Chocolate-dipped rice krispie treats', 'Baked goods', 'product', 'meetup', 12, '/box of 6',
      'Dipped, sprinkled and individually wrapped. Great for club meetings.',
      { photo: 'krispies', rating: 4.6, reviews: 9, impressions: 1200, views: 190, sales: 15, meetLocation: 'Social Science Centre', nextSlot: 'Fri, 11 AM', allergens: ['dairy', 'soy'] }),
  ]

  const code = (s) => s
  const mkOrder = (o) => ({
    qty: 1, buyerConfirmed: false, sellerConfirmed: false, buyerCheckIn: null, sellerCheckIn: null,
    outcome: null, tracking: null, note: '', rate: 0.08, buyerFee: 1, rebook: false, ...o,
    total: o.price * (o.qty || 1),
  })
  const at = (days, hour) => { const d = new Date(now + days * D); d.setHours(hour, 0, 0, 0); return d.getTime() }

  const orders = [
    mkOrder({ id: 'SF-2041', listingId: 'l_econ', buyerId: 'u_alex', sellerId: 'u_priya', price: 25,
      handoffAt: at(1, 14), location: 'Weldon Library', createdAt: now - 2 * D,
      buyerCode: 'K7QM', sellerCode: 'R2XD', note: 'Supply and demand + elasticity please' }),
    mkOrder({ id: 'SF-2044', listingId: 'l_calc', buyerId: 'u_alex', sellerId: 'u_emily', price: 30, qty: 2,
      handoffAt: now + 6 * H, location: 'Weldon Library', createdAt: now - 1 * D, rate: 0.06,
      buyerCode: 'P4VN', sellerCode: 'H8TC', note: '2-hour session before the midterm' }),
    mkOrder({ id: 'SF-1987', listingId: 'l_cookies', buyerId: 'u_alex', sellerId: 'u_ben', price: 15,
      handoffAt: now - 6 * D, location: 'Western Rec Centre', createdAt: now - 8 * D, rate: 0.06,
      buyerCode: 'M3ZB', sellerCode: 'W9KF', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 6 * D + 600e3 }),
    mkOrder({ id: 'SF-2050', listingId: 'l_cs', buyerId: 'u_priya', sellerId: 'u_jordan', price: 28,
      handoffAt: at(2, 16), location: 'Online (Zoom)', createdAt: now - 3 * H, rate: 0.06,
      buyerCode: 'T6HR', sellerCode: 'Q3NJ', note: 'Loops and lists' }),
    mkOrder({ id: 'SF-2038', listingId: 'l_case', buyerId: 'u_chloe', sellerId: 'u_priya', price: 35,
      handoffAt: now + 3 * H, location: 'UCC Atrium', createdAt: now - 1 * D, rate: 0.06,
      buyerCode: 'Z5LA', sellerCode: 'F7GU' }),
    mkOrder({ id: 'SF-2012', listingId: 'l_case', buyerId: 'u_ben', sellerId: 'u_priya', price: 35,
      handoffAt: now - 3 * D, location: 'UCC Atrium', createdAt: now - 7 * D, rate: 0.06,
      buyerCode: 'D2EW', sellerCode: 'J8PS', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 3 * D + 420e3 }),
    mkOrder({ id: 'SF-2003', listingId: 'l_econ', buyerId: 'u_omar', sellerId: 'u_priya', price: 25, qty: 2,
      handoffAt: now - 5 * D, location: 'Weldon Library', createdAt: now - 15 * D, rate: 0.04, buyerFee: 0, rebook: true,
      buyerCode: 'N4CY', sellerCode: 'B6RV', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 5 * D }),
    mkOrder({ id: 'SF-2027', listingId: 'l_cs', buyerId: 'u_emily', sellerId: 'u_jordan', price: 28,
      handoffAt: now - 2 * D, location: 'Online (Zoom)', createdAt: now - 9 * D, rate: 0.06,
      buyerCode: 'G5WQ', sellerCode: 'U3MK', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: now - 2 * D }),
  ]

  // Priya's sales history: established seller past her trial, with regulars who rebook
  ;(() => {
    const buyers = ['u_sam', 'u_kai', 'u_noah', 'u_ava', 'u_sofia', 'u_sam', 'u_kai', 'u_omar', 'u_noah', 'u_sam', 'u_ava', 'u_kai', 'u_sofia', 'u_sam']
    const seen = new Set(['u_ben', 'u_omar'])
    buyers.forEach((b, i) => {
      const listingId = i % 3 === 0 ? 'l_case' : 'l_econ'
      const price = listingId === 'l_case' ? 35 : 25
      const rebook = seen.has(b); seen.add(b)
      const when = now - (68 - i * 4) * D
      orders.push(mkOrder({ id: 'SF-19' + String(10 + i), listingId, buyerId: b, sellerId: 'u_priya', price,
        handoffAt: when, location: listingId === 'l_case' ? 'UCC Atrium' : 'Weldon Library', createdAt: when - 2 * D,
        rate: rebook ? 0.04 : i < 10 ? 0.08 : 0.06, buyerFee: rebook ? 0 : 1, rebook,
        buyerCode: 'H' + i + 'XA', sellerCode: 'Q' + i + 'ZB', buyerConfirmed: true, sellerConfirmed: true, outcome: 'completed', completedAt: when + 3600e3 }))
    })
  })()

  const conversations = [
    { id: 'c1', listingId: 'l_econ', buyerId: 'u_alex', sellerId: 'u_priya', messages: [
      { from: 'u_alex', text: 'Hi! Could we focus on elasticity and market structures?', t: now - 2 * D - 2 * H },
      { from: 'u_priya', text: 'Definitely. Those are half the exam. Bring last year’s practice exam if you have it.', t: now - 2 * D - 90 * 60e3 },
      { from: 'system', text: 'Order SF-2041 placed. Payment is held until both codes are swapped.', t: now - 2 * D },
      { from: 'u_priya', text: 'See you at Weldon tomorrow!', t: now - 5 * H },
    ] },
    { id: 'c2', listingId: 'l_calc', buyerId: 'u_alex', sellerId: 'u_emily', messages: [
      { from: 'u_alex', text: 'Could we focus on related rates and optimization?', t: now - 1 * D - H },
      { from: 'u_emily', text: 'Absolutely. Bring the 2024 midterm if you have it.', t: now - 1 * D - 30 * 60e3 },
      { from: 'system', text: 'Order SF-2044 placed. Payment is held until both codes are swapped.', t: now - 1 * D },
    ] },
    { id: 'c3', listingId: 'l_cs', buyerId: 'u_priya', sellerId: 'u_jordan', messages: [
      { from: 'u_priya', text: 'Hey Jordan, I need help with lists and loops for my elective.', t: now - 4 * H },
      { from: 'u_jordan', text: 'Easy. We’ll do small examples and you’ll write the code yourself.', t: now - 3.5 * H },
      { from: 'system', text: 'Order SF-2050 placed. Payment is held until both codes are swapped.', t: now - 3 * H },
    ] },
    { id: 'c4', listingId: 'l_case', buyerId: 'u_chloe', sellerId: 'u_priya', messages: [
      { from: 'u_chloe', text: 'Can we do a market-sizing case?', t: now - 1 * D - 2 * H },
      { from: 'u_priya', text: 'Yes! I’ll bring two to practise.', t: now - 1 * D - H },
    ] },
  ]

  return {
    v: 3, now, baseNow: now, currentUserId: 'u_alex', signedIn: false,
    users, listings, orders, conversations, toasts: [],
  }
}
