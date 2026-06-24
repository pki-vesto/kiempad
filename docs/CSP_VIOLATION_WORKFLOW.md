# CSP Violation Workflow

Kiempad gebruikt een local-first Content Security Policy in `index.html`. CSP
overtredingen kunnen wijzen op een regressie in scripts, assets, connecties of
browserextensies. De diagnose blijft standaard lokaal: Kiempad verstuurt geen CSP
reports naar een remote endpoint.

Kernregel: geen CSP reports naar een remote endpoint.

## Waarom geen remote CSP reports?

- CSP reports kunnen volledige URL's, geblokkeerde bronnen, referrers en soms
  context uit lokale routes bevatten.
- Kiempad bevat fertiliteitscontext en moet geen telemetrykanaal introduceren voor
  browserdiagnostiek.
- De app heeft geen backend die privacyveilig report ingestion, retentie,
  toegangsbeheer en verwijdering kan afdwingen.

Daarom bevat `index.html` geen `report-uri` en geen `report-to`. Ook een toekomstige
`Content-Security-Policy-Report-Only` header mag niet naar een remote endpoint wijzen
zonder nieuw architectuurbesluit.

## Lokale diagnose in development

1. Start de app lokaal met `npm run dev`.
2. Open browser DevTools en filter Console op `Content Security Policy`.
3. Controleer Network op geblokkeerde `script`, `connect`, `img`, `font`, `media` of
   `manifest` requests.
4. Draai `npm run assets:check` om remote asset-URL's in bron- en buildassets uit te
   sluiten.
5. Controleer of de overtreding door een browserextensie komt door dezelfde pagina in
   een schoon profiel of private venster zonder extensies te openen.

Noteer in PR's alleen generieke bevindingen, bijvoorbeeld "remote font geblokkeerd in
thema-CSS". Kopieer geen volledige lokale URL's, dossierinhoud, querystrings of
screenshots met persoonlijke data.

## Lokale diagnose in productiepreview

1. Maak een build met `npm run build`.
2. Start een lokale preview met `npm run preview` of draai `npm run smoke:offline`.
3. Open DevTools Console en Network zoals hierboven.
4. Controleer daarna opnieuw `npm run assets:check`.
5. Als de overtreding alleen in preview optreedt, inspecteer `dist/index.html` en
   gebundelde assets lokaal; publiceer geen remote reportdump.

## Voorwaarden voor ooit remote reporting

Remote CSP reporting blijft standaard uit. Voordat het ooit wordt toegestaan, moet er
een nieuwe ADR en een aparte security-goal zijn met minimaal:

- expliciete opt-in of een aantoonbaar privacyveilig alternatief;
- minimale payload zonder lokale routes, querystrings, record-id's of user content;
- korte retentie, toegangsbeheer en verwijderprocedure;
- documentatie van wie reports kan zien en hoe incidenten worden afgehandeld;
- tests die `index.html` en deploymentconfig blokkeren wanneer report endpoints zonder
  deze governance worden toegevoegd.

Zonder die voorwaarden blijft lokale browserdiagnostiek de enige ondersteunde
CSP-violation workflow.
