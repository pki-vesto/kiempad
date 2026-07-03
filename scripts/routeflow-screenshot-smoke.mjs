#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = Number(process.env.KIEMPAD_ROUTEFLOW_SMOKE_PORT ?? 4179);
const url = `http://${host}:${port}/`;
const passphrase = 'routeflow screenshot smoke passphrase';

const targets = [
  {
    screen: 'start',
    hash: '#start',
    rootSelector: '.content',
    expectedText: 'Eerst één dagactie',
    requiredSelectors: [
      '[data-start-launchpad="ready"]',
      '[data-start-launchpad-region="primary"]',
      '[data-start-primary-day-action="ready"]',
      '[data-start-primary-day-action-route="today"]',
      '[data-start-primary-day-action-route="advice"]',
      '[data-start-primary-day-action-route="agenda"]',
      '#start-dashboard-followup',
      '[data-start-dashboard-followup="collapsed"]',
      '[data-workspace-strip="ready"]',
      '[data-compact-workspace-deck="ready"]',
    ],
    presentSelectors: [
      '[data-start-launchpad-region="header"]',
      '[data-start-launchpad-region="cockpit"]',
      '[data-start-cockpit="ready"]',
      '[data-start-cockpit-panel="focus"]',
      '[data-start-cockpit-panel="record"]',
      '[data-start-cockpit-panel="routes"]',
      '[data-start-cockpit-route="uploads"]',
      '[data-start-cockpit-route="timeline"]',
      '[data-start-cockpit-route="imaging"]',
      '[data-start-cockpit-route="advice"]',
      '[data-start-launchpad-region="deck"]',
      '[data-start-workspace-deck="ready"]',
      '[data-start-workspace-card="today"]',
      '[data-start-workspace-card="record"]',
      '[data-start-workspace-card="insight"]',
      '[data-start-workspace-card="control"]',
      '[data-first-run-setup="collapsed"]',
    ],
    closedDetailsSelectors: [
      '[data-start-dashboard-followup="collapsed"]',
      '[data-first-run-setup="collapsed"]',
    ],
    hiddenSelectors: [
      '[data-workspace-map="ready"]',
      '.workspace-strip__description',
      '.workspace-strip__quick',
    ],
  },
  {
    screen: 'knowledge-research',
    hash: '#kennis?route=read',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Eerst één researchfocus',
    activeRouteSelector: '[data-knowledge-route="read"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '[data-knowledge-single-workspace="ready"]',
      '.knowledge-split-workspace .domain-split-workspace__context',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '#knowledge-route-read',
      '[data-hub-workflow="knowledge-research"]',
      '[data-hub-workflow-tab="research"][aria-current="page"]',
      '[data-hub-workflow-tab="summaries"]',
      '[data-hub-workflow-tab="trends"]',
      '#knowledge-research-primary-focus',
      '[data-knowledge-research-primary-focus="ready"]',
      '#knowledge-research-followup',
      '[data-knowledge-research-followup="collapsed"]',
      '[data-hub-detail-panel="research-summaries"]',
      '[data-knowledge-research-reader="ready"]',
      '[data-knowledge-research-lane="scientific"]',
      '[data-knowledge-research-lane="patient"]',
      '[data-knowledge-research-lane="relevance"]',
      '[data-knowledge-research-lane="trends"]',
      '[data-knowledge-research-disclosure="sources"]',
      '#knowledge-research-trends',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-research-followup="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.knowledge-research-reader__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="research-summaries"] .hub-detail-disclosure__summary small',
    ],
  },
  {
    screen: 'knowledge-library',
    hash: '#kennis?route=library',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Eerst één categoriekeuze',
    activeRouteSelector: '[data-knowledge-route="library"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '[data-knowledge-single-workspace="ready"]',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '#knowledge-route-library',
      '[data-knowledge-route-summary="library"]',
      '#knowledge-library-category-choice',
      '[data-knowledge-library-category-choice="ready"]',
      '[data-knowledge-library-category-card="fasen"]',
      '[data-knowledge-library-category-card="research"]',
      '#knowledge-library-followup',
      '[data-knowledge-library-followup="collapsed"]',
      '#knowledge-library-panel',
      '#knowledge-category-fasen',
      '#knowledge-category-research',
      '[data-knowledge-category="ready"]',
      '[data-knowledge-library-list="ready"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-library-followup="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'start-today-console',
    hash: '#start-today',
    rootSelector: '[data-start-today-route="ready"]',
    expectedText: 'Vandaag console',
    requiredSelectors: [
      '[data-start-today-route="ready"]',
      '[data-start-today-console="ready"]',
      '[data-start-today-console-region="header"]',
      '[data-start-today-console-region="planning"]',
      '[data-start-today-console-region="command"]',
      '[data-start-today-console-region="quick-entry"]',
      '#start-current-phase',
      '#start-next-step',
      '#start-today',
      '#start-quick-entry',
      '.daily-command-board',
      '#quick-entry-form',
    ],
    hiddenSelectors: [
      '[data-start-launchpad="ready"]',
      '[data-start-console="ready"]',
      '[data-start-flow-rail="progressive"]',
    ],
    desktopHiddenSelectors: [
      '.start-today-console__header p:last-child',
      '.start-today-console .command-route-section__header > p:last-child',
      '.start-today-console .summary-panel > .small-print',
    ],
  },
  {
    screen: 'daily-advice-console',
    hash: '#start-recommendations',
    rootSelector: '[data-daily-advice-focus-shell="ready"]',
    expectedText: 'Te doen vandaag',
    openSelectors: ['#start-flow-panel-aanbevelingen'],
    requiredSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-console="ready"]',
      '[data-daily-advice-focus-region="workflow"]',
      '[data-daily-advice-focus-region="workbench"]',
      '[data-daily-advice-focus-region="planner"]',
      '[data-daily-advice-focus-region="list"]',
      '[data-daily-advice-console-region="workflow"]',
      '[data-daily-advice-console-region="workbench"]',
      '[data-daily-advice-console-region="planner"]',
      '[data-daily-advice-console-region="list"]',
      '[data-hub-workflow="daily-recommendations"]',
      '[data-daily-advice-workbench="owner-routes"]',
      '[data-daily-advice-snapshot="ready"]',
      '[data-daily-advice-action-planner="ready"]',
      '[data-daily-advice-action-lane="lifestyle"]',
      '[data-daily-advice-action-lane="nutrition"]',
      '[data-daily-advice-action-lane="supplements"]',
      '[data-daily-advice-action-lane="clinician"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
    ],
    desktopHiddenSelectors: [
      '.daily-advice-focus-shell__header p:last-child',
      '.daily-advice-action-planner__header > p',
      '.hub-workflow-header__copy p',
      '[data-hub-detail-panel="daily-recommendation-list"] .hub-detail-disclosure__summary small',
    ],
    hiddenSelectors: [
      '[data-daily-advice-feedback-workflow-status="ready"]',
      '[data-daily-recommendation-list-filter-header="ready"]',
    ],
    dailyAdviceConsole: true,
  },
  {
    screen: 'daily-advice-feedback-filter-route',
    hash: '#start-recommendations?feedback=artscheck',
    rootSelector: '[data-daily-advice-focus-shell="ready"]',
    expectedText: 'Te doen vandaag',
    openSelectors: ['[data-hub-detail-panel="daily-recommendation-list"]'],
    requiredSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-console="ready"]',
      '[data-daily-advice-focus-region="workflow"]',
      '[data-daily-advice-focus-region="workbench"]',
      '[data-daily-advice-focus-region="planner"]',
      '[data-daily-advice-focus-region="list"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-feedback-workflow-status="ready"]',
      '[data-daily-advice-feedback-list-open="ready"]',
      '[data-daily-advice-feedback-workflow-reset="ready"]',
      '[data-daily-recommendation-list-filter-header="ready"]',
      '[data-daily-recommendation-list-filter-owners="ready"]',
      '[data-daily-recommendation-list-filter-legend="ready"]',
      '[data-daily-recommendation-list-filter-legend-item="accent"]',
      '[data-daily-recommendation-list-filter-legend-item="empty"]',
      '[data-daily-recommendation-list-filter-owner="vrouw"]',
      '[data-daily-recommendation-list-filter-owner="man"]',
      '[data-daily-recommendation-list-filter-owner="samen"]',
      '[data-daily-recommendation-list-filter-owner-state="empty"]',
      '[data-daily-recommendation-list-filter-owner-emphasis="regular"]',
      '[data-daily-recommendation-list-filter-owner-count="0"]',
      '[data-daily-recommendation-list-filter-reset="ready"]',
      '[data-daily-recommendation-feedback-filter="ready"]',
      '[data-daily-recommendation-feedback-filter-chip="ready"]',
      '[data-daily-recommendation-feedback-filter-reset="ready"]',
    ],
    desktopHiddenSelectors: [
      '.daily-advice-focus-shell__header p:last-child',
      '.daily-advice-action-planner__header > p',
      '.hub-workflow-header__copy p',
      '[data-hub-detail-panel="daily-recommendation-list"] .hub-detail-disclosure__summary small',
    ],
    dailyAdviceConsole: true,
    dailyAdviceFeedbackNavigation: true,
  },
  {
    screen: 'dossier-imaging',
    hash: '#dossier?route=imaging',
    rootSelector: '#dossier-route-imaging',
    expectedText: 'Kies eerst je beeldroute',
    activeRouteSelector: '[data-dossier-route="imaging"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    focusLayout: {
      supportSelector: '[data-dossier-focus-region="orientation"]',
      workspaceSelector: '[data-dossier-focus-region="workspace"]',
    },
    requiredSelectors: [
      '[data-hub-workflow="dossier-imaging"]',
      '[data-hub-workflow-tab="imaging"][aria-current="page"]',
      '[data-hub-workflow-tab="embryos"]',
      '[data-hub-workflow-tab="timeline"]',
      '[data-hub-detail-panel="consult-verslagen"]',
      '[data-hub-detail-panel="imaging-repository"]',
      '[data-hub-detail-panel="embryo-dossiers"]',
      '[data-dossier-imaging-inspection-board="ready"]',
      '[data-dossier-imaging-primary-choice="ready"]',
      '[data-dossier-imaging-followup="collapsed"] > .dossier-imaging-followup__summary',
      '[data-dossier-imaging-lane="images"]',
      '[data-dossier-imaging-lane="compare"]',
      '[data-dossier-imaging-lane="embryos"]',
      '[data-dossier-imaging-lane="consults"]',
      '[data-dossier-imaging-disclosure="consults"]',
    ],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-imaging-inspection-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="consult-verslagen"] .hub-detail-disclosure__summary small',
      '[data-hub-detail-panel="imaging-repository"] .hub-detail-disclosure__summary small',
      '[data-hub-detail-panel="embryo-dossiers"] .hub-detail-disclosure__summary small',
    ],
  },
  {
    screen: 'dossier-upload-choice',
    hash: '#dossier',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    requiredSelectors: [
      '[data-dossier-upload-triage="ready"]',
      '[data-dossier-upload-lane="document"]',
      '[data-dossier-upload-lane="consult"]',
      '[data-dossier-upload-lane="imaging"]',
      '[data-dossier-upload-lane="ocr"]',
    ],
    presentSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="keuze"]',
      '[data-dossier-upload-console-region="selector"]',
      '[data-dossier-add-route-choice="ready"]',
    ],
    hiddenSelectors: [
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="keuze"]',
      '[data-dossier-add-route-panel="dossier-upload"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '[data-dossier-add-route-panel="embryo-quality"]',
      '[data-dossier-add-route-panel="embryo-status"]',
      '#dossier-route-review',
    ],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-split-workspace .domain-split-workspace__rail',
      '.dossier-split-workspace .domain-split-workspace__context',
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-upload-triage__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-upload',
    hash: '#dossier-upload-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="document"]',
      '[data-dossier-upload-console-region="document"]',
      '#dossier-upload-form',
      '[data-dossier-upload-group="document-basis"]',
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-optional="koppelingen"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-optional="beeldcontext"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-optional="embryo-labcontext"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-privacy-disclosure="collapsed"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-privacy-disclosure="collapsed"]',
    ],
    desktopHiddenSelectors: [
      '.dossier-split-workspace .domain-split-workspace__rail',
      '.dossier-split-workspace .domain-split-workspace__context',
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-upload-triage__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
    dossierConsole: true,
    uploadConsole: true,
  },
  {
    screen: 'dossier-review',
    hash: '#dossier-route-review',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Controleer eerst wat aandacht vraagt',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: ['[data-dossier-add-route-disclosure="review"]'],
    requiredSelectors: [
      '[data-dossier-review-primary-task="ready"]',
      '[data-dossier-review-followup="collapsed"] > .dossier-review-followup__summary',
      '#dossier-review-queue-disclosure',
      '#dossier-inbox-disclosure',
      '[data-dossier-review-disclosure="queue"]',
      '[data-dossier-review-disclosure="inbox"]',
    ],
    closedDetailsSelectors: ['[data-dossier-review-followup="collapsed"]'],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-search',
    hash: '#dossier?route=search',
    rootSelector: '#dossier-route-search',
    expectedText: 'Dossier zoeken zonder alles te openen',
    activeRouteSelector: '[data-dossier-route="search"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    focusLayout: {
      supportSelector: '[data-dossier-focus-region="orientation"]',
      workspaceSelector: '[data-dossier-focus-region="workspace"]',
    },
    requiredSelectors: [
      '[data-dossier-search-console="ready"]',
      '[data-dossier-search-console-region="search"]',
      '[data-dossier-search-primary-control="ready"]',
      '[data-dossier-search-support="collapsed"] > .dossier-search-support__summary',
      '#dossier-search-form',
      '[data-dossier-search-kit="ready"]',
    ],
    presentSelectors: [
      '[data-dossier-secondary-privacy="collapsed"]',
      '#dossier-route-index-disclosure',
      '[data-dossier-search-console-region="results"]',
      '[data-dossier-search-console-region="privacy"]',
      '[data-dossier-search-console-region="index"]',
    ],
    closedDetailsSelectors: ['[data-dossier-search-support="collapsed"]'],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-timeline',
    hash: '#dossier?route=timeline',
    rootSelector: '#dossier-route-timeline',
    expectedText: 'Begrijp eerst de volgorde',
    activeRouteSelector: '[data-dossier-route="timeline"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    focusLayout: {
      supportSelector: '[data-dossier-focus-region="orientation"]',
      workspaceSelector: '[data-dossier-focus-region="workspace"]',
    },
    requiredSelectors: [
      '[data-hub-workflow="dossier-timeline"]',
      '[data-hub-workflow-tab="timeline"][aria-current="page"]',
      '[data-hub-workflow-tab="history"]',
      '[data-dossier-timeline-primary-focus="ready"]',
      '[data-dossier-timeline-followup="collapsed"] > .dossier-timeline-followup__summary',
      '[data-hub-detail-panel="timeline-documents"]',
      '[data-dossier-timeline-disclosure="documents"]',
      '[data-dossier-timeline-disclosure="history"]',
    ],
    closedDetailsSelectors: ['[data-dossier-timeline-followup="collapsed"]'],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'treatment-context',
    hash: '#traject?route=context',
    rootSelector: '[data-treatment-focus-shell="ready"]',
    expectedText: 'Timeline en graphcontext',
    activeRouteSelector: '[data-treatment-route="context"][data-treatment-route-state="active"]',
    inactiveRouteSelector: '[data-treatment-route-state="inactive"]',
    treatmentConsole: true,
    openSelectors: ['#traject-route-context details'],
    requiredSelectors: [
      '[data-treatment-focus-region="workspace"]',
      '[data-treatment-single-workspace="ready"]',
      '#traject-route-context',
      '[data-fertility-timeline-reader="ready"]',
      '[data-fertility-timeline-console="ready"]',
      '[data-fertility-timeline-console-region="reader"]',
      '[data-fertility-timeline-console-region="controls"]',
      '[data-fertility-timeline-console-region="insights"]',
      '[data-fertility-timeline-console-region="items"]',
      '[data-fertility-timeline-lane="events"]',
      '[data-fertility-timeline-lane="milestones"]',
      '[data-fertility-timeline-lane="context"]',
      '[data-fertility-timeline-lane="export"]',
      '#timeline-filter-form',
      '.timeline-overview-bar',
      '#fertility-timeline-items',
    ],
    desktopHiddenSelectors: [
      '.treatment-focus-shell__header p:last-child',
      '.treatment-route-section__header > p:last-child',
      '.fertility-timeline-reader__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
    timelineConsole: true,
  },
  {
    screen: 'consult-upload',
    hash: '#consult-verslag-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console-region="header"]',
      '[data-dossier-upload-console-region="body"]',
      '[data-dossier-upload-console-region="selector"]',
      '[data-dossier-upload-console-region="consult"]',
      '[data-hub-workflow="consult-upload"]',
      '[data-hub-workflow-tab="consult"][aria-current="page"]',
      '[data-hub-workflow-tab="context"]',
      '[data-hub-workflow-tab="questions"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '#consult-verslag-form',
      '[data-consult-upload-group="consult-basis"]',
      '[data-consult-upload-group="consult-context"]',
    ],
    presentSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-upload-focus-mode="single-flow"][data-dossier-add-flow="consult"]',
    ],
    expectedUploadFlow: 'consult',
    desktopHiddenSelectors: [
      '.dossier-split-workspace .domain-split-workspace__rail',
      '.dossier-split-workspace .domain-split-workspace__context',
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-upload-triage__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
    dossierConsole: true,
    uploadConsole: true,
  },
  {
    screen: 'consult-card-filled',
    hash: '#dossier?route=imaging',
    rootSelector: '[data-hub-detail-panel="consult-verslagen"]',
    expectedText: 'Smoke consultkaart',
    prepare: 'filled-consult-card',
    openSelectors: ['[data-dossier-imaging-followup="collapsed"]', '[data-hub-detail-panel="consult-verslagen"]'],
    requiredSelectors: [
      '.consult-card__status span',
    ],
    presentSelectors: [
      '[data-hub-detail-panel="consult-verslagen"][open]',
      '[data-consult-card="compact"]',
      '.consult-card__header',
      '.consult-card__status',
      '[data-consult-card-section="tekst"]',
      '[data-consult-card-section="samenvatting"]',
      '[data-consult-card-section="actiepunten"]',
      '.consult-summary-source-review',
    ],
    filledConsultCard: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
    ],
  },
  {
    screen: 'question-prep',
    hash: '#vragen?route=voorbereiden',
    rootSelector: '[data-question-focus-shell="ready"]',
    expectedText: 'Consult voorbereiden',
    activeRouteSelector: '[data-question-route="voorbereiden"][data-question-route-state="active"]',
    inactiveRouteSelector: '[data-question-route-state="inactive"]',
    requiredSelectors: [
      '[data-question-focus-region="workspace"]',
      '[data-consult-console="ready"]',
      '[data-consult-console-region="workspace"]',
      '[data-question-split-workspace="ready"]',
      '[data-question-compact-workspace="route-first"]',
      '[data-question-single-workspace="ready"]',
      '.question-split-workspace .domain-split-workspace__context',
      '[data-question-route-summary="voorbereiden"]',
      '[data-consult-prep-board="ready"]',
      '[data-consult-prep-lane="questions"]',
      '[data-consult-prep-lane="actions"]',
      '[data-consult-prep-lane="context"]',
      '[data-consult-prep-lane="packet"]',
      '[data-hub-detail-panel="consult-prep-wizard"]',
      '.consult-detail-panel__header',
    ],
    closedDetailsSelectors: ['#vragen-voorbereiden-volledige-lijst'],
    desktopHiddenSelectors: [
      '.question-focus-shell__header p:last-child',
      '.question-route-section__header > p:last-child',
      '.consult-prep-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="consult-prep-wizard"] .hub-detail-disclosure__summary small',
    ],
    consultConsole: true,
    consultConsoleMode: 'route-first',
  },
  {
    screen: 'wellbeing-history',
    hash: '#welzijn?route=history',
    rootSelector: '[data-wellbeing-focus-shell="ready"]',
    expectedText: 'Kies eerst je welzijnslaag',
    activeRouteSelector: '[data-wellbeing-route="history"][data-wellbeing-route-state="active"]',
    inactiveRouteSelector: '[data-wellbeing-route-state="inactive"]',
    requiredSelectors: [
      '[data-wellbeing-focus-region="workspace"]',
      '[data-wellbeing-console="ready"]',
      '[data-wellbeing-console-region="workspace"]',
      '[data-wellbeing-split-workspace="ready"]',
      '[data-wellbeing-single-workspace="ready"]',
      '.wellbeing-split-workspace .domain-split-workspace__context',
      '[data-wellbeing-route-summary="history"]',
      '[data-wellbeing-history-board="ready"]',
      '[data-wellbeing-history-lane="checkins"]',
      '[data-wellbeing-history-lane="symptoms"]',
      '[data-wellbeing-history-lane="cycle"]',
      '[data-wellbeing-history-lane="trends"]',
      '[data-wellbeing-disclosure="checkins"]',
    ],
    desktopHiddenSelectors: [
      '.wellbeing-focus-shell__header p:last-child',
      '.wellbeing-route-section__header > p:last-child',
      '.wellbeing-history-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
    wellbeingConsole: true,
  },
  {
    screen: 'backup-sync',
    hash: '#backup?route=controleren',
    rootSelector: '#backup-route-controleren',
    expectedText: 'Kies eerst je veilige overdracht',
    activeRouteSelector: '[data-backup-route="controleren"][data-backup-route-state="active"]',
    inactiveRouteSelector: '[data-backup-route-state="inactive"]',
    requiredSelectors: [
      '[data-backup-sync-board="ready"]',
      '[data-backup-sync-lane="status"]',
      '[data-backup-sync-lane="export"]',
      '[data-backup-sync-lane="import"]',
      '[data-backup-sync-lane="recovery"]',
      '[data-backup-reminder-card="ready"]',
      '[data-backup-disclosure="controleren"]',
    ],
    desktopHiddenSelectors: [
      '.backup-focus-shell__header p:last-child',
      '.backup-route-section__header > p:last-child',
      '.backup-sync-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'notifications-planning',
    hash: '#herinneringen?route=plannen',
    rootSelector: '#herinneringen-route-plannen',
    expectedText: 'De standaardtijd is de primaire taak',
    activeRouteSelector:
      '[data-notification-route="plannen"][data-notification-route-state="active"]',
    inactiveRouteSelector: '[data-notification-route-state="inactive"]',
    requiredSelectors: [
      '[data-notification-planning-console="ready"]',
      '[data-notification-planning-region="default-warning"]',
      '#warning-default-form',
      '#herinneringen-custom-reminder',
      '[data-notification-planning-support="collapsed"] > .notification-planning-support__summary',
      '[data-notification-planning-region="custom-reminder"]',
      '#eigen-herinnering-form',
    ],
    closedDetailsSelectors: ['[data-notification-planning-support="collapsed"]'],
    desktopHiddenSelectors: [
      '.notification-focus-shell__header p:last-child',
      '.notification-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
];

const viewports = [
  { label: 'desktop', viewport: { width: 1440, height: 1000 } },
  { label: 'mobile', viewport: { width: 390, height: 844 } },
];

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function runSmoke() {
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('Geen dist/index.html gevonden. Draai eerst: npm run build');
  }

  const preview = spawn(
    'npm',
    ['run', 'preview', '--', '--host', host, '--port', String(port), '--strictPort'],
    {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' },
    },
  );

  try {
    await waitForPreview();
    const browser = await chromium.launch({ headless: true });
    try {
      const results = [];
      for (const options of viewports) {
        results.push(await assertRouteflows(browser, options));
      }

      process.stdout.write(`Routeflow screenshot smoke geslaagd: ${JSON.stringify(results)}\n`);
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview(preview);
  }
}

async function assertRouteflows(browser, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const checked = [];
    for (const target of targets) {
      try {
        await page.goto(`${url}${target.hash}`, { waitUntil: 'networkidle' });
      await unlockIfNeeded(page, target.hash);
      if (target.prepare === 'filled-consult-card') {
        await prepareFilledConsultCard(page, target.hash);
      }
      if (target.openSelectors) {
        await page.evaluate((selectors) => {
          for (const selector of selectors) {
            const details = document.querySelector(selector);
            if (details instanceof HTMLDetailsElement) details.open = true;
          }
        }, target.openSelectors);
      }

      await waitForStableRouteflowRoot(page, target.rootSelector);
      await page.evaluate((selector) => {
        document.querySelector(selector)?.scrollIntoView({ block: 'center', inline: 'nearest' });
      }, target.rootSelector);
      if (target.dailyAdviceFeedbackNavigation) {
        await assertDailyAdviceFeedbackNavigation(page);
      }

      const root = page.locator(target.rootSelector);
      const screenshot = await root.screenshot({ animations: 'disabled' });
      const evidence = await page.evaluate(({ routeflow, viewportLabel }) => {
        const rootElement = document.querySelector(routeflow.rootSelector);
        const rootRect = rootElement?.getBoundingClientRect();
        const appShell = document.querySelector('.app-shell');
        const content = document.querySelector('.content');
        const appShellRect = appShell?.getBoundingClientRect();
        const contentRect = content?.getBoundingClientRect();
        const appShellStyle = appShell ? getComputedStyle(appShell) : null;
        const contentStyle = content ? getComputedStyle(content) : null;
        const required = routeflow.requiredSelectors.map((selector) => {
          const element = rootElement?.matches(selector)
            ? rootElement
            : rootElement?.querySelector(selector);
          const rect = element?.getBoundingClientRect();
          const textNodes = [...(element?.querySelectorAll('span, strong, small, p, h2, h3, em') ?? [])]
            .filter((node) => {
              if (node.closest('.sr-only, [aria-hidden="true"]')) return false;
              const nodeRect = node.getBoundingClientRect();
              if (nodeRect.width <= 0 || nodeRect.height <= 0) return false;
              if (
                (!routeflow.startCommandCenter && !routeflow.dailyAdviceConsole) ||
                viewportLabel !== 'desktop'
              ) {
                return true;
              }
              const region = node.closest(
                '[data-start-focus-region], [data-daily-advice-focus-region]',
              );
              const regionRect = region?.getBoundingClientRect();
              return !regionRect || (nodeRect.top >= regionRect.top && nodeRect.bottom <= regionRect.bottom);
            })
            .map((node) => ({
              clientWidth: node.clientWidth,
              scrollWidth: node.scrollWidth,
              clientHeight: node.clientHeight,
              scrollHeight: node.scrollHeight,
            }));
          return {
            selector,
            visible: Boolean(rect && rect.width > 0 && rect.height > 0),
            textFits: textNodes.every(
              (node) =>
                node.scrollWidth <= node.clientWidth + 1 &&
                node.scrollHeight <= node.clientHeight + 24,
            ),
          };
        });
        const present = (routeflow.presentSelectors ?? []).map((selector) => {
          const element = rootElement?.matches(selector)
            ? rootElement
            : rootElement?.querySelector(selector);
          return { selector, exists: Boolean(element) };
        });
        const inactiveLayouts = routeflow.inactiveRouteSelector
          ? [...document.querySelectorAll(routeflow.inactiveRouteSelector)]
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  id: element.id,
                  hidden: element.hasAttribute('hidden'),
                  display: getComputedStyle(element).display,
                  width: rect.width,
                  height: rect.height,
                };
              })
              .filter(
                (item) =>
                  !item.hidden || item.display !== 'none' || item.width > 0 || item.height > 0,
              )
          : [];
        const activeElement = routeflow.activeRouteSelector
          ? document.querySelector(routeflow.activeRouteSelector)
          : rootElement;
        const activeRect = activeElement?.getBoundingClientRect();
        const hiddenSelectors = [
          ...(routeflow.hiddenSelectors ?? []),
          ...(viewportLabel === 'desktop' ? (routeflow.desktopHiddenSelectors ?? []) : []),
        ];
        const hidden = hiddenSelectors.map((selector) => {
          const element = document.querySelector(selector);
          const rect = element?.getBoundingClientRect();
          return {
            selector,
            visible: Boolean(rect && rect.width > 0 && rect.height > 0),
          };
        });
        const closedDetails = (routeflow.closedDetailsSelectors ?? []).map((selector) => {
          const element = document.querySelector(selector);
          return {
            selector,
            closed: element instanceof HTMLDetailsElement && !element.open,
          };
        });
        const openDetails = routeflow.maxOpenDetails
          ? [...document.querySelectorAll(routeflow.maxOpenDetails.selector)].map((element) => ({
              id: element.id,
              selector: routeflow.maxOpenDetails.selector,
            }))
          : [];
        const focusLayout = routeflow.focusLayout
          ? (() => {
              const support = document.querySelector(routeflow.focusLayout.supportSelector);
              const workspace = document.querySelector(routeflow.focusLayout.workspaceSelector);
              const supportRect = support?.getBoundingClientRect();
              const workspaceRect = workspace?.getBoundingClientRect();
              return {
                supportSelector: routeflow.focusLayout.supportSelector,
                workspaceSelector: routeflow.focusLayout.workspaceSelector,
                supportVisible: Boolean(
                  supportRect && supportRect.width > 0 && supportRect.height > 0,
                ),
                workspaceVisible: Boolean(
                  workspaceRect && workspaceRect.width > 0 && workspaceRect.height > 0,
                ),
                supportWidth: supportRect?.width ?? 0,
                workspaceWidth: workspaceRect?.width ?? 0,
                supportBottom: supportRect?.bottom ?? 0,
                workspaceTop: workspaceRect?.top ?? 0,
              };
            })()
          : null;
        const startCommandCenter = routeflow.startCommandCenter
          ? (() => {
              const workflows = document.querySelector('[data-start-focus-region="workflows"]');
              const scan = document.querySelector('[data-start-focus-region="scan"]');
              const daily = document.querySelector('[data-start-focus-region="daily"]');
              const workflowsRect = workflows?.getBoundingClientRect();
              const scanRect = scan?.getBoundingClientRect();
              const dailyRect = daily?.getBoundingClientRect();
              const workflowsStyle = workflows ? getComputedStyle(workflows) : null;
              const scanStyle = scan ? getComputedStyle(scan) : null;
              const dailyStyle = daily ? getComputedStyle(daily) : null;
              return {
                workflowsVisible: Boolean(
                  workflowsRect && workflowsRect.width > 0 && workflowsRect.height > 0,
                ),
                scanVisible: Boolean(scanRect && scanRect.width > 0 && scanRect.height > 0),
                dailyVisible: Boolean(dailyRect && dailyRect.width > 0 && dailyRect.height > 0),
                workflowsTop: workflowsRect?.top ?? 0,
                scanTop: scanRect?.top ?? 0,
                dailyTop: dailyRect?.top ?? 0,
                workflowsRight: workflowsRect?.right ?? 0,
                scanLeft: scanRect?.left ?? 0,
                scanRight: scanRect?.right ?? 0,
                dailyLeft: dailyRect?.left ?? 0,
                workflowsOverflowY: workflowsStyle?.overflowY ?? '',
                scanOverflowY: scanStyle?.overflowY ?? '',
                dailyOverflowY: dailyStyle?.overflowY ?? '',
                dailyMaxHeight: dailyStyle?.maxHeight ?? '',
              };
            })()
          : null;
        const startConsole = routeflow.startConsole
          ? (() => {
              const shell = document.querySelector('[data-start-console="ready"]');
              const launchpad = document.querySelector('[data-start-console-region="launchpad"]');
              const commandCenter = document.querySelector(
                '[data-start-console-region="commandcenter"]',
              );
              const launchpadRect = launchpad?.getBoundingClientRect();
              const commandCenterRect = commandCenter?.getBoundingClientRect();
              const launchpadStyle = launchpad ? getComputedStyle(launchpad) : null;
              return {
                shellVisible: Boolean(shell),
                launchpadVisible: Boolean(
                  launchpadRect && launchpadRect.width > 0 && launchpadRect.height > 0,
                ),
                commandCenterVisible: Boolean(
                  commandCenterRect && commandCenterRect.width > 0 && commandCenterRect.height > 0,
                ),
                launchpadHeight: launchpadRect?.height ?? 0,
                commandCenterTop: commandCenterRect?.top ?? 0,
                viewportHeight: window.innerHeight,
                launchpadOverflow: launchpadStyle?.overflow ?? '',
                launchpadMaxHeight: launchpadStyle?.maxHeight ?? '',
              };
            })()
          : null;
        const dailyAdviceConsole = routeflow.dailyAdviceConsole
          ? (() => {
              const shell = document.querySelector('[data-daily-advice-console="ready"]');
              const workflow = document.querySelector('[data-daily-advice-focus-region="workflow"]');
              const workbench = document.querySelector('[data-daily-advice-focus-region="workbench"]');
              const planner = document.querySelector('[data-daily-advice-focus-region="planner"]');
              const list = document.querySelector('[data-daily-advice-focus-region="list"]');
              const shellRect = shell?.getBoundingClientRect();
              const workflowRect = workflow?.getBoundingClientRect();
              const workbenchRect = workbench?.getBoundingClientRect();
              const plannerRect = planner?.getBoundingClientRect();
              const listRect = list?.getBoundingClientRect();
              const workflowStyle = workflow ? getComputedStyle(workflow) : null;
              const workbenchStyle = workbench ? getComputedStyle(workbench) : null;
              const plannerStyle = planner ? getComputedStyle(planner) : null;
              const listStyle = list ? getComputedStyle(list) : null;
              return {
                shellVisible: Boolean(shellRect && shellRect.width > 0 && shellRect.height > 0),
                shellTop: shellRect?.top ?? 0,
                viewportHeight: window.innerHeight,
                workflowVisible: Boolean(
                  workflowRect && workflowRect.width > 0 && workflowRect.height > 0,
                ),
                workbenchVisible: Boolean(
                  workbenchRect && workbenchRect.width > 0 && workbenchRect.height > 0,
                ),
                plannerVisible: Boolean(
                  plannerRect && plannerRect.width > 0 && plannerRect.height > 0,
                ),
                listVisible: Boolean(listRect && listRect.width > 0 && listRect.height > 0),
                workflowTop: workflowRect?.top ?? 0,
                workbenchTop: workbenchRect?.top ?? 0,
                plannerTop: plannerRect?.top ?? 0,
                listTop: listRect?.top ?? 0,
                workbenchRight: workbenchRect?.right ?? 0,
                plannerLeft: plannerRect?.left ?? 0,
                workflowOverflowY: workflowStyle?.overflowY ?? '',
                workbenchOverflowY: workbenchStyle?.overflowY ?? '',
                plannerOverflowY: plannerStyle?.overflowY ?? '',
                listOverflowY: listStyle?.overflowY ?? '',
                listMaxHeight: listStyle?.maxHeight ?? '',
              };
            })()
          : null;
        const startLaunchpad = routeflow.startLaunchpad
          ? (() => {
              const header = document.querySelector('[data-start-launchpad-region="header"]');
              const cockpit = document.querySelector('[data-start-launchpad-region="cockpit"]');
              const deck = document.querySelector('[data-start-launchpad-region="deck"]');
              const headerRect = header?.getBoundingClientRect();
              const cockpitRect = cockpit?.getBoundingClientRect();
              const deckRect = deck?.getBoundingClientRect();
              return {
                headerVisible: Boolean(headerRect && headerRect.width > 0 && headerRect.height > 0),
                cockpitVisible: Boolean(
                  cockpitRect && cockpitRect.width > 0 && cockpitRect.height > 0,
                ),
                deckVisible: Boolean(deckRect && deckRect.width > 0 && deckRect.height > 0),
                headerTop: headerRect?.top ?? 0,
                headerRight: headerRect?.right ?? 0,
                deckTop: deckRect?.top ?? 0,
                deckRight: deckRect?.right ?? 0,
                cockpitTop: cockpitRect?.top ?? 0,
                cockpitLeft: cockpitRect?.left ?? 0,
                cockpitBottom: cockpitRect?.bottom ?? 0,
              };
            })()
          : null;
        const uploadConsole = routeflow.uploadConsole
          ? (() => {
              const consoleElement = document.querySelector('[data-dossier-upload-console="ready"]');
              const body = consoleElement?.querySelector('[data-dossier-upload-console-region="body"]');
              const selector = consoleElement?.querySelector('.dossier-add-route-selector');
              const documentPanel = consoleElement?.querySelector(
                '[data-dossier-add-route-panel="dossier-upload"]',
              );
              const consultPanel = consoleElement?.querySelector(
                '[data-dossier-add-route-panel="consult-upload"]',
              );
              const reviewPanel = consoleElement?.querySelector('#dossier-route-review');
              const embryoQualityPanel = consoleElement?.querySelector(
                '[data-dossier-add-route-panel="embryo-quality"]',
              );
              const embryoStatusPanel = consoleElement?.querySelector(
                '[data-dossier-add-route-panel="embryo-status"]',
              );
              const bodyRect = body?.getBoundingClientRect();
              const selectorRect = selector?.getBoundingClientRect();
              const documentRect = documentPanel?.getBoundingClientRect();
              const consultRect = consultPanel?.getBoundingClientRect();
              const reviewRect = reviewPanel?.getBoundingClientRect();
              const embryoQualityRect = embryoQualityPanel?.getBoundingClientRect();
              const embryoStatusRect = embryoStatusPanel?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const documentStyle = documentPanel ? getComputedStyle(documentPanel) : null;
              const consultStyle = consultPanel ? getComputedStyle(consultPanel) : null;
              const reviewStyle = reviewPanel ? getComputedStyle(reviewPanel) : null;
              return {
                bodyVisible: Boolean(bodyRect && bodyRect.width > 0 && bodyRect.height > 0),
                selectorVisible: Boolean(
                  selectorRect && selectorRect.width > 0 && selectorRect.height > 0,
                ),
                documentVisible: Boolean(
                  documentRect && documentRect.width > 0 && documentRect.height > 0,
                ),
                consultVisible: Boolean(
                  consultRect && consultRect.width > 0 && consultRect.height > 0,
                ),
                embryoQualityVisible: Boolean(
                  embryoQualityRect && embryoQualityRect.width > 0 && embryoQualityRect.height > 0,
                ),
                embryoStatusVisible: Boolean(
                  embryoStatusRect && embryoStatusRect.width > 0 && embryoStatusRect.height > 0,
                ),
                reviewVisible: Boolean(reviewRect && reviewRect.width > 0 && reviewRect.height > 0),
                documentTop: documentRect?.top ?? 0,
                consultTop: consultRect?.top ?? 0,
                reviewTop: reviewRect?.top ?? 0,
                documentRight: documentRect?.right ?? 0,
                consultLeft: consultRect?.left ?? 0,
                bodyOverflowY: bodyStyle?.overflowY ?? '',
                documentOverflowY: documentStyle?.overflowY ?? '',
                consultOverflowY: consultStyle?.overflowY ?? '',
                reviewOverflowY: reviewStyle?.overflowY ?? '',
                documentMaxHeight: documentStyle?.maxHeight ?? '',
              };
            })()
          : null;
        const dossierConsole = routeflow.dossierConsole
          ? (() => {
              const body = document.querySelector('[data-dossier-console="ready"]');
              const orientation = document.querySelector('[data-dossier-console-region="orientation"]');
              const workspace = document.querySelector('[data-dossier-console-region="workspace"]');
              const bodyRect = body?.getBoundingClientRect();
              const orientationRect = orientation?.getBoundingClientRect();
              const workspaceRect = workspace?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const orientationStyle = orientation ? getComputedStyle(orientation) : null;
              const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
              return {
                bodyVisible: Boolean(bodyRect && bodyRect.width > 0 && bodyRect.height > 0),
                orientationVisible: Boolean(
                  orientationRect && orientationRect.width > 0 && orientationRect.height > 0,
                ),
                workspaceVisible: Boolean(
                  workspaceRect && workspaceRect.width > 0 && workspaceRect.height > 0,
                ),
                orientationTop: orientationRect?.top ?? 0,
                orientationBottom: orientationRect?.bottom ?? 0,
                workspaceTop: workspaceRect?.top ?? 0,
                orientationRight: orientationRect?.right ?? 0,
                workspaceLeft: workspaceRect?.left ?? 0,
                bodyOverflow: bodyStyle?.overflow ?? '',
                bodyMaxHeight: bodyStyle?.maxHeight ?? '',
                orientationOverflowY: orientationStyle?.overflowY ?? '',
                workspaceOverflowY: workspaceStyle?.overflowY ?? '',
              };
            })()
          : null;
        const knowledgeConsole = routeflow.knowledgeConsole
          ? (() => {
              const body = document.querySelector('[data-knowledge-console="ready"]');
              const workbench = document.querySelector(
                '.knowledge-split-workspace .domain-split-workspace__context',
              );
              const workspace = document.querySelector(
                '.knowledge-split-workspace .domain-split-workspace__main',
              );
              const bodyRect = body?.getBoundingClientRect();
              const workbenchRect = workbench?.getBoundingClientRect();
              const workspaceRect = workspace?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const workbenchStyle = workbench ? getComputedStyle(workbench) : null;
              const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
              return {
                bodyVisible: Boolean(bodyRect && bodyRect.width > 0 && bodyRect.height > 0),
                workbenchVisible: Boolean(
                  workbenchRect && workbenchRect.width > 0 && workbenchRect.height > 0,
                ),
                workspaceVisible: Boolean(
                  workspaceRect && workspaceRect.width > 0 && workspaceRect.height > 0,
                ),
                workbenchTop: workbenchRect?.top ?? 0,
                workbenchLeft: workbenchRect?.left ?? 0,
                workspaceTop: workspaceRect?.top ?? 0,
                workspaceRight: workspaceRect?.right ?? 0,
                workbenchRight: workbenchRect?.right ?? 0,
                workspaceLeft: workspaceRect?.left ?? 0,
                bodyOverflow: bodyStyle?.overflow ?? '',
                bodyMaxHeight: bodyStyle?.maxHeight ?? '',
                workbenchOverflowY: workbenchStyle?.overflowY ?? '',
                workspaceOverflowY: workspaceStyle?.overflowY ?? '',
              };
            })()
          : null;
        const consultConsole = routeflow.consultConsole
          ? (() => {
              const body = document.querySelector('[data-consult-console="ready"]');
              const workbench =
                routeflow.consultConsoleMode === 'route-first'
                  ? document.querySelector(
                      '.question-split-workspace .domain-split-workspace__context',
                    )
                  : document.querySelector('[data-consult-console-region="workbench"]');
              const workspace =
                routeflow.consultConsoleMode === 'route-first'
                  ? document.querySelector('.question-split-workspace .domain-split-workspace__main')
                  : document.querySelector('[data-consult-console-region="workspace"]');
              const bodyRect = body?.getBoundingClientRect();
              const workbenchRect = workbench?.getBoundingClientRect();
              const workspaceRect = workspace?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const workbenchStyle = workbench ? getComputedStyle(workbench) : null;
              const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
              return {
                bodyVisible: Boolean(bodyRect && bodyRect.width > 0 && bodyRect.height > 0),
                workbenchVisible: Boolean(
                  workbenchRect && workbenchRect.width > 0 && workbenchRect.height > 0,
                ),
                workspaceVisible: Boolean(
                  workspaceRect && workspaceRect.width > 0 && workspaceRect.height > 0,
                ),
                workbenchTop: workbenchRect?.top ?? 0,
                workbenchLeft: workbenchRect?.left ?? 0,
                workspaceTop: workspaceRect?.top ?? 0,
                workspaceRight: workspaceRect?.right ?? 0,
                workbenchRight: workbenchRect?.right ?? 0,
                workspaceLeft: workspaceRect?.left ?? 0,
                bodyOverflow: bodyStyle?.overflow ?? '',
                bodyMaxHeight: bodyStyle?.maxHeight ?? '',
                workbenchOverflowY: workbenchStyle?.overflowY ?? '',
                workspaceOverflowY: workspaceStyle?.overflowY ?? '',
              };
          })()
          : null;
        const filledConsultCard = routeflow.filledConsultCard
          ? (() => {
              const card = rootElement?.querySelector('[data-consult-card="compact"]');
              const header = card?.querySelector('.consult-card__header');
              const status = [...(card?.querySelectorAll('.consult-card__status span') ?? [])];
              const sections = [...(card?.querySelectorAll('[data-consult-card-section]') ?? [])].map(
                (section) => section.getAttribute('data-consult-card-section') ?? '',
              );
              const sourceReview = card?.querySelector('.consult-summary-source-review');
              const cardRect = card?.getBoundingClientRect();
              const headerRect = header?.getBoundingClientRect();
              const sourceRect = sourceReview?.getBoundingClientRect();
              const text = card?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                cardVisible: Boolean(cardRect && cardRect.width > 0 && cardRect.height > 0),
                headerVisible: Boolean(headerRect && headerRect.width > 0 && headerRect.height > 0),
                statusChipCount: status.filter((item) => {
                  const rect = item.getBoundingClientRect();
                  return rect.width > 0 && rect.height > 0;
                }).length,
                sections,
                sourceReviewVisible: Boolean(
                  sourceRect && sourceRect.width > 0 && sourceRect.height > 0,
                ),
                hasPayloadLeak: /BASE64|OCR_RAW|CONSULT_RAW|data:application|passphrase|token|diagnose stellen|dosering aanpassen|kansberekening|behandelkeuzeadvies/i.test(
                  text,
                ),
              };
            })()
          : null;
        const wellbeingConsole = routeflow.wellbeingConsole
          ? (() => {
              const body = document.querySelector('[data-wellbeing-console="ready"]');
              const workbench = document.querySelector(
                '.wellbeing-split-workspace .domain-split-workspace__context',
              );
              const workspace = document.querySelector(
                '.wellbeing-split-workspace .domain-split-workspace__main',
              );
              const bodyRect = body?.getBoundingClientRect();
              const workbenchRect = workbench?.getBoundingClientRect();
              const workspaceRect = workspace?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const workbenchStyle = workbench ? getComputedStyle(workbench) : null;
              const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
              return {
                bodyVisible: Boolean(bodyRect && bodyRect.width > 0 && bodyRect.height > 0),
                workbenchVisible: Boolean(
                  workbenchRect && workbenchRect.width > 0 && workbenchRect.height > 0,
                ),
                workspaceVisible: Boolean(
                  workspaceRect && workspaceRect.width > 0 && workspaceRect.height > 0,
                ),
                workbenchTop: workbenchRect?.top ?? 0,
                workspaceTop: workspaceRect?.top ?? 0,
                workbenchLeft: workbenchRect?.left ?? 0,
                workbenchRight: workbenchRect?.right ?? 0,
                workspaceLeft: workspaceRect?.left ?? 0,
                workspaceRight: workspaceRect?.right ?? 0,
                bodyOverflow: bodyStyle?.overflow ?? '',
                bodyMaxHeight: bodyStyle?.maxHeight ?? '',
                workbenchOverflowY: workbenchStyle?.overflowY ?? '',
                workspaceOverflowY: workspaceStyle?.overflowY ?? '',
              };
            })()
          : null;
        const treatmentConsole = routeflow.treatmentConsole
          ? (() => {
              const body = document.querySelector('[data-treatment-console="ready"]');
              const workbench = document.querySelector(
                '.treatment-split-workspace .domain-split-workspace__context',
              );
              const workspace = document.querySelector('[data-treatment-console-region="workspace"]');
              const bodyRect = body?.getBoundingClientRect();
              const workbenchRect = workbench?.getBoundingClientRect();
              const workspaceRect = workspace?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const workbenchStyle = workbench ? getComputedStyle(workbench) : null;
              const workspaceStyle = workspace ? getComputedStyle(workspace) : null;
              return {
                bodyVisible: Boolean(bodyRect && bodyRect.width > 0 && bodyRect.height > 0),
                workbenchVisible: Boolean(
                  workbenchRect && workbenchRect.width > 0 && workbenchRect.height > 0,
                ),
                workspaceVisible: Boolean(
                  workspaceRect && workspaceRect.width > 0 && workspaceRect.height > 0,
                ),
                workbenchTop: workbenchRect?.top ?? 0,
                workspaceTop: workspaceRect?.top ?? 0,
                workbenchRight: workbenchRect?.right ?? 0,
                workspaceLeft: workspaceRect?.left ?? 0,
                bodyOverflow: bodyStyle?.overflow ?? '',
                bodyMaxHeight: bodyStyle?.maxHeight ?? '',
                workbenchOverflowY: workbenchStyle?.overflowY ?? '',
                workspaceOverflowY: workspaceStyle?.overflowY ?? '',
              };
            })()
          : null;
        const timelineConsole = routeflow.timelineConsole
          ? (() => {
              const reader = document.querySelector(
                '[data-fertility-timeline-console-region="reader"]',
              );
              const controls = document.querySelector(
                '[data-fertility-timeline-console-region="controls"]',
              );
              const insights = document.querySelector(
                '[data-fertility-timeline-console-region="insights"]',
              );
              const items = document.querySelector(
                '[data-fertility-timeline-console-region="items"]',
              );
              const readerRect = reader?.getBoundingClientRect();
              const controlsRect = controls?.getBoundingClientRect();
              const insightsRect = insights?.getBoundingClientRect();
              const itemsRect = items?.getBoundingClientRect();
              const readerStyle = reader ? getComputedStyle(reader) : null;
              const controlsStyle = controls ? getComputedStyle(controls) : null;
              const insightsStyle = insights ? getComputedStyle(insights) : null;
              const itemsStyle = items ? getComputedStyle(items) : null;
              return {
                readerVisible: Boolean(readerRect && readerRect.width > 0 && readerRect.height > 0),
                controlsVisible: Boolean(
                  controlsRect && controlsRect.width > 0 && controlsRect.height > 0,
                ),
                insightsVisible: Boolean(
                  insightsRect && insightsRect.width > 0 && insightsRect.height > 0,
                ),
                itemsVisible: Boolean(itemsRect && itemsRect.width > 0 && itemsRect.height > 0),
                readerTop: readerRect?.top ?? 0,
                controlsTop: controlsRect?.top ?? 0,
                insightsTop: insightsRect?.top ?? 0,
                itemsTop: itemsRect?.top ?? 0,
                controlsRight: controlsRect?.right ?? 0,
                itemsLeft: itemsRect?.left ?? 0,
                readerOverflowY: readerStyle?.overflowY ?? '',
                controlsOverflowY: controlsStyle?.overflowY ?? '',
                insightsOverflowY: insightsStyle?.overflowY ?? '',
                itemsOverflowY: itemsStyle?.overflowY ?? '',
                itemsMaxHeight: itemsStyle?.maxHeight ?? '',
              };
            })()
          : null;

        return {
          rootVisible: Boolean(rootRect && rootRect.width > 0 && rootRect.height > 0),
          rootText: rootElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          activeVisible: Boolean(activeRect && activeRect.width > 0 && activeRect.height > 0),
          required,
          present,
          hidden,
          closedDetails,
          openDetails,
          focusLayout,
          startCommandCenter,
          startConsole,
          dailyAdviceConsole,
          startLaunchpad,
          uploadConsole,
          dossierConsole,
          knowledgeConsole,
          consultConsole,
          filledConsultCard,
          wellbeingConsole,
          treatmentConsole,
          timelineConsole,
          appFrame: {
            shellVisible: Boolean(appShellRect && appShellRect.width > 0 && appShellRect.height > 0),
            shellHeight: appShellRect?.height ?? 0,
            viewportHeight: window.innerHeight,
            shellOverflow: appShellStyle?.overflow ?? '',
            contentVisible: Boolean(contentRect && contentRect.width > 0 && contentRect.height > 0),
            contentMaxHeight: contentStyle?.maxHeight ?? '',
            contentOverflowY: contentStyle?.overflowY ?? '',
            contentScrolls: Boolean(content && content.scrollHeight > content.clientHeight + 1),
            bodyScrolls:
              document.documentElement.scrollHeight > document.documentElement.clientHeight + 1 ||
              document.body.scrollHeight > document.body.clientHeight + 1,
          },
          inactiveLayouts,
          horizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
            document.body.scrollWidth > document.body.clientWidth + 1,
        };
      }, { routeflow: target, viewportLabel: options.label });

      if (pageErrors.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: paginafout tijdens routeflow-smoke: ${pageErrors.join('; ')}`,
        );
      }
      if (!evidence.rootVisible || !evidence.rootText.includes(target.expectedText)) {
        throw new Error(`${options.label}/${target.screen}: routeflow-root mist verwachte tekst.`);
      }
      if (!evidence.activeVisible) {
        throw new Error(`${options.label}/${target.screen}: actieve routeflow is niet zichtbaar.`);
      }
      if (
        options.label === 'desktop' &&
        evidence.startLaunchpad &&
        (!evidence.startLaunchpad.headerVisible ||
          !evidence.startLaunchpad.cockpitVisible ||
          !evidence.startLaunchpad.deckVisible ||
          evidence.startLaunchpad.cockpitLeft < evidence.startLaunchpad.headerRight - 1 ||
          evidence.startLaunchpad.deckTop < evidence.startLaunchpad.headerTop - 1 ||
          evidence.startLaunchpad.deckTop < evidence.startLaunchpad.cockpitTop - 1)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: start-launchpad staat niet in compacte dashboardlayout (${JSON.stringify(evidence.startLaunchpad)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        (!evidence.appFrame.shellVisible ||
          Math.abs(evidence.appFrame.shellHeight - evidence.appFrame.viewportHeight) > 1 ||
          evidence.appFrame.shellOverflow !== 'hidden' ||
          !evidence.appFrame.contentVisible ||
          evidence.appFrame.contentOverflowY !== 'auto' ||
          evidence.appFrame.contentMaxHeight === 'none' ||
          evidence.appFrame.bodyScrolls)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: desktop app-workspace is niet begrensd (${JSON.stringify(evidence.appFrame)}).`,
        );
      }
      const missingSelectors = evidence.required.filter((item) => !item.visible);
      if (missingSelectors.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: routeflow-selectors ontbreken: ${missingSelectors
            .map((item) => item.selector)
            .join(', ')}.`,
        );
      }
      const absentSelectors = evidence.present.filter((item) => !item.exists);
      if (absentSelectors.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: gesloten routeflow-selectors ontbreken: ${absentSelectors
            .map((item) => item.selector)
            .join(', ')}.`,
        );
      }
      const visibleHiddenSelectors = evidence.hidden.filter((item) => item.visible);
      if (visibleHiddenSelectors.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: verborgen routeflow-chrome is zichtbaar: ${visibleHiddenSelectors
            .map((item) => item.selector)
            .join(', ')}.`,
        );
      }
      const openClosedDetails = evidence.closedDetails.filter((item) => !item.closed);
      if (openClosedDetails.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: optionele routeflow-details starten open of ontbreken: ${openClosedDetails
            .map((item) => item.selector)
            .join(', ')}.`,
        );
      }
      if (target.maxOpenDetails && evidence.openDetails.length > target.maxOpenDetails.max) {
        throw new Error(
          `${options.label}/${target.screen}: te veel open routeflow-panelen: ${JSON.stringify(
            evidence.openDetails,
          )}.`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.focusLayout &&
        !evidence.dossierConsole &&
        !evidence.knowledgeConsole &&
        !evidence.consultConsole &&
        !evidence.wellbeingConsole &&
        !evidence.treatmentConsole &&
        (!evidence.focusLayout.supportVisible ||
          !evidence.focusLayout.workspaceVisible ||
          evidence.focusLayout.workspaceTop < evidence.focusLayout.supportBottom - 1 ||
          evidence.focusLayout.workspaceWidth < evidence.focusLayout.supportWidth * 0.95)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: focus-workspace staat niet als volle breedte onder compacte supportstrip (${JSON.stringify(evidence.focusLayout)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.startCommandCenter &&
        (!evidence.startCommandCenter.workflowsVisible ||
          !evidence.startCommandCenter.scanVisible ||
          !evidence.startCommandCenter.dailyVisible ||
          Math.abs(
            evidence.startCommandCenter.dailyTop - evidence.startCommandCenter.workflowsTop,
          ) > 2 ||
          evidence.startCommandCenter.scanLeft < evidence.startCommandCenter.workflowsRight - 1 ||
          evidence.startCommandCenter.dailyLeft < evidence.startCommandCenter.scanRight - 1 ||
          evidence.startCommandCenter.workflowsOverflowY !== 'auto' ||
          evidence.startCommandCenter.scanOverflowY !== 'auto' ||
          evidence.startCommandCenter.dailyOverflowY !== 'auto' ||
          evidence.startCommandCenter.dailyMaxHeight === 'none')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: Start command-center staat niet in drie begrensde werkvlakken (${JSON.stringify(evidence.startCommandCenter)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.startConsole &&
        (!evidence.startConsole.shellVisible ||
          !evidence.startConsole.launchpadVisible ||
          !evidence.startConsole.commandCenterVisible ||
          evidence.startConsole.launchpadHeight > evidence.startConsole.viewportHeight * 0.5 ||
          evidence.startConsole.commandCenterTop > evidence.startConsole.viewportHeight * 0.64 ||
          evidence.startConsole.launchpadOverflow !== 'hidden' ||
          evidence.startConsole.launchpadMaxHeight === 'none')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: Start console valt terug naar een hoge eerste laag (${JSON.stringify(evidence.startConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.dailyAdviceConsole &&
        (!evidence.dailyAdviceConsole.shellVisible ||
          !evidence.dailyAdviceConsole.workflowVisible ||
          !evidence.dailyAdviceConsole.workbenchVisible ||
          !evidence.dailyAdviceConsole.plannerVisible ||
          !evidence.dailyAdviceConsole.listVisible ||
          evidence.dailyAdviceConsole.workbenchTop < evidence.dailyAdviceConsole.workflowTop - 1 ||
          Math.abs(
            evidence.dailyAdviceConsole.plannerTop - evidence.dailyAdviceConsole.workbenchTop,
          ) > 2 ||
          evidence.dailyAdviceConsole.plannerLeft < evidence.dailyAdviceConsole.workbenchRight - 1 ||
          evidence.dailyAdviceConsole.listTop < evidence.dailyAdviceConsole.workbenchTop - 1 ||
          evidence.dailyAdviceConsole.shellTop > evidence.dailyAdviceConsole.viewportHeight * 0.28 ||
          evidence.dailyAdviceConsole.workflowOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.workbenchOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.plannerOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.listOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.listMaxHeight === 'none')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: dagadviesroute staat niet in begrensde adviesvlakken (${JSON.stringify(evidence.dailyAdviceConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.uploadConsole &&
        (!evidence.uploadConsole.bodyVisible ||
          !evidence.uploadConsole.selectorVisible ||
          !evidence.uploadConsole[`${target.expectedUploadFlow ?? 'document'}Visible`] ||
          [
            'document',
            'consult',
            'embryoQuality',
            'embryoStatus',
            'review',
          ].some(
            (flow) =>
              flow !== (target.expectedUploadFlow ?? 'document') &&
              evidence.uploadConsole[`${flow}Visible`],
          ) ||
          evidence.uploadConsole.bodyOverflowY !== 'auto')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: upload-console toont niet precies de gekozen werkstroom (${JSON.stringify(evidence.uploadConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.dossierConsole &&
        (!evidence.dossierConsole.bodyVisible ||
          !evidence.dossierConsole.orientationVisible ||
          !evidence.dossierConsole.workspaceVisible ||
          (evidence.dossierConsole.workspaceTop <
            evidence.dossierConsole.orientationBottom - 1 &&
            evidence.dossierConsole.workspaceLeft < evidence.dossierConsole.orientationRight - 1) ||
          evidence.dossierConsole.bodyOverflow !== 'hidden' ||
          evidence.dossierConsole.bodyMaxHeight === 'none' ||
          evidence.dossierConsole.orientationOverflowY !== 'auto' ||
          evidence.dossierConsole.workspaceOverflowY !== 'auto')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: dossier-console staat niet in compacte werkvlakken (${JSON.stringify(evidence.dossierConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.knowledgeConsole &&
        (!evidence.knowledgeConsole.bodyVisible ||
          !evidence.knowledgeConsole.workbenchVisible ||
          !evidence.knowledgeConsole.workspaceVisible ||
          evidence.knowledgeConsole.workbenchTop < evidence.knowledgeConsole.workspaceTop - 1 ||
          evidence.knowledgeConsole.workbenchLeft < evidence.knowledgeConsole.workspaceRight - 1 ||
          evidence.knowledgeConsole.bodyOverflow !== 'hidden' ||
          evidence.knowledgeConsole.bodyMaxHeight === 'none' ||
          evidence.knowledgeConsole.workbenchOverflowY !== 'auto' ||
          evidence.knowledgeConsole.workspaceOverflowY !== 'auto')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: knowledge-console staat niet in compacte werkvlakken (${JSON.stringify(evidence.knowledgeConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.consultConsole &&
        (target.consultConsoleMode === 'route-first'
          ? !evidence.consultConsole.bodyVisible ||
            !evidence.consultConsole.workbenchVisible ||
            !evidence.consultConsole.workspaceVisible ||
            evidence.consultConsole.workbenchTop < evidence.consultConsole.workspaceTop - 1 ||
            evidence.consultConsole.workbenchLeft < evidence.consultConsole.workspaceRight - 1 ||
            evidence.consultConsole.bodyOverflow !== 'hidden' ||
            evidence.consultConsole.bodyMaxHeight === 'none' ||
            evidence.consultConsole.workbenchOverflowY !== 'auto' ||
            evidence.consultConsole.workspaceOverflowY !== 'auto'
          : !evidence.consultConsole.bodyVisible ||
            !evidence.consultConsole.workbenchVisible ||
            !evidence.consultConsole.workspaceVisible ||
            evidence.consultConsole.workspaceTop < evidence.consultConsole.workbenchTop - 1 ||
            evidence.consultConsole.workspaceLeft < evidence.consultConsole.workbenchRight - 1 ||
            evidence.consultConsole.bodyOverflow !== 'hidden' ||
            evidence.consultConsole.bodyMaxHeight === 'none' ||
            evidence.consultConsole.workbenchOverflowY !== 'auto' ||
            evidence.consultConsole.workspaceOverflowY !== 'auto')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: consult-console staat niet in compacte werkvlakken (${JSON.stringify(evidence.consultConsole)}).`,
        );
      }
      if (
        evidence.filledConsultCard &&
        (!evidence.filledConsultCard.cardVisible ||
          !evidence.filledConsultCard.headerVisible ||
          evidence.filledConsultCard.statusChipCount < 3 ||
          !evidence.filledConsultCard.sections.includes('tekst') ||
          !evidence.filledConsultCard.sections.includes('samenvatting') ||
          !evidence.filledConsultCard.sections.includes('actiepunten') ||
          !evidence.filledConsultCard.sourceReviewVisible ||
          evidence.filledConsultCard.hasPayloadLeak)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: gevulde consultkaart mist compacte browser-evidence of lekt gevoelige tekst (${JSON.stringify(evidence.filledConsultCard)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.wellbeingConsole &&
        (!evidence.wellbeingConsole.bodyVisible ||
          !evidence.wellbeingConsole.workbenchVisible ||
          !evidence.wellbeingConsole.workspaceVisible ||
          evidence.wellbeingConsole.workbenchTop < evidence.wellbeingConsole.workspaceTop - 1 ||
          evidence.wellbeingConsole.workbenchLeft < evidence.wellbeingConsole.workspaceRight - 1 ||
          evidence.wellbeingConsole.bodyOverflow !== 'hidden' ||
          evidence.wellbeingConsole.bodyMaxHeight === 'none' ||
          evidence.wellbeingConsole.workbenchOverflowY !== 'auto' ||
          evidence.wellbeingConsole.workspaceOverflowY !== 'auto')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: wellbeing-console staat niet in compacte werkvlakken (${JSON.stringify(evidence.wellbeingConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.treatmentConsole &&
        (!evidence.treatmentConsole.bodyVisible ||
          !evidence.treatmentConsole.workbenchVisible ||
          !evidence.treatmentConsole.workspaceVisible ||
          evidence.treatmentConsole.workbenchTop < evidence.treatmentConsole.workspaceTop - 1 ||
          evidence.treatmentConsole.workbenchLeft < evidence.treatmentConsole.workspaceRight - 1 ||
          evidence.treatmentConsole.bodyOverflow !== 'hidden' ||
          evidence.treatmentConsole.bodyMaxHeight === 'none' ||
          evidence.treatmentConsole.workbenchOverflowY !== 'auto' ||
          evidence.treatmentConsole.workspaceOverflowY !== 'hidden')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: treatment-console staat niet in compacte werkvlakken (${JSON.stringify(evidence.treatmentConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.timelineConsole &&
        (!evidence.timelineConsole.readerVisible ||
          !evidence.timelineConsole.controlsVisible ||
          !evidence.timelineConsole.insightsVisible ||
          !evidence.timelineConsole.itemsVisible ||
          evidence.timelineConsole.controlsTop < evidence.timelineConsole.readerTop - 1 ||
          evidence.timelineConsole.itemsTop < evidence.timelineConsole.readerTop - 1 ||
          evidence.timelineConsole.itemsLeft < evidence.timelineConsole.controlsRight - 1 ||
          evidence.timelineConsole.readerOverflowY !== 'auto' ||
          evidence.timelineConsole.controlsOverflowY !== 'auto' ||
          evidence.timelineConsole.insightsOverflowY !== 'auto' ||
          evidence.timelineConsole.itemsOverflowY !== 'auto' ||
          evidence.timelineConsole.itemsMaxHeight === 'none')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: timeline-console staat niet in begrensde werkvlakken (${JSON.stringify(evidence.timelineConsole)}).`,
        );
      }
      const overflowingText = evidence.required.filter((item) => !item.textFits);
      if (overflowingText.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: routeflow-tekst past niet: ${overflowingText
            .map((item) => item.selector)
            .join(', ')}.`,
        );
      }
      if (evidence.inactiveLayouts.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: inactieve routeflows nemen layout in: ${JSON.stringify(
            evidence.inactiveLayouts,
          )}.`,
        );
      }
      if (evidence.horizontalOverflow) {
        throw new Error(`${options.label}/${target.screen}: routeflow veroorzaakt horizontale overflow.`);
      }
      if (screenshot.byteLength < 2_000) {
        throw new Error(`${options.label}/${target.screen}: screenshot-evidence is te klein.`);
      }

      checked.push({
        screen: target.screen,
        selectors: evidence.required.length,
        screenshotBytes: screenshot.byteLength,
      });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${options.label}/${target.screen}: ${message}`);
      }
    }

    return { viewport: options.label, checked: checked.length, targets: checked };
  } finally {
    await context.close();
  }
}

async function prepareFilledConsultCard(page, targetHash) {
  await page.goto(`${url}#consult-verslag-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#consult-verslag-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');

  await page.locator('#consult-verslag-form [name="datum"]').fill('2026-06-25');
  await page.locator('#consult-verslag-form [name="titel"]').fill('Smoke consultkaart');
  await page
    .locator('#consult-verslag-form [name="tekst"]')
    .fill(
      'Besproken dat het overzicht klaarstaat. Vraag de kliniek naar het vervolg op 2026-06-30. Noteer wie de uitslag belt.',
    );
  await page
    .locator('#consult-verslag-form [name="samenvattingCorrectie"]')
    .fill('Vraag de kliniek naar het vervolg op 2026-06-30 en noteer het antwoord.');
  await page.locator('#consult-verslag-form [name="consultAuteur"]').fill('Voorbeeldarts');
  await page.locator('#consult-verslag-form [name="consultContext"]').fill('Synthetische smoke');
  await page.locator('#consult-verslag-form [name="notitie"]').fill('Demo-notitie zonder payload.');
  await page.locator('#consult-verslag-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const field = document.querySelector('#consult-verslag-form textarea[name="tekst"]');
      return field instanceof HTMLTextAreaElement && field.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
}

async function assertDailyAdviceFeedbackNavigation(page) {
  await openDetails(page, '[data-hub-detail-panel="daily-recommendation-list"]');
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .filter({ hasText: 'Actieve filter: Artscheck' })
    .waitFor({ timeout: 10_000 });
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page.evaluate(() => {
    const details = document.querySelector('[data-hub-detail-panel="daily-recommendation-list"]');
    if (details instanceof HTMLDetailsElement) details.open = false;
  });

  await page.locator('[data-daily-advice-feedback-list-open="ready"]').click();
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page.waitForFunction(
    () => {
      const details = document.querySelector('[data-hub-detail-panel="daily-recommendation-list"]');
      const focusStatus = document.querySelector('[data-daily-advice-list-focus-status="ready"]');
      return (
        details instanceof HTMLDetailsElement &&
        details.open &&
        details.dataset.dailyAdviceListFocus === 'active' &&
        document.activeElement === details &&
        focusStatus?.textContent?.includes('Lijst geopend vanuit de actieve feedbackfilter.')
      );
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.locator('[data-daily-advice-list-focus-close="ready"]').click();
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page
    .locator('[data-daily-advice-list-focus-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page.waitForFunction(
    () => {
      const details = document.querySelector('[data-hub-detail-panel="daily-recommendation-list"]');
      const workflowStatus = document.querySelector(
        '[data-daily-advice-feedback-workflow-status="ready"]',
      );
      return (
        details instanceof HTMLDetailsElement &&
        details.open &&
        !details.dataset.dailyAdviceListFocus &&
        Boolean(workflowStatus)
      );
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.locator('[data-daily-advice-feedback-list-open="ready"]').click();
  await page
    .locator('[data-daily-advice-list-focus-status="ready"]')
    .waitFor({ timeout: 10_000 });
  await page
    .locator('[data-daily-recommendation-list-filter-reset="ready"]')
    .filter({ hasText: 'Wis lokale filter' })
    .waitFor({ timeout: 10_000 });

  await page.locator('[data-daily-recommendation-list-filter-reset="ready"]').click();
  await expectHash(page, '#start-recommendations');
  await page
    .locator('[data-daily-recommendation-reset-route-focus="ready"]')
    .filter({ hasText: 'Lokale feedbackfilter gewist vanuit de lijstfilter.' })
    .waitFor({ timeout: 10_000 });
  await expectDailyRecommendationResetRouteFocus(page, 'Lokale feedbackfilter gewist vanuit de lijstfilter.');
  await page.locator('[data-daily-recommendation-reset-route-focus-close="ready"]').click();
  await expectHash(page, '#start-recommendations');
  await page
    .locator('[data-daily-recommendation-reset-route-focus="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page.evaluate(() => {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await expectHash(page, '#start-recommendations');
  await page
    .locator('[data-daily-recommendation-reset-route-focus="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page
    .locator('[data-daily-advice-feedback-workflow-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page
    .locator('[data-daily-recommendation-list-filter-header="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page
    .locator('[data-daily-advice-list-focus-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });

  await page.goBack({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await openDetails(page, '[data-hub-detail-panel="daily-recommendation-list"]');
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .filter({ hasText: 'Actieve filter: Artscheck' })
    .waitFor({ timeout: 10_000 });
  await page
    .locator('[data-daily-advice-feedback-workflow-reset="ready"]')
    .filter({ hasText: 'Wis lokale filter' })
    .waitFor({ timeout: 10_000 });

  await page.locator('[data-daily-advice-feedback-workflow-reset="ready"]').click();
  await expectHash(page, '#start-recommendations');
  await page
    .locator('[data-daily-recommendation-reset-route-focus="ready"]')
    .filter({ hasText: 'Lokale feedbackfilter gewist vanuit de workflowstatus.' })
    .waitFor({ timeout: 10_000 });
  await expectDailyRecommendationResetRouteFocus(
    page,
    'Lokale feedbackfilter gewist vanuit de workflowstatus.',
  );
  await page
    .locator('[data-daily-advice-feedback-workflow-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page
    .locator('[data-daily-advice-list-focus-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });

  await page.goBack({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await openDetails(page, '[data-hub-detail-panel="daily-recommendation-list"]');
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .filter({ hasText: 'Actieve filter: Artscheck' })
    .waitFor({ timeout: 10_000 });
  await page
    .locator('[data-daily-recommendation-feedback-filter-reset="ready"]')
    .filter({ hasText: 'Wis lokale filter' })
    .waitFor({ timeout: 10_000 });

  await page.locator('[data-daily-recommendation-feedback-filter-reset="ready"]').click();
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await expectHash(page, '#start-recommendations');
  await page
    .locator('[data-daily-recommendation-reset-route-focus="ready"]')
    .filter({ hasText: 'Lokale feedbackfilter gewist vanuit het filterformulier.' })
    .waitFor({ timeout: 10_000 });
  await expectDailyRecommendationResetRouteFocus(
    page,
    'Lokale feedbackfilter gewist vanuit het filterformulier.',
  );
  await page
    .locator('[data-daily-advice-feedback-workflow-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });

  await page.goBack({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await openDetails(page, '[data-hub-detail-panel="daily-recommendation-list"]');
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .filter({ hasText: 'Actieve filter: Artscheck' })
    .waitFor({ timeout: 10_000 });

  await page.goForward({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await expectHash(page, '#start-recommendations');
  await page
    .locator('[data-daily-advice-feedback-workflow-status="ready"]')
    .waitFor({ state: 'hidden', timeout: 10_000 });

  await page.goBack({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await openDetails(page, '[data-hub-detail-panel="daily-recommendation-list"]');
  await expectHash(page, '#start-recommendations?feedback=artscheck');
  await page
    .locator('[data-daily-recommendation-feedback-filter-chip="ready"]')
    .filter({ hasText: 'Actieve filter: Artscheck' })
    .waitFor({ timeout: 10_000 });

  const rootText = await page.locator('[data-daily-advice-focus-shell="ready"]').innerText();
  const verbodenPayloads = ['tracking-payload', 'trackingpayload', 'treatmentchoiceadvice'];
  const gevondenPayload = verbodenPayloads.find((tekst) =>
    rootText.toLowerCase().includes(tekst),
  );
  if (gevondenPayload) {
    throw new Error(`dagadvies feedbackfilter toont verboden payloadtekst: ${gevondenPayload}`);
  }
}

async function openDetails(page, selector) {
  await page.evaluate((detailsSelector) => {
    const details = document.querySelector(detailsSelector);
    if (details instanceof HTMLDetailsElement) details.open = true;
  }, selector);
}

async function expectDailyRecommendationResetRouteFocus(page, expectedText) {
  await page.waitForFunction(
    (tekst) => {
      const status = document.querySelector(
        '[data-daily-recommendation-reset-route-focus="ready"]',
      );
      const pastHorizontaalInViewport = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        const box = element.getBoundingClientRect();
        return box.left >= 0 && box.right <= window.innerWidth;
      };
      return (
        status instanceof HTMLElement &&
        status.tabIndex === -1 &&
        document.activeElement === status &&
        status.textContent?.includes(tekst) &&
        pastHorizontaalInViewport(status) &&
        pastHorizontaalInViewport(
          status.querySelector('[data-daily-recommendation-reset-route-focus-close="ready"]'),
        )
      );
    },
    expectedText,
    { timeout: 10_000 },
  );
}

async function expectHash(page, expectedHash) {
  await page.waitForFunction(
    (hash) => window.location.hash === hash,
    expectedHash,
    { timeout: 10_000 },
  );
}

async function unlockIfNeeded(page, hash) {
  const passInput = page.locator('#passphrase, #vault-passphrase').first();
  if (!(await passInput.isVisible().catch(() => false))) return;

  await passInput.fill(passphrase);
  await page.locator('button[type="submit"]').first().click();
  await page.locator('.app-shell').waitFor({ timeout: 10_000 });

  const firstRunButton = page.locator('#first-run-complete-form button[type="submit"]').first();
  if (await firstRunButton.isVisible().catch(() => false)) {
    await firstRunButton.click();
    await page.locator('.app-shell').waitFor({ timeout: 10_000 });
  }

  await page.evaluate((nextHash) => {
    window.location.hash = nextHash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, hash);
}

async function waitForStableRouteflowRoot(page, selector) {
  await page.waitForFunction(
    (rootSelector) => {
      const root = document.querySelector(rootSelector);
      const loadingPanel = document.querySelector('[data-screen-loading="true"]');
      return Boolean(root?.isConnected && !loadingPanel);
    },
    selector,
    { timeout: 10_000 },
  );
}

async function waitForPreview() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return;
    } catch {
      // Preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite preview reageert niet op ${url}`);
}

function stopPreview(preview) {
  if (preview.killed || preview.pid === undefined) return;
  try {
    process.kill(-preview.pid, 'SIGTERM');
  } catch {
    preview.kill('SIGTERM');
  }
}

runSmoke().catch((error) => {
  fail(error instanceof Error ? error.message : 'Routeflow screenshot smoke is mislukt.');
});
