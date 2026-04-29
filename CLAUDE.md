# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HiveScout is an FTC (FIRST Tech Challenge) scouting system for the DECODE game season. Full-stack web app for real-time match scouting and team analytics.

## Tech Stack

- **SvelteKit 2** with **Svelte 5** — file-based routing, server routes as API
- **better-sqlite3** — embedded SQLite database (synchronous, WAL mode, foreign keys enforced)
- **TypeScript** (strict mode) with **Vite**
- **SvelteKit Adapter Node** — deployed as Node.js server in Docker (Node 22)

## Build & Dev Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build to /build
npm run preview   # Preview production build
```

No linter, formatter, or test framework is configured. There is no `npm test` command.

The `npm run seed` script references `scripts/seed.js` which does not exist yet. Test data can be seeded via the `/api/seed-test` endpoint instead.

## Architecture

### Routing & Pages

Two main user flows accessed from the landing page (`/`):
- **Scout flow** (`/scout`) — name-based entry, match scouting UI at `/scout/match`, pre-scout at `/scout/prescout`
- **Manager flow** (`/manager`) — accessed by entering "mngr" on landing page. Sub-routes: `/manager/setup`, `/manager/scouters`, `/manager/scouts`, `/manager/analytics/[team]`, `/manager/compare`, `/manager/predictions`, `/manager/picklist`, `/manager/nexus`

### API Layer

All API endpoints live under `src/routes/api/` as SvelteKit server routes (`+server.ts`). Key endpoints: `/api/teams`, `/api/matches`, `/api/schedule`, `/api/matchscout`, `/api/prescout`, `/api/scouters`, `/api/groups`, `/api/analytics`, `/api/export`, `/api/import`, `/api/notes`, `/api/scouter-accuracy`, `/api/seed-test`, `/api/picklist`, `/api/nexus`.

### Server Library (`src/lib/server/`)

- `db.ts` — SQLite database init, schema creation, and query helpers. Tables: `teams`, `matches`, `scouters`, `match_scouts`, `prescout_responses`, `scout_groups`, `scout_group_members`, `shift_assignments`, `scouter_assignments`, `picklist`
- `ftc-api.ts` — FTC API client for fetching events, teams, and schedules from FIRST
- `schedule-generator.ts` — Shift scheduling algorithm (configurable shift length, active groups, rotation)

### Client State

- `src/lib/stores.ts` — Svelte stores (e.g., `matchActive` state)

### PWA

Service worker (`static/sw.js`) and manifest (`static/manifest.json`) enable offline capability. POST/PATCH/DELETE requests made offline are queued in IndexedDB and replayed when connection restores. The scout layout shows an offline indicator banner.

## Environment Variables

- `FTC_SEASON` — Season number (e.g., 2025)
- `FTC_API_KEY` — Authentication key for FIRST API
- `FTC_USERNAME` — FIRST API username
- `DATABASE_PATH` — SQLite file location (default: `./hivescout.db` locally, `/data/hivescout.db` in Docker)
- `NEXUS_API_KEY` — API key for ftc.nexus live event data (get at ftc.nexus/api)

## Docker

Builds with `Dockerfile`. Database persists at `/data/hivescout.db` — mount a volume. Runs on port 3000.

## Styling

Dark theme using CSS custom properties in `src/app.css`. Accent color is purple (`#a855f7`). Responsive grid layouts throughout.
