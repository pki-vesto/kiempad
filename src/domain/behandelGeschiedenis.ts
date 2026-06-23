import { AFSPRAAK_TYPE_LABELS } from './agenda';
import { DOSSIER_CATEGORIE_LABELS, DOSSIER_UPLOAD_PROFIEL_LABELS } from './dossier';
import type { Afspraak, ConsultVerslag, DossierDocument } from './types';

export type BehandelGeschiedenisItem = {
  id: string;
  datum: string;
  soort: 'afspraak' | 'consultverslag' | 'dossierdocument';
  titel: string;
  label: string;
  detail: string;
  bron: string;
  afspraakId?: string;
  trajectId?: string;
};

export function reconstrueerBehandelGeschiedenis(input: {
  afspraken: readonly Afspraak[];
  consultVerslagen: readonly ConsultVerslag[];
  dossierDocumenten: readonly DossierDocument[];
}): BehandelGeschiedenisItem[] {
  const afspraakItems = input.afspraken.map((afspraak): BehandelGeschiedenisItem => {
    const details = [afspraak.locatie, afspraak.voorbereiding, afspraak.notitie].filter(
      (detail): detail is string => Boolean(detail),
    );

    return {
      id: `afspraak-${afspraak.id}`,
      datum: afspraak.datumTijd,
      soort: 'afspraak',
      titel: afspraak.titel,
      label: AFSPRAAK_TYPE_LABELS[afspraak.type],
      detail: details.join(' · ') || 'Afspraak vastgelegd.',
      bron: 'Agenda',
      afspraakId: afspraak.id,
      trajectId: afspraak.trajectId,
    };
  });

  const consultItems = input.consultVerslagen.map(
    (verslag): BehandelGeschiedenisItem => ({
      id: `consult-${verslag.id}`,
      datum: verslag.datum,
      soort: 'consultverslag',
      titel: verslag.titel,
      label: 'Consultverslag',
      detail:
        verslag.samenvatting?.tekst ??
        verslag.tekst ??
        verslag.notitie ??
        'Consultverslag vastgelegd.',
      bron: verslag.bestandsNaam ? `Consultupload: ${verslag.bestandsNaam}` : 'Consulttekst',
      afspraakId: verslag.afspraakId,
      trajectId: verslag.trajectId,
    }),
  );

  const documentItems = input.dossierDocumenten.map(
    (document): BehandelGeschiedenisItem => ({
      id: `dossier-${document.id}`,
      datum: document.metadata.documentDatum ?? document.datum,
      soort: 'dossierdocument',
      titel: document.titel,
      label: document.uploadProfiel
        ? DOSSIER_UPLOAD_PROFIEL_LABELS[document.uploadProfiel]
        : DOSSIER_CATEGORIE_LABELS[document.categorie],
      detail: document.analyse.samenvatting,
      bron: document.metadata.bronbestand ?? document.bestandsNaam,
      afspraakId: document.afspraakId,
      trajectId: document.metadata.trajectId ?? document.trajectId,
    }),
  );

  return [...afspraakItems, ...consultItems, ...documentItems].sort(
    (a, b) =>
      a.datum.localeCompare(b.datum) ||
      volgordeSoort(a.soort) - volgordeSoort(b.soort) ||
      a.titel.localeCompare(b.titel),
  );
}

function volgordeSoort(soort: BehandelGeschiedenisItem['soort']): number {
  if (soort === 'afspraak') return 1;
  if (soort === 'consultverslag') return 2;
  return 3;
}
