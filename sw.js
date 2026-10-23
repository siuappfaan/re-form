const C='reform-1.8.1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='reform-data').map(x=>caches.delete(x)))).then(()=>clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});

const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
async function refreshNote(){
 try{if(!self.Notification||Notification.permission!='granted')return;
  const r=await (await caches.open('reform-data')).match('snap');if(!r)return;
  const o=await r.json(),now=new Date(),t=iso(now),m=new Date(now);m.setDate(m.getDate()-((m.getDay()+6)%7));
  const wk=[];for(let i=0;i<7;i++){const d=new Date(m);d.setDate(m.getDate()+i);wk.push(iso(d))}
  const n=o.ex.filter(e=>!e.days.includes(t)&&e.days.filter(d=>wk.includes(d)).length<e.per).length;
  if(n>0)await self.registration.showNotification('re:form',{body:n+' exercise'+(n>1?'s':'')+' left today',tag:'left',silent:true,icon:'icon-192.png',badge:'icon-192.png'});
  else(await self.registration.getNotifications({tag:'left'})).forEach(x=>x.close());
  if(self.navigator&&navigator.setAppBadge){n?navigator.setAppBadge(n):navigator.clearAppBadge()}
 }catch(e){}}
self.addEventListener('periodicsync',e=>{if(e.tag=='reform-left')e.waitUntil(refreshNote())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():clients.openWindow('./')))});
