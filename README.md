# Studentflow

Investor prototype for Studentflow, a platform for Western University (@uwo.ca) student founders:

- **Launch:** a guided flow (pick, price, listing, reach out to 10 people, reflect, run it with school) that takes a student from "I like baking" to a live listing and their first sale. Reflect doubles as the monthly check-in
- **Sell:** listings, buyer chat, orders, a sales dashboard, customers and a tax summary
- **Buy:** search the marketplace, check out with a held payment and $1 Buyer Protection, rebook regulars fee-free, and confirm each order with a two-way code swap

Fees and plans live in `src/launch/lib/config.ts`: 8% on a seller's first 10 sales, then 6%, 4% on rebooks, $1 Buyer Protection, and $15/month after a trial of 3 sales or 30 days (whichever is later). Press **I** (or triple-tap the logo) for the investor view of one order's economics.

All data is sample data held in the browser. There is no backend and no real payments.

## Run it locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

Covers the pricing maths (fee tiers at sales 10/11, rebook waiver, negative net on tiny orders, subscription start) and the demand verdict.

## Build a single-file version

```bash
npx vite build
```

The output is `dist/index.html`, a self-contained page.

## Where things are

| Path | What it holds |
|---|---|
| `src/data.js` | Sample users, listings, orders, experts and guides |
| `src/store.jsx` | App state, order rules (12-hour lock, cancel fee, no-shows, code swap) |
| `src/launch/lib/` | Fee config, pricing maths + tests, category copy, seeded campus data, and `generate()` templates (swap for a Claude API call later) |
| `src/launch/` | The guided launch flow: stages, overview, demo bar, investor view |
| `src/pages/` | One file per area: Landing, Marketplace, Listing, Orders, Messages, Sell, Pricing |
| `src/ui.jsx` | Shared components and the logo |
