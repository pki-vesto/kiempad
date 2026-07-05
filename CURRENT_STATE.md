# Kiempad — CURRENT_STATE

> Stand per 2026-07-01. Houd dit bij de tijd: het is de eerlijke "wat is er echt"
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
- **G1317 screen-stage werkruimtes:** de hoofdcontent rendert nu een expliciete
  actieve `screen-stage` per scherm met eigen paneel en desktop-scrollvlak, zodat
  Kiempad niet meer als één doorlopende pagina onder de navigatie leest.
- **G1318 mobiele Start-routekaart:** de Start-overview houdt op mobiel de zware
  command-center verdieping binnen een eigen scrollbaar vlak, zodat de startpagina
  korter blijft en de primaire werkbanen als route-ingang blijven functioneren.
- **G1319 mobiele Dagadvies-console:** `#start-recommendations` begrenst op mobiel
  workflow, eigenaarwerkbank, actieplanner en lijst binnen één scrollbare
  adviesconsole, terwijl desktop de gescheiden advieswerkvlakken behoudt.
- **G1320 PWA theme-color teal:** browser- en installatiechrome gebruiken nu het
  Claude Design teal (`#2c6e63`) met een donkere variant voor dark mode en een
  manifestachtergrond die bij de Kiempad page background past.
- **G1321 mobiele/tablet Meer-navigatie:** de compacte navigatie toont niet langer
  alle 13 hoofdschermen tegelijk, maar 8 primaire routes plus een Meer-sheet met
  Inzicht, Beheer, Privacy en Instellingen; secundaire actieve routes blijven
  zichtbaar gemarkeerd.
- **G1322 content zonder grote frame:** de actieve `screen-stage` heeft geen eigen
  grijze container, radius, border of schaduw meer; scherminhoud rust op de
  pagina-achtergrond en alleen echte kaarten/panels geven diepte.
- **G1323 dagadvies als suggesties:** de dagadviesroute toont nu `Te doen vandaag`
  en `Bekijk suggesties` in plaats van aanbevelingstaal; statusfeedback,
  timeline/graph-labels en artscheckvragen gebruiken dezelfde niet-voorschrijvende
  framing.
- **G1324 persoonlijke instellingen:** instellingen openen vanuit een dedicated
  sheet met namen, gedeelde modus en thema. Namen en gedeelde modus worden encrypted
  bewaard en de Start-groet gebruikt opgeslagen namen in plaats van een hardcoded
  placeholder.
- **G1325 Welzijn met persoonlijke ownerlabels:** recente welzijnssignalen,
  `Van wie`-selects en check-in/symptoombadges tonen ingestelde namen waar
  beschikbaar, met `Samen` als gedeelde context en behoud van de bestaande
  `peter`/`partner`/`samen` recordwaarden.
- **G1326 mobiele Meer-sheet zonder blokkade:** secundaire mobiele routes houden de
  Meer-knop actief gemarkeerd zonder de sheet automatisch over de content te openen;
  routeformulieren reserveren extra ruimte boven de bottom navigation zodat controls
  aanklikbaar blijven.
- **G1327 rustige sidebar-acties:** instellingen en vergrendelen staan niet meer
  bovenin de desktop-sidebar; de header toont merk en opslagstatus, terwijl de
  acties onderaan in een stille utility-zone bereikbaar blijven.
- **G1328 rijke lege staten:** lege routes tonen ontworpen empty-state blokken met
  icoontegel, titel, tekst en waar passend een CTA naar de invoerroute in plaats van
  kale `Nog geen...` regels.
- **G1329 skeleton-laadlaag:** unlock en reload tonen een route-level skeleton met
  `aria-busy` voor dossier, timeline, AI-samenvattingen, OCR-review en lokale lijsten,
  zodat de werkruimte niet abrupt van leeg naar gevuld springt.
- **G1330 Dossier single-flow uploadconsole:** de Dossier-uploadroute toont standaard
  alleen documentupload. Consultverslagen, embryokwaliteit, embryostatus en review
  blijven als routekaarten bereikbaar en openen pas via hun anker, zodat de intake
  niet meer als één lange pagina met alle formulieren tegelijk leest.
- **G482 Literatuur discovery querybuilder:** de Kennis researchroute toont een
  PubMed-querypreview met gede-identificeerde contextlabels, bewerkbare
  zoektermen, uitgesloten-contextchips en een lokale bewaaractie als
  researchconcept zonder netwerkactie, dossierplaintext, consulttekst of OCR-tekst.
- **G485 Research trenddashboard:** researchtrends tonen per onderwerp nu
  publicatieperiode, bron, update-status, laatste check en relevantie-uitleg naast
  de bestaande trendscan, zodat ontwikkelingen scanbaar blijven zonder
  bewijsweging, diagnose of behandeladvies.
- **G541 research broncitatie-parser:** researchsamenvattingen tonen parsed
  broncitatie met bron, datum, reviewstatus, citationtype, origineel en
  correctievelden, zodat bronherleiding controleerbaar blijft.
- **G542 researchsamenvatting leesniveauguard:** eenvoudige researchsamenvattingen
  tonen bron, datum, reviewstatus, vaktaalsignalering en corrigeerbare velden,
  zodat de gebruiker kan zien of lekenuitleg begrijpelijk genoeg is.
- **G543 researchtrend update-timestamp:** researchtrendkaarten tonen per onderwerp
  een lokale update-datum, bron, reviewstatus, correctievelden en uitleg voor leken,
  zodat gebruikers trendmetadata kunnen controleren zonder medisch advies of
  keuzehulp.
- **G545 researchbibliotheek offline cache metadata:** researchbronnen tonen
  cachebron, datum, reviewstatus, cachetype en correctievelden, zodat lokale
  researchbronnen controleerbaar blijven zonder netwerkactie.
- **G1987 offline cache metadata routeflow evidence:** de routeflow-smoke opent
  de researchbronnenlaag en bewaakt cachebron, datum, reviewstatus, cachetype,
  correctievelden en niet-medische payloadgrens voor offline cache metadata.
- **G1988 offline cache metadata release evidence freshness guard:**
  releasecontext in changelog, current state, runbook en completion audit noemt
  `npm run smoke:routeflows`, `knowledge-research-offline-cache-metadata`,
  `data-research-offline-cache-metadata` en `researchOfflineCacheMetadata`, zodat
  cachebron, datum, reviewstatus, cachetype en correctievelden gekoppeld blijven
  zonder diagnose, dosering, kansberekening, behandelkeuzeadvies, secret,
  gezondheidsdata of plaintext medische payload.
- **G1989 offline cache metadata missing-term fixture:** de maintenance-test geeft
  een compacte technische melding wanneer
  `knowledge-research-offline-cache-metadata` of
  `data-research-offline-cache-metadata` uit release-evidence verdwijnt, met
  cachebron, datum, reviewstatus, cachetype en correctievelden als veilige
  context zonder diagnose, dosering, kansberekening, behandelkeuzeadvies,
  secret, gezondheidsdata of plaintext medische payload.
- **G1990 offline cache metadata missing-term contract:** de exacte foutmelding
  voor ontbrekende offline-cache release-evidence termen is als compact
  maintenance-contract gesnapshott met alleen
  `knowledge-research-offline-cache-metadata` en
  `data-research-offline-cache-metadata` als veilige technische labels.
- **G1991 offline cache metadata release-state guard:** release-state evidence
  koppelt het G1990 `offline cache metadata missing-term error contract` aan
  `knowledge-research-offline-cache-metadata`,
  `data-research-offline-cache-metadata` en veilige technische labels.
- **G1992 offline cache metadata release-state missing-term fixture:** de
  maintenance-test geeft compact terug wanneer het G1990 contractlabel of
  `veilige technische labels` uit release-state evidence ontbreekt, zonder
  diagnose, dosering, kansberekening, behandelkeuzeadvies, secret,
  gezondheidsdata of plaintext medische payload.
- **G1993 offline cache metadata release-state error contract:** de exacte
  release-state missing-term foutmelding is als
  `offline-cache-metadata-release-state-missing-term-contract` gesnapshott; de
  contractcontext bewaakt `Offline cache metadata release-state ontbreekt voor termen`
  met veilige labels `offline cache metadata missing-term error contract` en
  `veilige technische labels`.
- **G1994 offline cache metadata release-state contract release guard:**
  release-evidence bewaakt dat het G1993
  `offline-cache-metadata-release-state-missing-term-contract` en de
  foutmeldingcontext `Offline cache metadata release-state ontbreekt voor termen`
  in changelog en current-state blijven staan met alleen `offline cache metadata
  missing-term error contract` en `veilige technische labels`.
- **G1995 offline cache metadata release-state contract missing-term fixture:** de
  maintenance-test meldt compact wanneer de veilige labels `offline cache
  metadata missing-term error contract` of `veilige technische labels` uit G1993
  contractrelease-evidence verdwijnen.
- **G1996 offline cache metadata release-state contract missing-term error
  contract:** de exacte G1995 contractrelease missing-term foutmelding is als
  compact maintenance-contract gesnapshott met veilige labels `offline cache
  metadata missing-term error contract` en `veilige technische labels`.
- **G546 research artsbespreekvragen:** researchrelevantie toont neutrale
  conceptvragen voor de kliniek met bron, datum, reviewstatus en correctievelden,
  zodat gebruikers researchcontext als gesprekvoorbereiding kunnen controleren.
- **G488 Dagadvies personalisatiefeedback:** lokale feedbackstatussen uit encrypted
  eventlogs tonen per suggestie hoe Kiempad de status gebruikt, inclusief uitleg
  dat niet-passend lager prioriteert maar vergelijkbare suggesties niet
  definitief verbergt.
- **G550 Dagadvies bronconfidence:** dagadvieskaarten tonen per suggestie een
  bronconfidenceblok met label, score, bron, datum, reviewstatus,
  broncategorieen en lekenuitleg, zodat bronbasis controleerbaar blijft zonder
  bewijsweging of behandeladvies.
- **G552 Dagadvies feedbackanalytics zonder tracking:** de Dagadvies-werkbank
  toont lokale feedbackanalytics uit encrypted eventlogs met statusverdeling,
  eigenaarverdeling, laatste feedbackdatum, bron, reviewstatus en expliciete
  no-tracking copy.
- **G553 Dagadvies eigenaarsfilter:** de dagadviesroute toont een zichtbaar
  eigenaarsfilter waarmee vrouw-, man- of samen-suggesties lokaal verborgen en
  hersteld kunnen worden; bron, datum en reviewstatus blijven zichtbaar vanuit
  encrypted eventlogs.
- **G567 Dossierupload groottefeedback:** de eerste uploadstap toont een aparte
  groottecontrole met per-bestandlimiet, selectielimiet, centrale 413-context en
  herstelbare retry-copy zonder bestandsnamen, OCR-tekst of medische inhoud in de
  zichtbare statusmelding.
- **G568 Ziekenhuisdocumenttype reviewcorrectie:** de metadata-stap laat het
  herkende ziekenhuisdocumenttype als conceptcontext controleren, corrigeren of
  bewust op onbekend zetten; de gereviewde waarde wordt encrypted bewaard en
  gebruikt voor dossierindex en zoeken zonder medisch advies.
- **G570 Consultnotitie tekstimport reviewstatus:** de consultupload-context laat
  tekstveldnotities als concept of gereviewde bronmetadata bewaren, zodat
  samenvattingen, actiepunten en vragen duidelijk op gecontroleerde broncontext
  kunnen leunen zonder medische adviesinhoud.
- **G571 Embryo-ID alias reviewcorrectie:** embryokwaliteit en embryostatus
  kunnen een alias, kliniek-ID, bronlabel en reviewstatus vastleggen; het
  embryo-dossier en de vergelijking tonen gecorrigeerde alias, Kiempad-ID en
  kliniek-ID naast elkaar zonder medische interpretatie.
- **G572 Embryokwaliteit bronlabelcorrectie:** embryo-dossierkaarten tonen een
  aparte correctieflow voor bronlabel, datum en reviewstatus; de gecorrigeerde
  bronmetadata wordt encrypted op hetzelfde dossierrecord bewaard en gebruikt in
  bronlabels zonder de kliniekwaarde te veranderen.
- **G578 OCR-review correctieformulier:** OCR-documenten tonen nu een compacte
  correctieflow voor OCR-tekst, metadata-notitie en reviewstatus; gereviewde
  correcties worden encrypted bewaard en concept-OCR wordt niet als zoektekst
  gebruikt voordat de review is afgerond.
- **G579 Metadata-normalisatie correctieformulier:** dossierdocumenten tonen nu
  een compacte correctieflow voor datum, bron, documenttype, onderzoekstype,
  poging, afspraak en onzekerheid; originele waarden blijven auditcontext,
  index/zoek/tijdlijn gebruiken de correctie en locked beelditems blijven veilig.
- **G580 Historische tijdlijnreview:** dossier-documenttijdlijnitems tonen nu
  een compacte reviewkaart om datum, bron, reviewstatus en zichtbaarheid te
  bevestigen, corrigeren of verbergen; de centrale timeline gebruikt de
  gecorrigeerde metadata en locked beelditems lekken geen bronbestandsnaam.
- **G581 Imaging metadata reviewcorrectie:** beeldrecords in Beeldenoverzicht
  tonen een aparte reviewflow voor beeldtype, bron, datum, poging, afspraak,
  EXIF-status en reviewstatus; gecorrigeerde metadata wordt encrypted op
  hetzelfde dossierrecord bewaard en locked previews blijven zonder bronpayload.
- **G1331 Dossier zoekconsole:** de Dossier-zoekroute groepeert zoeken,
  privacycontrole en inhoudsindex in drie herkenbare panelen. De route opent als
  compacte zoekwerkruimte in plaats van losse formulier-, privacy- en indexblokken.
- **G1839 Dossier-upload micro-label optische sizing:** actieve routekaart-
  micro-labels houden op small-mobile forced-colors expliciet
  `font-optical-sizing: auto`, zodat het kleine actieve label compact blijft naast
  titel, context en focuscue.
- **G1861 consult reviewwerkbank:** gevulde consultkaarten tonen boven de
  transcript- en reviewdetails een compacte eerste-viewport werkbank met routes
  naar verslag, samenvatting, actiepunten en broncontext. Mobiel blijft de werkbank
  horizontaal scanbaar zonder bestaande consultankers of reviewformulieren te breken.
- **G557 consult review-scan:** de Consultverslagen-sectie start met een compacte
  scanlaag voor verslagen, samenvattingen, actiepunten en bronreview, zodat de
  gebruiker eerst overzicht krijgt voordat detailkaarten en reviewformulieren volgen.
- **G1921 mobiele consult review-scan dichtheid:** op mobiel gebruikt de
  consultscan smallere snapkaarten met lagere hoogte en compactere labels, zodat
  verslagen, samenvattingen, actiepunten en bronreview sneller tegelijk scanbaar zijn.
- **G558 embryo tracking-scan:** de Embryo-dossiers-sectie start met een compacte
  scanlaag voor dossiers, meetmomenten, status-events en bronnen, zodat
  embryohistorie eerst als overzicht leest voordat vergelijkingen en detailkaarten volgen.
- **G1922 mobiele embryo tracking-scan dichtheid:** op mobiel gebruikt de
  embryoscan smallere snapkaarten met lagere hoogte en compactere labels, zodat
  dossiers, meetmomenten, status-events en bronnen sneller tegelijk scanbaar zijn.
- **G559 research trend-scan:** het researchtrenddashboard start met een compacte
  scanlaag voor onderwerpen, publicaties, bronnen en laatste update, zodat trends
  eerst als overzicht lezen voordat de losse trendkaarten volgen.
- **G1923 mobiele research trend-scan dichtheid:** op mobiel gebruikt de
  researchscan smallere snapkaarten met lagere hoogte en compactere labels, zodat
  onderwerpen, publicaties, bronnen en laatste update sneller tegelijk scanbaar zijn.
- **G560 dagadvies owner-scan:** de Dagadviesroute toont in de eerste laag nu drie
  compacte kaarten voor vrouw, man en samen, zodat persoonlijke en gezamenlijke
  suggesties eerst scanbaar zijn voordat de gebruiker beslislinks of de volledige
  suggestielijst opent.
- **G1924 mobiele dagadvies owner-scan dichtheid:** op mobiel gebruikt de
  owner-scan smallere snapkaarten met lagere hoogte en korte review-/artscheckregels,
  zodat vrouw/man/samen sneller tegelijk zichtbaar zijn zonder de volledige lijst te openen.
- **G1862 researchsamenvatting leesbord:** de researchsamenvattingenroute toont
  vóór de wetenschappelijke en eenvoudige lijsten een compact leesbord voor
  wetenschappelijke samenvatting, eenvoudige uitleg, relevantie en broncontext.
  Mobiel blijft het bord horizontaal scanbaar en de bestaande bron-/trendanchors
  blijven intact.
- **G1863 Dagadvies beslisbord:** de Dagadviesroute start met een compact
  eerste-viewport beslisbord voor vrouw, man, samen en artscheck. De actieplanner,
  eigenaarwerkbank en volledige suggestielijst blijven bereikbaar als vervolgcontext
  zonder als één lange pagina te openen.
- **G1864 Dossier-tijdlijn event board:** de Dossier-tijdlijnroute start met een
  compact event board voor uploads, consulten, beelden en embryo's. De
  documenttijdlijn en behandelgeschiedenis blijven via follow-up bereikbaar zonder
  de eerste viewport als lange dossierstapel te vullen.
- **G1865 Behandelcontext beslisbord:** de trajectcontext-route start met een
  compact beslisbord voor faseplanning, fertility timeline, vergoeding en graph.
  De volledige timeline- en graphdisclosures blijven bereikbaar zonder de eerste
  viewport als lange contextstapel te vullen.
- **G1866 Welzijnsgeschiedenis signaalbord:** de welzijnsgeschiedenisroute start
  met een compact signaalbord voor recente signalen, symptomen, cyclusmetingen en
  mentale check-ins. Detailhistorie blijft via bestaande disclosures bereikbaar
  zonder als één lange welzijnsstapel te openen.
- **G1867 Beslisgeschiedenis reviewbord:** de Afwegingen-geschiedenisroute start
  met een compact reviewbord voor opties, keuze, notities en beslisverslagen.
  Volledige beslisdetails blijven via bestaande compare-, choice-, form- en
  historyankers bereikbaar zonder de eerste viewport als lange beslisstapel te
  vullen.
- **G1868 Kostenhistorie kostenbord:** de Kosten-historieroute start met een
  compact kostenbord voor totalen, vergoeding, eigen risico en kostenhistorie.
  De volledige kostenlijst en bewerkformulieren blijven via bestaande overzicht-,
  vergoeding-, formulier- en historyankers bereikbaar zonder de eerste viewport
  als lange factuurstapel te vullen.
- **G1869 Medicatiehistorie intakebord:** de Medicatie-historieroute start met
  een compact intakebord voor vandaag, planning, actieve medicatie en
  doseerhistorie. De volledige middelen-, voorraad- en innamelijsten blijven via
  bestaande vandaag-, planning-, beheer- en historyankers bereikbaar zonder de
  eerste viewport als lange medicatiestapel te vullen.
- **G1870 Agendageschiedenis planningbord:** de Agenda-historieroute start met
  een compact planningbord voor vandaag, komende afspraken, voorbereiding en
  afspraakgeschiedenis. De volledige afspraakgeschiedenis blijft via bestaande
  overzicht-, komend-, plannen- en historyankers bereikbaar zonder de eerste
  viewport als lange planningstapel te vullen.
- **G1871 Herinneringen notification board:** de Herinneringen-komendroute start
  met een compact notification board voor toestemming, planning, privacy en
  herinneringsgeschiedenis. De volledige fallback- en herinneringenlijsten blijven
  via bestaande status-, privacy-, plannen- en komendankers bereikbaar zonder de
  eerste viewport als lange meldingenstapel te vullen.
- **G1872 Logboek audit board:** de Logboek-recente-route start met een compact
  audit board voor privacystatus, aandachtspunten, systeemcategorieen en
  audithistorie. De volledige event- en privacytijdlijnen blijven via bestaande
  overzicht-, recent-, categorieen- en privacyankers bereikbaar zonder de eerste
  viewport als lange auditstapel te vullen.
- **G1873 Back-up recovery board:** de Back-up-controleroute start met een compact
  recovery board voor exportstatus, synchestel, back-upherinnering en
  herstelhistorie. De volledige syncstatus-, reminder- en herstelpanelen blijven
  via bestaande export-, import-, status- en herstelankers bereikbaar zonder de
  eerste viewport als lange back-upstapel te vullen.
- **G1874 Instellingen preferences board:** de settings-sheet start met een
  compact voorkeurenbord voor identiteit, gedeelde modus, thema,
  notificatieprivacy en detailvelden. De bestaande naam-, gedeelde-modus-,
  thema- en voorbeelddataformulieren blijven via een detailsectie bereikbaar
  zonder de eerste viewport als lange instellingenstapel te vullen.
- **G1875 Start focus board:** Start opent nu met een compact first-viewport
  bord voor vandaag, planning, suggesties, vragen en dashboardcontext. De
  bestaande dagactie, werkbanen, cockpit en setup blijven bereikbaar zonder de
  eerste viewport als lange dashboardstapel te vullen.
- **G1876 Vragen/Open prep board:** de Open-route in Vragen start met een compact
  voorbereidingsbord voor open vragen, volgende afspraak, prioriteit,
  voorbereiding en vraagcontext. De volledige open-vragenlijst blijft bereikbaar
  achter een vervolgsectie zonder de eerste viewport als vragenstapel te vullen.
- **G1877 Dagadvies selection board:** Dagadvies start met een compact
  selectiebord voor vandaag, eigenaarroutes, feedback, artscheck en volledige
  context. De bestaande eigenaar-, actieplanner-, feedbackfilter- en volledige
  lijstlagen blijven bereikbaar zonder de eerste viewport als adviesstapel te
  vullen.
- **G1878 Kennis/Research source board:** Kennis/Research start met een compact
  bronselectiebord voor bronnen, eenvoudige uitleg, wetenschappelijke
  samenvatting, relevantie en volledige researchcontext. De bestaande
  broncache-, samenvatting-, relevantie-, trend- en vervolgcontextlagen blijven
  bereikbaar zonder de eerste viewport als researchstapel te vullen.
- **G1879 Kennis/Bibliotheek index board:** Kennis/Bibliotheek start met een
  compact indexbord voor categorieën, zichtbare items, filters, kaartacties en
  volledige bibliotheekcontext. De bestaande categoriekaarten, filters,
  itemlijsten, verificatielabels en bewerkacties blijven bereikbaar zonder de
  eerste viewport als bibliotheekstapel te vullen.
- **G1880 Kennis/Toevoegen input board:** Kennis/Toevoegen start met een compact
  inputbord voor researchinvoer, eigen kennis, verplichte velden, opslagstatus en
  volledige toevoegcontext. De bestaande formulier-id's, input names,
  eigen-kennisroute, feedback en annuleeracties blijven bereikbaar zonder de
  eerste viewport als invoerstapel te vullen.
- **G1881 Kennis/AI preview board:** Kennis/AI start met een compact previewbord
  voor AI-preview, samenvatting bewaren, instellingen, researchnetwerk en
  volledige AI-context. De bestaande preview-, opslag-, instellingen- en
  netwerkpanelen blijven bereikbaar zonder de eerste viewport als AI-stapel te
  vullen.
- **G1882 Traject/Overzicht stage board:** Traject/Overzicht start met een
  compact stagebord voor huidige fase, volgende stap, tijdlijn, vergoeding en
  volledige behandelcontext. De bestaande routehooks, formulieren,
  tijdlijnankers, vergoedingankers en graphcontext blijven bereikbaar zonder de
  eerste viewport als trajectstapel te vullen.
- **G1883 Traject/Fasen phase board:** Traject/Fasen start met een compact
  fasebord voor actieve fase, fasehistorie, faseacties, behandelcontext en
  volledige planning. De bestaande faseknoppen, vervolgcontext, tijdlijnankers
  en graphcontext blijven bereikbaar zonder de eerste viewport als
  faseplanningstapel te vullen.
- **G1884 Traject/Beheer management board:** Traject/Beheer start met een
  compact beheerbord voor huidig traject, nieuwe poging, archief,
  behandelcontext en volledige beheerdetails. De bestaande form-id's,
  input names, archiefacties en herstel/verwijderacties blijven bereikbaar
  zonder de eerste viewport als beheerformulierstapel te vullen.
- **G1885 Traject/Vergoeding reimbursement board:** Traject/Vergoeding start
  met een compact vergoedingsbord voor resterende pogingen, meetellende
  pogingen, poliscontext, kostenroute en volledige details. De bestaande
  vergoedingstekst, kostenlink, routehooks en privacygrenzen blijven bereikbaar
  zonder de eerste viewport als administratiestapel te vullen.
- **G1886 Traject/Context timeline board:** Traject/Context start met een
  compact contextbord voor timeline, graph, fasecontext, vergoeding en
  volledige inzichten. De bestaande timelinefilters, graphankers,
  bronmetadata, routehooks en privacygrenzen blijven bereikbaar zonder de
  eerste viewport als inzichtenstapel te vullen.
- **G1887 Traject workbench route board:** de Traject-zijwerkbank start met
  een compact routebord voor huidige fase, volgende actie, timeline,
  werkgrens en routeacties. De bestaande workbenchankers, phase hero, stats,
  actielinks en disclaimergrenzen blijven bereikbaar zonder de eerste viewport
  als dichte contextkolom te vullen.
- **G1888 Traject route density cues:** de Traject route-rail toont nu per
  route een compacte cue-chip en vaste density-indicator voor overzicht,
  fasen, vergoeding, context en beheer. Hrefs, badges, aria-current states,
  command-task hooks en privacygrenzen blijven intact terwijl de rail minder
  als één dichte navigatiestrook leest.
- **G1889 Traject mobile route grouping:** op mobiel groepeert de Traject
  route-rail de startroute over de volle breedte, planning/vergoeding als
  middenrij en context/beheer als vervolgrij. De bestaande routehrefs,
  aria-current states, badges, command-task hooks en desktop density-cues
  blijven intact.
- **G1890 Traject mobile active route reach:** op mobiel promoveert de
  Traject route-rail de actieve route bovenaan over de volle breedte, ook
  wanneer Fasen, Vergoeding, Context of Beheer actief is. De routegroepen,
  hrefs, badges, aria-current states en desktop density-cues blijven intact.
- **G1891 Traject mobile route focus polish:** de mobiele Traject route-rail
  heeft nu duidelijkere actieve/focusfeedback met ring, subtiele lift,
  scroll-margin en geïsoleerde stacking, zodat routewissels minder abrupt
  voelen zonder routehooks of privacygrenzen te wijzigen.
- **G1892 Traject mobile reduced-motion route polish:** de mobiele Traject
  route-rail schakelt bij `prefers-reduced-motion` routekaarttransities en
  lift-transforms uit, terwijl actieve/focus-ringen en routegroepen zichtbaar
  blijven.
- **G1893 Traject mobile forced-colors route polish:** de mobiele Traject
  route-rail gebruikt in forced-colors systeemkleuren voor kaart, actieve
  route, focusring en density-indicator, zodat routegroep en actieve staat in
  high-contrast zichtbaar blijven.
- **G1894 Traject mobile forced-colors badge contrast:** mobiele Traject
  badges en cuepills hebben nu expliciete forced-colors contrastregels voor
  actieve en inactieve routekaarten, zodat statusbadges leesbaar blijven in
  high-contrast.
- **G1895 Traject mobile forced-colors cue spacing:** mobiele Traject
  badge- en cuepills hebben in forced-colors nu extra gap, min-height,
  padding en line-height, zodat de compacte routegroepen leesbaar blijven
  zonder crowding.
- **G1896 Traject mobile forced-colors label fit:** mobiele Traject
  routelabels krijgen in forced-colors expliciete ellipsis- en min-width
  regels naast begrensde badge- en cuepills, zodat lange labels niet tegen de
  statuspills drukken.
- **G1897 Traject mobile forced-colors active cue label:** de gepromoveerde
  actieve mobiele Traject-route krijgt in forced-colors eigen labelnadruk en
  begrensde cue-uitlijning, zodat label, badge en cue binnen de volle kaart
  duidelijk gescheiden blijven.
- **G1898 Traject mobile forced-colors active supporting text:** de
  gepromoveerde actieve mobiele Traject-route krijgt in forced-colors extra
  row-gap en expliciete supporting-text fit, zodat metatekst gescheiden blijft
  van label, badge en cue.
- **G1899 Traject mobile forced-colors active focus text:** de gepromoveerde
  actieve mobiele Traject-route houdt tijdens forced-colors keyboardfocus
  expliciete titel-, metatekst-, badge- en cuekleuren, zodat focus duidelijk
  blijft zonder tekstoverlap.
- **G1900 Traject mobile forced-colors focus cue spacing:** mobiele Traject
  routefocus krijgt in forced-colors extra gap, margin en outline-offset rond
  badge- en cuepills, zodat focus-outlines leesbaar blijven zonder crowding.
- **G1901 Traject mobile forced-colors inactive focus text:** inactieve
  gefocuste mobiele Traject-routekaarten houden titel, metatekst, badge en cue
  in expliciete forced-colors tekststaten zonder de actieve Highlight-staat na
  te bootsen.
- **G1902 Traject mobile forced-colors inactive focus cue fit:** inactieve
  gefocuste mobiele Traject badge- en cuepills krijgen expliciete
  forced-colors breedte- en ellipsisregels, zodat statuspills compact blijven
  zonder labels te verdringen.
- **G1903 Traject mobile forced-colors inactive focus cue rhythm:** inactieve
  gefocuste mobiele Traject badge- en cuepills krijgen expliciete
  forced-colors min-height, padding, line-height en cue-afstand, zodat compacte
  statuspills leesbaar blijven.
- **G1904 Traject mobile forced-colors inactive focus meta rhythm:** inactieve
  gefocuste mobiele Traject-metatekst krijgt expliciete forced-colors
  line-height, margin en fitregels, zodat metatekst gescheiden blijft van
  titels en statuspills.
- **G1905 Traject mobile forced-colors inactive focus label fit:** inactieve
  gefocuste mobiele Traject-titels krijgen expliciete forced-colors breedte-
  en ellipsisregels naast badgepills, zodat de labelkolom stabiel blijft
  tijdens keyboardfocus.
- **G1906 Traject mobile forced-colors inactive focus label weight:** inactieve
  gefocuste mobiele Traject-titels houden een rustiger forced-colors gewicht en
  geen underline, zodat keyboardfocus niet op actieve route-emphasis lijkt.
- **G1907 Traject mobile forced-colors inactive focus badge tone:** inactieve
  gefocuste mobiele Traject-badges houden Canvas/CanvasText systeemtonen en een
  rustiger gewicht, zodat status leesbaar blijft zonder actieve badge-styling te
  kopiëren.
- **G1908 Traject mobile forced-colors inactive focus cue tone:** inactieve
  gefocuste mobiele Traject-cues houden ButtonFace/ButtonText systeemtonen en
  een rustiger gewicht, zodat cue-informatie leesbaar blijft zonder actieve
  cue-styling te kopiëren.
- **G1909 Traject mobile forced-colors inactive focus cue border:** inactieve
  gefocuste mobiele Traject-cues houden expliciete solid systeemranden en
  ButtonText outlines, zodat cue-affordance duidelijk blijft zonder actieve
  route-outlines te kopiëren.
- **G1910 Traject mobile forced-colors inactive focus cue outline offset:**
  inactieve gefocuste mobiele Traject-cues gebruiken een compacte one-pixel
  outline-offset, zodat keyboardfocus leesbaar blijft zonder actieve
  route-spacing te kopiëren.
- **G1911 Traject mobile forced-colors inactive focus badge outline offset:**
  inactieve gefocuste mobiele Traject-badges gebruiken een compacte one-pixel
  outline-offset, zodat statusfocus leesbaar blijft zonder actieve
  route-spacing te kopiëren.
- **G1912 Traject mobile forced-colors inactive focus badge border style:**
  inactieve gefocuste mobiele Traject-badges gebruiken expliciete one-pixel
  solid systeemranden, zodat status-affordance voorspelbaar blijft in
  forced-colors mobile.
- **G1913 Traject mobile forced-colors inactive focus badge outline color:**
  inactieve gefocuste mobiele Traject-badges houden expliciete CanvasText
  outlines, zodat statusfocus leesbaar blijft zonder actieve route-outlinekleur
  te erven.
- **G1914 Traject mobile forced-colors inactive focus badge font weight:**
  inactieve gefocuste mobiele Traject-badges gebruiken een rustiger 740-gewicht,
  zodat statuslabels leesbaar blijven zonder actieve route-emphasis te kopiëren.
- **G1915 Traject mobile forced-colors inactive focus cue font weight:**
  inactieve gefocuste mobiele Traject-cues gebruiken een rustiger 700-gewicht,
  zodat cue-labels leesbaar blijven zonder met statusbadges of actieve
  route-emphasis te concurreren.
- **G1916 Traject mobile forced-colors inactive focus cue outline contrast:**
  inactieve gefocuste mobiele Traject-cues gebruiken CanvasText outlines, zodat
  de externe focusrand contrasteert met de route-canvaslaag na het lagere
  cuegewicht.
- **G1917 Traject mobile forced-colors inactive focus cue border contrast:**
  inactieve gefocuste mobiele Traject-cues houden CanvasText block- en
  inline-randen, zodat alle cue-zijden aansluiten op de externe focuscontrastlaag.
- **G1918 Traject mobile forced-colors inactive focus cue background contrast:**
  inactieve gefocuste mobiele Traject-cues houden ButtonFace als shorthand en
  longhand achtergrond, zodat cuecontrast voorspelbaar blijft naast ButtonText
  labels en CanvasText randen.
- **G1919 Traject mobile forced-colors inactive focus cue text contrast:**
  inactieve gefocuste mobiele Traject-cues pinnen WebKit tekstvulling op
  ButtonText, zodat cue-labels leesbaar blijven op ButtonFace achtergronden met
  CanvasText randen.
- **G1859 attachment-envelope forced-colors release evidence:** releasecontext in
  changelog en current state noemt `npm run smoke:routeflows`,
  `attachmentEnvelopeBatchForcedColorsEvidence` en
  `attachmentEnvelopeEvidencePrivacyPattern`, zodat payloadvrije
  forced-colors batch evidence traceerbaar blijft bij releasevoorbereiding.
- **G1945 embryo image classification forced-colors focus release evidence:**
  releasecontext in changelog en current state noemt `npm run smoke:routeflows`,
  `dossier-imaging-embryo-classification-review` en
  `embryoImageClassificationForcedColorsFocusEvidence`, zodat de forced-colors focuscontrole voor beeldtype, embryo-label, embryo-id en reviewstatus vindbaar blijft
  zonder beeldpayload of medische interpretatie.
- **G1946 supplement artscheck action release evidence:** releasecontext in
  changelog en current state noemt `npm run smoke:routeflows`,
  `daily-advice-supplement-artscheck-action`, `data-supplement-artscheck-action`,
  `recommendationAction=supplementArtscheck` en `dailyAdviceSupplementArtscheckAction`, zodat label, bron/disclaimer en actieknop gekoppeld blijven
  zonder dosering, interactieclaim of behandelvervanging.
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
  lint/format naast typecheck, tests, audit, build en externe-asset-scan; groene CI
  blijft de merge-gate.
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
- **G466-G1179 actieve autonome doelen:** de backlog bevat 101 open doelen voor centrale encrypted architectuur, Fertility Intelligence, research met PubMed query-preview en relevantie-onzekerheidslabel, daily recommendations met input-minimalisatie, vrouw-cyclusfasecontext, man-leefstijlcontext en policy regression fixtures, daily recommendations met vrouw- en man-dagkaart, timeline/knowledge graph, premium Claude Design UI en productkwaliteit; G959 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G960 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G961 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G962 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G963 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G964 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G965 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G966 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G967 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G968 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G969 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G970 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G971 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G972 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G973 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G974 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G975 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G976 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G977 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G978 is afgerond met attachment assistive delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G979 is afgerond met attachment assistive cleanup-archive-receipt-export privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G980 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G981 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G982 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G983 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G984 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G985 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G986 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G987 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G988 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G989 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G990 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G991 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G992 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G993 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G994 is afgerond met attachment assistive cleanup-archive-receipt-export-delivery-handoff-confirmation privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G995 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G996 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G997 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G998 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G999 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1000 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1001 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1002 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1003 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1004 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1005 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1006 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1007 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1008 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1009 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1010 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1011 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1012 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1013 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1014 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1015 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1016 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1017 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1018 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1019 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1020 is afgerond met cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit privacy statebewaking zonder zoekterm, bronbestandsnaam, OCR-tekst of medische payload; G1021 staat open voor cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail privacy statebewaking; G466 is afgerond met een historische dossierimport-inbox met veilige bestandsmetadata, importstatus en verwijderactie, G467 met OCR-confidence en reviewstatus voordat OCR-tekst metadata voedt, G468 met genormaliseerde dossiermetadata voor datum, bron, documenttype, onderzoekstype, poging, afspraak en onzekerheid, G469 met concept-tijdlijnreconstructie uit historische dossierrecords inclusief bron, datumconfidence en datumconflict, G471 met expliciete imaging-metadata voor beeldsoort, poging, afspraak, EXIF-isolatiestatus en reviewstatus, G489 met een supplementboundary en artscheck-label, G491 met centrale sessie-renewalstatus zonder plaintext fallback, G492 met owner-scoped recordpaginatie voor centrale encrypted envelopes, G493 met een encrypted attachment envelope contract, G494 met een centrale attachment/envelope size-limit policy, G495 met record replay-protection metadata, G496 met een centrale dataset bootstrap smoke-runner, G501 met multi-device unlock copy consistency tegen ontbrekende sleutelmetadata, G510 met een ziekenhuisdocument type-taxonomie, G517 met locked imaging placeholders, G521 met consultnotitie-tekstimportmetadata, G526 met een canonieke Kiempad embryo-ID per poging, G528 met embryo-kwaliteit bronlabelreview in de dossier-UI, G555 met een Claude Design dossierimport-inbox-overview zonder inhoudslekken, G807 met regressiebewaking van dossierinbox-states zonder payloadlekken, G808 met imaging-compare empty, multiple en locked statebewaking zonder payloadlekken, G809 met consult intelligence review statebewaking zonder uploadpayloadlekken, G810 met daily recommendation dual-owner statebewaking zonder dosering of trackingpayload, G811 met research trenddashboard statebewaking zonder trackingpayload of providerpayload, G812 met fertility timeline unified statebewaking zonder raw payloads in de itemlijst, G813 met knowledge graph relationship statebewaking zonder raw payloads in de relatielijst, G814 met AI-preview en on-device opt-in statebewaking zonder API-sleutel of providerpayload, G815 met notificatieprivacy statebewaking zonder lockscreen-payload, G816 met backup/import privacy statebewaking zonder plaintext export- of importpayload, G817 met WebAuthn/recovery privacy statebewaking zonder authenticatorpayload, G818 met fallback notification en log privacy statebewaking zonder eventpayload, G819 met import/status feedback privacy statebewaking zonder bronpayload, G820 met settings/privacy feedback statebewaking zonder configuratiepayload, G821 met central sync/conflict privacy statebewaking zonder sessie- of recordpayload, G822 met upload attachment privacy statebewaking zonder broninhoud of attachmentpayload, G823 met attachment preview/delete privacy statebewaking zonder locked bronpayload, G824 met attachment reviewmetadata statebewaking zonder OCR- of bronpayload, G825 met attachment consent/export privacy statebewaking zonder bron- of exportpayload, G826 met attachment retention/cleanup privacy statebewaking zonder bron- of beheerpayload, G827 met attachment audit trail privacy statebewaking zonder bron- of eventpayload, G828 met attachment search/filter privacy statebewaking zonder zoekterm- of bronpayload, G829 met attachment sort/pagination privacy statebewaking zonder lijst- of bronpayload, G830 met attachment bulk selection privacy statebewaking zonder selectie- of bronpayload, G831 met attachment keyboard/focus privacy statebewaking zonder focus- of bronpayload, G832 met attachment responsive/reduced-motion privacy statebewaking zonder responsive- of bronpayload, G833 met attachment loading/error privacy statebewaking zonder fout- of bronpayload, G834 met attachment share/handoff privacy statebewaking zonder handoff- of bronpayload, G835 met attachment print/clinician packet privacy statebewaking zonder print- of bronpayload, G836 met attachment accessibility audit privacy statebewaking zonder accessibility- of bronpayload, G837 met attachment landmark navigation privacy statebewaking zonder landmark- of bronpayload, G838 met attachment screenreader announcement privacy statebewaking zonder announcement- of bronpayload, G839 met attachment assistive summary privacy statebewaking zonder assistive-summary- of bronpayload, G840 met attachment assistive error recovery privacy statebewaking zonder recovery- of bronpayload, G841 met attachment assistive recovery completion privacy statebewaking zonder completion- of bronpayload, G842 met attachment assistive recovery history privacy statebewaking zonder history- of bronpayload, G843 met attachment assistive recovery archive privacy statebewaking zonder archive- of bronpayload, G844 met attachment assistive recovery archive expiry privacy statebewaking zonder expiry- of bronpayload, G845 met attachment assistive recovery archive purge privacy statebewaking zonder purge- of bronpayload, G846 met attachment assistive recovery archive purge receipt privacy statebewaking zonder receipt- of bronpayload, G847 met attachment assistive recovery archive purge receipt export privacy statebewaking zonder receipt-export- of bronpayload, G848 met attachment assistive recovery archive purge receipt export delivery privacy statebewaking zonder delivery- of bronpayload, G849 met attachment assistive recovery archive purge receipt export delivery handoff privacy statebewaking zonder handoff- of bronpayload, G850 met attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy statebewaking zonder confirmation- of bronpayload, G851 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy statebewaking zonder confirmation-receipt- of bronpayload, G852 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder confirmation-receipt-audit- of bronpayload, G853 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder audit-trail- of bronpayload, G854 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder retention- of broninhoud, G855 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder expiry- of bronpayload, G856 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder cleanup- of bronpayload, G857 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive- of bronpayload, G858 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder archive-receipt- of bronpayload, G859 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder receipt-export- of bronpayload, G860 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder export-delivery- of bronpayload, G861 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder delivery-handoff- of bronpayload, G862 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder handoff-confirmation- of bronpayload, G863 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder confirmation-receipt- of bronpayload, G864 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder confirmation-receipt-audit- of bronpayload, G865 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder confirmation-receipt-audit-trail- of bronpayload, G866 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder retention- of broninhoud, G867 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder retention-expiry- of bronpayload, G868 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder retention-expiry-cleanup- of bronpayload, G869 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder retention-expiry-cleanup-archive- of bronpayload, G870 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt- of bronpayload, G871 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export- of bronpayload, G872 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery- of bronpayload, G873 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff- of bronpayload, G874 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation- of bronpayload, G875 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt- of bronpayload, G876 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit- of bronpayload, G877 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail- of bronpayload, G878 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention- of bronpayload, G879 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry- of bronpayload, G880 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup- of bronpayload, G881 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive- of bronpayload, G882 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt- of bronpayload, G883 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export- of bronpayload, G884 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery- of bronpayload, G885 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff- of bronpayload, G886 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation- of bronpayload, G887 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt- of bronpayload, G888 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit- of bronpayload, G889 met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail- of bronpayload, G537 met een knowledge-graph privacyboundary tegen raw payload-lekkage, G539 met research source allowlist-rationale in de kennis-UI, G551 met een artscheck-actieknop voor dagelijkse aanbevelingen, G587 met een dedicated centrale bootstrap smoke in CI, G588 met missing-key-metadata herstelstatus in de app-shell, G589 met gestructureerde bootstrap smoke failurediagnostics, G590 met een runbookmatrix per bootstrapfase, G591 met brede redaction-regressie voor bootstrap diagnostics, G592 met een runtime-exception fixture voor gesanitized bootstrap diagnostics, G593 met een centrale diagnostic injection registry, G594 met registry-gedreven runbookdriftcontrole, G595 met een gesanitized CI-summary van diagnostic registrydekking, G596 met een strikte JSON-schema guard voor die summary, G597 met een reviewbare inline snapshotfixture, G598 met runbookreviewregels voor snapshotdrift, G599 met een fixture die die reviewregel op veilige registryvelden begrenst, G600 met een geconsolideerde governancevolgorde voor bootstrap diagnostics, G601 met een afvinkbare governancechecklist, G602 met een expliciete CI-freshness gate, G603 met bron-specifieke faaldiagnostics, G604 met een reviewbare docsnapshot van succesvolle freshness-output, G605 met een release/state guard, G606 met een gedeeld `bootstrap-governance-freshness` veldcontract voor sourcevelden `runbookChecklist`, `registryReference` en `ciStep` plus coveragevelden `registry`, `schemaGuard`, `snapshot`, `runbookReview` en `ciStep`, G607 met `schemaValidation` voor onbekende source- en coveragevelden, G608 met een runbookvoorbeeld voor schemafouten met `unknownSourceFieldCount` en `unknownCoverageFieldCount` zonder gevoelige inhoud, G609 met een release/state guard die `schemaValidation`, `unknownSourceFieldCount` en `unknownCoverageFieldCount` in changelog en state bewaakt, G610 met een gesanitized `ciAnnotation` voor `bootstrap-governance-freshness` schemafouten, G611 met een release/state guard die `ciAnnotation` naast `schemaValidation` bewaakt, G612 met een exacte annotatiecontractkoppeling voor `bootstrap-governance-freshness schemaValidation failed: unknownSourceFieldCount=1 unknownCoverageFieldCount=1`, G613 met gedeeld `schemaFailureAnnotationTemplate` voor script en tests, G614 met runbookdocumentatie over die templatecontractbron, G615 met placeholderbewaking voor `{gate}`, `{unknownSourceFieldCount}` en `{unknownCoverageFieldCount}`, G616 met runbookdocumentatie dat alleen deze placeholders zijn toegestaan, G617 met release/state-bewaking voor die placeholdertermen, G618 met één helper voor bootstrap governance releasecontext, G619 met een negatieve helperfixture voor ontbrekende releasecontexttermen, G620 met compacte termlijstconstanten voor releasecontext, G621 met een reviewbaar termsetcontract, G622 met runbookdocumentatie over releasecontextbewaking voor schemafoutvelden en placeholders, G623 met release-statebewaking van deze runbookcontext, G624 met gedeelde runbookcontexttermset in runbook- en releasecontractguards, G625 met expliciete redaction guard op die termset, G626 met release-statebewaking van deze redactioncontext, G627 met een negatieve fixture voor ontbrekende redactioncontexttermen, G628 met een compact contract rond de exacte redactioncontext-failuretekst, G629 met release-statebewaking van dit failuretekstcontract, G630 met een negatieve fixture rond ontbrekende failuretekstcontract-releasecontext, G631 met een compact contract rond deze missing-term melding, G632 met release-statebewaking van dit missing-term contract, G633 met een negatieve fixture rond ontbrekende missing-term contractreleasecontext, G634 met een compact contract rond deze contractreleasecontextmelding, G635 met release-statebewaking van dit contractreleasecontextmeldingscontract, G636 met een negatieve fixture rond ontbrekende contractreleasecontextmelding-releasecontext, G637 met runbookdocumentatie van dit contractreleasecontextmeldingscontract, G638 met release-statebewaking van deze contractreleasecontextmelding-releasecontexttermset-runbooknotitie, G639 met een negatieve fixture rond ontbrekende runbooknotitie-releasecontext, G640 met een compact contract rond deze runbooknotitie-releasecontext missing-term melding, G641 met release-statebewaking van dit runbooknotitie-missing-term contract, G642 met een negatieve fixture rond ontbrekende runbooknotitie-missing-term contractreleasecontext, G643 met een compact contract rond deze runbooknotitie-contractmissingterm melding, G644 met release-statebewaking van dit runbooknotitie-contractmissingterm contract, G645 met een negatieve fixture rond ontbrekende runbooknotitie-contractmissingterm contractreleasecontext, G646 met een compact contract rond deze runbooknotitie-contractmissingterm missing-term melding, G647 met release-statebewaking van dit runbooknotitie-contractmissingterm contractmissingterm contract, G648 met een negatieve fixture rond ontbrekende runbooknotitie-contractmissingterm contractmissingterm contractreleasecontext, G649 met een compact contract rond deze runbooknotitie-contractmissingterm contractmissingterm missing-term melding, G650 met release-statebewaking van dit runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contract, G651 met een negatieve fixture rond ontbrekende runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractreleasecontext, G652 met een compact contract rond deze runbooknotitie-contractmissingterm contractmissingterm contractmissingterm missing-term melding, G653 met release-statebewaking van dit runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm contract, G654 met een negatieve fixture rond ontbrekende runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm contractreleasecontext, G655 met een compact contract rond deze runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm missing-term melding, G656 met release-statebewaking van dit runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm contractmissingterm contract, G657 met een negatieve fixture rond ontbrekende runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm contractmissingterm contractreleasecontext, G658 met een compact contract rond deze runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm contractmissingterm missing-term melding, G659 met release-statebewaking van `Bootstrap governance releasecontext ontbreekt voor termen: runbooknotitie-contractmissingterm contractmissingterm contractmissingterm contractmissingterm contractmissingterm contract`, G660 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontext, G661 met een compact contract rond deze release-state-foutmeldingcontext missing-term melding, G662 met release-statebewaking van `release-state-foutmeldingcontext missing-term melding`, G663 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontext, G664 met een compact contract rond deze release-state-foutmeldingcontextmelding missing-term melding, G665 met release-statebewaking van `release-state-foutmeldingcontextmelding missing-term melding`, G666 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontext, G667 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmelding missing-term melding, G668 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmelding missing-term melding`, G669 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext, G670 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding, G671 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G672 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext, G673 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding, G674 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding`, G675 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G676 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G677 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G678 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G679 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G680 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G681 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G682 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G683 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G684 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext. G685 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G686 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding`. G687 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G688 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding. G689 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G690 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G691 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G692 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding`. G693 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G694 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G695 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G696 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G697 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G698 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G699 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G700 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G701 met release-statebewaking van `release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding` en G702 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G703 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G704 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G705 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G706 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G707 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G708 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G709 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G710 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G711 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G712 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G713 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G714 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G715 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G716 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding, G717 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G718 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G719 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G720 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G721 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G722 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G723 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G724 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G725 met release-statebewaking van deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G726 met een negatieve fixture rond ontbrekende release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext en G727 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G728 met release-statebewaking van deze technische foutmelding en G729 met een negatieve fixture rond ontbrekende release-statecontexttermen en G730 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding en G731 met release-statebewaking van deze technische foutmelding en G732 met een negatieve fixture rond ontbrekende release-statecontexttermen en G733 met een compact contract rond deze release-state-foutmeldingcontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontextmeldingreleasecontext missing-term melding, G734 met release-statebewaking van deze technische foutmelding en G735 met een negatieve fixture rond ontbrekende release-statecontexttermen en G736 met een compact contract rond deze technische foutmelding en G737 met release-statebewaking van deze technische foutmelding en G738 met een negatieve fixture rond ontbrekende release-statecontexttermen en G739 met een compact contract rond deze technische foutmelding en G740 met release-statebewaking van deze technische foutmelding en G741 met een negatieve fixture rond ontbrekende release-statecontexttermen en G742 met een compact contract rond deze technische foutmelding en G743 met release-statebewaking van deze technische foutmelding en G744 met een negatieve fixture rond ontbrekende release-statecontexttermen en G745 met een compact contract rond deze technische foutmelding en G746 met release-statebewaking van deze technische foutmelding en G747 met een negatieve fixture rond ontbrekende release-statecontexttermen, G748 met een compact contract rond deze technische foutmelding, G749 met release-statebewaking van deze technische foutmelding, G750 met een negatieve fixture rond ontbrekende release-statecontexttermen, G751 met een compact contract rond deze technische foutmelding, G752 met release-statebewaking van deze technische foutmelding, G753 met een negatieve fixture rond ontbrekende release-statecontexttermen en G754 met een compact contract rond deze technische foutmelding, G755 met release-statebewaking van deze technische foutmelding, G756 met een negatieve fixture rond ontbrekende release-statecontexttermen, G757 met een compact contract rond deze technische foutmelding, G758 met release-statebewaking van deze technische foutmelding, G759 met een negatieve fixture rond ontbrekende release-statecontexttermen en G760 met een compact contract rond deze technische foutmelding. G761 staat open voor release-statebewaking van deze technische foutmelding, G762 is afgerond met een privacyveilige support-handoff voor missing-key-metadata herstelstatus, G763 is afgerond met een expliciet support-handoff copycontract, G764 is afgerond met een herbruikbare support-handoff contracthelper, G765 is afgerond met rollout naar unlock-error handoffs, G766 is afgerond met generieke unlock-error copy-redaction, G767 is afgerond met een expliciete unlock-error copy regressiefixture, G768 is afgerond met thema-toegankelijkheidsbewaking rond unlock-error herstelstatus, G769 is afgerond met een compact unlock-error alertstructuurcontract, G770 is afgerond met negatieve structuurfixtures, G771 is afgerond met een expliciete foutmelding-redaction guard, G772 is afgerond met herbruikbare contractfoutmelding-helperdekking, G773 is afgerond met recovery contract helper naming cleanup, G774 is afgerond met een broncodeguard tegen helpernaamdrift, G775 is afgerond met een documentatiecontract rond de recovery-contract helpernaamgrens, G776 is afgerond met releasecontextbewaking van deze docsafspraak, G777 is afgerond met een negatieve fixture rond ontbrekende releasecontexttermen, G778 is afgerond met een compact foutmeldingcontract rond de recovery-helper releasecontext missing-term melding, G779 is afgerond met release-statebewaking van deze foutmeldingcontext, G780 is afgerond met een negatieve fixture rond ontbrekende release-state foutmeldingcontexttermen, G781 is afgerond met een compact foutmeldingcontract rond de recovery-helper release-state missing-term melding, G782 is afgerond met release-statebewaking van deze foutmeldingcontext, G783 is afgerond met een negatieve fixture rond ontbrekende release-state errorcontexttermen, G784 is afgerond met een compact messagecontract rond deze recovery-helper release-state errorcontext missing-term melding, G785 is afgerond met release-statebewaking van deze messagecontext, G786 is afgerond met een negatieve fixture rond ontbrekende release-state messagecontexttermen, G787 is afgerond met een compact contract rond deze recovery-helper release-state messagecontext missing-term melding, G788 is afgerond met release-statebewaking van deze foutmeldingcontext, G789 is afgerond met een negatieve fixture rond ontbrekende recovery-helper release-state message-foutmeldingcontexttermen, G790 is afgerond met een compact contract rond deze recovery-helper release-state message-foutmeldingcontext missing-term melding, G791 is afgerond met release-statebewaking van deze contractcontext, G792 is afgerond met een negatieve fixture rond ontbrekende recovery-helper release-state message-foutmeldingcontext contractcontexttermen, G793 is afgerond met een compact contract rond deze recovery-helper release-state message-foutmeldingcontext contractcontext missing-term melding, G794 is afgerond met release-statebewaking van deze contractcontext, G795 is afgerond met een negatieve fixture rond ontbrekende recovery-helper release-state message-foutmeldingcontext contractcontext releasecontexttermen, G796 is afgerond met een compact contract rond deze recovery-helper release-state message-foutmeldingcontext contractcontext releasecontext missing-term melding, G797 is afgerond met release-statebewaking van deze contractcontext, G798 is afgerond met een negatieve fixture rond ontbrekende releasecontextcontracttermen, G799 is afgerond met een compact contract rond deze recovery-helper release-state message-foutmeldingcontext contractcontext releasecontext releasecontextcontract missing-term melding, G800 is afgerond met release-statebewaking van deze contractcontext, G801 is afgerond met een negatieve fixture rond ontbrekende releasecontextcontract-releasecontexttermen, G802 is afgerond met een compact contract rond deze recovery-helper release-state message-foutmeldingcontext contractcontext releasecontext releasecontextcontract releasecontext missing-term melding, G803 is afgerond met release-statebewaking van deze contractcontext, G804 is afgerond met een negatieve fixture rond ontbrekende releasecontextcontract-releasecontext releasecontexttermen, G805 is afgerond met een compact contract rond deze recovery-helper release-state message-foutmeldingcontext contractcontext releasecontext releasecontextcontract releasecontext contractcontext missing-term melding en G806 staat open voor release-statebewaking van deze contractcontext en G890 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder retention- of broninhoud, G891 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder retention-expiry- of broninhoud, G892 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder retention-expiry-cleanup- of broninhoud, G893 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder retention-expiry-cleanup-archive- of broninhoud, G894 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt- of broninhoud, G895 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export- of broninhoud, G896 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery- of broninhoud, G897 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff- of broninhoud, G898 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation- of broninhoud, G899 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt- of broninhoud, G900 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit- of broninhoud, G901 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail- of broninhoud, G902 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder retention- of broninhoud, G903 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder retention-expiry- of broninhoud, G904 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder retention-expiry-cleanup- of broninhoud, G905 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder retention-expiry-cleanup-archive- of broninhoud, G906 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt- of broninhoud, G907 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export- of broninhoud, G908 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery- of broninhoud, G909 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff- of broninhoud, G910 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation- of broninhoud, G911 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy statebewaking zonder retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud, G912 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder confirmation-receipt-audit-broninhoud, G913 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder confirmation-receipt-audit-trail-broninhoud, G914 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder confirmation-receipt-audit-trail-retention-broninhoud, G915 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder confirmation-receipt-audit-trail-retention-expiry-broninhoud, G916 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud, G917 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud, G918 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-broninhoud, G919 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud, G920 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud, G921 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff privacy statebewaking zonder delivery-handoff-broninhoud, G922 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy statebewaking zonder delivery-handoff-confirmation-broninhoud, G923 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-broninhoud, G924 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-broninhoud, G925 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-broninhoud, G926 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud, G927 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud, G928 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud, G929 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud, G930 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-broninhoud, G931 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud, G932 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud, G933 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud, G934 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud, G935 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud, G936 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud, G937 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud, G938 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud, G939 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud, G940 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud, G941 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud, G942 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud, G943 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud, G944 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud, G945 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud, G946 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud, G947 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud, G948 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud, G949 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud, G950 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud, G951 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G952 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G953 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G954 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-broninhoud; G955 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G956 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud; G957 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud; G958 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G959 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G960 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G961 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G962 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G963 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G964 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G965 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G966 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-broninhoud; G967 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G968 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud; G969 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud; G970 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G971 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G972 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G973 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G974 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G975 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G976 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G977 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G978 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G979 is afgerond met attachment assistive recovery archive purge receipt export privacy statebewaking zonder cleanup-archive-receipt-export-broninhoud; G980 is afgerond met attachment assistive recovery archive purge receipt export delivery privacy statebewaking zonder cleanup-archive-receipt-export-delivery-broninhoud; G981 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-broninhoud; G982 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G983 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G984 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G985 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G986 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G987 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G988 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G989 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G990 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G991 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G992 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud; G993 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud; G994 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G995 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G996 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G997 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G998 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G999 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G1000 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G1001 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G1002 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G1003 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G1004 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud; G1005 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud; G1006 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G1007 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G1008 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G1009 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G1010 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G1011 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G1012 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G1013 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G1014 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G1015 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G1016 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud; G1017 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud; G1018 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G1019 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G1020 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G1021 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G1022 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G1023 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G1024 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G1025 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G1026 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G1027 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-broninhoud; G1028 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-broninhoud; G1029 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-broninhoud; G1030 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-broninhoud; G1031 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-broninhoud; G1032 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-broninhoud; G1033 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-broninhoud; G1034 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-broninhoud; G1035 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-broninhoud; G1036 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-broninhoud; G1037 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G474 is afgerond met imaging-tijdlijn privacy boundary voor locked labels, encrypted-dataset previewstatus en centrale opslag zonder plaintext thumbnails; G475 is afgerond met consult transcript import en bronkoppeling voor tekst-, PDF- en afbeeldingsconsulten met afspraak-, traject-, poging-, auteur- en contextmetadata; G1049 is afgerond met attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive privacy statebewaking zonder cleanup-archive-receipt-export-delivery-handoff-confirmation-receipt-audit-trail-retention-expiry-cleanup-archive-broninhoud; G1050 staat open voor attachment assistive recovery archive purge receipt export delivery handoff confirmation receipt audit trail retention expiry cleanup archive receipt privacy statebewaking; G1051 staat open voor imaging timeline privacy audit evidence; G1052 staat open voor consult transcript source audit evidence; G532 is afgerond met relationship edge provenance voor graph-relaties; G481 is afgerond met een research source registry met opt-invereiste en geen-netwerk-zonder-opt-in metadata; G483 is afgerond met scientificSummary, patientSummary en sourceCitation voor researchpublicaties; G484 is afgerond met research-contextmatch voor gekoppelde factoren, ontbrekende gegevens en artsbespreek-taal; G486 is afgerond met een vrouw-dagkaart met bronherleiding, supplement-artscheck en cycluscontext; G487 is afgerond met een man-dagkaart met bronherleiding, eigenaarlabel, datum, reden en supplement-artscheck; G540 is afgerond met een PubMed query preview zonder dossierplaintext, met allowlist-zoektermen, bron, datum en reviewstatus; G544 is afgerond met researchrelevantie-uitleg, onzekerheidslabel, bronpad, datum en reviewstatus. G547 is afgerond met dagadvies input-minimalisatie, bron, datum, reviewstatus, gebruikte inputcategorieen, uitgesloten inputcategorieen en correctievelden. G548 is afgerond met vrouw-cyclusfasecontext, bron, datum, reviewstatus, status, fase- en metinglabels, bronpad en correctievelden. G549 is afgerond met man-leefstijlcontext, bron, datum, reviewstatus, status, contextlabels, bronpad en correctievelden. G554 is afgerond met daily recommendation policy regression fixtures voor bron, datum, reviewstatus, correctievelden en verboden patronen. G503 is afgerond met een publieke read-only centrale API-healthcheck met alleen technische privacygrensmetadata, expliciete emptyState en foutstatussen zonder user-id, session-id, record-id, recordcount, ciphertext, secrets of medische plaintext. G1078 is afgerond met runbook-audit evidence en onderhoudstests die het health-contract, verplichte technische velden en verboden lekvelden synchroon houden. G1079 is afgerond met Tailscale smoke-evidence voor /api/health via lokale proxy en optionele tailnet-HTTPS-route zonder responsebody te loggen. G1080 is afgerond met contractVersion=1 in de centrale health-response en bijbehorende API-, runtime-, runbook-, Tailscale- en onderhoudstests. G1081 is afgerond met een health-contractmigratienotitie voor contractVersion-wijzigingen, compatibilityregel, deployvolgorde en veilige monitorfailure zonder responsebody of privacygevoelige velden te loggen. G1082 is afgerond met een monitorcompatibiliteitsfixture/testhelper die contractVersion=1 valideert, version/field/errorstate-drift detecteert en alleen gesanitized foutlabels teruggeeft. G1083 is afgerond met runbook-evidence voor veilige monitorfailure-output, toegestane foutlabels, verboden responsebodylogging en herstelstappen via contractVersion review plus lokale en tailnet-HTTPS health-smokes. G1084 is afgerond met een vaste CI-annotatiehelper voor central health monitor failures met alleen technische failurelabels en herstelhint voor version-, field- en errorstate-drift. G1085 is afgerond met centrale annotatiecontractconstanten en driftbewaking die runbookterm, helperoutput en testfixture synchroon houdt. G1086 is afgerond met een central health monitor annotatie-CLI-fixture die success en driftfixtures omzet naar gesanitized annotatie-uitvoer zonder responsebody of privacygevoelige waarden. G1087 is afgerond met een CI health-monitor annotatie-smoke die na de centrale bootstrap smoke draait en dezelfde gesanitized fixture gebruikt. G1088 is afgerond met failure-artifact evidence voor driftlabels en verboden privacytermen in PRs, issues en CI-artifacts. G1089 is afgerond met retention- en cleanupregels voor health-monitor failure-artifacts in PRs, issues, lokale kopieen en GitHub CI-artifacts. G1090 is afgerond met health-monitor retention audit evidence in de goal-completion-audit voor PR-comments, issuecomments, lokale kopieen en GitHub CI-artifacts. G1091 is afgerond met driftbewaking tussen runbook-retentionregels en de goal-completion-audit voor cleanup- en forbidden-evidence termen. G1092 is afgerond met een compacte inline CI-evidence snapshot die runbook, goal-completion-audit en maintenance-test als bronnen noemt. G1093 is afgerond met snapshot freshness guardrails in runbook, goal-completion-audit en maintenance-tests voor bewuste termdrift. G1094 is afgerond met releasecontext-evidence in changelog en current-state voor snapshot freshness, runbook, goal-completion-audit en maintenance-test. G1095 is afgerond met een compacte missing-term fixture voor health-monitor retention freshness releasecontext zonder privacygevoelige evidence. G1096 is afgerond met release-state bewaking voor de G1095 missing-term fixture en health-monitor retention freshness releasecontext. G1097 is afgerond met een compacte release-state missing-term fixture voor het health-monitor retention freshness releasecontext-label. G1098 is afgerond met een compact contract voor de exacte health-monitor retention release-state missing-term melding. G1099 is afgerond met releaseguard-bewaking voor het G1098 health-monitor retention compacte contract met veilige technische labels. G1100 is afgerond met een compacte missing-term fixture voor ontbrekende compact-contract releaseguard-termen. G1101 is afgerond met een compact contract voor de exacte health-monitor retention compact-contract releaseguard missing-term melding. G1102 is afgerond met releaseguard-bewaking voor het G1101 health-monitor retention compact-contract missing-term-contract met veilige technische labels. G1103 is afgerond met een compacte missing-term fixture voor ontbrekende compact-contract missing-term releaseguard-termen. G1104 is afgerond met een compact contract voor de exacte health-monitor retention compact-contract missing-term releaseguard foutmelding. G1105 is afgerond met releaseguard-bewaking voor het G1104 health-monitor retention compact-contract missing-term releaseguard foutmeldingcontract met veilige technische labels. G1106 is afgerond met een compacte missing-term fixture voor ontbrekende compact-contract missing-term-contract releaseguard-termen. G1107 is afgerond met een compact contract voor de exacte health-monitor retention compact-contract missing-term-contract releaseguard foutmelding. G1108 is afgerond met releaseguard-bewaking voor het G1107 health-monitor retention compact-contract missing-term-contract releaseguard foutmeldingcontract met veilige technische labels. G1109 is afgerond met een compacte missing-term fixture voor ontbrekende missing-term-contract releaseguard-termen. G1110 is afgerond met een compact contract voor de exacte health-monitor retention missing-term-contract releaseguard foutmelding. G1111 is afgerond met releaseguard-bewaking voor het G1110 health-monitor retention missing-term-contract releaseguard foutmeldingcontract met veilige technische labels. G1112 is afgerond met een compacte missing-term fixture voor ontbrekende missing-term-contract compact-contract releaseguard-termen. G1113 is afgerond met een compact contract voor de exacte health-monitor retention missing-term-contract compact releasecontext foutmelding. G1114 is afgerond met releaseguard-bewaking voor het G1113 health-monitor retention missing-term-contract compact releasecontext foutmeldingcontract met veilige technische labels. G1115 is afgerond met een compacte missing-term fixture voor ontbrekende missing-term-contract compact contract-releaseguard-termen. G1116 is afgerond met een compact contract voor de exacte health-monitor retention missing-term-contract compact releaseguard foutmelding. G1117 is afgerond met releaseguard-bewaking voor het G1116 health-monitor retention missing-term-contract compact releaseguard foutmeldingcontract met veilige technische labels. G1118 is afgerond met een compacte missing-term fixture voor ontbrekende missing-term-contract compact contract-releaseguard compact-contract releaseguard-termen. G1119 is afgerond met een compact contract voor de exacte health-monitor retention missing-term-contract compact contract releaseguardcontext foutmelding. G1120 is afgerond met releaseguard-bewaking voor het G1119 health-monitor retention missing-term-contract compact contract releaseguardcontext foutmeldingcontract met veilige technische labels. G1121 is afgerond met een compacte missing-term fixture voor ontbrekende health-monitor retention missing-term-contract compact contract releaseguardcontext foutmelding- en veilige-technische-labels termen. G1122 is afgerond met een compact contract voor de exacte health-monitor retention missing-term-contract compact contract compact releaseguardcontext foutmelding. G1123 is afgerond met releaseguard-bewaking voor het G1122 health-monitor retention missing-term-contract compact contract compact releaseguardcontext foutmeldingcontract met veilige technische labels. G1124 is afgerond met een compacte missing-term fixture voor ontbrekende health-monitor retention missing-term-contract compact contract compact releaseguardcontext foutmelding- en veilige-technische-labels termen. G556 is afgerond met een compacte imaging repository compare layout met twee scanbare beeldmomentkaarten, rustige empty-state en veilige previewstatus zonder beeldpayloadlekken. G1126 is afgerond met een compact dossierstartoverzicht voor uploads, beeldreview en OCR-review, primaire snelacties en responsive guards voor de primaire dossierflow zonder payloadlekken. G1127 is afgerond met een compacte progressive disclosure voor secundaire dossierprivacy-, audit- en assistive-panelen zonder bestaande privacyhooks of payloadgrenzen te breken. G1128 is afgerond met een compacte dossierinhoudsindex met ankers naar consulten, imaging, dossierindex, embryo-dossiers, documenttijdlijn en behandelgeschiedenis zonder payloadlekken. G1129 is afgerond met compacte dossierupload-subsecties voor documentbasis, koppelingen, beeldcontext en embryo/labcontext zonder formcontracten of privacyhooks te breken. G1130 is afgerond met compacte consult- en embryo-subformuliergroepen voor consultbasis, koppelingen, broncontext, embryobeoordeling en statuscontrole zonder inputcontracten of privacyhooks te breken. G1131 is afgerond met een compacte dossier-toevoegroute-selector naar documentupload, consultverslag, embryokwaliteit en embryo-status zonder ankers of privacyhooks te breken. G1132 is afgerond met gefocuste routepanelen rond de toevoegformulieren die de gekozen anchor-route visueel prioriteren zonder formuliercontracten te verbergen. G1133 is afgerond met compacte readiness-cues per toevoegroute voor documentupload, consultverslag, embryokwaliteit en embryo-status zonder privacygevoelige data te tonen. G1134 is afgerond met compactere tweekoloms mobiele routekaarten en kortere spacing zonder cues, ankers of privacyhooks te verliezen. G1135 is afgerond met taakgerichte routecopy voor document toevoegen, consult vastleggen, labkwaliteit en status bijwerken met korte readiness-cues. G1136 is afgerond met een actieve route-affordance voor de dossier-toevoegselector die de gekozen anchorroute markeert en niet-actieve routekaarten rustiger maakt. G1137 is afgerond met een duidelijke keyboardfocus-ring voor toevoegroutekaarten die losstaat van hover en actieve route-state. G1138 is afgerond met screenreader-veilige actieve routecontext per target-route zonder visuele ruis. G1139 is afgerond met een compacte routewissel-herstelhint die verkeerd gekozen toevoegroutes corrigeerbaar maakt. G1140 is afgerond met conceptveiligheids-microcopy dat invoer lokaal blijft tot expliciet uploaden of bewaren. G1141 is afgerond met een compacte scanbare route-microcopygroep voor herstel- en conceptzekerheid. G1142 is afgerond met compacte taakcontext bij de eerste dossierdocument-uploadstap. G1143 is afgerond met compacte verplichte-veldcues in de dossier-toevoegformulieren. G1144 is afgerond met visueel secundaire optional-contextgroepen in de dossier-toevoegflow. G1145 is afgerond met compactere spacing voor dossier-toevoegsecties op mobiel, tablet en desktop. G1146 is afgerond met route-specifieke primaire submitacties in de dossier-toevoegflow. G1147 is afgerond met routegerichte post-submit feedback direct onder de submitacties. G1148 is afgerond met compacte toonverschillen voor dossier-feedbackstatussen. G1149 is afgerond met korte gestandaardiseerde inline feedbackcopy zonder payloadtekst. G1150 is afgerond met compacte recovery hints bij review- en foutstates. G1151 is afgerond met privacyveilige route- en statuslabels voor inline feedback. G1152 is afgerond met rustige aria-live en atomic configuratie voor inline feedback. G1153 is afgerond met vaste announcement-order metadata voor inline feedback. G1154 is afgerond met compacte focus-return cues bij review- en foutfeedback. G1155 is afgerond met duidelijke focus-visible cues voor feedback focus-return links. G1156 is afgerond met compacte hersteldoelbevestiging in review- en foutfeedback. G1157 is afgerond met compacte next-action chips voor recovery hints. G1158 is afgerond met expliciete microcopy-volgorde-hooks voor dossier-submitfeedback. G1159 is afgerond met compacter feedbackritme voor dossier-submitfeedback. G1160 is afgerond met een compactere touch target voor feedback focus-return links. G1161 is afgerond met rustige hover- en active-tonen voor feedback focus-return links. G1162 is afgerond met centrumvaste pressed-state feedback zonder verticale verschuiving voor feedback focus-return links. G1163 is afgerond met reduced-motion feedback zonder bewegende transform voor feedback focus-return links. G1164 is afgerond met forced-colors feedback via systeemkleuren voor feedback focus-return links. G1165 is afgerond met responsieve scrollmarge voor feedback focus-return form-ankers. G1166 is afgerond met een subtiele eerste-veldgroep landingscue voor feedback focus-return targets. G1167 is afgerond met forced-colors systeemkleurcue voor feedback focus-return landingscontext. G1168 is afgerond met focus-synchronisatie voor feedback focus-return naar het gelande dossierformulier. G1169 is afgerond met een zichtbare focuscontextcue voor feedback focus-return targetformulieren. G1170 is afgerond met contrast- en reduced-motionbewaking voor gefocuste feedback focus-return landingscues. G1171 is afgerond met gedeelde CSS-variabelen voor target- en focuscueparity over dossierformulieren. G1172 is afgerond met een expliciete CSS-contractregressiesmoke voor target-, focus- en focus-visible cueparity in standaard, reduced-motion en forced-colors context. G1173 is afgerond met expliciete CI-, runbook- en completion-audit evidence voor de dossier cue parity smoke. G1174 is afgerond met onderhoudsbewaking dat de dossier cue parity smoke na secrets/fixture-scans en voor de volledige testset draait. G1175 is afgerond met een exact workflowlabel- en commandocontract voor de dossier cue parity smoke. G1177 is afgerond met gegroepeerde werkruimte-navigatie en een actieve werkruimte-context zodat de app minder als een platte alles-op-een-pagina ervaring voelt. G1178 is afgerond met een herbruikbare dashboard-shell voor het startscherm, primaire dagtaken en secundaire taakroutes voor aanbevelingen, setup en snelle invoer. Onderhoudstests borgen de vloer van minimaal 100 actieve doelen, 3 actieve epics en 1 toekomstige roadmap-horizon.
- **G146 consult-PDF:** vragenscherm kan een lokaal printbaar consultoverzicht openen
  met afspraken, vragen en medicatie; de browser kan dit zonder externe dienst als PDF
  opslaan.
- **G1179 uploadworkflowcomponent:** dossierdocument-upload gebruikt nu een herbruikbaar
  workflowpanel met begeleide stappen Basis, Context en Controle; G1180 rondt dezelfde
  componentstructuur af voor consultupload.
- **G1180 consultworkflowcomponent:** consultupload gebruikt nu hetzelfde workflowpanel
  met begeleide stappen Verslag, Context en Acties; G1181 rondt dezelfde
  componentstructuur af voor embryokwaliteit en embryostatus.
- **G1181 embryoworkflowcomponenten:** embryokwaliteit en embryo-status gebruiken nu
  herbruikbare workflowpanelen met begeleide stappen voor identificatie, beoordeling,
  controle, status, bron en koppeling; G1182 rondt de eerste herbruikbare
  timelinecomponenten af.
- **G1182 timelinecomponenten:** de centrale fertility timeline gebruikt nu
  herbruikbare `timelineList`/`timelineItem` componenten met rail, dot, itemstate en
  broncontext; G1183 rondt de eerste herbruikbare recommendationcomponenten af.
- **G1183 recommendationcomponenten:** dagelijkse aanbevelingen gebruiken nu
  herbruikbare `recommendationList`, `recommendationGroup` en `recommendationCard`
  componenten met eigenaar-, review- en artscheckstate. Het startscherm heeft ook
  een taakroutebalk naar fase, vandaag, volgende stap, aanbevelingen en snelle
  invoer, en de theme-CSS laadt in dev/preview via een CSP-veilige stylesheetlink;
  G1184 rondt de eerste herbruikbare researchcomponenten af.
- **G1184 researchcomponenten:** researchbronnen en wetenschappelijke/eenvoudige
  researchsamenvattingen gebruiken nu herbruikbare `researchSourceList`,
  `researchSourceCard`, `researchSummaryList` en `researchSummaryCard` componenten
  met bron-, citation-, review- en herverificatiecontext; G1185 deelt de
  kennispagina verder op in taakgerichte researchroutes.
- **G1185 kennisroutes:** de kennispagina heeft nu een routebalk en duidelijke
  clusters voor research lezen, research/kennis toevoegen, AI & netwerk en
  bibliotheek; G1186 deelt de dossierpagina verder op in taakgerichte
  medical-record routes.
- **G1186 dossierroutes:** de dossierpagina heeft nu een vroege routebalk en
  routecontainers voor uploaden, review, beelden & embryo's, tijdlijn en zoeken,
  met behoud van uploadformulieren, attachment hooks en privacycontroles; G1187
  deelt het welzijnscherm verder op in taakgerichte routes.
- **G1187 welzijnroutes:** het welzijnscherm heeft nu een routebalk en duidelijke
  clusters voor overzicht & trends, geschiedenis en vastleggen, met behoud van
  check-in-, symptoom- en cyclusformulieren; G1188 staat open voor decisionroutes
  in het afwegingenscherm.
- **G1188 decisionroutes:** het afwegingenscherm heeft nu een routebalk en
  duidelijke clusters voor voorbereiden, opties vergelijken, keuze vastleggen en
  beslisverslagen, met behoud van `decision-form`, `decision-choice-form`,
  `data-decision-id` en bestaande inputcontracten; G1189 staat open voor
  taakgerichte privacyroutes in beheer- en instellingenschermen.
- **G1189 back-uproutes:** het back-upscherm heeft nu een routebalk en duidelijke
  privacyclusters voor controleren, exporteren, importeren en herstel/toegang, met
  behoud van `export-backup`, `export-sync`, `import-backup-form`,
  `import-sync-form`, WebAuthn hooks en privacycopy; G1190 staat open voor
  herinneringen en notificatieprivacy.
- **G1190 notificationroutes:** het herinneringenscherm heeft nu een routebalk en
  duidelijke clusters voor status, lockscreenprivacy, plannen en komende/fallback,
  met behoud van `notification-privacy-form`, `warning-default-form`,
  `eigen-herinnering-form`, reschedule-hooks en generieke lockscreenprivacycopy;
  G1191 staat open voor logboek- en audit-historyroutes.
- **G1191 logboekroutes:** het logboek heeft nu een routebalk en duidelijke
  historyclusters voor overzicht, recent, categorieën en privacygevoelige
  gebeurtenissen, met behoud van eventlog selectors, categoriecopy en
  privacy-sanitization; G1192 staat open voor financeroutes in het kostenscherm.
- **G1192 financeroutes:** het kostenscherm heeft nu een routebalk en duidelijke
  clusters voor overzicht, toevoegen, vergoeding/eigen risico en historie, met
  behoud van `kosten-form`, kosten selectors, bewerk-/delete-hooks en
  polisdisclaimers.
- **G1193 treatmentroutes:** het trajectscherm heeft nu een routebalk en duidelijke
  clusters voor trajectoverzicht, faseplanning, vergoeding, timeline/graphcontext en
  beheer/archief,
  met behoud van `traject-form`, `traject-new-form`, faseknoppen en vergoedingcopy.
- **G1194 scheduleroutes:** het agendascherm heeft nu een routebalk en duidelijke
  clusters voor agendaoverzicht, komende afspraken, plannen/bewerken, ICS-import en
  historie, met behoud van `afspraak-form`, `ics-import-form`, reminderhooks,
  vraagkoppeling en privacyfeedback.
- **G1195 medicationroutes:** het medicatiescherm heeft nu een routebalk en duidelijke
  clusters voor vandaag, planning, beheer, schema-import en historie/voorraad, met
  behoud van `medicatie-form`, `medicatie-import-form`, dose-log hooks,
  voorraadvelden en doseringsprivacycopy.
- **G1196 questionroutes:** het vragenscherm heeft nu een routebalk en duidelijke
  clusters voor open vragen, consultvoorbereiding, beheer, verslagen en alle vragen,
  met behoud van `vraag-form`, `question-priority-form`, antwoordvelden,
  afspraakkoppeling en exporthook.
- **G1198 commandroute-badges:** agenda, medicatie, vragen en traject tonen nu
  compacte badges en density states op de gedeelde commandroutes, zodat tellingen,
  acties en lege/gevulde routecontext direct scanbaar zijn.
- **G1199 mobiele commandroute-clearance:** mobiele commandroutes gebruiken nu een
  gedeelde bottom-nav clearance met scroll-padding en control scroll-margin; de
  browsercheck houdt primaire submitacties op agenda, medicatie, vragen en traject
  vrij van de fixed bottom-nav.
- **G1200 mobiele formulieractiezone:** commandroute-formulieren op mobiel gebruiken
  compactere disclosure-, veld- en textarea-spacing plus een sticky full-width
  primaire submitactie boven de bottom-nav.
- **G1201 mobiele veldsecties:** commandroute-formulieren voor agenda, medicatie,
  vragen en traject groeperen hun velden nu in compacte secties zoals Basis, Context,
  Planning en Antwoord zonder form-id's of input names te wijzigen.
- **G142 periodieke back-upaanmoediging:** het back-upscherm toont lokaal of er nog
  geen back-updatum bekend is, of een back-up oud wordt, en bewaart de laatste
  succesvolle exportdatum versleuteld in settings.
- **G153 schermlezer-vriendelijke labels:** herhaalde acties voor verwijderen,
  herordenen, innames markeren, herinneringen plannen, fase wijzigen en kennis
  verifiëren hebben contextuele toegankelijke namen naast de zichtbare knoptekst.
- **G154 donkere modus:** topbar bevat een lokale themakeuze; de voorkeur wordt
  versleuteld in settings bewaard en activeert een donker CSS-palet.
- **G148 UI-componentlaag (Claude Design):** `src/ui/components.ts` levert
  canonieke, getokeniseerde HTML-helpers (page-header, card, action-card,
  phase-hero, timeline, accordion, disclosure, stat-row, lege-/laad-/foutstaten)
  als basis voor het mobiel-first herstel van de schermlayouts. Pure
  presentatielaag met inline-SVG iconen (CSP-veilig); geen gedragswijziging.
- **G1265 Dossier focus-shell:** Dossier bundelt routekeuze en split-workspace in
  één `dossier-focus-shell` met oriëntatie- en werkruimteregio's. Op mobiel worden
  de redundante globale werkruimtekaart en pagina-header voor Dossier verborgen,
  zodat upload/review, beelden en tijdlijn vanuit één compacte werkruimte starten.
- **G1266 Knowledge focus-shell:** Kennis/Research bundelt researchwerkbank en
  split-workspace in één `knowledge-focus-shell` met workbench- en
  workspace-regio's. De researchroute opent als compacte kennisruimte voor bronnen,
  samenvattingen, relevantie en trends; mobiel verbergt dubbele globale context.
- **G1267 Treatment focus-shell:** Traject bundelt behandelwerkbank en split-workspace
  in één `treatment-focus-shell` met workbench- en workspace-regio's. De
  contextroute opent als focusruimte voor fase, fertility timeline en graphcontext;
  mobiel verbergt dubbele globale context.
- **G1268 Daily advice focus-shell:** Dagadvies bundelt workflowtabs,
  eigenaarwerkbank, actieplanner en aanbevelingenlijst in één
  `daily-advice-focus-shell` met workflow-, workbench-, planner- en lijstregio's.
  De aanbevelingenroute start met eigenaar en adviesroute voordat de volledige lijst opent.
- **G1269 Start contained flow rail:** Start toont planning, medicatie, dagadvies,
  setup en snelle invoer nu als vervolgworkspace met een compact switchboard en
  begrensde panel-stack. De startpagina blijft daardoor korter en rustiger, terwijl
  de detailpanelen intern scrollbaar en direct aanklikbaar blijven.
- **G1270 Question focus-shell:** Vragen/consultvoorbereiding bundelt de
  consultvoorbereidingswerkbank en split-workspace in één `question-focus-shell`
  met workbench- en workspace-regio's. De prep-route opent als consultruimte voor
  open vragen, actiepunten, context, prep-packet, verslagen en beheer.
- **G1271 Wellbeing focus-shell:** Welzijn bundelt de inzichtwerkbank en
  split-workspace in één `wellbeing-focus-shell` met workbench- en
  workspace-regio's. De history-route opent als rustige terugleesruimte voor
  check-ins, symptomen, cyclusmetingen en trendperiodes zonder score of diagnose.
- **G1272 Decision focus-shell:** Afwegingen bundelt de besliswerkbank en
  split-workspace in één `decision-focus-shell` met workbench- en workspace-regio's.
  Voorbereiden, vergelijken, keuze en geschiedenis starten als één beslisruimte
  zonder score, voorkeur of behandeladvies.
- **G1273 Medication focus-shell:** Medicatie bundelt de innameswerkbank en
  split-workspace in één `medication-focus-shell` met workbench- en
  workspace-regio's. Vandaag afvinken, planning, beheer, import en historie starten
  als één medicatieruimte zonder doseeradvies of berekening.
- **G1274 Schedule focus-shell:** Agenda bundelt de dagplanningwerkbank en
  split-workspace in één `schedule-focus-shell` met workbench- en
  workspace-regio's. Overzicht, komende afspraken, plannen, ICS-import en historie
  starten als één planningsruimte met de volgende afspraak als eerste focus.
- **G1275 Finance focus-shell:** Kosten bundelt de financiële beheerwerkbank en
  split-workspace in één `finance-focus-shell` met workbench- en workspace-regio's.
  Totalen, vergoeding, toevoegen en historie starten als één administratieruimte
  zonder financieel advies of polisinterpretatie.
- **G1276 Backup focus-shell:** Back-up bundelt de veiligheidswerkbank en
  split-workspace in één `backup-focus-shell` met workbench- en workspace-regio's.
  Status, encrypted export, import en herstelopties starten als één veiligheidsruimte
  zonder dossierinhoud of plaintext payloads.
- **G1277 Eventlog focus-shell:** Logboek bundelt de systeemwerkbank en
  split-workspace in één `eventlog-focus-shell` met workbench- en workspace-regio's.
  Auditstatus, recente gebeurtenissen, categorieën en privacyregels starten als één
  auditruimte zonder gevoelige details direct uit te klappen.
- **G1278 Notification focus-shell:** Herinneringen bundelt de systeemwerkbank en
  split-workspace in één `notification-focus-shell` met workbench- en
  workspace-regio's. Runtime-status, lockscreenprivacy, planning, komende meldingen
  en fallback starten als één meldingsruimte.
- **G1279 Focusroute chrome reducer:** Focusroutes verbergen nu ook op desktop de
  redundante globale `workspace-map` en `page-header`, zodat Dossier, Kennis,
  Traject, Vragen, Welzijn, Afwegingen, Medicatie, Agenda, Kosten, Back-up,
  Logboek en Herinneringen direct in hun eigen focusruimte openen. De workspace-strip
  blijft zichtbaar als compacte bovencontext en de split-workspace smoke bewaakt dit.
- **G1280 Start chrome reducer:** Start verbergt nu de globale `workspace-map` zodra
  de `start-focus-shell` aanwezig is. De compacte workspace-strip blijft zichtbaar,
  terwijl `start-workspace-deck`, startscan, kernflows en dagadvies direct de eerste
  startwerkruimte vormen.
- **G1281 Start-flowrail één open paneel:** De Start-flowrail opent standaard alleen
  planning als primaire volgende stap. Dagadvies, setup en snelle invoer blijven
  gesloten achter hun summary en switchboard, zodat de contained workspace niet meer
  als lange detailkolom start.
- **G1282 Compacte topbar chrome:** De globale topbar toont themakeuze nu als
  compacte control-strip met korte zichtbare opslaanactie. Brand, opslagstatus,
  themakeuze en vergrendelen blijven beschikbaar, maar lezen minder als formulier
  boven de app.
- **G1283 Compacte focusroute workspace-strip:** Focusroutes houden de
  workspace-strip als oriëntatie zichtbaar, maar verbergen de beschrijvingsregel en
  snelle duplicaatlinks. Daardoor start de taakruimte hoger in de eerste viewport
  zonder de werkruimtewissel te verliezen.
- **G1284 Split-workspace hoofdruimte:** Desktop split-workspaces geven de actieve
  hoofdroute nu meer breedte dan taakrail en contextkolom. Rail, contextpanelen en
  kolomgaps zijn compacter, terwijl de split-workspace smoke dit als gerenderde
  breedtecontrole bewaakt.
- **G1285 Compacte focus-shell supportstrips:** Dossier, Kennis en Traject tonen hun
  ondersteunende oriëntatie of workbench als compacte bovenstrip. De actieve
  split-workspace krijgt daaronder de volle desktopbreedte en de routeflow
  screenshot-smoke bewaakt deze stapeling.
- **G1286 Compacte focus-shell headers:** Focusroutes gebruiken op desktop minder
  shellpadding, kleinere header-titels en verborgen introcopy boven de taakruimte.
  De routeflow screenshot-smoke bewaakt dat deze herhalende bovenlaag verborgen
  blijft.
- **G1287 Compacte actieve routeheaders:** Actieve taakroutes gebruiken op desktop
  compactere routekoppen met verborgen introcopy. Daardoor starten workflowkaarten,
  summaries en invoerpanelen hoger in de taakruimte.
- **G1288 Compacte hub-workflow laag:** Hub-workflow headers, tabs en detail-
  summaries zijn op desktop lager en scanbaarder. Lange hub-introcopy en
  detailhintregels verdwijnen uit de desktop-flow, zodat de inhoud van dossier,
  research, consultupload en dagadvies sneller zichtbaar wordt.
- **G1289 Compacte eerste contentboards:** Uploadtriage, dossier imaging-inspectie
  en research-reader gebruiken op desktop lagere boardpadding, kleinere lane-kaarten
  en verborgen board-introcopy. Daardoor start de eerste echte werklaag hoger in de
  viewport zonder de mobiele swipebanen te verliezen.
- **G1290 Compacte route-samenvattingen:** Command-route summaries zijn op desktop
  verlaagd tot compacte actiebalken met verborgen detailcopy en inline status- en
  actieknoppen. Daardoor stapelt iedere actieve route minder uitlegkaarten boven de
  echte werkruimte.
- **G1291 Compacte resterende routeboards:** Fertility timeline, dagadvies,
  consultvoorbereiding, welzijnsgeschiedenis en back-up gebruiken op desktop nu ook
  lagere boardpadding, compactere lane-kaarten en verborgen board-introcopy. De
  mobiele swipebanen blijven ongewijzigd.
- **G1292 Compacte routedetails:** Actieve route-disclosures, summary-/policy-
  panels en phase-/compactlijsten gebruiken op desktop een strakker ritme. Details
  blijven toegankelijk via dezelfde anchors, maar nemen minder verticale ruimte in.
- **G1293 Begrensde desktop split-workspace:** Focusroutes gebruiken op desktop een
  bounded workbench met eigen scrollvlakken voor rail, main en context. Main blijft
  breder dan rail/context en mobiel behoudt éénkoloms swipegedrag.
- **G1294 Start command-center:** Start gebruikt op desktop drie begrensde
  werkvlakken naast elkaar voor workflows, startscan/routes en dagelijks
  vervolgwerk. Elk vlak heeft eigen scrollgedrag; mobiel blijft éénkoloms.
- **G1295 Dagadvies advies-console:** Dagadvies gebruikt op desktop aparte
  begrensde werkvlakken voor workflow, eigenaarwerkbank, actieplanner en volledige
  lijst. De routeflow-smoke opent het aanbevelingenpaneel en bewaakt deze console.
- **G1296 Upload-console:** Dossierupload gebruikt op desktop een begrensde
  console voor routekeuze, documentupload, consultupload en review. Formulier-id's
  blijven gelijk; de routeflow-smoke bewaakt de werkvlakken.
- **G1297 Timeline-console:** Fertility Timeline gebruikt op desktop aparte
  begrensde werkvlakken voor reader, filter/export, inzichten en timeline-items.
  Timeline-id's blijven gelijk; routeflow-smoke bewaakt de console.
- **G1298 Compacte workspace-deck:** de generieke workspace-map wordt niet meer
  boven elke route gerenderd. Detailroutes tonen de compacte workspace-deck in
  de sidebar met actieve werkruimte en sibling routes; split-workspace smoke
  bewaakt dat de hoofdcontent geen brede productkaart, quick-link stapeling of
  routechrome terugkrijgt.
- **G1299 Begrensde desktop app-workspace:** op desktop is `.app-shell`
  viewport-hoog en verborgen voor body-scroll. `.content` is het eigen
  scrollpaneel, zodat de app als vaste werkruimte blijft staan; routeflow-smoke
  bewaakt shellhoogte, overflow en body-scroll.
- **G1300 Start-launchpad:** Start bundelt commandheader, cockpit en werkbanen
  in één launchpad met aparte header-, cockpit- en deckregio's. Desktop toont
  deze regio's naast elkaar in de eerste viewport; mobiel behoudt de verticale
  volgorde. Routeflow-smoke bewaakt de dashboardlayout en tekstfit.
- **G1301 Dossier-console:** Dossier toont op desktop routekaart/orientation en
  actieve split-workspace naast elkaar in één begrensde console. Orientation,
  workspace en split-container hebben containment en eigen scrollgedrag, zodat
  lange upload- en imagingpanelen de body niet meer oprekken.
- **G1302 Knowledge-console:** Kennis/Research toont op desktop een compacte
  console met researchwerkbank links, taakroute-rail in het midden en actieve
  leesworkspace rechts. De workspace verbergt de krappe contextkolom, gebruikt
  een leesbare 2x2 researchlaag en bewaakt tekstfit/overflow via routeflow-smoke.
- **G1303 Consult-console:** Vragen/consultvoorbereiding toont op desktop een
  compacte console met consultwerkbank links, taakroute-rail in het midden en
  actieve prep-workspace rechts. De workspace gebruikt een hoofdvlak met
  contextstrip, zodat prep-board, wizard, open vragen en verslagen niet als één
  lange vraaglijstpagina starten.
- **G1304 Wellbeing-console:** Welzijn toont op desktop een compacte console met
  inzichtwerkbank links, taakroute-rail in het midden en actieve welzijnswerkruimte
  rechts. De workspace gebruikt een hoofdvlak met contextstrip, zodat check-ins,
  symptomen, cyclusmetingen en vastleggen niet als één lange welzijnspagina starten.
- **G1305 Decision-console:** Afwegingen toont op desktop een compacte console met
  besliswerkbank links, taakroute-rail in het midden en actieve keuzewerkruimte
  rechts. De workspace gebruikt een hoofdvlak met contextstrip, zodat voorbereiden,
  vergelijken, kiezen en teruglezen niet als één lange beslispagina starten.
- **G1306 Finance-console:** Kosten toont op desktop een compacte console met
  financiële beheerwerkbank links, taakroute-rail in het midden en actieve
  financiële werkruimte rechts. De workspace gebruikt een hoofdvlak met
  contextstrip, zodat totalen, vergoeding, toevoegen en historie niet als één
  lange financiële pagina starten.
- **G1307 Backup-console:** Back-up toont op desktop een compacte console met
  veiligheidswerkbank links, taakroute-rail in het midden en actieve
  back-upwerkruimte rechts. De workspace gebruikt een hoofdvlak met contextstrip,
  zodat controleren, exporteren, importeren en herstellen niet als één lange
  beheerpagina starten.
- **G1308 Audit-console:** Logboek toont op desktop een compacte console met
  systeemwerkbank links, taakroute-rail in het midden en actieve auditwerkruimte
  rechts. De workspace gebruikt een hoofdvlak met contextstrip, zodat status,
  recente gebeurtenissen, categorieën en privacy niet als één lange beheerpagina
  starten.
- **G1309 Notification-console:** Herinneringen toont op desktop een compacte
  console met systeemwerkbank links, taakroute-rail in het midden en actieve
  meldingswerkruimte rechts. De workspace gebruikt een hoofdvlak met contextstrip,
  zodat status, privacy, plannen en komende meldingen niet als één lange
  beheerpagina starten.
- **G1310 Schedule-console:** Agenda toont op desktop een compacte console met
  dagplanningwerkbank links, taakroute-rail in het midden en actieve
  planningswerkruimte rechts. De workspace gebruikt een hoofdvlak met contextstrip,
  zodat overzicht, plannen, ICS-import en historie niet als één lange
  planningspagina starten.
- **G1311 Medication-console:** Medicatie toont op desktop een compacte console met
  innamewerkbank links, taakroute-rail in het midden en actieve medicatiewerkruimte
  rechts. De workspace gebruikt een hoofdvlak met contextstrip, zodat vandaag,
  planning, beheer, import en historie niet als één lange medicatiepagina starten.
- **G1312 Treatment-console:** Traject toont op desktop een compacte console met
  behandelwerkbank links, taakroute-rail in het midden en actieve trajectwerkruimte
  rechts. De workspace gebruikt een hoofdvlak met contextstrip, zodat overzicht,
  fasen, vergoeding, timeline/graphcontext en beheer niet als één lange
  trajectpagina starten.
- **G1313 Start-console:** Start toont op desktop een compactere eerste-viewport
  console. Launchpad en command-center hebben expliciete regio's; de launchpad is
  begrensd, de cockpit is compacter en het verdiepings-command-center start zichtbaar
  binnen de eerste viewport in plaats van onder een hoge introductielaag.
- **G1314 Directe advice-console:** Dagadvies opent via `#start-recommendations` als
  eigen compacte console bovenaan de content. Workflow, eigenaarwerkbank,
  actieplanner en aanbevelingenlijst staan in aparte begrensde werkvlakken, zodat
  dagadvies niet eerst als onderdeel van een lange startpagina gelezen hoeft te
  worden.
- **G1315 Directe Vandaag-console:** `#start-today`, `#start-current-phase`,
  `#start-next-step` en `#start-quick-entry` openen als één compacte Vandaag-console
  zonder Start-launchpad. Planning/volgende stap, dagcommand en snelle invoer staan
  in aparte werkvlakken met eigen scrollgedrag, zodat dagelijkse taken niet als
  onderdeel van één lange Startpagina hoeven te lezen.
- **G1316 Directe upload-intake:** `#dossier?route=upload` opent de dossierintake nu
  als directe console. Op desktop verdwijnen routekaart, taakrail en contextkolom
  voor deze route, zodat documentupload en consultupload breed naast elkaar starten
  met eigen scrollgedrag in plaats van achter een extra disclosure of smalle
  routekolom.
- **G148 navigatie-shell (Claude Design):** hoofdnavigatie toont per scherm een
  inline-SVG icoon; op mobiel is het een vaste, horizontaal scrollbare onderbalk
  (icoon boven label) en op desktop een pill-balk. De generieke `.hero` is
  vervangen door een rustiger `pageHeader` (serif-titel + intro). Schermtitels,
  nav-hrefs en `aria-current` blijven ongewijzigd.
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
- **G223 PFIP behandelvoorbereiding:** Dagelijkse aanbevelingen bundelen afspraken,
  medicatieplanning, open vragen en consultactiepunten als lokale
  voorbereidingschecklist, zonder diagnose, dosering of behandelkeuze.
- **G224 PFIP cyclusdagcheck:** Dagelijkse aanbevelingen tonen cyclusfase en
  cyclusmetingen als feitelijke dagcheck, zonder diagnose, dosering, timingadvies
  of behandelkeuze.
- **G225 PFIP mannelijke voorbereidingskaart:** De man-sectie in dagelijkse
  aanbevelingen toont leefstijlobservaties, voeding/supplementvragen en praktische
  voorbereiding als lokale checklist, zonder vruchtbaarheidsadvies of behandelkeuze.
- **G226 PFIP uitlegbare aanbevelingen:** Dagelijkse aanbevelingen tonen per kaart
  de gebruikte lokale bronnen, zoals dossierdocumenten, cyclusmetingen, afspraken,
  medicatieplanning, vragen en consultverslagen.
- **G227 PFIP aanbevelingsacties:** Dagelijkse aanbevelingen kunnen lokaal worden
  bewaard, afgewezen of omgezet naar een eigen herinnering of open vraag; acties
  gebruiken bestaande versleutelde stores en het lokale gebeurtenissenlog.
- **G228 PFIP fertility knowledge graph-model:** De domeinlaag kan lokaal een graph
  bouwen met nodes en feitelijke relaties voor behandelingen, documenten, embryo's,
  gesprekken, research en aanbevelingen, zonder causaliteit of medisch advies.
- **G229 PFIP graph-relatievoorstellen:** De graph-domeinlaag kan ontbrekende
  relaties lokaal voorstellen op basis van datum, type en titelmatch en geselecteerde
  voorstellen handmatig bevestigen als gewone graph-relaties.
- **G230 PFIP graph-contextinzichten:** De graph-domeinlaag kan contextuele
  inzichten genereren met bronpad, laag/middel onzekerheidslabel en waarschuwing
  tegen causaliteit, diagnose, kansberekening of behandeladvies.
- **G231 PFIP graphweergave per traject:** Het trajectscherm toont een lokale
  graphweergave per traject met filter op relatietype en periode, inclusief nodes,
  relaties, bron en veilige graph-waarschuwing.
- **G232 PFIP research-dossierrelaties:** Het kennisscherm toont lokale relaties
  tussen researchpublicaties en dossiercontext als bronpad met expliciete
  waarschuwing dat dit geen causaliteit, diagnose, dosering of behandelkeuze is.
- **G233 PFIP graph-index rebuild:** De graph-domeinlaag kan de index opnieuw
  afleiden uit ontsleutelde lokale kluisrecords en toont in het trajectscherm een
  rebuildrapport met bronrecordtelling, controlehash en dataverliescontrole zonder
  opslagwrites.
- **G234 PFIP graph-privacytest:** De testset borgt dat graph-opbouw,
  relatievoorstellen, contextinzichten, trajectfilters en index-rebuild geen fetch,
  XHR of sendBeacon starten en dus lokaal blijven.
- **G235 PFIP graph-consultexport:** Het trajectscherm toont een exporteerbare
  Markdown-samenvatting van de graph voor consultvoorbereiding met relaties,
  bronpad, controlehash en expliciete waarschuwing zonder medische claims.
- **G236 PFIP centrale fertility timeline:** Het trajectscherm toont een centrale
  tijdlijn uit lokale onderzoeken, consulten, behandelingen, embryo's,
  aanbevelingen en research, met bron en veilige waarschuwing.
- **G237 PFIP timeline-normalisatie:** De centrale fertility timeline normaliseert
  nu ook vragen, medicatierecords en medicatiemomenten naast afspraken,
  dossierdocumenten en embryo's.
- **G238 PFIP timelinefilters:** Het trajectscherm kan de centrale timeline filteren
  op type, periode, traject, eigenaar en bron; het filter blijft lokaal in de
  runtime-sessie.
- **G239 PFIP timeline-detailpaneel:** Ieder centraal tijdlijnitem toont een
  detailpaneel met bron, feitelijke context, record-ID en gekoppelde lokale records,
  zonder medische interpretatie.
- **G240 PFIP timeline-mijlpalen:** De centrale timeline toont belangrijke
  mijlpalen en neutrale signalen voor ontbrekende datum-, bron- of trajectcontext,
  zonder automatische correctie of oordeel.
- **G241 PFIP timeline-trajectexport:** Het trajectscherm toont een complete
  ongefilterde Markdown-export van de centrale fertility timeline voor eigen
  consultvoorbereiding, inclusief mijlpalen, contextsignalen, records en
  waarschuwing.
- **G242 PFIP timeline offline/import:** Timeline-opbouw, filtering en export zijn
  getest zonder netwerkverkeer; back-upimport houdt geïmporteerde timeline-records
  bruikbaar en back-up/sync-import resetten timelinefilters.
- **G243 PFIP timeline mobiel overzicht:** De centrale timeline heeft een
  toegankelijk mobiel overzicht met ankers naar items, mijlpalen, contextsignalen en
  export, zodat het volledige traject vanuit één scherm scanbaar blijft.
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

- **G244 Continuous Evolution catalogus:** `EXECUTION_GOALS.md` definieert de tweede-generatie doelcatalogus met 5 actieve epics, F5-horizon en traceerbare doelen met probleem, gewenste uitkomst, gebruikerswaarde, acceptatiecriteria, prioriteit, complexiteit en componenten.
- **G245 Backlog Health Dashboard:** `npm run backlog:health` vergelijkt lokaal
  `PRODUCT_BACKLOG.md`, `EXECUTION_GOALS.md` en optioneel een vooraf geëxporteerde
  GitHub issue-snapshot, zodat ontbrekende issue-links, dubbele goal-id's en
  statusdrift zichtbaar worden zonder netwerkverplichting.
- **G246 Goal Scoring Model:** `EXECUTION_GOALS.md` bevat een reproduceerbare
  scoringrubric en scorevelden; `npm run goals:score` rangschikt eventuele open doelen
  op prioriteit, complexiteit, epic-modifier en Goal ID.
- **G250 Goal Completion Audit Checklist:** `docs/GOAL_COMPLETION_AUDIT.md` beschrijft
  requirement-per-requirement bewijs voor afronden, is gekoppeld aan DoD en
  PR-template, en wordt bewaakt door een onderhoudstest.
- **G264 First Run Guided Setup:** het startscherm toont vóór eerste gebruikersdata een
  lokale setupkaart voor kluis/privacy, eerste traject, eerste afspraak en back-up; de
  kaart kan lokaal worden afgerond of overgeslagen via versleutelde settings.
- **G285 Offline Smoke Test Script:** `npm run smoke:offline` gebruikt Playwright tegen
  de productiebuild om service-workerinstallatie, offline reload en app-shellweergave
  na eerste bezoek te controleren.
- **G286 Backup Restore Drill:** `npm run drill:backup` gebruikt memory drivers om een
  representatieve encrypted dataset te exporteren, importeren, opnieuw te ontgrendelen
  en inhoudelijk te verifiëren zonder plaintext in het exportbestand.
- **G324 Content Security Policy:** `index.html` beperkt scripts, fonts, workers,
  manifest en netwerkverbindingen tot de eigen origin; data/blob media blijven
  toegestaan voor lokale previews en alleen lokale dev-websockets zijn toegestaan.
- **G326 Secrets Scan Test:** `npm run secrets:check` scant repo-tekstbestanden op
  gangbare API keys, Tailscale auth keys, GitHub tokens, AWS keys en private-keyblokken;
  CI draait deze check vóór tests.
- **G305 AI Prompt Registry:** `src/domain/ai.ts` bevat een centrale
  `AI_PROMPT_REGISTRY` met promptdoel, versie, inputcontract, veiligheidslabels en
  verboden output; tests bewaken diagnose-, dosering- en behandelkeuzegrenzen.
- **G257 Autonomy Guardrails Doc:** `docs/AUTONOMY_GUARDRAILS.md` legt vast wat
  autonome PR's wel en niet mogen doen voor netwerk, AI, data, GitHub, Tailscale en
  medisch beleid; ADR-0007, de completion audit, PR-template en onderhoudstest
  verwijzen ernaar.
- **G259 Backlog Statistics Test:** `tests/maintenanceDocs.test.ts` parseert open G-id's
  uit `PRODUCT_BACKLOG.md` en `EXECUTION_GOALS.md` en faalt als beide actieve catalogi
  niet dezelfde open doelen bevatten.
- **G349 Completion Audit Evidence Markers:** `docs/GOAL_COMPLETION_AUDIT.md` en de
  PR-template bevatten een herkenbaar `completion-audit` markerblok met requirements-,
  test-, policy- en GitHub-evidence; de onderhoudstest bewaakt headings en velden.
- **G372 ADR Review Evidence Template:** `docs/ADR_REVIEW_EVIDENCE_TEMPLATE.md` legt
  vast hoe ADR-needed goals hun goal-id, reviewer/datum, geraadpleegde ADR's,
  besluituitkomst, ADR-route, follow-up en evidencegrenzen vastleggen.
- **G373 Autonomy Guardrail Evidence Checklist:**
  `docs/AUTONOMY_GUARDRAIL_EVIDENCE_CHECKLIST.md` en de PR-template leggen per
  autonome PR evidence vast voor netwerk, AI, data, GitHub, Tailscale, medisch beleid
  en gevoelige-datagrenzen.
- **G374 Backlog Active Goal Drift Fixture:** `scripts/backlog-health.mjs` valideert
  actieve open doelen op opt-in minimum, ontbrekende execution IDs en extra execution IDs;
  `tests/backlogHealth.test.ts` gebruikt kleine synthetische negatieve fixtures zonder
  productiebacklog te dupliceren.
- **G376 ADR Review Evidence Index:** `docs/ADR_REVIEW_EVIDENCE_INDEX.md` koppelt alle
  huidige `ADR Needed: yes` doelen aan evidence location, decision outcome en follow-up
  status; de onderhoudstest vergelijkt de index met de ADR-needed marker set.
- **G378 Backlog Active Goal Drift CLI Flag:** `npm run backlog:health` accepteert
  `--minimum-open-goals` voor lokale fixtures/experimenten; standaard is er geen
  open-doelenvloer zodat cleanup geen vervangruis hoeft te maken.
- **G380 Backlog Health Issue Snapshot Default Gate:** README/CONTRIBUTING tonen het
  exacte veilige `gh issue list --json number,title,state,url` snapshotcommando,
  backlog-health meldt de optionele `--issues-json` route wanneer die ontbreekt en
  `parseIssueSnapshot` bewaart geen issue bodies.

F1 (MVP) en de oorspronkelijke 179 doelen zijn afgevinkt. De nieuwe hoge-prioriteit
epic [`docs/PERSONAL_FERTILITY_INTELLIGENCE_PLATFORM.md`](docs/PERSONAL_FERTILITY_INTELLIGENCE_PLATFORM.md)
is volledig verwerkt in de backlog (G180-G243 afgerond), gericht op dossier-ingest,
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
  researchitems opslaan, scientificSummary, patientSummary, sourceCitation en persoonlijke contextmatch tonen en een bronregister met naam, type, URL, updatebeleid, opt-invereiste en geen-netwerk-zonder-opt-in status tonen en biedt lokale AI-opt-ininstellingen, provider/modelkeuze,
  passieve on-device AI-status, payload-preview en AI-samenvatting-opslag en markeert
  kostenkennis met jaartal; het kostenscherm bewaart kostenposten met
  categorie/vergoedstatus, toont een lokaal kostenoverzicht en bewaakt de
  eigen-risicostand voor 2026; het trajectscherm toont de vergoede-pogingen-teller.
  Het back-upscherm kan versleutelde exportbestanden downloaden,
  checksum-gecontroleerd importeren, syncpakketten verwerken en optioneel
  WebAuthn/biometrie als PRF-keywrap koppelen. De app is gepubliceerd via een aparte
  Tailscale HTTPS-node (`https://kiempad.tail9d0c71.ts.net`) met lokale fallback op
  `127.0.0.1:8098`; dezelfde node publiceert de centrale encrypted API onder `/api`.
  De centrale API heeft een publieke read-only `GET /health` die alleen technische
  privacygrensmetadata, emptyState en foutstatussen toont, zonder user-id,
  session-id, record-id, recordcount, ciphertext, secrets of medische plaintext.
  Embryodossiers tonen embryo-status events met bron, datum, notitie en reviewstatus
  als feitelijke bronregistraties; de status-editor bewaart concepten zonder diagnose,
  dosering, kansberekening, behandelkeuzeadvies of beeldpayload.
  De fertility knowledge graph gebruikt een expliciet node-schema met schemaVersie,
  bronRecordId, bronType, bron, datum en reviewstatus; de UI toont deze node-metadata
  als concept/gereviewd overzicht zonder bronpayload.
  Graph-relaties hebben gestructureerde provenance met bron, bronRecordIds, datum,
  reviewstatus en herkomst; de UI toont deze relatieherleiding zonder raw payload.
  De recente Premium Claude Design UI-laag verdeelt hoofdschermen in werkruimtes en
  taakroutes; alle hoofdschermen tonen nu boven de content een compacte workspace-strip
  met actieve werkruimtegroep, zusterschermen en snelle routes naar Start, Dossier en
  Tijdlijn. Direct daaronder staat nu een werkruimtekaart voor Vandaag, Behandeling,
  Dossier, Inzicht en Beheer met eigen primaire route, route-aantal en actieve state,
  zodat de app niet meer als één lange pagina hoeft te worden gescand. Start toont
  daarnaast een apart workflowdeck voor planning, uploads/beelden, research/dagadvies
  en kluis/beheer. De verdere Start-verdieping staat nu in één `start-focus-shell`
  met workflow-, scan- en daily-regio, zodat intelligence hub, startscan, taakroutes
  en flowdashboard niet meer als losse modules onder elkaar lezen. De dossieruploadroute toont vóór de formulier-intake een compacte
  upload-triage voor document, consult, beeld/embryo en lokale OCR/review, zodat de
  uploadflow eerst als keuzegrid leest en pas daarna als detailformulier. De dossier
  imaging-route toont vóór consultverslagen, imaging-repository en embryo-dossiers
  een compact inspectiebord voor beelden, vergelijken, embryo's en consultcontext.
  De consultvoorbereidingsroute toont vóór de Consult Prep Wizard een prep-bord voor
  open vragen, actiepunten, context en packet/verslagen. De welzijn-geschiedenisroute
  toont vóór check-ins, symptomen en cyclusmetingen een terugleesbord voor check-ins,
  symptomen, cyclus en trends. De centrale
  fertility timeline in Traject toont vóór filter, export en itemlijst een compacte
  leesmodus voor gebeurtenissen, mijlpalen, contextcontrole en consult-export.
  Dagadvies toont vóór de volledige aanbevelingenlijst een compacte actieplanner voor
  leefstijl, voeding, supplementen en artscheck. De kennis/research leesroute toont
  vóór bronnen, samenvattingen en trends een compacte leeslaag voor wetenschappelijk
  lezen, eenvoudige uitleg, relevantie en trends. Back-up & import toont op de
  controle-route een encrypted-sync bord voor status, export, import en herstel. Het
  startscherm opent zonder generieke werkruimte-context met een
  compacte start-cockpit voor eerstvolgende aandacht, dossierbasis en kernwerkbanen,
  gevolgd door een aparte Fertiliteitswerkbank voor dossier uploaden, tijdlijn
  begrijpen, dagadvies en research; de resterende startmodules staan in een progressive flowrail waarin
  alleen Planning open staat en Dagadvies, Setup en Snelle invoer dichtgeklapt
  blijven, met mobiele start-taakroutes verborgen tegen dubbele navigatie. De mobiele
  app-chrome boven Start is compacter met brand/status op één rij, thema en
  vergrendelen naast elkaar en een 2x2 Fertiliteitswerkbank. Traject, agenda,
  medicatie en vragen gebruiken gedeelde
  command-routepanelen met consistente actieve state, header-spacing, compacte
  badges, density states, mobiele bottom-nav clearance, sticky formulieracties en
  compacte veldsecties zodat deze schermen minder als één lange pagina aanvoelen.
  Alle split-view hoofdwerkruimtes delen nu consistente railspacing, een sterkere
  actieve route-affordance en contextkolomritme; `npm run smoke:split-workspaces`
  bewaakt Dossier, Agenda, Vragen, Traject, Medicatie, Kennis, Welzijn,
  Afwegingen, Kosten, Logboek, Herinneringen en Back-up op desktop en mobiel,
  inclusief de correcte workspace-stripgroep per route.
  Dossier, Agenda, Kennis en Traject tonen nu domeinspecifieke contextsignalen in
  de rechterkolom voor review/beeldhistorie, planning/import, researchleesvolgorde
  en behandelcontext. Welzijn, Afwegingen, Kosten, Logboek, Herinneringen en
  Back-up gebruiken dezelfde contextsignalenlaag voor respectievelijk welzijn,
  keuzes, administratie, auditprivacy, meldingsprivacy en back-upveiligheid.
  `npm run smoke:context-signals` levert privacyveilige screenshot-buffer evidence
  en layoutchecks voor Dossier, Agenda, Traject, Kennis, Welzijn, Afwegingen,
  Kosten, Logboek, Herinneringen en Back-up op desktop en mobiel. Contextkaarten
  hebben nu een zichtbare prioriteitskaart met accentlijn, waarde-pill, sterkere
  touch target en compactere mobiele dichtheid. Alle tien bewaakte contextkolommen
  tonen route-specifieke microstates, zoals beeldroute, planroute, AI-context,
  faseplanning, keuzeregistratie, vergoedingcontext, privacycontrole en
  importcontrole. Deze microstates tonen nu ook een compacte route-eigen volgende
  actie, zoals beeldmetadata controleren, afspraakgegevens invullen,
  payload-preview checken, fase controleren, privacyregels openen en pakketstatus
  controleren. Een subtiele flow-connector koppelt de microstate/next-action nu
  visueel aan de eerste prioriteitskaart; de browser-smoke bewaakt microstate,
  next-action en flow-connector zichtbaarheid op desktop en mobiel. De flow gebruikt
  nu subtiele domeinaccentfamilies voor Dossier/Traject, Agenda/Herinneringen,
  Kennis/Welzijn, Afwegingen/Kosten en Logboek/Back-up; de smoke bewaakt dat deze
  accentbalans over de tien contextkolommen onderscheidbaar blijft. Het startscherm
  heeft nu een zichtbare cockpit voor focus, dossierbasis en routes naar upload,
  tijdlijn, imaging en dagadvies, plus een fertility intelligence hub met zes werkbanen voor
  dossierupload, tijdlijn, embryo/beelden, dagadvies, research en encrypted sync,
  met twee primaire banen bovenaan en ondersteunende routes eronder zodat de eerste
  viewport niet meer als een lange modulelijst leest. De belangrijkste routes achter
  deze hub hebben nu ook een eigen hubroute-tablaag: dossierupload, dossiertijdlijn
  en dagadvies tonen een compacte workflowheader met tabs naar de verwante routes.
  De eerste detailpanelen achter deze routes zijn verder verdicht: upload-intake,
  documenttijdlijn en dagadvieslijst tonen nu compacte disclosure-headers met status
  en korte routehint in plaats van alleen losse tekstregels. Research en embryo/beelden
  hebben nu ook eigen hubroute-headers, zodat de start-hubroutes naar research en
  imaging niet meer als generieke kennis- of dossiersecties openen. De imaging-
  repository, embryo-dossiers en researchsamenvattingen hebben daarnaast compacte
  taakheaders met statusaantallen, waardoor gesloten detailpanelen niet meer als een
  tweede lange tekststapel lezen. `npm run smoke:routeflows` bewaakt nu Start,
  kennis-research en dossier-imaging met desktop/mobile screenshot-evidence voor
  hubtabs, compacte detailpanelen, tekstfit, verborgen inactieve routes en horizontale
  overflow. De mobiele start-hub gebruikt bovendien kortere hubcopy en een éénkoloms
  dagadviesgrid zodat de eerste hub niet meer een horizontale strip nodig heeft.
  Consultupload heeft nu ook eigen routecontext: de uploadhub bevat een consulttab,
  het consultpanel toont een `consult-upload` hubflowheader met verslag-, context- en
  vragentabs, en de routeflow-smoke bewaakt deze consultwerkbaan op desktop en mobiel.
  Consultverslagen en de Consult Prep Wizard hebben nu compacte taakheaders met status,
  en de routeflow-smoke bewaakt ook de vragenvoorbereidingsroute op desktop en mobiel.
  Gevulde consultkaarten zijn intern opgesplitst in een compacte header met statuschips,
  veilige metadata en secties voor verslagtekst, samenvatting, correctieverschil,
  actiepunten en inzichten.
  De traject/timeline-werkbank heeft nu een compacte trajectscan boven de routepanelen
  voor huidige fase, volgende actie, laatste timelinecontext en werkgrens, zodat de
  eerste viewport minder als administratiepagina leest.
  Het startscherm heeft nu ook een compacte startscan tussen de fertility hub en
  vervolgpanelen voor traject, vandaag, dagadvies en kluis/context.
  Daarboven bundelt de start-cockpit focus, dossierbasis en kernroutes in de eerste
  viewport.
  De kennis/research-werkbank heeft nu een researchscan voor bronnen,
  samenvattingen, trends en netwerkstatus voordat de filterkaart of detailpanelen
  openen.
  De dossierwerkbank heeft nu een dossierscan voor upload/review, zoeken,
  beelden/embryo's en tijdlijn voordat de taakroutes en detailpanelen openen.
  De dagadvieswerkbank heeft nu een dagadvies-scan voor vandaag, review,
  artscheck en vrouw/man/samen-verdeling voordat eigenaar-kaarten of de volledige
  aanbevelingslijst openen.
  De app heeft een PWA-manifest en service worker voor offline gebruik na de eerste load.
- Tailscale Serve publiceert de statische PWA en proxyt `/api/*` naar de centrale
  encrypted backend binnen dezelfde tailnet-node; de backend bewaart alleen
  client-side encrypted envelopes en technische metadata, geen plaintext
  gezondheidsdata.
- **Validatie:** lokaal geverifieerd groen — `npm run typecheck`, `npm run lint`,
  `npm run test`, `npm run build`, `npm run assets:check` en
  `npm audit --audit-level=high`.
- **CI:** de workflow (`.github/workflows/ci.yml`) draait nu — de repo is **publiek**
  gemaakt (ADR-0006), waardoor de Actions-billingblokkade voor private repos vervalt.
  Code/docs zijn publiek; de **gezondheidsdata blijft local-first en privé** (staat
  niet in de repo).

## 6. Hoogste Prioriteiten

1. UI Improvement Evolution voortzetten met grotere, direct zichtbare eerste-viewport verbeteringen per kernroute in plaats van alleen smalle detailverdichting.
2. Tailscale-publicatie periodiek smoken met
   `KIEMPAD_TAILSCALE_LOCAL_PORT=8098 KIEMPAD_TAILNET_URL=https://kiempad.tail9d0c71.ts.net npm run smoke:tailscale`.

## 7. Permanente onderhoudsregel

Werk dit document bij in **dezelfde wijziging** waarin functionaliteit verandert. Een
feature is pas "af" als `CURRENT_STATE.md`, de betreffende doelen in
`PRODUCT_BACKLOG.md` en (bij keuzes) een ADR kloppen. Documentatie loopt nooit achter
op de code.
