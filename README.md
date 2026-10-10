# AI Radar — Your AI Intelligence Hub

A Next.js 16 + React 19 intelligence dashboard with real, persisted source data. The interface and generated context default to English; original titles and excerpts retain the publisher's language. No database or paid LLM is required.

## Run locally

Use Node.js 24 and npm. The checked-in lockfile is authoritative.

```bash
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Visit http://127.0.0.1:3000. Routes: `/`, `/labs`, `/labs/[slug]`, `/discover`, `/deals`, `/saved`. All 20 labs have their own page and local logo assets. Text is deliberately readable: 15px summaries, 17–18px update titles, 15px navigation, 30–42px page titles. Dark/light themes, saved IDs and read IDs persist in localStorage only; there is no account or server-side personal data.

## Intelligence pipeline

```bash
npm run collect
npm run data:validate
```

Configuration lives in `src/config/labs.ts`: `labs`, `sources`, `discoverySources`, and `dealCandidates`. Supported adapters: RSS/Atom, dated HTML announcements, GitHub Releases, GitHub Commits. A commit is explicitly **Developer activity**, never a model-launch claim. Add a unique source ID, a lab slug, the official HTTPS URL, and adapter type; HTML adapters can include an article-link selector. Do not bypass publisher access controls.

`data/radar.json` stores announcements, canonical URLs, publication dates, relevance, source IDs, first-seen times, content hashes, full revision metadata, source health, discoveries, offer evidence and collection runs. Collection uses bounded concurrency, timeouts, conditional ETag/Last-Modified requests and atomic writes. The source date is required; undated and future items are rejected. Canonical URLs and matching titles deduplicate cross-source signals. Source failure retains the last valid items and successful-check date.

Backfill defaults to 90 days and only adds source items within the window; already archived history is not deleted. Actual depth depends on feed retention, API pagination (first 100 releases/commits) and availability. Twenty configured labs does **not** mean twenty fully covered news streams. The Source transparency dialog exposes failed, empty and successful checks; a healthy endpoint with zero dated items is not complete coverage. HTML sources such as xAI can return 403; retired feed URLs can return 404/410. These are reported, not hidden.

### Summaries and ranking

Without an LLM, deterministic English category context explains what to verify. It is clearly labeled rule-based and is **not** a claim that a model performed factual analysis. Original excerpts and source links remain available. Optional OpenAI-compatible LLM enrichment is bounded to important items, validates output, uses only supplied source facts, caches enriched results, and falls back to rules on failure. Headline-based category/ranking are heuristics, not independent fact checks.

### Discover and offers

Discovery uses GitHub public repository search and Hacker News Algolia. A newly created repository is labeled separately from older updated/trending repositories. A posting date is never a product-launch date. Community signal, pricing uncertainty and unknown licenses remain visible. Product Hunt and X are not queried without authorized API access.

Offer candidates are not promises of free credits. Active status requires matching official-page evidence checked within 24 hours, valid dates where supplied, and no verification failure. An old announcement alone is insufficient. Dates, credit amounts and prices not explicitly provided by a source are not invented. Current free-tier candidates are examples of configured official sources, not exhaustive deal coverage.

## Environment variables

Copy `.env.example` into a private `.env.local` for app configuration. The collector runs in a separate Node process: export its variables in your shell or configure GitHub Actions; it does not implicitly load `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production origin for canonical links, sitemap and social metadata. Default: `https://website-ai-radar2.vercel.app`. |
| `BACKFILL_DAYS` | Initial/new-item window, integer 1–365; default 90. |
| `GITHUB_TOKEN` | Optional GitHub API token to avoid unauthenticated rate limits. Actions supplies its scoped built-in token. |
| `LLM_BASE_URL` | Optional HTTPS OpenAI-compatible API base URL, without `/chat/completions`. |
| `LLM_API_KEY` | Optional private enrichment key. Never expose to the client. |
| `LLM_MODEL` | Optional enrichment model ID. |
| `LLM_MAX_ITEMS` | Max important items enriched per run, bounded 0–30; default 8. |
| `VERCEL_DEPLOY_HOOK` | Optional Actions secret to trigger a rebuild after repository data commits. |

## Scheduled collection

`.github/workflows/collect.yml` runs at minute 17 every 3 hours (`17 */3 * * *`, UTC), with a manual backfill control. It checks tests, collects, validates, commits only `data/radar.json` and pushes the data history. GitHub schedules can be delayed and public inactive repositories may have schedules disabled. The workflow must be on the default branch and Actions must be enabled.

GitHub deliberately does not trigger another workflow on a push made with its built-in token. A connected Vercel Git integration may process the source push, but verify it; configure a Vercel deploy hook as the `VERCEL_DEPLOY_HOOK` repository secret when needed. No hook means no explicit rebuild request. The static site reflects the last deployed snapshot, not a live socket stream. Client-side clock refresh keeps Today and offer-expiry presentation current.

## Vercel

Deploy as a **new** project named `website-ai-radar2`, connected to `fareza777/website-ai-radar2`; do not overwrite the older `ai-radar` project. Framework: Next.js, Node.js 24, install `npm ci`, build `npm run build`. Repository JSON is bundled through Next.js output tracing. No runtime API key or database is required for baseline operation. Set `NEXT_PUBLIC_SITE_URL` if using a custom domain. Enable the Git integration and configure the collector deploy hook if automatic rebuilds need it.

## Verification

```bash
npm run typecheck
npm run lint
npm run test:coverage
npm run data:validate
npm run build
# Start the development/production server first:
npm run test:e2e
# Or test the real deployment:
BASE_URL=https://website-ai-radar2.vercel.app npm run test:e2e
```

Vitest covers source adapters, failure retention, deduplication, revisions, date validation, classification, filtering and deal validity with an 80% minimum. Playwright tests all twenty lab routes on desktop and mobile, real logo loading, English defaults, computed text sizes, search, pagination, category filters, bookmark persistence, unread state, keyboard dialogs, theme persistence, navigation and horizontal overflow. Reports and screenshots are generated in ignored `playwright-report/` and `test-results/`.

## Privacy and asset notes

There are no analytics or tracking pixels. LocalStorage holds only personal reading preferences and bookmarks. Google Fonts may receive a normal stylesheet/font request; logos are served locally. Publisher content is displayed as short excerpts with source attribution. Vector marks are prepared with Simple Icons and LobeHub icon assets; original fetched favicon fallbacks are retained locally. Brand marks remain the property of their owners. This product is not affiliated with the tracked labs.
