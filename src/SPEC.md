---
id: rdms-interface
type: module-design
title: Accessible RDMS interface contracts
status: draft
parent: rdms-architecture
---
# Accessible RDMS interface

## Responsibility and boundary
The React frontend presents authorized data and prepares the existing API commands. It does not confer authority, change stored document/project statuses, rename official checklist requirements or bypass the server's phase gates. User-approved scope is a full beginner-friendly interface within the existing React/CSS stack, not backend production migration.

`main.jsx` keeps feature composition, role-dependent controls and existing payloads. `ui.jsx` owns shared display labels, responsive table semantics, safe-form summaries and dialog focus/dirty-close behavior. `styles.css` owns consistent readable layout/targets across pages. Keep reusable interaction logic out of per-feature copies.

## Information and labels
Navigation may use everyday display labels while stable internal page keys and API enum values stay unchanged. Display statuses map Ongoing to In progress, Pending Review to Waiting for review, Needs Revision to Changes needed, Missing to Not submitted, Rejected to Not accepted, Superseded to Earlier version, and Not Applicable to Not needed. These aliases never rewrite stored records, incoming enum validation or role permissions. The five exact research-type options and every supplied checklist item/group label remain available. Static page/navigation/card/modal/tab/action captions use Title Case (minor words such as and, to, for, of and the stay lowercase unless first). Form/table labels, placeholders, supporting text, prompts, errors and status badges use sentence case. Empty-state fragments omit terminal punctuation; complete alert/helper sentences end with punctuation. Busy indicators remain sentence case. True acronyms and official role/program names retain their proper spelling.

Phase heading casing is a display alias only: for example, I. CONCEPTUALIZATION PHASE displays as I. Conceptualization Phase. Source catalog values, checklist item/group wording and stored enums are untouched. Do not force-capitalize user names, email addresses, research/announcement titles, descriptions, filenames, notification bodies, feedback or audit records. No global CSS text transform or whole-table status formatter may rewrite arbitrary record text; apply aliases only in typed status/stage contexts. Report/CSV captions share the same human-readable labels while canonical report selection values and derivation remain unchanged. See docs/UI-COPY.md for terminology and scope.

## Reading and reflow
Working text is at least 16px; supporting information at least 14px. Standard controls use 48px targets and interactive targets never shrink below 44px in either dimension. Content wraps rather than truncating data. The page footer sits outside the inset, width-limited main content so its dark surface spans the full workspace width and reaches the page bottom without external side or bottom white gutters. The shell keeps it at the viewport bottom on short pages and after content on long pages, never as a fixed overlay. It retains both system-identity and practice-integration messages with 24px internal padding; its text wraps within the colored surface and stacks on small screens so neither message touches the edges or causes horizontal overflow. Standard tables retain column headings/scope and provide each mobile cell's visible heading through data-label. Wide report models stack at every width rather than omitting columns. The menu is a persistent sidebar on large screens and an inert-when-closed drawer at 1000px and below. The phase path stacks on small screens; Monitoring and Evaluation remains cross-cutting.

## Researcher profiles
The searchable Faculty members directory stays tabular; View profile opens a read-only full-page researcher view inside the existing workspace, not a modal. Its profile-style header uses initials instead of inventing a portrait, an About section shows recorded name/email/department/role/status, and research cards expose the owner's authorized title/type/year/program/abstract/stage/status. Missing details and no-research states are explicit. No new biography, personal contacts, uploads, social metrics or profile editing are introduced.

Selection stores only researcher identity and resolves it against current authorized bootstrap users. Counts and cards use all currently authorized owner projects, not directory search or project-list filters; include archived records where already supplied, and label counts as visible to the viewer. Never infer an institution-wide total from a scoped response. Missing/unauthorized selection renders an unavailable state instead of a retained profile record. The frontend does not widen visibility or add endpoints.

Back to faculty preserves directory search. Research cards open the existing project screen with a return-to-profile action. Other navigation/login/account switching clear profile selection; focus and view motion follow profile identity. These are client-state views consistent with the existing app navigation, not new shareable/deep-link URLs.

## Forms and decisions
Associated top labels show Required/Optional, with native validation and plain helper text. Feedback becomes required for Needs Revision and Rejected decisions without changing the sent values. Research fields are grouped by task.

Sensitive forms (project creation, PDF submission, signed review, phase approval, applicability, accounts, publication, archiving and institution settings) use a shared two-step flow. The first submit validates locally and displays a summary but sends no mutation. The final explicit confirmation invokes the existing handler and payload. Going back must preserve all entries and selected files; a failed attempt retains the same upload submission key. Displayed select summaries use human option text instead of opaque IDs. Every required approval still occurs on the server.

A changed form cannot be dismissed by backdrop, Escape or Close without a clear keep-editing/leave decision. Busy saves cannot be dismissed accidentally. Archiving explains that evidence is kept, not deleted. There is no new delete operation.

## Focus and recovery
Dialogs and the mobile drawer constrain keyboard focus; background controls and skip/toast controls are inert while appropriate. Closing restores the trigger after its ancestor is no longer inert; opening a new page focuses its heading. Hidden editing/review sections are not keyboard targets. Unexpected rendering errors offer a reload action, and initial account loading does not flash a different sign-in state.

Command completion and view-refresh completion are distinct. Once a mutation succeeds, a subsequent read failure shows saved-with-refresh-needed rather than inviting an unsafe repeat. Identity changes clear private assistant state along with account data. These client safeguards do not repair or claim to repair the separately documented backend production risks.

## Motion and continuity
Motion is presentational and never gates mutations, fetching, focus restoration or interaction. Timing/easing/opacity tokens live in theme.css; motion.css owns property-specific color, background, border, opacity and transform feedback. Routine feedback is 150ms, entrances 200–250ms. No layout properties, blanket transitions, repeated spinning/flashing, zoom or sweeping drawer slides are animated. Pointer-only primary-action lifts are limited to 1px; keyboard focus remains immediately visible.

ViewMotion observes page/project/researcher/tab/phase identity without key-remounting content or retaining old interactive views. It shallow-fades new content from 0.96 opacity rather than fading through blank white or compromising text legibility. Native select popups remain OS-controlled. Dialog and scrim entrances fade; removal remains immediate to preserve the existing dismissal/focus contract, not delayed for cosmetic exits. Loading surfaces are midnight with a static gold marker. The white-dominant working palette remains unchanged.

Reduced-motion disables CSS transitions/animations and smooth scrolling; view animation is skipped and any running reveal is cancelled if the preference changes. Print disables motion. Animations also cancel on interruption/unmount. There are no new runtime dependencies or performance claims beyond the tested desktop/mobile browsers.

## Verification boundary
The original role/submission/review/account/announcement flows remain browser-tested. Additional checks assert no mutation before confirmation, retained file/text edits, dirty-close/focus behavior, required feedback, five categories, exact checklist wording, server advancement gates, and all-role/page readability/reflow. The original 22-browser workflow suite includes mandatory axe-core scans of Home, checklist and inline review; additional motion and researcher-profile suites verify their respective presentation boundaries. Viewports include 320, 390, 720 (200%-equivalent layout), 1024 and 1440px; this is not a blanket certification for every assistive technology or browser.
