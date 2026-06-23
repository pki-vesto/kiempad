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
- **G107 CycleData vastleggen:** welzijnscherm kan cyclusmetingen zoals temperatuur
  of bloeding als feitelijke lokale registratie bewaren en tonen, zonder interpretatie
  of medisch advies.
- **G108 mentale check-in:** welzijnscherm kan stemming en privé notitie als
  versleutelde check-in bewaren en teruglezen.
- **G109 oordeelvrij welzijnsoverzicht:** welzijnscherm toont feitelijke aantallen,
  dagen en stemmingsverdeling zonder score, normering of oordeel.
- **G110 owner-markering:** welzijnslogs tonen expliciete eigenaarlabels voor Peter,
  partner of samen.
- **G111 welzijnstrends:** welzijnscherm toont feitelijke maandtrends voor
  symptoomlogs, gemiddelde intensiteit en mentale check-ins zonder score of oordeel.
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
- **G104 on-device AI-verkenning:** het kennisscherm detecteert passief lokale
  browser-AI API-objecten zoals `LanguageModel` en `Summarizer`, zonder sessie,
  modeldownload, provider-call of cloud-stap. Zie [`docs/ON_DEVICE_AI.md`](docs/ON_DEVICE_AI.md).
- **G121 WebAuthn/biometrie:** back-upscherm kan WebAuthn PRF lokaal koppelen als
  ontgrendelgemak; de vergrendelde kluis kan daarna met dezelfde credential en
  PRF-output openen via een lokale keywrap. De passphrase blijft fallback en
  herstelroute. Zie [`docs/WEBAUTHN_UNLOCK.md`](docs/WEBAUTHN_UNLOCK.md).
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
- **G143/G144/G145 E2E-syncpakket:** back-upscherm kan een `.kiempad-sync`-pakket
  met uitsluitend encrypted records downloaden en importeren op een gekoppelde kluis;
  conflicten worden deterministisch last-wins op `updatedAt` afgehandeld.
- **G146 consult-PDF:** vragenscherm kan een lokaal printbaar consultoverzicht openen
  met afspraken, vragen en medicatie; de browser kan dit zonder externe dienst als PDF
  opslaan.
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
- **G196 PFIP consultverslagen:** Dossier-scherm heeft naast algemene
  dossierdocumenten een apart `ConsultVerslag`-recordtype met eigen formulier,
  versleutelde opslag en consultlijst voor tekst of uploads.
- **G197 PFIP consultsamenvatting:** Consultverslagen krijgen automatisch een
  lokale conceptsamenvatting uit ingevoerde tekst/notitie, inclusief bronnen en
  waarschuwing om te controleren met het originele consult.
- **G198 PFIP consultactiepunten:** Consultverslagen extraheren lokale
  conceptactiepunten uit tekst/notitie en labelen die als taak of vraag met
  bronregel, zodat de gebruiker ze kan controleren.
- **G199 PFIP vragenlijst volgende afspraak:** Vragenscherm genereert lokaal een
  conceptvragenlijst voor de eerstvolgende afspraak uit open vragen en
  consultactiepunten, met bronlabels en controlewaarschuwing.
- **G200 PFIP behandelgeschiedenis:** Dossier-scherm reconstrueert lokaal een
  chronologische behandelgeschiedenis uit afspraken, consultverslagen en
  dossierdocumenten met bronlabels en koppelingen.
- **G201 PFIP consultinzichten:** Consultverslagen tonen lokale koppelingen naar
  trajectfase, medicatie, embryo en onderzoek wanneer datumcontext of consulttekst
  die relatie feitelijk ondersteunt.
- **G202 PFIP consultsamenvatting-correctie:** Consultverslagen kunnen een lokale
  gebruikerscorrectie op de conceptsamenvatting bewaren en tonen een tekstuele
  verschilweergave met toegevoegde en verwijderde zinnen.
- **G203 PFIP consult-AI safety-policy:** Consultsamenvattingen en
  consultactiepunten filteren lokale AI-output tegen diagnose, doseringsadvies en
  behandelkeuze terwijl de originele consulttekst bewaard kan blijven.
- **G204 PFIP embryo-dossier:** Dossier-scherm toont per embryo binnen een poging
  een feitelijk embryo-dossier met kwaliteit, status en gekoppelde
  dossierdocumenten, zonder kansberekening.
- **G205 PFIP embryo-uploadkoppeling:** Beelduploads kunnen embryo-id, embryodag en
  laboratoriumcontext vastleggen naast poging/afspraak, zodat de imaging-tijdlijn en
  embryo-dossiers feitelijk aan labcontext gekoppeld zijn.
- **G206 PFIP embryokwaliteit per meetmoment:** Embryokwaliteit kan per meetmoment
  worden vastgelegd met kliniekterminologie en bron; dossierdocumenten en
  embryo-dossiers tonen deze feitelijke labcontext zonder kansberekening.
- **G207 PFIP embryo-historie:** Embryo-dossiers tonen een chronologische historie
  met bevruchting, kwaliteitsmeetmomenten, beeldmomenten en eindstatussen zoals
  terugplaatsing, invriezen of stop/niet gebruikt.
- **G208 PFIP embryovergelijking:** Dossier-scherm toont per poging een feitelijke
  vergelijking van meerdere embryo's met dagen, kwaliteiten, status, meetmomenten,
  bronnen en historiemomenten, zonder rangschikking of kansberekening.
- **G209 PFIP embryo-tijdlijnintegratie:** Embryo-historie neemt gekoppelde
  afspraken, labrapporten en terugplaatsingsafspraken op in dezelfde chronologische
  embryo-tijdlijn.
- **G210 PFIP embryo-behandelcontext:** Embryo-dossiers tonen de bijbehorende
  poging, protocolfasen en relevante notities uit traject, afspraken en
  dossierdocumenten als feitelijke behandelcontext.
- **G211 PFIP embryokwaliteit-waarschuwing:** Embryokwaliteit toont consequent dat
  Kiempad geen uitkomst voorspelt, embryo's niet rangschikt, geen kansen berekent
  en geen medisch advies geeft.
- **G212 PFIP researchbronnen-cache:** Kennisscherm toont een researchbronnenlijst
  uit handmatige seedbronnen en lokaal opgeslagen researchitems; er wordt niets
  opgehaald zonder expliciete netwerk-opt-in.
- **G213 PFIP researchaggregatie-opt-in:** Researchaggregatie heeft een
  versleutelde netwerk-opt-in in de settings, staat standaard uit en toont pas na
  toestemming welke bronnen klaarstaan voor handmatige aggregatie zonder
  automatische netwerkrequests.
- **G214 PFIP wetenschappelijke researchsamenvatting:** Handmatige
  researchpublicaties kunnen een wetenschappelijke samenvatting met bron en
  publicatiedatum bewaren; het kennisscherm toont deze per publicatie zonder
  netwerkactie of behandeladvies.
- **G215 PFIP eenvoudige researchsamenvatting:** Researchpublicaties kunnen ook
  een eenvoudige Nederlandse samenvatting bewaren en tonen met bron en
  publicatiedatum, expliciet zonder diagnose of behandeladvies.
- **G216 PFIP researchrelevantie zonder behandeladvies:** Researchpublicaties
  kunnen een handmatige relevantienotitie bewaren die bij weergave wordt gekoppeld
  aan lokale dossiercontextbronnen, met waarschuwing tegen diagnose, dosering en
  behandelkeuze.
- **G217 PFIP researchtrends:** Het kennisscherm groepeert opgeslagen
  researchitems lokaal op trefwoorden naar IVF, ICSI, embryo, leefstijl,
  mannelijke factor en overig, met waarschuwing dat dit geen bewijsweging of
  behandeladvies is.
- **G218 PFIP researchkaart-bronmetadata:** Iedere researchkaart toont
  bronverificatie, publicatiedatum en researchbron, inclusief expliciete labels
  voor ontbrekende bron of onbekende publicatiedatum.
- **G219 PFIP research-herverificatie:** Researchkaarten tonen of periodieke
  herverificatie ongepland, actueel of verlopen is; handmatige verificatie plant
  jaarlijks een nieuwe reviewdatum.
- **G220 PFIP dagelijkse aanbevelingen-overzicht:** Het startscherm toont een
  lokaal dagoverzicht met gescheiden aanbevelingen voor vrouw, man en samen,
  gebaseerd op agenda, medicatieplanning en vragen, zonder diagnose,
  behandelkeuze of medisch advies.
- **G221 PFIP leefstijlcontext:** Dagelijkse aanbevelingen kunnen lokale
  leefstijlcontext tonen op basis van dossierdocumenten, cyclusfase en
  behandelgeschiedenis, zonder voorschrift of medisch advies.
- **G222 PFIP voeding/supplement-checklist:** Het dagoverzicht toont
  voeding- en supplementnotities als checklist met bron en disclaimer, zonder
  voedings- of supplementadvies.
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
- **G179 Tailscale-publicatie:** Kiempad draait live op de aparte Tailscale-node
  `kiempad` via Tailscale Serve HTTPS op `https://kiempad.tail9d0c71.ts.net`.
  De lokale fallbackpoort op de host is `127.0.0.1:8098`; de containerstack blijft
  stateless en bewaart geen gezondheidsdata.
- **G180 PFIP dossier-uploadprofielen:** dossieruploads ondersteunen expliciete
  profielen voor onderzoeken, labuitslagen, fertiliteitsrapporten,
  ziekenhuisdocumenten, behandelverslagen, PDF's en afbeeldingen. Als de gebruiker
  automatisch herkennen kiest, leidt Kiempad het profiel lokaal af uit bestandsnaam,
  categorie of bestandstype en toont het profiel in de analyse.
- **G181 PFIP lokale OCR-pipeline:** dossieruploads hebben een expliciete
  opt-in voor lokale OCR-verwerking. Tekstbestanden worden direct in de browser
  uitgelezen; PDF's en afbeeldingen krijgen een versleutelde OCR-wachtstatus voor
  lokale verwerking zonder cloudstap, diagnose of behandeladvies.
- **G182 PFIP metadata-extractie:** nieuwe dossierdocumenten krijgen lokaal
  afgeleide metadata voor documentdatum, instelling, documenttype,
  trajectkoppeling, arts en bronbestand. De extractie gebruikt alleen bestandsnaam,
  formulierdata, notitie en eventuele lokale OCR-tekst; oudere records krijgen in
  de UI een veilige fallbackweergave.
- **G183 PFIP conceptcontrole:** zodra bestanden zijn geselecteerd toont Kiempad
  lokale conceptrecords met herkend uploadprofiel, bestandstype en grootte. Opslag
  vereist expliciete bevestiging dat datum, categorie, uploadprofiel en koppelingen
  zijn gecontroleerd of gecorrigeerd.
- **G184 PFIP documenttijdlijn:** het dossierscherm bouwt automatisch een
  documenttijdlijn uit herkende metadata en gebruiker-correcties. De tijdlijn
  sorteert op de beste bekende documentdatum en toont of die uit metadata of uit
  de formulierdatum komt.
- **G185 PFIP dossierindex:** het dossierscherm toont een lokale index met
  documentdatum, documenttype, bronbestand, trajectkoppeling en tags uit categorie,
  uploadprofiel, bestandstype, OCR-status, instelling en arts.
- **G186 PFIP lokale dossierzoekfunctie:** het dossierscherm kan lokaal zoeken in
  OCR-tekst, handmatige notities, metadata, bestandsnamen en tags van de
  ontgrendelde kluis. Zoekresultaten tonen welke velden matchen en starten geen
  opslag- of netwerkstap.
- **G187 PFIP privacytest OCR/extractie:** tests bewaken dat OCR- en
  metadata-extractie zonder OCR-opt-in geen `fetch`, `XMLHttpRequest` of
  `sendBeacon` gebruikt. De invariant dekt documentaanmaak, metadata-extractie,
  OCR-resultaatvorming en lokale dossierzoekfunctie.
- **G188 PFIP imaging-repository:** het dossierscherm toont een aparte lokale
  imaging-repository voor echo's, foto's, scans en embryo-afbeeldingen. Beelden
  blijven dossierrecords in de versleutelde kluis en krijgen pas na ontgrendeling
  een lokale preview.
- **G189 PFIP beeldclassificatie:** beeldmateriaal wordt lokaal geclassificeerd
  naar echo, foto, scan, embryo-afbeelding of overig beeld op basis van titel,
  bestandsnaam, documenttype en notitie. De classificatie is informatief en geeft
  geen medische interpretatie.
- **G190 PFIP beeldmetadata:** beelduploads kunnen beelddatum,
  lichaams-/trajectcontext, bron, gekoppelde afspraak en traject als lokale
  beeldmetadata bewaren. De imaging-repository toont deze metadata zonder extra
  netwerk- of opslagstap buiten de versleutelde kluis.
- **G191 PFIP imaging-tijdlijnkoppeling:** beeldrecords kunnen aan poging,
  afspraak, cyclusdag en embryo gekoppeld worden. De imaging-repository toont de
  koppeling als tijdlijncontext zonder medische interpretatie.
- **G192 PFIP beeldvergelijking:** bij minimaal twee beeldmomenten toont de
  imaging-repository een feitelijke vergelijking op datum, beeldsoort en context.
  De vergelijking bevat expliciet geen medische beeldinterpretatie.
- **G193 PFIP beeldcontextnotitie:** imaging-items tonen een tekstuele
  contextnotitie op basis van vastgelegde metadata en koppelingen, met expliciete
  waarschuwing dat Kiempad het beeld niet medisch analyseert en geen medisch advies
  geeft.
- **G194 PFIP thumbnail- en previewstates:** imaging-items tonen of een beeld
  vergrendeld is, een thumbnail heeft, volledige preview heeft of geen preview kan
  tonen. Kleine ontgrendelde beelden krijgen een lokale thumbnail uit de kluis.
- **G195 PFIP imaging-filters:** de imaging-repository kan lokaal filteren op
  beeldtype, datumrange, traject, afspraak en embryo, zonder netwerkstap of
  medische interpretatie.

## 3. Nog Niet Gebouwd

F1 (MVP) en de oorspronkelijke 179 doelen zijn afgevinkt. De nieuwe hoge-prioriteit
epic [`docs/PERSONAL_FERTILITY_INTELLIGENCE_PLATFORM.md`](docs/PERSONAL_FERTILITY_INTELLIGENCE_PLATFORM.md)
heeft na G222 nog 21 open doelen (G223-G243), gericht op dossier-ingest,
imaging, consult intelligence, embryo tracking, research intelligence, dagelijkse
aanbevelingen, een fertility knowledge graph en een volledige fertility timeline.

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
  passieve on-device AI-status, payload-preview en AI-samenvatting-opslag en markeert
  kostenkennis met jaartal; het kostenscherm bewaart kostenposten met
  categorie/vergoedstatus, toont een lokaal kostenoverzicht en bewaakt de
  eigen-risicostand voor 2026; het trajectscherm toont de vergoede-pogingen-teller.
  Het back-upscherm kan versleutelde exportbestanden downloaden,
  checksum-gecontroleerd importeren, syncpakketten verwerken en optioneel
  WebAuthn/biometrie als PRF-keywrap koppelen. De app is gepubliceerd via een aparte
  Tailscale HTTPS-node (`https://kiempad.tail9d0c71.ts.net`) met lokale fallback op
  `127.0.0.1:8098`.
  De app heeft een PWA-manifest en service worker voor offline gebruik na de eerste load.
- Tailscale Serve publiceert alleen de statische PWA binnen de tailnet; er draait geen
  Kiempad-backend en er wordt geen gezondheidsdata naar de server verzonden.
- **Validatie:** lokaal geverifieerd groen — `npm run typecheck`, `npm run lint`,
  `npm run test`, `npm run build` en `npm audit --audit-level=high`.
- **CI:** de workflow (`.github/workflows/ci.yml`) draait nu — de repo is **publiek**
  gemaakt (ADR-0006), waardoor de Actions-billingblokkade voor private repos vervalt.
  Code/docs zijn publiek; de **gezondheidsdata blijft local-first en privé** (staat
  niet in de repo).

## 6. Hoogste Prioriteiten

1. PFIP uitvoeren vanaf G223: behandelvoorbereiding genereren uit afspraken,
   medicatie en open actiepunten.
2. Tailscale-publicatie periodiek smoken met
   `KIEMPAD_TAILSCALE_LOCAL_PORT=8098 KIEMPAD_TAILNET_URL=https://kiempad.tail9d0c71.ts.net npm run smoke:tailscale`.

## 7. Permanente onderhoudsregel

Werk dit document bij in **dezelfde wijziging** waarin functionaliteit verandert. Een
feature is pas "af" als `CURRENT_STATE.md`, de betreffende doelen in
`PRODUCT_BACKLOG.md` en (bij keuzes) een ADR kloppen. Documentatie loopt nooit achter
op de code.
