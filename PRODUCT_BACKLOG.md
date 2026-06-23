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

## Prioriteiten

- **P0** — kritisch / fundament (privacy, veiligheid, MVP-basis)
- **P1** — MVP must-have
- **P2** — nice-to-have
- **P3** — later / toekomst

## Fasen

`F0` fundament · `F1` MVP · `F2` nice-to-have · `F3` later · `F4` toekomst (zie
[`ROADMAP.md`](ROADMAP.md)).

## Samenvatting per status

| Status | Aantal |
|---|---|
| ☑ klaar | 196 |
| ◐ bezig | 0 |
| ☐ open | 47 |
| **Totaal** | **243** |

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
| G197 | PFIP consult intelligence: automatische consultsamenvatting met bronverwijzing en conceptlabel | P0 | F4 | ☐ |
| G198 | PFIP consult intelligence: actiepunten uit consulten extraheren als lokale taken of vragen | P0 | F3 | ☐ |
| G199 | PFIP consult intelligence: vragenlijst genereren voor volgende afspraak op basis van open punten | P0 | F3 | ☐ |
| G200 | PFIP consult intelligence: behandelgeschiedenis reconstrueren uit consulten, afspraken en dossierdocumenten | P0 | F3 | ☐ |
| G201 | PFIP consult intelligence: consultinzichten koppelen aan trajectfase, medicatie, embryo of onderzoek | P1 | F3 | ☐ |
| G202 | PFIP consult intelligence: verschilweergave tussen consultsamenvatting en gebruiker-correctie | P2 | F4 | ☐ |
| G203 | PFIP consult intelligence: safety-policy dat consult-AI geen diagnose of behandelkeuze adviseert | P0 | F3 | ☐ |
| G204 | PFIP embryo tracking: embryo-dossier als eigen overzicht per embryo binnen een poging | P0 | F3 | ☐ |
| G205 | PFIP embryo tracking: embryo uploads koppelen aan embryo-id, dag, poging en laboratoriumcontext | P0 | F3 | ☐ |
| G206 | PFIP embryo tracking: kwaliteitsregistratie per meetmoment met kliniekterminologie en bron | P0 | F3 | ☐ |
| G207 | PFIP embryo tracking: embryo-historie tonen van bevruchting tot terugplaatsing/invriezen/stop | P0 | F3 | ☐ |
| G208 | PFIP embryo tracking: embryo's binnen dezelfde poging vergelijken zonder kansberekening | P1 | F3 | ☐ |
| G209 | PFIP embryo tracking: embryo-tijdlijn integreren met afspraken, labrapporten en terugplaatsing | P0 | F3 | ☐ |
| G210 | PFIP embryo tracking: behandelcontext tonen bij embryo, inclusief protocol, poging en relevante notities | P1 | F3 | ☐ |
| G211 | PFIP embryo tracking: waarschuwing dat embryokwaliteit geen voorspelling of medisch advies is | P0 | F3 | ☐ |
| G212 | PFIP research intelligence: bronnenlijst voor relevante fertiliteitsresearch met handmatige seed en lokale cache | P1 | F4 | ☐ |
| G213 | PFIP research intelligence: researchaggregatie achter expliciete netwerk-opt-in | P0 | F4 | ☐ |
| G214 | PFIP research intelligence: wetenschappelijke samenvatting per publicatie met bron en datum | P1 | F4 | ☐ |
| G215 | PFIP research intelligence: eenvoudige lekensamenvatting per publicatie in begrijpelijk Nederlands | P0 | F4 | ☐ |
| G216 | PFIP research intelligence: relevantie voor gebruiker koppelen aan dossiercontext zonder behandeladvies | P0 | F4 | ☐ |
| G217 | PFIP research intelligence: trends groeperen per onderwerp zoals IVF, ICSI, embryo, leefstijl en mannelijke factor | P2 | F4 | ☐ |
| G218 | PFIP research intelligence: bronverificatie en publicatiedatum zichtbaar bij iedere researchkaart | P0 | F4 | ☐ |
| G219 | PFIP research intelligence: verouderde research markeren en periodieke herverificatie plannen | P1 | F4 | ☐ |
| G220 | PFIP daily recommendations: dagelijks aanbevelingsoverzicht met scheiding vrouw, man en samen | P0 | F4 | ☐ |
| G221 | PFIP daily recommendations: leefstijlaanbevelingen baseren op dossier, cyclusfase en behandelgeschiedenis | P0 | F4 | ☐ |
| G222 | PFIP daily recommendations: voeding- en supplementnotities tonen als checklijst met bron en disclaimer | P0 | F4 | ☐ |
| G223 | PFIP daily recommendations: behandelvoorbereiding genereren uit afspraken, medicatie en open actiepunten | P0 | F4 | ☐ |
| G224 | PFIP daily recommendations: cyclusgerelateerde aanbevelingen tonen zonder diagnose of dosering | P0 | F4 | ☐ |
| G225 | PFIP daily recommendations: mannelijke vruchtbaarheidsoptimalisatie als leefstijl- en voorbereidingskaart | P1 | F4 | ☐ |
| G226 | PFIP daily recommendations: aanbevelingen uitlegbaar maken met gebruikte dossierbronnen | P0 | F4 | ☐ |
| G227 | PFIP daily recommendations: gebruiker kan aanbevelingen afwijzen, bewaren of omzetten naar herinnering/vraag | P1 | F4 | ☐ |
| G228 | PFIP knowledge graph: lokaal graph-model voor relaties tussen documenten, embryo's, behandelingen, gesprekken, research en aanbevelingen | P0 | F4 | ☐ |
| G229 | PFIP knowledge graph: graph-relaties automatisch voorstellen en handmatig laten bevestigen | P0 | F4 | ☐ |
| G230 | PFIP knowledge graph: contextuele inzichten genereren met bronpad en onzekerheidslabel | P0 | F4 | ☐ |
| G231 | PFIP knowledge graph: graphweergave per traject met filters op type relatie en periode | P2 | F4 | ☐ |
| G232 | PFIP knowledge graph: relatie tussen research en persoonlijk dossier tonen zonder causale claims | P0 | F4 | ☐ |
| G233 | PFIP knowledge graph: index rebuild vanuit versleutelde records zonder dataverlies | P1 | F4 | ☐ |
| G234 | PFIP knowledge graph: privacytest dat graphberekening lokaal blijft | P0 | F4 | ☐ |
| G235 | PFIP knowledge graph: exporteerbare graph-samenvatting voor consultvoorbereiding | P2 | F4 | ☐ |
| G236 | PFIP fertility timeline: centraal fertiliteitstraject-scherm met onderzoeken, consulten, behandelingen, embryo's, aanbevelingen en research | P0 | F3 | ☐ |
| G237 | PFIP fertility timeline: tijdlijnitems normaliseren uit bestaande afspraken, dossierdocumenten, embryo's, vragen en medicatie | P0 | F3 | ☐ |
| G238 | PFIP fertility timeline: filters voor type, traject, eigenaar, bron en periode | P1 | F3 | ☐ |
| G239 | PFIP fertility timeline: detailpaneel per tijdlijnitem met bron, context en gekoppelde records | P1 | F3 | ☐ |
| G240 | PFIP fertility timeline: belangrijke mijlpalen en ontbrekende context zichtbaar maken zonder oordeel | P1 | F3 | ☐ |
| G241 | PFIP fertility timeline: complete trajectexport voor eigen consultvoorbereiding | P2 | F3 | ☐ |
| G242 | PFIP fertility timeline: tijdlijn blijft bruikbaar offline en na import van back-up/syncpakket | P0 | F3 | ☐ |
| G243 | PFIP fertility timeline: toegankelijk mobiel ontwerp voor één-scherm-overzicht van het volledige traject | P1 | F3 | ☐ |

---

## Telling

- **Totaal doelen: 243** (id's G001 t/m G243, doorlopend genummerd) — ruim boven het
  minimum van 100.
- Verdeling per fase en prioriteit kan met de tabellen hierboven worden afgeleid; de
  statussamenvatting bovenaan geeft het totaalbeeld (☑/◐/☐).

> Id's zijn stabiel zodra vastgesteld — voeg nieuwe doelen toe met een nieuw, hoger
> id; hergebruik geen oude id's.

## Permanente onderhoudsregel

Wijzig je een status, voeg je een doel toe of vink je iets af, werk dan in dezelfde
wijziging de **statussamenvatting** en de **telling** bij, en (indien van toepassing)
[`CURRENT_STATE.md`](CURRENT_STATE.md) en [`CHANGELOG.md`](CHANGELOG.md). De backlog is
de canonieke doelenlijst; hij mag nooit achterlopen op de werkelijkheid.
