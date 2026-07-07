# ADR-0010: UI-rendering — vanilla TypeScript + lit-html (vervangt UI-deel van ADR-0001)

Date: 2026-07-07

## Status

Accepted. Vervangt het UI-framework-deel van
[ADR-0001](0001-stack-en-runtime.md) (dat "React" noemde maar nooit is geïmplementeerd —
de codebase heeft nul runtime-dependencies). De overige keuzes van ADR-0001 (Vite, PWA,
Vitest, geen verplichte backend) blijven geldig. Uitvoering staat in
[`docs/IMPROVEMENT_PLAN.md`](../IMPROVEMENT_PLAN.md).

## Context

De UI is vanilla TypeScript met string-templates en één `innerHTML`-herbouw van de hele
shell per mutatie (`src/main.ts:214`), gevolgd door herbinding van ~94 event listeners
over 20 `bind*`-functies. Dat vernietigt focus, scrollpositie en in-flight input; de code
compenseert dat al met `pendingFocus`-vlaggen en `requestAnimationFrame`-hacks. Het model
schaalt slecht: `src/appShell.ts` (25.177 regels) en `src/main.ts` (4.415 regels) zijn
monolieten. De ecosysteemdefault React staat wél in de docs maar niet in de code. De
sterke eigenschappen "nul/минimale runtime-deps + strikte CSP + kleine bundels" willen we
grotendeels behouden; de medische-veiligheids- en privacy-invarianten (P1–P6,
`MASTER_CONTEXT.md`) blijven onaangetast.

## Decision

- **UI-rendering via `lit-html`** (~3.5 KB, MIT, geen transitieve deps): één kleine,
  auditbare runtime-dependency. Templates blijven pure `(state) → template`-functies;
  events gaan inline (`@click`) — de `bind*`-laag vervalt.
- **Render-boundary:** shell-chrome wordt gescheiden van scherm-content (`#screen-root`);
  mutaties renderen alleen het betrokken scherm-domein (targeted), niet de hele shell.
- **Eén dispatch → render-pad** (`dispatch(action)` → reducer → targeted render); ook de
  bron waar latere multi-device sync-updates binnenkomen.
- **Geen JSX/buildwijziging.** CSP blijft `script-src 'self'`; lit-html gebruikt geen
  `eval`/`new Function` in productie. De nieuwe dependency valt onder `deps:review` en de
  "lichte stack"-afweging (`MASTER_CONTEXT.md` §3).
- **Domein-, storage- en encryptielagen blijven ongewijzigd.** De UI raakt de driver
  alleen om repositories te bouwen (`EncryptedRecordRepository`, `src/storage/records.ts`).
- **Migratie is incrementeel per scherm** (één werkend, getest scherm per PR); geen
  big-bang rewrite. Realiseert tegelijk het opsplitsen van `appShell.ts` (G2046).

## Consequences

- Focus/scroll/input blijven behouden; de `pendingFocus`/rAF-compensatie kan worden verwijderd.
- Eén runtime-dependency in plaats van nul — een bewuste, gedocumenteerde afwijking van de
  strikte "nul-deps"-houding; verantwoord door kleine grootte, MIT-licentie en het ontbreken
  van transitieve deps. Vastgelegd via `package.json` + `deps:review`.
- De monolieten worden per scherm gesplitst naar `src/ui/screens/`; features leven daarna in één bestand.
- Reeds geregistreerd doel **G2036 (morphdom, #4017)** vervalt: `lit-html` levert dezelfde
  keyed DOM-diffing; beide zou dubbel zijn. **G2035 (View-Transitions, #4016)** blijft en
  richt zich op de nieuwe render-boundary.
- **Afgewogen alternatieven:** Preact (JSX + rijker ecosysteem voor charts/timelines, maar
  een buildstap en een dependency-tree), en gedisciplineerd vanilla (nul deps, maar voor
  altijd handmatige reconciliatie en geen oplossing voor de monoliet). Niet gekozen.
