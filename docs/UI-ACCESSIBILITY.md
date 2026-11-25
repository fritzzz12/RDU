# Beginner-friendly RDMS interface

This interface update preserves the existing React/Node application, all backend endpoints, role restrictions, research data fields, research categories and official checklist wording. The navy/teal appearance remains provisional rather than official university branding.

## What changed

- **Readable text:** 16px working text and 14px or larger supporting information, with clear headings, generous line height and high-contrast text.
- **Comfortable controls:** 48px standard targets, visible keyboard focus and explicit text on view, menu, account-switch, message and close actions.
- **Plain navigation:** Home, Things to do, Messages, Research projects, Submitted documents, Review documents, Completed research, Faculty members, Reports, News and opportunities, and Research help. Administrators retain all account, access, history and settings pages.
- **Visible guidance:** filters have top-aligned labels; project forms have named sections; every form field displays Required or Optional; signatures explain why a full name is requested. Conditional review feedback becomes required when a document is not approved.
- **Responsive records:** tables keep their real data/columns but reflow into labeled records on smaller screens. Wide report rows use the same approach instead of sideways scrolling or hiding fields. The research phase path stacks on small screens while retaining every official stage and checklist item.
- **Clear status wording:** In progress, Waiting for review, Changes needed, Not submitted, Not accepted, Earlier version and Not needed are display labels. The corresponding stored/API values remain unchanged.
- **Safer decisions:** sensitive forms use Enter details → Check before saving → Confirm. The summary shows selected option text, file name/size, signature, and other form values; going back preserves entries. No mutation is sent just to open the review step.
- **Protected editing:** closing a changed form asks whether to keep editing or leave without saving. Busy saves cannot be dismissed accidentally. Archiving requires explicit confirmation and explains that it does not delete documents.
- **Keyboard support:** skip link, clear active navigation/pressed states, focus-controlled dialogs, inert background, menu Escape/Tab handling and focus restoration.
- **Helpful recovery:** plain-language validation/retry messages and a separate refresh-recovery notice when a save succeeds but reloading records fails. The system does not incorrectly tell users to repeat a committed action.

## Code locations

- `src/styles.css`: shared size, spacing, contrast, layout, responsive, focus and print rules; replaces the earlier compact stylesheet.
- `src/ui.jsx`: reusable readable label mappings, labeled responsive tables, safe form review, dialog focus and unsaved-entry handling.
- `src/main.jsx`: existing features connected to the shared components with clearer labels and contextual help; all existing API routes and role checks retained.
- `tests/ui/workspace.spec.js`: real-browser regression coverage for original workflows and the new confirmation/accessibility behavior.
- `DESIGN.md` and `.impeccable/design.json`: built design-system reference.

## Important boundaries

This is a frontend accessibility/usability improvement, not the production migration proposed in `docs/PRODUCTION-READINESS.md`. Google authentication, email delivery, confidential research policies, scanning and other unimplemented backend capabilities are not made production-ready by these visual changes. Typed signatures remain demo attestations. No new delete operation is introduced.

Official research terms and requirements remain visible even when they are technical: plain explanations supplement, rather than replace, the source checklist. Body text and targets are designed for accessibility, but an automated/browser test result is not a certification across every assistive technology. Test with actual faculty/staff before institutional rollout.
