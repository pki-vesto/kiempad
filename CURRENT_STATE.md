# Kiempad — CURRENT_STATE

> Stand per 2026-06-23. Houd dit bij de tijd: het is de eerlijke "wat is er echt"
> naast de ambitie in `ROADMAP.md`.

## 1. Gebouwde Functionaliteit

- **Documentatieset** (deze repo): visie, architectuur, roadmap, datamodel, privacy,
  beveiliging, beslissingen (ADR's), kennisbank-plan, runbook, werkwijze.
- **Repo-scaffold:** TypeScript/Vite-projectopzet, `Makefile`, Docker(-compose),
  `.github`-templates + CI, `.gitignore`, `.env.example`, licentie.
- **Domein-kernvormen** in code: [`src/domain/types.ts`](src/domain/types.ts) en een
  eerste, geteste domeinregel [`src/domain/vergoeding.ts`](src/domain/vergoeding.ts)
  (+ Vitest-test).
- **M1.1 app-skelet:** een Nederlandstalige, responsive Vite-app-shell met
  hash-navigatie tussen de hoofdschermen, rustige start-/werkruimte en zichtbare
  niet-medische disclaimer.
- **M1.2 versleutelde opslagfundering:** passphrase-kluis met PBKDF2 + salt,
  niet-exporteerbare AES-256-GCM sleutel alleen in geheugen, verifier-based unlock,
  auto-lock, IndexedDB repository-interface voor versleutelde records, UUID/ISO-
  metadata, opslagbrede schemaversie, additieve schema-opzet en tests voor
  crypto/opslag/privacy.
- **M1.3 traject & fasen:** traject aanmaken/bewerken/verwijderen via de
  versleutelde repository, status en notitie bewaren, vaste IVF/ICSI-fasen in
  volgorde tonen, huidige fase markeren, fase-toelichtingen tonen, tijdlijnoverzicht
  en startscherm-volgende-stap.
- **M1.4 agenda & afspraken:** afspraken aanmaken/bewerken/verwijderen via de
  versleutelde repository, afspraaktypes, komende-afsprakenlijst, trajectkoppeling,
  voorbereiding/notitie, gekoppelde vraag voor de arts en afspraakherinnering als
  lokaal record.
- **M1.5 medicatie & injectieschema:** medicatie vastleggen met vorm, instructie,
  actief/inactief en kliniekdosistekst, injectievorm apart tonen, DoseLogs genereren
  vanuit expliciete planning, vandaag-overzicht tonen, innames als genomen/
  overgeslagen markeren, een optionele voorraad bijhouden, lokale instructievideo's
  tonen en gemiste geplande innames markeren zonder ooit een dosering te berekenen.
- **M1.6 herinneringen & lokale notificaties:** centrale herinneringenopslag,
  afspraak- en medicatieherinneringen vanuit afspraken/DoseLogs, eenmalige/
  dagelijkse/wekelijkse herhalingslogica, herinneringenscherm met permissiestatus en
  lokale service-worker-notificaties met generieke meldingstekst.
- **M1.7 vragen voor de arts:** vragen toevoegen/bewerken/verwijderen, koppelen aan
  afspraken, als beantwoord markeren met antwoordtekst en openstaande vragen voor de
  eerstvolgende afspraak tonen.
- **G071 vraagprioriteit:** vragen kunnen een consultprioriteit krijgen en vanuit de
  vragenlijst omhoog of omlaag worden gezet, zodat de bespreekvolgorde lokaal
  bewaard blijft.
- **G072 vraagverslag per afspraak:** beantwoorde, aan een afspraak gekoppelde vragen
  worden in het vragenscherm per afspraak terugleesbaar met antwoordtekst.
- **M1.8 basis-kennisbank:** KennisItems lokaal seedden uit `docs/KENNISBANK.md`,
  tonen per categorie, bronvermelding, AI-label, artsverificatielabel en expliciet
  markeren als geverifieerd met arts.
- **G081 kennisbank zoeken/filteren:** kennisscherm kan lokale kennisitems filteren
  op zoekterm en categorie zonder netwerkverkeer.
- **G082 eigen kennisitems:** kennisscherm kan handmatige kennisitems met titel,
  inhoud, bron en categorie toevoegen en bestaande eigen items bewerken.
- **G105 symptoomlog toevoegen:** welzijnscherm kan symptoomlogs met datum, eigenaar,
  symptoom, intensiteit en notitie versleuteld lokaal bewaren en terug tonen.
- **G106 symptomen per dag/over tijd:** welzijnscherm groepeert symptoomlogs per
  datum en toont per dag het aantal logs en de gemiddelde intensiteit.
- **G108 mentale check-in:** welzijnscherm kan stemming en privé notitie als
  versleutelde check-in bewaren en teruglezen.
- **G109 oordeelvrij welzijnsoverzicht:** welzijnscherm toont feitelijke aantallen,
  dagen en stemmingsverdeling zonder score, normering of oordeel.
- **G110 owner-markering:** welzijnslogs tonen expliciete eigenaarlabels voor Peter,
  partner of samen.
- **M1.9 UX/PWA-baseline:** installatiemanifest en SVG-icon, offline service-worker
  met cacheversie, standaard service-workerregistratie, concreter startscherm,
  skiplink/focusstijl, lege-staten en bevestigingsteksten voor verwijderen.
- **M1.10 tests & kwaliteit:** Biome lint/format-check toegevoegd, CI draait nu
  lint/format naast typecheck, tests, audit en build; groene CI blijft de merge-gate.
- **G066 notificatieprivacy:** OS-notificaties tonen standaard generieke tekst; details
  op het vergrendelscherm kunnen alleen na expliciete lokale keuze worden getoond, en
  die keuze wordt versleuteld opgeslagen.
- **G133 datamodel-sync:** `src/domain/types.ts` bevat nu interfaces voor alle
  entiteiten uit `DATAMODEL.md`, inclusief later-modules, met een sync-test op
  entiteiten en kernvelden.
- **G173 dependency-security update:** range-compatible npm-updates toegepast
  (`vite` naar 8.1.0 via lockfile) en audit blijft schoon; TypeScript 6 is als
  major buiten de huidige range bewust niet meegenomen.
- **G167/G168/G170/G174 onderhoudschecks:** tests borgen nu dat
  `CURRENT_STATE.md`/`CHANGELOG.md` de onderhoudsdoelen noemen, de backlogtelling
  overeenkomt met de doelstatussen en de disclaimer-grens consistent blijft in app en
  kerndocumenten.
- **G169 ADR-dekking:** ADR-0008 legt de aangescherpte CI/lintgate en
  notificatieprivacy-keuze vast.
- **G171 kennisbankverificatie:** kennisitems bewaren verificatiedatum en volgende
  reviewdatum; markeren als geverifieerd plant automatisch jaarlijkse herverificatie.
- **G158 snelle invoer:** startscherm bevat een compacte invoerroute voor afspraak,
  medicatie of vraag met alleen een korte tekst als verplicht veld; records worden via
  de bestaande versleutelde stores opgeslagen met veilige defaults.
- **G095/G096/G100/G125 AI opt-in fundament:** AI staat standaard uit, een domeinguard
  blokkeert toekomstige AI-verzoeken zonder expliciete opt-in en expliciete actie, en
  provider/model/API-sleutel worden via het versleutelde lokale settingsrecord bewaard.
- **G097/G098/G099 veilige AI-samenvattinglaag:** toekomstige AI-payloads worden
  geminimaliseerd en gede-identificeerd, AI-samenvattingen worden als conceptkennis
  met waarschuwing en bron gelabeld, en policy-tests blokkeren dosering, diagnose en
  behandelkeuze-achtige output.
- **G101/G103 AI-preview en samenvatting opslaan:** het kennisscherm toont lokaal de
  exacte gede-identificeerde payload-preview voordat iets naar AI zou gaan, en kan een
  AI-samenvatting als `ai_gegenereerd=true` KennisItem bewaren via de versleutelde
  kennisstore.
- **G102 AI-provider/modelkeuze:** het kennisscherm bevat lokale AI-instellingen voor
  opt-in, provider, model en API-sleutel; deze keuze wordt versleuteld in het
  settingsrecord bewaard zonder externe call.
- **G094 researchbibliotheek:** het kennisscherm kan handmatige researchitems met
  titel, bron/link en notitie als versleuteld conceptkennisitem in de categorie
  research bewaren.
- **G085/G086/G087 kostenbasis:** kostenscherm kan kostenposten toevoegen, bewerken en
  verwijderen met categorie en vergoedstatus; records worden versleuteld lokaal
  opgeslagen.
- **G088 kostenoverzicht:** kostenscherm telt lokaal ingevoerde bedragen op naar
  totaal, vergoed gemarkeerd, mogelijke eigen bijdrage en onbekende posten.
- **G089/G092/G093 eigen-risicoteller:** kostenscherm toont een 2026-teller voor het
  verplichte eigen risico van 385 euro, verwijst expliciet naar eigen polis/
  verzekeraar en labelt het overzicht als geen financieel advies.
- **G090 vergoede-pogingen-teller:** trajectscherm telt handmatig gemarkeerde pogingen
  die na geslaagde punctie meetellen voor vergoeding en toont resterend van 3.
- **G084 kostenjaar-markering:** kostenkennisitems tonen automatisch het gevonden
  jaartal, zodat vergoedingsteksten zichtbaar tijdgebonden blijven.
- **G172 vergoedingscijfers:** NL 2026-vergoedingsteksten zijn op 2026-06-23
  herzien tegen Rijksoverheid, Zorginstituut Nederland en Zilveren Kruis; eigen
  polis en verzekeraar blijven leidend.
- **G139/G140/G141 back-up export/import:** back-upscherm downloadt een
  `.kiempad-export` met versleutelde records en kluismetadata, import zet die blobs
  terug en controleert vooraf de SHA-256-integriteitschecksum.
- **G142 periodieke back-upaanmoediging:** het back-upscherm toont lokaal of er nog
  geen back-updatum bekend is, of een back-up oud wordt, en bewaart de laatste
  succesvolle exportdatum versleuteld in settings.
- **G153 schermlezer-vriendelijke labels:** herhaalde acties voor verwijderen,
  herordenen, innames markeren, herinneringen plannen, fase wijzigen en kennis
  verifiëren hebben contextuele toegankelijke namen naast de zichtbare knoptekst.
- **G154 donkere modus:** topbar bevat een lokale themakeuze; de voorkeur wordt
  versleuteld in settings bewaard en activeert een donker CSS-palet.
- **G137 opslag-schemaversie:** kluismetadata bevat een `schema` record met de
  huidige schemaversie; ontbrekende schemametadata wordt bij ontgrendelen aangevuld
  en nieuwere schema's worden geweigerd.
- **G175 historische onderzoeken:** Dossier-scherm uploadt meerdere
  onderzoeksbestanden, bewaart inhoud en notitie als versleuteld lokaal
  `DossierDocument` en toont lokale, niet-medische analyse van bestandsnaam, type en
  grootte.
- **G176 beeldmateriaal:** Dossier-scherm accepteert foto's, echo's en andere
  image-bestanden als `beeld`-dossierbijlage en toont na ontgrendeling een lokale
  preview vanuit de versleutelde dossierpayload.
- **G177 gespreksverslagen:** Dossier-scherm kan gespreksverslagen uploaden en als
  versleuteld `DossierDocument` koppelen aan een bestaande afspraak en/of poging.
- **G178 embryokwaliteit:** Dossier-scherm kan embryokwaliteit als lokale
  kliniekterugkoppeling vastleggen per embryo en koppelen aan poging of
  terugplaatsing, zonder kansberekening.
- **G126 lokaal gebeurtenissenlog:** Logboek-scherm toont kluis- en back-up
  gebeurtenissen uit versleutelde lokale EventLog-records; dit logboek blijft op het
  toestel en is niet gekoppeld aan export of externe diensten.
- **G026/G027 meerdere pogingen:** trajectscherm kan naast het bewerken van de eerste
  poging expliciet een nieuwe poging toevoegen en toont alle pogingen met
  pogingnummer voor vergoedingstelling.
- **G029 trajectarchief:** trajecten kunnen uit de actieve lijst worden gearchiveerd
  en later hersteld zonder traject- of faserecords te verwijderen.
- **G030 trajecttrends:** trajectscherm toont een lokaal overzicht over meerdere
  pogingen met totalen, actief/archief, status/type-verdeling en periode.
- **G035 agenda week-/maandweergave:** agendascherm toont naast de chronologische
  afsprakenlijst compacte groeperingen per ISO-week en maand.
- **G041 ICS-export:** agendascherm kan alle lokale afspraken als `.ics`-bestand
  downloaden voor eigen agenda-import; generatie gebeurt in de browser.
- **G042 ICS-import:** agendascherm kan een lokaal `.ics`-bestand van de kliniek
  lezen, basisvelden omzetten naar afspraken en die via de bestaande versleutelde
  agenda-opslag bewaren; import gebeurt volledig in de browser.
- **G040 afgelopen afspraken:** agendascherm splitst afgelopen afspraken naar een
  aparte "Afgelopen"-sectie, labelt ze als "Geweest" en toont bestaande notities als
  terugblik.
- **G052/G053 DoseLog-notities en historie:** innames/injecties kunnen bij afvinken een
  optionele notitie bewaren en medicatie toont een historie van geplande, genomen en
  overgeslagen DoseLogs per middel.
- **G054 medicatievoorraad:** medicatie kan een optionele resterende dosisteller
  bewaren; de teller verlaagt lokaal wanneer een DoseLog nieuw als genomen wordt
  gemarkeerd en gaat niet onder nul.
- **G055 medicatieschema-import:** medicatiescherm kan een handmatig gestructureerd
  klinieklijstje importeren met regels `Medicatie | YYYY-MM-DD | HH:MM`; Kiempad maakt
  alleen expliciete DoseLogs en leidt geen dosering af.
- **G056 lokale injectie-instructie:** medicatie kan instructietekst en een lokale
  videobijlage bewaren; de video wordt vanuit de versleutelde lokale payload getoond
  zonder externe embed, script of tracking.
- **G060 eigen losse herinneringen:** herinneringenscherm kan eigen herinneringen met
  titel, tijdstip en herhaling versleuteld bewaren naast medicatie- en
  afspraakherinneringen.
- **G062 standaard-waarschuwtijd:** herinneringenscherm bewaart een versleutelde
  standaard afspraakwaarschuwing in minuten en nieuwe afspraakformulieren vullen de
  herinneringstijd daarmee vooraf in.
- **G063 snooze/opnieuw plannen:** komende herinneringen kunnen direct worden gesnoozed
  of naar een nieuw tijdstip verplaatst; de wijziging wordt versleuteld lokaal
  opgeslagen.
- **G065 in-app fallbackmeldingen:** als browsernotificaties niet klaar staan toont het
  herinneringenscherm komende meldingen in de app, met dezelfde privacyregels als
  OS-notificaties.

## 2. Gedeeltelijk Gebouwd

- Traject/fasen, agenda, medicatie, herinneringen, vragen, kennisbank en
  beslisnotities zijn aangesloten op de versleutelde repository-laag.
- G112 beslisnotities: het afwegingenscherm bewaart onderwerp, datum en opties als
  lokale versleutelde beslisnotitie.
- G113 voors/tegens: beslisnotities kunnen per optie argumenten voor en tegen lokaal
  versleuteld bewaren en terug tonen.
- G114 keuzevastlegging: beslisnotities kunnen een gemaakte keuze met datum en
  onderbouwing lokaal versleuteld bewaren en terug tonen.
- G115 beslisverslag: afwegingen zijn terugleesbaar als verslag met onderwerp, datum,
  opties, voors/tegens, keuze en onderbouwing.
- G116 vraagkoppeling: afwegingen kunnen optioneel aan een bestaande vraag voor de
  arts worden gekoppeld en tonen die vraag bij de beslisnotitie.
- G179 Tailscale-publicatie: optionele compose-stack en runbook voor een aparte
  Kiempad HTTPS-node zijn voorbereid, inclusief deploy- en smoke-scripts;
  daadwerkelijke tailnet-aanmelding/deploy staat nog open op issue #101.

## 3. Nog Niet Gebouwd

F1 (MVP) is afgevinkt. Resterende open doelen zitten in F2 en later, o.a.:

- Kosten, research + AI-providercall, gedeelde modus.
- Tailscale-publicatie via aparte HTTPS-node, plus sync, PDF, ICS en trends.

Zie [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) en [`ROADMAP.md`](ROADMAP.md).

## 4. Technische Schuld

- Geen bekende technische schuld in de app-shell; F2-modules volgen na de afgeronde
  F1-basis.
- `npm install` is nog niet als CI-cache vastgelegd; `package-lock.json` ontstaat bij
  de eerste install.

## 5. Runtime-status

- **Client-side runtime aanwezig.** Lokaal te starten met `npm run dev`; de app-shell
  toont eerst een passphrase-kluis en navigeert na ontgrendelen via hash-routes.
  Het trajectscherm kan meerdere pogingen met pogingnummer en fasen lokaal versleuteld
  beheren; het startscherm biedt snelle invoer voor afspraak, medicatie en vraag; de
  topbar bewaart een lokale lichte/donkere thema-voorkeur; het
  agendascherm kan afspraken met voorbereiding, vraag en herinnering bewaren en toont
  week-/maandgroeperingen plus afgelopen afspraken met terugblik; het
  medicatiescherm kan middelen, geplande DoseLogs, notities per inname,
  innameshistorie en gestructureerde schema-import versleuteld beheren; het
  herinneringenscherm toont komende lokale herinneringen, eigen losse herinneringen,
  snooze/opnieuw plannen, standaard-waarschuwtijd en notificatiepermissie; het
  vragenscherm kan consultvragen en antwoorden versleuteld beheren; het kennisscherm
  seedt en toont conceptkennis lokaal met bron- en verificatielabels, kan handmatige
  researchitems opslaan en biedt lokale AI-opt-ininstellingen, provider/modelkeuze,
  payload-preview en AI-samenvatting-opslag en markeert kostenkennis met jaartal; het kostenscherm bewaart kostenposten met
  categorie/vergoedstatus, toont een lokaal kostenoverzicht en bewaakt de
  eigen-risicostand voor 2026; het trajectscherm toont de vergoede-pogingen-teller.
  Het back-upscherm
  kan versleutelde exportbestanden downloaden en checksum-gecontroleerd importeren.
  De app heeft een PWA-manifest en service worker voor offline gebruik na de eerste load.
- Geen externe diensten actief; geen data verzonden.
- **Validatie:** lokaal geverifieerd groen — `npm run typecheck`, `npm run lint`,
  `npm run test` (96 passing), `npm run build` en `npm audit --audit-level=high`.
- **CI:** de workflow (`.github/workflows/ci.yml`) draait nu — de repo is **publiek**
  gemaakt (ADR-0006), waardoor de Actions-billingblokkade voor private repos vervalt.
  Code/docs zijn publiek; de **gezondheidsdata blijft local-first en privé** (staat
  niet in de repo).

## 6. Hoogste Prioriteiten

1. **AI-samenvatting** pas verder bouwen met een expliciete provider-aanroep achter
   de bestaande opt-in, preview en safety helpers.
2. **Publicatie via Tailscale** op een aparte HTTPS-node uitwerken, vergelijkbaar met
   Shred en Healthcore.

## 7. Permanente onderhoudsregel

Werk dit document bij in **dezelfde wijziging** waarin functionaliteit verandert. Een
feature is pas "af" als `CURRENT_STATE.md`, de betreffende doelen in
`PRODUCT_BACKLOG.md` en (bij keuzes) een ADR kloppen. Documentatie loopt nooit achter
op de code.
