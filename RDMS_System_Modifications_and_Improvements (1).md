# RDMS — Research and Development Management System
## Full System Modifications and Improvements Specification

**Client:** Research and Development Unit (RDU), Bukidnon State University (BukSU)  
**Document type:** System Modification Specification / Development Guide  
**Status:** Proposed — subject to RDU policy and branding approval  
**Version:** 1.0  
**Prepared:** November 12, 2026

> **Implementation principle:** Improve the existing application. Preserve current research records, working features, research lifecycle phases, and the two documentary requirement checklist types (standard and personally funded research). Do not rebuild the system without a demonstrated technical need.

---

## 1. Project Overview

**Proposed formal name:** Research and Development Management System (RDMS), pending client confirmation.

RDMS is a centralized, web-based platform for managing, monitoring, reviewing, tracking, reporting on, and archiving university research. These modifications introduce Google Single Sign-On (SSO), supervised account approval, expanded access roles, email and in-app notifications, improved document review and resubmission, manual staff uploads, analytics, report exports, announcements, and institutional branding.

### 1.1 Objectives

1. Streamline authenticated access and account approval.
2. Establish explicit, backend-enforced role and document permissions.
3. Notify users about research tasks requiring action.
4. Support transparent, versioned PDF evaluation and correction.
5. Preserve mandatory documentary requirements before phase advancement.
6. Provide meaningful university-wide and department-level reporting.
7. Support authorized announcements and calls for papers.
8. Apply official BukSU and RDU branding when assets are supplied.
9. Preserve secure activity history, data integrity, and existing functionality.

### 1.2 Scope

**In scope:** Application user interface, backend APIs/services, database schema and migrations, file storage and metadata, notifications, reporting, permission checks, integration configuration, and regression testing.

**Out of scope until approved:** Invented institutional color codes/fonts, unprovided logos, changes to official research phase names, implicit authority to view confidential research, automated AI approval, and automatic production deployment without configuration and testing.

---

## 2. Roles and Access Control

### 2.1 Primary Roles

| Role | Responsibility |
| --- | --- |
| **Super Admin** | System configuration, user and role administration, authorized research oversight |
| **Research Director** | University-wide research monitoring, analytics, reports, authorized review and announcements, without account/security administration |
| **Department Head** | Monitor and evaluate research in an assigned department or other explicitly delegated scope |
| **Researcher / Instructor** | Submit and track own research, upload requirements, address corrections |
| **Reviewer (optional)** | Evaluate explicitly assigned research submissions if this function is separate from Department Head |

### 2.2 Recommended Permission Matrix

**Legend:** `Full` = full authorized administration; `All*` = institution-wide visibility subject to document confidentiality; `Dept` = assigned department; `Own` = own records; `Assigned` = explicitly assigned; `Policy` = requires RDU confirmation; `No` = not authorized.

| Capability | Super Admin | Research Director | Department Head | Researcher | Reviewer (optional) |
| --- | --- | --- | --- | --- | --- |
| Manage user accounts | Full | No | No | No | No |
| Assign roles/permissions | Full | No | No | No | No |
| Change security/system settings | Full | No | No | No | No |
| View research projects | All* | All* | Dept | Own | Assigned |
| View submitted PDFs | All* | All* | Dept/Assigned | Own | Assigned |
| Review/approve PDFs | Policy | Policy | Policy | No | Assigned |
| Approve phase transitions | Policy | Policy | Policy | No | Policy |
| Add staff-side files | Policy | Policy | Policy | No | Policy |
| Submit own requirements | As authorized | As authorized | As authorized | Own | No |
| View dashboards | All* | All* | Dept | Own | Assigned |
| Generate reports | All* | All* | Dept | Own summary | Assigned if permitted |
| Publish announcements | Yes | Yes | Policy | No | No |
| View activity/audit events | All* | Research-related | Dept | Own | Assigned |

**Security rule:** Hiding controls is not permission enforcement. Apply access checks on every backend route, record query, report export, document preview, and file download. Research Director must **not** inherit Super Admin privileges for creating/updating/deleting accounts, resetting passwords, or changing access roles.

---

## 3. Detailed System Modifications

### MOD-001 — Google Single Sign-On and Admin Account Approval

**Priority:** High

**Requirements**

- Add **Continue with Google** using OpenID Connect/OAuth 2.0.
- Validate identity tokens on the server and use the stable Google subject identifier for identity association.
- Register new users with **Pending** status and no protected-system access.
- Record name, verified email, avatar if available, registration time, Google identifier, status, and assigned department/role when approved.
- Notify Super Admin of pending registrations.
- Super Admin may approve, reject, suspend, deactivate, and assign roles/departments.
- Redirect approved users to their authorized dashboards.
- Protect against duplicate identity records and account impersonation.
- Record approval decisions and role changes in audit history.
- If institution-only access is required, validate approved Google Workspace identity rather than assuming the email-domain suffix alone is sufficient.

**Account statuses:** Pending, Active, Rejected, Suspended, Deactivated.

**Workflow:** Google sign-in → account lookup → new account marked Pending → Super Admin review → approve and assign scope or reject → notify user → authorized access only if Active.

**Acceptance criteria:** Pending users cannot load protected endpoints, including by entering URLs directly. Approved accounts receive the correct role and department restrictions.

### MOD-002 — Automated Email Notifications and Action Links

**Priority:** High

Create an event-driven email notification service. Each message must identify the affected research/project, relevant action, recipient, and a **CTA link to the authenticated action page**. CTA links must never approve or reject records without proper authentication and permission checks.

| Event | Recipient | CTA |
| --- | --- | --- |
| New Google registration | Super Admin | Review account |
| Account approved/rejected | Applicant | View account status / Open dashboard |
| Research submitted | Assigned head/reviewer | Review submission |
| Missing document found | Researcher | Upload missing requirement |
| Document needs revision | Researcher | Correct and resubmit |
| Document approved/rejected | Researcher | View review result |
| Checklist complete, ready for phase transition | Authorized approver | Review phase advancement |
| Phase advanced/returned | Researcher | View progress |
| Announcement published | Target users | View announcement |
| Research completed | Researcher/relevant heads | View completed project |

**Technical requirements:** Branded templates, server-side delivery service, queue and retry, delivery status, deduplication/idempotency, valid authenticated URLs, error logs, and appropriate rate limits. Do not email confidential PDF attachments unless explicitly approved.

### MOD-003 — In-App Notification Center and Pending Actions

**Priority:** High

- Header bell with unread count.
- Dropdown of recent notifications.
- Full notification history page.
- Separate **Pending Actions** queue from informative updates.
- Read/unread status and **Mark all as read**.
- Filters for date, type, priority, and action status.
- Direct links to authorized project, document, phase, approval, or announcement pages.
- Pending tasks marked resolved when the underlying action completes or is reassigned.
- Notifications remain in history according to a defined retention policy.
- Deliver notifications only to intended authorized recipients.

**Acceptance criteria:** A researcher cannot view another researcher's private notifications. A task no longer appears as pending after its authoritative underlying review has been completed.

### MOD-004 — Official BukSU Branding and Visual Standardization

**Priority:** Medium

- Apply **client-approved** BukSU colors and fonts; do not invent values.
- Standardize cards, navigation, tables, forms, modal dialogs, buttons, icons, messages, and status badges.
- Ensure responsive layout and accessible contrast/keyboard navigation.
- Apply consistent branding across login, dashboards, generated reports, email templates, and news.
- Centralize brand values in design tokens/configuration.

**Dependency:** The client must provide official brand assets and usage guidance.

### MOD-005 — RDU Logo, Favicon, and System Identity

**Priority:** Medium

- Display the approved RDU logo on authentication pages and applicable navigation/header areas.
- Set optimized RDU logo/favicon assets.
- Use the approved full name and abbreviation: **Research and Development Management System (RDMS)**, subject to client confirmation.
- Standardize browser titles, report headers, and system email identity.
- Store asset references in a maintainable configuration rather than embedding separate copies throughout the codebase.

### MOD-006 — Role-Based Dashboard Analytics

**Priority:** High

Create reliable database-driven dashboards for Super Admin, Research Director, Department Head, and Researcher.

**Recommended metrics and visualizations:**

1. Total, ongoing, completed, pending-review, and archived research counts.
2. Research project counts by department.
3. Research counts by lifecycle phase.
4. Monthly/quarterly/yearly submission trends.
5. Research completion trends and completion rates.
6. Pending evaluations and overdue actions, if due dates exist.
7. Complete, missing, returned, and rejected documentary requirements.
8. Faculty research productivity and participation.
9. Review turnaround time.

**Filters:** Academic year, date range, department, phase, status, and researcher (where authorized).

**Role-specific views:**

- **Super Admin:** University-wide operational overview including pending account approvals.
- **Research Director:** University-wide research and department comparison analytics, research decisions, compliance, pending reviews.
- **Department Head:** Assigned department projects, review tasks, compliance, and faculty progress.
- **Researcher:** Own research, requirements, progress, feedback, and outstanding actions.

**Data quality:** Every chart and summary card must use consistent status definitions and enforce server-side scoping. Do not use mock data in production.

### MOD-007 — Research Director Role

**Priority:** High

- Create a dedicated Research Director role with institution-wide research oversight.
- Give access to authorized research records, filtered university-wide dashboards, documents, exports, and research-related audit events.
- Permit announcements and any specifically delegated review/phase approvals.
- Prohibit account management, password resets, role assignment, and security settings.
- Separate `research.view_all`, `research.review`, `phase.approve`, `reports.export_all`, and `announcements.publish` from administrative user/security capabilities.

**Acceptance criteria:** Research Director cannot access account-creation/update/deletion endpoints even by direct API request.

### MOD-008 — News and Calls for Papers

**Priority:** Medium

Create **News & Announcements** with:

- Create, edit, preview, publish/unpublish, schedule (if supported), and archive.
- Rich-text editor supporting headings, paragraphs, lists, safe links, and images.
- Authorized graphic and document attachment uploads.
- Categories: Call for Papers, Research Opportunities, Events, Deadlines, General Announcements.
- Publish date, optional application deadline, and optional expiration date.
- Target audiences by department and/or role.
- Dashboard previews and detail pages.
- Notifications for newly published relevant announcements.
- Author attribution, revision history, and publish authority checks.

**Security:** Sanitize HTML and safely handle uploads; do not accept arbitrary executable markup.

### MOD-009 — PDF Viewer, Access Control, and Review

**Priority:** High

**Client question:** Who can view submitted PDFs for checking?

**Proposed policy:** Researchers view their own documents; Department Heads view authorized department/assigned documents; Research Directors view institution-wide documents subject to confidentiality rules; Super Admin accesses documents only within administrative authorization; optional Reviewers see specifically assigned submissions.

**Features:** Embedded authenticated PDF viewer, page navigation, zoom, authorized downloads, metadata, reviewer feedback, approve/reject/request revision, review timestamps, and audit trail.

**Document review statuses:** Pending Review, Approved, Needs Revision, Rejected, Superseded.

**Acceptance criteria:** Protected documents cannot be accessed through guessed file URLs, direct storage links, or unauthorized download endpoints.

### MOD-010 — Incorrect PDF Replacement and Versioned Resubmission

**Priority:** High

**Client question:** Can a researcher upload again if a PDF attachment is incorrect?

**Proposed answer:** Yes, via an auditable revision process.

**Workflow:**

1. Reviewer opens submitted PDF.
2. Reviewer chooses **Request Revision**, specifying the issue and required corrections.
3. Document status becomes **Needs Revision**.
4. Researcher receives email and in-app feedback.
5. Researcher uploads corrected PDF to the same requirement.
6. New document version created; prior version retained and marked **Superseded**.
7. New version enters **Pending Review**.
8. Reviewer approves or requests another revision.
9. Requirement becomes **Approved/Complete** only after successful review.

**Safeguards:** File type and size checks, malware scanning where possible, version history, immutable reviewer comments, no silent replacement of approved documents, and controlled reopening/amendment for previously approved submissions.

### MOD-011 — Report Generation and Export

**Priority:** High

| Report | Suggested contents |
| --- | --- |
| Research Inventory | Titles, researchers, department, dates, current status |
| Research Progress | Current phase, milestones, pending requirements |
| Completed Research | Completed projects and completion dates |
| Ongoing Research | Active projects and progress |
| Pending Submissions | Documents awaiting review |
| Missing Requirements | Incomplete items grouped by project/phase |
| Department Performance | Department counts, completions, trends |
| Faculty Research Profile | Research participation and history per faculty member |
| Research Productivity | Counts/output by person, department, year |
| Research Review | Decisions, revision history, turnaround |
| Research Compliance | Requirement completeness and unresolved issues |
| Research Activity | Submission/review/phase events |
| Research Archive | Archived and completed projects |

**Functions:** Filter by authorized department, academic year, period, researcher, phase, and status; preview reports; export PDF, Excel, or CSV where appropriate; include institutional branding, report timestamp, filters, and identity of generating office; log exports.

**Permissions:** Director/Super Admin see authorized institution-wide reports; Department Head sees department reports; Researcher sees own summaries.

### MOD-012 — Manual Staff-Side Document Upload and Recovery

**Priority:** High

**Client question:** Can heads/admins append files manually, including when a researcher has an upload error?

**Proposed answer:** Yes, for specifically authorized staff, with clear provenance and review safeguards.

**Requirements:**

- Add **Add Document** to authorized project/phase pages.
- Choose target project, phase, requirement/document category.
- Require reason for manual upload or replacement.
- Record uploader, upload time, and whom they acted for.
- Distinguish staff-added attachments from researcher submissions.
- Warn on duplicates; create versions instead of silent overwrite.
- Notify the researcher when relevant.
- Do not automatically mark staff uploads as approved.

| Upload error | Handling |
| --- | --- |
| Network interruption | Safe retry without duplicate records |
| Oversized file | Clear file limit error |
| Unsupported type | Reject and list accepted types |
| Duplicate file | Warn and offer authorized versioning |
| Wrong project attachment | Audited reassignment/correction process |
| Partial transfer | Keep unsubmitted; avoid corrupt records |
| Wrong approved attachment | Formal replacement/amendment workflow |

### MOD-013 — Existing Phase Checklists and Authorized Advancement

**Priority:** High

Preserve current **approved phase names** and both documentary checklist variants: **Standard Research** and **Personally Funded Research**.

- Show full research phase timeline with descriptive names.
- Display each phase's mandatory documentary requirements.
- Show each item as Missing, Submitted, Under Review, Approved, or Needs Revision, as appropriate.
- Block advancement while any mandatory requirement is missing, under review, rejected, or not approved.
- Once all required items pass, mark phase **Ready for Advancement**.
- Notify the assigned approver.
- Provide authorized **Review and Advance Phase** action.
- Recheck the checklist on the server immediately before approval.
- Log the authorized transition and notify the researcher.

**Important:** Upload completion is not equivalent to requirement approval. Avoid race conditions or unapproved advances triggered by frontend state alone.

### MOD-014 — Research Activity, Decision, and Audit History

**Priority:** High

Create time-ordered records of creation, submissions, replacements, reviews, checklist state changes, staff uploads, phase movements, publication actions, and administrative changes.

Record actor identity, action, affected entity, time, old/new state where justified, and decision reason. Preserve critical review and approval events without allowing ordinary users to edit/delete history.

### MOD-015 — AI Research Assistant Improvements

**Priority:** Later enhancement

- Search and summarize authorized stored research data.
- Answer status, phase, and outstanding-requirement questions.
- Explain reviewer feedback and correction tasks.
- Retrieve faculty research participation according to permissions.
- Assist with PDF information extraction and possible checklist issue detection.

**Non-negotiable controls:** AI output is advisory, may be incomplete, and **must not** independently verify document authenticity, approve submissions, access unauthorized records, or advance phases.

---

## 4. Recommended Navigation

### Shared/Relevant Modules

- Dashboard
- Notifications
- Pending Actions
- Research Projects
- Document Submissions
- Review & Approvals
- Research Archive
- Faculty Research Profiles
- Reports & Analytics
- News & Announcements
- AI Research Assistant

### Super Admin Only

- User Management
- Roles & Permissions
- Administrative Audit Logs
- System Settings

Display menus based on permission and continue enforcing all permissions server-side.

---

## 5. Database and Data Model Updates

**Approach:** Inspect existing schema, extend tables when possible, avoid duplicate models, preserve existing data, and add migration/rollback scripts.

| Entity | Proposed additions |
| --- | --- |
| `users` | Google subject, verified email, status, approved-by/at, department, timestamps |
| `roles` / `permissions` | Research Director and optional Reviewer; granular permissions |
| `user_role_assignments` | Historical role assignment and approval records |
| `research_projects` | Authorized owner, department, phase, lifecycle type, status |
| `research_documents` | Requirement reference, active version, storage metadata, review status |
| `document_versions` | File versions, prior versions, uploader, reason, timestamp |
| `document_reviews` | Reviewer, status/decision, feedback, review timestamp |
| `research_phases` / `phase_transitions` | Phase state, approval decisions, actor, timestamp |
| `notifications` | Recipient, event, target, read state, pending action resolution |
| `notification_deliveries` | Email state, attempts, errors, idempotency key |
| `announcements` | Content, audience, publication state, schedule, attachments |
| `audit_logs` | Actor, action, entity, change metadata, event time |
| `report_records` | Report type, filters, requester, generation timestamp |
| `branding_settings` | Approved logo/favicons/theme configuration |

**Integrity and security rules:** Foreign keys, unique identity constraints, indexing for common filters, transactional phase transitions, protected file storage, server-side file authorization, secure secrets, backup policy, historical retention, and audit logs for sensitive events.

---

## 6. Core End-to-End Workflows

### 6.1 Account Approval

`Google Sign-In → New Pending Account → Super Admin Review → Role/Department Assignment → Account Activation → Authorized Dashboard`

### 6.2 Document Evaluation and Resubmission

`Researcher Uploads PDF → Pending Review → Reviewer Opens Document → Approved OR Needs Revision → (if revision) Researcher Reuploads New Version → Pending Review → Final Review`

### 6.3 Phase Advancement

`Required Documents Submitted → Each Requirement Reviewed → All Mandatory Requirements Approved → Ready for Advancement → Authorized Approver Confirms → Phase Advanced → Researcher Notified`

### 6.4 Manual Upload Recovery

`Upload Error / Missing Record → Authorized Staff Selects Project + Requirement → Upload with Reason → Version and Audit Record Saved → Required Review Preserved → Researcher Notified`

### 6.5 Announcements

`Authorized Author Drafts → Preview/Sanitize → Publish or Schedule → Show to Target Users → Send Relevant Notification → Archive When Appropriate`

---

## 7. Implementation Roadmap

### Phase 1 — Authentication and Authorization

- [ ] MOD-001 Google SSO and account approval
- [ ] MOD-007 Research Director role
- [ ] Explicit permissions and backend access checks
- [ ] User approval/role change audit events

### Phase 2 — Document Integrity and Phase Workflow

- [ ] MOD-009 Embedded PDF view/review
- [ ] MOD-010 PDF correction and resubmission
- [ ] MOD-012 Manual file upload and recovery
- [ ] MOD-013 Phase requirements/approval gating
- [ ] MOD-014 Activity and review history

### Phase 3 — Notifications and Communication

- [ ] MOD-002 Automated email with secure CTA
- [ ] MOD-003 In-app notification center and pending queue
- [ ] MOD-008 News and calls for papers

### Phase 4 — Analytics and Exports

- [ ] MOD-006 Role-specific dashboards/charts
- [ ] MOD-011 Reports with filters and exports

### Phase 5 — Branding and Quality

- [ ] MOD-004 Official BukSU theme
- [ ] MOD-005 RDU logo, favicon, system name
- [ ] MOD-015 AI Research Assistant improvements
- [ ] Accessibility, performance, security, and regression tests

---

## 8. Functional Acceptance and Regression Tests

- [ ] New Google sign-in creates Pending account and grants no protected access.
- [ ] Admin approval assigns role and department correctly.
- [ ] Rejected/suspended accounts cannot enter protected endpoints.
- [ ] Research Director cannot access user/security administration endpoints.
- [ ] Department Head cannot access out-of-scope research or documents.
- [ ] Researcher can submit and view own documents.
- [ ] Correct reviewer receives submission email/in-app alert.
- [ ] Email CTA opens the authenticated, permission-checked action page.
- [ ] Reviewer can preview PDF and record a decision with feedback.
- [ ] Researcher can resubmit a revision without destroying past file versions.
- [ ] Approved documents cannot be silently replaced.
- [ ] Incomplete/unreviewed checklists block phase advancement on the backend.
- [ ] Phase advancement succeeds only with proper approval and logs.
- [ ] Manual staff upload records provenance and does not auto-approve requirements.
- [ ] Interrupted uploads can retry safely without corrupt or duplicate records.
- [ ] Read/unread notification state works and completed pending actions resolve.
- [ ] Dashboard statistics reflect database records and role filters.
- [ ] Exports include appropriate report fields and do not leak other departments' data.
- [ ] Announcements are sanitized and published only by permitted roles.
- [ ] RDU favicon, approved logo, and fonts/colors render correctly.
- [ ] AI cannot access unauthorized document contents or approve phases.
- [ ] Existing working research features and records remain intact after migrations.

---

## 9. Client Decisions Requiring Confirmation

| Decision | What RDU should confirm |
| --- | --- |
| System identity | Is **RDMS — Research and Development Management System** the official name? |
| Google access | Workspace-only accounts or other explicitly approved Google users? |
| Approval authority | Who reviews documents and approves each research phase? |
| Confidentiality | Which roles may view restricted research PDFs? |
| Resubmissions | Revision limits, deadlines, and handling of already approved attachments |
| Manual uploads | Which staff roles may act on behalf of researchers, for which documents? |
| Lifecycle | Exact approved phase names and both documentary checklists |
| Report outputs | Required formats, official report templates, and statistics definitions |
| News | Who may draft, approve, and publish announcements? |
| Branding | Official colors, fonts, RDU/BukSU logo assets and guidelines |
| Data governance | Document retention, deletion, backup, and audit history policies |

---

## 10. Implementation Instructions for AI Coding Tools / Development Team

Use this specification as the authoritative **proposed change list**, subject to RDU sign-off for policy decisions.

1. **Inspect first:** Analyze current project files, schema, existing roles, routes, services, lifecycle checklists, uploads, notifications, reports, and AI support.
2. **Create gap analysis:** Mark each MOD as Already Implemented / Partial / Missing; identify required files, migrations, dependencies, and risks.
3. **Preserve architecture:** Retain existing technology stack, component conventions, research phase names, checklist variants, and data.
4. **Implement incrementally:** Follow the roadmap; ensure each change includes UI, backend, database, access control, and tests as appropriate.
5. **Do not invent assets or credentials:** List required Google OAuth settings, SMTP/email configuration, and official branding assets rather than fabricating them.
6. **Do not fake integrations:** If credentials are unavailable, implement integration-ready code and accurately document configuration blockers.
7. **Use real data:** All dashboards and reports should come from authorized queries, not sample values.
8. **Validate server-side:** Do not rely solely on browser rules for phase advancement, document access, or role permissions.
9. **Maintain traceability:** Keep version history, actor records, reviewer feedback, and logs.
10. **Report evidence:** Summarize changed files, migration steps, test results, unresolved decisions, and remaining blockers. Never claim a feature is verified without testing.

### Expected Final Engineering Deliverables

- [ ] Updated working application and source code
- [ ] Database migrations, including rollback instructions
- [ ] Updated role/permission matrix
- [ ] Documented research, document revision, and approval workflows
- [ ] Setup instructions for Google SSO and email delivery
- [ ] Report and notification templates
- [ ] Test execution results and regression evidence
- [ ] Configuration and deployment guide
- [ ] Known limitations and outstanding RDU decisions

---

## 11. Summary of the 15 Modifications

| ID | Modification | Priority |
| --- | --- | --- |
| MOD-001 | Google SSO + Admin Account Approval | High |
| MOD-002 | Automated Email Notifications + CTA Links | High |
| MOD-003 | Notification Center + Pending Actions | High |
| MOD-004 | Official BukSU Branding | Medium |
| MOD-005 | RDU Logo, Favicon, and System Identity | Medium |
| MOD-006 | Role-Based Dashboard Charts and Analytics | High |
| MOD-007 | Research Director Role | High |
| MOD-008 | News and Calls for Papers | Medium |
| MOD-009 | PDF Viewer and Evaluation | High |
| MOD-010 | PDF Correction, Replacement, and Versioning | High |
| MOD-011 | Reports and Exports | High |
| MOD-012 | Authorized Manual File Upload | High |
| MOD-013 | Research Phase Checklist/Advancement Integration | High |
| MOD-014 | Activity and Audit History | High |
| MOD-015 | AI Research Assistant Improvements | Later |

**End of specification.**
