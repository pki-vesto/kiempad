import { describe, expect, it } from 'vitest';
import { parseRoute } from '../../src/ui/router';

describe('parseRoute', () => {
  it.each([
    ['', 'start', 'overview'],
    ['#/bestaat-niet', 'start', 'overview'],
    ['#start-today', 'start', 'today'],
    ['#start-recommendations?feedback=gedaan', 'start', 'recommendations'],
    ['#traject?route=fasen', 'traject', 'fasen'],
    ['#/agenda?route=historie', 'agenda', 'historie'],
    ['#medicatie?route=beheer', 'medicatie', 'beheer'],
    ['#herinneringen?route=plannen', 'herinneringen', 'plannen'],
    ['#vragen?route=voorbereiden', 'vragen', 'voorbereiden'],
    ['#dossier?route=imaging', 'dossier', 'imaging'],
    ['#kennis?route=ai', 'kennis', 'ai'],
    ['#welzijn?route=history', 'welzijn', 'history'],
    ['#afwegingen?route=choice', 'afwegingen', 'choice'],
    ['#kosten?route=vergoeding', 'kosten', 'vergoeding'],
    ['#logboek?route=privacy', 'logboek', 'privacy'],
    ['#backup?route=import', 'backup', 'import'],
  ])('parset %s naar %s/%s', (hash, screen, subRoute) => {
    expect(parseRoute(hash)).toMatchObject({ screen, subRoute });
  });

  it.each([
    ['#traject?route=bestaat-niet', 'traject', 'overzicht'],
    ['#agenda?route=bestaat-niet', 'agenda', 'overzicht'],
    ['#medicatie?route=bestaat-niet', 'medicatie', 'vandaag'],
    ['#herinneringen?route=bestaat-niet', 'herinneringen', 'status'],
    ['#vragen?route=bestaat-niet', 'vragen', 'open'],
    ['#dossier?route=bestaat-niet', 'dossier', 'upload'],
    ['#kennis?route=bestaat-niet', 'kennis', 'read'],
    ['#welzijn?route=bestaat-niet', 'welzijn', 'overview'],
    ['#afwegingen?route=bestaat-niet', 'afwegingen', 'prepare'],
    ['#kosten?route=bestaat-niet', 'kosten', 'overzicht'],
    ['#logboek?route=bestaat-niet', 'logboek', 'overzicht'],
    ['#backup?route=bestaat-niet', 'backup', 'controleren'],
  ])('valt voor %s veilig terug op %s/%s', (hash, screen, subRoute) => {
    expect(parseRoute(hash)).toMatchObject({ screen, subRoute });
  });

  it.each([
    ['#consult-verslag-form', 'upload', 'consult'],
    ['#dossier-upload-image-context', 'upload', 'document'],
    ['#imaging-filter-form', 'imaging', 'keuze'],
    ['#dossier-documenttijdlijn', 'timeline', 'keuze'],
    ['#dossier-route-review', 'upload', 'review'],
    ['#embryo-quality-form', 'upload', 'embryo-quality'],
    ['#embryo-status-event-form', 'upload', 'embryo-status'],
  ])('behoudt dossier-deeplinks voor %s', (hash, subRoute, dossierAddFlow) => {
    expect(parseRoute(hash)).toMatchObject({
      screen: 'dossier',
      subRoute,
      params: { dossierAddFlow },
    });
  });

  it('leest queryfilters eenmalig uit naar getypte parameters', () => {
    expect(parseRoute('#start-recommendations?feedback=artscheck')).toMatchObject({
      screen: 'start',
      subRoute: 'recommendations',
      params: { dailyRecommendationFeedbackFilter: 'artscheck' },
    });
    expect(parseRoute('#dossier?route=imaging&preview=locked')).toMatchObject({
      screen: 'dossier',
      subRoute: 'imaging',
      params: { imagingPreviewLocked: true },
    });
    expect(
      parseRoute('#start-recommendations?feedback=tracking-payload').params,
    ).not.toHaveProperty('dailyRecommendationFeedbackFilter');
  });
});
