#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const REQUIRED_CHECKLIST_MARKERS = [
  '- [ ] Registry:',
  '- [ ] Schema guard:',
  '- [ ] Snapshot:',
  '- [ ] Runbookreview:',
  'src/storage/centralBootstrapDiagnostics.ts',
  'diagnosticRegistry',
  'phaseCode-matrix',
];

const REQUIRED_WORKFLOW_MARKERS = [
  'Bootstrap governance freshness',
  'npm run governance:bootstrap',
];

function readProjectFile(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function collectMissingMarkers(text, markers) {
  return markers.filter((marker) => !text.includes(marker));
}

const runbook = readProjectFile('docs/RUNBOOK.md');
const workflow = readProjectFile('.github/workflows/ci.yml');

const missingRunbookMarkers = collectMissingMarkers(runbook, REQUIRED_CHECKLIST_MARKERS);
const missingWorkflowMarkers = collectMissingMarkers(workflow, REQUIRED_WORKFLOW_MARKERS);
const missing = [...missingRunbookMarkers, ...missingWorkflowMarkers];

const report = {
  status: missing.length === 0 ? 'ok' : 'failed',
  gate: 'bootstrap-governance-freshness',
  coverage: {
    registry: missingRunbookMarkers.includes('- [ ] Registry:') ? 'missing' : 'ok',
    schemaGuard: missingRunbookMarkers.includes('- [ ] Schema guard:') ? 'missing' : 'ok',
    snapshot: missingRunbookMarkers.includes('- [ ] Snapshot:') ? 'missing' : 'ok',
    runbookReview: missingRunbookMarkers.includes('- [ ] Runbookreview:') ? 'missing' : 'ok',
    ciStep: missingWorkflowMarkers.length === 0 ? 'ok' : 'missing',
  },
};

console.log(JSON.stringify(report, null, 2));

if (missing.length > 0) {
  process.exit(1);
}
