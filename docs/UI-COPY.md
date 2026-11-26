# Interface copy standard

## Scope

This audit updates human-readable display text only. Existing visual layout, motion, profile navigation, form submission/review behavior, data fetching, authorization and backend logic remain intact. There are no database migrations, renamed files/classes, changed endpoint paths, JSON/API keys, field names or stored enum values.

## Casing

- Static page, navigation, card, modal, tab and action captions: Title Case, with minor words such as and, to, for, of and the lowercase unless first.
- Form/table labels, placeholders, helper text, tooltips, prompts, empty states and status badges: sentence case. Empty-state fragments have no trailing period; full sentences in guidance/alerts have punctuation.
- Busy labels: sentence case, such as “Opening your workspace…” and “Uploading…”.
- Acronyms/proper names: ID, PDF, CSV, URL, API, RDU, BukSU, official role/program names and supplied research types retain their correct spelling. The ETL acronym in the supplied research category is not changed to another code.
- User-entered or persisted record content: preserve names, emails, usernames, research titles/abstracts, announcement titles/bodies, filenames, signatures, review feedback, notification content and audit records. Do not apply global title-case or uppercase transformations.
- Official checklist item/group wording is verbatim. Known phase headings have explicit case-only display aliases, for example `I. CONCEPTUALIZATION PHASE` → `I. Conceptualization Phase`; the source catalog and API value are unchanged. Monitoring uses the same display convention.
- Image artwork, including lettering within the supplied RDU logo, is unchanged.

## Terminology

- **Project** or **research project** for a research record. Avoid alternating with study in generic interface instructions; user-authored study descriptions remain untouched.
- **Account** for access, approval and role management. The module is Manage Accounts; no user IDs, endpoints or payload keys are renamed.
- **Message** for in-app notifications. Persisted notification types and record content are unchanged.
- **Review** for document decisions. Display statuses remain In progress, Waiting for review, Changes needed, Not submitted, Not accepted, Earlier version and Not needed. Tabs use explicit Title Case versions rather than transforming stored enums.
- **Stage** for workflow navigation and general captions. Official checklist names still use their supplied Phase wording. No phase index, requirement ID or gate changes.
- **Edit** for returning to editable details; **Save** for committing changes. Confirm actions still state what they commit. No Delete/Remove operation is introduced.
- **Not assigned** means no department assignment; **Not recorded** means a missing saved detail. These are intentionally distinct.

## Representative changes

- Research projects → Research Projects; Faculty members → Faculty Members.
- Add a research project → Add Research Project.
- Review before saving → Review Before Saving.
- Go back and edit → Back to Editing.
- Confirm and submit document → Confirm and Submit Document.
- Download spreadsheet (CSV) → Download CSV.
- Confirm authorized transition → Confirm Stage Approval.
- Common validation errors identify the problem and a recovery action through frontend-only `friendlyError` mappings.
- The branding setup notice now acknowledges the supplied logo/theme while accurately stating that institutional approval remains unverified.

Report and CSV captions are harmonized at their shared source: Stage, Current stage, Stage readiness, In progress, Waiting for review, Not needed and Example data. These are caption values, not object keys, report selection identifiers or data derivation changes. All 13 canonical report names remain unchanged. Saved historical records and exports' canonical enum values are not rewritten.

The report preview applies aliases only to typed Status/Stage cells. An ordinary title or name equal to `Missing`, `Pending` or another enum-like word must remain exactly as recorded. No global table-value formatter may reinterpret arbitrary user data as a status.

## Files updated for this audit

Application/display source:
- `src/main.jsx`: static headings/actions/labels/messages, typed display aliases and report-cell text.
- `src/ui.jsx`: navigation captions, separate tab/status/phase display mappings, safe-form/dialog copy and recoverable frontend error wording.
- `src/styles.css`: removes forced uppercase/capitalization; no classes or layout rules renamed.
- `shared/reporting.js`: human-readable captions/readiness prose only; report identifiers and executable derivation remain unchanged.

Design/spec/documentation:
- `src/SPEC.md`: authoritative casing, terminology, source/data preservation and typed-display rules.
- `DESIGN.md`: copy standard and corrected heading typography guidance.
- `.impeccable/design.json`: display text in component previews; identifiers and CSS classes unchanged.
- `docs/UI-ACCESSIBILITY.md`: current navigation captions and copy/test references.
- `docs/THEME-UPDATE.md`: removes outdated uppercase/sentence-case heading claims.
- `docs/UI-COPY.md`: this new standard, manifest and audit record.

Tests:
- `tests/ui/workspace.spec.js`, `tests/ui/motion.spec.js`, `tests/ui/profiles.spec.js`: exact expected display labels updated. Selectors remain exact; no case-insensitive relaxation or test removal. Form selectors are scoped to their dialog where normalized labels also exist in the background. The phase-heading assertion now checks explicit display aliases; every official group/item assertion remains exact.
- `tests/ui/copy.spec.js`: new exact-casing and preservation tests, including mixed-case names/emails, uppercase authored content, enum-like titles, canonical report names and CSV caption consistency.

Ignored `.thinkrail/context/copy/` inventory, snapshots, AST checks and logs are local verification evidence, not application files.

## Verification

- `npm run build` → passes.
- `npm test` → 12 backend/report tests pass.
- Playwright Chromium → 40 tests pass, none skipped (37 existing regressions plus three copy tests).
- Existing axe/reflow tests → pass across tested roles and 320–1440px widths.
- Copy contract/AST comparison → passes.
- `git diff --check` → passes.

## Safety checks

The audit's baseline comparison verifies byte-for-byte preservation of `server/index.js`, `server/store.js`, `shared/catalog.js` and motion files. It verifies unchanged request/navigation/state-call arguments and protected JSX name/value/id/class/href/type/required/disabled attributes. The shared report AST differs only in string values, not executable structure. Existing backend and browser regressions remain in place; the new copy tests add coverage rather than weakening those checks.

Persisted notifications, user-authored content, historical audit text and canonical exports can contain their original casing. They are records, not static interface captions; this audit does not migrate or silently rewrite them.
