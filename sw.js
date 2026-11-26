// うんどうクエスト オフライン対応
// フォントやアイコンを変えたときは VERSION の数字を1つ上げる
const VERSION = 'uq-v1';
const ASSETS = ['./', './index.html', './manifest.json', './DotGothic16-Regular.woff2', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // アプリ本体はネット優先（更新がすぐ届く）、つながらないときは保存した版
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // フォント・アイコンは保存した版を優先
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
