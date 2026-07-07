# Kiempad — UI-architectuur verbeterplan

> Gefaseerd, incrementeel implementatieplan voor de UI-laag. Domein-, storage- en
> encryptielagen blijven **ongewijzigd**. Volgt de canon en harde regels uit
> [`CODEX_BUILD_PROMPT.md`](../CODEX_BUILD_PROMPT.md) en `MASTER_CONTEXT.md`.
> Kernbeslissing vastgelegd in [ADR-0010](adr/0010-ui-rendering-lit-html.md).

## Context

De app "voelt onprofessioneel" niet door *dat* het HTML rendert, maar door *hoe*:
`render()` in `src/main.ts:214` zet bij **elke** mutatie de hele shell opnieuw via
`root.innerHTML = renderAppShell(...)` en herbindt daarna alle 18 `bind*`-functies
(94 listeners). Dat vernietigt focus, scrollpositie en in-flight input; de codebase
compenseert dat al met `pendingFocus`-vlaggen en `requestAnimationFrame`-hacks
(`main.ts:302-333`) — het teken dat het rendermodel is ontgroeid. Daarnaast dragen twee
monolieten de hele UI (`appShell.ts` **25.177** regels / 451 render-functies, `main.ts`
**4.415**, `tests/appShell.test.ts` **48.315**), en de docs claimden **React** terwijl er
nul runtime-dependencies zijn.

Bedoeld resultaat: focus/scroll/input blijven behouden, schermwissels voelen vloeiend,
de monolieten worden per scherm opgesplitst, en docs en code komen weer overeen — zonder
de goede domein-/storage-/encryptiekern aan te raken.

**Verificatie tegen de code:** alle kerncijfers kloppen (25.177 / 4.415 / 48.315 / 20
`bind*` / 94 listeners / 451 render-fns / full-page `innerHTML` op 3 root-sites). Twee
correcties op de oorspronkelijke review: er zijn **16** `normalize*`-functies (niet ~14);
en de CSP-`localhost`-entries staan in de **statische productie-`index.html:7-9`** met
**geen** dev/prod-mechanisme in `vite.config.ts` — de hardening moet dus een injectiehook
*toevoegen*, niet "naar dev verplaatsen".

**Kernbeslissing (ADR-0010):** vanilla TS + **`lit-html`** (~3.5 KB, tagged templates,
geen JSX/build-wijziging, strikte CSP blijft). Het plan is uitgewerkt voor deze keuze;
bij elke stap staat een **[B/C]-noot** met wat zou verschillen bij Preact (B) of
gedisciplineerd vanilla (C).

## Aansluiting op reeds geregistreerde goals (G2035–G2046)

- **G2036 / #4017 (morphdom)** → **vervalt / re-scope**: `lit-html` doet zelf keyed
  DOM-diffing; morphdom naast lit-html is dubbel werk. Sluiten t.g.v. Fase 1b.
- **G2046 / #4027 (appShell.ts opsplitsen)** → **gerealiseerd** door Fase 2 (per-scherm-extractie); koppelen, niet apart uitvoeren.
- **G2035 / #4016 (View-Transitions boundary)** → **behouden**, richt zich op de nieuwe
  render-boundary uit Fase 1b (schermwissel in `startViewTransition`).
- **G2038–G2043** (motion/tokens/laadstates/PWA), **G2044** (Tauri), **G2045 / #4026**
  (styles.css split) → onaangetast, complementair.

---

## 1. ADR-0010 + doc-correcties

Zie [ADR-0010](adr/0010-ui-rendering-lit-html.md). Doorgevoerde correcties:
- `ARCHITECTURE.md:41-42` — UI-framework "React" → "vanilla TypeScript + lit-html (ADR-0010)".
- `ARCHITECTURE.md:225` — alternatieventabel "TypeScript + Vite + React" → "… + lit-html".
- `MASTER_CONTEXT.md:33` — "TypeScript/Vite/React" → "TypeScript/Vite/lit-html".
- `docs/adr/0001-stack-en-runtime.md` — statusnoot: UI-framework-deel vervangen door ADR-0010.
- **Bewaard** (niet aangeraakt): `MASTER_CONTEXT.md` P1–P6 (37-52) en Architectuurprincipes (27-35), behalve regel 33.

**[B/C]:** B legt JSX + `jsxImportSource: preact` + tsconfig/build vast (dep-tree i.p.v. één file). C legt "gedisciplineerd vanilla, event-delegation, per-regio render, nul deps" vast.

## 2. Doelarchitectuur

```
src/ui/
  components.ts        (behouden — al goed)          escape.ts (behouden)
  router.ts            NIEUW: parse hash 1× → Route; de 16 normalize* verhuizen hierheen
  render.ts            NIEUW: render-boundary (chrome vs #screen-root) + dispatch→render
  state.ts             NIEUW: RuntimeState-splitsing (domein vs UiFeedback) + reducer/dispatch
  screens/
    welzijn.ts  kosten.ts  ... (13 schermen: renderXScreen + voormalige bindXControls, als lit-html)
  appShell.ts          dunne chrome-compositie (~500 regels): layout + nav + <main id="screen-root">
main.ts                bootstrap-only (~200 regels): storage-init, sessie, listeners, eerste render
```

**Functieverhuizing:**
- 16 `normalize*` (`appShell.ts:499-790`) → `src/ui/router.ts` als één `parseRoute(hash): Route`.
- `renderScreenContent` (`appShell.ts:2104`) → dispatcher `renderScreen(route, state)` in `render.ts`.
- Elke `renderXScreen` (`appShell.ts`) + `bindXControls` (`main.ts`) → samen naar `src/ui/screens/x.ts`.
- `render()`-body (`main.ts:214-393`) → `render.ts`; `main.ts` houdt alleen bootstrap.
- **Ongemoeid:** imports uit `src/domain/*` en de storage-seam (`openClientStorage`,
  `EncryptedRecordRepository`, `EncryptedStorageDriver` in `src/storage/records.ts:42`).
  Geen storage-/domeinwijziging vereist (UI raakt de driver alleen om repositories te bouwen).

## 3. Getypt UI-statusmodel + één dispatch→render-pad

Nu: ~35 losse ephemere velden op `RuntimeState` (`*Status`/`*Error`/`*Feedback`, `main.ts:132-204`).

```ts
type UiFeedback = { scope: string; tone: 'info'|'success'|'error'; message: string };
type UiState = { feedback: Partial<Record<ScreenId|string, UiFeedback>>; filters: {…}; open: {…} };
// RuntimeState = { domain: {…stores/data…}, ui: UiState }

function dispatch(action: Action): void {   // enig mutatie→render-pad
  reduce(state, action);                     // muteert domein via stores en/of ui
  renderScreen(currentRoute, state);         // targeted: alleen #screen-root
}
```
- Alle `state.xStatus = …; render(root,state)` in `bind*` → `dispatch({type})`.
- **Multi-device sync:** centrale sync-updates (`deriveCentralSyncFeedback`, central-session-feedback)
  roepen straks **hetzelfde** `dispatch(...)` aan → één plek waar "data veranderd → UI bij" gebeurt.

**[B/C]:** B → `dispatch` als store/`useReducer`-hook, render via component re-render. C → identiek dispatch-idee, targeted `innerHTML` + gedelegeerde events.

---

## Fasen, PR-strategie, risico's & vangnet

Elke PR is klein, groen en terugdraaibaar. **Vaste gate per PR:** `lint`, `typecheck`,
`test`, `assets:check`, `secrets:check`, `fixtures:check`, `deps:review`.

### Fase 0 — Beslissing & docs (geen code)
ADR-0010 + doc-correcties + reconciliatie #4017/#4027. Risico verwaarloosbaar; rollback = git revert docs.

### Fase 1 — Fundament (gedragsbehoudend)
- **1a Router** (`router.ts`, `parseRoute`): 16 `normalize*` verhuizen; `render()` roept 1× `parseRoute`.
  Tests porten naar `tests/ui/router.test.ts`. Acceptance: identiek routegedrag.
- **1b Render-boundary + dispatch + lit-html**: `#screen-root`; chrome vs scherm; `dispatch`→targeted
  `renderScreen`; lit-html als eerste runtime-dep. Legacy-schermen: `screenRoot.innerHTML = renderXScreen(state)`
  + scoped bind. Volledige shell-render alleen bij navigatie/global change. Acceptance: gedrag identiek;
  mutaties thrashen de chrome niet meer; focus/scroll behouden bij same-screen mutatie.
- **1c UiFeedback-mechanisme**: type + helper; nog niet alle velden vervangen (pas per scherm).
- **Risico:** raakt de centrale render. **Rollback:** één import-switch terug naar directe `render()`.
  **Vangnet:** `smoke:routeflows`, `smoke:split-workspaces`, `smoke:context-signals`, `drill:backup`, `smoke:offline`.
- **[B/C]:** B → hier JSX-build aanzetten. C → geen lit-html; event-delegation + regio-render.

### Fase 2 — Schermmigratie (één scherm per PR)
**Volgorde (klein → groot):** `welzijn` (pilot) → `kosten` → `afwegingen` → `logboek` (read-only) →
`herinneringen` → `backup` → `start` → `agenda` → `vragen` → `medicatie` → `kennis` → `dossier` → `traject`.

**Per-scherm sjabloon:**
- **Scope:** `renderXScreen` → `src/ui/screens/x.ts` als lit-html; events inline (`@click`→`dispatch`).
- **Te verwijderen `bind*`:** `bindXControls` uit `main.ts` + de aanroep in `render()` (`main.ts:306-323`).
- **Tests:** scherm-`it()`-blokken uit `tests/appShell.test.ts` → `tests/ui/x.screen.test.ts`; brosse
  HTML-string-asserts → semantisch (roles/labels/`data-*`). **`data-*`-attributen blijven het contract.**
  Testdekking mag niet dalen.
- **Acceptatie:** rendert identiek (data-attributen behouden); events via `dispatch`; geen `bindXControls` meer;
  focus/scroll behouden; scherm-tests + `smoke:routeflows` (+ scherm-smoke, bv. `smoke:dossier-routes`) groen.

**Pilot = `welzijn`** (`renderWelzijnScreen` `appShell.ts:14020-14179`, 159 regels; `bindWelzijnControls`
`main.ts:2850-2866`, 3 listeners). Klein, geïsoleerd, bewijst tóch het volledige event→dispatch-pad.
Nul-risico-warmup: `logboek` (read-only, geen bind).

- **Risico per scherm:** geïsoleerd; grote schermen (`dossier` 1707/1356, `traject` 2195, `medicatie` bind 1031)
  laatst. **Rollback:** één scherm-PR reverten; dispatcher valt terug op legacy-pad. **Vangnet:** scherm-smoke + `smoke:routeflows` + `drill:backup`.
- **[B/C]:** B → `.tsx`-componenten. C → regio-`innerHTML` + gedelegeerde events; `bind*` → `data-action`.

### Fase 3 — Afronding & opruiming
`appShell.ts` → dunne chrome (~500 regels); `main.ts` → bootstrap (~200 regels); `pendingFocus`/rAF-hacks
(`main.ts:302-333`) weg; resterende status-velden → `UiFeedback`; multi-device sync-hook afmaken
(central-sync → `dispatch`); restant `tests/appShell.test.ts` opsplitsen/behouden als regressiesuite.
Risico laag; rollback per opruim-PR; vangnet = volledige suite + alle smokes + `drill:backup`.

### Hardening (onafhankelijk, elk moment)
- **H1 dev-only CSP:** Vite `transformIndexHtml`-plugin die de `connect-src`-localhost-entries
  (`http://localhost:*`, `http://127.0.0.1:*`, `ws://localhost:*`, `ws://127.0.0.1:*`) **alleen in `serve`/dev**
  injecteert; productie-CSP verstrakt naar `'self'` + (indien gezet) de centrale API-origin uit
  `VITE_KIEMPAD_CENTRAL_API_URL`. Acceptance: prod-`dist/index.html` heeft geen localhost in `connect-src`;
  dev werkt; `smoke:central` groen.
- **H2 iframe-print:** `exportConsultPdf` (`main.ts:3023-3039`) van `window.open`+`document.write` naar een
  verborgen iframe-print; `maakConsultPrintHtml` blijft ongewijzigd. Acceptance: print betrouwbaar;
  `consultExport.test.ts` + nieuwe test groen.

---

## GitHub-issues per fase (G-codes vanaf G2047)

| Goal | Fase | Titel |
|---|---|---|
| G2047 | 0 | ADR-0010 + doc-correcties (React→lit-html) |
| G2048 | 0 | Reconcile UI-goals: re-scope #4017 (morphdom), koppel #4027, her-richt #4016 |
| G2049 | 1a | Getypte router `src/ui/router.ts` (`parseRoute`, 16 normalize* verhuizen) |
| G2050 | 1b | Render-boundary + dispatch→render + lit-html-dependency |
| G2051 | 1c | Getypt UI-statusmodel (`UiFeedback`) |
| G2052 | 2 | Migreer `welzijn` (pilot) naar lit-html |
| G2053 | 2 | Migreer `kosten` |
| G2054 | 2 | Migreer `afwegingen` |
| G2055 | 2 | Migreer `logboek` (read-only) |
| G2056 | 2 | Migreer `herinneringen` |
| G2057 | 2 | Migreer `backup` |
| G2058 | 2 | Migreer `start` |
| G2059 | 2 | Migreer `agenda` |
| G2060 | 2 | Migreer `vragen` |
| G2061 | 2 | Migreer `medicatie` |
| G2062 | 2 | Migreer `kennis` |
| G2063 | 2 | Migreer `dossier` |
| G2064 | 2 | Migreer `traject` |
| G2065 | 3 | Dun `appShell.ts` + `main.ts` uit; verwijder focus/rAF-hacks |
| G2066 | 3 | Multi-device sync via `dispatch` |
| G2067 | 3 | Splits restant `tests/appShell.test.ts` |
| G2068 | H | Dev-only CSP localhost via Vite `transformIndexHtml` |
| G2069 | H | Iframe-print voor `exportConsultPdf` |

## Verificatie (end-to-end)

- **Per PR:** volledige gate + `assets:check`, `secrets:check`, `fixtures:check`, `deps:review`.
- **Per scherm-migratie:** `npm run smoke:routeflows`, scherm-specifieke smoke waar aanwezig, `npm run drill:backup`.
- **Fundament/sync:** `npm run smoke:offline` + `smoke:central` (indien centrale API gezet).
- **Testdekking:** aantal `it()` vóór/na de test-split per scherm mag niet dalen.
- **Handmatig:** `npm run dev`, doorloop gemigreerd scherm: focus/scroll behouden tijdens invoer + statuswijziging;
  navigatie vloeiend; PDF-print (H2) werkt zonder popup.
