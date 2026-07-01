#!/usr/bin/env node
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = Number(process.env.KIEMPAD_DOSSIER_ROUTE_SMOKE_PORT ?? 4176);
const url = `http://${host}:${port}/`;
const passphrase = 'dossier route smoke passphrase';

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
      const desktop = await assertDossierRoute(browser, {
        label: 'desktop',
        viewport: { width: 1366, height: 900 },
      });
      const mobile = await assertDossierRoute(browser, {
        label: 'mobile',
        viewport: { width: 390, height: 844 },
      });

      process.stdout.write(
        `Dossier route smoke geslaagd: ${JSON.stringify({ desktop, mobile })}\n`,
      );
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview(preview);
  }
}

async function assertDossierRoute(browser, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(`${url}#dossier?route=imaging`, { waitUntil: 'networkidle' });
    await page.locator('#passphrase').fill(passphrase);
    await page.locator('#vault-form button[type="submit"]').click();
    await page.locator('.app-shell').waitFor({ timeout: 10_000 });

    if (await page.locator('#first-run-complete-form').count()) {
      await page.locator('#first-run-complete-form button[type="submit"]').click();
      await page.locator('.app-shell').waitFor({ timeout: 10_000 });
    }

    await page.evaluate(() => {
      window.location.hash = '#dossier?route=imaging';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await page.locator('[data-dossier-route="imaging"][data-dossier-route-state="active"]').waitFor({
      timeout: 10_000,
    });

    const result = await page.evaluate(() => {
      const activeRoutes = [
        ...document.querySelectorAll('[data-dossier-route-state="active"]'),
      ].map((element) => element.getAttribute('data-dossier-route'));
      const hiddenRoutes = [
        ...document.querySelectorAll('[data-dossier-route-state="inactive"][hidden]'),
      ].map((element) => element.getAttribute('data-dossier-route'));
      const routeStage = document.querySelector('[data-dossier-first-viewport="route-stage"]');
      const focusShell = document.querySelector('[data-dossier-focus-shell="ready"]');
      const focusWorkspace = document.querySelector('[data-dossier-focus-region="workspace"]');
      const routeNav = document.querySelector('[data-dossier-task-routes="ready"]');
      const currentRoute = document.querySelector('.dossier-task-route[aria-current="page"]');
      const stageRect = routeStage?.getBoundingClientRect();
      const navRect = routeNav?.getBoundingClientRect();
      const currentText = currentRoute?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

      return {
        activeRoutes,
        hiddenRoutes,
        currentText,
        hasFocusShell: Boolean(focusShell),
        hasFocusWorkspace: Boolean(focusWorkspace),
        hasRouteStage: Boolean(routeStage),
        routeStageTop: stageRect?.top ?? null,
        routeNavBottom: navRect?.bottom ?? null,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        viewportHeight: window.innerHeight,
      };
    });

    if (pageErrors.length > 0) {
      throw new Error(`Paginafout tijdens ${options.label} smoke: ${pageErrors.join('; ')}`);
    }
    if (!result.hasRouteStage) {
      throw new Error(`${options.label}: dossier first-viewport stage ontbreekt.`);
    }
    if (!result.hasFocusShell || !result.hasFocusWorkspace) {
      throw new Error(`${options.label}: dossier focus-shell of workspace-regio ontbreekt.`);
    }
    if (result.activeRoutes.length !== 1 || result.activeRoutes[0] !== 'imaging') {
      throw new Error(`${options.label}: verwacht precies imaging als actieve route, kreeg ${result.activeRoutes.join(', ')}`);
    }
    if (result.hiddenRoutes.length !== 3) {
      throw new Error(`${options.label}: verwacht 3 verborgen inactieve routes, kreeg ${result.hiddenRoutes.length}.`);
    }
    if (!result.currentText.includes("Beelden & embryo's")) {
      throw new Error(`${options.label}: actieve routeknop mist imaging-label.`);
    }
    if (result.routeStageTop === null || result.routeStageTop >= result.viewportHeight) {
      throw new Error(`${options.label}: dossierroute-stage staat niet in de eerste viewport.`);
    }
    if (result.routeNavBottom === null || result.routeNavBottom > result.viewportHeight) {
      throw new Error(`${options.label}: dossierroutekeuze is niet volledig zichtbaar in de eerste viewport.`);
    }
    if (result.horizontalOverflow) {
      throw new Error(`${options.label}: dossierroute veroorzaakt horizontale overflow.`);
    }

    return {
      active: result.activeRoutes[0],
      hidden: result.hiddenRoutes.length,
      routeNavBottom: Math.round(result.routeNavBottom),
    };
  } finally {
    await context.close();
  }
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
  fail(error instanceof Error ? error.message : 'Dossier route smoke is mislukt.');
});
