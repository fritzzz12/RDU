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
Navigation may use everyday display labels while stable internal page keys and API enum values stay unchanged. Display statuses map Ongoing to In progress, Pending Review to Waiting for review, Needs Revision to Changes needed, Missing to Not submitted, Rejected to Not accepted, Superseded to Earlier version, and Not Applicable to Not needed. These aliases never rewrite stored records, incoming enum validation or role permissions. The five exact research-type options and every supplied checklist label remain available.

## Reading and reflow
Working text is at least 16px; supporting information at least 14px. Standard controls use 48px targets and interactive targets never shrink below 44px in either dimension. Content wraps rather than truncating data. Standard tables retain column headings/scope and provide each mobile cell's visible heading through data-label. Wide report models stack at every width rather than omitting columns. The menu is a persistent sidebar on large screens and an inert-when-closed drawer at 1000px and below. The phase path stacks on small screens; Monitoring and Evaluation remains cross-cutting.

## Forms and decisions
Associated top labels show Required/Optional, with native validation and plain helper text. Feedback becomes required for Needs Revision and Rejected decisions without changing the sent values. Research fields are grouped by task.

Sensitive forms (project creation, PDF submission, signed review, phase approval, applicability, accounts, publication, archiving and institution settings) use a shared two-step flow. The first submit validates locally and displays a summary but sends no mutation. The final explicit confirmation invokes the existing handler and payload. Going back must preserve all entries and selected files; a failed attempt retains the same upload submission key. Displayed select summaries use human option text instead of opaque IDs. Every required approval still occurs on the server.

A changed form cannot be dismissed by backdrop, Escape or Close without a clear keep-editing/leave decision. Busy saves cannot be dismissed accidentally. Archiving explains that evidence is kept, not deleted. There is no new delete operation.

## Focus and recovery
Dialogs and the mobile drawer constrain keyboard focus; background controls and skip/toast controls are inert while appropriate. Closing restores the trigger after its ancestor is no longer inert; opening a new page focuses its heading. Hidden editing/review sections are not keyboard targets. Unexpected rendering errors offer a reload action, and initial account loading does not flash a different sign-in state.

Command completion and view-refresh completion are distinct. Once a mutation succeeds, a subsequent read failure shows saved-with-refresh-needed rather than inviting an unsafe repeat. Identity changes clear private assistant state along with account data. These client safeguards do not repair or claim to repair the separately documented backend production risks.

## Verification boundary
The original role/submission/review/account/announcement flows remain browser-tested. Additional checks assert no mutation before confirmation, retained file/text edits, dirty-close/focus behavior, required feedback, five categories, exact checklist wording, server advancement gates, and all-role/page readability/reflow. The default 22-browser suite includes mandatory axe-core scans of Home, checklist and inline review. Viewports include 320, 390, 720 (200%-equivalent layout), 1024 and 1440px; this is not a blanket certification for every assistive technology or browser.
