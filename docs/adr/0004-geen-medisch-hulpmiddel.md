# ADR-0004: Geen medisch hulpmiddel — disclaimer en grenzen

Date: 2026-06-23

## Status

Accepted.

## Context

Kiempad raakt aan medische informatie (fasen, medicatie, symptomen). Het mag en wil
**geen** medisch hulpmiddel zijn en **geen** medisch advies geven; het is een
informatie- en organisatietool voor eigen gebruik.

## Decision

- Kiempad is expliciet **geen medisch hulpmiddel** en **geen vervanging van medisch
  advies**. Een **disclaimer** is zichtbaar in de app én in de documentatie.
- De app (en de AI) **berekent of adviseert geen dosering**, stelt **geen diagnose** en
  maakt **geen behandelkeuze**. Doseringen worden alleen **vastgelegd zoals de kliniek
  ze opgeeft**.
- **Schema's volgen altijd de kliniek.** Bij conflict tussen app en kliniek wint de
  kliniek.
- Medische inhoud is **concept** tot een behandelaar het bevestigt
  (`geverifieerd_met_arts`), en AI-output is altijd gelabeld als ongeverifieerd.

## Consequences

- Functionaliteit die richting diagnose/dosering/behandeladvies zou neigen, wordt
  **niet** gebouwd.
- Dit is een **harde policy** (zie `MASTER_CONTEXT.md` §4, P1) en geldt voor alle
  toekomstige features en voor de AI-laag.
- Vermindert juridisch en gezondheidsrisico en houdt de scope helder.
