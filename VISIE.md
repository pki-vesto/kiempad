# Kiempad — VISIE & DOELEN

> Dit document vervangt bewust de gangbare `PRD.md` uit de huisstijl van de andere
> apps. Die PRD-vorm gaat uit van een commercieel product (businessmodel, pricing,
> omzetscenario's). Kiempad is een **privéproject zonder commercieel doel**, dus die
> secties zijn niet van toepassing. We houden wél de geest van een PRD aan: helder
> waarom de app bestaat, voor wie, wat in/buiten scope is en wanneer het slaagt.

## Waarom Kiempad bestaat

Een IVF/ICSI-traject is intensief: veel fasen, afspraken, medicatie met strakke
timing, kosten en vergoedingsregels, en een stroom aan informatie waarvan niet
alles betrouwbaar of relevant is. Dat alles moet je doen terwijl het emotioneel
zwaar is. Kiempad is er om **rust en grip** te geven: één plek waar ons traject
overzichtelijk, betrouwbaar en privé samenkomt — warm en niet-klinisch.

Kiempad **vervangt geen zorg**. Het ordent informatie en helpt ons voorbereiden,
zodat de tijd met de behandelaars beter benut wordt. Wat de kliniek voorschrijft is
altijd leidend.

## Voor wie

Eén stel: **Peter & partner**. Geen externe gebruikers, geen distributie. Twee
profielen/rollen die samen één traject volgen ("gedeelde modus"), op Nederland
afgestemd.

## Wat succes is

Kiempad slaagt als:

1. We op elk moment in **één oogopslag** weten in welke fase we zitten en wat de
   eerstvolgende stap/afspraak is.
2. We **nooit een medicatie-inname of injectie missen** door tijdige, betrouwbare
   herinneringen.
3. We **voorbereid** een consult ingaan: onze vragen staan klaar en zijn naderhand
   beantwoord vastgelegd.
4. We **grip op de kosten** hebben: wat is vergoed, wat valt onder eigen risico, wat
   betalen we zelf.
5. We **belangrijke informatie en afwegingen terugvinden** wanneer we ze nodig
   hebben, met bron en — waar relevant — de markering of een arts het bevestigde.
6. We erop **vertrouwen dat onze data privé blijft**: centraal beschikbaar waar nodig,
   maar versleuteld at rest en niets naar derden zonder dat we daar bewust voor kiezen.

## Wat de app moet helpen oplossen (kernproblemen)

1. Overzicht over **fasen en planning**.
2. Weten wat we zelf kunnen doen qua **leefstijl en gezondheid**.
3. Grip op **kosten en vergoedingen**.
4. Relevante **research** verzamelen en (optioneel) samenvatten.
5. **Afwegingen tussen opties** gestructureerd vastleggen.

## Scope

**In scope (MVP):** trajectoverzicht/fasen · agenda & afspraken · medicatie- en
injectieschema · herinneringen · vragen-voor-de-arts · basis-kennisbank ·
centrale encrypted opslag · zichtbare disclaimer.

**In scope (later, nice-to-have):** symptoom-/cyclus-logging · kosten-/vergoedingen-
overzicht · research-bibliotheek met AI-samenvatting · gedeelde modus voor beide
partners · afwegingen/beslisnotities · mentale check-in.

**In scope (toekomst):** verdere multi-device syncverfijning · PDF-export voor het
consult · agenda-integratie (ICS) · trends over meerdere cycli.

De volledige, gefaseerde uitwerking staat in [`ROADMAP.md`](ROADMAP.md); de concrete,
afvinkbare doelen in [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md).

## Buiten scope (niet ter discussie)

- **Geen** product voor derden, **geen** distributie, **geen** multi-tenant of accounts
  voor anderen.
- **Geen** medisch hulpmiddel; **geen** dosering, diagnose of behandelkeuze door de
  app of de AI.
- **Geen** tracking, analytics of advertenties.
- **Geen** standaard dataversturing naar de cloud; externe diensten alleen opt-in en
  met dataminimalisatie.

## De 100+ doelen

De vereiste set van **minimaal 100 concrete, toetsbare doelen** is vastgelegd als de
backlog van het project in [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md). Elk doel heeft
een id, omschrijving, prioriteit en de roadmap-fase waar het bij hoort, en is
"afvinkbaar". De backlog ís daarmee de doelenlijst — we vermijden bewust een tweede,
los doelendocument dat uit de pas zou lopen.

## Principes (kort)

- **Privacy boven gemak** waar die botsen.
- **Niet-medisch, altijd verifieerbaar** — bron en arts-verificatie zichtbaar.
- **Local-first** — werkt offline; jouw toestel is de bron.
- **Klein beginnen** — een goede, onderhoudbare basis vóór een overcompleet bouwwerk.
- **Warm en rustig** — taal en UI zijn ondersteunend, niet klinisch of alarmerend.
