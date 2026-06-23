import { describe, expect, it } from 'vitest';
import {
  EIGEN_RISICO_2026,
  pogingTeltVoorVergoeding,
  resterendeVergoedePogingen,
  VERGOEDE_POGINGEN_PER_ZWANGERSCHAP,
  VERGOEDING_BRONNEN_2026,
  VERGOEDING_LAATST_GEVERIFIEERD_OP,
} from '../src/domain/vergoeding';

describe('vergoeding', () => {
  it('telt een poging pas mee na een geslaagde punctie', () => {
    expect(pogingTeltVoorVergoeding(true)).toBe(true);
    expect(pogingTeltVoorVergoeding(false)).toBe(false);
  });

  it('rekent resterende vergoede pogingen correct', () => {
    expect(resterendeVergoedePogingen(0)).toBe(VERGOEDE_POGINGEN_PER_ZWANGERSCHAP);
    expect(resterendeVergoedePogingen(2)).toBe(1);
    expect(resterendeVergoedePogingen(3)).toBe(0);
    // Kan nooit negatief worden.
    expect(resterendeVergoedePogingen(5)).toBe(0);
  });

  it('legt de gecontroleerde 2026-bronnen vast', () => {
    expect(EIGEN_RISICO_2026).toBe(385);
    expect(VERGOEDE_POGINGEN_PER_ZWANGERSCHAP).toBe(3);
    expect(VERGOEDING_LAATST_GEVERIFIEERD_OP).toBe('2026-06-23');
    expect(VERGOEDING_BRONNEN_2026.map((bron) => bron.naam)).toEqual([
      'Rijksoverheid - eigen risico zorgverzekering',
      'Zorginstituut Nederland - eigen risico Zvw',
      'Zilveren Kruis - IVF en ICSI vergoeding 2026',
    ]);
    expect(VERGOEDING_BRONNEN_2026.every((bron) => bron.url.startsWith('https://'))).toBe(true);
  });
});
