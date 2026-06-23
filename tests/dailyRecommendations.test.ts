import { describe, expect, it } from 'vitest';
import { bouwDagelijksAanbevelingsoverzicht } from '../src/domain/dailyRecommendations';
import type { DossierDocument } from '../src/domain/types';

describe('dagelijkse aanbevelingen', () => {
  it('maakt een dagoverzicht met scheiding vrouw, man en samen zonder medisch advies', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Echo controle',
          datumTijd: '2026-06-24T09:30',
          type: 'echo',
        },
      ],
      medicatie: [
        {
          medicatie: {
            id: 'med-1',
            naam: 'Progesteron',
            vorm: 'tablet',
            actief: true,
          },
          doseLogs: [
            {
              id: 'dose-1',
              medicatieId: 'med-1',
              geplandOp: '2026-06-24T08:00',
              status: 'gepland',
            },
          ],
        },
      ],
      vragen: [
        {
          id: 'vraag-1',
          vraag: 'Wanneer horen we de uitslag?',
          beantwoord: false,
        },
      ],
    });

    expect(Object.keys(overzicht)).toEqual(['vrouw', 'man', 'samen']);
    expect(overzicht.vrouw[0]).toMatchObject({
      owner: 'vrouw',
      titel: 'Medicatieschema controleren',
      bron: 'Medicatieplanning vandaag',
    });
    expect(overzicht.man[0]).toMatchObject({
      owner: 'man',
      titel: 'Eigen aandachtspunten vastleggen',
    });
    expect(overzicht.samen.map((item) => item.titel)).toEqual([
      'Voeding en supplementen checklijst',
      'Volgende afspraak voorbereiden',
      'Open vragen ordenen',
    ]);
    expect(overzicht.samen[0]?.checklist).toEqual([
      {
        label: 'Voeding: noteer feitelijke vragen of observaties voor het consult.',
        bron: 'Lokale leefstijlcontext',
        disclaimer: 'Geen voedingsadvies; bespreek persoonlijke keuzes met behandelaars.',
      },
      {
        label:
          'Supplementen: controleer alleen wat al met kliniek, arts of apotheek is afgesproken.',
        bron: 'Medicatie- en dossiercontext',
        disclaimer: 'Kiempad adviseert geen supplement en geen hoeveelheid.',
      },
    ]);
    const titelEnDetail = Object.values(overzicht)
      .flat()
      .map((item) => `${item.titel} ${item.detail}`)
      .join(' ');
    expect(titelEnDetail).not.toMatch(/\bdosering|diagnose|behandelkeuze\b/i);
    expect(overzicht.samen.every((item) => item.waarschuwing.includes('geen diagnose'))).toBe(true);
  });

  it('baseert leefstijlaanbevelingen op dossier, cyclusfase en behandelgeschiedenis', () => {
    const overzicht = bouwDagelijksAanbevelingsoverzicht({
      datum: '2026-06-24',
      afspraken: [],
      medicatie: [],
      vragen: [],
      trajecten: [
        {
          traject: {
            id: 'traject-1',
            naam: 'Poging 1',
            type: 'icsi',
            startDatum: '2026-06-20',
            status: 'lopend',
            pogingNummer: 1,
          },
          fasen: [
            {
              id: 'fase-1',
              trajectId: 'traject-1',
              fase: 'stimulatie',
              startDatum: '2026-06-22',
            },
          ],
        },
      ],
      cycleData: [{ id: 'cyclus-1', datum: '2026-06-24', meting: 'cyclusdag', waarde: 7 }],
      dossierDocuments: [
        {
          id: 'doc-1',
          datum: '2026-06-23',
          titel: 'Labuitslag',
        } as DossierDocument,
      ],
    });

    expect(overzicht.vrouw[0]).toMatchObject({
      id: 'vrouw-leefstijl-context',
      titel: 'Leefstijlcontext nalopen',
      bron: 'Dossier, cyclusfase en behandelgeschiedenis',
    });
    expect(overzicht.vrouw[0]?.detail).toContain('cyclusfase Stimulatie');
    expect(overzicht.vrouw[0]?.detail).toContain('laatste cyclusmeting cyclusdag op 2026-06-24');
    expect(overzicht.vrouw[0]?.detail).toContain('recent dossierdocument Labuitslag op 2026-06-23');
    expect(overzicht.vrouw[0]?.detail).not.toMatch(/\bdosering|diagnose|behandelkeuze\b/i);
  });
});
