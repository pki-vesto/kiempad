# On-device AI-verkenning

G104 onderzoekt browser-AI zonder Kiempad van local-first af te halen.

## Wat de app doet

- Kiempad kijkt alleen of bekende browser-API-objecten in `globalThis` bestaan:
  `LanguageModel`, `Summarizer`, `Translator` en `LanguageDetector`.
- De status staat in het kennisscherm naast de bestaande AI-instelling.
- De status is informatief: "API-object aanwezig" betekent alleen dat de browser het
  object meldt.

## Wat de app niet doet

- Geen `create()`-aanroep.
- Geen availability-check die een modeldownload of permissiestap kan starten.
- Geen provider-call en geen cloud-stap.
- Geen automatische verwerking van gezondheidsdata.

## Bronnen

De gekozen grens volgt de actuele Chrome-documentatie voor built-in AI:

- Chrome Built-in AI: https://developer.chrome.com/docs/ai/built-in
- Prompt API: https://developer.chrome.com/docs/ai/prompt-api
- Built-in AI APIs status: https://developer.chrome.com/docs/ai/built-in-apis
- Modeldownload informeren: https://developer.chrome.com/docs/ai/inform-users-of-model-download

Omdat browser-AI nog beweegt, blijft deze functie een passieve verkenning totdat een
concrete API stabiel genoeg is en de privacy-/medische grenzen opnieuw zijn
vastgelegd.
