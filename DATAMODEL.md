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
KennisItem (n)        (kennisbank; deels vaste inhoud)
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
| tijdstip | IsoDate | |
| herhaling | `eenmalig` \| `dagelijks` \| `wekelijks` ? | |
| actief | boolean | |

### Vraag (voor de arts)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| vraag | string | |
| voorAfspraakId | string? | → Afspraak |
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

### SymptomLog (later)
| veld | type | opmerking |
|---|---|---|
| id | string | |
| datum | IsoDate | |
| owner | Owner | |
| symptoom | string | |
| intensiteit | number (1–5)? | |
| notitie | string? | |

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

### Settings
| veld | type | opmerking |
|---|---|---|
| id | string | enkel record |
| profielen | `{ peter, partner }` | namen/voorkeuren |
| gedeeldeModus | boolean | |
| ai | `{ ingeschakeld, provider?, model? }` | sleutel staat versleuteld, niet hier in klare tekst |
| herinneringStandaarden | object | bv. standaard waarschuwtijd |
| taal | string | default `nl` |

## Opslag & versleuteling (kort)

- Records worden als **versleutelde blobs** in IndexedDB bewaard; alleen
  niet-gevoelige indexvelden (bv. `type`, `datum` voor sortering) staan in klare
  tekst waar zoeken dat vereist — bewust minimaal.
- Migraties zijn **additief**: velden komen erbij, betekenis van bestaande velden
  verandert niet (vgl. de "additive-only" lijn in het ecosysteem).
- Export/back-up serialiseert alle records **versleuteld** naar één bestand.
