# Kiempad — EXECUTION_GOALS

> Tweede-generatie doelcatalogus voor continue evolutie na afronding van G001-G243.
> `PRODUCT_BACKLOG.md` blijft de canonieke statuslijst; dit bestand bevat de rijke
> uitvoeringsdetails die nodig zijn om doelen te prioriteren, issues te maken en werk
> autonoom te blijven uitvoeren.

## Actieve Epics

- **Continuous Evolution:** Doelen, issues, roadmapdekking en governance blijven actief en controleerbaar.
- **Onboarding & Daily Use:** Dagelijks gebruik, consultvoorbereiding en rustige invoer worden sneller en menselijker.
- **Reliability & Operations:** Offline werking, back-up, sync, Tailscale en herstel worden aantoonbaar robuuster.
- **AI & Research:** Opt-in AI en researchworkflows worden bruikbaarder zonder de medische of privacygrens te overschrijden.
- **Security & DevEx:** Security, toegankelijkheid, architectuur en ontwikkelkwaliteit blijven meetbaar en onderhoudbaar.

## Future Roadmap Horizon

**F5 — Continuous Personal Fertility Operations.** Kiempad groeit van complete
fertility intelligence naar een duurzaam dagelijks besturingssysteem voor rust,
voorbereiding, herstelbaarheid, lokale automatisering, veilige research en
aantoonbare privacy. Niet-doelen blijven gelijk: geen medisch hulpmiddel, geen
derdenproduct, geen tracking, geen standaard cloud, geen dosering, diagnose of
behandelkeuze.

## Goal Quality Contract

Elk doel hieronder bevat: Goal ID, Problem, Desired Outcome, User Value, Acceptance
Criteria, Priority, Complexity, Related Components en ADR Needed. Doelen zijn
atomair, testbaar, uitvoerbaar en meetbaar.

## Goal Scoring Rubric

Score = prioriteit + complexiteit + epic-modifier. Prioriteit: P0=100, P1=80, P2=60, P3=40. Complexiteit: S=15, M=8, L=0. Epic-modifier: Onboarding & Daily Use=10, Reliability & Operations=9, Security & DevEx=9, Continuous Evolution=8, AI & Research=7. Hoogste score wint; bij gelijke score wordt op prioriteit en daarna Goal ID gesorteerd.

## Goals

### G244 — Goal Expansion Engine

- **Epic:** Continuous Evolution
- **Problem:** Goal catalog is empty after PFIP completion.
- **Desired Outcome:** Create the second-generation execution catalog with at least 100 active goals, 3 epics and a future horizon.
- **User Value:** Kiempad keeps evolving instead of stopping after the initial epic.
- **Acceptance Criteria:** EXECUTION_GOALS.md exists; backlog has 100 open goals after G244; goal schema includes all required fields; GitHub issues are seeded.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Documentation & maintenance
- **ADR Needed:** no
- **Score:** 116
- **Status:** ☑ klaar

### G245 — Backlog Health Dashboard

- **Epic:** Continuous Evolution
- **Problem:** Open goals can drift from GitHub Issues and docs.
- **Desired Outcome:** Add an automated local report that compares backlog, execution catalog and open issues.
- **User Value:** The maintainer sees drift before work starts.
- **Acceptance Criteria:** Report lists missing issue links, duplicate IDs and status mismatches; tests cover parsing; no network is required for local mode.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Docs, tests, GitHub Issues
- **ADR Needed:** no
- **Score:** 116
- **Status:** ☑ klaar

### G246 — Goal Scoring Model

- **Epic:** Continuous Evolution
- **Problem:** Selecting the next goal is subjective.
- **Desired Outcome:** Define a scoring rubric for user value, risk, privacy and implementation effort.
- **User Value:** Highest-value work is easier to choose consistently.
- **Acceptance Criteria:** Rubric is documented; every active goal has score fields; next-goal selection can be reproduced.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs, backlog
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G247 — Goal Template CLI

- **Epic:** Continuous Evolution
- **Problem:** Adding goals manually is slow and error-prone.
- **Desired Outcome:** Create a local script that appends goals with required fields and updates counts.
- **User Value:** Goal expansion stays fast while preserving quality.
- **Acceptance Criteria:** CLI validates ID ordering; rejects missing fields; updates PRODUCT_BACKLOG and EXECUTION_GOALS together.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Scripts, docs
- **ADR Needed:** no
- **Score:** 76
- **Status:** ☐ open

### G248 — Issue Sync Script

- **Epic:** Continuous Evolution
- **Problem:** Creating issues by hand risks omissions.
- **Desired Outcome:** Add a GitHub CLI helper that creates missing issues from active execution goals.
- **User Value:** The remote issue tracker stays aligned with local planning.
- **Acceptance Criteria:** Script supports dry-run; skips existing titles; emits created issue URLs; no secrets are stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Scripts, GitHub CLI
- **ADR Needed:** no
- **Score:** 96
- **Status:** ☐ open

### G249 — Roadmap Coverage Matrix

- **Epic:** Continuous Evolution
- **Problem:** Roadmap coverage is hard to audit after many goals.
- **Desired Outcome:** Map active goals to roadmap phases and vision success criteria.
- **User Value:** Planning stays tied to the product vision.
- **Acceptance Criteria:** Matrix shows goals per phase and success criterion; gaps are highlighted; tests verify all active goals map to a phase.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** ROADMAP, EXECUTION_GOALS
- **ADR Needed:** no
- **Score:** 96
- **Status:** ☐ open

### G250 — Goal Completion Audit Checklist

- **Epic:** Continuous Evolution
- **Problem:** Completion can be claimed from weak evidence.
- **Desired Outcome:** Document a requirement-by-requirement audit checklist for every goal.
- **User Value:** Merged work is easier to trust.
- **Acceptance Criteria:** Checklist covers requirements, evidence, tests, PR state and docs; PR template references it.
- **Priority:** P0
- **Complexity:** S
- **Related Components:** Docs, PR template
- **ADR Needed:** no
- **Score:** 123
- **Status:** ☑ klaar

### G251 — Architecture Decision Backlog

- **Epic:** Continuous Evolution
- **Problem:** Architectural changes may land without ADR follow-up.
- **Desired Outcome:** Track active goals that require ADR review before implementation.
- **User Value:** Important choices stay visible and reversible.
- **Acceptance Criteria:** Execution catalog has ADR-needed marker; docs list pending ADR topics; maintenance test verifies marker values.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** ADR, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G252 — User Workflow Gap Review

- **Epic:** Continuous Evolution
- **Problem:** Workflow gaps are discovered ad hoc.
- **Desired Outcome:** Create a periodic review document for onboarding, daily use, consult prep, backup and recovery.
- **User Value:** User friction is converted into concrete goals.
- **Acceptance Criteria:** Review has workflow sections, gap severity, linked goals and next review date.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Docs, app shell
- **ADR Needed:** no
- **Score:** 96
- **Status:** ☐ open

### G253 — Operational Runbook Refresh

- **Epic:** Continuous Evolution
- **Problem:** Runbook can lag behind Tailscale, CI and backup workflows.
- **Desired Outcome:** Refresh the runbook with current smoke, deploy and recovery commands.
- **User Value:** Operational work is repeatable under stress.
- **Acceptance Criteria:** Runbook includes local dev, CI, Tailscale smoke, backup import and issue triage steps.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** docs/RUNBOOK.md
- **ADR Needed:** no
- **Score:** 83
- **Status:** ☐ open

### G254 — Goal Aging Signals

- **Epic:** Continuous Evolution
- **Problem:** Old goals can remain open without review.
- **Desired Outcome:** Add review cadence metadata and aging indicators to active goals.
- **User Value:** The backlog stays fresh and intentional.
- **Acceptance Criteria:** Goals include review cadence; stale goals are detectable by a local check.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** EXECUTION_GOALS, tests
- **ADR Needed:** no
- **Score:** 83
- **Status:** ☐ open

### G255 — Release Notes Generator

- **Epic:** Continuous Evolution
- **Problem:** Changelog updates are manual and repetitive.
- **Desired Outcome:** Generate draft release notes from completed goals and PR titles.
- **User Value:** Releases become easier to summarize.
- **Acceptance Criteria:** Script groups changes by epic; preserves manual edits; tests cover markdown output.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** CHANGELOG, scripts
- **ADR Needed:** no
- **Score:** 76
- **Status:** ☐ open

### G256 — Goal Dependency Mapping

- **Epic:** Continuous Evolution
- **Problem:** Some goals depend on unbuilt primitives.
- **Desired Outcome:** Represent dependencies between active goals.
- **User Value:** Work can be sequenced with fewer dead ends.
- **Acceptance Criteria:** Each dependent goal lists blockers; validation detects references to unknown IDs.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** EXECUTION_GOALS
- **ADR Needed:** no
- **Score:** 76
- **Status:** ☐ open

### G257 — Autonomy Guardrails Doc

- **Epic:** Continuous Evolution
- **Problem:** Continuous execution needs explicit local-first guardrails.
- **Desired Outcome:** Document what autonomous work may and may not do in Kiempad.
- **User Value:** Velocity increases without violating privacy or medical boundaries.
- **Acceptance Criteria:** Doc covers network, AI, data, GitHub, Tailscale and medical policy constraints.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G258 — Goal Search Index

- **Epic:** Continuous Evolution
- **Problem:** Finding a goal by capability is cumbersome.
- **Desired Outcome:** Add a searchable local index for active and completed goals.
- **User Value:** Planning and audits take less time.
- **Acceptance Criteria:** Index supports ID, epic, component and keyword; no external search service is used.
- **Priority:** P3
- **Complexity:** M
- **Related Components:** Docs, app shell or script
- **ADR Needed:** no
- **Score:** 56
- **Status:** ☐ open

### G259 — Backlog Statistics Test

- **Epic:** Continuous Evolution
- **Problem:** The existing count test does not validate active goal minimums.
- **Desired Outcome:** Extend maintenance tests to require at least 100 open active goals when evolution mode is active.
- **User Value:** The backlog cannot silently run dry.
- **Acceptance Criteria:** Test parses PRODUCT_BACKLOG and EXECUTION_GOALS; fails below 100 active goals.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, PRODUCT_BACKLOG
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G260 — Vision Traceability Tags

- **Epic:** Continuous Evolution
- **Problem:** Goals may lose traceability to vision success criteria.
- **Desired Outcome:** Add explicit vision tags to every active goal.
- **User Value:** Every goal has a clear reason to exist.
- **Acceptance Criteria:** All active goals list one or more vision criteria; tests reject empty tags.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** EXECUTION_GOALS, VISIE
- **ADR Needed:** no
- **Score:** 83
- **Status:** ☐ open

### G261 — Next Horizon Roadmap

- **Epic:** Continuous Evolution
- **Problem:** The roadmap has no explicit post-PFIP horizon.
- **Desired Outcome:** Add a future horizon for continuous personal fertility operations.
- **User Value:** Longer-term work has direction without becoming a product for others.
- **Acceptance Criteria:** Roadmap includes horizon theme, milestones, non-goals and linked active epics.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** ROADMAP, EXECUTION_GOALS
- **ADR Needed:** no
- **Score:** 96
- **Status:** ☐ open

### G262 — Issue Label Taxonomy

- **Epic:** Continuous Evolution
- **Problem:** Issue labels may become inconsistent as goals grow.
- **Desired Outcome:** Define labels for epic, priority, complexity, risk and component.
- **User Value:** Issue triage becomes easier.
- **Acceptance Criteria:** Taxonomy is documented; issue sync helper can apply labels when available.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** GitHub Issues, docs
- **ADR Needed:** no
- **Score:** 83
- **Status:** ☐ open

### G263 — Monthly Goal Review Ritual

- **Epic:** Continuous Evolution
- **Problem:** There is no repeatable cadence for pruning or replacing goals.
- **Desired Outcome:** Document a monthly local review ritual for completed, stale and new goals.
- **User Value:** The catalog remains useful over time.
- **Acceptance Criteria:** Ritual includes inputs, decisions, outputs and required doc updates.
- **Priority:** P3
- **Complexity:** S
- **Related Components:** Docs
- **ADR Needed:** no
- **Score:** 63
- **Status:** ☐ open

### G264 — First Run Guided Setup

- **Epic:** Onboarding & Daily Use
- **Problem:** First use can feel like an empty technical shell.
- **Desired Outcome:** Guide through vault creation, privacy boundary, first traject, first afspraak and backup reminder.
- **User Value:** Peter and partner can start safely without reading docs first.
- **Acceptance Criteria:** Setup appears only before first data; steps are skippable; no data leaves device; tests cover completed setup state.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** App shell, vault, settings
- **ADR Needed:** no
- **Score:** 118
- **Status:** ☑ klaar

### G265 — Daily Command Center

- **Epic:** Onboarding & Daily Use
- **Problem:** Daily tasks are spread across screens.
- **Desired Outcome:** Create a single start view for today: appointments, medication, questions, reminders and context.
- **User Value:** The app becomes useful in the first minute each day.
- **Acceptance Criteria:** Today view groups tasks by urgency; shows empty states; never generates medical advice.
- **Priority:** P0
- **Complexity:** L
- **Related Components:** Start screen, agenda, medication, questions
- **ADR Needed:** no
- **Score:** 110
- **Status:** ☑ klaar

### G266 — Partner Handoff Mode

- **Epic:** Onboarding & Daily Use
- **Problem:** Shared use lacks a lightweight handoff summary.
- **Desired Outcome:** Show a local handoff summary for what changed since last check-in.
- **User Value:** Both partners stay aligned without messaging sensitive data.
- **Acceptance Criteria:** Summary includes new records, upcoming items and unanswered questions; local only.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Settings, start screen
- **ADR Needed:** yes
- **Score:** 98
- **Status:** ☐ open

### G267 — Consult Prep Wizard

- **Epic:** Onboarding & Daily Use
- **Problem:** Consult preparation requires manually visiting multiple screens.
- **Desired Outcome:** Create a guided consult prep flow that gathers questions, timeline highlights and exports.
- **User Value:** Consults become calmer and better prepared.
- **Acceptance Criteria:** Wizard creates a local prep packet; user can edit questions; no diagnosis or treatment advice.
- **Priority:** P0
- **Complexity:** L
- **Related Components:** Questions, timeline, graph, export
- **ADR Needed:** no
- **Score:** 110
- **Status:** ☑ klaar

### G268 — After Consult Capture Flow

- **Epic:** Onboarding & Daily Use
- **Problem:** After a consult, notes and actions can be scattered.
- **Desired Outcome:** Offer a quick post-consult flow for summary, answered questions and action points.
- **User Value:** Important outcomes are captured while fresh.
- **Acceptance Criteria:** Flow links to appointment; supports unanswered carry-over; stores records encrypted.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Consult records, questions, actions
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G269 — Medication Day Timeline

- **Epic:** Onboarding & Daily Use
- **Problem:** Medication events are list-based rather than day-timeline based.
- **Desired Outcome:** Show a compact day timeline of planned, taken and missed medication events.
- **User Value:** Timing becomes easier to scan.
- **Acceptance Criteria:** Timeline uses prescribed text only; no dosing inference; keyboard accessible.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Medication, reminders
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G270 — Question Inbox Zero

- **Epic:** Onboarding & Daily Use
- **Problem:** Open questions can accumulate without triage.
- **Desired Outcome:** Add triage states: nieuw, meenemen, beantwoord, parkeren.
- **User Value:** The question list stays actionable.
- **Acceptance Criteria:** States are local; filters exist; answered state keeps answer text and date.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Questions
- **ADR Needed:** no
- **Score:** 85
- **Status:** ☐ open

### G271 — Timeline Quick Add

- **Epic:** Onboarding & Daily Use
- **Problem:** Adding timeline context requires choosing the right screen first.
- **Desired Outcome:** Allow quick add from the timeline for note, question, document or appointment.
- **User Value:** Context can be captured at the moment it appears.
- **Acceptance Criteria:** Quick add routes to existing stores; defaults are safe; no duplicate storage model.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Timeline, quick entry
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G272 — Dossier Import Checklist

- **Epic:** Onboarding & Daily Use
- **Problem:** Historical uploads can feel overwhelming.
- **Desired Outcome:** Provide a checklist for importing past labs, scans, consults and embryo reports.
- **User Value:** The historical dossier becomes complete step by step.
- **Acceptance Criteria:** Checklist progress is local; links to upload profiles; no file content leaves device.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Dossier, onboarding
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G273 — Empty State Action Shortcuts

- **Epic:** Onboarding & Daily Use
- **Problem:** Some empty states explain but do not help act.
- **Desired Outcome:** Add direct action buttons to important empty states.
- **User Value:** New users can move forward faster.
- **Acceptance Criteria:** Shortcuts exist for traject, afspraak, medicatie, vraag, dossier and backup empty states.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** App shell UX
- **ADR Needed:** no
- **Score:** 85
- **Status:** ☐ open

### G274 — Gentle Reminder Review

- **Epic:** Onboarding & Daily Use
- **Problem:** Reminder text may feel technical or repetitive.
- **Desired Outcome:** Review reminder wording for calm, clear Dutch language.
- **User Value:** Notifications support without increasing stress.
- **Acceptance Criteria:** Copy remains generic on lock screen; tests keep privacy boundary intact.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Notifications, UX copy
- **ADR Needed:** no
- **Score:** 85
- **Status:** ☐ open

### G275 — Weekly Review Screen

- **Epic:** Onboarding & Daily Use
- **Problem:** There is no weekly reflection workflow.
- **Desired Outcome:** Add a local weekly review of upcoming appointments, open questions, costs and backups.
- **User Value:** The couple can reset context once per week.
- **Acceptance Criteria:** Review is factual; has print/export option; no scoring or judgment.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Agenda, timeline, costs, wellbeing
- **ADR Needed:** no
- **Score:** 78
- **Status:** ☐ open

### G276 — Stress-Light Mode

- **Epic:** Onboarding & Daily Use
- **Problem:** Some days need less detail on screen.
- **Desired Outcome:** Add a mode that reduces dense medical detail on start screen while keeping access available.
- **User Value:** The app remains usable on emotionally heavy days.
- **Acceptance Criteria:** Mode hides detail by default; does not delete data; can be toggled locally.
- **Priority:** P3
- **Complexity:** M
- **Related Components:** Settings, UI
- **ADR Needed:** no
- **Score:** 58
- **Status:** ☐ open

### G277 — Timeline Story Mode

- **Epic:** Onboarding & Daily Use
- **Problem:** The full journey can be hard to understand as records.
- **Desired Outcome:** Offer a narrative, factual story view of the traject.
- **User Value:** The user can understand the journey without reading every record.
- **Acceptance Criteria:** Story cites records; avoids causality and advice; exportable as markdown.
- **Priority:** P3
- **Complexity:** L
- **Related Components:** Timeline, export
- **ADR Needed:** no
- **Score:** 50
- **Status:** ☐ open

### G278 — Cost Entry From Appointment

- **Epic:** Onboarding & Daily Use
- **Problem:** Costs often relate to appointments but entry is separate.
- **Desired Outcome:** Allow adding a cost item from an appointment context.
- **User Value:** Cost tracking becomes less manual.
- **Acceptance Criteria:** Cost item links to appointment and traject; financial disclaimer remains visible.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Agenda, costs
- **ADR Needed:** no
- **Score:** 85
- **Status:** ☐ open

### G279 — Backup Nudge Personalization

- **Epic:** Onboarding & Daily Use
- **Problem:** Backup reminders are generic.
- **Desired Outcome:** Let the user choose backup reminder cadence locally.
- **User Value:** Backups fit the couple’s routine.
- **Acceptance Criteria:** Cadence stored encrypted; missing backup warning still appears; defaults remain privacy-safe.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Backup, settings
- **ADR Needed:** no
- **Score:** 85
- **Status:** ☐ open

### G280 — Search Everywhere

- **Epic:** Onboarding & Daily Use
- **Problem:** Search is split by screen.
- **Desired Outcome:** Create a local global search across non-binary decrypted records after unlock.
- **User Value:** Information is easier to retrieve under time pressure.
- **Acceptance Criteria:** Search covers titles, notes, OCR text and questions; local only; snippets avoid base64.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** Dossier, questions, knowledge, timeline
- **ADR Needed:** no
- **Score:** 90
- **Status:** ☐ open

### G281 — Print-Friendly Daily Brief

- **Epic:** Onboarding & Daily Use
- **Problem:** Daily context cannot be shared as a simple sheet.
- **Desired Outcome:** Generate a local print-friendly daily brief.
- **User Value:** Consult or partner prep can happen offline on paper.
- **Acceptance Criteria:** Brief includes today items and questions; excludes secrets; no advice language.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Start screen, export
- **ADR Needed:** no
- **Score:** 78
- **Status:** ☐ open

### G282 — Keyboard-First Data Entry

- **Epic:** Onboarding & Daily Use
- **Problem:** Repeated entry is slower with mouse-heavy forms.
- **Desired Outcome:** Improve keyboard flow and submit behavior in high-use forms.
- **User Value:** Data capture becomes faster.
- **Acceptance Criteria:** Tab order is logical; labels are explicit; tests cover key form IDs.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Forms, accessibility
- **ADR Needed:** no
- **Score:** 78
- **Status:** ☐ open

### G283 — Microcopy Consistency Pass

- **Epic:** Onboarding & Daily Use
- **Problem:** Different screens use slightly different terminology.
- **Desired Outcome:** Standardize Dutch labels for traject, poging, afspraak, dossier and consult.
- **User Value:** The app feels more coherent.
- **Acceptance Criteria:** Terminology glossary exists; key screens use glossary terms; tests cover core labels.
- **Priority:** P3
- **Complexity:** S
- **Related Components:** UI copy
- **ADR Needed:** no
- **Score:** 65
- **Status:** ☐ open

### G284 — Service Worker Update UX

- **Epic:** Reliability & Operations
- **Problem:** Users may run stale app code unknowingly.
- **Desired Outcome:** Show a calm update-available prompt when a new service worker is ready.
- **User Value:** Updates become explicit and less surprising.
- **Acceptance Criteria:** Prompt appears only when update is waiting; reload is user-initiated; tests mock service worker states.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** PWA, service worker
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G285 — Offline Smoke Test Script

- **Epic:** Reliability & Operations
- **Problem:** Offline behavior can regress without a browser smoke.
- **Desired Outcome:** Add a local Playwright smoke for offline load after first visit.
- **User Value:** Local-first promise is verified end to end.
- **Acceptance Criteria:** Smoke installs SW, goes offline, reloads app shell, verifies no network fallback error.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** PWA, tests
- **ADR Needed:** no
- **Score:** 117
- **Status:** ☑ klaar

### G286 — Backup Restore Drill

- **Epic:** Reliability & Operations
- **Problem:** Backups are only useful if restore is practiced.
- **Desired Outcome:** Add a scripted restore drill using memory or test drivers.
- **User Value:** Recovery confidence increases.
- **Acceptance Criteria:** Drill exports, imports, unlocks and verifies representative records.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Backup, tests, runbook
- **ADR Needed:** no
- **Score:** 117
- **Status:** ☑ klaar

### G287 — Tailscale Smoke Automation

- **Epic:** Reliability & Operations
- **Problem:** Tailscale smoke is manual.
- **Desired Outcome:** Automate local and tailnet URL smoke checks with clear diagnostics.
- **User Value:** Deployment regressions are caught quickly.
- **Acceptance Criteria:** Script checks HTTPS URL, cache headers, service worker and app shell marker.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Tailscale, scripts
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G288 — Data Integrity Report

- **Epic:** Reliability & Operations
- **Problem:** Broken links between records are hard to spot.
- **Desired Outcome:** Build a local integrity report for orphaned traject, afspraak, embryo and dossier links.
- **User Value:** The dossier stays trustworthy.
- **Acceptance Criteria:** Report is read-only; lists broken references; offers manual navigation, not auto-repair.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** Storage, domain stores
- **ADR Needed:** no
- **Score:** 89
- **Status:** ☐ open

### G289 — Duplicate Detection

- **Epic:** Reliability & Operations
- **Problem:** Imports can create duplicate records.
- **Desired Outcome:** Detect likely duplicates by title, date, source and file metadata.
- **User Value:** The user can clean up clutter safely.
- **Acceptance Criteria:** Duplicates are suggestions only; no automatic deletion; tests cover false-positive-safe behavior.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Dossier, consults, agenda
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G290 — Import Preview Before Commit

- **Epic:** Reliability & Operations
- **Problem:** Imports may surprise users.
- **Desired Outcome:** Preview incoming records and conflicts before applying import.
- **User Value:** The user stays in control of data changes.
- **Acceptance Criteria:** Preview shows counts and types; apply requires confirmation; encrypted payload remains unreadable until unlocked.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** Backup, sync, dossier
- **ADR Needed:** no
- **Score:** 89
- **Status:** ☐ open

### G291 — Sync Conflict Explanation

- **Epic:** Reliability & Operations
- **Problem:** Last-wins conflict handling is invisible.
- **Desired Outcome:** Show a human-readable sync conflict summary after import.
- **User Value:** Skipped or overwritten records are understandable.
- **Acceptance Criteria:** Summary lists counts by type and timestamp; no sensitive lock-screen leakage.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Sync
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G292 — Performance Budget Test

- **Epic:** Reliability & Operations
- **Problem:** Bundle size can grow unnoticed.
- **Desired Outcome:** Add a budget check for JS/CSS output size.
- **User Value:** The app remains fast on mobile.
- **Acceptance Criteria:** Budget thresholds documented; CI fails on major regression; emergency override documented.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Build, CI
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G293 — Large Dossier Rendering Guard

- **Epic:** Reliability & Operations
- **Problem:** Large historical dossiers may slow rendering.
- **Desired Outcome:** Add pagination or incremental rendering for large dossier/timeline lists.
- **User Value:** The app stays responsive with years of records.
- **Acceptance Criteria:** Tests cover 500+ synthetic records; UI exposes count and paging without losing filters.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Dossier, timeline
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G294 — IndexedDB Quota Warning

- **Epic:** Reliability & Operations
- **Problem:** Users may hit browser storage limits unexpectedly.
- **Desired Outcome:** Estimate local storage usage and warn when high.
- **User Value:** The user can back up before storage trouble.
- **Acceptance Criteria:** Warning is local; explains browser-specific limits; no telemetry.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Storage, backup
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G295 — Error Boundary Screen

- **Epic:** Reliability & Operations
- **Problem:** Runtime render errors can leave a blank screen.
- **Desired Outcome:** Add a friendly local error boundary with recovery actions.
- **User Value:** Failures become recoverable.
- **Acceptance Criteria:** Boundary offers reload, lock, backup docs link; never sends reports automatically.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** App shell
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G296 — Form Draft Persistence

- **Epic:** Reliability & Operations
- **Problem:** Long notes can be lost on navigation.
- **Desired Outcome:** Persist local encrypted drafts for long consult/dossier forms.
- **User Value:** Data entry becomes less fragile.
- **Acceptance Criteria:** Drafts are scoped per form; can be discarded; auto-cleared after save.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Forms, storage
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G297 — Event Log Filters

- **Epic:** Reliability & Operations
- **Problem:** The event log can become noisy.
- **Desired Outcome:** Add filters by category, date and event type.
- **User Value:** Operational history is easier to inspect.
- **Acceptance Criteria:** Filters are local session state; empty state explains no matches.
- **Priority:** P3
- **Complexity:** S
- **Related Components:** Event log
- **ADR Needed:** no
- **Score:** 64
- **Status:** ☐ open

### G298 — Runbook Command Verification

- **Epic:** Reliability & Operations
- **Problem:** Documented commands can drift.
- **Desired Outcome:** Test that key runbook commands exist in package scripts or Makefile.
- **User Value:** Docs stay executable.
- **Acceptance Criteria:** Maintenance test parses command snippets and validates known commands.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** docs/RUNBOOK, tests
- **ADR Needed:** no
- **Score:** 84
- **Status:** ☐ open

### G299 — Import Error Taxonomy

- **Epic:** Reliability & Operations
- **Problem:** Import errors are inconsistent across flows.
- **Desired Outcome:** Standardize import error messages by type: format, integrity, vault mismatch, parse.
- **User Value:** Troubleshooting becomes easier.
- **Acceptance Criteria:** Errors are Dutch, actionable and covered by tests.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Backup, sync, dossier
- **ADR Needed:** no
- **Score:** 84
- **Status:** ☐ open

### G300 — Local Diagnostics Export

- **Epic:** Reliability & Operations
- **Problem:** Debugging app problems may require unsafe screenshots.
- **Desired Outcome:** Create a diagnostics export with versions, counts and settings flags but no health content.
- **User Value:** Support and self-debugging are safer.
- **Acceptance Criteria:** Export excludes record payloads and free-text health notes; tests verify omissions.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Diagnostics, export
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G301 — Recovery Mode Unlock Help

- **Epic:** Reliability & Operations
- **Problem:** Unlock failures can be stressful.
- **Desired Outcome:** Improve unlock failure guidance with passphrase, WebAuthn and backup recovery steps.
- **User Value:** The user has clear next actions.
- **Acceptance Criteria:** Copy is calm; no backdoor promise; links to backup docs.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Vault UX
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G302 — Notification Delivery Audit

- **Epic:** Reliability & Operations
- **Problem:** Users need confidence reminders are scheduled.
- **Desired Outcome:** Show last scheduling attempt and upcoming notification audit.
- **User Value:** Missed reminders are easier to diagnose.
- **Acceptance Criteria:** Audit is local; lock-screen text remains generic; tests cover permission states.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Notifications, event log
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G303 — Browser Compatibility Matrix

- **Epic:** Reliability & Operations
- **Problem:** Feature support differs by browser.
- **Desired Outcome:** Document tested browser support for PWA, WebAuthn, notifications and storage.
- **User Value:** Expectations are realistic.
- **Acceptance Criteria:** Matrix includes Chrome, Safari, Firefox where known; unknowns are explicit.
- **Priority:** P3
- **Complexity:** S
- **Related Components:** Docs, PWA
- **ADR Needed:** no
- **Score:** 64
- **Status:** ☐ open

### G304 — On-Device Summarizer Adapter

- **Epic:** AI & Research
- **Problem:** On-device AI detection exists but no adapter contract.
- **Desired Outcome:** Define and implement a local summarizer adapter when browser support exists.
- **User Value:** Summaries can avoid cloud when available.
- **Acceptance Criteria:** Adapter never starts without explicit action; falls back clearly; tests mock browser API.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** AI, knowledge
- **ADR Needed:** yes
- **Score:** 87
- **Status:** ☐ open

### G305 — AI Prompt Registry

- **Epic:** AI & Research
- **Problem:** AI prompts can drift from safety policy.
- **Desired Outcome:** Centralize AI prompt templates with policy tests.
- **User Value:** AI features remain auditable.
- **Acceptance Criteria:** Registry includes purpose, inputs, forbidden outputs and tests for diagnosis/dosing/treatment choice.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** AI, docs, tests
- **ADR Needed:** no
- **Score:** 115
- **Status:** ☑ klaar

### G306 — Research Source Importer

- **Epic:** AI & Research
- **Problem:** Research entries are manual.
- **Desired Outcome:** Import bibliographic metadata from pasted DOI/PMID/URL text without network by default.
- **User Value:** Research capture becomes faster.
- **Acceptance Criteria:** Parser works offline for pasted metadata; network lookup requires opt-in.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** Research, knowledge
- **ADR Needed:** no
- **Score:** 87
- **Status:** ☐ open

### G307 — Research Reading Queue

- **Epic:** AI & Research
- **Problem:** Interesting papers can be saved but not triaged.
- **Desired Outcome:** Add reading states: te lezen, gelezen, bespreken, archiveren.
- **User Value:** Research becomes manageable.
- **Acceptance Criteria:** States are local; filters exist; source and date remain visible.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Knowledge
- **ADR Needed:** no
- **Score:** 75
- **Status:** ☐ open

### G308 — Research-to-Question Suggestions

- **Epic:** AI & Research
- **Problem:** Research relevance is hard to turn into consult questions.
- **Desired Outcome:** Suggest draft questions from saved research relevance notes.
- **User Value:** The user can discuss research safely with clinicians.
- **Acceptance Criteria:** Suggestions are questions only; no treatment recommendation; user must confirm before saving.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Research, questions
- **ADR Needed:** no
- **Score:** 95
- **Status:** ☐ open

### G309 — Evidence Strength Labels

- **Epic:** AI & Research
- **Problem:** Research cards lack a simple evidence context.
- **Desired Outcome:** Add user-entered evidence type labels such as guideline, review, study or note.
- **User Value:** Research is easier to interpret cautiously.
- **Acceptance Criteria:** Labels are descriptive, not scoring; no automatic medical ranking.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** Research
- **ADR Needed:** no
- **Score:** 87
- **Status:** ☐ open

### G310 — Research Update Reminder

- **Epic:** AI & Research
- **Problem:** Saved research can become stale.
- **Desired Outcome:** Create reminders to revisit important research items.
- **User Value:** Consult prep stays current.
- **Acceptance Criteria:** Reminder is manual/opt-in per item; herverificatie status visible.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Research, reminders
- **ADR Needed:** no
- **Score:** 82
- **Status:** ☐ open

### G311 — Local Citation Formatter

- **Epic:** AI & Research
- **Problem:** Research exports need consistent citations.
- **Desired Outcome:** Format saved research sources consistently in Markdown exports.
- **User Value:** Consult packets look cleaner.
- **Acceptance Criteria:** Formatter handles title, source, date, URL; missing fields are explicit.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Research export
- **ADR Needed:** no
- **Score:** 82
- **Status:** ☐ open

### G312 — AI Output Diff Review

- **Epic:** AI & Research
- **Problem:** AI summaries need careful human correction.
- **Desired Outcome:** Show a diff between generated summary and user-edited version.
- **User Value:** The user can see what changed before saving.
- **Acceptance Criteria:** Diff is local; generated text remains concept; no hidden overwrite.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** AI summaries, knowledge
- **ADR Needed:** no
- **Score:** 95
- **Status:** ☐ open

### G313 — Sensitive Text Redaction Preview

- **Epic:** AI & Research
- **Problem:** Payload minimization needs visible redaction.
- **Desired Outcome:** Highlight what personal identifiers are removed before optional AI calls.
- **User Value:** Trust in opt-in AI increases.
- **Acceptance Criteria:** Preview shows redacted fields; tests cover names, dates and IDs where applicable.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** AI payloads
- **ADR Needed:** no
- **Score:** 115
- **Status:** ☑ klaar

### G314 — Cloud AI Cost Warning

- **Epic:** AI & Research
- **Problem:** External AI can have cost implications.
- **Desired Outcome:** Show a clear cost/privacy warning before enabling a cloud provider.
- **User Value:** The user makes an informed opt-in choice.
- **Acceptance Criteria:** Warning requires explicit confirmation; setting remains encrypted.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** AI settings
- **ADR Needed:** no
- **Score:** 82
- **Status:** ☐ open

### G315 — AI Provider Health Check

- **Epic:** AI & Research
- **Problem:** Provider configuration errors are discovered late.
- **Desired Outcome:** Add an explicit user-triggered provider check with minimal payload.
- **User Value:** Setup becomes less frustrating.
- **Acceptance Criteria:** Check sends no health data; shows success/failure; disabled by default.
- **Priority:** P3
- **Complexity:** M
- **Related Components:** AI settings
- **ADR Needed:** yes
- **Score:** 55
- **Status:** ☐ open

### G316 — Research Topic Map

- **Epic:** AI & Research
- **Problem:** Research trends are lists, not a map.
- **Desired Outcome:** Show a local topic map of saved research themes.
- **User Value:** Patterns become visible without claims.
- **Acceptance Criteria:** Map groups by keyword; no evidence weighting; accessible list fallback exists.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Knowledge graph, research
- **ADR Needed:** no
- **Score:** 75
- **Status:** ☐ open

### G317 — Question Safety Classifier

- **Epic:** AI & Research
- **Problem:** User-drafted questions may accidentally ask app for advice.
- **Desired Outcome:** Detect and reframe app-generated suggestions as clinician questions.
- **User Value:** The app stays inside support boundaries.
- **Acceptance Criteria:** Classifier flags dosing/diagnosis/treatment-choice phrasing; suggestions remain editable.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Questions, AI policy
- **ADR Needed:** no
- **Score:** 95
- **Status:** ☐ open

### G318 — Local Research Full Text Index

- **Epic:** AI & Research
- **Problem:** Research notes are not deeply searchable.
- **Desired Outcome:** Add local full-text indexing for saved research text.
- **User Value:** Research retrieval becomes faster.
- **Acceptance Criteria:** Index is derived after unlock; stored encrypted or rebuilt; no network.
- **Priority:** P2
- **Complexity:** L
- **Related Components:** Knowledge, storage
- **ADR Needed:** no
- **Score:** 67
- **Status:** ☐ open

### G319 — Research Export Packet

- **Epic:** AI & Research
- **Problem:** Research context is separate from consult export.
- **Desired Outcome:** Generate a research packet with simple summaries, citations and user relevance notes.
- **User Value:** The clinician discussion can be better prepared.
- **Acceptance Criteria:** Packet includes warnings; excludes recommendations; Markdown only.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Research, export
- **ADR Needed:** no
- **Score:** 75
- **Status:** ☐ open

### G320 — Prompt Regression Suite

- **Epic:** AI & Research
- **Problem:** Safety tests may miss prompt drift.
- **Desired Outcome:** Add prompt regression fixtures for all AI-assisted flows.
- **User Value:** Unsafe output patterns are caught early.
- **Acceptance Criteria:** Fixtures cover consult, research, image context and daily recommendations.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** AI tests
- **ADR Needed:** no
- **Score:** 115
- **Status:** ☑ klaar

### G321 — On-Device Capability Explainer

- **Epic:** AI & Research
- **Problem:** Detected browser AI capabilities are technical.
- **Desired Outcome:** Explain local AI capability status in plain Dutch.
- **User Value:** The user understands what local AI can and cannot do.
- **Acceptance Criteria:** Text distinguishes detection from enabled use; no model download starts.
- **Priority:** P3
- **Complexity:** S
- **Related Components:** AI UI
- **ADR Needed:** no
- **Score:** 62
- **Status:** ☐ open

### G322 — Research Network Audit Log

- **Epic:** AI & Research
- **Problem:** Network-enabled research actions need traceability.
- **Desired Outcome:** Log explicit network research actions locally.
- **User Value:** The user can review when external lookups happened.
- **Acceptance Criteria:** Event log records timestamp, source domain and action type; no payload body stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Research opt-in, event log
- **ADR Needed:** no
- **Score:** 95
- **Status:** ☐ open

### G323 — AI Data Retention Controls

- **Epic:** AI & Research
- **Problem:** Generated AI concepts can accumulate.
- **Desired Outcome:** Add controls to list and delete AI-generated concept records.
- **User Value:** The user can manage generated content.
- **Acceptance Criteria:** Filter by ai_gegenereerd; delete requires confirmation; verified human records unaffected.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** AI settings, knowledge
- **ADR Needed:** yes
- **Score:** 95
- **Status:** ☐ open

### G324 — Content Security Policy

- **Epic:** Security & DevEx
- **Problem:** The PWA lacks an explicit CSP.
- **Desired Outcome:** Add a strict CSP compatible with local-first operation.
- **User Value:** Accidental third-party execution risk decreases.
- **Acceptance Criteria:** CSP blocks remote scripts by default; tests verify no forbidden external origins.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Build, index.html
- **ADR Needed:** no
- **Score:** 117
- **Status:** ☑ klaar

### G325 — Dependency Review Cadence

- **Epic:** Security & DevEx
- **Problem:** Dependency updates are ad hoc.
- **Desired Outcome:** Document and script a monthly dependency review flow.
- **User Value:** Security maintenance becomes routine.
- **Acceptance Criteria:** Flow includes npm outdated, audit, lockfile diff and test gate.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs, package
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G326 — Secrets Scan Test

- **Epic:** Security & DevEx
- **Problem:** Public repo must not contain secrets.
- **Desired Outcome:** Add a lightweight secrets pattern scan for docs and source.
- **User Value:** Accidental credential commits are caught.
- **Acceptance Criteria:** Test flags common API key patterns; allowlist is explicit and minimal.
- **Priority:** P0
- **Complexity:** M
- **Related Components:** Tests, repo
- **ADR Needed:** no
- **Score:** 117
- **Status:** ☑ klaar

### G327 — Sensitive Fixture Policy

- **Epic:** Security & DevEx
- **Problem:** Tests could accidentally use real health data.
- **Desired Outcome:** Document and enforce synthetic-only fixtures.
- **User Value:** Privacy remains protected in public code.
- **Acceptance Criteria:** Docs state fixture rules; test filenames and sample names avoid real patient data.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Tests, docs
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G328 — Storage Schema Migration Harness

- **Epic:** Security & DevEx
- **Problem:** Future schema migrations need safe testing.
- **Desired Outcome:** Build a harness for old encrypted record fixtures and additive migrations.
- **User Value:** Data survival becomes verifiable.
- **Acceptance Criteria:** Harness loads versioned fixtures; migration tests prove no payload loss.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** Storage, tests
- **ADR Needed:** no
- **Score:** 89
- **Status:** ☐ open

### G329 — Domain Boundary Lint

- **Epic:** Security & DevEx
- **Problem:** UI/storage concerns can leak into domain modules.
- **Desired Outcome:** Add a static test that domain modules avoid DOM and network APIs.
- **User Value:** The architecture stays clean.
- **Acceptance Criteria:** Test scans src/domain for forbidden imports and globals.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Architecture, tests
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G330 — Accessibility Regression Smoke

- **Epic:** Security & DevEx
- **Problem:** Accessibility can regress without browser checks.
- **Desired Outcome:** Add automated checks for focus order, labels and contrast on core screens.
- **User Value:** The app remains usable under stress and on mobile.
- **Acceptance Criteria:** Smoke covers start, traject, agenda, dossier, backup; failures are actionable.
- **Priority:** P1
- **Complexity:** L
- **Related Components:** UI tests
- **ADR Needed:** no
- **Score:** 89
- **Status:** ☐ open

### G331 — Mobile Viewport Screenshot Gate

- **Epic:** Security & DevEx
- **Problem:** Mobile layout regressions are hard to see in unit tests.
- **Desired Outcome:** Add screenshot smoke for key mobile screens.
- **User Value:** Small-screen usability is protected.
- **Acceptance Criteria:** Screenshots cover 390px width; checks verify no horizontal overflow.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** UI tests
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G332 — Markdown Export Sanitizer

- **Epic:** Security & DevEx
- **Problem:** User text in Markdown exports may break structure.
- **Desired Outcome:** Escape or normalize risky Markdown/control characters in exports.
- **User Value:** Exports remain readable and safe to share manually.
- **Acceptance Criteria:** Tests cover headings, links, tables and HTML-like text.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Exports
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G333 — Audit Event Retention Policy

- **Epic:** Security & DevEx
- **Problem:** Event logs can grow indefinitely.
- **Desired Outcome:** Define retention/export guidance for local audit events.
- **User Value:** Operational history stays useful without clutter.
- **Acceptance Criteria:** Policy is documented; UI explains manual cleanup or archive path.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Event log, docs
- **ADR Needed:** no
- **Score:** 84
- **Status:** ☐ open

### G334 — Form Validation Library Cleanup

- **Epic:** Security & DevEx
- **Problem:** Validation rules are repeated across forms.
- **Desired Outcome:** Introduce a small local validation helper for common fields.
- **User Value:** Forms become easier to maintain.
- **Acceptance Criteria:** Helper covers required text, date, number and ID references; no new dependency unless justified.
- **Priority:** P2
- **Complexity:** L
- **Related Components:** Forms
- **ADR Needed:** no
- **Score:** 69
- **Status:** ☐ open

### G335 — Typed Route Registry

- **Epic:** Security & DevEx
- **Problem:** Screen IDs and nav metadata are loosely coupled.
- **Desired Outcome:** Create a typed registry for routes, titles and nav labels.
- **User Value:** Navigation changes become safer.
- **Acceptance Criteria:** Registry drives nav and screen metadata; tests verify every route renders.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** App shell
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G336 — Store Factory Refactor

- **Epic:** Security & DevEx
- **Problem:** Runtime store initialization is repetitive.
- **Desired Outcome:** Extract store initialization/reset helpers.
- **User Value:** Main runtime becomes easier to reason about.
- **Acceptance Criteria:** Refactor preserves behavior; tests cover lock, unlock and import reset.
- **Priority:** P3
- **Complexity:** L
- **Related Components:** main.ts, stores
- **ADR Needed:** no
- **Score:** 49
- **Status:** ☐ open

### G337 — Event Log Privacy Test

- **Epic:** Security & DevEx
- **Problem:** Event logs might store sensitive free text.
- **Desired Outcome:** Add tests that event log details stay generic for high-risk actions.
- **User Value:** Operational metadata does not become a second dossier.
- **Acceptance Criteria:** Tests cover backup, AI, notification and import events.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Event log tests
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G338 — Tailscale Deploy Drift Check

- **Epic:** Security & DevEx
- **Problem:** Deployment config can drift from docs.
- **Desired Outcome:** Compare docker-compose and Tailscale docs for port/domain consistency.
- **User Value:** Self-hosting remains predictable.
- **Acceptance Criteria:** Check validates documented port, service name and smoke command.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** Tailscale docs, scripts
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G339 — Public Repo Privacy Review

- **Epic:** Security & DevEx
- **Problem:** Public code needs recurring privacy review.
- **Desired Outcome:** Add a checklist for public repo privacy before releases.
- **User Value:** Sensitive project context stays out of commits.
- **Acceptance Criteria:** Checklist covers docs, fixtures, screenshots, env files and generated assets.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs, tests
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G340 — Build Provenance Notes

- **Epic:** Security & DevEx
- **Problem:** Build artifacts lack provenance notes.
- **Desired Outcome:** Document how CI builds relate to deployed static assets.
- **User Value:** Deployment audits become easier.
- **Acceptance Criteria:** Docs mention commit SHA, build command and smoke steps.
- **Priority:** P3
- **Complexity:** S
- **Related Components:** Docs, CI
- **ADR Needed:** no
- **Score:** 64
- **Status:** ☐ open

### G341 — CSS Token Audit

- **Epic:** Security & DevEx
- **Problem:** Theme changes can reintroduce one-note palettes or poor contrast.
- **Desired Outcome:** Add a documented CSS token audit and optional test hooks.
- **User Value:** Visual quality remains consistent.
- **Acceptance Criteria:** Audit lists color tokens, contrast expectations and mobile constraints.
- **Priority:** P2
- **Complexity:** S
- **Related Components:** Styles
- **ADR Needed:** no
- **Score:** 84
- **Status:** ☐ open

### G342 — No External Asset Test

- **Epic:** Security & DevEx
- **Problem:** External images/fonts/scripts could undermine privacy.
- **Desired Outcome:** Test built assets and HTML for remote URL references.
- **User Value:** The app remains self-contained.
- **Acceptance Criteria:** Build output scan rejects http(s) asset URLs unless explicitly allowlisted.
- **Priority:** P0
- **Complexity:** S
- **Related Components:** PWA, tests
- **ADR Needed:** no
- **Score:** 124
- **Status:** ☑ klaar

### G343 — Type Coverage Ratchet

- **Epic:** Security & DevEx
- **Problem:** Type safety can erode with broad unknowns.
- **Desired Outcome:** Track and reduce unsafe casts in app/domain code.
- **User Value:** Maintenance risk decreases.
- **Acceptance Criteria:** Report counts any/unknown casts; ratchet prevents increases outside tests.
- **Priority:** P2
- **Complexity:** M
- **Related Components:** TypeScript
- **ADR Needed:** no
- **Score:** 77
- **Status:** ☐ open

### G344 — Future Sync Relay Threat Model

- **Epic:** Security & DevEx
- **Problem:** A future relay needs threat modeling before implementation.
- **Desired Outcome:** Write a threat model for encrypted sync relay options.
- **User Value:** Future sync work starts from privacy constraints.
- **Acceptance Criteria:** Threat model covers metadata leakage, auth, replay, retention and non-goals.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Architecture, security docs
- **ADR Needed:** yes
- **Score:** 97
- **Status:** ☐ open

### G345 — Backlog Health Issue Snapshot Automation

- **Epic:** Continuous Evolution
- **Problem:** Backlog health can compare issues only after a manual issue JSON export.
- **Desired Outcome:** Add a helper that exports a GitHub issue snapshot in the format expected by the local backlog health report.
- **User Value:** Drift checks become easier to run before selecting the next goal.
- **Acceptance Criteria:** Helper documents the exact `gh issue list` command; output can feed `npm run backlog:health -- --issues-json`; no secrets are stored; tests cover snapshot shape.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Scripts, GitHub Issues, docs
- **ADR Needed:** no
- **Score:** 96
- **Status:** ☐ open

### G346 — Goal Score Issue Annotation

- **Epic:** Continuous Evolution
- **Problem:** Goal scores are visible locally but not yet reflected in GitHub issue triage.
- **Desired Outcome:** Add a workflow or helper that annotates issue bodies or labels with the current local score output.
- **User Value:** Remote issue triage can follow the same reproducible priority model as the local catalog.
- **Acceptance Criteria:** Helper reads `npm run goals:score -- --json`; updates only matching goal issues after explicit command; dry-run is supported; no secrets are stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Scripts, GitHub Issues, docs
- **ADR Needed:** no
- **Score:** 96
- **Status:** ☐ open

### G347 — External Asset CI Gate

- **Epic:** Security & DevEx
- **Problem:** The external asset scanner exists locally but is not yet enforced by CI after build output exists.
- **Desired Outcome:** Add the external asset check to CI after the production build.
- **User Value:** Self-contained asset guarantees are enforced on every PR.
- **Acceptance Criteria:** CI runs `npm run assets:check` after `npm run build`; docs mention the local command; failures show the offending file, context and URL.
- **Priority:** P0
- **Complexity:** S
- **Related Components:** CI, PWA, tests
- **ADR Needed:** no
- **Score:** 124
- **Status:** ☑ klaar

### G348 — External Asset Allowlist Governance

- **Epic:** Security & DevEx
- **Problem:** The scanner has a minimal built-in allowlist, but future exceptions need an explicit governance path.
- **Desired Outcome:** Document and test how external asset allowlist exceptions are reviewed and maintained.
- **User Value:** Kiempad remains self-contained by default while unavoidable technical namespaces or assets stay auditable.
- **Acceptance Criteria:** Documentation explains when an external asset URL may be allowlisted; scanner tests verify every allowlisted URL has a reason; adding an allowlist entry without a documented reason fails a local test.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Tests, docs, asset scanner
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G349 — Completion Audit Evidence Markers

- **Epic:** Continuous Evolution
- **Problem:** The completion audit checklist is documented, but its evidence remains free-form and hard to validate automatically.
- **Desired Outcome:** Define a structured evidence marker format for PR descriptions or local audit reports.
- **User Value:** Future autonomous work becomes easier to review and less likely to mark goals done from weak evidence.
- **Acceptance Criteria:** Define a structured evidence marker format; document one filled example; add a maintenance test or parser that recognizes required marker headings.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs, PR template, maintenance tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G350 — First Run Setup Progress Persistence

- **Epic:** Onboarding & Daily Use
- **Problem:** The first-run setup can be completed or skipped, but it does not yet show step-level progress for traject, afspraak or backup preparation.
- **Desired Outcome:** Persist and display lightweight setup progress from local records/settings.
- **User Value:** New users can resume setup calmly and avoid wondering what is still missing.
- **Acceptance Criteria:** Setup steps show local progress based on existing records/settings; progress uses only local encrypted state after unlock; skipped/completed setup remains respected; tests cover empty, partial and completed progress states.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** App shell, settings, onboarding tests
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G351 — Offline Smoke CI Artifact

- **Epic:** Reliability & Operations
- **Problem:** Offline smoke failures can be hard to diagnose from text output alone.
- **Desired Outcome:** Capture small diagnostics such as console messages, failed requests or an optional failure screenshot.
- **User Value:** Offline regressions become faster to debug without manually reproducing every failure.
- **Acceptance Criteria:** Offline smoke records console/page errors and failed request context on failure; optional screenshot or HTML snapshot is written only on failure; docs mention where diagnostics are stored; no sensitive local vault data is captured.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** PWA, Playwright smoke, docs
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G352 — Backup Drill Fixture Expansion

- **Epic:** Reliability & Operations
- **Problem:** The backup restore drill verifies core records, but future restore confidence improves if more domains and edge cases are included.
- **Desired Outcome:** Expand the drill with additional representative record types and edge states.
- **User Value:** Back-up restore confidence increases for real Kiempad usage, not just the smallest dataset.
- **Acceptance Criteria:** Drill covers at least three additional domains such as cost, mental check-in, consultverslag or event log; includes one archived or completed record state; report still avoids plaintext health content; tests verify the expanded record list and counts.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Storage, backup, tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G353 — CSP Violation Reporting Plan

- **Epic:** Security & DevEx
- **Problem:** Kiempad has a strict local-first CSP, but no documented plan for diagnosing CSP violations without leaking local health data.
- **Desired Outcome:** Document a no-telemetry CSP violation workflow and decide whether local-only browser diagnostics are enough.
- **User Value:** Security regressions can be debugged without introducing reporting endpoints or sensitive telemetry.
- **Acceptance Criteria:** Document why CSP reports are not sent to a remote endpoint by default; list local debugging steps for CSP violations in dev/prod preview; clarify what is required before enabling any report endpoint; add a maintenance test or doc reference preserving the no-remote-reporting stance.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** CSP, docs, security tests
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G354 — Secrets Scan Baseline Review

- **Epic:** Security & DevEx
- **Problem:** The first scanner covers common patterns, but future false positives or missed project-specific patterns need a deliberate review path.
- **Desired Outcome:** Document scanner pattern ownership and add project-specific examples without weakening the allowlist.
- **User Value:** Credential protection stays useful instead of becoming noisy or too broad to trust.
- **Acceptance Criteria:** Document the current patterns and allowlist policy; add at least one project-specific negative test for placeholders that must remain allowed; add at least one project-specific positive test for a realistic forbidden Tailscale or AI key shape; keep the repository scan green without broad directory exclusions.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Secrets scan, tests, docs
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G355 — Prompt Registry UI Exposure

- **Epic:** AI & Research
- **Problem:** The prompt registry is centralized and tested, but currently only visible in source and docs.
- **Desired Outcome:** Provide a read-only prompt registry overview with purpose, version, inputs and forbidden outputs.
- **User Value:** AI behavior becomes easier to audit before any provider integration is used.
- **Acceptance Criteria:** UI or generated markdown lists every prompt id, version, purpose and required inputs; forbidden output policy is visible for each prompt; overview remains read-only and starts no AI/provider/network action; tests verify every registry prompt appears in the overview.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** AI registry, app shell, docs
- **ADR Needed:** no
- **Score:** 95
- **Status:** ☐ open

### G356 — Redaction Pattern Baseline Review

- **Epic:** AI & Research
- **Problem:** Redaction preview covers common identifiers, but future AI inputs may need broader localized patterns and clearer ownership.
- **Desired Outcome:** Document and expand the redaction pattern baseline with examples, limits and maintenance ownership.
- **User Value:** Users can trust opt-in AI previews as document, consult and research inputs evolve.
- **Acceptance Criteria:** Docs list current redaction patterns and limits; tests add at least one negative non-sensitive date/source case and one new positive identifier case; preview remains local and does not show raw redacted values.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** AI payloads, privacy tests, docs
- **ADR Needed:** no
- **Score:** 102
- **Status:** ☐ open

### G357 — Prompt Regression Coverage Report

- **Epic:** AI & Research
- **Problem:** Prompt regression fixtures are validated in tests, but maintainers do not have a compact report showing which flows and prompt ids are covered.
- **Desired Outcome:** Add a local report or generated documentation that summarizes prompt regression fixture coverage by flow, prompt id and policy boundary.
- **User Value:** AI safety coverage becomes easier to review before adding new prompts or provider integrations.
- **Acceptance Criteria:** Report lists every regression fixture grouped by flow; flags registry prompts without a fixture; includes image-context and daily-recommendations boundary fixtures; runs without network or provider calls.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** AI tests, docs, maintenance scripts
- **ADR Needed:** no
- **Score:** 102
- **Status:** ☐ open

### G358 — Daily Command Center Personalization

- **Epic:** Onboarding & Daily Use
- **Problem:** The daily command center now groups today’s tasks, but every user sees the same fixed order and no persistent preferences.
- **Desired Outcome:** Allow local-only preferences for which command center groups appear first or are collapsed by default.
- **User Value:** The start screen can match the user’s morning routine without adding cloud state or advice.
- **Acceptance Criteria:** Preferences are stored locally with app settings; default order remains safe and complete; collapsed groups still expose counts; tests cover default and personalized ordering.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Start screen, settings, app shell tests
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G359 — Consult Prep Packet Persistence

- **Epic:** Onboarding & Daily Use
- **Problem:** The consult prep wizard creates a local packet, but it is not yet saveable as a reusable local preparation record.
- **Desired Outcome:** Let users save an edited consult prep packet locally and link it to the appointment.
- **User Value:** Final consult preparation remains available after navigation or refresh without copying text manually.
- **Acceptance Criteria:** Saved packet stays encrypted/local; packet links to an appointment; edited questions are preserved; export still includes no diagnosis, dosage or treatment-choice advice.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Questions, storage, export
- **ADR Needed:** no
- **Score:** 98
- **Status:** ☐ open

### G360 — Recovery Mode Diagnostics Card

- **Epic:** Reliability & Operations
- **Problem:** Unlock help explains next actions, but users still cannot see local non-sensitive diagnostics such as vault presence, WebAuthn availability or backup reminder status before retrying.
- **Desired Outcome:** Add a locked-state diagnostics card with non-sensitive status signals and no record content.
- **User Value:** Users can distinguish wrong passphrase, unavailable WebAuthn and missing local vault context more calmly.
- **Acceptance Criteria:** Card shows only non-sensitive local status; never reveals record counts or health content while locked; distinguishes WebAuthn unavailable vs not enrolled; tests cover locked state with and without vault metadata.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Vault UX, WebAuthn, backup guidance
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G361 — Dependency Review Evidence Snapshot

- **Epic:** Security & DevEx
- **Problem:** The dependency review cadence exists, but completed monthly reviews do not yet leave a structured local evidence snapshot.
- **Desired Outcome:** Add a helper or template that records dependency review date, commands, lockfile diff summary and gate results without storing secrets.
- **User Value:** Security maintenance becomes auditable over time instead of relying on memory.
- **Acceptance Criteria:** Evidence format includes npm outdated, audit, lockfile diff and test gate status; docs explain where snapshots live; no package metadata secrets or tokens are stored; tests cover the evidence schema/template.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs, scripts, dependency review
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G362 — Sensitive Fixture Allowlist Review

- **Epic:** Security & DevEx
- **Problem:** The sensitive fixture scanner blocks common risky patterns, but future exceptions need explicit review so the scanner does not become noisy or too broad.
- **Desired Outcome:** Add an allowlist governance path for fixture scanner exceptions with required rationale and tests.
- **User Value:** Privacy protection remains strict while legitimate synthetic edge cases stay maintainable.
- **Acceptance Criteria:** Fixture scanner allowlist entries require a documented rationale; tests fail when an allowlist item lacks a reason; docs explain review cadence; existing synthetic placeholders remain allowed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Fixture scanner, docs, tests
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G363 — Event Log Detail Allowlist Governance

- **Epic:** Security & DevEx
- **Problem:** Event log privacy validation blocks sensitive patterns, but future generic detail exceptions need documented ownership to avoid weakening privacy.
- **Desired Outcome:** Add an allowlist rationale mechanism or documented review path for event-log detail exceptions.
- **User Value:** Operational logs remain useful without becoming a second dossier.
- **Acceptance Criteria:** Allowlist entries require documented rationale; tests cover allowed generic and rejected sensitive examples; docs explain when event detail may include counts/status; no health free text is allowed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Event log privacy, docs, tests
- **ADR Needed:** no
- **Score:** 104
- **Status:** ☑ klaar

### G364 — Public Repo Privacy Review Automation Hook

- **Epic:** Security & DevEx
- **Problem:** The public repo privacy checklist is documented, but maintainers still need to remember when changed files require it.
- **Desired Outcome:** Add a local helper or CI-friendly dry-run that flags PRs touching docs, fixtures, screenshots, env examples or generated assets so the review checklist is explicitly acknowledged.
- **User Value:** Public releases are less likely to miss privacy review when sensitive file classes change.
- **Acceptance Criteria:** Helper classifies changed files by review category; dry-run output names the required checklist sections; tests cover docs, fixture, screenshot, env and generated-asset paths; no file contents or secrets are printed.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Scripts, docs, CI
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G365 — External Asset Allowlist Review Evidence

- **Epic:** Security & DevEx
- **Problem:** External asset allowlist governance is documented and tested, but completed reviews do not yet leave structured evidence.
- **Desired Outcome:** Add a lightweight evidence template or helper for recording allowlist review date, entries, rationale checks and asset-scan results.
- **User Value:** Future maintainers can audit why remote-asset exceptions remain safe without re-reading history.
- **Acceptance Criteria:** Evidence format records date, reviewed entries, rationale status and `npm run assets:check` result; docs explain when to write evidence; tests cover the evidence schema/template; no private URLs or tokens are stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Docs, asset scanner, maintenance tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G366 — Local CSP Violation Reproduction Fixture

- **Epic:** Security & DevEx
- **Problem:** The CSP violation workflow is documented, but maintainers do not yet have a tiny local fixture for reproducing blocked asset categories without touching production UI.
- **Desired Outcome:** Add a test-only or docs-only fixture that demonstrates blocked script, connect and asset cases with sanitized output.
- **User Value:** CSP regressions become easier to reproduce without adding telemetry or real user data.
- **Acceptance Criteria:** Fixture never ships in production build; docs explain how to use it locally; tests verify it stays isolated from app runtime; no remote request is actually made during automated tests.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** CSP docs, tests, dev tooling
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G367 — Secrets Scan Review Evidence Snapshot

- **Epic:** Security & DevEx
- **Problem:** The secrets scan baseline is documented and tested, but completed reviews do not yet leave a structured evidence snapshot.
- **Desired Outcome:** Add an evidence template or helper for recording scanner baseline review date, patterns, allowlist rationale status and `npm run secrets:check` result.
- **User Value:** Public-repo credential hygiene becomes auditable over time without storing secrets.
- **Acceptance Criteria:** Evidence format records reviewed patterns, allowlist entries, command result and reviewer/date; docs explain where evidence lives; tests cover the template/schema; no secret values beyond approved placeholders are stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Secrets scan, docs, maintenance tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G368 — Recovery Diagnostics Visual Regression Fixture

- **Epic:** Reliability & Operations
- **Problem:** The locked-state diagnostics card is tested as HTML, but visual regressions could still make recovery states hard to scan on small screens.
- **Desired Outcome:** Add a screenshot or DOM fixture that verifies the recovery diagnostics layout across missing vault, WebAuthn unavailable and WebAuthn linked states.
- **User Value:** Users can read recovery status clearly while locked without exposing private data.
- **Acceptance Criteria:** Fixture covers at least three locked-state diagnostics variants; verification asserts no overlap or clipped text; fixture contains no record counts or health content; docs mention how to refresh it.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Vault UX, visual tests, docs
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G369 — Dependency Evidence Generator Dry Run

- **Epic:** Security & DevEx
- **Problem:** The dependency review evidence template is manual, so command summaries can still be copied inconsistently.
- **Desired Outcome:** Add a dry-run helper that prints a sanitized dependency-review evidence draft from local command statuses.
- **User Value:** Monthly dependency reviews become faster while preserving the no-secret evidence boundary.
- **Acceptance Criteria:** Helper runs in dry-run mode without writing files by default; output includes date, reviewed commands and placeholder lockfile summary; tests verify no package metadata dumps or env values are printed; docs explain how to save the draft.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Dependency review script, docs, tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G370 — Sensitive Fixture Review Evidence Snapshot

- **Epic:** Security & DevEx
- **Problem:** Fixture allowlist governance is documented, but completed reviews do not yet leave structured evidence.
- **Desired Outcome:** Add an evidence template for fixture scanner review date, allowlist entries, rationale status and `npm run fixtures:check` result.
- **User Value:** Public-repo testdata hygiene remains auditable without storing real patient data.
- **Acceptance Criteria:** Evidence template records reviewed patterns, allowlist entries, command result and reviewer/date; docs explain where evidence lives; tests cover the template/schema; no real names, emails, BSN or portal content are stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Fixture scanner, docs, maintenance tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G371 — Event Log Detail Review Evidence Snapshot

- **Epic:** Security & DevEx
- **Problem:** Eventlog detail allowlist governance is documented, but reviews of allowed generic details do not yet leave structured evidence.
- **Desired Outcome:** Add an evidence template for eventlog detail review date, allowlist entries, rationale status and rejected sensitive examples.
- **User Value:** Operational logs remain auditable without becoming a shadow health dossier.
- **Acceptance Criteria:** Evidence template records reviewed entries, rationale status, rejected examples and reviewer/date; docs explain where evidence lives; tests cover the template/schema; no health free text or user content is stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** Event log privacy, docs, maintenance tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G372 — ADR Review Evidence Template

- **Epic:** Continuous Evolution
- **Problem:** ADR-needed goals are now marked, but completed ADR reviews do not yet have a structured evidence format.
- **Desired Outcome:** Add a template for recording ADR review date, reviewed goal, decision, ADR route and follow-up requirements.
- **User Value:** Architecture-sensitive work remains auditable and reversible over time.
- **Acceptance Criteria:** Template records goal id, reviewer/date, existing ADRs consulted, decision outcome and follow-up; docs explain where evidence lives; maintenance test covers the template schema; no sensitive user data is stored.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** ADR backlog, docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G373 — Autonomy Guardrail Evidence Checklist

- **Epic:** Continuous Evolution
- **Problem:** Autonomy guardrails are documented, but PR evidence can still omit which guardrails were checked.
- **Desired Outcome:** Add an evidence checklist or template that records network, AI, data, GitHub, Tailscale and medical guardrail review per autonomous PR.
- **User Value:** Autonomous merges remain reviewable and policy drift is easier to catch.
- **Acceptance Criteria:** Template covers all guardrail domains; PR or docs flow explains when to fill it; maintenance test verifies template headings; no sensitive user data is stored.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** Docs, PR template, maintenance tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G374 — Backlog Active Goal Drift Fixture

- **Epic:** Continuous Evolution
- **Problem:** The active-goal minimum is now tested against current docs, but there is no small negative fixture proving the check fails when backlog and execution IDs drift.
- **Desired Outcome:** Add a focused fixture or helper test that demonstrates missing, extra and below-minimum active goal states without editing production backlog files.
- **User Value:** Future maintainers can refactor backlog tests without weakening the 100-active-goal safety net.
- **Acceptance Criteria:** Test fixture covers fewer than 100 open goals, missing execution IDs and extra execution IDs; failure messages identify the affected condition; production backlog content is not duplicated in fixtures.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, backlog health
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G375 — Completion Audit Marker Parser CLI

- **Epic:** Continuous Evolution
- **Problem:** Completion audit markers now have a documented format, but maintainers still inspect marker completeness manually.
- **Desired Outcome:** Add a local dry-run helper that parses PR text or a Markdown file and reports missing completion-audit marker sections and fields.
- **User Value:** Autonomous PR evidence becomes easier to validate before merge without network calls.
- **Acceptance Criteria:** Helper reads a local Markdown file; validates start/end markers, required headings and required fields; tests cover complete and incomplete marker blocks; output never prints secrets or full PR bodies.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** scripts, PR template, tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G376 — ADR Review Evidence Index

- **Epic:** Continuous Evolution
- **Problem:** ADR review evidence now has a template, but completed reviews do not yet have an index that shows which ADR-needed goals have evidence.
- **Desired Outcome:** Add an index or checklist that maps ADR-needed goals to their evidence location, decision outcome and follow-up state.
- **User Value:** Architecture-sensitive work remains traceable after several autonomous PRs.
- **Acceptance Criteria:** Index lists all current `ADR Needed: yes` goals; each row has evidence location, decision outcome and follow-up status; maintenance test verifies the yes-goal set matches the index; no sensitive user data is stored.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** ADR backlog, docs, maintenance tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G377 — Autonomy Guardrail Evidence Parser

- **Epic:** Continuous Evolution
- **Problem:** Autonomy guardrail evidence has a checklist, but completeness is still reviewed manually.
- **Desired Outcome:** Add a local parser or maintenance helper that validates all guardrail domains and fields in a Markdown evidence block.
- **User Value:** Autonomous PRs can be checked for guardrail evidence before merge without network calls.
- **Acceptance Criteria:** Parser validates network, AI, data, GitHub, Tailscale, medical and sensitive-data sections; tests cover missing headings and missing fields; output does not print full PR bodies or sensitive content.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** scripts, PR template, tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G378 — Backlog Active Goal Drift CLI Flag

- **Epic:** Continuous Evolution
- **Problem:** Active-goal drift is checked by the default backlog health CLI, but maintainers cannot yet tune the active-goal minimum for local experiments.
- **Desired Outcome:** Add an explicit CLI flag for the active-goal minimum and document when to use the default versus a custom threshold.
- **User Value:** Backlog health checks stay strict in normal use while test fixtures and temporary audits remain reproducible.
- **Acceptance Criteria:** CLI accepts a minimum-open-goals flag; default remains 100; tests cover default and custom values; docs mention the flag without weakening the permanent backlog rule.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G379 — ADR Review Evidence Freshness Check

- **Epic:** Continuous Evolution
- **Problem:** ADR review evidence can be indexed but still become stale when ADR-needed goals or decision outcomes change.
- **Desired Outcome:** Add a maintenance check that flags stale pending evidence, missing review dates or outdated follow-up statuses for ADR-needed goals.
- **User Value:** Architecture-sensitive decisions stay current as autonomous work evolves.
- **Acceptance Criteria:** Check identifies pending evidence older than a documented threshold, missing review dates and follow-up statuses that are not allowed values; docs define freshness rules; no sensitive user data is stored.
- **Priority:** P1
- **Complexity:** M
- **Related Components:** ADR backlog, docs, maintenance tests
- **ADR Needed:** no
- **Score:** 97
- **Status:** ☐ open

### G380 — Backlog Health Issue Snapshot Default Gate

- **Epic:** Continuous Evolution
- **Problem:** Backlog health can validate active goals by default, but GitHub issue snapshot validation still depends on manually passing an optional file.
- **Desired Outcome:** Add a safe documented default workflow or helper that makes issue snapshot validation easy to run before merges without requiring network calls in tests.
- **User Value:** Backlog and GitHub issue drift becomes easier to catch consistently.
- **Acceptance Criteria:** Docs show the exact issue snapshot command; tests cover the documented JSON shape; backlog health output explains when issue snapshot data is omitted; no tokens or issue bodies are stored.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, docs, GitHub Issues
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G381 — Backlog Health Snapshot Cleanup Reminder

- **Epic:** Continuous Evolution
- **Problem:** Issue snapshots are documented as temporary files, but maintainers can still forget to remove local snapshot artifacts after validation.
- **Desired Outcome:** Add a lightweight cleanup reminder or helper for temporary backlog-health issue snapshots.
- **User Value:** Local issue validation remains safe and does not leave stale GitHub metadata lying around.
- **Acceptance Criteria:** Docs or helper explains cleanup after `--issues-json`; tests cover the reminder text or helper output; no issue bodies, tokens or snapshots are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, scripts, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G382 — Backlog Health Issue Snapshot Freshness Hint

- **Epic:** Continuous Evolution
- **Problem:** Local issue snapshots are safe and temporary, but stale snapshots can still be reused accidentally during backlog drift checks.
- **Desired Outcome:** Add a lightweight freshness hint or timestamp workflow for backlog-health issue snapshots without storing issue bodies.
- **User Value:** Maintainers can trust issue drift validation results are based on a recent local export.
- **Acceptance Criteria:** Backlog health docs or output explains how to identify a fresh issue snapshot; tests cover the freshness hint or helper behavior; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G383 — Backlog Health Issue Snapshot Limit Warning

- **Epic:** Continuous Evolution
- **Problem:** The documented issue snapshot command uses `--limit 200`, but maintainers may not notice when the repository approaches that snapshot ceiling.
- **Desired Outcome:** Add a lightweight warning or documented guardrail for issue snapshot limits so issue drift validation does not silently miss older goals.
- **User Value:** Backlog and GitHub issue validation remains trustworthy as the goal catalog grows.
- **Acceptance Criteria:** Backlog health docs or output explains the snapshot limit risk; tests cover the warning text or helper behavior; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G384 — Backlog Health Issue Snapshot Limit CLI Flag

- **Epic:** Continuous Evolution
- **Problem:** The issue snapshot limit warning explains when the limit is hit, but the snapshot command itself is still a hard-coded documentation string.
- **Desired Outcome:** Add a small helper or documented CLI flag that makes the issue snapshot limit configurable in the generated command guidance.
- **User Value:** Maintainers can safely scale issue drift validation without hand-editing commands when the repository grows.
- **Acceptance Criteria:** Docs or backlog-health output shows how to choose a higher issue snapshot limit; tests cover the configurable limit guidance; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G385 — Backlog Health Issue Snapshot Limit Example

- **Epic:** Continuous Evolution
- **Problem:** The configurable issue snapshot limit is available, but maintainers may still miss a concrete higher-limit example for large repositories.
- **Desired Outcome:** Add a clear example workflow that uses a higher issue snapshot limit consistently in export and backlog-health validation.
- **User Value:** Maintainers can copy a safe command sequence when the default 200 issue limit is insufficient.
- **Acceptance Criteria:** Docs or output includes a higher-limit example; tests cover the example text or command guidance; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, scripts, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G386 — Backlog Health Issue Snapshot Duplicate Title Guidance

- **Epic:** Continuous Evolution
- **Problem:** Issue snapshot validation can detect duplicate goal IDs, but maintainers need explicit guidance for old aggregate issue titles that accidentally contain goal IDs.
- **Desired Outcome:** Document or surface a short remediation hint for duplicate goal IDs found in issue snapshot titles.
- **User Value:** Maintainers can quickly fix false duplicate drift without storing issue bodies or guessing which issue title to edit.
- **Acceptance Criteria:** Backlog health output or docs includes duplicate issue-title remediation guidance; tests cover the guidance text; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G387 — Backlog Health Issue Snapshot Duplicate Issue Listing

- **Epic:** Continuous Evolution
- **Problem:** Duplicate issue snapshot findings explain the likely remediation, but the report does not list the matching issue numbers involved.
- **Desired Outcome:** Include duplicate issue numbers or URLs in the duplicate-id finding while keeping snapshot parsing body-free.
- **User Value:** Maintainers can resolve duplicate title drift faster without manually searching GitHub.
- **Acceptance Criteria:** Duplicate issue-snapshot findings include enough sanitized issue identifiers to locate the conflicting issues; tests cover the duplicate issue listing; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G388 — Backlog Health Issue Snapshot Duplicate JSON Shape

- **Epic:** Continuous Evolution
- **Problem:** Duplicate issue listings are visible in markdown output, but automation users also need a stable JSON shape for duplicate issue groups.
- **Desired Outcome:** Document or test the JSON output shape for duplicate issue snapshot groups.
- **User Value:** Future automation can consume duplicate issue details without scraping markdown.
- **Acceptance Criteria:** JSON-mode report exposes sanitized duplicate issue group data; tests cover the JSON-compatible shape; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G389 — Backlog Health Missing Issue JSON Shape

- **Epic:** Continuous Evolution
- **Problem:** JSON automation can consume duplicate issue groups, but missing issue-link findings still require parsing generic finding text.
- **Desired Outcome:** Add or document a stable JSON shape for missing issue-link goals in backlog-health reports.
- **User Value:** Maintainers can build follow-up automation that opens or reconciles missing GitHub Issues without scraping markdown.
- **Acceptance Criteria:** JSON-mode report exposes missing issue-link goal IDs in a structured sanitized field; tests cover the field; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G390 — Backlog Health Closed Issue JSON Shape

- **Epic:** Continuous Evolution
- **Problem:** JSON automation can see missing issue links, but closed-issue status mismatches still require parsing generic finding text.
- **Desired Outcome:** Add or document a stable JSON shape for open backlog goals whose linked issue is not open.
- **User Value:** Maintainers can automate reopening or triaging closed issue drift without scraping markdown.
- **Acceptance Criteria:** JSON-mode report exposes sanitized closed/non-open issue mismatch data; tests cover the field; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G391 — Backlog Health Completed Goal Open Issue JSON Shape

- **Epic:** Continuous Evolution
- **Problem:** JSON automation can inspect open backlog goals with closed issues, but completed backlog goals with still-open issues are only represented as generic findings.
- **Desired Outcome:** Add or document a stable JSON shape for completed backlog goals whose linked GitHub Issue is still open.
- **User Value:** Maintainers can automate issue closure checks without scraping markdown.
- **Acceptance Criteria:** JSON-mode report exposes sanitized completed-goal/open-issue mismatch data; tests cover the field; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G392 — Backlog Health JSON Shape Reference

- **Epic:** Continuous Evolution
- **Problem:** Backlog-health JSON automation fields now exist, but maintainers must infer their stable shape from tests or source code.
- **Desired Outcome:** Add a concise reference for the sanitized backlog-health JSON report fields used by automation.
- **User Value:** Maintainers and future automation can rely on documented field names without reading implementation details.
- **Acceptance Criteria:** Docs list the stable JSON fields for issue snapshot drift; tests or maintenance checks cover the reference; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests, scripts
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G393 — Backlog Health JSON Example Fixture

- **Epic:** Continuous Evolution
- **Problem:** The JSON shape reference lists stable fields, but there is no compact example fixture that shows the report shape for automation consumers.
- **Desired Outcome:** Add a small sanitized example JSON snippet or fixture for backlog-health issue snapshot drift.
- **User Value:** Maintainers can copy and validate automation against a representative report without running GitHub commands.
- **Acceptance Criteria:** Docs or tests include a sanitized example containing duplicate, missing, non-open and completed/open issue groups; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G394 — Backlog Health JSON Example Fixture Sync Test

- **Epic:** Continuous Evolution
- **Problem:** The JSON example fixture is useful for automation, but it can drift from the documented CLI flags and sanitized issue-field boundary.
- **Desired Outcome:** Add a focused maintenance check that keeps the example fixture aligned with the reference commands and allowed issue fields.
- **User Value:** Maintainers can trust the copied example as the report evolves without manually auditing the documentation each time.
- **Acceptance Criteria:** Tests assert the example fixture remains parseable JSON, includes the same issue-snapshot groups as the reference, aligns with the documented 500-limit command, and excludes issue bodies, tokens or local snapshot paths from the fixture body.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G395 — Backlog Health JSON Example Fixture Consumer Notes

- **Epic:** Continuous Evolution
- **Problem:** The JSON example fixture is parseable and synchronized, but automation users still need concise notes on which fields are stable and which report sections are intentionally partial examples.
- **Desired Outcome:** Add short consumer guidance beside the fixture that explains stable fields, omitted fields and how automation should treat arrays as examples rather than exhaustive production data.
- **User Value:** Maintainers can copy the fixture with fewer incorrect assumptions about completeness or sensitive fields.
- **Acceptance Criteria:** Docs explain the fixture consumer boundary, tests cover the presence of the guidance, and no issue bodies, tokens or local snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G396 — Backlog Health JSON Consumer Notes CLI Coverage

- **Epic:** Continuous Evolution
- **Problem:** Consumer notes explain how automation should treat the JSON fixture, but CLI output examples are still only indirectly covered by maintenance-doc tests.
- **Desired Outcome:** Add focused test coverage that ties the documented consumer guidance to the actual `backlog:health --json` output contract.
- **User Value:** Maintainers get earlier failures when the CLI JSON report drifts away from the documented consumer boundary.
- **Acceptance Criteria:** Tests validate the JSON report keeps the documented issue-snapshot groups and sanitized issue fields; docs remain free of issue bodies, tokens and committed snapshot files.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** scripts, tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G397 — Backlog Health JSON Contract Fixture Helper

- **Epic:** Continuous Evolution
- **Problem:** The JSON contract test now builds a representative report inline, but future tests could duplicate bulky backlog and issue fixtures.
- **Desired Outcome:** Extract or document a compact test helper for representative backlog-health issue-snapshot JSON contract fixtures.
- **User Value:** Maintainers can extend contract coverage without copying large markdown snippets or accidentally weakening the privacy boundary.
- **Acceptance Criteria:** Tests use a small helper for representative issue-snapshot contract fixtures; helper keeps bodies/tokens out of expected report output; backlog/docs remain at 100 open goals.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, scripts
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G398 — Backlog Health JSON Contract Fixture Export Guard

- **Epic:** Continuous Evolution
- **Problem:** The representative JSON contract fixture is now reusable in tests, but there is no guard preventing future helpers from writing snapshots or exporting raw fixture payloads.
- **Desired Outcome:** Add a small test or helper assertion that the representative contract fixture stays in-memory and never creates committed or temporary snapshot artifacts.
- **User Value:** Maintainers can expand contract tests without accidentally leaking raw issue payloads or creating cleanup work.
- **Acceptance Criteria:** Tests assert the representative contract helper returns sanitized in-memory data only; no issue bodies, tokens or snapshot files are committed; backlog remains at 100 open goals.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, scripts
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G399 — Backlog Health JSON Contract Fixture Field Matrix

- **Epic:** Continuous Evolution
- **Problem:** The contract fixture now proves sanitized in-memory output, but expected fields are still asserted through scattered object checks.
- **Desired Outcome:** Add a compact field matrix for each issue-snapshot group so contract changes fail with clearer diagnostics.
- **User Value:** Maintainers can see exactly which JSON group changed when future backlog-health automation evolves.
- **Acceptance Criteria:** Tests validate expected top-level and nested fields per issue-snapshot group through a small matrix; no issue bodies, tokens or snapshot files are committed; backlog remains at 100 open goals.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, scripts
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G400 — Backlog Health JSON Contract Matrix Docs Link

- **Epic:** Continuous Evolution
- **Problem:** The JSON contract field matrix exists in tests, but documentation readers cannot easily discover that the reference is backed by a matrix-style contract test.
- **Desired Outcome:** Link or mention the contract matrix test from the JSON reference so maintainers know where to update tests when fields change.
- **User Value:** Maintainers can evolve the JSON contract with less guesswork and fewer missed doc/test updates.
- **Acceptance Criteria:** Docs mention the matrix-backed contract coverage and point to the relevant test file; tests cover the doc reference; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G401 — Backlog Health JSON Contract Matrix Drift Hint

- **Epic:** Continuous Evolution
- **Problem:** The JSON reference now points to the contract matrix, but failed matrix assertions do not yet include a human-readable drift hint in the test source.
- **Desired Outcome:** Add a concise helper or assertion message that explains how to update docs and the matrix together when JSON fields intentionally change.
- **User Value:** Maintainers get clearer next steps when contract tests fail during backlog-health evolution.
- **Acceptance Criteria:** Tests include a reusable drift hint or assertion label for contract-matrix failures; docs remain linked to the matrix; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G402 — Backlog Health JSON Contract Matrix Docs Symmetry

- **Epic:** Continuous Evolution
- **Problem:** The contract matrix now has a drift hint, but the docs do not assert that every documented issue-snapshot group appears in the matrix test source.
- **Desired Outcome:** Add a maintenance assertion that documented issue-snapshot groups and the matrix test groups stay symmetric.
- **User Value:** Maintainers get faster feedback when documentation and contract tests diverge.
- **Acceptance Criteria:** Tests compare documented issue-snapshot group names against the matrix groups; no issue bodies, tokens or snapshot files are committed; backlog remains at 100 open goals.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G403 — Backlog Health JSON Contract Matrix Section Parser

- **Epic:** Continuous Evolution
- **Problem:** The docs/matrix symmetry check extracts matrix groups from a broad regex over the test body, which could become brittle if the test wording changes.
- **Desired Outcome:** Add a tighter parser or marker for the contract matrix section so future maintenance checks are less sensitive to unrelated test text.
- **User Value:** Maintainers can refactor nearby tests without breaking the docs symmetry check accidentally.
- **Acceptance Criteria:** Tests use a focused parser or stable marker for the contract matrix groups; symmetry coverage remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G404 — Backlog Health JSON Contract Matrix Marker Docs

- **Epic:** Continuous Evolution
- **Problem:** The contract matrix parser now relies on stable markers, but the JSON reference does not mention the marker names maintainers should preserve.
- **Desired Outcome:** Document the contract matrix markers in the JSON reference and cover the note with maintenance tests.
- **User Value:** Maintainers can refactor contract tests without accidentally deleting the parser anchors.
- **Acceptance Criteria:** Docs mention the start/end marker names and the linked test file; maintenance tests cover the marker note; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G405 — Backlog Health JSON Contract Marker Negative Fixture

- **Epic:** Continuous Evolution
- **Problem:** The contract matrix marker parser is documented, but there is no negative fixture proving missing markers fail with a clear error.
- **Desired Outcome:** Add a small parser-level negative fixture for missing contract matrix markers.
- **User Value:** Maintainers get immediate feedback if marker anchors are accidentally removed during test refactors.
- **Acceptance Criteria:** Tests cover missing-marker failure with a clear message; marker docs remain covered; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests, docs
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G406 — Backlog Health JSON Contract Marker Error Docs

- **Epic:** Continuous Evolution
- **Problem:** Missing contract matrix markers now fail clearly in tests, but the JSON reference does not document the exact recovery path for that failure.
- **Desired Outcome:** Document how maintainers should restore the start/end markers when the marker parser fails.
- **User Value:** Maintainers can recover quickly from accidental marker deletion during backlog-health test refactors.
- **Acceptance Criteria:** Docs mention the missing-marker failure and recovery action; tests cover the wording; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G407 — Backlog Health JSON Contract Marker Recovery Drift Hint

- **Epic:** Continuous Evolution
- **Problem:** The missing-marker recovery path is now documented, but the parser error and docs wording can drift because the recovery hint is duplicated as free text.
- **Desired Outcome:** Centralize or explicitly align the marker recovery hint so parser errors and documentation stay consistent.
- **User Value:** Maintainers see the same recovery action in failures and docs, reducing confusion during contract-test refactors.
- **Acceptance Criteria:** Tests assert the parser error and documented recovery wording share the same marker names and recovery action; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G408 — Backlog Health JSON Contract Marker Recovery Paragraph Guard

- **Epic:** Continuous Evolution
- **Problem:** The marker recovery action is now aligned between the parser error and docs, but the docs test still checks scattered terms instead of proving the recovery paragraph remains present as a cohesive instruction.
- **Desired Outcome:** Add a focused maintenance helper or assertion that extracts the recovery paragraph and verifies it as a single instruction block.
- **User Value:** Maintainers can edit surrounding contract coverage text without accidentally weakening the recovery guidance.
- **Acceptance Criteria:** Tests extract or otherwise isolate the recovery paragraph; assertions cover the missing-marker error, both markers, recovery action and privacy boundary in that paragraph; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G409 — Backlog Health JSON Contract Marker Recovery Paragraph Negative Fixture

- **Epic:** Continuous Evolution
- **Problem:** The recovery paragraph is now extracted as a cohesive instruction, but there is no negative fixture proving the paragraph extractor fails clearly when the recovery paragraph is removed.
- **Desired Outcome:** Add a parser-level negative fixture for missing recovery paragraph guidance.
- **User Value:** Maintainers get immediate feedback if future doc edits accidentally remove the recovery instructions.
- **Acceptance Criteria:** Tests cover the missing recovery paragraph failure with a clear message; the positive paragraph guard remains in place; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G410 — Backlog Health JSON Contract Recovery Paragraph Privacy Fixture

- **Epic:** Continuous Evolution
- **Problem:** The recovery paragraph negative fixture now fails clearly when guidance is missing, but it does not separately prove the paragraph keeps the privacy boundary against issue snapshots and raw GitHub output.
- **Desired Outcome:** Add a focused assertion that the recovery paragraph preserves the no-snapshot/no-raw-output boundary.
- **User Value:** Maintainers can restore marker guidance without accidentally normalizing committed snapshots or raw GitHub responses.
- **Acceptance Criteria:** Tests isolate the recovery paragraph and assert the privacy boundary text within that paragraph; the missing-paragraph negative fixture remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G411 — Backlog Health JSON Contract Recovery Paragraph Artifact Label Fixture

- **Epic:** Continuous Evolution
- **Problem:** The recovery paragraph now preserves the privacy boundary, but the artifact labels for issue snapshots and raw GitHub output are still asserted as loose strings.
- **Desired Outcome:** Make the recovery paragraph privacy assertions describe the forbidden artifact labels explicitly and consistently.
- **User Value:** Maintainers can understand exactly which artifacts must stay out of recovery fixes and commits.
- **Acceptance Criteria:** Tests use named forbidden artifact labels for issue snapshots and raw GitHub output; assertions remain scoped to the recovery paragraph; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G412 — Backlog Health JSON Contract Recovery Artifact Label Negative Fixture

- **Epic:** Continuous Evolution
- **Problem:** The recovery paragraph now uses named forbidden artifact labels, but there is no negative fixture proving the label assertion fails clearly when one forbidden artifact term is removed.
- **Desired Outcome:** Add a parser-level negative fixture for missing forbidden artifact labels in the recovery paragraph.
- **User Value:** Maintainers get clear feedback if future edits weaken the privacy boundary while leaving the paragraph present.
- **Acceptance Criteria:** Tests cover a missing forbidden artifact label with a clear label-specific message; assertions remain scoped to the recovery paragraph; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G413 — Backlog Health JSON Contract Recovery Artifact Label Docs Hint

- **Epic:** Continuous Evolution
- **Problem:** Missing forbidden artifact labels now fail clearly in tests, but the JSON reference does not explain that the recovery paragraph must preserve those artifact labels.
- **Desired Outcome:** Document that the recovery paragraph must keep the issue-snapshot and raw GitHub output labels.
- **User Value:** Maintainers understand why those labels are asserted and can edit recovery guidance without weakening the privacy boundary.
- **Acceptance Criteria:** Docs mention the forbidden artifact labels in the recovery guidance; maintenance tests cover the wording; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G414 — Backlog Health JSON Contract Recovery Artifact Label Docs Negative Fixture

- **Epic:** Continuous Evolution
- **Problem:** The JSON reference now explains why recovery artifact labels must remain, but there is no negative fixture proving that missing docs-hint wording fails clearly.
- **Desired Outcome:** Add a parser-level negative fixture for missing artifact-label docs hint wording in the recovery paragraph.
- **User Value:** Maintainers get direct feedback if future doc edits keep the labels but remove the explanation for why they matter.
- **Acceptance Criteria:** Tests cover a missing artifact-label docs hint with a clear message; assertions remain scoped to the recovery paragraph; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** docs, tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G415 — Backlog Health JSON Contract Recovery Artifact Docs Hint Constant

- **Epic:** Continuous Evolution
- **Problem:** The artifact-label docs hint now has a negative fixture, but the hint text is still duplicated as free-form literals inside the maintenance test.
- **Desired Outcome:** Centralize the artifact-label docs hint terms so positive and negative assertions cannot drift.
- **User Value:** Maintainers can evolve the recovery guidance with clearer, single-source expectations.
- **Acceptance Criteria:** Tests use named constants for artifact-label docs hint terms; positive and negative assertions reference the same constants; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G416 — Backlog Health JSON Contract Recovery Artifact Docs Hint Label Fixture

- **Epic:** Continuous Evolution
- **Problem:** The artifact docs hint terms are now centralized, but their labels are not asserted, so future diagnostics could become generic again.
- **Desired Outcome:** Add a focused assertion that each artifact docs hint constant has a meaningful diagnostic label.
- **User Value:** Maintainers get actionable failure messages when recovery guidance drifts.
- **Acceptance Criteria:** Tests assert the docs hint constants include stable labels and terms; helper errors remain term-specific; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G417 — Backlog Health JSON Contract Recovery Artifact Docs Hint Label Negative Fixture

- **Epic:** Continuous Evolution
- **Problem:** The artifact docs hint labels are now asserted positively, but there is no negative fixture proving short or generic labels fail clearly.
- **Desired Outcome:** Add a negative fixture for invalid artifact docs hint labels.
- **User Value:** Maintainers keep diagnostic labels actionable instead of letting them regress to vague strings.
- **Acceptance Criteria:** Tests cover an invalid docs hint label with a clear message; positive label fixture remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G418 — Backlog Health JSON Contract Recovery Artifact Docs Hint Term Negative Fixture

- **Epic:** Continuous Evolution
- **Problem:** Invalid artifact docs hint labels now fail clearly, but short or generic hint terms still lack a dedicated negative fixture.
- **Desired Outcome:** Add a negative fixture for invalid artifact docs hint terms.
- **User Value:** Maintainers keep both diagnostic labels and the actual checked wording meaningful.
- **Acceptance Criteria:** Tests cover an invalid docs hint term with a clear message; positive docs hint fixture remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G419 — Backlog Health JSON Contract Recovery Artifact Docs Hint Empty Fixture

- **Epic:** Continuous Evolution
- **Problem:** Short artifact docs hint terms now fail clearly, but empty labels or terms can still rely on the same length guard without a dedicated fixture.
- **Desired Outcome:** Add a negative fixture for empty artifact docs hint labels or terms.
- **User Value:** Maintainers get clear feedback if hint metadata is accidentally blanked out during refactors.
- **Acceptance Criteria:** Tests cover an empty docs hint label or term with a clear message; positive docs hint fixture remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G420 — Backlog Health JSON Contract Recovery Artifact Docs Hint Whitespace Fixture

- **Epic:** Continuous Evolution
- **Problem:** Empty artifact docs hint terms now fail clearly, but whitespace-only labels or terms can still pass the explicit empty guard and rely on length semantics.
- **Desired Outcome:** Add a negative fixture for whitespace-only artifact docs hint labels or terms.
- **User Value:** Maintainers get clear feedback when hint metadata is accidentally blanked with spaces during edits.
- **Acceptance Criteria:** Tests cover a whitespace-only docs hint label or term with a clear message; positive docs hint fixture remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G421 — Backlog Health JSON Contract Recovery Artifact Docs Hint Trimmed Length Fixture

- **Epic:** Continuous Evolution
- **Problem:** Whitespace-only artifact docs hint labels and terms now fail clearly, but labels or terms padded with spaces can still pass length checks based on raw string length.
- **Desired Outcome:** Add a negative fixture proving artifact docs hint label and term length checks use trimmed content.
- **User Value:** Maintainers cannot accidentally make short diagnostic metadata look valid by padding it with spaces.
- **Acceptance Criteria:** Tests cover padded short docs hint labels or terms with clear messages; positive docs hint fixture remains; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G422 — Backlog Health JSON Contract Recovery Artifact Docs Hint Normalization Helper

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint validation now trims labels and terms inline, but the normalization logic is embedded inside the assertion helper.
- **Desired Outcome:** Extract a small normalization helper for artifact docs hint labels and terms.
- **User Value:** Maintainers can evolve diagnostics without duplicating trim semantics across future fixtures.
- **Acceptance Criteria:** Tests cover the normalized helper behavior through the existing assertion fixtures; assertion helper uses the shared normalization helper; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G423 — Backlog Health JSON Contract Recovery Artifact Docs Hint Type Alias

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint validation now has a normalization helper, but the docs hint shape is still repeated as inline `{ label: string; term: string }` object types.
- **Desired Outcome:** Add a named type alias for artifact docs hint metadata and use it in the constants, normalization helper and assertion helper.
- **User Value:** Maintainers get one clear contract for hint metadata when adding future recovery diagnostics.
- **Acceptance Criteria:** Artifact docs hint constants and helpers share a named type alias; existing positive and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G424 — Backlog Health JSON Contract Recovery Artifact Docs Hint Normalized Type Alias

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint metadata now has a named type alias, but the normalized helper return shape is still an inline object type.
- **Desired Outcome:** Add a named type alias for normalized artifact docs hint metadata and use it as the normalization helper return type.
- **User Value:** Maintainers get a clear contract for both raw and normalized docs hint metadata when extending diagnostics.
- **Acceptance Criteria:** Normalization helper return type uses a named alias; existing positive and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G425 — Backlog Health JSON Contract Recovery Artifact Docs Hint Normalized Fixture

- **Epic:** Continuous Evolution
- **Problem:** The normalized artifact docs hint shape now has a named type alias, but there is no direct fixture that proves raw and trimmed fields are preserved as expected.
- **Desired Outcome:** Add a focused fixture for normalized artifact docs hint raw and trimmed values.
- **User Value:** Maintainers can refactor hint normalization without accidentally losing raw diagnostics or trimmed comparison semantics.
- **Acceptance Criteria:** Tests assert normalized rawLabel/rawTerm and label/term values for padded metadata; existing positive and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G426 — Backlog Health JSON Contract Recovery Artifact Docs Hint Error Builder

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint validation now has explicit normalized fixtures, but each error message is still assembled inline inside the assertion helper.
- **Desired Outcome:** Extract a small error-message builder for artifact docs hint validation failures.
- **User Value:** Maintainers can evolve diagnostic wording consistently without duplicating message prefixes.
- **Acceptance Criteria:** Assertion helper uses a shared error-message builder for docs hint failures; existing positive and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G427 — Backlog Health JSON Contract Recovery Artifact Docs Hint Error Builder Fixture

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint validation now uses a shared error-message builder, but the builder itself has no focused fixture proving the diagnostic prefix stays stable.
- **Desired Outcome:** Add a focused fixture for the artifact docs hint error-message builder.
- **User Value:** Maintainers get an immediate signal if future refactors weaken the shared diagnostic prefix.
- **Acceptance Criteria:** Tests assert the builder output for at least one representative reason; existing positive and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G428 — Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Type

- **Epic:** Continuous Evolution
- **Problem:** The artifact docs hint error builder now has a direct fixture, but its reason argument is still an unconstrained string.
- **Desired Outcome:** Add a narrow type alias for artifact docs hint error reasons.
- **User Value:** Maintainers get a clearer contract for allowed diagnostic reason text when extending hint validation.
- **Acceptance Criteria:** Error builder accepts a named reason type; existing builder fixture and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G429 — Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Constants

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint error reasons now have a named type, but repeated reason strings are still assembled inline at validation call sites.
- **Desired Outcome:** Extract reusable constants for common artifact docs hint error reasons.
- **User Value:** Maintainers can evolve validation reasons without duplicating Dutch diagnostic text across branches.
- **Acceptance Criteria:** Common error reasons use named constants; existing builder fixture and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G430 — Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Constants Fixture

- **Epic:** Continuous Evolution
- **Problem:** Artifact docs hint validation now uses shared reason constants, but the constants themselves have no focused fixture proving their stable Dutch diagnostic text.
- **Desired Outcome:** Add a focused fixture for the artifact docs hint error reason constants.
- **User Value:** Maintainers get a direct signal if future edits weaken common diagnostic reason wording.
- **Acceptance Criteria:** Tests assert the shared reason constants include the expected labels for missing and whitespace metadata; existing builder and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☑ klaar

### G431 — Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Reason Fixture

- **Epic:** Continuous Evolution
- **Problem:** Static artifact docs hint error reasons now have a focused fixture, but dynamic reasons for too-short labels or terms are still only covered indirectly through negative fixtures.
- **Desired Outcome:** Add a focused fixture for dynamic artifact docs hint error reasons.
- **User Value:** Maintainers get clearer coverage when changing generated diagnostic text that includes the invalid label or term value.
- **Acceptance Criteria:** Tests assert builder output for a representative dynamic reason with an embedded value; existing builder, constants and negative fixtures remain green; no issue bodies, tokens or snapshot files are committed.
- **Priority:** P1
- **Complexity:** S
- **Related Components:** tests
- **ADR Needed:** no
- **Score:** 103
- **Status:** ☐ open
