import { describe, expect, it } from 'vitest';
import {
  beschrijfMedicatieDosis,
  doseLogIsGemist,
  doseLogsVoorDag,
  genereerDoseLogs,
  maakMedicatie,
  markeerDoseLogGenomen,
} from '../src/domain/medicatie';

describe('medicatie domeinregels', () => {
  it('bewaart voorgeschreven dosis alleen als tekst zoals ingevoerd', () => {
    const medicatie = maakMedicatie('med-1', {
      naam: '  Follikelstimulatie  ',
      vorm: 'injectie',
      voorgeschrevenDosis: '  volgens kliniek: 150 IE  ',
      instructie: '  avond  ',
      actief: true,
    });

    expect(medicatie).toEqual({
      id: 'med-1',
      naam: 'Follikelstimulatie',
      vorm: 'injectie',
      voorgeschrevenDosis: 'volgens kliniek: 150 IE',
      instructie: 'avond',
      actief: true,
    });
    expect(beschrijfMedicatieDosis(medicatie)).toBe('volgens kliniek: 150 IE');
  });

  it('genereert DoseLogs per dag vanuit expliciete planning zonder dosis te berekenen', () => {
    let counter = 0;
    const logs = genereerDoseLogs(
      () => {
        counter += 1;
        return `dose-${counter}`;
      },
      {
        medicatieId: 'med-1',
        startDatum: '2026-06-23',
        aantalDagen: 3,
        tijdstip: '20:00',
      },
    );

    expect(logs).toEqual([
      { id: 'dose-1', medicatieId: 'med-1', geplandOp: '2026-06-23T20:00', status: 'gepland' },
      { id: 'dose-2', medicatieId: 'med-1', geplandOp: '2026-06-24T20:00', status: 'gepland' },
      { id: 'dose-3', medicatieId: 'med-1', geplandOp: '2026-06-25T20:00', status: 'gepland' },
    ]);
    expect(JSON.stringify(logs)).not.toContain('150');
  });

  it('markeert innames en gemiste geplande logs', () => {
    const gepland = {
      id: 'dose-1',
      medicatieId: 'med-1',
      geplandOp: '2026-06-23T20:00',
      status: 'gepland' as const,
    };

    expect(doseLogIsGemist(gepland, '2026-06-24T08:00')).toBe(true);
    expect(
      doseLogIsGemist(
        markeerDoseLogGenomen(gepland, '2026-06-23T20:05', 'genomen', ' linkerbeen '),
        '2026-06-24T08:00',
      ),
    ).toBe(false);
    expect(
      markeerDoseLogGenomen(gepland, '2026-06-23T20:05', 'genomen', ' linkerbeen '),
    ).toMatchObject({
      notitie: 'linkerbeen',
    });
  });

  it('maakt een dagoverzicht in tijdvolgorde', () => {
    const logs = [
      { id: '2', medicatieId: 'med-1', geplandOp: '2026-06-23T20:00', status: 'gepland' as const },
      { id: '1', medicatieId: 'med-1', geplandOp: '2026-06-23T08:00', status: 'gepland' as const },
      { id: '3', medicatieId: 'med-1', geplandOp: '2026-06-24T08:00', status: 'gepland' as const },
    ];

    expect(doseLogsVoorDag(logs, '2026-06-23').map((log) => log.id)).toEqual(['1', '2']);
  });
});
