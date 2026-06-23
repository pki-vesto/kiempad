import { describe, expect, it } from 'vitest';
import {
  archiveerTraject,
  bepaalHuidigeFase,
  bepaalVolgendeStap,
  berekenTrajectOverzicht,
  berekenVergoedePogingenTeller,
  maakInitiëleFasen,
  maakTraject,
  markeerHuidigeFase,
  sorteerFasen,
  TRAJECT_FASE_VOLGORDE,
} from '../src/domain/traject';

describe('traject en fasen', () => {
  it('maakt een traject en vaste fasen in canonieke volgorde', () => {
    const traject = maakTraject('traject-1', {
      naam: '  Poging 1  ',
      type: 'icsi',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
      teltMeeVoorVergoeding: true,
      notitie: '  kliniekprotocol volgen  ',
    });
    const fasen = maakInitiëleFasen(traject.id);

    expect(traject).toEqual({
      id: 'traject-1',
      naam: 'Poging 1',
      type: 'icsi',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
      teltMeeVoorVergoeding: true,
      gearchiveerd: false,
      notitie: 'kliniekprotocol volgen',
    });
    expect(fasen.map((fase) => fase.fase)).toEqual(TRAJECT_FASE_VOLGORDE);
    expect(fasen.every((fase) => fase.trajectId === traject.id)).toBe(true);
  });

  it('sorteert fasen altijd in vaste volgorde', () => {
    const fasen = maakInitiëleFasen('traject-1');
    const omgekeerd = [...fasen].reverse();

    expect(sorteerFasen(omgekeerd).map((fase) => fase.fase)).toEqual(TRAJECT_FASE_VOLGORDE);
  });

  it('markeert precies een huidige fase en sluit de vorige open fase', () => {
    const fasen = maakInitiëleFasen('traject-1');
    const metStimulatie = markeerHuidigeFase(fasen, 'stimulatie', '2026-06-23');
    const metPunctie = markeerHuidigeFase(metStimulatie, 'punctie', '2026-06-30');

    expect(bepaalHuidigeFase(metStimulatie)?.fase).toBe('stimulatie');
    expect(bepaalHuidigeFase(metPunctie)?.fase).toBe('punctie');
    expect(metPunctie.find((fase) => fase.fase === 'stimulatie')?.eindDatum).toBe('2026-06-30');
  });

  it('geeft een startscherm-volgende-stap zonder medische voorspelling', () => {
    expect(bepaalVolgendeStap()).toContain('Maak een traject aan');

    const traject = maakTraject('traject-1', {
      naam: 'Poging 1',
      type: 'ivf',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
    });
    const fasen = markeerHuidigeFase(maakInitiëleFasen(traject.id), 'wachttijd', '2026-07-01');

    expect(bepaalVolgendeStap({ traject, fasen })).toBe('Poging 1: huidige fase is Wachttijd.');
  });

  it('telt alleen expliciet meetellende pogingen voor vergoeding', () => {
    const trajecten = [
      {
        traject: maakTraject('traject-1', {
          naam: 'Poging 1',
          type: 'icsi',
          startDatum: '2026-06-23',
          status: 'afgerond',
          pogingNummer: 1,
          teltMeeVoorVergoeding: true,
        }),
        fasen: [],
      },
      {
        traject: maakTraject('traject-2', {
          naam: 'Poging 2',
          type: 'icsi',
          startDatum: '2026-07-23',
          status: 'lopend',
          pogingNummer: 2,
          teltMeeVoorVergoeding: false,
        }),
        fasen: [],
      },
    ];

    expect(berekenVergoedePogingenTeller(trajecten)).toEqual({
      meetellend: 1,
      resterend: 2,
      maximum: 3,
    });
  });

  it('archiveert een traject zonder vergoedingstelling of inhoud te wijzigen', () => {
    const traject = maakTraject('traject-1', {
      naam: 'Poging 1',
      type: 'icsi',
      startDatum: '2026-06-23',
      status: 'afgerond',
      pogingNummer: 1,
      teltMeeVoorVergoeding: true,
      notitie: 'Bewaren voor later.',
    });

    expect(archiveerTraject(traject, true)).toMatchObject({
      id: 'traject-1',
      gearchiveerd: true,
      teltMeeVoorVergoeding: true,
      notitie: 'Bewaren voor later.',
    });
    expect(archiveerTraject(traject, false).gearchiveerd).toBe(false);
  });

  it('maakt een compact overzicht over meerdere cycli', () => {
    const trajecten = [
      {
        traject: maakTraject('traject-1', {
          naam: 'Poging 1',
          type: 'ivf',
          startDatum: '2026-04-01',
          status: 'afgerond',
          pogingNummer: 1,
          teltMeeVoorVergoeding: true,
          gearchiveerd: true,
        }),
        fasen: [],
      },
      {
        traject: maakTraject('traject-2', {
          naam: 'Poging 2',
          type: 'icsi',
          startDatum: '2026-06-01',
          status: 'lopend',
          pogingNummer: 2,
        }),
        fasen: [],
      },
    ];

    expect(berekenTrajectOverzicht(trajecten)).toMatchObject({
      totaal: 2,
      actief: 1,
      gearchiveerd: 1,
      meetellendVoorVergoeding: 1,
      eersteStartDatum: '2026-04-01',
      laatsteStartDatum: '2026-06-01',
      perStatus: {
        afgerond: 1,
        lopend: 1,
      },
      perType: {
        ivf: 1,
        icsi: 1,
      },
    });
  });
});
