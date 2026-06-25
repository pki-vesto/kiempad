# ADR-0001: Stack en runtime — TypeScript PWA, MVP zonder verplichte backend

Date: 2026-06-23

## Status

Accepted for the original MVP runtime. De data-architectuurkeuze "geen backend /
lokale opslag primair" is vervangen door
[`ADR-0009: Centrale versleutelde data-architectuur`](0009-centrale-versleutelde-data-architectuur.md).

## Context

Kiempad begon als persoonlijke app voor één stel, mobielvriendelijk, local-first en
privacy-kritisch. De ecosysteem-default (zie `STANDARD_DOCSET.md`) is TypeScript/Node
API + worker met Postgres via Docker Compose. Voor de MVP werd een server-database
vermeden om privacy- en beheerrisico laag te houden.

## Decision

- **Frontend/app:** TypeScript + **Vite**, UI met **React** (sluit aan op de
  frontend-conventie van `sentinel` en `nova-studio`).
- **Vorm:** **PWA** (installeerbaar, offline, lokale notificaties).
- **Backend:** **geen** voor de MVP. Alle logica en data leven client-side.
- **Tests:** **Vitest** (ecosysteem-conventie).
- **Opslag:** historisch lokaal (zie ADR-0002), géén plaintext Postgres.

## Consequences

- Eén taal, snelle iteratie, geen serverbeheer of -kosten; werkt offline.
- Bewuste afwijking van de Postgres-default; gedocumenteerd hier en in
  `ARCHITECTURE.md` (Afgewogen alternatieven).
- De huidige richting gebruikt wél een minimale centrale dienst, maar uitsluitend voor
  **client-side versleutelde envelopes**; backend en database zien geen plaintext
  medische/fertiliteitsinhoud (zie ADR-0009 en `ARCHITECTURE.md`).
- Notificaties/offline hangen af van de service worker en browser-permissies.
