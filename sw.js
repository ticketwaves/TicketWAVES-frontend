const CACHE='ticketwaves-shell-v24-speed';
const SHELL=['./','./index.html','./accept-transfer.html','./payment-callback.html','./manifest.webmanifest'];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.pathname.includes('/api/')) return;
  if(e.request.method!=='GET') return;

  // Navigation/config files must be fresh so deployments and API URL changes are picked up immediately.
  if(e.request.mode==='navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/config.js') || u.pathname.endsWith('/payment-callback.html') || u.pathname.endsWith('/accept-transfer.html')){
    e.respondWith(
      fetch(e.request,{cache:'no-store'}).then(r=>{
        if(r.ok && u.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});} 
        return r;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  // Cache static assets for fast repeat visits.
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(r=>{
        if(r.ok && u.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});} 
        return r;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
