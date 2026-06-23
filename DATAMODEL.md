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
| categorie | `onderzoek` \| `beeld` \| `gespreksverslag` \| `embryo` \| `overig` | G175 gebruikt primair `onderzoek` |
| bestandsNaam | string | originele bestandsnaam |
| mimeType | string? | browser-bestandstype indien bekend |
| grootteBytes | number | originele bestandsgrootte |
| inhoudBase64 | string | bestandsinhoud, versleuteld opgeslagen in recordpayload |
| notitie | string? | lokale toelichting |
| analyse | `{ samenvatting, signalen[] }` | lokale, niet-medische analyse van naam/type/grootte |
| uploadedAt | IsoDate | moment van lokaal toevoegen |

### Settings
| veld | type | opmerking |
|---|---|---|
| id | string | enkel record |
| profielen | `{ peter, partner }` | namen/voorkeuren |
| gedeeldeModus | boolean | |
| ai | `{ ingeschakeld, provider?, model?, apiKey?, laatsteOptInOp? }` | API-sleutel staat alleen in het versleutelde lokale settingsrecord, niet in repo/.env |
| afspraakWaarschuwingMinuten | number | standaard afspraakherinnering, default 30 minuten vooraf |
| laatsteBackupOp | IsoDate? | laatst bekende succesvolle versleutelde export |
| herinneringStandaarden | object | bv. standaard waarschuwtijd |
| taal | string | default `nl` |
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
