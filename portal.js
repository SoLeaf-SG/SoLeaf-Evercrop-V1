/* EverCrop — portal pages (farm + shopper). Demo data only. */

const kind = document.body.dataset.portal;
const $ = s => document.querySelector(s);
const toast = msg => {
  const t = $('.toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
};

(async () => {
  const user = await EC.current();
  if (!user) return location.replace('login.html');
  if (user.role !== kind) return location.replace(user.role === 'farm' ? 'portal-farm.html' : 'portal-shopper.html');

  renderUserMenu(user);
  buildTabbar();
  fillUser(user);
  document.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', EC.logout));
  document.querySelectorAll('[data-soon]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast('Coming soon'); }));

  kind === 'farm' ? farm(user) : shopper(user);
  document.body.hidden = false;
})();

function fillUser(user) {
  const initials = user.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const set = (sel, v) => document.querySelectorAll(sel).forEach(el => el.textContent = v);
  set('[data-user-email]', user.email);
  set('[data-user-name]', user.name);
  set('[data-user-first]', user.name.split(' ')[0]);
  set('[data-user-initials]', initials);
  set('[data-farm-name]', user.farm || 'Your farm');
}

/* Mobile: the sidebar is hidden, so mirror its links in a bottom tab bar */
function buildTabbar() {
  const links = [...document.querySelectorAll('.side nav a')];
  if (!links.length) return;
  const bar = document.createElement('nav');
  bar.className = 'tabbar'; bar.setAttribute('aria-label', 'Portal');
  links.forEach(a => {
    const c = a.cloneNode(true);
    c.innerHTML = `${a.querySelector('svg').outerHTML}<span>${a.textContent.trim().replace(/ farms$/, '')}</span>`;
    bar.appendChild(c);
  });
  document.body.appendChild(bar);
  document.body.classList.add('has-tabbar');
}

/* Account row: avatar, name, role, log out. User text is filled later via textContent (data-user-*), never innerHTML. */
function renderUserMenu(user) {
  const role = user.role === 'farm' ? '<span data-farm-name></span>' : 'Shopper';
  document.querySelectorAll('[data-user-menu]').forEach(slot => {
    slot.innerHTML = `
    <div class="user-menu">
      <span class="av-circle" data-user-initials></span>
      <span class="user-meta"><b data-user-name></b><small>${role}</small></span>
      <button type="button" class="logout-btn" data-logout aria-label="Log out" title="Log out">${icon('logout')}</button>
    </div>`;
  });
}

/* ---------- Shared portal helpers ---------- */
const money = n => '$' + n.toFixed(2);
const LANGS = { en: 'English', zh: '中文', ms: 'Bahasa Melayu', ta: 'தமிழ்' };
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'); // for user text placed in HTML

/* Hash router: each sidebar link (#name) shows the matching [data-view] */
function initViews(fallback) {
  const views = [...document.querySelectorAll('[data-view]')];
  const show = () => {
    const want = location.hash.slice(1) || fallback;
    const view = views.some(v => v.dataset.view === want) ? want : fallback;
    views.forEach(v => v.hidden = v.dataset.view !== view);
    document.querySelectorAll('.side nav a, .tabbar a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + view));
    scrollTo(0, 0);
  };
  addEventListener('hashchange', show);
  return show;
}

/* Language pills + notification switches; saves on every change */
function initPrefs(profile, key) {
  const nf = $('[data-notify]');
  Object.entries(profile.notify).forEach(([k, v]) => { if (nf[k]) nf[k].checked = v; });
  nf.lang.value = profile.lang || 'en';
  nf.addEventListener('change', e => {
    profile.notify = Object.fromEntries([...nf.querySelectorAll('input[type=checkbox]')].map(i => [i.name, i.checked]));
    profile.lang = nf.lang.value;
    EC.write(key, profile);
    toast(e.target.name === 'lang' ? `Language set to ${LANGS[profile.lang]}` : 'Notification preferences saved');
  });
}

/* Profile photo / farm logo: centre-cropped and shrunk to 256px so it fits in localStorage */
function initAvatar(profile, key, what) {
  const remove = $('[data-avatar-remove]');
  const paint = src => document.querySelectorAll('[data-user-initials]').forEach(el => {
    el.style.backgroundImage = src ? `url("${src}")` : '';
    el.classList.toggle('has-img', !!src);
  });
  paint(profile.avatar);
  remove.hidden = !profile.avatar;
  $('[data-avatar-input]').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return toast('Please choose a JPG, PNG or WebP image');
    if (file.size > 5 * 1024 * 1024) return toast('That image is over 5 MB');
    try {
      const img = await createImageBitmap(file);
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      profile.avatar = c.toDataURL('image/jpeg', 0.85);
      EC.write(key, profile); paint(profile.avatar);
      remove.hidden = false;
      toast(`${what} updated`);
    } catch { toast('Could not read that image'); }
  });
  remove.addEventListener('click', () => {
    delete profile.avatar; EC.write(key, profile); paint(null);
    remove.hidden = true; toast(`${what} removed`);
  });
}

function farm(user) {
  const show = initViews('overview');
  const ordersKey = `ec_farm_orders_${user.email}`, stockKey = `ec_farm_stock_${user.email}`,
        botKey = `ec_bot_${user.email}`, profileKey = `ec_profile_${user.email}`;
  const total = o => o.items.reduce((n, i) => n + i.qty * i.price, 0);
  const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  /* ---------- Data ---------- */
  const orders = EC.read(ordersKey, null) || [
    { id: '#1048', date: '28 Nov', customer: 'Hui Min C.', channel: 'WhatsApp', status: 'New', items: [{ name: 'Kai Lan', qty: 2, price: 2.8 }, { name: 'Bayam', qty: 2, price: 2.5 }] },
    { id: '#1047', date: '28 Nov', customer: 'Marcus O.', channel: 'Portal', status: 'New', items: [{ name: 'Xiao Bai Cai', qty: 3, price: 2.6 }] },
    { id: '#1046', date: '27 Nov', customer: 'Wei Jie T.', channel: 'WhatsApp', status: 'Awaiting payment', items: [{ name: 'Xiao Bai Cai', qty: 4, price: 2.6 }] },
    { id: '#1045', date: '27 Nov', customer: 'Priya S.', channel: 'WhatsApp', status: 'Delivering', items: [{ name: 'Bayam', qty: 3, price: 2.5 }] },
    { id: '#1044', date: '26 Nov', customer: 'Aaron L.', channel: 'Portal', status: 'Paid', items: [{ name: 'Kai Lan', qty: 2, price: 2.8 }, { name: 'Cherry Tomato', qty: 1, price: 4.2 }] },
    { id: '#1043', date: '25 Nov', customer: 'Nur A.', channel: 'WhatsApp', status: 'Completed', items: [{ name: 'Kai Lan', qty: 1, price: 2.8 }, { name: 'Bayam', qty: 1, price: 2.5 }] },
    { id: '#1042', date: '24 Nov', customer: 'Daniel K.', channel: 'WhatsApp', status: 'Completed', items: [{ name: 'Cherry Tomato', qty: 2, price: 4.2 }] },
    { id: '#1041', date: '23 Nov', customer: 'Hui Min C.', channel: 'WhatsApp', status: 'Completed', items: [{ name: 'Kai Lan', qty: 3, price: 2.8 }] }
  ];
  const stock = EC.read(stockKey, null) || [
    { id: 'kailan', name: 'Kai Lan', pack: '300 g', price: 2.8, stock: 18, sold: 42, listed: true },
    { id: 'bayam', name: 'Bayam', pack: '300 g', price: 2.5, stock: 6, sold: 30, listed: true },
    { id: 'xbc', name: 'Xiao Bai Cai', pack: '300 g', price: 2.6, stock: 13, sold: 12, listed: true },
    { id: 'tomato', name: 'Cherry Tomato', pack: '250 g', price: 4.2, stock: 22, sold: 18, listed: true }
  ];
  const bot = EC.read(botKey, null) || { online: true, pickup: true, hours: 'always', fee: 4, uen: '',
    greeting: `Hi! 👋 Welcome to ${user.farm || 'our farm'}. Here's what we harvested today:` };
  const CHATS = [
    ['Hui Min C.', 'Bot took order #1048 and sent a PayNow QR.', '2m'],
    ['Marcus O.', 'Bot answered: "Do you deliver to Tampines?"', '9m'],
    ['Wei Jie T.', 'Bot sent a payment reminder for #1046.', '1h'],
    ['Priya S.', 'Bot answered: "Is the bayam pesticide-free?"', '3h'],
    ['Daniel K.', 'Bot shared this week\'s harvest list.', 'Yesterday']
  ];
  const saveOrders = () => EC.write(ordersKey, orders), saveStock = () => EC.write(stockKey, stock);

  /* ---------- Orders ---------- */
  const NEXT = { New: ['Confirm', 'Awaiting payment'], 'Awaiting payment': ['Mark paid', 'Paid'], Paid: ['Send out', 'Delivering'], Delivering: ['Mark delivered', 'Completed'] };
  const BADGE = { New: 'new', 'Awaiting payment': 'wait', Paid: 'ok', Delivering: 'go', Completed: 'done' };
  const badge = s => `<span class="badge ${BADGE[s]}">${s}</span>`;
  const itemList = o => o.items.map(i => `${esc(i.name)} × ${i.qty}`).join(', ');
  let oFilter = 'All', oQuery = '';

  function renderOrders() {
    const count = s => orders.filter(o => o.status === s).length;
    $('[data-o-new]').textContent = count('New');
    $('[data-o-unpaid]').textContent = money(orders.filter(o => o.status === 'Awaiting payment').reduce((n, o) => n + total(o), 0));
    $('[data-o-revenue]').textContent = money(orders.reduce((n, o) => n + total(o), 0));
    $('[data-o-chips]').innerHTML = ['All', ...Object.keys(BADGE)].map(s =>
      `<button type="button" data-status="${s}" aria-pressed="${s === oFilter}">${s} (${s === 'All' ? orders.length : count(s)})</button>`).join('');
    const list = orders.filter(o => (oFilter === 'All' || o.status === oFilter) && (o.customer + o.id).toLowerCase().includes(oQuery));
    $('[data-o-empty]').hidden = list.length > 0;
    $('[data-orders]').innerHTML = list.map(o => `<tr>
      <td>${o.id}</td><td>${o.date}</td><td>${esc(o.customer)}</td><td>${o.channel}</td>
      <td class="wrap">${itemList(o)}</td><td>${money(total(o))}</td><td>${badge(o.status)}</td>
      <td>${NEXT[o.status] ? `<button type="button" class="btn btn-ghost btn-xs" data-advance="${o.id}">${NEXT[o.status][0]}</button>` : ''}</td></tr>`).join('');
  }
  $('[data-orders]').addEventListener('click', e => {
    const b = e.target.closest('[data-advance]'); if (!b) return;
    const o = orders.find(x => x.id === b.dataset.advance);
    o.status = NEXT[o.status][1];
    saveOrders(); renderOrders(); renderOverview();
    toast(`${o.id} is now ${o.status}`);
  });
  $('[data-o-chips]').addEventListener('click', e => {
    const b = e.target.closest('[data-status]'); if (!b) return;
    oFilter = b.dataset.status; renderOrders();
  });
  $('[data-o-search]').addEventListener('input', e => { oQuery = e.target.value.trim().toLowerCase(); renderOrders(); });

  /* ---------- Stock ---------- */
  const LOW = 10;
  let sFilter = 'All', sQuery = '';
  const afterStockChange = msg => { saveStock(); renderStock(); renderOverview(); renderPreview(); renderInsights(); if (msg) toast(msg); };

  function renderStock() {
    const listed = stock.filter(s => s.listed), low = stock.filter(s => s.stock < LOW);
    $('[data-s-listed]').textContent = `${listed.length} of ${stock.length}`;
    $('[data-s-packs]').textContent = listed.reduce((n, s) => n + s.stock, 0);
    $('[data-s-low]').textContent = low.length;
    $('[data-s-value]').textContent = money(listed.reduce((n, s) => n + s.stock * s.price, 0));
    const counts = { All: stock.length, Listed: listed.length, Hidden: stock.length - listed.length, 'Low stock': low.length };
    $('[data-s-chips]').innerHTML = Object.entries(counts).map(([k, n]) => `<button type="button" data-sfilter="${k}" aria-pressed="${k === sFilter}">${k} (${n})</button>`).join('');
    const match = { All: () => true, Listed: s => s.listed, Hidden: s => !s.listed, 'Low stock': s => s.stock < LOW }[sFilter];
    const list = stock.filter(s => match(s) && s.name.toLowerCase().includes(sQuery));
    $('[data-s-empty]').hidden = list.length > 0;
    $('[data-stock]').innerHTML = list.map(s => {
      const all = s.sold + s.stock, n = esc(s.name);
      return `<article class="stock-card${s.listed ? '' : ' is-hidden'}">
        <div class="sc-head">
          <div><b>${n}</b><span>${esc(s.pack)} pack</span></div>
          <input type="checkbox" class="switch" ${s.listed ? 'checked' : ''} data-id="${s.id}" data-field="listed" aria-label="Sell ${n} on the chatbot">
        </div>
        <div class="sc-tags">
          <span class="badge ${s.listed ? 'ok' : 'done'}">${s.listed ? 'On sale' : 'Hidden'}</span>
          ${s.stock === 0 ? '<span class="badge wait">Sold out</span>' : s.stock < LOW ? '<span class="badge wait">Low stock</span>' : ''}
        </div>
        <div class="sc-sold">
          <div><span>Sold this week</span><b>${s.sold} of ${all}</b></div>
          <div class="meter"><i style="width:${all ? s.sold / all * 100 : 0}%"></i></div>
        </div>
        <div class="sc-fields">
          <label><span>Price (S$)</span><input class="cell-input" type="number" min="0.1" step="0.1" value="${s.price.toFixed(2)}" data-id="${s.id}" data-field="price"></label>
          <div class="sc-stepper"><span>In stock</span>
            <div class="stepper">
              <button type="button" data-step="-1" data-id="${s.id}" aria-label="One less ${n}">−</button>
              <input type="number" min="0" step="1" value="${s.stock}" data-id="${s.id}" data-field="stock" aria-label="${n} packs in stock">
              <button type="button" data-step="1" data-id="${s.id}" aria-label="One more ${n}">+</button>
            </div>
          </div>
        </div>
        <button type="button" class="sc-remove" data-remove="${s.id}">Remove item</button>
      </article>`;
    }).join('');
  }
  const grid = $('[data-stock]');
  grid.addEventListener('change', e => {
    const el = e.target, item = stock.find(s => s.id === el.dataset.id);
    if (!item || !el.dataset.field) return;
    if (el.dataset.field === 'listed') { item.listed = el.checked; return afterStockChange(`${item.name} ${el.checked ? 'is on sale' : 'is hidden from the chatbot'}`); }
    const v = Number(el.value), ok = el.dataset.field === 'price' ? v > 0 : Number.isInteger(v) && v >= 0;
    if (!ok) { toast(el.dataset.field === 'price' ? 'Price must be more than $0' : 'Stock must be a whole number'); return renderStock(); }
    item[el.dataset.field] = v;
    afterStockChange(`${item.name} updated`);
  });
  grid.addEventListener('click', e => {
    const step = e.target.closest('[data-step]'), rm = e.target.closest('[data-remove]');
    if (step) { const item = stock.find(s => s.id === step.dataset.id); item.stock = Math.max(0, item.stock + Number(step.dataset.step)); afterStockChange(); }
    if (rm) {
      const item = stock.find(s => s.id === rm.dataset.remove);
      if (!confirm(`Remove ${item.name} from your harvest list?`)) return;
      stock.splice(stock.indexOf(item), 1);
      afterStockChange(`${item.name} removed`);
    }
  });
  $('[data-s-chips]').addEventListener('click', e => { const b = e.target.closest('[data-sfilter]'); if (b) { sFilter = b.dataset.sfilter; renderStock(); } });
  $('[data-s-search]').addEventListener('input', e => { sQuery = e.target.value.trim().toLowerCase(); renderStock(); });

  const af = $('[data-add-item]'), addBtn = $('[data-add-toggle]');
  const setAdd = open => { af.hidden = !open; addBtn.setAttribute('aria-expanded', open); if (open) af.sname.focus(); };
  addBtn.addEventListener('click', () => setAdd(af.hidden));
  $('[data-add-cancel]').addEventListener('click', () => { af.reset(); af.querySelectorAll('input').forEach(i => setError(i, '')); setAdd(false); });
  af.querySelectorAll('input').forEach(i => i.addEventListener('input', () => setError(i, '')));
  af.addEventListener('submit', e => {
    e.preventDefault();
    const name = af.sname.value.trim(), pack = af.pack.value.trim(), price = Number(af.price.value), qty = Number(af.qty.value);
    let ok = setError(af.sname, name ? '' : 'Enter the produce name.');
    ok = setError(af.pack, pack ? '' : 'e.g. 300 g') && ok;
    ok = setError(af.price, price > 0 ? '' : 'Above $0') && ok;
    ok = setError(af.qty, Number.isInteger(qty) && qty > 0 ? '' : 'Whole number') && ok;
    if (!ok) return;
    stock.unshift({ id: 'i' + Date.now(), name, pack, price, stock: qty, sold: 0, listed: true });
    af.reset(); setAdd(false); sFilter = 'All';
    afterStockChange(`${name} added to this week's harvest`);
  });

  /* ---------- Chatbot ---------- */
  const bf = $('[data-bot-form]');
  bf.online.checked = bot.online; bf.pickup.checked = bot.pickup; bf.greeting.value = bot.greeting;
  bf.hours.value = bot.hours; bf.fee.value = bot.fee; bf.uen.value = bot.uen;
  function renderPreview() {
    const body = $('[data-preview]'), online = bf.online.checked;
    const msg = (from, text) => {
      const m = document.createElement('div');
      m.className = `msg ${from}`; m.textContent = text; // farm-entered text, never parsed as HTML
      body.appendChild(m); return m;
    };
    body.innerHTML = '';
    msg('out', 'Hi! What\'s fresh this week?');
    if (!online) { msg('in', 'Thanks for your message! We\'re away right now and will reply soon.'); }
    else {
      const m = msg('in', bf.greeting.value.trim() || 'Hi! Here\'s what we harvested today:');
      const chips = document.createElement('div'); chips.className = 'chips';
      stock.filter(s => s.listed).slice(0, 4).forEach(s => { const c = document.createElement('span'); c.textContent = `${s.name} ${money(s.price)}`; chips.appendChild(c); });
      m.appendChild(chips);
      const fee = Number(bf.fee.value) || 0;
      msg('in', `Delivery is ${fee ? money(fee) : 'free'}${bf.pickup.checked ? ', or pick up at the farm for free' : ''}. Just tell me what you'd like!`);
    }
    $('[data-preview-status]').textContent = online ? 'online' : 'away';
    document.querySelectorAll('[data-preview-badge], [data-bot-badge]').forEach(b => {
      b.textContent = online ? 'Online' : 'Away'; b.className = `badge ${online ? 'ok' : 'done'}`;
    });
  }
  bf.addEventListener('input', renderPreview);
  bf.querySelectorAll('textarea, input:not([type=checkbox])').forEach(i => i.addEventListener('input', () => setError(i, '')));
  bf.addEventListener('submit', e => {
    e.preventDefault();
    const fee = Number(bf.fee.value);
    let ok = setError(bf.greeting, bf.greeting.value.trim() ? '' : 'Write a short greeting.');
    ok = setError(bf.fee, bf.fee.value !== '' && fee >= 0 ? '' : 'Enter 0 or more.') && ok;
    if (!ok) return;
    Object.assign(bot, { online: bf.online.checked, pickup: bf.pickup.checked, greeting: bf.greeting.value.trim(), hours: bf.hours.value, fee, uen: bf.uen.value.trim() });
    EC.write(botKey, bot);
    toast('Chatbot settings saved');
  });

  /* ---------- Overview ---------- */
  const chatRow = ([n, p, t]) => `<div class="chat-row"><span class="av">${initials(n)}</span><div><b>${n}</b><p>${p}</p></div><small>${t}</small></div>`;
  function renderOverview() {
    $('[data-recent-orders]').innerHTML = orders.slice(0, 5).map(o =>
      `<tr><td>${o.id}</td><td>${o.date}</td><td>${esc(o.customer)}</td><td>${money(total(o))}</td><td>${badge(o.status)}</td></tr>`).join('');
    $('[data-harvest]').innerHTML = stock.filter(s => s.listed).map(s => {
      const all = s.sold + s.stock;
      return `<div class="stock-row"><div><b>${esc(s.name)}</b><span>${s.sold} / ${all} packs sold</span></div><div class="meter"><i style="width:${all ? s.sold / all * 100 : 0}%"></i></div></div>`;
    }).join('') || '<p class="cart-empty">Nothing listed yet. <a href="#stock">Add stock</a></p>';
  }
  const week = [['Mon', 32], ['Tue', 45], ['Wed', 38], ['Thu', 60], ['Fri', 72], ['Sat', 95], ['Sun', 64]];
  const bars = (rows, fmt) => { const max = Math.max(...rows.map(r => r[1])); return rows.map(([d, v]) => `<div><i style="height:${v / max * 100}%" title="${fmt(v)}"></i><span>${d}</span></div>`).join(''); };
  $('[data-bars]').innerHTML = bars(week, v => `${v} orders`);
  $('[data-chats]').innerHTML = CHATS.slice(0, 3).map(chatRow).join('');
  $('[data-chats-all]').innerHTML = CHATS.map(chatRow).join('');
  $('[data-broadcast]').addEventListener('click', () => toast(`Harvest alert with ${stock.filter(s => s.listed).length} items sent to 214 customers`));

  /* ---------- Insights ---------- */
  function renderInsights() {
    $('[data-i-aov]').textContent = money(orders.reduce((n, o) => n + total(o), 0) / orders.length);
    const top = [...stock].map(s => ({ ...s, rev: s.sold * s.price })).sort((a, b) => b.rev - a.rev).slice(0, 4);
    const max = Math.max(...top.map(s => s.rev), 1);
    $('[data-i-top]').innerHTML = top.map(s => `<div class="stock-row"><div><b>${esc(s.name)}</b><span>${money(s.rev)} · ${s.sold} sold</span></div><div class="meter"><i style="width:${s.rev / max * 100}%"></i></div></div>`).join('');
    const by = {}; orders.forEach(o => { by[o.customer] ||= { n: 0, t: 0 }; by[o.customer].n++; by[o.customer].t += total(o); });
    $('[data-i-customers]').innerHTML = Object.entries(by).sort((a, b) => b[1].t - a[1].t).slice(0, 4)
      .map(([c, v]) => chatRow([esc(c), `${v.n} order${v.n > 1 ? 's' : ''}`, money(v.t)])).join('');
  }
  $('[data-i-weeks]').innerHTML = bars([['Week 1', 1820], ['Week 2', 2310], ['Week 3', 2580], ['Week 4', 2940]], v => '$' + v.toLocaleString());

  /* ---------- Settings ---------- */
  const profile = EC.read(profileKey, { phone: '', area: 'Kranji', about: '', notify: { neworder: true, payment: true, lowstock: true, report: false } });
  const pf = $('[data-profile]');
  pf.fname.value = user.farm || ''; pf.pname.value = user.name; pf.pemail.value = user.email;
  pf.phone.value = profile.phone; pf.area.value = profile.area; pf.about.value = profile.about;
  pf.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', () => setError(i, '')));
  pf.addEventListener('submit', e => {
    e.preventDefault();
    const farmName = pf.fname.value.trim(), name = pf.pname.value.trim(), phone = pf.phone.value.trim();
    let ok = setError(pf.fname, farmName ? '' : 'Enter your farm name.');
    ok = setError(pf.pname, name ? '' : 'Enter your name.') && ok;
    ok = setError(pf.phone, !phone || /^\+?[\d\s]{8,15}$/.test(phone) ? '' : 'Enter a valid phone number, e.g. +65 6123 4567.') && ok;
    if (!ok) return;
    Object.assign(profile, { phone, area: pf.area.value, about: pf.about.value.trim() });
    EC.write(profileKey, profile);
    const users = EC.read('ec_users', {});
    if (users[user.email]) { Object.assign(users[user.email], { name, farm: farmName }); EC.write('ec_users', users); }
    Object.assign(user, { name, farm: farmName }); fillUser(user);
    toast('Farm profile saved');
  });
  initPrefs(profile, profileKey);
  initAvatar(profile, profileKey, 'Farm logo');

  renderOrders(); renderStock(); renderOverview(); renderPreview(); renderInsights(); show();
}

function shopper(user) {
  const STAGE_AT = [0, 100, 250, 450, 700]; // water needed to reach each stage
  const today = new Date().toDateString();
  const treeKey = `ec_tree_${user.email}`, ordersKey = `ec_orders_${user.email}`, profileKey = `ec_profile_${user.email}`;
  const state = EC.read(treeKey, { water: 140, lastCheckin: null, streak: 2, boxes: 0 });
  const save = () => EC.write(treeKey, state);
  const farmName = id => (FARMS.find(f => f.id === id) || {}).name || id;

  const show = initViews('tree');

  /* ---------- My tree ---------- */
  const art = $('[data-tree-art]'), label = $('[data-tree-label]'), meter = $('[data-tree-meter]'),
        info = $('[data-tree-info]'), checkBtn = $('[data-checkin]'), harvestBtn = $('[data-harvest]');
  function renderTree() {
    const stage = STAGE_AT.filter(v => state.water >= v).length - 1;
    const next = STAGE_AT[stage + 1];
    drawTree(art, stage);
    label.textContent = TREE_STAGES[stage];
    meter.style.width = Math.min(100, state.water / STAGE_AT[4] * 100) + '%';
    info.textContent = next ? `${next - state.water} water to ${TREE_STAGES[stage + 1]}` : 'Fully grown! Claim your produce box.';
    document.querySelectorAll('[data-water]').forEach(el => el.textContent = state.water);
    $('[data-streak]').textContent = state.streak;
    $('[data-boxes]').textContent = state.boxes;
    const done = state.lastCheckin === today;
    checkBtn.disabled = done; checkBtn.textContent = done ? 'Checked in ✓' : 'Check in +5';
    harvestBtn.hidden = !!next;
  }
  const addWater = (n, msg) => { state.water += n; save(); renderTree(); toast(msg); };

  checkBtn.addEventListener('click', () => {
    if (state.lastCheckin === today) return;
    state.lastCheckin = today; state.streak += 1;
    const bonus = state.streak % 7 === 0 ? 20 : 0;
    addWater(5 + bonus, bonus ? `+${5 + bonus} water · 7-day streak bonus!` : '+5 water · see you tomorrow');
  });
  document.querySelectorAll('[data-invite]').forEach(b => b.addEventListener('click', async () => {
    const link = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}register.html?role=shopper`;
    try { await navigator.clipboard.writeText(link); toast('Invite link copied · +50 water when they order'); }
    catch { toast('Invite: ' + link); }
  }));
  harvestBtn.addEventListener('click', () => {
    state.water = 0; state.boxes += 1; save(); renderTree();
    toast('🎁 Produce box claimed! A new seed is planted.');
  });

  /* ---------- Shop farms ---------- */
  const PRODUCTS = [
    { id: 'kailan', name: 'Kai Lan', farm: 'kranji', unit: '300 g', price: 2.8, was: 3.9 },
    { id: 'bayam', name: 'Bayam', farm: 'kranji', unit: '300 g', price: 2.5, was: 3.4 },
    { id: 'xbc', name: 'Xiao Bai Cai', farm: 'kranji', unit: '300 g', price: 2.6, was: 3.5 },
    { id: 'butterhead', name: 'Butterhead Lettuce', farm: 'lck', unit: '1 head', price: 3.0, was: 4.2 },
    { id: 'kale', name: 'Curly Kale', farm: 'lck', unit: '200 g', price: 4.5, was: 6.2 },
    { id: 'tomato', name: 'Cherry Tomato', farm: 'neotiew', unit: '250 g', price: 4.2, was: 5.9 },
    { id: 'herbs', name: 'Mixed Herbs', farm: 'neotiew', unit: '50 g', price: 3.2, was: 4.5 },
    { id: 'basil', name: 'Thai Basil', farm: 'tengah', unit: '50 g', price: 2.2, was: 3.5 },
    { id: 'mint', name: 'Mint', farm: 'tengah', unit: '50 g', price: 2.2, was: 3.2 },
    { id: 'micro', name: 'Microgreens Mix', farm: 'tengah', unit: '80 g', price: 4.8, was: 6.5 },
    { id: 'chyesim', name: 'Chye Sim', farm: 'punggol', unit: '300 g', price: 2.4, was: 3.2 },
    { id: 'spinach', name: 'Baby Spinach', farm: 'punggol', unit: '150 g', price: 2.9, was: 3.9 }
  ];
  const cart = {}; // product id -> qty
  let farmFilter = 'all', query = '';
  const grid = $('[data-produce]'), chips = $('[data-farm-chips]');

  function renderChips() {
    chips.innerHTML = [['all', 'All farms'], ...FARMS.map(f => [f.id, f.name])]
      .map(([id, n]) => `<button type="button" data-farm="${id}" aria-pressed="${id === farmFilter}">${n}</button>`).join('');
  }
  function renderShop() {
    const list = PRODUCTS.filter(p => (farmFilter === 'all' || p.farm === farmFilter) && p.name.toLowerCase().includes(query));
    $('[data-empty]').hidden = list.length > 0;
    grid.innerHTML = list.map(p => {
      const q = cart[p.id] || 0;
      return `<div class="produce">
        <div><b>${p.name}</b><span>${farmName(p.farm)} · ${p.unit}</span></div>
        <div class="price-row"><strong>${money(p.price)}</strong><s>${money(p.was)}</s></div>
        ${q ? `<div class="qty"><button type="button" data-dec="${p.id}" aria-label="Remove one ${p.name}">−</button><span>${q}</span><button type="button" data-inc="${p.id}" aria-label="Add one ${p.name}">+</button></div>`
            : `<button type="button" class="btn btn-ghost btn-sm" data-inc="${p.id}">Add to order</button>`}
      </div>`;
    }).join('');
  }
  function renderCart() {
    const lines = PRODUCTS.filter(p => cart[p.id]);
    const count = lines.reduce((n, p) => n + cart[p.id], 0);
    const total = lines.reduce((n, p) => n + cart[p.id] * p.price, 0);
    const saved = lines.reduce((n, p) => n + cart[p.id] * (p.was - p.price), 0);
    $('[data-cart-count]').textContent = `${count} item${count === 1 ? '' : 's'}`;
    $('[data-cart-lines]').innerHTML = lines.length
      ? lines.map(p => `<div class="cart-line"><div>${p.name} × ${cart[p.id]}<span>${farmName(p.farm)}</span></div><b>${money(cart[p.id] * p.price)}</b></div>`).join('')
      : '<p class="cart-empty">Your order is empty. Add something fresh!</p>';
    $('[data-cart-total]').textContent = money(total);
    $('[data-cart-saved]').textContent = money(saved);
    const farms = new Set(lines.map(p => p.farm)).size;
    $('[data-cart-note]').textContent = farms > 1 ? `Goes to ${farms} farms as separate orders · +${farms * 30} water` : 'Pay by PayNow once the farm confirms · +30 water';
    $('[data-checkout]').disabled = !lines.length;
    $('[data-cart-bar]').hidden = !lines.length; // small screens only (CSS); cart sits below the grid there
    $('[data-cart-bar-text]').textContent = `${count} item${count === 1 ? '' : 's'} · ${money(total)}`;
  }
  $('[data-cart-jump]').addEventListener('click', () => $('.cart').scrollIntoView({ behavior: 'smooth', block: 'start' }));
  const setQty = (id, d) => { cart[id] = Math.max(0, (cart[id] || 0) + d); if (!cart[id]) delete cart[id]; renderShop(); renderCart(); };

  grid.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) setQty(inc.dataset.inc, 1);
    if (dec) setQty(dec.dataset.dec, -1);
  });
  chips.addEventListener('click', e => {
    const b = e.target.closest('[data-farm]'); if (!b) return;
    farmFilter = b.dataset.farm; renderChips(); renderShop();
  });
  $('[data-search]').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); renderShop(); });

  /* ---------- My orders ---------- */
  const orders = EC.read(ordersKey, null) || [
    { id: '#1051', date: '26 Nov', farm: 'tengah', status: 'On the way', items: [{ name: 'Thai Basil', qty: 1, price: 2.2, was: 3.5 }, { name: 'Mint', qty: 2, price: 2.2, was: 3.2 }] },
    { id: '#1042', date: '21 Nov', farm: 'kranji', status: 'Delivered', items: [{ name: 'Kai Lan', qty: 2, price: 2.8, was: 3.9 }, { name: 'Bayam', qty: 1, price: 2.5, was: 3.4 }] },
    { id: '#0987', date: '14 Nov', farm: 'neotiew', status: 'Delivered', items: [{ name: 'Cherry Tomato', qty: 3, price: 4.2, was: 5.9 }] }
  ];
  const sum = (o, k) => o.items.reduce((n, i) => n + i.qty * (k === 'saved' ? i.was - i.price : i.price), 0);
  const STATUS = { Confirmed: 'wait', 'On the way': 'go', Delivered: 'ok' };
  function renderOrders() {
    $('[data-o-count]').textContent = orders.length;
    $('[data-o-spent]').textContent = money(orders.reduce((n, o) => n + sum(o), 0));
    document.querySelectorAll('[data-saved]').forEach(el => el.textContent = money(orders.reduce((n, o) => n + sum(o, 'saved'), 0)));
    $('[data-my-orders]').innerHTML = orders.map(o => `<tr>
      <td>${o.id}</td><td>${o.date}</td><td>${farmName(o.farm)}</td>
      <td class="wrap">${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}</td>
      <td>${money(sum(o))}</td><td><span class="badge ${STATUS[o.status]}">${o.status}</span></td></tr>`).join('');
  }

  $('[data-checkout]').addEventListener('click', () => {
    const byFarm = {};
    PRODUCTS.filter(p => cart[p.id]).forEach(p => (byFarm[p.farm] ||= []).push({ name: p.name, qty: cart[p.id], price: p.price, was: p.was }));
    const farms = Object.keys(byFarm);
    if (!farms.length) return;
    const date = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
    let next = Math.max(...orders.map(o => +o.id.slice(1))) + 1;
    farms.forEach(f => orders.unshift({ id: '#' + next++, date, farm: f, status: 'Confirmed', items: byFarm[f] }));
    EC.write(ordersKey, orders);
    Object.keys(cart).forEach(k => delete cart[k]);
    renderShop(); renderCart(); renderOrders();
    addWater(30 * farms.length, `Order placed · +${30 * farms.length} water`);
    location.hash = '#orders';
  });

  /* ---------- Farm map ---------- */
  const shopFarmBtn = $('[data-shop-farm]');
  const activeFarm = () => (document.querySelector('.farm-item.active') || {}).dataset?.id || FARMS[0].id;
  const syncShopBtn = () => { shopFarmBtn.textContent = `Shop ${farmName(activeFarm())}`; };
  document.querySelectorAll('.pin, .farm-item').forEach(el => el.addEventListener('click', syncShopBtn));
  shopFarmBtn.addEventListener('click', () => { farmFilter = activeFarm(); renderChips(); renderShop(); location.hash = '#shop'; });

  /* ---------- Settings ---------- */
  const profile = EC.read(profileKey, { phone: '', address: '', notify: { orders: true, harvest: true, tree: false, news: false } });
  const pf = $('[data-profile]');
  pf.pname.value = user.name; pf.pemail.value = user.email; pf.phone.value = profile.phone; pf.address.value = profile.address;
  pf.querySelectorAll('input').forEach(i => i.addEventListener('input', () => setError(i, '')));
  pf.addEventListener('submit', e => {
    e.preventDefault();
    const name = pf.pname.value.trim(), phone = pf.phone.value.trim();
    let ok = setError(pf.pname, name ? '' : 'Enter your name.');
    ok = setError(pf.phone, !phone || /^\+?[\d\s]{8,15}$/.test(phone) ? '' : 'Enter a valid phone number, e.g. +65 9123 4567.') && ok;
    if (!ok) return;
    profile.phone = phone; profile.address = pf.address.value.trim();
    EC.write(profileKey, profile);
    const users = EC.read('ec_users', {});
    if (users[user.email]) { users[user.email].name = name; EC.write('ec_users', users); }
    user.name = name; fillUser(user);
    toast('Profile saved');
  });
  initPrefs(profile, profileKey);
  initAvatar(profile, profileKey, 'Profile photo');

  /* ---------- Ask EverCrop: answers from this shopper's own data ----------
     shortcut: keyword intents over local data, not a real LLM — send {question, account summary} to an AI API once a backend exists */
  const HELLO = { en: 'Hi', zh: '你好', ms: 'Hai', ta: 'வணக்கம்' };
  const firstName = () => user.name.split(' ')[0].replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'); // replies are HTML; the name is user input
  const stageInfo = () => {
    const stage = STAGE_AT.filter(v => state.water >= v).length - 1, next = STAGE_AT[stage + 1];
    return { stage: TREE_STAGES[stage], nextName: TREE_STAGES[stage + 1], toNext: next ? next - state.water : 0, toFull: Math.max(0, STAGE_AT[4] - state.water) };
  };
  const totals = () => ({ spent: orders.reduce((n, o) => n + sum(o), 0), saved: orders.reduce((n, o) => n + sum(o, 'saved'), 0) });
  const INTENTS = [
    [/latest|last order|recent|status|where.*order|track|deliver/, () => {
      const o = orders[0];
      return o ? `Your latest order <b>${o.id}</b> from ${farmName(o.farm)} is <b>${o.status}</b>: ${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')} (${money(sum(o))}).` : 'You haven\'t placed an order yet. <a href="#shop">Start shopping</a>';
    }],
    [/how many|spent|spend|total|order history|orders/, () => { const t = totals(); return `You've placed <b>${orders.length} orders</b> and spent <b>${money(t.spent)}</b>, saving ${money(t.saved)} vs supermarket prices. <a href="#orders">See all orders</a>`; }],
    [/sav(e|ed|ing)|cheaper|supermarket/, () => `You've saved <b>${money(totals().saved)}</b> so far by buying direct from farms. 🎉`],
    [/box|reward|harvest|free|fully grown/, () => { const s = stageInfo(); return s.toFull ? `You've earned <b>${state.boxes}</b> produce box${state.boxes === 1 ? '' : 'es'}. ${s.toFull} more water and your tree is fully grown, which unlocks a free box!` : 'Your tree is fully grown! Claim your free produce box on <a href="#tree">My tree</a>.'; }],
    [/tree|water|grow|stage|level/, () => { const s = stageInfo(); return `Your tree is a <b>${s.stage}</b> with <b>${state.water} water</b>.` + (s.toNext ? ` ${s.toNext} more to reach ${s.nextName}.` : '') + (state.lastCheckin === today ? '' : ' Tip: check in today for +5.'); }],
    [/streak|check.?in|daily/, () => `Your check-in streak is <b>${state.streak} days</b>. ${state.lastCheckin === today ? 'You\'ve checked in today ✓' : 'You haven\'t checked in today yet. <a href="#tree">Check in for +5</a>'}`],
    [/favou?rite|which farm|farm.*most|most.*farm/, () => {
      const count = {}; orders.forEach(o => count[o.farm] = (count[o.farm] || 0) + 1);
      const fav = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
      return fav ? `You order most from <b>${farmName(fav[0])}</b> (${fav[1]} order${fav[1] > 1 ? 's' : ''}). <a href="#map">See it on the map</a>` : 'You haven\'t ordered from any farm yet.';
    }],
    [/recommend|suggest|what should|deal|best|cheap|buy/, () => {
      const top = [...PRODUCTS].sort((a, b) => (b.was - b.price) / b.was - (a.was - a.price) / a.was).slice(0, 3);
      return `This week's best deals: ${top.map(p => `<b>${p.name}</b> ${money(p.price)} (save ${Math.round((p.was - p.price) / p.was * 100)}%)`).join(', ')}. <a href="#shop">Shop now</a>`;
    }],
    [/invite|friend|refer/, () => 'Invite a friend and get <b>+50 water</b> when they place their first order. Use <b>Copy invite link</b> in the sidebar.'],
    [/language|notification|setting/, () => {
      const on = Object.entries(profile.notify).filter(([, v]) => v).map(([k]) => ({ orders: 'order updates', harvest: 'harvest alerts', tree: 'tree reminders', news: 'news' })[k]);
      return `Your language is <b>${LANGS[profile.lang || 'en']}</b>. Notifications on: ${on.length ? on.join(', ') : 'none'}. <a href="#settings">Change in Settings</a>`;
    }],
    [/^(hi|hello|hey|yo)\b/, () => `${HELLO[profile.lang || 'en']} ${firstName()}! 👋 Ask me about your orders, tree or savings.`]
  ];
  const answer = q => (INTENTS.find(([re]) => re.test(q.toLowerCase())) || [, () => 'I can help with your orders, tree, savings, check-ins and deals. Try one of the suggestions below.'])[1]();

  mountBot({
    title: 'Ask EverCrop',
    status: 'Knows your orders, tree and savings',
    placeholder: 'Ask about your orders, tree or savings…',
    quick: ['Where is my latest order?', 'How much have I saved?', 'How do I grow my tree?', 'Any good deals?'],
    reply: answer,
    greeting: () => `${HELLO[profile.lang || 'en']} ${firstName()}! I'm your EverCrop assistant. I can see your orders, tree and savings, so ask me anything about your account.`
  });

  renderTree(); renderChips(); renderShop(); renderCart(); renderOrders(); syncShopBtn(); show();
}
