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

Public deployment is a separate step. A working local preview is not a published replacement.

Verified 27 September 2026: full production build passed, 10 integration/analysis tests passed, scoped lint passed, and browser interaction checks passed at 1440, 768, 390 and 320 pixels with no horizontal overflow or browser errors. The checks covered all filters, no-results/reset, pagination, report selection, yellow-line toggle, source status, full-article expansion and archive return. Existing iCloud placeholders initially blocked the build; requesting their download restored access without changing those files.
