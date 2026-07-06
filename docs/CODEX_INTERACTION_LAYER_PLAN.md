# Kiempad — Codex Interaction & Perceived-Quality Plan

> **Opdracht voor Codex.** Dit document beschrijft één samenhangend werkpakket dat de
> ervaren kwaliteit van Kiempad naar "professionele app" tilt, zonder de local-first,
> privacy-veilige architectuur op te geven. Het volgt dezelfde canon en harde regels als
> [`CODEX_BUILD_PROMPT.md`](../CODEX_BUILD_PROMPT.md) en het
> [`CODEX_FIX_PLAN.md`](CODEX_FIX_PLAN.md); waar iets conflicteert wint
> `MASTER_CONTEXT.md` en winnen de harde regels P1–P6.

Roep aan met bijvoorbeeld:

```
/goal Lees docs/CODEX_INTERACTION_LAYER_PLAN.md en bouw Fase A (render-continuïteit,
      G2035–G2037). Eén coherente PR per goal, validatiegate groen, docs + backlog
      bijwerken. Zero nieuwe runtime-dependencies tenzij het goal expliciet een
      gevendorde/ADR-gate voorschrijft.
```

Nieuwe G-codes in dit plan: **G2035–G2046** (hoogste bestaande was G2034). Codex
registreert ze in `EXECUTION_GOALS.md` + `PRODUCT_BACKLOG.md` en opent issues conform de
eigen Definition of Done (`MASTER_CONTEXT.md` §8).

---

## Executive Summary

De app is technisch gezond maar **voelt** als een statische HTML-pagina: schermen
"klikken" hard van de één naar de ander, zonder continuïteit, beweging of diepte. Dat is
géén gevolg van de stack- of backendkeuze (local-first + versleutelde vault is een juiste,
bewuste keuze), maar van **hoe** er gerenderd wordt en van een **ontbrekende
interactie-/motionlaag**. Dit plan pakt dat in vijf fasen aan, van hoogste rendement naar
laagste, met **zero nieuwe runtime-dependencies als uitgangspunt**.

## Diagnose (bewijs uit de codebase)

| Bevinding | Bewijs | Gevolg voor het gevoel |
|---|---|---|
| Hele shell wordt per state herbouwd | `src/main.ts`: `root.innerHTML = renderAppShell(...)`, 64 render-aanroepen | Flikker, verlies van scroll/focus/inputs/open-standen; "pagina-reload"-gevoel |
| Vrijwel geen motion | `src/styles.css` (32.440 regels): 1× `@keyframes`, 2× `animation:` | Geen gelaagdheid, geen continuïteit |
| View Transitions ongebruikt | `startViewTransition`: 0 hits in `src/` | Geen vloeiende overgang tussen schermen |
| Async zonder choreografie | echte async in `centralApi`, `crypto`, `webauthn`, `backup`, `indexedDbDriver`; nauwelijks laadstates | "Instant maar goedkoop"; geen waargenomen diepte |
| Monolithische view/stijl | `styles.css` 32k regels, `appShell.ts` 24k regels in één bestand | Polish is praktisch onwerkbaar → verborgen oorzaak |

**Wat al goed zit en hergebruikt moet worden:** design-tokens (`--motion`, `--shadow-1`,
`--shadow-soft`, `--shadow-2`, 292 shadow/elevation/radius-tokens), respect voor
`prefers-reduced-motion` (7×), en een componentlaag met `loadingSkeleton`, `emptyState`,
`errorBanner`, `statusMessage` in [`src/ui/components.ts`](../src/ui/components.ts).

---

## Harde randvoorwaarden (gelden voor élk goal hieronder)

Bovenop P1–P6 uit `CODEX_BUILD_PROMPT.md`:

1. **Geen nieuw uitgaand verkeer, geen CDN, geen third-party runtime-scripts.** Alles wat
   nodig is wordt **lokaal gebundeld door Vite** of **gevendord** in `src/vendor/` met
   licentie-header. `assets:check` en `deps:review` blijven groen.
2. **Zero-dependency-first.** Native browser-API's (View Transitions, Web Animations API,
   CSS) hebben voorrang. Een externe library mag **alleen** als een goal dat expliciet
   voorschrijft, en dan **gevendord + gepind + MIT/BSD/Apache + zonder transitieve deps**,
   met een ADR.
3. **Progressive enhancement.** Elke transitie/animatie moet **degraderen** naar de
   huidige directe render als de API ontbreekt (Safari/Firefox-verschillen). Nooit een
   witte/gebroken staat bij niet-ondersteunde browsers.
4. **Toegankelijkheid.** Alle motion achter `prefers-reduced-motion: reduce`
   (uit = geen niet-essentiële animatie). Focusvolgorde, ARIA-live-regio's en
   screenreader-gedrag mogen niet verslechteren door transities of DOM-morphing.
5. **Geen medische logica geraakt.** Puur presentatie/interactie. Disclaimers, dosering en
   berekeningen ongewijzigd (P1/ADR-0004).
6. **Klein en terugdraaibaar.** Eén goal = één coherente PR. Bestaande gate volledig
   groen: `lint`, `typecheck`, `test`, `assets:check`, `secrets:check`, `fixtures:check`,
   `deps:review`, `backlog:health`, `goals:score`.

---

## Fase A — Render-continuïteit (root cause) · Prioriteit P0

Doel: van "DOM weggooien en herbouwen" naar **state-behoudende, vloeiende** rendering.

### G2035 — View-Transition render-boundary (native, zero-dep)
**Goal.** Introduceer één centrale render-boundary in `src/main.ts` die de bestaande
`root.innerHTML = renderAppShell(...)` wrapt in `document.startViewTransition(...)`, met
progressive-enhancement fallback.

**Acceptance Criteria.**
- Een helper `mountView(root, html)` (of gelijkwaardig) wordt door alle 64 render-paden
  gebruikt; niemand zet nog rechtstreeks `innerHTML` op de shell-root.
- Gebruikt `document.startViewTransition` wanneer beschikbaar, anders directe render.
- Uit bij `prefers-reduced-motion: reduce`.
- Geen wijziging aan wat er gerenderd wordt (alleen hoe).
- Vitest/DOM-test dekt: beschikbaar → transition-pad; niet beschikbaar → directe render;
  reduced-motion → directe render.

**Metadata.** Epic: Premium Claude Design UI · Priority: P0 · Complexity: M ·
Related Components: `src/main.ts`, `src/styles.css` (`::view-transition*`) · ADR Needed: no
· Governance: Network none · Data none · Medical: disclaimers unchanged.

### G2036 — DOM-morphing i.p.v. `innerHTML =`
**Goal.** Vervang de destroy-rebuild door **DOM-diffing** zodat scrollpositie, focus,
ingetypte tekst en `<details>`-standen behouden blijven.

**Aanpak (kies A, documenteer in ADR-0010).**
- **A (aanbevolen): morphdom gevendord.** Kopieer de single-file MIT-bron naar
  `src/vendor/morphdom/` met licentie-header en versie-pin; `mountView` gebruikt
  `morphdom(root, html)` i.p.v. `innerHTML`. Zelf-gehost, auditeerbaar, geen npm-runtime-dep
  (net als de zelf-gehoste fonts).
- **B (purist): eigen minimale keyed reconciler** in `src/vendor/` — geen third-party code.

**Acceptance Criteria.**
- Na een render blijven scrollpositie, actief focus-element, `<details open>` en
  formulier-inputwaarden behouden (Vitest/DOM-test bewijst dit).
- Combineert correct met G2035 (morph binnen de view-transition).
- `assets:check` + `deps:review` groen; geen externe URL, geen transitieve deps.
- ADR-0010 legt keuze A/B, licentie en supply-chain-afweging vast.

**Metadata.** Epic: Premium Claude Design UI · Priority: P0 · Complexity: L ·
Related Components: `src/main.ts`, `src/vendor/` · ADR Needed: **yes (ADR-0010)** ·
Governance: Network none · Data none · Medical: unchanged.

### G2037 — Shared-element transitions tussen schermen
**Goal.** Geef terugkerende elementen (page-header, actieve nav-pill, workspace-strip) een
`view-transition-name` zodat ze **morphen** i.p.v. verspringen bij navigatie.

**Acceptance Criteria.**
- Header en actieve navigatie-indicator behouden visuele continuïteit tussen schermen.
- Namen zijn uniek per gelijktijdig zichtbaar element (geen dubbele `view-transition-name`).
- Reduced-motion-safe; fallback ongewijzigd.

**Metadata.** Epic: Premium Claude Design UI · Priority: P1 · Complexity: M ·
Related Components: `src/styles.css`, `src/ui/components.ts` · ADR Needed: no ·
Governance: Network none · Data none · Medical: unchanged.

---

## Fase B — Motionlaag · Prioriteit P1

### G2038 — Motion- & elevation-tokens uitbreiden
**Goal.** Breid de bestaande `--motion`/`--shadow-*` uit tot een echt schaalsysteem:
duraties (`--dur-fast/base/slow`), easings (`--ease-standard/emphasized/spring`) en een
elevation-schaal (`--elevation-0..3`) bovenop de huidige shadows.

**Acceptance Criteria.**
- Tokens gedefinieerd in `:root` + dark-variant; bestaande waarden blijven backward-compatible.
- Alle nieuwe animaties/transities in dit plan gebruiken deze tokens (geen magic numbers).
- Documentatie-comment in `styles.css` bij het tokenblok.

**Metadata.** Epic: Premium Claude Design UI · Priority: P1 · Complexity: S ·
Related Components: `src/styles.css` · ADR Needed: no · Governance: none.

### G2039 — Entrance- & stagger-animaties (Web Animations API)
**Goal.** Laat kaarten/lijsten bij binnenkomst subtiel fade/slide-in met een lichte
stagger, via een kleine WAAPI-helper in `src/ui/components.ts` (zero-dep).

**Acceptance Criteria.**
- Helper `animateIn(el, { delay })` o.i.d.; kaarten en lijstitems gebruiken hem.
- Volledig uit bij reduced-motion; geen layout-shift/CLS door de animatie.
- Werkt samen met morph (alleen nieuw ingevoegde nodes animeren, geen re-animatie bij
  ongewijzigde items).

**Metadata.** Epic: Premium Claude Design UI · Priority: P1 · Complexity: M ·
Related Components: `src/ui/components.ts`, `src/styles.css` · ADR Needed: no ·
Governance: none.
> **Optioneel (aparte ADR-0010-uitbreiding):** wil je meer expressieve choreografie, dan
> mag **Motion One** (motion.dev, MIT, ~5kb) gevendord worden i.p.v. WAAPI-helper. Default
> blijft WAAPI zonder dependency.

### G2040 — Micro-interacties & diepte
**Goal.** Systematiseer hover/active/focus-states, pressed-feedback op knoppen en gelaagde
surfaces met de elevation-tokens.

**Acceptance Criteria.**
- Interactieve elementen hebben consistente hover/active/focus-visuals (elevation + subtiele
  transform), tokengestuurd.
- Zichtbare focus-ring voldoet aan WCAG (contrast + niet alleen kleur).
- Geen regressie in bestaande componenten (visuele smoke-scripts blijven groen).

**Metadata.** Epic: Premium Claude Design UI · Priority: P1 · Complexity: M ·
Related Components: `src/styles.css`, `src/ui/components.ts` · ADR Needed: no ·
Governance: none.

---

## Fase C — Laad-/async-choreografie · Prioriteit P1

### G2041 — Echte loading/optimistic states op async-paden
**Goal.** Geef de daadwerkelijke async-momenten (central sync, unlock, backup, IndexedDB)
skeleton-/laad-/optimistic-feedback, met hergebruik van bestaande `loadingSkeleton`,
`statusMessage`, `errorBanner`.

**Acceptance Criteria.**
- Central sync / dataset-load / unlock / backup tonen een skeleton of laadstatus tijdens de
  operatie i.p.v. een lege of bevroren UI.
- Foutpaden gebruiken `errorBanner`; geen gevoelige inhoud in status/skeleton (geen payload,
  passphrase, token, bestandsnaam, OCR-tekst, medische data — conform privacy-gate).
- Vitest dekt de laad→gereed→fout-overgangen.

**Metadata.** Epic: Premium Claude Design UI · Priority: P1 · Complexity: M ·
Related Components: `src/storage/*`, `src/main.ts`, `src/ui/components.ts` · ADR Needed: no
· Governance: Network **existing only** · Data none extra · Medical: unchanged.

### G2042 — Overgangschoreografie voor async → content
**Goal.** Skeleton → content faded/morpht in (i.p.v. hard omklappen), consistent met de
Fase A/B-transities.

**Acceptance Criteria.**
- Content vervangt skeleton met een cross-fade/morph; reduced-motion-safe.
- Geen dubbele animatie bij herhaalde renders van dezelfde data.

**Metadata.** Epic: Premium Claude Design UI · Priority: P2 · Complexity: S ·
Related Components: `src/main.ts`, `src/ui/components.ts` · ADR Needed: no · Governance: none.

---

## Fase D — "Echte app"-verpakking · Prioriteit P1 (PWA) / P2 (Tauri, optioneel)

### G2043 — PWA-polish (installeerbaar, standalone)
**Goal.** Benut de bestaande `vite-plugin-pwa` volledig: `display: standalone`, complete
icon-set (maskable), themekleur, splash, offline-app-shell — zodat Kiempad als echte app
installeert zonder browserchrome.

**Acceptance Criteria.**
- Installeerbaar op desktop + mobiel; opent in standalone-venster.
- Manifest + icons compleet; Lighthouse PWA-installability groen.
- Alle assets lokaal (`assets:check` groen); offline-smoke (`smoke:offline`) blijft groen.

**Metadata.** Epic: Premium Claude Design UI · Priority: P1 · Complexity: S ·
Related Components: `vite.config.ts`, `public/`, manifest · ADR Needed: no ·
Governance: Network none · Data none · Medical: unchanged.

### G2044 — Tauri desktop-shell (OPTIONEEL, beslissing vereist)
**Goal.** *Onderzoek + optioneel* een Tauri-shell (Rust) voor een native desktop-app-gevoel
(eigen venster/menu's, klein, past bij local-first/privacy). **Niet bouwen vóór akkoord.**

**Acceptance Criteria.**
- ADR-0011 weegt Tauri af (voordelen, buildketen, onderhoudslast, privacy-impact) t.o.v.
  "PWA-only blijven"; bevat een expliciete go/no-go voor Peter.
- Bij go: minimale Tauri-shell die de bestaande build laadt, zonder nieuwe netwerktoegang,
  met CI-build; local-first en encryptie ongewijzigd.
- Bij no-go: ADR gesloten met motivatie; geen code.

**Metadata.** Epic: Premium Claude Design UI · Priority: P2 · Complexity: L ·
Related Components: nieuwe `src-tauri/`, CI · ADR Needed: **yes (ADR-0011)** ·
Governance: Network none · Data none · Medical: unchanged. **Vereist Peters akkoord.**

---

## Fase E — Structurele opsplitsing (enabler) · Prioriteit P2

> Geen cosmetische verandering, maar de reden dat polish nu onwerkbaar is. Mag
> **incrementeel** en verweven met bovenstaande fasen; puur mechanisch, gedrag ongewijzigd.

### G2045 — `styles.css` opsplitsen in modules
**Goal.** Splits de 32k-regel monoliet in `src/styles/` (tokens/base/layout/components/
screens), samengevoegd via Vite CSS-imports. Byte-identieke output waar mogelijk.

**Acceptance Criteria.** Visuele smoke-scripts (`smoke:routeflows`, `smoke:context-signals`,
`smoke:split-workspaces`) tonen geen regressie; build ongewijzigd van resultaat.
**Metadata.** Priority: P2 · Complexity: L · ADR Needed: no · Governance: none.

### G2046 — `appShell.ts` opsplitsen per scherm/domein
**Goal.** Splits de 24k-regel render-monoliet in modules per scherm/domein; publieke
render-API ongewijzigd.

**Acceptance Criteria.** `typecheck` + volledige testsuite groen; geen gedragswijziging;
geen circulaire imports.
**Metadata.** Priority: P2 · Complexity: L · ADR Needed: no · Governance: none.

---

## Aanbevolen uitvoervolgorde

1. **G2035 → G2036** (render-boundary + morph) — grootste sprong in gevoel, laagste risico.
2. **G2038 → G2039 → G2040** (motion & diepte).
3. **G2037** (shared-element transitions) — bovenop A+B.
4. **G2041 → G2042** (laadchoreografie).
5. **G2043** (PWA-polish) — bijna gratis "echte app"-winst.
6. **G2045/G2046** (opsplitsen) — incrementeel meenemen wanneer een bestand geraakt wordt.
7. **G2044** (Tauri) — alleen na expliciet akkoord van Peter (ADR-0011).

**Verwacht effect:** stap 1–2 leveren naar schatting het leeuwendeel van het "professionele"
gevoel voor een fractie van de moeite. Framework-migratie (Svelte/Solid) is **bewust géén
onderdeel** van dit plan: hoge kost, gooit 56k regels vanilla weg, en lost het gevoel niet
beter op dan render-continuïteit + motion + PWA/Tauri samen. Pas overwegen als dit plan
onvoldoende blijkt.

## Definition of Done (per goal)

Conform `MASTER_CONTEXT.md` §8 en `CODEX_BUILD_PROMPT.md`: kleine coherente PR; Vitest voor
nieuwe logica; volledige gate groen (`lint`, `typecheck`, `test`, `assets:check`,
`secrets:check`, `fixtures:check`, `deps:review`, `backlog:health`, `goals:score`);
`EXECUTION_GOALS.md` + `PRODUCT_BACKLOG.md` bijgewerkt; `CHANGELOG.md` +
`CURRENT_STATE.md` bijgewerkt; nieuwe ADR waar aangegeven; reduced-motion + progressive
enhancement bewezen in tests.

## Risico's & rollback

- **Browserverschillen (View Transitions).** Ondervangen door progressive enhancement
  (G2035): geen ondersteuning → directe render, identiek aan nu.
- **Morph-regressies (focus/inputs).** Ondervangen door DOM-tests in G2036; bij twijfel is
  terugvallen op `innerHTML` één regel in `mountView`.
- **Supply chain (gevendorde code).** Alleen single-file, zero-transitive, MIT/BSD/Apache,
  gepind, met ADR + `deps:review`. Geen CDN, geen runtime-fetch.
- **Toegankelijkheid.** Elke animatie achter `prefers-reduced-motion`; focus/ARIA-tests in
  de gate.
- Elk goal is een aparte PR en dus los terugdraaibaar.
