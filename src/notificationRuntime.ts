import { komendeHerinneringen, localDateTimeIso } from './domain/herinnering';
import type { AppSettings } from './domain/settings';
import type { Herinnering } from './domain/types';

export type NotificationRuntimeStatus = {
  permission: NotificationPermission | 'unsupported';
  serviceWorker: 'unsupported' | 'unregistered' | 'ready' | 'error';
};

const timers = new Map<string, number>();
const MAX_TIMER_DELAY_MS = 24 * 60 * 60 * 1000;
const GENERIC_NOTIFICATION = {
  title: 'Kiempad herinnering',
  body: 'Er staat een herinnering klaar.',
};

export type NotificationDetailMap = Record<string, string | undefined>;
export type NotificationMessage = {
  title: string;
  body: string;
};

export async function getNotificationRuntimeStatus(): Promise<NotificationRuntimeStatus> {
  if (!('Notification' in globalThis)) {
    return { permission: 'unsupported', serviceWorker: 'unsupported' };
  }

  if (!('serviceWorker' in navigator)) {
    return { permission: Notification.permission, serviceWorker: 'unsupported' };
  }

  const registration = await navigator.serviceWorker.getRegistration('/kiempad-sw.js');
  return {
    permission: Notification.permission,
    serviceWorker: registration ? 'ready' : 'unregistered',
  };
}

export async function requestNotificationPermissionAndRegister(): Promise<NotificationRuntimeStatus> {
  if (!('Notification' in globalThis) || !('serviceWorker' in navigator)) {
    return { permission: 'unsupported', serviceWorker: 'unsupported' };
  }

  const registration = await registerKiempadServiceWorker();
  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;

  return {
    permission,
    serviceWorker: registration ? 'ready' : 'error',
  };
}

export async function registerKiempadServiceWorker(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (!('serviceWorker' in navigator)) return undefined;
  return navigator.serviceWorker.register('/kiempad-sw.js');
}

export function scheduleLocalNotifications(
  herinneringen: readonly Herinnering[],
  settings: AppSettings,
  details: NotificationDetailMap = {},
  vanaf = new Date(),
): void {
  clearScheduledNotifications();
  if (!('Notification' in globalThis) || Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator)) return;

  const nowIso = localDateTimeIso(vanaf);
  const upcoming = komendeHerinneringen(herinneringen, nowIso).slice(0, 20);

  upcoming.forEach((item) => {
    const dueAt = new Date(`${item.volgendMoment}:00.000`).getTime();
    const delay = dueAt - vanaf.getTime();
    if (delay < 0 || delay > MAX_TIMER_DELAY_MS) return;

    const timer = window.setTimeout(() => {
      void notifyViaServiceWorker(
        item.herinnering.id,
        buildNotificationMessage(item.herinnering, settings, details),
      );
      timers.delete(item.herinnering.id);
    }, delay);
    timers.set(item.herinnering.id, timer);
  });
}

export function clearScheduledNotifications(): void {
  timers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  timers.clear();
}

export function buildNotificationMessage(
  herinnering: Herinnering,
  settings: AppSettings,
  details: NotificationDetailMap = {},
): NotificationMessage {
  if (!settings.toonNotificatieDetailsOpVergrendelscherm) return GENERIC_NOTIFICATION;

  const detail = details[herinnering.id] ?? details[herinnering.bron.refId ?? ''];
  if (!detail) return GENERIC_NOTIFICATION;

  return {
    title: 'Kiempad herinnering',
    body: detail,
  };
}

async function notifyViaServiceWorker(id: string, message: NotificationMessage): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration('/kiempad-sw.js');
  if (!registration) return;

  const worker = registration.active ?? navigator.serviceWorker.controller;
  worker?.postMessage({
    type: 'KIEMPAD_NOTIFY',
    title: message.title,
    body: message.body,
    tag: `kiempad-herinnering-${id}`,
  });
}
