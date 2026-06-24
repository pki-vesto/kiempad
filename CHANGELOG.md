# Changelog

Alle noemenswaardige wijzigingen aan Kiempad. Vorm volgt
[Keep a Changelog](https://keepachangelog.com/nl/1.0.0/); versies volgen
[SemVer](https://semver.org/lang/nl/).

## [Unreleased]

### Added
- G361 Security & DevEx: dependency-review evidence snapshot-template legt datum,
  commands, lockfile-diff, testgate en privacygate vast zonder secrets of package
  metadata dumps.
- G360 Reliability & Operations: vergrendelde kluis toont een niet-gevoelige
  hersteldiagnose voor kluisaanwezigheid, WebAuthn-runtime/koppeling en
  back-upherinneringsstatus zonder recordinhoud.
- G354 Security & DevEx: secrets-scan baseline documenteert pattern ownership en
  allowlistbeleid; tests dekken toegestane placeholders en verboden AI-/Tailscale-key
  vormen.
- G353 Security & DevEx: CSP violation workflow documenteert lokale diagnose zonder
  remote report-endpoints, met dev/prod-previewstappen en tests tegen `report-uri` en
  `report-to`.
- G348 Security & DevEx: externe-asset allowlist-governance met rationale per
  toegestane URL, documentatie voor uitzonderingen en tests die ontbrekende rationale
  afwijzen.
- G339 Security & DevEx: public-repo privacy reviewchecklist voor release-PR's,
  fixtures, screenshots, env-bestanden en generated assets, verankerd in contributing,
  PR-template en onderhoudstest.
- G337 Security & DevEx: eventlogdetails voor back-up, AI, notificaties en import
  worden getest op generieke inhoud zodat gevoelige vrije tekst niet in operationele
  metadata terechtkomt.
- G327 Security & DevEx: synthetische-only fixture policy met
  `npm run fixtures:check` voorkomt echte naam-, e-mail- en BSN-achtige testdata.
- G325 Security & DevEx: `npm run deps:review` en dependency-reviewdocs leggen de
  maandelijkse updateflow vast met outdated, audit, lockfile-diff en testgate.
- G301 Reliability & Operations: vergrendelde kluis toont kalme herstelhulp voor
  passphrase, WebAuthn en versleutelde back-up met links naar runbook en WebAuthn-docs.
- G267 Onboarding & Daily Use: vragenscherm heeft een lokale Consult Prep Wizard met
  bewerkbare vragen, Markdown prep-packet en links naar timeline/graph-context.
- G265 Onboarding & Daily Use: startscherm heeft een dagelijks command center dat
  afspraken, medicatie, vragen, herinneringen en context groepeert op urgentie.
- G320 AI & Research: promptregressiesuite met fixtures voor consult, research,
  image-context en dagelijkse aanbevelingen bewaakt promptdrift en verboden output.
- G313 AI & Research: AI payload-preview toont welke persoonlijke velden lokaal
  zijn verwijderd, inclusief aantallen en vervanglabels zonder originele waarden.
- G305 AI & Research: centrale AI prompt registry met doel, versie, inputcontract,
  veiligheidslabels, verboden output en policytests voor diagnose/dosering/behandelkeuze.
- G326 Security & DevEx: `npm run secrets:check` scant docs/source op gangbare
  credentialpatronen met een minimale expliciete allowlist en draait in CI.
- G324 Security & DevEx: `index.html` bevat een local-first Content Security Policy
  die remote scripts blokkeert en alleen lokale data/blob media en lokale dev-websocket
  verbindingen toestaat.
- G286 Reliability & Operations: `npm run drill:backup` voert een memory-driver
  restore drill uit die exporteert, importeert, opnieuw ontgrendelt en representatieve
  encrypted records verifieert.
- G285 Reliability & Operations: `npm run smoke:offline` start Vite preview, laat de
  service worker installeren en verifieert met Playwright dat de app-shell offline
  herlaadt.
- G264 Onboarding & Daily Use: eerste-run setupkaart verschijnt alleen vóór de eerste
  gebruikersdata, is lokaal skippable/af te ronden en gidst naar kluis, privacy,
  traject, afspraak en back-up.
- G250 Continuous Evolution: completion-audit checklist documenteert bewijs per
  requirement en is gekoppeld aan DoD, contributing, PR-template en onderhoudstest.
- G347 Security & DevEx: CI draait `npm run assets:check` na de productiebuild en
  documenteert de lokale asset-scan in README, contributing en runbook.
- G342 Security & DevEx: lokale externe-asset-scan met `npm run assets:check`
  controleert bron- en buildassets op remote image/font/script/manifest-URL's.
- G246 Continuous Evolution: reproduceerbaar goal scoring model met rubric,
  scorevelden en `npm run goals:score`.
- G245 Continuous Evolution: lokaal backlog-health rapport vergelijkt backlog,
  execution catalogus en optionele issue-snapshot zonder netwerk.
- G244 Continuous Evolution: tweede-generatie execution goal catalogus met 100 actieve doelen, 5 epics, F5-horizon en rijk doelenschema.
- G243 PFIP fertility timeline: timeline heeft een toegankelijk mobiel
  overzicht met ankers naar items, mijlpalen, context en export.
- G242 PFIP fertility timeline: timeline-opbouw, filtering en export blijven offline;
  back-upimport houdt timeline-records bruikbaar en import reset timelinefilters.
- G241 PFIP fertility timeline: trajectscherm toont een complete ongefilterde
  Markdown-export van de fertility timeline voor eigen consultvoorbereiding.
- G240 PFIP fertility timeline: trajectscherm toont belangrijke mijlpalen en
  ontbrekende contextsignalen neutraal, zonder automatische correctie of oordeel.
- G239 PFIP fertility timeline: ieder tijdlijnitem heeft een detailpaneel met bron,
  feitelijke context, record-ID en gekoppelde lokale records.
- G238 PFIP fertility timeline: trajectscherm heeft filters voor type, periode,
  traject, eigenaar en bron; runtime bewaart het filter lokaal in de sessie.
- G237 PFIP fertility timeline: tijdlijn normaliseert nu ook vragen,
  medicatierecords en medicatiemomenten naast afspraken, dossierdocumenten en
  embryo's.
- G236 PFIP fertility timeline: trajectscherm toont een centrale fertility
  timeline met onderzoeken, consulten, behandelingen, embryo's, aanbevelingen en
  research uit lokale records.
- G235 PFIP knowledge graph: trajectscherm toont een exporteerbare
  Markdown-samenvatting van de graph voor consultvoorbereiding met bronpad,
  controlehash en medische waarschuwing.
- G234 PFIP knowledge graph: privacytest borgt dat graph-opbouw, voorstellen,
  inzichten, filters en index-rebuild lokaal blijven zonder fetch, XHR of
  sendBeacon.
- G233 PFIP knowledge graph: trajectscherm toont een rebuildrapport voor de
  graph-index uit lokale kluisrecords met bronrecordtelling, controlehash en
  dataverliescontrole zonder opslagwrites.
- G232 PFIP knowledge graph: kennisscherm toont research-dossierrelaties als
  contextrelatie met bronpad en expliciete waarschuwing zonder causale of
  medische claims.
- G231 PFIP knowledge graph: trajectscherm toont een graphweergave per traject
  met filters voor relatietype en periode.
- G230 PFIP knowledge graph: contextuele graph-inzichten tonen bronpad,
  onzekerheidslabel en veilige waarschuwing zonder causale of medische claims.
- G229 PFIP knowledge graph: graph-relaties kunnen lokaal automatisch worden
  voorgesteld op basis van datum, type en titelmatch en daarna handmatig worden
  bevestigd.
- G228 PFIP knowledge graph: nieuw lokaal fertility knowledge graph-model met
  nodes en feitelijke relaties voor behandelingen, documenten, embryo's,
  gesprekken, research en aanbevelingen.
- G227 PFIP daily recommendations: aanbevelingskaarten kunnen lokaal worden
  bewaard, afgewezen of omgezet naar een eigen herinnering of open vraag.
- G226 PFIP daily recommendations: iedere dagelijkse aanbeveling toont gebruikte
  lokale bronnen, zoals dossierdocumenten, cyclusmetingen, afspraken, medicatie,
  vragen of consultverslagen.
- G225 PFIP daily recommendations: man-sectie toont een leefstijl- en
  voorbereidingskaart voor feitelijke observaties en consultvragen, zonder
  vruchtbaarheidsadvies, supplementadvies of behandelkeuze.
- G224 PFIP daily recommendations: dagoverzicht toont een cyclusdagcheck op basis
  van lokale trajectfase en cyclusmetingen, zonder diagnose, dosering,
  timingadvies of behandelkeuze.
- G223 PFIP daily recommendations: dagoverzicht genereert een lokale
  behandelvoorbereiding uit afspraken, medicatieplanning, open vragen en
  consultactiepunten, zonder diagnose, dosering of behandelkeuze.
- G222 PFIP daily recommendations: dagelijks overzicht toont voeding- en
  supplementnotities als checklist met bron en disclaimer, zonder voedings- of
  supplementadvies.
- G221 PFIP daily recommendations: leefstijlcontext in het dagoverzicht gebruikt
  lokale dossierdocumenten, cyclusfase en behandelgeschiedenis zonder voorschrift
  of medisch advies.
- G220 PFIP daily recommendations: startscherm toont een lokaal dagelijks
  aanbevelingsoverzicht met aparte blokken voor vrouw, man en samen, zonder
  diagnose, behandelkeuze of medisch advies.
- G219 PFIP research intelligence: researchkaarten tonen of herverificatie
  ongepland, actueel of verouderd is, met jaarlijkse herverificatieplanning na
  handmatige verificatie.
- G218 PFIP research intelligence: iedere researchkaart toont bronverificatie,
  publicatiedatum en researchbron, ook wanneer bron of datum nog ontbreekt.
- G217 PFIP research intelligence: opgeslagen researchitems worden lokaal
  gegroepeerd als trends per onderwerp, zoals IVF, ICSI, embryo, leefstijl en
  mannelijke factor, met waarschuwing dat dit geen bewijsweging is.
- G216 PFIP research intelligence: researchpublicaties kunnen een handmatige
  relevantienotitie voor de gebruiker bewaren en tonen, gekoppeld aan lokale
  dossiercontextbronnen en zonder diagnose, dosering of behandelkeuze.
- G215 PFIP research intelligence: researchpublicaties kunnen naast de
  wetenschappelijke samenvatting ook een eenvoudige Nederlandse lekensamenvatting
  bewaren en tonen met bron en datum, zonder diagnose of behandeladvies.
- G214 PFIP research intelligence: handmatige researchpublicaties kunnen een
  wetenschappelijke samenvatting met bron en publicatiedatum bewaren en tonen,
  lokaal versleuteld en zonder netwerkactie.
- G213 PFIP research intelligence: researchaggregatie staat achter een
  versleutelde, expliciete netwerk-opt-in en blijft standaard uit zonder
  automatische netwerkrequests.
- G212 PFIP research intelligence: kennisscherm toont researchbronnen uit een
  handmatige seed en lokale cache van opgeslagen researchitems, zonder netwerkstap.
- G211 PFIP embryo tracking: embryokwaliteit gebruikt een expliciete gedeelde
  waarschuwing dat Kiempad geen uitkomst voorspelt, embryo's niet rangschikt,
  geen kansen berekent en geen medisch advies geeft.
- G210 PFIP embryo tracking: embryo-dossiers tonen behandelcontext met poging,
  protocolfasen en relevante notities uit afspraken en dossierdocumenten.
- G209 PFIP embryo tracking: embryo-historie is geïntegreerd met gekoppelde
  afspraken, labrapporten en terugplaatsingsafspraken in één feitelijke
  embryo-tijdlijn.
- G208 PFIP embryo tracking: embryo-dossiers tonen een feitelijke vergelijking
  van meerdere embryo's binnen dezelfde poging zonder rangschikking,
  kansberekening of medisch advies.
- G207 PFIP embryo tracking: embryo-dossiers tonen een chronologische
  embryo-historie met bevruchting, meetmomenten, beeldmomenten en eindstatussen
  zoals terugplaatsing, invriezen of stop/niet gebruikt.
- G206 PFIP embryo tracking: embryokwaliteit kan per meetmoment worden
  vastgelegd met kliniekterminologie en bron, zichtbaar in dossierdocument en
  embryo-dossier.
- G205 PFIP embryo tracking: embryo-uploads kunnen worden gekoppeld aan
  embryo-id, embryodag, poging en laboratoriumcontext en verschijnen zo in de
  imaging-tijdlijn en het embryo-dossier.
- G204 PFIP embryo tracking: dossierscherm toont een embryo-dossier per embryo
  binnen een poging met kwaliteit, status en gekoppelde documenten.
- G203 PFIP consult intelligence: consult-AI-output wordt expliciet gefilterd tegen
  diagnose, doseringsadvies en behandelkeuze.
- G202 PFIP consult intelligence: consultverslagen kunnen een gebruikerscorrectie
  op de conceptsamenvatting tonen met lokale verschilweergave.
- G201 PFIP consult intelligence: consultverslagen tonen lokale koppelingen naar
  trajectfase, medicatie, embryo en onderzoek wanneer die uit context herleidbaar zijn.
- G200 PFIP consult intelligence: dossierscherm reconstrueert een lokale
  behandelgeschiedenis uit afspraken, consultverslagen en dossierdocumenten.
- G199 PFIP consult intelligence: vragenscherm genereert lokaal een conceptvragenlijst
  voor de eerstvolgende afspraak uit open vragen en consultactiepunten.
- G198 PFIP consult intelligence: consultverslagen extraheren lokale
  conceptactiepunten als taak of vraag met bronregel, zonder netwerkverwerking.
- G197 PFIP consult intelligence: consultverslagen krijgen automatisch een lokale
  conceptsamenvatting met bronverwijzing en waarschuwing dat de gebruiker die moet
  controleren met het originele consult.
- G196 PFIP consult intelligence: consultverslagen hebben een eigen lokaal
  versleuteld recordtype met apart formulier en aparte lijst naast algemene
  dossierdocumenten.
- G195 PFIP imaging: imaging-repository kan lokaal filteren op beeldtype, datum,
  traject, afspraak en embryo.
- G194 PFIP imaging: imaging-items tonen previewstates voor vergrendeld,
  thumbnail, volledige preview en geen preview; kleine ontgrendelde beelden krijgen
  een lokale thumbnailweergave.
- G193 PFIP imaging: beeldcontext krijgt een tekstuele contextnotitie met
  expliciete waarschuwing dat Kiempad het beeld niet medisch analyseert.
- G192 PFIP imaging: het dossierscherm kan twee beeldmomenten feitelijk
  vergelijken op datum, soort en context met expliciete waarschuwing dat Kiempad
  geen medische beeldinterpretatie doet.
- G191 PFIP imaging: beeldrecords tonen een tijdlijnkoppeling naar poging,
  afspraak, cyclusdag en embryo wanneer die lokaal is vastgelegd.
- G190 PFIP imaging: beelduploads kunnen beelddatum, lichaams-/trajectcontext,
  bron, gekoppelde afspraak en traject als lokale beeldmetadata bewaren.
- G189 PFIP imaging: beeldmateriaal krijgt een expliciete lokale classificatie
  naar echo, foto, scan, embryo-afbeelding of overig beeld.
- G188 PFIP imaging: het dossierscherm heeft een aparte imaging-repository voor
  echo's, foto's, scans en embryo-afbeeldingen met lokale preview na ontgrendeling.
- G187 PFIP dossier-ingest: privacytest bewaakt dat lokale OCR- en
  metadata-extractie zonder OCR-opt-in geen `fetch`, `XMLHttpRequest` of
  `sendBeacon` start.
- G186 PFIP dossier-ingest: dossierdocumenten zijn lokaal doorzoekbaar op OCR-tekst,
  handmatige notities, metadata, bestandsnaam en tags binnen de ontgrendelde kluis.
- G185 PFIP dossier-ingest: het dossierscherm toont een dossierindex met
  documentdatum, documenttype, bronbestand, trajectkoppeling en lokale tags.
- G184 PFIP dossier-ingest: het dossierscherm bouwt automatisch een
  documenttijdlijn uit herkende metadata en formuliercorrecties, met zichtbare
  datumbron per document.
- G183 PFIP dossier-ingest: bestandsselectie toont lokale conceptrecords vóór
  opslag en dossieruploads vereisen expliciete bevestiging dat datum, categorie,
  uploadprofiel en koppelingen zijn gecontroleerd of gecorrigeerd.
- G182 PFIP dossier-ingest: dossierdocumenten krijgen lokale metadata-extractie
  voor documentdatum, instelling, documenttype, trajectkoppeling, arts en
  bronbestand op basis van bestandsnaam, formulierdata, notitie en OCR-tekst.
- G181 PFIP dossier-ingest: dossieruploads hebben een expliciete lokale
  OCR-opt-in. Tekstbestanden worden direct op het toestel uitgelezen; PDF's en
  afbeeldingen krijgen een versleutelde lokale OCR-wachtstatus zonder
  cloudverwerking of medisch advies.
- G180 PFIP dossier-ingest: dossieruploads hebben nu expliciete uploadprofielen
  voor onderzoeken, labuitslagen, fertiliteitsrapporten, ziekenhuisdocumenten,
  behandelverslagen, PDF's en afbeeldingen; Kiempad toont het profiel in de lokale
  analyse en leidt het af uit bestandsnaam, categorie of bestandstype als de
  gebruiker automatisch herkennen kiest.
- Personal Fertility Intelligence Platform epic toegevoegd met 64 extra uitvoerbare
  doelen (G180-G243) voor dossier-ingest, imaging, consult intelligence, embryo
  tracking, research intelligence, dagelijkse aanbevelingen, knowledge graph en
  fertility timeline.
- G179 Tailscale-publicatie: Kiempad draait live op de aparte Tailscale-node
  `kiempad` via Tailscale Serve HTTPS op `https://kiempad.tail9d0c71.ts.net`,
  met lokale fallback op `127.0.0.1:8098`.
- G121 WebAuthn/biometrie: back-upscherm kan lokaal WebAuthn PRF koppelen als
  optioneel ontgrendelgemak; vergrendelde kluis kan daarna via PRF-keywrap openen
  zonder passphrase op te slaan en met passphrase als fallback.
- G104 on-device AI-verkenning: kennisscherm toont passief welke lokale
  browser-AI API-objecten beschikbaar lijken, zonder sessie, modeldownload,
  provider-call of cloud-stap.
- G143/G144/G145 sync: back-upscherm kan versleutelde syncpakketten downloaden en
  importeren; pakketten bevatten alleen encrypted records en gebruiken last-wins op
  `updatedAt` bij conflicten.
- G146 consult-PDF: vragenscherm kan een lokaal printbaar consultoverzicht openen
  voor browser-PDF-export zonder externe dienst.
- G111 welzijnstrends: welzijnscherm toont feitelijke maandtrends voor
  symptoomlogs, intensiteit en mentale check-ins zonder score of oordeel.
- G107 CycleData: welzijnscherm kan feitelijke cyclusmetingen zoals temperatuur of
  bloeding versleuteld lokaal vastleggen en terug tonen.
- G056 injectie-instructie: medicatie kan naast instructietekst een lokale
  instructievideo als versleutelde bijlage tonen, zonder externe embed of tracking.
- G054 medicatievoorraad: medicaties kunnen een optionele resterende
  dosisteller bewaren die lokaal verlaagt bij een genomen DoseLog.
- G042 ICS-import: agendascherm kan een lokaal `.ics`-bestand van de kliniek lezen
  en afspraken als versleutelde lokale agenda-items opslaan.
- G041 ICS-export: agendascherm kan alle lokale afspraken als `.ics`-bestand
  downloaden voor eigen agenda-import.
- G030 trajecttrends: trajectscherm toont een lokaal overzicht over meerdere
  pogingen met totalen, actief/archief, status/type-verdeling en periode.
- G029 trajectarchief: trajecten kunnen uit de actieve lijst worden gearchiveerd en
  later hersteld zonder traject- of faserecords te verwijderen.
- G116 vraagkoppeling: afwegingen kunnen aan een bestaande vraag voor de arts
  worden gekoppeld en tonen die context bij de beslisnotitie.
- G154 donkere modus: topbar heeft een lokale themakeuze en settings bewaren de
  voorkeur versleuteld met een donker CSS-palet.
- G172 vergoedingscijfers: NL 2026-kostenkennis en vergoedingconstanten zijn
  herzien met verificatiedatum en bronverwijzingen naar Rijksoverheid,
  Zorginstituut Nederland en Zilveren Kruis.
- G178 embryokwaliteit: Dossier-scherm kan embryokwaliteit als lokale
  kliniekterugkoppeling vastleggen en koppelen aan poging of terugplaatsing, zonder
  kansberekening.
- G177 gespreksverslagen: Dossier-scherm kan gespreksverslagen uploaden en
  versleuteld koppelen aan bestaande afspraken en/of trajecten.
- G176 beeldmateriaal: Dossier-scherm accepteert foto's/echo's via image-upload,
  herkent beeldbijlagen lokaal en toont na ontgrendeling een lokale preview uit de
  versleutelde dossierpayload.
- G175 historische onderzoeken: nieuw Dossier-scherm uploadt meerdere
  onderzoeksbestanden, bewaart de inhoud versleuteld lokaal en toont lokale,
  niet-medische analyse van bestandsnaam, type en grootte.
- G137 opslag-schemaversie: lokale opslag krijgt een `schema` meta-record met de
  huidige schemaversie; ontbrekende metadata wordt bij ontgrendelen aangevuld en
  nieuwere schema's worden veilig geweigerd.
- G153 schermlezerlabels: herhaalde en contextafhankelijke acties zoals verwijderen,
  herordenen, innames markeren, fase wijzigen en kennis verifiëren hebben nu
  contextuele `aria-label`s.
- G142 back-upaanmoediging: back-upscherm toont lokaal wanneer een versleutelde
  export nog ontbreekt of verouderd is en bewaart de laatste succesvolle exportdatum
  versleuteld in settings.
- G126 lokaal gebeurtenissenlog: nieuw Logboek-scherm toont kluis- en back-up
  gebeurtenissen uit een versleuteld lokaal EventLog-record dat het toestel niet
  verlaat.
- G179 Tailscale-publicatie: optionele compose-stack, Serve-config en runbook voor
  een aparte Kiempad HTTPS-node voorbereid, inclusief deploy- en smoke-scripts.
- G115 beslisverslag: afwegingen tonen een terugleesbaar verslag met onderwerp,
  datum, opties, voors/tegens, keuze en onderbouwing.
- G114 keuzevastlegging: beslisnotities kunnen een gemaakte keuze met datum en
  onderbouwing lokaal versleuteld bewaren en terug tonen.
- G179 publicatiedoel toegevoegd: Kiempad via Tailscale op een aparte HTTPS-node
  publiceren, vergelijkbaar met Shred en Healthcore.
- G113 voors/tegens: beslisnotities kunnen per optie argumenten voor en tegen
  vastleggen en terug tonen.
- G112 beslisnotities: afwegingenscherm kan onderwerp, datum en opties als
  versleutelde lokale beslisnotitie bewaren en terug tonen.
- G110 owner-markering: symptoomlogs en mentale check-ins tonen expliciete
  eigenaarlabels voor Peter, partner of samen.
- G109 welzijn-overzicht zonder oordeel: welzijnscherm toont feitelijke aantallen,
  dagen en stemmingsverdeling zonder score-druk.
- G108 mentale check-in: welzijnscherm bewaart stemming en privé notitie als
  versleutelde lokale check-in.
- G106 symptomen per dag/over tijd: welzijnscherm groepeert symptoomlogs per datum
  en toont per dag het aantal logs en de gemiddelde intensiteit.
- G105 symptoomlog toevoegen: nieuw welzijnscherm bewaart symptoomlogs met datum,
  eigenaar, symptoom, intensiteit en notitie versleuteld lokaal.
- G082 eigen kennisitems: kennisscherm kan handmatige kennisitems toevoegen en
  bestaande eigen items bewerken met titel, inhoud, bron en categorie.
- G081 kennisbank zoeken/filteren: kennisscherm filtert lokale kennisitems op zoekterm
  en categorie zonder externe opslag of netwerkverkeer.
- G072 vraagverslag per afspraak: beantwoorde, gekoppelde vragen worden in het
  vragenscherm per afspraak terugleesbaar met antwoordtekst.
- G071 vraagprioriteit: vragen kunnen met een consultprioriteit worden opgeslagen en
  vanuit de vragenlijst omhoog of omlaag worden gezet.
- G065 in-app fallbackmeldingen: herinneringenscherm toont komende meldingen in de
  app wanneer browsernotificaties niet klaar staan, met dezelfde privacyregels als
  OS-notificaties.
- G063 snooze/opnieuw plannen: komende herinneringen kunnen vanuit het
  herinneringenscherm worden gesnoozed of naar een nieuw tijdstip verplaatst.
- G084 kostenjaar-markering: kostenkennisitems tonen automatisch een jaartallabel,
  zodat vergoedingsteksten zichtbaar tijdgebonden blijven.
- G090 vergoede-pogingen-teller: trajectscherm telt handmatig gemarkeerde pogingen
  die na geslaagde punctie meetellen en toont resterend van drie vergoede pogingen.
- G089/G092/G093 eigen-risicoteller: kostenscherm toont het gebruikte/resterende
  eigen risico voor 2026, verwijst naar eigen polis/verzekeraar en labelt het
  overzicht als geen financieel advies.
- G088 kostenoverzicht: kostenscherm toont totaal, vergoed gemarkeerd, mogelijke eigen
  bijdrage en onbekende bedragen op basis van lokaal ingevoerde kostenposten.
- G085/G086/G087 kostenbasis: kostenscherm kan kostenposten toevoegen, bewerken en
  verwijderen met categorie en vergoedstatus, lokaal versleuteld opgeslagen.
- G094 researchbibliotheek: kennisscherm kan handmatig researchitems met titel,
  bron/link en notitie als versleuteld conceptkennisitem bewaren.
- G102 AI-provider/modelkeuze: kennisscherm toont provider- en modelvelden in de
  lokale AI-instelling en bewaart die keuze versleuteld zonder externe call.
- G175-G178 dossier- en uploaddoelen toegevoegd voor historische onderzoeken,
  foto's/echo's, gespreksverslagen en embryokwaliteit.
- G062 standaard-waarschuwtijd: herinneringenscherm bewaart een versleutelde
  standaard afspraakwaarschuwing en nieuwe afspraakformulieren vullen de herinnering
  vooraf in.
- G060 eigen losse herinneringen: herinneringenscherm kan eigen herinneringen met
  titel, tijdstip en herhaling versleuteld bewaren.
- G055 medicatieschema-import: handmatig gestructureerde regels
  `Medicatie | YYYY-MM-DD | HH:MM` maken expliciete DoseLogs zonder dosering af te
  leiden.
- G052/G053 DoseLog-notities en historie: innames/injecties kunnen een notitie
  bewaren bij afvinken en medicatie toont een historie per middel.
- G040 afgelopen afspraken: agendascherm toont afspraken uit het verleden apart als
  "Geweest" en gebruikt de bestaande notitie als terugblik.
- G035 agenda week-/maandweergave: agendascherm toont afspraken compact gegroepeerd
  per ISO-week en maand naast de bestaande chronologische lijst.
- G026/G027 meerdere pogingen: trajectscherm kan een nieuwe poging toevoegen naast het
  bewerken van de eerste poging en toont alle pogingen met pogingnummer.
- G139/G140/G141 back-up export/import: back-upscherm toegevoegd voor
  `.kiempad-export` downloads en checksum-gecontroleerde import van versleutelde
  records plus kluismetadata.
- G101/G103 AI-preview en samenvatting opslaan: kennisscherm toont de lokale
  gede-identificeerde payload-preview en kan een AI-samenvatting als gelabeld
  KennisItem bewaren via de versleutelde kennisstore.
- G097/G098/G099 veilige AI-samenvattinglaag: helpers toegevoegd voor
  de-identificatie/minimalisatie van toekomstige AI-payloads, waarschuwing + bron bij
  AI-samenvattingen als KennisItem en policy-tests tegen dosering, diagnose en
  behandelkeuze.
- G095/G096/G100/G125 AI opt-in fundament: AI staat standaard uit, toekomstige
  AI-verzoeken krijgen een expliciete opt-in/actie-guard en provider/model/API-sleutel
  worden alleen via het versleutelde lokale settingsrecord bewaard.
- G158 snelle invoer: startscherm krijgt een compacte invoerroute waarmee een
  afspraak, medicatie of vraag met alleen een korte tekst kan worden toegevoegd via
  de bestaande versleutelde stores.
- G171 kennisbankverificatie: kennisitems bewaren verificatiedatum en volgende
  jaarlijkse reviewdatum na bevestiging door een behandelaar.
- G169 ADR-dekking: ADR-0008 toegevoegd voor de aangescherpte CI/lintgate en
  privacyveilige notificatie-inhoud als opt-in instelling.
- G167/G168/G170/G174 onderhoudschecks: tests toegevoegd voor actuele
  onderhoudsvermeldingen, correcte backlogtelling en consistente niet-medische
  disclaimer in app en kerndocumenten.
- G173 dependency-security update: range-compatible npm-update uitgevoerd, waardoor
  Vite via de lockfile naar 8.1.0 gaat; audit blijft schoon.
- G133 datamodel-sync: ontbrekende TypeScript-interfaces toegevoegd voor de
  later-modules uit `DATAMODEL.md` en een sync-test toegevoegd voor entiteiten en
  kernvelden.
- G066 notificatieprivacy: versleutelde lokale setting toegevoegd waarmee
  notificaties standaard generiek blijven en details op het vergrendelscherm alleen
  na expliciete keuze verschijnen.
- M1.10 tests & kwaliteit: Biome toegevoegd voor consistente lint/format-checks,
  `npm run lint`/`npm run format:check` scripts toegevoegd en CI uitgebreid met de
  lint/format-gate naast typecheck, tests, audit en build (G165, G166).
- M1.9 UX/PWA-baseline: installatiemanifest, SVG-icon, offline service-worker met
  cacheversie en navigatiefallback, standaard service-workerregistratie, concreter
  startscherm, skiplink/focusstijl, lege-staten en testbare delete-confirmaties
  (G149-G152, G156, G157).
- M1.8 basis-kennisbank: versleutelde KennisItem-store, seed van conceptitems uit
  `docs/KENNISBANK.md`, categorieoverzicht voor fasen/leefstijl/kosten/research,
  zichtbare bron-, AI- en artsverificatielabels en expliciet markeren als
  geverifieerd met arts (G073-G080, G083, G138).
- M1.7 vragen voor de arts: centrale versleutelde vragenopslag, vragen toevoegen/
  bewerken/verwijderen, koppeling aan afspraken, beantwoordstatus met antwoordtekst
  en overzicht van openstaande vragen voor de eerstvolgende afspraak (G067-G070).
- M1.6 herinneringen & lokale notificaties: centrale versleutelde herinneringenopslag,
  afspraak- en medicatieherinneringen vanuit afspraken/DoseLogs, eenmalige/
  dagelijkse/wekelijkse herhalingslogica, herinneringenscherm met permissiestatus,
  lokale service-worker-notificaties en generieke notificatietekst zonder medische
  details (G057-G059, G061, G064).
- M1.5 medicatie & injectieschema: versleuteld medicatie vastleggen met vorm,
  instructie, actief/inactief en kliniekdosistekst, injectievorm apart ondersteunen,
  DoseLogs genereren vanuit expliciete planning, vandaag-overzicht tonen, innames als
  genomen/overgeslagen markeren, gemiste geplande innames markeren en policy-/store-
  tests die borgen dat Kiempad geen dosering berekent of adviseert (G043-G051, G162,
  G163).
- M1.4 agenda & afspraken: versleuteld afspraken aanmaken/bewerken/verwijderen,
  afspraaktypes, komende-afsprakenlijst, trajectkoppeling, voorbereiding/notitie,
  gekoppelde vraag voor de arts, afspraakherinnering als lokaal record en agenda-
  domein/storetests (G031-G034, G036-G039).
- M1.3 traject & fasen: versleuteld traject aanmaken/bewerken/verwijderen, status en
  notitie bewaren, vaste fasevolgorde met concepttoelichtingen, huidige fase markeren,
  tijdlijnweergave, startscherm-volgende-stap en domein-/storetests (G019-G025, G028,
  G159).
- M1.2 versleutelde opslagfundering: PBKDF2 + salt, niet-exporteerbare AES-256-GCM
  sessiesleutel, verifier-based passphrase unlock, auto-lock, IndexedDB repository
  voor versleutelde records, geen-herstel-uitleg, CI-auditstap en crypto/opslag/
  privacy-tests (G117-G120, G122-G128, G131-G132, G134-G136, G160-G161, G164).
- M1.1 app-skelet: Nederlandstalige, responsive app-shell met hash-navigatie tussen
  hoofdschermen, zichtbare niet-medische disclaimer en Vitest-dekking voor de
  navigatie-/disclaimer-rendering (G016, G017, G018, G130, G147, G148, G155).
- Eerste documentatieset en repo-fundament (v0.1, F0):
  - Kerndocumenten: `README.md`, `VISIE.md`, `ARCHITECTURE.md`, `ROADMAP.md`,
    `CURRENT_STATE.md`, `MASTER_CONTEXT.md`, `DATAMODEL.md`, `PRIVACY.md`,
    `SECURITY.md`, `CONTRIBUTING.md`, `PRODUCT_BACKLOG.md`.
  - `docs/RUNBOOK.md`, `docs/KENNISBANK.md` en ADR's in `docs/adr/`.
  - Project-scaffold: TypeScript/Vite-opzet, `Makefile`, `Dockerfile`,
    `docker-compose.yml`, `.github`-templates + CI, `.gitignore`, `.env.example`,
    `LICENSE`.
  - Domein-kernvormen (`src/domain/types.ts`) en eerste geteste domeinregel
    (`src/domain/vergoeding.ts` + Vitest-test).
- `PRODUCT_BACKLOG.md` met 100+ concrete, afvinkbare doelen, gekoppeld aan de roadmap.
- `docs/adr/0006-repo-publiek.md` — beslissing om de repo publiek te maken.
- `CODEX_BUILD_PROMPT.md` — bouwopdracht voor Codex (`/goal`) om Kiempad op basis van
  de 178 doelen gefaseerd (F1 eerst) te bouwen.
- `docs/adr/0007-codex-autonoom-bouwen.md` — Codex bouwt en merget autonoom; groene CI
  is de merge-gate (vervangt menselijke review uit ADR-0005). Build prompt,
  MASTER_CONTEXT, CONTRIBUTING en PR-template hierop afgestemd.

### Changed
- Ontwikkeltooling bijgewerkt naar Vite 8, Vitest 4 en vite-plugin-pwa 1.x; Node-floor
  expliciet gemaakt op 20.19+ zodat `npm audit` weer schoon is.
- Repo **publiek** gemaakt (ADR-0006) i.v.m. de GitHub Actions-billingblokkade op
  private repos. Docs aangepast zodat ze de publieke realiteit weerspiegelen
  (`README`, `PRIVACY`, `MASTER_CONTEXT`, `SECURITY`, `CONTRIBUTING`, `LICENSE`,
  `CURRENT_STATE`, ADR-0005, backlog G129). De **gezondheidsdata blijft local-first
  en privé**; alleen code/docs zijn publiek.

### Fixed
- (nog niets)
