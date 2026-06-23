import {
  maakAfspraak,
  maakAfspraakHerinnering,
  maakAfspraakVraag,
  sorteerAfspraken,
  type AfspraakInput,
} from './agenda';
import type { Afspraak, Herinnering, Vraag } from './types';
import type { EncryptedRecordRepository } from '../storage/encryptedRepository';
import { generateRecordId } from '../storage/records';

export type AfspraakBundleInput = AfspraakInput & {
  id?: string;
  herinneringTijdstip?: string;
  vraagVoorArts?: string;
};

export type AfspraakBundle = {
  afspraak: Afspraak;
  herinnering?: Herinnering;
  vraag?: Vraag;
};

export class AgendaStore {
  constructor(
    private readonly afspraken: EncryptedRecordRepository<Afspraak>,
    private readonly herinneringen: EncryptedRecordRepository<Herinnering>,
    private readonly vragen: EncryptedRecordRepository<Vraag>,
  ) {}

  async list(): Promise<AfspraakBundle[]> {
    const [afspraken, herinneringen, vragen] = await Promise.all([
      this.afspraken.list(),
      this.herinneringen.list(),
      this.vragen.list(),
    ]);

    const afspraakWaarden = sorteerAfspraken(afspraken.map((record) => record.value));
    const herinneringWaarden = herinneringen.map((record) => record.value);
    const vraagWaarden = vragen.map((record) => record.value);

    return afspraakWaarden.map((afspraak) => ({
      afspraak,
      herinnering: herinneringWaarden.find(
        (herinnering) =>
          herinnering.bron.soort === 'afspraak' && herinnering.bron.refId === afspraak.id,
      ),
      vraag: vraagWaarden.find((vraag) => vraag.voorAfspraakId === afspraak.id),
    }));
  }

  async save(input: AfspraakBundleInput): Promise<AfspraakBundle> {
    const afspraakId = input.id || generateRecordId();
    const afspraak = maakAfspraak(afspraakId, input);
    await this.afspraken.saveWithId(afspraak);

    const existing = await this.findRelated(afspraakId);
    const herinnering = await this.saveReminder(afspraakId, input.herinneringTijdstip, existing);
    const vraag = await this.saveQuestion(afspraakId, input.vraagVoorArts, existing);

    return { afspraak, herinnering, vraag };
  }

  async delete(afspraakId: string): Promise<void> {
    const related = await this.findRelated(afspraakId);
    await Promise.all([
      this.afspraken.delete(afspraakId),
      related.herinnering ? this.herinneringen.delete(related.herinnering.id) : Promise.resolve(),
      related.vraag ? this.vragen.delete(related.vraag.id) : Promise.resolve(),
    ]);
  }

  private async findRelated(afspraakId: string): Promise<{
    herinnering?: Herinnering;
    vraag?: Vraag;
  }> {
    const [herinneringen, vragen] = await Promise.all([
      this.herinneringen.list(),
      this.vragen.list(),
    ]);

    return {
      herinnering: herinneringen
        .map((record) => record.value)
        .find(
          (herinnering) =>
            herinnering.bron.soort === 'afspraak' && herinnering.bron.refId === afspraakId,
        ),
      vraag: vragen.map((record) => record.value).find((vraag) => vraag.voorAfspraakId === afspraakId),
    };
  }

  private async saveReminder(
    afspraakId: string,
    tijdstip: string | undefined,
    existing: { herinnering?: Herinnering },
  ): Promise<Herinnering | undefined> {
    if (!tijdstip) {
      if (existing.herinnering) await this.herinneringen.delete(existing.herinnering.id);
      return undefined;
    }

    const herinnering = maakAfspraakHerinnering(
      existing.herinnering?.id ?? generateRecordId(),
      afspraakId,
      tijdstip,
    );
    await this.herinneringen.saveWithId(herinnering);
    return herinnering;
  }

  private async saveQuestion(
    afspraakId: string,
    vraagTekst: string | undefined,
    existing: { vraag?: Vraag },
  ): Promise<Vraag | undefined> {
    if (!vraagTekst?.trim()) {
      if (existing.vraag) await this.vragen.delete(existing.vraag.id);
      return undefined;
    }

    const vraag = maakAfspraakVraag(existing.vraag?.id ?? generateRecordId(), afspraakId, vraagTekst);
    await this.vragen.saveWithId(vraag);
    return vraag;
  }
}
