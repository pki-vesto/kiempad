# ADR-0003: AI-samenvatting alleen opt-in, met waarborgen

Date: 2026-06-23

## Status

Accepted.

## Context

Een AI-component die research samenvat is gewenst, maar staat op gespannen voet met
privacy (data naar een externe dienst) en met de niet-medische grondhouding (geen
dosering/diagnose/behandelkeuze).

## Decision

De AI-functie is **standaard uit** en uitsluitend **opt-in**. Wanneer aangezet:

- Werkt **alleen op expliciet verzoek** (geen automatische/achtergrond-AI).
- Stuurt **geminimaliseerde, zo veel mogelijk gede-identificeerde** tekst; geen
  namen/kliniek-identificatie als het niet nodig is.
- Geeft output met een **waarschuwingslabel** ("ongeverifieerd, geen medisch advies")
  en **bronvermelding**.
- Geeft **nooit** dosering, diagnose of behandelkeuze.
- Resultaten worden opgeslagen als `KennisItem` met `ai_gegenereerd = true`; pas na
  bevestiging door een behandelaar wordt `geverifieerd_met_arts = true`.
- De API-sleutel staat **versleuteld** in de lokale opslag (niet in de repo/`.env`).

## Consequences

- De gebruiker behoudt controle; privacy blijft de norm.
- Externe providers kunnen verzonden tekst loggen/cachen — daarom minimaliseren en
  de-identificeren (zie `SECURITY.md`, `PRIVACY.md`).
- Voorkeur voor goedkope, snelle modellen voor samenvatten; later eventueel on-device
  AI om de cloud-stap te vermijden (ROADMAP F4).
