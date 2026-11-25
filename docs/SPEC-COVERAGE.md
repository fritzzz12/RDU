# Source specification coverage

The repository initially contained only the three reference materials: **all MODs were Missing**, with no existing code or data to preserve. This records the local prototype's actual coverage, not production completion. User-approved choices are in `goal-and-requirements.md`; detailed gaps and setup are in `README.md`.

- **MOD-001 — Partial.** Server-created demo sessions, protected access, account approval/status and role/department assignment work. Real Google OAuth is unconfigured and the demo picker is not authentication.
- **MOD-002 — Missing external service.** Domain events create scoped in-app notifications. No email provider, outbox delivery queue, templates or authenticated email CTA delivery is implemented; no email is claimed sent.
- **MOD-003 — Partial.** Unread bell, notification history, mark-all-read, type/search/unread filters and document pending queues work. Date/priority/action filters and account/announcement deep links are absent. Rejected evidence remains actionable and resolves on resubmission.
- **MOD-004 — Partial / assets blocked.** Consistent accessible responsive prototype components and centralized CSS values work. Official assets and approved branding guidance are missing; the provisional styling is not represented as official.
- **MOD-005 — Partial / assets blocked.** RDMS identity, browser title, navigation and printed report identity work. No official RDU logo/favicon was supplied or fabricated.
- **MOD-006 — Partial.** All role dashboards derive scoped metrics and department comparisons from persisted data; year/department/type filters work. Broader trend, turnaround, date-range and phase/researcher analytics are not implemented.
- **MOD-007 — Implemented for approved demo policy.** Director has university-wide research/report/announcement visibility, no account/security administration, and no review/phase permissions. The user explicitly selected Heads-only reviews rather than delegated Director authority.
- **MOD-008 — Partial.** Safe plain-text drafts, editing, publish/unpublish/archive, categories, deadlines, department audience, notifications and audited prior content work. Rich-text editor, attachments, scheduling and role-specific targeting are absent.
- **MOD-009 — Implemented core prototype review.** Authenticated embedded browser PDF viewer, scoped preview/download, metadata, signed review decisions and audit history work. Native browser PDF controls supply zoom/page navigation where supported. No annotation/redline editor or production confidentiality-policy engine.
- **MOD-010 — Implemented core versioning.** Corrections retain prior immutable review history and PDF bytes, mark old versions Superseded and return new evidence to Pending Review. Approved evidence cannot be silently overwritten; a formal amendment/reopening interface is absent.
- **MOD-011 — Partial.** Thirteen distinct shared report models support filtered previews, scoped CSV, browser-print PDF, attribution/timestamps and export logs. Excel, official PDF templates and dedicated advanced filters remain absent.
- **MOD-012 — Partial.** Heads can upload for department faculty with reason, provenance and notification, without auto-approval. Signed keyed retries are idempotent. Full wrong-project reassignment, approved-document amendment, duplicate-content warnings and malware scanning are absent.
- **MOD-013 — Implemented supplied workflow, variant provisional.** Exact image checkbox wording, sequential phases, conditional applicability with reversible audited reasons, approval-gated advancement and signed history work. Monitoring/evaluation is cross-cutting. Personally funded uses a visibly provisional shared variant by user approval because its official source is missing.
- **MOD-014 — Implemented core local history.** Submissions, reviews, revisions, conditional decisions, staff uploads, phase transitions, exports, announcements and account/configuration changes are attributed and time-ordered. SQLite triggers prevent update/delete of audit and review records. Production retention policy remains an institutional decision.
- **MOD-015 — Partial advisory demonstration.** Scoped deterministic metadata questions and summaries work. No external LLM, PDF extraction, authenticity verification, AI approvals or autonomous phase advancement is implemented.

## Base module constraints

The four-role matrix is server-enforced but fixed rather than a granular per-user permission editor. Departments and programs are read-only seeded catalogs; faculty profiles show synthetic email, department and research history without invented personal contacts. CSV import and generic directory CRUD are not provided. These gaps are explicitly disclosed rather than hidden behind nonworking controls.

## Evidence

`npm test`: 12 passing domain/report tests. Playwright: 6 passing browser flows, including rejection/resubmission and 390px keyboard/overflow regression coverage. `npm run build`: passes. Independent review verified corrected retry/reporting logic and separately scored mobile-focus and lifecycle-numeral contrast fixes resolved. These checks do not certify production security, all assistive technologies or real external integrations.
