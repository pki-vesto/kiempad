# Epic: Personal Fertility Intelligence Platform

Deze epic heeft hoge prioriteit.

## Doel

Kiempad moet functioneren als een persoonlijke fertiliteitsassistent die medische
informatie centraliseert, analyseert en vertaalt naar begrijpelijke en bruikbare
inzichten.

De uitwerking hieronder is bedoeld als product- en backlogbron voor nieuwe epics,
features, uitvoerbare goals en GitHub Issues. Alle functionaliteit blijft binnen de
bestaande Kiempad-grenzen: geen medisch hulpmiddel, geen behandeladvies, geen
doseringadvies, geen kansberekening en geen plaintext medische inhoud op de backend.

## Capability 1: Historical Medical Record Ingestion

Gebruikers moeten met terugwerkende kracht medische informatie kunnen uploaden.

### Ondersteunde bronnen

- Onderzoeken
- Labuitslagen
- Fertiliteitsrapporten
- Ziekenhuisdocumenten
- Behandelverslagen
- PDF's
- Afbeeldingen

### Doelen

- Document upload
- OCR
- Metadata-extractie
- Tijdlijnopbouw
- Dossierindexering
- Zoekfunctionaliteit

## Capability 2: Imaging Repository

Ondersteun upload en analyse van:

- Echo's
- Foto's
- Scans
- Embryo-afbeeldingen

### Doelen

- Opslag
- Classificatie
- Tijdlijnkoppeling
- Vergelijking tussen momenten
- AI-samenvatting

## Capability 3: Consultation Intelligence

Ondersteun upload van:

- Gespreksverslagen
- Consultnotities
- Behandelgesprekken
- Samenvattingen

### Doelen

- Automatische samenvatting
- Actiepunten
- Vragenlijstgeneratie
- Behandelgeschiedenis

## Capability 4: Embryo Tracking

Ondersteun:

- Embryo uploads
- Embryo beoordeling
- Embryo historie
- Embryo vergelijking

### Doelen

- Embryo-dossier
- Kwaliteitsregistratie
- Tijdlijnweergave
- Behandelcontext

## Capability 5: Research Intelligence

Kiempad moet de laatste relevante wetenschappelijke ontwikkelingen kunnen tonen.

### Doelen

- Research aggregatie
- Samenvatting
- Bronverwijzing
- Trendanalyse

### Belangrijk

Samenvattingen moeten begrijpelijk zijn voor leken.

Voor iedere publicatie:

- Wetenschappelijke samenvatting
- Eenvoudige samenvatting
- Relevantie voor gebruiker

## Capability 6: Daily Recommendations

Genereer dagelijkse aanbevelingen.

### Voor vrouw

- Leefstijl
- Voeding
- Supplementen
- Behandelvoorbereiding
- Cyclusgerelateerde aanbevelingen

### Voor man

- Leefstijl
- Voeding
- Supplementen
- Vruchtbaarheidsoptimalisatie

### Basis voor aanbevelingen

Aanbevelingen moeten gebaseerd zijn op:

- Dossier
- Onderzoeken
- Behandelgeschiedenis
- Persoonlijke situatie

## Capability 7: Fertility Knowledge Graph

Bouw een intern kennisnetwerk dat relaties legt tussen:

- Onderzoeken
- Embryo's
- Behandelingen
- Gesprekken
- Onderzoeksliteratuur
- Aanbevelingen

### Doel

Contextuele inzichten genereren.

## Capability 8: Fertility Timeline

Maak een complete tijdlijn van:

- Onderzoeken
- Consulten
- Behandelingen
- Embryo's
- Aanbevelingen
- Onderzoeksinzichten

De gebruiker moet zijn volledige fertiliteitstraject kunnen begrijpen vanuit één
scherm.

## Goal Generation Rule

Voor iedere capability:

- Genereer meerdere epics
- Genereer meerdere features
- Genereer meerdere uitvoerbare goals
- Genereer GitHub Issues

Minimale doelstelling:

- 50+ extra uitvoerbare doelen uit deze epic alleen.

## Uitvoerbare Goal- en Issuecatalogus

Gebruik iedere regel als basis voor een GitHub Issue. De titels zijn bewust
actiegericht, zodat ze direct naar backlog-items kunnen worden omgezet.

| Issue | Epic | Feature | Uitvoerbare goal |
| --- | --- | --- | --- |
| PFIP-001 Historische dossierupload voor meerdere bestanden | Historical Medical Record Ingestion | Batch upload | Upload meerdere onderzoeken, labuitslagen, fertiliteitsrapporten, ziekenhuisdocumenten en behandelverslagen in één sessie. |
| PFIP-002 Bestandstypeherkenning voor dossierdocumenten | Historical Medical Record Ingestion | Documentclassificatie | Herken PDF's, afbeeldingen en tekstbestanden en toon per bestand een veilige typeclassificatie. |
| PFIP-003 OCR-pipeline voor historische documenten | Historical Medical Record Ingestion | OCR | Extraheer tekst uit PDF's en afbeeldingen zonder plaintext buiten de encrypted dataset te bewaren. |
| PFIP-004 Metadata-extractie uit historische documenten | Historical Medical Record Ingestion | Metadata | Leg datum, bron, documenttype, kliniek, onderwerp en onzekerheidsscore vast als dossiermetadata. |
| PFIP-004a Ziekenhuisdocument type-taxonomie | Historical Medical Record Ingestion | Metadata | Classificeer ziekenhuisdocumenten feitelijk als portaalexport, verwijsbrief, ontslagbrief, operatieverslag, labrapport, beeldverslag, toestemmingsformulier of algemeen ziekenhuisdocument zonder medische interpretatie. |
| PFIP-005 Handmatige correctie van documentmetadata | Historical Medical Record Ingestion | Metadata review | Laat gebruikers OCR- en metadataresultaten corrigeren voordat ze definitief op de tijdlijn komen. |
| PFIP-006 Dossierindex voor historische records | Historical Medical Record Ingestion | Indexering | Bouw een doorzoekbare dossierindex op basis van documentmetadata en versleutelde inhoudssamenvattingen. |
| PFIP-007 Zoekfunctie over historische onderzoeken | Historical Medical Record Ingestion | Zoeken | Zoek op datum, bron, type, vrije tekst, kliniek en gekoppelde poging. |
| PFIP-008 Tijdlijnkoppeling voor historische records | Historical Medical Record Ingestion | Tijdlijn | Plaats elk historisch document met bronverwijzing op de fertility timeline. |
| PFIP-009 Duplicaatdetectie voor opnieuw geuploade documenten | Historical Medical Record Ingestion | Kwaliteit | Waarschuw bij vermoedelijke duplicaten op basis van checksum, datum, titel en metadata. |
| PFIP-010 Importstatus en foutafhandeling voor dossieruploads | Historical Medical Record Ingestion | Upload UX | Toon per bestand status, foutreden, retry en veilige verwijderactie. |
| PFIP-011 Auditlog voor dossieringestie | Historical Medical Record Ingestion | Audit | Registreer upload, OCR, metadatawijziging en verwijdering als technische eventlog zonder medische plaintext. |
| PFIP-012 Privacygrens voor OCR en analyse | Historical Medical Record Ingestion | Security | Documenteer en test dat OCR-resultaten en samenvattingen alleen encrypted worden opgeslagen. |
| PFIP-013 Imaging repository voor echo's en foto's | Imaging Repository | Beeldupload | Upload echo's, foto's, scans en embryo-afbeeldingen als aparte beeldrecords. |
| PFIP-014 Veilige preview voor medische beelden | Imaging Repository | Preview | Toon beeldpreviews alleen na ontgrendeling van de actieve encrypted dataset en gebruik locked placeholders zonder beeldpayload, thumbnail of bronbestandsnaam zolang de preview vergrendeld is. |
| PFIP-015 Beeldclassificatie met handmatige bevestiging | Imaging Repository | Classificatie | Classificeer beelden als echo, foto, scan of embryo-afbeelding en laat correctie toe. |
| PFIP-016 Beelden koppelen aan traject, afspraak en poging | Imaging Repository | Context | Koppel elk beeld aan datum, traject, poging, afspraak en bron. |
| PFIP-017 Vergelijkingsweergave voor beelden door de tijd | Imaging Repository | Vergelijking | Vergelijk twee of meer beelden naast elkaar zonder medische interpretatie of score. |
| PFIP-018 AI-samenvatting voor beelden als concept | Imaging Repository | AI-samenvatting | Genereer alleen beschrijvende, ongeverifieerde conceptsamenvattingen met duidelijke waarschuwing. |
| PFIP-019 Beeldmetadata zonder EXIF-lekkage | Imaging Repository | Privacy | Strip of isoleer potentieel gevoelige EXIF-velden voordat beelden centraal worden bewaard. |
| PFIP-020 Tijdlijnitems voor beeldmomenten | Imaging Repository | Tijdlijn | Toon beeldrecords als herkenbare tijdlijnmomenten met thumbnail en context. |
| PFIP-021 Gespreksverslagen uploaden als consultrecords | Consultation Intelligence | Consultupload | Upload gespreksverslagen, consultnotities, behandelgesprekken en samenvattingen als consultverslag; tekstveld-import bewaart bron- en conceptreviewmetadata. |
| PFIP-022 Consultverslagen koppelen aan afspraken | Consultation Intelligence | Context | Koppel ieder consultverslag aan afspraak, arts/kliniek, traject en poging. |
| PFIP-023 Automatische consultsamenvatting | Consultation Intelligence | Samenvatting | Vat consultverslagen samen in begrijpelijk Nederlands met bronverwijzing naar het originele document. |
| PFIP-024 Actiepunten uit consultverslagen | Consultation Intelligence | Actiepunten | Extraheer actiepunten met eigenaar, datum, status en koppeling aan afspraak of herinnering. |
| PFIP-025 Vragenlijstgeneratie na consult | Consultation Intelligence | Vragen | Genereer conceptvragen voor het volgende consult op basis van open punten en onduidelijkheden. |
| PFIP-026 Behandelgeschiedenis reconstrueren uit consulten | Consultation Intelligence | Historie | Bouw een chronologisch behandelverhaal uit consultverslagen, afspraken en dossierdocumenten. |
| PFIP-027 Correctieflow voor consultsamenvattingen | Consultation Intelligence | Review | Laat gebruikers samenvattingen en actiepunten corrigeren en label AI-output als concept. |
| PFIP-028 Consultexport voor artsvoorbereiding | Consultation Intelligence | Export | Maak een printbaar consultoverzicht met open vragen, actiepunten en relevante historie. |
| PFIP-029 Embryo-dossier per poging | Embryo Tracking | Embryodossier | Maak per poging een embryo-overzicht met embryo-ID, dag, status, kwaliteit en notities. |
| PFIP-030 Embryo-afbeelding koppelen aan embryo-record | Embryo Tracking | Beeldkoppeling | Koppel embryo-afbeeldingen direct aan embryo's en behoud bronmetadata. |
| PFIP-031 Embryokwaliteit registreren volgens kliniektekst | Embryo Tracking | Kwaliteitsregistratie | Registreer kwaliteitsbeoordeling zoals ontvangen van de kliniek zonder eigen kansberekening. |
| PFIP-032 Embryo-statushistorie bijhouden | Embryo Tracking | Historie | Leg statussen zoals bevrucht, ontwikkeling, ingevroren, teruggeplaatst of niet gebruikt vast door de tijd. |
| PFIP-033 Embryo's vergelijken binnen en tussen pogingen | Embryo Tracking | Vergelijking | Toon embryo's naast elkaar met dag, status, kliniekbeoordeling en gekoppelde beelden. |
| PFIP-034 Embryo-tijdlijnitems | Embryo Tracking | Tijdlijn | Plaats embryo-events op de centrale fertility timeline. |
| PFIP-035 Embryo-context in behandeloverzicht | Embryo Tracking | Behandelcontext | Toon embryo-informatie in de context van punctie, bevruchting, terugplaatsing en cryo. |
| PFIP-036 Privacy- en taalgrens voor embryoanalyse | Embryo Tracking | Safety | Voorkom medische claims, scores of selectieadvies in embryoanalyse en microcopy. |
| PFIP-037 Researchbronnen configureren met opt-in | Research Intelligence | Bronnen | Toon relevante fertiliteitsresearch alleen via expliciete netwerk- of handmatige bronkeuze. |
| PFIP-038 Researchaggregatie per onderwerp | Research Intelligence | Aggregatie | Groepeer research rond IVF, ICSI, embryo, leefstijl, mannelijke factor en behandelvoorbereiding. |
| PFIP-039 Wetenschappelijke samenvatting per publicatie | Research Intelligence | Samenvatting | Maak een korte inhoudelijke samenvatting met methode, populatie, uitkomst en beperkingen. |
| PFIP-040 Eenvoudige samenvatting per publicatie | Research Intelligence | Lekentaal | Vertaal iedere publicatie naar begrijpelijk Nederlands zonder jargon waar mogelijk. |
| PFIP-041 Relevantie voor gebruiker zonder behandeladvies | Research Intelligence | Relevantie | Leg uit waarom publicatie mogelijk relevant is voor dossiercontext, met expliciete niet-adviesgrens. |
| PFIP-042 Bronverwijzing en actualiteitsdatum | Research Intelligence | Bronnen | Toon publicatiedatum, geraadpleegde datum, DOI/URL en betrouwbaarheidssignalen. |
| PFIP-043 Trendanalyse over researchtopics | Research Intelligence | Trends | Toon terugkerende thema's en verschuivingen door de tijd zonder conclusies als persoonlijk advies. |
| PFIP-044 Research opslaan als kennisitem | Research Intelligence | Kennisbank | Sla researchsamenvattingen op als kennisitems met bron, AI-label en verificatiestatus. |
| PFIP-045 Dagelijkse aanbevelingen voor vrouw | Daily Recommendations | Vrouw | Genereer dagelijkse leefstijl-, voeding-, supplement-, behandelvoorbereiding- en cycluscontext als concept. |
| PFIP-046 Dagelijkse aanbevelingen voor man | Daily Recommendations | Man | Genereer dagelijkse leefstijl-, voeding-, supplement- en vruchtbaarheidsoptimalisatiecontext als concept. |
| PFIP-047 Aanbevelingen baseren op dossiercontext | Daily Recommendations | Context | Gebruik dossier, onderzoeken, behandelgeschiedenis en persoonlijke situatie als herleidbare bronnen. |
| PFIP-048 Aanbevelingen met medische grens | Daily Recommendations | Safety | Label aanbevelingen als niet-medisch, niet-doserend en altijd ondergeschikt aan kliniek/arts. |
| PFIP-049 Dagelijkse aanbeveling-tijdlijn | Daily Recommendations | Tijdlijn | Plaats dagelijkse aanbevelingen op de tijdlijn met datum en broncontext. |
| PFIP-050 Feedback op aanbevelingen | Daily Recommendations | Feedback | Laat gebruikers aanbevelingen markeren als nuttig, niet relevant, uitgesteld of besproken met arts. |
| PFIP-051 Fertility knowledge graph schema | Fertility Knowledge Graph | Graph model | Definieer knopen en relaties voor onderzoeken, embryo's, behandelingen, gesprekken, literatuur en aanbevelingen. |
| PFIP-052 Relaties leggen tussen records | Fertility Knowledge Graph | Relaties | Koppel dossierdocumenten, afspraken, consulten, embryo's en researchitems via expliciete relaties. |
| PFIP-053 Contextuele inzichten uit graph | Fertility Knowledge Graph | Inzichten | Genereer uitlegbare inzichten met bronpad, onzekerheid en niet-advieslabel. |
| PFIP-054 Graph-navigatie vanuit elk record | Fertility Knowledge Graph | Navigatie | Toon gerelateerde records vanuit document, consult, embryo, behandeling en researchkaart. |
| PFIP-055 Graph-integriteit en verwijdergedrag | Fertility Knowledge Graph | Data-integriteit | Werk relaties bij wanneer records worden gecorrigeerd, gearchiveerd of verwijderd. |
| PFIP-056 Complete fertility timeline | Fertility Timeline | Tijdlijn | Toon onderzoeken, consulten, behandelingen, embryo's, aanbevelingen en onderzoeksinzichten in één scherm. |
| PFIP-057 Tijdlijnfilters en zoekfunctie | Fertility Timeline | Filteren | Filter op periode, type, traject, poging, bron, eigenaar en verificatiestatus. |
| PFIP-058 Tijdlijndetailpaneel met broncontext | Fertility Timeline | Detail | Open per tijdlijnitem een detailpaneel met bron, gekoppelde records en acties. |
| PFIP-059 Ontbrekende context signaleren | Fertility Timeline | Kwaliteit | Markeer ontbrekende datums, onbekende bronnen en incomplete metadata zonder oordeel. |
| PFIP-060 Timeline export voor consultvoorbereiding | Fertility Timeline | Export | Exporteer een compacte tijdlijnsamenvatting voor eigen consultvoorbereiding. |
| PFIP-061 Mobiele één-scherm ervaring | Fertility Timeline | UX | Maak de volledige fertiliteitstijdlijn bruikbaar op mobiel zonder overlap of verborgen kernacties. |
| PFIP-062 Encrypted opslagcontract voor PFIP-records | Cross-cutting | Security | Leg vast dat PFIP-records centraal alleen als encrypted envelopes met minimale technische metadata bestaan. |
| PFIP-063 Import- en analysepermissies per capability | Cross-cutting | Consent | Vraag expliciete toestemming voor OCR, AI-samenvatting, researchnetwerk en aanbevelingsgeneratie. |
| PFIP-064 Testfixtures zonder echte medische data | Cross-cutting | Testdata | Maak synthetische fixtures voor documenten, beelden, consulten en embryo's zonder herleidbare data. |

## GitHub Issue-template

Gebruik dit format per PFIP-regel:

```md
## Problem

Kiempad mist nog [capability/feature], waardoor gebruikers hun fertiliteitstraject
niet volledig vanuit één centrale encrypted assistent kunnen begrijpen.

## Scope

- Bouw [uitvoerbare goal].
- Bewaar medische inhoud alleen encrypted.
- Toon AI-output alleen als concept en zonder medisch advies.
- Koppel relevante records aan tijdlijn, dossier en broncontext.

## Acceptance Criteria

- De gebruiker kan [concrete actie] uitvoeren.
- Records zijn zichtbaar in de juiste context en op de fertility timeline.
- Bron, datum, status en onzekerheid zijn zichtbaar waar relevant.
- Geen plaintext medische inhoud op de backend.
- Tests dekken opslaggrens, UI-state en relevante edge cases.
```
