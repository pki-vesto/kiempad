# Kiempad — DATAMODEL

> Entiteiten, velden en relaties. De stabiele kernvormen staan ook in code in
> [`src/domain/types.ts`](src/domain/types.ts), zodat docs en implementatie niet
> uit elkaar lopen. Alles wordt **versleuteld lokaal** opgeslagen (zie
> [`SECURITY.md`](SECURITY.md)). Dit is een eerste, verfijnbare schets.

## Overzicht & relaties

```
Settings (1)

Traject (1) ──< Fase (n)
   │
   ├──< Afspraak (n) ──< Vraag (n)        (vraag kan ook los staan)
   │
   └──< (context voor onderstaande logs)

Medicatie (n) ──< DoseLog (n)
Medicatie/Afspraak/eigen ──< Herinnering (n)

SymptomLog (n)        CycleData (n)
CostItem (n)          Decision (n)
EventLog (n)          KennisItem (n)        (kennisbank; deels vaste inhoud)
DossierDocument (n)   (historische onderzoeken en latere dossierbijlagen)
ConsultVerslag (n)    (consultnotities en gespreksverslagen als eigen recordtype)
```

Conventies:

- **id**: stabiele unieke string (UUID), client-side gegenereerd.
- **datums/tijden**: ISO-8601 als tekst (`YYYY-MM-DD` of datum-tijd) voor stabiele
  sortering en export.
- **owner** (gedeelde modus): `peter | partner | samen`.
- Vrije tekst is **gevoelig** en wordt altijd versleuteld opgeslagen.

## Entiteiten

### Traject (cyclus/poging)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| naam | string | bv. "Poging 1" |
| type | `ivf` \| `icsi` \| `onbekend` | |
| startDatum | IsoDate | |
| status | `gepland` \| `lopend` \| `afgerond` \| `gepauzeerd` \| `geannuleerd` | |
| pogingNummer | number | telt voor vergoeding pas na geslaagde punctie |
| teltMeeVoorVergoeding | boolean? | handmatige markering na geslaagde punctie |
| gearchiveerd | boolean? | verbergt traject uit actieve lijst zonder records/fasen te verwijderen |
| notitie | string? | |

### Fase
| veld | type | opmerking |
|---|---|---|
| id | string | |
| trajectId | string | → Traject |
| fase | enum | voorbereiding, stimulatie, punctie, lab_bevruchting, terugplaatsing, wachttijd, zwangerschapstest, uitslag, pauze |
| startDatum / eindDatum | IsoDate? | |
| toelichting | string? | |

### Afspraak
| veld | type | opmerking |
|---|---|---|
| id | string | |
| trajectId | string? | optioneel gekoppeld |
| titel | string | |
| datumTijd | IsoDate | |
| locatie | string? | |
| type | `echo` \| `bloedprik` \| `punctie` \| `terugplaatsing` \| `consult` \| `overig` | |
| voorbereiding | string? | |
| notitie | string? | |

### Medicatie
| veld | type | opmerking |
|---|---|---|
| id | string | |
| naam | string | |
| vorm | `injectie` \| `tablet` \| `neusspray` \| `zetpil` \| `overig` | |
| voorgeschrevenDosis | string? | **zoals door de kliniek opgegeven**; de app berekent geen dosering |
| instructie | string? | |
| actief | boolean | |
| voorraadAantal | number? | optionele teller met resterend aantal doses; geen doseringsadvies |
| instructieVideo | `{ bestandsNaam, mimeType?, grootteBytes, inhoudBase64 }?` | optionele lokale video-bijlage; geen externe embed/tracking |

### DoseLog (inname/injectie)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| medicatieId | string | → Medicatie |
| geplandOp | IsoDate | |
| genomenOp | IsoDate? | |
| status | `gepland` \| `genomen` \| `overgeslagen` | |
| notitie | string? | |

### Herinnering
| veld | type | opmerking |
|---|---|---|
| id | string | |
| bron | `{ soort: 'medicatie'\|'afspraak'\|'eigen', refId? }` | |
| titel | string? | label voor eigen losse herinneringen |
| tijdstip | IsoDate | |
| herhaling | `eenmalig` \| `dagelijks` \| `wekelijks` ? | |
| actief | boolean | |

### Vraag (voor de arts)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| vraag | string | |
| voorAfspraakId | string? | → Afspraak |
| prioriteit | number? | lagere waarde = hoger op consultlijst |
| beantwoord | boolean | |
| antwoord | string? | |

### KennisItem (kennisbank)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| titel | string | |
| inhoud | string | |
| bron | string? | NL-bron, zie KENNISBANK.md |
| categorie | `fasen` \| `leefstijl` \| `kosten` \| `research` \| `overig` | |
| researchPublicatie | `{ publicatieDatum, wetenschappelijkeSamenvatting, bron }?` | handmatige wetenschappelijke samenvatting per researchpublicatie met bron en datum |
| ai_gegenereerd | boolean | toont waarschuwingslabel |
| geverifieerd_met_arts | boolean | toont "bevestigd" pas na arts |
| geverifieerdOp | IsoDate? | datum waarop behandelaar bevestigde |
| volgendeVerificatieOp | IsoDate? | periodieke herverificatie uiterlijk op deze datum |

### SymptomLog (later)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | |
| owner | Owner | |
| symptoom | string | |
| intensiteit | number (1–5)? | |
| notitie | string? | |

### MentalCheckIn (later)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | |
| owner | Owner | |
| stemming | `goed` \| `ok` \| `zwaar` | korte check-in zonder score |
| notitie | string? | privé notitie |

### CycleData (later)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | |
| meting | string | bv. temperatuur, bloeding |
| waarde | string \| number | |

### CostItem (later)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| trajectId | string? | |
| omschrijving | string | |
| bedrag | number | euro |
| datum | IsoDate | |
| categorie | `medicatie` \| `behandeling` \| `reis` \| `overig` | |
| vergoed | `ja` \| `nee` \| `eigen_risico` \| `onbekend` | |

### Decision (afweging, later)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| onderwerp | string | |
| vraagId | string? | optionele koppeling naar vraag voor de arts |
| opties | `{ titel, voors[], tegens[] }[]` | |
| keuze | string? | |
| onderbouwing | string? | |
| datum | IsoDate | |

### EventLog (lokaal gebeurtenissenlog)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | datum-tijd van de gebeurtenis |
| categorie | `kluis` \| `backup` \| `ai` \| `systeem` | privacyrelevante lokale categorie |
| gebeurtenis | string | korte beschrijving |
| detail | string? | optionele lokale toelichting |

EventLog-records worden versleuteld lokaal opgeslagen en verlaten het toestel niet
via de app. Ze zijn bedoeld voor transparantie over kluis-, back-up-, AI- en
systeemgebeurtenissen.

### DossierDocument (historisch onderzoek)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | datum van onderzoek/document |
| titel | string | herkenbare lokale titel |
| categorie | `onderzoek` \| `beeld` \| `gespreksverslag` \| `embryo` \| `overig` | `beeld` ondersteunt foto's, echo's en ander beeldmateriaal |
| bestandsNaam | string | originele bestandsnaam |
| mimeType | string? | browser-bestandstype indien bekend |
| grootteBytes | number | originele bestandsgrootte |
| inhoudBase64 | string | bestandsinhoud, versleuteld opgeslagen in recordpayload |
| afspraakId | string? | optionele koppeling naar relevante afspraak |
| trajectId | string? | optionele koppeling naar relevante poging/traject |
| embryo | `{ label, kwaliteit, dag?, status?, meetmoment?, kliniekTerminologie?, bron? }?` | optionele kliniekterugkoppeling over embryokwaliteit per meetmoment, met kliniekterminologie en bron, zonder kansberekening |
| beeldMetadata | `{ datum?, soort?, context?, bron?, trajectId?, afspraakId?, cyclusDag?, embryoLabel?, embryoId?, embryoDag?, laboratoriumContext? }?` | optionele beeldcontext voor foto's, echo's, scans en embryo-afbeeldingen; embryo-id, embryodag en labcontext koppelen uploads aan embryo-dossier en tijdlijn |
| notitie | string? | lokale toelichting |
| analyse | `{ samenvatting, signalen[] }` | lokale, niet-medische analyse van naam/type/grootte |
| uploadedAt | IsoDate | moment van lokaal toevoegen |

### ConsultVerslag
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | datum van consult of gesprek |
| titel | string | herkenbare lokale titel |
| bron | `upload` \| `handmatig` | onderscheid tussen bestand en ingeplakte notitie |
| bestandsNaam | string? | originele bestandsnaam bij upload |
| mimeType | string? | browser-bestandstype indien bekend |
| grootteBytes | number? | originele bestandsgrootte |
| inhoudBase64 | string? | bestandsinhoud, versleuteld opgeslagen in recordpayload |
| tekst | string? | handmatige tekst of uitgelezen tekst |
| afspraakId | string? | optionele koppeling naar relevante afspraak |
| trajectId | string? | optionele koppeling naar relevante poging/traject |
| notitie | string? | lokale toelichting |
| samenvatting | `{ status, methode, tekst, bronnen[], waarschuwing, gegenereerdOp }?` | lokale conceptsamenvatting met bronverwijzing; geen medisch advies |
| samenvattingCorrectie | `{ tekst, bijgewerktOp }?` | gebruikerscorrectie op de conceptsamenvatting; lokaal diffbaar |
| actiepunten | `{ id, soort, status, tekst, bron, aangemaaktOp }[]?` | lokale concepttaken of conceptvragen uit consulttekst; gebruiker controleert |
| uploadedAt | IsoDate | moment van lokaal toevoegen |

ConsultVerslag-records zijn bewust gescheiden van algemene dossierdocumenten,
zodat consult-intelligence later samenvattingen, actiepunten en vragenlijsten kan
opbouwen zonder historische onderzoeken of beeldmateriaal te vervormen.

### Settings
| veld | type | opmerking |
|---|---|---|
| id | string | enkel record |
| profielen | `{ peter, partner }` | namen/voorkeuren |
| gedeeldeModus | boolean | |
| ai | `{ ingeschakeld, provider?, model?, apiKey?, laatsteOptInOp? }` | API-sleutel staat alleen in het versleutelde lokale settingsrecord, niet in repo/.env |
| researchNetwerk | `{ ingeschakeld, laatsteOptInOp? }` | expliciete opt-in voor researchaggregatie; default uit en geen automatische netwerkrequests |
| afspraakWaarschuwingMinuten | number | standaard afspraakherinnering, default 30 minuten vooraf |
| laatsteBackupOp | IsoDate? | laatst bekende succesvolle versleutelde export |
| herinneringStandaarden | object | bv. standaard waarschuwtijd |
| taal | string | default `nl` |
| thema | `licht` \| `donker` | lokale weergavevoorkeur, default `licht` |
| toonNotificatieDetailsOpVergrendelscherm | boolean | default `false` |

## Opslag & versleuteling (kort)

- Records worden als **versleutelde blobs** in IndexedDB bewaard; alleen
  niet-gevoelige indexvelden (bv. `type`, `datum` voor sortering) staan in klare
  tekst waar zoeken dat vereist — bewust minimaal.
- De opslagmetadata bevat een `schema` record met de huidige schemaversie. De app
  vult ontbrekende schemametadata bij ontgrendelen aan en weigert een kluis met een
  nieuwer schema dan deze app ondersteunt.
- Migraties zijn **additief**: velden komen erbij, betekenis van bestaande velden
  verandert niet (vgl. de "additive-only" lijn in het ecosysteem).
- Export/back-up serialiseert alle records **versleuteld** naar één bestand.
