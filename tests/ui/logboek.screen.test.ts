import { describe, expect, it } from 'vitest';

import { renderLogboekScreen } from '../../src/ui/screens/logboek';

describe('logboek lit-html scherm', () => {
  it('behoudt het read-only audit- en privacycontract', () => {
    const template = renderLogboekScreen(
      '<section data-eventlog-console="ready"><div data-eventlog-privacy-layout="single-check"></div></section>',
    );

    expect(template.strings.join('')).toContain('data-lit-screen="logboek"');
    expect(template.values[0]).toMatchObject({
      values: [expect.stringContaining('data-eventlog-console="ready"')],
    });
    expect(template.values[0]).toMatchObject({
      values: [expect.stringContaining('data-eventlog-privacy-layout="single-check"')],
    });
  });

  it('voegt geen interactieve eventhandler toe aan het read-only scherm', () => {
    const template = renderLogboekScreen('<section data-eventlog-timeline="recent"></section>');

    expect(template.values.every((value) => typeof value !== 'function')).toBe(true);
  });
});
