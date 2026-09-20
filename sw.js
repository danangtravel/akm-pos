const CACHE = 'akm-pos-shell-v23';
const SHELL = [
  './',
  './index.php',
  './assets/app.css',
  './assets/ui.css',
  './assets/mobile.css',
  './assets/app.js',
  './assets/admin-ui.js',
  './assets/icon.svg',
  './assets/icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon.png',
  './assets/mountain-bg.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // Never cache API requests or non-GET requests
  if (e.request.method !== 'GET' || u.pathname.endsWith('/api.php') || u.searchParams.has('action')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.status === 200) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});

// Web Push & Notification Click Handlers (RFC 8291 / iOS 16.4+ / Android)
self.addEventListener('push', e => {
  let data = {
    title: 'AKM POS · Thông báo mới',
    body: 'Có cập nhật đơn hàng hoặc dịch vụ sửa chữa từ hệ thống!',
    url: './?page=notifications'
  };
  if (e.data) {
    try {
      data = Object.assign(data, e.data.json());
    } catch (err) {
      data.body = e.data.text();
    }
  }

  const iconUrl = new URL('assets/icon-192.png', self.location.origin).href;
  const badgeUrl = new URL('assets/favicon.png', self.location.origin).href;

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: badgeUrl,
    vibrate: [120, 60, 120, 60, 180],
    renotify: true,
    tag: data.tag || ('akm_push_' + (data.id || Date.now())),
    data: { url: data.url || './?page=notifications' },
    actions: [
      { action: 'open', title: 'Xem chi tiết' },
      { action: 'close', title: 'Đóng' }
    ]
  };

  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'close') return;

  const rawUrl = e.notification.data?.url || './?page=notifications';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIF_CLICK_NAV', url: targetUrl });
          if ('navigate' in client && client.url !== targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

