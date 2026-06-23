/**
 * Hulpfuncties rond vergoeding (NL, 2026). Puur informatief — GEEN financieel of
 * medisch advies. Cijfers en regels moeten worden geverifieerd met de eigen polis
 * en verzekeraar; ze kunnen jaarlijks wijzigen. Zie KENNISBANK.md.
 */

/** Aantal IVF/ICSI-pogingen dat de basisverzekering per zwangerschap vergoedt (NL 2026). */
export const VERGOEDE_POGINGEN_PER_ZWANGERSCHAP = 3;

/** Verplicht eigen risico (NL 2026), in euro. */
export const EIGEN_RISICO_2026 = 385;

/**
 * Bepaalt of een poging meetelt voor de vergoede telling.
 * Regel (te verifieren): een poging telt pas mee na een GESLAAGDE eicelpunctie.
 */
export function pogingTeltVoorVergoeding(geslaagdePunctie: boolean): boolean {
  return geslaagdePunctie === true;
}

/**
 * Resterende vergoede pogingen, gegeven het aantal reeds meetellende pogingen.
 * Nooit negatief.
 */
export function resterendeVergoedePogingen(reedsMeetellend: number): number {
  return Math.max(0, VERGOEDE_POGINGEN_PER_ZWANGERSCHAP - reedsMeetellend);
}
