#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const userId = 'kiempad-private-user';
const passphrase = 'central smoke passphrase';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function runSmoke() {
  const backendPort = await findFreePort();
  const previewPort = await findFreePort();
  const backendUrl = `http://${host}:${backendPort}`;
  const previewUrl = `http://${host}:${previewPort}/`;
  const previewOrigin = `http://${host}:${previewPort}`;
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'kiempad-central-browser-smoke-'));
  const persistenceFile = path.join(directory, 'central-db.json');
  const processes = [];

  try {
    const backend = spawn('npm', ['run', 'backend:central'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        KIEMPAD_CENTRAL_HOST: host,
        KIEMPAD_CENTRAL_PORT: String(backendPort),
        KIEMPAD_CENTRAL_PERSISTENCE_FILE: persistenceFile,
        KIEMPAD_CENTRAL_ALLOWED_USER_IDS: userId,
        KIEMPAD_CENTRAL_ALLOWED_ORIGINS: previewOrigin,
      },
    });
    processes.push(backend);
    await waitForHttp(`${backendUrl}/meta`, 15_000);

    await runCommand('npm', ['run', 'build'], {
      ...process.env,
      VITE_KIEMPAD_CENTRAL_API_URL: backendUrl,
      VITE_KIEMPAD_CENTRAL_USER_ID: userId,
    });

    const preview = spawn(
      'npm',
      ['run', 'preview', '--', '--host', host, '--port', String(previewPort), '--strictPort'],
      {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, BROWSER: 'none' },
      },
    );
    processes.push(preview);
    await waitForHttp(previewUrl, 15_000);

    const browser = await chromium.launch({ headless: true });
    try {
      const firstPage = await openSmokePage(browser, previewUrl);
      await unlockCentralDataset(firstPage, {
        expectedGateTitles: ['Welkom bij Kiempad', 'Welkom terug'],
      });
      if (await firstPage.locator('#first-run-complete-form').count()) {
        await firstPage.evaluate(() => {
          const setup = document.querySelector('[data-first-run-setup="collapsed"]');
          if (setup instanceof HTMLDetailsElement) setup.open = true;
          const form = document.querySelector('#first-run-complete-form');
          if (form instanceof HTMLFormElement) form.requestSubmit();
        });
        await firstPage
          .locator('#first-run-complete-form')
          .waitFor({ state: 'detached', timeout: 10_000 });
      }
      await expectPersistenceWrite(persistenceFile);

      const secondPage = await openSmokePage(browser, previewUrl);
      await assertSecondDeviceUnlockGate(secondPage);
      await unlockCentralDataset(secondPage, { expectedGateTitles: ['Welkom terug'] });
      if (await secondPage.locator('#first-run-complete-form').count()) {
        throw new Error('Tweede schone browsercontext zag first-run setup ondanks centrale settings.');
      }
    } finally {
      await browser.close();
    }
  } finally {
    for (const child of processes.reverse()) {
      stopProcess(child);
    }
    await fs.rm(directory, { recursive: true, force: true });
  }

  process.stdout.write(
    `Centrale browser smoke geslaagd: ${previewUrl} gebruikte ${backendUrl} met encrypted persistence.\n`,
  );
}

async function openSmokePage(browser, previewUrl) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.smokePageErrors = pageErrors;

  await page.goto(previewUrl, { waitUntil: 'networkidle' });
  await waitForAppBootstrap(page, pageErrors);
  return page;
}

async function assertSecondDeviceUnlockGate(page) {
  const title = await page.locator('#vault-title').innerText();
  if (title.includes('Welkom bij Kiempad')) {
    throw new Error('Tweede schone browsercontext moest de centrale dataset opnieuw starten.');
  }
  if (title !== 'Welkom terug') {
    throw new Error(`Tweede schone browsercontext toont onverwachte vault-titel: ${title}`);
  }
}

async function unlockCentralDataset(page, options) {
  const title = await page.locator('#vault-title').innerText();
  if (!options.expectedGateTitles.includes(title)) {
    throw new Error(`Onverwachte vault-titel: ${title}`);
  }
  await page.locator('#passphrase').fill(passphrase);
  await page.locator('#vault-form button[type="submit"]').click();
  await page.locator('.app-shell').waitFor({ timeout: 10_000 });

  const unlockedText = await page.locator('body').innerText();
  if (!unlockedText.includes('Centrale versleutelde opslag')) {
    throw new Error('App-shell toont niet dat centrale versleutelde opslag actief is.');
  }
  if (unlockedText.includes('Legacy lokaal')) {
    throw new Error('App-shell viel terug naar legacy lokale opslag.');
  }
  if (page.smokePageErrors?.length > 0) {
    throw new Error(`Paginafout tijdens centrale smoke: ${page.smokePageErrors.join('; ')}`);
  }
}

async function waitForAppBootstrap(page, pageErrors) {
  try {
    await page.waitForSelector('#passphrase, .app-shell', { timeout: 10_000 });
  } catch (error) {
    const bodyText = await page.locator('body').innerText().catch(() => '');
    throw new Error(
      [
        'PWA bootstrapte niet naar vault-gate of app-shell.',
        bodyText ? `Body: ${bodyText.slice(0, 500)}` : 'Body was leeg.',
        pageErrors.length > 0 ? `Page errors: ${pageErrors.join('; ')}` : 'Geen pageerror ontvangen.',
      ].join('\n'),
      { cause: error },
    );
  }

  if (await page.locator('.app-shell').count()) {
    throw new Error('PWA was onverwacht al ontgrendeld voor de centrale smoke.');
  }
}

async function expectPersistenceWrite(persistenceFile) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const text = await fs.readFile(persistenceFile, 'utf8');
      const snapshot = JSON.parse(text);
      const records = Array.isArray(snapshot?.records) ? snapshot.records : [];
      const encryptedUserRecords = records.filter(
        (record) => record?.ownerUserId === userId && record?.payload?.alg === 'AES-256-GCM',
      );
      if (encryptedUserRecords.length > 0) {
        if (!text.includes(userId)) {
          throw new Error('Centrale persistence mist de verwachte ownerUserId.');
        }
        for (const forbidden of [passphrase, 'central smoke passphrase', 'firstRunSetup']) {
          if (text.includes(forbidden)) {
            throw new Error(`Centrale persistence bevat plaintext: ${forbidden}`);
          }
        }
        return;
      }
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
        throw error;
      }
    }
    await delay(250);
  }
  throw new Error('Centrale persistence bevatte geen encrypted user-record binnen timeout.');
}

async function runCommand(command, args, env) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });
    const output = [];
    child.stdout.on('data', (chunk) => output.push(String(chunk)));
    child.stderr.on('data', (chunk) => output.push(String(chunk)));
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} faalde met code ${code}\n${output.join('')}`));
    });
  });
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.status < 500) return;
    } catch {
      // Server is still starting.
    }
    await delay(250);
  }
  throw new Error(`Server reageert niet op ${url}`);
}

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, host, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Kon geen vrije TCP-poort bepalen.'));
        return;
      }
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });
}

function stopProcess(child) {
  if (child.killed || child.pid === undefined) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runSmoke().catch((error) => {
  fail(error instanceof Error ? error.message : 'Centrale browser smoke is mislukt.');
});
