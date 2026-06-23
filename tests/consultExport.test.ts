import { describe, expect, it } from 'vitest';
import { maakConsultPrintHtml } from '../src/domain/consultExport';

describe('consult export', () => {
  it('maakt een lokaal printbaar consultoverzicht met escaping', () => {
    const html = maakConsultPrintHtml({
      gegenereerdOp: '2026-06-23T12:00:00.000Z',
      afspraken: [
        {
          id: 'afspraak-1',
          titel: 'Consult <arts>',
          datumTijd: '2026-06-24T09:30',
          type: 'consult',
          locatie: 'Kamer 2',
          voorbereiding: 'Neem ID mee',
        },
      ],
      vragen: [
        {
          id: 'vraag-1',
          vraag: 'Wat is de volgende stap?',
          prioriteit: 1,
          beantwoord: true,
          antwoord: 'Plan volgt na echo',
        },
      ],
      medicatie: [
        {
          id: 'med-1',
          naam: 'Progesteron',
          vorm: 'zetpil',
          actief: true,
          voorgeschrevenDosis: 'zoals kliniek',
          instructie: 'avond',
        },
      ],
    });

    expect(html).toContain('<title>Kiempad consultoverzicht</title>');
    expect(html).toContain('Sla op als PDF');
    expect(html).toContain('Consult &lt;arts&gt;');
    expect(html).toContain('Wat is de volgende stap?');
    expect(html).toContain('Antwoord: Plan volgt na echo');
    expect(html).toContain('Progesteron');
    expect(html).not.toContain('Consult <arts>');
  });
});
