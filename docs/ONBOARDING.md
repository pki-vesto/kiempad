# Onboarding - centrale encrypted dataset

Kiempad gebruikt de centrale encrypted dataset als primaire route voor nieuwe
gebruikers en multi-device gebruik. De legacy lokale IndexedDB-kluis blijft alleen
compatibiliteit en fallback wanneer er geen centrale API is geconfigureerd.

## Voorwaarden

- Start de centrale backend met duurzame server-side persistence:

  ```bash
  KIEMPAD_CENTRAL_PERSISTENCE_FILE=/var/lib/kiempad/central-db.json npm run backend:central
  ```

- Koppel de PWA aan die backend via `.env`:

  ```bash
  VITE_KIEMPAD_CENTRAL_API_URL=https://kiempad.example.test
  VITE_KIEMPAD_CENTRAL_USER_ID=kiempad-private-user
  ```

- Zet op de backendhost expliciet welke user-id sessies mag krijgen:

  ```bash
  KIEMPAD_CENTRAL_ALLOWED_USER_IDS=kiempad-private-user
  ```

## Eerste apparaat

1. Open de PWA met een geldige `VITE_KIEMPAD_CENTRAL_API_URL`.
2. Kies een sterke passphrase.
3. De client leidt lokaal de encryptiesleutel af en start de centrale encrypted
   dataset.
4. De backend bewaart alleen encrypted envelopes, owner-scoped indexmetadata en
   sessiemetadata; medische en fertiliteitsinhoud blijven onleesbaar zonder de
   client key.

Er worden geen passphrases, ruwe encryptiesleutels of plaintext medische payloads op
de backend opgeslagen.

## Tweede apparaat

1. Gebruik dezelfde `VITE_KIEMPAD_CENTRAL_API_URL`.
2. Gebruik dezelfde `VITE_KIEMPAD_CENTRAL_USER_ID` die server-side is toegestaan.
3. Ontgrendel met dezelfde passphrase.
4. Het apparaat opent dezelfde centrale encrypted dataset en maakt geen nieuwe
   lokale kluis.

Kort: het tweede apparaat gebruikt geen nieuwe lokale kluis, maar dezelfde centrale
encrypted dataset.

Als de centrale URL geconfigureerd is maar sessie-uitgifte, CORS/originvalidatie of
de backendverbinding faalt, toont de app een centrale bootstrapfout. Er is dan geen
stille legacy fallback, zodat gebruikers niet per ongeluk opnieuw lokaal beginnen.

Deze foutmodus is bewust: geen stille legacy fallback bij een geconfigureerde centrale
API.

## Legacy en bestaande gebruikers

- Bestaande lokale vaults hoeven niet gemigreerd te worden.
- Bestaande gebruikers mogen vers starten in de centrale encrypted dataset.
- Een versleutelde export/import kan handmatig gebruikt worden als de gebruiker
  bewust gegevens wil meenemen.
- Legacy IndexedDB is alleen primair wanneer `VITE_KIEMPAD_CENTRAL_API_URL`
  ontbreekt.

## Herstelgrenzen

Kiempad heeft geen herstelachterdeur. Zonder passphrase of een geldige versleutelde
back-up kan de inhoud niet worden teruggelezen. WebAuthn/biometrie is alleen lokale
ontgrendel-gemakslaag op ondersteunde HTTPS/localhost-browsers en vervangt geen
back-upstrategie.

## Validatie

Gebruik deze checks voor onboarding- en multi-device regressies:

```bash
npm run smoke:central
npm run test -- tests/clientStorage.test.ts tests/centralBrowserSmokeScript.test.ts
npm run secrets:check
```

Aanvullende referenties:

- [`CENTRAL_ENCRYPTED_BACKEND.md`](CENTRAL_ENCRYPTED_BACKEND.md)
- [`RUNBOOK.md`](RUNBOOK.md)
- [`../SECURITY.md`](../SECURITY.md)
- [`WEBAUTHN_UNLOCK.md`](WEBAUTHN_UNLOCK.md)
