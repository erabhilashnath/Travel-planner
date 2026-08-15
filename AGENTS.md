<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

Read this before adding any new page, server action, or component. It exists so every future
feature looks and behaves like it belongs to the same app, without re-deriving these decisions
each time.

### 0. Repo layout: feature folders

The codebase is organized **by feature, not by technical layer**. Each of `trips`, `itinerary`,
`places`, `calendar`, `auth` lives entirely under `src/features/<name>/`:

```
src/features/<name>/
  actions.ts          Server Actions ("use server") — create/update/delete
  validation.ts        Zod schema(s) for that feature's forms
  pages/                the actual page components (see below)
  <anything else that's specific to this feature only>   e.g. places/distance.ts,
                                                           places/places-map.tsx,
                                                           calendar/holidays.ts
```

**New feature → new folder under `src/features/`.** Only reach into `src/server/`, `src/lib/`,
or `src/components/` (top level) for things genuinely shared by *multiple* features — the Prisma
client, trip-membership access checks, the shared page layout pieces, the app chrome, shared
style constants. If you're not sure whether something is feature-specific or shared, default to
putting it in the feature folder; promote it later if a second feature needs it.

**Next.js still requires route files under `src/app/`** — that's how its file-based routing
works, it can't be changed. So every `src/app/**/page.tsx` and `route.ts` is a **thin
re-export**, nothing else:
```ts
export { default } from "@/features/trips/pages/trip-overview-page";
```
(Route handlers like `src/app/api/places/search/route.ts` re-export the named handler, e.g.
`export { GET } from "@/features/places/search";`.) When adding a new route, create the real
page component under `src/features/<name>/pages/`, then add the one-line re-export at the
matching path under `src/app/`. Never put real logic/JSX directly in a `src/app/**/page.tsx` —
if you find yourself doing that, the feature folder is missing a `pages/` entry for it.

### 1. Page structure

Every authenticated page lives under the `src/app/(app)/` route group (invisible in the URL) and
is wrapped by `src/app/(app)/layout.tsx`, which renders the persistent shell (`TopBar` +
`Sidebar` + scrollable content, see §3) and does the single `auth()` redirect check.
**Do not add a per-page auth redirect for "is anyone logged in"** — the layout already handles
it. Pages still do their own **trip-membership** checks (`getTripMembership`/`canEdit` from
`src/server/access.ts`) since those are per-trip, not per-login.

Within a page, use the shared components from `src/components/page-shell.tsx` instead of
hand-rolled `<header>`/`<main>`/`<h1>`:
- `<PageHeader left={...} right={...}>` — pass a `<BackLink href="...">` for simple sub-pages
  (see any page under `src/features/{itinerary,places}/pages/`), or custom nodes for richer
  headers.
- `<PageMain className="max-w-...">` — content container, default `max-w-2xl`.
- `<PageTitle>` — the page's primary heading (picks up the display font).

`/signin` (`src/features/auth/pages/signin-page.tsx`) is the one exception — it's a separate
route group with its own hero layout via `PageShell`, and must **not** be pulled into the
`(app)` shell or have its colors changed by edits to shared tokens (see §4).

### 2. Backend: server actions & data access

Mutations are Next.js Server Actions, in each feature's `src/features/<name>/actions.ts`.
Pattern to copy (see `src/features/places/actions.ts` as the cleanest example):
1. `"use server"` at the top of the file.
2. A private `parse*Form(formData)` helper that runs the feature's Zod schema (its
   `validation.ts`) via `safeParse` and throws with the first issue message on failure.
3. Each exported action starts with `await requireEditableMembership(tripId)` (from
   `src/server/access.ts`) — this both redirects to `/signin` if logged out and throws if the
   user isn't an OWNER/EDITOR on that trip. Read-only page loads use `getTripMembership` +
   `canEdit` directly instead.
4. End mutations with `revalidatePath(...)`; use `redirect(...)` afterward only when the user
   should land on a different page than the one they submitted from (e.g. create → detail page).
5. Bind trip/entity IDs from the page with `.bind(null, tripId, ...)` rather than hidden form
   fields.

External services (Nominatim for places, Nager.Date for calendar holidays, Frankfurter/
Amadeus/mock if added later) are called **only** from a server Route Handler or server action,
never from the client — see `src/features/places/search.ts` for the pattern (auth-gate it, set
a descriptive `User-Agent`, return a small normalized shape, and have the actual
`src/app/api/**/route.ts` be a one-line re-export per §0).

Server Actions that need to run from a **Client Component** (e.g. a dropdown's logout button)
can't just import a function from a non-`"use server"` file like `src/features/auth/config.ts`
— wrap it in its own `"use server"` action (see `src/features/auth/actions.ts`) and pass that
down as a prop from a Server Component.

Prisma access always goes through the singleton in `src/server/db.ts` (never `new PrismaClient()`
elsewhere). After any `prisma/schema.prisma` change: `npx prisma migrate dev --name <desc>`,
which also regenerates the client — if you only ran `prisma db push` or edited generated types
manually, run `npx prisma generate` too.

### 3. App shell (top bar + sidebar)

`src/components/shell/app-chrome.tsx` is the only place that owns mobile sidebar open/close
state and composes `TopBar` + `Sidebar` + `AppBackground` + the scrollable `<main>`. To add a
new top-level destination: add an entry to the `navItems` array in
`src/components/shell/sidebar.tsx` (icon from `src/components/shell/nav-icons.tsx` or a new one
in the same hand-drawn stroke-SVG style — no icon library dependency) and give it a real `href`
once the page exists (its real page component lives in that feature's `src/features/<name>/
pages/`, per §0); leave `href: null` for placeholders. `Sidebar` and `TopBar` are fixed at
`#2e1c10` (darker than the body) — don't let them pick up `bg-white`/light-mode classes again.

### 4. Color system — read before touching any background or text color

The whole `(app)` shell (top bar, sidebar, body) is **unconditionally dark**, independent of the
visitor's OS light/dark preference — this was a deliberate choice, not the old `dark:`-variant
system. Concretely:

- **Panels** (`TopBar`, `Sidebar`): fixed `bg-[#2e1c10]`.
- **Body** (`src/components/shell/app-background.tsx`, `AppBackground`): a fixed gradient
  (`from-[#4d2c17] via-[#603a1f] to-[#1f6089]`) with drifting sunset-color glow blobs, twinkling
  stars, and mountain silhouettes — lighter than the panels, still dark. This is rendered once
  inside `AppChrome`'s `<main>`; individual pages don't set their own background.
- **Content cards** (`bg-white ... dark:bg-zinc-950`) are the one place that still legitimately
  uses the `dark:` variant, since they're opaque surfaces that read fine in either OS mode —
  keep using `text-black dark:text-zinc-50` etc. *inside* a white/zinc-950 card.
- **Anything else that sits directly on a panel or the body** (page headings, `BackLink`,
  form `<label>`s, loose paragraphs between cards, the sidebar/top-bar text itself) must use a
  **fixed light color** (`text-zinc-50`, `text-zinc-100`, `text-zinc-300` for secondary/muted),
  *not* a `text-black dark:text-zinc-50`-style pair — the light-mode half of that pair is
  invisible against the dark shell. `labelClass`/`secondaryButtonClass` in `src/lib/utils.ts`
  are already fixed this way; reuse them rather than writing new label/button classes.
- **`/signin` is exempt from all of the above.** It still uses `--color-sand` (`#fffaf0`,
  near-white) via `PageShell` and its own light-mode-appropriate text colors. Never repoint it
  at `bg-cream`/the dark panel colors, and never change `--color-sand` itself to "fix" the rest
  of the app — that variable is `/signin`-only now. Add new tokens instead (see how
  `--color-cream` was introduced) if a change would otherwise leak into it.
- Brand accent colors (`sunset-1/2/3` orange/rose gradient, `ocean-1/2` teal/navy) stay the same
  in every context — glows, gradients, focus rings, active nav highlight, the trip-card top
  stripe, and (closest available to "green") calendar day-highlighting.

Don't introduce another CSS framework — Tailwind-only; extend the theme via `globals.css`
custom properties (`@theme inline` block) and Tailwind utilities.

### 5. Code style

TypeScript everywhere, no `any`/non-null-assertion (`!`) shortcuts — if a value is guaranteed
non-null by a check elsewhere (e.g. the layout's auth redirect), re-narrow it locally with the
same `if (!x) redirect(...)` pattern rather than asserting. Validation lives in each feature's
`validation.ts` as Zod schema(s), shared between the form's expectations and the server action's
parsing (see §0/§2). Formatting/small pure helpers that are genuinely shared go in
`src/lib/utils.ts`; helpers specific to one feature (e.g. `places/distance.ts`,
`calendar/countries.ts`) live in that feature's folder instead, per §0.
