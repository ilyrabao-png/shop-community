# B Market (shop-community)

Next.js App Router + TypeScript community marketplace app with mock/in-memory API.

## Requirements

- **Node.js** 18.x or 20.x (LTS recommended)
- npm (comes with Node)

## Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Environment

1. Copy `.env.example` to `.env.local`
2. Add any required keys (see `.env.example` for placeholders)
3. Never commit `.env`, `.env.local`, or other `.env.*` files

## Deployment (Ubuntu)

- Use Node 18+ LTS
- Build: `npm ci && npm run build`
- Run: `npm run start` (or use PM2/systemd)
- Ensure `.env.local` exists on the server (do not commit it)
