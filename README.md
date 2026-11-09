# Var Net Mini App

A responsive, Persian-first storefront skeleton for Telegram Mini App / Web App use. The app is frontend-only: product, account, wallet, payment, and VPN profile data are mock examples. No backend or payment gateway is connected.

## Run locally

Use Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, or preview it with `npm run preview`.

## Included

- React 18, TypeScript, Vite, Tailwind CSS 3, and Lucide React
- Manual light/dark theme toggle with the Tailwind `class` strategy
- RTL Persian UI with responsive store, dashboard, and wallet tabs
- Mock VPN and AI products, user services, and wallet transactions
- Local-only interaction examples for the purchase dialog, receipt form, copy buttons, and sample `.ovpn` downloads

The sample bank card, login details, prices, and `.ovpn` files are not real payment or service credentials. Replace them with backend-provided data before launch.
