import { describe, expect, it } from 'vitest';
import {
  berekenKostenOverzicht,
  maakCostItem,
  sorteerCostItems,
  VERPLICHT_EIGEN_RISICO_2026,
} from '../src/domain/kosten';

describe('kosten domeinregels', () => {
  it('maakt een kostenpost met categorie en vergoedstatus', () => {
    const item = maakCostItem('cost-1', {
      omschrijving: ' Medicatie apotheek ',
      bedrag: 12.345,
      datum: '2026-06-23',
      categorie: 'medicatie',
      vergoed: 'eigen_risico',
      trajectId: 'traject-1',
    });

    expect(item).toEqual({
      id: 'cost-1',
      omschrijving: 'Medicatie apotheek',
      bedrag: 12.35,
      datum: '2026-06-23',
      categorie: 'medicatie',
      vergoed: 'eigen_risico',
      trajectId: 'traject-1',
    });
  });

  it('sorteert kostenposten met nieuwste datum eerst', () => {
    const oud = maakCostItem('oud', {
      omschrijving: 'Oud',
      bedrag: 10,
      datum: '2026-06-20',
      categorie: 'overig',
      vergoed: 'onbekend',
    });
    const nieuw = maakCostItem('nieuw', {
      omschrijving: 'Nieuw',
      bedrag: 20,
      datum: '2026-06-23',
      categorie: 'reis',
      vergoed: 'nee',
    });

    expect(sorteerCostItems([oud, nieuw]).map((item) => item.id)).toEqual(['nieuw', 'oud']);
  });

  it('berekent totaal, vergoed, eigen bijdrage en onbekend', () => {
    const items = [
      maakCostItem('vergoed', {
        omschrijving: 'Vergoed',
        bedrag: 100,
        datum: '2026-06-23',
        categorie: 'behandeling',
        vergoed: 'ja',
      }),
      maakCostItem('zelf', {
        omschrijving: 'Zelf',
        bedrag: 25,
        datum: '2026-06-23',
        categorie: 'reis',
        vergoed: 'nee',
      }),
      maakCostItem('eigen-risico', {
        omschrijving: 'Eigen risico',
        bedrag: 50,
        datum: '2026-06-23',
        categorie: 'medicatie',
        vergoed: 'eigen_risico',
      }),
      maakCostItem('onbekend', {
        omschrijving: 'Onbekend',
        bedrag: 10,
        datum: '2026-06-23',
        categorie: 'overig',
        vergoed: 'onbekend',
      }),
    ];

    expect(berekenKostenOverzicht(items)).toEqual({
      totaal: 185,
      vergoed: 100,
      eigenBijdrage: 75,
      onbekend: 10,
      eigenRisicoGebruikt: 50,
      eigenRisicoResterend: 335,
      eigenRisicoBovenGrens: 0,
    });
  });

  it('telt eigen-risicoposten tot de 2026-grens en toont overschrijding apart', () => {
    const items = [
      maakCostItem('eigen-risico-1', {
        omschrijving: 'Medicatie eigen risico',
        bedrag: 300,
        datum: '2026-06-23',
        categorie: 'medicatie',
        vergoed: 'eigen_risico',
      }),
      maakCostItem('eigen-risico-2', {
        omschrijving: 'Behandeling eigen risico',
        bedrag: 120,
        datum: '2026-06-24',
        categorie: 'behandeling',
        vergoed: 'eigen_risico',
      }),
    ];

    expect(berekenKostenOverzicht(items)).toMatchObject({
      eigenRisicoGebruikt: VERPLICHT_EIGEN_RISICO_2026,
      eigenRisicoResterend: 0,
      eigenRisicoBovenGrens: 35,
    });
  });
});
