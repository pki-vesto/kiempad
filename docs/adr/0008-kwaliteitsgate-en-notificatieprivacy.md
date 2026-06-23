# ADR-0008: Kwaliteitsgate en notificatieprivacy

Date: 2026-06-23

## Status

Accepted.

## Context

Kiempad wordt autonoom gebouwd en gemerged zodra CI groen is (ADR-0007). Daardoor moet
de CI-gate meer borgen dan alleen "de app compileert": consistente formatting, linting,
tests, audit en build moeten samen de minimale review vervangen.

Daarnaast gebruikt Kiempad lokale notificaties voor afspraken en medicatie. Die zijn
nuttig, maar OS-notificaties kunnen zichtbaar zijn op een vergrendeld scherm. Omdat
afspraak- en medicatienamen gevoelige gezondheidscontext kunnen lekken, moet de
notificatie-inhoud privacyveilig blijven tenzij de gebruiker expliciet anders kiest.

## Decision

- CI draait bij PR's en pushes naar `main` minimaal:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm audit --audit-level=high`
  - `npm run build`
- Biome is de gekozen lint/format-tool. De configuratie staat in `biome.json`; de gate
  faalt als gecontroleerde code niet aan die regels voldoet.
- OS-notificaties tonen standaard generieke tekst: "Er staat een herinnering klaar."
- Details in notificaties zijn alleen toegestaan na expliciete lokale keuze van de
  gebruiker.
- Die keuze wordt als gevoelig lokaal record versleuteld opgeslagen onder het
  `settings`-recordtype.
- De notificatieruntime centraliseert de keuze in één functie
  (`buildNotificationMessage`) zodat toekomstige herinneringstypen dezelfde privacyregel
  volgen.

## Consequences

- Autonome merges blijven mogelijk, maar de gate is strenger en reproduceerbaar lokaal.
- Formattingwijzigingen kunnen in aparte kwaliteits-PR's voorkomen; dat is acceptabel
  zolang de scope duidelijk is.
- De standaardnotificatie lekt geen medicatie-, afspraak- of vraagdetails op het
  vergrendelscherm.
- Gebruikers kunnen details toestaan als zij het apparaat- en meldingsrisico zelf
  acceptabel vinden.
- Nieuwe notificatiefeatures moeten via dezelfde settings- en runtimebeslissing lopen.
