# StyleHub Frontend

Vue 3 frontend for the Web-based Stock, Inventory and Sales Management System FYP. It consumes the Laravel API in `../ecommerce-backend` and provides public shopping plus role-specific Admin, Manager, Salesman, and Customer workspaces.

## Stack

- Vue 3, Vite 7, Vue Router, Pinia
- Quasar 2 and Tailwind CSS
- Axios, Chart.js, Firebase client integration
- Node.js 20.x (the version declared by `package.json`)

## Implemented areas

- Responsive landing page, product search/detail, cart, wishlist, registration, and login
- Customer profile, checkout, orders, and returns
- Manager products, inventory, stock ledger, suppliers, purchases, invoices, returns, customers, reports, and dashboard
- Salesman invoices, customers, and returns
- Admin users, sellers, products, orders, invoices, reports, activity logs, and backup/restore
- Admin/Manager low-stock notification bell with durable read/unread alerts
- Browser print / Save as PDF invoice view

## Local setup

```bash
npm ci
copy .env.example .env
npm run dev
```

Configure the API origin in `.env`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

The development fallback is same-origin `/api`. The Laravel API must be running, migrated, and seeded.

## Production build

```bash
npm run build
```

Production must use an HTTPS frontend URL and either an HTTPS `VITE_API_BASE_URL` or an HTTPS same-origin `/api` reverse proxy. Do not build an HTTPS frontend that calls an HTTP API.

## Demo accounts

After running the backend seeders, use:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password123` |
| Manager | `seller@example.com` | `password123` |
| Salesman | `salesman@example.com` | `password123` |
| Customer | `customer@example.com` | `password123` |

These are local presentation accounts, never production credentials.

## QA

```bash
npm run build
```

`scripts/browser-smoke.mjs` drives an already-running headless Chrome DevTools endpoint. It checks role routes, responsive widths, horizontal overflow, console errors, failed requests, low-stock UI visibility, and an unauthorized-route probe.

Backend setup, architecture, API modules, deployment, testing, limitations, and the SRS matrix are documented under `../ecommerce-backend/docs/`.
