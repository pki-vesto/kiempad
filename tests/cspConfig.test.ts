import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { centralApiOrigin, transformCspConnectSrc } from '../vite.config';

const indexHtml = readFileSync('index.html', 'utf8');

describe('Vite CSP connect-src', () => {
  it('houdt de bron-index productie-strikt zonder localhost', () => {
    expect(indexHtml).toContain("connect-src 'self';");
    expect(indexHtml).not.toMatch(/localhost|127\.0\.0\.1|ws:\/\//);
    expect(indexHtml).toContain("script-src 'self'");
  });

  it('injecteert dev-origins zonder eval of dubbele bronnen', () => {
    const transformed = transformCspConnectSrc(indexHtml, [
      'http://localhost:*',
      'ws://localhost:*',
      'http://localhost:*',
    ]);

    expect(transformed).toContain("connect-src 'self' http://localhost:* ws://localhost:*;");
    expect(transformed).not.toMatch(/unsafe-eval|new Function/);
  });

  it('normaliseert alleen http(s) centrale API-origins', () => {
    expect(centralApiOrigin('https://central.example.test/api')).toBe(
      'https://central.example.test',
    );
    expect(centralApiOrigin('javascript:alert(1)')).toBeUndefined();
    expect(centralApiOrigin('geen-url')).toBeUndefined();
  });
});
