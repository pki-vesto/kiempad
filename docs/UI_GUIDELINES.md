# UI-richtlijnen (Claude Design)

Doel: voorkomen dat de UI opnieuw afdrijft naar een generieke dashboard-/admin-look.
De bron van waarheid is het Claude Design-prototype (`Kiempad-prototype.dc.html`) en
`docs/CLAUDE_DESIGN_PROMPT.md`; de tokens staan in `src/styles.css`. Laatste MCP-
import: project `dab87658-12f7-476d-80f2-f36de2acb4ae`, bestand
`Kiempad-prototype.dc.html`, etag `1782338087299810`.

## Kernprincipes

- **Mobiel-first, één kolom.** Schermen zijn een verticale `sectionStack`, niet een
  dichte twee-koloms vorm-/lijstindeling.
- **Leid met inhoud, niet met formulieren.** Toon eerst status/overzicht/lijsten;
  stop secundaire invoer achter een uitklap (`disclosure`).
- **Rustig en warm, niet klinisch.** Lora (serif) voor koppen, Figtree (sans) voor
  tekst; sage-groen + warme aardtinten; ruime witruimte.
- **Privacy en encrypted opslag zichtbaar maar rustig.** Geen externe assets (CSP +
  asset-scan); iconen zijn inline SVG. Centrale modus benoemt de centrale encrypted
  dataset, legacy fallback benoemt lokale encrypted opslag.
- **Toegankelijk by default.** WCAG AA-contrast, zichtbare focus, ≥44px touch
  targets, gekoppelde labels, status nooit alleen via kleur, `prefers-reduced-motion`.

## Canonieke componenten (`src/ui/components.ts`)

Bouw schermen uit deze helpers in plaats van losse markup:

- `pageHeader({title, eyebrow?, date?, intro?, titleId?})` — rustige schermkop
  (vervangt de oude `.hero`).
- `sectionStack(children, {ariaLabel?})` — verticale één-koloms layout.
- `card({title?, eyebrow?, body, variant?})` — afgeronde surface-kaart.
- `actionCard({title, href?, subtitle?, iconName?, tone?})` — tikbare vervolgkaart
  met getinte icoon-tegel.
- `phaseHeroCard({phaseLabel, eyebrow?, subtitle?, steps?, cta?})` — donker-sage
  fase-hero met voortgangsstippen.
- `statRow(items)` — scanbare cijferrij.
- `timeline(items, {id?})` — verticale stip/lijn-tijdlijn.
- `accordion(items)` / `disclosure({summary, body, open?})` — progressive disclosure.
- `emptyState`, `loadingSkeleton`, `errorBanner`, `statusMessage` — statussen.
- `icon(name)` — inline SVG (CSP-veilig).

Tekstparameters worden binnen de helper ge-escaped; `body`/`children` zijn rauwe HTML.

## Verboden patronen (template-artefacten)

- ❌ `traject-layout` / `workspace` twee-koloms vorm+lijst-rasters.
- ❌ Schermen die met een muur van altijd-zichtbare formulieren beginnen.
- ❌ Kaart-in-kaart (geneste bordered panels).
- ❌ Generieke `.hero` met losse eyebrow-labels als "MVP basis".
- ❌ Externe fonts/afbeeldingen/scripts of CDN-verwijzingen.
- ❌ Viewport-geschaalde lettergroottes die uit knoppen/pills lopen.
- ❌ Status alleen met kleur (gebruik tekst/icoon erbij).

## Bij een nieuw scherm

1. `pageHeader` (komt automatisch via de app-shell) → leid met inhoud in een
   `sectionStack`.
2. Primaire status/lijsten eerst; invoer achter `disclosure`.
3. Behoud alle bestaande `id`/`name`/`data-*` hooks zodat bindingen in `main.ts`
   blijven werken.
4. Controleer responsively (320/768/1024/1280), licht + donker, en de CI-poorten
   (`typecheck`, `lint`, `test`, `build`, `assets:check`).
