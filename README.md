# Var Net Mini App

A Persian-first storefront for Telegram Mini App / Web App use, with a React frontend and Cloudflare Pages Functions API.

## Run locally

Use Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, or preview it with `npm run preview`.

## API deployment

The frontend sends `/api/*` requests to `VITE_API_BASE_URL`. Set this variable in the Cloudflare Pages frontend build environment to the backend origin (for example, `https://api-var.popserver.shop`). Production builds use that example as the default; local development keeps using Vite's `/api` proxy.

The API Functions add CORS headers for `https://varnet.kdns.fr` and local development origins. If the frontend uses a different domain, add that exact origin to `allowedOrigins` in `functions/_middleware.ts`.

## Included

- React 18, TypeScript, Vite, Tailwind CSS 3, and Lucide React
- Manual light/dark theme toggle with the Tailwind `class` strategy
- RTL Persian UI with responsive store, dashboard, and wallet tabs
- Cloudflare Pages Functions API for products, account, orders, dashboard, and VPN configuration
- Local-only interaction examples for the purchase dialog, receipt form, and copy buttons

The sample bank card, login details, prices, and `.ovpn` files are not real payment or service credentials.
