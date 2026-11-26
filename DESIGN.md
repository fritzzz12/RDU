---
name: RDMS White with Indigo and Gold
description: White-dominant accessible research workspace with indigo navigation and gold accents.
colors:
  midnight-indigo: "#100B38"
  royal-indigo: "#1C1554"
  slate-violet: "#2C2666"
  gold: "#F5CE56"
  cream-gold: "#FCE38A"
  white: "#FFFFFF"
  lavender: "#C8C4E0"
  crimson: "#C5192D"
  soft-surface: "#F5F4FA"
  muted-ink: "#514B70"
  border: "rgb(28 21 84 / 20%)"
  divider: "rgb(28 21 84 / 14%)"
  field-border: "rgb(28 21 84 / 60%)"
  image-overlay: "rgb(28 21 84 / 88%)"
  scrim: "rgb(16 11 56 / 82%)"
typography:
  headline:
    fontFamily: '"Montserrat", "Poppins", sans-serif'
    fontSize: "clamp(1.75rem, 2.4vw, 2.125rem)"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "0.03em"
  display:
    fontFamily: '"Montserrat", "Poppins", sans-serif'
    fontSize: "clamp(1.875rem, 3vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 1.35
    letterSpacing: "0.03em"
  title:
    fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif'
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.4
  section:
    fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif'
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  supporting:
    fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "8px"
  field: "6px"
  panel: "12px"
  review: "10px"
  dialog: "14px"
spacing:
  tight: "8px"
  related: "12px"
  control-x: "18px"
  section-inset: "20px"
  panel: "24px"
  section-gap: "28px"
  desktop-gutter: "clamp(20px, 2.5vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.midnight-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.cream-gold}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.midnight-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  input-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.midnight-indigo}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  navigation-active:
    backgroundColor: "{colors.slate-violet}"
    textColor: "{colors.gold}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  status-pending:
    backgroundColor: "{colors.soft-surface}"
    textColor: "{colors.royal-indigo}"
    typography: "{typography.supporting}"
  status-correction:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.white}"
    typography: "{typography.supporting}"
  panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  review-summary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.midnight-indigo}"
    rounded: "{rounded.review}"
    padding: "{spacing.panel}"
  dialog:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.dialog}"
    width: "720px"
---

# Design System: RDMS White with Indigo and Gold

## Overview

**Creative North Star: "Research wayfinding"**

The user's explicit indigo-and-gold visual direction restyles the existing beginner-friendly research workspace without changing its composition, routes, forms or business rules. White is the dominant page, card, table, form and dialog surface. Midnight navigation/footer bases retain the indigo identity, while soft violet-white containers distinguish secondary information. Gold remains on primary actions, progress and selected highlights. Headings, links and values use indigo on white rather than low-contrast gold.

All existing readable sizing, generous controls, visible guidance, exact research requirements and responsive records remain. This is a user-specified theme, not a claim of official Bukidnon State University brand approval. The supplied BGROUND.jpg photograph is used only on the sign-in panel with the requested royal-indigo overlay; the institutional heading and recently removed stage strip stay as the user requested.

Evidence: `src/theme.css`, `src/fonts.css`, `src/styles.css`, bundled font sources/licenses, unchanged React markup and the theme-prefixed before/after captures under the local context directory. Palette/font values are centralized in the theme stylesheet; component/layout rules reference them instead of retaining the previous hardcoded navy/teal/light palette.

**Key Characteristics:**

- Dominant white working surfaces with high-contrast indigo/dark-violet copy.
- Indigo navigation and retained sign-in photograph; gold primary actions and selected highlights.
- Montserrat display headings with Plus Jakarta Sans working typography.
- Existing accessible navigation, reflow and explicit-confirmation workflows preserved.

## Colors

The user's follow-up makes white dominant. The original eight brand colors remain, with soft white-violet (#F5F4FA) secondary surfaces and dark muted ink (#514B70) for readable supporting copy. Surface and text tokens are semantic; dark navigation/photo/toast/footer regions scope their inverse tokens separately.

### Primary

- **Deep Midnight Indigo** (`midnight-indigo`): deepest backgrounds, navigation and footer bases; also text on gold buttons.
- **Royal Indigo** (`royal-indigo`): headings, links, statuses, focus and the sign-in image overlay.
- **Muted Slate Violet** (`slate-violet`): selected destinations and secondary containers in dark brand regions.
- **Warm Amber Gold** (`gold`): primary action fill, progress and active navigation highlights.
- **Bright Cream Gold** (`cream-gold`): primary-action hover and focus in dark regions.

### Secondary

- **SDG Crimson Red** (`crimson`): specific correction/rejection/suspension badges and unread-count/status accents. Error boundaries may use it to signal a failure, but it is not a general card color. Text on crimson is white, not low-contrast lavender or gold.

### Neutral

- **Pure White** (`white`): dominant working surfaces and inverse text on dark brand regions.
- **Soft Lavender Gray** (`lavender`): supporting copy in dark brand regions. Working metadata and placeholders use dark muted ink on white.
- **Borders and image treatment:** border/divider/field-border use royal indigo at different opacity on light surfaces, with lavender equivalents in dark regions. The supplied photo uses royal indigo at (88%) opacity. Modal/drawer scrims use midnight indigo; shadows are a transparent midnight derivative.

**The Evidence State Rule.** Keep written statuses visible alongside color; palette simplification must not change or obscure stored approval states.

## Typography

**Display Font:** Montserrat, with Poppins as the loaded fallback.
**Body, Label and Statistics Font:** Plus Jakarta Sans, with DM Sans as the loaded fallback.

Font faces are sourced from Google Fonts and self-hosted WOFF2 assets, with Latin and Latin-extended coverage and individual SIL Open Font License files. Runtime rendering does not require third-party font requests. `font-display: swap` keeps content available while local assets load.

### Hierarchy

- **Display:** Montserrat (900) for the major sign-in institutional heading, preserving its proper-name casing and slight tracking; do not force uppercase.
- **Headline:** Montserrat (800), used for page headings and wordmark; static page names use Title Case. User-entered names and titles retain their original casing.
- **Title / section:** Plus Jakarta Sans (700) organizes panels, fieldsets and review sections; section headings use indigo on white.
- **Body:** Plus Jakarta Sans (400), preserving the normal (16px) working size and generous line height.
- **Labels / statistics:** Plus Jakarta Sans (600/700), not a separate decorative display face.
- **Supporting:** the existing (14px) minimum remains for dates, hints and metadata. Explanatory sub-notes and italic elements use the actual (400 italic) face, with dark indigo on light surfaces.

**The Readable Evidence Rule.** Never shrink information to fit the screen. Reflow the record and wrap the content instead.

## Layout

This is a theme-only change. The established desktop rail (282px), fluid gutters, card insets, control sizes and all responsive breakpoints are retained. Font metrics can cause natural text wrapping, not hidden fields or route changes.

- At (1250px), overview/news move to one column and metrics to two columns.
- At (1100px), standard tables reflow into labeled records with semantic headings retained.
- At (1000px), navigation becomes the existing dismissible drawer.
- At (760px), forms/actions/phases adopt single-column layouts where needed.
- At (400px), gutters reduce without reducing the readable text scale.
- Wide reports remain stacked rather than hiding columns or requiring horizontal scrolling.

The existing three-stage research selector and cross-cutting monitoring content remain unchanged inside project screens. The sign-in page does not reintroduce the removed decorative phase strip or RDMS wordmark. Its heading and description are centered in the photo panel. The sidebar retains RDMS without a trailing period, with the supplied `RDU LOGO.png` replacing the folder symbol; contain-fit the full logo at 80×40px without recoloring or cropping.

Print retains light-paper tokens: dark ink, white paper and legible correction badges; application chrome stays hidden.

## Interface copy

Static page, navigation, card, modal, tab and action captions use Title Case with lowercase minor words (and, to, for, of, the). Form/table labels, placeholders, helper text, tooltips, prompts, empty states and status badges use sentence case. Empty-state fragments omit periods; complete helper/alert sentences are punctuated. Busy labels describe activity in sentence case. Acronyms such as ID, PDF, CSV, API and RDU keep their spelling.

Use project for a research record, account for access/approval settings, message for an in-app notification, review for document decisions and stage for workflow navigation. Official research types and checklist item/group wording are preserved; phase headings receive explicit display-only case aliases. No automatic capitalization of record content, names, emails, filenames, announcement/notification content or feedback. Report aliases belong only to typed status/stage cells. See `docs/UI-COPY.md` for the file manifest and examples.

## Motion

Use shared tokens from `src/theme.css` and utilities from `src/motion.css`, not local timing constants: 150ms feedback, 200ms standard reveals, 220ms view changes, 250ms dialog/scrim entrances; ease-out for arrivals/hover and ease-in-out for views. Transition only background-color, color, border-color, opacity and transform. `.motion-feedback` opts a surface into feedback; `.motion-micro` adds an optional 1px hover lift on fine pointers; `.motion-fade` provides the standard shallow opacity reveal. Static cards do not lift.

`ViewMotion` provides page/project/tab/phase continuity without remounting form content. Reveals begin at 0.96 opacity, keeping text readable and avoiding blank white flashes. Dialog content, inline reviews, replies and toasts use the same gentle reveal; dark scrims ease from 65% to 82% midnight. Native selects keep platform popup behavior. Mobile navigation fades in place, never sweeps across the screen. Closing remains immediate so focus/inertness and input semantics do not wait on animation.

The loading/error surface uses midnight with legible inverse text and a static gold marker, not a spinner. Keep the established white-dominant working surfaces. No animated dimensions, layout shifts, zoom, bounce, flashing, perpetual loops, staged lists, scroll choreography or permanent will-change. Reduced-motion disables CSS motion and scrolling effects and skips/cancels view animations, including live preference changes; print is motion-free.

See `docs/MOTION.md` for the complete changed-file manifest and checks.

## Elevation & Depth

Routine panels remain flat, separated by surface tone, restrained indigo rules and spacing. Dialogs/toasts retain their existing offset shadow geometry using the midnight shadow token. No new blur, glass, decorative bevel or generated imagery is introduced.

**The Flat Workspace Rule.** Reserve elevation for temporary surfaces, not ordinary research records.

## Shapes

The established control, field, panel, review and dialog radii remain unchanged. Phase markers and avatars remain circular. Status badges are rectangular written labels. The selected-tab underline remains a functional state marker rather than decorative framing.

## Components

### Buttons

Primary actions have gold fill and midnight text; hover uses cream gold. Secondary and caution actions use white fill, dark text and a visible indigo border. Focus is indigo on light surfaces and cream gold in dark brand regions. Disabled controls retain readable muted text without pretending to be active. The existing (48px) standard target and (44px) minimum remain.

### Inputs / Fields

Native fields, file selectors, dropdowns and textareas use white surfaces, dark values, dark muted placeholders and visible indigo field borders. Native color scheme is light; focus and caret are indigo. Required/optional indicators, helper instructions and all validation/review behavior are unchanged.

### Status badges

Pending/ongoing/approved states use indigo wording on soft white-violet; neutral history states use dark muted ink. Needs Revision, Rejected and Suspended use white on crimson. Written labels remain the distinguishing semantic cue; changing the display palette never changes an API enum or review decision.

### Cards / Tables / Reports

Primary containers are white, with soft white-violet secondary sections. Table headings and section headings use indigo; record values use midnight ink and secondary detail dark muted violet. Labeled mobile records and all report columns remain available. Print has explicit light-paper tokens.

### Navigation and tabs

The shell is midnight indigo; selected destinations are slate violet with gold text/icons. Other navigation items use white/lavender, preserving the plain-language labels and existing role filtering. Selected tabs use indigo foreground, gold underline and soft white-violet fill. Menu focus, Escape behavior and background inertness remain unchanged.

### Lifecycle and evidence

Phase controls and progress retain gold highlights; document rows and numerical statistics use readable indigo on white while preserving official terminology, metadata and status text. The prior/current/upcoming/completed behavior and server-controlled advancement remain untouched.

### Researcher profiles

Keep the searchable faculty directory table, but make View profile a full page inside the workspace. The approved profile composition has a solid royal-indigo cover, initials avatar overlapping its lower edge, identity/email action and inline research totals. A soft-white-violet About panel sits beside a list of white research cards on wide screens; they stack on smaller screens. Do not reuse a popup or table for the individual profile.

Only current authorized records appear: department/email/role/status plus project title/type/year/program/abstract/stage/status. Research cards open the existing project view and allow return to the profile; Back to faculty retains directory search. Show empty/missing states honestly, include authorized archived work, and label totals as visible to the account. No invented portrait, biography, phone, publications, citations or social metrics. Profile identity participates in the shared calm view reveal without remounting content.

### Confirmation and feedback

Review summaries and dialogs use white surfaces; the final confirmation is a gold action, and editing remains a clearly labeled secondary action. Alerts use legible dark text with a restrained crimson status boundary. Success feedback uses indigo/white with gold emphasis. No new mutation, retry or dismissal behavior is introduced.

## Do's and Don'ts

### Do:

- **Do** use the exact requested palette through centralized theme properties.
- **Do** pair gold controls with midnight text and crimson badges with white text.
- **Do** keep the existing readable sizing, generous targets and responsive record layout.
- **Do** load the bundled Montserrat and Plus Jakarta Sans faces rather than depending on external font requests.
- **Do** retain the supplied sign-in photo under the royal-indigo overlay.
- **Do** keep white dominant and preserve light-paper print contrast.

### Don't:

- **Don't** introduce new backend, route, permission or form behavior as part of a visual theme change.
- **Don't** use crimson as a general surface or lavender text on a crimson badge.
- **Don't** shrink filenames, feedback, table values or controls to fit new font metrics.
- **Don't** replace official checklist/type wording or saved state values.
- **Don't** claim user-specified colors or supplied imagery are officially approved institutional brand assets.
- **Don't** reintroduce the removed sign-in stage strip or earlier promotional headline.
