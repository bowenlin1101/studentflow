# Studentflow

Investor prototype for Studentflow, a platform for Western University (@uwo.ca) student founders:

- **Learn:** guides, weekly webinars and 1:1 expert coaching (3 sessions a month; up to 5 unused sessions roll over)
- **Sell:** listings, buyer chat, orders and a sales dashboard (revenue after the 7.5% fee, impressions, conversion)
- **Buy:** search the marketplace, check out with a held payment, and confirm each order with a two-way code swap

All data is sample data held in the browser. There is no backend and no real payments.

## Run it locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

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
| `src/pages/` | One file per area: Landing, Marketplace, Listing, Orders, Messages, Sell, Learn, Expert, Pricing |
| `src/ui.jsx` | Shared components and the logo |
