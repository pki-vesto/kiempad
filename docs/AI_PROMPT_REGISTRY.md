# AI Prompt Registry

Kiempad gebruikt AI alleen na expliciete opt-in en expliciete actie. Promptteksten
staan daarom centraal in `src/domain/ai.ts` als `AI_PROMPT_REGISTRY`, zodat doel,
inputcontract, veiligheidslabels en verboden output per prompt auditeerbaar blijven.

## Geregistreerde prompts

- `research-samenvatting` — conceptuele samenvatting van gede-identificeerde
  researchtekst met bronverwijzing.
- `consult-samenvatting` — feitelijke ordening van consultnotities in kernpunten,
  actiepunten en open vragen.
- `research-naar-consultvragen` — neutrale conceptvragen voor de behandelaar vanuit
  researchcontext.

## Harde grenzen

Iedere prompt moet expliciet verbieden:

- diagnose of waarschijnlijkheidsdiagnose;
- dosering, medicatieschema of medicatieaanpassing;
- behandelkeuze, behandeladvies of rangorde tussen IVF/ICSI/terugplaatsing/punctie.

`valideerAiPromptRegistry()` bewaakt deze grenzen in tests. Nieuwe prompts horen eerst
in de registry en krijgen pas daarna UI- of providerkoppeling.

## Regressiesuite

`listAiPromptRegressionFixtures()` levert vaste regressiefixtures voor alle
AI-assisted flows die Kiempad moet bewaken:

- consult;
- research;
- image-context;
- daily-recommendations.

Registry-prompts worden automatisch als fixture opgenomen. Image-context en dagelijkse
aanbevelingen hebben aparte boundary-fixtures, omdat deze flows nu lokaal en
policy-guarded zijn maar geen providerprompt mogen starten. De regressiesuite bewaakt:

- elke verplichte flow heeft minstens één fixture;
- prompttekst vraagt geen diagnose, dosering of behandelkeuze;
- veilige voorbeeldoutput blijft door de outputpolicy komen;
- verboden voorbeeldoutput wordt door de outputpolicy geweigerd.
