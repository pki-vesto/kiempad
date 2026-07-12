import type { AppShellState } from '../appShell';

export const CENTRAL_SYNC_UPDATE_EVENT = 'kiempad:central-sync-update';
export const CENTRAL_SESSION_FEEDBACK_EVENT = 'central-session-feedback';

export type CentralSyncFeedbackUpdate = NonNullable<AppShellState['centralSyncFeedback']>;

export type CentralSyncDispatchTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>;

export function subscribeCentralSyncDispatch(
  target: CentralSyncDispatchTarget,
  dispatch: (feedback: CentralSyncFeedbackUpdate) => void,
): () => void {
  const onSyncUpdate = (event: Event): void => {
    const feedback = readFeedback(event);
    if (feedback) dispatch(feedback);
  };
  const onSessionFeedback = (event: Event): void => {
    const detail = readDetail(event);
    if (!detail) return;
    const state = detail.state === 'error' || detail.state === 'success' ? detail.state : 'warning';
    const status = typeof detail.status === 'string' ? detail.status : undefined;
    const error = typeof detail.error === 'string' ? detail.error : undefined;
    dispatch({ 'stale-session': { state, status, error } });
  };

  target.addEventListener(CENTRAL_SYNC_UPDATE_EVENT, onSyncUpdate);
  target.addEventListener(CENTRAL_SESSION_FEEDBACK_EVENT, onSessionFeedback);
  return () => {
    target.removeEventListener(CENTRAL_SYNC_UPDATE_EVENT, onSyncUpdate);
    target.removeEventListener(CENTRAL_SESSION_FEEDBACK_EVENT, onSessionFeedback);
  };
}

function readFeedback(event: Event): CentralSyncFeedbackUpdate | undefined {
  const detail = readDetail(event);
  if (!detail || typeof detail.feedback !== 'object' || detail.feedback === null) return undefined;
  return detail.feedback as CentralSyncFeedbackUpdate;
}

function readDetail(event: Event): Record<string, unknown> | undefined {
  if (!(event instanceof CustomEvent) || typeof event.detail !== 'object' || event.detail === null)
    return undefined;
  return event.detail as Record<string, unknown>;
}
