import { describe, expect, it } from 'vitest';
import { scanAssetText } from '../scripts/check-no-external-assets.mjs';

describe('external asset scan', () => {
  it('weigert externe asset-URL-loaders in HTML, CSS, manifest en importerende JS', () => {
    expect(scanAssetText('index.html', '<img src="https://cdn.example.test/a.png">')).toEqual([
      {
        filePath: 'index.html',
        url: 'https://cdn.example.test/a.png',
        context: 'html-attribute',
      },
    ]);

    expect(
      scanAssetText(
        'styles.css',
        '@import "https://fonts.example.test/css"; .hero { background: url(https://cdn.example.test/bg.webp); }',
      ),
    ).toEqual([
      {
        filePath: 'styles.css',
        url: 'https://cdn.example.test/bg.webp',
        context: 'css-url',
      },
      {
        filePath: 'styles.css',
        url: 'https://fonts.example.test/css',
        context: 'css-import',
      },
    ]);

    expect(
      scanAssetText(
        'manifest.webmanifest',
        JSON.stringify({
          start_url: 'https://app.example.test/',
          icons: [{ src: 'https://cdn.example.test/icon.png' }],
        }),
      ),
    ).toEqual([
      {
        filePath: 'manifest.webmanifest',
        url: 'https://app.example.test/',
        context: 'manifest-start_url',
      },
      {
        filePath: 'manifest.webmanifest',
        url: 'https://cdn.example.test/icon.png',
        context: 'manifest-icon',
      },
    ]);

    expect(scanAssetText('worker.js', 'importScripts("https://cdn.example.test/sw.js");')).toEqual([
      {
        filePath: 'worker.js',
        url: 'https://cdn.example.test/sw.js',
        context: 'js-importscripts',
      },
    ]);
  });

  it('staat de SVG namespace toe en negeert niet-laadbare domeindata in JS', () => {
    expect(scanAssetText('icon.svg', '<svg xmlns="http://www.w3.org/2000/svg" />')).toEqual([]);
    expect(
      scanAssetText(
        'domain-data.js',
        'export const bronnen = ["https://pubmed.ncbi.nlm.nih.gov/12345"];',
      ),
    ).toEqual([]);
  });
});
