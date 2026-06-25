import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CentralFetchApiClientDriver,
  issueCentralFetchSession,
} from '../src/storage/centralFetchClient';

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
});
