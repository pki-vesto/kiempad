# ADR-0006: Repo publiek; gezondheidsdata blijft local-first en privé

Date: 2026-06-23

## Status

Accepted. Herziet de repo-zichtbaarheidsbeslissing uit
[ADR-0005](0005-buiten-sentinel-governance.md) (de rest van ADR-0005 — handmatige
ontwikkeling, buiten Sentinel-governance — blijft van kracht).

## Context

ADR-0005 koos voor een **private** repo. In de praktijk blokkeert de GitHub
Actions-billing/spending-limit van de `pki-vesto`-org echter CI op **private** repos
(de job start niet). De siblings (sentinel, health-core, nova-studio, berry, shred)
zijn daarom publiek. Belangrijk: de repo bevat **alleen code en documentatie** —
**geen** persoonsgegevens of gezondheidsdata (die zijn local-first en versleuteld op
het toestel, en staan niet in git).

## Decision

- De repo `pki-vesto/kiempad` is **publiek**, zodat CI/GitHub Actions werkt en de repo
  consistent is met de andere apps.
- **Gezondheidsdata blijft local-first, versleuteld en privé**; die gaat **nooit** de
  repo in (zie `.gitignore`: `.env`, `data/`, back-ups).
- De app wordt **niet als product aan derden** uitgerold; geen externe gebruikers.
- De licentie blijft **alle rechten voorbehouden** (zie `LICENSE`): publiek zichtbaar
  is niet hetzelfde als herbruikbaar.
- Alle data-privacyregels blijven onverkort gelden (geen tracking, opt-in voor
  uitgaand verkeer, dataminimalisatie, niet-medisch).

## Consequences

- **CI draait** weer; geen private-only billingblokkade meer.
- De **broncode en documentatie zijn publiek zichtbaar**, inclusief het feit dat dit
  het IVF/ICSI-traject van de eigenaren betreft. Dit is een **bewust geaccepteerde**
  keuze van de eigenaren; de onderliggende gezondheidsdata blijft privé.
- De **AVG-huishoudelijke uitzondering** voor de gegevensverwerking blijft van
  toepassing: het publiceren van broncode verwerkt geen persoonsgegevens.
- **Secret-hygiëne is kritisch**: omdat de repo publiek is, mag er nooit een secret of
  databestand in git terechtkomen (`.gitignore` + review borgen dit).
- Mocht de org-billing later private repos toelaten en zou privacy zwaarder wegen dan
  CI-gemak, dan kan deze beslissing opnieuw worden herzien.
