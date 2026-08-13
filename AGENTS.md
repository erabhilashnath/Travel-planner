<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

**Page theme**: every route under `src/app/` must use the shared shell components from
`src/components/page-shell.tsx` (`PageShell`, `PageHeader`, `PageMain`, `PageTitle`, `BackLink`)
instead of hand-rolled wrapper `<div>`/`<header>`/`<main>`/`<h1>` markup. This is what keeps the
travel/sunset theme (warm `bg-sand` background, `font-display` Fraunces headings, the brand
palette in `globals.css` — `sunset-1/2/3`, `ocean-1/2`) consistent across the whole app. When
adding a new page:

- Wrap the page in `<PageShell>` (background + flex column).
- Use `<PageHeader left={...} right={...}>` for the top bar — pass a `<BackLink href="...">` for
  simple sub-pages, or custom nodes (see `src/app/page.tsx`) for richer headers.
- Use `<PageMain>` for the content container (`className` overrides the default max-width).
- Use `<PageTitle>` for the page's primary heading so it picks up the display font.
- Reuse `LogoMark`/`Wordmark` from `src/components/logo.tsx` for branding, and the shared
  `inputClass`/`labelClass`/`primaryButtonClass`/`secondaryButtonClass` from `src/lib/utils.ts`
  for form controls, instead of redefining Tailwind classes inline.

Do not introduce another CSS framework (e.g. Bootstrap) — the app is Tailwind-only; extend the
theme via `globals.css` custom properties and Tailwind utilities.
