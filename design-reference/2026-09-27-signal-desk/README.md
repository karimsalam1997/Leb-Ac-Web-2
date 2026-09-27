# Signals Desk restored into the September website

## Where the files are

Original standalone build:
`/Users/karimsalam/Documents/Leb Ac Web copy/audit/2026-09-07-signal-desk-rebuild/prototype/`

Original build record:
`/Users/karimsalam/Documents/Leb Ac Web copy/audit/2026-09-07-signal-desk-rebuild/BUILD_HANDOVER_2026-09-09.md`

This folder's `source/` preserves the public standalone deployment retrieved on 27 September 2026 from https://lebanese-academic-signals-desk.vercel.app/. Recovery was needed because several original files were iCloud placeholders. `recovery-manifest.json` records hashes. No news text, coordinates, source statuses or analysis data were rewritten. The original website route was moved to `previous-page.tsx` before replacement.

## Website version

- Website route: `src/app/signal-desk/page.tsx`
- Website integration: `src/components/signal-desk/signals-desk-edition.tsx`
- Colour/layout override: this folder's `website-theme.css`
- Served desk and data: `public/signals-desk/`
- Regenerate public files: `node scripts/package-signals-desk.mjs`
- Local preview: http://localhost:3013/signal-desk

The desk is hosted with the website, inside its shared September masthead and footer. Its isolated document keeps the original map controls and source-selection logic intact. The containing page automatically follows its height, including article expansion and phone layouts. Fonts and Leaflet are local; map tiles and credited editorial imagery still come from their original providers.

## Dates and refresh boundary

This is a saved September 2026 edition: 458 retained reports, 61 mapped reports at 37 locations. The latest retained feed was generated on September 9 at 23:27 Beirut. Reports are not unique incidents. Unmapped reports stay readable. The 143-coordinate yellow line retains its September 8 observation date and exact original geometry. Analysis has its own earlier coverage cutoff.

The website copy reads `public/signals-desk/data/`; the older collector writes a different folder. No automatic production refresh was connected in this task. Future updates require an explicitly verified collection/import and regeneration of this package. Do not silently call this snapshot live news.

## Checks

- `node --test scripts/signals-desk-integration.test.mjs scripts/signals-desk-analysis.test.mjs`
- Scoped lint of the route and integration component.
- Browser checks for map, filters, selection, pagination, article expansion, archive links and responsive widths.

## Published release, 27 September 2026

- Commit `2a949d06f41f2c20ba19a67af3ba9528abbf5fed` on branch `codex/ui-redesign-2026`.
- Production deployment `dpl_EW1excPrNviRNJA5KWY552jB7VCi`, ready at `https://leb-ac-web-2.vercel.app/signal-desk`.
- Vercel's production deployment lists `https://lebaneseacademic.org` and `https://www.lebaneseacademic.org` as aliases. During post-release checks, the `.vercel.app` address returned HTTP 200 and the full site interaction check passed. The custom domain failed the TLS connection and `www` did not resolve, so do not tell readers those custom addresses are working until DNS and HTTPS are repaired.
- The Vercel build used the pushed GitHub commit. Production browsing verified the 458-report feed, 61 mapped reports at 37 locations, loaded theme, search and reset, date filtering, and 390-pixel mobile width without browser errors.

The site displays the saved September edition. No automatic live collection is connected; future data changes need a verified collection/import and a new package/deployment.

Full local production build, 10 integration/analysis tests, scoped lint, and desktop and mobile browser checks passed. Full-project lint was interrupted by unrelated iCloud placeholders in the archived Sanity schema; Vercel's own full production build and TypeScript check passed.
