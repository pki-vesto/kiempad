#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const ROOT = process.cwd();

const REQUIRED_RUNBOOK_CHECKLIST_MARKERS = [
  '- [ ] Registry:',
  '- [ ] Schema guard:',
  '- [ ] Snapshot:',
  '- [ ] Runbookreview:',
];

const REQUIRED_REGISTRY_REFERENCE_MARKERS = [
  'src/storage/centralBootstrapDiagnostics.ts',
  'diagnosticRegistry',
  'phaseCode-matrix',
];

const REQUIRED_WORKFLOW_MARKERS = [
  'Bootstrap governance freshness',
  'npm run governance:bootstrap',
];

function readProjectFile(path) {
  return readFileSync(isAbsolute(path) ? path : join(ROOT, path), 'utf8');
}

function collectMissingMarkers(text, markers) {
  return markers.filter((marker) => !text.includes(marker));
}

function buildSourceDiagnostic(missingMarkers) {
  return {
    status: missingMarkers.length === 0 ? 'ok' : 'missing',
    missingCount: missingMarkers.length,
  };
}

const runbook = readProjectFile(
  process.env.KIEMPAD_BOOTSTRAP_GOVERNANCE_RUNBOOK_PATH ?? 'docs/RUNBOOK.md',
);
const workflow = readProjectFile(
  process.env.KIEMPAD_BOOTSTRAP_GOVERNANCE_WORKFLOW_PATH ?? '.github/workflows/ci.yml',
);

const missingRunbookChecklistMarkers = collectMissingMarkers(
  runbook,
  REQUIRED_RUNBOOK_CHECKLIST_MARKERS,
);
const missingRegistryReferenceMarkers = collectMissingMarkers(
  runbook,
  REQUIRED_REGISTRY_REFERENCE_MARKERS,
);
const missingWorkflowMarkers = collectMissingMarkers(workflow, REQUIRED_WORKFLOW_MARKERS);
const missing = [
  ...missingRunbookChecklistMarkers,
  ...missingRegistryReferenceMarkers,
  ...missingWorkflowMarkers,
];

const report = {
  status: missing.length === 0 ? 'ok' : 'failed',
  gate: 'bootstrap-governance-freshness',
  sources: {
    runbookChecklist: buildSourceDiagnostic(missingRunbookChecklistMarkers),
    registryReference: buildSourceDiagnostic(missingRegistryReferenceMarkers),
    ciStep: buildSourceDiagnostic(missingWorkflowMarkers),
  },
  coverage: {
    registry: missingRunbookChecklistMarkers.includes('- [ ] Registry:') ? 'missing' : 'ok',
    schemaGuard: missingRunbookChecklistMarkers.includes('- [ ] Schema guard:')
      ? 'missing'
      : 'ok',
    snapshot: missingRunbookChecklistMarkers.includes('- [ ] Snapshot:') ? 'missing' : 'ok',
    runbookReview: missingRunbookChecklistMarkers.includes('- [ ] Runbookreview:')
      ? 'missing'
      : 'ok',
    ciStep: missingWorkflowMarkers.length === 0 ? 'ok' : 'missing',
  },
};

console.log(JSON.stringify(report, null, 2));

if (missing.length > 0) {
  process.exit(1);
}
