import { describe, expect, it } from 'vitest';
import { maakConsultVerslag, sorteerConsultVerslagen } from '../src/domain/consultVerslag';

describe('consultVerslag', () => {
  it('maakt een apart consultverslag uit tekst of uploadmetadata', () => {
    const verslag = maakConsultVerslag('consult-1', {
      datum: '2026-06-12',
      titel: 'Evaluatie na punctie',
      tekst: 'Besproken wat de volgende stap wordt.',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
      uploadedAt: '2026-06-12T10:00:00.000Z',
    });

    expect(verslag).toMatchObject({
      id: 'consult-1',
      bron: 'handmatig',
      titel: 'Evaluatie na punctie',
      tekst: 'Besproken wat de volgende stap wordt.',
      afspraakId: 'afspraak-1',
      trajectId: 'traject-1',
    });
  });

  it('vereist inhoud zonder medisch advies te genereren', () => {
    expect(() =>
      maakConsultVerslag('consult-1', {
        datum: '2026-06-12',
        titel: 'Leeg consult',
      }),
    ).toThrow('Voeg tekst of een bestand toe');
  });

  it('sorteert nieuwste consulten bovenaan', () => {
    const oudste = maakConsultVerslag('consult-1', {
      datum: '2026-05-01',
      tekst: 'Oud consult',
      uploadedAt: '2026-05-01T10:00:00.000Z',
    });
    const nieuwste = maakConsultVerslag('consult-2', {
      datum: '2026-06-01',
      tekst: 'Nieuw consult',
      uploadedAt: '2026-06-01T10:00:00.000Z',
    });

    expect(sorteerConsultVerslagen([oudste, nieuwste])).toEqual([nieuwste, oudste]);
  });
});
