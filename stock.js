// Shared demo data for the farm and shopper portals. It is kept in this browser, so an order
// placed in the shop lands in the farm's inbox, and farm stock changes show up in the shop.
const STOCK_KEY = 'evercrop.demo.stock';
const ORDERS_KEY = 'evercrop.demo.orders';
const POINTS_KEY = 'evercrop.demo.points';

const baseInventory = [
  { name: 'Bok choy', emoji: '🥬', category: 'Leafy greens', size: '250 g', packs: 18, price: 3.2, tip: 'Stir-fry with garlic.' },
  { name: 'Cherry tomatoes', emoji: '🍅', category: 'Tomatoes', size: '200 g', packs: 4, price: 4.8, tip: 'Toss into a salad or roast on the vine.' },
  { name: 'Mixed salad greens', emoji: '🥗', category: 'Leafy greens', size: '150 g', packs: 12, price: 4.5, tip: 'Dress with lime and a little sesame oil.' },
  { name: 'Cucumbers', emoji: '🥒', category: 'Vegetables', size: '400 g', packs: 10, price: 2.8, tip: 'Smash and dress with rice vinegar.' },
  { name: 'Kailan', emoji: '🥦', category: 'Leafy greens', size: '250 g', packs: 0, price: 3.6, tip: 'Steam and serve with oyster sauce.' },
  { name: 'Thai basil', emoji: '🌿', category: 'Herbs', size: '50 g', packs: 5, price: 2.5, tip: 'Stir into a hot pan just before serving.' }
];
const SEED_ORDERS = [
  { id: 'EC-1042', customer: 'Mei Ling', items: [['Bok choy', 2, 3.2], ['Cherry tomatoes', 1, 4.8]], method: 'Pickup · Sat 9am', status: 'new', time: 'Today, 8:42am' },
  { id: 'EC-1041', customer: 'Rahul K.', items: [['Mixed salad greens', 2, 4.5]], method: 'Delivery · Today 5pm', status: 'packed', time: 'Today, 8:15am' },
  { id: 'EC-1040', customer: 'Jia Tong', items: [['Kailan', 3, 3.6], ['Thai basil', 1, 2.5]], method: 'Pickup · Today 4pm', status: 'collected', time: 'Yesterday, 6:10pm' }
];

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: the demo still works for this visit */ }
}

// Open a portal with ?reset to start the demo fresh (e.g. before a presentation).
if (new URLSearchParams(window.location.search).has('reset')) {
  for (const key of [STOCK_KEY, ORDERS_KEY, POINTS_KEY]) {
    try { localStorage.removeItem(key); } catch { /* nothing saved */ }
  }
}
const savedPacks = readJSON(STOCK_KEY, {});
const inventory = baseInventory.map((item) => ({ ...item, packs: Number.isInteger(savedPacks[item.name]) ? savedPacks[item.name] : item.packs }));
const saveStock = () => writeJSON(STOCK_KEY, Object.fromEntries(inventory.map((item) => [item.name, item.packs])));
let orders = Array.isArray(readJSON(ORDERS_KEY, null)) ? readJSON(ORDERS_KEY, null) : SEED_ORDERS;
const saveOrders = () => writeJSON(ORDERS_KEY, orders);
let shopperPoints = Number(readJSON(POINTS_KEY, 0)) || 0;

const qs = (selector) => document.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'EC';
const dollars = { format: (n) => `S$${n.toFixed(2)}` };
const orderTotal = (order) => order.items.reduce((sum, [, qty, price]) => sum + qty * price, 0);
const ORDER_STATUS = { new: 'New', packed: 'Packed', collected: 'Collected' };
const NEXT_STATUS = { new: ['packed', 'Mark packed'], packed: ['collected', 'Mark collected'] };

function statusOf(item) {
  if (item.packs === 0) return 'out';
  return item.packs <= 5 ? 'low' : 'available';
}
const statusLabels = { available: 'In stock', low: 'Low stock', out: 'Sold out' };
const badge = (item) => `<span class="stock-badge ${statusOf(item)}">${statusLabels[statusOf(item)]}</span>`;
const orderPill = (order) => `<span class="order-pill ${order.status}">${ORDER_STATUS[order.status]}</span>`;

const search = qs('#stock-search');
const filter = qs('#stock-filter');
const results = qs('#stock-list');
const count = qs('#stock-count');
const empty = qs('#stock-empty');
const farmView = document.body.dataset.stockView === 'farm';
let inStock = [];
const basket = new Map(); // shopper basket: produce name -> packs
let shopperName = '';

function stepper(name, value, max, label) {
  return `<div class="stepper" role="group" aria-label="${esc(label)}">
    <button type="button" data-step="-1" data-name="${esc(name)}" aria-label="One less" ${value <= 0 ? 'disabled' : ''}>−</button>
    <output aria-live="polite">${value}</output>
    <button type="button" data-step="1" data-name="${esc(name)}" aria-label="One more" ${value >= max ? 'disabled' : ''}>+</button>
  </div>`;
}

function farmRow(item) {
  return `<tr>
    <th scope="row"><div class="produce-cell"><span class="emoji-tile" aria-hidden="true">${item.emoji}</span><span>${item.name}<small>${item.category}</small></span></div></th>
    <td>${item.size}</td>
    <td>${stepper(item.name, item.packs, 99, `Packs of ${item.name}`)}</td>
    <td>${dollars.format(item.price)}</td><td>${badge(item)}</td>
  </tr>`;
}

function shopCard(item) {
  const inBasket = basket.get(item.name) || 0;
  const buy = item.packs === 0
    ? '<span class="sold-out">Sold out</span>'
    : inBasket
      ? stepper(item.name, inBasket, item.packs, `${item.name} in basket`)
      : `<button class="button add-btn" type="button" data-step="1" data-name="${esc(item.name)}">Add</button>`;
  return `<li class="produce-card${item.packs === 0 ? ' is-out' : ''}">
    <div class="produce-art" aria-hidden="true">${item.emoji}</div>
    <div class="produce-body">
      <div class="produce-title"><h3>${item.name}</h3>${badge(item)}</div>
      <p class="produce-meta">${item.size} per pack · Garden Row Farm</p>
      <p class="produce-tip">${item.tip}</p>
      <div class="produce-buy"><strong class="produce-price">${dollars.format(item.price)}</strong>${buy}</div>
    </div>
  </li>`;
}

function renderStock() {
  const query = search.value.trim().toLowerCase();
  const matches = inventory.filter((item) => {
    const matchesFilter = filter.value === 'all' || filter.value === statusOf(item)
      || (filter.value === 'available' && item.packs > 0);
    return matchesFilter && `${item.name} ${item.category}`.toLowerCase().includes(query);
  });
  // Rendered values come from the sample inventory, never from the search field.
  results.innerHTML = matches.map(farmView ? farmRow : shopCard).join('');
  count.textContent = `${matches.length} of ${inventory.length} items`;
  empty.hidden = matches.length > 0;
}

// ---------- Farm portal ----------
function renderFarm() {
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const todaySales = orders.filter((o) => o.time.startsWith('Today')).reduce((sum, o) => sum + orderTotal(o), 0);
  const watch = inventory.filter((item) => statusOf(item) !== 'available').sort((a, b) => a.packs - b.packs);
  qs('#kpis').innerHTML = [
    ['New orders', newOrders, 'Waiting to be packed'],
    ['Sales today', dollars.format(todaySales), 'From WhatsApp orders'],
    ['Chats auto-answered', 40 + orders.length * 4, 'No staff reply needed'],
    ['Stock to watch', watch.length, 'Low or sold out']
  ].map(([label, value, note]) => `<div><dt>${label}</dt><dd>${value}</dd><small>${note}</small></div>`).join('');
  qs('#nav-new-count').textContent = newOrders || '';
  const hour = new Date().getHours();
  qs('#overview-title').textContent = `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'} 🌱`;

  qs('#overview-orders').innerHTML = orders.slice(0, 4).map((o) => `<li>
    <span class="av" aria-hidden="true">${esc(initials(o.customer))}</span>
    <div><strong>${esc(o.customer)}</strong><small>${o.items.map(([n, q]) => `${q} × ${n}`).join(' · ')}</small></div>
    <strong>${dollars.format(orderTotal(o))}</strong>${orderPill(o)}
  </li>`).join('');

  qs('#overview-description').textContent = watch.length ? 'Sold out or five packs or fewer left.' : 'Everything has more than five packs.';
  qs('#overview-list').innerHTML = watch.map((item) => `<li>
    <span class="emoji-tile" aria-hidden="true">${item.emoji}</span>
    <div><strong>${item.name}</strong><small>${item.packs} packs left · ${item.size} per pack</small></div>${badge(item)}
  </li>`).join('');

  qs('#orders-list').innerHTML = orders.map((o) => {
    const next = NEXT_STATUS[o.status];
    return `<li class="panel order-item">
      <header><span class="av" aria-hidden="true">${esc(initials(o.customer))}</span>
        <div><strong>${esc(o.customer)}</strong><small>${o.id} · ${esc(o.time)}</small></div>${orderPill(o)}</header>
      <ul class="order-lines">${o.items.map(([n, q, p]) => `<li><span>${q} × ${n}</span><span>${dollars.format(q * p)}</span></li>`).join('')}</ul>
      <div class="order-foot"><div><b>${dollars.format(orderTotal(o))}</b><span class="order-method">${esc(o.method)}</span></div>
        ${next ? `<button class="button small-btn" type="button" data-advance="${o.id}">${next[1]}</button>` : '<span class="done-note">✓ Done</span>'}</div>
    </li>`;
  }).join('');
}

// ---------- Shopper portal ----------
function showToast(text) {
  const toast = qs('#portal-toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function renderShop() {
  const [stageName] = window.evercropTree.stageFor(shopperPoints);
  const pts = `${Math.min(shopperPoints, 100)} / 100 pts`;
  qs('#hello-name').textContent = shopperName || 'there';
  for (const id of ['#home', '#reward']) {
    qs(`${id}-stage`).textContent = shopperPoints >= 100 ? 'Full tree · harvest pack unlocked!' : stageName;
    qs(`${id}-progress`).value = Math.min(shopperPoints, 100);
    qs(`${id}-points`).textContent = pts;
  }

  qs('#overview-list').innerHTML = inStock.slice(0, 3).map((item) => `<li>
    <span class="emoji-tile" aria-hidden="true">${item.emoji}</span>
    <div><strong>${item.name}</strong><small>${item.size} · ${dollars.format(item.price)}</small></div>
  </li>`).join('') || '<li><div>Nothing in stock right now — check back after the next harvest.</div></li>';

  const mine = orders.filter((o) => o.mine);
  const orderCard = (o) => `<li class="panel order-item">
    <header><span class="emoji-tile" aria-hidden="true">🧺</span>
      <div><strong>Garden Row Farm</strong><small>${o.id} · ${esc(o.time)}</small></div>${orderPill(o)}</header>
    <ul class="order-lines">${o.items.map(([n, q, p]) => `<li><span>${q} × ${n}</span><span>${dollars.format(q * p)}</span></li>`).join('')}</ul>
    <div class="order-foot"><div><b>${dollars.format(orderTotal(o))}</b><span class="order-method">${esc(o.method)}</span></div><span class="earned">+25 pts 🌱</span></div>
  </li>`;
  const emptyOrders = '<li class="panel empty-state"><p>No orders yet. Your first order plants your tree.</p><a class="button" href="#inventory">Shop today’s harvest</a></li>';
  qs('#my-orders').innerHTML = mine.map(orderCard).join('') || emptyOrders;
  qs('#latest-order').innerHTML = mine.length ? orderCard(mine[0]) : emptyOrders;

  const lines = [...basket].map(([name, qty]) => [inventory.find((i) => i.name === name), qty]);
  const total = lines.reduce((sum, [item, qty]) => sum + item.price * qty, 0);
  qs('#basket-lines').innerHTML = lines.map(([item, qty]) => `<li><span>${qty} × ${item.name}</span><span>${dollars.format(item.price * qty)}</span></li>`).join('');
  qs('#basket-empty').hidden = lines.length > 0;
  qs('#basket-total').textContent = dollars.format(total);
  qs('#basket-send').disabled = !lines.length;
  qs('#basket-count').textContent = lines.reduce((sum, [, qty]) => sum + qty, 0) || '';
}

function placeOrder() {
  if (!basket.size) return;
  const items = [...basket].map(([name, qty]) => {
    const item = inventory.find((i) => i.name === name);
    item.packs = Math.max(0, item.packs - qty);
    return [name, qty, item.price];
  });
  const nextId = Math.max(...orders.map((o) => Number(o.id.slice(3)) || 0), 1042) + 1;
  const time = new Date().toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase();
  orders = [{ id: `EC-${nextId}`, customer: shopperName || 'Evercrop shopper', items, method: qs('#basket-method').value, status: 'new', time: `Today, ${time}`, mine: true }, ...orders];
  shopperPoints += 25;
  basket.clear();
  saveStock();
  saveOrders();
  writeJSON(POINTS_KEY, shopperPoints);
  renderAll();
  showToast('Order sent to Garden Row Farm on WhatsApp · +25 pts 🌱');
  window.location.hash = '#orders';
}

function renderAll() {
  inStock = inventory.filter((item) => item.packs > 0);
  renderStock();
  if (farmView) renderFarm();
  else renderShop();
}

// One click handler covers every − / + / Add / status button.
document.addEventListener('click', (event) => {
  const step = event.target.closest('[data-step]');
  const advance = event.target.closest('[data-advance]');
  if (step) {
    const item = inventory.find((i) => i.name === step.dataset.name);
    const delta = Number(step.dataset.step);
    if (farmView) {
      item.packs = Math.min(99, Math.max(0, item.packs + delta));
      saveStock();
    } else {
      const qty = Math.min(item.packs, Math.max(0, (basket.get(item.name) || 0) + delta));
      if (qty) basket.set(item.name, qty); else basket.delete(item.name);
    }
    renderAll();
    // Keep keyboard focus on the same control after the re-render.
    results.querySelector(`[data-name="${CSS.escape(item.name)}"][data-step="${delta}"]:not(:disabled)`)?.focus();
  } else if (advance) {
    const order = orders.find((o) => o.id === advance.dataset.advance);
    order.status = NEXT_STATUS[order.status][0];
    saveOrders();
    renderAll();
  }
});

search.addEventListener('input', renderStock);
filter.addEventListener('change', renderStock);
qs('#basket-send')?.addEventListener('click', placeOrder);
window.addEventListener('evercrop:shopper', (event) => {
  shopperName = event.detail?.name || '';
  if (!farmView) renderShop();
});
renderAll();

// ---------- Page switching (one section visible at a time) ----------
const portalLinks = document.querySelectorAll('.portal-sidebar nav a[href^="#"]');
let treeShownAt = -1;

function showPortalPage() {
  const active = Array.from(portalLinks).some((link) => link.hash === window.location.hash)
    ? window.location.hash : '#overview';
  for (const link of portalLinks) {
    document.getElementById(link.hash.slice(1)).hidden = link.hash !== active;
    if (link.hash === active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  // Grow the tree when its page opens, so the visitor sees it happen.
  if (active === '#rewards' && treeShownAt !== shopperPoints) {
    if (treeShownAt >= 0) window.evercropTree.water();
    window.evercropTree.grow(window.evercropTree.stageFor(shopperPoints)[1]);
    treeShownAt = shopperPoints;
  }
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#customer-main') return;
  showPortalPage();
  const heading = document.querySelector('.portal-workspace > :not([hidden]) h1');
  heading?.setAttribute('tabindex', '-1');
  heading?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
showPortalPage();
