# drone-ui

## Phase 1 — Firebase Auth

### Setup

1. Copy `.env.local.example` → `.env.local` and fill in your Firebase config.
2. `npm install`

### Available Scripts

- `npm run dev` — starts Next.js at http://localhost:3000

### Routes

- `/signup` — create a new account  
- `/login` — sign in  
- `/missions/*` — protected area (redirects to login if unauthenticated)
