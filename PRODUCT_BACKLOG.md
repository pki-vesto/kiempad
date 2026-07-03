# Kiempad — PRODUCT_BACKLOG (de doelen)

> Dit document is tegelijk de vereiste **doelenlijst** (minimaal 100 concrete,
> toetsbare doelen) **én** de productbacklog. Elk doel heeft een **id**, een
> **omschrijving**, een **prioriteit** en de **fase** uit [`ROADMAP.md`](ROADMAP.md).
> Een doel is bewust "afvinkbaar" geformuleerd. We houden bewust één lijst aan zodat
> doelen en backlog niet uit elkaar lopen.

## Statuslegenda

- ☐ open — nog niet begonnen
- ◐ bezig — in uitvoering
- ☑ klaar — gedaan en (waar van toepassing) getest
- ☒ archived — bewust gesloten als niet-actueel werk onder zero-cleanup

## Prioriteiten

- **P0** — kritisch / fundament (privacy, veiligheid, MVP-basis)
- **P1** — MVP must-have
- **P2** — nice-to-have
- **P3** — later / toekomst

## Fasen

`F0` fundament · `F1` MVP · `F2` nice-to-have · `F3` later · `F4` toekomst ·
`F5` strategische intelligence-laag (zie
[`ROADMAP.md`](ROADMAP.md)).

## Samenvatting per status

| Status | Aantal |
|---|---|
| ☑ klaar | 1177 |
| ◐ bezig | 0 |
| ☐ open | 100 |
| ☒ archived | 99 |
| **Totaal** | **1376** |

> Werk deze telling bij wanneer je statussen wijzigt (zie permanente onderhoudsregel
> onderaan).

---

## 1. Fundament & projectopzet

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G001 | Private GitHub-repo `pki-vesto/kiempad` bestaat | P0 | F0 | ☑ |
| G002 | Documentatieset compleet en consistent (deze repo) | P0 | F0 | ☑ |
| G003 | TypeScript/Vite-projectopzet met `package.json`, `tsconfig.json` | P0 | F0 | ☑ |
| G004 | Vitest geconfigureerd (`vitest.config.ts`) | P0 | F0 | ☑ |
| G005 | `Makefile` met install/dev/build/test/up/down | P1 | F0 | ☑ |
| G006 | `Dockerfile` + `docker-compose.yml` voor optioneel zelf-hosten (stateless) | P2 | F0 | ☑ |
| G007 | `.gitignore` sluit `.env`, data en back-ups uit | P0 | F0 | ☑ |
| G008 | `.env.example` met enkel lege placeholders | P0 | F0 | ☑ |
| G009 | `LICENSE` (persoonlijk gebruik, alle rechten voorbehouden) | P1 | F0 | ☑ |
| G010 | `.github`-templates (PR, issues) + CI-workflow | P1 | F0 | ☑ |
| G011 | CI draait typecheck + tests op elke PR | P1 | F0 | ☑ |
| G012 | Domein-kernvormen in `src/domain/types.ts` | P0 | F0 | ☑ |
| G013 | Eerste geteste domeinregel (`vergoeding.ts`) | P1 | F0 | ☑ |
| G014 | `npm run typecheck` is groen | P0 | F0 | ☑ |
| G015 | `npm run test` is groen | P0 | F0 | ☑ |
| G016 | App-skelet (Vite-app start met `npm run dev`) | P0 | F1 | ☑ |
| G017 | Basis-routing/navigatie tussen hoofdschermen | P1 | F1 | ☑ |
| G018 | Zichtbare disclaimer in de app (geen medisch advies) | P0 | F1 | ☑ |

## 2. Traject & fasen

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G019 | Traject (cyclus/poging) aanmaken, bewerken, verwijderen | P0 | F1 | ☑ |
| G020 | Trajectstatus zetten (gepland/lopend/afgerond/gepauzeerd/geannuleerd) | P1 | F1 | ☑ |
| G021 | Fasen van een traject tonen in vaste volgorde | P0 | F1 | ☑ |
| G022 | Huidige fase markeren en wijzigen | P0 | F1 | ☑ |
| G023 | Per fase een korte toelichting/verwachting tonen (uit kennisbank) | P1 | F1 | ☑ |
| G024 | Tijdlijn/overzichtsweergave van het traject | P1 | F1 | ☑ |
| G025 | "Volgende stap/afspraak" prominent op het startscherm | P1 | F1 | ☑ |
| G026 | Meerdere trajecten/pogingen naast elkaar bewaren | P2 | F2 | ☑ |
| G027 | Pogingnummer bijhouden t.b.v. vergoedingstelling | P2 | F2 | ☑ |
| G028 | Notities per traject | P2 | F1 | ☑ |
| G029 | Trajecten archiveren zonder te verwijderen | P3 | F3 | ☑ |
| G030 | Trends/overzicht over meerdere cycli | P3 | F3 | ☑ |

## 3. Agenda & afspraken

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G031 | Afspraak aanmaken (titel, datum-tijd, type, locatie) | P0 | F1 | ☑ |
| G032 | Afspraak bewerken en verwijderen | P0 | F1 | ☑ |
| G033 | Afspraaktypes (echo/bloedprik/punctie/terugplaatsing/consult/overig) | P1 | F1 | ☑ |
| G034 | Agenda-lijstweergave (komende afspraken) | P0 | F1 | ☑ |
| G035 | Agenda-maand-/weekweergave | P2 | F2 | ☑ |
| G036 | Afspraak koppelen aan een traject | P1 | F1 | ☑ |
| G037 | Voorbereiding/notitie per afspraak | P1 | F1 | ☑ |
| G038 | Vragen-voor-de-arts koppelen aan een afspraak | P1 | F1 | ☑ |
| G039 | Herinnering instellen bij een afspraak | P1 | F1 | ☑ |
| G040 | Afgelopen afspraken als "geweest" tonen met terugblik/notitie | P2 | F2 | ☑ |
| G041 | ICS-export van afspraken | P3 | F3 | ☑ |
| G042 | ICS-import (lezen) van een kliniek-agenda | P3 | F3 | ☑ |

## 4. Medicatie & injectieschema

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G043 | Medicatie toevoegen (naam, vorm, instructie) | P0 | F1 | ☑ |
| G044 | Voorgeschreven dosis vastleggen **zoals door de kliniek opgegeven** | P0 | F1 | ☑ |
| G045 | App berekent/adviseert **nooit** zelf een dosering (policy-test) | P0 | F1 | ☑ |
| G046 | Medicatie als actief/inactief markeren | P1 | F1 | ☑ |
| G047 | Injectievorm apart ondersteunen (timing belangrijk) | P0 | F1 | ☑ |
| G048 | DoseLog: geplande inname/injectie per dag genereren | P0 | F1 | ☑ |
| G049 | Inname afvinken (genomen/overgeslagen) met tijdstip | P0 | F1 | ☑ |
| G050 | Dagoverzicht "wat moet ik vandaag innemen/injecteren" | P0 | F1 | ☑ |
| G051 | Waarschuwing/markering bij gemiste inname | P1 | F1 | ☑ |
| G052 | Notitie per inname (bv. bijwerking, plek injectie) | P2 | F2 | ☑ |
| G053 | Historie van innames per medicatie | P2 | F2 | ☑ |
| G054 | Voorraad/teller (nog X doses over) | P3 | F3 | ☑ |
| G055 | Schema importeren vanaf een klinieklijstje (handmatig invoeren, gestructureerd) | P2 | F2 | ☑ |
| G056 | Injectie-instructievideo/-tekst koppelen (lokaal, geen tracking) | P3 | F3 | ☑ |

## 5. Herinneringen & notificaties

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G057 | Lokale notificaties via service worker | P0 | F1 | ☑ |
| G058 | Herinnering voor medicatie/injectie op tijdstip | P0 | F1 | ☑ |
| G059 | Herinnering voor afspraken | P1 | F1 | ☑ |
| G060 | Eigen losse herinneringen | P2 | F2 | ☑ |
| G061 | Herhaling (eenmalig/dagelijks/wekelijks) | P1 | F1 | ☑ |
| G062 | Instelbare standaard-waarschuwtijd (bv. 30 min vooraf) | P2 | F2 | ☑ |
| G063 | Herinnering snoozen / opnieuw plannen | P2 | F2 | ☑ |
| G064 | Notificatie-permissie netjes aanvragen + uitleg bij weigering | P1 | F1 | ☑ |
| G065 | Fallback in-app meldingen als notificaties uit staan | P2 | F2 | ☑ |
| G066 | Geen notificatie-inhoud lekt gevoelige data op vergrendeld scherm (instelbaar) | P1 | F1 | ☑ |

## 6. Vragen voor de arts

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G067 | Vraag toevoegen/bewerken/verwijderen | P0 | F1 | ☑ |
| G068 | Vraag koppelen aan een (komende) afspraak | P1 | F1 | ☑ |
| G069 | Vragen markeren als beantwoord met antwoord-tekst | P1 | F1 | ☑ |
| G070 | Overzicht "openstaande vragen voor volgende afspraak" | P1 | F1 | ☑ |
| G071 | Vragen herordenen (prioriteit voor het consult) | P2 | F2 | ☑ |
| G072 | Beantwoorde vragen teruglezen als verslag per afspraak | P2 | F2 | ☑ |

## 7. Kennisbank

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G073 | KennisItem-model met categorie + herkomstmarkeringen | P1 | F1 | ☑ |
| G074 | Kennisitems tonen per categorie (fasen/leefstijl/kosten/research) | P1 | F1 | ☑ |
| G075 | Label `ai_gegenereerd` zichtbaar bij item | P0 | F1 | ☑ |
| G076 | Label `geverifieerd_met_arts` zichtbaar bij item | P0 | F1 | ☑ |
| G077 | Bronvermelding zichtbaar bij item | P1 | F1 | ☑ |
| G078 | Initiële NL-inhoud "fasen" opgenomen (concept) | P1 | F1 | ☑ |
| G079 | Initiële NL-inhoud "leefstijl" opgenomen (concept) | P2 | F1 | ☑ |
| G080 | Initiële NL-inhoud "kosten 2026" opgenomen (concept) | P1 | F1 | ☑ |
| G081 | Zoeken/filteren in de kennisbank | P2 | F2 | ☑ |
| G082 | Eigen kennisitems toevoegen/bewerken | P2 | F2 | ☑ |
| G083 | Item markeren als "geverifieerd" na bevestiging behandelaar | P1 | F1 | ☑ |
| G084 | Jaartal-markering bij kosten-items (vergoeding wijzigt jaarlijks) | P2 | F2 | ☑ |

## 8. Kosten & vergoedingen

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G085 | CostItem toevoegen/bewerken/verwijderen | P2 | F2 | ☑ |
| G086 | Kosten categoriseren (medicatie/behandeling/reis/overig) | P2 | F2 | ☑ |
| G087 | Markeren of een kostenpost vergoed/eigen risico/zelf is | P2 | F2 | ☑ |
| G088 | Overzicht totale kosten en eigen bijdrage | P2 | F2 | ☑ |
| G089 | Eigen-risico-teller (€385 in 2026) | P2 | F2 | ☑ |
| G090 | Vergoede-pogingen-teller (3 per zwangerschap, <43 jr) | P2 | F2 | ☑ |
| G091 | Regel "poging telt pas na geslaagde punctie" toegepast | P2 | F2 | ☑ |
| G092 | Verwijzing naar eigen polis/verzekeraar (leidend) zichtbaar | P2 | F2 | ☑ |
| G093 | Disclaimer "geen financieel advies, cijfers 2026" bij kostenmodule | P2 | F2 | ☑ |

## 9. Research & AI

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G094 | Research-item (link/notitie/bron) opslaan in bibliotheek | P2 | F2 | ☑ |
| G095 | AI-functie staat **standaard uit** (opt-in) | P0 | F2 | ☑ |
| G096 | AI-samenvatting alleen op expliciet verzoek | P0 | F2 | ☑ |
| G097 | Verstuurde tekst wordt geminimaliseerd/gede-identificeerd | P0 | F2 | ☑ |
| G098 | AI-output draagt waarschuwingslabel + bron | P0 | F2 | ☑ |
| G099 | AI geeft **nooit** dosering/diagnose/behandelkeuze (policy-test) | P0 | F2 | ☑ |
| G100 | AI-API-sleutel versleuteld lokaal opgeslagen (niet in repo/.env) | P0 | F2 | ☑ |
| G101 | Vooraf zichtbaar **wat** er naar de AI wordt verstuurd | P1 | F2 | ☑ |
| G102 | Keuze van provider/model in instellingen | P2 | F2 | ☑ |
| G103 | AI-samenvatting opgeslagen als KennisItem met `ai_gegenereerd=true` | P1 | F2 | ☑ |
| G104 | On-device AI verkennen (geen cloud-stap) | P3 | F4 | ☑ |

## 10. Symptomen, cyclus & welzijn

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G105 | SymptomLog toevoegen (datum, symptoom, intensiteit, notitie) | P2 | F2 | ☑ |
| G106 | Symptomen per dag/over tijd tonen | P2 | F2 | ☑ |
| G107 | CycleData vastleggen (bv. temperatuur/bloeding) | P3 | F3 | ☑ |
| G108 | Mentale check-in (stemming) met privé notitie | P2 | F2 | ☑ |
| G109 | Welzijn-overzicht zonder oordeel/score-druk | P2 | F2 | ☑ |
| G110 | Owner-markering (peter/partner/samen) bij logs | P2 | F2 | ☑ |
| G111 | Trends van symptomen/welzijn over meerdere cycli | P3 | F3 | ☑ |

## 11. Afwegingen / beslisnotities

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G112 | Decision aanmaken met onderwerp en opties | P2 | F2 | ☑ |
| G113 | Voors/tegens per optie vastleggen | P2 | F2 | ☑ |
| G114 | Gemaakte keuze + onderbouwing + datum vastleggen | P2 | F2 | ☑ |
| G115 | Afwegingen teruglezen als beslisverslag | P2 | F2 | ☑ |
| G116 | Afweging koppelen aan een vraag voor de arts | P3 | F2 | ☑ |

## 12. Privacy & beveiliging

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G117 | Versleuteling at rest (AES-GCM) voor alle gevoelige records | P0 | F1 | ☑ |
| G118 | Sleutel afgeleid uit passphrase (PBKDF2/Argon2id) + salt | P0 | F1 | ☑ |
| G119 | Sleutel alleen in geheugen; nooit platgeschreven/geëxporteerd | P0 | F1 | ☑ |
| G120 | Ontgrendelen met passphrase | P0 | F1 | ☑ |
| G121 | Optioneel biometrie/WebAuthn als ontgrendelgemak | P2 | F2 | ☑ |
| G122 | Automatische vergrendeling na inactiviteit | P1 | F1 | ☑ |
| G123 | Geen tracking/analytics/advertenties/third-party scripts | P0 | F1 | ☑ |
| G124 | Geen standaard uitgaand verkeer (privacy-rooktest in CI/handmatig) | P0 | F1 | ☑ |
| G125 | Opt-in vereist voor elk uitgaand verkeer (AI/sync) | P0 | F2 | ☑ |
| G126 | Lokaal gebeurtenissenlog (verlaat toestel niet) | P2 | F2 | ☑ |
| G127 | Duidelijke "geen herstel-achterdeur"-uitleg + back-up-aansporing | P1 | F1 | ☑ |
| G128 | Minimale npm-dependencies; audit-stap in CI | P1 | F1 | ☑ |
| G129 | Geen secrets/persoonsdata in de (publieke) repo; data blijft local-first (ADR-0006) | P0 | F0 | ☑ |
| G130 | Disclaimer zichtbaar in app én docs | P0 | F1 | ☑ |

## 13. Datamodel & opslag

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G131 | IndexedDB-opslaglaag met repository-interface | P0 | F1 | ☑ |
| G132 | Records versleuteld; minimale klare-tekst indexvelden | P0 | F1 | ☑ |
| G133 | Datamodel-types in code synchroon met `DATAMODEL.md` | P1 | F1 | ☑ |
| G134 | UUID-id-generatie client-side | P1 | F1 | ☑ |
| G135 | ISO-8601 datums/tijden als tekst opgeslagen | P1 | F1 | ☑ |
| G136 | Additieve migratiestrategie (geen betekeniswijziging) | P1 | F1 | ☑ |
| G137 | Migratie-/schemaversie bijgehouden in opslag | P2 | F2 | ☑ |
| G138 | Seed van initiële kennisbank-inhoud bij eerste start | P2 | F1 | ☑ |

## 14. Back-up, export & sync

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G139 | Versleutelde export naar bestand (`*.kiempad-export`) | P1 | F2 | ☑ |
| G140 | Import van versleutelde export (zelfde/ander toestel) | P1 | F2 | ☑ |
| G141 | Export-integriteit gecontroleerd bij import | P1 | F2 | ☑ |
| G142 | Herinnering/aanmoediging om periodiek te back-uppen | P2 | F2 | ☑ |
| G143 | E2E-versleutelde sync tussen apparaten | P3 | F3 | ☑ |
| G144 | Sync-relay ziet enkel onleesbare blobs | P3 | F3 | ☑ |
| G145 | Conflictafhandeling bij sync (laatste-wint of merge) | P3 | F3 | ☑ |
| G146 | PDF-export voor het consult (lokaal gegenereerd) | P3 | F3 | ☑ |

## 15. UX, toegankelijkheid & PWA

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G147 | Warme, niet-klinische, rustige toon in UI en teksten | P1 | F1 | ☑ |
| G148 | Mobielvriendelijke, responsieve layout | P0 | F1 | ☑ |
| G149 | PWA installeerbaar (manifest, icons) | P1 | F1 | ☑ |
| G150 | Volledig offline bruikbaar na eerste laden | P1 | F1 | ☑ |
| G151 | Startscherm met "waar staan we / wat is de volgende stap" | P1 | F1 | ☑ |
| G152 | Toegankelijkheid: contrast, focus, toetsenbordnavigatie | P1 | F1 | ☑ |
| G153 | Schermlezer-vriendelijke labels (ARIA) | P2 | F2 | ☑ |
| G154 | Donkere modus | P3 | F2 | ☑ |
| G155 | Nederlandstalige UI (default `nl`) | P1 | F1 | ☑ |
| G156 | Lege-staten met vriendelijke uitleg i.p.v. lege schermen | P2 | F1 | ☑ |
| G157 | Bevestiging bij destructieve acties (verwijderen) | P1 | F1 | ☑ |
| G158 | Snelle invoer (zo min mogelijk velden verplicht) | P2 | F1 | ☑ |

## 16. Testen & kwaliteit

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G159 | Unit-tests voor domeinregels (vergoeding, fase-logica, datums) | P1 | F1 | ☑ |
| G160 | Tests voor versleuteling/ontsleuteling (round-trip) | P0 | F1 | ☑ |
| G161 | Tests voor opslaglaag (CRUD op IndexedDB, mock) | P1 | F1 | ☑ |
| G162 | Tests voor herinnering-/DoseLog-generatie | P1 | F1 | ☑ |
| G163 | Policy-test: geen dosering-/diagnose-output | P0 | F1 | ☑ |
| G164 | Privacy-test: geen uitgaand verkeer zonder opt-in | P0 | F1 | ☑ |
| G165 | CI groen vereist vóór merge | P1 | F0 | ☑ |
| G166 | Linting/formatting consistent (bv. eslint/prettier of biome) | P2 | F1 | ☑ |

## 17. Documentatie & onderhoud

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G167 | `CURRENT_STATE.md` actueel gehouden per wijziging | P1 | F0 | ☑ |
| G168 | `CHANGELOG.md` bijgewerkt per wijziging | P1 | F0 | ☑ |
| G169 | ADR toegevoegd bij elke belangrijke keuze | P1 | F0 | ☑ |
| G170 | Backlog-telling bijgewerkt bij statuswijziging | P2 | F0 | ☑ |
| G171 | Kennisbank-inhoud periodiek verifiëren met behandelaars | P1 | F1 | ☑ |
| G172 | Vergoedingscijfers jaarlijks herzien | P2 | F2 | ☑ |
| G173 | Dependencies periodiek updaten (security) | P1 | F1 | ☑ |
| G174 | Disclaimer-tekst review bij elke release | P1 | F1 | ☑ |

## 18. Dossier & uploads

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G175 | Met terugwerkende kracht alle onderzoeken uploaden en analyseren | P2 | F2 | ☑ |
| G176 | Foto's, echo's en ander beeldmateriaal uploaden als dossierbijlage | P2 | F2 | ☑ |
| G177 | Gespreksverslagen uploaden en koppelen aan relevante afspraken of trajecten | P2 | F2 | ☑ |
| G178 | Embryokwaliteit uploaden of vastleggen per embryo, poging of terugplaatsing | P2 | F2 | ☑ |

## 19. Publicatie & infrastructuur

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G179 | App publiceren via Tailscale op een aparte node met HTTPS, vergelijkbaar met Shred en Healthcore | P2 | F2 | ☑ |

## 20. Personal Fertility Intelligence Platform

Bron: [`docs/PERSONAL_FERTILITY_INTELLIGENCE_PLATFORM.md`](docs/PERSONAL_FERTILITY_INTELLIGENCE_PLATFORM.md).

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G180 | PFIP dossier-ingest: uploadprofielen voor onderzoeken, labuitslagen, rapporten, ziekenhuisdocumenten, behandelverslagen, PDF's en afbeeldingen | P0 | F3 | ☑ |
| G181 | PFIP dossier-ingest: client-side OCR-pipeline voor PDF's en afbeeldingen met expliciete lokale verwerking | P0 | F3 | ☑ |
| G182 | PFIP dossier-ingest: metadata-extractie voor datum, instelling, documenttype, traject, arts en bronbestand | P0 | F3 | ☑ |
| G183 | PFIP dossier-ingest: herkende documenten als conceptrecords laten bevestigen of corrigeren vóór opslag | P0 | F3 | ☑ |
| G184 | PFIP dossier-ingest: medische documenttijdlijn automatisch opbouwen uit metadata en gebruiker-correcties | P0 | F3 | ☑ |
| G185 | PFIP dossier-ingest: dossierindex met documenttype, bron, datum, traject en tags | P1 | F3 | ☑ |
| G186 | PFIP dossier-ingest: full-text zoeken in OCR-tekst en handmatige notities binnen de lokale kluis | P1 | F3 | ☑ |
| G187 | PFIP dossier-ingest: privacytest dat OCR en extractie geen netwerkverkeer starten zonder opt-in | P0 | F3 | ☑ |
| G188 | PFIP imaging: imaging-repository voor echo's, foto's, scans en embryo-afbeeldingen als aparte dossierweergave | P0 | F3 | ☑ |
| G189 | PFIP imaging: lokale beeldclassificatie naar echo, foto, scan, embryo of overig beeld | P1 | F3 | ☑ |
| G190 | PFIP imaging: beeldmetadata vastleggen voor datum, lichaams-/trajectcontext, bron en gekoppelde afspraak | P1 | F3 | ☑ |
| G191 | PFIP imaging: tijdlijnkoppeling voor beelden aan poging, afspraak, cyclusdag of embryo | P0 | F3 | ☑ |
| G192 | PFIP imaging: vergelijking tussen twee beeldmomenten met notities zonder medische interpretatie | P1 | F3 | ☑ |
| G193 | PFIP imaging: AI-samenvatting van beeldcontext alleen als tekstuele gebruiker-notitie en met waarschuwing | P1 | F4 | ☑ |
| G194 | PFIP imaging: thumbnail- en previewstates voor versleutelde beelden na ontgrendeling | P1 | F3 | ☑ |
| G195 | PFIP imaging: beeldrepository filteren op type, datum, traject, afspraak en embryo | P1 | F3 | ☑ |
| G196 | PFIP consult intelligence: consultverslagen als apart recordtype naast algemene dossierdocumenten | P0 | F3 | ☑ |
| G197 | PFIP consult intelligence: automatische consultsamenvatting met bronverwijzing en conceptlabel | P0 | F4 | ☑ |
| G198 | PFIP consult intelligence: actiepunten uit consulten extraheren als lokale taken of vragen | P0 | F3 | ☑ |
| G199 | PFIP consult intelligence: vragenlijst genereren voor volgende afspraak op basis van open punten | P0 | F3 | ☑ |
| G200 | PFIP consult intelligence: behandelgeschiedenis reconstrueren uit consulten, afspraken en dossierdocumenten | P0 | F3 | ☑ |
| G201 | PFIP consult intelligence: consultinzichten koppelen aan trajectfase, medicatie, embryo of onderzoek | P1 | F3 | ☑ |
| G202 | PFIP consult intelligence: verschilweergave tussen consultsamenvatting en gebruiker-correctie | P2 | F4 | ☑ |
| G203 | PFIP consult intelligence: safety-policy dat consult-AI geen diagnose of behandelkeuze adviseert | P0 | F3 | ☑ |
| G204 | PFIP embryo tracking: embryo-dossier als eigen overzicht per embryo binnen een poging | P0 | F3 | ☑ |
| G205 | PFIP embryo tracking: embryo uploads koppelen aan embryo-id, dag, poging en laboratoriumcontext | P0 | F3 | ☑ |
| G206 | PFIP embryo tracking: kwaliteitsregistratie per meetmoment met kliniekterminologie en bron | P0 | F3 | ☑ |
| G207 | PFIP embryo tracking: embryo-historie tonen van bevruchting tot terugplaatsing/invriezen/stop | P0 | F3 | ☑ |
| G208 | PFIP embryo tracking: embryo's binnen dezelfde poging vergelijken zonder kansberekening | P1 | F3 | ☑ |
| G209 | PFIP embryo tracking: embryo-tijdlijn integreren met afspraken, labrapporten en terugplaatsing | P0 | F3 | ☑ |
| G210 | PFIP embryo tracking: behandelcontext tonen bij embryo, inclusief protocol, poging en relevante notities | P1 | F3 | ☑ |
| G211 | PFIP embryo tracking: waarschuwing dat embryokwaliteit geen voorspelling of medisch advies is | P0 | F3 | ☑ |
| G212 | PFIP research intelligence: bronnenlijst voor relevante fertiliteitsresearch met handmatige seed en lokale cache | P1 | F4 | ☑ |
| G213 | PFIP research intelligence: researchaggregatie achter expliciete netwerk-opt-in | P0 | F4 | ☑ |
| G214 | PFIP research intelligence: wetenschappelijke samenvatting per publicatie met bron en datum | P1 | F4 | ☑ |
| G215 | PFIP research intelligence: eenvoudige lekensamenvatting per publicatie in begrijpelijk Nederlands | P0 | F4 | ☑ |
| G216 | PFIP research intelligence: relevantie voor gebruiker koppelen aan dossiercontext zonder behandeladvies | P0 | F4 | ☑ |
| G217 | PFIP research intelligence: trends groeperen per onderwerp zoals IVF, ICSI, embryo, leefstijl en mannelijke factor | P2 | F4 | ☑ |
| G218 | PFIP research intelligence: bronverificatie en publicatiedatum zichtbaar bij iedere researchkaart | P0 | F4 | ☑ |
| G219 | PFIP research intelligence: verouderde research markeren en periodieke herverificatie plannen | P1 | F4 | ☑ |
| G220 | PFIP daily recommendations: dagelijks aanbevelingsoverzicht met scheiding vrouw, man en samen | P0 | F4 | ☑ |
| G221 | PFIP daily recommendations: leefstijlaanbevelingen baseren op dossier, cyclusfase en behandelgeschiedenis | P0 | F4 | ☑ |
| G222 | PFIP daily recommendations: voeding- en supplementnotities tonen als checklijst met bron en disclaimer | P0 | F4 | ☑ |
| G223 | PFIP daily recommendations: behandelvoorbereiding genereren uit afspraken, medicatie en open actiepunten | P0 | F4 | ☑ |
| G224 | PFIP daily recommendations: cyclusgerelateerde aanbevelingen tonen zonder diagnose of dosering | P0 | F4 | ☑ |
| G225 | PFIP daily recommendations: mannelijke vruchtbaarheidsoptimalisatie als leefstijl- en voorbereidingskaart | P1 | F4 | ☑ |
| G226 | PFIP daily recommendations: aanbevelingen uitlegbaar maken met gebruikte dossierbronnen | P0 | F4 | ☑ |
| G227 | PFIP daily recommendations: gebruiker kan aanbevelingen afwijzen, bewaren of omzetten naar herinnering/vraag | P1 | F4 | ☑ |
| G228 | PFIP knowledge graph: lokaal graph-model voor relaties tussen documenten, embryo's, behandelingen, gesprekken, research en aanbevelingen | P0 | F4 | ☑ |
| G229 | PFIP knowledge graph: graph-relaties automatisch voorstellen en handmatig laten bevestigen | P0 | F4 | ☑ |
| G230 | PFIP knowledge graph: contextuele inzichten genereren met bronpad en onzekerheidslabel | P0 | F4 | ☑ |
| G231 | PFIP knowledge graph: graphweergave per traject met filters op type relatie en periode | P2 | F4 | ☑ |
| G232 | PFIP knowledge graph: relatie tussen research en persoonlijk dossier tonen zonder causale claims | P0 | F4 | ☑ |
| G233 | PFIP knowledge graph: index rebuild vanuit versleutelde records zonder dataverlies | P1 | F4 | ☑ |
| G234 | PFIP knowledge graph: privacytest dat graphberekening lokaal blijft | P0 | F4 | ☑ |
| G235 | PFIP knowledge graph: exporteerbare graph-samenvatting voor consultvoorbereiding | P2 | F4 | ☑ |
| G236 | PFIP fertility timeline: centraal fertiliteitstraject-scherm met onderzoeken, consulten, behandelingen, embryo's, aanbevelingen en research | P0 | F3 | ☑ |
| G237 | PFIP fertility timeline: tijdlijnitems normaliseren uit bestaande afspraken, dossierdocumenten, embryo's, vragen en medicatie | P0 | F3 | ☑ |
| G238 | PFIP fertility timeline: filters voor type, traject, eigenaar, bron en periode | P1 | F3 | ☑ |
| G239 | PFIP fertility timeline: detailpaneel per tijdlijnitem met bron, context en gekoppelde records | P1 | F3 | ☑ |
| G240 | PFIP fertility timeline: belangrijke mijlpalen en ontbrekende context zichtbaar maken zonder oordeel | P1 | F3 | ☑ |
| G241 | PFIP fertility timeline: complete trajectexport voor eigen consultvoorbereiding | P2 | F3 | ☑ |
| G242 | PFIP fertility timeline: tijdlijn blijft bruikbaar offline en na import van back-up/syncpakket | P0 | F3 | ☑ |
| G243 | PFIP fertility timeline: toegankelijk mobiel ontwerp voor één-scherm-overzicht van het volledige traject | P1 | F3 | ☑ |

## 21. Continuous Evolution & Goal Expansion

Bron: [`EXECUTION_GOALS.md`](EXECUTION_GOALS.md). G244 levert de nieuwe doelcatalogus en issue-seeding; open doelen blijven traceerbaar zolang ze werkelijk waardevol en actueel zijn.

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G244 | Goal Expansion Engine | P0 | F4 | ☑ |
| G245 | Backlog Health Dashboard | P0 | F4 | ☑ |
| G246 | Goal Scoring Model | P1 | F4 | ☑ |
| G247 | Goal Template CLI | P2 | F4 | ☒ |
| G248 | Issue Sync Script | P1 | F4 | ☒ |
| G249 | Roadmap Coverage Matrix | P1 | F4 | ☒ |
| G250 | Goal Completion Audit Checklist | P0 | F4 | ☑ |
| G251 | Architecture Decision Backlog | P1 | F4 | ☑ |
| G252 | User Workflow Gap Review | P1 | F4 | ☒ |
| G253 | Operational Runbook Refresh | P2 | F4 | ☒ |
| G254 | Goal Aging Signals | P2 | F4 | ☒ |
| G255 | Release Notes Generator | P2 | F4 | ☒ |
| G256 | Goal Dependency Mapping | P2 | F4 | ☒ |
| G257 | Autonomy Guardrails Doc | P1 | F4 | ☑ |
| G258 | Goal Search Index | P3 | F4 | ☒ |
| G259 | Backlog Statistics Test | P1 | F4 | ☑ |
| G260 | Vision Traceability Tags | P2 | F4 | ☒ |
| G261 | Next Horizon Roadmap | P1 | F4 | ☒ |
| G262 | Issue Label Taxonomy | P2 | F4 | ☒ |
| G263 | Monthly Goal Review Ritual | P3 | F4 | ☒ |
| G264 | First Run Guided Setup | P0 | F4 | ☑ |
| G265 | Daily Command Center | P0 | F4 | ☑ |
| G266 | Partner Handoff Mode | P1 | F4 | ☒ |
| G267 | Consult Prep Wizard | P0 | F4 | ☑ |
| G268 | After Consult Capture Flow | P1 | F4 | ☒ |
| G269 | Medication Day Timeline | P1 | F4 | ☒ |
| G270 | Question Inbox Zero | P2 | F4 | ☒ |
| G271 | Timeline Quick Add | P1 | F4 | ☒ |
| G272 | Dossier Import Checklist | P1 | F4 | ☒ |
| G273 | Empty State Action Shortcuts | P2 | F4 | ☒ |
| G274 | Gentle Reminder Review | P2 | F4 | ☒ |
| G275 | Weekly Review Screen | P2 | F4 | ☒ |
| G276 | Stress-Light Mode | P3 | F4 | ☒ |
| G277 | Timeline Story Mode | P3 | F4 | ☒ |
| G278 | Cost Entry From Appointment | P2 | F4 | ☒ |
| G279 | Backup Nudge Personalization | P2 | F4 | ☒ |
| G280 | Search Everywhere | P1 | F4 | ☒ |
| G281 | Print-Friendly Daily Brief | P2 | F4 | ☒ |
| G282 | Keyboard-First Data Entry | P2 | F4 | ☒ |
| G283 | Microcopy Consistency Pass | P3 | F4 | ☒ |
| G284 | Service Worker Update UX | P1 | F4 | ☒ |
| G285 | Offline Smoke Test Script | P0 | F4 | ☑ |
| G286 | Backup Restore Drill | P0 | F4 | ☑ |
| G287 | Tailscale Smoke Automation | P1 | F4 | ☒ |
| G288 | Data Integrity Report | P1 | F4 | ☒ |
| G289 | Duplicate Detection | P2 | F4 | ☒ |
| G290 | Import Preview Before Commit | P1 | F4 | ☒ |
| G291 | Sync Conflict Explanation | P2 | F4 | ☒ |
| G292 | Performance Budget Test | P2 | F4 | ☒ |
| G293 | Large Dossier Rendering Guard | P1 | F4 | ☒ |
| G294 | IndexedDB Quota Warning | P2 | F4 | ☒ |
| G295 | Error Boundary Screen | P1 | F4 | ☒ |
| G296 | Form Draft Persistence | P2 | F4 | ☒ |
| G297 | Event Log Filters | P3 | F4 | ☒ |
| G298 | Runbook Command Verification | P2 | F4 | ☒ |
| G299 | Import Error Taxonomy | P2 | F4 | ☒ |
| G300 | Local Diagnostics Export | P2 | F4 | ☒ |
| G301 | Recovery Mode Unlock Help | P1 | F4 | ☑ |
| G302 | Notification Delivery Audit | P2 | F4 | ☒ |
| G303 | Browser Compatibility Matrix | P3 | F4 | ☒ |
| G304 | On-Device Summarizer Adapter | P1 | F4 | ☒ |
| G305 | AI Prompt Registry | P0 | F4 | ☑ |
| G306 | Research Source Importer | P1 | F4 | ☒ |
| G307 | Research Reading Queue | P2 | F4 | ☒ |
| G308 | Research-to-Question Suggestions | P1 | F4 | ☒ |
| G309 | Evidence Strength Labels | P1 | F4 | ☒ |
| G310 | Research Update Reminder | P2 | F4 | ☒ |
| G311 | Local Citation Formatter | P2 | F4 | ☒ |
| G312 | AI Output Diff Review | P1 | F4 | ☒ |
| G313 | Sensitive Text Redaction Preview | P0 | F4 | ☑ |
| G314 | Cloud AI Cost Warning | P2 | F4 | ☒ |
| G315 | AI Provider Health Check | P3 | F4 | ☒ |
| G316 | Research Topic Map | P2 | F4 | ☒ |
| G317 | Question Safety Classifier | P1 | F4 | ☒ |
| G318 | Local Research Full Text Index | P2 | F4 | ☒ |
| G319 | Research Export Packet | P2 | F4 | ☒ |
| G320 | Prompt Regression Suite | P0 | F4 | ☑ |
| G321 | On-Device Capability Explainer | P3 | F4 | ☒ |
| G322 | Research Network Audit Log | P1 | F4 | ☒ |
| G323 | AI Data Retention Controls | P1 | F4 | ☒ |
| G324 | Content Security Policy | P0 | F4 | ☑ |
| G325 | Dependency Review Cadence | P1 | F4 | ☑ |
| G326 | Secrets Scan Test | P0 | F4 | ☑ |
| G327 | Sensitive Fixture Policy | P1 | F4 | ☑ |
| G328 | Storage Schema Migration Harness | P1 | F4 | ☒ |
| G329 | Domain Boundary Lint | P2 | F4 | ☒ |
| G330 | Accessibility Regression Smoke | P1 | F4 | ☒ |
| G331 | Mobile Viewport Screenshot Gate | P2 | F4 | ☒ |
| G332 | Markdown Export Sanitizer | P1 | F4 | ☒ |
| G333 | Audit Event Retention Policy | P2 | F4 | ☒ |
| G334 | Form Validation Library Cleanup | P2 | F4 | ☒ |
| G335 | Typed Route Registry | P2 | F4 | ☒ |
| G336 | Store Factory Refactor | P3 | F4 | ☒ |
| G337 | Event Log Privacy Test | P1 | F4 | ☑ |
| G338 | Tailscale Deploy Drift Check | P2 | F4 | ☒ |
| G339 | Public Repo Privacy Review | P1 | F4 | ☑ |
| G340 | Build Provenance Notes | P3 | F4 | ☒ |
| G341 | CSS Token Audit | P2 | F4 | ☒ |
| G342 | No External Asset Test | P0 | F4 | ☑ |
| G343 | Type Coverage Ratchet | P2 | F4 | ☒ |
| G344 | Future Sync Relay Threat Model | P1 | F4 | ☒ |
| G345 | Backlog Health Issue Snapshot Automation | P1 | F4 | ☒ |
| G346 | Goal Score Issue Annotation | P1 | F4 | ☒ |
| G347 | External Asset CI Gate | P0 | F4 | ☑ |
| G348 | External Asset Allowlist Governance | P1 | F4 | ☑ |
| G349 | Completion Audit Evidence Markers | P1 | F4 | ☑ |
| G350 | First Run Setup Progress Persistence | P1 | F4 | ☒ |
| G351 | Offline Smoke CI Artifact | P1 | F4 | ☒ |
| G352 | Backup Drill Fixture Expansion | P1 | F4 | ☒ |
| G353 | CSP Violation Reporting Plan | P1 | F4 | ☑ |
| G354 | Secrets Scan Baseline Review | P1 | F4 | ☑ |
| G355 | Prompt Registry UI Exposure | P1 | F4 | ☒ |
| G356 | Redaction Pattern Baseline Review | P1 | F4 | ☒ |
| G357 | Prompt Regression Coverage Report | P1 | F4 | ☒ |
| G358 | Daily Command Center Personalization | P1 | F4 | ☒ |
| G359 | Consult Prep Packet Persistence | P1 | F4 | ☒ |
| G360 | Recovery Mode Diagnostics Card | P1 | F4 | ☑ |
| G361 | Dependency Review Evidence Snapshot | P1 | F4 | ☑ |
| G362 | Sensitive Fixture Allowlist Review | P1 | F4 | ☑ |
| G363 | Event Log Detail Allowlist Governance | P1 | F4 | ☑ |
| G364 | Public Repo Privacy Review Automation Hook | P1 | F4 | ☒ |
| G365 | External Asset Allowlist Review Evidence | P1 | F4 | ☒ |
| G366 | Local CSP Violation Reproduction Fixture | P1 | F4 | ☒ |
| G367 | Secrets Scan Review Evidence Snapshot | P1 | F4 | ☒ |
| G368 | Recovery Diagnostics Visual Regression Fixture | P1 | F4 | ☒ |
| G369 | Dependency Evidence Generator Dry Run | P1 | F4 | ☒ |
| G370 | Sensitive Fixture Review Evidence Snapshot | P1 | F4 | ☒ |
| G371 | Event Log Detail Review Evidence Snapshot | P1 | F4 | ☒ |
| G372 | ADR Review Evidence Template | P1 | F4 | ☑ |
| G373 | Autonomy Guardrail Evidence Checklist | P1 | F4 | ☑ |
| G374 | Backlog Active Goal Drift Fixture | P1 | F4 | ☑ |
| G375 | Completion Audit Marker Parser CLI | P1 | F4 | ☒ |
| G376 | ADR Review Evidence Index | P1 | F4 | ☑ |
| G377 | Autonomy Guardrail Evidence Parser | P1 | F4 | ☒ |
| G378 | Backlog Active Goal Drift CLI Flag | P1 | F4 | ☑ |
| G379 | ADR Review Evidence Freshness Check | P1 | F4 | ☒ |
| G380 | Backlog Health Issue Snapshot Default Gate | P1 | F4 | ☑ |
| G381 | Backlog Health Snapshot Cleanup Reminder | P1 | F4 | ☑ |
| G382 | Backlog Health Issue Snapshot Freshness Hint | P1 | F4 | ☑ |
| G383 | Backlog Health Issue Snapshot Limit Warning | P1 | F4 | ☑ |
| G384 | Backlog Health Issue Snapshot Limit CLI Flag | P1 | F4 | ☑ |
| G385 | Backlog Health Issue Snapshot Limit Example | P1 | F4 | ☑ |
| G386 | Backlog Health Issue Snapshot Duplicate Title Guidance | P1 | F4 | ☑ |
| G387 | Backlog Health Issue Snapshot Duplicate Issue Listing | P1 | F4 | ☑ |
| G388 | Backlog Health Issue Snapshot Duplicate JSON Shape | P1 | F4 | ☑ |
| G389 | Backlog Health Missing Issue JSON Shape | P1 | F4 | ☑ |
| G390 | Backlog Health Closed Issue JSON Shape | P1 | F4 | ☑ |
| G391 | Backlog Health Completed Goal Open Issue JSON Shape | P1 | F4 | ☑ |
| G392 | Backlog Health JSON Shape Reference | P1 | F4 | ☑ |
| G393 | Backlog Health JSON Example Fixture | P1 | F4 | ☑ |
| G394 | Backlog Health JSON Example Fixture Sync Test | P1 | F4 | ☑ |
| G395 | Backlog Health JSON Example Fixture Consumer Notes | P1 | F4 | ☑ |
| G396 | Backlog Health JSON Consumer Notes CLI Coverage | P1 | F4 | ☑ |
| G397 | Backlog Health JSON Contract Fixture Helper | P1 | F4 | ☑ |
| G398 | Backlog Health JSON Contract Fixture Export Guard | P1 | F4 | ☑ |
| G399 | Backlog Health JSON Contract Fixture Field Matrix | P1 | F4 | ☑ |
| G400 | Backlog Health JSON Contract Matrix Docs Link | P1 | F4 | ☑ |
| G401 | Backlog Health JSON Contract Matrix Drift Hint | P1 | F4 | ☑ |
| G402 | Backlog Health JSON Contract Matrix Docs Symmetry | P1 | F4 | ☑ |
| G403 | Backlog Health JSON Contract Matrix Section Parser | P1 | F4 | ☑ |
| G404 | Backlog Health JSON Contract Matrix Marker Docs | P1 | F4 | ☑ |
| G405 | Backlog Health JSON Contract Marker Negative Fixture | P1 | F4 | ☑ |
| G406 | Backlog Health JSON Contract Marker Error Docs | P1 | F4 | ☑ |
| G407 | Backlog Health JSON Contract Marker Recovery Drift Hint | P1 | F4 | ☑ |
| G408 | Backlog Health JSON Contract Marker Recovery Paragraph Guard | P1 | F4 | ☑ |
| G409 | Backlog Health JSON Contract Marker Recovery Paragraph Negative Fixture | P1 | F4 | ☑ |
| G410 | Backlog Health JSON Contract Recovery Paragraph Privacy Fixture | P1 | F4 | ☑ |
| G411 | Backlog Health JSON Contract Recovery Paragraph Artifact Label Fixture | P1 | F4 | ☑ |
| G412 | Backlog Health JSON Contract Recovery Artifact Label Negative Fixture | P1 | F4 | ☑ |
| G413 | Backlog Health JSON Contract Recovery Artifact Label Docs Hint | P1 | F4 | ☑ |
| G414 | Backlog Health JSON Contract Recovery Artifact Label Docs Negative Fixture | P1 | F4 | ☑ |
| G415 | Backlog Health JSON Contract Recovery Artifact Docs Hint Constant | P1 | F4 | ☑ |
| G416 | Backlog Health JSON Contract Recovery Artifact Docs Hint Label Fixture | P1 | F4 | ☑ |
| G417 | Backlog Health JSON Contract Recovery Artifact Docs Hint Label Negative Fixture | P1 | F4 | ☑ |
| G418 | Backlog Health JSON Contract Recovery Artifact Docs Hint Term Negative Fixture | P1 | F4 | ☑ |
| G419 | Backlog Health JSON Contract Recovery Artifact Docs Hint Empty Fixture | P1 | F4 | ☑ |
| G420 | Backlog Health JSON Contract Recovery Artifact Docs Hint Whitespace Fixture | P1 | F4 | ☑ |
| G421 | Backlog Health JSON Contract Recovery Artifact Docs Hint Trimmed Length Fixture | P1 | F4 | ☑ |
| G422 | Backlog Health JSON Contract Recovery Artifact Docs Hint Normalization Helper | P1 | F4 | ☑ |
| G423 | Backlog Health JSON Contract Recovery Artifact Docs Hint Type Alias | P1 | F4 | ☑ |
| G424 | Backlog Health JSON Contract Recovery Artifact Docs Hint Normalized Type Alias | P1 | F4 | ☑ |
| G425 | Backlog Health JSON Contract Recovery Artifact Docs Hint Normalized Fixture | P1 | F4 | ☑ |
| G426 | Backlog Health JSON Contract Recovery Artifact Docs Hint Error Builder | P1 | F4 | ☑ |
| G427 | Backlog Health JSON Contract Recovery Artifact Docs Hint Error Builder Fixture | P1 | F4 | ☑ |
| G428 | Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Type | P1 | F4 | ☑ |
| G429 | Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Constants | P1 | F4 | ☑ |
| G430 | Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Constants Fixture | P1 | F4 | ☑ |
| G431 | Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Reason Fixture | P1 | F4 | ☑ |
| G432 | Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Reason Helper | P1 | F4 | ☑ |
| G433 | Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Reason Helper Fixture | P1 | F4 | ☑ |
| G434 | Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Reason Type Narrowing | P1 | F4 | ☑ |
| G435 | Backlog Health JSON Contract Recovery Artifact Docs Hint Error Reason Type Fixture | P1 | F4 | ☑ |
| G436 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Reason Type Fixture | P1 | F4 | ☑ |
| G437 | Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Reason Type Fixture | P1 | F4 | ☑ |
| G438 | Backlog Health JSON Contract Recovery Artifact Docs Hint Type Fixture De-duplication | P1 | F4 | ☑ |
| G439 | Backlog Health JSON Contract Recovery Artifact Docs Hint Type Fixture Composition Fixture | P1 | F4 | ☑ |
| G440 | Backlog Health JSON Contract Recovery Artifact Docs Hint Type Fixture Static Selection Constant | P1 | F4 | ☑ |
| G441 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Selection Constant Fixture | P1 | F4 | ☑ |
| G442 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Selection Literal Fixture | P1 | F4 | ☑ |
| G443 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Selection Type Fixture | P1 | F4 | ☑ |
| G444 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Selection Type Fixture Formatting | P1 | F4 | ☑ |
| G445 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Selection Type Alias Fixture | P1 | F4 | ☑ |
| G446 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Naming | P1 | F4 | ☑ |
| G447 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Comment Boundary | P1 | F4 | ☑ |
| G448 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Placement | P1 | F4 | ☑ |
| G449 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Test Placement | P1 | F4 | ☑ |
| G450 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Expected Values | P1 | F4 | ☑ |
| G451 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Shared Equality | P1 | F4 | ☑ |
| G452 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Assertion Labels | P1 | F4 | ☑ |
| G453 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Test Cluster | P1 | F4 | ☑ |
| G454 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Comment Alignment | P1 | F4 | ☑ |
| G455 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Comment Duplication | P1 | F4 | ☑ |
| G456 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Declaration Density | P1 | F4 | ☑ |
| G457 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Fixture Declaration Order | P1 | F4 | ☑ |
| G458 | Backlog Health JSON Contract Recovery Artifact Docs Hint Representative Static Fixture Grouping | P1 | F4 | ☑ |
| G459 | Backlog Health JSON Contract Recovery Artifact Docs Hint Mixed Fixture Declaration Spacing | P1 | F4 | ☑ |
| G460 | Backlog Health JSON Contract Recovery Artifact Docs Hint Mixed Fixture Test Cluster Spacing | P1 | F4 | ☑ |
| G461 | Backlog Health JSON Contract Recovery Artifact Docs Hint Mixed Fixture Test Labels | P1 | F4 | ☑ |
| G462 | Backlog Health JSON Contract Recovery Artifact Docs Hint Mixed Fixture Comment Boundary | P1 | F4 | ☑ |
| G463 | Backlog Health JSON Contract Recovery Artifact Docs Hint Static Alias Comment Boundary | P1 | F4 | ☑ |
| G464 | Backlog Health JSON Contract Recovery Artifact Docs Hint Broad Static Fixture Test Placement | P1 | F4 | ☑ |
| G465 | Backlog Health JSON Contract Recovery Artifact Docs Hint Dynamic Fixture Test Placement | P1 | F4 | ☑ |

## 22. Strategic Fertility Intelligence Platform

Bron: [`docs/FERTILITY_INTELLIGENCE_STRATEGY.md`](docs/FERTILITY_INTELLIGENCE_STRATEGY.md). Deze strategische domeinlaag houdt minimaal 25 actieve Fertility Intelligence-doelen, minimaal 5 Research Intelligence-doelen en minimaal 5 Daily Recommendations-doelen actief.

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G466 | Fertility Intelligence: historische dossierimport inbox | P0 | F5 | ☑ |
| G467 | Fertility Intelligence: OCR-confidence review voor kliniekdocumenten | P0 | F5 | ☑ |
| G468 | Fertility Intelligence: metadata normaliseren voor lab- en onderzoeksrapporten | P0 | F5 | ☑ |
| G469 | Fertility Intelligence: tijdlijnreconstructie uit historische records | P0 | F5 | ☑ |
| G470 | Fertility Intelligence: fertility dossier packet per behandeltraject | P1 | F5 | ☑ |
| G471 | Fertility Intelligence: ultrasound upload metadata schema | P0 | F5 | ☑ |
| G472 | Fertility Intelligence: embryo image classification review | P1 | F5 | ☐ |
| G473 | Fertility Intelligence: beeldvergelijking zonder medische interpretatie | P1 | F5 | ☐ |
| G474 | Fertility Intelligence: imaging timeline privacy boundary | P0 | F5 | ☑ |
| G475 | Fertility Intelligence: consult transcript import en bronkoppeling | P0 | F5 | ☑ |
| G476 | Fertility Intelligence: actie-extractie uit consulten als taken en vragen | P0 | F5 | ☑ |
| G477 | Fertility Intelligence: consultsamenvatting reviewflow zonder behandeladvies | P0 | F5 | ☑ |
| G478 | Fertility Intelligence: embryo grading bronregistratie | P0 | F5 | ☑ |
| G479 | Fertility Intelligence: embryo outcome event tracking | P1 | F5 | ☐ |
| G480 | Fertility Intelligence: embryovergelijking taalgrens | P0 | F5 | ☑ |
| G481 | Research Intelligence: fertility research source registry | P0 | F5 | ☑ |
| G482 | Research Intelligence: literatuur discovery query builder | P1 | F5 | ☐ |
| G483 | Research Intelligence: wetenschappelijke en patientvriendelijke samenvattingen | P0 | F5 | ☑ |
| G484 | Research Intelligence: persoonlijke relevantiescore zonder behandeladvies | P0 | F5 | ☑ |
| G485 | Research Intelligence: fertiliteitsresearch trend dashboard | P1 | F5 | ☐ |
| G486 | Daily Recommendations: vrouw-dagkaart met bronherleiding | P0 | F5 | ☑ |
| G487 | Daily Recommendations: man-dagkaart met bronherleiding | P0 | F5 | ☑ |
| G488 | Daily Recommendations: personalisatiefeedback over tijd | P1 | F5 | ☐ |
| G489 | Daily Recommendations: supplement boundary en artscheck | P0 | F5 | ☑ |
| G490 | Daily Recommendations: aanbevelingen op fertility timeline | P1 | F5 | ☑ |

## 23. Autonomous Evolution Active Goal Floor

Bron: [`docs/AUTONOMOUS_EVOLUTION_GOVERNANCE.md`](docs/AUTONOMOUS_EVOLUTION_GOVERNANCE.md). Deze laag houdt minimaal 100 actieve doelen, minimaal 3 actieve epics en minimaal 1 toekomstige roadmap-horizon beschikbaar voor autonome doorontwikkeling.

| ID | Doel | Prio | Fase | Status |
|---|---|---|---|---|
| G491 | Central Encrypted Platform: central session renewal zonder plaintext fallback | P0 | F5 | ☑ |
| G492 | Central Encrypted Platform: owner-scoped record list pagination | P0 | F5 | ☑ |
| G493 | Central Encrypted Platform: encrypted attachment envelope contract | P0 | F5 | ☑ |
| G494 | Central Encrypted Platform: central attachment size limit policy | P0 | F5 | ☑ |
| G495 | Central Encrypted Platform: record replay protection metadata | P0 | F5 | ☑ |
| G496 | Central Encrypted Platform: central dataset bootstrap smoke test | P0 | F5 | ☑ |
| G497 | Central Encrypted Platform: central API outage recovery banner | P1 | F5 | ☐ |
| G498 | Central Encrypted Platform: central encrypted sync conflict audit view | P1 | F5 | ☐ |
| G499 | Central Encrypted Platform: encrypted record schema version gate | P0 | F5 | ☑ |
| G500 | Central Encrypted Platform: central session expiry user journey | P1 | F5 | ☐ |
| G501 | Central Encrypted Platform: multi-device unlock copy consistency | P0 | F5 | ☑ |
| G502 | Central Encrypted Platform: central persistence backup drill | P1 | F5 | ☐ |
| G503 | Central Encrypted Platform: central API health endpoint privacy review | P1 | F5 | ☑ |
| G504 | Central Encrypted Platform: central encrypted dataset export manifest | P1 | F5 | ☐ |
| G505 | Central Encrypted Platform: legacy fallback migration decision screen | P1 | F5 | ☐ |
| G506 | Fertility Intelligence: historische labwaarde normalisatie zonder interpretatie | P0 | F5 | ☑ |
| G507 | Fertility Intelligence: dossierupload duplicaatreview op checksum | P0 | F5 | ☑ |
| G508 | Fertility Intelligence: PDF-pagina preview met encrypted bronkoppeling | P1 | F5 | ☐ |
| G509 | Fertility Intelligence: OCR-resultaat bronfragment navigatie | P1 | F5 | ☐ |
| G510 | Fertility Intelligence: ziekenhuisdocument type-taxonomie | P0 | F5 | ☑ |
| G511 | Fertility Intelligence: fertiliteitsrapport samenvatting als conceptkennis | P1 | F5 | ☐ |
| G512 | Fertility Intelligence: historische records zoekfilter op kliniek | P1 | F5 | ☐ |
| G513 | Fertility Intelligence: historische records zoekfilter op poging | P1 | F5 | ☐ |
| G514 | Fertility Intelligence: documentreview wachtrij per confidence | P0 | F5 | ☑ |
| G515 | Fertility Intelligence: medische bronverwijzing per tijdlijnitem | P0 | F5 | ☑ |
| G516 | Fertility Intelligence: echo upload classificatie per afspraak | P0 | F5 | ☑ |
| G517 | Fertility Intelligence: beeldpreview lock-state placeholder | P0 | F5 | ☑ |
| G518 | Fertility Intelligence: embryo-afbeelding EXIF isolatie | P0 | F5 | ☑ |
| G519 | Fertility Intelligence: beeldvergelijking selectieflow | P1 | F5 | ☐ |
| G520 | Fertility Intelligence: scanrecord bronlabel en notitie | P1 | F5 | ☐ |
| G521 | Fertility Intelligence: consultnotitie import uit tekstveld | P0 | F5 | ☑ |
| G522 | Fertility Intelligence: consultdocument koppelen aan open vragen | P1 | F5 | ☐ |
| G523 | Fertility Intelligence: consultactie omzetten naar herinnering | P1 | F5 | ☐ |
| G524 | Fertility Intelligence: consultsamenvatting bronparagraaf review | P0 | F5 | ☑ |
| G525 | Fertility Intelligence: behandelgeschiedenis reconstructie vanuit consulten | P1 | F5 | ☐ |
| G526 | Fertility Intelligence: embryo-ID schema per poging | P0 | F5 | ☑ |
| G527 | Fertility Intelligence: embryo-status event editor | P0 | F5 | ☑ |
| G528 | Fertility Intelligence: embryo kwaliteit bronlabel UI | P0 | F5 | ☑ |
| G529 | Fertility Intelligence: embryo cryo-status tijdlijnitem | P1 | F5 | ☐ |
| G530 | Fertility Intelligence: embryo terugplaatsing contextkaart | P1 | F5 | ☐ |
| G531 | Fertility Timeline & Knowledge Graph: knowledge graph node schema | P0 | F5 | ☑ |
| G532 | Fertility Timeline & Knowledge Graph: relationship edge provenance model | P0 | F5 | ☑ |
| G533 | Fertility Timeline & Knowledge Graph: fertility timeline filter op brontype | P1 | F5 | ☐ |
| G534 | Fertility Timeline & Knowledge Graph: fertility timeline maandgroepering | P1 | F5 | ☐ |
| G535 | Fertility Timeline & Knowledge Graph: timeline item detail drawer zonder kaart-in-kaart | P1 | F5 | ☐ |
| G536 | Fertility Timeline & Knowledge Graph: timeline export met bronlijst | P1 | F5 | ☐ |
| G537 | Fertility Timeline & Knowledge Graph: knowledge graph privacy boundary test | P0 | F5 | ☑ |
| G538 | Fertility Timeline & Knowledge Graph: contextuele inzichten als vragen voor arts | P1 | F5 | ☐ |
| G539 | Research Intelligence: research source allowlist met rationale | P0 | F5 | ☑ |
| G540 | Research Intelligence: PubMed query preview zonder dossierplaintext | P0 | F5 | ☑ |
| G541 | Research Intelligence: research item broncitatie parser | P1 | F5 | ☐ |
| G542 | Research Intelligence: patientvriendelijke samenvatting leesniveau guard | P1 | F5 | ☐ |
| G543 | Research Intelligence: research trend update timestamp | P1 | F5 | ☐ |
| G544 | Research Intelligence: research relevantie uitleg onzekerheidslabel | P0 | F5 | ☑ |
| G545 | Research Intelligence: researchbibliotheek offline cache metadata | P1 | F5 | ☐ |
| G546 | Research Intelligence: research item artsbespreek-vraag generator | P1 | F5 | ☐ |
| G547 | Daily Recommendations: dagadvies engine input-minimalisatie | P0 | F5 | ☑ |
| G548 | Daily Recommendations: vrouw aanbeveling cyclusfase context | P0 | F5 | ☑ |
| G549 | Daily Recommendations: man aanbeveling leefstijl context | P0 | F5 | ☑ |
| G550 | Daily Recommendations: aanbeveling bronconfidence label | P1 | F5 | ☐ |
| G551 | Daily Recommendations: aanbeveling artscheck actieknop | P0 | F5 | ☑ |
| G552 | Daily Recommendations: dagadvies feedback analytics zonder tracking | P1 | F5 | ☐ |
| G553 | Daily Recommendations: aanbevelingen verbergen per eigenaar | P1 | F5 | ☐ |
| G554 | Daily Recommendations: daily recommendation policy regression fixtures | P0 | F5 | ☑ |
| G555 | Premium Claude Design UI: fertility intelligence dossier inbox layout | P1 | F5 | ☑ |
| G556 | Premium Claude Design UI: imaging repository compare layout | P1 | F5 | ☑ |
| G557 | Premium Claude Design UI: consult intelligence review layout | P1 | F5 | ☐ |
| G558 | Premium Claude Design UI: embryo tracking compact cards | P1 | F5 | ☐ |
| G559 | Premium Claude Design UI: research trend dashboard visual system | P1 | F5 | ☐ |
| G560 | Premium Claude Design UI: daily recommendation dual-owner cards | P1 | F5 | ☐ |
| G561 | Product Quality & Automation: active goal floor maintenance test | P0 | F5 | ☑ |
| G562 | Product Quality & Automation: goal score top-priority snapshot | P1 | F5 | ☐ |
| G563 | Product Quality & Automation: issue creation script dry-run fixture | P1 | F5 | ☐ |
| G564 | Product Quality & Automation: autonomous evolution runbook checklist | P1 | F5 | ☐ |
| G565 | Product Quality & Automation: autonomous issue snapshot freshness gate | P1 | F5 | ☐ |
| G566 | Central Encrypted Platform: encrypted record migration fixture registry | P1 | F5 | ☐ |
| G567 | Fertility Intelligence: dossierupload size feedback voor grote bijlagen | P1 | F5 | ☐ |
| G568 | Fertility Intelligence: ziekenhuisdocument taxonomie reviewcorrectie | P1 | F5 | ☐ |
| G569 | Product Quality & Automation: imaging lock-state visual regression fixture | P1 | F5 | ☐ |
| G570 | Fertility Intelligence: consultnotitie tekstimport reviewcorrectie | P1 | F5 | ☐ |
| G571 | Fertility Intelligence: embryo-ID alias reviewcorrectie | P1 | F5 | ☐ |
| G572 | Fertility Intelligence: embryo kwaliteit bronlabel correctieflow | P1 | F5 | ☐ |
| G573 | Fertility Timeline & Knowledge Graph: graph payload leak regression fixtures | P1 | F5 | ☐ |
| G574 | Daily Recommendations: supplement artscheck actieflow | P1 | F5 | ☐ |
| G575 | Research Intelligence: research source allowlist review evidence | P1 | F5 | ☐ |
| G576 | Daily Recommendations: artscheck vraag reviewstatus | P1 | F5 | ☐ |
| G577 | Fertility Intelligence: import-inbox retry per bestand | P1 | F5 | ☐ |
| G578 | Fertility Intelligence: OCR-review correctieformulier | P1 | F5 | ☐ |
| G579 | Fertility Intelligence: metadata-normalisatie correctieformulier | P1 | F5 | ☐ |
| G580 | Fertility Intelligence: historische tijdlijnitem reviewactie | P1 | F5 | ☐ |
| G581 | Fertility Intelligence: imaging metadata reviewcorrectie | P1 | F5 | ☐ |
| G582 | Product Quality & Automation: active goal floor CI gate | P1 | F5 | ☐ |
| G583 | Central Encrypted Platform: central session renewal status UI | P1 | F5 | ☐ |
| G584 | Central Encrypted Platform: paginated record load status UI | P1 | F5 | ☐ |
| G585 | Central Encrypted Platform: attachment envelope metadata UI feedback | P1 | F5 | ☐ |
| G586 | Central Encrypted Platform: replay conflict recovery status UI | P1 | F5 | ☐ |
| G587 | Central Encrypted Platform: bootstrap smoke CI command | P1 | F5 | ☑ |
| G588 | Central Encrypted Platform: missing key metadata recovery UI | P1 | F5 | ☑ |
| G589 | Central Encrypted Platform: bootstrap smoke failure diagnostics | P1 | F5 | ☑ |
| G590 | Central Encrypted Platform: bootstrap smoke phase runbook matrix | P1 | F5 | ☑ |
| G591 | Central Encrypted Platform: bootstrap diagnostics redaction regression | P1 | F5 | ☑ |
| G592 | Central Encrypted Platform: bootstrap runtime diagnostic fixture | P1 | F5 | ☑ |
| G593 | Central Encrypted Platform: bootstrap diagnostic injection registry | P1 | F5 | ☑ |
| G594 | Central Encrypted Platform: bootstrap runbook registry drift check | P1 | F5 | ☑ |
| G595 | Central Encrypted Platform: bootstrap diagnostic registry CI summary | P1 | F5 | ☑ |
| G596 | Central Encrypted Platform: bootstrap diagnostic summary schema guard | P1 | F5 | ☑ |
| G597 | Central Encrypted Platform: bootstrap diagnostic summary fixture snapshot | P1 | F5 | ☑ |
| G598 | Central Encrypted Platform: bootstrap diagnostic summary docs snapshot link | P1 | F5 | ☑ |
| G599 | Central Encrypted Platform: bootstrap diagnostic snapshot review fixture | P1 | F5 | ☑ |
| G600 | Central Encrypted Platform: bootstrap diagnostic governance consolidation | P1 | F5 | ☑ |
| G601 | Central Encrypted Platform: bootstrap diagnostic governance checklist | P1 | F5 | ☑ |
| G602 | Central Encrypted Platform: bootstrap diagnostic governance CI freshness gate | P1 | F5 | ☑ |
| G603 | Central Encrypted Platform: bootstrap governance freshness failure diagnostics | P1 | F5 | ☑ |
| G604 | Central Encrypted Platform: bootstrap governance freshness docs snapshot | P1 | F5 | ☑ |
| G605 | Central Encrypted Platform: bootstrap governance freshness changelog guard | P1 | F5 | ☑ |
| G606 | Central Encrypted Platform: bootstrap governance freshness schema export | P1 | F5 | ☑ |
| G607 | Central Encrypted Platform: bootstrap governance freshness unknown-field guard | P1 | F5 | ☑ |
| G608 | Central Encrypted Platform: bootstrap governance freshness schema-error docs | P1 | F5 | ☑ |
| G609 | Central Encrypted Platform: bootstrap governance schema-error release guard | P1 | F5 | ☑ |
| G610 | Central Encrypted Platform: bootstrap governance schema-error CI annotation | P1 | F5 | ☑ |
| G611 | Central Encrypted Platform: bootstrap governance schema-error annotation release guard | P1 | F5 | ☑ |
| G612 | Central Encrypted Platform: bootstrap governance annotation docsnapshot consistency | P1 | F5 | ☑ |
| G613 | Central Encrypted Platform: bootstrap governance annotation contract export | P1 | F5 | ☑ |
| G614 | Central Encrypted Platform: bootstrap governance annotation contract docs | P1 | F5 | ☑ |
| G615 | Central Encrypted Platform: bootstrap governance annotation template placeholder guard | P1 | F5 | ☑ |
| G616 | Central Encrypted Platform: bootstrap governance annotation placeholder docs | P1 | F5 | ☑ |
| G617 | Central Encrypted Platform: bootstrap governance annotation placeholder release guard | P1 | F5 | ☑ |
| G618 | Central Encrypted Platform: bootstrap governance placeholder context helper consolidation | P1 | F5 | ☑ |
| G619 | Central Encrypted Platform: bootstrap governance releasecontext helper failure fixtures | P1 | F5 | ☑ |
| G620 | Central Encrypted Platform: bootstrap governance releasecontext term list deduplication | P1 | F5 | ☑ |
| G621 | Central Encrypted Platform: bootstrap governance releasecontext term snapshot guard | P1 | F5 | ☑ |
| G622 | Central Encrypted Platform: bootstrap governance releasecontext term runbook reference | P1 | F5 | ☑ |
| G623 | Central Encrypted Platform: bootstrap governance releasecontext runbook release-state guard | P1 | F5 | ☑ |
| G624 | Central Encrypted Platform: bootstrap governance releasecontext runbook term contract | P1 | F5 | ☑ |
| G625 | Central Encrypted Platform: bootstrap governance releasecontext runbook term redaction guard | P1 | F5 | ☑ |
| G626 | Central Encrypted Platform: bootstrap governance releasecontext runbook term release redaction guard | P1 | F5 | ☑ |
| G627 | Central Encrypted Platform: bootstrap governance releasecontext redaction missing-term fixture | P1 | F5 | ☑ |
| G628 | Central Encrypted Platform: bootstrap governance redaction failure text contract | P1 | F5 | ☑ |
| G629 | Central Encrypted Platform: bootstrap governance redaction failure release-state guard | P1 | F5 | ☑ |
| G630 | Central Encrypted Platform: bootstrap governance redaction failure release missing-term fixture | P1 | F5 | ☑ |
| G631 | Central Encrypted Platform: bootstrap governance redaction failure missing-term text contract | P1 | F5 | ☑ |
| G632 | Central Encrypted Platform: bootstrap governance redaction failure missing-term release-state guard | P1 | F5 | ☑ |
| G633 | Central Encrypted Platform: bootstrap governance redaction failure missing-term release missing-term fixture | P1 | F5 | ☑ |
| G634 | Central Encrypted Platform: bootstrap governance redaction failure missing-term release text contract | P1 | F5 | ☑ |
| G635 | Central Encrypted Platform: bootstrap governance missing-term release text release-state guard | P1 | F5 | ☑ |
| G636 | Central Encrypted Platform: bootstrap governance missing-term release missing-term fixture | P1 | F5 | ☑ |
| G637 | Central Encrypted Platform: bootstrap governance missing-term release runbook contract note | P1 | F5 | ☑ |
| G638 | Central Encrypted Platform: bootstrap governance missing-term runbook note release-state guard | P1 | F5 | ☑ |
| G639 | Central Encrypted Platform: bootstrap governance missing-term runbook note release missing-term fixture | P1 | F5 | ☑ |
| G640 | Central Encrypted Platform: bootstrap governance missing-term runbook note release text contract | P1 | F5 | ☑ |
| G641 | Central Encrypted Platform: bootstrap governance missing-term runbook note text release-state guard | P1 | F5 | ☑ |
| G642 | Central Encrypted Platform: bootstrap governance missing-term runbook note text release missing-term fixture | P1 | F5 | ☑ |
| G643 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract missing-term text contract | P1 | F5 | ☑ |
| G644 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract text release-state guard | P1 | F5 | ☑ |
| G645 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract text release missing-term fixture | P1 | F5 | ☑ |
| G646 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release missing-term text contract | P1 | F5 | ☑ |
| G647 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text release-state guard | P1 | F5 | ☑ |
| G648 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text release missing-term fixture | P1 | F5 | ☑ |
| G649 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term text contract | P1 | F5 | ☑ |
| G650 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G651 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G652 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G653 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G654 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G655 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G656 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G657 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G658 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G659 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G660 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G661 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G662 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G663 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G664 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G665 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G666 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G667 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G668 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G669 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G670 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G671 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G672 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G673 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G674 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G675 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G676 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G677 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G678 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G679 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G680 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G681 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G682 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G683 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G684 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G685 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G686 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G687 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G688 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G689 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G690 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G691 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G692 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G693 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G694 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G695 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G696 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G697 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G698 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G699 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G700 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G701 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G702 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G703 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G704 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G705 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G706 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G707 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G708 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G709 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G710 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G711 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G712 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G713 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G714 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G715 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G716 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G717 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G718 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G719 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G720 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G721 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G722 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G723 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G724 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G725 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G726 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G727 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G728 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G729 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G730 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G731 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G732 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G733 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G734 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G735 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G736 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G737 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G738 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G739 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G740 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G741 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G742 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G743 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G744 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G745 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G746 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G747 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G748 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G749 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G750 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G751 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G752 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G753 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G754 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G755 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G756 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G757 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G758 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☑ |
| G759 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release missing-term fixture | P1 | F5 | ☑ |
| G760 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release text contract | P1 | F5 | ☑ |
| G761 | Central Encrypted Platform: bootstrap governance missing-term runbook note contract release text missing-term release-state guard | P1 | F5 | ☐ |
| G762 | Central Encrypted Platform: missing key metadata recovery audit handoff | P1 | F5 | ☑ |
| G763 | Central Encrypted Platform: missing key metadata support handoff copy contract | P1 | F5 | ☑ |
| G764 | Central Encrypted Platform: support handoff contract helper | P1 | F5 | ☑ |
| G765 | Central Encrypted Platform: recovery handoff helper rollout | P1 | F5 | ☑ |
| G766 | Central Encrypted Platform: unlock-error visible copy redaction boundary | P1 | F5 | ☑ |
| G767 | Central Encrypted Platform: unlock-error copy regression fixture | P1 | F5 | ☑ |
| G768 | Central Encrypted Platform: unlock-error theme accessibility regression | P1 | F5 | ☑ |
| G769 | Central Encrypted Platform: unlock-error alert structure contract | P1 | F5 | ☑ |
| G770 | Central Encrypted Platform: unlock-error structure negative fixture | P1 | F5 | ☑ |
| G771 | Central Encrypted Platform: unlock-error contract message redaction guard | P1 | F5 | ☑ |
| G772 | Central Encrypted Platform: unlock-error contract message helper reuse | P1 | F5 | ☑ |
| G773 | Central Encrypted Platform: recovery contract helper naming cleanup | P1 | F5 | ☑ |
| G774 | Central Encrypted Platform: recovery contract helper source guard | P1 | F5 | ☑ |
| G775 | Central Encrypted Platform: recovery contract helper guard docs contract | P1 | F5 | ☑ |
| G776 | Central Encrypted Platform: recovery contract helper docs drift release guard | P1 | F5 | ☑ |
| G777 | Central Encrypted Platform: recovery contract helper release guard negative fixture | P1 | F5 | ☑ |
| G778 | Central Encrypted Platform: recovery contract helper release error compact contract | P1 | F5 | ☑ |
| G779 | Central Encrypted Platform: recovery contract helper release error release-state guard | P1 | F5 | ☑ |
| G780 | Central Encrypted Platform: recovery contract helper release-state missing-term negative fixture | P1 | F5 | ☑ |
| G781 | Central Encrypted Platform: recovery contract helper release-state error compact contract | P1 | F5 | ☑ |
| G782 | Central Encrypted Platform: recovery contract helper release-state error release guard | P1 | F5 | ☑ |
| G783 | Central Encrypted Platform: recovery contract helper release-state error negative fixture | P1 | F5 | ☑ |
| G784 | Central Encrypted Platform: recovery contract helper release-state error compact message guard | P1 | F5 | ☑ |
| G785 | Central Encrypted Platform: recovery contract helper release-state message release guard | P1 | F5 | ☑ |
| G786 | Central Encrypted Platform: recovery contract helper release-state message negative fixture | P1 | F5 | ☑ |
| G787 | Central Encrypted Platform: recovery contract helper release-state message compact error guard | P1 | F5 | ☑ |
| G788 | Central Encrypted Platform: recovery contract helper release-state message error release guard | P1 | F5 | ☑ |
| G789 | Central Encrypted Platform: recovery contract helper release-state message error negative fixture | P1 | F5 | ☑ |
| G790 | Central Encrypted Platform: recovery contract helper release-state message error compact contract | P1 | F5 | ☑ |
| G791 | Central Encrypted Platform: recovery contract helper release-state message error release guard | P1 | F5 | ☑ |
| G792 | Central Encrypted Platform: recovery contract helper release-state message error release guard negative fixture | P1 | F5 | ☑ |
| G793 | Central Encrypted Platform: recovery contract helper release-state message error contract negative compact contract | P1 | F5 | ☑ |
| G794 | Central Encrypted Platform: recovery contract helper release-state message error contract release guard | P1 | F5 | ☑ |
| G795 | Central Encrypted Platform: recovery contract helper release-state message error contract release guard negative fixture | P1 | F5 | ☑ |
| G796 | Central Encrypted Platform: recovery contract helper release-state message error contract release negative compact contract | P1 | F5 | ☑ |
| G797 | Central Encrypted Platform: recovery contract helper release-state message error contract release release guard | P1 | F5 | ☑ |
| G798 | Central Encrypted Platform: recovery contract helper release-state message error contract release release guard negative fixture | P1 | F5 | ☑ |
| G799 | Central Encrypted Platform: recovery contract helper release-state message error contract release release negative compact contract | P1 | F5 | ☑ |
| G800 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release guard | P1 | F5 | ☑ |
| G801 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release guard negative fixture | P1 | F5 | ☑ |
| G802 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release negative compact contract | P1 | F5 | ☑ |
| G803 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release release guard | P1 | F5 | ☑ |
| G804 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release release guard negative fixture | P1 | F5 | ☑ |
| G805 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release release negative compact contract | P1 | F5 | ☑ |
| G806 | Central Encrypted Platform: recovery contract helper release-state message error contract release release release release release guard | P1 | F5 | ☐ |
| G807 | Premium Claude Design UI: dossier inbox state regression guard | P1 | F5 | ☑ |
| G808 | Premium Claude Design UI: imaging compare empty and locked states | P1 | F5 | ☑ |
| G809 | Premium Claude Design UI: consult intelligence review states | P1 | F5 | ☑ |
| G810 | Premium Claude Design UI: daily recommendation dual-owner states | P1 | F5 | ☑ |
| G811 | Premium Claude Design UI: research trend dashboard states | P1 | F5 | ☑ |
| G812 | Premium Claude Design UI: fertility timeline unified states | P1 | F5 | ☑ |
| G813 | Premium Claude Design UI: knowledge graph relationship states | P1 | F5 | ☑ |
| G814 | Premium Claude Design UI: AI preview and on-device opt-in states | P1 | F5 | ☑ |
| G815 | Premium Claude Design UI: notification privacy states | P1 | F5 | ☑ |
| G816 | Premium Claude Design UI: backup and import privacy states | P1 | F5 | ☑ |
| G817 | Premium Claude Design UI: WebAuthn recovery privacy states | P1 | F5 | ☑ |
| G818 | Premium Claude Design UI: fallback notification and log privacy states | P1 | F5 | ☑ |
| G819 | Premium Claude Design UI: import and status feedback privacy states | P1 | F5 | ☑ |
| G820 | Premium Claude Design UI: settings and privacy feedback states | P1 | F5 | ☑ |
| G821 | Premium Claude Design UI: central sync and conflict privacy states | P1 | F5 | ☑ |
| G822 | Premium Claude Design UI: upload attachment privacy states | P1 | F5 | ☑ |
| G823 | Premium Claude Design UI: attachment preview and delete privacy states | P1 | F5 | ☑ |
| G824 | Premium Claude Design UI: attachment review metadata states | P1 | F5 | ☑ |
| G825 | Premium Claude Design UI: attachment consent and export privacy states | P1 | F5 | ☑ |
| G826 | Premium Claude Design UI: attachment retention and cleanup privacy states | P1 | F5 | ☑ |
| G827 | Premium Claude Design UI: attachment audit trail privacy states | P1 | F5 | ☑ |
| G828 | Premium Claude Design UI: attachment search and filter privacy states | P1 | F5 | ☑ |
| G829 | Premium Claude Design UI: attachment sort and pagination privacy states | P1 | F5 | ☑ |
| G830 | Premium Claude Design UI: attachment bulk selection privacy states | P1 | F5 | ☑ |
| G831 | Premium Claude Design UI: attachment keyboard and focus privacy states | P1 | F5 | ☑ |
| G832 | Premium Claude Design UI: attachment responsive and reduced-motion privacy states | P1 | F5 | ☑ |
| G833 | Premium Claude Design UI: attachment loading and error privacy states | P1 | F5 | ☑ |
| G834 | Premium Claude Design UI: attachment share and handoff privacy states | P1 | F5 | ☑ |
| G835 | Premium Claude Design UI: attachment print and clinician packet privacy states | P1 | F5 | ☑ |
| G836 | Premium Claude Design UI: attachment accessibility audit privacy states | P1 | F5 | ☑ |
| G837 | Premium Claude Design UI: attachment landmark navigation privacy states | P1 | F5 | ☑ |
| G838 | Premium Claude Design UI: attachment screenreader announcement privacy states | P1 | F5 | ☑ |
| G839 | Premium Claude Design UI: attachment assistive summary privacy states | P1 | F5 | ☑ |
| G840 | Premium Claude Design UI: attachment assistive error recovery privacy states | P1 | F5 | ☑ |
| G841 | Premium Claude Design UI: attachment assistive recovery completion privacy states | P1 | F5 | ☑ |
| G842 | Premium Claude Design UI: attachment assistive recovery history privacy states | P1 | F5 | ☑ |
| G843 | Premium Claude Design UI: attachment assistive recovery archive privacy states | P1 | F5 | ☑ |
| G844 | Premium Claude Design UI: attachment assistive recovery archive expiry privacy states | P1 | F5 | ☑ |
| G845 | Premium Claude Design UI: attachment assistive recovery archive purge privacy states | P1 | F5 | ☑ |
| G846 | Premium Claude Design UI: attachment assistive recovery archive purge receipt privacy states | P1 | F5 | ☑ |
| G847 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export privacy states | P1 | F5 | ☑ |
| G848 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery privacy states | P1 | F5 | ☑ |
| G849 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G850 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G851 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G852 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G853 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G854 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G855 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G856 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G857 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G858 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G859 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G860 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G861 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G862 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G863 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G864 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G865 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G866 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G867 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G868 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G869 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G870 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G871 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G872 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G873 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G874 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G875 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G876 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G877 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G878 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G879 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G880 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G881 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G882 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G883 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G884 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G885 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G886 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G887 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G888 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G889 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G890 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G891 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G892 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G893 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G894 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G895 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G896 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G897 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G898 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G899 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G900 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G901 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G902 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G903 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G904 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G905 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G906 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G907 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G908 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G909 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G910 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G911 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G912 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G913 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G914 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G915 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G916 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G917 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G918 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G919 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G920 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G921 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G922 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G923 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G924 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G925 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G926 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G927 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G928 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G929 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G930 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G931 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G932 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G933 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G934 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G935 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G936 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G937 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G938 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G939 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G940 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G941 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G942 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G943 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G944 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G945 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G946 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G947 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G948 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G949 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G950 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G951 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G952 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G953 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G954 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G955 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G956 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G957 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G958 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G959 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G960 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G961 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G962 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G963 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G964 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G965 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G966 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G967 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G968 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G969 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G970 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G971 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G972 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G973 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G974 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G975 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G976 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G977 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G978 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G979 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G980 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery privacy states | P1 | F5 | ☑ |
| G981 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G982 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G983 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G984 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G985 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G986 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G987 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G988 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G989 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G990 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G991 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G992 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G993 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G994 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G995 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G996 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G997 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G998 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G999 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G1000 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G1001 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G1002 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G1003 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G1004 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G1005 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G1006 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G1007 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G1008 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G1009 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G1010 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G1011 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G1012 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G1013 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G1014 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G1015 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G1016 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G1017 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G1018 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G1019 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G1020 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G1021 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G1022 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G1023 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G1024 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G1025 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G1026 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G1027 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G1028 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G1029 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G1030 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G1031 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G1032 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G1033 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G1034 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G1035 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G1036 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G1037 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G1038 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☑ |
| G1039 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy states | P1 | F5 | ☑ |
| G1040 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy states | P1 | F5 | ☑ |
| G1041 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy states | P1 | F5 | ☑ |
| G1042 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy states | P1 | F5 | ☑ |
| G1043 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy states | P1 | F5 | ☑ |
| G1044 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy states | P1 | F5 | ☑ |
| G1045 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy states | P1 | F5 | ☑ |
| G1046 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy states | P1 | F5 | ☑ |
| G1047 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy states | P1 | F5 | ☑ |
| G1048 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy states | P1 | F5 | ☑ |
| G1049 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy states | P1 | F5 | ☑ |
| G1050 | Premium Claude Design UI: attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy states | P1 | F5 | ☐ |
| G1051 | Fertility Intelligence: imaging timeline privacy audit evidence | P1 | F5 | ☐ |
| G1052 | Fertility Intelligence: consult transcript source audit evidence | P1 | F5 | ☐ |
| G1053 | Fertility Intelligence: consult action review audit evidence | P1 | F5 | ☐ |
| G1054 | Fertility Intelligence: consult summary review audit evidence | P1 | F5 | ☐ |
| G1055 | Fertility Intelligence: embryo grading source audit evidence | P1 | F5 | ☐ |
| G1056 | Fertility Intelligence: embryo comparison language audit evidence | P1 | F5 | ☐ |
| G1057 | Fertility Intelligence: historical labvalue normalization audit evidence | P1 | F5 | ☐ |
| G1058 | Fertility Intelligence: dossier checksum duplicate review audit evidence | P1 | F5 | ☐ |
| G1059 | Fertility Intelligence: document review queue confidence audit evidence | P1 | F5 | ☐ |
| G1060 | Fertility Intelligence: timeline source reference audit evidence | P1 | F5 | ☐ |
| G1061 | Fertility Intelligence: echo appointment classification audit evidence | P1 | F5 | ☐ |
| G1062 | Fertility Intelligence: embryo EXIF isolation audit evidence | P1 | F5 | ☐ |
| G1063 | Fertility Intelligence: consult summary source paragraph audit evidence | P1 | F5 | ☐ |
| G1064 | Fertility Intelligence: embryo status event audit evidence | P1 | F5 | ☐ |
| G1065 | Fertility Timeline & Knowledge Graph: node schema audit evidence | P1 | F5 | ☐ |
| G1066 | Fertility Timeline & Knowledge Graph: edge provenance audit evidence | P1 | F5 | ☐ |
| G1067 | Research Intelligence: source registry audit evidence | P1 | F5 | ☐ |
| G1068 | Research Intelligence: dual summary audit evidence | P1 | F5 | ☐ |
| G1069 | Research Intelligence: contextmatch relevance audit evidence | P1 | F5 | ☐ |
| G1070 | Daily Recommendations: woman day card audit evidence | P1 | F5 | ☐ |
| G1071 | Daily Recommendations: man day card audit evidence | P1 | F5 | ☐ |
| G1072 | Research Intelligence: PubMed query preview audit evidence | P1 | F5 | ☐ |
| G1073 | Research Intelligence: relevance uncertainty audit evidence | P1 | F5 | ☐ |
| G1074 | Daily Recommendations: input minimization audit evidence | P1 | F5 | ☐ |
| G1075 | Daily Recommendations: woman cycle phase context audit evidence | P1 | F5 | ☐ |
| G1076 | Daily Recommendations: man lifestyle context audit evidence | P1 | F5 | ☐ |
| G1077 | Daily Recommendations: policy fixture audit evidence | P1 | F5 | ☐ |
| G1078 | Central Encrypted Platform: central health endpoint audit evidence | P1 | F5 | ☑ |
| G1079 | Central Encrypted Platform: central health live smoke evidence | P1 | F5 | ☑ |
| G1080 | Central Encrypted Platform: central health contract versioning evidence | P1 | F5 | ☑ |
| G1081 | Central Encrypted Platform: central health contract migration notes | P1 | F5 | ☑ |
| G1082 | Central Encrypted Platform: central health monitor compatibility fixture | P1 | F5 | ☑ |
| G1083 | Central Encrypted Platform: central health monitor failure runbook evidence | P1 | F5 | ☑ |
| G1084 | Central Encrypted Platform: central health monitor CI annotation evidence | P1 | F5 | ☑ |
| G1085 | Central Encrypted Platform: central health monitor annotation runbook drift guard | P1 | F5 | ☑ |
| G1086 | Central Encrypted Platform: central health monitor annotation CLI fixture | P1 | F5 | ☑ |
| G1087 | Central Encrypted Platform: central health monitor annotation CI workflow smoke | P1 | F5 | ☑ |
| G1088 | Central Encrypted Platform: central health monitor CI failure artifact evidence | P1 | F5 | ☑ |
| G1089 | Central Encrypted Platform: central health monitor failure artifact retention policy | P1 | F5 | ☑ |
| G1090 | Central Encrypted Platform: central health monitor retention audit evidence | P1 | F5 | ☑ |
| G1091 | Central Encrypted Platform: central health monitor retention audit checklist drift guard | P1 | F5 | ☑ |
| G1092 | Central Encrypted Platform: central health monitor retention CI evidence snapshot | P1 | F5 | ☑ |
| G1093 | Central Encrypted Platform: central health monitor retention snapshot freshness guard | P1 | F5 | ☑ |
| G1094 | Central Encrypted Platform: central health monitor retention freshness releasecontext evidence | P1 | F5 | ☑ |
| G1095 | Central Encrypted Platform: central health monitor retention releasecontext missing-term fixture | P1 | F5 | ☑ |
| G1096 | Central Encrypted Platform: central health monitor retention releasecontext missing-term release-state guard | P1 | F5 | ☑ |
| G1097 | Central Encrypted Platform: central health monitor retention release-state missing-term fixture | P1 | F5 | ☑ |
| G1098 | Central Encrypted Platform: central health monitor retention release-state missing-term compact contract | P1 | F5 | ☑ |
| G1099 | Central Encrypted Platform: central health monitor retention compact contract release guard | P1 | F5 | ☑ |
| G1100 | Central Encrypted Platform: central health monitor retention compact contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1101 | Central Encrypted Platform: central health monitor retention compact contract release missing-term compact contract | P1 | F5 | ☑ |
| G1102 | Central Encrypted Platform: central health monitor retention compact contract release missing-term release guard | P1 | F5 | ☑ |
| G1103 | Central Encrypted Platform: central health monitor retention compact contract release missing-term release guard missing-term fixture | P1 | F5 | ☑ |
| G1104 | Central Encrypted Platform: central health monitor retention compact contract missing-term release guard compact contract | P1 | F5 | ☑ |
| G1105 | Central Encrypted Platform: central health monitor retention compact contract missing-term release guard contract release guard | P1 | F5 | ☑ |
| G1106 | Central Encrypted Platform: central health monitor retention compact contract missing-term-contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1107 | Central Encrypted Platform: central health monitor retention compact contract missing-term-contract release guard compact contract | P1 | F5 | ☑ |
| G1108 | Central Encrypted Platform: central health monitor retention compact contract missing-term-contract release guard contract release guard | P1 | F5 | ☑ |
| G1109 | Central Encrypted Platform: central health monitor retention missing-term-contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1110 | Central Encrypted Platform: central health monitor retention missing-term-contract release guard compact contract | P1 | F5 | ☑ |
| G1111 | Central Encrypted Platform: central health monitor retention missing-term-contract release guard compact contract release guard | P1 | F5 | ☑ |
| G1112 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1113 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard compact contract | P1 | F5 | ☑ |
| G1114 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard | P1 | F5 | ☑ |
| G1115 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1116 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract | P1 | F5 | ☑ |
| G1117 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard | P1 | F5 | ☑ |
| G1118 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1119 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract | P1 | F5 | ☑ |
| G1120 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract release guard | P1 | F5 | ☑ |
| G1121 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1122 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract release guard compact contract | P1 | F5 | ☑ |
| G1123 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract release guard compact contract release guard | P1 | F5 | ☑ |
| G1124 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract release guard compact contract release guard missing-term fixture | P1 | F5 | ☑ |
| G1125 | Central Encrypted Platform: central health monitor retention missing-term-contract compact contract release guard contract release guard compact contract release guard compact contract release guard compact contract release guard compact contract | P1 | F5 | ☐ |
| G1126 | Premium Claude Design UI: dossier dashboard simplification for historical upload and imaging review | P1 | F5 | ☑ |
| G1127 | Premium Claude Design UI: dossier secondary privacy panels progressive disclosure | P1 | F5 | ☑ |
| G1128 | Premium Claude Design UI: dossier content section scan anchors | P1 | F5 | ☑ |
| G1129 | Premium Claude Design UI: dossier upload form section grouping | P1 | F5 | ☑ |
| G1130 | Premium Claude Design UI: consult and embryo upload subform scan grouping | P1 | F5 | ☑ |
| G1131 | Premium Claude Design UI: dossier add flow task selector | P1 | F5 | ☑ |
| G1132 | Premium Claude Design UI: dossier add flow focused route visibility | P1 | F5 | ☑ |
| G1133 | Premium Claude Design UI: dossier add route readiness cues | P1 | F5 | ☑ |
| G1134 | Premium Claude Design UI: dossier add route mobile density tuning | P1 | F5 | ☑ |
| G1135 | Premium Claude Design UI: dossier add route focus copy refinement | P1 | F5 | ☑ |
| G1136 | Premium Claude Design UI: dossier add route active state affordance | P1 | F5 | ☑ |
| G1137 | Premium Claude Design UI: dossier add route keyboard focus refinement | P1 | F5 | ☑ |
| G1138 | Premium Claude Design UI: dossier add route screen reader active context | P1 | F5 | ☑ |
| G1139 | Premium Claude Design UI: dossier add route switch recovery hint | P1 | F5 | ☑ |
| G1140 | Premium Claude Design UI: dossier add route draft safety microcopy | P1 | F5 | ☑ |
| G1141 | Premium Claude Design UI: dossier add route microcopy density audit | P1 | F5 | ☑ |
| G1142 | Premium Claude Design UI: dossier add first form start clarity | P1 | F5 | ☑ |
| G1143 | Premium Claude Design UI: dossier add required field cue clarity | P1 | F5 | ☑ |
| G1144 | Premium Claude Design UI: dossier add optional context hierarchy | P1 | F5 | ☑ |
| G1145 | Premium Claude Design UI: dossier add section spacing audit | P1 | F5 | ☑ |
| G1146 | Premium Claude Design UI: dossier add submit action hierarchy | P1 | F5 | ☑ |
| G1147 | Premium Claude Design UI: dossier add post-submit feedback placement | P1 | F5 | ☑ |
| G1148 | Premium Claude Design UI: dossier add feedback state tone clarity | P1 | F5 | ☑ |
| G1149 | Premium Claude Design UI: dossier add feedback copy brevity audit | P1 | F5 | ☑ |
| G1150 | Premium Claude Design UI: dossier add feedback recovery hint | P1 | F5 | ☑ |
| G1151 | Premium Claude Design UI: dossier add feedback accessibility label | P1 | F5 | ☑ |
| G1152 | Premium Claude Design UI: dossier add feedback aria-live refinement | P1 | F5 | ☑ |
| G1153 | Premium Claude Design UI: dossier add feedback announcement timing audit | P1 | F5 | ☑ |
| G1154 | Premium Claude Design UI: dossier add feedback focus return cue | P1 | F5 | ☑ |
| G1155 | Premium Claude Design UI: dossier add feedback focus visible refinement | P1 | F5 | ☑ |
| G1156 | Premium Claude Design UI: dossier add feedback target confirmation | P1 | F5 | ☑ |
| G1157 | Premium Claude Design UI: dossier add feedback next action contrast | P1 | F5 | ☑ |
| G1158 | Premium Claude Design UI: dossier add feedback microcopy order audit | P1 | F5 | ☑ |
| G1159 | Premium Claude Design UI: dossier add feedback compact rhythm audit | P1 | F5 | ☑ |
| G1160 | Premium Claude Design UI: dossier add feedback return touch target | P1 | F5 | ☑ |
| G1161 | Premium Claude Design UI: dossier add feedback return interaction tone | P1 | F5 | ☑ |
| G1162 | Premium Claude Design UI: dossier add feedback return pressed state audit | P1 | F5 | ☑ |
| G1163 | Premium Claude Design UI: dossier add feedback return reduced motion audit | P1 | F5 | ☑ |
| G1164 | Premium Claude Design UI: dossier add feedback return forced colors audit | P1 | F5 | ☑ |
| G1165 | Premium Claude Design UI: dossier add feedback return anchor landing audit | P1 | F5 | ☑ |
| G1166 | Premium Claude Design UI: dossier add feedback return landing context cue | P1 | F5 | ☑ |
| G1167 | Premium Claude Design UI: dossier add feedback return landing forced-colors cue | P1 | F5 | ☑ |
| G1168 | Premium Claude Design UI: dossier add feedback return landing focus sync | P1 | F5 | ☑ |
| G1169 | Premium Claude Design UI: dossier add feedback return focused landing cue | P1 | F5 | ☑ |
| G1170 | Premium Claude Design UI: dossier add feedback return focused cue contrast audit | P1 | F5 | ☑ |
| G1171 | Premium Claude Design UI: dossier add feedback return focused cue target parity | P1 | F5 | ☑ |
| G1172 | Premium Claude Design UI: dossier add feedback return cue parity regression smoke | P1 | F5 | ☑ |
| G1173 | Premium Claude Design UI: dossier add feedback return cue parity smoke CI evidence | P1 | F5 | ☑ |
| G1174 | Premium Claude Design UI: dossier add feedback return cue parity CI order guard | P1 | F5 | ☑ |
| G1175 | Premium Claude Design UI: dossier add feedback return cue parity workflow label drift guard | P1 | F5 | ☑ |
| G1176 | Premium Claude Design UI: dossier add feedback return cue parity command drift guard | P1 | F5 | ☐ |
| G1177 | Premium Claude Design UI: werkruimte-navigatie tegen alles-op-een-pagina gevoel | P1 | F5 | ☑ |
| G1178 | Premium Claude Design UI: startscherm modules verder verdelen in taakgerichte routes | P1 | F5 | ☑ |
| G1179 | Premium Claude Design UI: uploadflows omzetten naar herbruikbare workflowcomponenten | P1 | F5 | ☑ |
| G1180 | Premium Claude Design UI: consultupload omzetten naar herbruikbare workflowcomponenten | P1 | F5 | ☑ |
| G1181 | Premium Claude Design UI: embryoworkflows omzetten naar herbruikbare workflowcomponenten | P1 | F5 | ☑ |
| G1182 | Premium Claude Design UI: tijdlijnweergaven omzetten naar herbruikbare timelinecomponenten | P1 | F5 | ☑ |
| G1183 | Premium Claude Design UI: aanbevelingen omzetten naar herbruikbare recommendationcomponenten | P1 | F5 | ☑ |
| G1184 | Premium Claude Design UI: researchsamenvattingen omzetten naar herbruikbare researchcomponenten | P1 | F5 | ☑ |
| G1185 | Premium Claude Design UI: kennispagina opdelen in taakgerichte researchroutes | P1 | F5 | ☑ |
| G1186 | Premium Claude Design UI: dossierpagina opdelen in taakgerichte medical-record routes | P1 | F5 | ☑ |
| G1187 | Premium Claude Design UI: welzijn en afwegingen opdelen in taakgerichte routes | P1 | F5 | ☑ |
| G1188 | Premium Claude Design UI: afwegingenscherm opdelen in taakgerichte decisionroutes | P1 | F5 | ☑ |
| G1189 | Premium Claude Design UI: beheer- en instellingenschermen opdelen in taakgerichte privacyroutes | P1 | F5 | ☑ |
| G1190 | Premium Claude Design UI: herinneringen en notificatieprivacy opdelen in taakgerichte notificationroutes | P1 | F5 | ☑ |
| G1191 | Premium Claude Design UI: logboek en auditoverzicht opdelen in taakgerichte historyroutes | P1 | F5 | ☑ |
| G1192 | Premium Claude Design UI: kostenscherm opdelen in taakgerichte financeroutes | P1 | F5 | ☑ |
| G1193 | Premium Claude Design UI: trajectscherm opdelen in taakgerichte treatmentroutes | P1 | F5 | ☑ |
| G1194 | Premium Claude Design UI: agendascherm opdelen in taakgerichte scheduleroutes | P1 | F5 | ☑ |
| G1195 | Premium Claude Design UI: medicatiescherm opdelen in taakgerichte medicationroutes | P1 | F5 | ☑ |
| G1196 | Premium Claude Design UI: vragenscherm opdelen in taakgerichte questionroutes | P1 | F5 | ☑ |
| G1197 | Premium Claude Design UI: taakroutepanelen visueel verfijnen met gedeelde command component | P1 | F5 | ☑ |
| G1198 | Premium Claude Design UI: commandroutes uitbreiden met statusbadges en compactere density states | P1 | F5 | ☑ |
| G1199 | Premium Claude Design UI: mobiele commandroutes verfijnen met sticky ruimte en bottom-nav affordance | P1 | F5 | ☑ |
| G1200 | Premium Claude Design UI: mobiele formulierpanelen verdichten met duidelijke primaire actiezone | P1 | F5 | ☑ |
| G1201 | Premium Claude Design UI: mobiele formulierinhoud groeperen met compacte veldsecties | P1 | F5 | ☑ |
| G1202 | Premium Claude Design UI: veldsectiepatroon uitbreiden naar dossier- en uploadflows | P1 | F5 | ☑ |
| G1203 | Premium Claude Design UI: startscherm openen met kernflow-werkbank | P1 | F5 | ☑ |
| G1204 | Premium Claude Design UI: resterende startmodules omzetten naar echte flowpanelen | P1 | F5 | ☑ |
| G1205 | Premium Claude Design UI: mobiele app-chrome boven Start compacter maken | P1 | F5 | ☑ |
| G1206 | Premium Claude Design UI: dossierroute eerste viewport en live smoke verder verfijnen | P1 | F5 | ☑ |
| G1207 | Premium Claude Design UI: kennis en research eerste viewport als researchwerkbank | P1 | F5 | ☑ |
| G1208 | Premium Claude Design UI: dagelijkse aanbevelingen eerste viewport als advieswerkbank | P1 | F5 | ☑ |
| G1209 | Premium Claude Design UI: traject en timeline eerste viewport als behandelwerkbank | P1 | F5 | ☑ |
| G1210 | Premium Claude Design UI: welzijn en afwegingen eerste viewport als inzichtwerkbank | P1 | F5 | ☑ |
| G1211 | Premium Claude Design UI: kosten en backup eerste viewport als beheerwerkbank | P1 | F5 | ☑ |
| G1212 | Premium Claude Design UI: logboek en herinneringen eerste viewport als systeemwerkbank | P1 | F5 | ☑ |
| G1213 | Premium Claude Design UI: agenda en medicatie eerste viewport als dagplanningwerkbank | P1 | F5 | ☑ |
| G1214 | Premium Claude Design UI: vragen eerste viewport als consultvoorbereidingswerkbank | P1 | F5 | ☑ |
| G1215 | Premium Claude Design UI: first-viewport workbenches consolideren naar gedeelde componenthelper | P1 | F5 | ☑ |
| G1216 | Premium Claude Design UI: first-viewport workbench CSS consolideren met gedeelde basisklassen | P1 | F5 | ☑ |
| G1217 | Premium Claude Design UI: actieve routepanelen verder ontlasten tegen lange-paginaervaring | P1 | F5 | ☑ |
| G1218 | Premium Claude Design UI: route-summary ontlasting uitbreiden naar medicatie en traject | P1 | F5 | ☑ |
| G1219 | Premium Claude Design UI: route-summary ontlasting uitbreiden naar dossier en kennis | P1 | F5 | ☑ |
| G1220 | Premium Claude Design UI: route-summary ontlasting uitbreiden naar welzijn en afwegingen | P1 | F5 | ☑ |
| G1221 | Premium Claude Design UI: route-summary ontlasting uitbreiden naar kosten en backup | P1 | F5 | ☑ |
| G1222 | Premium Claude Design UI: route-summary ontlasting uitbreiden naar logboek en herinneringen | P1 | F5 | ☑ |
| G1223 | Premium Claude Design UI: route-summary consistentie-audit en resterende lange-pagina restanten oplossen | P1 | F5 | ☑ |
| G1224 | Premium Claude Design UI: domeinschermen omzetten naar split-view werkruimtes | P1 | F5 | ☑ |
| G1225 | Premium Claude Design UI: split-view werkruimtes uitbreiden naar Traject en Medicatie | P1 | F5 | ☑ |
| G1226 | Premium Claude Design UI: split-view werkruimtes uitbreiden naar inzicht- en beheerschermen | P1 | F5 | ☑ |
| G1227 | Premium Claude Design UI: split-view werkruimtes afronden voor Logboek Herinneringen en Back-up | P1 | F5 | ☑ |
| G1228 | Premium Claude Design UI: split-view werkruimtes visueel verfijnen en smoke automatiseren | P1 | F5 | ☑ |
| G1229 | Premium Claude Design UI: split-view contextkolommen inhoudelijk verdichten per domein | P1 | F5 | ☑ |
| G1230 | Premium Claude Design UI: split-view contextsignalen uitbreiden naar beheer- en welzijnsdomeinen | P1 | F5 | ☑ |
| G1231 | Premium Claude Design UI: split-view contextsignalen visueel toetsen met screenshots | P1 | F5 | ☑ |
| G1232 | Premium Claude Design UI: contextsignalen visueel verfijnen na screenshotaudit | P1 | F5 | ☑ |
| G1233 | Premium Claude Design UI: contextsignalen uitbreiden met route-specifieke microstates | P1 | F5 | ☑ |
| G1234 | Premium Claude Design UI: route-specifieke microstates uitbreiden naar resterende contextkolommen | P1 | F5 | ☑ |
| G1235 | Premium Claude Design UI: contextkolommen uitbreiden met route-eigen volgende-actie compactheid | P1 | F5 | ☑ |
| G1236 | Premium Claude Design UI: contextkolom actieflow visueel koppelen aan eerste signaalkaart | P1 | F5 | ☑ |
| G1237 | Premium Claude Design UI: contextkolom flowstates verfijnen met route-eigen accentbalans | P1 | F5 | ☑ |
| G1238 | Premium Claude Design UI: startscherm opdelen in fertility intelligence werkbanen | P1 | F5 | ☑ |
| G1239 | Premium Claude Design UI: dossier en intelligence workflows uitwerken als eigen tabbladen na start-hub | P1 | F5 | ☑ |
| G1240 | Premium Claude Design UI: hubroutes verdichten met compacte detailpanelen en lege staten | P1 | F5 | ☑ |
| G1241 | Premium Claude Design UI: research en embryo routes als zelfstandige hubflows versterken | P1 | F5 | ☑ |
| G1242 | Premium Claude Design UI: research en embryo hubflows inhoudelijk verdichten | P1 | F5 | ☑ |
| G1243 | Premium Claude Design UI: routeflow-screenshots automatiseren voor start research en imaging | P1 | F5 | ☑ |
| G1244 | Premium Claude Design UI: consultupload als zelfstandige hubflow zichtbaar maken | P1 | F5 | ☑ |
| G1245 | Premium Claude Design UI: consult intelligence detailpanelen verdichten na consult-hubflow | P1 | F5 | ☑ |
| G1246 | Premium Claude Design UI: consultkaarten inhoudelijk scannen met compacte samenvatting en acties | P1 | F5 | ☑ |
| G1247 | Premium Claude Design UI: consultkaart browser-evidence uitbreiden met gevulde fixture | P1 | F5 | ☐ |
| G1248 | Premium Claude Design UI: trajectscan in behandelwerkbank verdichten | P1 | F5 | ☑ |
| G1249 | Premium Claude Design UI: startscan tussen hub en vervolgpanelen toevoegen | P1 | F5 | ☑ |
| G1250 | Premium Claude Design UI: researchscan in kenniswerkbank toevoegen | P1 | F5 | ☑ |
| G1251 | Premium Claude Design UI: dossierscan in dossierwerkbank toevoegen | P1 | F5 | ☑ |
| G1252 | Premium Claude Design UI: dagadvies-scan in advieswerkbank toevoegen | P1 | F5 | ☑ |
| G1253 | Premium Claude Design UI: start-cockpit boven fertility hub toevoegen | P1 | F5 | ☑ |
| G1254 | Premium Claude Design UI: globale workspace-strip boven content toevoegen | P1 | F5 | ☑ |
| G1255 | Premium Claude Design UI: upload-triage in dossierroute toevoegen | P1 | F5 | ☑ |
| G1256 | Premium Claude Design UI: timeline-leesmodus in trajectcontext toevoegen | P1 | F5 | ☑ |
| G1257 | Premium Claude Design UI: dagadvies-actieplanner toevoegen | P1 | F5 | ☑ |
| G1258 | Premium Claude Design UI: research-leeslaag toevoegen | P1 | F5 | ☑ |
| G1259 | Premium Claude Design UI: imaging-inspectiebord toevoegen | P1 | F5 | ☑ |
| G1260 | Premium Claude Design UI: encrypted-sync bord toevoegen | P1 | F5 | ☑ |
| G1261 | Premium Claude Design UI: consultvoorbereiding bord toevoegen | P1 | F5 | ☑ |
| G1262 | Premium Claude Design UI: welzijn-geschiedenisbord toevoegen | P1 | F5 | ☑ |
| G1263 | Premium Claude Design UI: werkruimte-architectuur zichtbaar maken | P1 | F5 | ☑ |
| G1264 | Premium Claude Design UI: start focus-shell verdichten | P1 | F5 | ☑ |
| G1265 | Premium Claude Design UI: dossier focus-shell bundelen | P1 | F5 | ☑ |
| G1266 | Premium Claude Design UI: knowledge focus-shell bundelen | P1 | F5 | ☑ |
| G1267 | Premium Claude Design UI: treatment focus-shell bundelen | P1 | F5 | ☑ |
| G1268 | Premium Claude Design UI: daily advice focus-shell bundelen | P1 | F5 | ☑ |
| G1269 | Premium Claude Design UI: start vervolgpanelen als contained workspace | P1 | F5 | ☑ |
| G1270 | Premium Claude Design UI: question focus-shell bundelen | P1 | F5 | ☑ |
| G1271 | Premium Claude Design UI: wellbeing focus-shell bundelen | P1 | F5 | ☑ |
| G1272 | Premium Claude Design UI: decision focus-shell bundelen | P1 | F5 | ☑ |
| G1273 | Premium Claude Design UI: medication focus-shell bundelen | P1 | F5 | ☑ |
| G1274 | Premium Claude Design UI: schedule focus-shell bundelen | P1 | F5 | ☑ |
| G1275 | Premium Claude Design UI: finance focus-shell bundelen | P1 | F5 | ☑ |
| G1276 | Premium Claude Design UI: backup focus-shell bundelen | P1 | F5 | ☑ |
| G1277 | Premium Claude Design UI: eventlog focus-shell bundelen | P1 | F5 | ☑ |
| G1278 | Premium Claude Design UI: notification focus-shell bundelen | P1 | F5 | ☑ |
| G1279 | Premium Claude Design UI: focusroute desktop chrome reduceren | P1 | F5 | ☑ |
| G1280 | Premium Claude Design UI: start chrome reduceren | P1 | F5 | ☑ |
| G1281 | Premium Claude Design UI: start-flowrail één open paneel | P1 | F5 | ☑ |
| G1282 | Premium Claude Design UI: compacte topbar chrome | P1 | F5 | ☑ |
| G1283 | Premium Claude Design UI: compacte focusroute workspace-strip | P1 | F5 | ☑ |
| G1284 | Premium Claude Design UI: split-workspace hoofdruimte voorrang | P1 | F5 | ☑ |
| G1285 | Premium Claude Design UI: compacte focus-shell supportstrips | P1 | F5 | ☑ |
| G1286 | Premium Claude Design UI: compacte focus-shell headers | P1 | F5 | ☑ |
| G1287 | Premium Claude Design UI: compacte actieve routeheaders | P1 | F5 | ☑ |
| G1288 | Premium Claude Design UI: compacte hub-workflow laag | P1 | F5 | ☑ |
| G1289 | Premium Claude Design UI: compacte eerste contentboards | P1 | F5 | ☑ |
| G1290 | Premium Claude Design UI: compacte route-samenvattingen | P1 | F5 | ☑ |
| G1291 | Premium Claude Design UI: compacte resterende routeboards | P1 | F5 | ☑ |
| G1292 | Premium Claude Design UI: compacte routedetails en panels | P1 | F5 | ☑ |
| G1293 | Premium Claude Design UI: begrensde desktop split-workspace | P1 | F5 | ☑ |
| G1294 | Premium Claude Design UI: Start command-center met drie werkvlakken | P1 | F5 | ☑ |
| G1295 | Premium Claude Design UI: Dagadvies als begrensde advies-console | P1 | F5 | ☑ |
| G1296 | Premium Claude Design UI: Dossier uploadroute als begrensde upload-console | P1 | F5 | ☑ |
| G1297 | Premium Claude Design UI: Fertility Timeline als begrensde timeline-console | P1 | F5 | ☑ |
| G1298 | Premium Claude Design UI: Compacte workspace-deck voor detailroutes | P1 | F5 | ☑ |
| G1299 | Premium Claude Design UI: Desktop shell als begrensde app-workspace | P1 | F5 | ☑ |
| G1300 | Premium Claude Design UI: Start als compacte eerste-viewport launchpad | P1 | F5 | ☑ |
| G1301 | Premium Claude Design UI: Dossier als compacte eerste-viewport console | P1 | F5 | ☑ |
| G1302 | Premium Claude Design UI: Research als compacte knowledge-console | P1 | F5 | ☑ |
| G1303 | Premium Claude Design UI: Vragen als compacte consult-console | P1 | F5 | ☑ |
| G1304 | Premium Claude Design UI: Welzijn als compacte wellbeing-console | P1 | F5 | ☑ |
| G1305 | Premium Claude Design UI: Afwegingen als compacte decision-console | P1 | F5 | ☑ |
| G1306 | Premium Claude Design UI: Kosten als compacte finance-console | P1 | F5 | ☑ |
| G1307 | Premium Claude Design UI: Back-up als compacte backup-console | P1 | F5 | ☑ |
| G1308 | Premium Claude Design UI: Logboek als compacte audit-console | P1 | F5 | ☑ |
| G1309 | Premium Claude Design UI: Herinneringen als compacte notification-console | P1 | F5 | ☑ |
| G1310 | Premium Claude Design UI: Agenda als compacte schedule-console | P1 | F5 | ☑ |
| G1311 | Premium Claude Design UI: Medicatie als compacte medication-console | P1 | F5 | ☑ |
| G1312 | Premium Claude Design UI: Traject als compacte treatment-console | P1 | F5 | ☑ |
| G1313 | Premium Claude Design UI: Start als compactere eerste-viewport console | P1 | F5 | ☑ |
| G1314 | Premium Claude Design UI: Dagadvies als directe compacte advice-console | P1 | F5 | ☑ |
| G1315 | Premium Claude Design UI: Vandaag als directe compacte start-console | P1 | F5 | ☑ |
| G1316 | Premium Claude Design UI: Dossier upload als directe intake-console | P1 | F5 | ☑ |
| G1317 | Premium Claude Design UI: Hoofdcontent als actieve screen-stage | P1 | F5 | ☑ |
| G1318 | Premium Claude Design UI: Start mobiel als compacte route-ingang | P1 | F5 | ☑ |
| G1319 | Premium Claude Design UI: Dagadvies mobiel als compacte adviesconsole | P1 | F5 | ☑ |
| G1320 | CFX-030: PWA theme-color naar Claude Design teal | P0 | F5 | ☑ |
| G1321 | CFX-010/CFX-081: Mobiele bottom-nav met Meer-sheet | P1 | F5 | ☑ |
| G1322 | CFX-013: Grote content-frame verwijderen | P1 | F5 | ☑ |
| G1323 | CFX-009: Dagadvies hernoemen naar suggesties | P1 | F5 | ☑ |
| G1324 | CFX-006/CFX-046 + CFX-007 startgroet: persoonlijke instellingen en namen | P0 | F5 | ☑ |
| G1325 | CFX-007: Welzijn gebruikt persoonlijke namen voor eigenaarlabels | P1 | F5 | ☑ |
| G1326 | CFX-015: Mobiele Meer-sheet en routeformulieren overlappen niet | P1 | F5 | ☑ |
| G1327 | CFX-033b: Sidebar-acties naar rustige utility-zone | P1 | F5 | ☑ |
| G1328 | CFX-003c: Rijke lege staten in app-shell | P1 | F5 | ☑ |
| G1329 | CFX-004c: Skeleton-laadlaag voor unlock en reload | P1 | F5 | ☑ |
| G1330 | Premium Claude Design UI: Dossier uploadconsole als single-flow intake | P1 | F5 | ☑ |
| G1331 | Premium Claude Design UI: Dossier zoekroute als compacte zoekconsole | P1 | F5 | ☑ |
| G1332 | Daily Recommendations: feedbackstatus van tijdlijnsuggesties tonen | P1 | F5 | ☑ |
| G1333 | Daily Recommendations: feedbackstatus gebruiken in dagadviesoverzicht | P1 | F5 | ☑ |
| G1334 | Daily Recommendations: feedbacksamenvatting in advieswerkbank | P1 | F5 | ☑ |
| G1335 | Daily Recommendations: feedbackfilter in dagadvieslijst | P1 | F5 | ☑ |
| G1336 | Daily Recommendations: feedbackfilter reset en tellerchips | P1 | F5 | ☑ |
| G1337 | Daily Recommendations: feedbackfilter route deep-link | P1 | F5 | ☑ |
| G1338 | Daily Recommendations: feedbackfilter browser navigation smoke | P1 | F5 | ☑ |
| G1339 | Daily Recommendations: feedbackfilter zichtbaar in workflowstatus | P1 | F5 | ☑ |
| G1340 | Daily Recommendations: feedbackfilter reset vanuit workflowstatus | P1 | F5 | ☑ |
| G1341 | Daily Recommendations: filterstatus laat lijstpaneel openen | P1 | F5 | ☑ |
| G1342 | Daily Recommendations: filterstatus toont actieve lijstfocus | P1 | F5 | ☑ |
| G1343 | Daily Recommendations: lijstfocusstatus kan rustig sluiten | P1 | F5 | ☑ |
| G1344 | Daily Recommendations: lijstpaneel toont actieve filterheader | P1 | F5 | ☑ |
| G1345 | Daily Recommendations: lijstfilterheader heeft resetactie | P1 | F5 | ☑ |
| G1346 | Daily Recommendations: lijstfilterheader toont eigenaarverdeling | P1 | F5 | ☑ |
| G1347 | Daily Recommendations: lijstfilterheader dempt nul-eigenaren | P1 | F5 | ☑ |
| G1348 | Daily Recommendations: lijstfilterheader zet relevante eigenaars eerst | P1 | F5 | ☑ |
| G1349 | Daily Recommendations: lijstfilterheader toont dominante eigenaar subtiel | P1 | F5 | ☑ |
| G1350 | Daily Recommendations: lijstfilterheader toont statuslegenda compact | P1 | F5 | ☑ |
| G1351 | Daily Recommendations: lijstfilterheader maakt resetcontext duidelijker | P1 | F5 | ☑ |
| G1352 | Daily Recommendations: workflowreset maakt lokale scope duidelijker | P1 | F5 | ☑ |
| G1353 | Daily Recommendations: filterformulier reset maakt lokale scope duidelijker | P1 | F5 | ☑ |
| G1354 | Daily Recommendations: resetknoppen tonen uniforme focusstijl | P1 | F5 | ☑ |
| G1355 | Daily Recommendations: resetknoppen tonen consistente hoverstijl | P1 | F5 | ☑ |
| G1356 | Daily Recommendations: resetknoppen tonen rustige actieve drukstijl | P1 | F5 | ☑ |
| G1357 | Daily Recommendations: resetknoppen hebben compacte disabled-guard stijl | P1 | F5 | ☑ |
| G1358 | Daily Recommendations: resetknoppen blijven duidelijk in forced-colors | P1 | F5 | ☑ |
| G1359 | Daily Recommendations: resetknoppen hebben consistente touch target ruimte | P1 | F5 | ☑ |
| G1360 | Daily Recommendations: resetknoppen behouden compacte tekstbreedte | P1 | F5 | ☑ |
| G1361 | Daily Recommendations: resetknoppen bewaren consistente routefocus | P1 | F5 | ☑ |
| G1362 | Daily Recommendations: resetmelding heeft compacte scanstijl | P1 | F5 | ☑ |
| G1363 | Daily Recommendations: resetmelding ondersteunt forced-colors scanstijl | P1 | F5 | ☑ |
| G1364 | Daily Recommendations: resetmelding sluit rustig zonder filterwijziging | P1 | F5 | ☑ |
| G1365 | Daily Recommendations: resetmelding bewaart sluitstatus bij her-render | P1 | F5 | ☑ |
| G1366 | Daily Recommendations: resetmelding heeft toetsenbordfocus na nieuwe reset | P1 | F5 | ☑ |
| G1367 | Daily Recommendations: resetmelding behoudt focusstijl in forced-colors | P1 | F5 | ☑ |
| G1368 | Daily Recommendations: resetmelding gebruikt compacte focusafstand op mobiel | P1 | F5 | ☑ |
| G1369 | Daily Recommendations: resetmelding gebruikt rustige focusanimatie | P1 | F5 | ☑ |
| G1370 | Daily Recommendations: resetmelding toont rustige hover op mobiel | P1 | F5 | ☑ |
| G1371 | Daily Recommendations: resetmelding borgt active-state op touch | P1 | F5 | ☑ |
| G1372 | Daily Recommendations: resetmelding borgt disabled/verberg-state | P1 | F5 | ☑ |
| G1373 | Daily Recommendations: resetmelding borgt focus bij guarded hide | P1 | F5 | ☑ |
| G1374 | Daily Recommendations: resetmelding toont guarded hide uitleg | P1 | F5 | ☑ |
| G1375 | Daily Recommendations: resetmelding bewaakt helptekst op smalle schermen | P1 | F5 | ☑ |
| G1376 | Daily Recommendations: resetmelding bewaakt helptekst in forced-colors mobiel | P1 | F5 | ☐ |

---

## Telling

- **Totaal doelen: 1376** (id's G001 t/m G1376, doorlopend genummerd) — ruim boven het
  minimum van 100 concrete doelen.
- Verdeling per fase en prioriteit kan met de tabellen hierboven worden afgeleid; de
  statussamenvatting bovenaan geeft het totaalbeeld (☑/◐/☐).

> Id's zijn stabiel zodra vastgesteld — voeg nieuwe doelen toe met een nieuw, hoger
> id; hergebruik geen oude id's.

## Permanente onderhoudsregel

Wijzig je een status, voeg je een doel toe of vink je iets af, werk dan in dezelfde
wijziging de **statussamenvatting** en de **telling** bij, en (indien van toepassing)
[`CURRENT_STATE.md`](CURRENT_STATE.md) en [`CHANGELOG.md`](CHANGELOG.md). De backlog is
de canonieke doelenlijst; hij mag nooit achterlopen op de werkelijkheid.
