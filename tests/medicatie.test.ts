import { describe, expect, it } from 'vitest';
import {
  beschrijfMedicatieDosis,
  beschrijfMedicatieVoorraad,
  doseLogIsGemist,
  doseLogsVoorDag,
  genereerDoseLogs,
  maakMedicatie,
  markeerDoseLogGenomen,
  parseMedicatieSchemaImport,
} from '../src/domain/medicatie';

describe('medicatie domeinregels', () => {
  it('bewaart voorgeschreven dosis alleen als tekst zoals ingevoerd', () => {
    const medicatie = maakMedicatie('med-1', {
      naam: '  Follikelstimulatie  ',
      vorm: 'injectie',
      voorgeschrevenDosis: '  volgens kliniek: 150 IE  ',
      instructie: '  avond  ',
      actief: true,
      voorraadAantal: 4.8,
    });

    expect(medicatie).toEqual({
      id: 'med-1',
      naam: 'Follikelstimulatie',
      vorm: 'injectie',
      voorgeschrevenDosis: 'volgens kliniek: 150 IE',
      instructie: 'avond',
      actief: true,
      voorraadAantal: 4,
    });
    expect(beschrijfMedicatieDosis(medicatie)).toBe('volgens kliniek: 150 IE');
    expect(beschrijfMedicatieVoorraad(medicatie)).toBe('4 doses over');
    expect(
      beschrijfMedicatieVoorraad(
        maakMedicatie('med-2', { naam: 'Progesteron', vorm: 'zetpil', actief: true }),
      ),
    ).toBe('Voorraad niet ingevuld.');
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

  it('parset een handmatig klinieklijstje zonder dosering af te leiden', () => {
    expect(
      parseMedicatieSchemaImport('Progesteron | 2026-06-23 | 08:00\nInjectie | 2026-06-23 | 20:00'),
    ).toEqual([
      { naam: 'Progesteron', datum: '2026-06-23', tijdstip: '08:00' },
      { naam: 'Injectie', datum: '2026-06-23', tijdstip: '20:00' },
    ]);
  });

  it('weigert ongeldige importregels', () => {
    expect(() => parseMedicatieSchemaImport('Progesteron | 2026-06-23')).toThrow('Regel 1');
    expect(() => parseMedicatieSchemaImport('Progesteron | 2026-06-23 | 99:00')).toThrow(
      'tijdstip',
    );
  });
});
