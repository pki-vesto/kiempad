#!/usr/bin/env node
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = Number(process.env.KIEMPAD_SPLIT_WORKSPACE_SMOKE_PORT ?? 4177);
const url = `http://${host}:${port}/`;
const passphrase = 'split workspace smoke passphrase';

const routes = [
  { screen: 'dossier', hash: '#dossier?route=imaging', prefix: 'dossier', route: 'imaging' },
  { screen: 'agenda', hash: '#agenda?route=plannen', prefix: 'schedule', route: 'plannen' },
  { screen: 'vragen', hash: '#vragen?route=beheer', prefix: 'question', route: 'beheer' },
  { screen: 'traject', hash: '#traject?route=fasen', prefix: 'treatment', route: 'fasen' },
  { screen: 'medicatie', hash: '#medicatie?route=beheer', prefix: 'medication', route: 'beheer' },
  { screen: 'kennis', hash: '#kennis?route=ai', prefix: 'knowledge', route: 'ai' },
  { screen: 'welzijn', hash: '#welzijn?route=history', prefix: 'wellbeing', route: 'history' },
  { screen: 'afwegingen', hash: '#afwegingen?route=choice', prefix: 'decision', route: 'choice' },
  { screen: 'kosten', hash: '#kosten?route=vergoeding', prefix: 'finance', route: 'vergoeding' },
  { screen: 'logboek', hash: '#logboek?route=privacy', prefix: 'eventlog', route: 'privacy' },
  {
    screen: 'herinneringen',
    hash: '#herinneringen?route=plannen',
    prefix: 'notification',
    route: 'plannen',
  },
  { screen: 'backup', hash: '#backup?route=import', prefix: 'backup', route: 'import' },
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
        results.push(await assertSplitWorkspaces(browser, options));
      }

      process.stdout.write(`Split workspace smoke geslaagd: ${JSON.stringify(results)}\n`);
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview(preview);
  }
}

async function assertSplitWorkspaces(browser, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const results = [];
    for (const route of routes) {
      await page.goto(`${url}${route.hash}`, { waitUntil: 'networkidle' });
      await unlockIfNeeded(page, route.hash);
      await page.locator(`[data-${route.prefix}-split-workspace="ready"]`).waitFor({
        timeout: 10_000,
      });

      const result = await page.evaluate(({ prefix, routeId }) => {
        const workspace = document.querySelector(`[data-${prefix}-split-workspace="ready"]`);
        const active = document.querySelector(`[data-${prefix}-route-state="active"]`);
        const currentRoute = document.querySelector(
          `[data-${prefix}-split-workspace="ready"] .command-task-route[aria-current="page"]`,
        );
        const inactiveLayouts = [
          ...document.querySelectorAll(`[data-${prefix}-route-state="inactive"]`),
        ]
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
            (item) => !item.hidden || item.display !== 'none' || item.width > 0 || item.height > 0,
          );
        const rail = workspace?.querySelector('.domain-split-workspace__rail');
        const main = workspace?.querySelector('.domain-split-workspace__main');
        const contextColumn = workspace?.querySelector('.domain-split-workspace__context');
        const activeRect = active?.getBoundingClientRect();

        return {
          activeRoute: active?.getAttribute(`data-${prefix}-route`) ?? null,
          currentRouteText: currentRoute?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          hasWorkspace: Boolean(workspace),
          hasRail: Boolean(rail),
          hasMain: Boolean(main),
          hasContext: Boolean(contextColumn),
          activeRouteVisible: Boolean(
            activeRect && activeRect.width > 0 && activeRect.height > 0 && routeId,
          ),
          inactiveLayouts,
          horizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
            document.body.scrollWidth > document.body.clientWidth + 1,
        };
      }, { prefix: route.prefix, routeId: route.route });

      if (pageErrors.length > 0) {
        throw new Error(
          `${options.label}/${route.screen}: paginafout tijdens split-workspace smoke: ${pageErrors.join('; ')}`,
        );
      }
      if (!result.hasWorkspace || !result.hasRail || !result.hasMain || !result.hasContext) {
        throw new Error(`${options.label}/${route.screen}: split-view structuur is incompleet.`);
      }
      if (result.activeRoute !== route.route || !result.activeRouteVisible) {
        throw new Error(
          `${options.label}/${route.screen}: verwacht actieve route ${route.route}, kreeg ${result.activeRoute}.`,
        );
      }
      if (!result.currentRouteText) {
        throw new Error(`${options.label}/${route.screen}: actieve taakroute mist zichtbare tekst.`);
      }
      if (result.inactiveLayouts.length > 0) {
        throw new Error(
          `${options.label}/${route.screen}: inactieve routes nemen layout in: ${JSON.stringify(result.inactiveLayouts)}.`,
        );
      }
      if (result.horizontalOverflow) {
        throw new Error(`${options.label}/${route.screen}: split-view veroorzaakt horizontale overflow.`);
      }

      results.push({ screen: route.screen, active: result.activeRoute });
    }

    return { viewport: options.label, checked: results.length, routes: results };
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

  if (await page.locator('#first-run-complete-form').count()) {
    await page.locator('#first-run-complete-form button[type="submit"]').click();
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
  fail(error instanceof Error ? error.message : 'Split workspace smoke is mislukt.');
});
