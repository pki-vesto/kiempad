self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('kiempad-ui-restore-v2')
      .then((cache) =>
        cache.addAll(['/', '/index.html', '/manifest.webmanifest', '/kiempad-icon.svg']),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== 'kiempad-ui-restore-v2').map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open('kiempad-ui-restore-v2').then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open('kiempad-ui-restore-v2').then((cache) => cache.put(request, copy));
          return response;
        }),
    ),
  );
});

self.addEventListener('message', (event) => {
  const message = event.data;
  if (message?.type !== 'KIEMPAD_NOTIFY') return;

  event.waitUntil(
    self.registration.showNotification(message.title || 'Kiempad herinnering', {
      body: message.body || 'Er staat een herinnering klaar.',
      tag: message.tag,
      renotify: true,
      silent: false,
    }),
  );
});
