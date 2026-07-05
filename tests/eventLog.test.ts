import { describe, expect, it, vi } from 'vitest';
import {
  EVENT_LOG_ALLOWED_DETAIL_EXAMPLES,
  isEventLogDetailPrivacySafe,
  maakEventLog,
  maakImportRetryEventLogDetail,
  sorteerEventLogs,
  validateEventLogDetailAllowlist,
} from '../src/domain/eventLog';

describe('eventLog', () => {
  it('maakt een lokale logregel met getrimde velden en standaarddatum', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-23T15:00:00.000Z'));

    const event = maakEventLog('event-1', {
      categorie: 'kluis',
      gebeurtenis: '  Kluis ontgrendeld  ',
      detail: '  Alleen lokaal  ',
    });

    expect(event).toEqual({
      id: 'event-1',
      datum: '2026-06-23T15:00:00.000Z',
      categorie: 'kluis',
      gebeurtenis: 'Kluis ontgrendeld',
      detail: 'Alleen lokaal',
    });

    vi.useRealTimers();
  });

  it('valideert verplichte datum en gebeurtenis', () => {
    expect(() =>
      maakEventLog('event-1', {
        datum: '',
        categorie: 'systeem',
        gebeurtenis: 'Start',
      }),
    ).toThrow('Datum is verplicht');
    expect(() =>
      maakEventLog('event-1', {
        datum: '2026-06-23T15:00:00.000Z',
        categorie: 'systeem',
        gebeurtenis: '   ',
      }),
    ).toThrow('Gebeurtenis is verplicht');
  });

  it('sorteert logregels aflopend op datum en daarna op gebeurtenis', () => {
    expect(
      sorteerEventLogs([
        {
          id: 'event-1',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'backup',
          gebeurtenis: 'B',
        },
        {
          id: 'event-2',
          datum: '2026-06-24T08:00:00.000Z',
          categorie: 'kluis',
          gebeurtenis: 'A',
        },
        {
          id: 'event-3',
          datum: '2026-06-23T15:00:00.000Z',
          categorie: 'systeem',
          gebeurtenis: 'A',
        },
      ]).map((event) => event.id),
    ).toEqual(['event-2', 'event-3', 'event-1']);
  });

  it('houdt high-risk eventlogdetails generiek voor backup, AI, notificaties en import', () => {
    const safeEvents = [
      {
        categorie: 'backup' as const,
        gebeurtenis: 'Versleutelde back-up klaargezet',
        detail: 'Back-upbestand is lokaal als download aangeboden.',
      },
      {
        categorie: 'ai' as const,
        gebeurtenis: 'AI-samenvatting lokaal bewaard',
        detail: 'Conceptkennis lokaal opgeslagen zonder brontekst.',
      },
      {
        categorie: 'systeem' as const,
        gebeurtenis: 'Notificatieprivacy gewijzigd',
        detail: 'Generieke meldingen blijven standaard.',
      },
      {
        categorie: 'backup' as const,
        gebeurtenis: 'Versleutelde back-up geïmporteerd',
        detail: '12 records en 3 metadata-items verwerkt.',
      },
    ];

    for (const event of safeEvents) {
      expect(isEventLogDetailPrivacySafe(event)).toBe(true);
      expect(() => maakEventLog('event-safe', event)).not.toThrow();
    }
  });

  it('bewaakt importretry-eventlogcopy als technische status plus veilige record-id', () => {
    const detail = maakImportRetryEventLogDetail({
      recordId: 'doc_retry_20260705',
      status: 'opnieuw_klaargezet',
    });

    expect(detail).toBe('Importretry record-id doc_retry_20260705; status opnieuw_klaargezet.');
    expect(
      isEventLogDetailPrivacySafe({
        categorie: 'systeem',
        gebeurtenis: 'Dossierimport retry',
        detail,
      }),
    ).toBe(true);
    expect(() =>
      maakEventLog('event-import-retry', {
        categorie: 'systeem',
        gebeurtenis: 'Dossierimport retry',
        detail,
      }),
    ).not.toThrow();
    expect(detail).not.toMatch(
      /retry-private-rapport\.pdf|OCR_RAW|BASE64|data:application|cHJpdmF0ZS1wYXlsb2Fk|diagnose|dosering|behandelkeuzeadvies|secret|token|gezondheidsdata/i,
    );
  });

  it('redigeert importretry-record-id wanneer die op broninformatie lijkt', () => {
    const detail = maakImportRetryEventLogDetail({
      recordId: 'retry-private-rapport.pdf',
      status: 'niet_ondersteund',
    });

    expect(detail).toBe('Importretry record-id record-id-redacted; status niet_ondersteund.');
    expect(detail).not.toContain('retry-private-rapport.pdf');
    expect(
      isEventLogDetailPrivacySafe({
        categorie: 'systeem',
        gebeurtenis: 'Dossierimport retry',
        detail,
      }),
    ).toBe(true);
  });

  it('vereist rationale voor eventlogdetail-allowlist entries', () => {
    expect(validateEventLogDetailAllowlist(EVENT_LOG_ALLOWED_DETAIL_EXAMPLES)).toEqual([]);
    expect(EVENT_LOG_ALLOWED_DETAIL_EXAMPLES.map((entry) => entry.value)).toEqual([
      'Back-upbestand is lokaal als download aangeboden.',
      'Conceptkennis lokaal opgeslagen zonder brontekst.',
      'Generieke meldingen blijven standaard.',
      '12 records en 3 metadata-items verwerkt.',
    ]);
    expect(
      validateEventLogDetailAllowlist([
        {
          value: '18 records verwerkt.',
          reason: '',
        },
      ]),
    ).toEqual(['Allowlist-entry 18 records verwerkt. mist een concrete rationale.']);
    expect(
      validateEventLogDetailAllowlist([
        {
          value: 'Medicatie: Progesteron om 20:00.',
          reason: 'Dit mag niet omdat eventlogs geen health free text mogen bewaren.',
        },
      ]),
    ).toEqual(['Allowlist-entry Medicatie: Progesteron om 20:00. bevat gevoelige vrije tekst.']);
  });

  it('weigert gevoelige vrije tekst in high-risk eventlogdetails', () => {
    const unsafeEvents = [
      {
        categorie: 'backup' as const,
        gebeurtenis: 'Versleutelde back-up klaargezet',
        detail: 'Bestand voor Naam: Testpersoon A is geëxporteerd.',
      },
      {
        categorie: 'ai' as const,
        gebeurtenis: 'AI-preview gemaakt',
        detail: 'Prompt bevat E-mail: testpersoon@example.test.',
      },
      {
        categorie: 'systeem' as const,
        gebeurtenis: 'Notificatie verstuurd',
        detail: 'Medicatie: Progesteron om 20:00.',
      },
      {
        categorie: 'backup' as const,
        gebeurtenis: 'Versleutelde back-up geïmporteerd',
        detail: 'Dossiernummer: TEST-0001 verwerkt.',
      },
      {
        categorie: 'systeem' as const,
        gebeurtenis: 'Dossierimport retry',
        detail: 'Importretry record-id doc-1; bestand retry-private-rapport.pdf.',
      },
      {
        categorie: 'systeem' as const,
        gebeurtenis: 'Dossierimport retry',
        detail: 'Importretry record-id doc-1; OCR_RAW BASE64 payload cHJpdmF0ZS1wYXlsb2Fk.',
      },
      {
        categorie: 'systeem' as const,
        gebeurtenis: 'Dossierimport retry',
        detail: 'Importretry record-id doc-1; diagnose en dosering in behandelkeuzeadvies.',
      },
    ];

    for (const event of unsafeEvents) {
      expect(isEventLogDetailPrivacySafe(event)).toBe(false);
      expect(() => maakEventLog('event-unsafe', event)).toThrow('gevoelige vrije tekst');
    }
  });
});
