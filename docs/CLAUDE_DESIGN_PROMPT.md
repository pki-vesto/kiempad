# Claude Design Prompt — Kiempad Thema

Gebruik onderstaande prompt in Claude Design om het gemergde Kiempad-thema te auditen,
verfijnen en uitbreiden zonder functionaliteit te verliezen.

```text
Je werkt door op het gemergde thema van Kiempad, een persoonlijke privacy-first PWA
voor een Nederlands IVF/ICSI-traject van één stel. Ontwerp alleen de UI/UX-laag:
geen nieuwe productclaims, geen medische adviezen, geen datamodelwijzigingen en geen
externe diensten. Alle bestaande functionaliteit moet ondersteund blijven.

Context
- Productnaam: Kiempad.
- Taal: Nederlands.
- Doelgroep: Peter en partner, privégebruik.
- Domein: IVF/ICSI-overzicht, planning, medicatie, vragen, dossier, kennis, welzijn,
  kosten, afwegingen, back-up/sync en lokale beveiliging.
- Grondhouding: warm, rustig, helder, niet-klinisch, volwassen, betrouwbaar.
- Kiempad is geen medisch hulpmiddel. Toon de disclaimer consequent waar nodig.
- Privacy-first en local-first: gezondheidsdata blijft lokaal en versleuteld in de
  browser. Geen analytics, tracking, externe fonts, externe afbeeldingen of externe
  scripts.
- Huidige themabasis: een rustige naturalistische stijl met sage/groen als primaire
  actiekleur, warme lichte surfaces, donkere modus, serif accenten voor merk/hero en
  compacte werk-appnavigatie. Behoud deze richting tenzij een verbetering aantoonbaar
  beter is voor leesbaarheid, toegankelijkheid of workflow.

Ontwerpdoel
Audit en verfijn het bestaande thema zodat het rijker, consistenter en robuuster
voelt, maar de app functioneel en efficiënt houdt. Dit is een werk-app voor dagelijks
gebruik tijdens een emotioneel traject, geen marketinglandingspagina. Prioriteer
scanbaarheid, rust, duidelijke hiërarchie, goede touch targets, toegankelijke
contrasten en professionele formulier- en datavisualisatie.

Belangrijke stijlrichting
- Vermijd een klinisch ziekenhuisgevoel en vermijd een te speelse fertility-app-look.
- Gebruik een rustige, natuurlijke, hoopvolle palette met voldoende contrast.
- Niet overheersen met één kleur; ondersteun lichte en donkere modus.
- Gebruik subtiele accentkleuren voor status, categorie, waarschuwing en success.
- Geen decoratieve gradient-orbs, bokeh, drukke illustraties of stockfoto-gevoel.
- Cards maximaal 8px border-radius; geen cards-in-cards.
- Layouts moeten op mobiel en desktop zonder overlap werken.
- Geen viewport-geschaalde font sizes; tekst moet passen binnen buttons, tabs,
  pills en compacte panels.
- Gebruik duidelijke iconografie waar passend, maar iconen mogen tekst niet vervangen
  als dat de medische/veiligheidscontext onduidelijk maakt.

Technische randvoorwaarden
- Doel is een Vite/TypeScript PWA met bestaande HTML-rendering en CSS.
- Ontwerp moet te vertalen zijn naar CSS tokens/classes en bestaande componenten.
- Geen frameworkwissel voorstellen.
- Geen externe assets verplicht maken.
- Houd alle data- en interactiestromen local-first.
- Werk vanuit de bestaande `src/styles.css` tokens en de huidige light/dark
  theme-structuur; benoem expliciet welke tokens behouden, aangepast of toegevoegd
  moeten worden.
- Alle formulieren, lege staten, foutmeldingen, successmeldingen, disabled states,
  focus states, hover states, loading/wachtstates en confirmation states moeten
  ontworpen zijn.

Bestaande hoofdstructuur
De app heeft een passphrase-kluis vóór toegang en daarna een app-shell met topbar,
themakeuze, vergrendelknop, skiplink, primaire navigatie en hash-routes.

Ontwerp deze hoofdschermen volledig:
1. Kluisdeur
   - Nieuwe kluis aanmaken met passphrase.
   - Bestaande kluis ontgrendelen met passphrase.
   - WebAuthn/biometrie-ontgrendeling als gekoppeld.
   - Geen herstel-achterdeur uitleg.
   - Foutmelding bij verkeerde passphrase.
   - Niet-medische disclaimer.

2. Start
   - Huidige trajectstatus en volgende stap.
   - Komende afspraken en herinneringen.
   - Snelle invoer voor afspraak, medicatie of vraag vanuit korte tekst.
   - Lege staten.

3. Traject
   - Meerdere IVF/ICSI-pogingen.
   - Pogingnummer, type, status, start/einddatum, notitie.
   - Vaste fasen in volgorde, huidige fase markeren.
   - Archief/herstel.
   - Trajecttrends en vergoede-pogingen-teller.
   - Duidelijke waarschuwing: poging telt pas mee na geslaagde punctie.

4. Agenda
   - Afspraken toevoegen/bewerken/verwijderen.
   - Afspraaktypes, datum/tijd, voorbereiding, notitie, trajectkoppeling.
   - Vraag koppelen aan afspraak.
   - Herinnering vanuit afspraak.
   - Chronologische lijst, weekweergave, maandweergave.
   - Afgelopen afspraken met terugblik/notitie.
   - ICS import en ICS export.

5. Medicatie
   - Medicatie toevoegen/bewerken/verwijderen.
   - Vorm, actief/inactief, kliniekdosistekst, instructietekst.
   - Injectievorm apart herkenbaar.
   - DoseLogs op planning, vandaag-overzicht, innames genomen/overgeslagen.
   - Innameshistorie en notities per inname.
   - Optionele voorraad/dosisteller.
   - Lokale instructievideo als versleutelde bijlage.
   - Geen dosering berekenen of medisch advies suggereren.

6. Herinneringen
   - Centrale herinneringenlijst.
   - Eenmalig/dagelijks/wekelijks.
   - Snooze en opnieuw plannen.
   - Notificatiepermissie/status.
   - Generieke OS-notificaties standaard; details alleen na expliciete lokale keuze.
   - In-app meldingen/fallback.

7. Vragen
   - Vragen voor arts toevoegen/bewerken/verwijderen.
   - Prioriteit omhoog/omlaag.
   - Koppeling aan afspraak.
   - Beantwoord markeren met antwoordtekst.
   - Openstaande vragen voor volgende afspraak.
   - Vragenverslag per afspraak.
   - Printbaar consultoverzicht/PDF-export via browser.

8. Dossier
   - Meerdere historische onderzoeken uploaden.
   - Lokale niet-medische analyse van bestandsnaam, type en grootte.
   - Foto's, echo's en beelden uploaden met lokale preview uit de ontgrendelde dataset.
   - Gespreksverslagen uploaden en koppelen aan afspraak/traject.
   - Embryokwaliteit vastleggen per embryo/poging/terugplaatsing.
   - Embryostatus, dag, kwaliteit volgens kliniek, zonder kansberekening.
   - Dossierbijlagen worden encrypted bewaard; in centrale modus horen ze bij de centrale encrypted dataset, in legacy fallback bij de lokale encrypted dataset.

9. Kennis
   - Kennisitems per categorie: fasen, leefstijl, kosten, research.
   - Zoeken/filteren.
   - Eigen kennisitems toevoegen/bewerken.
   - Bronvermelding, AI-label, artsverificatielabel.
   - Jaarmarkering bij kostenkennis.
   - Researchitems opslaan.
   - AI-instellingen: opt-in, provider, model, API-sleutelveld.
   - AI-payload-preview met de-identificatie/minimalisatie.
   - AI-samenvatting opslaan als conceptkennis met waarschuwing + bron.
   - On-device AI-status: passieve browsercapability-check, geen sessie,
     geen modeldownload, geen cloudstap.
   - AI mag nooit dosering, diagnose of behandelkeuze adviseren.

10. Welzijn
   - Symptoomlogs met datum, eigenaar (Peter/partner/samen), symptoom, intensiteit,
     notitie.
   - Symptomen per dag en over tijd.
   - Cyclusmetingen zoals temperatuur of bloeding als feitelijke registratie.
   - Mentale check-ins met stemming en privé notitie.
   - Welzijnsoverzicht zonder oordeel, score of normering.
   - Maandtrends voor aantallen en gemiddelde intensiteit.

11. Afwegingen
   - Beslisnotities met onderwerp, datum en opties.
   - Per optie voors/tegens.
   - Keuze vastleggen met datum en onderbouwing.
   - Beslisverslag terugleesbaar.
   - Optionele koppeling aan bestaande vraag voor de arts.

12. Kosten
   - Kostenposten toevoegen/bewerken/verwijderen.
   - Bedrag, datum, categorie, vergoedstatus, trajectkoppeling.
   - Kostenoverzicht: totaal, vergoed, mogelijke eigen bijdrage, onbekend.
   - Eigen-risicoteller 2026 met 385 euro.
   - Geen financieel advies; eigen polis en verzekeraar blijven leidend.

13. Logboek
   - Lokale gebeurtenissen: kluis, back-up, systeem.
   - Recente gebeurtenissen met categorie, datum/tijd en detail.
   - In centrale modus staat het logboek in de centrale encrypted dataset; in legacy fallback blijft het op het toestel.

14. Back-up en beveiliging
   - Versleutelde `.kiempad-export` downloaden/importeren.
   - Checksum-gecontroleerde import.
   - Back-upaanmoediging bij ontbrekende of oude back-up.
   - Centrale modus: multi-device continuïteit via de centrale encrypted API/dataset; `.kiempad-sync` is alleen optionele handmatige encrypted recordoverdracht.
   - Legacy fallback: `.kiempad-sync` pakket downloaden/importeren voor een via back-up gekoppelde lokale kluis.
   - Conflicten last-wins op `updatedAt`.
   - WebAuthn/biometrie koppelen als optioneel lokaal ontgrendelgemak via PRF-keywrap.
   - Passphrase blijft fallback en herstelroute.
   - Tailscale-publicatie zichtbaar in docs/beheercontext: live op
     `https://kiempad.tail9d0c71.ts.net`, tailnet-only, geen serverdata.

Navigatie en informatiearchitectuur
- Houd de bestaande hoofdschermen herkenbaar.
- Maak de navigatie compact maar goed scanbaar op desktop.
- Voor mobiel: nav mag horizontaal scrollen of in een compacte structuur, maar alle
  schermen moeten bereikbaar blijven zonder overlap.
- Geef gevaarlijke acties, verwijderen en importeren duidelijke confirmation/foutstaten.
- Maak status-pills consistent: concept, geverifieerd, AI, eigenaar, trajectstatus,
  afspraakstatus, medicatiestatus, vergoedstatus, backupstatus.

Componenten die je moet specificeren
- App topbar, skiplink, primaire navigatie.
- Workspace layout, form panel, timeline/list panel, summary/policy panel.
- Forms: labels, inputs, textareas, selects, file inputs, date/time fields.
- Buttons: primary, secondary, destructive, icon-capable, disabled.
- Status pills/chips.
- Tables/lists/timelines.
- Empty states.
- Inline success/error/warning/info messages.
- Details/summary edit sections.
- Preview blocks voor payloads, bestanden, beelden en video's.
- Charts/trend visuals zonder oordeel of medische interpretatie.
- Print/PDF-friendly consultoverzicht.
- Light en dark mode tokens.

Accessibility
- WCAG AA contrast.
- Zichtbare focus states.
- Touch targets minimaal 44px waar praktisch.
- Labels altijd zichtbaar en gekoppeld aan velden.
- Niet alleen kleur gebruiken voor status.
- Screenreader-vriendelijke aria-labels voor contextuele acties.
- Respecteer reduced motion.

Privacy en veiligheid in de UI
- Maak local-first zichtbaar maar niet schreeuwerig.
- Geen passphrase of API-sleutel terug tonen.
- File previews alleen na ontgrendeling.
- Duidelijke copy voor: geen herstel-achterdeur, versleutelde back-up, geen medisch
  advies, AI-output ongeverifieerd, geen doseringsadvies, geen tracking.
- Geen dark patterns om AI, notificatiedetails, sync of WebAuthn te activeren.

Deliverables
Lever een designvoorstel op met:
1. Een korte ontwerpvisie in het Nederlands.
2. Een baseline-audit van het gemergde thema: wat behouden, wat aanscherpen, wat
   ontbreekt.
3. Design tokens: kleur, typografie, spacing, radius, schaduw, borders, focus.
4. Light en dark mode.
5. Componentrichtlijnen voor alle genoemde componenten.
6. Per hoofdscherm een layoutbeschrijving voor desktop en mobiel.
7. Concrete microcopy voor lege staten, foutmeldingen en privacywaarschuwingen.
8. Interactiestates voor formulieren, uploads, import/export, WebAuthn, AI-preview,
   notificaties en sync.
9. Een implementatiechecklist voor CSS/HTML-aanpassingen zonder functionaliteit te
   breken.

Belangrijk: ontwerp geen nieuwe backend, geen medische beslisfunctionaliteit, geen
kansberekeningen, geen cloudsync en geen externe tracking. Het thema moet alle
bestaande Kiempad-functionaliteit ondersteunen.
```
