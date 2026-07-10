import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/main.ts?raw';
import {
  type HerinneringenAction,
  renderHerinneringenScreen,
} from '../../src/ui/screens/herinneringen';

describe('herinneringen lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['eigen-herinnering-form', false, 'save'],
    ['notification-privacy-form', false, 'save-privacy'],
    ['warning-default-form', false, 'save-warning-default'],
    ['', true, 'reschedule'],
  ] as const)('dispatcht formulier %s als %s', (id, isReschedule, expectedType) => {
    class TestElement {}
    class TestForm extends TestElement {
      classList = {
        contains: (value: string) => isReschedule && value === 'reminder-reschedule-form',
      };
      constructor(readonly id: string) {
        super();
      }
    }
    vi.stubGlobal('HTMLElement', TestElement);
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: HerinneringenAction[] = [];
    const template = renderHerinneringenScreen(
      '<form data-reminder-form="ready"></form>',
      (action) => actions.push(action),
    );
    const handler = template.values[0] as (event: SubmitEvent) => void;
    const form = new TestForm(id);
    const preventDefault = vi.fn();

    handler({ target: form, submitter: null, preventDefault } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions[0]).toMatchObject({ type: expectedType, form });
  });

  it('dispatcht de notificatiepermissie inline', () => {
    class TestElement {
      closest(selector: string): object | null {
        return selector === '#request-notifications' ? this : null;
      }
    }
    vi.stubGlobal('Element', TestElement);
    const actions: HerinneringenAction[] = [];
    const template = renderHerinneringenScreen(
      '<button id="request-notifications" data-notification-permission="ready"></button>',
      (action) => actions.push(action),
    );

    (template.values[1] as (event: MouseEvent) => void)({
      target: new TestElement(),
    } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: 'request-permission' }]);
  });

  it('behoudt notificatiecontracten zonder bindlaag', () => {
    const template = renderHerinneringenScreen(
      '<section data-notification-console="ready"><form id="notification-privacy-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="herinneringen"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('notification-privacy-form')],
    });
    expect(mainSource).not.toContain('bindHerinneringControls');
  });
});
