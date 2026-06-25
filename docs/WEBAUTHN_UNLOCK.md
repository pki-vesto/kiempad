# WebAuthn/biometrie ontgrendelgemak

G121 voegt optioneel ontgrendelgemak toe voor toestellen/browsers die WebAuthn met
de PRF-extension ondersteunen.

## Werking

- De gebruiker ontgrendelt eerst normaal met de passphrase.
- In het back-upscherm kan WebAuthn worden gekoppeld. In centrale storage-modus
  labelt Kiempad dit als ontgrendelgemak voor de centrale encrypted dataset; in
  legacy fallback blijft dit ontgrendelgemak voor de lokale kluis.
- Kiempad vraagt een WebAuthn-credential met `userVerification: required` en een
  `prf.eval.first` input.
- De PRF-output wordt lokaal gebruikt als AES-wrapping key voor de bestaande
  dataset-/kluissleutel.
- Bij een latere ontgrendeling vraagt Kiempad dezelfde credential en PRF-salt op en
  opent de keywrap alleen als de authenticator dezelfde PRF-output levert.

## Grenzen

- De passphrase blijft de fallback en herstelroute.
- Er is geen serveraccount, geen remote challenge-service en geen analytics.
- Als WebAuthn of PRF ontbreekt, toont de app een niet-beschikbaarstatus; er is dan
  geen schijn-ontgrendeling.
- De keywrap is alleen nuttig voor dezelfde dataset- of kluis-/credentialcombinatie.
  Bewaar nog steeds versleutelde back-ups; in centrale modus blijft de centrale API
  de multi-device route, niet WebAuthn zelf.

## Bronnen

- W3C WebAuthn Level 3 beschrijft de `prf` extension en `results.first` output:
  https://www.w3.org/TR/webauthn-3/
- MDN documenteert WebAuthn-extensies en het gebruik van `navigator.credentials`:
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/WebAuthn_extensions
