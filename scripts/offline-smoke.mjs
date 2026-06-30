#!/usr/bin/env node
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = Number(process.env.KIEMPAD_OFFLINE_SMOKE_PORT ?? 4174);
const url = `http://${host}:${port}/`;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
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

async function waitForServiceWorker(page) {
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service worker wordt niet ondersteund in deze browser.');
    }
    const withTimeout = (promise, message) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(message)), 10_000);
        promise.then(
          (value) => {
            clearTimeout(timer);
            resolve(value);
          },
          (error) => {
            clearTimeout(timer);
            reject(error);
          },
        );
      });

    await navigator.serviceWorker.register('/kiempad-sw.js');
    await withTimeout(
      navigator.serviceWorker.ready,
      'Service worker werd niet actief binnen 10 seconden.',
    );
    if (navigator.serviceWorker.controller) return;

    await withTimeout(
      new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
      }),
      'Service worker nam de pagina niet over binnen 10 seconden.',
    );
  });
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
  const stderr = [];
  preview.stderr.on('data', (chunk) => stderr.push(String(chunk)));

  try {
    await waitForPreview();
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForServiceWorker(page);

    // Reload once while online so the active service worker can runtime-cache built assets.
    await page.reload({ waitUntil: 'networkidle' });
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.vault-gate, .app-shell').first().waitFor({ timeout: 10_000 });

    const bodyText = await page.locator('body').innerText();
    if (!bodyText.includes('Kiempad')) {
      throw new Error('Offline reload toont geen Kiempad app-shell.');
    }
    if (/ERR_INTERNET_DISCONNECTED|This site can.t be reached|Unable to connect/i.test(bodyText)) {
      throw new Error('Offline reload toont een browser/netwerkfout in plaats van de app-shell.');
    }
    if (pageErrors.length > 0) {
      throw new Error(`Paginafout tijdens offline smoke: ${pageErrors.join('; ')}`);
    }

    await browser.close();
  } finally {
    stopPreview(preview);
  }

  process.stdout.write(`Offline smoke geslaagd: ${url} laadt na service-worker cache.\n`);
}

runSmoke().catch((error) => {
  fail(error instanceof Error ? error.message : 'Offline smoke is mislukt.');
});

function stopPreview(preview) {
  if (preview.killed || preview.pid === undefined) return;
  try {
    process.kill(-preview.pid, 'SIGTERM');
  } catch {
    preview.kill('SIGTERM');
  }
}
