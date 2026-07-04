import type { CentralFetchSessionRenewalStatus } from './centralFetchClient';

export type CentralSessionRenewalFeedback = {
  state: 'idle' | 'success' | 'warning' | 'error';
  message: string;
};

export function describeCentralSessionRenewalFeedback(
  status: CentralFetchSessionRenewalStatus,
): CentralSessionRenewalFeedback {
  if (status.status === 'refreshing') {
    return {
      state: 'warning',
      message: 'Centrale sessie wordt vernieuwd. Kiempad blijft bij centrale versleutelde opslag.',
    };
  }

  if (status.status === 'failed') {
    return {
      state: 'error',
      message:
        'Centrale sessie kon niet worden vernieuwd. Herlaad Kiempad en probeer opnieuw; er is geen lokale plaintext fallback gestart.',
    };
  }

  if (status.refreshedAt) {
    return {
      state: 'success',
      message:
        'Centrale sessie is vernieuwd. Gekoppelde apparaten blijven dezelfde versleutelde opslag gebruiken.',
    };
  }

  return {
    state: 'idle',
    message: 'Centrale sessie actief; er is geen sessievernieuwing nodig.',
  };
}
