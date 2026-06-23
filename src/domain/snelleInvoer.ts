import type { Afspraak, Medicatie, Vraag } from './types';

export function maakSnelleAfspraak(
  titel: string,
  datum = new Date(),
): Pick<Afspraak, 'titel' | 'datumTijd' | 'type'> {
  return {
    titel: titel.trim(),
    datumTijd: datum.toISOString().slice(0, 16),
    type: 'overig',
  };
}

export function maakSnelleMedicatie(naam: string): Pick<Medicatie, 'naam' | 'vorm' | 'actief'> & {
  schemaAantalDagen: number;
} {
  return {
    naam: naam.trim(),
    vorm: 'overig',
    actief: true,
    schemaAantalDagen: 0,
  };
}

export function maakSnelleVraag(vraag: string): Pick<Vraag, 'vraag' | 'beantwoord'> {
  return {
    vraag: vraag.trim(),
    beantwoord: false,
  };
}
