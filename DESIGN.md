---
name: RDMS Research wayfinding
description: Provisional navy-and-teal research operations workspace, documented from the built local prototype.
colors:
  primary: "#176b77"
  primary-hover: "#115b66"
  nav: "#142b46"
  nav-text: "#c4d3e3"
  nav-hover: "#203b55"
  nav-active: "#2a465f"
  nav-active-icon: "#91d1d4"
  ground: "#f4f7fa"
  surface: "#ffffff"
  ink: "#233348"
  muted: "#637489"
  secondary-text: "#536b82"
  border: "#dfe6ed"
  divider: "#edf1f5"
  secondary-button-text: "#3b5067"
  secondary-button-border: "#d8e2e9"
  secondary-button-hover: "#edf3f6"
  secondary-button-hover-border: "#c6d4df"
  field-text: "#34475f"
  field-border: "#d7e0e8"
  field-hover-border: "#9fb6c5"
  placeholder: "#62758a"
  focus: "#2c939d"
  search-focus: "#58a0a7"
  pending: "#85601c"
  pending-bg: "#fff3d9"
  approved: "#286c51"
  approved-bg: "#e7f3ed"
  correction: "#a94749"
  correction-bg: "#fbeceb"
  missing: "#61748b"
  missing-bg: "#edf1f6"
  archived: "#647487"
  archived-bg: "#edf0f4"
  badge-text: "#5d7188"
  badge-bg: "#eef2f6"
  lifecycle-active: "#edf5f6"
  lifecycle-marker: "#206c79"
  lifecycle-hover: "#f1f6f8"
  chart: "#3d8492"
  progress: "#4b9199"
  progress-track: "#e4ebf1"
  reached-label: "#286b76"
  type-agenda: "#4a9099"
  type-curricular: "#8a8fb9"
  type-external: "#ba9b54"
  type-personal: "#a97ba9"
  type-etl: "#8aab79"
typography:
  headline:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "29px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.8px"
  title:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "17px"
    fontWeight: 650
    letterSpacing: "-0.2px"
  panel-title:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "15px"
    fontWeight: 650
    letterSpacing: "-0.2px"
  body:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "14px"
    fontWeight: 400
  body-prose:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "12px"
    lineHeight: 1.65
  label:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "12px"
    fontWeight: 550
  table:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "11px"
  badge:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "9px"
    fontWeight: 550
    lineHeight: 1.3
  metric:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "32px"
    fontWeight: 650
    lineHeight: 1
  nav-group:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "9px"
    fontWeight: 650
    letterSpacing: "1.3px"
rounded:
  badge: "4px"
  field: "5px"
  control: "6px"
  callout: "8px"
  lifecycle: "9px"
  panel: "10px"
  dialog: "12px"
spacing:
  control-gap: "8px"
  action-gap: "10px"
  row-gap: "12px"
  mobile-gutter: "18px"
  compact-panel: "19px"
  grid-gap: "22px"
  panel-padding: "23px"
  compact-gutter: "24px"
  dialog-padding: "25px"
  content-gutter: "34px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary-button-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-button-hover}"
  button-text:
    textColor: "{colors.primary}"
    padding: "4px 0px"
  button-icon:
    rounded: "{rounded.field}"
    padding: "7px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.field-text}"
    rounded: "{rounded.field}"
    padding: "10px 11px"
  navigation-item:
    textColor: "{colors.nav-text}"
    rounded: "{rounded.control}"
    padding: "11px 13px"
  navigation-item-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.surface}"
  status-badge:
    backgroundColor: "{colors.badge-bg}"
    textColor: "{colors.badge-text}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "5px 7px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  lifecycle:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lifecycle}"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.dialog}"
    width: "640px"
---

# Design System: RDMS Research wayfinding

## Overview

**Creative North Star: "Research wayfinding"**

Make the next research action evident without hiding the documentary evidence. The built interface is a calm, dense operations workspace: a navy navigation shell anchors white working surfaces on a cool near-white ground; teal identifies actions and progress. Familiar buttons, selects, tables, tabs, and dialogs support web operate mode rather than a novel interaction model.

This is the user-approved provisional world, not official BukSU/RDU branding. No official university color values, logo, or fonts were supplied. The RDMS wordmark and folder line icon are prototype identity. There are no shipped raster design assets; the screenshots are evidence only, not interface imagery.

**Key Characteristics:**

- Persistent wayfinding with a compact identity bar and grouped navigation.
- Aligned, information-dense records with restrained teal actions.
- Ordered lifecycle evidence with explicit review and locked-phase states.
- Flat bordered surfaces, small rounded controls, and system typography.

Evidence: `PRODUCT.md`, `architecture.md`, the approved `.thinkrail/context/mockups/rdms-direction.html` proposal, `src/styles.css`, and `src/main.jsx`; rendered checks against `.thinkrail/context/screenshots/desktop.png` (1440px wide overview), `mobile.png` (390px wide researcher overview), and `checklist.png` (1440px wide project checklist). Values below describe the final stylesheet cascade, including its secondary-text overrides. Frontmatter records reused built values, not a new CSS token API; only nav, teal, border, muted, and ground are current CSS custom properties. The sidecar's synthesized tonal ramps are preview metadata, not implemented palette steps.

## Colors

A deep navy frame and muted teal action color sit against cool white surfaces. Status colors communicate documentary state, not decoration.

### Primary

- **Research Teal** (`primary`): primary buttons, text actions, links, and selected-tab underline; its deeper hover variant supplies immediate feedback.
- **Wayfinding Navy** (`nav`): fixed navigation and login story; pale blue labels, white active text, and a lighter navy selected row keep orientation visible.
- **Measured Teal** (`chart`, `progress`, `reached-label`): department bars and lifecycle progress, distinct from the action color.

### Secondary

- **Pending Amber** (`pending`, `pending-bg`): ongoing, pending, submitted, and pending-review badges.
- **Approval Green** (`approved`, `approved-bg`): completed, approved, active, and published badges.
- **Correction Red** (`correction`, `correction-bg`): revision, rejected, and suspended badges; feedback uses related red-brown text.
- **Research-type markers**: muted teal, lavender, ochre, mauve, and sage distinguish the five types in order. These are categorical accents, not alternative action colors; related pale icon tiles appear in project lists.

### Neutral

- **Cool Ground**, **White Surface**, **Document Ink** (`ground`, `surface`, `ink`): page, cards, and principal text.
- **Muted Slate** (`muted`): heading descriptions and identity metadata.
- **Evidence Slate** (`secondary-text`): the final darkened override for table sublines, focus-project metadata, metric captions, panel descriptions, chart notes, data captions, footer, requirement metadata, group counts, lifecycle captions, mini timelines, notification times, field hints, document metadata/toolbars, activity text/times, and other secondary copy. Do not restore the earlier lighter declarations in those selectors. Reached mini-timeline labels and placeholders also have final darker overrides (`reached-label`, `placeholder`).
- **Cool Rule** (`border`, `divider`): outer card boundaries and quieter row separators. Missing/draft and archived/superseded/deactivated states retain separate slate badge pairs.

**The Evidence State Rule.** Keep status wording visible alongside color; an uploaded document is not an approved document.

## Typography

**Display and Body Font:** Segoe UI with platform/system and Arial fallbacks, as captured in frontmatter. No webfont, official institutional font, or distinct mono face is installed.

The hierarchy is workhorse sans-serif, compact and consistent rather than editorial. Semibold headings and tabular metric/progress numbers do the organizing; there is no mathematical modular type scale.

### Hierarchy

- **Headline:** page titles use `headline`; they reduce to (25px) at widths up to (1250px). Login story is a larger, separate expression (39px, weight 550, line-height 1.4), reducing through (32px) to (27px).
- **Title / panel title:** general section headings use `title`; dashboard section headings use `panel-title`. Checklist phase headings remain (17px) until mobile (14px).
- **Body:** root size is `body`; actual working copy is often (11–12px), with paragraph line-height (1.65). Research-summary prose is capped at (75ch); advancement explanation at (72ch).
- **Label / table / badge:** preserve the compact roles in frontmatter. Small metadata frequently uses (9–10px); do not describe this built prototype as a 16px-body system.
- **Metric:** large tabular numerals use `metric`, then (28px) at widths up to (1000px) and (30px) up to (760px).
- **Navigation group:** uppercase labels use `nav-group`; normal navigation and action labels remain sentence case. Checklist source headings retain their supplied capitalization.

## Layout

Desktop has a fixed left rail (246px) and a matching main-content offset; the white topbar is (82px) high and is not sticky. Content has a maximum width of (1720px), centered within the main shell, with the frontmatter content gutter. The overview has four metrics in one bordered strip and a two-column content grid (1.44fr / 1fr); repeated panel padding and narrow row rules preserve density without enclosing every datum in a card. This is not a strict 8px spacing system.

Responsive behavior follows the actual media queries:

- **At least 1600px:** content padding grows to (42px 48px 0); topbar horizontal padding is (48px), overview columns become (1.5fr / 1fr).
- **Up to 1250px:** rail and main offset narrow to (220px), content becomes (28px 24px 0), panels use compact padding, grid gap becomes (17px), demo topbar badge disappears.
- **Up to 1000px:** overview and news become one column; department chart uses two columns; heading actions stack vertically. Lifecycle buttons stack marker/copy internally, and requirement rows wrap their actions onto a new line.
- **Up to 760px:** rail moves off-canvas, main offset disappears, topbar becomes (69px), content padding becomes (25px 18px 0), and metrics become a two-by-two grid. Filters wrap; search spans a full row. Identity name/role and the leading breadcrumb are hidden, while avatar, notifications, identity switch, and menu remain. Lifecycle stays a three-column path with smaller markers and labels; it does not become a vertical wizard. Forms become one column; advancement panels and footers stack. Tables keep horizontal overflow; tabs scroll horizontally.

The small-screen closed rail is both `inert` and `aria-hidden`, with CSS visibility hidden, not merely translated out of view. Opening focuses its first button; Escape, choosing a destination, or clicking the scrim closes it and returns focus to the menu button. The open navigation is not implemented as a modal focus trap, nor does it make the main content inert; do not document those as existing behavior.

Print hides application chrome, controls, filters, tabs, and overlays, shows the report print header, removes panel borders, and reduces table padding/type. CSV and browser print/Save PDF are familiar report outputs, not a custom export canvas.

## Elevation & Depth

Ordinary cards, metric strips, and tables are flat: white fill, fine border, cool ground. Only transient surfaces are lifted. Dialogs use a dark navy translucent scrim and shadow (`0 18px 70px #0a1b3033`); toasts use (`0 8px 30px #142b4622`). Navigation overlays use a separate translucent scrim. Focus is an outline, not a shadow.

**The Flat Workspace Rule.** Reserve shadows for dialogs and toasts; separate working surfaces with tone and borders.

## Shapes

Gently curved rectangles dominate: badges are smallest, fields and icon controls slightly rounder, buttons/navigation rows modestly curved, panels broader, and dialogs broadest (see `rounded`). Lifecycle and toast containers share the intermediate lifecycle radius. Avatars, phase numbers, and state dots are circles via percentage radii; they are not pill-shaped controls. Fine (1px) borders and horizontal separators retain a documentary register. Tables clip inside the panel while their inner wrapper scrolls.

## Components

### Buttons

Confident but compact, using familiar browser semantics. Primary and secondary share the frontmatter geometry, an (8px) icon gap, (38px) minimum height, and label weight. Secondary has a cool border and dark slate text; hover changes both fill and border. Small variants use (7px 10px) padding, (11px) type, and (31px) minimum height. Text actions use teal, (11px) type, and an underline on hover. Icon buttons use (7px) padding with a pale hover fill. There is no custom pressed-state transform.

All buttons, links, and fields receive a visible (3px) focus outline with (3px) offset. Disabled buttons use opacity (0.48) and a not-allowed cursor; primary/secondary hover excludes disabled controls. Mobile heading buttons shrink to (34px) minimum height; do not claim universal 44px targets.

### Inputs / Fields

White, cool-stroked fields with compact radius, teal caret, a darker hover border, associated visible labels, and optional described hints. Native selects, number/date/file inputs, and vertically resizable textareas remain native controls. Form fields use (12px) type and full width. Search is a bordered icon/input group, with a (2px) focus-within outline and no duplicate inner outline. Validation combines native required/type constraints with a separate alert banner; a reusable red input-border variant is not implemented.

### Status badges

Quiet rectangular tags with explicit text, not interactive filter chips. Semantic status variants use the paired foreground/background tokens; neutral badges handle counts, missing items, and less specific states. No badge hover or selection behavior is implemented.

### Cards / Containers and tables

White bordered panels use frontmatter panel geometry; compact viewports reduce padding. Checklist containers use no vertical panel padding, with inset group headings and requirement rows. Table panels remove panel padding, align compact text in semantic tables, use a very pale header, row separators, and a subtle hover fill. Project names are buttons rather than making the entire table row interactive.

### Navigation and tabs

Navy grouped button navigation has muted line icons, a lighter active row, white active copy, and teal-tinted active icons. Hover gently lightens the row with a (0.15s) background transition. Navigation visibility is role-dependent. Tabs are button rows with a fine baseline and a teal (2px) selected underline, plus optional small counts; these are not ARIA tablist widgets in the current code.

### Lifecycle and documentary checklist

The signature pattern is a selectable three-phase path: circular numbered markers, completed checks, current/upcoming/completed captions, and a tinted active phase. Selecting a phase reveals its exact checklist, not a route illustration. Upcoming evidence is locked and completed evidence is read-only. Rows combine document/check icon, requirement label, version/file metadata, status badge, and permission-dependent view/upload/resubmit/review actions. The phase-advancement callout explains readiness or lock; upload completion alone never unlocks it. Monitoring and evaluation sit below as cross-cutting evidence, not a fourth phase button. Personally funded projects visibly disclose their provisional shared checklist.

### Dialogs and feedback

Dialogs are centered, scroll internally up to (92vh), use sticky white headers and (25px) body padding, and widen to (900px) for PDF review. Mobile uses (13px) backdrop padding, (94vh) maximum height, and (18px) internal padding. They expose dialog semantics, autofocus Close, support Escape/backdrop dismissal, and implement endpoint Tab wrapping; do not infer full background inertness or focus restoration. Errors are red-tinted `role="alert"` banners; success toasts are dark teal `role="status"` notices that expire after (4500ms).

Motion is restrained: mobile rail slides over (0.2s ease), chart widths transition over (0.45s cubic-bezier(0.16, 1, 0.3, 1)), toast entry rises (12px) over (0.22s) with the same curve, and the loading ring spins over (1s linear). Reduced-motion media rules disable animations and transitions and restore automatic scroll behavior.

## Do's and Don'ts

### Do:

- **Do** preserve navy wayfinding, white work surfaces, and restrained teal actions.
- **Do** use the final darker secondary-text and placeholder overrides when reproducing the interface.
- **Do** keep status wording, version metadata, and locked/ready phase explanations visible.
- **Do** retain native controls, visible keyboard focus, reduced-motion support, and inert closed mobile navigation.
- **Do** label demo identities, synthetic evidence, provisional branding, and unavailable integrations honestly.

### Don't:

- **Don't** present this palette, system font stack, or folder wordmark as official BukSU/RDU identity.
- **Don't** add decorative raster imagery or reuse evidence screenshots as shipped UI assets.
- **Don't** replace familiar operate-mode controls with custom experimental interaction patterns.
- **Don't** equate upload completion with approval, or monitoring with authority to review.
- **Don't** add shadows to routine cards or invent unimplemented mobile/dialog accessibility behavior.
