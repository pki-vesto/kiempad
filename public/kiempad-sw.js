self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || message.type !== 'KIEMPAD_NOTIFY') return;

  event.waitUntil(
    self.registration.showNotification(message.title || 'Kiempad herinnering', {
      body: message.body || 'Er staat een herinnering klaar.',
      tag: message.tag,
      renotify: true,
      silent: false,
    }),
  );
});
