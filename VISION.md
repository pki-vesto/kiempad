# Kiempad Vision

Kiempad is een persoonlijke fertiliteitsassistent voor een Nederlands IVF/ICSI-traject
van een stel. De app centraliseert medische context, planning, vragen, dossierstukken,
research en dagelijkse voorbereiding, maar blijft een informatie- en organisatietool:
geen medisch hulpmiddel, geen diagnose, geen dosering, geen behandelkeuze en geen
kansberekening.

## Productrichting

Kiempad moet het volledige traject begrijpelijk en bruikbaar maken vanuit één
veilige werkplek:

- onderzoeken, labuitslagen, echo's, foto's, embryo-informatie en consultnotities
  kunnen terugwerkend worden vastgelegd;
- afspraken, medicatie, vragen, herinneringen, kosten, welzijn en afwegingen blijven
  in dezelfde context zichtbaar;
- research en AI-samenvattingen zijn opt-in, brongebonden en altijd concept totdat
  een behandelaar ze bevestigt;
- beide partners moeten op gekoppelde apparaten dezelfde actuele dataset kunnen
  openen zonder per toestel een nieuwe kluis te moeten opbouwen.

## Architectuurvisie

De primaire opslagroute is een centrale encrypted dataset. De client leidt de sleutel
af uit de passphrase, versleutelt records client-side met AES-GCM en bewaart centraal
alleen encrypted envelopes, owner/indexmetadata en strikt technische metadata zoals
`crypto`, `schema` en `webauthn-unlock`.

De centrale backend is bewust klein: sessies, owner-scoping, recordtransport en
duurzame encrypted persistence. De backend mag geen plaintext medische of
fertiliteitsinhoud, passphrases, raw keys, AI API-sleutels of herstelgeheimen zien.
User-isolatie, sessie-expiry, veilige foutmapping en persistence-validatie zijn
onderdeel van het platform, niet optionele features.

Legacy IndexedDB blijft alleen compatibiliteit/fallback. Bestaande lokale vaults
hoeven niet gemigreerd te worden; bestaande gebruikers mogen vers starten in de
centrale encrypted dataset. Nieuwe gebruikers horen de centrale encrypted route te
gebruiken wanneer de API is geconfigureerd. Als centrale sessie-uitgifte faalt, mag
de app niet stil terugvallen naar legacy lokale opslag.

## Privacy En Veiligheid

- Gezondheidsdata staat nooit in git, issues, PR's, logs of telemetry.
- Centrale persistence bevat geen plaintext medische payloads.
- Back-ups en handmatige recordpakketten bevatten alleen encrypted records en
  datasetmetadata.
- WebAuthn/biometrie is lokaal ontgrendelgemak; de passphrase blijft fallback.
- Zonder passphrase of bruikbare keywrap is er geen herstelachterdeur.
- Externe AI, netwerkresearch en notificatiedetails blijven uit totdat de gebruiker
  expliciet opt-in geeft.

## Ontwerpprincipe

De app moet rustig, warm en professioneel aanvoelen. De eerste ervaring is de echte
werk-app, geen marketingpagina. UI-copy is storage-mode bewust: centrale modus noemt
de centrale encrypted dataset; legacy fallback noemt lokale encrypted opslag. Lokale
verwerking zoals OCR, preview, notificaties, downloads en on-device AI mag expliciet
lokaal heten.

## Succesbeeld

Kiempad is geslaagd wanneer een gekoppeld apparaat dezelfde centrale encrypted
dataset kan openen, gevoelige inhoud alleen client-side leesbaar is, de backend blind
blijft voor medische details, lokale-only vaultgedrag niet langer het primaire model
is, en de gebruiker het fertiliteitstraject vanuit één begrijpelijke tijdlijn en
contextlaag kan volgen.
