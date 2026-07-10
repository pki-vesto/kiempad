export type UiFeedbackTone = 'info' | 'success' | 'error';

export type UiFeedback = {
  scope: string;
  tone: UiFeedbackTone;
  message: string;
};

export type UiState = {
  feedback: Partial<Record<string, UiFeedback>>;
};

export function createUiState(): UiState {
  return { feedback: {} };
}

export function setUiFeedback(
  state: UiState,
  scope: string,
  tone: UiFeedbackTone,
  message: string,
): UiFeedback {
  const feedback = { scope, tone, message } satisfies UiFeedback;
  state.feedback[scope] = feedback;
  return feedback;
}

export function clearUiFeedback(state: UiState, scope: string): void {
  delete state.feedback[scope];
}
