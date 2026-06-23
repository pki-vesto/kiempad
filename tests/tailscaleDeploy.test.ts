import { describe, expect, it } from 'vitest';
import compose from '../docker-compose.tailscale.yml?raw';
import deployDocs from '../docs/TAILSCALE_DEPLOY.md?raw';
import serveConfigRaw from '../ts/serve.json?raw';

describe('Tailscale publicatieconfiguratie', () => {
  it('publiceert Kiempad als aparte HTTPS-node zonder gebruikersdata te mounten', () => {
    const serveConfig = JSON.parse(serveConfigRaw) as {
      TCP: Record<string, { HTTPS?: boolean }>;
      Web: Record<string, { Handlers: Record<string, { Proxy: string }> }>;
    };

    expect(compose).toContain('container_name: kiempad-ts');
    expect(compose).toContain('hostname: kiempad');
    expect(compose).toContain('TS_HOSTNAME=kiempad');
    expect(compose).toContain('TS_SERVE_CONFIG=/config/serve.json');
    expect(compose).toContain('network_mode: service:tailscale');
    expect(compose).not.toMatch(/\.\/data|\.\/backups|\.env/);

    expect(serveConfig.TCP['443']).toEqual({ HTTPS: true });
    const certDomainKey = '$' + '{TS_CERT_DOMAIN}:443';
    expect(serveConfig.Web[certDomainKey]?.Handlers['/']?.Proxy).toBe('http://127.0.0.1:80');

    expect(deployDocs).toContain('https://kiempad.<tailnet>.ts.net');
    expect(deployDocs).toContain('Geen Tailscale Funnel');
    expect(deployDocs).toContain('Geen applicatie-backend');
    expect(deployDocs).toContain('IndexedDB');
  });
});
