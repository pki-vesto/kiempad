import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { type KostenAction, renderKostenScreen } from '../../src/ui/screens/kosten';

describe('kosten lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('dispatcht kostenformulieren via het inline submit-event', () => {
    class TestElement {}
    class TestForm extends TestElement {
      classList = { contains: (value: string) => value === 'kosten-form' };
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: KostenAction[] = [];
    const template = renderKostenScreen('<form class="kosten-form"></form>', (action) =>
      actions.push(action),
    );
    const handlers = template.values.filter(
      (value): value is (event: Event) => void => typeof value === 'function',
    );
    const form = new TestForm();
    const preventDefault = vi.fn();

    handlers[0]?.({ target: form, preventDefault } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions).toEqual([{ type: 'save', form }]);
  });

  it('dispatcht verwijderen vanaf knopinhoud via closest', () => {
    class TestElement {
      closest(_selector: string): TestButton | null {
        return null;
      }
    }
    class TestButton extends TestElement {
      override closest(selector: string): TestButton | null {
        return selector === '.delete-kosten' ? this : null;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestButton);
    const actions: KostenAction[] = [];
    const template = renderKostenScreen('<button class="delete-kosten"></button>', (action) =>
      actions.push(action),
    );
    const handlers = template.values.filter(
      (value): value is (event: Event) => void => typeof value === 'function',
    );
    const button = new TestButton();

    handlers[1]?.({ target: button } as unknown as MouseEvent);

    expect(actions).toEqual([{ type: 'delete', button }]);
  });

  it('behoudt data-attributen en gebruikt geen bindKostenControls meer', () => {
    const template = renderKostenScreen(
      '<section data-finance-console="ready"><form class="kosten-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="kosten"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-finance-console="ready"')],
    });
    expect(mainSource).not.toContain('bindKostenControls');
    expect(mainSource).toContain('dispatchKostenAction');
  });
});
