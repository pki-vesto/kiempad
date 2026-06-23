import { describe, expect, it } from 'vitest';
import compose from '../docker-compose.tailscale.yml?raw';
import deployDocs from '../docs/TAILSCALE_DEPLOY.md?raw';
import packageJson from '../package.json?raw';
import deployScript from '../scripts/deploy-tailscale.sh?raw';
import smokeScript from '../scripts/smoke-tailscale.sh?raw';
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

    expect(deployDocs).toContain('https://kiempad.tail9d0c71.ts.net');
    expect(deployDocs).toContain('kiempad.<tailnet>.ts.net');
    expect(deployDocs).toContain('Geen Tailscale Funnel');
    expect(deployDocs).toContain('Geen applicatie-backend');
    expect(deployDocs).toContain('IndexedDB');
  });

  it('biedt herhaalbare npm scripts voor deploy en smoke zonder auth key te loggen', () => {
    const pkg = JSON.parse(packageJson) as { scripts: Record<string, string> };

    expect(pkg.scripts['deploy:tailscale']).toBe('scripts/deploy-tailscale.sh');
    expect(pkg.scripts['smoke:tailscale']).toBe('scripts/smoke-tailscale.sh');
    expect(deployScript).toContain('TS_AUTHKEY ontbreekt');
    expect(deployScript).toContain('docker compose -f "');
    const composeFileExpansion = '"$' + '{compose_file}" up -d --build';
    expect(deployScript).toContain(composeFileExpansion);
    expect(deployScript).not.toContain('echo "${TS_AUTHKEY');
    expect(smokeScript).toContain('KIEMPAD_TAILNET_URL');
    expect(smokeScript).toContain('docker exec kiempad-ts tailscale serve status');
    expect(deployDocs).toContain('npm run deploy:tailscale');
    expect(deployDocs).toContain('npm run smoke:tailscale');
    expect(deployDocs).toContain('KIEMPAD_TAILSCALE_LOCAL_PORT=8098');
  });
});
