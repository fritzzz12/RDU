---
id: rdms-goals
type: goal-and-requirements
title: RDMS prototype requirements
status: draft
---
# RDMS prototype

## Overview
A complete interactive local research management prototype for BukSU RDU, replacing fragmented project and documentary tracking with one role-scoped workspace. Source priority: user requirements, then RDMS_System_Modifications_and_Improvements (1).md, then RDU-System.md. The image is authoritative for documentary wording.

## Target users and jobs
Super Admin manages accounts, permissions and configuration. Research Director monitors university-wide research without user/security administration or review authority. Department Heads review and advance their own department's projects. Researchers submit, sign, and correct their own documents and track feedback.

## Goals and success conditions
A user can submit a project in each of the five specified categories, upload and sign PDFs, receive a signed review, retain prior versions on resubmission, and advance only when all mandatory current-phase items are approved. Reports, notifications and metrics derive from authorized stored data. All modules have working navigation and meaningful interaction.

## Capabilities
Role dashboards; exact documentary checklists; department and program/faculty records; submission, review, revision and staff upload provenance; research archives; account approval/status and scoped role assignments; notification history and pending actions; announcements; filtered reports/CSV and printable PDF; immutable audit trail; advisory research assistant over scoped metadata.

## Research types
Agenda Based Research Project; Curricular Based Research Project; Externally Funded Research Project; Personally Funded Research Project; Equivalent Teaching Research Project (ETL).

## Workflow invariants
Conceptualization, Development, and Implementation are approval-gated sequential phases. Monitoring and Evaluation covers the whole lifecycle, not just a terminal gate. The image repeats E for Publication and Utilization; preserve those labels. Conditional documentary requirements are not silently waived; any applicability exclusion requires a staff reason and audit entry. The personally funded variant is explicitly provisional and shares the supplied checklist by user approval. A researcher cannot initiate another ongoing study while their existing study has an incomplete phase.

## Technology and integration boundary
User-approved React, Node.js and SQLite, with local persistent uploads. Demo identity switching is explicitly nonproduction, uses server-created sessions, and does not simulate successful Google authentication. Google OAuth, SMTP delivery, official branding and official personally funded checklist require supplied configuration. Synthetic data is labeled. No production deployment or production security claim.

## Non-functional requirements
Server-side record and document scoping; input validation; private file storage; immutable signed decisions; accessible responsive layout, clear failures and empty states. Official logos/colors are not fabricated. Styling follows the approved preview and is provisional.
