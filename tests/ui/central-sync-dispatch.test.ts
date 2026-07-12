import { describe, expect, it, vi } from 'vitest';

import {
  CENTRAL_SESSION_FEEDBACK_EVENT,
  CENTRAL_SYNC_UPDATE_EVENT,
  subscribeCentralSyncDispatch,
} from '../../src/ui/centralSyncDispatch';

describe('centrale sync via dispatch', () => {
  it('dispatcht centrale syncfeedback zonder netwerk- of pollingpad', () => {
    const target = new EventTarget();
    const dispatch = vi.fn();
    const unsubscribe = subscribeCentralSyncDispatch(target, dispatch);
    const feedback = { 'record-load': { state: 'success' as const, status: 'Bijgewerkt.' } };

    target.dispatchEvent(new CustomEvent(CENTRAL_SYNC_UPDATE_EVENT, { detail: { feedback } }));

    expect(dispatch).toHaveBeenCalledWith(feedback);
    unsubscribe();
    target.dispatchEvent(new CustomEvent(CENTRAL_SYNC_UPDATE_EVENT, { detail: { feedback } }));
    expect(dispatch).toHaveBeenCalledOnce();
  });

  it('normaliseert centrale sessiefeedback naar stale-session feedback', () => {
    const target = new EventTarget();
    const dispatch = vi.fn();
    subscribeCentralSyncDispatch(target, dispatch);

    target.dispatchEvent(
      new CustomEvent(CENTRAL_SESSION_FEEDBACK_EVENT, {
        detail: { state: 'warning', status: 'Centrale sessie vernieuwd.' },
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      'stale-session': { state: 'warning', status: 'Centrale sessie vernieuwd.', error: undefined },
    });
  });
});
