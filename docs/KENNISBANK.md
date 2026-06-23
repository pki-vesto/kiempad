# Kiempad — KENNISBANK (inhoud & bronnen)

> Het inhoudsplan en de bronnenlijst voor de basis-kennisbank. **Alle medische
> inhoud moet door onze eigen behandelaars worden geverifieerd.** Een KennisItem
> toont pas "bevestigd" als `geverifieerd_met_arts = true`; AI-samenvattingen dragen
> altijd een waarschuwingslabel + bron (zie
> [`docs/adr/0003-ai-met-waarborgen.md`](docs/adr/0003-ai-met-waarborgen.md)).
>
> ⚠️ Geen medisch advies. Schema's volgen altijd de kliniek.

## Categorieën

De kennisbank (`KennisItem`, zie [`../DATAMODEL.md`](../DATAMODEL.md)) kent vier
inhoudscategorieën:

1. **Fasen** — wat gebeurt er per fase van een IVF/ICSI-traject; wat kun je verwachten.
2. **Leefstijl** — wat je zelf kunt doen (voeding, beweging, roken/alcohol, stress),
   nuchter en zonder beloftes.
3. **Kosten** — vergoedingen en eigen kosten (NL, 2026).
4. **Research** — verzamelde artikelen/links, optioneel met AI-samenvatting.

Elk item: titel, inhoud, **bron**, categorie, en de markeringen `ai_gegenereerd` en
`geverifieerd_met_arts`.

## Initiële inhoud (concept — te verifiëren met behandelaars)

### Fasen
- Globale fasen: voorbereiding → stimulatie → punctie → lab/bevruchting →
  terugplaatsing → wachttijd → zwangerschapstest → uitslag. (Exacte invulling per
  kliniek/protocol kan afwijken.)
- Verschil **IVF vs. ICSI** op hoofdlijnen (bevruchting in lab vs. injectie van één
  zaadcel).

### Leefstijl
- Algemene, niet-belovende leefstijladviezen rond vruchtbaarheid; nadruk op "wat
  redelijk en haalbaar is", niet op schuld of garanties.

### Kosten (NL, 2026 — gecontroleerd op 2026-06-23)
- Basisverzekering vergoedt in de geraadpleegde 2026-bronnen **maximaal 3
  IVF-/ICSI-pogingen per doorgaande zwangerschap** voor vrouwen **< 43 jaar**.
- Verplicht **eigen risico 2026 = € 385**.
- Een IVF-/ICSI-poging telt volgens de geraadpleegde 2026-verzekeraarsinformatie
  vanaf de punctie mee; ingevroren embryo's vallen binnen de poging waaruit ze
  ontstonden zolang geen doorgaande zwangerschap is ontstaan.
- Eigen polis, contractering, verwijzing/indicatie en verzekeraar blijven leidend.
- (Deze regels zijn ook in code vastgelegd in
  [`../src/domain/vergoeding.ts`](../src/domain/vergoeding.ts).)

### Research
- Begin met enkele betrouwbare overzichtsbronnen; voeg eigen gevonden artikelen toe.

## Bronnen (NL-gericht, te verifiëren)

**Traject/fasen**
- NVOG — https://www.nvog.nl/
- UMCG (IVF en ICSI) — https://www.umcg.nl/-/ivf-en-icsi
- Radboudumc
- Rijnstate
- Freya (patiëntenvereniging) — https://www.freya.nl/

**Leefstijl**
- Freya — "Vruchtbaarheid en lifestyle"
- Radboudumc — leefstijladviezen
- Voedingscentrum
- Review "Beyond BMI" — https://pmc.ncbi.nlm.nih.gov/articles/PMC7616016/

**Kosten/vergoeding (NL 2026)**
- Rijksoverheid — eigen risico zorgverzekering:
  https://www.rijksoverheid.nl/vraag-en-antwoord/zorgverzekering/eigen-risico-zorgverzekering
- Zorginstituut Nederland — eigen risico Zvw:
  https://www.zorginstituutnederland.nl/verzekerde-zorg/e/eigen-risico-zvw
- Zilveren Kruis — IVF en ICSI vergoeding 2026:
  https://www.zilverenkruis.nl/consumenten/vergoedingen/ivf
- Eigen polis / verzekeraar (leidend)

**Research**
- ESHRE — https://www.eshre.eu/
- Cochrane Library
- PubMed

**Privacy**
- Autoriteit Persoonsgegevens — https://www.autoriteitpersoonsgegevens.nl/

## Onderhoud

- Vergoedingscijfers gelden voor **2026**, zijn voor G172 gecontroleerd op
  **2026-06-23** en kunnen jaarlijks wijzigen — markeer het jaartal bij kosten-items.
- Markeer items expliciet als geverifieerd zodra een behandelaar ze heeft bevestigd;
  tot die tijd blijven ze "concept".
