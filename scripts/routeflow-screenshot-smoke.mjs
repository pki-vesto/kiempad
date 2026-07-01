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
    hiddenSelectors: ['[data-workspace-map="ready"]'],
    maxOpenDetails: { selector: '.start-flow-panel[open]', max: 1 },
  },
  {
    screen: 'knowledge-research',
    hash: '#kennis?route=read',
    rootSelector: '[data-knowledge-focus-shell="ready"]',
    expectedText: 'Lees research in lagen',
    activeRouteSelector: '[data-knowledge-route="read"][data-knowledge-route-state="active"]',
    inactiveRouteSelector: '[data-knowledge-route-state="inactive"]',
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
  },
  {
    screen: 'dossier-imaging',
    hash: '#dossier?route=imaging',
    rootSelector: '#dossier-route-imaging',
    expectedText: 'Beelden en embryo’s als aparte werkruimte',
    activeRouteSelector: '[data-dossier-route="imaging"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
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
  },
  {
    screen: 'treatment-context',
    hash: '#traject?route=context',
    rootSelector: '[data-treatment-focus-shell="ready"]',
    expectedText: 'Timeline en graphcontext',
    activeRouteSelector: '[data-treatment-route="context"][data-treatment-route-state="active"]',
    inactiveRouteSelector: '[data-treatment-route-state="inactive"]',
    openSelectors: ['#traject-route-context details'],
    requiredSelectors: [
      '[data-treatment-focus-region="workbench"]',
      '[data-treatment-focus-region="workspace"]',
      '#traject-route-context',
      '[data-fertility-timeline-reader="ready"]',
      '[data-fertility-timeline-lane="events"]',
      '[data-fertility-timeline-lane="milestones"]',
      '[data-fertility-timeline-lane="context"]',
      '[data-fertility-timeline-lane="export"]',
      '#timeline-filter-form',
      '.timeline-overview-bar',
      '#fertility-timeline-items',
    ],
  },
  {
    screen: 'consult-upload',
    hash: '#dossier?route=upload',
    rootSelector: '#dossier-route-upload',
    expectedText: 'Nieuwe medische records toevoegen',
    activeRouteSelector: '[data-dossier-route="upload"][data-dossier-route-state="active"]',
    inactiveRouteSelector: '[data-dossier-route-state="inactive"]',
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
      const evidence = await page.evaluate((routeflow) => {
        const rootElement = document.querySelector(routeflow.rootSelector);
        const rootRect = rootElement?.getBoundingClientRect();
        const required = routeflow.requiredSelectors.map((selector) => {
          const element = rootElement?.matches(selector)
            ? rootElement
            : rootElement?.querySelector(selector);
          const rect = element?.getBoundingClientRect();
          const textNodes = [...(element?.querySelectorAll('span, strong, small, p, h2, h3, em') ?? [])].map(
            (node) => ({
              clientWidth: node.clientWidth,
              scrollWidth: node.scrollWidth,
              clientHeight: node.clientHeight,
              scrollHeight: node.scrollHeight,
            }),
          );
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
        const hidden = (routeflow.hiddenSelectors ?? []).map((selector) => {
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

        return {
          rootVisible: Boolean(rootRect && rootRect.width > 0 && rootRect.height > 0),
          rootText: rootElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          activeVisible: Boolean(activeRect && activeRect.width > 0 && activeRect.height > 0),
          required,
          present,
          hidden,
          openDetails,
          inactiveLayouts,
          horizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
            document.body.scrollWidth > document.body.clientWidth + 1,
        };
      }, target);

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
