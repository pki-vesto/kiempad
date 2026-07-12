import { afterEach, describe, expect, it, vi } from 'vitest';

import mainSource from '../../src/runtime.ts?raw';
import { type AgendaAction, renderAgendaScreen } from '../../src/ui/screens/agenda';

describe('agenda lit-html scherm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['afspraak-form', 'save'],
    ['ics-import-form', 'import'],
  ] as const)('dispatcht formulier %s als %s', (id, expectedType) => {
    class TestForm {
      constructor(readonly id: string) {}
      getAttribute(name: string): string | null {
        return name === 'id' ? this.id : null;
      }
    }
    vi.stubGlobal('HTMLFormElement', TestForm);
    const actions: AgendaAction[] = [];
    const template = renderAgendaScreen('<form data-agenda-form="ready"></form>', (action) =>
      actions.push(action),
    );
    const form = new TestForm(id);
    const preventDefault = vi.fn();

    (template.values[0] as (event: SubmitEvent) => void)({
      target: form,
      preventDefault,
    } as unknown as SubmitEvent);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(actions[0]).toMatchObject({ type: expectedType, form });
  });

  it.each([
    ['export-ics', 'export'],
    ['delete-afspraak', 'delete'],
  ] as const)('dispatcht knop %s als %s', (id, expectedType) => {
    class TestElement {
      constructor(readonly id: string) {}
      closest(): TestElement {
        return this;
      }
    }
    vi.stubGlobal('Element', TestElement);
    vi.stubGlobal('HTMLButtonElement', TestElement);
    const actions: AgendaAction[] = [];
    const template = renderAgendaScreen('<button data-agenda-action="ready"></button>', (action) =>
      actions.push(action),
    );
    const button = new TestElement(id);

    (template.values[1] as (event: MouseEvent) => void)({
      target: button,
    } as unknown as MouseEvent);

    expect(actions[0]).toMatchObject({ type: expectedType });
    if (expectedType === 'delete') expect(actions[0]).toMatchObject({ button });
  });

  it('behoudt agendacontracten zonder bindlaag', () => {
    const template = renderAgendaScreen(
      '<section data-schedule-route="overzicht"><form id="afspraak-form"></form></section>',
      vi.fn(),
    );

    expect(template.strings.join('')).toContain('data-lit-screen="agenda"');
    expect(template.values[2]).toMatchObject({
      values: [expect.stringContaining('data-schedule-route="overzicht"')],
    });
    expect(mainSource).not.toContain('bindAgendaControls');
    expect(mainSource).toContain('dispatchAgendaAction');
  });
});
