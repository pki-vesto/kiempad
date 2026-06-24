import { describe, expect, it } from 'vitest';
import prTemplate from '../.github/PULL_REQUEST_TEMPLATE.md?raw';
import changelog from '../CHANGELOG.md?raw';
import contributing from '../CONTRIBUTING.md?raw';
import currentState from '../CURRENT_STATE.md?raw';
import adrBacklog from '../docs/ADR_BACKLOG.md?raw';
import adrReviewEvidenceIndex from '../docs/ADR_REVIEW_EVIDENCE_INDEX.md?raw';
import adrReviewEvidenceTemplate from '../docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md?raw';
import autonomyGuardrailEvidenceChecklist from '../docs/AUTONOMY_GUARDRAIL_EVIDENCE_CHECKLIST.md?raw';
import autonomyGuardrails from '../docs/AUTONOMY_GUARDRAILS.md?raw';
import medicalBoundaryAdr from '../docs/adr/0004-geen-medisch-hulpmiddel.md?raw';
import codexAutonomyAdr from '../docs/adr/0007-codex-autonoom-bouwen.md?raw';
import backlogHealthJsonReference from '../docs/BACKLOG_HEALTH_JSON_REFERENCE.md?raw';
import cspViolationWorkflow from '../docs/CSP_VIOLATION_WORKFLOW.md?raw';
import eventLogPrivacy from '../docs/EVENT_LOG_PRIVACY.md?raw';
import externalAssetAllowlist from '../docs/EXTERNAL_ASSET_ALLOWLIST.md?raw';
import goalCompletionAudit from '../docs/GOAL_COMPLETION_AUDIT.md?raw';
import publicRepoPrivacyReview from '../docs/PUBLIC_REPO_PRIVACY_REVIEW.md?raw';
import secretsScanBaseline from '../docs/SECRETS_SCAN_BASELINE.md?raw';
import executionGoals from '../EXECUTION_GOALS.md?raw';
import masterContext from '../MASTER_CONTEXT.md?raw';
import privacy from '../PRIVACY.md?raw';
import backlog from '../PRODUCT_BACKLOG.md?raw';
import readme from '../README.md?raw';
import { DISCLAIMER } from '../src/appShell';
import backlogHealthTest from './backlogHealth.test.ts?raw';

const BACKLOG_HEALTH_CONTRACT_MATRIX_START_MARKER = 'backlog-health-json-contract-matrix:start';
const BACKLOG_HEALTH_CONTRACT_MATRIX_END_MARKER = 'backlog-health-json-contract-matrix:end';
const BACKLOG_HEALTH_CONTRACT_MATRIX_RECOVERY_ACTION = `herstel beide markercomments ${BACKLOG_HEALTH_CONTRACT_MATRIX_START_MARKER} en ${BACKLOG_HEALTH_CONTRACT_MATRIX_END_MARKER} rond dezelfde issueSnapshot-matrixgroepverwachting in tests/backlogHealth.test.ts`;
const BACKLOG_HEALTH_CONTRACT_MATRIX_MISSING_ERROR = `Backlog-health contractmatrix ontbreekt: ${BACKLOG_HEALTH_CONTRACT_MATRIX_RECOVERY_ACTION}.`;
type BacklogHealthArtifactDocsHint = {
  label: string;
  term: string;
};
type NormalizedBacklogHealthArtifactDocsHint = {
  rawLabel: string;
  rawTerm: string;
  label: string;
  term: string;
};
type BacklogHealthArtifactDocsHintStaticErrorReason =
  | 'label ontbreekt'
  | 'term ontbreekt'
  | 'label bevat alleen whitespace'
  | 'term bevat alleen whitespace';
type BacklogHealthArtifactDocsHintDynamicErrorReason =
  | `label is te generiek: ${string}`
  | `term is te kort: ${string}`;
type BacklogHealthArtifactDocsHintErrorReason =
  | BacklogHealthArtifactDocsHintStaticErrorReason
  | BacklogHealthArtifactDocsHintDynamicErrorReason;
const BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS = {
  missingLabel: 'label ontbreekt',
  missingTerm: 'term ontbreekt',
  whitespaceLabel: 'label bevat alleen whitespace',
  whitespaceTerm: 'term bevat alleen whitespace',
} as const satisfies Record<string, BacklogHealthArtifactDocsHintStaticErrorReason>;
const BACKLOG_HEALTH_RECOVERY_FORBIDDEN_ARTIFACT_LABELS = [
  { label: 'issue snapshots', term: 'issue-snapshot' },
  { label: 'raw GitHub output', term: 'ruwe GitHub-output' },
] as const;
const BACKLOG_HEALTH_RECOVERY_ARTIFACT_DOCS_HINT_TERMS = [
  { label: 'maintenance tests label usage', term: 'onderhoudstests gebruiken die labels' },
  { label: 'recovery fixes boundary', term: 'recoveryfixes' },
] as const satisfies ReadonlyArray<BacklogHealthArtifactDocsHint>;

describe('onderhoudsdocumentatie', () => {
  it('houdt de backlog-samenvatting gelijk aan de doelstatussen', () => {
    const summary = extractBacklogSummary();
    const actual = countGoalStatuses();

    expect(summary).toEqual(actual);
  });

  it('houdt CURRENT_STATE en CHANGELOG actueel voor de laatste onderhoudschecks', () => {
    for (const goal of ['G167', 'G168', 'G170', 'G174', 'G244']) {
      expect(currentState).toContain(goal);
      expect(changelog).toContain(goal);
    }
  });

  it('houdt een rijke execution-goalcatalogus met minimaal 100 actieve doelen', () => {
    const backlogGoals = parseBacklogGoalRows();
    const executionGoalSections = parseExecutionGoalSections();
    const openBacklogGoalIds = backlogGoals
      .filter((goal) => goal.status === '☐')
      .map((goal) => goal.id)
      .sort();
    const openExecutionGoalIds = executionGoalSections
      .filter((goal) => goal.status === '☐ open')
      .map((goal) => goal.id)
      .sort();
    const activeEpics = executionGoals.match(/^- \*\*.+:\*\* .+$/gm) ?? [];

    expect(openBacklogGoalIds.length).toBeGreaterThanOrEqual(100);
    expect(openExecutionGoalIds).toEqual(openBacklogGoalIds);
    expect(executionGoalSections.length).toBeGreaterThanOrEqual(openBacklogGoalIds.length);
    expect(activeEpics.length).toBeGreaterThanOrEqual(3);
    expect(executionGoals).toContain('F5 — Continuous Personal Fertility Operations');

    for (const section of executionGoalSections) {
      for (const field of [
        'Epic',
        'Problem',
        'Desired Outcome',
        'User Value',
        'Acceptance Criteria',
        'Priority',
        'Complexity',
        'Related Components',
        'ADR Needed',
        'Status',
      ]) {
        expect(section.raw).toContain(`- **${field}:**`);
      }
    }
  });

  it('houdt ADR-needed markers expliciet en synchroon met de ADR-backlog', () => {
    const adrMarkers = extractExecutionGoalAdrMarkers();

    expect([...new Set(adrMarkers.map((entry) => entry.value))].sort()).toEqual(['no', 'yes']);
    for (const marker of adrMarkers) {
      expect(['yes', 'no']).toContain(marker.value);
    }

    const adrNeededGoals = adrMarkers
      .filter((entry) => entry.value === 'yes')
      .map((entry) => entry.id)
      .sort();

    expect(adrNeededGoals).toEqual(['G266', 'G304', 'G315', 'G323', 'G344']);
    for (const goalId of adrNeededGoals) {
      expect(adrBacklog).toContain(goalId);
    }

    expect(adrBacklog).toContain('EXECUTION_GOALS.md');
    expect(adrBacklog).toContain('ADR Needed: yes');
    expect(adrBacklog).toContain('Pending ADR Topics');
  });

  it('documenteert het ADR-review evidence template schema', () => {
    for (const requiredHeading of [
      '# ADR Review Evidence Template',
      '## Goal',
      '## Existing ADRs Consulted',
      '## Decision Outcome',
      '## Follow-up Requirements',
      '## Evidence Boundary',
      '## Voorbeeld',
    ]) {
      expect(adrReviewEvidenceTemplate).toContain(requiredHeading);
    }

    for (const requiredField of [
      'Goal ID:',
      'Reviewer:',
      'Review date:',
      'Existing ADRs Consulted',
      'Outcome: existing ADR sufficient | update existing ADR | create new ADR | defer goal',
      'ADR route:',
      'Required before implementation:',
      'Required before merge:',
      'Sensitive data excluded:',
      'Network/AI/data impact checked:',
    ]) {
      expect(adrReviewEvidenceTemplate).toContain(requiredField);
    }

    expect(adrReviewEvidenceTemplate).toContain('Leg geen gevoelige gebruikersdata');
    expect(adrReviewEvidenceTemplate).toContain('G344');
    expect(adrBacklog).toContain('ADR_REVIEW_EVIDENCE_TEMPLATE.md');
    expect(adrBacklog).toContain('goal-id, reviewer/datum');
  });

  it('houdt ADR-review evidence index synchroon met ADR-needed goals', () => {
    const adrNeededGoals = extractExecutionGoalAdrMarkers()
      .filter((entry) => entry.value === 'yes')
      .map((entry) => entry.id)
      .sort();
    const indexedGoals = extractAdrReviewEvidenceIndexGoals();

    expect(indexedGoals).toEqual(adrNeededGoals);
    for (const goalId of adrNeededGoals) {
      expect(adrReviewEvidenceIndex).toContain(`| ${goalId} |`);
      expect(adrReviewEvidenceIndex).toContain(
        'pending: use `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md`',
      );
      expect(adrReviewEvidenceIndex).toContain('pending review');
      expect(adrReviewEvidenceIndex).toContain('required before implementation');
    }

    expect(adrReviewEvidenceIndex).toContain('Geen gebruikersdata, tokens');
    expect(adrReviewEvidenceIndex).toContain('Decision outcome');
    expect(adrBacklog).toContain('ADR_REVIEW_EVIDENCE_INDEX.md');
    expect(adrBacklog).toContain('ADR-review evidence index synchroon');
  });

  it('houdt de disclaimer-grens consistent in app en kerndocumenten', () => {
    expect(DISCLAIMER).toContain('geen medisch hulpmiddel');
    expect(DISCLAIMER).toContain('geen vervanging van medisch advies');
    expect(DISCLAIMER).toContain('Schema’s en doseringen volgen altijd de kliniek');

    for (const document of [readme, privacy, medicalBoundaryAdr]) {
      const normalized = document.replaceAll('*', '').replaceAll('\n', ' ');
      expect(normalized).toMatch(/geen medisch hulpmiddel/i);
      expect(normalized).toMatch(/geen (vervanging van )?medisch advies/i);
      expect(normalized).toMatch(/kliniek/i);
    }
  });

  it('verankert de goal-completion-audit in de autonome mergeflow', () => {
    for (const requiredTerm of [
      'requirements',
      'evidence',
      'tests',
      'PR-status',
      'Documentatie en backlog',
      'GitHub-status',
    ]) {
      expect(goalCompletionAudit).toContain(requiredTerm);
    }

    expect(goalCompletionAudit).toContain('`MASTER_CONTEXT.md` sectie 4');
    expect(goalCompletionAudit).toContain('minimaal 100 actieve doelen');
    expect(goalCompletionAudit).toContain('Closes #');
    expect(goalCompletionAudit).toContain('`main` groen');
    expect(masterContext).toContain('docs/GOAL_COMPLETION_AUDIT.md');
    expect(prTemplate).toContain('docs/GOAL_COMPLETION_AUDIT.md');
  });

  it('herkent completion-audit evidence markers in docs en PR-template', () => {
    const requiredHeadings = [
      '### Requirements Evidence',
      '### Test Evidence',
      '### Policy Evidence',
      '### GitHub Evidence',
    ];

    for (const document of [goalCompletionAudit, prTemplate]) {
      const markerBlock = extractCompletionAuditMarkerBlock(document);
      for (const heading of requiredHeadings) {
        expect(markerBlock).toContain(heading);
      }
      for (const field of [
        'Requirement:',
        'Evidence:',
        'Strength:',
        'Commands:',
        'Result:',
        'Coverage:',
        'Privacy:',
        'Medical:',
        'Network/AI:',
        'Issue:',
        'PR:',
        'Main CI:',
        'Backlog:',
      ]) {
        expect(markerBlock).toContain(`- ${field}`);
      }
    }

    expect(goalCompletionAudit).toContain('### Filled Example');
    expect(goalCompletionAudit).toContain('Direct docs plus maintenance test');
    expect(goalCompletionAudit).toContain('replacement goal added to keep 100 open goals');
  });

  it('documenteert autonomieguardrails voor local-first self-merge', () => {
    for (const requiredHeading of [
      '## Netwerk',
      '## AI',
      '## Data',
      '## GitHub',
      '## Tailscale',
      '## Medisch Beleid',
      '## Verificatie per Autonome PR',
    ]) {
      expect(autonomyGuardrails).toContain(requiredHeading);
    }

    for (const requiredTerm of [
      'geen nieuwe netwerkcalls',
      'expliciete lokale opt-in',
      'Gezondheidsdata blijft local-first',
      'Groene CI is de harde merge-gate',
      'aparte Tailscale HTTPS-node',
      'geen medisch hulpmiddel',
      'geen diagnose',
      'geen dosering',
      'geen behandelkeuze',
    ]) {
      expect(autonomyGuardrails).toContain(requiredTerm);
    }

    expect(autonomyGuardrails).toMatch(/Auth keys worden buiten de repo beheerd/i);
    expect(codexAutonomyAdr).toContain('../AUTONOMY_GUARDRAILS.md');
    expect(goalCompletionAudit).toContain('docs/AUTONOMY_GUARDRAILS.md');
    expect(prTemplate).toContain('docs/AUTONOMY_GUARDRAILS.md');
  });

  it('documenteert de gesanitized backlog-health JSON-shape voor automation', () => {
    for (const field of [
      'issueSnapshot.duplicateIssues',
      'issueSnapshot.missingIssueLinks',
      'issueSnapshot.nonOpenIssueLinks',
      'issueSnapshot.completedGoalOpenIssues',
      'number',
      'title',
      'state',
      'url',
    ]) {
      expect(backlogHealthJsonReference).toContain(field);
    }

    expect(backlogHealthJsonReference).toContain('number,title,state,url');
    expect(backlogHealthJsonReference).toContain('--issue-snapshot-limit 500 --json');
    expect(backlogHealthJsonReference).toContain('rm -f /tmp/kiempad-issues.json');
    expect(backlogHealthJsonReference).toContain('issue bodies, tokens');
    expect(readme).toContain('docs/BACKLOG_HEALTH_JSON_REFERENCE.md');
  });

  it('documenteert een gesanitized backlog-health JSON-example fixture', () => {
    const { example, exampleJson } = extractBacklogHealthJsonExample();

    expect(example.issueSnapshot?.duplicateIssues).toHaveLength(1);
    expect(example.issueSnapshot?.missingIssueLinks).toHaveLength(1);
    expect(example.issueSnapshot?.nonOpenIssueLinks).toHaveLength(1);
    expect(example.issueSnapshot?.completedGoalOpenIssues).toHaveLength(1);

    for (const allowedField of ['"number"', '"title"', '"state"', '"url"']) {
      expect(exampleJson).toContain(allowedField);
    }
    for (const forbiddenField of ['"body"', '"token"', '"snapshot"', '"authKey"']) {
      expect(exampleJson).not.toContain(forbiddenField);
    }
  });

  it('houdt de backlog-health JSON-example fixture synchroon met de referentie', () => {
    const { example, exampleJson } = extractBacklogHealthJsonExample();
    const referencedSnapshotGroups = Array.from(
      backlogHealthJsonReference.matchAll(/`issueSnapshot\.(?<field>[A-Za-z]+)`/g),
      (match) => match.groups?.field,
    ).filter((field): field is string => Boolean(field));

    expect(Object.keys(example.issueSnapshot ?? {}).sort()).toEqual(
      referencedSnapshotGroups.sort(),
    );
    expect(backlogHealthJsonReference).toContain(
      'gh issue list --state all --limit 500 --json number,title,state,url',
    );
    expect(backlogHealthJsonReference).toContain('--issue-snapshot-limit 500 --json');
    expect(exampleJson).not.toContain('/tmp/kiempad-issues.json');
    expect(extractBacklogHealthExampleIssueKeys(example)).toEqual([
      'number',
      'state',
      'title',
      'url',
    ]);
  });

  it('documenteert consumer notes voor de backlog-health JSON-example fixture', () => {
    const consumerNotes = extractMarkdownSection(backlogHealthJsonReference, 'Consumer Notes');

    for (const requiredTerm of [
      'stabiele rapportsecties',
      'voorbeelddata volledig',
      'één synthetische rij',
      'productie-output kan',
      '`id`',
      '`issues`',
      '`issue`',
      '`number`',
      '`title`',
      '`state`',
      '`url`',
      'Issue bodies, tokens, auth keys',
      'lokale snapshotpaden',
      'number,title,state,url',
      'verwijder `/tmp/kiempad-issues.json`',
    ]) {
      expect(consumerNotes).toContain(requiredTerm);
    }
  });

  it('verwijst vanuit de backlog-health JSON-reference naar de contractmatrix-test', () => {
    const contractCoverage = extractMarkdownSection(
      backlogHealthJsonReference,
      'Contract Coverage',
    );
    const recoveryParagraph = extractMarkdownParagraphContaining(
      contractCoverage,
      'Backlog-health contractmatrix ontbreekt',
    );
    const normalizedRecoveryParagraph = normalizeMarkdownText(recoveryParagraph);

    for (const requiredTerm of [
      'tests/backlogHealth.test.ts',
      'documenteert issue-snapshotvelden met een compacte contractmatrix',
      '`issueSnapshot`-groep',
      'top-level velden',
      'nested issuevelden',
      'Werk die matrix bij',
      'backlog-health-json-contract-matrix:start',
      'backlog-health-json-contract-matrix:end',
      'documentatie en contractmatrix synchroon',
    ]) {
      expect(contractCoverage).toContain(requiredTerm);
    }

    for (const requiredTerm of [
      'Backlog-health contractmatrix ontbreekt',
      'beide markercomments',
      'tests/backlogHealth.test.ts',
      'opnieuw draaien van de docs-/contracttests',
    ]) {
      expect(recoveryParagraph).toContain(requiredTerm);
    }

    expectBacklogHealthRecoveryForbiddenArtifactLabels(recoveryParagraph);
    expectBacklogHealthRecoveryArtifactDocsHint(recoveryParagraph);

    for (const requiredTerm of [
      BACKLOG_HEALTH_CONTRACT_MATRIX_START_MARKER,
      BACKLOG_HEALTH_CONTRACT_MATRIX_END_MARKER,
    ]) {
      expect(BACKLOG_HEALTH_CONTRACT_MATRIX_MISSING_ERROR).toContain(requiredTerm);
      expect(contractCoverage).toContain(requiredTerm);
    }

    expect(BACKLOG_HEALTH_CONTRACT_MATRIX_MISSING_ERROR).toContain(
      BACKLOG_HEALTH_CONTRACT_MATRIX_RECOVERY_ACTION,
    );
    expect(normalizedRecoveryParagraph).toContain(BACKLOG_HEALTH_CONTRACT_MATRIX_RECOVERY_ACTION);
  });

  it('houdt gedocumenteerde issue-snapshotgroepen synchroon met de contractmatrix', () => {
    const documentedGroups = extractBacklogHealthReferenceGroups();
    const matrixGroups = extractBacklogHealthContractMatrixGroups();

    expect(matrixGroups).toEqual(documentedGroups);
  });

  it('faalt duidelijk wanneer backlog-health contractmatrixmarkers ontbreken', () => {
    expect(() => extractBacklogHealthContractMatrixGroups('const matrix = [];')).toThrow(
      BACKLOG_HEALTH_CONTRACT_MATRIX_MISSING_ERROR,
    );
  });

  it('faalt duidelijk wanneer de backlog-health recoveryparagraaf ontbreekt', () => {
    expect(() =>
      extractMarkdownParagraphContaining(
        'Laat de markercomments rond de matrixgroepverwachting staan.',
        'Backlog-health contractmatrix ontbreekt',
      ),
    ).toThrow(
      'Paragraaf ontbreekt: Backlog-health contractmatrix ontbreekt. Herstel de recoveryparagraaf in Contract Coverage.',
    );
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel ontbreekt', () => {
    expect(() =>
      expectBacklogHealthRecoveryForbiddenArtifactLabels(
        'Maak geen issue-snapshot onderdeel van de fix.',
      ),
    ).toThrow('Backlog-health recoveryparagraaf mist forbidden artifact label: raw GitHub output.');
  });

  it('faalt duidelijk wanneer de backlog-health recovery artifactlabel-uitleg ontbreekt', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHint(
        'Laat de artifact-labels issue-snapshot en ruwe GitHub-output in deze recoveryparagraaf staan.',
      ),
    ).toThrow(
      'Backlog-health recoveryparagraaf mist artifact-label uitleg: onderhoudstests gebruiken die labels.',
    );
  });

  it('houdt backlog-health recovery artifactlabel-uitleg diagnostisch gelabeld', () => {
    expect(BACKLOG_HEALTH_RECOVERY_ARTIFACT_DOCS_HINT_TERMS).toEqual([
      { label: 'maintenance tests label usage', term: 'onderhoudstests gebruiken die labels' },
      { label: 'recovery fixes boundary', term: 'recoveryfixes' },
    ]);

    expectBacklogHealthRecoveryArtifactDocsHintLabels(
      BACKLOG_HEALTH_RECOVERY_ARTIFACT_DOCS_HINT_TERMS,
    );
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg label te generiek is', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: 'hint', term: 'onderhoudstests gebruiken die labels' },
      ]),
    ).toThrow('Backlog-health artifact docs hint label is te generiek: hint.');
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg term te kort is', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: 'maintenance tests label usage', term: 'labels' },
      ]),
    ).toThrow('Backlog-health artifact docs hint term is te kort: labels.');
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg term leeg is', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: 'maintenance tests label usage', term: '' },
      ]),
    ).toThrow('Backlog-health artifact docs hint term ontbreekt.');
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg term alleen whitespace bevat', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: 'maintenance tests label usage', term: '   ' },
      ]),
    ).toThrow('Backlog-health artifact docs hint term bevat alleen whitespace.');
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg label alleen whitespace bevat', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: '   ', term: 'onderhoudstests gebruiken die labels' },
      ]),
    ).toThrow('Backlog-health artifact docs hint label bevat alleen whitespace.');
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg label met padding te generiek blijft', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: '   hint   ', term: 'onderhoudstests gebruiken die labels' },
      ]),
    ).toThrow('Backlog-health artifact docs hint label is te generiek: hint.');
  });

  it('faalt duidelijk wanneer een backlog-health recovery artifactlabel-uitleg term met padding te kort blijft', () => {
    expect(() =>
      expectBacklogHealthRecoveryArtifactDocsHintLabels([
        { label: 'maintenance tests label usage', term: '   labels   ' },
      ]),
    ).toThrow('Backlog-health artifact docs hint term is te kort: labels.');
  });

  it('normaliseert backlog-health recovery artifactlabel-uitleg met raw en getrimde waarden', () => {
    expect(
      normalizeBacklogHealthArtifactDocsHint({
        label: '   maintenance tests label usage   ',
        term: '   onderhoudstests gebruiken die labels   ',
      }),
    ).toEqual({
      rawLabel: '   maintenance tests label usage   ',
      rawTerm: '   onderhoudstests gebruiken die labels   ',
      label: 'maintenance tests label usage',
      term: 'onderhoudstests gebruiken die labels',
    });
  });

  it('bouwt backlog-health recovery artifactlabel-uitleg fouten met stabiele prefix', () => {
    expect(
      buildBacklogHealthArtifactDocsHintError(
        BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS.missingLabel,
      ),
    ).toBe('Backlog-health artifact docs hint label ontbreekt.');
  });

  it('bouwt backlog-health recovery artifactlabel-uitleg fouten met dynamische waarden', () => {
    expect(buildBacklogHealthArtifactDocsHintError('label is te generiek: hint')).toBe(
      'Backlog-health artifact docs hint label is te generiek: hint.',
    );
  });

  it('bouwt backlog-health recovery artifactlabel-uitleg dynamische foutredenen', () => {
    expect(buildBacklogHealthArtifactDocsHintGenericLabelReason('hint')).toBe(
      'label is te generiek: hint',
    );
    expect(buildBacklogHealthArtifactDocsHintShortTermReason('labels')).toBe(
      'term is te kort: labels',
    );
  });

  it('houdt backlog-health recovery artifactlabel-uitleg foutredenen stabiel', () => {
    expect(BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS).toEqual({
      missingLabel: 'label ontbreekt',
      missingTerm: 'term ontbreekt',
      whitespaceLabel: 'label bevat alleen whitespace',
      whitespaceTerm: 'term bevat alleen whitespace',
    });
  });

  it('documenteert autonomy guardrail evidence per domein', () => {
    for (const requiredHeading of [
      '### Network Guardrail',
      '### AI Guardrail',
      '### Data Guardrail',
      '### GitHub Guardrail',
      '### Tailscale Guardrail',
      '### Medical Policy Guardrail',
      '### Sensitive Data Boundary',
    ]) {
      expect(autonomyGuardrailEvidenceChecklist).toContain(requiredHeading);
      expect(prTemplate).toContain(requiredHeading);
    }

    for (const requiredField of [
      'Impact:',
      'Evidence:',
      'Result:',
      'User data excluded:',
      'Secrets excluded:',
      'Runtime payloads excluded:',
    ]) {
      expect(autonomyGuardrailEvidenceChecklist).toContain(`- ${requiredField}`);
      expect(prTemplate).toContain(`- ${requiredField}`);
    }

    expect(autonomyGuardrailEvidenceChecklist).toContain('zonder gezondheidsdata');
    expect(autonomyGuardrailEvidenceChecklist).toContain('geen nieuwe netwerkroute');
    expect(autonomyGuardrailEvidenceChecklist).toContain('medische grens blijft ongewijzigd');
    expect(autonomyGuardrails).toContain('AUTONOMY_GUARDRAIL_EVIDENCE_CHECKLIST.md');
  });

  it('houdt de public repo privacy review compleet voor releasechecks', () => {
    for (const requiredTerm of [
      'Docs',
      'Fixtures',
      'Screenshots',
      'Env Files',
      'Generated Assets',
      'npm run secrets:check',
      'npm run fixtures:check',
      'npm run build && npm run assets:check',
    ]) {
      expect(publicRepoPrivacyReview).toContain(requiredTerm);
    }

    expect(publicRepoPrivacyReview).toMatch(/geen screenshots uit echte portals/i);
    expect(publicRepoPrivacyReview).toMatch(/Tailscale auth keys/i);
    expect(publicRepoPrivacyReview).toMatch(/alleen synthetische data/i);
    expect(contributing).toContain('docs/PUBLIC_REPO_PRIVACY_REVIEW.md');
    expect(prTemplate).toContain('docs/PUBLIC_REPO_PRIVACY_REVIEW.md');
  });

  it('documenteert externe asset allowlist-governance met rationale-eis', () => {
    for (const requiredTerm of [
      'npm run build && npm run assets:check',
      'geen netwerkverzoek',
      'scripts/check-no-external-assets.mjs',
      'tests/noExternalAssets.test.ts',
      'rationale',
      'http://www.w3.org/2000/svg',
    ]) {
      expect(externalAssetAllowlist).toContain(requiredTerm);
    }

    expect(externalAssetAllowlist).toMatch(/CDN's voor JavaScript, CSS, fonts of afbeeldingen/i);
    expect(externalAssetAllowlist).toMatch(/nieuw\s+architectuurbesluit/i);
  });

  it('bewaart de no-telemetry CSP violation workflow', () => {
    for (const requiredTerm of [
      'geen CSP reports naar een remote endpoint',
      'geen `report-uri`',
      'geen `report-to`',
      'npm run dev',
      'npm run build',
      'npm run smoke:offline',
      'npm run assets:check',
      'nieuwe ADR',
      'expliciete opt-in',
    ]) {
      expect(cspViolationWorkflow).toContain(requiredTerm);
    }

    expect(cspViolationWorkflow).toMatch(/lokale browserdiagnostiek/i);
    expect(cspViolationWorkflow).toMatch(/Kopieer geen volledige lokale URL's/i);
  });

  it('documenteert secrets-scan baseline en allowlistbeleid', () => {
    for (const requiredTerm of [
      'npm run secrets:check',
      'scripts/check-secrets.mjs',
      'tests/secretsScan.test.ts',
      'generic-sk-api-key',
      'anthropic-api-key',
      'tailscale-auth-key',
      'private-key-block',
      'exact-match',
      'concrete rationale',
    ]) {
      expect(secretsScanBaseline).toContain(requiredTerm);
    }

    expect(secretsScanBaseline).toMatch(/Verbreed geen directory-exclusions/i);
    expect(secretsScanBaseline).toMatch(/Plak geen\s+volledige tokens/i);
  });

  it('documenteert eventlogdetail privacy en allowlistgrenzen', () => {
    for (const requiredTerm of [
      'operationele metadata',
      'geen tweede dossier',
      '12 records en 3 metadata-items verwerkt',
      'health free text',
      'src/domain/eventLog.ts',
      'tests/eventLog.test.ts',
      'concrete rationale',
    ]) {
      expect(eventLogPrivacy).toContain(requiredTerm);
    }

    expect(eventLogPrivacy).toMatch(/namen, e-mailadressen, BSN/i);
    expect(eventLogPrivacy).toMatch(/context in het versleutelde domeinrecord/i);
  });
});

function extractBacklogSummary(): Record<string, number> {
  return {
    '☑': Number(backlog.match(/\| ☑ klaar \| (?<count>\d+) \|/)?.groups?.count),
    '◐': Number(backlog.match(/\| ◐ bezig \| (?<count>\d+) \|/)?.groups?.count),
    '☐': Number(backlog.match(/\| ☐ open \| (?<count>\d+) \|/)?.groups?.count),
  };
}

function countGoalStatuses(): Record<string, number> {
  const counts = { '☑': 0, '◐': 0, '☐': 0 };
  for (const goal of parseBacklogGoalRows()) {
    counts[goal.status] += 1;
  }
  return counts;
}

function parseBacklogGoalRows(): Array<{ id: string; status: '☑' | '◐' | '☐' }> {
  return backlog
    .split('\n')
    .map((line) => {
      const match = line.match(/^\| (?<id>G\d+) \|.*\| (?<status>☑|◐|☐) \|$/);
      return match?.groups
        ? { id: match.groups.id, status: match.groups.status as '☑' | '◐' | '☐' }
        : undefined;
    })
    .filter((goal): goal is { id: string; status: '☑' | '◐' | '☐' } => Boolean(goal));
}

function parseExecutionGoalSections(): Array<{ id: string; status: string; raw: string }> {
  return executionGoals
    .split('\n### ')
    .slice(1)
    .map((section) => {
      const raw = `### ${section}`;
      const id = raw.match(/^### (?<id>G\d+) — .+$/m)?.groups?.id;
      const status = raw.match(/^- \*\*Status:\*\* (?<status>[☑◐☐] .+)$/m)?.groups?.status;
      if (!id || !status) throw new Error(`Execution goal mist id of status: ${raw}`);
      return { id, status, raw };
    });
}

function extractCompletionAuditMarkerBlock(document: string): string {
  const match = document.match(
    /<!-- completion-audit:start -->(?<block>[\s\S]+?)<!-- completion-audit:end -->/,
  );
  if (!match?.groups?.block) throw new Error('Completion audit markerblok ontbreekt.');
  return match.groups.block;
}

function extractMarkdownSection(document: string, heading: string): string {
  const match = document.match(new RegExp(`## ${heading}\\n(?<section>[\\s\\S]*?)(\\n## |$)`));
  if (!match?.groups?.section) throw new Error(`Sectie ontbreekt: ${heading}`);
  return match.groups.section;
}

function extractMarkdownParagraphContaining(section: string, term: string): string {
  const paragraph = section.split(/\n\n+/).find((candidate) => candidate.includes(term));
  if (!paragraph) {
    throw new Error(
      `Paragraaf ontbreekt: ${term}. Herstel de recoveryparagraaf in Contract Coverage.`,
    );
  }
  return paragraph;
}

function normalizeMarkdownText(markdown: string): string {
  return markdown.replaceAll('`', '').replace(/\s+/g, ' ').trim();
}

function expectBacklogHealthRecoveryForbiddenArtifactLabels(recoveryParagraph: string): void {
  for (const forbiddenArtifact of BACKLOG_HEALTH_RECOVERY_FORBIDDEN_ARTIFACT_LABELS) {
    if (!recoveryParagraph.includes(forbiddenArtifact.term)) {
      throw new Error(
        `Backlog-health recoveryparagraaf mist forbidden artifact label: ${forbiddenArtifact.label}.`,
      );
    }
  }
}

function expectBacklogHealthRecoveryArtifactDocsHint(recoveryParagraph: string): void {
  for (const docsHint of BACKLOG_HEALTH_RECOVERY_ARTIFACT_DOCS_HINT_TERMS) {
    if (!recoveryParagraph.includes(docsHint.term)) {
      throw new Error(
        `Backlog-health recoveryparagraaf mist artifact-label uitleg: ${docsHint.term}.`,
      );
    }
  }
}

function expectBacklogHealthRecoveryArtifactDocsHintLabels(
  docsHints: ReadonlyArray<BacklogHealthArtifactDocsHint>,
): void {
  for (const docsHint of docsHints) {
    const normalizedDocsHint = normalizeBacklogHealthArtifactDocsHint(docsHint);

    if (normalizedDocsHint.rawLabel.length === 0) {
      throw new Error(
        buildBacklogHealthArtifactDocsHintError(
          BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS.missingLabel,
        ),
      );
    }
    if (normalizedDocsHint.rawTerm.length === 0) {
      throw new Error(
        buildBacklogHealthArtifactDocsHintError(
          BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS.missingTerm,
        ),
      );
    }
    if (normalizedDocsHint.label.length === 0) {
      throw new Error(
        buildBacklogHealthArtifactDocsHintError(
          BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS.whitespaceLabel,
        ),
      );
    }
    if (normalizedDocsHint.term.length === 0) {
      throw new Error(
        buildBacklogHealthArtifactDocsHintError(
          BACKLOG_HEALTH_ARTIFACT_DOCS_HINT_ERROR_REASONS.whitespaceTerm,
        ),
      );
    }
    if (normalizedDocsHint.label.length <= 8) {
      throw new Error(
        buildBacklogHealthArtifactDocsHintError(
          buildBacklogHealthArtifactDocsHintGenericLabelReason(normalizedDocsHint.label),
        ),
      );
    }
    if (normalizedDocsHint.term.length <= 8) {
      throw new Error(
        buildBacklogHealthArtifactDocsHintError(
          buildBacklogHealthArtifactDocsHintShortTermReason(normalizedDocsHint.term),
        ),
      );
    }
  }
}

function buildBacklogHealthArtifactDocsHintGenericLabelReason(
  label: string,
): BacklogHealthArtifactDocsHintDynamicErrorReason {
  return `label is te generiek: ${label}`;
}

function buildBacklogHealthArtifactDocsHintShortTermReason(
  term: string,
): BacklogHealthArtifactDocsHintDynamicErrorReason {
  return `term is te kort: ${term}`;
}

function buildBacklogHealthArtifactDocsHintError(
  reason: BacklogHealthArtifactDocsHintErrorReason,
): string {
  return `Backlog-health artifact docs hint ${reason}.`;
}

function normalizeBacklogHealthArtifactDocsHint(
  docsHint: BacklogHealthArtifactDocsHint,
): NormalizedBacklogHealthArtifactDocsHint {
  return {
    rawLabel: docsHint.label,
    rawTerm: docsHint.term,
    label: docsHint.label.trim(),
    term: docsHint.term.trim(),
  };
}

function extractAdrReviewEvidenceIndexGoals(): string[] {
  return adrReviewEvidenceIndex
    .split('\n')
    .map((line) => line.match(/^\| (?<id>G\d+) \|/)?.groups?.id)
    .filter((id): id is string => Boolean(id))
    .sort();
}

function extractExecutionGoalAdrMarkers(): Array<{ id: string; value: string }> {
  return executionGoals
    .split('\n### ')
    .slice(1)
    .map((section) => {
      const id = section.match(/^(G\d+)/)?.[1];
      const value = section.match(/^- \*\*ADR Needed:\*\* (yes|no)$/m)?.[1];
      if (!id || !value) throw new Error(`ADR Needed marker ontbreekt in ${id ?? section}`);
      return { id, value };
    });
}

type BacklogHealthJsonExample = {
  issueSnapshot?: {
    duplicateIssues?: Array<{ issues?: Array<Record<string, unknown>> }>;
    missingIssueLinks?: unknown[];
    nonOpenIssueLinks?: Array<{ issue?: Record<string, unknown> }>;
    completedGoalOpenIssues?: Array<{ issue?: Record<string, unknown> }>;
  };
};

function extractBacklogHealthJsonExample(): {
  example: BacklogHealthJsonExample;
  exampleJson: string;
} {
  const exampleMatch = backlogHealthJsonReference.match(
    /## Example Fixture[\s\S]*?```json\n(?<json>[\s\S]*?)\n```/,
  );
  const exampleJson = exampleMatch?.groups?.json;

  if (!exampleJson) throw new Error('Backlog-health JSON example fixture ontbreekt.');

  return {
    example: JSON.parse(exampleJson) as BacklogHealthJsonExample,
    exampleJson,
  };
}

function extractBacklogHealthReferenceGroups(): string[] {
  return Array.from(
    backlogHealthJsonReference.matchAll(/`issueSnapshot\.(?<field>[A-Za-z]+)`/g),
    (match) => match.groups?.field,
  )
    .filter((field): field is string => Boolean(field))
    .sort();
}

function extractBacklogHealthContractMatrixGroups(source = backlogHealthTest): string[] {
  const matrixTest = source.match(
    /\/\/ backlog-health-json-contract-matrix:start(?<groups>[\s\S]+?)\/\/ backlog-health-json-contract-matrix:end/,
  )?.groups?.groups;

  if (!matrixTest) {
    throw new Error(BACKLOG_HEALTH_CONTRACT_MATRIX_MISSING_ERROR);
  }

  return Array.from(matrixTest.matchAll(/'(?<group>[A-Za-z]+)'/g), (match) => match.groups?.group)
    .filter((group): group is string => Boolean(group))
    .sort();
}

function extractBacklogHealthExampleIssueKeys(example: BacklogHealthJsonExample): string[] {
  const issueObjects = [
    ...(example.issueSnapshot?.duplicateIssues?.flatMap((group) => group.issues ?? []) ?? []),
    ...(example.issueSnapshot?.nonOpenIssueLinks?.map((entry) => entry.issue).filter(Boolean) ??
      []),
    ...(example.issueSnapshot?.completedGoalOpenIssues
      ?.map((entry) => entry.issue)
      .filter(Boolean) ?? []),
  ];
  return [...new Set(issueObjects.flatMap((issue) => Object.keys(issue ?? {})))].sort();
}
