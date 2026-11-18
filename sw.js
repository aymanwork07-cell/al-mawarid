// Al-Mawārid offline cache: the site and texts work without internet; audio streams when online.
const V='mw-v1';
const CORE=['./','index.html','dalail.json','manifest.webmanifest','icon-192.png','nalayn.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||/\.mp3$/i.test(u.pathname)||r.headers.has('range'))return; // audio: straight from network
  if(u.origin===location.origin&&(r.mode==='navigate'||/\.(html|json|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/'))){
    // pages and texts: fresh when online, cached when offline
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
    return;
  }
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    // images, icons, fonts: cached after first view
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})));
  }
});
