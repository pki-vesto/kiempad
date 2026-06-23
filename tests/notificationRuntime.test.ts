import { describe, expect, it } from 'vitest';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';
import type { Herinnering } from '../src/domain/types';
import { buildNotificationMessage } from '../src/notificationRuntime';

const herinnering: Herinnering = {
  id: 'rem-1',
  bron: { soort: 'afspraak', refId: 'afspraak-1' },
  tijdstip: '2026-06-23T08:00',
  actief: true,
};

describe('notification runtime privacy', () => {
  it('toont standaard generieke notificatie-inhoud', () => {
    expect(
      buildNotificationMessage(herinnering, DEFAULT_APP_SETTINGS, {
        'afspraak-1': 'Afspraak: Echo controle',
      }),
    ).toEqual({
      title: 'Kiempad herinnering',
      body: 'Er staat een herinnering klaar.',
    });
  });

  it('toont details alleen na expliciete lokale keuze', () => {
    expect(
      buildNotificationMessage(
        herinnering,
        { ...DEFAULT_APP_SETTINGS, toonNotificatieDetailsOpVergrendelscherm: true },
        { 'afspraak-1': 'Afspraak: Echo controle' },
      ),
    ).toEqual({
      title: 'Kiempad herinnering',
      body: 'Afspraak: Echo controle',
    });
  });

  it('valt terug op generieke tekst als details ontbreken', () => {
    expect(
      buildNotificationMessage(herinnering, {
        ...DEFAULT_APP_SETTINGS,
        toonNotificatieDetailsOpVergrendelscherm: true,
      }).body,
    ).toBe('Er staat een herinnering klaar.');
  });
});
