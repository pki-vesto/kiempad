#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';
import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = Number(process.env.KIEMPAD_CONTEXT_SIGNALS_SMOKE_PORT ?? 4178);
const url = `http://${host}:${port}/`;
const passphrase = 'context signals visual smoke passphrase';

const targets = [
  {
    screen: 'dossier',
    hash: '#dossier?route=imaging',
    signal: 'dossier',
    microstate: 'dossier-imaging',
    allowHidden: true,
  },
  {
    screen: 'logboek',
    hash: '#logboek?route=privacy',
    signal: 'eventlog',
    microstate: 'eventlog-privacy',
  },
  {
    screen: 'herinneringen',
    hash: '#herinneringen?route=plannen',
    signal: 'notification',
    microstate: 'notification-plannen',
  },
  {
    screen: 'backup',
    hash: '#backup?route=import',
    signal: 'backup',
    microstate: 'backup-import',
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
        results.push(await assertContextSignals(browser, options));
      }

      process.stdout.write(`Context signals visual smoke geslaagd: ${JSON.stringify(results)}\n`);
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview(preview);
  }
}

async function assertContextSignals(browser, options) {
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

      const selector = `[data-workspace-context-signals="${target.signal}"]`;
      const signals = page.locator(selector);
      await signals.waitFor({ state: target.allowHidden ? 'attached' : 'visible', timeout: 10_000 });
      if (!target.allowHidden) await signals.scrollIntoViewIfNeeded();

      const screenshot = target.allowHidden
        ? undefined
        : await signals.screenshot({ animations: 'disabled' });
      const evidence = await page.evaluate(({ signal, microstate }) => {
        const root = document.querySelector(`[data-workspace-context-signals="${signal}"]`);
        const contextColumn = root?.closest('.domain-split-workspace__context');
        const rootRect = root?.getBoundingClientRect();
        const contextRect = contextColumn?.getBoundingClientRect();
        const microstateElement = root?.querySelector(
          `[data-workspace-context-microstate="${microstate}"]`,
        );
        const microstateRect = microstateElement?.getBoundingClientRect();
        const nextActionElement = microstateElement?.querySelector('b');
        const nextActionRect = nextActionElement?.getBoundingClientRect();
        const nextActionAttribute = microstateElement?.getAttribute(
          'data-workspace-context-next-action',
        );
        const microstateFlowStyle = microstateElement
          ? getComputedStyle(microstateElement, '::after')
          : undefined;
        const cards = [...(root?.querySelectorAll('.workspace-context-signal') ?? [])].map(
          (element) => {
            const rect = element.getBoundingClientRect();
            const flowStyle = getComputedStyle(element, '::before');
            const textNodes = [...element.querySelectorAll('span, strong, p, a')].map((node) => ({
              tag: node.tagName.toLowerCase(),
              clientWidth: node.clientWidth,
              scrollWidth: node.scrollWidth,
              clientHeight: node.clientHeight,
              scrollHeight: node.scrollHeight,
            }));
            return {
              width: rect.width,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              borderColor: getComputedStyle(element).borderColor,
              backgroundColor: getComputedStyle(element).backgroundColor,
              boxShadow: getComputedStyle(element).boxShadow,
              flowMarker: {
                content: flowStyle.content,
                width: Number.parseFloat(flowStyle.width),
                height: Number.parseFloat(flowStyle.height),
                borderColor: flowStyle.borderColor,
              },
              textNodes,
              action: (() => {
                const action = element.querySelector('a');
                const actionRect = action?.getBoundingClientRect();
                return actionRect
                  ? { width: actionRect.width, height: actionRect.height }
                  : undefined;
              })(),
            };
          },
        );

        return {
          rootVisible: Boolean(rootRect && rootRect.width > 0 && rootRect.height > 0),
          microstateVisible: Boolean(
            microstateRect &&
              microstateRect.width > 0 &&
              microstateRect.height > 0 &&
              contextRect &&
              microstateRect.left >= contextRect.left - 1 &&
              microstateRect.right <= contextRect.right + 1,
          ),
          microstateTextFits: microstateElement
            ? [...microstateElement.querySelectorAll('span, strong, em, b')].every(
                (node) =>
                  node.scrollWidth <= node.clientWidth + 1 &&
                  node.scrollHeight <= node.clientHeight + 24,
              )
            : false,
          nextActionVisible: Boolean(
            nextActionAttribute &&
            nextActionRect &&
              nextActionRect.width > 0 &&
              nextActionRect.height > 0 &&
              microstateRect &&
              nextActionRect.left >= microstateRect.left - 1 &&
              nextActionRect.right <= microstateRect.right + 1,
          ),
          flowLinked: root?.getAttribute('data-workspace-context-flow') === 'linked',
          flowConnectorVisible: Boolean(
            microstateFlowStyle &&
              microstateFlowStyle.content !== 'none' &&
              Number.parseFloat(microstateFlowStyle.height) >= 10 &&
              Number.parseFloat(microstateFlowStyle.width) >= 1,
          ),
          cardCount: cards.length,
          contextWidth: contextRect?.width ?? 0,
          cardsInsideContext: cards.every(
            (card) =>
              contextRect &&
              card.left >= contextRect.left - 1 &&
              card.right <= contextRect.right + 1 &&
              card.width > 0 &&
              card.height > 0,
          ),
          textFits: cards.every((card) =>
            card.textNodes.every(
              (node) =>
                node.scrollWidth <= node.clientWidth + 1 &&
                node.scrollHeight <= node.clientHeight + 24,
            ),
          ),
          actionTargets: cards.every(
            (card) => card.action && card.action.width >= 42 && card.action.height >= 34,
          ),
          firstCardPrioritized:
            cards.length > 1 &&
            (cards[0].borderColor !== cards[1].borderColor ||
              cards[0].backgroundColor !== cards[1].backgroundColor ||
              cards[0].boxShadow !== cards[1].boxShadow),
          firstCardFlowLinked:
            cards.length > 0 &&
            cards[0].flowMarker.content !== 'none' &&
            cards[0].flowMarker.width >= 8 &&
            cards[0].flowMarker.height >= 8,
          flowAccent: cards[0]?.flowMarker.borderColor ?? '',
          horizontalOverflow:
            document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
            document.body.scrollWidth > document.body.clientWidth + 1,
        };
      }, target);

      if (pageErrors.length > 0) {
        throw new Error(
          `${options.label}/${target.screen}: paginafout tijdens contextsignalen-smoke: ${pageErrors.join('; ')}`,
        );
      }
      if (target.allowHidden) {
        if (evidence.cardCount < 3 || !evidence.flowLinked) {
          throw new Error(
            `${options.label}/${target.screen}: verborgen contextsignalen zijn niet compleet gekoppeld.`,
          );
        }
        checked.push({
          screen: target.screen,
          signal: target.signal,
          microstate: target.microstate,
          flowAccent: evidence.flowAccent,
          cards: evidence.cardCount,
          hiddenByDesign: true,
          screenshotBytes: 0,
        });
        continue;
      }

      if (!evidence.rootVisible || evidence.cardCount < 3) {
        throw new Error(`${options.label}/${target.screen}: contextsignalen zijn niet volledig zichtbaar.`);
      }
      if (!evidence.microstateVisible || !evidence.microstateTextFits) {
        throw new Error(`${options.label}/${target.screen}: route-microstate is niet zichtbaar of past niet.`);
      }
      if (!evidence.nextActionVisible) {
        throw new Error(`${options.label}/${target.screen}: route-next-action is niet zichtbaar.`);
      }
      if (!evidence.flowLinked || !evidence.flowConnectorVisible || !evidence.firstCardFlowLinked) {
        throw new Error(`${options.label}/${target.screen}: contextflow is niet zichtbaar gekoppeld.`);
      }
      if (!evidence.cardsInsideContext || evidence.contextWidth <= 0) {
        throw new Error(`${options.label}/${target.screen}: contextkaarten vallen buiten de contextkolom.`);
      }
      if (!evidence.textFits) {
        throw new Error(`${options.label}/${target.screen}: tekst past niet binnen contextkaarten.`);
      }
      if (!evidence.actionTargets) {
        throw new Error(`${options.label}/${target.screen}: contextactie heeft te kleine touch target.`);
      }
      if (!evidence.firstCardPrioritized) {
        throw new Error(`${options.label}/${target.screen}: eerste contextkaart mist visuele prioriteit.`);
      }
      if (evidence.horizontalOverflow) {
        throw new Error(`${options.label}/${target.screen}: contextsignalen veroorzaken horizontale overflow.`);
      }
      if (!screenshot || screenshot.byteLength < 2_000) {
        throw new Error(`${options.label}/${target.screen}: screenshot-evidence is te klein.`);
      }

      checked.push({
        screen: target.screen,
        signal: target.signal,
        microstate: target.microstate,
        flowAccent: evidence.flowAccent,
        cards: evidence.cardCount,
        screenshotBytes: screenshot.byteLength,
      });
    }

    const distinctFlowAccents = new Set(checked.map((target) => target.flowAccent).filter(Boolean));
    if (distinctFlowAccents.size < 3) {
      throw new Error(
        `${options.label}: contextflow mist route-eigen accentbalans (${distinctFlowAccents.size} accentfamilies).`,
      );
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
  fail(error instanceof Error ? error.message : 'Context signals visual smoke is mislukt.');
});
