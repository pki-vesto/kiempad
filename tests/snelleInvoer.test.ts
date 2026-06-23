import { describe, expect, it } from 'vitest';
import {
  maakSnelleAfspraak,
  maakSnelleMedicatie,
  maakSnelleVraag,
} from '../src/domain/snelleInvoer';

describe('snelle invoer', () => {
  it('maakt een afspraak met alleen titel en veilige defaults', () => {
    expect(maakSnelleAfspraak(' Echo ', new Date('2026-06-23T12:30:00Z'))).toEqual({
      titel: 'Echo',
      datumTijd: '2026-06-23T12:30',
      type: 'overig',
    });
  });

  it('maakt medicatie zonder schema of berekende dosering', () => {
    expect(maakSnelleMedicatie(' Progesteron ')).toEqual({
      naam: 'Progesteron',
      vorm: 'overig',
      actief: true,
      schemaAantalDagen: 0,
    });
  });

  it('maakt een openstaande vraag met alleen vraagtekst', () => {
    expect(maakSnelleVraag(' Wat nemen we mee? ')).toEqual({
      vraag: 'Wat nemen we mee?',
      beantwoord: false,
    });
  });
});
