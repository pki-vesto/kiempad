import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('central backend deploy wrapper', () => {
  it('biedt een npm startcommando voor de centrale backend', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['backend:central']).toBe('tsx src/server/centralBackendCli.ts');
  });

  it('publiceert de backendcontainer met persistent datavolume op localhost', async () => {
    const dockerfile = await readFile('Dockerfile.backend', 'utf8');
    const compose = await readFile('docker-compose.central.yml', 'utf8');

    expect(dockerfile).toContain('KIEMPAD_CENTRAL_PERSISTENCE_FILE=/data/kiempad-central-db.json');
    expect(dockerfile).toContain('KIEMPAD_CENTRAL_ALLOWED_USER_IDS=kiempad-private-user');
    expect(dockerfile).toContain('KIEMPAD_CENTRAL_ALLOWED_ORIGINS=http://localhost:5173');
    expect(dockerfile).toContain('CMD ["npm", "run", "backend:central"]');
    expect(compose).toContain('kiempad-central-api:');
    expect(compose).toContain(`"127.0.0.1:$${'{KIEMPAD_CENTRAL_LOCAL_PORT:-8099}'}:8099"`);
    expect(compose).toContain(
      `KIEMPAD_CENTRAL_ALLOWED_USER_IDS: $${'{KIEMPAD_CENTRAL_ALLOWED_USER_IDS:-kiempad-private-user}'}`,
    );
    expect(compose).toContain(
      `KIEMPAD_CENTRAL_ALLOWED_ORIGINS: $${'{KIEMPAD_CENTRAL_ALLOWED_ORIGINS:-http://localhost:5173'}`,
    );
    expect(compose).toContain('kiempad_central_data:/data');
  });
});
