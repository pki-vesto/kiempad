import { describe, expect, it } from 'vitest';
import { DELETE_CONFIRMATIONS } from '../src/deleteConfirmations';
import indexHtml from '../index.html?raw';
import manifestText from '../public/manifest.webmanifest?raw';
import serviceWorker from '../public/kiempad-sw.js?raw';

describe('PWA baseline', () => {
  it('koppelt manifest en SVG-icon in index.html', () => {
    expect(indexHtml).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(indexHtml).toContain('rel="icon" href="/kiempad-icon.svg"');
    expect(indexHtml).toContain('name="theme-color"');
  });

  it('heeft een installeerbaar manifest met icon', () => {
    const manifest = JSON.parse(manifestText) as {
      name: string;
      display: string;
      start_url: string;
      icons: Array<{ src: string; sizes: string; purpose: string }>;
    };

    expect(manifest.name).toBe('Kiempad');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons[0]).toMatchObject({
      src: '/kiempad-icon.svg',
      sizes: 'any',
    });
  });

  it('cachet de app-shell en ondersteunt navigatiefallback in de service worker', () => {
    expect(serviceWorker).toContain('kiempad-m1-9-v1');
    expect(serviceWorker).toContain("cache.addAll(['/', '/index.html', '/manifest.webmanifest', '/kiempad-icon.svg'])");
    expect(serviceWorker).toContain("request.mode === 'navigate'");
    expect(serviceWorker).toContain("caches.match('/index.html')");
    expect(serviceWorker).toContain('KIEMPAD_NOTIFY');
  });
});

describe('destructieve acties', () => {
  it('hebben expliciete bevestigingsteksten', () => {
    expect(Object.values(DELETE_CONFIRMATIONS)).toEqual([
      'Weet je zeker dat je deze vraag wilt verwijderen?',
      'Weet je zeker dat je dit traject en de fasen wilt verwijderen?',
      'Weet je zeker dat je deze afspraak wilt verwijderen?',
      'Weet je zeker dat je deze medicatie en geplande logs wilt verwijderen?',
    ]);
  });
});
