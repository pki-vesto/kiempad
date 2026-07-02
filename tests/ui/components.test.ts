import { describe, expect, it } from 'vitest';
import {
  accordion,
  actionCard,
  card,
  disclosure,
  emptyState,
  errorBanner,
  icon,
  loadingSkeleton,
  pageHeader,
  phaseHeroCard,
  sectionStack,
  statRow,
  statusBadge,
  statusMessage,
  timeline,
} from '../../src/ui/components';
import { escapeAttribute, escapeHtml } from '../../src/ui/escape';

describe('escape', () => {
  it('escapes HTML metacharacters', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#039;&lt;/a&gt;',
    );
    expect(escapeAttribute('"<>')).toBe('&quot;&lt;&gt;');
  });
});

describe('pageHeader', () => {
  it('renders title, eyebrow and id; escapes text', () => {
    const html = pageHeader({ title: 'Vandaag', eyebrow: '24 juni', titleId: 'screen-title' });
    expect(html).toContain('class="page-header"');
    expect(html).toContain('id="screen-title"');
    expect(html).toContain('Vandaag');
    expect(html).toContain('24 juni');
    expect(pageHeader({ title: '<x>' })).toContain('&lt;x&gt;');
  });
});

describe('card', () => {
  it('renders variant class and raw body', () => {
    const html = card({ title: 'Titel', body: '<p data-x="1">raw</p>', variant: 'active' });
    expect(html).toContain('kp-card--active');
    expect(html).toContain('<p data-x="1">raw</p>');
    expect(html).toContain('Titel');
  });
});

describe('actionCard', () => {
  it('renders a link with icon, subtitle, chevron and tone', () => {
    const html = actionCard({
      title: 'Medicatie',
      subtitle: '21:00',
      href: '#medicatie',
      iconName: 'pill',
      tone: 'amber',
    });
    expect(html).toContain('<a class="action-card action-card--amber" href="#medicatie"');
    expect(html).toContain('action-card__tile');
    expect(html).toContain('21:00');
    expect(html).toContain('action-card__chevron');
  });
  it('omits chevron when disabled and renders a div without href', () => {
    const html = actionCard({ title: 'X', chevron: false });
    expect(html).toContain('<div class="action-card"');
    expect(html).not.toContain('action-card__chevron');
  });
});

describe('phaseHeroCard', () => {
  it('renders label, dots with state, and cta', () => {
    const html = phaseHeroCard({
      phaseLabel: 'Stimulatie',
      eyebrow: 'Huidige fase',
      steps: [
        { label: 'Voorbereiding', state: 'done' },
        { label: 'Stimulatie', state: 'current' },
      ],
      cta: { href: '#traject', label: 'Bekijk traject' },
    });
    expect(html).toContain('phase-hero');
    expect(html).toContain('Stimulatie');
    expect(html).toContain('data-state="done"');
    expect(html).toContain('data-state="current"');
    expect(html).toContain('href="#traject"');
  });
});

describe('statRow', () => {
  it('renders values, labels and tone', () => {
    const html = statRow([
      { label: 'Totaal', value: '€1.200' },
      { label: 'Vergoed', value: '€900', tone: 'success' },
    ]);
    expect(html).toContain('stat-row');
    expect(html).toContain('stat--success');
    expect(html).toContain('€900');
    expect(html).toContain('Totaal');
  });
});

describe('statusBadge', () => {
  it('renders tone, custom class and data attributes; escapes label', () => {
    const html = statusBadge({
      label: '<Vergoed>',
      tone: 'success',
      className: 'status-badge--cost',
      data: {
        'status-badge': 'cost',
        'status-badge-state': 'ja',
      },
    });

    expect(html).toContain('class="status-badge status-badge--cost"');
    expect(html).toContain('data-status-badge="cost"');
    expect(html).toContain('data-status-badge-state="ja"');
    expect(html).toContain('data-status-badge-tone="success"');
    expect(html).toContain('&lt;Vergoed&gt;');
  });
});

describe('timeline', () => {
  it('renders items with state and an id', () => {
    const html = timeline([{ title: 'Intake', meta: '12 jun', state: 'done' }], {
      id: 'tl',
      ariaLabel: 'Tijdlijn',
    });
    expect(html).toContain('id="tl"');
    expect(html).toContain('data-state="done"');
    expect(html).toContain('Intake');
    expect(html).toContain('aria-label="Tijdlijn"');
  });
});

describe('accordion', () => {
  it('renders details with category tone and raw body', () => {
    const html = accordion([
      {
        summary: 'CoQ10',
        category: { label: 'Research', tone: 'ai' },
        body: '<p>x</p>',
        open: true,
      },
    ]);
    expect(html).toContain('<details class="kp-accordion" open>');
    expect(html).toContain('data-tone="ai"');
    expect(html).toContain('<p>x</p>');
  });
});

describe('disclosure', () => {
  it('wraps a body behind a summary; keeps body in DOM', () => {
    const html = disclosure({ summary: 'Toevoegen', body: '<form id="x"></form>' });
    expect(html).toContain('<details class="kp-disclosure"');
    expect(html).toContain('Toevoegen');
    expect(html).toContain('<form id="x"></form>');
  });
});

describe('states', () => {
  it('emptyState renders message and optional cta', () => {
    const html = emptyState({
      id: 'lege-staat',
      message: 'Nog niets',
      cta: { href: '#a', label: 'Voeg toe' },
    });
    expect(html).toContain('empty-state');
    expect(html).toContain('id="lege-staat"');
    expect(html).toContain('Nog niets');
    expect(html).toContain('href="#a"');
  });
  it('loadingSkeleton renders the requested number of lines', () => {
    const html = loadingSkeleton({ lines: 4 });
    expect(html.match(/kp-skeleton__line/g)?.length).toBe(4);
  });
  it('errorBanner has role=alert', () => {
    expect(errorBanner('Fout')).toContain('role="alert"');
  });
  it('statusMessage has role=status', () => {
    expect(statusMessage('Opgeslagen')).toContain('role="status"');
  });
});

describe('icon / sectionStack', () => {
  it('icon returns inline svg (no external url)', () => {
    const svg = icon('sprout');
    expect(svg).toContain('<svg');
    expect(svg).not.toContain('http');
  });
  it('sectionStack wraps children', () => {
    expect(sectionStack(['<i>a</i>', '<i>b</i>'], { ariaLabel: 'X' })).toContain(
      '<div class="section-stack" aria-label="X"><i>a</i><i>b</i></div>',
    );
  });
});
