# Lebanese Academic Homepage Design Audit

Date: 11 July 2026

Scope: the current homepage at `/`, including the shared desktop and mobile header, footer, imagery, responsive behaviour, interaction language, accessibility signals, and the CSS system supporting it.

## Executive verdict

Lebanese Academic already has a recognisable world: warm paper, terracotta, cobalt Arabic, serious serif typography, Beirut photography, archival marks, and a darker operational register for Signal Desk. The problem is concentration. Nearly every visual device appears on the homepage, nearly every section is framed, and nearly every piece of content is given the same weight.

The result is rich at first glance and tiring by the third screen. It feels like several publication concepts competing inside one front page: newspaper, archive, issue ledger, cultural journal, personal notebook, newsletter, and portfolio. A winning redesign should edit this identity, not replace it.

The desired impression is a contemporary Beirut publication with an archive behind it. The present impression is an archive trying to prove its size.

## Measured baseline

| Viewport | Page height | Header | Lead | Mission | Topics | Latest | Archive | Also Read | Newsletter | Correspondence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1440 x 1000 | 3,786 px | 186 px before shrinking | 954 px | 426 px | 190 px | 489 px | 333 px | 537 px | 169 px | 313 px |
| 1024 x 768 | 4,064 px | 108 px while compact | 861 px | 413 px | 282 px | 861 px | 379 px | 448 px | 190 px | 313 px |
| 768 x 1024 | 6,435 px | 104 px | 1,557 px | 438 px | 282 px | 1,321 px | 589 px | 1,013 px | 236 px | 576 px |
| 390 x 844 | 7,602 px | 104 px | 1,351 px | 480 px | 727 px | 2,060 px | 632 px | 734 px | 376 px | 706 px |
| 320 x 700 | 7,491 px | 80 to 104 px | 1,364 px | 528 px | 727 px | 1,902 px | 656 px | 681 px | 400 px | 706 px |

There are 24 links inside the homepage main content. Twenty-one point into Essays. Five visible calls to action use the repeated ASCII arrow `->`. Forty-six descendants inside the homepage main content carry at least one border. The homepage CSS contains 224 `home-` selector mentions spread across several generations of the 9,476-line global stylesheet.

## What must remain

- Warm cream paper ground.
- Terracotta as the editorial action colour.
- Cobalt as the bilingual and institutional colour.
- Black or near-black editorial ink.
- Fraunces for display moments.
- Cormorant Garamond for literary descriptions and standfirsts.
- Noto Naskh Arabic for Arabic.
- JetBrains Mono for data, dates, evidence, filters, and Signal Desk.
- Serious Lebanese photography and archival material.
- One confident bilingual masthead.
- The phrase “The country, not the crisis.”
- Signal Desk’s darker operational personality.

## What must leave the public homepage

- The Archive section. Essays is already the archive.
- Archive counts and Issue 01 ledger furniture.
- Letters section and Letters links.
- The two-card correspondence ending.
- The second “Also Read” essay shelf.
- Notebook as a homepage department.
- Notebook as a primary navigation item.
- Submit as the dominant header action.
- The vertical Issue 01 rail.
- The Beirut 1975 stamp inside the navigation bar.
- Repeated author and newsletter logo medallions.
- Most card borders and tinted card backgrounds.
- Six equal topic boxes.
- Repeated `->` arrows.

The underlying Letters, Notebook, and Archive-related files should be preserved until the new site is stable. Removing a department from public view does not require destroying the writing.

## Information architecture audit

### Current order

1. Utility strapline
2. Large masthead
3. Five-item primary navigation
4. Lead essay
5. Second lead essay
6. Pattern strip
7. Long About statement
8. Six Topics
9. Five Latest essays
10. Archive promotion
11. Two Also Read essays
12. Newsletter
13. Letters and Notebook
14. Dense footer

This order makes the visitor repeatedly restart. The lead ends, another lead begins, then the publication explains itself, then categories appear, then seven more essays appear in two shelves, then the archive advertises the same essays again.

### Required order

1. Compact header
2. One dominant lead essay
3. Three recent essays
4. Compact live Signal Desk strip
5. Three editorial pathways: Power, Memory, War
6. One short publication statement
7. One newsletter invitation
8. Restrained footer

Target mobile length: 4,500 to 5,300 pixels with current content. Target desktop length at 1440 pixels: 2,500 to 3,000 pixels.

## Header audit

### Utility strip

The black strip is useful as a tonal threshold, but it currently adds another layer before a large masthead. Keep it only if it becomes extremely quiet: 24 to 28 pixels, one English phrase on the left, one Arabic phrase or location on the right. On small phones it may disappear.

### Desktop masthead

The masthead currently contains a logo medallion, huge English wordmark, huge Arabic wordmark, divider, English statement, Arabic statement, and Submit button. The following row adds five bilingual navigation items, a rotated Beirut 1975 stamp, and the issue rail. This is too much identity before content.

Required fix:

- Use one horizontal masthead between 72 and 96 pixels high at rest.
- Keep the mark, English name, and Arabic name as one lockup.
- Remove the explanatory statement from the masthead.
- Remove the divider.
- Remove the Beirut stamp and issue rail.
- Navigation: Essays, Signal Desk, Topics, About.
- Primary action: Subscribe.
- Secondary menu item: Submit.
- Search can be introduced as an icon only if it searches real content.
- After scrolling, reduce the masthead to 56 to 64 pixels without moving the reader’s scroll position.

The current shrinking header actively adjusts `window.scrollBy` while its height changes. During audit, a programmatic move to 1,100 pixels settled at 157 pixels. That is evidence that the preservation logic can fight navigation and anchor movement. Replace the changing-height header with a stable sticky shell or a transform-based compact state.

### Breakpoint problem

At 1,024 pixels the full desktop header remains active and is compressed into 108 pixels. At 1,023 pixels the site abruptly changes to the mobile system. The breakpoint produces two different products separated by one pixel. The tablet header should begin around 1,100 to 1,180 pixels, before the desktop masthead becomes cramped.

### Mobile header

The mobile page currently has a logo row, a menu button, a second row with Essays, Signals, Topics, Notebook, Submit, and More, plus a drawer containing About and Archive. It is redundant.

Required fix:

- One 60 to 68 pixel row.
- Logo left.
- Subscribe as a compact text action.
- Menu button right.
- One drawer containing Essays, Signal Desk, Topics, About, Submit, and contact details.
- Remove the horizontal navigation rail entirely.
- Minimum touch target: 44 by 44 pixels.

Measured failures: menu is 40 by 40 at 768 pixels, 38 by 38 at 390 pixels, 32 by 32 at 320 pixels. Mobile navigation links are 42 pixels high. All are below the 44-pixel target.

## Lead essay audit

### What works

- The lead story is unmistakable.
- The title has authority.
- The Roman Baths image has strong diagonal rhythm and a specific Beirut location.
- The split composition works on wide desktop.
- Terracotta kicker and black display type are on brand.

### What fails

- The story and image are each enclosed by a border, making the opening feel like two cards.
- The title is forced into custom line spans. This can create awkward joins in the accessibility text and makes the design brittle when the lead story changes.
- The desktop title is 66 pixels, 900 weight, uppercase, and nearly fills its box. This is powerful once, but the page repeats the same ceremonial weight below.
- The full deck is too long for a front-page opening.
- The author medallion repeats the site mark and adds ceremony without information.
- Date and reading time are only about 10 pixels on desktop.
- The explicit “Read essay ->” link is redundant because title and image are already links.
- On mobile, text comes first and the image follows. The first photograph can begin below the first screen.
- The mobile lead remains 1,351 to 1,364 pixels tall.

### Required composition

Desktop option recommended for Round 1:

- 12-column grid.
- Image spans 7 columns.
- Copy spans 5 columns.
- Image height between 620 and 720 pixels at 1440 width.
- Borderless composition with one structural rule beneath it.
- Kicker 12 to 13 pixels.
- Title between 68 and 92 pixels depending on length, sentence case or restrained title case.
- Deck capped at 220 characters and 3 to 4 lines.
- One meta line: Karim Salam, date, reading time.
- Entire image and title clickable.

Mobile:

- Image first, 4:5 or 3:4 crop, 360 to 460 pixels tall.
- Kicker, title, two-line deck, compact metadata.
- Total lead target: 780 to 950 pixels.
- Do not show a logo medallion or separate read link.

## Second feature audit

“The Park That Remembers” immediately follows the lead at near-feature scale. The page therefore announces two leads before explaining its editorial rhythm. The pigeon-tower image is visually seductive and warmer than the Roman Baths image, which can make the second story feel more important than the first.

Move this essay into the three-story recent section. If it remains visually featured, it should be the large recent card, one level below the lead.

The geometric pattern strip beneath it is attractive but currently behaves like another decorative claim. Keep at most one pattern intervention on the homepage, used as a thin transition or footer texture, not as a full-width separator after a second hero.

## About statement audit

The current About section occupies 426 to 528 pixels and repeats the proposition in a lead paragraph, an explanatory paragraph, and Arabic. It arrives before the reader has seen enough work.

Required fix:

- Move it after the pathways or Signal Desk.
- Use one English statement of 35 to 55 words.
- Use one Arabic statement of comparable meaning, with deliberate space and no forced side-by-side squeeze.
- Remove the “About / عن المنشور” label if the sentence can identify itself.
- Add one quiet link to About.
- Target height: 220 to 320 pixels desktop, 300 to 420 pixels mobile.

## Topics audit

Six equal boxes create the appearance of an administrative taxonomy. Counts of one, two, three, and four expose the archive’s small size. Roman numerals, colour strips, bilingual labels, borders, and counts all compete inside 92-pixel tiles.

Required fix:

- Replace six tiles with three editorial pathways: Power, Memory, War.
- Each pathway gets one distinct image or typographic field.
- Add one sentence defining the pathway.
- No counts.
- No Roman numerals.
- No coloured top borders.
- No separate “Open the full register” action beside the heading.
- Clicking the pathway should open Essays with the relevant filter already active.

Desktop layout: three columns with varied visual treatment. Mobile layout: three generous rows, each 150 to 220 pixels, with image or colour field occupying roughly 40 percent.

## Latest essays audit

Five equal columns work only as a catalogue. At 1440 pixels each image is roughly 265 by 167 pixels and the body copy drops to 14.9 pixels. Metadata is 9.8 pixels. The stories become tiny containers of text.

At 390 pixels the same five cards stack into 2,060 pixels. Two adjacent essays concern generators, causing editorial and visual repetition.

Required fix:

- Show three essays.
- Use an asymmetric composition: one 7-column story and two stacked 5-column stories, or one large story plus two equal cards.
- The Park That Remembers can become the large recent story.
- Do not place both generator essays together on the homepage.
- Card titles: 26 to 38 pixels desktop, 24 to 30 pixels mobile.
- Descriptions: 17 to 20 pixels desktop, at least 17 pixels mobile.
- Metadata: at least 12 pixels with comfortable tracking.
- Remove card background gradients.
- Remove the border box. Use image, typography, and whitespace to define each item.
- Preserve one thin rule between stories only where necessary.

## Signal Desk omission

Signal Desk appears in navigation but has no homepage presence. This is a missed opportunity because it is the site’s most contemporary and functional product.

Add a compact dark strip after recent essays:

- Black or deep teal ground.
- One small map crop or location mark.
- One current event or latest briefing line.
- Clear last-updated time.
- Status language must distinguish confirmed, claimed, unclear, and outdated.
- One action: Enter Signal Desk.
- Desktop target height: 180 to 260 pixels.
- Mobile target height: 300 to 420 pixels.
- It must feel live without recreating the dashboard.

## Archive audit

The Archive section repeats the Essays page while advertising only 11 essays, five letters, and five notebook notes. The copy says the register is built “not for scrolling” inside a homepage that is 7,602 pixels long on mobile. The contradiction is visible.

Remove the section, image, icon, issue number, counts, and Archive drawer link. Essays becomes the sole archive destination.

## Also Read audit

This shelf adds two more essays after five Latest essays and after the Archive has advertised all essays. It is redundant. Remove it.

If Sovereignty Theatre or The Rubble Zone deserves homepage prominence, it should replace one of the three recent stories or appear inside a pathway.

## Newsletter audit

### What works

- The deep teal interrupts the cream page effectively.
- The form is visible and understandable.
- The input and button are at least 48 pixels high.
- The section provides a real conversion point.

### What fails

- The copy promises “the new letter” after Letters is removed.
- The medallion repeats the logo again.
- The textured stamp background, circular logo frame, English heading, English paragraph, Arabic paragraph, input icon, and button make the strip dense.
- “Send me Sundays” is distinctive but slightly transactional and assumes a publishing schedule that must be kept.

Required fix:

- Keep the deep teal or black field.
- Remove the logo medallion.
- One strong heading of 5 to 9 words.
- One sentence of 12 to 22 words.
- Rewrite the Arabic line rather than compressing it beneath the English.
- Keep one field and one button.
- Define success, loading, error, keyboard, focus, and disabled states.
- Mobile button and input remain at least 48 pixels high.

## Correspondence audit

Letters and Notebook occupy 313 pixels desktop and 706 pixels mobile. The section makes two thin departments look like permanent institutions. Remove the entire section.

Notebook writing can be preserved as future fragments, pull quotes, or interludes. It should return as a department only when the body of work earns it.

## Footer audit

The footer repeats the logo, strapline, Arabic strapline, founding line, four links, social handle, email, copyright, publishing note, and issue stamp. At the end of a visually dense page this feels like another information panel.

Required fix:

- Small brand line.
- Essays, Signal Desk, About, Submit.
- Instagram and email.
- Copyright.
- Remove Letters and Issue 01.
- Remove the repeated full medallion if the wordmark is already present.
- Keep the black ground.
- Target height: 180 to 260 pixels desktop, 320 to 440 pixels mobile.

## Typography audit

The font family choices are good. Their role boundaries are not strict enough.

Current desktop examples:

- Wordmark: 45.4 pixels Fraunces, weight 900.
- Arabic wordmark: 33.8 pixels Noto Naskh, weight 800.
- Lead title: 66.2 pixels Fraunces, weight 900, uppercase.
- Section headings: 32 pixels Fraunces, weight 900, uppercase.
- Story title: 21.1 pixels Fraunces.
- Story description: 14.9 pixels Cormorant.
- Story metadata: 9.8 pixels JetBrains Mono.
- Navigation: 11 pixels JetBrains Mono with 2.65 pixels tracking.

The scale jumps from monumental to tiny. The middle is missing.

Required roles:

- Display: Fraunces, 68 to 96 pixels desktop, 38 to 54 mobile.
- Section title: Fraunces, 36 to 52 desktop, 30 to 38 mobile.
- Story title: Fraunces, 26 to 38 desktop, 24 to 30 mobile.
- Deck: Cormorant or Fraunces, 18 to 22 desktop, 17 to 20 mobile.
- Body and utility explanations: 17 to 19 pixels.
- Metadata: JetBrains Mono, 12 to 13 pixels.
- Navigation: JetBrains Mono, 12 to 13 pixels with restrained tracking.
- Arabic must be optically sized, not mechanically matched to English pixels.

Use uppercase only for short labels. Long titles should not be forced into uppercase.

## Colour audit

The palette is coherent. It should be controlled by ratio:

- 70 to 78 percent warm paper.
- 12 to 18 percent near-black ink and dark fields.
- 5 to 8 percent terracotta.
- 3 to 6 percent cobalt.
- Teal reserved mainly for Signal Desk and newsletter.

The CSS currently defines root colour variables more than once. The opening root uses `#c14a2e` and `#0c0c0c`; a later root replaces them with `#bd4528` and `#15100d`. Consolidate to one source of truth before final polish.

Do not introduce new hues. Variation should come from density, scale, transparency, and image temperature.

## Borders, backgrounds, and depth

The homepage has 46 bordered descendants. Lead copy, lead image, second feature, five story cards, six topic tiles, Archive, two Also Read cards, newsletter, and two correspondence cards are all framed.

Required system:

- Borderless story cards by default.
- One dark rule between major sections.
- One light rule inside lists.
- No nested boxes.
- No gradient card backgrounds.
- No shadows on editorial content.
- A shadow is permitted only for temporary overlays such as the mobile drawer.
- Use whitespace, image edges, and type scale as the main separators.

## Spacing audit

The current homepage uses many 10, 12, and 14 pixel gaps. This creates catalogue density. Major sections need 64 to 120 pixels of vertical separation on desktop and 48 to 80 pixels on mobile.

Adopt one spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

- Internal label gap: 8 to 12.
- Title to deck: 16 to 24.
- Deck to metadata: 24 to 32.
- Story-to-story gap: 24 to 40.
- Section padding: 64 to 96 desktop, 48 to 72 mobile.
- Hero to recent stories: 72 to 112.

## Bilingual design audit

Arabic is central to the identity, but it is often used as compulsory furniture beside every English label. This reduces it to ornament.

Required fix:

- Keep Arabic in the masthead.
- Use Arabic for major section titles or one sentence per major block.
- Do not translate every tiny action, count, and category.
- Give Arabic independent alignment and breathing room.
- Avoid hiding Arabic as the masthead shrinks while English remains visible. If space disappears, simplify both languages together.
- Ensure Arabic line height remains controlled in compact components.

## Image audit

### 1. Roman Baths, lead essay

File: `city-roman-baths-ruins.jpg`, 3,872 by 2,592, 3.19 MB source.

Strength: genuine texture, diagonal rhythm, specific Downtown Beirut archaeology.

Problem: at first glance the repeated stone columns can look like bolts or industrial debris. The current crop turns a place into a pattern. It does not immediately explain “a city that could not repair itself.”

Action: test three crops. One wider crop that reveals the site, one current abstract crop, and one alternative Downtown image. If the abstract crop wins, add a discreet location line. Preserve image quality but deliver an optimized derivative.

### 2. Pigeon tower visualization

File: `pigeon-tower-release.jpg`, 1,792 by 2,400, 2.74 MB source.

Strength: beautiful silhouette, warm dusk light, memorable object, strong Lebanese architectural reference.

Problem: it reads as an illustration or architectural visualization rather than documentary photography. On a serious publication homepage this distinction must be clear. It is also warmer and more immediately seductive than the lead image.

Action: label it as a proposal or visualization wherever context requires. Move it into the recent-story composition. Do not allow it to compete with the lead.

### 3. October 2019 protest crowd

File: `cartel-independence-day-2019.jpg`, 6,000 by 4,000, 5.32 MB source.

Strength: people, scale, political energy, immediate Beirut recognition.

Problem: at 265 by 167 rendered pixels the human detail collapses. Source is unnecessarily heavy for a card.

Action: retain. Give it a larger crop or make it one of the two secondary recent stories. Generate a homepage-sized derivative.

### 4. Nahr Ibrahim valley

File: `mourning-nahr-ibrahim.jpg`, 960 by 1,280, 454 KB source.

Strength: lush, atmospheric, geographically relevant.

Problem: current landscape crop removes the vertical drama and could depict many green valleys. It does not carry the essay’s mourning, Fatima, Mary, or ritual inheritance.

Action: search the existing essay image set for a more specific human, river, shrine, or ritual image. If retained, use a taller crop and a more prominent placement.

### 5. Generator Republic street

File: `generator-republic-street.jpg`, 3,840 by 2,161, 2.20 MB source.

Strength: recognisable Beirut traffic, wires, compression, public-system failure.

Problem: it sits beside another generator essay, making the homepage feel repetitive.

Action: retain the stronger of the two generator stories on the homepage. This is the stronger homepage image.

### 6. Shatila infrastructure wires

File: `mehtail-shatila-infrastructure.jpg`, 1,280 by 960, 332 KB source.

Strength: specific, materially descriptive, close to the essay’s argument.

Problem: visually similar to the generator story when placed beside it. The crop is busy and the title is very long.

Action: remove from the homepage rotation while keeping it inside the essay.

### 7. Religious distribution map

File: `census-loc-religious-map.jpg`, 3,317 by 4,326, 1.84 MB source.

Strength: primary-source feeling and direct relevance.

Problem: portrait map is cropped with `object-fit: cover` into a horizontal card. Labels become unreadable and the visual evidence is mutilated.

Action: never crop this map as a decorative photograph. Use `contain` on a paper field, show a meaningful detail crop with context, or replace it with a census document cover.

### 8. Archive collage

File: `archive-river.jpg`, 900 by 480, 204 KB source.

Strength: coherent palette and attractive archival mood.

Problem: generic heritage collage and low resolution relative to its 532 by 293 rendered size on high-density screens. The entire section is redundant.

Action: remove with Archive.

### 9. UN Security Council chamber

File: `sovereignty-un-security-council.jpg`, 3,780 by 3,024, 3.31 MB source.

Strength: clear geometry, institutional emptiness, strong metaphor.

Problem: appears late in a redundant shelf. The wide crop reduces the chamber’s circular composition.

Action: preserve inside the essay or use inside a Power pathway. Remove from the current Also Read shelf.

### 10. Marwahin / Rubble Zone image

File: `rubble-marwahin.jpg`, 1,280 by 960, 426 KB source.

Strength: geographic relevance.

Problem: the current homepage crop foregrounds a car, fence, and barren slope. It does not visibly communicate rubble, destroyed homes, or a southern Lebanese village. Title and image feel disconnected.

Action: replace the homepage crop with an image that visibly names the destruction, or use the Blue Line map as evidence with deliberate `contain` treatment.

### 11. Newsletter medallion

Strength: consistent brand mark.

Problem: the mark already appears in the header, hero byline, newsletter, and footer. Repetition cheapens it.

Action: remove from newsletter and hero metadata. Keep one masthead mark and, if necessary, one small footer mark.

### 12. Letters manuscript

File: `letters-manuscript.jpg`, 900 by 400, 102 KB source.

Action: remove with the Letters homepage section. Preserve the source file.

### Image-system rules for the redesign

- Every image must be documentary, archival, a clearly labeled visualization, or intentionally abstract. Never let these categories blur.
- No two adjacent stories should repeat the same visual subject.
- Maps and documents use `contain`, never blind `cover` cropping.
- Documentary photographs can use `cover`, with a stored focal point per breakpoint.
- Hero: 4:5 mobile, approximately 7:6 desktop.
- Large recent: 4:3 or 3:2.
- Secondary recent: 16:10 or 4:3.
- Pathways may use 1:1 details or borderless typographic fields.
- Define desktop, tablet, and mobile focal points for important images.
- Pre-generate sensible web derivatives. Several source files are between 2.2 and 5.3 MB.
- Add visible credits or captions when provenance matters.
- Avoid decorative images that could belong to any Mediterranean publication.

## Interaction and motion audit

Current cards shift upward by two pixels, change border colour, change background gradient, and change title colour. This reinforces the card system rather than the publication.

Required motion language:

- Duration: 160 to 240 milliseconds.
- Easing: one shared ease-out curve.
- Story hover: image scale 1.01 to 1.02 and title colour change.
- Links: underline or rule reveal, no ASCII arrow animation.
- Navigation: subtle opacity and rule movement.
- Drawer: 180 to 240 millisecond slide with focus trap.
- No scroll-triggered theatre.
- Preserve reduced-motion support.
- Do not change header height in a way that moves the document underneath the reader.

## Accessibility audit

Strengths already present:

- Skip link.
- Visible focus outlines.
- Reduced-motion rules.
- Menu focus trapping and Escape handling.
- Semantic headings and sections.
- Newsletter loading, success, and error states.
- No horizontal page overflow at tested widths.

Required fixes:

- Increase every mobile target to at least 44 by 44 pixels.
- Raise metadata from 9.8 pixels to at least 12 pixels.
- Avoid manual title spans that concatenate words in the accessibility tree.
- Confirm contrast for muted brown metadata on gradient paper.
- Add a visible label or persistent accessible label for newsletter email.
- Ensure story cards have a single clear accessible name rather than duplicated nested link purposes.
- Keep focus styles visible over dark Signal Desk and newsletter fields.
- Test keyboard order after the header is simplified.
- Test Arabic with real screen-reader language attributes where text changes language.
- Do not rely on colour alone for Signal Desk status.

## Technical design-system audit

The global stylesheet is 9,476 lines and contains multiple generations of home, header, essays, article, and repair rules. Homepage selectors appear from around line 1,845 through line 9,290. Root variables are redefined. Several comments describe previous repairs, showing that local fixes have accumulated.

Required fix before Round 3:

- Consolidate homepage rules into one contiguous module or stylesheet.
- Keep one root token definition.
- Remove unused Archive, Letters-home, correspondence, second-feature, and old mobile-nav rules after the new page is accepted.
- Preserve unrelated page rules.
- Define breakpoint policy once.
- Define reusable StoryCard, SectionHeading, EditorialPathway, SignalStrip, and Newsletter components.
- Keep homepage structure data-driven without mechanically showing every essay.

## Award-level quality bar

The site should be judged against these tests:

- Can the publication be understood in five seconds?
- Is there one dominant object in the first screen?
- Does every subsequent screen introduce a new rhythm?
- Could any image or sentence belong to a generic foreign magazine? If yes, replace it.
- Does Arabic feel authored rather than attached?
- Are maps treated as evidence?
- Is Signal Desk visibly part of the publication’s future?
- Does mobile feel edited instead of stacked?
- Can every border, label, image, and animation explain why it exists?
- Does the page remain recognisable with half its decoration removed?

## Three-round redesign guide

### Round 1: Structure and hierarchy

Purpose: make the homepage editorially correct before polishing it.

Work:

- Remove Archive and Letters from homepage, navigation, drawer, footer, and sitemap while preserving source files.
- Remove Notebook from homepage and primary navigation.
- Simplify desktop and mobile headers.
- Reorder homepage into lead, three recent essays, Signal Desk, three pathways, short statement, newsletter, footer.
- Remove the second lead, Also Read, correspondence, issue furniture, duplicate calls to action, and most boxes.
- Preserve current palette, fonts, copy, and images during this round.
- Verify desktop, laptop, tablet, 390-pixel mobile, and 320-pixel mobile.

Deliverable: a complete structural draft at a verified localhost URL.

Approval test: the publication should feel calmer and more important even before final art direction.

### Round 2: Art direction, imagery, and bilingual system

Purpose: turn the correct structure into a distinctive visual publication.

Work:

- Choose final hero composition and crop.
- Rebuild the three-story image rhythm.
- Replace or correct weak crops, especially Census and Rubble Zone.
- Label visualizations clearly.
- Build the three editorial pathways.
- Design the compact Signal Desk strip.
- Finalize typography scale, spacing rhythm, border hierarchy, colour ratio, Arabic placement, and newsletter treatment.
- Build image focal points for desktop, tablet, and mobile.

Deliverable: the visually complete homepage at a verified localhost URL.

Approval test: it should feel unmistakably Beirut, contemporary, and impossible to confuse with a newspaper template.

### Round 3: Motion, accessibility, performance, and final verification

Purpose: bring the page from visually strong to publication-ready.

Work:

- Add restrained hover, focus, drawer, and section transitions.
- Fix touch targets and metadata sizes.
- Verify keyboard and screen-reader structure.
- Consolidate homepage CSS and remove dead rules.
- Optimize image derivatives and loading priorities.
- Verify newsletter states.
- Check console output.
- Test at wide desktop, laptop, tablet, 390, 360, 320, reduced motion, and keyboard-only use.
- Complete a final page-by-page comparison so the homepage still belongs to the rest of Lebanese Academic.

Deliverable: final verified localhost URL and a short remaining-risk list, ideally empty.

Approval test: no obvious unfinished states, no accidental movement, no weak crop, no duplicate department, and no screen where hierarchy collapses.

## Round 1 approval prompt

Approve Round 1: remove Archive and Letters from the public structure, preserve their files, remove Notebook from the homepage and primary navigation, simplify both headers, and rebuild the homepage into the new eight-part structure before changing final imagery or decorative styling.

