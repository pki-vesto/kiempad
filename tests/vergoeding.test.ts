import { describe, expect, it } from 'vitest';
import {
  pogingTeltVoorVergoeding,
  resterendeVergoedePogingen,
  VERGOEDE_POGINGEN_PER_ZWANGERSCHAP,
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
});
