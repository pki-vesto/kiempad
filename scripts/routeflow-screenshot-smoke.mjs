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
    expectedText: 'Kies eerst je werkstroom',
    requiredSelectors: [
      '[data-start-cockpit="ready"]',
      '[data-start-cockpit-panel="focus"]',
      '[data-start-cockpit-panel="record"]',
      '[data-start-cockpit-panel="routes"]',
      '[data-start-cockpit-route="uploads"]',
      '[data-start-cockpit-route="timeline"]',
      '[data-start-cockpit-route="imaging"]',
      '[data-start-cockpit-route="advice"]',
      '[data-workspace-strip="ready"]',
      '[data-start-workspace-deck="ready"]',
      '[data-start-workspace-card="today"]',
      '[data-start-workspace-card="record"]',
      '[data-start-workspace-card="insight"]',
      '[data-start-workspace-card="control"]',
      '[data-start-focus-shell="ready"]',
      '[data-start-focus-region="workflows"]',
      '[data-start-focus-region="scan"]',
      '[data-start-focus-region="daily"]',
      '[data-start-workbench="multi-flow"]',
      '[data-start-workbench-flow="uploads"]',
      '[data-start-workbench-flow="timeline"]',
      '[data-start-workbench-flow="embryo"]',
      '[data-start-workbench-flow="recommendations"]',
      '[data-start-workbench-flow="research"]',
      '[data-start-workbench-flow="secure-sync"]',
      '[data-start-workbench-tier="primary"]',
      '[data-start-workbench-tier="supporting"]',
      '[data-start-flow-rail-mode="contained"]',
      '[data-start-flow-switchboard="ready"]',
      '[data-start-flow-switchboard-card="planning"]',
      '[data-start-flow-switchboard-card="medicatie"]',
      '[data-start-flow-switchboard-card="aanbevelingen"]',
      '[data-start-flow-switchboard-card="setup"]',
      '[data-start-flow-switchboard-card="snelle-invoer"]',
      '[data-start-flow-panel-stack="contained"]',
    ],
    presentSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-focus-region="workflow"]',
      '[data-daily-advice-focus-region="workbench"]',
      '[data-daily-advice-focus-region="planner"]',
      '[data-daily-advice-focus-region="list"]',
      '[data-daily-advice-action-planner="ready"]',
      '[data-daily-advice-action-lane="lifestyle"]',
      '[data-daily-advice-action-lane="nutrition"]',
      '[data-daily-advice-action-lane="supplements"]',
      '[data-daily-advice-action-lane="clinician"]',
    ],
    hiddenSelectors: [
      '[data-workspace-map="ready"]',
      '.workspace-strip__description',
      '.workspace-strip__quick',
    ],
    startCommandCenter: true,
    desktopHiddenSelectors: [
      '.start-focus-shell__header p:last-child',
      '.daily-advice-focus-shell__header p:last-child',
      '.command-route-section__header > p:last-child',
      '.daily-advice-action-planner__header > p',
      '.hub-workflow-header__copy p',
      '[data-hub-detail-panel="daily-recommendation-list"] .hub-detail-disclosure__summary small',
    ],
    maxOpenDetails: { selector: '.start-flow-panel[open]', max: 1 },
  },
  {
    screen: 'knowledge-research',
    hash: '#kennis?route=read',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Lees research in lagen',
    activeRouteSelector: '[data-knowledge-route="read"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
    focusLayout: {
      supportSelector: '[data-knowledge-focus-region="workbench"]',
      workspaceSelector: '[data-knowledge-focus-region="workspace"]',
    },
    requiredSelectors: [
      '[data-knowledge-focus-region="workbench"]',
      '[data-knowledge-focus-region="workspace"]',
      '#knowledge-route-read',
      '[data-hub-workflow="knowledge-research"]',
      '[data-hub-workflow-tab="research"][aria-current="page"]',
      '[data-hub-workflow-tab="summaries"]',
      '[data-hub-workflow-tab="trends"]',
      '[data-hub-detail-panel="research-summaries"]',
      '[data-knowledge-research-reader="ready"]',
      '[data-knowledge-research-lane="scientific"]',
      '[data-knowledge-research-lane="patient"]',
      '[data-knowledge-research-lane="relevance"]',
      '[data-knowledge-research-lane="trends"]',
      '[data-knowledge-research-disclosure="sources"]',
      '#knowledge-research-trends',
    ],
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
    screen: 'daily-advice-console',
    hash: '#start-recommendations',
    rootSelector: '[data-daily-advice-focus-shell="ready"]',
    expectedText: 'Dagadvies console',
    openSelectors: ['#start-flow-panel-aanbevelingen'],
    requiredSelectors: [
      '[data-daily-advice-focus-shell="ready"]',
      '[data-daily-advice-focus-region="workflow"]',
      '[data-daily-advice-focus-region="workbench"]',
      '[data-daily-advice-focus-region="planner"]',
      '[data-daily-advice-focus-region="list"]',
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
    dailyAdviceConsole: true,
  },
  {
    screen: 'dossier-imaging',
    hash: '#dossier?route=imaging',
    rootSelector: '#dossier-route-imaging',
    expectedText: 'Beelden en embryo’s als aparte werkruimte',
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
      '[data-dossier-imaging-lane="images"]',
      '[data-dossier-imaging-lane="compare"]',
      '[data-dossier-imaging-lane="embryos"]',
      '[data-dossier-imaging-lane="consults"]',
      '[data-dossier-imaging-disclosure="consults"]',
    ],
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
    screen: 'treatment-context',
    hash: '#traject?route=context',
    rootSelector: '[data-treatment-focus-shell="ready"]',
    expectedText: 'Timeline en graphcontext',
    activeRouteSelector: '[data-treatment-route="context"][data-treatment-route-state="active"]',
    inactiveRouteSelector: '[data-treatment-route-state="inactive"]',
    focusLayout: {
      supportSelector: '[data-treatment-focus-region="workbench"]',
      workspaceSelector: '[data-treatment-focus-region="workspace"]',
    },
    openSelectors: ['#traject-route-context details'],
    requiredSelectors: [
      '[data-treatment-focus-region="workbench"]',
      '[data-treatment-focus-region="workspace"]',
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
    hash: '#dossier?route=upload',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
    focusLayout: {
      supportSelector: '[data-dossier-focus-region="orientation"]',
      workspaceSelector: '[data-dossier-focus-region="workspace"]',
    },
    openSelectors: ['[data-hub-detail-panel="upload-intake"]'],
    requiredSelectors: [
      '[data-dossier-upload-triage="ready"]',
      '[data-dossier-upload-lane="document"]',
      '[data-dossier-upload-lane="consult"]',
      '[data-dossier-upload-lane="imaging"]',
      '[data-dossier-upload-lane="ocr"]',
      '[data-hub-workflow="consult-upload"]',
      '[data-hub-workflow-tab="consult"][aria-current="page"]',
      '[data-hub-workflow-tab="context"]',
      '[data-hub-workflow-tab="questions"]',
      '[data-dossier-add-route-panel="consult-upload"]',
      '#consult-verslag-form',
      '[data-consult-upload-group="consult-basis"]',
      '[data-consult-upload-group="consult-context"]',
    ],
    presentSelectors: ['[data-dossier-upload-console="ready"]'],
    desktopHiddenSelectors: [
      '.dossier-focus-shell__header p:last-child',
      '.dossier-route-section__header > p:last-child',
      '.hub-workflow-header__copy p',
      '.dossier-upload-triage__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="upload-intake"] .hub-detail-disclosure__summary small',
    ],
    uploadConsole: true,
  },
  {
    screen: 'question-prep',
    hash: '#vragen?route=voorbereiden',
    rootSelector: '[data-question-focus-shell="ready"]',
    expectedText: 'Consult Prep Wizard',
    activeRouteSelector: '[data-question-route="voorbereiden"][data-question-route-state="active"]',
    inactiveRouteSelector: '[data-question-route-state="inactive"]',
    requiredSelectors: [
      '[data-question-focus-region="workbench"]',
      '[data-question-focus-region="workspace"]',
      '[data-question-split-workspace="ready"]',
      '[data-question-route-summary="voorbereiden"]',
      '[data-consult-prep-board="ready"]',
      '[data-consult-prep-lane="questions"]',
      '[data-consult-prep-lane="actions"]',
      '[data-consult-prep-lane="context"]',
      '[data-consult-prep-lane="packet"]',
      '[data-hub-detail-panel="consult-prep-wizard"]',
      '.consult-detail-panel__header',
      '[aria-label="Consult Prep Wizard"]',
    ],
    desktopHiddenSelectors: [
      '.question-focus-shell__header p:last-child',
      '.question-route-section__header > p:last-child',
      '.consult-prep-board__header > p',
      '.command-route-summary p:not(.command-route-summary__eyebrow)',
      '[data-hub-detail-panel="consult-prep-wizard"] .hub-detail-disclosure__summary small',
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
      '[data-wellbeing-focus-region="workbench"]',
      '[data-wellbeing-focus-region="workspace"]',
      '[data-wellbeing-split-workspace="ready"]',
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
      '[data-backup-disclosure="controleren"]',
    ],
    desktopHiddenSelectors: [
      '.backup-focus-shell__header p:last-child',
      '.backup-route-section__header > p:last-child',
      '.backup-sync-board__header > p',
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
      await page.goto(`${url}${target.hash}`, { waitUntil: 'networkidle' });
      await unlockIfNeeded(page, target.hash);
      if (target.openSelectors) {
        await page.evaluate((selectors) => {
          for (const selector of selectors) {
            const details = document.querySelector(selector);
            if (details instanceof HTMLDetailsElement) details.open = true;
          }
        }, target.openSelectors);
      }

      const root = page.locator(target.rootSelector);
      await root.waitFor({ timeout: 10_000 });
      await root.scrollIntoViewIfNeeded();

      const screenshot = await root.screenshot({ animations: 'disabled' });
      const evidence = await page.evaluate(({ routeflow, viewportLabel }) => {
        const rootElement = document.querySelector(routeflow.rootSelector);
        const rootRect = rootElement?.getBoundingClientRect();
        const required = routeflow.requiredSelectors.map((selector) => {
          const element = rootElement?.matches(selector)
            ? rootElement
            : rootElement?.querySelector(selector);
          const rect = element?.getBoundingClientRect();
          const textNodes = [...(element?.querySelectorAll('span, strong, small, p, h2, h3, em') ?? [])]
            .filter((node) => {
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
              const nodeRect = node.getBoundingClientRect();
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
        const dailyAdviceConsole = routeflow.dailyAdviceConsole
          ? (() => {
              const workflow = document.querySelector('[data-daily-advice-focus-region="workflow"]');
              const workbench = document.querySelector('[data-daily-advice-focus-region="workbench"]');
              const planner = document.querySelector('[data-daily-advice-focus-region="planner"]');
              const list = document.querySelector('[data-daily-advice-focus-region="list"]');
              const workflowRect = workflow?.getBoundingClientRect();
              const workbenchRect = workbench?.getBoundingClientRect();
              const plannerRect = planner?.getBoundingClientRect();
              const listRect = list?.getBoundingClientRect();
              const workflowStyle = workflow ? getComputedStyle(workflow) : null;
              const workbenchStyle = workbench ? getComputedStyle(workbench) : null;
              const plannerStyle = planner ? getComputedStyle(planner) : null;
              const listStyle = list ? getComputedStyle(list) : null;
              return {
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
        const uploadConsole = routeflow.uploadConsole
          ? (() => {
              const consoleElement = document.querySelector('[data-dossier-upload-console="ready"]');
              const body = consoleElement?.querySelector('.kp-disclosure__body');
              const selector = consoleElement?.querySelector('.dossier-add-route-selector');
              const documentPanel = consoleElement?.querySelector(
                '[data-dossier-add-route-panel="dossier-upload"]',
              );
              const consultPanel = consoleElement?.querySelector(
                '[data-dossier-add-route-panel="consult-upload"]',
              );
              const reviewPanel = consoleElement?.querySelector('#dossier-route-review');
              const bodyRect = body?.getBoundingClientRect();
              const selectorRect = selector?.getBoundingClientRect();
              const documentRect = documentPanel?.getBoundingClientRect();
              const consultRect = consultPanel?.getBoundingClientRect();
              const reviewRect = reviewPanel?.getBoundingClientRect();
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
          openDetails,
          focusLayout,
          startCommandCenter,
          dailyAdviceConsole,
          uploadConsole,
          timelineConsole,
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
        evidence.dailyAdviceConsole &&
        (!evidence.dailyAdviceConsole.workflowVisible ||
          !evidence.dailyAdviceConsole.workbenchVisible ||
          !evidence.dailyAdviceConsole.plannerVisible ||
          !evidence.dailyAdviceConsole.listVisible ||
          evidence.dailyAdviceConsole.workbenchTop < evidence.dailyAdviceConsole.workflowTop - 1 ||
          Math.abs(
            evidence.dailyAdviceConsole.plannerTop - evidence.dailyAdviceConsole.workbenchTop,
          ) > 2 ||
          evidence.dailyAdviceConsole.plannerLeft < evidence.dailyAdviceConsole.workbenchRight - 1 ||
          evidence.dailyAdviceConsole.listTop < evidence.dailyAdviceConsole.workbenchTop - 1 ||
          evidence.dailyAdviceConsole.workflowOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.workbenchOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.plannerOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.listOverflowY !== 'auto' ||
          evidence.dailyAdviceConsole.listMaxHeight === 'none')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: Dagadvies console staat niet in begrensde adviesvlakken (${JSON.stringify(evidence.dailyAdviceConsole)}).`,
        );
      }
      if (
        options.label === 'desktop' &&
        evidence.uploadConsole &&
        (!evidence.uploadConsole.bodyVisible ||
          !evidence.uploadConsole.selectorVisible ||
          !evidence.uploadConsole.documentVisible ||
          !evidence.uploadConsole.consultVisible ||
          !evidence.uploadConsole.reviewVisible ||
          Math.abs(evidence.uploadConsole.consultTop - evidence.uploadConsole.documentTop) > 2 ||
          evidence.uploadConsole.consultLeft < evidence.uploadConsole.documentRight - 1 ||
          evidence.uploadConsole.reviewTop < evidence.uploadConsole.documentTop - 1 ||
          evidence.uploadConsole.bodyOverflowY !== 'auto' ||
          evidence.uploadConsole.documentOverflowY !== 'auto' ||
          evidence.uploadConsole.consultOverflowY !== 'auto' ||
          evidence.uploadConsole.reviewOverflowY !== 'auto' ||
          evidence.uploadConsole.documentMaxHeight === 'none')
      ) {
        throw new Error(
          `${options.label}/${target.screen}: upload-console staat niet in begrensde werkvlakken (${JSON.stringify(evidence.uploadConsole)}).`,
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
    }

    return { viewport: options.label, checked: checked.length, targets: checked };
  } finally {
    await context.close();
  }
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
