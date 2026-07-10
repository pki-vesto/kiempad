import { describe, expect, it } from 'vitest';

import { clearUiFeedback, createUiState, setUiFeedback } from '../../src/ui/state';

describe('UiState', () => {
  it('bewaart getypte feedback per scope en kan die gericht wissen', () => {
    const state = createUiState();

    expect(setUiFeedback(state, 'welzijn', 'success', 'Check-in opgeslagen.')).toEqual({
      scope: 'welzijn',
      tone: 'success',
      message: 'Check-in opgeslagen.',
    });
    expect(state.feedback.welzijn?.message).toBe('Check-in opgeslagen.');

    clearUiFeedback(state, 'welzijn');
    expect(state.feedback.welzijn).toBeUndefined();
  });

  it('houdt feedback van verschillende schermen van elkaar gescheiden', () => {
    const state = createUiState();
    setUiFeedback(state, 'welzijn', 'info', 'Welzijn bijgewerkt.');
    setUiFeedback(state, 'kosten', 'error', 'Kostenpost niet opgeslagen.');

    expect(state.feedback).toMatchObject({
      welzijn: { tone: 'info' },
      kosten: { tone: 'error' },
    });
  });
});
