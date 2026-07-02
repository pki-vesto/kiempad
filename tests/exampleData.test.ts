import { describe, expect, it } from 'vitest';
import { buildExampleData, EXAMPLE_DATA_IDS, EXAMPLE_DATA_PREFIX } from '../src/domain/exampleData';

describe('example data', () => {
  it('bouwt een wisbare synthetische dataset met vaste demo-id’s', () => {
    const data = buildExampleData(new Date('2026-07-02T09:00:00.000Z'));

    expect(data.medicatie).toHaveLength(1);
    expect(data.medicatie[0]).toMatchObject({
      id: EXAMPLE_DATA_IDS.medicatie,
      schemaStartDatum: '2026-07-02',
      schemaAantalDagen: 3,
      schemaTijdstip: '20:00',
    });
    expect(data.afspraken.map((item) => item.id)).toEqual([...EXAMPLE_DATA_IDS.afspraken]);
    expect(data.mentalCheckIns.map((item) => item.id)).toEqual([
      ...EXAMPLE_DATA_IDS.mentalCheckIns,
    ]);
    expect(data.kennisItems.map((item) => item.id)).toEqual([...EXAMPLE_DATA_IDS.kennisItems]);
    expect(data.afspraken[0]?.datumTijd).toBe('2026-07-03T09:30');
    expect(data.afspraken[1]?.datumTijd).toBe('2026-07-09T14:00');
    expect(data.mentalCheckIns).toHaveLength(3);
    expect(data.kennisItems.every((item) => item.id.startsWith(EXAMPLE_DATA_PREFIX))).toBe(true);
    expect(JSON.stringify(data)).toContain('Synthetisch');
  });
});
