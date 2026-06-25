import { afterEach, describe, expect, it, vi } from 'vitest';
import { CentralSessionError } from '../src/storage/centralDatabase';
import {
  CentralFetchApiClientDriver,
  issueCentralFetchSession,
  normalizeCentralFetchBaseUrl,
} from '../src/storage/centralFetchClient';
import { CentralHttpBadRequestError } from '../src/storage/centralHttpApi';

describe('central fetch client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gebruikt globalThis.fetch gebonden aan globalThis in browserachtige runtimes', async () => {
    const fetchStub = vi.fn(function (
      this: unknown,
      input: string,
      init?: RequestInit,
    ): Promise<Response> {
      expect(this).toBe(globalThis);

      if (input.endsWith('/sessions')) {
        expect(init?.method).toBe('POST');
        expect(init?.credentials).toBe('omit');
        expect(init?.cache).toBe('no-store');
        return Promise.resolve(
          new Response(
            JSON.stringify({
              token: 'central-token',
              userId: 'kiempad-private-user',
              issuedAt: '2026-06-25T09:00:00.000Z',
              expiresAt: '2026-06-25T10:00:00.000Z',
            }),
            { status: 201, headers: { 'content-type': 'application/json' } },
          ),
        );
      }

      expect(input).toBe('https://central.test/meta/crypto');
      expect(init?.credentials).toBe('omit');
      expect(init?.cache).toBe('no-store');
      return Promise.resolve(
        new Response(JSON.stringify({ value: { version: 1 } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    });
    vi.stubGlobal('fetch', fetchStub);

    const ticket = await issueCentralFetchSession('https://central.test', {
      userId: 'kiempad-private-user',
    });
    const driver = new CentralFetchApiClientDriver('https://central.test', ticket.token);

    await expect(driver.getMeta('crypto')).resolves.toEqual({ version: 1 });
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });

  it('gebruikt geen ambient credentials of browsercache bij centrale sessie-uitgifte', async () => {
    const fetcher = vi.fn(async (_input: string, init?: RequestInit): Promise<Response> => {
      expect(init?.credentials).toBe('omit');
      expect(init?.cache).toBe('no-store');
      return new Response(
        JSON.stringify({
          token: 'central-token',
          userId: 'kiempad-private-user',
          issuedAt: '2026-06-25T09:00:00.000Z',
          expiresAt: '2026-06-25T10:00:00.000Z',
        }),
        { status: 201, headers: { 'content-type': 'application/json' } },
      );
    });

    await expect(
      issueCentralFetchSession('https://central.test', { userId: 'kiempad-private-user' }, fetcher),
    ).resolves.toMatchObject({ token: 'central-token' });
  });

  it('normaliseert centrale fetch base URLs met padprefix zonder trailing slash', async () => {
    expect(normalizeCentralFetchBaseUrl(' https://central.test/api/// ')).toBe(
      'https://central.test/api',
    );

    const fetcher = vi.fn(async (input: string): Promise<Response> => {
      expect(input).toBe('https://central.test/api/meta/crypto');
      return new Response(JSON.stringify({ value: { version: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });

    const driver = new CentralFetchApiClientDriver(
      ' https://central.test/api/// ',
      'central-token',
      fetcher,
    );

    await expect(driver.getMeta('crypto')).resolves.toEqual({ version: 1 });
  });

  it('weigert ongeldige centrale fetch base URLs aan de directe clientgrens', async () => {
    const invalidUrls = [
      '',
      '/relative-api',
      'not-a-url',
      'ftp://central.test',
      'https://user:secret@example.test',
      'https://central.test?token=secret',
      'https://central.test/#fragment',
    ];

    for (const baseUrl of invalidUrls) {
      expect(() => new CentralFetchApiClientDriver(baseUrl, 'central-token')).toThrow(
        /Centrale API-URL/,
      );
      await expect(
        issueCentralFetchSession(baseUrl, { userId: 'kiempad-private-user' }, failUnexpectedFetch),
      ).rejects.toThrow(/Centrale API-URL/);
    }
  });

  it('weigert succesvolle centrale fetch responses zonder JSON content-type', async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      return new Response('<html>not the central API</html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    });
    const driver = new CentralFetchApiClientDriver(
      'https://central.test',
      'central-token',
      fetcher,
    );

    await expect(driver.listMeta()).rejects.toThrow('central-fetch-invalid-json-response');
    await expect(driver.listMeta()).rejects.toBeInstanceOf(CentralHttpBadRequestError);
  });

  it('weigert succesvolle centrale fetch responses met malformed JSON', async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      return new Response('{not-json', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    const driver = new CentralFetchApiClientDriver(
      'https://central.test',
      'central-token',
      fetcher,
    );

    await expect(driver.listMeta()).rejects.toThrow('central-fetch-invalid-json-response');
    await expect(driver.listMeta()).rejects.toBeInstanceOf(CentralHttpBadRequestError);
  });

  it('accepteert JSON subtype responses met charset voor centrale fetch data', async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      return new Response(JSON.stringify({ value: { version: 1 } }), {
        status: 200,
        headers: { 'content-type': 'application/vnd.kiempad+json; charset=utf-8' },
      });
    });
    const driver = new CentralFetchApiClientDriver(
      'https://central.test',
      'central-token',
      fetcher,
    );

    await expect(driver.getMeta('crypto')).resolves.toEqual({ version: 1 });
  });

  it('weigert centrale sessietickets met succesvolle non-JSON responses', async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      return new Response('created', {
        status: 201,
        headers: { 'content-type': 'text/plain' },
      });
    });

    await expect(
      issueCentralFetchSession('https://central.test', { userId: 'kiempad-private-user' }, fetcher),
    ).rejects.toThrow('central-fetch-invalid-json-response');
  });

  it('weigert malformed centrale sessietickets voordat het token gebruikt kan worden', async () => {
    for (const ticket of [
      {
        token: '',
        userId: 'kiempad-private-user',
        issuedAt: '2026-06-25T09:00:00.000Z',
        expiresAt: '2026-06-25T10:00:00.000Z',
      },
      {
        token: 'central-token',
        userId: 'andere-user',
        issuedAt: '2026-06-25T09:00:00.000Z',
        expiresAt: '2026-06-25T10:00:00.000Z',
      },
      {
        token: 'central-token',
        userId: 'kiempad-private-user',
        issuedAt: '2026-06-25T09:00:00Z',
        expiresAt: '2026-06-25T10:00:00.000Z',
      },
      {
        token: 'central-token',
        userId: 'kiempad-private-user',
        issuedAt: '2026-06-25T10:00:00.000Z',
        expiresAt: '2026-06-25T10:00:00.000Z',
      },
    ]) {
      const fetcher = vi.fn(async (): Promise<Response> => {
        return new Response(JSON.stringify(ticket), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });
      });

      await expect(
        issueCentralFetchSession(
          'https://central.test',
          { userId: 'kiempad-private-user' },
          fetcher,
        ),
      ).rejects.toThrow('central-fetch-invalid-session-ticket');
      await expect(
        issueCentralFetchSession(
          'https://central.test',
          { userId: 'kiempad-private-user' },
          fetcher,
        ),
      ).rejects.toBeInstanceOf(CentralHttpBadRequestError);
    }
  });

  it('ververst een verlopen centraal sessietoken eenmalig en hergebruikt daarna het nieuwe token', async () => {
    const seenTokens: string[] = [];
    const fetcher = vi.fn(async (input: string, init?: RequestInit): Promise<Response> => {
      expect(input).toBe('https://central.test/meta/crypto');
      expect(init?.credentials).toBe('omit');
      expect(init?.cache).toBe('no-store');
      const token = new Headers(init?.headers).get('authorization')?.replace(/^Bearer\s+/i, '');
      seenTokens.push(token ?? '');

      if (token === 'expired-token') {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ value: { version: 1, token } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    const refreshSession = vi.fn(async () => ({ token: 'fresh-token' }));
    const driver = new CentralFetchApiClientDriver(
      'https://central.test',
      'expired-token',
      fetcher,
      refreshSession,
    );

    await expect(driver.getMeta('crypto')).resolves.toEqual({
      version: 1,
      token: 'fresh-token',
    });
    await expect(driver.getMeta('crypto')).resolves.toEqual({
      version: 1,
      token: 'fresh-token',
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(seenTokens).toEqual(['expired-token', 'fresh-token', 'fresh-token']);
  });

  it('probeert sessie-refresh niet eindeloos wanneer het nieuwe token ook unauthorized is', async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    });
    const refreshSession = vi.fn(async () => ({ token: 'still-invalid-token' }));
    const driver = new CentralFetchApiClientDriver(
      'https://central.test',
      'expired-token',
      fetcher,
      refreshSession,
    );

    await expect(driver.listMeta()).rejects.toBeInstanceOf(CentralSessionError);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('laat refresh-fouten centraal falen zonder lokale fallback of stille retry', async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    });
    const refreshSession = vi.fn(async () => {
      throw new CentralHttpBadRequestError('unauthorized');
    });
    const driver = new CentralFetchApiClientDriver(
      'https://central.test',
      'expired-token',
      fetcher,
      refreshSession,
    );

    await expect(driver.listMeta()).rejects.toBeInstanceOf(CentralHttpBadRequestError);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

async function failUnexpectedFetch(): Promise<Response> {
  throw new Error('Fetch should not be called when base URL validation fails.');
}
