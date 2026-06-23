# Kiempad — PRIVACY & AVG

> Combineert de privacy-/compliance-context. Kiempad verwerkt **bijzondere
> persoonsgegevens** (gezondheid) en is daarom met opzet streng en sober opgezet.

## Uitgangspunt

Gezondheidsgegevens zijn onder de **AVG** "bijzondere persoonsgegevens" met extra
bescherming. Kiempad behandelt **alle** inhoud als gevoelig en kiest standaard voor
de meest privacy-vriendelijke optie.

## Huishoudelijke uitzondering — en waarom de app privé blijft

Voor **puur persoonlijk/huishoudelijk** gebruik door onszelf geldt in de praktijk de
**huishoudelijke uitzondering** van de AVG. Die **vervalt** zodra de app of de data
wordt **gedeeld of gedistribueerd**. Daarom:

- De repo is **private**; de app wordt **niet** verspreid (zie [`LICENSE`](LICENSE)).
- Geen externe gebruikers, geen accounts voor derden.
- Dit is een **harde randvoorwaarde**, geen voorkeur.

## GDPR/AVG-principes zoals toegepast

- **Dataminimalisatie:** we slaan alleen op wat nuttig is voor het traject; vrije
  tekst blijft bij de gebruiker.
- **Opslagbeperking:** data leeft lokaal; de gebruiker kan alles wissen
  (recht op verwijdering is triviaal: lokaal verwijderen / app-data wissen).
- **Integriteit & vertrouwelijkheid:** versleuteling at rest (zie
  [`SECURITY.md`](SECURITY.md)).
- **Transparantie:** dit document + zichtbare disclaimer + herkomstmarkering bij
  kennis/AI.
- **Doelbinding:** data wordt alleen gebruikt voor het ondersteunen van óns traject.

## Dataminimalisatie naar buiten

Standaard gaat er **niets** naar derden. Alleen bij **expliciete opt-in**:

- **AI-samenvatting:** er wordt zo min mogelijk en zo veel mogelijk
  **gede-identificeerde** tekst verstuurd; geen namen, geen kliniek-identificatie als
  het niet hoeft. Externe AI-diensten verwerken data onder **eigen voorwaarden** —
  ga ervan uit dat verzonden tekst gecached/gelogd kan worden, en deel daarom zo min
  mogelijk identificeerbare info.
- **Sync (later):** end-to-end versleuteld; de relay ziet enkel onleesbare blobs.

## Geen tracking

- **Geen** analytics, **geen** telemetrie, **geen** advertenties, **geen** third-party
  scripts/cookies. "Observability" is puur lokaal (zie README → Observability).

## EU AI Act (kort)

De optionele AI-functie is een lichte hulpfunctie (samenvatten van research voor
eigen gebruik), **geen** besluitvormend of medisch systeem. We houden ons aan de
geest van transparantie: AI-output is gelabeld, herkomst is zichtbaar, en de gebruiker
beslist. De AI mag **geen** dosering/diagnose/behandeladvies geven.

## Bewaartermijnen

- Data blijft zolang de gebruiker dat wil; er is **geen** automatische upload of
  externe bewaring.
- Back-ups maakt en beheert de gebruiker zelf (versleutelde exportbestanden).
- Verwijderen = lokaal verwijderen; geen "schaduwkopie" elders.

## Transparantie en logging

- Een **lokaal** gebeurtenissenlog (in de app, blijft op het toestel) maakt zichtbaar
  wat de app deed; het verlaat het toestel niet.
- Bij elke opt-in actie naar buiten (AI/sync) is vooraf duidelijk **wat** er wordt
  verstuurd.

## Niet-medisch

Kiempad geeft **geen medisch advies** en is **geen medisch hulpmiddel**. Inhoud is
informatief; schema's volgen de kliniek; AI-output is ongeverifieerd tot een
behandelaar het bevestigt. Zie [`docs/adr/0004-geen-medisch-hulpmiddel.md`](docs/adr/0004-geen-medisch-hulpmiddel.md).

## Bron

- Autoriteit Persoonsgegevens — https://www.autoriteitpersoonsgegevens.nl/
