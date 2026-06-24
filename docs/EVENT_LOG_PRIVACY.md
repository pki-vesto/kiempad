# Event Log Privacy

Het eventlog is operationele metadata, geen tweede dossier. Details mogen helpen om
lokale acties te begrijpen, maar mogen geen gezondheidsinhoud, persoonlijke waarden of
vrije tekst uit uploads, consulten, prompts of notificaties opslaan.

## Wanneer mag detailtekst?

Detailtekst mag alleen generiek zijn, bijvoorbeeld:

- status zonder inhoud: "Back-upbestand is lokaal als download aangeboden.";
- count zonder labels: "12 records en 3 metadata-items verwerkt.";
- privacy-instelling zonder notificatie-inhoud: "Generieke meldingen blijven standaard.";
- AI-status zonder prompt, bronfragment of samenvatting.

Gebruik bij voorkeur aantallen, technische status of neutrale procesinformatie.

## Niet toestaan

Eventlogdetails mogen nooit bevatten:

- namen, e-mailadressen, BSN, patiënt- of dossiernummers;
- vragen, antwoorden, medicatie, afspraken, echo-, embryo-, lab- of symptoomtekst;
- prompts, consultnotities, OCR-tekst, bestandsnamen uit echte portalen of
  notificatie-inhoud;
- doseringen, behandelkeuzes of medische interpretaties.

## Allowlist governance

`src/domain/eventLog.ts` bevat een kleine exact-match allowlist met rationale voor
bestaande generieke details. Iedere entry moet een concrete rationale hebben en mag
niet matchen op gevoelige vrije tekst. Tests in `tests/eventLog.test.ts` falen wanneer
een entry geen rationale heeft of gevoelige detailtekst probeert toe te laten.

Nieuwe allowlist-items zijn alleen toegestaan als ze:

- generiek blijven;
- geen health free text bevatten;
- geen bestandsnaam, prompt, consulttekst of notificatie-inhoud bevatten;
- met een rationale naast de entry staan;
- in de PR worden genoemd.

Als een event meer context nodig heeft dan een generieke status of telling, hoort die
context in het versleutelde domeinrecord, niet in het eventlogdetail.
