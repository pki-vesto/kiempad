#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const TEXT_EXTENSIONS = new Set([
  '.css',
  '.env',
  '.example',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sh',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.webmanifest',
  '.yml',
  '.yaml',
]);

const SKIPPED_DIRS = new Set(['.git', '.vite', '.vitest', 'coverage', 'dist', 'node_modules']);

export const ALLOWED_SECRET_EXAMPLES = Object.freeze([
  {
    value: 'sk-test-secret',
    reason: 'Synthetische testplaceholder voor lokaal opgeslagen AI-instellingen.',
  },
  {
    value: 'tskey-auth-...',
    reason: 'Onbruikbare documentatieplaceholder voor het Tailscale deploycommando.',
  },
]);

const ALLOWED_SECRET_VALUES = createAllowedSecretSet();

const SECRET_PATTERNS = [
  { name: 'anthropic-api-key', pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'generic-sk-api-key', pattern: /\bsk-[A-Za-z0-9_-]{8,}\b/g },
  { name: 'github-token', pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g },
  { name: 'tailscale-auth-key', pattern: /\btskey-auth-[A-Za-z0-9_-]{16,}\b/g },
  { name: 'aws-access-key', pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  {
    name: 'private-key-block',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
];

export function scanSecretText(filePath, text) {
  const findings = [];
  const seenSecrets = new Set();
  for (const { name, pattern } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const secret = match[0];
      if (ALLOWED_SECRET_VALUES.has(secret)) continue;
      const matchKey = `${match.index ?? 0}:${secret}`;
      if (seenSecrets.has(matchKey)) continue;
      seenSecrets.add(matchKey);
      findings.push({
        filePath,
        pattern: name,
        line: lineNumberAt(text, match.index ?? 0),
        preview: redactSecret(secret),
      });
    }
  }
  return findings;
}

export function validateSecretAllowlist(entries = ALLOWED_SECRET_EXAMPLES) {
  const findings = [];
  const seen = new Set();

  for (const entry of entries) {
    if (!entry || typeof entry.value !== 'string' || entry.value.trim() === '') {
      findings.push('Allowlist-entry mist een exacte placeholderwaarde.');
      continue;
    }
    if (seen.has(entry.value)) {
      findings.push(`Allowlist-entry ${entry.value} is dubbel opgenomen.`);
    }
    seen.add(entry.value);
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 20) {
      findings.push(`Allowlist-entry ${entry.value} mist een concrete rationale.`);
    }
  }

  return findings;
}

function createAllowedSecretSet(entries = ALLOWED_SECRET_EXAMPLES) {
  const findings = validateSecretAllowlist(entries);
  if (findings.length > 0) {
    throw new Error(`Ongeldige secrets allowlist:\n${findings.join('\n')}`);
  }

  return new Set(entries.map((entry) => entry.value));
}

export function listSecretScanFiles(rootDir = process.cwd()) {
  const files = [];
  walk(rootDir, files, rootDir);
  return files.filter((file) => shouldScanFile(file));
}

export function scanSecretFiles(rootDir = process.cwd()) {
  return listSecretScanFiles(rootDir).flatMap((file) =>
    scanSecretText(path.relative(rootDir, file), fs.readFileSync(file, 'utf8')),
  );
}

function shouldScanFile(file) {
  const extension = path.extname(file);
  if (TEXT_EXTENSIONS.has(extension)) return true;
  return path.basename(file) === '.env.example' || path.basename(file) === '.gitignore';
}

function walk(dir, files, rootDir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example' && entry.name !== '.gitignore') {
      if (SKIPPED_DIRS.has(entry.name)) continue;
    }
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(rootDir, absolute);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name) || relative.startsWith('dist')) continue;
      walk(absolute, files, rootDir);
    } else {
      files.push(absolute);
    }
  }
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function redactSecret(secret) {
  if (secret.length <= 8) return '<redacted>';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

function main() {
  const findings = scanSecretFiles(process.cwd());
  if (findings.length === 0) {
    process.stdout.write('Geen secretpatronen gevonden.\n');
    return;
  }

  for (const finding of findings) {
    process.stdout.write(
      `${finding.filePath}:${finding.line} ${finding.pattern} ${finding.preview}\n`,
    );
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
