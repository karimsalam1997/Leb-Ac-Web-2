# Homepage final verification

Date: 11 July 2026

Preview: http://localhost:3001

## Final structure

The homepage contains six primary sections: lead essay, three recent essays, Signal Desk, editorial pathways, publication statement, and newsletter. Archive, Letters, and Notebook have no homepage, header, drawer, footer, or sitemap links. Their source files remain preserved.

## Responsive verification

| Viewport | Horizontal overflow | Broken images | Touch controls |
| --- | --- | --- | --- |
| 1920 × 1080 | None | None after lazy-load completion | Pass |
| 1440 × 900 | None | None | Pass |
| 1280 × 800 | None | None | Pass |
| 1024 × 768 | None | None | Pass |
| 768 × 1024 | None | None | Pass |
| 390 × 844 | None | None | Pass |
| 360 × 800 | None | None | Pass |
| 320 × 700 | None | None | Pass |

At 320 pixels, the menu button is 44 by 44 pixels, the email field is 46 pixels high, and the newsletter button is 48 pixels high.

## Image system

- The lead image uses a dedicated WebP derivative with a separate mobile focal point.
- The protest photograph uses a dedicated 2,200 pixel WebP derivative.
- The park visualization comes from the local `Video Edits` folder and is labelled as a visualization.
- The Ahiram image uses a public-domain Library of Congress source.
- Source credits open the original Wikimedia or Library of Congress record.
- Only the lead image is preloaded.
- All other homepage images are lazy-loaded through `next/image` with responsive `sizes` values.
- The browser selected an 1,080 pixel lead image, an 828 pixel protest image, and 384 pixel secondary images at the 1,440 pixel desktop viewport.

Homepage derivative weights:

- Roman Baths WebP: 548 KB.
- Martyrs' Square WebP: 336 KB.
- Beirut Park WebP: 352 KB.
- Ahiram sarcophagus WebP: 244 KB.

## Keyboard and screen-reader verification

- Skip to content is the first focusable item and targets `#site-content`.
- Focus rings are visible across paper, black, teal, and terracotta surfaces.
- The mobile drawer exposes one dialog and one accessible close button.
- The rest of the mobile header becomes inert while the drawer is open.
- Escape closes the drawer and returns focus to the menu button.
- The drawer traps Tab and Shift+Tab inside its links and controls.
- The homepage has one H1, four section H2 headings, and three story H3 headings.
- Five supporting sections expose accessible names. The lead is named by its H1.
- Sixteen Arabic elements are tagged with `lang="ar"` and `dir="rtl"`.
- Every homepage image has useful alternative text.

## Motion verification

- Initial lead reveal: 360 to 420 milliseconds with an eight-pixel rise.
- Hover and arrow feedback: 180 to 220 milliseconds.
- Image scale: 1.012.
- Drawer entrance: 200 milliseconds.
- Scrim fade: 180 milliseconds.
- Global and homepage-specific reduced-motion rules remove animation, transitions, transforms, and smooth scrolling when requested by the operating system.

## Newsletter verification

- Invalid email syntax is rejected by the browser.
- Loading state sets `aria-busy`, disables the field and button, and changes the button text.
- Error state uses an alert tied to the field with `aria-describedby` and `aria-invalid`.
- Editing after an error clears the stale error state.
- Success state clears the address and announces the API response.

Local email delivery cannot complete because `RESEND_FROM_EMAIL` and `SUBMISSION_TO_EMAIL` are absent from the local environment. The missing-configuration state is handled correctly. Production must contain both settings for live subscriptions.

## Technical verification

- ESLint passes.
- TypeScript passes with no emitted files.
- Production build passes.
- Browser console passes without new warnings or errors after a clean reload.
- Homepage, Essays, and About share the same paper background, header, footer, typography, and responsive shell.
- Metadata includes a unique title, description, canonical URL, Open Graph image, and Twitter large-card declaration.

## Remaining risk

One deployment setting remains external to the design: confirm the two newsletter email environment variables in production. No unresolved homepage design, responsive, image, motion, keyboard, or console defect remains in the local build.
