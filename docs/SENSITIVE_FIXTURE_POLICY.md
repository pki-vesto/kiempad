# Sensitive Fixture Policy

Kiempad staat in een publieke repository. Testdata en voorbeelddata moeten daarom
altijd synthetisch zijn en mogen geen echte patiënt-, partner-, kliniek- of
contactgegevens bevatten.

## Regels

- Gebruik `Testpersoon A`, `Testpersoon B` of domeinspecifieke rolwoorden in plaats
  van echte namen.
- Gebruik e-mailadressen op `voorbeeld.test` of `example.test`.
- Gebruik voor redactievoorbeelden alleen duidelijk synthetische nummers, zoals
  `BSN: 111111111` of `Dossiernummer: TEST-0001`.
- Gebruik geen screenshots, exports of tekstfragmenten uit echte portalen of
  consulten in tests.
- Secretfixtures blijven beperkt tot expliciete placeholders die ook door
  `npm run secrets:check` zijn toegestaan.
- Bestandsnamen in tests beschrijven het type document, niet een echte persoon of
  echte patiënt-id.

## Gate

`npm run fixtures:check` scant testfixtures op patronen die te veel op echte data
lijken, waaronder niet-synthetische e-maildomeinen, echte naamvelden en realistische
BSN-achtige fixtures. Deze gate draait in CI naast de secrets scan.

## Allowlist governance

De scanner heeft een kleine exact-match allowlist in
`scripts/check-sensitive-fixtures.mjs`. Iedere allowlist-entry moet direct naast de
waarde een concrete rationale hebben. De allowlist is alleen bedoeld voor herkenbaar
synthetische edge cases zoals:

- `Naam: Testpersoon A`
- `Naam: Testpersoon B`
- `E-mail: testpersoon@example.test`
- `E-mail: testpersoon@voorbeeld.test`
- `BSN: 111111111`

Niet allowlisten:

- echte namen of relationele namen;
- echte of werkende e-maildomeinen;
- BSN-, patiënt- of dossiernummers die realistisch lijken;
- screenshots, exports of tekstfragmenten uit echte portalen;
- complete directories om false positives te ontwijken.

Review de allowlist maandelijks samen met security-maintenance en altijd bij nieuwe
testfixtures voor dossier, imaging, consult of embryo-workflows. Een nieuwe uitzondering
vereist een rationale, een test die ontbrekende rationale laat falen en een korte
vermelding in de PR.

Als een test bewust redactiegedrag moet bewijzen, gebruik dan synthetische waarden
die herkenbaar nep zijn en controleer dat de originele waarde niet in output of
metadata terugkomt.
