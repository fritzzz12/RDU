# RDMS production transition — Phase 1

**Status: proposal for approval; no implementation authorized.**

This assesses the actual RDMS in this repository, not the unfilled example stack in the request. Existing application code, UI and authoritative current-system specs are unchanged. This proposal does not silently replace `architecture.md` or approve unresolved institutional policies.

## 1. Confirmed planning constraints

- One university, with hundreds to a few thousand accounts and submission/review peaks. These are planning bounds, not tested capacity.
- Recommend managed hosting rather than university-operated infrastructure. Provider, region, budget and procurement still require approval.
- Production eligibility: approved institutional Google identities, followed by explicit administrative approval. No general guest registration.
- Preserve the current interface and the five exact research project types.
- Preserve Department-Head-only departmental review/advancement. Director remains research oversight without account/security administration or implied review authority.
- Modifications override the base specification. The image governs supplied documentary wording; monitoring/evaluation remains cross-lifecycle.
- Do not process real research using demo identity selection or automatically promote synthetic accounts, signatures or reviews into production.

## 2. Executive assessment

**Functional local prototype; not safe for public deployment or confidential production research.** No framework rewrite is justified. Preserve working UX and business rules while replacing unsafe identity, persistence and storage boundaries incrementally.

The prototype already has real SQLite persistence, protected APIs, scoped document access, signed review attestations, retained PDF versions, current-phase gates, keyed upload retries and specialized reports. It does not have production authentication, safe multi-process database updates, an email delivery service, malware scanning or verified operational recovery.

### Evidence checked in this Phase 1

- Read actual source in `server/index.js`, `server/store.js`, `src/main.jsx`, `shared/`, test suites, current specs and MOD coverage.
- `npm test`: 12 passing backend/report tests, rerun for this assessment.
- `npm run build`: passes, rerun for this assessment.
- `npm audit`: zero reported dependency vulnerabilities, rerun for this assessment. This is dependency evidence, not a security certification.
- The six existing Playwright tests were inspected; they passed in the preceding prototype work but were not rerun for this Phase 1.
- Independent read-only review reproduced stale-snapshot suspension rollback with two database connections, and notification scope leakage after a Head changes departments. These are not claims of production exploitation.
- The working implementation is currently untracked relative to the initial repository commit. Establish a reviewed baseline before relying on Git rollback.

## 3. Production readiness audit

### P0 — Identity is selectable, not authenticated

**Evidence:** `server/index.js:176–218`, `/api/session`.

The endpoint lists demo identities and accepts an active `userId` to create a session, including Admin. A random HttpOnly cookie does not authenticate the person selecting that identity. Production must remove these routes/identity lists, prohibit demo seeding, verify the real Google identity, and gate account access by status and scope. Fail startup if production identity/security configuration is incomplete.

Use authorization-code OIDC with state, nonce and PKCE via a maintained server library. Validate signature, issuer, audience, expiration, nonce, verified email and allowed Workspace `hd` claim; store the stable `(issuer, sub)` identity. The OAuth request's domain hint and an email suffix are not authorization. Pending accounts get only their own account-status/logout endpoints, not protected research APIs. Do not auto-link accounts solely by an email match.

Use opaque server sessions with only hashed tokens stored, Secure/HttpOnly cookies, bounded idle/absolute expiry, rotation/revocation, CSRF protection, and explicitly configured trusted ingress/proxy handling. Google Workspace MFA and recent reauthentication for privileged changes should be part of the approved institutional policy. Do not claim a typed name is certified signing.

### P0 — Multi-process writes can revert authoritative state

**Evidence:** `server/store.js:70–114`, `load()` / `save()`.

Every command reads a full graph before its transaction, then upserts all mutable records. `BEGIN IMMEDIATE` serializes writes, not the preceding read/check sequence. A second process can save an older user or requirement snapshot over a newer decision; suspension can be reverted by an unrelated stale write. SQLite is not intrinsically insecure: this access pattern and replica model are the blockers.

Until replaced, keep one writer and keep the demo local. Production needs scoped queries and command-level transactions encompassing authoritative reads, authorization-relevant state, validation and targeted updates. Add row locks or explicit optimistic revisions, transaction retry rules, database uniqueness and foreign-key/check constraints. Two-replica tests must cover races between suspend/upload, review/resubmit, waive/advance, duplicate advancement, project creation and last-admin changes.

### P0 — Authorization changes do not fully revoke derived content

**Evidence:** `server/index.js:100–119,227–260`, `resolveTasks()` and bootstrap notifications.

Notifications are filtered by recipient, but project-linked content is not reauthorized on retrieval. Resolving a task does not redact its project title, file name or feedback after department reassignment. Add resource-aware notification projections: preserve permitted historical event metadata but redact inaccessible content and action links. Recheck scope again when jobs deliver email or generate reports, not just when enqueued. Decide separately what historical access remains legitimate after role/department changes.

**Evidence:** `src/main.jsx`, authenticated App state, assistant result state and logout/login paths.

An assistant answer can survive switching identities even though the server scopes new answers correctly. Authentication identity must key the entire client workspace/query cache. Logout, expiry and scope changes must clear private cache, assistant results, modal records, selected projects and pending work; ignore stale responses from the prior identity. Never persist private query results in browser storage by default.

### P1 — Persistence and file lifecycle are not deployment-safe

**Evidence:** `server/store.js:43–60,120`; `server/index.js` upload handler and private file route.

SQLite/local files depend on one machine; replacement containers or separate replica disks are not shared durable storage. There is no migration history runner or automatic storage reconciliation. A crash between file creation and database commit can leave an orphan even though ordinary caught failures clean up. Initialization seeds synthetic data whenever the user table is empty.

Use managed PostgreSQL plus private versioned object storage, controlled migrations, explicit nonproduction fixtures, quarantine/clean states, reconciliation jobs and tested coordinated recovery. Files and database changes cannot share a distributed ACID transaction: model staged uploads and compensating cleanup explicitly. Retain/reconcile referenced object versions rather than assuming database point-in-time recovery restores file bytes.

### P1 — Files are structurally screened, not safe to render

**Evidence:** `server/index.js:323–330,351–365,466–477`.

Multer buffers PDFs in memory. Header/extension/EOF/size checks help but do not scan malicious/active content, bound aggregate concurrency or prove authenticity. There is no malware scan/quarantine workflow or wrong-approved-attachment amendment path.

Bound per-user/project quotas and concurrent uploads; upload to unique private quarantine keys. Check actual length/checksum and parse safely; scan before preview, review or export. A failed/pending scan cannot satisfy a requirement. Preserve original bytes and scan evidence. A cleaned preview, if generated, must be a separately identified derivative so it cannot silently change the signed evidence. Stream approved clean versions through an authorization-checked gateway with Range support. Do not distribute public object URLs.

Add a separately approved amendment procedure for mistakenly approved attachments, preserving previous bytes, decisions and affected phase history. Decide whether an amendment freezes subsequent phases or triggers reevaluation before implementing that behavior.

### P1 — Queries and frontend state do not scale with record history

**Evidence:** `server/store.js:70–114`; `/api/bootstrap`; `src/main.jsx`, `App`, `load()`, `run()`.

Every protected request loads all database records before scoping, and mutations synchronously rewrite most records. Bootstrap returns all permitted projects/documents/audit history and the browser filters it. The ~2,900-line React module couples navigation, forms, reports, domain derivation and transport.

Use indexed scoped queries, cursor pagination, validated filters, server aggregates and dedicated detail endpoints. Retain only small directory/identity data in bootstrap. Incrementally extract feature modules without changing styling/behavior. Use URL-based routing, typed contracts, request cancellation and a query cache keyed by identity and scope. Avoid unsafe optimistic updates for approval/advancement.

Separate command success from refresh failure: a saved mutation followed by a failed refresh must not appear to be an unsaved command. Return a typed committed result/version; show refresh recovery without replaying the mutation. Extend idempotency beyond uploads where duplicate administrative, review, transition and job commands matter.

### P1 — Contract validation and safe client recovery need a shared model

**Evidence:** inline `text()` / `choice()` checks in `server/index.js`, untyped JavaScript, `{error}` responses, `src/main.jsx` API helper/global state.

Existing server validation and generic 500 responses are useful. Replace dispersed checks with strict Zod command/query schemas and TypeScript types, keeping permission checks server-side. Standardize stable error codes, field errors and request IDs; map domain conflicts distinctly from authorization and transient failures. Centralize 401/403 handling, bounded retries, timeouts and error boundaries. Do not expose stacks or sensitive feedback in operational logs. Catch only where recovery/translation is meaningful; never swallow an exception to manufacture success.

### P1 — Sessions, transport and operations lack production controls

**Evidence:** cookie `secure:req.secure`; headers middleware; `/api/health`; local-only server startup.

The app has SameSite cookies, an Origin-host mutation check, nosniff, generic internal errors and graceful shutdown. It lacks a deployment-specific HTTPS/proxy configuration, a full CSP/security-header policy, rate limits, readiness checks for dependencies, centralized telemetry, secret management, alerting and tested automated restore. Origin checking alone is not the complete CSRF/OAuth threat model.

Use TLS ingress, explicit secure cookie policy and trusted proxy rules, CSP compatible with the PDF viewer, request/job timeouts, per-identity/IP limits, graceful draining and separate liveness/readiness. Keep DB/storage private, encrypt at rest, give API/worker least-privilege IAM identities, and redact structured logs. Threat-model shared machines, research confidentiality, account reassignment and privileged exports. Independent penetration testing is a release gate, not replaced by `npm audit`.

### P1 — Policy and functionality gaps remain release blockers where required

**Evidence:** `docs/SPEC-COVERAGE.md`, `shared/catalog.js`, `shared/reporting.js`, current role helpers.

- The personally funded checklist and official branding require client-approved sources. Do not label a shared provisional checklist official or bulk-rewrite old projects when the official version arrives.
- Names rather than durable actor IDs are used in several document/audit records; bind real events to actor IDs, role/scope snapshots, request IDs and server timestamps.
- Current fixed role policy lacks document confidentiality controls and granular delegated permissions. Do not give Director review authority through a broad new role or silently broaden Admin access.
- No real email outbox/provider/delivery service, rich announcements/attachments/scheduling, complete directory CRUD/import, advanced filters/trends, native Excel or approved report templates.
- Typed signatures are attestations. Legal requirements for signature strength, retention, research ethics records and institution-approved privacy/data-residency policy need sign-off.
- Report previews and CSV can identify former Researcher owners differently because their owner projections differ. Both should use the same authorized server dataset. Label current-phase compliance versus whole-lifecycle completion explicitly; completed/archived projects must not say Ready for Advancement.
- Audit/review triggers deter application mutation, not privileged database tampering. Use a restricted runtime DB role and an independently protected archive if compliance requires tamper evidence.

## 4. Recommended architecture

### Recommendation: typed modular monolith plus background worker

Keep React/Vite, current CSS/components and Express. Convert to TypeScript gradually. Adopt PostgreSQL with Prisma plus reviewed SQL migrations for constraints/locks unsupported by the ORM; Zod for request/config contracts; TanStack Query and React Router for server state/navigation. Use a maintained OIDC client rather than hand-written token cryptography. Pin supported versions and verify compatibility during the first approved milestone.

No Next.js rewrite, microservices, Kubernetes, Kafka or Redis is required for this workload. Public SEO/SSR is not a stated RDMS requirement. Add caches, replicas or dedicated search only when measurements justify them. Keep one deployable application domain boundary; API and worker can share a versioned codebase but have distinct runtime permissions and resource limits.

### Managed deployment reference

**Recommended reference: AWS ECS/Fargate application and worker, RDS PostgreSQL, private S3, SQS with dead-letter queues, SES, Secrets Manager/KMS and CloudWatch/OpenTelemetry.** Serve the existing built Vite app and `/api` through a single HTTPS origin/ingress. No separate browser-token-bearing API domain is necessary.

This is a provider recommendation, not approved procurement or a fixed cost estimate. Region/residency, minimum availability, data classification, email-domain ownership and monthly budget determine the final shape. Include load balancer, database, storage, logs, network egress and scanning costs—not only application compute. A lower-cost managed container/Postgres provider is a viable alternative if it meets approved region, private networking, backup and audit requirements.

- Application: requests, authentication, authorization, transactional domain commands and scoped queries.
- PostgreSQL: domain records, hashed sessions, job/report metadata and transactional outbox. Bounded connection pools; no database connection per user.
- S3: private quarantine and clean document namespaces/buckets, immutable unique keys, versioning, encryption and explicit retention policy.
- Worker: outbox dispatch, file scan/finalization/reconciliation, email and exports; bounded jobs and retry budgets.
- SQS: work delivery with retries/dead-letter handling; no claim of exactly-once transport.
- Outbox: committed with the business transaction. Consumers deduplicate delivery, record attempts/provider IDs and handle provider uncertainty; user-visible delivery is not falsely labeled guaranteed exactly-once.
- Observability: correlate request, actor, project, command, object and job IDs without logging document bodies or tokens.

### Proposed folder structure

Folders below describe responsibility boundaries, not code to create before approval:

```text
apps/web/src/app/                  routing, providers, auth boundary
apps/web/src/features/             existing screens extracted by domain
apps/web/src/components/           preserved shared UI primitives
apps/web/src/lib/                  typed API client and query keys
apps/web/src/styles/               preserved tokens and responsive CSS
apps/api/src/modules/identity/     Google identity, account lifecycle, sessions
apps/api/src/modules/access/       scoped policy and confidentiality checks
apps/api/src/modules/research/     projects, ownership, directory links
apps/api/src/modules/workflow/     template versions, requirements, transitions
apps/api/src/modules/documents/    upload sessions, versions, reviews, amendment
apps/api/src/modules/notifications/ notification projections and preferences
apps/api/src/modules/reports/      shared authorized datasets and export jobs
apps/api/src/modules/announcements/publication, attachments, audience
apps/api/src/modules/directory/    department, program, faculty administration
apps/api/src/modules/audit/        append-only domain/security event writers
apps/api/src/platform/             database, storage, logging, config, transport
apps/worker/src/                   scan, email, export, cleanup, outbox handlers
packages/contracts/src/            Zod schemas, types, stable error/event codes
packages/database/prisma/          normalized schema and migration history
packages/testing/                  fixtures and permission/race test helpers
infra/                             reviewed infrastructure-as-code
 tests/                            system, E2E, security, load and restore suites
```

Initially extract into existing directories behind the current imports; move to workspaces only after the seams are tested. Each API module owns controller, schema, policy, service and repository responsibilities; controllers do not bypass domain services to mutate tables. No unrelated design-system replacement.

## 5. Proposed relational database schema

Identifiers should be opaque UUIDs; preserve original prototype IDs through an explicit legacy-ID mapping during migration. Use timezone-aware server timestamps, enum/check constraints, explicit retention rules and foreign keys with restrictive deletion for historical research. JSONB is for bounded event metadata, not whole mutable projects/users. No institution tenant layer is needed for the confirmed single-university scope.

### Identity and access

- **users**: id, verified email, display name, status, approved_by/at, department_id, created_at, updated_at, revision.
- **external_identities**: id, user_id, issuer, subject, verified_email, hosted_domain; unique `(issuer, subject)`. Institutional email uniqueness/alias policy is separate from external subject identity.
- **sessions**: id, user_id, token_hash, issued_at, expires_at, last_seen_at, revoked_at, authorization_revision. Never store raw bearer tokens.
- **roles / permissions / role_permissions**: named capabilities with default matrices preserving approved authority.
- **role_assignments**: user_id, role_id, optional department scope, effective/revoked timestamps, granted_by. Granular exceptions must be explicit, audited and deny-by-default; capability changes do not bypass document scope.
- **account_decisions**: applicant, deciding actor, status transition, assigned scope, reason and timestamp.
- **departments / programs / faculty_profiles**: directory keys and validated contact data. Historical department/owner changes must not silently rewrite project ownership or prior event attribution.

### Projects and versioned workflow

- **research_types**: stable unique code and exact label for the five supplied categories.
- **projects**: id, title, abstract, type_id, owner_id, department_id, program_id, academic_year_id, lifecycle_status, current_project_phase_id, confidentiality policy/classification, revision, created_at, completed_at, archived_at.
- **academic_years**: label and approved start/end dates; do not mistake a numeric calendar year for an institutional academic-year definition.
- **project_members / review_assignments**: explicit participation/review scope if approved; no implicit guest access or new review role is activated by creating these tables.
- **checklist_templates / checklist_template_versions**: standard/personally funded variant, source/approval metadata, immutable published versions.
- **template_phases / template_requirements**: exact supplied wording, stable source keys, ordering, conditional rules and hierarchy. Monitoring/evaluation is modeled separately from the three sequential phase gates.
- **project_phases / project_requirements**: per-project snapshot of the chosen published template version, applicability decisions, state/revision and active document version reference. New template versions do not retroactively change an active project's obligations.
- **applicability_decisions**: requirement, actor, reason, applicable flag, timestamp and superseded decision linkage.
- **phase_transitions / monitoring_events**: immutable actor-attributed signed/reasoned decisions, from/to phase, expected revision, timestamps and idempotency linkage. Monitoring remains available across the lifecycle.

### Evidence and signed decisions

- **upload_sessions**: id, project_requirement_id, uploader_id, unique object key, expected size/hash, expiry, processing state, scoped idempotency key and request fingerprint.
- **document_versions**: id, project_requirement_id, version_number, uploader_id, on_behalf_of_id, staff reason, object key/version ID, size, media type, content hash, storage/scan state, active/superseded state and submitted_at. Unique `(project_requirement_id, version_number)`.
- **document_reviews**: id, document_version_id, reviewer_id, decision, immutable feedback, signature_attestation_id and reviewed_at. One final review per submitted version under the current correction model; any formal reopening uses a distinct recorded amendment procedure.
- **signature_attestations**: actor ID, server timestamp, authenticated-session context, statement/purpose, object/content hash and optional recent-authentication reference. Not automatically a legal certified digital signature.
- **scan_results / document_amendments**: scanner evidence/version/hash and formal correction records preserving original evidence and affected decisions.
- **idempotency_records**: actor, command scope, key, request hash, committed resource/result reference and expiry; unique `(actor_id, command_scope, key)`. Command transactions handle concurrent duplicates consistently.

Storage scan state, review decision and version supersession are independent dimensions. A superseded version retains its original Approved/Rejected review; a quarantined PDF never becomes reviewable just because bytes arrived.

### Communications, reporting and governance

- **domain_events / outbox_events**: event ID, aggregate ID/revision, minimal payload and dispatch state, committed with the command.
- **notifications**: recipient, event reference, target reference, read timestamp and actionable status. Return authorized projections, not permanently cached confidential message text after access revocation.
- **notification_deliveries**: recipient/channel, event/dedup key, attempts, next retry, provider ID, delivery status/errors. Reauthorize before delivery.
- **announcements / announcement_revisions / announcement_audiences / announcement_attachments**: immutable prior content, publication/schedule/deadline/expiration, safe rich content and separately scanned attachments.
- **report_jobs / report_artifacts**: requester, report/filter snapshot, authorization context, processing state, private artifact and expiry. Reauthorize both job execution and artifact download; record generation versus download separately.
- **audit_events**: actor ID and role/scope snapshot, action, typed target, request/command/event ID, justified before/after metadata, server timestamp. Runtime role cannot update/delete these rows; privileged database changes require separate operational audit.
- **branding_settings / system_settings**: only approved, typed configurable values. Secrets live in a secrets service, never these tables or the frontend.

### Database-enforced invariants

1. Foreign-key and compatible-scope checks for project owner, department and academic program; a valid enum alone is insufficient.
2. At most one ongoing study per owner under the current restriction, enforced by a partial unique index rather than a preflight query alone. Any change to the restriction requires a separate policy decision.
3. Unique identities, active version numbers, idempotency scopes and permitted final review events.
4. Conditional applicability requires a reason and an authorized actor; mandatory requirements cannot be waived.
5. Review/advance commands lock the project/current phase and relevant requirement/version state, then recheck authority, scan status and completeness inside the transaction. All competing requirement edits follow the same lock order.
6. Advancement requires the expected current phase and revision, so a retried request cannot advance the next phase. Audit, transition and outbox events commit atomically with state.
7. Approved evidence is append-only; an amendment never overwrites an object or deletes a signed decision.
8. Runtime roles cannot mutate immutable decision/audit rows. Migration/admin DB credentials are separate from the application role.

## 6. API and client-state architecture

Keep REST; GraphQL is unnecessary. Existing routes can temporarily adapt to `/api/v1` services so each screen migrates independently.

### Read endpoints

- `GET /api/v1/me`, own account status and minimal authorized bootstrap.
- Cursor-paginated `projects`, `documents`, `notifications`, `audit-events`, faculty and directory records with allowlisted sort/filter fields.
- Project detail and checklist timeline endpoints; scoped dashboard aggregates.
- Report preview endpoint returning the canonical authorized dataset and snapshot/version metadata used by exports.
- Protected document content endpoint streaming a permitted clean version with supported byte ranges.

### Commands

- OIDC login/callback/logout and session revocation; no production identity-picker endpoint.
- Account approval/status changes; role grants/revocations and privileged changes with audited reasons.
- Project creation/update, upload initiation/finalization and explicit applicability decisions.
- Version review decisions, expected-phase transitions and approved amendment/reopening procedures.
- Notification read actions, announcement draft/publish/schedule/archive and report-job creation.

Validate body, path, query and environment with strict shared schemas. Return typed success payloads and consistent errors: stable code, safe message, field errors if appropriate, request ID. Use 401 for unauthenticated, 403/404 under the approved concealment policy, 409 for stale state/conflicts, 413/415 for rejected uploads and 429 for limits. Retry only safe/idempotent operations; include `Retry-After` where appropriate.

Authorization applies to every query and field projection, not only routes or menu visibility. Never trust client-supplied roles, document states, actor names or cached approval flags. Recheck account/scope after long-running boundaries and before irreversible external work. A committed review remains committed if email later fails.

The web keeps existing UI and feature flow. Extract presentation from transport/domain logic gradually; introduce identity-keyed server state, URL routes, per-feature loading/error/empty handling and a central authentication boundary. No redesign, invented brand assets or layout replacement is proposed.

## 7. Data migration and cutover principles

- Preserve a reviewed source baseline plus a coordinated SQLite/PDF backup before any transformation. Inventory record counts, checklist keys, document hashes, synthetic flags, actors and orphan references.
- Decide explicitly whether any non-synthetic prototype data is legitimate production material. Exclude synthetic users/projects/PDFs, demo sessions and fake approval attestations by default. Do not convert demo names into Google identities or certified reviews.
- Use explicit typed legacy-ID maps; preserve documentary ordering, repeated source labels, signed history and prior versions for approved eligible records.
- Dry-run import into isolated PostgreSQL/object storage; fail/report inconsistent ownership, unsupported status values, missing files or catalog mismatches instead of silently repairing them.
- Pin a checklist version for each imported project. Importing the official personally funded variant is not permission to erase historical obligations or pretend the prototype variant was official.
- Avoid ongoing dual-write complexity. Use a short announced write freeze for the final validated import, reconcile counts/hashes and then cut over. Retain the old app/database read-only for the approved rollback window.
- Before new writes, rollback may restore the old snapshot. After production writes, never simply point traffic at stale SQLite; use a reconciled reverse migration or forward fix with a new write freeze and institution-approved recovery plan. Restoring to a point in time can lose legitimate later writes and must be an explicit incident decision.

## 8. Approval-gated migration milestones

Each milestone is a separate bounded change: implementation, tests, review and approval before proceeding. No production exposure during intermediate milestones.

### Milestone 1 — Safety baseline and typed seams

**Change:** establish reviewed baseline/version control and CI; add regression tests for identity-switch clearing, notification reassignment, refresh-after-commit errors and report-owner consistency; introduce TypeScript/shared Zod contracts and modular seams in a narrow slice; disable demo authentication/seeding in production configurations and fail closed. Preserve UI and require a single-writer prototype until database commands are migrated.

**Pass gate:** current 12 domain/report and 6 browser flows remain covered; new privacy/refresh tests pass; typecheck, lint, build and isolated CI pass; a production-config smoke test cannot expose the demo picker or synthetic seed. No claim that the app is yet ready for real users.

**Rollback:** restore the code baseline; no destructive data change.

### Milestone 2 — PostgreSQL model and migration rehearsal

**Change:** implement normalized schema and reviewed migrations; replace snapshot persistence through a tested repository/service adapter; pin checklist versions; targeted scoped queries, indexes, concurrency revisions, uniqueness and explicit command transactions; build import/reconciliation tools without automatically promoting fixtures.

**Pass gate:** old business scenarios pass on PostgreSQL; two independent API processes cannot lose updates, undo suspension, double-review/advance, or create competing ongoing projects; migration counts/references/checksums and interrupted-import recovery pass. A database restore rehearsal succeeds.

**Rollback:** use the preserved pre-cutover data/source baseline while still nonproduction; review any irreversible migration separately. Do not claim every SQL migration has a lossless down step.

### Milestone 3 — Real identity, approval and authorization

**Change:** real institutional Google OIDC, Pending account onboarding and admin approval; hashed secure sessions, trusted ingress, CSRF/rate limits, privilege reauthentication policy and scoped authorization service; notification projection reauthorization and client identity/cache reset; no demo routes in production.

**Pass gate:** wrong issuer/audience/domain, expired/replayed login and unapproved accounts fail; external email suffix spoofing does not pass; suspended sessions lose access; cross-department/document/export/job access is denied; Director still cannot administer accounts or review; all four approved roles pass positive/negative tests.

**Rollback:** staging rollback only while preserving external subject identity mappings. Never reenable demo login as a production fallback.

### Milestone 4 — Safe evidence and durable research workflow

**Change:** private quarantine/clean object storage, bounded uploads, checksums, scan/finalization jobs, authorized streaming, version/review/phase transactions and idempotent commands; storage reconciliation; formal approved-document amendment flow after RDU signs its semantics.

**Pass gate:** malicious/failed/pending-scan content cannot be previewed or approved; interrupted/duplicate uploads and object-write/DB failures recover without orphan evidence or false approval; concurrent review/resubmit/advance and repeated transition commands remain safe; unchanged PDF hashes and prior signed decisions survive revisions/amendments.

**Rollback:** retain object versions; app rollback must understand all newly persisted processing states. Restore drills reconcile database pointers and object versions together.

### Milestone 5 — Reliable communications and queued work

**Change:** transactional outbox, queue/dead-letter handling, delivery attempts/deduplication, verified email sender/templates and authenticated action links; targeted in-app notifications, complete filters and authoritative pending actions; bounded report/export jobs.

**Pass gate:** simulated provider failure/restart/duplicate job does not lose the originating research decision; retries are bounded/observable; revoked recipients do not receive new private content; email links cannot approve without login; undeliverable mail is visible to authorized operators. Test real sandbox delivery without confidential attachments.

**Rollback:** pause consumers safely; retain outbox records and provider IDs; rollback cannot resend the entire backlog as new events.

### Milestone 6 — Server-driven data, remaining required features and UX parity

**Change:** migrate screen by screen from full bootstrap to paginated scoped queries and consistent reporting datasets; identity-keyed query cache/routes and robust real-data states; finish approved directory/faculty administration, controlled permission assignment, announcement safety/attachments/scheduling, report templates/Excel and required analytics/filters. Preserve UI; any actual visual change needs a separate preview/approval.

**Pass gate:** approved role journeys and deep links work with empty/error/slow/conflicting data and large history; preview/export semantics and former-owner projections match; accessibility/keyboard/mobile regressions pass; optional AI stays advisory and cannot access unauthorized content or change approvals. No automatic third-party LLM data transfer.

**Rollback:** each screen/API slice remains independently deployable behind compatible contracts; preserve old read adapters only until its replacement is verified.

### Milestone 7 — Managed deployment, recovery, pilot and cutover

**Change:** provision isolated environments, private networking/IAM, secrets, HTTPS, monitoring/alerts, readiness, graceful deployment, automated backups/PITR and object retention; staging load/security/restore tests; department pilot, training/UAT and final controlled cutover.

**Proposed operational targets, not promises:** target 99.9% monthly availability, database RPO at most 15 minutes and coordinated recovery RTO at most 4 hours; validate cost and feasibility with university operations. Size a load profile around actual active users, upload sizes and submission peaks; a provisional 50-concurrent-user test is a starting hypothesis, not a capacity commitment. Agree endpoint-specific latency/error budgets before executing load tests.

**Pass gate:** measured load and resource limits meet approved targets; dependency/secret/security scans and independent security assessment pass; a timed full restore succeeds; approved personal-funded checklist, research access/retention/signature policies, branding and UAT are signed off; provider/region/budget and incident ownership are approved. Cutover counts/checksums match, demo paths are absent, and rollback conditions are rehearsed.

**Rollback:** use the explicit freeze/reconcile procedure above, not traffic switching to an out-of-date database.

## 9. Decisions still required before production

These need not block Phase-1 analysis or Milestone 1, but they block relevant production acceptance gates:

- Approved Google Workspace hosted-domain values, OAuth project ownership and first-admin/bootstrap procedure.
- Cloud/provider, region/data residency, procurement/budget, backup retention and incident-response ownership.
- Confidentiality/access after department transfer, delegated access, coauthors/external collaborators, and per-user exception policy.
- Official personally funded checklist, conditional applicability rules, checklist change/version policy and whether source grouping-checkbox lines require standalone evidence versus aggregation. Preserve the supplied prototype interpretation until RDU explicitly approves a change.
- Semantics of reopening approved evidence, consequences for already advanced phases and applicable signature assurance/legal policy.
- Official brand assets and institutional report templates; full release-required feature list versus optional enhancements.
- Approved workload, document quotas, retention/deletion/legal holds, availability/recovery targets and university privacy/security review.

## 10. External references checked

- Google OpenID Connect: stable `sub`, validated hosted-domain `hd`, token validation, state and nonce: https://developers.google.com/identity/openid-connect/openid-connect
- Google server token verification: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- OWASP File Upload Cheat Sheet: private storage, layered validation, antivirus/sandbox and PDF content handling: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

**Next action:** review this Phase 1 and approve or revise Milestone 1. Approval to analyze is not approval to implement the remaining milestones or deploy anything.
