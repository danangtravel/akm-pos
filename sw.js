const CACHE='akm-pos-shell-v22',SHELL=['./','./index.php','./assets/app.css','./assets/ui.css','./assets/mobile.css','./assets/app.js','./assets/admin-ui.js','./assets/icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.pathname.endsWith('/api.php')||u.searchParams.has('action'))return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))))});

// Web Push & Notification Click Handlers
self.addEventListener('push', e => {
  let data = { title: 'AKM POS', body: 'Có thông báo mới từ hệ thống!', url: './?page=notifications' };
  if (e.data) {
    try { data = Object.assign(data, e.data.json()); } catch (err) { data.body = e.data.text(); }
  }
  const iconUrl = new URL('assets/icon.svg', self.location.origin).href;
  const options = {
    body: data.body,
    icon: iconUrl,
    badge: iconUrl,
    vibrate: [120, 60, 120, 60, 180],
    renotify: true,
    tag: data.tag || ('akm_push_' + Date.now()),
    data: { url: data.url || './?page=notifications' }
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
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

