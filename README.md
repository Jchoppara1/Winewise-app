# Del Bar Wine List Manager

A full-stack wine catalog and food pairing platform for Del Bar restaurant — a Middle Eastern / Mediterranean dining concept.

## What It Does

- **Wine catalog** — 66 bottle wines + 23 by-the-glass, organized across 8 categories with tasting notes, aroma profiles, price tiers, and serving guidance
- **Smart food pairings** — a 6-dimension algorithm scores every wine against every dish (37 Middle Eastern dishes) and ranks them by match quality
- **Bidirectional pairing** — browse from wine → dish or dish → wine
- **Admin panel** — secure inventory management: mark wines in/out of stock, edit labels and descriptions
- **Splash intro** — animated "Welcome to Del Bar" screen on first visit
- **Pitch deck** — 14-slide sales & functionality presentation at `/delbar-pitch-deck/`

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | React + Vite + Tailwind CSS v4 |
| API | Express 5 (TypeScript) |
| Storage | CSV-backed in-memory store — no database required |
| Routing | Wouter |
| Validation | Zod |
| Auth | Session-based (express-session + bcrypt) with rate limiting |
| Slide deck | React + Vite (slides artifact) |

## Project Structure

```
artifacts/
  delbar-wine/      # React + Vite frontend  (served at /)
  api-server/       # Express API server      (served at /api)
  delbar-pitch-deck/# 14-slide pitch deck     (served at /delbar-pitch-deck/)
delbarcsv/
  wine_list.csv     # 66 bottle wines
  food_menu.csv     # 37 food dishes
  wines_by_glass.csv# 23 by-the-glass wines
lib/                # Shared TypeScript libraries
scripts/            # Workspace utility scripts
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+

### Install dependencies

```bash
pnpm install
```

### Environment variables

Create a `.env` file (never commit this) or set these in your environment:

```
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=a-long-random-string
```

> **Note:** If `ADMIN_EMAIL` or `ADMIN_PASSWORD` are not set, the admin login is disabled and a warning is logged on startup.

### Run locally

```bash
# API server
pnpm --filter @workspace/api-server run dev

# Frontend
pnpm --filter @workspace/delbar-wine run dev

# Pitch deck (optional)
pnpm --filter @workspace/delbar-pitch-deck run dev
```

The frontend proxies API calls through the shared reverse proxy. In development both services must be running.

## Key Routes

| Path | Description |
|---|---|
| `/` | Wine list & food pairings (main app) |
| `/admin` | Admin inventory panel (requires login) |
| `/delbar-pitch-deck/` | Sales & functionality slide deck |

## Data Files

All data lives in `delbarcsv/` as CSV files. The API server loads them into memory on startup — no migrations, no database setup required.

To update the wine list, edit `delbarcsv/wine_list.csv` and restart the API server.

## Admin Access

Navigate to `/admin` in the browser. Log in with the credentials set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The session is protected with:

- bcrypt password hashing
- Rate limiting (5 failed attempts triggers a 15-minute lockout)
- httpOnly session cookie

## Pairing Algorithm

Each wine is scored against each dish across 6 dimensions:

1. Flavor Profile
2. Tannin Structure
3. Acidity Balance
4. Body Weight
5. Regional Affinity
6. Preparation Method

Scores are combined into a single match percentage and sorted highest-first.

## License

MIT
