// Canonical UI component helpers for Kiempad (Claude Design language).
//
// These are pure functions returning HTML-template strings — same paradigm as
// appShell.ts, no framework. Screens compose from these primitives instead of
// bespoke markup so the product reads as a focused, mobile-first, card-and-hero
// experience rather than a dense admin dashboard.
//
// Convention: `body` / `children` parameters are RAW HTML (already built by the
// caller). Every other text parameter (title, label, subtitle, message, …) is
// PLAIN TEXT and is escaped inside the helper.

import { escapeAttribute, escapeHtml } from './escape';

export type Tone = 'sage' | 'amber' | 'category' | 'ai' | 'info';
export type CardVariant = 'default' | 'raised' | 'subtle' | 'active' | 'warning' | 'danger';
export type StepState = 'done' | 'current' | 'todo' | 'missed';

export type IconName =
  | 'sprout'
  | 'pill'
  | 'calendar'
  | 'file'
  | 'question'
  | 'book'
  | 'heart'
  | 'chevron'
  | 'check'
  | 'plus'
  | 'bell';

const ICONS: Record<IconName, string> = {
  sprout:
    '<path d="M12 21v-7"/><path d="M12 14c0-3 2.2-5 5-5 .2 2.8-2 5-5 5z"/><path d="M12 14c0-2.6-1.9-4.4-4.3-4.4C7.5 12 9.5 14 12 14z"/>',
  pill: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  question:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01"/>',
  book: '<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 16h13"/>',
  heart:
    '<path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 7a3.7 3.7 0 0 1 7 3.7C19 15.4 12 20 12 20z"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12l5 5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 21h4"/>',
};

/** Inline SVG icon (stroke = currentColor). CSP-safe: no external request. */
export function icon(name: IconName): string {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

/** Focused page header: small eyebrow/date + serif title + optional intro. */
export function pageHeader(opts: {
  title: string;
  eyebrow?: string;
  date?: string;
  intro?: string;
  titleId?: string;
}): string {
  const idAttr = opts.titleId ? ` id="${escapeAttribute(opts.titleId)}"` : '';
  const meta = opts.date ?? opts.eyebrow;
  return `<header class="page-header">
    ${meta ? `<p class="page-header__eyebrow">${escapeHtml(meta)}</p>` : ''}
    <h1${idAttr} class="page-header__title">${escapeHtml(opts.title)}</h1>
    ${opts.intro ? `<p class="page-header__intro">${escapeHtml(opts.intro)}</p>` : ''}
  </header>`;
}

/** Vertical single-column stack — replaces the dense 2-column grids. */
export function sectionStack(
  children: string[],
  opts: { className?: string; ariaLabel?: string } = {},
): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  return `<div class="section-stack${cls}"${label}>${children.join('')}</div>`;
}

/** Responsive dashboard shell with a primary task lane and secondary route lane. */
export function dashboardShell(opts: {
  primary: string[];
  secondary?: string[];
  className?: string;
  ariaLabel?: string;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const secondary = opts.secondary?.filter(Boolean) ?? [];
  return `<section class="kp-dashboard${cls}"${label}>
    <div class="kp-dashboard__primary">${opts.primary.filter(Boolean).join('')}</div>
    ${secondary.length > 0 ? `<aside class="kp-dashboard__secondary">${secondary.join('')}</aside>` : ''}
  </section>`;
}

export function domainSplitWorkspace(opts: {
  rail: string;
  main: string;
  context: string;
  className?: string;
  ariaLabel: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';

  return `<section class="domain-split-workspace${cls}" aria-label="${escapeAttribute(opts.ariaLabel)}"${dataAttrs}>
    <aside class="domain-split-workspace__rail" aria-label="Taakrail">
      ${opts.rail}
    </aside>
    <div class="domain-split-workspace__main">
      ${opts.main}
    </div>
    <aside class="domain-split-workspace__context" aria-label="Contextkolom">
      ${opts.context}
    </aside>
  </section>`;
}

/** Task-oriented dashboard section. `body` is raw HTML. */
export function dashboardSection(opts: {
  title: string;
  body: string;
  id?: string;
  eyebrow?: string;
  className?: string;
  ariaLabel?: string;
  route?: string;
}): string {
  const id = opts.id ? ` id="${escapeAttribute(opts.id)}"` : '';
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const route = opts.route ? ` data-dashboard-route="${escapeAttribute(opts.route)}"` : '';
  return `<section${id} class="kp-dashboard-section${cls}"${label}${route}>
    ${opts.eyebrow ? `<p class="kp-dashboard-section__eyebrow">${escapeHtml(opts.eyebrow)}</p>` : ''}
    <h2 class="kp-dashboard-section__title">${escapeHtml(opts.title)}</h2>
    <div class="kp-dashboard-section__body">${opts.body}</div>
  </section>`;
}

/** Guided workflow surface for uploads/forms. `body` is raw HTML. */
export function workflowPanel(opts: {
  title: string;
  body: string;
  steps: readonly { label: string; state?: StepState }[];
  eyebrow?: string;
  intro?: string;
  className?: string;
  data?: Record<string, string>;
  ariaLabel?: string;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  const steps = opts.steps
    .map(
      (step, index) =>
        `<li class="kp-workflow-panel__step" data-state="${escapeAttribute(step.state ?? 'todo')}"><span>${index + 1}</span>${escapeHtml(
          step.label,
        )}</li>`,
    )
    .join('');

  return `<section class="kp-workflow-panel${cls}"${label}${dataAttrs}>
    <header class="kp-workflow-panel__header">
      <div>
        ${opts.eyebrow ? `<p class="kp-workflow-panel__eyebrow">${escapeHtml(opts.eyebrow)}</p>` : ''}
        <h2 class="kp-workflow-panel__title">${escapeHtml(opts.title)}</h2>
        ${opts.intro ? `<p class="kp-workflow-panel__intro">${escapeHtml(opts.intro)}</p>` : ''}
      </div>
      ${steps ? `<ol class="kp-workflow-panel__steps" aria-label="Workflowstappen">${steps}</ol>` : ''}
    </header>
    <div class="kp-workflow-panel__body">${opts.body}</div>
  </section>`;
}

/** Structured vertical timeline. Items should be built with `timelineItem`. */
export function timelineList(opts: {
  items: readonly string[];
  id?: string;
  className?: string;
  ariaLabel?: string;
  data?: Record<string, string>;
}): string {
  const id = opts.id ? ` id="${escapeAttribute(opts.id)}"` : '';
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  return `<ol${id} class="kp-timeline${cls}"${label}${dataAttrs}>${opts.items.join('')}</ol>`;
}

/** Timeline entry with a rail/dot and raw HTML detail body. */
export function timelineItem(opts: {
  title: string;
  meta: string;
  body: string;
  detail?: string;
  state?: StepState;
  className?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const state = opts.state ?? 'todo';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  return `<li class="kp-timeline__item${cls}" data-state="${escapeAttribute(state)}"${dataAttrs}>
    <div class="kp-timeline__rail" aria-hidden="true"><span class="kp-timeline__dot"></span></div>
    <article class="kp-timeline__body">
      <h3 class="kp-timeline__title">${escapeHtml(opts.title)}</h3>
      <p class="kp-timeline__meta">${escapeHtml(opts.meta)}</p>
      ${opts.detail ? `<p class="kp-timeline__detail">${escapeHtml(opts.detail)}</p>` : ''}
      ${opts.body}
    </article>
  </li>`;
}

/** Recommendation owner/card list. Items should be built with `recommendationGroup`. */
export function recommendationList(opts: {
  groups: readonly string[];
  className?: string;
  ariaLabel?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  return `<div class="kp-recommendation-list${cls}"${label}${dataAttrs}>${opts.groups.join('')}</div>`;
}

/** Recommendation group for an owner/daypart. */
export function recommendationGroup(opts: {
  title: string;
  items: readonly string[];
  ariaLabel?: string;
  className?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  return `<section class="kp-recommendation-group${cls}"${label}${dataAttrs}>
    <h3 class="kp-recommendation-group__title">${escapeHtml(opts.title)}</h3>
    <ol class="kp-recommendation-group__items">${opts.items.join('')}</ol>
  </section>`;
}

/** Recommendation card with raw HTML context/actions. */
export function recommendationCard(opts: {
  title: string;
  detail: string;
  meta: string;
  body: string;
  id?: string;
  owner?: string;
  className?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const data = {
    ...(opts.id ? { 'recommendation-id': opts.id } : {}),
    ...(opts.owner ? { 'recommendation-owner': opts.owner } : {}),
    ...(opts.data ?? {}),
  };
  const dataAttrs = Object.entries(data)
    .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
    .join('');
  return `<li class="kp-recommendation-card${cls}"${dataAttrs}>
    <header class="kp-recommendation-card__header">
      <h4 class="kp-recommendation-card__title">${escapeHtml(opts.title)}</h4>
      <p class="kp-recommendation-card__detail">${escapeHtml(opts.detail)}</p>
      <p class="kp-recommendation-card__meta">${escapeHtml(opts.meta)}</p>
    </header>
    <div class="kp-recommendation-card__body">${opts.body}</div>
  </li>`;
}

/** Research source list. Items should be built with `researchSourceCard`. */
export function researchSourceList(opts: {
  title: string;
  intro: string;
  items: readonly string[];
  emptyState?: string;
  className?: string;
  ariaLabel?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  return `<section class="kp-research-source-list${cls}"${label}${dataAttrs}>
    <h2 class="kp-research-source-list__title">${escapeHtml(opts.title)}</h2>
    <p class="kp-research-source-list__intro">${escapeHtml(opts.intro)}</p>
    ${
      opts.items.length > 0
        ? `<ol class="kp-research-source-list__items">${opts.items.join('')}</ol>`
        : `<p class="empty-state">${escapeHtml(opts.emptyState ?? 'Nog geen researchbronnen vastgelegd.')}</p>`
    }
  </section>`;
}

/** Research source card with allowlist/source context. */
export function researchSourceCard(opts: {
  title: string;
  meta: string;
  detail: string;
  id?: string;
  source?: string;
  className?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const data = {
    ...(opts.id ? { 'research-source-id': opts.id } : {}),
    ...(opts.source ? { 'research-source': opts.source } : {}),
    ...(opts.data ?? {}),
  };
  const dataAttrs = Object.entries(data)
    .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
    .join('');
  return `<li class="kp-research-source-card${cls}"${dataAttrs}>
    <h3 class="kp-research-source-card__title">${escapeHtml(opts.title)}</h3>
    <p class="kp-research-source-card__meta">${escapeHtml(opts.meta)}</p>
    <p class="kp-research-source-card__detail">${escapeHtml(opts.detail)}</p>
  </li>`;
}

/** Research summary list. Items should be built with `researchSummaryCard`. */
export function researchSummaryList(opts: {
  title: string;
  intro: string;
  items: readonly string[];
  kind: 'scientific' | 'patient' | 'relevance';
  emptyState: string;
  className?: string;
  ariaLabel?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const data = {
    'research-summary-list-kind': opts.kind,
    ...(opts.data ?? {}),
  };
  const dataAttrs = Object.entries(data)
    .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
    .join('');
  return `<section class="kp-research-summary-list${cls}"${label}${dataAttrs}>
    <header class="kp-research-summary-list__header">
      <h2 class="kp-research-summary-list__title">${escapeHtml(opts.title)}</h2>
      <p class="kp-research-summary-list__intro">${escapeHtml(opts.intro)}</p>
    </header>
    ${
      opts.items.length > 0
        ? `<ol class="kp-research-summary-list__items">${opts.items.join('')}</ol>`
        : `<p class="empty-state">${escapeHtml(opts.emptyState)}</p>`
    }
  </section>`;
}

/** Research summary/source card with raw HTML metadata body. */
export function researchSummaryCard(opts: {
  title: string;
  meta: string;
  summary: string;
  sourceCitation: string;
  conceptLabel: string;
  body: string;
  kind: 'scientific' | 'patient' | 'relevance';
  id?: string;
  source?: string;
  className?: string;
  data?: Record<string, string>;
}): string {
  const cls = opts.className ? ` ${opts.className}` : '';
  const data = {
    'research-summary-kind': opts.kind,
    ...(opts.id ? { 'research-summary-id': opts.id } : {}),
    ...(opts.source ? { 'research-summary-source': opts.source } : {}),
    ...(opts.data ?? {}),
  };
  const dataAttrs = Object.entries(data)
    .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
    .join('');
  return `<li class="kp-research-summary-card${cls}"${dataAttrs}>
    <article class="kp-research-summary-card__body">
      <header class="kp-research-summary-card__header">
        <h3 class="kp-research-summary-card__title">${escapeHtml(opts.title)}</h3>
        <p class="kp-research-summary-card__meta">${escapeHtml(opts.meta)}</p>
      </header>
      <p class="kp-research-summary-card__summary">${escapeHtml(opts.summary)}</p>
      <dl class="kp-research-summary-card__facts">
        <div><dt>sourceCitation</dt><dd>${escapeHtml(opts.sourceCitation)}</dd></div>
        <div><dt>Conceptstatus</dt><dd>${escapeHtml(opts.conceptLabel)}</dd></div>
      </dl>
      <div class="kp-research-summary-card__details">${opts.body}</div>
    </article>
  </li>`;
}

/** Rounded surface card. `body` is raw HTML. */
export function card(opts: {
  body: string;
  id?: string;
  title?: string;
  titleTag?: 'h2' | 'h3';
  eyebrow?: string;
  variant?: CardVariant;
  ariaLabel?: string;
  className?: string;
}): string {
  const tag = opts.titleTag ?? 'h2';
  const id = opts.id ? ` id="${escapeAttribute(opts.id)}"` : '';
  const variant = opts.variant && opts.variant !== 'default' ? ` kp-card--${opts.variant}` : '';
  const cls = opts.className ? ` ${opts.className}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const head =
    (opts.eyebrow ? `<p class="kp-card__eyebrow">${escapeHtml(opts.eyebrow)}</p>` : '') +
    (opts.title ? `<${tag} class="kp-card__title">${escapeHtml(opts.title)}</${tag}>` : '');
  return `<section${id} class="kp-card${variant}${cls}"${label}>${head}${opts.body}</section>`;
}

/** Next-step / navigation card: tinted icon tile + title + subtitle + chevron. */
export function actionCard(opts: {
  title: string;
  href?: string;
  subtitle?: string;
  iconName?: IconName;
  tone?: Tone;
  chevron?: boolean;
  ariaLabel?: string;
}): string {
  const tone = opts.tone ? ` action-card--${opts.tone}` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const tile = opts.iconName
    ? `<span class="action-card__tile" aria-hidden="true">${icon(opts.iconName)}</span>`
    : '';
  const text = `<span class="action-card__text"><span class="action-card__title">${escapeHtml(opts.title)}</span>${
    opts.subtitle ? `<span class="action-card__subtitle">${escapeHtml(opts.subtitle)}</span>` : ''
  }</span>`;
  const chevron =
    opts.chevron === false
      ? ''
      : `<span class="action-card__chevron" aria-hidden="true">${icon('chevron')}</span>`;
  const inner = `${tile}${text}${chevron}`;
  if (opts.href) {
    return `<a class="action-card${tone}" href="${escapeAttribute(opts.href)}"${label}>${inner}</a>`;
  }
  return `<div class="action-card${tone}"${label}>${inner}</div>`;
}

/** Signature current-phase hero: dark-sage card, serif label, segmented dots. */
export function phaseHeroCard(opts: {
  phaseLabel: string;
  id?: string;
  eyebrow?: string;
  subtitle?: string;
  steps?: { label: string; state: StepState }[];
  cta?: { href: string; label: string };
}): string {
  const id = opts.id ? ` id="${escapeAttribute(opts.id)}"` : '';
  const dots = (opts.steps ?? [])
    .map(
      (s) =>
        `<span class="phase-hero__dot" data-state="${escapeAttribute(s.state)}"><span class="sr-only">${escapeHtml(
          s.label,
        )}</span></span>`,
    )
    .join('');
  return `<section${id} class="phase-hero" aria-label="Huidige fase">
    ${opts.eyebrow ? `<p class="phase-hero__eyebrow">${escapeHtml(opts.eyebrow)}</p>` : ''}
    <p class="phase-hero__label">${escapeHtml(opts.phaseLabel)}</p>
    ${opts.subtitle ? `<p class="phase-hero__subtitle">${escapeHtml(opts.subtitle)}</p>` : ''}
    ${dots ? `<div class="phase-hero__dots" role="presentation">${dots}</div>` : ''}
    ${
      opts.cta
        ? `<a class="phase-hero__cta" href="${escapeAttribute(opts.cta.href)}">${escapeHtml(opts.cta.label)}</a>`
        : ''
    }
  </section>`;
}

/** Scannable stat row (totaal / vergoed / eigen risico, etc.). */
export function statRow(
  items: { label: string; value: string; tone?: 'default' | 'success' | 'warning' | 'danger' }[],
): string {
  const cells = items
    .map((it) => {
      const tone = it.tone && it.tone !== 'default' ? ` stat--${it.tone}` : '';
      return `<div class="stat${tone}"><span class="stat__value">${escapeHtml(
        it.value,
      )}</span><span class="stat__label">${escapeHtml(it.label)}</span></div>`;
    })
    .join('');
  return `<div class="stat-row">${cells}</div>`;
}

export function firstViewportWorkbench(opts: {
  classPrefix: string;
  className?: string;
  ariaLabel: string;
  data?: Record<string, string>;
  eyebrow: string;
  title: string;
  intro: string;
  status: string;
  focusAriaLabel: string;
  focusEyebrow: string;
  focusTitle: string;
  focusDetail: string;
  stats: { label: string; value: string; tone?: 'default' | 'success' | 'warning' | 'danger' }[];
  actions: readonly { href: string; label: string }[];
  actionsAriaLabel: string;
}): string {
  const sectionClass = [opts.classPrefix, opts.className].filter(Boolean).join(' ');
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  const actions = opts.actions
    .map((action) => `<a href="${escapeAttribute(action.href)}">${escapeHtml(action.label)}</a>`)
    .join('');

  return `
    <section class="${escapeAttribute(sectionClass)}" aria-label="${escapeAttribute(opts.ariaLabel)}"${dataAttrs}>
      <header class="${escapeAttribute(opts.classPrefix)}__header">
        <div>
          <p class="kp-card__eyebrow">${escapeHtml(opts.eyebrow)}</p>
          <h2>${escapeHtml(opts.title)}</h2>
          <p>${escapeHtml(opts.intro)}</p>
        </div>
        <p class="${escapeAttribute(opts.classPrefix)}__status">${escapeHtml(opts.status)}</p>
      </header>
      <div class="${escapeAttribute(opts.classPrefix)}__grid">
        <section class="${escapeAttribute(opts.classPrefix)}__focus" aria-label="${escapeAttribute(
          opts.focusAriaLabel,
        )}">
          <p class="kp-card__eyebrow">${escapeHtml(opts.focusEyebrow)}</p>
          <h3>${escapeHtml(opts.focusTitle)}</h3>
          <p>${escapeHtml(opts.focusDetail)}</p>
        </section>
        <div class="${escapeAttribute(opts.classPrefix)}__panel">
          ${statRow(opts.stats)}
          <nav class="${escapeAttribute(opts.classPrefix)}__actions" aria-label="${escapeAttribute(
            opts.actionsAriaLabel,
          )}">
            ${actions}
          </nav>
        </div>
      </div>
    </section>
  `;
}

export function commandRouteSummary(opts: {
  eyebrow: string;
  title: string;
  detail: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  status?: string;
  data?: Record<string, string>;
  ariaLabel?: string;
}): string {
  const dataAttrs = opts.data
    ? Object.entries(opts.data)
        .map(([key, value]) => ` data-${escapeAttribute(key)}="${escapeAttribute(value)}"`)
        .join('')
    : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const secondary = opts.secondary
    ? `<a class="command-route-summary__action command-route-summary__action--secondary" href="${escapeAttribute(
        opts.secondary.href,
      )}">${escapeHtml(opts.secondary.label)}</a>`
    : '';

  return `<section class="command-route-summary"${label}${dataAttrs}>
    <div>
      <p class="command-route-summary__eyebrow">${escapeHtml(opts.eyebrow)}</p>
      <h3>${escapeHtml(opts.title)}</h3>
      <p>${escapeHtml(opts.detail)}</p>
    </div>
    <div class="command-route-summary__meta">
      ${opts.status ? `<span class="command-route-summary__status">${escapeHtml(opts.status)}</span>` : ''}
      <a class="command-route-summary__action" href="${escapeAttribute(opts.primary.href)}">${escapeHtml(
        opts.primary.label,
      )}</a>
      ${secondary}
    </div>
  </section>`;
}

/** Vertical dot/line timeline with a highlighted current item. `body` is raw HTML. */
export function timeline(
  items: { title: string; meta?: string; state?: StepState; body?: string }[],
  opts: { id?: string; ariaLabel?: string } = {},
): string {
  const idAttr = opts.id ? ` id="${escapeAttribute(opts.id)}"` : '';
  const label = opts.ariaLabel ? ` aria-label="${escapeAttribute(opts.ariaLabel)}"` : '';
  const rows = items
    .map(
      (it) => `<li class="kp-timeline__item" data-state="${escapeAttribute(it.state ?? 'future')}">
      <span class="kp-timeline__rail" aria-hidden="true"><span class="kp-timeline__dot"></span></span>
      <div class="kp-timeline__body">
        <p class="kp-timeline__title">${escapeHtml(it.title)}</p>
        ${it.meta ? `<p class="kp-timeline__meta">${escapeHtml(it.meta)}</p>` : ''}
        ${it.body ?? ''}
      </div>
    </li>`,
    )
    .join('');
  return `<ol class="kp-timeline"${idAttr}${label}>${rows}</ol>`;
}

/** Expandable accordion (knowledge): coloured category eyebrow + body. `body` is raw HTML. */
export function accordion(
  items: {
    summary: string;
    body: string;
    category?: { label: string; tone: Tone };
    open?: boolean;
    className?: string;
  }[],
): string {
  return items
    .map((it) => {
      const open = it.open ? ' open' : '';
      const cls = it.className ? ` ${it.className}` : '';
      const cat = it.category
        ? `<span class="kp-accordion__cat" data-tone="${escapeAttribute(it.category.tone)}">${escapeHtml(
            it.category.label,
          )}</span>`
        : '';
      return `<details class="kp-accordion${cls}"${open}>
      <summary class="kp-accordion__summary">${cat}<span class="kp-accordion__title">${escapeHtml(
        it.summary,
      )}</span><span class="kp-accordion__chevron" aria-hidden="true">${icon('chevron')}</span></summary>
      <div class="kp-accordion__body">${it.body}</div>
    </details>`;
    })
    .join('');
}

/** Progressive-disclosure wrapper: collapses a secondary form behind a toggle. `body` is raw HTML. */
export function disclosure(opts: {
  summary: string;
  body: string;
  open?: boolean;
  id?: string;
}): string {
  const open = opts.open ? ' open' : '';
  const idAttr = opts.id ? ` id="${escapeAttribute(opts.id)}"` : '';
  return `<details class="kp-disclosure"${idAttr}${open}>
    <summary class="kp-disclosure__summary"><span class="kp-disclosure__plus" aria-hidden="true">${icon(
      'plus',
    )}</span>${escapeHtml(opts.summary)}</summary>
    <div class="kp-disclosure__body">${opts.body}</div>
  </details>`;
}

/** Empty state with optional call to action. */
export function emptyState(opts: {
  message: string;
  title?: string;
  iconName?: IconName;
  cta?: { href: string; label: string };
}): string {
  const cta = opts.cta
    ? `<a class="inline-action" href="${escapeAttribute(opts.cta.href)}">${escapeHtml(opts.cta.label)}</a>`
    : '';
  const heading = opts.title ? `<h3 class="kp-empty__title">${escapeHtml(opts.title)}</h3>` : '';
  return `<div class="empty-state kp-empty"><span class="kp-empty__tile" aria-hidden="true">${icon(opts.iconName ?? 'sprout')}</span>${heading}<p>${escapeHtml(opts.message)}</p>${cta}</div>`;
}

/** Loading skeleton (shimmer disabled under prefers-reduced-motion via CSS). */
export function loadingSkeleton(
  opts: { lines?: number; variant?: 'card' | 'list' | 'text' } = {},
): string {
  const lines = Math.max(1, opts.lines ?? 3);
  const variant = opts.variant ?? 'text';
  const blocks = Array.from(
    { length: lines },
    () => '<span class="kp-skeleton__line"></span>',
  ).join('');
  return `<div class="kp-skeleton kp-skeleton--${variant}" aria-hidden="true">${blocks}</div>`;
}

/** Error banner (role=alert), reuses the existing .form-error token styling. */
export function errorBanner(message: string): string {
  return `<p class="form-error" role="alert">${escapeHtml(message)}</p>`;
}

/** Neutral status / success message. */
export function statusMessage(message: string): string {
  return `<p class="status-message" role="status">${escapeHtml(message)}</p>`;
}
