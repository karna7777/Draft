# Draft

An AI residential design studio (student project). Users describe a home in plain
language; Draft generates editable floor plans they can explore, refine (via natural
language), and visualize (2D → 3D, interior styles).

- **Product reference:** Maket.ai (generative residential design)
- **Design/UX reference:** Squarespace (editorial, premium, visual-first, restrained)

Outputs are **conceptual** — not construction documents. This is stated in the UI.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · **three.js** (the
interactive hero) · `next/font` (Archivo, Newsreader, IBM Plex Mono).

## Commands

```bash
npm run dev     # dev server (Turbopack) at http://localhost:3000
npm run build   # production build
npm run lint
```

## Architecture

Everything on the page is driven by one **shared design representation** — the same idea
as the real product (the AI operates on a data model, not a picture).

- `src/lib/floorplan.ts` — the `Room[]` model, the `PLOT`, and transforms
  (`baseModel`, `mirrorX`, `rot180`, `openKitchen`, `biggerMaster`). This is the single
  source of truth every section renders from.
- `src/components/FloorPlan.tsx` — the reusable renderer. Props: `rooms`, `editable`
  (drag + select on a 1ft grid), `is3d` (isometric CSS extrusion), `generating`
  (shimmer), `selectedId`, `onSelect`, `onChange`.
- `src/components/HeroScene.tsx` — the full-screen **three.js** house, built from the
  room model. Mouse-parallax camera, raycast room highlighting with a live tooltip, and
  Exterior → Floor plan → Interior morphing (walls lower, camera moves). The camera is
  placed at its exterior framing on init (never lerps up from the origin).
- `src/components/*` — one component per landing section (Hero [3D scene + headline],
  Describe [prompt → live plan], Stats, UseCases [carousel], Variations, Editor,
  ChatRefine, Dimension [CSS 3D massing], Styles, Marquee, Gallery, FinalCTA, Nav, Footer).
- `src/components/Tilt.tsx` — reusable mouse 3D-tilt wrapper used on cards/plans.
- `src/app/globals.css` — the design system: CSS custom-property tokens with full
  light/dark theming (`:root`, `prefers-color-scheme`, and `[data-theme]` overrides),
  plus all component styles. Theme is set pre-paint by a script in `layout.tsx` and
  toggled in `Nav.tsx` (persisted to `localStorage` as `draft-theme`).

## Design tokens (quick reference)

Warm-concrete neutrals + a cyanotype "blueprint" accent. Key vars: `--paper`, `--ink`,
`--stone`, `--line`, `--blueprint`/`--cyan` (hero), `--accent` (interactive), and room
fills `--r-living|kitchen|bed|bath|service`. Fonts via `--font-display|body|mono`.

## Where this goes next

The landing page is done. The real product surfaces to build on top of this foundation:
`/create` (conversational requirements) → `/editor` (project rail · canvas · Draft AI
panel) → 3D view → styling → export. The `FloorPlan` component and `floorplan.ts` model
are built to be reused directly in the editor.

`reference/landing-mockup.html` is the original single-file design mockup, kept for reference.

## Backend (Phase 1 — foundation)

Persistence is **Prisma 6 + SQLite** (`prisma/schema.prisma`, db at `prisma/dev.db`).
Swap the datasource `provider`/`DATABASE_URL` to Postgres to deploy. Run
`npm run db:migrate` after schema changes; `prisma generate` runs on `postinstall`.

- **Data model:** `User → Project → Floor → Room`, plus `Session` for auth. Rooms are
  structured rows (real-world feet), not screenshots. Cascading deletes throughout.
  Later phases hang Moodboard / DesignConcept / ColorPalette / RoomMaterial / BudgetItem /
  ShareLink off Project and Room.
- **Auth:** email + password, hashed with Node `crypto` scrypt; opaque, revocable session
  tokens in an httpOnly cookie (`src/lib/auth.ts`). No third-party auth dep. `middleware.ts`
  gates `/projects`, `/create`, `/editor` on cookie presence; route handlers validate for real.
- **API (route handlers under `src/app/api/`):** `auth/{register,login,logout,me}`,
  `projects` (GET list · POST create), `projects/[id]` (GET · PUT full save · PATCH meta ·
  DELETE), `projects/[id]/duplicate`. All ownership-checked; inputs validated by the
  hand-rolled validators in `src/lib/validation.ts` / `src/lib/brief.ts`.
- **Shared model:** `src/lib/store.ts` holds the isomorphic `Project`/`Brief`/`Floor` types
  and the seed generator; `src/lib/project.ts` maps Prisma rows ↔ the client `Project`
  shape; `src/lib/api.ts` is the client fetch wrapper. `/create` and `/editor` persist
  through the API (editor autosaves, debounced). `src/lib/db.ts` is the Prisma singleton.

Flow: `/login` or `/register` → `/projects` (manage: open / rename / duplicate / delete) →
`/create` (brief) → `/editor?id=…` (edit + autosave + 3D preview).
