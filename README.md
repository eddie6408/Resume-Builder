# Second Mission Resume

A military-to-civilian resume builder. Service members and veterans can translate their MOS / AFSC / rating and military jargon, pull accomplishments out of performance evaluations, build private-sector or federal (USAJOBS) resumes, tailor them to job postings, and write cover letters.

"Second Mission" is a placeholder brand. Change it in one place: `src/lib/brand.ts`.

## Features

| Area | What it does | Route |
| --- | --- | --- |
| Landing, pricing, federal guide | Marketing pages, SEO metadata, sitemap, robots | `/`, `/pricing`, `/federal-resume` |
| MOS translator | Look up 36 common codes across all branches, then translate duties into civilian bullets | `/translator` |
| Dashboard | List, duplicate, and delete resumes; back up and restore everything as JSON | `/dashboard` |
| New resume | Start blank, from a sample, or prefilled from your branch, rank, and occupation code | `/dashboard/resume/new` |
| Resume editor | Section-by-section editor, live preview, 3 templates (Modern, Classic, Federal), jargon detection with one-click "Translate all", AI bullet improvement and summary, PDF export (print), plain-text and federal-text export, autosave | `/dashboard/resume/edit/[id]` |
| Tailoring | Live ATS keyword match score with matched and missing terms; makes a tailored copy and opens it in the editor with `?fromTailoring=true` and a before/after score | `/dashboard/tailor` |
| Evaluation import | Paste an NCOER, OER, EPR, OPR, FITREP, EVAL, or award citation, pick the bullets you want, and add them to a new or existing resume | `/dashboard/evaluations` |
| Cover letters | Written from any resume; prefilled from a tailored resume's job details; three tones; PDF and text export | `/dashboard/cover-letters` |

### AI vs. rule-based mode

Every feature works with **no API key**, using the built-in engine:
- `src/lib/jargon.ts`: about 80 military-to-civilian term rules
- `src/lib/keywords.ts`: ATS keyword extraction and matching
- `src/lib/military-codes.ts`: occupation crosswalk

If you set `ANTHROPIC_API_KEY`, the server route `src/app/api/ai/route.ts` uses Claude for translation, evaluation extraction, tailoring, summaries, and cover letters. The UI labels which engine produced each result. The prompts tell the model never to invent numbers or facts; where a metric is missing it inserts a placeholder like `[X%]` for the user to fill in.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Plain CSS (`src/app/globals.css`), including print styles for PDF export
- `@anthropic-ai/sdk` with Zod structured outputs for the AI features
- Vitest for unit tests

Data is stored in the browser's `localStorage` (`src/lib/storage.ts`). No account or database is needed to run it.

## Run locally

```bash
npm install
```

```bash
cp .env.example .env.local   # optionally add ANTHROPIC_API_KEY
```

```bash
npm run dev
```

Open http://localhost:3000.

```bash
npm test          # unit tests
```

```bash
npm run lint      # typecheck
```

```bash
npm run build     # production build
```

## Deploy to your domain

### Option A: Vercel (simplest)
1. Push this repo to GitHub and import it at vercel.com/new. The framework is auto-detected.
2. Under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`.
3. Under **Settings → Domains**, add your domain and create the DNS records Vercel shows you (an `A` record for the apex, a `CNAME` for `www`) at your registrar.

### Option B: Any Node host (Render, Railway, Fly.io, a VPS)
```bash
npm ci && npm run build && npm start   # serves on $PORT or 3000
```
Put it behind HTTPS (the host's TLS, or Caddy/nginx on a VPS) and point your domain's DNS at it.

## Before a public launch

- **Rate-limit `/api/ai`.** It is unauthenticated, and every call spends API credit. Add a per-IP limiter (for example Upstash Ratelimit or Vercel's firewall) or put AI behind sign-in.
- **Accounts and sync.** Resumes live in one browser. Add auth (Auth.js, Clerk) and a database (Postgres with Prisma or Drizzle), then reimplement `src/lib/storage.ts` against it; the rest of the app only calls those functions.
- **Billing.** The Pro tier on `/pricing` is a placeholder. Wire it to Stripe Checkout and gate the AI routes on plan.
- **Legal.** `/privacy` and `/terms` are templates. Have them reviewed.
- **PDF / DOCX.** PDF export currently uses the browser's print dialog. For one-click files, add server-side rendering (e.g. Playwright PDF) or `docx` generation.
- **Evaluation PDFs.** Evaluation import accepts pasted text and `.txt` files. PDF upload needs a text-extraction step, or can be sent to Claude as a document block.
- **More codes.** Extend `OCCUPATION_CODES` from O*NET's Military Crosswalk.

## Project layout

```
src/
  app/
    api/ai/route.ts          Claude-backed AI endpoint (GET = status, POST = actions)
    dashboard/...            App screens (client components)
    translator/, pricing/, federal-resume/, privacy/, terms/
  components/                Editor, preview, cover letter editor, header, tabs
  lib/
    ai-client.ts             Calls /api/ai, falls back to rules when AI is off
    ai-schemas.ts            Zod request and response schemas
    jargon.ts, keywords.ts   Rule engines (tested)
    military-codes.ts        MOS/AFSC/rating crosswalk
    export.ts                Plain-text and federal-text export
    storage.ts               localStorage persistence (swap for a DB later)
```
