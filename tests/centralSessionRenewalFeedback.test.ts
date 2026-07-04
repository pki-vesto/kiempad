import { describe, expect, it } from 'vitest';
import { describeCentralSessionRenewalFeedback } from '../src/storage/centralSessionRenewalFeedback';

describe('central session renewal feedback', () => {
  it('toont actieve en vernieuwde sessies zonder token of sessiedetail', () => {
    expect(describeCentralSessionRenewalFeedback({ status: 'active' })).toEqual({
      state: 'idle',
      message: 'Centrale sessie actief; er is geen sessievernieuwing nodig.',
    });

    const renewed = describeCentralSessionRenewalFeedback({
      status: 'active',
      refreshedAt: '2026-06-25T09:15:00.000Z',
    });

    expect(renewed.state).toBe('success');
    expect(renewed.message).toContain('Centrale sessie is vernieuwd');
    expect(renewed.message).not.toContain('2026-06-25T09:15:00.000Z');
    expect(renewed.message).not.toContain('central-token');
  });

  it('toont refreshing en failed status generiek zonder foutpayload', () => {
    const refreshing = describeCentralSessionRenewalFeedback({
      status: 'refreshing',
      previousFailure: 'central-token passphrase secret',
    });
    const failed = describeCentralSessionRenewalFeedback({
      status: 'failed',
      error: 'central-token passphrase medische plaintext',
      failedAt: '2026-06-25T09:20:00.000Z',
    });

    expect(refreshing).toMatchObject({ state: 'warning' });
    expect(failed).toMatchObject({ state: 'error' });
    const serialized = JSON.stringify([refreshing, failed]);
    expect(serialized).toContain('geen lokale plaintext fallback');
    expect(serialized).not.toContain('central-token');
    expect(serialized).not.toContain('passphrase');
    expect(serialized).not.toContain('medische plaintext');
    expect(serialized).not.toContain('2026-06-25T09:20:00.000Z');
  });
});
