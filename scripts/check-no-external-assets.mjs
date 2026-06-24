#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const ALLOWED_REMOTE_ASSET_URLS = Object.freeze([
  {
    url: 'http://www.w3.org/2000/svg',
    reason:
      'Technische SVG namespace; dit is geen netwerkload en is nodig voor geldige inline SVG.',
  },
]);

const ALLOWED_URLS = createAllowedUrlSet();
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.svg', '.webmanifest']);
const REMOTE_URL_PATTERN = /https?:\/\/[^,\s]+/gi;

export function validateAssetAllowlist(entries = ALLOWED_REMOTE_ASSET_URLS) {
  const findings = [];
  const seen = new Set();

  for (const entry of entries) {
    if (!entry || typeof entry.url !== 'string' || !/^https?:\/\//i.test(entry.url)) {
      findings.push('Allowlist-entry mist een geldige http(s)-URL.');
      continue;
    }
    if (seen.has(entry.url)) {
      findings.push(`Allowlist-entry ${entry.url} is dubbel opgenomen.`);
    }
    seen.add(entry.url);
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 20) {
      findings.push(`Allowlist-entry ${entry.url} mist een concrete rationale.`);
    }
  }

  return findings;
}

function createAllowedUrlSet(entries = ALLOWED_REMOTE_ASSET_URLS) {
  const findings = validateAssetAllowlist(entries);
  if (findings.length > 0) {
    throw new Error(`Ongeldige externe-asset allowlist:\n${findings.join('\n')}`);
  }

  return new Set(entries.map((entry) => entry.url));
}

export function scanAssetText(filePath, text) {
  const findings = [];
  const addFinding = (url, context) => {
    if (ALLOWED_URLS.has(url)) return;
    findings.push({ filePath, url, context });
  };

  for (const match of text.matchAll(/\b(?:src|href)\s*=\s*["'](?<url>https?:\/\/[^"']+)["']/gi)) {
    addFinding(match.groups.url, 'html-attribute');
  }
  for (const match of text.matchAll(/\bsrcset\s*=\s*["'](?<value>[^"']+)["']/gi)) {
    for (const urlMatch of match.groups.value.matchAll(REMOTE_URL_PATTERN)) {
      addFinding(urlMatch[0], 'html-srcset');
    }
  }
  for (const match of text.matchAll(/\burl\(\s*["']?(?<url>https?:\/\/[^"')\s]+)["']?\s*\)/gi)) {
    addFinding(match.groups.url, 'css-url');
  }
  for (const match of text.matchAll(/@import\s+(?:url\()?["'](?<url>https?:\/\/[^"')]+)["']\)?/gi)) {
    addFinding(match.groups.url, 'css-import');
  }
  for (const match of text.matchAll(/\bimportScripts\(\s*["'](?<url>https?:\/\/[^"']+)["']\s*\)/gi)) {
    addFinding(match.groups.url, 'js-importscripts');
  }
  for (const match of text.matchAll(/\bfrom\s+["'](?<url>https?:\/\/[^"']+)["']/gi)) {
    addFinding(match.groups.url, 'js-import');
  }

  if (filePath.endsWith('.webmanifest')) {
    const manifest = JSON.parse(text);
    for (const field of ['start_url', 'scope']) {
      const value = manifest[field];
      if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
        addFinding(value, `manifest-${field}`);
      }
    }
    for (const icon of manifest.icons ?? []) {
      if (typeof icon?.src === 'string' && /^https?:\/\//i.test(icon.src)) {
        addFinding(icon.src, 'manifest-icon');
      }
    }
  }

  return findings;
}

export function listScannableAssetFiles(rootDir, extraFiles = []) {
  const files = [];
  for (const file of extraFiles) {
    if (fs.existsSync(file)) files.push(file);
  }
  for (const dir of ['public', 'dist']) {
    const absolute = path.join(rootDir, dir);
    if (!fs.existsSync(absolute)) continue;
    walk(absolute, files);
  }
  return [...new Set(files)].filter((file) => TEXT_EXTENSIONS.has(path.extname(file)));
}

export function scanAssetFiles(rootDir = process.cwd()) {
  return listScannableAssetFiles(rootDir, [path.join(rootDir, 'index.html')]).flatMap((file) =>
    scanAssetText(path.relative(rootDir, file), fs.readFileSync(file, 'utf8')),
  );
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, files);
    } else {
      files.push(absolute);
    }
  }
}

function main() {
  const findings = scanAssetFiles(process.cwd());
  if (findings.length === 0) {
    process.stdout.write("Geen externe asset-URL's gevonden.\n");
    return;
  }

  for (const finding of findings) {
    process.stdout.write(
      `${finding.filePath}: ${finding.context} verwijst naar ${finding.url}\n`,
    );
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
