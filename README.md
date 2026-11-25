# RDMS — Research and Development Management System

Interactive **local full-system prototype** for BukSU RDU: React, Express and persistent SQLite, with private PDF storage. All supplied sample identities, research and documentary evidence are synthetic. This is not a production deployment.

## Run

Requires **Node.js 24+** and npm. SQLite is included with Node; no database service is needed.

```bash
npm install
npm run build
npm start
```

Open **http://127.0.0.1:3001**. Choose a demo identity on the entry screen. The server binds to localhost deliberately. `PORT` changes its port and `RDMS_DATA_DIR` changes the data directory.

For development:

```bash
npm run dev
```

Open **http://localhost:5173** (Vite proxies `/api` to the backend on port 3001).

## Suggested demonstration

1. Choose **Morgan Santos — Research Director** to see university-wide dashboards, all five research categories, reports, archive and announcements. No account-management or review authority is granted.
2. Switch identity using the header logout icon. Choose **Maya Dela Cruz — Researcher** (`researcher-1`). Open *Community early-warning networks* and its checklist. The Capsule Proposal needs revision.
3. Upload a valid PDF and type the submission signature. Prior versions remain in the Documents tab. A signed submission is **not** an approval.
4. Switch to **Elena Cruz — Department Head** (`head-1`, Technology). Review the new PDF; approve, request revision or reject with feedback and a typed signature. Other departments' records are inaccessible.
5. Supply and approve the remaining current-phase requirements, or explicitly mark a conditional item not applicable with a reason. **Review & advance** unlocks only after all items pass; the server rechecks them. A mistaken conditional exclusion can be restored with **Mark applicable**.
6. Use **Tessa Manalo** (`researcher-15`) or **Adrian Velasco** (`researcher-16`) to create new research without violating the existing-study restriction. Select any of the five types and a department-specific academic program.
7. Choose **Alex Rivera — Super Admin** to approve Sam Perez's Pending account, change account status/role/department, inspect audit events, and configure safe institution settings. Pending/suspended/deactivated users cannot enter protected APIs.
8. Export a filtered report as CSV or **Print / Save PDF**. All 13 report selections derive appropriate data; CSV and preview share the same report builder.

## Source precedence and checklist fidelity

- `RDU-System.md` establishes the base system.
- `RDMS_System_Modifications_and_Improvements (1).md` overrides conflicting base requirements.
- `RDU-CHECKLIST.jpg` supplies the documentary wording, including the repeated **E. Publication / E. Utilization** labels.
- `goal-and-requirements.md` and `architecture.md` record approved prototype choices and trust boundaries; they remain draft pending final artifact review.

The three sequential, approval-gated phases are **Conceptualization**, **Development**, and **Implementation**. **IV. Monitoring and Evaluation** covers the whole process and appears with the checklist/history rather than being misrepresented as a final-only gate. All image checkbox lines are represented, including complete-paper sections, originality checks, dissemination, publication, and utilization.

The official personally funded checklist was not supplied. By explicit user approval, that variant uses the supplied standard checklist and is prominently labeled **provisional**.

Supported categories in forms, stored records, filtering and reports:

1. Agenda Based Research Project
2. Curricular Based Research Project
3. Externally Funded Research Project
4. Personally Funded Research Project
5. Equivalent Teaching Research Project (ETL)

## Working local capabilities

- Four role-scoped dashboards; department chart and stored-record metrics.
- Project submission, ownership, program/category selection, research search and archive monitoring.
- Exact phase/requirement catalog, authorized conditional applicability, approval-gated progression and completion.
- Authenticated embedded PDF preview/download; validated uploads (maximum 10 MiB), staff reasons/provenance, immutable signed reviews, retained versions and feedback.
- Safe retry using a persisted submission key. UI retains the key after upload errors; identical retries return the original version without another audit event/notification. Changed content must start a new upload. API clients should send `submissionKey`; legacy unkeyed API uploads intentionally create new versions.
- Account approval/status/role/department changes; server enforcement on every protected request.
- Notification read state/history; authoritative document correction/review queues; account approvals.
- Plain-text announcement draft, publish, unpublish via Draft, archive, department audiences and deadlines.
- Thirteen specialized report views, scoped/formula-safe CSV export, printable PDF and export audit.
- Faculty research participation, immutable activity history and a deterministic scoped advisory assistant.

### Deliberate prototype limitations and remaining specification gaps

These are **not claimed complete**:

- **Google SSO and email:** no live Google authentication, email sender, retry queue or delivery status service is wired. Demo identity selection is explicitly not real authentication. In-app notifications are persistent local records; no email is claimed sent.
- **Identity/security:** anyone using this local demo can choose an active demo identity. Do not expose it publicly or upload confidential documents. Production requires real identity verification, restrictive access policy, HTTPS, rate limiting, retention, backups and operational security review.
- **Branding:** no official BukSU/RDU logo, favicon, approved color values or font assets were supplied. The shown navy/teal visual language is provisional, not official branding.
- **Policy:** Heads-only review and phase authority is the user-approved demo policy. Optional Reviewer delegation, per-document confidentiality, arbitrary per-user permission overrides, and a production approval-policy editor are not implemented. Roles & Permissions displays the enforced fixed matrix.
- **Directory/profile:** departments/programs are seeded reference catalogs, not a directory CRUD/import module. Faculty profiles contain synthetic names/email, department and research participation; additional contact/social details are not fabricated.
- **News:** plain text rather than a rich-text/image editor; no graphic/document attachments or scheduling service. Publication transitions and prior content are audited.
- **Notifications:** search, type and unread filtering are implemented; full date/priority/action-state filtering and account/announcement-specific deep links remain absent. In-app state refreshes after actions or page reload, not via realtime push.
- **Reports/analytics:** CSV and browser-print PDF are implemented, not native Excel or institutional PDF templates. Filters cover academic year, department, research type, status and text; dedicated date-range, phase and researcher filter controls, review-turnaround charts and monthly/quarterly trends are not provided. Browser PDF generation logs the request, not whether the user ultimately saves the print dialog.
- **Documents:** signatures are typed attestations, not certified digital signatures. PDF validation is not a malware scan or proof of authenticity. No redline/annotation editor, approved-document amendment/reassignment tool, duplicate-content warning, or formal recovery workflow for a wrong approved attachment. Revisions and staff uploads work without silent replacement of approved evidence.
- **Assistant:** a local rule-based metadata summary, not a connected LLM, PDF extraction or authenticity checker. It cannot approve or advance anything.
- **Production migrations:** first-run schema initialization and a durable local database are provided; there is no pre-existing system/database to migrate. The JSON-with-relational-keys schema is a prototype choice, not a claim of a fully normalized production migration plan.

## Google / email deployment prerequisites

Before replacing demo sessions, obtain a Google OAuth client, approved redirect URI and institution access policy. Implement authorization-code exchange and server verification of issuer, audience, expiration, nonce, verified email and stable `sub`; create new accounts as Pending. Disable the demo picker outside local environments. No OAuth secret belongs in frontend assets.

Before enabling email, choose an SMTP/API provider and sender, provide server-side secrets, and implement an event outbox with recipient scoping, deduplication, retries and delivery audit. CTA links must require authentication and authorization; no email link may approve a record by itself. Do not send confidential PDF attachments by default. These are integration instructions, not fabricated configured adapters.

## Data, initialization, backup and rollback

- `data/rdms.sqlite`: domain records, sessions, audit and reviews; WAL enabled.
- `data/files/`: private PDFs, served only after authorization.
- The database initializes idempotently on first start and seeds **20 projects / 26 identities** only when empty. All five types and all seven departments are represented. Sample counts change when you interact with the app.
- To back up: stop the server, then copy the **entire `data/` directory**. Keep database and files together. Restore with the server stopped. Existing data is not silently reseeded when application fixtures change.
- To reset the synthetic demo: stop the server, rename `data/` to a backup directory, then restart. This discards your local demo changes from the active workspace, so preserve the backup first.
- Roll back application changes by restoring the matching app revision **and** its complete data backup. No destructive down-migration is run automatically; never remove audit records to make a rollback appear successful.

See `server/README.md` for the API and roles contract, `docs/SPEC-COVERAGE.md` for all 15 MOD coverage statuses, and `DESIGN.md` / `.impeccable/design.json` for the built visual system. A fresh-context general reviewer/documenter substituted for unavailable specialized design agents; the final UI verdict was limited to the identified focus and contrast fixes, not a whole-system certification.

## Verification

```bash
npm test
npm run build
npx playwright install chromium
npx playwright test
```

Playwright uses temporary isolated data and an ephemeral local server; it does not mutate your demo database. If using an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path. The verified environment used an already-installed headless Chromium because the new Playwright package's matching bundled browser was absent.

- **12 Node tests pass:** authorization/scoping, accounts, PDF integrity/versioning, concurrent submissions, retry idempotency, all three phase transitions, persistence and specialized reports.
- **6 browser tests pass:** all authorized navigation, submission, PDF correction/review, account approval, announcement publication, rejection/resubmission and mobile keyboard/navigation/overflow.
- Production build passes; `npm audit` reported zero dependency vulnerabilities at installation.
- Desktop (1440px) and mobile (390px) screenshots live under `.thinkrail/context/screenshots/` (local evidence, not shipping assets).
