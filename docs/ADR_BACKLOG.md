# Architecture Decision Backlog

Deze backlog bewaakt open doelen die eerst ADR-review nodig hebben voordat ze als
implementatie worden opgepakt. De bronmarkering staat in `EXECUTION_GOALS.md` als
`ADR Needed: yes` of `ADR Needed: no`.

## Markerregels

- `yes` — het doel kan privacy-, opslag-, netwerk-, AI-, sync- of governancekeuzes
  veranderen en heeft ADR-review nodig voordat code wordt gebouwd.
- `no` — het doel past binnen bestaande ADR's en kan met normale goal-audit worden
  uitgevoerd.

Een `yes`-doel hoeft niet altijd een nieuwe ADR op te leveren. De review mag ook
vastleggen dat een bestaande ADR voldoende is, maar die conclusie moet in PR of docs
expliciet zijn.

Gebruik [`ADR_REVIEW_EVIDENCE_TEMPLATE.md`](ADR_REVIEW_EVIDENCE_TEMPLATE.md) om die
conclusie vast te leggen. Het template registreert goal-id, reviewer/datum,
geraadpleegde ADR's, besluituitkomst, ADR-route, follow-up en evidencegrenzen.
De huidige reviewstatus per ADR-needed goal staat in
[`ADR_REVIEW_EVIDENCE_INDEX.md`](ADR_REVIEW_EVIDENCE_INDEX.md).

## Pending ADR Topics

| Goal | Topic | Waarom ADR-review nodig is | Waarschijnlijke ADR-route |
|---|---|---|---|
| G266 | Partner Handoff Mode | Gedeeld gebruik kan privacygrenzen, accountmodel en lokale dataset-afspraken veranderen. | Update ADR-0002 of nieuwe ADR voor gedeelde lokale modus. |
| G304 | On-Device Summarizer Adapter | Lokale AI-adapters raken modeldownload, browsercapabilities en outputgrenzen. | Update ADR-0003 met on-device adaptercontract. |
| G315 | AI Provider Health Check | Providerchecks kunnen netwerkverkeer, key-validatie en fouttelemetrie introduceren. | Update ADR-0003 of aparte ADR voor providerdiagnostiek. |
| G323 | AI Data Retention Controls | Retentie van AI-concepten raakt opslagbeleid, verwijdering en auditbaarheid. | Update ADR-0003 en ADR-0002. |
| G344 | Future Sync Relay Threat Model | Een relay verandert sync-topologie, metadata-lekage, auth, replay en retentie. | Nieuwe ADR voor E2E-sync relay. |

## Onderhoud

- Nieuwe doelen met externe netwerkpaden, opslagwijzigingen, shared-mode,
  AI-providerintegratie, sync-relay of autonome governance krijgen standaard
  `ADR Needed: yes`.
- Sluit een ADR-needed doel pas als het PR-bewijs naar de relevante ADR-review wijst.
- Gebruik het ADR-review evidence template voor ingevulde reviewbewijzen.
- Houd de ADR-review evidence index synchroon met dezelfde `ADR Needed: yes` set.
- Houd deze tabel synchroon met alle `ADR Needed: yes` entries in
  `EXECUTION_GOALS.md`.
