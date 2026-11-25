---
name: RDMS Accessible Research wayfinding
description: Beginner-friendly navy-and-teal research workspace with readable text, spacious controls and guided decisions.
colors:
  primary: "#176b77"
  primary-hover: "#115b66"
  nav: "#142b46"
  nav-text: "#d8e6f1"
  nav-active: "#2a465f"
  ground: "#f4f7fa"
  surface: "#ffffff"
  ink: "#233348"
  muted: "#536b82"
  border: "#cbd6df"
  divider: "#e1e8ee"
  field-border: "#8296a7"
  focus: "#09677c"
  danger: "#9b3038"
  secondary-button-text: "#235969"
  pending: "#795213"
  pending-bg: "#fff3d9"
  approved: "#235f46"
  approved-bg: "#e7f3ed"
  correction: "#963139"
  correction-bg: "#fbeceb"
  missing: "#465d73"
  missing-bg: "#edf1f6"
  review-bg: "#f5f9fa"
  review-border: "#b8cdd8"
  review-text: "#35576b"
  chart: "#347e88"
typography:
  headline:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "clamp(1.75rem, 2.4vw, 2.125rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.4
  section:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.5
  body:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.6
  supporting:
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif'
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
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary-button-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
  status-pending:
    backgroundColor: "{colors.pending-bg}"
    textColor: "{colors.pending}"
    typography: "{typography.supporting}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  review-summary:
    backgroundColor: "{colors.review-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.review}"
    padding: "{spacing.panel}"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.dialog}"
    width: "720px"
---

# Design System: RDMS Accessible Research wayfinding

## Overview

**Creative North Star: "Research wayfinding"**

Make the next research action understandable without requiring technical knowledge. This user-approved accessibility evolution retains the navy navigation, cool light workspace and teal actions, while replacing the predecessor's tiny type and compact controls with readable text, clear instructions and comfortable spacing.

The visual language serves people operating a research-management system in everyday office and mobile settings. Familiar controls and task-based labels take priority over novelty. The official research checklist and category names remain intact; short explanations make them easier to use.

This is provisional prototype styling, not official BukSU/RDU branding. No official university logo, font or color guide was supplied. There are no shipped raster design assets. Evidence is the current `src/styles.css`, `src/main.jsx`, `src/ui.jsx`, approved `accessible-after.html` preview and the accessible-prefixed desktop/mobile screenshots in the local context directory.

**Key Characteristics:**

- Plain-language navigation and named actions, with every original role-visible feature retained.
- Readable working text, quieter supporting information and visible status wording.
- Responsive labeled records instead of sideways-scrolling tables or hidden columns.
- Guided review, editing and explicit confirmation before sensitive decisions.

## Colors

Navy establishes stable wayfinding; teal identifies action and selection; white and cool near-white surfaces keep long research records readable.

### Primary

- **Research Teal** (`primary`, `primary-hover`): buttons, links, selected controls and task actions.
- **Wayfinding Navy** (`nav`, `nav-text`, `nav-active`): persistent menu and login story, with lighter selected rows and high-contrast text.
- **Measured Teal** (`chart`): data bars and progress, subordinate to written labels and counts.

### Secondary

- **Pending Amber** (`pending`, `pending-bg`): in-progress and waiting-for-review information.
- **Approval Green** (`approved`, `approved-bg`): completed, approved, active and published states.
- **Correction Red** (`correction`, `correction-bg`, `danger`): changes needed, rejected/suspended states and leave-without-saving actions.

### Neutral

- **Document Ink** (`ink`) is primary copy; **Evidence Slate** (`muted`) is the supporting text color. Supporting information is not made faint to create hierarchy.
- **Cool Ground** and **White Surface** (`ground`, `surface`) separate the working area from panels.
- **Cool Rule** (`border`, `divider`, `field-border`) separates sections and makes controls identifiable.
- **Review Paper** (`review-bg`, `review-border`, `review-text`) distinguishes a confirmation summary without implying that data has already been saved.

**The Evidence State Rule.** Keep status wording visible alongside color; an uploaded document is not an approved document.

## Typography

**Display and Body Font:** Segoe UI with platform/system and Arial fallbacks. No external webfont or institutional font is installed.

### Hierarchy

- **Headline:** the fluid `headline` role provides page orientation without overwhelming task content.
- **Title:** `title` identifies sections and review summaries.
- **Section:** `section` provides fieldset legends and smaller task groups.
- **Body and label:** `body` and `label` are the normal readable working scale. Inputs and file controls stay at this scale rather than shrinking on mobile.
- **Supporting:** `supporting` is the minimum for metadata, hints, dates, status badges and filter explanations. Important requirements, table values and buttons remain at the body scale.

**The Readable Evidence Rule.** Never shrink information to fit the screen. Reflow the record and wrap the content instead.

Paragraphs and explanations use generous line height and bounded reading measures. Official checklist headings retain their source wording/capitalization; ordinary menu and action labels use sentence case. Numeric data uses aligned tabular presentation where appropriate.

## Layout

The desktop shell has a persistent navy rail (282px), a main-area offset matching that rail, and fluid content gutters. The header wraps when its account, messages and location controls need more room; labels are not replaced with unexplained icons. Most panels use the shared panel inset and section gaps.

- At widths up to (1250px), overview/news move to one column and metrics become two columns.
- At widths up to (1100px), standard tables reflow into labeled records. Semantic headings remain available to assistive technology; each value has an explicit mobile label.
- At widths up to (1000px), the sidebar becomes a dismissible drawer and the content offset disappears.
- At widths up to (760px), forms, actions, phase controls and other groups adopt a single-column layout where needed. Small-screen confirmation actions remain reachable through internal dialog scrolling.
- At widths up to (400px), gutters/insets reduce without shrinking the readable type scale.
- Reports with more than seven columns stack their records at every width rather than hiding columns or requiring sideways scrolling.

The vertical research phase path on small screens is the same three-stage selector as desktop, not a separate workflow. Monitoring and evaluation remains cross-cutting below the evidence.

Print hides interactive chrome and includes the report identity and filters. Standard records return to a printable table, while wide stacked reports retain labeled content. Print-specific point sizes are distinct from the screen readability floor.

## Elevation & Depth

Routine cards, tables and filters are flat: a white surface and fine rules provide separation. Shadows are reserved for dialogs and temporary feedback. Dialogs use a dark translucent navy scrim and (`0 18px 70px #0a1b3055`) shadow; toast feedback uses a smaller offset shadow. No decorative gradients, blur, bevels or raster illustrations are introduced.

**The Flat Workspace Rule.** Use tone, spacing and hierarchy for normal records; reserve elevation for temporary surfaces.

## Shapes

Controls use modest rounded rectangles, panels slightly broader corners, and dialogs the broadest corners. Badges are small rectangular status labels, never a substitute for a clear action. Phase markers and avatars are circular. Fine separators structure evidence; selection is conveyed through text, outline/underline and fill rather than decorative stripes.

## Components

### Buttons

Named, comfortable and predictable. Primary and secondary buttons use body-scale text and standard (48px) targets; interactive controls never intentionally fall below (44px) in either dimension. Labels wrap rather than disappear. Secondary buttons are white with a visible border; teal text actions retain generous targets. Hover and disabled states remain legible. Focus uses a (3px) outline with offset, with a pale focus color on dark surfaces.

### Inputs / Fields

Top-aligned associated labels display Required/Optional. Hints explain the expected input in everyday language. Native PDF/file/date/select controls remain familiar and body-sized. Project forms group name, category/department and study description into fieldsets. Native required/type validation is supplemented with readable alerts; review feedback becomes required when asking for changes or rejecting a document.

### Status badges

Written display labels explain stored statuses without changing their API values. Examples include In progress, Waiting for review, Changes needed, Not submitted and Not needed. Counter badges retain normal numeric/text children rather than converting them to comma-separated strings.

### Cards / Containers and responsive records

Panels provide consistent hierarchy and spacing, not nested decorative cards. Desktop tables have semantic column headings and wrapping values. Mobile records show every original cell with its heading above the value and a clearly labeled action. Long titles, filenames, department names and feedback are not truncated.

### Navigation and tabs

The single menu groups related destinations under Research, Reports and updates, and Administration. The active destination has a lighter navy background and `aria-current`. Home, Things to do and Messages use plain language. Tabs are wrapping buttons with pressed-state semantics, a selected fill and functional underline; they do not require sideways navigation.

The closed mobile drawer is inert and hidden. Opening moves focus inside; Tab stays within it; Escape closes it and restores the menu trigger after the main area is no longer inert. Page navigation focuses the new heading instead of leaving focus on an offscreen menu item.

### Lifecycle and documentary checklist

The exact source checklist remains the authority. Each stage pairs its official name with a short explanation. Evidence rows keep requirement wording, feedback, file/version metadata, status and permission-dependent actions. Locked readiness guidance explains what must happen next. Completed research is described as complete rather than ready to advance again.

### Review-before-save and dialogs

Sensitive forms follow Enter details → Check before saving → Confirm. The first step validates and summarizes without sending a mutation. The summary uses human-readable option labels and filename/size; editing preserves values and selected files. Final confirmation invokes the existing command with unchanged backend values. Failure keeps the same upload attempt key.

Closing a changed form requires a keep-editing/leave-without-saving decision. Busy saves cannot be dismissed. Dialogs make background controls inert, trap focus, support Escape appropriately and restore focus on exit. The modal header is not sticky; the complete dialog scrolls internally. Errors use an alert, success uses a status notice, and a failed refresh after successful saving has its own recovery action.

Motion is restrained: toast entry and bounded control/chart feedback support orientation, never hide content. Reduced-motion disables transitions/animation. Forced-colors support retains selection and focus affordances.

## Do's and Don'ts

### Do:

- **Do** retain the navy/teal identity while prioritizing readability over compact density.
- **Do** use body-scale text for working information and at least the supporting scale for secondary details.
- **Do** reflow every data field into labeled mobile records rather than hiding or truncating it.
- **Do** keep exact research categories/checklist wording and supplement them with short explanations.
- **Do** show an editable review summary before sensitive saving, with no early mutation.
- **Do** preserve visible keyboard focus, inert background behavior and explicit text labels.

### Don't:

- **Don't** imply that provisional styling is official university branding or demo signatures are certified signatures.
- **Don't** shrink fields, filenames, feedback or status text to fit narrower screens.
- **Don't** replace saved/API status values or role rules just to simplify their display labels.
- **Don't** equate document upload with approval or monitoring with review authority.
- **Don't** present a failed refresh as an unsaved action after the command already succeeded.
- **Don't** add decorative shadows or imagery to ordinary working records.
