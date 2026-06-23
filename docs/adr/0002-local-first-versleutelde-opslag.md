# ADR-0002: Local-first, versleutelde lokale opslag

Date: 2026-06-23

## Status

Accepted.

## Context

Kiempad verwerkt **AVG-bijzondere persoonsgegevens** (gezondheid). De harde
randvoorwaarde is dat data **lokaal en/of versleuteld** blijft en dat er standaard
**niets** naar derden gaat. We willen ook offline kunnen werken.

## Decision

- **Opslag:** **IndexedDB** op het toestel. Records worden **versleuteld** bewaard;
  alleen niet-gevoelige indexvelden staan in klare tekst waar zoeken/sorteren dat
  echt vereist (bewust minimaal).
- **Versleuteling:** **AES-256-GCM** per record (uniek IV), via de Web Crypto API.
- **Sleutel:** afgeleid uit een **passphrase** met **PBKDF2** (hoge iteratietelling)
  of Argon2id, met per-installatie **salt**. De sleutel bestaat alleen **in geheugen**
  zolang de sessie ontgrendeld is; hij wordt nooit platgeschreven of geëxporteerd.
- **Back-up:** **versleutelde export/import** als bestand; de gebruiker beheert dit
  zelf.
- **Migraties:** **additief** (velden komen erbij; bestaande betekenis verandert niet).

## Consequences

- Sterke privacy en eenvoud; geen server-DB, geen externe bewaring.
- **Geen herstel-achterdeur:** wie de passphrase kwijt is en geen back-up heeft, raakt
  de data kwijt. Dit is een bewuste keuze; de app moet hier duidelijk over zijn en
  back-ups aanmoedigen.
- Vereist discipline rond sleutelafleiding, IV-uniekheid en migraties.
- Een latere sync moet end-to-end versleuteld zijn (relay ziet enkel blobs).
