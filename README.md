# Travel Planner

A web app for planning trips with friends and family: build day-by-day itineraries, plot places you want to visit on a map with distances between them, and see your trips on a calendar — all inside a single dashboard with a persistent top bar and sidebar.

Live at: **[travel-planner-one-black.vercel.app](https://travel-planner-one-black.vercel.app)**

## What it does

- **Trips** — create a trip with dates, destination, home currency, and a budget.
- **Itinerary** — add activities/flights/lodging to a trip, grouped by day.
- **Places & map** — search for places you want to visit, see them pinned on a map with the distance between each stop.
- **Calendar** — a month view showing which days fall inside a planned trip.
- **Collaboration** — invite others to a trip as an editor or viewer.
- **Sign-in** — Google account only, no passwords to manage.

Schema exists but the feature isn't built yet: **expense tracking** (multi-currency, budget totals). Sidebar entries for **Trip History**, **Reports**, and **Active Bookings** are placeholders for future features.

## Tech stack

| Layer | What we use | Why |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | One project handles both the website (frontend) and the server logic (backend) — no separate backend service to run. |
| Language | [TypeScript](https://www.typescriptlang.org) | JavaScript with type-checking, catches mistakes before they ship. |
| Styling | [Tailwind CSS](https://tailwindcss.com) | Utility classes for styling, no separate CSS framework. |
| Database | [PostgreSQL](https://www.postgresql.org), hosted on [Neon](https://neon.tech) | Stores all app data (trips, itinerary items, places, users, etc.). Neon is a managed Postgres host — no server to maintain; connects via its pooled endpoint since the app runs as serverless functions. |
| Database access | [Prisma](https://www.prisma.io) | Lets the app talk to the database using TypeScript instead of raw SQL, and manages schema changes ("migrations"). |
| Sign-in | [Auth.js](https://authjs.dev) (NextAuth) with Google | Handles Google sign-in and sessions. |
| Form validation | [Zod](https://zod.dev) | Checks that data entered in forms (dates, amounts, etc.) is valid before it's saved. |
| Maps | [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://www.openstreetmap.org) | Draws the map and pins for the Places feature. Free, no API key needed. |
| Place search | [Nominatim](https://nominatim.org) | Free OpenStreetMap service that turns a place name (e.g. "Eiffel Tower") into map coordinates. |
| Hosting | [Vercel](https://vercel.com) | Hosts the live site and redeploys automatically whenever code is pushed to GitHub; pinned to the `sin1` (Singapore) region to sit next to the database. |

**Nothing here needs a paid API key or a credit card on file** — every external service used (Neon, OpenStreetMap/Nominatim) has a free tier that covers this app's usage.

## Design

Every logged-in page shares one persistent app shell: a fixed top bar (logo + profile menu) and a fixed left sidebar (Home, Trip History, Calendar, Reports, Active Bookings), with only the page content scrolling underneath. The whole shell — panels and background — is intentionally dark and orange-themed regardless of the visitor's device settings; the sign-in page is separate and unaffected by any of this. See **`AGENTS.md`** for the full write-up of the color rules, shared layout components, and backend/code-style conventions — read it before adding a new page or feature so it stays consistent.

## Project structure

```
Travel-planner/
├── AGENTS.md                  ← conventions for code style, backend patterns, and page/color design
├── prisma/
│   ├── schema.prisma          ← defines the database tables (Trip, ItineraryItem, Place, Expense*, etc.)
│   ├── migrations/            ← history of database changes
│   └── seed.ts                ← script that fills the database with sample data for testing
│
├── src/
│   ├── app/
│   │   ├── (app)/                          every logged-in page — shares the top bar + sidebar shell
│   │   │   ├── layout.tsx                    the shell itself + the single "are you logged in" check
│   │   │   ├── page.tsx                      dashboard (list of your trips)
│   │   │   ├── calendar/                     month view, trip days highlighted
│   │   │   └── trips/
│   │   │       ├── new/                      "create a trip" page
│   │   │       └── [tripId]/                 a single trip: overview, edit
│   │   │           ├── itinerary/            day-by-day itinerary for that trip
│   │   │           └── places/               places-to-visit list + map for that trip
│   │   ├── (auth)/signin/                  the sign-in page (separate layout, not part of the shell)
│   │   └── api/                            backend endpoints (sign-in, place search)
│   │
│   ├── components/            ← reusable UI: app-chrome/top-bar/sidebar (the shell), page-shell (per-page
│   │                             layout pieces), the map, the logo, etc.
│   ├── server/                ← server-only code
│   │   ├── db.ts                            connects to the database
│   │   ├── auth.ts                          sign-in configuration
│   │   ├── access.ts                        checks who's allowed to view/edit a trip
│   │   └── actions/                         create/update/delete logic, one file per feature
│   │
│   └── lib/                   ← shared helper code
│       ├── validation/                     zod schemas, one per entity
│       ├── currencies.ts                    list of supported currencies
│       ├── distance.ts                      calculates distance between two map points
│       └── utils.ts                         shared styling/formatting helpers
│
├── vercel.json                ← tells Vercel to run the app in Singapore (close to the database)
├── .env.local.example         ← template showing which settings/keys the app needs
└── package.json                ← the list of external libraries the app depends on
```

**The short version:** `src/app` is what you see (pages), `src/server` is what runs behind the scenes (database + business logic), `src/components` and `src/lib` are shared building blocks used by both, and `prisma/schema.prisma` is the single source of truth for what data the app stores.

## Running it locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill in the values (database connection string, Google sign-in keys — see that file for details).
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

Other useful commands:
- `npm run build` — build the production version (also used by Vercel when deploying).
- `npm run lint` — check the code for style/error issues.
- `npx prisma studio` (or `npm run db:studio`) — browse the database in a visual UI.
- `npm run db:seed` — fill the database with sample data.

## Deployment

Every push to the `main` branch on GitHub automatically triggers a new deployment on Vercel — no manual steps needed. Database schema changes are applied by running `npx prisma migrate dev` against the live database before pushing code that depends on them.
