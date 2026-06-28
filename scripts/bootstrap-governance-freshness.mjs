#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const ROOT = process.cwd();

const contract = JSON.parse(
  readFileSync(new URL('./bootstrap-governance-freshness-contract.json', import.meta.url), 'utf8'),
);

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
  contract.runbookChecklistMarkers,
);
const missingRegistryReferenceMarkers = collectMissingMarkers(
  runbook,
  contract.registryReferenceMarkers,
);
const missingWorkflowMarkers = collectMissingMarkers(workflow, contract.workflowMarkers);
const missing = [
  ...missingRunbookChecklistMarkers,
  ...missingRegistryReferenceMarkers,
  ...missingWorkflowMarkers,
];

const report = {
  status: missing.length === 0 ? 'ok' : 'failed',
  gate: contract.gate,
  sources: {
    [contract.sourceFields[0]]: buildSourceDiagnostic(missingRunbookChecklistMarkers),
    [contract.sourceFields[1]]: buildSourceDiagnostic(missingRegistryReferenceMarkers),
    [contract.sourceFields[2]]: buildSourceDiagnostic(missingWorkflowMarkers),
  },
  coverage: {
    [contract.coverageFields[0]]: missingRunbookChecklistMarkers.includes('- [ ] Registry:')
      ? 'missing'
      : 'ok',
    [contract.coverageFields[1]]: missingRunbookChecklistMarkers.includes('- [ ] Schema guard:')
      ? 'missing'
      : 'ok',
    [contract.coverageFields[2]]: missingRunbookChecklistMarkers.includes('- [ ] Snapshot:')
      ? 'missing'
      : 'ok',
    [contract.coverageFields[3]]: missingRunbookChecklistMarkers.includes('- [ ] Runbookreview:')
      ? 'missing'
      : 'ok',
    [contract.coverageFields[4]]: missingWorkflowMarkers.length === 0 ? 'ok' : 'missing',
  },
};

console.log(JSON.stringify(report, null, 2));

if (missing.length > 0) {
  process.exit(1);
}
