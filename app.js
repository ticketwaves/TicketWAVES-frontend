const API_ROOT=(window.TICKETWAVES_API_URL||'').replace(/\/$/,'');
const API=API_ROOT+'/api';
let token=localStorage.getItem('ticketwaves_token')||'';
let user=null, selectedCategory='', currentEvent=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function headers(){const h={'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;return h}
async function api(path,opt={}){const r=await fetch(API+path,{...opt,headers:{...headers(),...(opt.headers||{})}});const txt=await r.text();let d={};try{d=txt?JSON.parse(txt):{}}catch{d={message:txt||'The server returned an invalid response.'}}if(!r.ok)throw Error(d.message||'Something went wrong.');return d}
function toast(m){const t=$('toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),3000)}
function setBusy(btn,busy,label){if(!btn)return;if(busy){btn.dataset.original=btn.textContent;btn.disabled=true;btn.classList.add('is-loading');btn.innerHTML='<span class="spinner"></span> '+esc(label||'Please wait…')}else{btn.disabled=false;btn.classList.remove('is-loading');btn.textContent=btn.dataset.original||'Continue'}}
function go(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));const p=$(id);if(!p)return;p.classList.add('active');document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.remove('active'));const map={discover:'navDiscover',foryou:'navForyou',tickets:'navTickets',sell:'navSell',account:'navAccount'};if(map[id]&&$(map[id]))$(map[id]).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});if(id==='discover')loadEvents();if(id==='foryou')loadForYou();if(id==='tickets')loadTickets();if(id==='account')loadAccount();if(id==='sell')loadSell();if(id==='admin'){if(user?.role==='admin')renderAdmin();else {toast('Administrator access required.');go('account')}}}
function setCategory(c){selectedCategory=c;document.querySelectorAll('.quick').forEach(x=>x.classList.remove('active'));const text=c||'All';document.querySelectorAll('.quick').forEach(x=>{if(x.textContent.includes(text)||(!c&&x.textContent.trim()==='All'))x.classList.add('active')});loadEvents()}

function v34LazyImages(){
  const imgs=document.querySelectorAll('img[loading="lazy"]:not([data-v34-lazy])');
  imgs.forEach(img=>img.dataset.v34Lazy='1');
  if(!('IntersectionObserver' in window)) return;
  if(!window.__v34LazyObserver){
    window.__v34LazyObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const img=entry.target;
        if(img.dataset.src && !img.src) img.src=img.dataset.src;
        window.__v34LazyObserver.unobserve(img);
      });
    },{rootMargin:'300px 0px'});
  }
  imgs.forEach(img=>window.__v34LazyObserver.observe(img));
}

function art(e){return e.image?`<img src="${esc(e.image)}" alt="${esc(e.title||'Event')}" loading="lazy" decoding="async" fetchpriority="low" sizes="(max-width: 650px) 48vw, (max-width: 850px) 50vw, 33vw" onerror="this.remove()">`:`<div class="art-word">${esc((e.artist||e.title||'LIVE').slice(0,26))}</div>`}
function eventCard(e){const id=e.id||e._id;const date=e.date||'Date TBA';const qty=e.quantity||e.ticketCount||e.availableCount;return `<article class="event-card tm-event-card"><div class="event-art tm-event-art">${art(e)}<div class="event-date-overlay">${esc(date.toUpperCase())}${e.time?' · '+esc(e.time):''}</div><div class="event-favorite">♡</div></div><div class="event-body tm-event-body"><span class="tag">${esc(e.category||'EVENT')}</span><h3>${esc(e.title||'Live event')}</h3><div class="tm-event-rule"></div><p class="event-location">${esc(e.venue||'Venue TBA')}${e.city?' · '+esc(e.city):''}${e.country?' · '+esc(e.country):''}</p><div class="event-card-footer"><span>${e.currencySymbol||''}${e.fromPrice!=null?esc(Number(e.fromPrice).toLocaleString()):''}</span>${qty?`<small>${esc(qty)} available</small>`:''}</div><button class="primary wide action-btn tm-view-btn" onclick="openEvent('${esc(id)}',this)">▣ &nbsp; View Tickets</button></div></article>`}
async function loadEvents(){const box=$('eventGrid');if(!box)return;box.innerHTML='<div class="skeleton-card"></div><div class="skeleton-card"></div>';try{const q=($('searchInput')?.value||'').trim();let path='/events';const params=[];if(q)params.push('search='+encodeURIComponent(q));if(selectedCategory)params.push('category='+encodeURIComponent(selectedCategory));if(params.length)path+='?'+params.join('&');const events=await api(path);box.innerHTML=events.length?events.map(eventCard).join(''):'<div class="empty">No events found yet. Try another search. 💙</div>';v34LazyImages()}catch(e){box.innerHTML=`<div class="empty">We couldn’t load events right now.<br><small>${esc(e.message)}</small><br><button class="secondary" onclick="loadEvents()">Try again</button></div>`}}
async function loadForYou(){const b=$('forYouGrid');if(!b)return;b.innerHTML='<div class="skeleton-card"></div>';try{const es=await api('/events');b.innerHTML=es.slice(0,9).map(eventCard).join('')||'<div class="empty">Your picks are waiting for new events. ✨</div>'}catch(e){b.innerHTML=`<div class="empty">${esc(e.message)}<br><button class="secondary" onclick="loadForYou()">Try again</button></div>`}}
async function openEvent(id,btn){if(!id||id==='undefined'){toast('That event link is missing its ID.');return}setBusy(btn,true,'Opening');try{const d=await api('/events/'+encodeURIComponent(id)+'/page');currentEvent=d.event;const tickets=d.tickets||[];go('eventDetails');$('eventDetailsBox').innerHTML=`<button class="text-btn" onclick="go('discover')">← Back to Discover</button><div class="event-detail-hero">${art(d.event)}<div class="event-detail-overlay"><span class="tag">${esc(d.event.category||'EVENT')}</span><h1>${esc(d.event.title)}</h1><p>${esc(d.event.artist||'Live event')}</p></div></div><div class="event-detail-meta"><div><small>DATE & TIME</small><b>${esc(d.event.date||'TBA')} · ${esc(d.event.time||'TBA')}</b></div><div><small>VENUE</small><b>${esc(d.event.venue||'TBA')}</b><span>${esc([d.event.city,d.event.country].filter(Boolean).join(', '))}</span></div></div><div class="form-card event-description"><p>${esc(d.event.description||'A TicketWAVES live experience.')}</p></div><div class="section-head"><div><small>${esc(d.availableCount||tickets.length)} AVAILABLE</small><h2>Choose your ticket</h2></div></div><div class="ticket-choice-list">${tickets.length?tickets.map(ticketRow).join(''):'<div class="empty">No tickets are available right now.</div>'}</div>`}catch(e){toast(e.message)}finally{setBusy(btn,false)}}
function ticketRow(t){return `<div class="ticket-choice"><div><b>Section ${esc(t.section||'General')}</b><span>Row ${esc(t.row||'—')} · Seat ${esc(t.seat||'—')}</span><strong>${esc(t.currencySymbol||'₦')}${Number(t.price||0).toLocaleString()}</strong></div><button class="primary action-btn" onclick="startCheckout('${esc(t.id||t._id)}',this)">Buy</button></div>`}
async function startCheckout(ticketId,btn){if(!token){toast('Please sign in first.');go('login');return}if(!currentEvent){toast('Please reopen the event.');return}setBusy(btn,true,'Checking');try{const d=await api('/payment/initialize',{method:'POST',body:JSON.stringify({eventId:currentEvent.id||currentEvent._id,ticketIds:[ticketId]})});if(d.free){location.href='payment-callback.html?reference='+encodeURIComponent(d.reference);return}go('checkout');$('checkoutBox').innerHTML=`<div class="page-title"><small>ALMOST THERE</small><h1>Checkout 💙</h1><p>Your selection is ready. Complete secure payment to issue the ticket.</p></div><div class="form-card"><div class="friendly-banner"><div><small>ORDER TOTAL</small><h2>${esc(d.currency==='NGN'?'₦':d.currency)}${Number(d.total||0).toLocaleString()}</h2><p>Secure checkout powered by Paystack.</p></div><div class="ticket-sticker">🔒</div></div><button id="payNowBtn" class="primary wide action-btn" style="margin-top:18px" onclick="location.href='${esc(d.authorization_url)}'">Continue to secure payment</button><p class="muted" style="font-size:12px;margin-top:12px">You’ll return to TicketWAVES after payment. Don’t close the payment page while it is processing.</p></div>`}catch(e){toast(e.message)}finally{setBusy(btn,false)}}
async function loadTickets(){const b=$('ticketsBox');if(!b)return;if(!token){b.innerHTML='<div class="empty">Sign in to see your tickets.<br><br><button class="primary" onclick="go(\'login\')">Sign in</button></div>';return}b.innerHTML='<div class="skeleton-card"></div>';try{await api('/tickets/repair-transfers',{method:'POST',body:'{}'}).catch(()=>{});const ts=await api('/tickets/me');b.innerHTML=ts.length?ts.map(ticketCard).join(''):'<div class="empty">No tickets yet. Your next great night could be one tap away. ✨<br><br><button class="primary" onclick="go(\'discover\')">Find an event</button></div>';const pendingTransfer=localStorage.getItem('ticketwaves_open_transfer');if(pendingTransfer){localStorage.removeItem('ticketwaves_open_transfer');setTimeout(()=>transferTicket(pendingTransfer),120)} }catch(e){b.innerHTML=`<div class="empty">${esc(e.message)}<br><button class="secondary" onclick="loadTickets()">Try again</button></div>`}}
function ticketCard(t){const e=t.event||{};const id=t.id||t._id;const qty=Number(t.quantity||1);return `<article class="event-card tm-event-card my-ticket-event-card"><div class="event-art tm-event-art">${art(e)}<div class="event-date-overlay">${esc((e.date||'Date TBA').toUpperCase())}${e.time?' · '+esc(e.time):''}</div><div class="ticket-count-badge">×${qty}</div></div><div class="event-body tm-event-body"><span class="tag">MY TICKET</span><h3>${esc(e.title||'Live event')}</h3><div class="tm-event-rule"></div><p class="event-location">${esc(e.venue||'Venue TBA')}${e.city?' · '+esc(e.city):''}${e.country?' · '+esc(e.country):''}</p><div class="my-ticket-seat-row"><div><small>SECTION</small><b>${esc(t.section||'General')}</b></div><div><small>ROW</small><b>${esc(t.row||'—')}</b></div><div><small>SEAT</small><b>${esc(t.seat||'—')}</b></div></div><p class="my-ticket-code">Order ${esc(t.ticketCode||t.id||'—')}</p><button class="primary wide action-btn tm-view-btn" onclick="openTicket('${esc(id)}')">▣ &nbsp; View Tickets</button><div class="my-ticket-secondary-actions"><button class="secondary action-btn" onclick="transferTicket('${esc(id)}')">Transfer</button><button class="secondary action-btn" onclick="sellTicket('${esc(id)}')">Sell</button></div></div></article>`}
function openTicket(id){location.href='ticket.html?id='+encodeURIComponent(id)}
async function transferTicket(id){openSheet(`<div class="sheet-kicker">TRANSFER TICKET</div><h2>Send this ticket to someone.</h2><p class="muted">Enter the recipient’s details. They’ll receive an invitation and must sign in with the same email to accept.</p><form class="form-card" style="box-shadow:none;padding:0;border:0" onsubmit="submitTransfer(event,'${esc(id)}')"><div class="two"><label>First name<input id="transferFirst" autocomplete="given-name" required></label><label>Last name<input id="transferSurname" autocomplete="family-name" required></label></div><label>Email<input id="transferEmail" type="email" autocomplete="email" required></label><button id="transferSubmit" class="primary wide action-btn">Continue</button></form>`)}
async function submitTransfer(e,id){e.preventDefault();const btn=$('transferSubmit');const email=$('transferEmail').value.trim().toLowerCase();setBusy(btn,true,'Sending');try{const d=await api('/tickets/'+encodeURIComponent(id)+'/transfer',{method:'POST',body:JSON.stringify({email,firstName:$('transferFirst').value.trim(),surname:$('transferSurname').value.trim()})});closeSheet();toast(d.emailQueued?'Transfer sent — check the recipient email. ✨':'Transfer created. The recipient can accept from their notification.');loadTickets()}catch(err){toast(err.message)}finally{setBusy(btn,false)}}
async function sellTicket(id){if(!token){go('login');return}try{const t=await api('/tickets/'+encodeURIComponent(id)+'?lite=1');openSheet(`<div class="sheet-kicker">SELL THIS TICKET</div><h2>Tell us where to send your money.</h2><p class="muted">Our team will review the request before the ticket is listed.</p><form class="form-card" style="box-shadow:none;padding:0;border:0" onsubmit="submitSell(event,'${esc(id)}')"><label>Account name<input id="sellName" required></label><label>Bank name<input id="sellBank" required></label><label>Account number<input id="sellNumber" inputmode="numeric" required></label><label>Asking price<input id="sellPrice" type="number" min="0" value="${Number(t.price||0)}" required></label><button id="sellSubmit" class="primary wide action-btn">Submit request</button></form>`)}catch(e){toast(e.message)}}
async function submitSell(e,id){e.preventDefault();const btn=$('sellSubmit');setBusy(btn,true,'Sending');try{await api('/sell-requests',{method:'POST',body:JSON.stringify({ticketId:id,accountName:$('sellName').value,bankName:$('sellBank').value,accountNumber:$('sellNumber').value,price:Number($('sellPrice').value)})});closeSheet();toast('Sell request sent for review.');}catch(err){toast(err.message)}finally{setBusy(btn,false)}}
async function loadSell(){const b=$('sellBox');if(!token){b.innerHTML='<div class="empty">Sign in to manage tickets you own.<br><br><button class="primary" onclick="go(\'login\')">Sign in</button></div>';return}try{const ts=await api('/tickets/me');b.innerHTML=ts.length?ts.map(t=>{const e=t.event||{};return `<div class="admin-row"><div><b>${esc(e.title||'Ticket')}</b><br><small>${esc(t.section||'General')} · ${esc(t.row||'—')} · ${esc(t.seat||'—')}</small></div><button class="secondary action-btn" onclick="sellTicket('${esc(t.id)}')">Sell</button></div>`}).join(''):'<div class="empty">You have no tickets to sell yet.</div>'}catch(e){b.innerHTML=`<div class="empty">${esc(e.message)}<br><button class="secondary" onclick="loadSell()">Try again</button></div>`}}
async function loadAccount(){const b=$('accountBox');if(!token){b.innerHTML='<div class="auth-card"><small>YOUR SPACE</small><h1>Account</h1><p>Sign in to manage tickets, transfers and notifications.</p><button class="primary wide" onclick="go(\'login\')">Sign in</button><button class="secondary wide" style="margin-top:8px" onclick="go(\'register\')">Create account</button></div>';return}try{const d=await api('/auth/me');user=d.user;updateAdminVisibility();if(user.role==='admin'){b.innerHTML=`<div class="page-title"><small>CONTROL ROOM ACCESS</small><h1>Hello, ${esc(user.firstName||user.name||'Admin')} 🛠️</h1><p>${esc(user.email)}</p></div><div class="admin-entry-card"><div><span class="tag">ADMIN</span><h2>TicketWAVES Control Room</h2><p>Manage users, events, tickets, orders, sell requests and giveaways.</p></div><button class="primary action-btn" onclick="go('admin')">Open Admin</button></div><div class="form-card" style="margin-top:12px"><h3>My account</h3><p class="muted">${esc(user.country||'Country not set')} · ${esc(user.phone||'Phone not set')}</p><button class="secondary" onclick="editAccount()">Edit details</button></div><button class="danger wide" style="margin-top:12px" onclick="logout()">Sign out</button>`;return}b.innerHTML=`<div class="page-title"><small>HELLO</small><h1>${esc(user.firstName||user.name||'there')} 👋</h1><p>${esc(user.email)}</p></div><div class="form-card"><h3>My account</h3><p class="muted">${esc(user.country||'Country not set')} · ${esc(user.phone||'Phone not set')}</p><button class="secondary" onclick="editAccount()">Edit details</button></div><div class="form-card"><h3>Notifications</h3><p class="muted">Keep ticket transfers and payment updates close by.</p><button class="secondary" onclick="openNotifications()">Open notifications</button></div><div class="form-card"><h3>Security</h3><button class="secondary" onclick="showForgot()">Reset password</button></div><button class="danger wide" style="margin-top:12px" onclick="logout()">Sign out</button>`}catch(e){logout()}}
function updateAdminVisibility(){const b=$('adminTopBtn');if(b)b.classList.toggle('hidden',user?.role!=='admin')}
function editAccount(){openSheet(`<div class="sheet-kicker">ACCOUNT</div><h2>Your details</h2><form class="form-card" style="box-shadow:none;padding:0;border:0" onsubmit="saveAccount(event)"><div class="two"><label>First name<input id="acFirst" value="${esc(user.firstName||'')}" required></label><label>Surname<input id="acSurname" value="${esc(user.surname||'')}" required></label></div><label>Phone<input id="acPhone" value="${esc(user.phone||'')}" required></label><label>Country<input id="acCountry" value="${esc(user.country||'')}" required></label><button id="accountSave" class="primary wide action-btn">Save changes</button></form>`)}
async function saveAccount(e){e.preventDefault();const btn=$('accountSave');setBusy(btn,true,'Saving');try{const d=await api('/account',{method:'PUT',body:JSON.stringify({firstName:$('acFirst').value,surname:$('acSurname').value,phone:$('acPhone').value,country:$('acCountry').value})});user=d.user;closeSheet();toast('Account updated.');loadAccount()}catch(err){toast(err.message)}finally{setBusy(btn,false)}}
async function login(e){e.preventDefault();const btn=e.submitter||e.target.querySelector('button[type="submit"],button.primary');setBusy(btn,true,'Signing in');try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email:$('loginEmail').value,password:$('loginPassword').value})});token=d.token;localStorage.setItem('ticketwaves_token',token);user=d.user;updateAdminVisibility();toast('Welcome back! 💙');const after=localStorage.getItem('ticketwaves_after_transfer');if(after){localStorage.removeItem('ticketwaves_after_transfer');location.href=after;return}const pending=localStorage.getItem('ticketwaves_pending_transfer_token');if(pending){location.href='accept-transfer.html?token='+encodeURIComponent(pending);return}go(d.user.role==='admin'?'admin':'account')}catch(err){toast(err.message)}finally{setBusy(btn,false)}}
async function registerUser(e){e.preventDefault();const btn=e.submitter||e.target.querySelector('button');setBusy(btn,true,'Creating account');try{const d=await api('/auth/register',{method:'POST',body:JSON.stringify({firstName:$('registerFirst').value,surname:$('registerSurname').value,phone:$('registerPhone').value,country:$('registerCountry').value,email:$('registerEmail').value,password:$('registerPassword').value})});token=d.token;localStorage.setItem('ticketwaves_token',token);user=d.user;updateAdminVisibility();toast('Account created. Welcome to TicketWAVES! ✨');const after=localStorage.getItem('ticketwaves_after_transfer');const pending=localStorage.getItem('ticketwaves_pending_transfer_token');if(pending){
      try{const claimed=await api('/transfers/accept-token',{method:'POST',body:JSON.stringify({token:pending})});
        localStorage.removeItem('ticketwaves_pending_transfer_token');localStorage.removeItem('ticketwaves_after_transfer');localStorage.removeItem('ticketwaves_transfer_email');
        toast(claimed.status?'Ticket accepted! Your ticket is now in My Tickets. 🎉':'Account created.');
        setTimeout(()=>go('tickets'),250);return;
      }catch(claimErr){toast('Account created. Please finish accepting the ticket.');localStorage.removeItem('ticketwaves_after_transfer');location.href='accept-transfer.html?token='+encodeURIComponent(pending);return}
    }
    if(after){localStorage.removeItem('ticketwaves_after_transfer');location.href=after;return}go('account')}catch(err){toast(err.message)}finally{setBusy(btn,false)}}
function countries(){const c=['Nigeria','United Kingdom','United States','Canada','Ghana','Kenya','South Africa','France','Germany','Belgium','Spain','Netherlands','Australia','Other'];const el=$('registerCountry');if(el)el.innerHTML=c.map(x=>`<option>${x}</option>`).join('')}
function showForgot(){openSheet(`<div class="sheet-kicker">ACCOUNT SECURITY</div><h2>Reset your password</h2><p class="muted">We’ll send a secure reset link if the email exists.</p><form class="form-card" style="box-shadow:none;padding:0;border:0" onsubmit="forgot(event)"><label>Email<input id="forgotEmail" type="email" required></label><button id="forgotSubmit" class="primary wide action-btn">Send reset link</button></form>`)}
async function forgot(e){e.preventDefault();const btn=$('forgotSubmit');setBusy(btn,true,'Sending');try{const d=await api('/auth/forgot-password',{method:'POST',body:JSON.stringify({email:$('forgotEmail').value.trim()})});closeSheet();toast(d.message)}catch(err){toast(err.message)}finally{setBusy(btn,false)}}
function openSheet(html){const sheet=$('sheet');const body=$('sheetBody');if(!sheet||!body){toast('TicketWAVES form container is unavailable. Please refresh the page.');return}body.innerHTML=html;sheet.classList.add('open');document.body.classList.add('no-scroll')}
function closeSheet(){const sheet=$('sheet');if(sheet)sheet.classList.remove('open');document.body.classList.remove('no-scroll')}
async function openNotifications(){if(!token){go('login');return}try{const ns=await api('/notifications');const cards=ns.length?ns.map(n=>`<div class="notification ${n.read?'':'unread'}"><b>${esc(n.title)}</b><p>${esc(n.message)}</p><small class="muted">${new Date(n.createdAt).toLocaleString()}</small></div>`).join(''):'<div class="empty">You are all caught up. ♡</div>';openSheet(`<div class="sheet-kicker">NOTIFICATIONS</div><h2>Your updates</h2><button class="text-btn" onclick="readAll()">Mark all read</button>${cards}`);if(ns.some(n=>!n.read))$('notifDot')?.classList.remove('hidden')}catch(e){toast(e.message)}}
async function readAll(){try{await api('/notifications/read-all',{method:'POST'});$('notifDot')?.classList.add('hidden');openNotifications()}catch(e){toast(e.message)}}
function renderAdmin(){if(user?.role!=='admin'){toast('Administrator access required.');return}const b=$('adminBox');b.innerHTML=`<div class="page-title"><small>CONTROL ROOM</small><h1>Admin dashboard 🛠️</h1><p>Manage TicketWAVES without leaving the mobile experience.</p></div><div class="admin-tabs"><button class="active" onclick="adminTab('dash',this)">Overview</button><button onclick="adminTab('users',this)">Users</button><button onclick="adminTab('events',this)">Events</button><button onclick="adminTab('tickets',this)">Tickets</button><button onclick="adminTab('orders',this)">Orders</button><button onclick="adminTab('sell',this)">Sell requests</button><button onclick="adminTab('giveaways',this)">Giveaways</button></div><div id="adminDash" class="admin-section active"></div><div id="adminUsers" class="admin-section"></div><div id="adminEvents" class="admin-section"></div><div id="adminTickets" class="admin-section"></div><div id="adminOrders" class="admin-section"></div><div id="adminSell" class="admin-section"></div><div id="adminGiveaways" class="admin-section"></div><button class="danger wide" style="margin-top:16px" onclick="logout()">Sign out</button>`;loadAdminDash()}
function adminTab(name,btn){document.querySelectorAll('.admin-section').forEach(x=>x.classList.remove('active'));$('admin'+name.charAt(0).toUpperCase()+name.slice(1)).classList.add('active');document.querySelectorAll('.admin-tabs button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const fn={dash:loadAdminDash,users:loadAdminUsers,events:loadAdminEvents,tickets:loadAdminTickets,orders:loadAdminOrders,sell:loadAdminSell,giveaways:loadAdminGiveaways}[name];if(fn)fn()}
async function loadAdminDash(){try{const d=await api('/admin/stats');$('adminDash').innerHTML=`<div class="stats">${Object.entries(d).map(([k,v])=>`<div class="stat"><small>${esc(k.replace(/([A-Z])/g,' $1'))}</small><strong>${esc(v)}</strong></div>`).join('')}</div><div class="form-card" style="margin-top:12px"><h3>Quick action</h3><p class="muted">Use the tabs above to manage the live system. Changes are protected by the admin API.</p></div>`}catch(e){$('adminDash').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function loadAdminUsers(){try{const xs=await api('/admin/users');$('adminUsers').innerHTML=`<div class="admin-list">${xs.map(u=>`<div class="admin-row"><div><b>${esc(u.name||u.email)}</b><br><small>${esc(u.email)} · ${esc(u.role)} ${u.suspended?'· SUSPENDED':''}</small></div><button class="secondary action-btn" onclick="suspendAdmin('${esc(u.id||u._id)}',${!u.suspended})">${u.suspended?'Restore':'Suspend'}</button></div>`).join('')}</div>`}catch(e){$('adminUsers').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function suspendAdmin(id,value){try{await api('/admin/users/'+encodeURIComponent(id)+'/suspend',{method:'PUT',body:JSON.stringify({suspended:value})});toast(value?'User suspended.':'User restored.');loadAdminUsers()}catch(e){toast(e.message)}}
async function loadAdminEvents(){try{const xs=await api('/admin/events');$('adminEvents').innerHTML=`<button class="primary action-btn" onclick="createAdminEvent()">+ Create event</button><div class="admin-list" style="margin-top:10px">${xs.map(e=>{const t=e.tickets?.[0]||{};return `<div class="admin-row admin-event-row"><div><b>${esc(e.title)}</b><br><small>${esc(e.date)} · ${esc(e.venue)} · ${esc(e.city||'')}</small><br><small>Price: ${esc(t.currencySymbol||'')}${Number(t.price||0).toLocaleString()} · Currency: ${esc(t.currency||'NGN')}</small></div><div class="admin-actions"><button class="secondary action-btn" onclick="editAdminEvent('${esc(e.id||e._id)}')">Edit</button><button class="danger action-btn" onclick="archiveAdminEvent('${esc(e.id||e._id)}')">Archive</button></div></div>`}).join('')}</div>`}catch(e){$('adminEvents').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function archiveAdminEvent(id){if(!confirm('Archive this event and its available tickets?'))return;try{await api('/admin/events/'+encodeURIComponent(id),{method:'DELETE'});toast('Event archived.');loadAdminEvents()}catch(e){toast(e.message)}}
function createAdminEvent(){
  openSheet(`<div class="sheet-kicker">ADMIN EVENT</div><h2>Add an event</h2>
  <p class="muted">Add the event artwork now. You can use an image URL or upload an image from your phone.</p>
  <form class="form-card" style="box-shadow:none;padding:0;border:0" onsubmit="submitAdminEvent(event)">
    <label>Event title<input id="aeTitle" required></label>
    <label>Artist<input id="aeArtist" required></label>
    <label>Category<select id="aeCategory"><option>Concert</option><option>Sports</option><option>Theatre</option><option>Comedy</option><option>Festival</option><option>Other</option></select></label>
    <label>Date<input id="aeDate" type="date" required></label>
    <label>Time<input id="aeTime" type="time" required></label>
    <label>Venue<input id="aeVenue" required></label>
    <label>City<input id="aeCity" required></label>
    <label>Country<select id="aeCountry" required><option>Nigeria</option><option>United States</option><option>Canada</option><option>United Kingdom</option><option>France</option><option>Germany</option><option>Belgium</option><option>Spain</option><option>Netherlands</option><option>Australia</option><option>Other</option></select></label>
    <label>Event image URL<input id="aeImage" type="url" placeholder="https://example.com/event-image.jpg" oninput="previewAdminImage()"></label>
    <label>Or upload image<input id="aeImageFile" type="file" accept="image/jpeg,image/png,image/webp" onchange="previewAdminImageFile(event)"></label>
    <div id="aeImagePreview" class="image-preview">Event image preview</div>
    <label>Description<textarea id="aeDescription" rows="3" placeholder="Event information shown to fans"></textarea></label>
    <div class="two"><label>Ticket price<input id="aePrice" type="number" min="0" step="0.01" required></label><label>Currency<select id="aeCurrency"><option value="NGN">NGN — ₦</option><option value="USD">USD — $</option><option value="CAD">CAD — C$</option><option value="GBP">GBP — £</option><option value="EUR">EUR — €</option></select></label></div>
    <div class="two"><label>Section<input id="aeSection" value="General"></label><label>Row<input id="aeRow"></label></div>
    <label>Seat<input id="aeSeat"></label>
    <button id="aeSubmit" class="primary wide action-btn">Publish event</button>
  </form>`);
}
async function editAdminEvent(id){
  try{
    const e=await api('/admin/events/'+encodeURIComponent(id));const t=e.tickets?.[0]||{};
    openSheet(`<div class="sheet-kicker">ADMIN EVENT</div><h2>Edit event</h2><p class="muted">Update the event details, artwork, ticket price and currency without deleting the event.</p>
    <form class="form-card" style="box-shadow:none;padding:0;border:0" onsubmit="submitEditAdminEvent(event,'${esc(e.id)}')">
      <label>Event title<input id="editTitle" required value="${esc(e.title)}"></label><label>Artist<input id="editArtist" required value="${esc(e.artist||'')}"></label>
      <div class="two"><label>Category<select id="editCategory"><option ${e.category==='Concert'?'selected':''}>Concert</option><option ${e.category==='Sports'?'selected':''}>Sports</option><option ${e.category==='Theatre'?'selected':''}>Theatre</option><option ${e.category==='Comedy'?'selected':''}>Comedy</option><option ${e.category==='Festival'?'selected':''}>Festival</option><option ${e.category==='Other'?'selected':''}>Other</option></select></label><label>Date<input id="editDate" type="date" required value="${esc(e.date||'')}"></label></div>
      <label>Time<input id="editTime" type="time" required value="${esc(e.time||'')}"></label><label>Venue<input id="editVenue" required value="${esc(e.venue||'')}"></label>
      <div class="two"><label>City<input id="editCity" required value="${esc(e.city||'')}"></label><label>Country<input id="editCountry" required value="${esc(e.country||'')}"></label></div>
      <label>Event image URL<input id="editImage" type="url" value="${esc(e.image||'')}" oninput="previewEditImage()"></label><label>Or upload image<input id="editImageFile" type="file" accept="image/jpeg,image/png,image/webp" onchange="previewEditImageFile(event)"></label><div id="editImagePreview" class="image-preview">${e.image?`<img src="${esc(e.image)}" alt="Event preview">`:'Event image preview'}</div>
      <label>Description<textarea id="editDescription" rows="3">${esc(e.description||'')}</textarea></label>
      <div class="two"><label>Ticket price<input id="editPrice" type="number" min="0" step="0.01" required value="${esc(t.price||0)}"></label><label>Currency<select id="editCurrency"><option value="NGN" ${t.currency==='NGN'?'selected':''}>NGN — ₦</option><option value="USD" ${t.currency==='USD'?'selected':''}>USD — $</option><option value="CAD" ${t.currency==='CAD'?'selected':''}>CAD — C$</option><option value="GBP" ${t.currency==='GBP'?'selected':''}>GBP — £</option><option value="EUR" ${t.currency==='EUR'?'selected':''}>EUR — €</option></select></label></div>
      <div class="two"><label>Section<input id="editSection" value="${esc(t.section||'General')}"></label><label>Row<input id="editRow" value="${esc(t.row||'')}"></label></div><label>Seat<input id="editSeat" value="${esc(t.seat||'')}"></label>
      <button id="editEventSubmit" data-ticket-id="${esc(t.id||'')}" class="primary wide action-btn">Save changes</button></form>`);
  }catch(err){toast(err.message)}
}
function previewEditImage(){const u=$('editImage')?.value.trim(),p=$('editImagePreview');if(p)p.innerHTML=u?`<img src="${esc(u)}" alt="Event preview">`:'Event image preview'}
function previewEditImageFile(ev){const f=ev.target.files?.[0],p=$('editImagePreview');if(!f||!p)return;if(f.size>2.5*1024*1024){toast('Please choose an image smaller than 2.5 MB.');ev.target.value='';return}const r=new FileReader();r.onload=()=>{p.innerHTML=`<img src="${esc(r.result)}" alt="Event preview">`;p.dataset.image=r.result};r.readAsDataURL(f)}
async function submitEditAdminEvent(ev,id){ev.preventDefault();const btn=$('editEventSubmit');setBusy(btn,true,'Saving');try{const image=$('editImagePreview')?.dataset.image||$('editImage').value.trim();const e=await api('/admin/events/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({title:$('editTitle').value.trim(),artist:$('editArtist').value.trim(),category:$('editCategory').value,date:$('editDate').value,time:$('editTime').value,venue:$('editVenue').value.trim(),city:$('editCity').value.trim(),country:$('editCountry').value.trim(),description:$('editDescription').value.trim(),image,tickets:[{id:$('editEventSubmit').dataset.ticketId||undefined,price:Number($('editPrice').value),currency:$('editCurrency').value,section:$('editSection').value.trim(),row:$('editRow').value.trim(),seat:$('editSeat').value.trim(),image}]})});closeSheet();toast('Event updated successfully. ✨');loadAdminEvents();loadEvents();}catch(err){toast(err.message)}finally{setBusy(btn,false)}}

function previewAdminImage(){
  const url=$('aeImage')?.value.trim(),p=$('aeImagePreview');
  if(!p)return;
  p.innerHTML=url?`<img src="${esc(url)}" alt="Event preview" onerror="this.parentElement.textContent='Image URL could not be loaded.'">`:'Event image preview';
}
function previewAdminImageFile(ev){
  const file=ev.target.files?.[0],p=$('aeImagePreview');
  if(!file||!p)return;
  if(file.size>2.5*1024*1024){toast('Please choose an image smaller than 2.5 MB.');ev.target.value='';return}
  const reader=new FileReader();
  reader.onload=()=>{p.innerHTML=`<img src="${esc(reader.result)}" alt="Event preview">`;p.dataset.image=reader.result};
  reader.readAsDataURL(file);
}
async function submitAdminEvent(e){
  e.preventDefault();
  const btn=$('aeSubmit');setBusy(btn,true,'Publishing');
  try{
    const fileImage=$('aeImagePreview')?.dataset.image||'';
    const image=fileImage||$('aeImage').value.trim();
    const payload={
      title:$('aeTitle').value.trim(),artist:$('aeArtist').value.trim(),category:$('aeCategory').value,
      date:$('aeDate').value,time:$('aeTime').value,venue:$('aeVenue').value.trim(),city:$('aeCity').value.trim(),
      country:$('aeCountry').value,description:$('aeDescription').value.trim(),image,
      tickets:[{section:$('aeSection').value.trim(),row:$('aeRow').value.trim(),seat:$('aeSeat').value.trim(),quantity:1,price:Number($('aePrice').value),currency:$('aeCurrency').value,image:image}]
    };
    await api('/admin/events',{method:'POST',body:JSON.stringify(payload)});
    closeSheet();toast('Event published with its artwork. ✨');loadAdminEvents();
  }catch(err){toast(err.message)}finally{setBusy(btn,false)}
}

async function loadAdminTickets(){try{const xs=await api('/admin/tickets');$('adminTickets').innerHTML=`<div class="admin-list">${xs.slice(0,200).map(t=>`<div class="admin-row"><div><b>${esc(t.ticketCode||t.id)}</b><br><small>${esc(t.event?.title||'Event')} · ${esc(t.section||'General')} · ${esc(t.row||'—')} · ${esc(t.seat||'—')}</small><br><small>Status: ${esc(t.status)} · ${esc(t.owner?.name||t.owner?.email||'unowned')}</small></div><button class="danger action-btn" onclick="cancelAdminTicket('${esc(t.id)}')">Cancel</button></div>`).join('')}</div>`}catch(e){$('adminTickets').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function cancelAdminTicket(id){if(!confirm('Cancel this ticket?'))return;try{await api('/admin/tickets/'+encodeURIComponent(id),{method:'DELETE'});toast('Ticket cancelled.');loadAdminTickets()}catch(e){toast(e.message)}}
async function loadAdminOrders(){try{const xs=await api('/admin/orders');$('adminOrders').innerHTML=`<div class="admin-list">${xs.map(o=>`<div class="admin-row"><div><b>${esc(o.reference)}</b><br><small>${esc(o.user?.name||o.user?.email||'')} · ${esc(o.status)}</small></div><b>${esc(o.currency||'NGN')} ${Number(o.amount||0).toLocaleString()}</b></div>`).join('')||'<div class="empty">No orders yet.</div>'}</div>`}catch(e){$('adminOrders').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function loadAdminSell(){try{const xs=await api('/admin/sell-requests');$('adminSell').innerHTML=`<div class="admin-list">${xs.map(r=>`<div class="admin-row"><div><b>${esc(r.seller?.name||r.seller?.email||'Seller')}</b><br><small>${esc(r.event?.title||'Event')} · ${esc(r.status)}</small><br><small>${esc(r.accountName||'')} · ${esc(r.bankName||'')} · ${esc(r.accountNumber||'')}</small></div><div><button class="secondary action-btn" onclick="reviewSell('${esc(r.id)}','approved')">Approve</button><button class="danger action-btn" onclick="reviewSell('${esc(r.id)}','rejected')">Reject</button></div></div>`).join('')||'<div class="empty">No sell requests.</div>'}</div>`}catch(e){$('adminSell').innerHTML=`<div class="empty">${esc(e.message)}</div>`}}
async function reviewSell(id,status){try{await api('/admin/sell-requests/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({status})});toast('Sell request '+status+'.');loadAdminSell()}catch(e){toast(e.message)}}
async function loadAdminGiveaways(){
  try{
    const xs=await api('/admin/giveaways');
    $('adminGiveaways').innerHTML=`
      <div class="form-card giveaway-create-card">
        <div class="sheet-kicker">GIVEAWAY CENTER</div>
        <h2>Give away a ticket 🎁</h2>
        <p class="muted">Add the event, artwork and seat details, then send a secure claim email to the winner. A new user will be guided through account creation before the ticket is claimed.</p>
        <form onsubmit="createAdminGiveaway(event)">
          <label>Event title<input id="gwTitle" required placeholder="BTS WORLD TOUR..."></label>
          <div class="two"><label>Artist<input id="gwArtist" required></label><label>Category<select id="gwCategory"><option>Giveaway</option><option>Concert</option><option>Sports</option><option>Theatre</option></select></label></div>
          <div class="two"><label>Date<input id="gwDate" type="date" required></label><label>Time<input id="gwTime" type="time" required></label></div>
          <label>Venue<input id="gwVenue" required></label>
          <div class="two"><label>City<input id="gwCity" required></label><label>Country<select id="gwCountry" required><option>Nigeria</option><option>United States</option><option>Canada</option><option>United Kingdom</option><option>France</option><option>Germany</option><option>Belgium</option><option>Spain</option><option>Netherlands</option><option>Other</option></select></label></div>
          <label>Event image URL<input id="gwImage" type="url" placeholder="https://..." oninput="previewGiveawayImage()"></label>
          <label>Or upload image<input id="gwImageFile" type="file" accept="image/jpeg,image/png,image/webp" onchange="previewGiveawayImageFile(event)"></label>
          <div id="gwImagePreview" class="image-preview">Giveaway image preview</div>
          <div class="two"><label>Section<input id="gwSection" value="General"></label><label>Row<input id="gwRow"></label></div>
          <div class="two"><label>Seat<input id="gwSeat"></label><label>Quantity<input id="gwQty" type="number" min="1" value="1" required></label></div>
          <label>Winner email<input id="gwEmail" type="email" required placeholder="winner@example.com"></label>
          <label>Ticket note<textarea id="gwInfo" rows="3" placeholder="Optional ticket/giveaway information"></textarea></label>
          <button id="gwSubmit" class="primary wide action-btn">Create & send giveaway</button>
        </form>
      </div>
      <div class="section-head"><div><small>RECENT</small><h2>Giveaway history</h2></div></div>
      <div class="admin-list">${xs.map(g=>{
        const name=g.recipient?.name||g.recipient?.email||g.recipientEmail||'Pending';
        return `<div class="admin-row"><div><b>${esc(g.eventTitle||'Giveaway')}</b><br><small>${esc(g.date||'')} · ${esc(g.venue||'')}</small><br><small>Winner: ${esc(name)} · Section ${esc(g.section||'General')} · Row ${esc(g.row||'—')} · Seat ${esc(g.seat||'—')}</small></div>${g.ticketId?`<button class="secondary action-btn" onclick="resendGiveaway('${esc(g.id)}')">Resend</button>`:''}</div>`;
      }).join('')||'<div class="empty">No giveaways yet.</div>'}</div>`;
  }catch(e){$('adminGiveaways').innerHTML=`<div class="empty">${esc(e.message)}</div>`}
}
function previewGiveawayImage(){
  const url=$('gwImage')?.value.trim(),p=$('gwImagePreview');if(!p)return;
  if(url){p.innerHTML=`<img src="${esc(url)}" alt="Giveaway preview" onerror="this.parentElement.textContent='Image URL could not be loaded.'">`}else p.textContent='Giveaway image preview';
}
function previewGiveawayImageFile(ev){
  const file=ev.target.files?.[0],p=$('gwImagePreview');if(!file||!p)return;
  if(file.size>2.5*1024*1024){toast('Please choose an image smaller than 2.5 MB.');ev.target.value='';return}
  const reader=new FileReader();reader.onload=()=>{p.innerHTML=`<img src="${esc(reader.result)}" alt="Giveaway preview">`;p.dataset.image=reader.result};reader.readAsDataURL(file);
}
async function createAdminGiveaway(e){
  e.preventDefault();const btn=$('gwSubmit');setBusy(btn,true,'Sending');
  try{
    const image=$('gwImagePreview')?.dataset.image||$('gwImage').value.trim();
    await api('/admin/giveaways',{method:'POST',body:JSON.stringify({
      eventTitle:$('gwTitle').value.trim(),artist:$('gwArtist').value.trim(),category:$('gwCategory').value,
      date:$('gwDate').value,time:$('gwTime').value,venue:$('gwVenue').value.trim(),city:$('gwCity').value.trim(),
      country:$('gwCountry').value,image,section:$('gwSection').value.trim(),row:$('gwRow').value.trim(),
      seat:$('gwSeat').value.trim(),quantity:Number($('gwQty').value||1),recipientEmail:$('gwEmail').value.trim().toLowerCase(),
      additionalInfo:$('gwInfo').value.trim()
    })});
    toast('Giveaway created and claim email queued. 🎉');loadAdminGiveaways();
  }catch(err){toast(err.message)}finally{setBusy(btn,false)}
}
async function resendGiveaway(id){
  try{const d=await api('/admin/giveaways/'+encodeURIComponent(id)+'/resend',{method:'POST',body:'{}'});toast(d.emailQueued?'Giveaway email resent.':'Email is not configured on the server.');loadAdminGiveaways()}catch(e){toast(e.message)}
}

function logout(){token='';user=null;localStorage.removeItem('ticketwaves_token');updateAdminVisibility();toast('You’ve been signed out.');go('discover')}
async function boot(){
  countries();
  const pendingEmail=localStorage.getItem('ticketwaves_transfer_email');
  if(pendingEmail&&$('registerEmail'))$('registerEmail').value=pendingEmail;
  if(token){
    try{const d=await api('/auth/me');user=d.user;updateAdminVisibility();$('avatarBtn').textContent=(user.firstName||user.name||'☺').charAt(0).toUpperCase()}
    catch{logout()}
  }
  const hash=(location.hash||'#discover').slice(1);
  const allowed=['discover','foryou','tickets','sell','account','eventDetails','checkout','login','register','admin'];
  go(allowed.includes(hash)?hash:'discover');
  if(hash==='register'&&pendingEmail&&$('registerEmail'))$('registerEmail').value=pendingEmail;
}
boot();

window.addEventListener('load',()=>setTimeout(v34LazyImages,0));
