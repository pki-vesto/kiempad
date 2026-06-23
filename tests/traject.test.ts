import { describe, expect, it } from 'vitest';
import {
  TRAJECT_FASE_VOLGORDE,
  bepaalHuidigeFase,
  bepaalVolgendeStap,
  maakInitiëleFasen,
  maakTraject,
  markeerHuidigeFase,
  sorteerFasen,
} from '../src/domain/traject';

describe('traject en fasen', () => {
  it('maakt een traject en vaste fasen in canonieke volgorde', () => {
    const traject = maakTraject('traject-1', {
      naam: '  Poging 1  ',
      type: 'icsi',
      startDatum: '2026-06-23',
      status: 'lopend',
      pogingNummer: 1,
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

    expect(bepaalVolgendeStap({ traject, fasen })).toBe(
      'Poging 1: huidige fase is Wachttijd.',
    );
  });
});
