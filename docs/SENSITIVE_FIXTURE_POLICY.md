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

Als een test bewust redactiegedrag moet bewijzen, gebruik dan synthetische waarden
die herkenbaar nep zijn en controleer dat de originele waarde niet in output of
metadata terugkomt.
