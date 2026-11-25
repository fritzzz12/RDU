# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
User-approved: React frontend, Node.js server, SQLite persistence, local npm execution.

## Users
BukSU RDU Super Admin, Research Director, Department Heads, and faculty researchers. Heads review within their department; Director monitors university-wide without account administration or review privileges.

## Product Purpose
An interactive full-system prototype for submitting, reviewing, tracking, reporting on, and archiving university research.

## Operating Context
The base is RDU-System.md; RDMS_System_Modifications_and_Improvements (1).md overrides conflicts. RDU-CHECKLIST.jpg supplies exact checklist wording. All demo people and research records are synthetic.

## Capabilities and Constraints
All five user-specified research categories. Real local persistence, authorized PDF uploads, immutable document versions and decisions, signed review and submission, approval-gated phases, role dashboards, accounts, notifications, announcements, reports, audit history. Personally funded research uses an explicitly provisional copy of the supplied checklist until its official variant is provided. Monitoring and evaluation are cross-cutting.
Google identity and email require credentials; demo access and email outbox must be labeled, never presented as live integrations. AI is advisory and may not approve documents or phases.

## Brand Commitments
RDMS system identity; official BukSU/RDU assets, fonts, and color values have not been supplied. Prototype styling must not be represented as official branding.

## Evidence on Hand
The three supplied source files. No existing code or production data; no official logo, personally funded checklist, Google credentials, or SMTP credentials.

## Accessibility & Inclusion
Beginner-friendly responsive web interface with everyday navigation/action labels, 16–18px standard working text, supporting text no smaller than 14px, generous line height, high contrast and 44–48px or larger interactive targets. Records reflow without horizontal scrolling, and all data fields remain available. Forms identify required/optional fields and sensitive submissions show an editable review summary before explicit final confirmation. Keyboard-operable dialogs/navigation protect unsaved entries and restore focus. Official checklist wording, roles, stored statuses and API contracts remain intact.
