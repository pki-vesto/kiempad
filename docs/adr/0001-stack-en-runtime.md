# ADR-0001: Stack en runtime — TypeScript PWA, geen verplichte backend

Date: 2026-06-23

## Status

Accepted.

## Context

Kiempad is een persoonlijke app voor één stel, mobielvriendelijk, local-first en
privacy-kritisch. De ecosysteem-default (zie `STANDARD_DOCSET.md`) is TypeScript/Node
API + worker met Postgres via Docker Compose. Dat is uitstekend voor revenue-apps,
maar een server-database staat haaks op "local-first" en vergroot het privacy- en
beheerrisico voor één stel.

## Decision

- **Frontend/app:** TypeScript + **Vite**, UI met **React** (sluit aan op de
  frontend-conventie van `sentinel` en `nova-studio`).
- **Vorm:** **PWA** (installeerbaar, offline, lokale notificaties).
- **Backend:** **geen** voor de MVP. Alle logica en data leven client-side.
- **Tests:** **Vitest** (ecosysteem-conventie).
- **Opslag:** lokaal (zie ADR-0002), géén Postgres.

## Consequences

- Eén taal, snelle iteratie, geen serverbeheer of -kosten; werkt offline.
- Bewuste afwijking van de Postgres-default; gedocumenteerd hier en in
  `ARCHITECTURE.md` (Afgewogen alternatieven).
- Een latere, optionele sync vereist wél een minimale dienst, maar uitsluitend voor
  **versleutelde blobs** (zie ADR-0002 en `ARCHITECTURE.md` §4).
- Notificaties/offline hangen af van de service worker en browser-permissies.
