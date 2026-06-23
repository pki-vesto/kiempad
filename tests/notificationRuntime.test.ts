import { describe, expect, it } from 'vitest';
import { DEFAULT_APP_SETTINGS } from '../src/domain/settings';
import type { Herinnering } from '../src/domain/types';
import {
  buildInAppFallbackNotifications,
  buildNotificationMessage,
} from '../src/notificationRuntime';

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

describe('notification runtime in-app fallback', () => {
  it('bouwt komende in-app fallbackmeldingen als browsernotificaties niet klaar staan', () => {
    const items = buildInAppFallbackNotifications(
      [herinnering],
      DEFAULT_APP_SETTINGS,
      { permission: 'denied', serviceWorker: 'ready' },
      { 'afspraak-1': 'Afspraak: Echo controle' },
      new Date('2026-06-23T07:00:00.000'),
    );

    expect(items).toEqual([
      {
        id: 'rem-1',
        dueAt: '2026-06-23T08:00',
        message: {
          title: 'Kiempad herinnering',
          body: 'Er staat een herinnering klaar.',
        },
      },
    ]);
  });

  it('toont geen fallback als permissie en service worker klaar zijn', () => {
    expect(
      buildInAppFallbackNotifications(
        [herinnering],
        DEFAULT_APP_SETTINGS,
        { permission: 'granted', serviceWorker: 'ready' },
        {},
        new Date('2026-06-23T07:00:00.000'),
      ),
    ).toEqual([]);
  });

  it('gebruikt details in fallback alleen na expliciete privacykeuze', () => {
    expect(
      buildInAppFallbackNotifications(
        [herinnering],
        { ...DEFAULT_APP_SETTINGS, toonNotificatieDetailsOpVergrendelscherm: true },
        { permission: 'default', serviceWorker: 'unregistered' },
        { 'afspraak-1': 'Afspraak: Echo controle' },
        new Date('2026-06-23T07:00:00.000'),
      )[0]?.message.body,
    ).toBe('Afspraak: Echo controle');
  });
});
