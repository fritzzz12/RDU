# White-dominant theme with indigo and gold

## Scope

Applied the user's palette/font direction, then their follow-up requesting white as the dominant color. Pages, cards, tables, forms and dialogs now use white surfaces with dark indigo ink. Navigation, footer, toast and the sign-in photograph retain dark brand regions; gold remains an accent rather than low-contrast text on white. No component markup, navigation routes, permission checks, database queries, API integrations, command payloads or form behavior were changed for this theme update. Existing 16px working/14px supporting text floors, generous controls, responsive layout and explicit-confirmation behavior remain intact. The prior sign-in heading/background/stage-strip changes are preserved.

## Centralized tokens

`src/theme.css` separates semantic working surfaces from the retained brand palette:

- `--color-primary-dark`: `#100B38` — navigation/footer bases and darkest ink.
- `--color-brand-royal`, `--color-brand-violet`: `#1C1554`, `#2C2666` — original indigo primitives.
- `--color-primary-surface`: `#FFFFFF` — dominant pages, cards, forms, tables and dialogs.
- `--color-secondary-surface`: `#F5F4FA` — subtle white-violet secondary containers.
- `--color-text-primary`, `--color-text-muted`: `#100B38`, `#514B70` — readable working copy.
- `--color-text-inverse`, `--color-text-inverse-muted`: `#FFFFFF`, `#C8C4E0` — dark-region copy.
- `--color-accent-gold`, `--color-accent-highlight`: `#F5CE56`, `#FCE38A` — primary actions, progress and dark-region selected highlights.
- `--color-accent-text`, `--color-accent-text-hover`: indigo semantic aliases — readable headings, links, metrics and notes on white.
- `--color-status-crimson`: `#C5192D` — limited correction/rejection/suspension and unread/status accents.
- `--color-border`, `--color-divider`, `--color-field-border`: royal indigo at 20%, 14% and 60% opacity. Dark regions scope lavender equivalents at 38%, 20% and 65%.
- `--color-overlay`: royal indigo at 88% over the unchanged sign-in photograph.
- `--color-scrim`, `--color-shadow`: midnight at 82% and 14%.
- `--color-focus`: indigo on white, scoped cream gold in dark regions.
- `--color-selection`, `--color-on-accent`: gold and midnight aliases.

Dark-region overrides are scoped to `.sidebar`, `.login-story`, `.toast` and `.page-footer`; they do not turn the main workspace dark.

Typography tokens:

- `--font-display`: Montserrat, Poppins, sans-serif.
- `--font-body`: Plus Jakarta Sans, DM Sans, sans-serif.
- `--font-weight-regular`, `--font-weight-semibold`, `--font-weight-bold`: 400, 600, 700.
- `--font-weight-heading`, `--font-weight-display`: 800, 900.
- `--letter-spacing-display`: 0.03em.

The major sign-in institutional heading uses Montserrat 900 with its proper-name casing, without CSS-forced uppercase. Page titles use Montserrat 800 and static Title Case under the interface copy standard; user-entered titles retain their original casing. Subheadings, labels and statistics use Plus Jakarta Sans. Existing helper/sub-note selectors and italic elements use the real 400 italic face with readable indigo on light surfaces. Uppercasing is CSS-only; underlying headings/route labels are not rewritten.

Primary buttons use midnight text on gold, not white on gold. Crimson badges use white, not lavender, text. All screen inputs use the native light color scheme. Print has explicit light-paper variables so reports remain readable without dark backgrounds or white-on-white text.

## Fonts

Google Fonts assets are bundled locally with `font-display: swap`, not requested from Google at runtime. Both Latin and Latin-extended subsets are supplied. The declarations cover Montserrat 700–900, Plus Jakarta Sans 400–700/400 italic, Poppins 800 and DM Sans 400–700/400 italic. Source URLs and byte sizes are recorded in `src/assets/fonts/sources.json`; each family includes its SIL Open Font License.

## Complete changed-file manifest for this theme task

### Application styles — modified

- `src/styles.css` — existing declarations now reference centralized theme properties; all screen surfaces, text, statuses, controls and print colors are coordinated without changing layout dimensions.

### New application styles

- `src/theme.css` — palette, semantic derivatives, font-family/weight and tracking tokens.
- `src/fonts.css` — self-hosted `@font-face` declarations for requested and fallback families.

### New font binaries

- `src/assets/fonts/montserrat-normal-latin.woff2`
- `src/assets/fonts/montserrat-normal-latin-ext.woff2`
- `src/assets/fonts/plus-jakarta-sans-normal-latin.woff2`
- `src/assets/fonts/plus-jakarta-sans-normal-latin-ext.woff2`
- `src/assets/fonts/plus-jakarta-sans-italic-latin.woff2`
- `src/assets/fonts/plus-jakarta-sans-italic-latin-ext.woff2`
- `src/assets/fonts/poppins-normal-latin.woff2`
- `src/assets/fonts/poppins-normal-latin-ext.woff2`
- `src/assets/fonts/dm-sans-normal-latin.woff2`
- `src/assets/fonts/dm-sans-normal-latin-ext.woff2`
- `src/assets/fonts/dm-sans-italic-latin.woff2`
- `src/assets/fonts/dm-sans-italic-latin-ext.woff2`

### New font licensing/provenance files

- `src/assets/fonts/montserrat-OFL.txt`
- `src/assets/fonts/plusjakartasans-OFL.txt`
- `src/assets/fonts/poppins-OFL.txt`
- `src/assets/fonts/dmsans-OFL.txt`
- `src/assets/fonts/sources.json`

### Updated documentation/metadata

- `DESIGN.md` — current indigo/gold token/component/typography rules.
- `.impeccable/design.json` — matching preview metadata, color ramps and component examples.
- `PRODUCT.md` — records the user-specified visual direction without claiming institutional brand approval.
- `architecture.md` — records the styling boundary and unchanged application behavior.
- `README.md` — current branding/font description and link to this manifest.
- `docs/UI-ACCESSIBILITY.md` — current visual theme reference; accessibility contracts preserved.
- `BGROUND.jpg.json` — supplied photograph's treatment updated from the earlier dark navy overlay to 88% royal indigo.

### New documentation

- `docs/THEME-UPDATE.md` — this manifest, token descriptions and verification record.

`BGROUND.jpg` itself is unchanged; it remains the user-supplied photograph. `src/main.jsx` already contains the separately requested institutional headline and removal of the sign-in stage strip; those existing edits are preserved, not part of the theme implementation. Unrelated `skills-lock.json` is untouched. Local screenshots/mockups/scripts under `.thinkrail/context/` are review evidence, not application deliverables.

## Verification

- Production Vite build includes all WOFF2 assets and the supplied photo.
- Browser checks confirm Montserrat and Plus Jakarta Sans load and the requested midnight token resolves correctly.
- Page-by-page axe scans cover sign-in, every authorized admin module, project checklist, document dialog and mobile Home: no violations in tested states.
- The existing 22-browser regression suite passes, including all roles, routes/menu destinations, submissions, review/confirmation, required fields, phase gates, 320–1440px reflow, keyboard focus and mandatory accessibility scans.
- The existing 12 backend/report tests pass.
- Preview screenshots show the same layout in the new theme; runtime page errors were not observed in the capture run.
- Retained dark-region/action text-pair checks: white/royal 16.35:1, lavender/slate 7.88:1, midnight/gold 12.29:1 and white/crimson 5.91:1. The white-dominant follow-up was rescanned across all admin pages, desktop/mobile, checklist and document dialog with zero axe violations.
- Print smoke check confirms white paper, midnight body/headline ink and hidden navigation.
- CSS-variable resolution, schema-v2 design metadata, local WOFF2 headers and the spec graph validate.

These checks establish regression evidence for the styling change, not a production-security or universal assistive-technology certification. No deployment or GitHub push is implied.
