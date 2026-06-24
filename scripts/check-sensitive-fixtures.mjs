#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_FIXTURE_DIRS = ['tests'];
const SKIPPED_DIRS = new Set(['.git', 'dist', 'node_modules']);

const FIXTURE_PATTERNS = [
  {
    name: 'non-synthetic-email',
    pattern: /\b[A-Z0-9._%+-]+@(?!(?:voorbeeld|example)\.test\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    message: 'Gebruik e-mailadressen op voorbeeld.test of example.test.',
  },
  {
    name: 'real-person-name-field',
    pattern: /\bNaam:\s*(?:Peter|Partner)\b/gi,
    message: 'Gebruik Testpersoon A/B in naamfixtures, geen echte of relationele namen.',
  },
  {
    name: 'realistic-bsn-fixture',
    pattern: /\bBSN:\s*(?!1{8,9}\b)\d{8,9}\b/gi,
    message: 'Gebruik BSN: 111111111 als synthetische redactiefixture.',
  },
];

export function scanSensitiveFixtureText(filePath, text) {
  const findings = [];
  for (const { name, pattern, message } of FIXTURE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      findings.push({
        filePath,
        pattern: name,
        line: lineNumberAt(text, match.index ?? 0),
        message,
      });
    }
  }
  return findings;
}

export function listSensitiveFixtureFiles(rootDir = process.cwd()) {
  return DEFAULT_FIXTURE_DIRS.flatMap((fixtureDir) => {
    const absolute = path.join(rootDir, fixtureDir);
    if (!fs.existsSync(absolute)) return [];
    const files = [];
    walk(absolute, files);
    return files;
  }).filter((file) => /\.(test|spec)\.tsx?$/.test(file));
}

export function scanSensitiveFixtureFiles(rootDir = process.cwd()) {
  return listSensitiveFixtureFiles(rootDir).flatMap((file) =>
    scanSensitiveFixtureText(path.relative(rootDir, file), fs.readFileSync(file, 'utf8')),
  );
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIPPED_DIRS.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, files);
    } else {
      files.push(absolute);
    }
  }
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function main() {
  const findings = scanSensitiveFixtureFiles(process.cwd());
  if (findings.length === 0) {
    process.stdout.write('Geen gevoelige fixturepatronen gevonden.\n');
    return;
  }

  for (const finding of findings) {
    process.stdout.write(
      `${finding.filePath}:${finding.line} ${finding.pattern} ${finding.message}\n`,
    );
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
