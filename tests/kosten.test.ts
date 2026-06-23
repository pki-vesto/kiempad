import { describe, expect, it } from 'vitest';
import { maakCostItem, sorteerCostItems } from '../src/domain/kosten';

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
});
