#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = Number(process.env.KIEMPAD_ROUTEFLOW_SMOKE_PORT ?? 4179);
const url = `http://${host}:${port}/`;
const passphrase = 'routeflow screenshot smoke passphrase';
const attachmentEnvelopeEvidencePrivacyPattern =
  /routeflow|\.pdf|\.jpg|\.jpeg|base64|OCR|diagnose|behandelkeuzeadvies/i;

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
    expectedText: 'Researchlaag openen',
    activeRouteSelector: '[data-knowledge-route="read"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '[data-knowledge-single-workspace="ready"]',
      '[data-knowledge-task-route-choice="collapsed"]',
      '.knowledge-split-workspace .domain-split-workspace__context',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '#knowledge-route-read',
      '[data-hub-workflow="knowledge-research"]',
      '[data-knowledge-research-workflow-choice="collapsed"]',
      '[data-knowledge-route-summary="read"]',
      '[data-knowledge-research-route-status-choice="collapsed"]',
      '#knowledge-research-primary-focus',
      '[data-knowledge-research-primary-focus="ready"]',
      '#knowledge-research-followup',
      '[data-knowledge-research-followup="collapsed"]',
      '[data-knowledge-research-followup-context-choice="collapsed"]',
      '[data-knowledge-research-context-choice="collapsed"]',
      '[data-knowledge-research-detail-choice="collapsed"]',
      '[data-knowledge-research-reader="ready"]',
      '[data-knowledge-research-lane-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-task-routes="ready"]',
      '[data-command-task-routes="ready"]',
      'a[href="#kennis?route=read"]',
      'a[href="#kennis?route=add"]',
      'a[href="#kennis?route=ai"]',
      'a[href="#kennis?route=library"]',
      '[data-hub-workflow-tabs="knowledge-research"]',
      '[data-hub-workflow-tab="research"][aria-current="page"]',
      '[data-hub-workflow-tab="summaries"]',
      '[data-hub-workflow-tab="trends"]',
      '[data-hub-workflow-tab="add"]',
      'a[href="#knowledge-research-primary-focus"]',
      'a[href="#knowledge-research-followup"]',
      '.command-route-summary__status',
      '[data-knowledge-research-lane="scientific"]',
      '[data-knowledge-research-lane="patient"]',
      '[data-knowledge-research-lane="relevance"]',
      '[data-knowledge-research-lane="trends"]',
      '[data-hub-detail-panel="research-summaries"]',
      '[data-knowledge-research-summaries-choice="collapsed"]',
      '[data-research-summary-component="scientific-list"]',
      '[data-research-summary-component="patient-list"]',
      '[data-knowledge-research-disclosure="sources"]',
      '[data-knowledge-research-sources-choice="collapsed"]',
      '[data-research-source-component="source-list"]',
      '#knowledge-research-trends',
      '[data-knowledge-research-trends-choice="collapsed"]',
      '[data-research-trend-dashboard="ready"]',
      '[data-research-trend-scan-density="mobile-compact"]',
      '[data-research-relevance-panel="ready"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-task-route-choice="collapsed"]',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-research-workflow-choice="collapsed"]',
      '[data-knowledge-research-route-status-choice="collapsed"]',
      '[data-knowledge-research-lane-choice="collapsed"]',
      '[data-knowledge-research-followup="collapsed"]',
      '[data-knowledge-research-followup-context-choice="collapsed"]',
      '[data-knowledge-research-context-choice="collapsed"]',
      '[data-knowledge-research-detail-choice="collapsed"]',
      '[data-knowledge-research-sources-choice="collapsed"]',
      '[data-knowledge-research-summaries-choice="collapsed"]',
      '[data-knowledge-research-trends-choice="collapsed"]',
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
    screen: 'knowledge-scan',
    hash: '#kennis?route=read',
    rootSelector: '.content',
    expectedText: 'Kies researchscan',
    openSelectors: ['[data-knowledge-workbench-disclosure="collapsed"]'],
    requiredSelectors: [
      '[data-knowledge-research-scan-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-research-snapshot-choice="collapsed"]',
      '[data-knowledge-research-snapshot="ready"]',
      '[data-knowledge-research-snapshot-card="sources"]',
      '[data-knowledge-research-snapshot-card="summaries"]',
      '[data-knowledge-research-snapshot-card="trends"]',
      '[data-knowledge-research-snapshot-card="network"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-research-scan-choice="collapsed"]',
      '[data-knowledge-research-snapshot-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-research-trend-scan',
    hash: '#kennis?route=read',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Researchtrends',
    openSelectors: [
      '[data-knowledge-research-detail-choice="collapsed"]',
      '[data-knowledge-research-trends-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-research-trend-dashboard="ready"]',
      '[data-research-trend-scan="ready"]',
      '[data-research-trend-scan-density="mobile-compact"]',
      '[data-research-trend-grid="ready"]',
    ],
    presentSelectors: [
      '[data-research-trend-scan-card="topics"]',
      '[data-research-trend-scan-card="publications"]',
      '[data-research-trend-scan-card="sources"]',
      '[data-research-trend-scan-card="latest"]',
      '[data-research-trend-card]',
      '[data-research-trend-item]',
      '[data-research-source-component="source-list"]',
      '#research-item-form',
      '#research-network-form',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-task-route-choice="collapsed"]',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-research-workflow-choice="collapsed"]',
      '[data-knowledge-research-route-status-choice="collapsed"]',
      '[data-knowledge-research-lane-choice="collapsed"]',
      '[data-knowledge-research-followup="collapsed"]',
      '[data-knowledge-research-followup-context-choice="collapsed"]',
      '[data-knowledge-research-sources-choice="collapsed"]',
      '[data-knowledge-research-summaries-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    researchTrendScanOverflow: true,
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
    screen: 'knowledge-status',
    hash: '#kennis?route=read',
    rootSelector: '.content',
    expectedText: 'Kies werkbankstatus',
    openSelectors: ['[data-knowledge-workbench-disclosure="collapsed"]'],
    requiredSelectors: [
      '[data-knowledge-workbench-status-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-workbench-metrics-choice="collapsed"]',
      '[data-knowledge-workbench-status-metrics="ready"]',
      '.knowledge-research-workbench__status',
      '.knowledge-workbench-status-choice__body .stat-row',
      '.knowledge-workbench-status-choice__body .stat__value',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-status-choice="collapsed"]',
      '[data-knowledge-workbench-metrics-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-filter',
    hash: '#kennis?route=read',
    rootSelector: '.content',
    expectedText: 'Kennisbank',
    openSelectors: ['[data-knowledge-workbench-disclosure="collapsed"]'],
    requiredSelectors: [
      '[data-knowledge-filter-choice="collapsed"]',
      '[data-knowledge-filter-form-choice="collapsed"]',
    ],
    presentSelectors: [
      '#knowledge-filter-form',
      '[data-knowledge-filter-kit="ready"]',
      '[data-knowledge-filter-status-detail="ready"]',
      '[data-knowledge-filter-fields-choice="collapsed"]',
      '.knowledge-filter-kit__fields',
      '.knowledge-filter-kit__actions',
      'input[name="kennisZoekterm"]',
      'select[name="kennisCategorie"]',
      'input[name="kennisBronFilter"]',
      'select[name="kennisVerificatie"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-filter-form-choice="collapsed"]',
      '[data-knowledge-filter-fields-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-filter-status',
    hash: '#kennis?route=read',
    rootSelector: '.content',
    expectedText: 'Filterstatus bekijken',
    openSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-filter-form-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-filter-status-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-filter-status-detail-choice="collapsed"]',
      '[data-knowledge-filter-status-detail="ready"]',
      '.knowledge-filter-kit__actions button[name="filterAction"][value="clear"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-filter-status-choice="collapsed"]',
      '[data-knowledge-filter-status-detail-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-library',
    hash: '#kennis?route=library',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Bibliotheekstatus openen',
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
      '[data-knowledge-library-route-status-choice="collapsed"]',
      '#knowledge-library-category-choice',
      '[data-knowledge-library-category-choice="ready"]',
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '#knowledge-library-followup',
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-context-choice="collapsed"]',
    ],
    presentSelectors: [
      'a[href="#knowledge-library-category-choice"]',
      'a[href="#knowledge-library-followup"]',
      '.command-route-summary__status',
      '[data-knowledge-library-action-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-category-card-followup-choice="collapsed"]',
      '[data-knowledge-library-category-card="fasen"]',
      '[data-knowledge-library-category-card="research"]',
      '#knowledge-library-panel',
      '#knowledge-category-fasen',
      '#knowledge-category-research',
      '[data-knowledge-category="ready"]',
      '[data-knowledge-library-list="ready"]',
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-context-panel-choice="collapsed"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-library-route-status-choice="collapsed"]',
      '[data-knowledge-library-action-choice="collapsed"]',
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-category-card-followup-choice="collapsed"]',
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-context-choice="collapsed"]',
      '[data-knowledge-library-context-panel-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'knowledge-library-actions',
    hash: '#kennis?route=library',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Bibliotheekactie kiezen',
    activeRouteSelector: '[data-knowledge-route="library"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    openSelectors: ['[data-knowledge-library-route-status-choice="collapsed"]'],
    requiredSelectors: ['[data-knowledge-library-action-choice="collapsed"]'],
    presentSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '#knowledge-route-library',
      '[data-knowledge-route-summary="library"]',
      '[data-knowledge-library-route-status-choice="collapsed"]',
      '.command-route-summary__status',
      'a[href="#knowledge-library-category-choice"]',
      'a[href="#knowledge-library-followup"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-library-action-choice="collapsed"]',
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-category-card-followup-choice="collapsed"]',
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-context-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
    ],
  },
  {
    screen: 'knowledge-library-category-cards',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Kaartgroep openen',
    openSelectors: ['[data-knowledge-library-category-card-choice="collapsed"]'],
    requiredSelectors: ['[data-knowledge-library-category-card-grid-choice="collapsed"]'],
    presentSelectors: [
      '[data-knowledge-library-category-card-followup-choice="collapsed"]',
      '[data-knowledge-library-category-card="fasen"]',
      '[data-knowledge-library-category-card="research"]',
      'a[href="#knowledge-category-fasen"]',
      'a[href="#knowledge-category-research"]',
      '#knowledge-library-followup',
    ],
    closedDetailsSelectors: ['[data-knowledge-library-category-card-grid-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-library-category-followup',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Vervolgankers openen',
    openSelectors: [
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
    ],
    requiredSelectors: ['[data-knowledge-library-category-card-followup-choice="collapsed"]'],
    presentSelectors: [
      '[data-knowledge-library-category-followup-anchor="fasen"]',
      '[data-knowledge-library-category-followup-anchor="research"]',
      '[data-knowledge-library-category-followup-anchor="followup"]',
      '[data-knowledge-library-category-followup-anchor="visibility"]',
    ],
    closedDetailsSelectors: ['[data-knowledge-library-category-card-followup-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-library-category-followup-anchors',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Vervolgcontext',
    openSelectors: [
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-category-card-followup-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-library-category-followup-anchor="fasen"]',
      '[data-knowledge-library-category-followup-anchor="research"]',
      '[data-knowledge-library-category-followup-anchor="followup"]',
      '[data-knowledge-library-category-followup-anchor="visibility"]',
    ],
    presentSelectors: [
      '[data-knowledge-library-category-card="fasen"]',
      '[data-knowledge-library-category-card="research"]',
      '#knowledge-library-followup',
    ],
  },
  {
    screen: 'knowledge-library-followup-visibility',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Zichtbaarheid samenvatten',
    openSelectors: ['[data-knowledge-library-followup="collapsed"]'],
    requiredSelectors: ['[data-knowledge-library-followup-visibility-choice="collapsed"]'],
    presentSelectors: [
      '[data-knowledge-library-context-choice="collapsed"]',
      '[data-knowledge-library-followup-visibility-status="visible"]',
      '[data-knowledge-library-followup-visibility-anchor="category"]',
      '[data-knowledge-library-followup-visibility-anchor="list"]',
      '[data-knowledge-library-followup-visibility-anchor="cards"]',
    ],
    closedDetailsSelectors: ['[data-knowledge-library-followup-visibility-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-library-followup-visibility-anchors',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Categoriekeuze',
    openSelectors: [
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-library-followup-visibility-status="visible"]',
      '[data-knowledge-library-followup-visibility-anchor="category"]',
      '[data-knowledge-library-followup-visibility-anchor="list"]',
      '[data-knowledge-library-followup-visibility-anchor="cards"]',
    ],
    presentSelectors: [
      '[data-knowledge-library-context-choice="collapsed"]',
      '[data-knowledge-library-list="ready"]',
      '[data-knowledge-library-card="ready"]',
    ],
  },
  {
    screen: 'knowledge-library-context',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Bibliotheekcontext openen',
    openSelectors: [
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-context-choice="collapsed"]',
    ],
    requiredSelectors: ['[data-knowledge-library-context-panel-choice="collapsed"]'],
    presentSelectors: [
      '#knowledge-library-panel',
      '#knowledge-category-fasen',
      '#knowledge-category-research',
      '[data-knowledge-library-list="ready"]',
      '[data-knowledge-library-card="ready"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-context-panel-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-library-list',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Bibliotheeklijst openen',
    openSelectors: [
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-context-choice="collapsed"]',
      '[data-knowledge-library-context-panel-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-library-list-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-library-list-items-choice="collapsed"]',
      '[data-knowledge-library-list="ready"]',
      '[data-knowledge-library-card="ready"]',
      '.knowledge-library-card__actions',
      '[data-knowledge-library-category-card="research"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-list-choice="collapsed"]',
      '[data-knowledge-library-list-items-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-library-card',
    hash: '#kennis?route=library',
    rootSelector: '.content',
    expectedText: 'Kaartdetails openen',
    openSelectors: [
      '[data-knowledge-library-category-card-choice="collapsed"]',
      '[data-knowledge-library-category-card-grid-choice="collapsed"]',
      '[data-knowledge-library-followup="collapsed"]',
      '[data-knowledge-library-context-choice="collapsed"]',
      '[data-knowledge-library-context-panel-choice="collapsed"]',
      '[data-knowledge-library-list-choice="collapsed"]',
      '[data-knowledge-library-list-items-choice="collapsed"]',
      '[data-knowledge-library-card-detail-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-library-card-detail-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-library-card-content-choice="collapsed"]',
      '.knowledge-library-card__body',
      '.knowledge-library-card__source',
      '.knowledge-library-card__badges',
      '.knowledge-library-card__actions',
      '[data-status-badge="knowledge"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-library-followup-visibility-choice="collapsed"]',
      '[data-knowledge-library-card-content-choice="collapsed"]',
    ],
  },
  {
    screen: 'knowledge-add',
    hash: '#kennis?route=add',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Toevoegstatus openen',
    activeRouteSelector: '[data-knowledge-route="add"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '[data-knowledge-single-workspace="ready"]',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '#knowledge-route-add',
      '[data-knowledge-route-summary="add"]',
      '[data-knowledge-add-route-status-choice="collapsed"]',
      '[data-knowledge-add-layout="single-input"]',
      '[data-knowledge-add-primary="research"]',
      '[data-knowledge-add-research-input-choice="collapsed"]',
      '#knowledge-own-item-disclosure',
      '[data-knowledge-add-followup="own-item"]',
      '[data-knowledge-add-context-choice="collapsed"]',
    ],
    presentSelectors: [
      'a[href="#research-item-form"]',
      'a[href="#knowledge-own-item-disclosure"]',
      '.command-route-summary__status',
      '[data-knowledge-add-action-choice="collapsed"]',
      '#research-item-form',
      '[data-knowledge-add-secondary="own-item"]',
      '[data-knowledge-add-own-item-choice="collapsed"]',
      '#knowledge-item-form',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-add-route-status-choice="collapsed"]',
      '[data-knowledge-add-action-choice="collapsed"]',
      '[data-knowledge-add-research-input-choice="collapsed"]',
      '[data-knowledge-add-followup="own-item"]',
      '[data-knowledge-add-context-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'knowledge-add-actions',
    hash: '#kennis?route=add',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Vervolgactie kiezen',
    activeRouteSelector: '[data-knowledge-route="add"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    openSelectors: ['[data-knowledge-add-route-status-choice="collapsed"]'],
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '#knowledge-route-add',
      '[data-knowledge-route-summary="add"]',
      '[data-knowledge-add-route-status-choice="collapsed"]',
      '[data-knowledge-add-action-choice="collapsed"]',
    ],
    presentSelectors: [
      '.command-route-summary__status',
      'a[href="#research-item-form"]',
      'a[href="#knowledge-own-item-disclosure"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-add-action-choice="collapsed"]',
      '[data-knowledge-add-research-input-choice="collapsed"]',
      '[data-knowledge-add-followup="own-item"]',
      '[data-knowledge-add-context-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
    ],
  },
  {
    screen: 'knowledge-add-own-item',
    hash: '#kennis?route=add',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Itemvelden openen',
    activeRouteSelector: '[data-knowledge-route="add"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    openSelectors: [
      '[data-knowledge-add-followup="own-item"]',
      '[data-knowledge-add-context-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '#knowledge-route-add',
      '#knowledge-own-item-disclosure',
      '[data-knowledge-add-followup="own-item"]',
      '[data-knowledge-add-context-choice="collapsed"]',
      '[data-knowledge-add-secondary="own-item"]',
      '[data-knowledge-add-own-item-choice="collapsed"]',
    ],
    presentSelectors: ['#knowledge-item-form'],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-add-route-status-choice="collapsed"]',
      '[data-knowledge-add-research-input-choice="collapsed"]',
      '[data-knowledge-add-own-item-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'knowledge-ai',
    hash: '#kennis?route=ai',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'AI-routestatus openen',
    activeRouteSelector: '[data-knowledge-route="ai"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    requiredSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '[data-knowledge-single-workspace="ready"]',
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '#knowledge-route-ai',
      '[data-knowledge-route-summary="ai"]',
      '[data-knowledge-ai-route-status-choice="collapsed"]',
      '[data-knowledge-ai-console="ready"]',
      '[data-knowledge-ai-console-region="preview"]',
      '[data-knowledge-ai-preview-choice="collapsed"]',
      '#knowledge-ai-support',
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
    ],
    presentSelectors: [
      'a[href="#ai-preview-form"]',
      'a[href="#knowledge-ai-support"]',
      '.command-route-summary__status',
      '[data-knowledge-ai-action-choice="collapsed"]',
      '#ai-preview-form',
      '[data-knowledge-ai-console-region="summary-save"]',
      '[data-knowledge-ai-console-region="settings"]',
      '[data-knowledge-ai-console-region="research-network"]',
      '[data-knowledge-ai-support-panel-choice="collapsed"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-ai-route-status-choice="collapsed"]',
      '[data-knowledge-ai-action-choice="collapsed"]',
      '[data-knowledge-ai-preview-choice="collapsed"]',
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
      '[data-knowledge-ai-support-panel-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'knowledge-ai-actions',
    hash: '#kennis?route=ai',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'AI-vervolgactie kiezen',
    activeRouteSelector: '[data-knowledge-route="ai"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    openSelectors: ['[data-knowledge-ai-route-status-choice="collapsed"]'],
    requiredSelectors: [
      '[data-knowledge-ai-action-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-focus-region="workspace"]',
      '[data-knowledge-console="ready"]',
      '[data-knowledge-console-region="workspace"]',
      '#knowledge-route-ai',
      '[data-knowledge-route-summary="ai"]',
      '[data-knowledge-ai-route-status-choice="collapsed"]',
      '.command-route-summary__status',
      'a[href="#ai-preview-form"]',
      'a[href="#knowledge-ai-support"]',
    ],
    closedDetailsSelectors: [
      '[data-knowledge-workbench-disclosure="collapsed"]',
      '[data-knowledge-ai-action-choice="collapsed"]',
      '[data-knowledge-ai-preview-choice="collapsed"]',
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
    ],
    knowledgeConsole: true,
    desktopHiddenSelectors: [
      '.knowledge-focus-shell__header p:last-child',
      '.knowledge-route-section__header > p:last-child',
    ],
  },
  {
    screen: 'knowledge-ai-preview',
    hash: '#kennis?route=ai',
    rootSelector: '.content',
    expectedText: 'AI-previewinvoer openen',
    openSelectors: ['[data-knowledge-ai-preview-choice="collapsed"]'],
    requiredSelectors: [
      '[data-knowledge-ai-preview-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-ai-console-region="preview"]',
      '[data-knowledge-ai-preview-content-choice="collapsed"]',
      '#ai-preview-form',
      'input[name="aiBron"]',
      'textarea[name="aiBronTekst"]',
      '#ai-preview-form button[type="submit"]',
    ],
    closedDetailsSelectors: ['[data-knowledge-ai-preview-content-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-ai-support-panels',
    hash: '#kennis?route=ai',
    rootSelector: '.content',
    expectedText: 'Supportpanelen kiezen',
    openSelectors: [
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
    ],
    requiredSelectors: ['[data-knowledge-ai-support-panel-choice="collapsed"]'],
    presentSelectors: [
      '[data-knowledge-ai-console-region="summary-save"]',
      '[data-knowledge-ai-console-region="settings"]',
      '[data-knowledge-ai-console-region="research-network"]',
    ],
    closedDetailsSelectors: ['[data-knowledge-ai-support-panel-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-ai-summary',
    hash: '#kennis?route=ai',
    rootSelector: '.content',
    expectedText: 'AI-samenvattingdetails openen',
    openSelectors: [
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
      '[data-knowledge-ai-support-panel-choice="collapsed"]',
      '[data-knowledge-ai-summary-detail-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-ai-summary-detail-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-ai-console-region="summary-save"]',
      '[data-knowledge-ai-summary-save-choice="collapsed"]',
      '#ai-summary-form',
      'input[name="aiTitel"]',
      'input[name="aiSamenvattingBron"]',
      'textarea[name="aiSamenvatting"]',
      '#ai-summary-form button[type="submit"]',
    ],
    closedDetailsSelectors: ['[data-knowledge-ai-summary-save-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-ai-settings',
    hash: '#kennis?route=ai',
    rootSelector: '.content',
    expectedText: 'AI-instellingen openen',
    openSelectors: [
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
      '[data-knowledge-ai-support-panel-choice="collapsed"]',
      '[data-knowledge-ai-settings-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-ai-settings-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-ai-console-region="settings"]',
      '[data-knowledge-ai-settings-fields-choice="collapsed"]',
      '#ai-settings-form',
      'select[name="aiIngeschakeld"]',
      'input[name="aiProvider"]',
      'input[name="aiModel"]',
      'input[name="aiApiKey"]',
      '#ai-settings-form button[type="submit"]',
      '[data-on-device-ai-state]',
    ],
    closedDetailsSelectors: ['[data-knowledge-ai-settings-fields-choice="collapsed"]'],
  },
  {
    screen: 'knowledge-ai-network',
    hash: '#kennis?route=ai',
    rootSelector: '.content',
    expectedText: 'Researchnetwerk openen',
    openSelectors: [
      '[data-knowledge-ai-support="collapsed"]',
      '[data-knowledge-ai-support-context-choice="collapsed"]',
      '[data-knowledge-ai-support-panel-choice="collapsed"]',
      '[data-knowledge-ai-network-choice="collapsed"]',
    ],
    requiredSelectors: [
      '[data-knowledge-ai-network-choice="collapsed"]',
    ],
    presentSelectors: [
      '[data-knowledge-ai-console-region="research-network"]',
      '[data-knowledge-ai-network-content-choice="collapsed"]',
      '#research-network-form',
      'select[name="researchNetwerkIngeschakeld"]',
      '#research-network-form button[type="submit"]',
      '[aria-label="Researchaggregatie-status"]',
      '[aria-label="PubMed query preview zonder dossierplaintext"]',
      '#pubmed-query-preview-form',
      'input[name="pubmedZoektermen"]',
      'input[name="pubmedPreviewDatum"]',
      'select[name="pubmedReviewStatus"]',
      '[aria-label="Research bronregister"]',
    ],
    closedDetailsSelectors: ['[data-knowledge-ai-network-content-choice="collapsed"]'],
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
      '#daily-advice-primary-action-choice',
      '[data-daily-advice-primary-action-choice="ready"]',
      '[data-daily-advice-owner-scan="ready"]',
      '[data-daily-advice-owner-scan-density="mobile-compact"]',
      '[data-daily-advice-owner-scan-card="vrouw"]',
      '[data-daily-advice-owner-scan-card="man"]',
      '[data-daily-advice-owner-scan-card="samen"]',
      '#daily-advice-followup',
      '[data-daily-advice-followup="collapsed"]',
      '[data-daily-advice-focus-region="planner"]',
      '[data-daily-advice-console-region="planner"]',
      '[data-daily-advice-action-planner="ready"]',
      '[data-daily-advice-action-lane="lifestyle"]',
      '[data-daily-advice-action-lane="nutrition"]',
      '[data-daily-advice-action-lane="supplements"]',
      '[data-daily-advice-action-lane="clinician"]',
    ],
    presentSelectors: [
      '[data-daily-advice-focus-region="workflow"]',
      '[data-daily-advice-focus-region="workbench"]',
      '[data-daily-advice-focus-region="list"]',
      '[data-daily-advice-console-region="workflow"]',
      '[data-daily-advice-console-region="workbench"]',
      '[data-daily-advice-console-region="list"]',
      '[data-daily-advice-workflow-choice="ready"]',
      '[data-daily-advice-workflow-choice-route="today"]',
      '[data-daily-advice-workflow-choice-route="advice"]',
      '[data-daily-advice-workflow-choice-route="questions"]',
      '[data-daily-advice-workflow-choice-route="research"]',
      '[data-daily-advice-workflow-details="collapsed"]',
      '[data-hub-workflow="daily-recommendations"]',
      '[data-daily-advice-workbench="owner-routes"]',
      '[data-daily-advice-owner-choice="ready"]',
      '[data-daily-advice-owner-choice-route="vrouw"]',
      '[data-daily-advice-owner-choice-route="man"]',
      '[data-daily-advice-owner-choice-route="samen"]',
      '[data-daily-advice-owner-details="collapsed"]',
      '[data-daily-advice-snapshot="ready"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-list-choice="ready"]',
      '[data-daily-advice-full-list="collapsed"]',
    ],
    closedDetailsSelectors: [
      '[data-daily-advice-followup="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-full-list="collapsed"]',
    ],
    desktopHiddenSelectors: [
      '.daily-advice-focus-shell__header p:last-child',
      '.daily-advice-action-planner__header > p',
    ],
    hiddenSelectors: [
      '[data-daily-advice-feedback-workflow-status="ready"]',
      '[data-daily-recommendation-list-filter-header="ready"]',
    ],
    dailyAdviceOwnerScanOverflow: true,
  },
  {
    screen: 'daily-advice-feedback-filter-route',
    hash: '#start-recommendations?feedback=artscheck',
    rootSelector: '[data-daily-advice-focus-shell="ready"]',
    expectedText: 'Te doen vandaag',
    openSelectors: [
      '[data-daily-advice-followup="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
    ],
    requiredSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-console="ready"]',
      '#daily-advice-primary-action-choice',
      '[data-daily-advice-primary-action-choice="ready"]',
      '#daily-advice-followup',
      '[data-daily-advice-followup="collapsed"]',
      '[data-daily-advice-focus-region="workflow"]',
      '[data-daily-advice-focus-region="workbench"]',
      '[data-daily-advice-focus-region="planner"]',
      '[data-daily-advice-focus-region="list"]',
      '[data-daily-advice-workflow-choice="ready"]',
      '[data-daily-advice-workflow-choice-route="today"]',
      '[data-daily-advice-workflow-choice-route="advice"]',
      '[data-daily-advice-workflow-choice-route="questions"]',
      '[data-daily-advice-workflow-choice-route="research"]',
      '[data-daily-advice-workflow-details="collapsed"]',
      '[data-daily-advice-owner-choice="ready"]',
      '[data-daily-advice-owner-choice-route="vrouw"]',
      '[data-daily-advice-owner-choice-route="man"]',
      '[data-daily-advice-owner-choice-route="samen"]',
      '[data-daily-advice-owner-details="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-list-choice="ready"]',
      '[data-daily-advice-full-list="collapsed"]',
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
      '[data-hub-detail-panel="daily-recommendation-list"] .hub-detail-disclosure__summary small',
      '[data-daily-advice-workflow-details="collapsed"] .daily-advice-workflow-details__summary small',
      '[data-daily-advice-owner-details="collapsed"] .daily-advice-owner-details__summary small',
    ],
    dailyAdviceFeedbackNavigation: true,
  },
  {
    screen: 'daily-advice-mobile-compact-list',
    hash: '#start-recommendations',
    rootSelector: '[data-daily-advice-focus-shell="ready"]',
    expectedText: 'Open volledige suggestielijst',
    openSelectors: [
      '[data-daily-advice-followup="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-full-list="collapsed"]',
    ],
    requiredSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-console="ready"]',
      '[data-daily-advice-followup="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-list-choice="ready"]',
      '[data-daily-advice-full-list="collapsed"]',
      '[data-daily-advice-list-mode="dual-owner-cards"]',
      '.daily-recommendation-list--dual-owner .kp-recommendation-card',
      '.daily-recommendation-list--dual-owner .rec-action--primary',
      '.daily-recommendation-list--dual-owner .rec-action--ghost',
      '.daily-recommendation-list--dual-owner .rec-overflow__toggle',
    ],
    dailyAdviceCompactList: true,
    smallMobileViewport: true,
  },
  {
    screen: 'daily-advice-supplement-artscheck-action',
    hash: '#start-recommendations',
    rootSelector: '[data-daily-advice-focus-shell="ready"]',
    expectedText: 'Voeding en supplementen checklijst',
    openSelectors: [
      '[data-daily-advice-followup="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-full-list="collapsed"]',
    ],
    requiredSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-console="ready"]',
      '[data-daily-advice-list-mode="dual-owner-cards"]',
      '[data-recommendation-checklist-item="artscheck-required"]',
      '[data-recommendation-checklist-item="artscheck-required"] [data-supplement-checklist-label="ready"]',
      '[data-recommendation-checklist-item="artscheck-required"] [data-supplement-checklist-source="ready"]',
      '[data-recommendation-checklist-item="artscheck-required"] [data-supplement-artscheck-action="available"]',
      '[data-recommendation-checklist-item="artscheck-required"] button[name="recommendationAction"][value="supplementArtscheck"]',
      '[data-recommendation-checklist-item="standard"]',
    ],
    dailyAdviceSupplementArtscheckAction: true,
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
      '[data-dossier-imaging-inspection-board="ready"]',
      '[data-dossier-imaging-primary-choice="ready"]',
      '[data-dossier-imaging-followup="collapsed"] > .dossier-imaging-followup__summary',
      '[data-dossier-imaging-lane="images"]',
      '[data-dossier-imaging-lane="compare"]',
      '[data-dossier-imaging-lane="embryos"]',
      '[data-dossier-imaging-lane="consults"]',
    ],
    presentSelectors: [
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-dossier-imaging-context-summary="ready"]',
      '[data-hub-detail-panel="consult-verslagen"]',
      '[data-hub-detail-panel="imaging-repository"]',
      '[data-hub-detail-panel="embryo-dossiers"]',
      '[data-embryo-tracking-scan="ready"]',
      '[data-embryo-tracking-scan-density="mobile-compact"]',
      '[data-embryo-tracking-scan-card="dossiers"]',
      '[data-embryo-tracking-scan-card="measurements"]',
      '[data-embryo-tracking-scan-card="status"]',
      '[data-embryo-tracking-scan-card="sources"]',
      '[data-dossier-imaging-disclosure="consults"]',
      '[data-dossier-imaging-disclosure="repository"]',
      '[data-dossier-imaging-disclosure="index"]',
      '[data-dossier-imaging-disclosure="embryos"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
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
    screen: 'dossier-imaging-embryo-classification-review',
    hash: '#dossier?route=imaging',
    rootSelector: '[data-dossier-imaging-disclosure="repository"]',
    expectedText: 'Classificatievoorstel: Concept',
    prepare: 'embryo-image-classification-review',
    activeRouteSelector: '[data-dossier-route="imaging"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-dossier-imaging-disclosure="repository"]',
    ],
    requiredSelectors: [
      '[data-imaging-metadata-review="ready"]',
      '[data-embryo-image-classification-review="concept"]',
      'select[name="imagingMetadataSoort"]',
      'input[name="imagingMetadataBron"]',
      'input[name="imagingMetadataDatum"]',
      'input[name="imagingMetadataPogingId"]',
      'input[name="imagingMetadataAfspraakId"]',
      'input[name="imagingMetadataEmbryoLabel"]',
      'input[name="imagingMetadataEmbryoId"]',
      'select[name="imagingMetadataExifStatus"]',
      'select[name="imagingMetadataReviewStatus"]',
      '[data-imaging-metadata-review="ready"] button[type="submit"]',
    ],
    presentSelectors: [
      'option[value="embryo_afbeelding"]:checked',
      'input[name="imagingMetadataEmbryoDag"]',
      'input[name="imagingMetadataLaboratoriumContext"]',
    ],
    embryoImageClassificationReview: true,
    embryoImageClassificationForcedColorsEvidence: true,
    embryoImageClassificationForcedColorsFocusEvidence: true,
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-imaging-inspection-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="consult-verslagen"] .hub-detail-disclosure__summary small',
      '[data-hub-detail-panel="embryo-dossiers"] .hub-detail-disclosure__summary small',
    ],
  },
  {
    screen: 'dossier-imaging-compare-no-interpretation',
    hash: '#dossier?route=imaging',
    rootSelector: '[data-dossier-imaging-disclosure="repository"]',
    expectedText: 'Beeldmomenten vergelijken',
    prepare: 'imaging-compare-no-interpretation',
    activeRouteSelector: '[data-dossier-route="imaging"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-dossier-imaging-disclosure="repository"]',
    ],
    requiredSelectors: [
      '[data-imaging-compare-state="ready"]',
    ],
    presentSelectors: [
      '[data-imaging-compare-card]',
      '[data-imaging-compare-field="datum"]',
      '[data-imaging-compare-field="bron"]',
      '[data-imaging-compare-field="type"]',
      '[data-imaging-compare-field="notitie"]',
      '[data-imaging-compare-preview-kind="safe-surface"]',
      '[data-imaging-compare-preview-state="thumbnail"]',
      '[data-imaging-compare-field="context"]',
      '[data-imaging-compare-field="preview"]',
      '[data-imaging-compare-field="koppeling"]',
      '.imaging-compare-summary',
    ],
    imagingCompareEvidence: true,
    dossierConsole: true,
    smallMobileViewport: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-imaging-inspection-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="consult-verslagen"] .hub-detail-disclosure__summary small',
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
      '[data-dossier-upload-triage-details="collapsed"]',
      '[data-dossier-upload-triage-summary="ready"]',
      '[data-dossier-upload-console-context="collapsed"]',
      '[data-dossier-upload-console-status="compact"]',
      '[data-dossier-upload-console-records="ready"]',
      '[data-dossier-add-route-group="collapsed"]',
      '[data-dossier-add-route-group-summary="ready"]',
      '[data-dossier-add-route-microcopy-details="collapsed"]',
      '[data-dossier-add-route-microcopy-summary="ready"]',
      '[data-dossier-add-route-choice-details="collapsed"]',
      '[data-dossier-add-route-choice-summary="ready"]',
      '[data-dossier-upload-action-path="ready"]',
    ],
    presentSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="keuze"]',
      '[data-dossier-upload-console-region="action-path"]',
      '[data-dossier-upload-console-region="selector"]',
      '[data-dossier-upload-action="document"]',
      '[data-dossier-upload-action="consult"]',
      '[data-dossier-upload-action="image"]',
      '[data-dossier-upload-action="embryo"]',
      '[data-dossier-add-route-choice="ready"]',
      '[data-dossier-upload-lane="document"]',
      '[data-dossier-upload-lane="consult"]',
      '[data-dossier-upload-lane="imaging"]',
      '[data-dossier-upload-lane="ocr"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-upload-triage-details="collapsed"]',
      '[data-dossier-upload-console-context="collapsed"]',
      '[data-dossier-add-route-group="collapsed"]',
      '[data-dossier-add-route-microcopy-details="collapsed"]',
      '[data-dossier-add-route-choice-details="collapsed"]',
    ],
    hiddenSelectors: [
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
    screen: 'dossier-imaging-metadata-review-locked',
    hash: '#dossier?route=imaging&preview=locked',
    rootSelector: '[data-dossier-imaging-disclosure="repository"]',
    expectedText: 'Beeldmetadata review',
    prepare: 'embryo-image-classification-review',
    activeRouteSelector: '[data-dossier-route="imaging"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-dossier-imaging-disclosure="repository"]',
    ],
    requiredSelectors: [
      '[data-imaging-metadata-review="locked"]',
      '[data-attachment-preview-kind="imaging-preview"][data-attachment-preview-state="locked"]',
      '[data-attachment-preview-kind="imaging-thumbnail"][data-attachment-preview-state="locked"]',
    ],
    imagingMetadataReviewLocked: true,
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-imaging-inspection-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="consult-verslagen"] .hub-detail-disclosure__summary small',
      '[data-hub-detail-panel="embryo-dossiers"] .hub-detail-disclosure__summary small',
    ],
  },
  {
    screen: 'dossier-embryo-tracking-scan',
    hash: '#dossier?route=imaging',
    rootSelector: '[data-hub-detail-panel="embryo-dossiers"]',
    expectedText: 'Embryo-dossiers',
    activeRouteSelector: '[data-dossier-route="imaging"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-hub-detail-panel="embryo-dossiers"]',
    ],
    prepare: 'embryo-alias-review-display',
    requiredSelectors: [
      '[data-embryo-tracking-scan="ready"]',
      '[data-embryo-tracking-scan-density="mobile-compact"]',
      '[data-embryo-tracking-scan-card="dossiers"]',
      '[data-embryo-tracking-scan-card="measurements"]',
      '[data-embryo-tracking-scan-card="status"]',
      '[data-embryo-tracking-scan-card="sources"]',
      '[data-embryo-tracking-grid="compact"]',
      '[data-embryo-tracking-card="ready"]',
      '[data-embryo-source-label-correction="ready"]',
      '[data-embryo-source-label-correction-form="ready"]',
    ],
    embryoTrackingScanOverflow: true,
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '[data-hub-detail-panel="embryo-dossiers"] .hub-detail-disclosure__summary small',
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
      '[data-dossier-upload-action-path="ready"]',
      '[data-dossier-upload-action="document"][aria-current="step"]',
      '[data-dossier-upload-action="image"][data-dossier-upload-action-state="active"]',
      '[data-dossier-upload-console-region="document"]',
      '[data-hub-workflow="dossier-upload"]',
      '[data-hub-workflow-tabs="dossier-upload"]',
      '[data-hub-workflow-tab="upload"][aria-current="page"]',
      '[data-hub-workflow-tab="review"]',
      '[data-hub-workflow-tab="consult"]',
      '#dossier-upload-form',
      '[data-dossier-upload-group="document-basis"]',
      '[data-dossier-upload-file-choice="ready"]',
      '[data-dossier-upload-size-feedback="preflight"]',
      '[data-dossier-upload-size-limit-grid="ready"]',
      '[data-dossier-upload-size-retry="safe"]',
      '[data-attachment-envelope-surface="dossier-upload"]',
      '[data-attachment-envelope-validation="idle"]',
      '[data-attachment-envelope-batch]',
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata="collapsed"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-optional="koppelingen"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-optional="beeldcontext"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-optional="embryo-labcontext"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-completion-choice="ready"]',
      '[data-dossier-upload-submit-feedback-details="collapsed"]',
      '[data-dossier-upload-submit-feedback-details="collapsed"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-privacy-disclosure="collapsed"]',
    ],
    presentSelectors: [
      '[data-dossier-upload-completion-status-choice="collapsed"]',
      '[data-dossier-upload-completion-status-summary="ready"]',
      '[data-dossier-submit-feedback="dossier-upload"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-submit-feedback-details="collapsed"]',
      '[data-dossier-upload-completion-status-choice="collapsed"]',
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
    dossierUploadSizeFeedback: true,
    attachmentEnvelopeBatchStatus: true,
    attachmentEnvelopeBatchForcedColorsEvidence: true,
    smallMobileViewport: true,
  },
  {
    screen: 'dossier-upload-metadata',
    hash: '#dossier-upload-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
    ],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="document"]',
      '#dossier-upload-form',
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-dossier-hospital-type-review="ready"]',
      'select[name="ziekenhuisDocumentTypeCorrectie"]',
      '[data-dossier-hospital-type-review-hint="safe"]',
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
    dossierHospitalTypeReview: true,
  },
  {
    screen: 'dossier-upload-links',
    hash: '#dossier-upload-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: ['[data-dossier-upload-optional="koppelingen"]'],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="document"]',
      '#dossier-upload-form',
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-link-fields="collapsed"]',
      '[data-dossier-upload-link-fields="collapsed"] > .dossier-upload-optional__summary',
    ],
    closedDetailsSelectors: [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-link-fields="collapsed"]',
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
    screen: 'dossier-upload-image-context',
    hash: '#dossier-upload-image-context',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-image-fields="collapsed"]',
    ],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="document"]',
      '#dossier-upload-form',
      '#dossier-upload-image-context',
      '[data-dossier-upload-image-next-step="ready"]',
      '[data-dossier-upload-image-context-summary="ready"]',
      '[data-dossier-upload-image-summary="safe-next-step"]',
      '[data-dossier-upload-image-summary-item="context"]',
      '[data-dossier-upload-image-summary-item="source"]',
      '[data-dossier-upload-image-summary-item="cycle-day"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-image-fields="collapsed"]',
      '[data-dossier-upload-image-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-dossier-upload-image-field-order="context-source-cycle-day"]',
      '[data-dossier-upload-image-open-fields="compact-rhythm"]',
      '[data-dossier-upload-image-field="context"]',
      '[data-dossier-upload-image-field="source"]',
      '[data-dossier-upload-image-field="cycle-day"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-privacy-disclosure="collapsed"]',
    ],
    imageSummaryChips: true,
    imageFieldLabels: true,
    imageOpenFields: true,
    imageOpenFieldFocus: true,
    smallMobileViewport: true,
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
    screen: 'dossier-upload-lab-context',
    hash: '#dossier-upload-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: ['[data-dossier-upload-optional="embryo-labcontext"]'],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-add-flow="document"]',
      '#dossier-upload-form',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-lab-fields="collapsed"]',
      '[data-dossier-upload-lab-fields="collapsed"] > .dossier-upload-optional__summary',
    ],
    closedDetailsSelectors: [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-optional="koppelingen"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-lab-fields="collapsed"]',
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
      '[data-dossier-review-primary-choice="collapsed"]',
      '[data-dossier-review-primary-summary="ready"]',
      '[data-dossier-review-followup="collapsed"] > .dossier-review-followup__summary',
      '[data-dossier-review-context-choice="collapsed"]',
      '[data-dossier-review-context-summary="ready"]',
    ],
    presentSelectors: [
      '#dossier-review-queue-disclosure',
      '#dossier-inbox-disclosure',
      '[data-dossier-review-disclosure="queue"]',
      '[data-dossier-review-disclosure="inbox"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-review-primary-choice="collapsed"]',
      '[data-dossier-review-followup="collapsed"]',
      '[data-dossier-review-context-choice="collapsed"]',
    ],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-import-inbox-retry',
    hash: '#dossier-route-review',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Import-inbox',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    prepare: 'dossier-import-inbox-retry',
    openSelectors: [
      '[data-dossier-add-route-disclosure="review"]',
      '[data-dossier-review-followup="collapsed"]',
      '[data-dossier-review-context-choice="collapsed"]',
      '#dossier-inbox-disclosure',
    ],
    requiredSelectors: [
      '#dossier-inbox-disclosure',
      '[data-dossier-import-inbox-item="ocr_wacht"]',
      '[data-dossier-import-retry-state="ocr_wacht"]',
      '[data-dossier-import-actionbar="retry-available"]',
      '[data-dossier-import-retry-form="available"]',
      '[data-dossier-import-retry-action="available"]',
      '[data-attachment-delete-kind="dossier-import"]',
    ],
    presentSelectors: [
      '.dossier-inbox-overview',
      '[data-dossier-import-inbox-item="klaar_voor_review"]',
      '[data-dossier-import-actionbar="retry-unavailable"]',
    ],
    dossierConsole: true,
    dossierImportInboxRetry: true,
    smallMobileViewport: true,
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
      '[data-dossier-search-choice="collapsed"]',
      '[data-dossier-search-choice-summary="ready"]',
      '[data-dossier-search-support="collapsed"] > .dossier-search-support__summary',
    ],
    presentSelectors: [
      '#dossier-search-form',
      '[data-dossier-search-kit="ready"]',
      '[data-dossier-search-result-choice="collapsed"]',
      '[data-dossier-search-result-summary="ready"]',
      '[data-dossier-secondary-privacy="collapsed"]',
      '#dossier-route-index-disclosure',
      '[data-dossier-search-console-region="results"]',
      '[data-dossier-search-console-region="privacy"]',
      '[data-dossier-search-console-region="index"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-search-choice="collapsed"]',
      '[data-dossier-search-support="collapsed"]',
      '[data-dossier-search-result-choice="collapsed"]',
    ],
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
    ],
    presentSelectors: [
      '[data-dossier-timeline-context-choice="collapsed"]',
      '[data-dossier-timeline-context-summary="ready"]',
      '[data-hub-detail-panel="timeline-documents"]',
      '[data-dossier-timeline-disclosure="documents"]',
      '[data-dossier-timeline-disclosure="history"]',
    ],
    closedDetailsSelectors: [
      '[data-dossier-timeline-followup="collapsed"]',
      '[data-dossier-timeline-context-choice="collapsed"]',
    ],
    dossierConsole: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-historical-timeline-review',
    hash: '#dossier?route=timeline&preview=locked',
    rootSelector: '#dossier-route-timeline',
    expectedText: 'Historische tijdlijnreview',
    activeRouteSelector: '[data-dossier-route="timeline"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    prepare: 'dossier-historical-timeline-review',
    openSelectors: [
      '[data-dossier-timeline-followup="collapsed"]',
      '[data-dossier-timeline-context-choice="collapsed"]',
      '[data-dossier-timeline-disclosure="documents"]',
    ],
    requiredSelectors: [
      '[data-historical-timeline-review="ready"]',
      '[data-historical-timeline-review-field="date"]',
      '[data-historical-timeline-review-field="source"]',
      '[data-historical-timeline-review-field="review-status"]',
      '[data-historical-timeline-review-field="visibility"]',
      '[data-historical-timeline-review-action="save"]',
      '[data-historical-timeline-review="locked"]',
      '[data-historical-timeline-review-locked-boundary="ready"]',
    ],
    presentSelectors: [
      '[data-hub-detail-panel="timeline-documents"]',
      '[data-attachment-preview-kind="dossier-preview"][data-attachment-preview-state="locked"]',
      '[data-metadata-normalization-correction="ready"]',
      '[data-ocr-review-correction="ready"]',
    ],
    closedDetailsSelectors: [],
    dossierConsole: true,
    dossierHistoricalTimelineReview: true,
    smallMobileViewport: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-metadata-normalization-correction',
    hash: '#dossier?route=timeline&preview=locked',
    rootSelector: '#dossier-route-timeline',
    expectedText: 'Metadata-normalisatie',
    activeRouteSelector: '[data-dossier-route="timeline"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    prepare: 'dossier-metadata-normalization-correction',
    openSelectors: [
      '[data-dossier-timeline-followup="collapsed"]',
      '[data-dossier-timeline-context-choice="collapsed"]',
      '[data-dossier-timeline-disclosure="documents"]',
    ],
    requiredSelectors: [
      '[data-metadata-normalization-correction="ready"]',
      '[data-metadata-normalization-field="date"]',
      '[data-metadata-normalization-field="source"]',
      '[data-metadata-normalization-field="document-type"]',
      '[data-metadata-normalization-field="research-type"]',
      '[data-metadata-normalization-field="attempt"]',
      '[data-metadata-normalization-field="appointment"]',
      '[data-metadata-normalization-field="certainty"]',
      '[data-metadata-normalization-action="save"]',
      '[data-metadata-normalization-correction="locked"]',
      '[data-metadata-normalization-locked-boundary="ready"]',
    ],
    presentSelectors: [
      '[data-hub-detail-panel="timeline-documents"]',
      '[data-attachment-preview-kind="dossier-preview"][data-attachment-preview-state="locked"]',
      '[data-ocr-review-correction="ready"]',
    ],
    closedDetailsSelectors: [],
    dossierConsole: true,
    dossierMetadataNormalizationCorrection: true,
    smallMobileViewport: true,
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
  },
  {
    screen: 'dossier-ocr-review-correction',
    hash: '#dossier?route=timeline&preview=locked',
    rootSelector: '#dossier-route-timeline',
    expectedText: 'OCR-review',
    activeRouteSelector: '[data-dossier-route="timeline"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    prepare: 'dossier-ocr-review-correction',
    openSelectors: [
      '[data-dossier-timeline-followup="collapsed"]',
      '[data-dossier-timeline-context-choice="collapsed"]',
      '[data-dossier-timeline-disclosure="documents"]',
    ],
    requiredSelectors: [
      '[data-ocr-review-correction="ready"]',
      '[data-ocr-review-field="correction-text"]',
      '[data-ocr-review-field="metadata-note"]',
      '[data-ocr-review-field="review-status"]',
      '[data-ocr-review-action="save"]',
      '[data-ocr-review-correction="locked"]',
      '[data-ocr-review-locked-boundary="ready"]',
    ],
    presentSelectors: [
      '[data-hub-detail-panel="timeline-documents"]',
      '[data-attachment-review-kind="ocr-review"]',
      '[data-attachment-preview-kind="dossier-preview"][data-attachment-preview-state="locked"]',
    ],
    closedDetailsSelectors: [],
    dossierConsole: true,
    dossierOcrReviewCorrection: true,
    smallMobileViewport: true,
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
    openSelectors: [
      '#treatment-context-timeline-disclosure',
      '#fertility-timeline-controls-panel',
      '#fertility-timeline-insights-panel',
      '#fertility-timeline-items-panel',
    ],
    requiredSelectors: [
      '[data-treatment-focus-region="workspace"]',
      '[data-treatment-single-workspace="ready"]',
      '#traject-route-context',
      '[data-fertility-timeline-reader="ready"]',
      '[data-fertility-timeline-console="ready"]',
      '[data-fertility-timeline-panel="controls"]',
      '[data-fertility-timeline-panel="insights"]',
      '[data-fertility-timeline-panel="items"]',
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
    openSelectors: ['[data-consult-upload-context-fields="collapsed"]'],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console-region="header"]',
      '[data-dossier-upload-console-region="body"]',
      '[data-dossier-upload-console-region="selector"]',
      '[data-dossier-upload-console-region="consult"]',
      '[data-hub-workflow="consult-upload"]',
      '[data-hub-workflow-tabs="consult-upload"]',
      '[data-hub-workflow-tab="consult"][aria-current="page"]',
      '[data-hub-workflow-tab="context"]',
      '[data-hub-workflow-tab="questions"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '#consult-verslag-form',
      '[data-consult-upload-group="consult-basis"]',
      '[data-consult-upload-report-choice="ready"]',
      '[data-consult-upload-report-fields="collapsed"]',
      '[data-consult-upload-report-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-consult-upload-link-fields="collapsed"]',
      '[data-consult-upload-link-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-consult-upload-context-fields="collapsed"]',
      '[data-consult-upload-context-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-consult-text-import-review="ready"]',
      'select[name="consultImportReviewStatus"]',
      '[data-consult-text-import-review-hint="safe"]',
      '[data-consult-upload-completion-choice="ready"]',
      '[data-consult-upload-submit-feedback-details="collapsed"]',
      '[data-consult-upload-submit-feedback-details="collapsed"] > .dossier-upload-optional__summary',
    ],
    presentSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console="ready"][data-dossier-upload-focus-mode="single-flow"][data-dossier-add-flow="consult"]',
      '[data-consult-upload-completion-status-choice="collapsed"]',
      '[data-consult-upload-completion-status-summary="ready"]',
      '[data-dossier-submit-feedback="consult-upload"]',
      '[data-consult-upload-group="consult-koppelingen"]',
      '[data-consult-upload-group="consult-context"]',
    ],
    closedDetailsSelectors: [
      '[data-consult-upload-report-fields="collapsed"]',
      '[data-consult-upload-link-fields="collapsed"]',
      '[data-consult-upload-submit-feedback-details="collapsed"]',
      '[data-consult-upload-completion-status-choice="collapsed"]',
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
    consultTextImportReview: true,
  },
  {
    screen: 'embryo-quality',
    hash: '#embryo-quality-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: ['[data-embryo-quality-identification-fields="collapsed"]'],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console-region="embryo-quality"]',
      '[data-dossier-add-route-panel="embryo-quality"]',
      '#embryo-quality-form',
      '[data-embryo-quality-group="embryo-identificatie"]',
      '[data-embryo-quality-choice="ready"]',
      '[data-embryo-quality-identification-fields="collapsed"]',
      '[data-embryo-quality-identification-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-embryo-alias-review="quality"]',
      '#embryo-quality-form [data-embryo-alias-review-hint="safe"]',
      '#embryo-quality-form input[name="embryoAliasLabel"]',
      '#embryo-quality-form input[name="embryoKliniekId"]',
      '#embryo-quality-form input[name="embryoAliasBronLabel"]',
      '#embryo-quality-form select[name="embryoAliasReviewStatus"]',
      '[data-embryo-quality-assessment-fields="collapsed"]',
      '[data-embryo-quality-assessment-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-embryo-quality-link-fields="collapsed"]',
      '[data-embryo-quality-link-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-embryo-quality-completion-choice="ready"]',
      '[data-embryo-quality-submit-feedback-details="collapsed"]',
      '[data-embryo-quality-submit-feedback-details="collapsed"] > .dossier-upload-optional__summary',
    ],
    presentSelectors: [
      '[data-dossier-upload-console="ready"][data-dossier-upload-focus-mode="single-flow"][data-dossier-add-flow="embryo-quality"]',
      '[data-embryo-quality-completion-status-choice="collapsed"]',
      '[data-embryo-quality-completion-status-summary="ready"]',
      '[data-dossier-submit-feedback="embryo-quality"]',
      '[data-embryo-quality-group="embryo-beoordeling"]',
      '[data-embryo-quality-group="embryo-koppelingen"]',
    ],
    closedDetailsSelectors: [
      '[data-embryo-quality-assessment-fields="collapsed"]',
      '[data-embryo-quality-link-fields="collapsed"]',
      '[data-embryo-quality-submit-feedback-details="collapsed"]',
      '[data-embryo-quality-completion-status-choice="collapsed"]',
    ],
    expectedUploadFlow: 'embryoQuality',
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
    embryoAliasReview: 'quality',
  },
  {
    screen: 'embryo-status',
    hash: '#embryo-status-event-form',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    openSelectors: [
      '[data-embryo-status-basis-fields="collapsed"]',
      '[data-embryo-status-source-fields="collapsed"]',
    ],
    requiredSelectors: [
      '[data-dossier-upload-console="ready"]',
      '[data-dossier-upload-console-region="embryo-status"]',
      '[data-dossier-add-route-panel="embryo-status"]',
      '#embryo-status-event-form',
      '[data-embryo-status-group="status-basis"]',
      '[data-embryo-status-choice="ready"]',
      '[data-embryo-status-basis-fields="collapsed"]',
      '[data-embryo-status-basis-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-embryo-status-source-fields="collapsed"]',
      '[data-embryo-status-source-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-embryo-alias-review="status"]',
      '#embryo-status-event-form [data-embryo-alias-review-hint="safe"]',
      '#embryo-status-event-form input[name="embryoAliasLabel"]',
      '#embryo-status-event-form input[name="embryoKliniekId"]',
      '#embryo-status-event-form input[name="embryoAliasBronLabel"]',
      '#embryo-status-event-form select[name="embryoAliasReviewStatus"]',
      '[data-embryo-status-link-fields="collapsed"]',
      '[data-embryo-status-link-fields="collapsed"] > .dossier-upload-optional__summary',
      '[data-embryo-status-completion-choice="ready"]',
      '[data-embryo-status-submit-feedback-details="collapsed"]',
      '[data-embryo-status-submit-feedback-details="collapsed"] > .dossier-upload-optional__summary',
    ],
    presentSelectors: [
      '[data-dossier-upload-console="ready"][data-dossier-upload-focus-mode="single-flow"][data-dossier-add-flow="embryo-status"]',
      '[data-embryo-status-completion-status-choice="collapsed"]',
      '[data-embryo-status-completion-status-summary="ready"]',
      '[data-dossier-submit-feedback="embryo-status"]',
      '[data-embryo-status-group="status-bron"]',
      '[data-embryo-status-group="status-koppelingen"]',
    ],
    closedDetailsSelectors: [
      '[data-embryo-status-link-fields="collapsed"]',
      '[data-embryo-status-submit-feedback-details="collapsed"]',
      '[data-embryo-status-completion-status-choice="collapsed"]',
    ],
    expectedUploadFlow: 'embryoStatus',
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
    embryoAliasReview: 'status',
  },
  {
    screen: 'consult-card-filled',
    hash: '#dossier?route=imaging',
    rootSelector: '[data-hub-detail-panel="consult-verslagen"]',
    expectedText: 'Smoke consultkaart',
    prepare: 'filled-consult-card',
    openSelectors: [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-hub-detail-panel="consult-verslagen"]',
    ],
    requiredSelectors: [
      '[data-consult-review-scan="ready"]',
      '[data-consult-review-scan-density="mobile-compact"]',
      '[data-consult-review-scan-card="reports"]',
      '[data-consult-review-scan-card="summaries"]',
      '[data-consult-review-scan-card="actions"]',
      '[data-consult-review-scan-card="sources"]',
      '.consult-card__status span',
    ],
    presentSelectors: [
      '[data-hub-detail-panel="consult-verslagen"][open]',
      '.consult-review-scan',
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
    screen: 'question-artscheck-review-status',
    hash: '#vragen?route=alle',
    rootSelector: '[data-question-focus-shell="ready"]',
    expectedText: 'Reviewstatus bewaren',
    prepare: 'question-artscheck-review-status',
    activeRouteSelector: '[data-question-route="alle"][data-question-route-state="active"]',
    inactiveRouteSelector: '[data-question-route-state="inactive"]',
    openSelectors: ['#question-all-disclosure'],
    requiredSelectors: [
      '[data-question-focus-shell="ready"]',
      '#question-all-disclosure',
      '[data-question-list-item="artscheck"]',
      '[data-question-list-item="artscheck"] [data-question-artscheck-review="ready"]',
      '[data-question-list-item="artscheck"] [data-question-artscheck-review-state="concept"]',
      '[data-question-list-item="artscheck"] [data-question-artscheck-review-form="ready"]',
      '[data-question-list-item="artscheck"] [data-question-artscheck-review-badge="concept"]',
      '[data-question-list-item="artscheck"] select[name="artscheckReviewStatus"]',
      '[data-question-list-item="artscheck"] .question-artscheck-review-form button[type="submit"]',
      '[data-question-list-item="standard"]',
    ],
    questionArtscheckReviewStatus: true,
    desktopHiddenSelectors: [
      '.question-focus-shell__header p:last-child',
      '.question-route-section__header > p:last-child',
      '.consult-prep-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
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
      '[data-wellbeing-history-board="first-viewport"]',
      '[data-wellbeing-history-lane="recent"]',
      '[data-wellbeing-history-lane="symptoms"]',
      '[data-wellbeing-history-lane="cycle"]',
      '[data-wellbeing-history-lane="checkins"]',
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
    screen: 'backup-sync-recovery-focus',
    hash: '#backup?route=controleren',
    rootSelector: '#backup-route-controleren',
    expectedText: 'Centrale sessieherstelactie verwerkt.',
    activeRouteSelector: '[data-backup-route="controleren"][data-backup-route-state="active"]',
    inactiveRouteSelector: '[data-backup-route-state="inactive"]',
    prepare: 'central-session-renewal-recovery-focus',
    requiredSelectors: [
      '[data-backup-sync-board="ready"]',
      '[data-central-session-renewal-recovery-announcement="polite"]',
      '[data-central-session-renewal-recovery-focus-target="ready"]',
    ],
    desktopHiddenSelectors: [
      '.backup-focus-shell__header p:last-child',
      '.backup-route-section__header > p:last-child',
      '.backup-sync-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
    ],
    centralSessionRenewalRecoveryFocus: true,
    smallMobileViewport: true,
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
  { label: 'tablet', viewport: { width: 820, height: 1180 } },
  { label: 'mobile', viewport: { width: 390, height: 844 } },
  { label: 'small-mobile', viewport: { width: 360, height: 780 } },
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
      if (options.label === 'small-mobile' && !target.smallMobileViewport) continue;
      try {
        await page.emulateMedia({ forcedColors: 'none' });
        await page.goto(`${url}${target.hash}`, { waitUntil: 'networkidle' });
      await unlockIfNeeded(page, target.hash);
      if (target.prepare === 'filled-consult-card') {
        await prepareFilledConsultCard(page, target.hash);
      }
      if (target.prepare === 'embryo-image-classification-review') {
        await prepareEmbryoImageClassificationReview(page, target.hash);
      }
      if (target.prepare === 'imaging-compare-no-interpretation') {
        await prepareImagingCompareNoInterpretation(page, target.hash);
      }
      if (target.prepare === 'embryo-alias-review-display') {
        await prepareEmbryoAliasReviewDisplay(page, target.hash);
      }
      if (target.prepare === 'question-artscheck-review-status') {
        await prepareQuestionArtscheckReviewStatus(page, target.hash);
      }
      if (target.prepare === 'dossier-import-inbox-retry') {
        await prepareDossierImportInboxRetry(page, target.hash);
      }
      if (target.prepare === 'dossier-ocr-review-correction') {
        await prepareDossierOcrReviewCorrection(page, target.hash);
      }
      if (target.prepare === 'dossier-metadata-normalization-correction') {
        await prepareDossierMetadataNormalizationCorrection(page, target.hash);
      }
      if (target.prepare === 'dossier-historical-timeline-review') {
        await prepareDossierHistoricalTimelineReview(page, target.hash);
      }
      if (target.prepare === 'central-session-renewal-recovery-focus') {
        await prepareCentralSessionRenewalRecoveryFocus(page, target.hash);
      }
      if (target.closedDetailsSelectors) {
        await page.evaluate((selectors) => {
          for (const selector of selectors) {
            const details = document.querySelector(selector);
            if (details instanceof HTMLDetailsElement) details.open = false;
          }
        }, target.closedDetailsSelectors);
      }
      if (target.openSelectors) {
        await page.evaluate((selectors) => {
          for (const selector of selectors) {
            const details = document.querySelector(selector);
            if (details instanceof HTMLDetailsElement) details.open = true;
          }
        }, target.openSelectors);
      }
      if (target.embryoImageClassificationForcedColorsEvidence) {
        await page.emulateMedia({ forcedColors: 'active' });
      }

      await waitForStableRouteflowRoot(page, target.rootSelector);
      if (target.openSelectors) {
        await page.evaluate((selectors) => {
          for (const selector of selectors) {
            const details = document.querySelector(selector);
            if (details instanceof HTMLDetailsElement) details.open = true;
          }
        }, target.openSelectors);
      }
      await page.evaluate((selector) => {
        document.querySelector(selector)?.scrollIntoView({ block: 'center', inline: 'nearest' });
      }, target.rootSelector);
      if (options.label === 'mobile' || options.label === 'small-mobile') {
        await waitForActiveWorkspaceStripButton(page);
      }
      let imageOpenFieldFocus = null;
      let attachmentEnvelopeBatchForcedColorsEvidence = null;
      if (target.imageOpenFieldFocus) {
        const focusSelector =
          '[data-dossier-upload-image-open-fields="compact-rhythm"] label[data-dossier-upload-image-field] > input';
        await page.evaluate(() => {
          for (const selector of [
            '[data-dossier-upload-optional="beeldcontext"]',
            '[data-dossier-upload-image-fields="collapsed"]',
          ]) {
            const details = document.querySelector(selector);
            if (details instanceof HTMLDetailsElement) details.open = true;
          }
        });
        const inputCount = await page.locator(focusSelector).count();
        const rows = [];
        const baseline = await page.evaluate(() => {
          const fieldset = document.querySelector(
            '[data-dossier-upload-image-open-fields="compact-rhythm"]',
          );
          const fieldsetRect = fieldset?.getBoundingClientRect();
          return {
            documentOverflowBefore:
              document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
              document.body.scrollWidth > document.body.clientWidth + 1,
            fieldsetHeightBefore: fieldsetRect?.height ?? 0,
            fieldsetWidthBefore: fieldsetRect?.width ?? 0,
          };
        });
        for (let index = 0; index < inputCount; index += 1) {
          await page.locator(focusSelector).nth(index).click({ force: true });
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
          rows.push(
            await page.locator(focusSelector).nth(index).evaluate((input, base) => {
              const fieldset = document.querySelector(
                '[data-dossier-upload-image-open-fields="compact-rhythm"]',
              );
              const label = input.closest('label[data-dossier-upload-image-field]');
              const fieldsetAfter = fieldset?.getBoundingClientRect();
              const inputRect = input.getBoundingClientRect();
              const labelRect = label?.getBoundingClientRect();
              const style = getComputedStyle(input);
              return {
                field: label?.getAttribute('data-dossier-upload-image-field') ?? '',
                active: document.activeElement === input,
                inputHeight: inputRect.height,
                inputWidth: inputRect.width,
                labelWidth: labelRect?.width ?? 0,
                fieldsetHeightBefore: base.fieldsetHeightBefore,
                fieldsetHeightAfter: fieldsetAfter?.height ?? 0,
                fieldsetWidthBefore: base.fieldsetWidthBefore,
                fieldsetWidthAfter: fieldsetAfter?.width ?? 0,
                outlineStyle: style.outlineStyle,
                outlineWidth: style.outlineWidth,
                outlineOffset: style.outlineOffset,
                boxShadow: style.boxShadow,
                inputOverflowsLabel: Boolean(labelRect && inputRect.right > labelRect.right + 1),
                horizontalOverflow:
                  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1,
              };
            }, baseline),
          );
        }
        imageOpenFieldFocus = { documentOverflowBefore: baseline.documentOverflowBefore, rows };
      }
      if (target.attachmentEnvelopeBatchStatus) {
        await page.evaluate(() => {
          const input = document.querySelector('input[name="dossierBestanden"]');
          if (!(input instanceof HTMLInputElement)) return;
          const transfer = new DataTransfer();
          transfer.items.add(new File(['routeflow attachment one'], '', { type: 'application/pdf' }));
          transfer.items.add(new File(['routeflow attachment two'], '', { type: 'image/jpeg' }));
          transfer.items.add(new File(['routeflow attachment review'], '', { type: '' }));
          input.files = transfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForFunction(
          () => {
            const batch = document.querySelector('[data-attachment-envelope-batch]');
            return (
              batch instanceof HTMLElement &&
              batch.dataset.attachmentEnvelopeBatch === 'invalid' &&
              batch.textContent?.includes('3 items: 2 klaar, 0 hash-pending, 1 controle nodig.')
            );
          },
          undefined,
          { timeout: 10_000 },
        );
        if (target.attachmentEnvelopeBatchForcedColorsEvidence) {
          await page.emulateMedia({ forcedColors: 'active' });
          attachmentEnvelopeBatchForcedColorsEvidence = {
            hashing: await collectAttachmentEnvelopeBatchForcedColorsEvidence(page, {
              batch: 'hash-pending',
              progress: 'hashing',
            }),
            completeInvalid: await collectAttachmentEnvelopeBatchForcedColorsEvidence(page),
          };
          await page.emulateMedia({ forcedColors: 'none' });
        }
      }
      if (target.dailyAdviceFeedbackNavigation) {
        await assertDailyAdviceFeedbackNavigation(page);
      }

      const root = page.locator(target.rootSelector);
      const evidence = await page.evaluate(({ routeflow, viewportLabel }) => {
        const rootElement = document.querySelector(routeflow.rootSelector);
        const rootRect = rootElement?.getBoundingClientRect();
        const appShell = document.querySelector('.app-shell');
        const content = document.querySelector('.content');
        const activePanel = document.querySelector('[data-screen-stage-scroll="active-workspace"]');
        const appShellRect = appShell?.getBoundingClientRect();
        const contentRect = content?.getBoundingClientRect();
        const activePanelRect = activePanel?.getBoundingClientRect();
        const appShellStyle = appShell ? getComputedStyle(appShell) : null;
        const contentStyle = content ? getComputedStyle(content) : null;
        const activePanelStyle = activePanel ? getComputedStyle(activePanel) : null;
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
              text: node.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
              clientWidth: node.clientWidth,
              scrollWidth: node.scrollWidth,
              clientHeight: node.clientHeight,
              scrollHeight: node.scrollHeight,
            }));
          const overflowingNodes = textNodes.filter(
            (node) =>
              node.scrollWidth > node.clientWidth + 1 ||
              node.scrollHeight > node.clientHeight + 24,
          );
          return {
            selector,
            visible: Boolean(rect && rect.width > 0 && rect.height > 0),
            textFits: overflowingNodes.length === 0,
            overflowingNodes,
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
        const activeWorkspaceButton = document.querySelector(
          '[data-workspace-strip="ready"] .workspace-strip__switcher a[aria-current="page"]',
        );
        const activeWorkspaceStrip = activeWorkspaceButton?.closest('.workspace-strip__switcher');
        const activeWorkspaceButtonRect = activeWorkspaceButton?.getBoundingClientRect();
        const activeWorkspaceStripRect = activeWorkspaceStrip?.getBoundingClientRect();
        const activeWorkspaceButtonStyle =
          activeWorkspaceButton instanceof HTMLElement
            ? getComputedStyle(activeWorkspaceButton)
            : null;
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
        const dailyAdviceCompactList = routeflow.dailyAdviceCompactList
          ? (() => {
              const listChoice = document.querySelector('[data-daily-advice-list-choice="ready"]');
              const fullListBody = document.querySelector('.daily-advice-full-list__body');
              const list = document.querySelector('[data-daily-advice-list-mode="dual-owner-cards"]');
              const group = document.querySelector(
                '.daily-recommendation-list--dual-owner .daily-recommendation-group',
              );
              const items = document.querySelector(
                '.daily-recommendation-list--dual-owner .kp-recommendation-group__items',
              );
              const card = document.querySelector(
                '.daily-recommendation-list--dual-owner .kp-recommendation-card',
              );
              const title = card?.querySelector('.kp-recommendation-card__title');
              const detail = card?.querySelector('.kp-recommendation-card__detail');
              const actions = card?.querySelector('.rec-actions');
              const primaryAction = card?.querySelector('.rec-action--primary');
              const ghostActions = [...(card?.querySelectorAll('.rec-action--ghost') ?? [])];
              const overflowToggle = card?.querySelector('.rec-overflow__toggle');
              const disclaimer = document.querySelector('[data-screen-disclaimer="medical-boundary"]');
              const listChoiceStyle = listChoice ? getComputedStyle(listChoice) : null;
              const fullListBodyStyle = fullListBody ? getComputedStyle(fullListBody) : null;
              const groupStyle = group ? getComputedStyle(group) : null;
              const itemsStyle = items ? getComputedStyle(items) : null;
              const cardStyle = card ? getComputedStyle(card) : null;
              const titleStyle = title ? getComputedStyle(title) : null;
              const detailStyle = detail ? getComputedStyle(detail) : null;
              const actionsStyle = actions ? getComputedStyle(actions) : null;
              const primaryActionStyle = primaryAction ? getComputedStyle(primaryAction) : null;
              const overflowToggleStyle = overflowToggle ? getComputedStyle(overflowToggle) : null;
              const cardRect = card?.getBoundingClientRect();
              const listRect = list?.getBoundingClientRect();
              return {
                listOpen: Boolean(listRect && listRect.width > 0 && listRect.height > 0),
                cardVisible: Boolean(cardRect && cardRect.width > 0 && cardRect.height > 0),
                listChoicePaddingTop: listChoiceStyle?.paddingTop ?? '',
                listChoiceGap: listChoiceStyle?.gap ?? '',
                fullListBodyGap: fullListBodyStyle?.gap ?? '',
                groupPaddingTop: groupStyle?.paddingTop ?? '',
                itemsGap: itemsStyle?.gap ?? '',
                cardPaddingTop: cardStyle?.paddingTop ?? '',
                cardGap: cardStyle?.gap ?? '',
                titleFontSize: titleStyle?.fontSize ?? '',
                detailLineHeight: detailStyle?.lineHeight ?? '',
                actionsDisplay: actionsStyle?.display ?? '',
                actionsGridTemplateColumns: actionsStyle?.gridTemplateColumns ?? '',
                primaryActionGridColumnStart: primaryActionStyle?.gridColumnStart ?? '',
                primaryActionGridColumnEnd: primaryActionStyle?.gridColumnEnd ?? '',
                ghostActionsVisible: ghostActions.filter((action) => {
                  const rect = action.getBoundingClientRect();
                  return rect.width > 0 && rect.height > 0;
                }).length,
                overflowToggleMinWidth: overflowToggleStyle?.minWidth ?? '',
                overflowToggleMinHeight: overflowToggleStyle?.minHeight ?? '',
                disclaimerVisible: Boolean(disclaimer),
                cardRight: cardRect?.right ?? 0,
                listRight: listRect?.right ?? 0,
              };
            })()
          : null;
        const dailyAdviceOwnerScanOverflow = routeflow.dailyAdviceOwnerScanOverflow
          ? (() => {
              const scan = document.querySelector('[data-daily-advice-owner-scan="ready"]');
              const cards = [
                ...document.querySelectorAll('[data-daily-advice-owner-scan-card]'),
              ].map((card) => {
                const rect = card.getBoundingClientRect();
                return {
                  owner: card.getAttribute('data-daily-advice-owner-scan-card') ?? '',
                  visible: rect.width > 0 && rect.height > 0,
                  left: rect.left,
                  right: rect.right,
                  top: rect.top,
                  bottom: rect.bottom,
                  text: card.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                };
              });
              const scanRect = scan?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const decisionLane = document.querySelector('[data-daily-advice-decision-lane]');
              const listDetails = document.querySelector('[data-daily-advice-full-list="collapsed"]');
              const decisionRect = decisionLane?.getBoundingClientRect();
              const scanStyle = scan ? getComputedStyle(scan) : null;
              const hasForbiddenText = /diagnose|dosering|behandelkeuzeadvies|secret|token|OCR_RAW|base64|routeflow/i.test(
                cards.map((card) => card.text).join(' '),
              );
              return {
                scanVisible: Boolean(scanRect && scanRect.width > 0 && scanRect.height > 0),
                cardOwners: cards.map((card) => card.owner),
                visibleCards: cards.filter((card) => card.visible).length,
                scanDisplay: scanStyle?.display ?? '',
                scanOverflowX: scanStyle?.overflowX ?? '',
                scanScrollWidth: scan instanceof HTMLElement ? scan.scrollWidth : 0,
                scanClientWidth: scan instanceof HTMLElement ? scan.clientWidth : 0,
                cardsBeforeDecision:
                  Boolean(scan && decisionLane && scanRect && decisionRect) &&
                  scan.compareDocumentPosition(decisionLane) === Node.DOCUMENT_POSITION_FOLLOWING &&
                  scanRect.bottom <= decisionRect.top + 1,
                cardsBeforeList:
                  Boolean(scan && listDetails) &&
                  Boolean(scan.compareDocumentPosition(listDetails) & Node.DOCUMENT_POSITION_FOLLOWING),
                scanContained:
                  Boolean(rootRect && scanRect) &&
                  scanRect.left >= rootRect.left - 1 &&
                  scanRect.right <= rootRect.right + 1,
                hasInternalScroll:
                  scan instanceof HTMLElement ? scan.scrollWidth > scan.clientWidth + 1 : false,
                hasForbiddenText,
              };
            })()
          : null;
        const dailyAdviceSupplementArtscheckAction = routeflow.dailyAdviceSupplementArtscheckAction
          ? (() => {
              const list = document.querySelector('[data-daily-advice-list-mode="dual-owner-cards"]');
              const artscheckItem = document.querySelector(
                '[data-recommendation-checklist-item="artscheck-required"]',
              );
              const standardItems = [
                ...document.querySelectorAll('[data-recommendation-checklist-item="standard"]'),
              ];
              const label = artscheckItem?.querySelector('[data-supplement-checklist-label="ready"]');
              const source = artscheckItem?.querySelector(
                '[data-supplement-checklist-source="ready"]',
              );
              const action = artscheckItem?.querySelector(
                '[data-supplement-artscheck-action="available"]',
              );
              const button = action?.querySelector(
                'button[name="recommendationAction"][value="supplementArtscheck"]',
              );
              const itemRect = artscheckItem?.getBoundingClientRect();
              const labelRect = label?.getBoundingClientRect();
              const sourceRect = source?.getBoundingClientRect();
              const actionRect = action?.getBoundingClientRect();
              const buttonRect = button?.getBoundingClientRect();
              const listRect = list?.getBoundingClientRect();
              const actionStyle = action instanceof HTMLElement ? getComputedStyle(action) : null;
              const buttonStyle = button instanceof HTMLElement ? getComputedStyle(button) : null;
              const standardActionCount = standardItems.reduce(
                (count, item) =>
                  count + item.querySelectorAll('[data-supplement-artscheck-action]').length,
                0,
              );
              const text = artscheckItem?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                listVisible: Boolean(listRect && listRect.width > 0 && listRect.height > 0),
                itemVisible: Boolean(itemRect && itemRect.width > 0 && itemRect.height > 0),
                labelVisible: Boolean(labelRect && labelRect.width > 0 && labelRect.height > 0),
                sourceVisible: Boolean(sourceRect && sourceRect.width > 0 && sourceRect.height > 0),
                actionVisible: Boolean(actionRect && actionRect.width > 0 && actionRect.height > 0),
                buttonVisible: Boolean(buttonRect && buttonRect.width > 0 && buttonRect.height > 0),
                labelText: label?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                sourceText: source?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                buttonText: button?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                actionJustifySelf: actionStyle?.justifySelf ?? '',
                actionWidth: actionStyle?.width ?? '',
                buttonWhiteSpace: buttonStyle?.whiteSpace ?? '',
                standardItemCount: standardItems.length,
                standardActionCount,
                hasForbiddenText: /(\d+([,.]\d+)?\s?(mg|mcg|µg|iu|ie|ml)|interactieclaim|vervang behandeling|behandelkeuzeadvies|tracking-payload|MEDISCHE PAYLOAD|secret|token|base64)/i.test(
                  text,
                ),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1 ||
                  (itemRect && listRect ? itemRect.right > listRect.right + 1 : true) ||
                  (buttonRect && itemRect ? buttonRect.right > itemRect.right + 1 : true),
              };
            })()
          : null;
        const questionArtscheckReviewStatus = routeflow.questionArtscheckReviewStatus
          ? (() => {
              const list = document.querySelector('#question-all-disclosure');
              const artscheckItem = document.querySelector('[data-question-list-item="artscheck"]');
              const standardItems = [
                ...document.querySelectorAll('[data-question-list-item="standard"]'),
              ];
              const review = artscheckItem?.querySelector('[data-question-artscheck-review="ready"]');
              const state = artscheckItem?.querySelector(
                '[data-question-artscheck-review-state="concept"]',
              );
              const badge = artscheckItem?.querySelector(
                '[data-question-artscheck-review-badge="concept"]',
              );
              const form = artscheckItem?.querySelector(
                '[data-question-artscheck-review-form="ready"]',
              );
              const select = form?.querySelector('select[name="artscheckReviewStatus"]');
              const button = form?.querySelector('button[type="submit"]');
              const itemRect = artscheckItem?.getBoundingClientRect();
              const reviewRect = review?.getBoundingClientRect();
              const badgeRect = badge?.getBoundingClientRect();
              const formRect = form?.getBoundingClientRect();
              const selectRect = select?.getBoundingClientRect();
              const buttonRect = button?.getBoundingClientRect();
              const listRect = list?.getBoundingClientRect();
              const formStyle = form instanceof HTMLElement ? getComputedStyle(form) : null;
              const buttonStyle = button instanceof HTMLElement ? getComputedStyle(button) : null;
              const standardReviewFormCount = standardItems.reduce(
                (count, item) =>
                  count + item.querySelectorAll('[data-question-artscheck-review-form]').length,
                0,
              );
              const reviewText = [review, form]
                .map((element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
                .join(' ');
              return {
                listOpen: list instanceof HTMLDetailsElement ? list.open : false,
                itemVisible: Boolean(itemRect && itemRect.width > 0 && itemRect.height > 0),
                reviewVisible: Boolean(reviewRect && reviewRect.width > 0 && reviewRect.height > 0),
                stateVisible: state instanceof HTMLElement,
                badgeVisible: Boolean(badgeRect && badgeRect.width > 0 && badgeRect.height > 0),
                formVisible: Boolean(formRect && formRect.width > 0 && formRect.height > 0),
                selectVisible: Boolean(selectRect && selectRect.width > 0 && selectRect.height > 0),
                buttonVisible: Boolean(buttonRect && buttonRect.width > 0 && buttonRect.height > 0),
                badgeText: badge?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                selectValue: select instanceof HTMLSelectElement ? select.value : '',
                buttonText: button?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                formDisplay: formStyle?.display ?? '',
                formGridTemplateColumns: formStyle?.gridTemplateColumns ?? '',
                buttonWhiteSpace: buttonStyle?.whiteSpace ?? '',
                standardItemCount: standardItems.length,
                standardReviewFormCount,
                hasForbiddenText: /\b(diagnose|dosering|behandelkeuzeadvies|tracking-payload|MEDISCHE PAYLOAD|secret|token|base64)\b/i.test(
                  reviewText,
                ),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1 ||
                  (itemRect && listRect ? itemRect.right > listRect.right + 1 : true) ||
                  (formRect && itemRect ? formRect.right > itemRect.right + 1 : true) ||
                  (buttonRect && itemRect ? buttonRect.right > itemRect.right + 1 : true),
              };
            })()
          : null;
        const dossierImportInboxRetry = routeflow.dossierImportInboxRetry
          ? (() => {
              const inbox = document.querySelector('#dossier-inbox-disclosure');
              const retryItem = document.querySelector('[data-dossier-import-inbox-item="ocr_wacht"]');
              const completedItem = document.querySelector(
                '[data-dossier-import-inbox-item="klaar_voor_review"]',
              );
              const retryState = retryItem?.querySelector('[data-dossier-import-retry-state="ocr_wacht"]');
              const actionbar = retryItem?.querySelector('[data-dossier-import-actionbar="retry-available"]');
              const retryForm = retryItem?.querySelector('[data-dossier-import-retry-form="available"]');
              const retryButton = retryItem?.querySelector('[data-dossier-import-retry-action="available"]');
              const deleteButton = retryItem?.querySelector('[data-attachment-delete-kind="dossier-import"]');
              const completedRetryButton = completedItem?.querySelector(
                '[data-dossier-import-retry-action="available"]',
              );
              const inboxRect = inbox?.getBoundingClientRect();
              const retryRect = retryItem?.getBoundingClientRect();
              const actionbarRect = actionbar?.getBoundingClientRect();
              const retryButtonRect = retryButton?.getBoundingClientRect();
              const deleteButtonRect = deleteButton?.getBoundingClientRect();
              const actionbarStyle =
                actionbar instanceof HTMLElement ? getComputedStyle(actionbar) : null;
              const retryButtonStyle =
                retryButton instanceof HTMLElement ? getComputedStyle(retryButton) : null;
              const retryText = [retryState, actionbar]
                .map((element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
                .join(' ');
              return {
                inboxOpen: inbox instanceof HTMLDetailsElement ? inbox.open : false,
                retryItemVisible: Boolean(retryRect && retryRect.width > 0 && retryRect.height > 0),
                retryStateVisible:
                  retryState instanceof HTMLElement &&
                  retryState.getAttribute('data-dossier-import-retry-state') === 'ocr_wacht',
                actionbarVisible: Boolean(
                  actionbarRect && actionbarRect.width > 0 && actionbarRect.height > 0,
                ),
                retryFormAvailable: retryForm instanceof HTMLFormElement,
                retryButtonVisible: Boolean(
                  retryButtonRect && retryButtonRect.width > 0 && retryButtonRect.height > 0,
                ),
                deleteButtonVisible: Boolean(
                  deleteButtonRect && deleteButtonRect.width > 0 && deleteButtonRect.height > 0,
                ),
                completedHasRetryAction: Boolean(completedRetryButton),
                actionbarDisplay: actionbarStyle?.display ?? '',
                actionbarGridTemplateColumns: actionbarStyle?.gridTemplateColumns ?? '',
                retryButtonWhiteSpace: retryButtonStyle?.whiteSpace ?? '',
                retryButtonText: retryButton?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                deleteButtonText: deleteButton?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                hasForbiddenText: /(\.pdf|\.jpg|\.jpeg|OCR_RAW|MEDISCHE PAYLOAD|diagnose|dosering|behandelkeuzeadvies|secret|token|base64|routeflow-wacht|routeflow-klaar)/i.test(
                  retryText,
                ),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1 ||
                  (retryRect && inboxRect ? retryRect.right > inboxRect.right + 1 : true) ||
                  (actionbarRect && retryRect ? actionbarRect.right > retryRect.right + 1 : true) ||
                  (retryButtonRect && retryRect ? retryButtonRect.right > retryRect.right + 1 : true) ||
                  (deleteButtonRect && retryRect ? deleteButtonRect.right > retryRect.right + 1 : true),
              };
            })()
          : null;
        const dossierOcrReviewCorrection = routeflow.dossierOcrReviewCorrection
          ? (() => {
              const ready = document.querySelector('[data-ocr-review-correction="ready"]');
              const locked = document.querySelector('[data-ocr-review-correction="locked"]');
              const correction = ready?.querySelector('[data-ocr-review-field="correction-text"]');
              const metadata = ready?.querySelector('[data-ocr-review-field="metadata-note"]');
              const status = ready?.querySelector('[data-ocr-review-field="review-status"]');
              const action = ready?.querySelector('[data-ocr-review-action="save"]');
              const lockedBoundary = locked?.querySelector('[data-ocr-review-locked-boundary="ready"]');
              const correctionTextarea = correction?.querySelector('textarea');
              const metadataTextarea = metadata?.querySelector('textarea');
              const statusSelect = status?.querySelector('select');
              const lockedPreview = document.querySelector(
                '[data-attachment-preview-kind="dossier-preview"][data-attachment-preview-state="locked"]',
              );
              const readyRect = ready?.getBoundingClientRect();
              const lockedRect = locked?.getBoundingClientRect();
              const correctionRect = correction?.getBoundingClientRect();
              const metadataRect = metadata?.getBoundingClientRect();
              const statusRect = status?.getBoundingClientRect();
              const actionRect = action?.getBoundingClientRect();
              const lockedBoundaryRect = lockedBoundary?.getBoundingClientRect();
              const readyStyle = ready instanceof HTMLElement ? getComputedStyle(ready) : null;
              const actionStyle = action instanceof HTMLElement ? getComputedStyle(action) : null;
              const text = [ready, locked, lockedPreview]
                .map((element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
                .join(' ');
              const forbiddenMatch = text.match(
                /(\.pdf|\.jpg|\.jpeg|OCR_RAW|GEVOELIGE|MEDISCHE PAYLOAD|secret|token|base64|routeflow-ocr-ready|routeflow-ocr-locked)/i,
              );
              return {
                readyVisible: Boolean(readyRect && readyRect.width > 0 && readyRect.height > 0),
                lockedVisible: Boolean(lockedRect && lockedRect.width > 0 && lockedRect.height > 0),
                correctionVisible: Boolean(
                  correctionRect && correctionRect.width > 0 && correctionRect.height > 0,
                ),
                metadataVisible: Boolean(
                  metadataRect && metadataRect.width > 0 && metadataRect.height > 0,
                ),
                statusVisible: Boolean(statusRect && statusRect.width > 0 && statusRect.height > 0),
                actionVisible: Boolean(actionRect && actionRect.width > 0 && actionRect.height > 0),
                lockedBoundaryVisible: Boolean(
                  lockedBoundaryRect &&
                    lockedBoundaryRect.width > 0 &&
                    lockedBoundaryRect.height > 0,
                ),
                lockedPreviewVisible: lockedPreview instanceof HTMLElement,
                correctionRows:
                  correctionTextarea instanceof HTMLTextAreaElement ? correctionTextarea.rows : 0,
                metadataRows:
                  metadataTextarea instanceof HTMLTextAreaElement ? metadataTextarea.rows : 0,
                statusValue: statusSelect instanceof HTMLSelectElement ? statusSelect.value : '',
                actionText: action?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                readyDisplay: readyStyle?.display ?? '',
                readyGridTemplateColumns: readyStyle?.gridTemplateColumns ?? '',
                actionWhiteSpace: actionStyle?.whiteSpace ?? '',
                forbiddenMatch: forbiddenMatch?.[0] ?? '',
                hasForbiddenText: Boolean(forbiddenMatch),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1 ||
                  (readyRect ? readyRect.right > document.documentElement.clientWidth + 1 : true) ||
                  (lockedRect ? lockedRect.right > document.documentElement.clientWidth + 1 : true) ||
                  (correctionRect && readyRect ? correctionRect.right > readyRect.right + 1 : true) ||
                  (metadataRect && readyRect ? metadataRect.right > readyRect.right + 1 : true) ||
                  (statusRect && readyRect ? statusRect.right > readyRect.right + 1 : true) ||
                  (actionRect && readyRect ? actionRect.right > readyRect.right + 1 : true),
              };
            })()
          : null;
        const dossierMetadataNormalizationCorrection = routeflow.dossierMetadataNormalizationCorrection
          ? (() => {
              const ready = document.querySelector(
                '[data-metadata-normalization-correction="ready"]',
              );
              const locked = document.querySelector(
                '[data-metadata-normalization-correction="locked"]',
              );
              const fields = [
                'date',
                'source',
                'document-type',
                'research-type',
                'attempt',
                'appointment',
                'certainty',
              ].map((field) => {
                const element = ready?.querySelector(
                  `[data-metadata-normalization-field="${field}"]`,
                );
                const control = element?.querySelector('input, select');
                const rect = element?.getBoundingClientRect();
                const controlRect = control?.getBoundingClientRect();
                return {
                  field,
                  visible: Boolean(rect && rect.width > 0 && rect.height > 0),
                  controlVisible: Boolean(
                    controlRect && controlRect.width > 0 && controlRect.height > 0,
                  ),
                  controlName: control?.getAttribute('name') ?? '',
                  overflowsForm: Boolean(
                    rect && ready?.getBoundingClientRect()
                      ? rect.right > ready.getBoundingClientRect().right + 1
                      : true,
                  ),
                };
              });
              const action = ready?.querySelector('[data-metadata-normalization-action="save"]');
              const lockedBoundary = locked?.querySelector(
                '[data-metadata-normalization-locked-boundary="ready"]',
              );
              const lockedPreview = document.querySelector(
                '[data-attachment-preview-kind="dossier-preview"][data-attachment-preview-state="locked"]',
              );
              const readyRect = ready?.getBoundingClientRect();
              const lockedRect = locked?.getBoundingClientRect();
              const actionRect = action?.getBoundingClientRect();
              const lockedBoundaryRect = lockedBoundary?.getBoundingClientRect();
              const readyStyle = ready instanceof HTMLElement ? getComputedStyle(ready) : null;
              const actionStyle = action instanceof HTMLElement ? getComputedStyle(action) : null;
              const lockedText = [locked, lockedPreview]
                .map((element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
                .join(' ');
              const lockedForbiddenMatch = lockedText.match(
                /(\.pdf|\.jpg|\.jpeg|OCR_RAW|GEVOELIGE|MEDISCHE PAYLOAD|secret|token|base64|routeflow-normalization-ready|routeflow-normalization-locked|Veilige bron|locked context)/i,
              );
              return {
                readyVisible: Boolean(readyRect && readyRect.width > 0 && readyRect.height > 0),
                lockedVisible: Boolean(lockedRect && lockedRect.width > 0 && lockedRect.height > 0),
                fields,
                actionVisible: Boolean(actionRect && actionRect.width > 0 && actionRect.height > 0),
                actionText: action?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                actionWhiteSpace: actionStyle?.whiteSpace ?? '',
                lockedBoundaryVisible: Boolean(
                  lockedBoundaryRect &&
                    lockedBoundaryRect.width > 0 &&
                    lockedBoundaryRect.height > 0,
                ),
                lockedPreviewVisible: lockedPreview instanceof HTMLElement,
                readyDisplay: readyStyle?.display ?? '',
                readyGridTemplateColumns: readyStyle?.gridTemplateColumns ?? '',
                lockedForbiddenMatch: lockedForbiddenMatch?.[0] ?? '',
                lockedHasForbiddenText: Boolean(lockedForbiddenMatch),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1 ||
                  (readyRect ? readyRect.right > document.documentElement.clientWidth + 1 : true) ||
                  (lockedRect ? lockedRect.right > document.documentElement.clientWidth + 1 : true) ||
                  (actionRect && readyRect ? actionRect.right > readyRect.right + 1 : true) ||
                  fields.some((field) => field.overflowsForm),
              };
            })()
          : null;
        const dossierHistoricalTimelineReview = routeflow.dossierHistoricalTimelineReview
          ? (() => {
              const ready = document.querySelector('[data-historical-timeline-review="ready"]');
              const locked = document.querySelector('[data-historical-timeline-review="locked"]');
              const readyRectForFields = ready?.getBoundingClientRect();
              const fields = ['date', 'source', 'review-status', 'visibility'].map((field) => {
                const element = ready?.querySelector(
                  `[data-historical-timeline-review-field="${field}"]`,
                );
                const control = element?.querySelector('input, select');
                const rect = element?.getBoundingClientRect();
                const controlRect = control?.getBoundingClientRect();
                return {
                  field,
                  visible: Boolean(rect && rect.width > 0 && rect.height > 0),
                  controlVisible: Boolean(
                    controlRect && controlRect.width > 0 && controlRect.height > 0,
                  ),
                  controlName: control?.getAttribute('name') ?? '',
                  overflowsForm: Boolean(
                    rect && readyRectForFields ? rect.right > readyRectForFields.right + 1 : true,
                  ),
                };
              });
              const action = ready?.querySelector('[data-historical-timeline-review-action="save"]');
              const lockedBoundary = locked?.querySelector(
                '[data-historical-timeline-review-locked-boundary="ready"]',
              );
              const lockedPreview = document.querySelector(
                '[data-attachment-preview-kind="dossier-preview"][data-attachment-preview-state="locked"]',
              );
              const readyRect = ready?.getBoundingClientRect();
              const lockedRect = locked?.getBoundingClientRect();
              const actionRect = action?.getBoundingClientRect();
              const lockedBoundaryRect = lockedBoundary?.getBoundingClientRect();
              const readyStyle = ready instanceof HTMLElement ? getComputedStyle(ready) : null;
              const actionStyle = action instanceof HTMLElement ? getComputedStyle(action) : null;
              const lockedText = [locked, lockedPreview]
                .map((element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
                .join(' ');
              const lockedForbiddenMatch = lockedText.match(
                /(\.pdf|\.jpg|\.jpeg|OCR_RAW|GEVOELIGE|MEDISCHE PAYLOAD|secret|token|base64|routeflow-timeline-ready|routeflow-timeline-locked|Veilige bron|locked context)/i,
              );
              return {
                readyVisible: Boolean(readyRect && readyRect.width > 0 && readyRect.height > 0),
                lockedVisible: Boolean(lockedRect && lockedRect.width > 0 && lockedRect.height > 0),
                fields,
                actionVisible: Boolean(actionRect && actionRect.width > 0 && actionRect.height > 0),
                actionText: action?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                actionWhiteSpace: actionStyle?.whiteSpace ?? '',
                lockedBoundaryVisible: Boolean(
                  lockedBoundaryRect &&
                    lockedBoundaryRect.width > 0 &&
                    lockedBoundaryRect.height > 0,
                ),
                lockedPreviewVisible: lockedPreview instanceof HTMLElement,
                readyDisplay: readyStyle?.display ?? '',
                readyGridTemplateColumns: readyStyle?.gridTemplateColumns ?? '',
                lockedForbiddenMatch: lockedForbiddenMatch?.[0] ?? '',
                lockedHasForbiddenText: Boolean(lockedForbiddenMatch),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1 ||
                  (readyRect ? readyRect.right > document.documentElement.clientWidth + 1 : true) ||
                  (lockedRect ? lockedRect.right > document.documentElement.clientWidth + 1 : true) ||
                  (actionRect && readyRect ? actionRect.right > readyRect.right + 1 : true) ||
                  fields.some((field) => field.overflowsForm),
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
              const routeGroup = consoleElement?.querySelector('[data-dossier-add-route-group]');
              const routeGroupSummary = consoleElement?.querySelector(
                '[data-dossier-add-route-group-summary="ready"]',
              );
              routeGroupSummary?.focus();
              const routeGroupSummaryTitle = routeGroupSummary?.querySelector('span');
              const routeGroupSummaryContext = routeGroupSummary?.querySelector('small');
              const selector = consoleElement?.querySelector('.dossier-add-route-selector');
              const addRoute = selector?.querySelector('.dossier-add-route');
              const activeAddRoute = selector?.querySelector(
                '.dossier-add-route[href="#dossier-upload-form"]',
              );
              const inactiveAddRoute = selector?.querySelector(
                '.dossier-add-route:not([href="#dossier-upload-form"])',
              );
              const routeItem = consoleElement?.querySelector('.dossier-upload-action-path__item');
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
              const routeGroupStyle = routeGroup ? getComputedStyle(routeGroup) : null;
              const routeGroupSummaryRect = routeGroupSummary?.getBoundingClientRect();
              const selectorRect = selector?.getBoundingClientRect();
              const documentRect = documentPanel?.getBoundingClientRect();
              const consultRect = consultPanel?.getBoundingClientRect();
              const reviewRect = reviewPanel?.getBoundingClientRect();
              const embryoQualityRect = embryoQualityPanel?.getBoundingClientRect();
              const embryoStatusRect = embryoStatusPanel?.getBoundingClientRect();
              const bodyStyle = body ? getComputedStyle(body) : null;
              const routeGroupSummaryStyle = routeGroupSummary
                ? getComputedStyle(routeGroupSummary)
                : null;
              const routeGroupSummaryMarkerStyle = routeGroupSummary
                ? getComputedStyle(routeGroupSummary, '::after')
                : null;
              const routeGroupSummaryTitleStyle = routeGroupSummaryTitle
                ? getComputedStyle(routeGroupSummaryTitle)
                : null;
              const routeGroupSummaryContextStyle = routeGroupSummaryContext
                ? getComputedStyle(routeGroupSummaryContext)
                : null;
              const selectorStyle = selector ? getComputedStyle(selector) : null;
              const addRouteRect = addRoute?.getBoundingClientRect();
              const addRouteStyle = addRoute ? getComputedStyle(addRoute) : null;
              const activeAddRouteStyle = activeAddRoute ? getComputedStyle(activeAddRoute) : null;
              const inactiveAddRouteStyle = inactiveAddRoute
                ? getComputedStyle(inactiveAddRoute)
                : null;
              activeAddRoute?.focus();
              const activeAddRouteFocusStyle = activeAddRoute
                ? getComputedStyle(activeAddRoute)
                : null;
              const addRouteLabels = Array.from(
                selector?.querySelectorAll('.dossier-add-route strong, .dossier-add-route span, .dossier-add-route small') ??
                  [],
                (label) => label.textContent?.trim() ?? '',
              );
              const routeItemStyle = routeItem ? getComputedStyle(routeItem) : null;
              const documentStyle = documentPanel ? getComputedStyle(documentPanel) : null;
              const consultStyle = consultPanel ? getComputedStyle(consultPanel) : null;
              const reviewStyle = reviewPanel ? getComputedStyle(reviewPanel) : null;
              const visiblePanels = [
                documentPanel,
                consultPanel,
                embryoQualityPanel,
                embryoStatusPanel,
                reviewPanel,
              ].filter((panel) => {
                const rect = panel?.getBoundingClientRect();
                return Boolean(rect && rect.width > 0 && rect.height > 0);
              });
              const activePanel = visiblePanels[0] ?? null;
              const activePanelRect = activePanel?.getBoundingClientRect();
              const activePanelStyle = activePanel ? getComputedStyle(activePanel) : null;
              const activeGroup = activePanel?.querySelector(
                '.dossier-upload-group, .dossier-subform-group',
              );
              const activeGroupStyle = activeGroup ? getComputedStyle(activeGroup) : null;
              const optionalPanel = activePanel?.querySelector('.dossier-upload-optional');
              const optionalPanelStyle = optionalPanel ? getComputedStyle(optionalPanel) : null;
              const optionalSummary = activePanel?.querySelector('.dossier-upload-optional__summary');
              const optionalSummaryStyle = optionalSummary ? getComputedStyle(optionalSummary) : null;
              const completion = activePanel?.querySelector('.dossier-upload-completion');
              const completionStyle = completion ? getComputedStyle(completion) : null;
              const statusChoice = activePanel?.querySelector('.dossier-upload-completion-status-choice');
              const statusChoiceStyle = statusChoice ? getComputedStyle(statusChoice) : null;
              const submitAction = activePanel?.querySelector('.dossier-submit-action');
              const submitActionRect = submitAction?.getBoundingClientRect();
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
                routeGroupBorderColor: routeGroupStyle?.borderColor ?? '',
                routeGroupBackground: routeGroupStyle?.backgroundColor ?? '',
                routeGroupSummaryVisible: Boolean(
                  routeGroupSummaryRect &&
                    routeGroupSummaryRect.width > 0 &&
                    routeGroupSummaryRect.height > 0,
                ),
                routeGroupSummaryHeight: routeGroupSummaryRect?.height ?? 0,
                routeGroupSummaryPaddingTop: routeGroupSummaryStyle?.paddingTop ?? '',
                routeGroupSummaryOutlineStyle: routeGroupSummaryStyle?.outlineStyle ?? '',
                routeGroupSummaryOutlineWidth: routeGroupSummaryStyle?.outlineWidth ?? '',
                routeGroupSummaryOutlineOffset: routeGroupSummaryStyle?.outlineOffset ?? '',
                routeGroupSummaryBoxShadow: routeGroupSummaryStyle?.boxShadow ?? '',
                routeGroupSummaryGridTemplateColumns:
                  routeGroupSummaryStyle?.gridTemplateColumns ?? '',
                routeGroupSummaryMarkerWidth: routeGroupSummaryMarkerStyle?.width ?? '',
                routeGroupSummaryMarkerHeight: routeGroupSummaryMarkerStyle?.height ?? '',
                routeGroupSummaryMarkerBorderColor:
                  routeGroupSummaryMarkerStyle?.borderColor ?? '',
                routeGroupSummaryMarkerBackground:
                  routeGroupSummaryMarkerStyle?.backgroundColor ?? '',
                routeGroupSummaryMarkerContent: routeGroupSummaryMarkerStyle?.content ?? '',
                routeGroupSummaryTitleColor: routeGroupSummaryTitleStyle?.color ?? '',
                routeGroupSummaryTitleFontWeight: routeGroupSummaryTitleStyle?.fontWeight ?? '',
                routeGroupSummaryContextColor: routeGroupSummaryContextStyle?.color ?? '',
                routeGroupSummaryContextFontWeight:
                  routeGroupSummaryContextStyle?.fontWeight ?? '',
                routeGroupSummaryContextText: routeGroupSummaryContext?.textContent?.trim() ?? '',
                routeGroupSummaryContextLength:
                  routeGroupSummaryContext?.textContent?.trim().length ?? 0,
                routeGroupSummaryContextLineHeight:
                  routeGroupSummaryContextStyle?.lineHeight ?? '',
                selectorDisplay: selectorStyle?.display ?? '',
                selectorGap: selectorStyle?.gap ?? '',
                selectorPaddingTop: selectorStyle?.paddingTop ?? '',
                selectorBorderTopWidth: selectorStyle?.borderTopWidth ?? '',
                selectorBorderTopColor: selectorStyle?.borderTopColor ?? '',
                selectorBackground: selectorStyle?.backgroundColor ?? '',
                selectorScrollWidth: selector?.scrollWidth ?? 0,
                selectorClientWidth: selector?.clientWidth ?? 0,
                addRouteWidth: addRouteRect?.width ?? 0,
                addRouteBorderColor: addRouteStyle?.borderColor ?? '',
                addRouteBackground: addRouteStyle?.backgroundColor ?? '',
                addRouteMinHeight: addRouteStyle?.minHeight ?? '',
                addRoutePaddingTop: addRouteStyle?.paddingTop ?? '',
                addRouteStrongFontSize:
                  addRoute?.querySelector('strong') &&
                  getComputedStyle(addRoute.querySelector('strong')).fontSize,
                addRouteLabelMaxLength: Math.max(0, ...addRouteLabels.map((label) => label.length)),
                addRouteLabels,
                addRouteActiveBorderColor: activeAddRouteStyle?.borderColor ?? '',
                addRouteActiveBackground: activeAddRouteStyle?.backgroundColor ?? '',
                addRouteActiveBoxShadow: activeAddRouteStyle?.boxShadow ?? '',
                addRouteInactiveBorderColor: inactiveAddRouteStyle?.borderColor ?? '',
                addRouteInactiveBackground: inactiveAddRouteStyle?.backgroundColor ?? '',
                addRouteFocusBorderColor: activeAddRouteFocusStyle?.borderColor ?? '',
                addRouteFocusBoxShadow: activeAddRouteFocusStyle?.boxShadow ?? '',
                addRouteFocusTransitionDuration:
                  activeAddRouteFocusStyle?.transitionDuration ?? '',
                addRouteFocusTransitionProperty:
                  activeAddRouteFocusStyle?.transitionProperty ?? '',
                routeItemMinHeight: routeItemStyle?.minHeight ?? '',
                routeItemWidth: routeItem?.getBoundingClientRect().width ?? 0,
                routeItemPaddingTop: routeItemStyle?.paddingTop ?? '',
                activePanelVisible: Boolean(
                  activePanelRect && activePanelRect.width > 0 && activePanelRect.height > 0,
                ),
                activePanelPaddingBottom: activePanelStyle?.paddingBottom ?? '',
                activePanelRight: activePanelRect?.right ?? 0,
                activeGroupVisible: Boolean(activeGroup),
                activeGroupGap: activeGroupStyle?.gap ?? '',
                activeGroupPaddingTop: activeGroupStyle?.paddingTop ?? '',
                activeGroupGridTemplateColumns: activeGroupStyle?.gridTemplateColumns ?? '',
                optionalPanelMarginBottom: optionalPanelStyle?.marginBottom ?? '',
                optionalSummaryMinHeight: optionalSummaryStyle?.minHeight ?? '',
                optionalSummaryPaddingTop: optionalSummaryStyle?.paddingTop ?? '',
                completionGap: completionStyle?.gap ?? '',
                statusChoiceMarginBottom: statusChoiceStyle?.marginBottom ?? '',
                submitActionWidth: submitActionRect?.width ?? 0,
                viewportWidth: window.innerWidth,
              };
            })()
          : null;
        const attachmentEnvelopeBatchStatus = routeflow.attachmentEnvelopeBatchStatus
          ? (() => {
              const batch = document.querySelector('[data-attachment-envelope-batch]');
              const rect = batch?.getBoundingClientRect();
              return {
                visible: Boolean(rect && rect.width > 0 && rect.height > 0),
                state:
                  batch instanceof HTMLElement ? batch.dataset.attachmentEnvelopeBatch ?? '' : '',
                progress:
                  batch instanceof HTMLElement ? batch.dataset.attachmentEnvelopeProgress ?? '' : '',
                text: batch?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                scrollWidth: batch instanceof HTMLElement ? batch.scrollWidth : 0,
                clientWidth: batch instanceof HTMLElement ? batch.clientWidth : 0,
                right: rect?.right ?? 0,
                viewportWidth: window.innerWidth,
              };
            })()
          : null;
        const dossierUploadSizeFeedback = routeflow.dossierUploadSizeFeedback
          ? (() => {
              const feedback = rootElement?.querySelector(
                '[data-dossier-upload-size-feedback="preflight"]',
              );
              const grid = feedback?.querySelector('[data-dossier-upload-size-limit-grid="ready"]');
              const limits = [
                ...(feedback?.querySelectorAll('[data-dossier-upload-size-limit]') ?? []),
              ].map((limit) => {
                const rect = limit.getBoundingClientRect();
                const strong = limit.querySelector('strong');
                const strongRect = strong?.getBoundingClientRect();
                return {
                  id: limit.getAttribute('data-dossier-upload-size-limit') ?? '',
                  visible: rect.width > 0 && rect.height > 0,
                  text: limit.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                  right: rect.right,
                  scrollWidth: limit instanceof HTMLElement ? limit.scrollWidth : 0,
                  clientWidth: limit instanceof HTMLElement ? limit.clientWidth : 0,
                  strongVisible: Boolean(
                    strongRect && strongRect.width > 0 && strongRect.height > 0,
                  ),
                  strongRight: strongRect?.right ?? 0,
                };
              });
              const retry = feedback?.querySelector('[data-dossier-upload-size-retry="safe"]');
              const badge = feedback?.querySelector('[data-dossier-upload-size-status="recoverable"]');
              const envelope = rootElement?.querySelector(
                '[data-attachment-envelope-surface="dossier-upload"]',
              );
              const feedbackRect = feedback?.getBoundingClientRect();
              const gridRect = grid?.getBoundingClientRect();
              const retryRect = retry?.getBoundingClientRect();
              const badgeRect = badge?.getBoundingClientRect();
              const envelopeRect = envelope?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const gridStyle = grid ? getComputedStyle(grid) : null;
              const retryText = retry?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const feedbackText = feedback?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                visible: Boolean(
                  feedbackRect && feedbackRect.width > 0 && feedbackRect.height > 0,
                ),
                gridVisible: Boolean(gridRect && gridRect.width > 0 && gridRect.height > 0),
                limitIds: limits.map((limit) => limit.id),
                visibleLimits: limits.filter((limit) => limit.visible).length,
                allLimitValuesVisible: limits.every((limit) => limit.strongVisible),
                gridTemplateColumns: gridStyle?.gridTemplateColumns ?? '',
                retryVisible: Boolean(retryRect && retryRect.width > 0 && retryRect.height > 0),
                badgeVisible: Boolean(badgeRect && badgeRect.width > 0 && badgeRect.height > 0),
                beforeEnvelope:
                  Boolean(feedback && envelope && feedbackRect && envelopeRect) &&
                  Boolean(feedback.compareDocumentPosition(envelope) & Node.DOCUMENT_POSITION_FOLLOWING) &&
                  feedbackRect.top <= envelopeRect.top + 1,
                contained:
                  Boolean(rootRect && feedbackRect) &&
                  feedbackRect.left >= rootRect.left - 1 &&
                  feedbackRect.right <= rootRect.right + 1,
                limitCardsContained:
                  Boolean(feedbackRect) &&
                  limits.every((limit) => limit.right <= feedbackRect.right + 1),
                hasInternalLimitOverflow: limits.some(
                  (limit) => limit.scrollWidth > limit.clientWidth + 1,
                ),
                retryTextLength: retryText.length,
                hasForbiddenText: /\.pdf|\.jpg|\.jpeg|OCR_RAW|BASE64|data:application|passphrase|token|secret|diagnose|behandelkeuzeadvies|MEDISCHE PAYLOAD|routeflow/i.test(
                  feedbackText,
                ),
              };
            })()
          : null;
        const dossierHospitalTypeReview = routeflow.dossierHospitalTypeReview
          ? (() => {
              const review = rootElement?.querySelector('[data-dossier-hospital-type-review="ready"]');
              const select = review?.querySelector('select[name="ziekenhuisDocumentTypeCorrectie"]');
              const hint = rootElement?.querySelector('[data-dossier-hospital-type-review-hint="safe"]');
              const conceptPreview = rootElement?.querySelector('#dossier-concept-preview');
              const envelope = rootElement?.querySelector(
                '[data-attachment-envelope-surface="dossier-upload"]',
              );
              const options = [
                ...(select instanceof HTMLSelectElement ? select.options : []),
              ].map((option) => ({
                value: option.value,
                text: option.textContent?.replace(/\s+/g, ' ').trim() ?? '',
              }));
              const reviewRect = review?.getBoundingClientRect();
              const selectRect = select?.getBoundingClientRect();
              const hintRect = hint?.getBoundingClientRect();
              const previewRect = conceptPreview?.getBoundingClientRect();
              const envelopeRect = envelope?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const selectStyle = select ? getComputedStyle(select) : null;
              const hintText = hint?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const reviewText = review?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const combinedText = `${reviewText} ${hintText}`;
              return {
                reviewVisible: Boolean(reviewRect && reviewRect.width > 0 && reviewRect.height > 0),
                selectVisible: Boolean(selectRect && selectRect.width > 0 && selectRect.height > 0),
                hintVisible: Boolean(hintRect && hintRect.width > 0 && hintRect.height > 0),
                conceptPreviewVisible: Boolean(
                  previewRect && previewRect.width > 0 && previewRect.height > 0,
                ),
                envelopeVisible: Boolean(envelopeRect && envelopeRect.width > 0 && envelopeRect.height > 0),
                optionValues: options.map((option) => option.value),
                optionTexts: options.map((option) => option.text),
                optionCount: options.length,
                selectValue: select instanceof HTMLSelectElement ? select.value : '',
                selectName: select?.getAttribute('name') ?? '',
                selectMinHeight: selectStyle?.minHeight ?? '',
                selectWidth: selectRect?.width ?? 0,
                selectScrollWidth: select instanceof HTMLElement ? select.scrollWidth : 0,
                selectClientWidth: select instanceof HTMLElement ? select.clientWidth : 0,
                hintTextLength: hintText.length,
                beforeConceptPreview:
                  Boolean(review && conceptPreview && reviewRect && previewRect) &&
                  Boolean(
                    review.compareDocumentPosition(conceptPreview) &
                      Node.DOCUMENT_POSITION_FOLLOWING,
                  ) &&
                  reviewRect.top <= previewRect.top + 1,
                contained:
                  Boolean(rootRect && reviewRect && hintRect && selectRect) &&
                  reviewRect.left >= rootRect.left - 1 &&
                  selectRect.right <= rootRect.right + 1 &&
                  hintRect.right <= rootRect.right + 1,
                hasForbiddenText: /\.pdf|\.jpg|\.jpeg|OCR_RAW|BASE64|data:application|passphrase|token|secret|MEDISCHE PAYLOAD|diagnose stellen|behandelkeuzeadvies|routeflow/i.test(
                  combinedText,
                ),
              };
            })()
          : null;
        const consultTextImportReview = routeflow.consultTextImportReview
          ? (() => {
              const review = rootElement?.querySelector('[data-consult-text-import-review="ready"]');
              const select = review?.querySelector('select[name="consultImportReviewStatus"]');
              const hint = rootElement?.querySelector('[data-consult-text-import-review-hint="safe"]');
              const correction = rootElement?.querySelector('textarea[name="samenvattingCorrectie"]');
              const options = [
                ...(select instanceof HTMLSelectElement ? select.options : []),
              ].map((option) => ({
                value: option.value,
                text: option.textContent?.replace(/\s+/g, ' ').trim() ?? '',
              }));
              const reviewRect = review?.getBoundingClientRect();
              const selectRect = select?.getBoundingClientRect();
              const hintRect = hint?.getBoundingClientRect();
              const correctionRect = correction?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const hintText = hint?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const reviewText = review?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                reviewVisible: Boolean(reviewRect && reviewRect.width > 0 && reviewRect.height > 0),
                selectVisible: Boolean(selectRect && selectRect.width > 0 && selectRect.height > 0),
                hintVisible: Boolean(hintRect && hintRect.width > 0 && hintRect.height > 0),
                correctionVisible: Boolean(
                  correctionRect && correctionRect.width > 0 && correctionRect.height > 0,
                ),
                optionValues: options.map((option) => option.value),
                optionTexts: options.map((option) => option.text),
                optionCount: options.length,
                selectValue: select instanceof HTMLSelectElement ? select.value : '',
                selectName: select?.getAttribute('name') ?? '',
                hintTextLength: hintText.length,
                contained:
                  Boolean(rootRect && reviewRect && hintRect && selectRect) &&
                  reviewRect.left >= rootRect.left - 1 &&
                  selectRect.right <= rootRect.right + 1 &&
                  hintRect.right <= rootRect.right + 1,
                hasForbiddenText: /CONSULT_RAW|consulttekst|transcript|diagnose|dosering|behandelkeuzeadvies|BASE64|OCR_RAW|data:application|passphrase|token|secret|routeflow/i.test(
                  `${reviewText} ${hintText}`,
                ),
              };
            })()
          : null;
        const embryoAliasReview = routeflow.embryoAliasReview
          ? (() => {
              const mode = routeflow.embryoAliasReview;
              const review = rootElement?.querySelector(
                `[data-embryo-alias-review="${mode}"]`,
              );
              const form = review?.closest('form') ?? rootElement;
              const hint = form?.querySelector('[data-embryo-alias-review-hint="safe"]');
              const aliasInput = form?.querySelector('input[name="embryoAliasLabel"]');
              const clinicInput = form?.querySelector('input[name="embryoKliniekId"]');
              const sourceInput = form?.querySelector('input[name="embryoAliasBronLabel"]');
              const statusSelect = form?.querySelector(
                'select[name="embryoAliasReviewStatus"]',
              );
              const options = [
                ...(statusSelect instanceof HTMLSelectElement ? statusSelect.options : []),
              ].map((option) => ({
                value: option.value,
                text: option.textContent?.replace(/\s+/g, ' ').trim() ?? '',
              }));
              const reviewRect = review?.getBoundingClientRect();
              const hintRect = hint?.getBoundingClientRect();
              const aliasRect = aliasInput?.getBoundingClientRect();
              const clinicRect = clinicInput?.getBoundingClientRect();
              const sourceRect = sourceInput?.getBoundingClientRect();
              const selectRect = statusSelect?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const hintText = hint?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const reviewText = review?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                mode,
                reviewVisible: Boolean(reviewRect && reviewRect.width > 0 && reviewRect.height > 0),
                hintVisible: Boolean(hintRect && hintRect.width > 0 && hintRect.height > 0),
                aliasVisible: Boolean(aliasRect && aliasRect.width > 0 && aliasRect.height > 0),
                clinicVisible: Boolean(clinicRect && clinicRect.width > 0 && clinicRect.height > 0),
                sourceVisible: Boolean(sourceRect && sourceRect.width > 0 && sourceRect.height > 0),
                selectVisible: Boolean(selectRect && selectRect.width > 0 && selectRect.height > 0),
                optionValues: options.map((option) => option.value),
                optionTexts: options.map((option) => option.text),
                optionCount: options.length,
                selectValue: statusSelect instanceof HTMLSelectElement ? statusSelect.value : '',
                hintTextLength: hintText.length,
                contained:
                  Boolean(rootRect && reviewRect && hintRect && aliasRect && selectRect) &&
                  reviewRect.left >= rootRect.left - 1 &&
                  aliasRect.right <= rootRect.right + 1 &&
                  selectRect.right <= rootRect.right + 1 &&
                  hintRect.right <= rootRect.right + 1,
                hasForbiddenText: /BASE64|OCR_RAW|data:application|passphrase|token|secret|MEDISCHE PAYLOAD|diagnose|dosering|behandelkeuzeadvies|ranking|rankscore|\b\d+\s?%\s?kans|routeflow/i.test(
                  `${reviewText} ${hintText}`,
                ),
              };
            })()
          : null;
        const imageSummaryChips = routeflow.imageSummaryChips
          ? [
              ...document.querySelectorAll(
                '[data-dossier-upload-image-summary="safe-next-step"] span',
              ),
            ].map((element) => {
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return {
                text: element.textContent?.trim() ?? '',
                visible: rect.width > 0 && rect.height > 0,
                height: rect.height,
                pointerEvents: style.pointerEvents,
                whiteSpace: style.whiteSpace,
                maxWidth: style.maxWidth,
              };
            })
          : null;
        const imageFieldLabels = routeflow.imageFieldLabels
          ? [
              ...document.querySelectorAll(
                '[data-dossier-upload-image-field] .dossier-upload-image-field-label',
              ),
            ].map((element) => {
              const badge = element.querySelector('span');
              const rect = element.getBoundingClientRect();
              const badgeRect = badge?.getBoundingClientRect();
              const style = getComputedStyle(element);
              const parentRect = element.parentElement?.getBoundingClientRect();
              return {
                text: element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                visible: rect.width > 0 && rect.height > 0,
                height: rect.height,
                width: rect.width,
                parentWidth: parentRect?.width ?? 0,
                badgeWidth: badgeRect?.width ?? 0,
                badgeHeight: badgeRect?.height ?? 0,
                fontSize: style.fontSize,
                lineHeight: style.lineHeight,
                whiteSpace: style.whiteSpace,
                overflowsParent: Boolean(parentRect && rect.right > parentRect.right + 1),
              };
            })
          : null;
        const imageOpenFields = routeflow.imageOpenFields
          ? (() => {
              const fieldset = document.querySelector(
                '[data-dossier-upload-image-open-fields="compact-rhythm"]',
              );
              const fieldsetRect = fieldset?.getBoundingClientRect();
              const fieldsetStyle = fieldset ? getComputedStyle(fieldset) : null;
              const rows = [
                ...document.querySelectorAll(
                  '[data-dossier-upload-image-open-fields="compact-rhythm"] label[data-dossier-upload-image-field]',
                ),
              ].map((label) => {
                const labelRect = label.getBoundingClientRect();
                const heading = label.querySelector('.dossier-upload-image-field-label');
                const input = label.querySelector('input');
                const headingRect = heading?.getBoundingClientRect();
                const inputRect = input?.getBoundingClientRect();
                const inputStyle = input ? getComputedStyle(input) : null;
                return {
                  field: label.getAttribute('data-dossier-upload-image-field') ?? '',
                  labelVisible: labelRect.width > 0 && labelRect.height > 0,
                  headingVisible: Boolean(headingRect && headingRect.width > 0 && headingRect.height > 0),
                  inputVisible: Boolean(inputRect && inputRect.width > 0 && inputRect.height > 0),
                  labelHeight: labelRect.height,
                  headingBottom: headingRect?.bottom ?? 0,
                  inputTop: inputRect?.top ?? 0,
                  inputHeight: inputRect?.height ?? 0,
                  inputWidth: inputRect?.width ?? 0,
                  labelWidth: labelRect.width,
                  inputMinHeight: inputStyle?.minHeight ?? '',
                  inputPaddingBlockStart: inputStyle?.paddingBlockStart ?? '',
                  overlapsHeading: Boolean(headingRect && inputRect && inputRect.top < headingRect.bottom - 1),
                  inputOverflowsLabel: Boolean(inputRect && inputRect.right > labelRect.right + 1),
                };
              });
              return {
                visible: Boolean(fieldsetRect && fieldsetRect.width > 0 && fieldsetRect.height > 0),
                height: fieldsetRect?.height ?? 0,
                width: fieldsetRect?.width ?? 0,
                rowGap: fieldsetStyle?.rowGap ?? '',
                scrollWidth: fieldset?.scrollWidth ?? 0,
                clientWidth: fieldset?.clientWidth ?? 0,
                rows,
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
              const scan = rootElement?.querySelector('[data-consult-review-scan="ready"]');
              const scanCards = [
                ...(rootElement?.querySelectorAll('[data-consult-review-scan-card]') ?? []),
              ].map((scanCard) => {
                const rect = scanCard.getBoundingClientRect();
                return {
                  id: scanCard.getAttribute('data-consult-review-scan-card') ?? '',
                  visible: rect.width > 0 && rect.height > 0,
                  left: rect.left,
                  right: rect.right,
                  text: scanCard.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                };
              });
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
              const scanRect = scan?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const scanStyle = scan ? getComputedStyle(scan) : null;
              const scanText = scanCards.map((scanCard) => scanCard.text).join(' ');
              const text = card?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                scanVisible: Boolean(scanRect && scanRect.width > 0 && scanRect.height > 0),
                scanCardIds: scanCards.map((scanCard) => scanCard.id),
                visibleScanCards: scanCards.filter((scanCard) => scanCard.visible).length,
                scanDisplay: scanStyle?.display ?? '',
                scanOverflowX: scanStyle?.overflowX ?? '',
                scanBeforeCard:
                  Boolean(scan && card && scanRect && cardRect) &&
                  Boolean(scan.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) &&
                  scanRect.top <= cardRect.top + 1,
                scanContained:
                  Boolean(rootRect && scanRect) &&
                  scanRect.left >= rootRect.left - 1 &&
                  scanRect.right <= rootRect.right + 1,
                hasInternalScroll:
                  scan instanceof HTMLElement ? scan.scrollWidth > scan.clientWidth + 1 : false,
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
                scanHasPayloadLeak: /BASE64|OCR_RAW|CONSULT_RAW|data:application|passphrase|token|diagnose stellen|dosering aanpassen|kansberekening|behandelkeuzeadvies|routeflow/i.test(
                  scanText,
                ),
                hasPayloadLeak: /BASE64|OCR_RAW|CONSULT_RAW|data:application|passphrase|token|diagnose stellen|dosering aanpassen|kansberekening|behandelkeuzeadvies/i.test(
                  text,
                ),
              };
            })()
          : null;
        const embryoTrackingScanOverflow = routeflow.embryoTrackingScanOverflow
          ? (() => {
              const scan = rootElement?.querySelector('[data-embryo-tracking-scan="ready"]');
              const scanCards = [
                ...(rootElement?.querySelectorAll('[data-embryo-tracking-scan-card]') ?? []),
              ].map((scanCard) => {
                const rect = scanCard.getBoundingClientRect();
                return {
                  id: scanCard.getAttribute('data-embryo-tracking-scan-card') ?? '',
                  visible: rect.width > 0 && rect.height > 0,
                  text: scanCard.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                };
              });
              const grid = rootElement?.querySelector('[data-embryo-tracking-grid="compact"]');
              const card = rootElement?.querySelector('[data-embryo-tracking-card="ready"]');
              const aliasDisplay = rootElement?.querySelector(
                '[data-embryo-alias-review-display="ready"]',
              );
              const sourceCorrection = rootElement?.querySelector(
                '[data-embryo-source-label-correction="ready"]',
              );
              const sourceCorrectionForm = rootElement?.querySelector(
                '[data-embryo-source-label-correction-form="ready"]',
              );
              const sourceLabelInput = sourceCorrectionForm?.querySelector(
                'input[name="embryoBronCorrectieLabel"]',
              );
              const sourceDateInput = sourceCorrectionForm?.querySelector(
                'input[name="embryoBronCorrectieDatum"]',
              );
              const sourceReviewSelect = sourceCorrectionForm?.querySelector(
                'select[name="embryoBronCorrectieReviewStatus"]',
              );
              const sourceSaveButton = sourceCorrectionForm?.querySelector('button[type="submit"]');
              const comparison = rootElement?.textContent?.includes('Embryovergelijking') ?? false;
              const scanRect = scan?.getBoundingClientRect();
              const gridRect = grid?.getBoundingClientRect();
              const cardRect = card?.getBoundingClientRect();
              const aliasRect = aliasDisplay?.getBoundingClientRect();
              const sourceCorrectionRect = sourceCorrection?.getBoundingClientRect();
              const sourceCorrectionFormRect = sourceCorrectionForm?.getBoundingClientRect();
              const sourceLabelRect = sourceLabelInput?.getBoundingClientRect();
              const sourceDateRect = sourceDateInput?.getBoundingClientRect();
              const sourceReviewRect = sourceReviewSelect?.getBoundingClientRect();
              const sourceSaveRect = sourceSaveButton?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const scanStyle = scan ? getComputedStyle(scan) : null;
              const scanText = scanCards.map((scanCard) => scanCard.text).join(' ');
              const rootText = rootElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const sourceReviewOptions = [
                ...(sourceReviewSelect instanceof HTMLSelectElement
                  ? sourceReviewSelect.options
                  : []),
              ].map((option) => ({
                value: option.value,
                text: option.textContent?.replace(/\s+/g, ' ').trim() ?? '',
              }));
              return {
                scanVisible: Boolean(scanRect && scanRect.width > 0 && scanRect.height > 0),
                scanCardIds: scanCards.map((scanCard) => scanCard.id),
                visibleScanCards: scanCards.filter((scanCard) => scanCard.visible).length,
                scanDisplay: scanStyle?.display ?? '',
                scanOverflowX: scanStyle?.overflowX ?? '',
                scanBeforeGrid:
                  Boolean(scan && grid && scanRect && gridRect) &&
                  Boolean(scan.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING) &&
                  scanRect.top <= gridRect.top + 1,
                scanBeforeCard:
                  Boolean(scan && card && scanRect && cardRect) &&
                  Boolean(scan.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) &&
                  scanRect.top <= cardRect.top + 1,
                scanContained:
                  Boolean(rootRect && scanRect) &&
                  scanRect.left >= rootRect.left - 1 &&
                  scanRect.right <= rootRect.right + 1,
                hasInternalScroll:
                  scan instanceof HTMLElement ? scan.scrollWidth > scan.clientWidth + 1 : false,
                detailCardVisible: Boolean(cardRect && cardRect.width > 0 && cardRect.height > 0),
                aliasDisplayVisible: Boolean(
                  aliasRect && aliasRect.width > 0 && aliasRect.height > 0,
                ),
                aliasDisplayText:
                  aliasDisplay?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                sourceCorrectionVisible: Boolean(
                  sourceCorrectionRect &&
                    sourceCorrectionRect.width > 0 &&
                    sourceCorrectionRect.height > 0,
                ),
                sourceCorrectionFormVisible: Boolean(
                  sourceCorrectionFormRect &&
                    sourceCorrectionFormRect.width > 0 &&
                    sourceCorrectionFormRect.height > 0,
                ),
                sourceLabelVisible: Boolean(
                  sourceLabelRect && sourceLabelRect.width > 0 && sourceLabelRect.height > 0,
                ),
                sourceDateVisible: Boolean(
                  sourceDateRect && sourceDateRect.width > 0 && sourceDateRect.height > 0,
                ),
                sourceReviewVisible: Boolean(
                  sourceReviewRect && sourceReviewRect.width > 0 && sourceReviewRect.height > 0,
                ),
                sourceSaveVisible: Boolean(
                  sourceSaveRect && sourceSaveRect.width > 0 && sourceSaveRect.height > 0,
                ),
                sourceReviewOptionValues: sourceReviewOptions.map((option) => option.value),
                sourceReviewOptionTexts: sourceReviewOptions.map((option) => option.text),
                sourceReviewValue:
                  sourceReviewSelect instanceof HTMLSelectElement ? sourceReviewSelect.value : '',
                sourceCorrectionContained:
                  Boolean(
                    rootRect &&
                      sourceCorrectionRect &&
                      sourceCorrectionFormRect &&
                      sourceLabelRect &&
                      sourceDateRect &&
                      sourceReviewRect &&
                      sourceSaveRect,
                  ) &&
                  sourceCorrectionRect.left >= rootRect.left - 1 &&
                  sourceCorrectionRect.right <= rootRect.right + 1 &&
                  sourceCorrectionFormRect.right <= rootRect.right + 1 &&
                  sourceLabelRect.right <= rootRect.right + 1 &&
                  sourceDateRect.right <= rootRect.right + 1 &&
                  sourceReviewRect.right <= rootRect.right + 1 &&
                  sourceSaveRect.right <= rootRect.right + 1,
                comparisonCopyPresent: comparison,
                hasForbiddenText: /BASE64|OCR_RAW|data:application|passphrase|token|behandelkeuzeadvies|\b\d+\s?%\s?kans|ranking|rankscore/i.test(
                  `${scanText} ${rootText}`,
                ),
              };
            })()
          : null;
        const researchTrendScanOverflow = routeflow.researchTrendScanOverflow
          ? (() => {
              const scan = rootElement?.querySelector('[data-research-trend-scan="ready"]');
              const scanCards = [
                ...(rootElement?.querySelectorAll('[data-research-trend-scan-card]') ?? []),
              ].map((scanCard) => {
                const rect = scanCard.getBoundingClientRect();
                return {
                  id: scanCard.getAttribute('data-research-trend-scan-card') ?? '',
                  visible: rect.width > 0 && rect.height > 0,
                  text: scanCard.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                };
              });
              const dashboard = rootElement?.querySelector('[data-research-trend-dashboard="ready"]');
              const grid = rootElement?.querySelector('[data-research-trend-grid="ready"]');
              const detailCard = rootElement?.querySelector('[data-research-trend-card]');
              const trendItem = rootElement?.querySelector('[data-research-trend-item]');
              const sourceList = rootElement?.querySelector('[data-research-source-component="source-list"]');
              const researchForm = rootElement?.querySelector('#research-item-form');
              const networkForm = rootElement?.querySelector('#research-network-form');
              const scanRect = scan?.getBoundingClientRect();
              const dashboardRect = dashboard?.getBoundingClientRect();
              const gridRect = grid?.getBoundingClientRect();
              const detailCardRect = detailCard?.getBoundingClientRect();
              const rootRect = rootElement?.getBoundingClientRect();
              const scanStyle = scan ? getComputedStyle(scan) : null;
              const scanText = scanCards.map((scanCard) => scanCard.text).join(' ');
              const rootText = rootElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                scanVisible: Boolean(scanRect && scanRect.width > 0 && scanRect.height > 0),
                scanCardIds: scanCards.map((scanCard) => scanCard.id),
                visibleScanCards: scanCards.filter((scanCard) => scanCard.visible).length,
                scanDisplay: scanStyle?.display ?? '',
                scanOverflowX: scanStyle?.overflowX ?? '',
                scanBeforeGrid:
                  Boolean(scan && grid && scanRect && gridRect) &&
                  Boolean(scan.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING) &&
                  scanRect.top <= gridRect.top + 1,
                scanBeforeDetail:
                  Boolean(scan && detailCard && scanRect && detailCardRect) &&
                  Boolean(scan.compareDocumentPosition(detailCard) & Node.DOCUMENT_POSITION_FOLLOWING) &&
                  scanRect.top <= detailCardRect.top + 1,
                dashboardVisible: Boolean(
                  dashboardRect && dashboardRect.width > 0 && dashboardRect.height > 0,
                ),
                scanContained:
                  Boolean(rootRect && scanRect) &&
                  scanRect.left >= rootRect.left - 1 &&
                  scanRect.right <= rootRect.right + 1,
                hasInternalScroll:
                  scan instanceof HTMLElement ? scan.scrollWidth > scan.clientWidth + 1 : false,
                detailCardVisible: Boolean(
                  detailCardRect && detailCardRect.width > 0 && detailCardRect.height > 0,
                ),
                trendItemPresent: Boolean(trendItem),
                sourceListPresent: Boolean(sourceList),
                researchFormPresent: Boolean(researchForm),
                networkFormPresent: Boolean(networkForm),
                hasForbiddenText: /BASE64|OCR_RAW|data:application|passphrase|token|diagnose stellen|dosering aanpassen|kansberekening|behandelkeuzeadvies|tracking-payload|MEDISCHE PAYLOAD/i.test(
                  `${scanText} ${rootText}`,
                ),
              };
            })()
          : null;
        const embryoImageClassificationReview = routeflow.embryoImageClassificationReview
          ? (() => {
              const panel = document.querySelector('[data-dossier-imaging-disclosure="repository"]');
              const reviewForm = panel?.querySelector('[data-imaging-metadata-review="ready"]');
              const review = panel?.querySelector(
                '[data-embryo-image-classification-review="concept"]',
              );
              const type = panel?.querySelector('select[name="imagingMetadataSoort"]');
              const source = panel?.querySelector('input[name="imagingMetadataBron"]');
              const date = panel?.querySelector('input[name="imagingMetadataDatum"]');
              const attempt = panel?.querySelector('input[name="imagingMetadataPogingId"]');
              const appointment = panel?.querySelector('input[name="imagingMetadataAfspraakId"]');
              const label = panel?.querySelector('input[name="imagingMetadataEmbryoLabel"]');
              const id = panel?.querySelector('input[name="imagingMetadataEmbryoId"]');
              const exif = panel?.querySelector('select[name="imagingMetadataExifStatus"]');
              const status = panel?.querySelector('select[name="imagingMetadataReviewStatus"]');
              const save = reviewForm?.querySelector('button[type="submit"]');
              const reviewStrong = review?.querySelector('strong');
              const elements = [review, type, source, date, attempt, appointment, label, id, exif, status, save].filter(
                (element) => element instanceof HTMLElement,
              );
              const rects = elements.map((element) => element.getBoundingClientRect());
              const text = reviewForm?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              const reviewStyle = review instanceof HTMLElement ? getComputedStyle(review) : null;
              const reviewStrongStyle =
                reviewStrong instanceof HTMLElement ? getComputedStyle(reviewStrong) : null;
              const fieldStyles = [type, label, id, status]
                .filter((element) => element instanceof HTMLElement)
                .map((element) => {
                  const style = getComputedStyle(element);
                  return {
                    borderStyle: style.borderStyle,
                    backgroundColor: style.backgroundColor,
                    color: style.color,
                  };
                });
              const focusRows = routeflow.embryoImageClassificationForcedColorsFocusEvidence
                ? [
                    ['type', type],
                    ['source', source],
                    ['date', date],
                    ['attempt', attempt],
                    ['appointment', appointment],
                    ['embryoLabel', label],
                    ['embryoId', id],
                    ['exifStatus', exif],
                    ['reviewStatus', status],
                  ].map(([field, element]) => {
                    if (!(element instanceof HTMLElement)) {
                      return {
                        field,
                        active: false,
                        controlVisible: false,
                        labelVisible: false,
                        labelText: '',
                        outlineStyle: '',
                        outlineWidth: '',
                        outlineColor: '',
                        borderStyle: '',
                        borderColor: '',
                        labelColor: '',
                        labelTextDecorationLine: '',
                        hasHorizontalOverflow: true,
                      };
                    }
                    element.focus();
                    const labelElement = element.closest('label');
                    const controlRect = element.getBoundingClientRect();
                    const labelRect = labelElement?.getBoundingClientRect();
                    const controlStyle = getComputedStyle(element);
                    const labelStyle =
                      labelElement instanceof HTMLElement ? getComputedStyle(labelElement) : null;
                    return {
                      field,
                      active: document.activeElement === element,
                      controlVisible: controlRect.width > 0 && controlRect.height > 0,
                      labelVisible: Boolean(
                        labelRect && labelRect.width > 0 && labelRect.height > 0,
                      ),
                      labelText: labelElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                      outlineStyle: controlStyle.outlineStyle,
                      outlineWidth: controlStyle.outlineWidth,
                      outlineColor: controlStyle.outlineColor,
                      borderStyle: controlStyle.borderStyle,
                      borderColor: controlStyle.borderColor,
                      labelColor: labelStyle?.color ?? '',
                      labelTextDecorationLine: labelStyle?.textDecorationLine ?? '',
                      hasHorizontalOverflow:
                        controlRect.left < -1 ||
                        controlRect.right > document.documentElement.clientWidth + 1 ||
                        document.documentElement.scrollWidth >
                          document.documentElement.clientWidth + 1 ||
                        document.body.scrollWidth > document.body.clientWidth + 1,
                    };
                  })
                : [];
              const forbiddenFragments = [
                'kwaliteitsscore',
                'selectieadvies',
                'beeld' + 'payload',
                'OCR-tekst',
                'diagnose',
                'dosering',
                'kansberekening',
                'tracking' + 'payload',
                'data:image',
                'base64',
                'token',
                'secret',
              ];
              return {
                panelOpen: panel instanceof HTMLDetailsElement ? panel.open : false,
                conceptVisible: Boolean(
                  rects[0] && rects[0].width > 0 && rects[0].height > 0,
                ),
                fieldCount: elements.length,
                fieldsVisible: rects.every((rect) => rect.width > 0 && rect.height > 0),
                typeValue: type instanceof HTMLSelectElement ? type.value : '',
                sourceValue: source instanceof HTMLInputElement ? source.value : '',
                dateValue: date instanceof HTMLInputElement ? date.value : '',
                attemptValue: attempt instanceof HTMLInputElement ? attempt.value : '',
                appointmentValue: appointment instanceof HTMLInputElement ? appointment.value : '',
                embryoLabelValue: label instanceof HTMLInputElement ? label.value : '',
                embryoIdValue: id instanceof HTMLInputElement ? id.value : '',
                exifStatusValue: exif instanceof HTMLSelectElement ? exif.value : '',
                reviewStatusValue: status instanceof HTMLSelectElement ? status.value : '',
                saveVisible:
                  save instanceof HTMLElement &&
                  save.getBoundingClientRect().width > 0 &&
                  save.getBoundingClientRect().height > 0,
                saveText: save?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
                forcedColorsActive: window.matchMedia('(forced-colors: active)').matches,
                reviewBorderStyle: reviewStyle?.borderStyle ?? '',
                reviewBorderWidth: reviewStyle?.borderWidth ?? '',
                reviewOutlineStyle: reviewStyle?.outlineStyle ?? '',
                reviewOutlineWidth: reviewStyle?.outlineWidth ?? '',
                reviewStrongTextDecorationLine: reviewStrongStyle?.textDecorationLine ?? '',
                fieldStyles,
                focusRows,
                hasForbiddenText: forbiddenFragments.some((fragment) =>
                  text.toLowerCase().includes(fragment.toLowerCase()),
                ),
                hasHorizontalOverflow:
                  document.documentElement.scrollWidth >
                    document.documentElement.clientWidth + 1 ||
                  document.body.scrollWidth > document.body.clientWidth + 1,
              };
            })()
          : null;
        const imagingMetadataReviewLocked = routeflow.imagingMetadataReviewLocked
          ? (() => {
              const panel = document.querySelector('[data-dossier-imaging-disclosure="repository"]');
              const locked = panel?.querySelector('[data-imaging-metadata-review="locked"]');
              const lockedPreview = panel?.querySelector(
                '[data-attachment-preview-kind="imaging-preview"][data-attachment-preview-state="locked"]',
              );
              const lockedThumbnail = panel?.querySelector(
                '[data-attachment-preview-kind="imaging-thumbnail"][data-attachment-preview-state="locked"]',
              );
              const readyForm = panel?.querySelector('[data-imaging-metadata-review="ready"]');
              const lockedRect = locked?.getBoundingClientRect();
              const previewRect = lockedPreview?.getBoundingClientRect();
              const thumbnailRect = lockedThumbnail?.getBoundingClientRect();
              const rootRect = panel?.getBoundingClientRect();
              const text = [locked, lockedPreview, lockedThumbnail]
                .map((element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
                .join(' ');
              const forbiddenMatch = text.match(
                /(embryo-review\.png|data:image|base64|safe synthetic image fixture|Labportaal|E-A|Dag 5 labbeeld|OCR_RAW|MEDISCHE PAYLOAD|secret|token|routeflow)/i,
              );
              return {
                panelOpen: panel instanceof HTMLDetailsElement ? panel.open : false,
                lockedVisible: Boolean(lockedRect && lockedRect.width > 0 && lockedRect.height > 0),
                lockedPreviewVisible: Boolean(
                  previewRect && previewRect.width > 0 && previewRect.height > 0,
                ),
                lockedThumbnailVisible: Boolean(
                  thumbnailRect && thumbnailRect.width > 0 && thumbnailRect.height > 0,
                ),
                readyFormPresent: Boolean(readyForm),
                hasImageElement: Boolean(
                  panel?.querySelector(
                    '[data-attachment-preview-kind="imaging-preview"] img, [data-attachment-preview-kind="imaging-thumbnail"] img',
                  ),
                ),
                contained:
                  Boolean(rootRect && lockedRect && previewRect && thumbnailRect) &&
                  lockedRect.left >= rootRect.left - 1 &&
                  lockedRect.right <= rootRect.right + 1 &&
                  previewRect.right <= rootRect.right + 1 &&
                  thumbnailRect.right <= rootRect.right + 1,
                forbiddenMatch: forbiddenMatch?.[0] ?? '',
                hasForbiddenText: Boolean(forbiddenMatch),
              };
            })()
          : null;
        const imagingCompareEvidence = routeflow.imagingCompareEvidence
          ? (() => {
              const panel = document.querySelector('[data-dossier-imaging-disclosure="repository"]');
              const compare = panel?.querySelector('[data-imaging-compare-state="ready"]');
              const cards = [...(compare?.querySelectorAll('[data-imaging-compare-card]') ?? [])];
              const fields = [
                'datum',
                'bron',
                'type',
                'notitie',
                'context',
                'preview',
                'koppeling',
              ].map((field) => compare?.querySelector(`[data-imaging-compare-field="${field}"]`));
              const previews = [
                ...(compare?.querySelectorAll('[data-imaging-compare-preview-kind="safe-surface"]') ??
                  []),
              ];
              const compareRect = compare?.getBoundingClientRect();
              const panelRect = panel?.getBoundingClientRect();
              const text = compare?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
              return {
                visible: Boolean(compareRect && compareRect.width > 0 && compareRect.height > 0),
                cards: cards.length,
                fields: fields.filter(Boolean).length,
                previews: previews.length,
                contained:
                  Boolean(compareRect && panelRect) &&
                  compareRect.left >= panelRect.left - 1 &&
                  compareRect.right <= panelRect.right + 1,
                hasDate: text.includes('2026-07-02') && text.includes('2026-07-04'),
                hasSource: text.includes('Routeflow kliniek') && text.includes('Routeflow lab'),
                hasType: text.includes('Echo') && text.includes('Embryo-afbeelding'),
                hasNote: text.includes('Routeflow links') && text.includes('Routeflow embryo dag 5'),
                hasForbiddenText: /kwaliteitsscore|selectieadvies|rangorde|afwijkend|kansberekening|behandelkeuzeadvies|data:image|base64|OCR_RAW|routeflow-compare-links\.jpg|routeflow-compare-rechts\.jpg/i.test(
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
        const centralSessionRenewalRecoveryFocus = routeflow.centralSessionRenewalRecoveryFocus
          ? (() => {
              const status = rootElement?.querySelector(
                '[data-central-session-renewal-recovery-focus-target="ready"]',
              );
              const statusRect = status?.getBoundingClientRect();
              const statusStyle = status instanceof HTMLElement ? getComputedStyle(status) : null;
              return {
                visible: Boolean(statusRect && statusRect.width > 0 && statusRect.height > 0),
                active: document.activeElement === status,
                tabIndex: status instanceof HTMLElement ? status.tabIndex : null,
                role: status?.getAttribute('role') ?? '',
                ariaLive: status?.getAttribute('aria-live') ?? '',
                ariaAtomic: status?.getAttribute('aria-atomic') ?? '',
                outlineStyle: statusStyle?.outlineStyle ?? '',
                outlineWidth: statusStyle?.outlineWidth ?? '',
                outlineOffset: statusStyle?.outlineOffset ?? '',
                boxShadow: statusStyle?.boxShadow ?? '',
                left: statusRect?.left ?? 0,
                right: statusRect?.right ?? 0,
                scrollWidth: status instanceof HTMLElement ? status.scrollWidth : 0,
                clientWidth: status instanceof HTMLElement ? status.clientWidth : 0,
                scrollHeight: status instanceof HTMLElement ? status.scrollHeight : 0,
                clientHeight: status instanceof HTMLElement ? status.clientHeight : 0,
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
          dailyAdviceCompactList,
          dailyAdviceOwnerScanOverflow,
          dailyAdviceSupplementArtscheckAction,
          questionArtscheckReviewStatus,
          dossierImportInboxRetry,
          dossierHistoricalTimelineReview,
          dossierMetadataNormalizationCorrection,
          dossierOcrReviewCorrection,
          startLaunchpad,
          uploadConsole,
          attachmentEnvelopeBatchStatus,
          dossierUploadSizeFeedback,
          dossierHospitalTypeReview,
          consultTextImportReview,
          embryoAliasReview,
          imageSummaryChips,
          imageFieldLabels,
          imageOpenFields,
          imageOpenFieldFocus: null,
          dossierConsole,
          knowledgeConsole,
          consultConsole,
          filledConsultCard,
          embryoTrackingScanOverflow,
          researchTrendScanOverflow,
          embryoImageClassificationReview,
          imagingMetadataReviewLocked,
          imagingCompareEvidence,
          wellbeingConsole,
          treatmentConsole,
          timelineConsole,
          centralSessionRenewalRecoveryFocus,
          appFrame: {
            shellVisible: Boolean(appShellRect && appShellRect.width > 0 && appShellRect.height > 0),
            shellHeight: appShellRect?.height ?? 0,
            viewportHeight: window.innerHeight,
            shellOverflow: appShellStyle?.overflow ?? '',
            contentVisible: Boolean(contentRect && contentRect.width > 0 && contentRect.height > 0),
            contentMaxHeight: contentStyle?.maxHeight ?? '',
            contentOverflowY: contentStyle?.overflowY ?? '',
            contentScrolls: Boolean(content && content.scrollHeight > content.clientHeight + 1),
            activePanelVisible: Boolean(
              activePanelRect && activePanelRect.width > 0 && activePanelRect.height > 0,
            ),
            activePanelOverflowY: activePanelStyle?.overflowY ?? '',
            activePanelScrolls: Boolean(
              activePanel && activePanel.scrollHeight > activePanel.clientHeight + 1,
            ),
            bodyScrolls:
              document.documentElement.scrollHeight > document.documentElement.clientHeight + 1 ||
              document.body.scrollHeight > document.body.clientHeight + 1,
          },
          workspaceStripActive: {
            exists: Boolean(activeWorkspaceButton),
            visible: Boolean(
              activeWorkspaceButtonRect &&
                activeWorkspaceButtonRect.width > 0 &&
                activeWorkspaceButtonRect.height > 0,
            ),
            buttonLeft: activeWorkspaceButtonRect?.left ?? 0,
            buttonRight: activeWorkspaceButtonRect?.right ?? 0,
            stripLeft: activeWorkspaceStripRect?.left ?? 0,
            stripRight: activeWorkspaceStripRect?.right ?? 0,
            stripScrollLeft:
              activeWorkspaceStrip instanceof HTMLElement ? activeWorkspaceStrip.scrollLeft : 0,
            inStripViewport: Boolean(
              activeWorkspaceButtonRect &&
                activeWorkspaceStripRect &&
                activeWorkspaceButtonRect.left >= activeWorkspaceStripRect.left - 4 &&
                activeWorkspaceButtonRect.right <= activeWorkspaceStripRect.right + 4,
            ),
            stripOverflowX:
              activeWorkspaceStrip instanceof HTMLElement
                ? getComputedStyle(activeWorkspaceStrip).overflowX
                : '',
            activeBoxShadow: activeWorkspaceButtonStyle?.boxShadow ?? '',
          },
          inactiveLayouts,
          horizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
            document.body.scrollWidth > document.body.clientWidth + 1,
        };
      }, { routeflow: target, viewportLabel: options.label });
      evidence.imageOpenFieldFocus = imageOpenFieldFocus;
      evidence.attachmentEnvelopeBatchForcedColorsEvidence =
        attachmentEnvelopeBatchForcedColorsEvidence;
      const screenshot = await root.screenshot({ animations: 'disabled' });

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
        evidence.imageSummaryChips &&
        (evidence.imageSummaryChips.length !== 3 ||
          evidence.imageSummaryChips.some(
            (chip) =>
              !chip.visible ||
              chip.height < 34 ||
              chip.pointerEvents !== 'none' ||
              chip.whiteSpace !== 'normal' ||
              chip.maxWidth !== '100%',
          ))
      ) {
        throw new Error(
          `${options.label}/${target.screen}: beeldcontext-chips missen comfortabele non-interactive layout (${JSON.stringify(
            evidence.imageSummaryChips,
          )}).`,
        );
      }
      if (
        evidence.imageFieldLabels &&
        (evidence.imageFieldLabels.length !== 3 ||
          evidence.imageFieldLabels.some(
            (label) =>
              !label.visible ||
              label.height > (options.label === 'small-mobile' ? 26 : 30) ||
              label.badgeWidth > (options.label === 'small-mobile' ? 23 : 25) ||
              label.badgeHeight > (options.label === 'small-mobile' ? 23 : 25) ||
              label.whiteSpace !== 'normal' ||
              label.overflowsParent ||
              label.width > label.parentWidth + 1,
          ))
      ) {
        throw new Error(
          `${options.label}/${target.screen}: beeldcontext-veldlabels missen compacte mobile layout (${JSON.stringify(
            evidence.imageFieldLabels,
          )}).`,
        );
      }
      if (
        evidence.imageOpenFields &&
        (!evidence.imageOpenFields.visible ||
          evidence.imageOpenFields.rows.length !== 3 ||
          evidence.imageOpenFields.scrollWidth > evidence.imageOpenFields.clientWidth + 1 ||
          evidence.imageOpenFields.height > (options.label === 'small-mobile' ? 235 : 250) ||
          evidence.imageOpenFields.rows.some(
            (row) =>
              !row.labelVisible ||
              !row.headingVisible ||
              !row.inputVisible ||
              row.labelHeight > 70 ||
              row.inputHeight > 44 ||
              row.inputWidth > row.labelWidth + 1 ||
              row.inputMinHeight !== '40px' ||
              row.inputPaddingBlockStart !== '8px' ||
              row.overlapsHeading ||
              row.inputOverflowsLabel,
          ))
      ) {
        throw new Error(
          `${options.label}/${target.screen}: geopende beeldcontextvelden missen compact ritme (${JSON.stringify(
            evidence.imageOpenFields,
          )}).`,
        );
      }
      if (
        evidence.imageOpenFieldFocus &&
        (evidence.imageOpenFieldFocus.documentOverflowBefore ||
          evidence.imageOpenFieldFocus.rows.length !== 3 ||
          evidence.imageOpenFieldFocus.rows.some(
            (row) =>
              !row.active ||
              row.inputHeight > 40 ||
              row.inputWidth > row.labelWidth + 1 ||
              Math.abs(row.fieldsetHeightAfter - row.fieldsetHeightBefore) > 1 ||
              Math.abs(row.fieldsetWidthAfter - row.fieldsetWidthBefore) > 1 ||
              row.outlineStyle === 'none' ||
              row.outlineWidth !== '2px' ||
              row.outlineOffset !== '1px' ||
              row.boxShadow === 'none' ||
              row.inputOverflowsLabel ||
              row.horizontalOverflow,
          ))
      ) {
        throw new Error(
          `${options.label}/${target.screen}: beeldcontextinput-focusruimte is instabiel (${JSON.stringify(
            evidence.imageOpenFieldFocus,
          )}).`,
        );
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
          evidence.appFrame.contentOverflowY !== 'hidden' ||
          evidence.appFrame.contentMaxHeight === 'none' ||
          !evidence.appFrame.activePanelVisible ||
          evidence.appFrame.activePanelOverflowY !== 'auto' ||
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
        evidence.dailyAdviceOwnerScanOverflow &&
        (!evidence.dailyAdviceOwnerScanOverflow.scanVisible ||
          evidence.dailyAdviceOwnerScanOverflow.visibleCards !== 3 ||
          !evidence.dailyAdviceOwnerScanOverflow.cardOwners.includes('vrouw') ||
          !evidence.dailyAdviceOwnerScanOverflow.cardOwners.includes('man') ||
          !evidence.dailyAdviceOwnerScanOverflow.cardOwners.includes('samen') ||
          !['flex', 'grid'].includes(evidence.dailyAdviceOwnerScanOverflow.scanDisplay) ||
          !evidence.dailyAdviceOwnerScanOverflow.cardsBeforeDecision ||
          !evidence.dailyAdviceOwnerScanOverflow.cardsBeforeList ||
          !evidence.dailyAdviceOwnerScanOverflow.scanContained ||
          evidence.dailyAdviceOwnerScanOverflow.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: dagadvies owner-scan mist routeflow-overflow evidence (${JSON.stringify(evidence.dailyAdviceOwnerScanOverflow)}).`,
        );
      }
      if (
        (options.label === 'mobile' || options.label === 'small-mobile') &&
        evidence.dailyAdviceCompactList &&
        (!evidence.dailyAdviceCompactList.listOpen ||
          !evidence.dailyAdviceCompactList.cardVisible ||
          parseFloat(evidence.dailyAdviceCompactList.listChoicePaddingTop) > 10 ||
          parseFloat(evidence.dailyAdviceCompactList.listChoiceGap) > 8 ||
          parseFloat(evidence.dailyAdviceCompactList.fullListBodyGap) > 8 ||
          parseFloat(evidence.dailyAdviceCompactList.groupPaddingTop) > 9 ||
          parseFloat(evidence.dailyAdviceCompactList.itemsGap) > 8 ||
          parseFloat(evidence.dailyAdviceCompactList.cardPaddingTop) > 11 ||
          parseFloat(evidence.dailyAdviceCompactList.cardGap) > 7 ||
          parseFloat(evidence.dailyAdviceCompactList.titleFontSize) > 16 ||
          parseFloat(evidence.dailyAdviceCompactList.detailLineHeight) > 22 ||
          evidence.dailyAdviceCompactList.actionsDisplay !== 'grid' ||
          evidence.dailyAdviceCompactList.ghostActionsVisible < 2 ||
          parseFloat(evidence.dailyAdviceCompactList.overflowToggleMinWidth) > 42 ||
          parseFloat(evidence.dailyAdviceCompactList.overflowToggleMinHeight) > 42 ||
          !evidence.dailyAdviceCompactList.disclaimerVisible ||
          evidence.dailyAdviceCompactList.cardRight > evidence.dailyAdviceCompactList.listRight + 1)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: mobiele dagadvieslijst is niet compact of verliest acties/disclaimer (${JSON.stringify(evidence.dailyAdviceCompactList)}).`,
        );
      }
      if (
        evidence.dailyAdviceSupplementArtscheckAction &&
        (!evidence.dailyAdviceSupplementArtscheckAction.listVisible ||
          !evidence.dailyAdviceSupplementArtscheckAction.itemVisible ||
          !evidence.dailyAdviceSupplementArtscheckAction.labelVisible ||
          !evidence.dailyAdviceSupplementArtscheckAction.sourceVisible ||
          !evidence.dailyAdviceSupplementArtscheckAction.actionVisible ||
          !evidence.dailyAdviceSupplementArtscheckAction.buttonVisible ||
          !evidence.dailyAdviceSupplementArtscheckAction.labelText ||
          !evidence.dailyAdviceSupplementArtscheckAction.sourceText.includes('Bron:') ||
          !evidence.dailyAdviceSupplementArtscheckAction.sourceText.includes('Artscheck verplicht') ||
          evidence.dailyAdviceSupplementArtscheckAction.buttonText !== 'Maak artscheckvraag' ||
          evidence.dailyAdviceSupplementArtscheckAction.standardItemCount < 1 ||
          evidence.dailyAdviceSupplementArtscheckAction.standardActionCount !== 0 ||
          evidence.dailyAdviceSupplementArtscheckAction.hasForbiddenText ||
          evidence.dailyAdviceSupplementArtscheckAction.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: supplement-artscheckactie mist scanbare routeflow-evidence of lekt medische payload (${JSON.stringify(evidence.dailyAdviceSupplementArtscheckAction)}).`,
        );
      }
      if (
        evidence.questionArtscheckReviewStatus &&
        (!evidence.questionArtscheckReviewStatus.listOpen ||
          !evidence.questionArtscheckReviewStatus.itemVisible ||
          !evidence.questionArtscheckReviewStatus.reviewVisible ||
          !evidence.questionArtscheckReviewStatus.stateVisible ||
          !evidence.questionArtscheckReviewStatus.badgeVisible ||
          !evidence.questionArtscheckReviewStatus.formVisible ||
          !evidence.questionArtscheckReviewStatus.selectVisible ||
          !evidence.questionArtscheckReviewStatus.buttonVisible ||
          evidence.questionArtscheckReviewStatus.badgeText !== 'Concept' ||
          evidence.questionArtscheckReviewStatus.selectValue !== 'concept' ||
          evidence.questionArtscheckReviewStatus.buttonText !== 'Reviewstatus bewaren' ||
          evidence.questionArtscheckReviewStatus.formDisplay !== 'grid' ||
          evidence.questionArtscheckReviewStatus.standardItemCount < 1 ||
          evidence.questionArtscheckReviewStatus.standardReviewFormCount !== 0 ||
          evidence.questionArtscheckReviewStatus.hasForbiddenText ||
          evidence.questionArtscheckReviewStatus.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: artscheckvraag-reviewstatus mist scanbare routeflow-evidence of lekt medische payload (${JSON.stringify(evidence.questionArtscheckReviewStatus)}).`,
        );
      }
      if (
        evidence.dossierImportInboxRetry &&
        (!evidence.dossierImportInboxRetry.inboxOpen ||
          !evidence.dossierImportInboxRetry.retryItemVisible ||
          !evidence.dossierImportInboxRetry.retryStateVisible ||
          !evidence.dossierImportInboxRetry.actionbarVisible ||
          !evidence.dossierImportInboxRetry.retryFormAvailable ||
          !evidence.dossierImportInboxRetry.retryButtonVisible ||
          !evidence.dossierImportInboxRetry.deleteButtonVisible ||
          evidence.dossierImportInboxRetry.completedHasRetryAction ||
          (options.label === 'desktop' && evidence.dossierImportInboxRetry.actionbarDisplay !== 'flex') ||
          ((options.label === 'mobile' || options.label === 'small-mobile') &&
            evidence.dossierImportInboxRetry.actionbarDisplay !== 'grid') ||
          evidence.dossierImportInboxRetry.retryButtonWhiteSpace !== 'normal' ||
          evidence.dossierImportInboxRetry.retryButtonText !== 'Probeer opnieuw' ||
          evidence.dossierImportInboxRetry.deleteButtonText !== 'Verwijder' ||
          evidence.dossierImportInboxRetry.hasForbiddenText ||
          evidence.dossierImportInboxRetry.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: import-inbox retry mist scanbare routeflow-evidence of lekt payload (${JSON.stringify(evidence.dossierImportInboxRetry)}).`,
        );
      }
      if (
        evidence.dossierOcrReviewCorrection &&
        (!evidence.dossierOcrReviewCorrection.readyVisible ||
          !evidence.dossierOcrReviewCorrection.lockedVisible ||
          !evidence.dossierOcrReviewCorrection.correctionVisible ||
          !evidence.dossierOcrReviewCorrection.metadataVisible ||
          !evidence.dossierOcrReviewCorrection.statusVisible ||
          !evidence.dossierOcrReviewCorrection.actionVisible ||
          !evidence.dossierOcrReviewCorrection.lockedBoundaryVisible ||
          !evidence.dossierOcrReviewCorrection.lockedPreviewVisible ||
          evidence.dossierOcrReviewCorrection.correctionRows < 3 ||
          evidence.dossierOcrReviewCorrection.metadataRows < 2 ||
          !['concept', 'gereviewd'].includes(evidence.dossierOcrReviewCorrection.statusValue) ||
          evidence.dossierOcrReviewCorrection.actionText !== 'OCR-review bewaren' ||
          evidence.dossierOcrReviewCorrection.readyDisplay !== 'grid' ||
          evidence.dossierOcrReviewCorrection.hasForbiddenText ||
          evidence.dossierOcrReviewCorrection.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: OCR-review correctieflow mist scanbare routeflow-evidence of lekt payload (${JSON.stringify(evidence.dossierOcrReviewCorrection)}).`,
        );
      }
      if (
        evidence.dossierMetadataNormalizationCorrection &&
        (!evidence.dossierMetadataNormalizationCorrection.readyVisible ||
          !evidence.dossierMetadataNormalizationCorrection.lockedVisible ||
          evidence.dossierMetadataNormalizationCorrection.fields.length !== 7 ||
          evidence.dossierMetadataNormalizationCorrection.fields.some(
            (field) => !field.visible || !field.controlVisible || !field.controlName,
          ) ||
          !evidence.dossierMetadataNormalizationCorrection.actionVisible ||
          evidence.dossierMetadataNormalizationCorrection.actionText !== 'Normalisatie bewaren' ||
          !evidence.dossierMetadataNormalizationCorrection.lockedBoundaryVisible ||
          !evidence.dossierMetadataNormalizationCorrection.lockedPreviewVisible ||
          evidence.dossierMetadataNormalizationCorrection.readyDisplay !== 'grid' ||
          evidence.dossierMetadataNormalizationCorrection.lockedHasForbiddenText ||
          evidence.dossierMetadataNormalizationCorrection.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: metadata-normalisatie correctieflow mist scanbare routeflow-evidence of lekt payload (${JSON.stringify(evidence.dossierMetadataNormalizationCorrection)}).`,
        );
      }
      if (
        evidence.dossierHistoricalTimelineReview &&
        (!evidence.dossierHistoricalTimelineReview.readyVisible ||
          !evidence.dossierHistoricalTimelineReview.lockedVisible ||
          evidence.dossierHistoricalTimelineReview.fields.length !== 4 ||
          evidence.dossierHistoricalTimelineReview.fields.some(
            (field) => !field.visible || !field.controlVisible || !field.controlName,
          ) ||
          !evidence.dossierHistoricalTimelineReview.actionVisible ||
          evidence.dossierHistoricalTimelineReview.actionText !== 'Tijdlijnreview bewaren' ||
          !evidence.dossierHistoricalTimelineReview.lockedBoundaryVisible ||
          !evidence.dossierHistoricalTimelineReview.lockedPreviewVisible ||
          evidence.dossierHistoricalTimelineReview.readyDisplay !== 'grid' ||
          evidence.dossierHistoricalTimelineReview.lockedHasForbiddenText ||
          evidence.dossierHistoricalTimelineReview.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: historische tijdlijnreview mist scanbare routeflow-evidence of lekt payload (${JSON.stringify(evidence.dossierHistoricalTimelineReview)}).`,
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
        evidence.attachmentEnvelopeBatchStatus &&
        (!evidence.attachmentEnvelopeBatchStatus.visible ||
          evidence.attachmentEnvelopeBatchStatus.state !== 'invalid' ||
          evidence.attachmentEnvelopeBatchStatus.progress !== 'complete' ||
          !evidence.attachmentEnvelopeBatchStatus.text.includes(
            '3 items: 2 klaar, 0 hash-pending, 1 controle nodig.',
          ) ||
          !evidence.attachmentEnvelopeBatchStatus.text.includes('hashcontrole klaar') ||
          !evidence.attachmentEnvelopeBatchStatus.text.includes(
            'Geen bestandsnamen of broninhoud',
          ) ||
          attachmentEnvelopeEvidencePrivacyPattern.test(
            evidence.attachmentEnvelopeBatchStatus.text,
          ) ||
          evidence.attachmentEnvelopeBatchStatus.scrollWidth >
            evidence.attachmentEnvelopeBatchStatus.clientWidth + 1 ||
          evidence.attachmentEnvelopeBatchStatus.right >
            evidence.attachmentEnvelopeBatchStatus.viewportWidth + 1)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: attachment-envelope batchstatus mist veilige compacte evidence (${JSON.stringify(
            evidence.attachmentEnvelopeBatchStatus,
          )}).`,
        );
      }
      if (evidence.attachmentEnvelopeBatchForcedColorsEvidence) {
        assertAttachmentEnvelopeBatchForcedColorsEvidence(
          evidence.attachmentEnvelopeBatchForcedColorsEvidence,
          options.label,
          target.screen,
        );
      }
      if (
        evidence.dossierUploadSizeFeedback &&
        (!evidence.dossierUploadSizeFeedback.visible ||
          !evidence.dossierUploadSizeFeedback.gridVisible ||
          evidence.dossierUploadSizeFeedback.visibleLimits !== 3 ||
          !evidence.dossierUploadSizeFeedback.limitIds.includes('file') ||
          !evidence.dossierUploadSizeFeedback.limitIds.includes('selection') ||
          !evidence.dossierUploadSizeFeedback.limitIds.includes('central') ||
          !evidence.dossierUploadSizeFeedback.allLimitValuesVisible ||
          !evidence.dossierUploadSizeFeedback.retryVisible ||
          !evidence.dossierUploadSizeFeedback.badgeVisible ||
          !evidence.dossierUploadSizeFeedback.beforeEnvelope ||
          !evidence.dossierUploadSizeFeedback.contained ||
          !evidence.dossierUploadSizeFeedback.limitCardsContained ||
          evidence.dossierUploadSizeFeedback.hasInternalLimitOverflow ||
          evidence.dossierUploadSizeFeedback.retryTextLength < 80 ||
          evidence.dossierUploadSizeFeedback.hasForbiddenText ||
          (options.label === 'desktop' &&
            !evidence.dossierUploadSizeFeedback.gridTemplateColumns.includes(' ')) ||
          ((options.label === 'mobile' || options.label === 'small-mobile') &&
            evidence.dossierUploadSizeFeedback.gridTemplateColumns.includes(' ')))
      ) {
        throw new Error(
          `${options.label}/${target.screen}: dossierupload size-feedback mist overflow-evidence of lekt payload (${JSON.stringify(evidence.dossierUploadSizeFeedback)}).`,
        );
      }
      if (
        evidence.dossierHospitalTypeReview &&
        (!evidence.dossierHospitalTypeReview.reviewVisible ||
          !evidence.dossierHospitalTypeReview.selectVisible ||
          !evidence.dossierHospitalTypeReview.hintVisible ||
          !evidence.dossierHospitalTypeReview.conceptPreviewVisible ||
          !evidence.dossierHospitalTypeReview.envelopeVisible ||
          evidence.dossierHospitalTypeReview.selectName !== 'ziekenhuisDocumentTypeCorrectie' ||
          evidence.dossierHospitalTypeReview.selectValue !== '' ||
          evidence.dossierHospitalTypeReview.optionCount < 5 ||
          !evidence.dossierHospitalTypeReview.optionValues.includes('') ||
          !evidence.dossierHospitalTypeReview.optionValues.includes('onbekend') ||
          !evidence.dossierHospitalTypeReview.optionValues.includes('lab_rapport') ||
          !evidence.dossierHospitalTypeReview.optionValues.includes('beeldverslag') ||
          !evidence.dossierHospitalTypeReview.optionValues.includes('algemeen_ziekenhuisdocument') ||
          !evidence.dossierHospitalTypeReview.optionTexts.includes('Automatisch voorstel gebruiken') ||
          !evidence.dossierHospitalTypeReview.optionTexts.includes('Onbekend of niet vastleggen') ||
          !evidence.dossierHospitalTypeReview.optionTexts.includes('Labrapport') ||
          !evidence.dossierHospitalTypeReview.optionTexts.includes('Beeldverslag') ||
          evidence.dossierHospitalTypeReview.hintTextLength < 100 ||
          !evidence.dossierHospitalTypeReview.beforeConceptPreview ||
          !evidence.dossierHospitalTypeReview.contained ||
          evidence.dossierHospitalTypeReview.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: ziekenhuisdocumenttype-review mist routeflow-evidence of lekt payload (${JSON.stringify(evidence.dossierHospitalTypeReview)}).`,
        );
      }
      if (
        evidence.consultTextImportReview &&
        (!evidence.consultTextImportReview.reviewVisible ||
          !evidence.consultTextImportReview.selectVisible ||
          !evidence.consultTextImportReview.hintVisible ||
          !evidence.consultTextImportReview.correctionVisible ||
          evidence.consultTextImportReview.selectName !== 'consultImportReviewStatus' ||
          evidence.consultTextImportReview.selectValue !== 'concept' ||
          evidence.consultTextImportReview.optionCount !== 2 ||
          !evidence.consultTextImportReview.optionValues.includes('concept') ||
          !evidence.consultTextImportReview.optionValues.includes('gereviewd') ||
          !evidence.consultTextImportReview.optionTexts.includes('Concept - nog controleren') ||
          !evidence.consultTextImportReview.optionTexts.includes('Gereviewd - broncontext klopt') ||
          evidence.consultTextImportReview.hintTextLength < 100 ||
          !evidence.consultTextImportReview.contained ||
          evidence.consultTextImportReview.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: consult tekstimport-review mist routeflow-evidence of lekt payload (${JSON.stringify(evidence.consultTextImportReview)}).`,
        );
      }
      if (
        evidence.embryoAliasReview &&
        (!['quality', 'status'].includes(evidence.embryoAliasReview.mode) ||
          !evidence.embryoAliasReview.reviewVisible ||
          !evidence.embryoAliasReview.hintVisible ||
          !evidence.embryoAliasReview.aliasVisible ||
          !evidence.embryoAliasReview.clinicVisible ||
          !evidence.embryoAliasReview.sourceVisible ||
          !evidence.embryoAliasReview.selectVisible ||
          evidence.embryoAliasReview.optionCount !== 2 ||
          !evidence.embryoAliasReview.optionValues.includes('concept') ||
          !evidence.embryoAliasReview.optionValues.includes('gereviewd') ||
          !evidence.embryoAliasReview.optionTexts.includes('Concept - alias controleren') ||
          !evidence.embryoAliasReview.optionTexts.includes('Gereviewd - alias klopt') ||
          evidence.embryoAliasReview.selectValue !== 'concept' ||
          evidence.embryoAliasReview.hintTextLength < 100 ||
          !evidence.embryoAliasReview.contained ||
          evidence.embryoAliasReview.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: embryo alias-review mist routeflow-evidence of lekt payload (${JSON.stringify(evidence.embryoAliasReview)}).`,
        );
      }
      if (
        (options.label === 'mobile' || options.label === 'small-mobile') &&
        evidence.uploadConsole &&
        (!evidence.uploadConsole.bodyVisible ||
          !evidence.uploadConsole.selectorVisible ||
          evidence.uploadConsole.selectorDisplay !== 'flex' ||
          parseFloat(evidence.uploadConsole.selectorGap) > 8 ||
          parseFloat(evidence.uploadConsole.routeItemMinHeight) > 70 ||
          !evidence.uploadConsole.activePanelVisible ||
          parseFloat(evidence.uploadConsole.activePanelPaddingBottom) > 8 ||
          !evidence.uploadConsole.activeGroupVisible ||
          evidence.uploadConsole.activeGroupGridTemplateColumns === '' ||
          parseFloat(evidence.uploadConsole.activeGroupGap) > 8 ||
          parseFloat(evidence.uploadConsole.activeGroupPaddingTop) > 10 ||
          (evidence.uploadConsole.optionalSummaryMinHeight &&
            parseFloat(evidence.uploadConsole.optionalSummaryMinHeight) > 44) ||
          (evidence.uploadConsole.optionalSummaryPaddingTop &&
            parseFloat(evidence.uploadConsole.optionalSummaryPaddingTop) > 9) ||
          (evidence.uploadConsole.optionalPanelMarginBottom &&
            parseFloat(evidence.uploadConsole.optionalPanelMarginBottom) > 8) ||
          (evidence.uploadConsole.completionGap &&
            parseFloat(evidence.uploadConsole.completionGap) > 8) ||
          (evidence.uploadConsole.statusChoiceMarginBottom &&
            parseFloat(evidence.uploadConsole.statusChoiceMarginBottom) > 8) ||
          evidence.uploadConsole.activePanelRight > evidence.uploadConsole.viewportWidth + 1 ||
          evidence.uploadConsole.submitActionWidth > evidence.uploadConsole.viewportWidth)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: mobiele uploadpanelen zijn niet compact of veroorzaken overflow (${JSON.stringify(evidence.uploadConsole)}).`,
        );
      }
      if (
        options.label === 'small-mobile' &&
        evidence.uploadConsole &&
        (!evidence.uploadConsole.routeGroupSummaryVisible ||
          evidence.uploadConsole.routeGroupSummaryHeight > 54 ||
          parseFloat(evidence.uploadConsole.routeGroupSummaryPaddingTop) > 7 ||
          (evidence.uploadConsole.routeGroupSummaryOutlineStyle !== 'none' &&
            (parseFloat(evidence.uploadConsole.routeGroupSummaryOutlineWidth) > 2 ||
              parseFloat(evidence.uploadConsole.routeGroupSummaryOutlineOffset) > 2 ||
              evidence.uploadConsole.routeGroupSummaryBoxShadow !== 'none')) ||
          evidence.uploadConsole.routeGroupBorderColor === '' ||
          evidence.uploadConsole.routeGroupBackground === '' ||
          !evidence.uploadConsole.routeGroupSummaryGridTemplateColumns.includes('18px') ||
          parseFloat(evidence.uploadConsole.routeGroupSummaryMarkerWidth) > 18 ||
          parseFloat(evidence.uploadConsole.routeGroupSummaryMarkerHeight) > 18 ||
          evidence.uploadConsole.routeGroupSummaryMarkerBackground !== 'rgba(0, 0, 0, 0)' ||
          evidence.uploadConsole.routeGroupSummaryMarkerBorderColor === '' ||
          !['"+"', '"-"'].includes(evidence.uploadConsole.routeGroupSummaryMarkerContent) ||
          evidence.uploadConsole.routeGroupSummaryTitleColor === '' ||
          parseFloat(evidence.uploadConsole.routeGroupSummaryTitleFontWeight) > 800 ||
          evidence.uploadConsole.routeGroupSummaryContextColor === '' ||
          parseFloat(evidence.uploadConsole.routeGroupSummaryContextFontWeight) > 680 ||
          evidence.uploadConsole.routeGroupSummaryContextLength > 36 ||
          parseFloat(evidence.uploadConsole.routeGroupSummaryContextLineHeight) > 15 ||
          !evidence.uploadConsole.selectorVisible ||
          parseFloat(evidence.uploadConsole.selectorGap) > 6 ||
          parseFloat(evidence.uploadConsole.selectorPaddingTop) > 4 ||
          parseFloat(evidence.uploadConsole.selectorBorderTopWidth) > 1 ||
          evidence.uploadConsole.selectorBorderTopColor === '' ||
          evidence.uploadConsole.selectorBackground !== 'rgba(0, 0, 0, 0)' ||
          evidence.uploadConsole.selectorClientWidth > evidence.uploadConsole.viewportWidth ||
          evidence.uploadConsole.addRouteWidth > 138 ||
          evidence.uploadConsole.addRouteBorderColor === '' ||
          evidence.uploadConsole.addRouteBorderColor === 'rgba(0, 0, 0, 0)' ||
          evidence.uploadConsole.addRouteBackground === '' ||
          evidence.uploadConsole.addRouteBackground === 'rgba(0, 0, 0, 0)' ||
          parseFloat(evidence.uploadConsole.addRouteMinHeight) > 52 ||
          parseFloat(evidence.uploadConsole.addRoutePaddingTop) > 6 ||
          parseFloat(evidence.uploadConsole.addRouteStrongFontSize) > 13 ||
          evidence.uploadConsole.addRouteLabelMaxLength > 15 ||
          !evidence.uploadConsole.addRouteActiveBorderColor ||
          evidence.uploadConsole.addRouteInactiveBorderColor === '' ||
          evidence.uploadConsole.addRouteActiveBorderColor ===
            evidence.uploadConsole.addRouteInactiveBorderColor ||
          evidence.uploadConsole.addRouteActiveBackground === '' ||
          evidence.uploadConsole.addRouteActiveBackground === 'rgba(0, 0, 0, 0)' ||
          evidence.uploadConsole.addRouteInactiveBackground === '' ||
          evidence.uploadConsole.addRouteActiveBackground !==
            evidence.uploadConsole.addRouteInactiveBackground ||
          !evidence.uploadConsole.addRouteActiveBoxShadow.includes('inset') ||
          evidence.uploadConsole.addRouteActiveBoxShadow.includes('0px -2px') ||
          evidence.uploadConsole.addRouteActiveBoxShadow.includes('0px -3px') ||
          evidence.uploadConsole.addRouteFocusBorderColor === '' ||
          evidence.uploadConsole.addRouteFocusBoxShadow === '' ||
          evidence.uploadConsole.addRouteFocusBoxShadow.includes('0px 0px 0px 3px') ||
          evidence.uploadConsole.addRouteFocusBoxShadow.includes('0px 0px 0px 4px') ||
          evidence.uploadConsole.addRouteFocusTransitionDuration === '' ||
          evidence.uploadConsole.addRouteFocusTransitionProperty === '' ||
          !evidence.uploadConsole.addRouteFocusTransitionProperty.includes('box-shadow') ||
          parseFloat(evidence.uploadConsole.routeItemMinHeight) > 60 ||
          evidence.uploadConsole.routeItemWidth > 158 ||
          parseFloat(evidence.uploadConsole.routeItemPaddingTop) > 7)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: dossier upload routekeuze is niet compact genoeg op small-mobile (${JSON.stringify(evidence.uploadConsole)}).`,
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
        (!evidence.filledConsultCard.scanVisible ||
          evidence.filledConsultCard.visibleScanCards !== 4 ||
          !evidence.filledConsultCard.scanCardIds.includes('reports') ||
          !evidence.filledConsultCard.scanCardIds.includes('summaries') ||
          !evidence.filledConsultCard.scanCardIds.includes('actions') ||
          !evidence.filledConsultCard.scanCardIds.includes('sources') ||
          !['flex', 'grid'].includes(evidence.filledConsultCard.scanDisplay) ||
          !evidence.filledConsultCard.scanBeforeCard ||
          !evidence.filledConsultCard.scanContained ||
          !evidence.filledConsultCard.cardVisible ||
          !evidence.filledConsultCard.headerVisible ||
          evidence.filledConsultCard.statusChipCount < 3 ||
          !evidence.filledConsultCard.sections.includes('tekst') ||
          !evidence.filledConsultCard.sections.includes('samenvatting') ||
          !evidence.filledConsultCard.sections.includes('actiepunten') ||
          !evidence.filledConsultCard.sourceReviewVisible ||
          evidence.filledConsultCard.scanHasPayloadLeak ||
          evidence.filledConsultCard.hasPayloadLeak)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: consult review-scan mist routeflow-overflow evidence of lekt gevoelige tekst (${JSON.stringify(evidence.filledConsultCard)}).`,
        );
      }
      if (
        evidence.embryoTrackingScanOverflow &&
        (!evidence.embryoTrackingScanOverflow.scanVisible ||
          evidence.embryoTrackingScanOverflow.visibleScanCards !== 4 ||
          !evidence.embryoTrackingScanOverflow.scanCardIds.includes('dossiers') ||
          !evidence.embryoTrackingScanOverflow.scanCardIds.includes('measurements') ||
          !evidence.embryoTrackingScanOverflow.scanCardIds.includes('status') ||
          !evidence.embryoTrackingScanOverflow.scanCardIds.includes('sources') ||
          !['flex', 'grid'].includes(evidence.embryoTrackingScanOverflow.scanDisplay) ||
          !evidence.embryoTrackingScanOverflow.scanBeforeGrid ||
          !evidence.embryoTrackingScanOverflow.scanBeforeCard ||
          !evidence.embryoTrackingScanOverflow.scanContained ||
          !evidence.embryoTrackingScanOverflow.detailCardVisible ||
          !evidence.embryoTrackingScanOverflow.aliasDisplayVisible ||
          !evidence.embryoTrackingScanOverflow.aliasDisplayText.includes('Alias:') ||
          !evidence.embryoTrackingScanOverflow.aliasDisplayText.includes('Kliniek-ID:') ||
          !evidence.embryoTrackingScanOverflow.aliasDisplayText.includes('Aliasbron:') ||
          !evidence.embryoTrackingScanOverflow.aliasDisplayText.includes('Aliasreview:') ||
          !evidence.embryoTrackingScanOverflow.sourceCorrectionVisible ||
          !evidence.embryoTrackingScanOverflow.sourceCorrectionFormVisible ||
          !evidence.embryoTrackingScanOverflow.sourceLabelVisible ||
          !evidence.embryoTrackingScanOverflow.sourceDateVisible ||
          !evidence.embryoTrackingScanOverflow.sourceReviewVisible ||
          !evidence.embryoTrackingScanOverflow.sourceSaveVisible ||
          !evidence.embryoTrackingScanOverflow.sourceReviewOptionValues.includes('concept') ||
          !evidence.embryoTrackingScanOverflow.sourceReviewOptionValues.includes('gereviewd') ||
          !evidence.embryoTrackingScanOverflow.sourceReviewOptionTexts.includes(
            'Concept - bron controleren',
          ) ||
          !evidence.embryoTrackingScanOverflow.sourceReviewOptionTexts.includes(
            'Gereviewd - bron klopt',
          ) ||
          !['concept', 'gereviewd'].includes(
            evidence.embryoTrackingScanOverflow.sourceReviewValue,
          ) ||
          !evidence.embryoTrackingScanOverflow.sourceCorrectionContained ||
          !evidence.embryoTrackingScanOverflow.comparisonCopyPresent ||
          evidence.embryoTrackingScanOverflow.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: embryo tracking-scan mist routeflow-overflow evidence of lekt gevoelige tekst (${JSON.stringify(evidence.embryoTrackingScanOverflow)}).`,
        );
      }
      if (
        evidence.researchTrendScanOverflow &&
        (!evidence.researchTrendScanOverflow.scanVisible ||
          evidence.researchTrendScanOverflow.visibleScanCards !== 4 ||
          !evidence.researchTrendScanOverflow.scanCardIds.includes('topics') ||
          !evidence.researchTrendScanOverflow.scanCardIds.includes('publications') ||
          !evidence.researchTrendScanOverflow.scanCardIds.includes('sources') ||
          !evidence.researchTrendScanOverflow.scanCardIds.includes('latest') ||
          !['flex', 'grid'].includes(evidence.researchTrendScanOverflow.scanDisplay) ||
          !evidence.researchTrendScanOverflow.scanBeforeGrid ||
          !evidence.researchTrendScanOverflow.scanBeforeDetail ||
          !evidence.researchTrendScanOverflow.dashboardVisible ||
          !evidence.researchTrendScanOverflow.scanContained ||
          !evidence.researchTrendScanOverflow.detailCardVisible ||
          !evidence.researchTrendScanOverflow.trendItemPresent ||
          !evidence.researchTrendScanOverflow.sourceListPresent ||
          !evidence.researchTrendScanOverflow.researchFormPresent ||
          !evidence.researchTrendScanOverflow.networkFormPresent ||
          evidence.researchTrendScanOverflow.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: research trend-scan mist routeflow-overflow evidence of lekt gevoelige tekst (${JSON.stringify(evidence.researchTrendScanOverflow)}).`,
        );
      }
      if (
        evidence.embryoImageClassificationReview &&
        (!evidence.embryoImageClassificationReview.panelOpen ||
          !evidence.embryoImageClassificationReview.conceptVisible ||
          evidence.embryoImageClassificationReview.fieldCount < 11 ||
          !evidence.embryoImageClassificationReview.fieldsVisible ||
          evidence.embryoImageClassificationReview.typeValue !== 'embryo_afbeelding' ||
          evidence.embryoImageClassificationReview.sourceValue !== 'Labportaal' ||
          evidence.embryoImageClassificationReview.dateValue !== '2026-06-26' ||
          typeof evidence.embryoImageClassificationReview.attemptValue !== 'string' ||
          typeof evidence.embryoImageClassificationReview.appointmentValue !== 'string' ||
          evidence.embryoImageClassificationReview.embryoLabelValue !== 'Embryo A' ||
          evidence.embryoImageClassificationReview.embryoIdValue !== 'E-A' ||
          !['geisoleerd', 'geen_exif', 'onbekend'].includes(
            evidence.embryoImageClassificationReview.exifStatusValue,
          ) ||
          evidence.embryoImageClassificationReview.reviewStatusValue !== 'concept' ||
          !evidence.embryoImageClassificationReview.saveVisible ||
          evidence.embryoImageClassificationReview.saveText !== 'Beeldmetadata bewaren' ||
          (target.embryoImageClassificationForcedColorsEvidence &&
            (!evidence.embryoImageClassificationReview.forcedColorsActive ||
              evidence.embryoImageClassificationReview.reviewBorderStyle === 'none' ||
              evidence.embryoImageClassificationReview.reviewOutlineStyle === 'none' ||
              evidence.embryoImageClassificationReview.reviewStrongTextDecorationLine === 'none' ||
              evidence.embryoImageClassificationReview.fieldStyles.some(
                (field) => field.borderStyle === 'none' || !field.backgroundColor || !field.color,
              ) ||
              (target.embryoImageClassificationForcedColorsFocusEvidence &&
                (evidence.embryoImageClassificationReview.focusRows.length !== 9 ||
                  evidence.embryoImageClassificationReview.focusRows.some(
                    (field) =>
                      !field.active ||
                      !field.controlVisible ||
                      !field.labelVisible ||
                      !field.labelText ||
                      field.outlineStyle === 'none' ||
                      field.outlineWidth === '0px' ||
                      field.borderStyle === 'none' ||
                      !field.borderColor ||
                      !field.labelColor ||
                      field.labelTextDecorationLine === 'none' ||
                      field.hasHorizontalOverflow,
                  )))
              )) ||
          evidence.embryoImageClassificationReview.hasForbiddenText ||
          evidence.embryoImageClassificationReview.hasHorizontalOverflow)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: embryo-beeldclassificatie review mist routeflow-evidence of lekt verboden tekst (${JSON.stringify(evidence.embryoImageClassificationReview)}).`,
        );
      }
      if (
        evidence.imagingMetadataReviewLocked &&
        (!evidence.imagingMetadataReviewLocked.panelOpen ||
          !evidence.imagingMetadataReviewLocked.lockedVisible ||
          !evidence.imagingMetadataReviewLocked.lockedPreviewVisible ||
          !evidence.imagingMetadataReviewLocked.lockedThumbnailVisible ||
          evidence.imagingMetadataReviewLocked.readyFormPresent ||
          evidence.imagingMetadataReviewLocked.hasImageElement ||
          !evidence.imagingMetadataReviewLocked.contained ||
          evidence.imagingMetadataReviewLocked.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: imaging metadata locked-review mist privacy-evidence of lekt broninformatie (${JSON.stringify(evidence.imagingMetadataReviewLocked)}).`,
        );
      }
      if (
        evidence.imagingCompareEvidence &&
        (!evidence.imagingCompareEvidence.visible ||
          evidence.imagingCompareEvidence.cards < 2 ||
          evidence.imagingCompareEvidence.fields < 7 ||
          evidence.imagingCompareEvidence.previews < 2 ||
          !evidence.imagingCompareEvidence.contained ||
          !evidence.imagingCompareEvidence.hasDate ||
          !evidence.imagingCompareEvidence.hasSource ||
          !evidence.imagingCompareEvidence.hasType ||
          !evidence.imagingCompareEvidence.hasNote ||
          evidence.imagingCompareEvidence.hasForbiddenText)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: beeldvergelijking mist datum/bron/type/notitie-evidence of lekt interpretatie/payload (${JSON.stringify(evidence.imagingCompareEvidence)}).`,
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
      if (
        evidence.centralSessionRenewalRecoveryFocus &&
        (!evidence.centralSessionRenewalRecoveryFocus.visible ||
          !evidence.centralSessionRenewalRecoveryFocus.active ||
          evidence.centralSessionRenewalRecoveryFocus.tabIndex !== -1 ||
          evidence.centralSessionRenewalRecoveryFocus.role !== 'status' ||
          evidence.centralSessionRenewalRecoveryFocus.ariaLive !== 'polite' ||
          evidence.centralSessionRenewalRecoveryFocus.ariaAtomic !== 'true' ||
          evidence.centralSessionRenewalRecoveryFocus.left < -1 ||
          evidence.centralSessionRenewalRecoveryFocus.right > options.viewport.width + 1 ||
          evidence.centralSessionRenewalRecoveryFocus.scrollWidth >
            evidence.centralSessionRenewalRecoveryFocus.clientWidth + 1 ||
          evidence.centralSessionRenewalRecoveryFocus.scrollHeight >
            evidence.centralSessionRenewalRecoveryFocus.clientHeight + 24)
      ) {
        throw new Error(
          `${options.label}/${target.screen}: sessieherstel-focus mist stabiele routeflow-evidence (${JSON.stringify(
            evidence.centralSessionRenewalRecoveryFocus,
          )}).`,
        );
      }
      const overflowingText = evidence.required.filter((item) => !item.textFits);
      if (overflowingText.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: routeflow-tekst past niet: ${overflowingText
            .map(
              (item) =>
                `${item.selector} (${item.overflowingNodes
                  .map((node) => `${node.text} ${node.scrollWidth}/${node.clientWidth}`)
                  .join('; ')})`,
            )
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
      if (
        (options.label === 'mobile' || options.label === 'small-mobile') &&
        (!evidence.workspaceStripActive.exists ||
          !evidence.workspaceStripActive.visible ||
          !evidence.workspaceStripActive.inStripViewport ||
          evidence.workspaceStripActive.stripOverflowX !== 'auto')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: actieve workspace-strip knop staat niet zichtbaar in de compacte swipe-rij (${JSON.stringify(
            evidence.workspaceStripActive,
          )}).`,
        );
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

    if (options.label === 'mobile' || options.label === 'small-mobile') {
      checked.push(await assertWorkspaceStripHistoryNavigation(page, options.label));
    }
    if (options.label === 'mobile' || options.label === 'small-mobile') {
      checked.push(await assertWorkspaceStripDirectLinkFocus(page, options.label));
      checked.push(await assertWorkspaceStripReloadContext(page, options.label));
    }

    return { viewport: options.label, checked: checked.length, targets: checked };
  } finally {
    await context.close();
  }
}

async function collectAttachmentEnvelopeBatchForcedColorsEvidence(page, stateOverride) {
  return page.evaluate((override) => {
    const batch = document.querySelector('[data-attachment-envelope-batch]');
    const originalBatch =
      batch instanceof HTMLElement ? batch.dataset.attachmentEnvelopeBatch : undefined;
    const originalProgress =
      batch instanceof HTMLElement ? batch.dataset.attachmentEnvelopeProgress : undefined;
    if (batch instanceof HTMLElement && override) {
      batch.dataset.attachmentEnvelopeBatch = override.batch;
      batch.dataset.attachmentEnvelopeProgress = override.progress;
    }
    const title = batch?.querySelector('strong');
    const batchStyle = batch instanceof HTMLElement ? getComputedStyle(batch) : null;
    const titleStyle = title instanceof HTMLElement ? getComputedStyle(title) : null;
    const rect = batch?.getBoundingClientRect();
    const evidence = {
      forcedColorsActive: window.matchMedia('(forced-colors: active)').matches,
      visible: Boolean(rect && rect.width > 0 && rect.height > 0),
      state: batch instanceof HTMLElement ? batch.dataset.attachmentEnvelopeBatch ?? '' : '',
      progress: batch instanceof HTMLElement ? batch.dataset.attachmentEnvelopeProgress ?? '' : '',
      text: batch?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      borderLeftStyle: batchStyle?.borderLeftStyle ?? '',
      borderLeftWidth: batchStyle?.borderLeftWidth ?? '',
      outlineStyle: batchStyle?.outlineStyle ?? '',
      outlineWidth: batchStyle?.outlineWidth ?? '',
      titleColor: titleStyle?.color ?? '',
      titleTextDecorationLine: titleStyle?.textDecorationLine ?? '',
      titleTextDecorationStyle: titleStyle?.textDecorationStyle ?? '',
      scrollWidth: batch instanceof HTMLElement ? batch.scrollWidth : 0,
      clientWidth: batch instanceof HTMLElement ? batch.clientWidth : 0,
      scrollHeight: batch instanceof HTMLElement ? batch.scrollHeight : 0,
      clientHeight: batch instanceof HTMLElement ? batch.clientHeight : 0,
    };
    if (batch instanceof HTMLElement) {
      batch.dataset.attachmentEnvelopeBatch = originalBatch ?? '';
      batch.dataset.attachmentEnvelopeProgress = originalProgress ?? '';
    }
    return evidence;
  }, stateOverride);
}

function assertAttachmentEnvelopeBatchForcedColorsEvidence(evidence, viewportLabel, screen) {
  const hashing = evidence.hashing ?? {};
  const completeInvalid = evidence.completeInvalid ?? {};
  const combinedText = `${hashing.text ?? ''} ${completeInvalid.text ?? ''}`;
  const hasHorizontalOverflow =
    hashing.scrollWidth > hashing.clientWidth + 1 ||
    completeInvalid.scrollWidth > completeInvalid.clientWidth + 1;
  const hasVerticalOverflow =
    hashing.scrollHeight > hashing.clientHeight + 1 ||
    completeInvalid.scrollHeight > completeInvalid.clientHeight + 1;
  const hasDistinctHashingCue =
    hashing.progress === 'hashing' &&
    hashing.borderLeftStyle !== 'none' &&
    hashing.titleTextDecorationLine !== 'none';
  const hasDistinctCompleteInvalidCue =
    completeInvalid.progress === 'complete' &&
    completeInvalid.state === 'invalid' &&
    completeInvalid.borderLeftStyle !== 'none' &&
    completeInvalid.outlineStyle !== 'none' &&
    completeInvalid.titleTextDecorationStyle === 'double';

  if (
    !hashing.forcedColorsActive ||
    !completeInvalid.forcedColorsActive ||
    !hashing.visible ||
    !completeInvalid.visible ||
    !hasDistinctHashingCue ||
    !hasDistinctCompleteInvalidCue ||
    attachmentEnvelopeEvidencePrivacyPattern.test(combinedText) ||
    hasHorizontalOverflow ||
    hasVerticalOverflow
  ) {
    throw new Error(
      `${viewportLabel}/${screen}: attachment-envelope forced-colors batchprogress mist onderscheidende evidence (${JSON.stringify(
        evidence,
      )}).`,
    );
  }
}

async function assertWorkspaceStripHistoryNavigation(page, viewportLabel) {
  await page.goto(`${url}#start`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#start');
  await waitForStableRouteflowRoot(page, '.content');
  await waitForActiveWorkspaceStripButton(page, 'Start');

  await page.evaluate(() => {
    window.location.hash = '#vragen?route=voorbereiden';
  });
  await waitForStableRouteflowRoot(page, '[data-question-focus-shell="ready"]');
  await waitForActiveWorkspaceStripButton(page, 'Vragen');

  await page.goBack({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '.content');
  await waitForActiveWorkspaceStripButton(page, 'Start');

  await page.goForward({ waitUntil: 'networkidle' });
  await waitForStableRouteflowRoot(page, '[data-question-focus-shell="ready"]');
  await waitForActiveWorkspaceStripButton(page, 'Vragen');

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
      document.body.scrollWidth > document.body.clientWidth + 1,
  );
  if (horizontalOverflow) {
    throw new Error('mobiele workspace-strip history-flow veroorzaakt horizontale overflow.');
  }

  const screenshot = await page.locator('[data-question-focus-shell="ready"]').screenshot({
    animations: 'disabled',
  });

  return {
    screen: `${viewportLabel}-workspace-strip-history`,
    selectors: 3,
    screenshotBytes: screenshot.byteLength,
  };
}

async function assertWorkspaceStripDirectLinkFocus(page, viewportLabel) {
  await page.goto(`${url}#vragen?route=voorbereiden`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#vragen?route=voorbereiden');
  await waitForStableRouteflowRoot(page, '[data-question-focus-shell="ready"]');
  await waitForActiveWorkspaceStripButton(page, 'Vragen');

  const directLinkFocus = await page.evaluate(() => {
    const activeButton = document.querySelector(
      '[data-workspace-strip="ready"] .workspace-strip__switcher a[aria-current="page"]',
    );
    const activeButtonRect = activeButton?.getBoundingClientRect();
    const activeButtonStyle = activeButton ? getComputedStyle(activeButton) : null;
    const activePanel = document.querySelector('[data-screen-stage-scroll="active-workspace"]');
    const activePanelRect = activePanel?.getBoundingClientRect();
    return {
      activeButtonFocused: document.activeElement === activeButton,
      activeElementTag: document.activeElement?.tagName ?? '',
      activePanelVisible: Boolean(
        activePanelRect && activePanelRect.width > 0 && activePanelRect.height > 0,
      ),
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.body.scrollWidth > document.body.clientWidth + 1,
    };
  });

  if (
    directLinkFocus.activeButtonFocused ||
    !directLinkFocus.activePanelVisible ||
    directLinkFocus.horizontalOverflow
  ) {
    throw new Error(
      `mobiele workspace-strip directe link veroorzaakt onrustige focus of overflow (${JSON.stringify(
        directLinkFocus,
      )}).`,
    );
  }

  const screenshot = await page.locator('[data-question-focus-shell="ready"]').screenshot({
    animations: 'disabled',
  });

  return {
    screen: `${viewportLabel}-workspace-strip-direct-link`,
    selectors: 3,
    screenshotBytes: screenshot.byteLength,
  };
}

async function assertWorkspaceStripReloadContext(page, viewportLabel) {
  const expectedReloadHash = '#vragen?route=voorbereiden';

  await page.goto(`${url}${expectedReloadHash}`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, expectedReloadHash);
  await waitForStableRouteflowRoot(page, '[data-question-focus-shell="ready"]');
  await waitForActiveWorkspaceStripButton(page, 'Vragen');

  await page.reload({ waitUntil: 'networkidle' });
  await unlockIfNeeded(page, expectedReloadHash);
  await waitForStableRouteflowRoot(page, '[data-question-focus-shell="ready"]');
  await waitForActiveWorkspaceStripButton(page, 'Vragen');

  const reloadLayout = await page.evaluate(() => {
    const activeButton = document.querySelector(
      '[data-workspace-strip="ready"] .workspace-strip__switcher a[aria-current="page"]',
    );
    const activeButtonRect = activeButton?.getBoundingClientRect();
    const activeButtonStyle = activeButton ? getComputedStyle(activeButton) : null;
    const activePanel = document.querySelector('[data-screen-stage-scroll="active-workspace"]');
    const activePanelRect = activePanel?.getBoundingClientRect();
    const activePanelStyle = activePanel ? getComputedStyle(activePanel) : null;
    const screenStageChrome = document.querySelector('[data-screen-stage-chrome="sticky"]');
    const screenStageChromeRect = screenStageChrome?.getBoundingClientRect();
    const workspaceStrip = document.querySelector('[data-workspace-strip="ready"]');
    const workspaceStripRect = workspaceStrip?.getBoundingClientRect();
    const workspaceSwitcher = document.querySelector(
      '[data-workspace-strip="ready"] .workspace-strip__switcher',
    );
    const workspaceSwitcherRect = workspaceSwitcher?.getBoundingClientRect();
    const workspaceSwitcherStyle = workspaceSwitcher ? getComputedStyle(workspaceSwitcher) : null;
    const bottomNav = document.querySelector('.primary-nav');
    const bottomNavRect = bottomNav?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const bottomNavTop = bottomNavRect?.top ?? viewportHeight;
    const activePanelVisibleHeight =
      activePanelRect ?
        Math.max(0, Math.min(activePanelRect.bottom, bottomNavTop) - Math.max(activePanelRect.top, 0))
      : 0;
    return {
      hash: window.location.hash,
      activeButtonFocused: document.activeElement === activeButton,
      activeElementTag: document.activeElement?.tagName ?? '',
      activeButtonWidth: Math.round(activeButtonRect?.width ?? 0),
      activeButtonLeft: Math.round(activeButtonRect?.left ?? 0),
      activeButtonRight: Math.round(activeButtonRect?.right ?? 0),
      activeButtonMatchesFocus: Boolean(activeButton?.matches(':focus')),
      activeButtonMatchesFocusVisible: Boolean(activeButton?.matches(':focus-visible')),
      activeButtonOutlineStyle: activeButtonStyle?.outlineStyle ?? '',
      activeButtonOutlineWidth: activeButtonStyle?.outlineWidth ?? '',
      activeButtonOverflowX: activeButtonStyle?.overflowX ?? '',
      activeButtonTextOverflow: activeButtonStyle?.textOverflow ?? '',
      activeButtonWhiteSpace: activeButtonStyle?.whiteSpace ?? '',
      activeButtonScrollMarginInlineStart: activeButtonStyle?.scrollMarginInlineStart ?? '',
      activeButtonScrollMarginInlineEnd: activeButtonStyle?.scrollMarginInlineEnd ?? '',
      activeButtonScrollSnapAlign: activeButtonStyle?.scrollSnapAlign ?? '',
      activeButtonScrollSnapStop: activeButtonStyle?.scrollSnapStop ?? '',
      activeButtonTextSizeAdjust:
        activeButtonStyle?.getPropertyValue('text-size-adjust') ||
        activeButtonStyle?.getPropertyValue('-webkit-text-size-adjust') ||
        '',
      activeButtonFontSmoothing:
        activeButtonStyle?.getPropertyValue('-webkit-font-smoothing') || '',
      activeButtonTapHighlightColor:
        activeButtonStyle?.getPropertyValue('-webkit-tap-highlight-color') || '',
      activeButtonClientWidth: Math.round(activeButton?.clientWidth ?? 0),
      activeButtonScrollWidth: Math.round(activeButton?.scrollWidth ?? 0),
      activePanelVisible: Boolean(
        activePanelRect && activePanelRect.width > 0 && activePanelRect.height > 0,
      ),
      activePanelTop: Math.round(activePanelRect?.top ?? 0),
      activePanelBottom: Math.round(activePanelRect?.bottom ?? 0),
      activePanelVisibleHeight: Math.round(activePanelVisibleHeight),
      activePanelScrollTop: Math.round(activePanel?.scrollTop ?? 0),
      documentScrollY: Math.round(window.scrollY),
      documentElementScrollTop: Math.round(document.documentElement.scrollTop),
      bodyScrollTop: Math.round(document.body.scrollTop),
      screenStageChromeHeight: Math.round(screenStageChromeRect?.height ?? 0),
      workspaceStripHeight: Math.round(workspaceStripRect?.height ?? 0),
      workspaceStripLeft: Math.round(workspaceStripRect?.left ?? 0),
      workspaceStripRight: Math.round(workspaceStripRect?.right ?? 0),
      workspaceStripWidth: Math.round(workspaceStripRect?.width ?? 0),
      workspaceSwitcherLeft: Math.round(workspaceSwitcherRect?.left ?? 0),
      workspaceSwitcherRight: Math.round(workspaceSwitcherRect?.right ?? 0),
      workspaceSwitcherClientWidth: Math.round(workspaceSwitcher?.clientWidth ?? 0),
      workspaceSwitcherScrollWidth: Math.round(workspaceSwitcher?.scrollWidth ?? 0),
      workspaceSwitcherClientHeight: Math.round(workspaceSwitcher?.clientHeight ?? 0),
      workspaceSwitcherOffsetHeight: Math.round(workspaceSwitcher?.offsetHeight ?? 0),
      workspaceSwitcherBorderBlockStartWidth:
        workspaceSwitcherStyle?.borderBlockStartWidth ?? '',
      workspaceSwitcherBorderBlockEndWidth: workspaceSwitcherStyle?.borderBlockEndWidth ?? '',
      workspaceSwitcherBorderInlineStartWidth:
        workspaceSwitcherStyle?.borderInlineStartWidth ?? '',
      workspaceSwitcherBorderInlineEndWidth: workspaceSwitcherStyle?.borderInlineEndWidth ?? '',
      workspaceSwitcherBorderBlockStartStyle:
        workspaceSwitcherStyle?.borderBlockStartStyle ?? '',
      workspaceSwitcherBorderBlockEndStyle: workspaceSwitcherStyle?.borderBlockEndStyle ?? '',
      workspaceSwitcherBorderInlineStartStyle:
        workspaceSwitcherStyle?.borderInlineStartStyle ?? '',
      workspaceSwitcherBorderInlineEndStyle: workspaceSwitcherStyle?.borderInlineEndStyle ?? '',
      workspaceSwitcherBorderBlockStartColor:
        workspaceSwitcherStyle?.borderBlockStartColor ?? '',
      workspaceSwitcherBorderBlockEndColor: workspaceSwitcherStyle?.borderBlockEndColor ?? '',
      workspaceSwitcherBorderInlineStartColor:
        workspaceSwitcherStyle?.borderInlineStartColor ?? '',
      workspaceSwitcherBorderInlineEndColor: workspaceSwitcherStyle?.borderInlineEndColor ?? '',
      workspaceSwitcherBorderStartStartRadius:
        workspaceSwitcherStyle?.borderStartStartRadius ?? '',
      workspaceSwitcherBorderStartEndRadius: workspaceSwitcherStyle?.borderStartEndRadius ?? '',
      workspaceSwitcherBorderEndStartRadius: workspaceSwitcherStyle?.borderEndStartRadius ?? '',
      workspaceSwitcherBorderEndEndRadius: workspaceSwitcherStyle?.borderEndEndRadius ?? '',
      workspaceSwitcherBackgroundColor: workspaceSwitcherStyle?.backgroundColor ?? '',
      workspaceSwitcherBackgroundImage: workspaceSwitcherStyle?.backgroundImage ?? '',
      workspaceSwitcherBoxShadow: workspaceSwitcherStyle?.boxShadow ?? '',
      workspaceSwitcherFilter: workspaceSwitcherStyle?.filter ?? '',
      workspaceSwitcherBackdropFilter: workspaceSwitcherStyle?.backdropFilter ?? '',
      workspaceSwitcherOpacity: workspaceSwitcherStyle?.opacity ?? '',
      workspaceSwitcherVisibility: workspaceSwitcherStyle?.visibility ?? '',
      workspaceSwitcherPosition: workspaceSwitcherStyle?.position ?? '',
      workspaceSwitcherInsetBlockStart: workspaceSwitcherStyle?.insetBlockStart ?? '',
      workspaceSwitcherInsetBlockEnd: workspaceSwitcherStyle?.insetBlockEnd ?? '',
      workspaceSwitcherInsetInlineStart: workspaceSwitcherStyle?.insetInlineStart ?? '',
      workspaceSwitcherInsetInlineEnd: workspaceSwitcherStyle?.insetInlineEnd ?? '',
      workspaceSwitcherZIndex: workspaceSwitcherStyle?.zIndex ?? '',
      workspaceSwitcherBoxSizing: workspaceSwitcherStyle?.boxSizing ?? '',
      workspaceSwitcherDisplay: workspaceSwitcherStyle?.display ?? '',
      workspaceSwitcherMinWidth: workspaceSwitcherStyle?.minWidth ?? '',
      workspaceSwitcherMaxWidth: workspaceSwitcherStyle?.maxWidth ?? '',
      workspaceSwitcherOverflowBlock: workspaceSwitcherStyle?.overflowBlock ?? '',
      workspaceSwitcherOverflowInline: workspaceSwitcherStyle?.overflowInline ?? '',
      workspaceSwitcherOverflowX: workspaceSwitcherStyle?.overflowX ?? '',
      workspaceSwitcherOverflowY: workspaceSwitcherStyle?.overflowY ?? '',
      workspaceSwitcherOverscrollBehaviorInline:
        workspaceSwitcherStyle?.overscrollBehaviorInline ?? '',
      workspaceSwitcherFlexBasis: workspaceSwitcherStyle?.flexBasis ?? '',
      workspaceSwitcherFlexGrow: workspaceSwitcherStyle?.flexGrow ?? '',
      workspaceSwitcherFlexShrink: workspaceSwitcherStyle?.flexShrink ?? '',
      workspaceSwitcherFlexWrap: workspaceSwitcherStyle?.flexWrap ?? '',
      workspaceSwitcherAlignItems: workspaceSwitcherStyle?.alignItems ?? '',
      workspaceSwitcherJustifyContent: workspaceSwitcherStyle?.justifyContent ?? '',
      workspaceSwitcherColumnGap: workspaceSwitcherStyle?.columnGap ?? '',
      workspaceSwitcherRowGap: workspaceSwitcherStyle?.rowGap ?? '',
      workspaceSwitcherMarginBlockStart: workspaceSwitcherStyle?.marginBlockStart ?? '',
      workspaceSwitcherMarginBlockEnd: workspaceSwitcherStyle?.marginBlockEnd ?? '',
      workspaceSwitcherMarginInlineStart: workspaceSwitcherStyle?.marginInlineStart ?? '',
      workspaceSwitcherMarginInlineEnd: workspaceSwitcherStyle?.marginInlineEnd ?? '',
      workspaceSwitcherPaddingBlockStart: workspaceSwitcherStyle?.paddingBlockStart ?? '',
      workspaceSwitcherPaddingBlockEnd: workspaceSwitcherStyle?.paddingBlockEnd ?? '',
      workspaceSwitcherPaddingInlineStart: workspaceSwitcherStyle?.paddingInlineStart ?? '',
      workspaceSwitcherPaddingInlineEnd: workspaceSwitcherStyle?.paddingInlineEnd ?? '',
      workspaceSwitcherScrollbarWidth: workspaceSwitcherStyle?.scrollbarWidth ?? '',
      workspaceSwitcherOverscrollBehaviorX: workspaceSwitcherStyle?.overscrollBehaviorX ?? '',
      workspaceSwitcherScrollPaddingInlineStart:
        workspaceSwitcherStyle?.scrollPaddingInlineStart ?? '',
      workspaceSwitcherScrollPaddingInlineEnd: workspaceSwitcherStyle?.scrollPaddingInlineEnd ?? '',
      workspaceSwitcherScrollSnapType: workspaceSwitcherStyle?.scrollSnapType ?? '',
      workspaceSwitcherTouchAction: workspaceSwitcherStyle?.touchAction ?? '',
      bottomNavTop: Math.round(bottomNavTop),
      viewportWidth,
      viewportHeight,
      activePanelOverflowY: activePanelStyle?.overflowY ?? '',
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.body.scrollWidth > document.body.clientWidth + 1,
    };
  });

  const smallMobileReloadHashStable =
    viewportLabel !== 'small-mobile' || reloadLayout.hash === expectedReloadHash;
  const smallMobileExpectedHash =
    viewportLabel === 'small-mobile' ? expectedReloadHash : '';
  const smallMobileActualHash = viewportLabel === 'small-mobile' ? reloadLayout.hash : '';
  const smallMobilePanelPositionStable =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.activePanelTop >= 0 &&
      reloadLayout.activePanelTop < reloadLayout.bottomNavTop - 96 &&
      reloadLayout.activePanelVisibleHeight >=
        Math.min(180, Math.max(96, reloadLayout.viewportHeight * 0.26)));
  const smallMobilePanelScrollStartStable =
    viewportLabel !== 'small-mobile' || reloadLayout.activePanelScrollTop <= 1;
  const smallMobileBodyScrollStable =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.documentScrollY <= 1 &&
      reloadLayout.documentElementScrollTop <= 1 &&
      reloadLayout.bodyScrollTop <= 1);
  const smallMobileChromeCompact =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.screenStageChromeHeight > 0 &&
      reloadLayout.screenStageChromeHeight <=
        Math.min(172, Math.max(132, reloadLayout.viewportHeight * 0.24)));
  const smallMobileWorkspaceStripHeightCompact =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.workspaceStripHeight > 0 &&
      reloadLayout.workspaceStripHeight <= Math.min(138, reloadLayout.viewportHeight * 0.28));
  const smallMobileActiveButtonWidthCompact =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.activeButtonWidth > 0 &&
      reloadLayout.activeButtonWidth <= Math.min(148, reloadLayout.viewportWidth * 0.58) + 1);
  const smallMobileActiveButtonPositionVisible =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.activeButtonLeft >= reloadLayout.workspaceStripLeft - 1 &&
      reloadLayout.activeButtonRight <= reloadLayout.workspaceStripRight + 1);
  const smallMobileActiveButtonFocusRingCalm =
    viewportLabel !== 'small-mobile' ||
    (!reloadLayout.activeButtonMatchesFocus &&
      !reloadLayout.activeButtonMatchesFocusVisible &&
      (reloadLayout.activeButtonOutlineStyle === 'none' ||
        reloadLayout.activeButtonOutlineWidth === '0px'));
  const smallMobileActiveButtonTextClipped =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.activeButtonOverflowX === 'hidden' &&
      reloadLayout.activeButtonTextOverflow === 'ellipsis' &&
      reloadLayout.activeButtonWhiteSpace === 'nowrap' &&
      reloadLayout.activeButtonClientWidth <= reloadLayout.activeButtonWidth &&
      reloadLayout.activeButtonScrollWidth <= reloadLayout.activeButtonWidth + 1);
  const smallMobileSwitcherScrollWidthContained =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.workspaceSwitcherOverflowX === 'auto' &&
      reloadLayout.workspaceSwitcherFlexWrap === 'nowrap' &&
      reloadLayout.workspaceSwitcherClientWidth > 0 &&
      reloadLayout.workspaceSwitcherClientWidth <= reloadLayout.workspaceStripWidth &&
      reloadLayout.workspaceSwitcherScrollWidth >= reloadLayout.workspaceSwitcherClientWidth &&
      reloadLayout.workspaceSwitcherLeft >= reloadLayout.workspaceStripLeft - 1 &&
      reloadLayout.workspaceSwitcherRight <= reloadLayout.workspaceStripRight + 1);
  const smallMobileSwitcherOverflowYStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherOverflowY === 'hidden';
  const smallMobileSwitcherOverflowInlineStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherOverflowInline === 'auto';
  const smallMobileSwitcherOverflowBlockStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherOverflowBlock === 'hidden';
  const smallMobileSwitcherBorderWidthStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherBorderBlockStartWidth) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherBorderBlockEndWidth) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherBorderInlineStartWidth) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherBorderInlineEndWidth) <= 0);
  const smallMobileSwitcherBorderStyleStable =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.workspaceSwitcherBorderBlockStartStyle === 'none' &&
      reloadLayout.workspaceSwitcherBorderBlockEndStyle === 'none' &&
      reloadLayout.workspaceSwitcherBorderInlineStartStyle === 'none' &&
      reloadLayout.workspaceSwitcherBorderInlineEndStyle === 'none');
  const switcherBorderColorValues = [
    reloadLayout.workspaceSwitcherBorderBlockStartColor,
    reloadLayout.workspaceSwitcherBorderBlockEndColor,
    reloadLayout.workspaceSwitcherBorderInlineStartColor,
    reloadLayout.workspaceSwitcherBorderInlineEndColor,
  ];
  const smallMobileSwitcherBorderColorStable =
    viewportLabel !== 'small-mobile' ||
    switcherBorderColorValues.every((color) =>
      ['rgba(0, 0, 0, 0)', 'transparent'].includes(color),
    );
  const smallMobileSwitcherBorderRadiusStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherBorderStartStartRadius) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherBorderStartEndRadius) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherBorderEndStartRadius) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherBorderEndEndRadius) <= 0);
  const smallMobileSwitcherBackgroundStable =
    viewportLabel !== 'small-mobile' ||
    (['rgba(0, 0, 0, 0)', 'transparent'].includes(
      reloadLayout.workspaceSwitcherBackgroundColor,
    ) &&
      reloadLayout.workspaceSwitcherBackgroundImage === 'none');
  const smallMobileSwitcherBoxShadowStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherBoxShadow === 'none';
  const smallMobileSwitcherFilterStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherFilter === 'none';
  const smallMobileSwitcherBackdropFilterStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherBackdropFilter === 'none';
  const smallMobileSwitcherOpacityStable =
    viewportLabel !== 'small-mobile' || parseFloat(reloadLayout.workspaceSwitcherOpacity) >= 1;
  const smallMobileSwitcherVisibilityStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherVisibility === 'visible';
  const smallMobileSwitcherPositionStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherPosition === 'static';
  const smallMobileSwitcherInsetStable =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.workspaceSwitcherInsetBlockStart === 'auto' &&
      reloadLayout.workspaceSwitcherInsetBlockEnd === 'auto' &&
      reloadLayout.workspaceSwitcherInsetInlineStart === 'auto' &&
      reloadLayout.workspaceSwitcherInsetInlineEnd === 'auto');
  const smallMobileSwitcherZIndexStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherZIndex === 'auto';
  const smallMobileSwitcherBoxSizingStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherBoxSizing === 'border-box';
  const smallMobileSwitcherDisplayStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherDisplay === 'flex';
  const smallMobileSwitcherMinWidthStable =
    viewportLabel !== 'small-mobile' || parseFloat(reloadLayout.workspaceSwitcherMinWidth) <= 0;
  const smallMobileSwitcherMaxWidthStable =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.workspaceSwitcherMaxWidth === '100%' &&
      reloadLayout.workspaceSwitcherClientWidth <= reloadLayout.workspaceStripWidth);
  const smallMobileSwitcherFlexShrinkStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherFlexShrink === '1';
  const smallMobileSwitcherFlexGrowStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherFlexGrow === '0';
  const smallMobileSwitcherFlexBasisStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherFlexBasis === 'auto';
  const smallMobileSwitcherScrollbarHidden =
    viewportLabel !== 'small-mobile' ||
    (reloadLayout.workspaceSwitcherScrollbarWidth === 'none' &&
      reloadLayout.workspaceSwitcherOffsetHeight - reloadLayout.workspaceSwitcherClientHeight <= 1);
  const smallMobileSwitcherOverscrollContained =
    viewportLabel !== 'small-mobile' ||
    reloadLayout.workspaceSwitcherOverscrollBehaviorX === 'contain';
  const smallMobileSwitcherOverscrollInlineContained =
    viewportLabel !== 'small-mobile' ||
    reloadLayout.workspaceSwitcherOverscrollBehaviorInline === 'contain';
  const smallMobileSwitcherSnapStable =
    viewportLabel !== 'small-mobile' ||
    ['x', 'x proximity'].includes(reloadLayout.workspaceSwitcherScrollSnapType);
  const smallMobileActiveButtonSnapAlignStable =
    viewportLabel !== 'small-mobile' || reloadLayout.activeButtonScrollSnapAlign === 'start';
  const smallMobileSwitcherScrollPaddingStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherScrollPaddingInlineStart) >= 6 &&
      parseFloat(reloadLayout.workspaceSwitcherScrollPaddingInlineEnd) >= 6);
  const smallMobileActiveButtonScrollMarginStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.activeButtonScrollMarginInlineStart) >= 6 &&
      parseFloat(reloadLayout.activeButtonScrollMarginInlineEnd) >= 6);
  const smallMobileActiveButtonSnapStopStable =
    viewportLabel !== 'small-mobile' || reloadLayout.activeButtonScrollSnapStop === 'normal';
  const smallMobileSwitcherTouchPanStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherTouchAction === 'pan-x';
  const smallMobileSwitcherGapStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherColumnGap) >= 4 &&
      parseFloat(reloadLayout.workspaceSwitcherColumnGap) <= 8 &&
      parseFloat(reloadLayout.workspaceSwitcherRowGap) >= 4 &&
      parseFloat(reloadLayout.workspaceSwitcherRowGap) <= 8);
  const smallMobileSwitcherPaddingInlineStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherPaddingInlineStart) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherPaddingInlineEnd) <= 0);
  const smallMobileSwitcherPaddingBlockStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherPaddingBlockStart) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherPaddingBlockEnd) <= 0);
  const smallMobileSwitcherMarginInlineStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherMarginInlineStart) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherMarginInlineEnd) <= 0);
  const smallMobileSwitcherMarginBlockStable =
    viewportLabel !== 'small-mobile' ||
    (parseFloat(reloadLayout.workspaceSwitcherMarginBlockStart) <= 0 &&
      parseFloat(reloadLayout.workspaceSwitcherMarginBlockEnd) <= 0);
  const smallMobileSwitcherAlignItemsStable =
    viewportLabel !== 'small-mobile' || reloadLayout.workspaceSwitcherAlignItems === 'center';
  const smallMobileSwitcherJustifyContentStable =
    viewportLabel !== 'small-mobile' ||
    ['flex-start', 'start'].includes(reloadLayout.workspaceSwitcherJustifyContent);
  const smallMobileActiveButtonTextSizeAdjustStable =
    viewportLabel !== 'small-mobile' ||
    ['100%', 'none'].includes(reloadLayout.activeButtonTextSizeAdjust);
  const smallMobileActiveButtonFontSmoothingStable =
    viewportLabel !== 'small-mobile' ||
    reloadLayout.activeButtonFontSmoothing === 'antialiased';
  const smallMobileActiveButtonTapHighlightStable =
    viewportLabel !== 'small-mobile' ||
    ['rgba(0, 0, 0, 0)', 'transparent'].includes(reloadLayout.activeButtonTapHighlightColor);

  if (
    reloadLayout.hash !== expectedReloadHash ||
    !smallMobileReloadHashStable ||
    !smallMobilePanelPositionStable ||
    !smallMobilePanelScrollStartStable ||
    !smallMobileBodyScrollStable ||
    !smallMobileChromeCompact ||
    !smallMobileWorkspaceStripHeightCompact ||
    !smallMobileActiveButtonWidthCompact ||
    !smallMobileActiveButtonPositionVisible ||
    !smallMobileActiveButtonFocusRingCalm ||
    !smallMobileActiveButtonTextClipped ||
    !smallMobileSwitcherScrollWidthContained ||
    !smallMobileSwitcherOverflowYStable ||
    !smallMobileSwitcherOverflowInlineStable ||
    !smallMobileSwitcherOverflowBlockStable ||
    !smallMobileSwitcherBorderWidthStable ||
    !smallMobileSwitcherBorderStyleStable ||
    !smallMobileSwitcherBorderColorStable ||
    !smallMobileSwitcherBorderRadiusStable ||
    !smallMobileSwitcherBackgroundStable ||
    !smallMobileSwitcherBoxShadowStable ||
    !smallMobileSwitcherFilterStable ||
    !smallMobileSwitcherBackdropFilterStable ||
    !smallMobileSwitcherOpacityStable ||
    !smallMobileSwitcherVisibilityStable ||
    !smallMobileSwitcherPositionStable ||
    !smallMobileSwitcherInsetStable ||
    !smallMobileSwitcherZIndexStable ||
    !smallMobileSwitcherBoxSizingStable ||
    !smallMobileSwitcherDisplayStable ||
    !smallMobileSwitcherMinWidthStable ||
    !smallMobileSwitcherMaxWidthStable ||
    !smallMobileSwitcherFlexShrinkStable ||
    !smallMobileSwitcherFlexGrowStable ||
    !smallMobileSwitcherFlexBasisStable ||
    !smallMobileSwitcherScrollbarHidden ||
    !smallMobileSwitcherOverscrollContained ||
    !smallMobileSwitcherOverscrollInlineContained ||
    !smallMobileSwitcherSnapStable ||
    !smallMobileActiveButtonSnapAlignStable ||
    !smallMobileSwitcherScrollPaddingStable ||
    !smallMobileActiveButtonScrollMarginStable ||
    !smallMobileActiveButtonSnapStopStable ||
    !smallMobileSwitcherTouchPanStable ||
    !smallMobileSwitcherGapStable ||
    !smallMobileSwitcherPaddingInlineStable ||
    !smallMobileSwitcherPaddingBlockStable ||
    !smallMobileSwitcherMarginInlineStable ||
    !smallMobileSwitcherMarginBlockStable ||
    !smallMobileSwitcherAlignItemsStable ||
    !smallMobileSwitcherJustifyContentStable ||
    !smallMobileActiveButtonTextSizeAdjustStable ||
    !smallMobileActiveButtonFontSmoothingStable ||
    !smallMobileActiveButtonTapHighlightStable ||
    reloadLayout.activeButtonFocused ||
    !reloadLayout.activePanelVisible ||
    reloadLayout.activePanelOverflowY !== 'auto' ||
    reloadLayout.horizontalOverflow
  ) {
    throw new Error(
      `mobiele workspace-strip reload verliest actieve context of layout (${JSON.stringify(
        {
          ...reloadLayout,
          smallMobileReloadHashStable,
          smallMobileExpectedHash,
          smallMobileActualHash,
          smallMobilePanelPositionStable,
          smallMobilePanelScrollStartStable,
          smallMobileBodyScrollStable,
          smallMobileChromeCompact,
          smallMobileWorkspaceStripHeightCompact,
          smallMobileActiveButtonWidthCompact,
          smallMobileActiveButtonPositionVisible,
          smallMobileActiveButtonFocusRingCalm,
          smallMobileActiveButtonTextClipped,
          smallMobileSwitcherScrollWidthContained,
          smallMobileSwitcherOverflowYStable,
          smallMobileSwitcherOverflowInlineStable,
          smallMobileSwitcherOverflowBlockStable,
          smallMobileSwitcherBorderWidthStable,
          smallMobileSwitcherBorderStyleStable,
          smallMobileSwitcherBorderColorStable,
          smallMobileSwitcherBorderRadiusStable,
          smallMobileSwitcherBackgroundStable,
          smallMobileSwitcherBoxShadowStable,
          smallMobileSwitcherFilterStable,
          smallMobileSwitcherBackdropFilterStable,
          smallMobileSwitcherOpacityStable,
          smallMobileSwitcherVisibilityStable,
          smallMobileSwitcherPositionStable,
          smallMobileSwitcherInsetStable,
          smallMobileSwitcherZIndexStable,
          smallMobileSwitcherBoxSizingStable,
          smallMobileSwitcherDisplayStable,
          smallMobileSwitcherMinWidthStable,
          smallMobileSwitcherMaxWidthStable,
          smallMobileSwitcherFlexShrinkStable,
          smallMobileSwitcherFlexGrowStable,
          smallMobileSwitcherFlexBasisStable,
          smallMobileSwitcherScrollbarHidden,
          smallMobileSwitcherOverscrollContained,
          smallMobileSwitcherOverscrollInlineContained,
          smallMobileSwitcherSnapStable,
          smallMobileActiveButtonSnapAlignStable,
          smallMobileSwitcherScrollPaddingStable,
          smallMobileActiveButtonScrollMarginStable,
          smallMobileActiveButtonSnapStopStable,
          smallMobileSwitcherTouchPanStable,
          smallMobileSwitcherGapStable,
          smallMobileSwitcherPaddingInlineStable,
          smallMobileSwitcherPaddingBlockStable,
          smallMobileSwitcherMarginInlineStable,
          smallMobileSwitcherMarginBlockStable,
          smallMobileSwitcherAlignItemsStable,
          smallMobileSwitcherJustifyContentStable,
          smallMobileActiveButtonTextSizeAdjustStable,
          smallMobileActiveButtonFontSmoothingStable,
          smallMobileActiveButtonTapHighlightStable,
        },
      )}).`,
    );
  }

  const screenshot = await page.locator('[data-question-focus-shell="ready"]').screenshot({
    animations: 'disabled',
  });

  return {
    screen:
      viewportLabel === 'small-mobile'
        ? `${viewportLabel}-workspace-strip-reload-hash-panel-scrollstart-body-chrome-strip-button-position-focus-text-switcher-scrollbar-overscroll-overscrollinline-overflowy-overflowinline-overflowblock-snap-active-align-padding-margin-stop-touch-textsize-font-tap-gap-align-justify-display-visible-position-inset-zindex-minwidth-maxwidth-shrink-grow-basis-box-padding-block-margin-block-border-style-color-radius-background-shadow-filter-backdrop-opacity-visibility`
        : `${viewportLabel}-workspace-strip-reload`,
    selectors: 3,
    screenshotBytes: screenshot.byteLength,
  };
}

async function prepareFilledConsultCard(page, targetHash) {
  await page.goto(`${url}#consult-verslag-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#consult-verslag-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-consult-upload-report-fields="collapsed"]',
      '[data-consult-upload-context-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

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

async function prepareDossierImportInboxRetry(page, targetHash) {
  await page.goto(`${url}#dossier-upload-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#dossier-upload-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-wacht.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('safe synthetic import retry fixture'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-06-27');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Import retry wachtitem');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('labuitslag');
  await page.locator('#dossier-upload-form [name="lokaleOcr"]').check();
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-klaar.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('safe synthetic completed import fixture'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-06-28');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Import retry klaaritem');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('behandelverslag');
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
}

async function prepareDossierOcrReviewCorrection(page, targetHash) {
  await page.goto(`${url}#dossier-upload-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#dossier-upload-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-ocr-ready.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('safe synthetic local ocr review text'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-06-29');
  await page.locator('#dossier-upload-form [name="titel"]').fill('OCR review correctie klaar');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('labuitslag');
  await page.locator('#dossier-upload-form [name="lokaleOcr"]').check();
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-image-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-ocr-locked.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('safe synthetic locked image fixture'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-06-30');
  await page.locator('#dossier-upload-form [name="titel"]').fill('OCR review beeld vergrendeld');
  await page.locator('#dossier-upload-form [name="categorie"]').selectOption('beeld');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('afbeelding');
  await page.locator('#dossier-upload-form [name="beeldContext"]').fill('OCR review locked context');
  await page.locator('#dossier-upload-form [name="beeldBron"]').fill('Veilige bron');
  await page.locator('#dossier-upload-form [name="lokaleOcr"]').check();
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
}

async function prepareDossierMetadataNormalizationCorrection(page, targetHash) {
  await page.goto(`${url}#dossier-upload-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#dossier-upload-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-normalization-ready.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('safe synthetic metadata normalization text'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-07-01');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Metadata normalisatie klaar');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('labuitslag');
  await page.locator('#dossier-upload-form [name="lokaleOcr"]').check();
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-image-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-normalization-locked.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('safe synthetic locked metadata fixture'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-07-02');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Metadata normalisatie beeld');
  await page.locator('#dossier-upload-form [name="categorie"]').selectOption('beeld');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('afbeelding');
  await page.locator('#dossier-upload-form [name="beeldContext"]').fill('Metadata locked context');
  await page.locator('#dossier-upload-form [name="beeldBron"]').fill('Veilige bron');
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
}

async function prepareDossierHistoricalTimelineReview(page, targetHash) {
  await page.goto(`${url}#dossier-upload-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#dossier-upload-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-timeline-ready.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('safe synthetic timeline review text'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-07-03');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Historische tijdlijnreview klaar');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('behandelverslag');
  await page.locator('#dossier-upload-form [name="lokaleOcr"]').check();
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-image-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'routeflow-timeline-locked.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('safe synthetic locked timeline fixture'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-07-04');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Historische tijdlijnreview beeld');
  await page.locator('#dossier-upload-form [name="categorie"]').selectOption('beeld');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('afbeelding');
  await page.locator('#dossier-upload-form [name="beeldContext"]').fill('Timeline locked context');
  await page.locator('#dossier-upload-form [name="beeldBron"]').fill('Veilige bron');
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
}

async function prepareEmbryoImageClassificationReview(page, targetHash) {
  await page.goto(`${url}#dossier-upload-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#dossier-upload-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-upload-metadata="collapsed"]',
      '[data-dossier-upload-metadata-fields="collapsed"]',
      '[data-dossier-upload-optional="beeldcontext"]',
      '[data-dossier-upload-image-fields="collapsed"]',
      '[data-dossier-upload-optional="embryo-labcontext"]',
      '[data-dossier-upload-lab-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('input[name="dossierBestanden"]').setInputFiles({
    name: 'embryo-review.png',
    mimeType: 'image/png',
    buffer: Buffer.from('safe synthetic image fixture'),
  });
  await page.locator('#dossier-upload-form [name="datum"]').fill('2026-06-26');
  await page.locator('#dossier-upload-form [name="titel"]').fill('Embryo reviewbeeld');
  await page.locator('#dossier-upload-form [name="categorie"]').selectOption('beeld');
  await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('afbeelding');
  await page.locator('#dossier-upload-form [name="beeldBron"]').fill('Labportaal');
  await page.locator('#dossier-upload-form [name="beeldEmbryoLabel"]').fill('Embryo A');
  await page.locator('#dossier-upload-form [name="beeldEmbryoId"]').fill('E-A');
  await page.locator('#dossier-upload-form [name="beeldEmbryoDag"]').fill('5');
  await page.locator('#dossier-upload-form [name="beeldLaboratoriumContext"]').fill('Dag 5 labbeeld');
  await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
  await page.locator('#dossier-upload-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const title = document.querySelector('#dossier-upload-form input[name="titel"]');
      return title instanceof HTMLInputElement && title.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-dossier-imaging-disclosure="repository"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });
  await page.waitForSelector(
    targetHash.includes('preview=locked')
      ? '[data-imaging-metadata-review="locked"]'
      : '[data-embryo-image-classification-review="concept"]',
    { timeout: 10_000 },
  );
}

async function prepareImagingCompareNoInterpretation(page, targetHash) {
  await page.goto(`${url}#dossier-upload-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#dossier-upload-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');

  async function openImageContext() {
    await page.evaluate(() => {
      for (const selector of [
        '[data-dossier-upload-metadata="collapsed"]',
        '[data-dossier-upload-metadata-fields="collapsed"]',
        '[data-dossier-upload-optional="beeldcontext"]',
        '[data-dossier-upload-image-fields="collapsed"]',
        '[data-dossier-upload-optional="embryo-labcontext"]',
        '[data-dossier-upload-lab-fields="collapsed"]',
      ]) {
        const details = document.querySelector(selector);
        if (details instanceof HTMLDetailsElement) details.open = true;
      }
    });
  }

  async function submitImage({
    name,
    title,
    date,
    source,
    context,
    embryoLabel = '',
    embryoDay = '',
  }) {
    await openImageContext();
    await page.locator('input[name="dossierBestanden"]').setInputFiles({
      name,
      mimeType: 'image/jpeg',
      buffer: Buffer.from(`safe synthetic compare fixture ${title}`),
    });
    await page.locator('#dossier-upload-form [name="datum"]').fill(date);
    await page.locator('#dossier-upload-form [name="titel"]').fill(title);
    await page.locator('#dossier-upload-form [name="categorie"]').selectOption('beeld');
    await page.locator('#dossier-upload-form [name="uploadProfiel"]').selectOption('afbeelding');
    await page.locator('#dossier-upload-form [name="beeldBron"]').fill(source);
    await page.locator('#dossier-upload-form [name="beeldContext"]').fill(context);
    await page.locator('#dossier-upload-form [name="beeldEmbryoLabel"]').fill(embryoLabel);
    await page.locator('#dossier-upload-form [name="beeldEmbryoDag"]').fill(embryoDay);
    await page.locator('#dossier-upload-form [name="conceptBevestigd"]').check();
    await page.locator('#dossier-upload-form button[type="submit"]').click();
    await page.waitForFunction(
      () => {
        const titleInput = document.querySelector('#dossier-upload-form input[name="titel"]');
        return titleInput instanceof HTMLInputElement && titleInput.value === '';
      },
      undefined,
      { timeout: 10_000 },
    );
  }

  await submitImage({
    name: 'routeflow-compare-links.jpg',
    title: 'Routeflow echo compare links',
    date: '2026-07-02',
    source: 'Routeflow kliniek',
    context: 'Routeflow links',
  });
  await submitImage({
    name: 'routeflow-compare-rechts.jpg',
    title: 'Routeflow embryo compare rechts',
    date: '2026-07-04',
    source: 'Routeflow lab',
    context: 'Routeflow embryo dag 5',
    embryoLabel: 'Embryo routeflow',
    embryoDay: '5',
  });

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    for (const selector of [
      '[data-dossier-imaging-followup="collapsed"]',
      '[data-dossier-imaging-context-choice="collapsed"]',
      '[data-dossier-imaging-disclosure="repository"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });
  await page.waitForSelector('[data-imaging-compare-state="ready"]', { timeout: 10_000 });
}

async function prepareEmbryoAliasReviewDisplay(page, targetHash) {
  await page.goto(`${url}#embryo-quality-form`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#embryo-quality-form');
  await waitForStableRouteflowRoot(page, '#dossier-route-upload');
  await page.evaluate(() => {
    for (const selector of [
      '[data-embryo-quality-identification-fields="collapsed"]',
      '[data-embryo-quality-assessment-fields="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  await page.locator('#embryo-quality-form [name="datum"]').fill('2026-06-27');
  await page.locator('#embryo-quality-form [name="embryoLabel"]').fill('Embryo alias routeflow');
  await page.locator('#embryo-quality-form [name="embryoAliasLabel"]').fill('Embryo A');
  await page.locator('#embryo-quality-form [name="embryoKliniekId"]').fill('E-A');
  await page.locator('#embryo-quality-form [name="embryoAliasBronLabel"]').fill('Labportaal');
  await page.locator('#embryo-quality-form [name="embryoAliasReviewStatus"]').selectOption('gereviewd');
  await page.locator('#embryo-quality-form [name="embryoDag"]').fill('5');
  await page.locator('#embryo-quality-form [name="embryoMeetmoment"]').fill('Dag 5 blastocyst');
  await page.locator('#embryo-quality-form [name="embryoKwaliteit"]').fill('4AA');
  await page.locator('#embryo-quality-form [name="embryoKliniekTerminologie"]').fill('Gardner-score');
  await page.locator('#embryo-quality-form [name="embryoBron"]').fill('Labrapport');
  await page.locator('#embryo-quality-form [name="embryoReviewStatus"]').selectOption('gereviewd');
  await page.locator('#embryo-quality-form [name="embryoStatus"]').selectOption('ingevroren');
  await page.locator('#embryo-quality-form button[type="submit"]').click();
  await page.waitForFunction(
    () => {
      const label = document.querySelector('#embryo-quality-form input[name="embryoLabel"]');
      return label instanceof HTMLInputElement && label.value === '';
    },
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
}

async function prepareQuestionArtscheckReviewStatus(page, targetHash) {
  await page.goto(`${url}#start-recommendations`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#start-recommendations');
  await waitForStableRouteflowRoot(page, '[data-daily-advice-focus-shell="ready"]');
  await page.evaluate(() => {
    for (const selector of [
      '[data-daily-advice-followup="collapsed"]',
      '[data-hub-detail-panel="daily-recommendation-list"]',
      '[data-daily-advice-full-list="collapsed"]',
    ]) {
      const details = document.querySelector(selector);
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });
  await page
    .locator(
      '[data-recommendation-id="samen-voeding-supplement-checklist"] [data-supplement-artscheck-action="available"] button[value="supplementArtscheck"]',
    )
    .first()
    .click();
  await page.waitForFunction(
    () => document.body.textContent?.includes('Supplementvraag klaargezet voor artscheck'),
    undefined,
    { timeout: 10_000 },
  );

  await page.goto(`${url}#start-today`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, '#start-today');
  await waitForStableRouteflowRoot(page, '[data-start-today-route="ready"]');
  await page.locator('#quick-entry-form select[name="quickType"]').selectOption('vraag');
  await page.locator('#quick-entry-form input[name="quickText"]').fill('Routeflow gewone consultvraag');
  await page.locator('#quick-entry-form button[type="submit"]').click();
  await waitForStableRouteflowRoot(page, '[data-start-today-route="ready"]');

  await page.goto(`${url}${targetHash}`, { waitUntil: 'networkidle' });
  await unlockIfNeeded(page, targetHash);
  await waitForStableRouteflowRoot(page, '[data-question-focus-shell="ready"]');
  await page.evaluate(() => {
    const details = document.querySelector('#question-all-disclosure');
    if (details instanceof HTMLDetailsElement) details.open = true;
  });
  await page.waitForSelector('[data-question-list-item="artscheck"]', {
    state: 'attached',
    timeout: 10_000,
  });
  await page.waitForSelector('[data-question-list-item="standard"]', {
    state: 'attached',
    timeout: 10_000,
  });
}

async function prepareCentralSessionRenewalRecoveryFocus(page, targetHash) {
  await page.evaluate((nextHash) => {
    window.sessionStorage.setItem('kiempad.central-session-renewal-recovery-focus', '1');
    window.location.hash = nextHash;
  }, targetHash);
  await page.reload({ waitUntil: 'networkidle' });
  await unlockIfNeeded(page, targetHash);
  await page.evaluate((nextHash) => {
    window.sessionStorage.setItem('kiempad.central-session-renewal-recovery-focus', '1');
    window.history.replaceState(null, '', nextHash);
  }, targetHash);
  await page.reload({ waitUntil: 'networkidle' });
  await unlockIfNeeded(page, targetHash);
  await waitForStableRouteflowRoot(page, '#backup-route-controleren');
  await page.waitForFunction(
    () => {
      const status = document.querySelector(
        '[data-central-session-renewal-recovery-focus-target="ready"]',
      );
      return (
        status instanceof HTMLElement &&
        document.activeElement === status &&
        status.textContent?.includes('Centrale sessieherstelactie verwerkt.')
      );
    },
    undefined,
    { timeout: 10_000 },
  );
}

async function assertDailyAdviceFeedbackNavigation(page) {
  await openDailyAdviceListDetails(page);
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
      const fullList = document.querySelector('[data-daily-advice-full-list="collapsed"]');
      const focusStatus = document.querySelector('[data-daily-advice-list-focus-status="ready"]');
      return (
        details instanceof HTMLDetailsElement &&
        details.open &&
        fullList instanceof HTMLDetailsElement &&
        fullList.open &&
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
      const fullList = document.querySelector('[data-daily-advice-full-list="collapsed"]');
      const workflowStatus = document.querySelector(
        '[data-daily-advice-feedback-workflow-status="ready"]',
      );
      return (
        details instanceof HTMLDetailsElement &&
        details.open &&
        fullList instanceof HTMLDetailsElement &&
        fullList.open &&
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
  await openDailyAdviceListDetails(page);
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
  await openDailyAdviceListDetails(page);
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
  await openDailyAdviceListDetails(page);
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
  await openDailyAdviceListDetails(page);
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

async function openDailyAdviceListDetails(page) {
  await openDetails(page, '[data-daily-advice-followup="collapsed"]');
  await openDetails(page, '[data-hub-detail-panel="daily-recommendation-list"]');
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

async function waitForActiveWorkspaceStripButton(page, expectedLabel) {
  await page.waitForFunction(
    (label) => {
      const activeButton = document.querySelector(
        '[data-workspace-strip="ready"] .workspace-strip__switcher a[aria-current="page"]',
      );
      const strip = activeButton?.closest('.workspace-strip__switcher');
      const buttonRect = activeButton?.getBoundingClientRect();
      const stripRect = strip?.getBoundingClientRect();

      return Boolean(
        activeButton &&
          strip instanceof HTMLElement &&
          buttonRect &&
          stripRect &&
          buttonRect.width > 0 &&
          buttonRect.height > 0 &&
          (!label || activeButton.textContent?.trim() === label) &&
          getComputedStyle(strip).overflowX === 'auto' &&
          buttonRect.left >= stripRect.left - 4 &&
          buttonRect.right <= stripRect.right + 4,
      );
    },
    expectedLabel,
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
