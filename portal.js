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

  const initials = user.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-first]').forEach(el => el.textContent = user.name.split(' ')[0]);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = initials);
  document.querySelectorAll('[data-farm-name]').forEach(el => el.textContent = user.farm || 'Your farm');
  document.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', EC.logout));
  document.querySelectorAll('[data-soon]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast('Coming soon in the prototype'); }));

  kind === 'farm' ? farm() : shopper(user);
  document.body.hidden = false;
})();

function farm() {
  const orders = [
    ['#1042', 'Aaron L.', 'Kai Lan × 2, Cherry Tomato', '$9.80', 'ok', 'Paid'],
    ['#1041', 'Priya S.', 'Bayam × 3', '$7.50', 'go', 'Delivering'],
    ['#1040', 'Wei Jie T.', 'Xiao Bai Cai × 4', '$10.40', 'wait', 'Awaiting payment'],
    ['#1039', 'Nur A.', 'Kai Lan × 1, Bayam × 1', '$5.30', 'ok', 'Paid'],
    ['#1038', 'Daniel K.', 'Cherry Tomato × 2', '$8.40', 'ok', 'Paid']
  ];
  $('[data-orders]').innerHTML = orders.map(([id, who, items, amt, cls, st]) =>
    `<tr><td>${id}</td><td>${who}</td><td>${items}</td><td>${amt}</td><td><span class="badge ${cls}">${st}</span></td></tr>`).join('');

  const week = [['Mon', 32], ['Tue', 45], ['Wed', 38], ['Thu', 60], ['Fri', 72], ['Sat', 95], ['Sun', 64]];
  const max = Math.max(...week.map(w => w[1]));
  $('[data-bars]').innerHTML = week.map(([d, v]) => `<div><i style="height:${v / max * 100}%" title="${v} orders"></i><span>${d}</span></div>`).join('');

  const chats = [
    ['AL', 'Aaron L.', 'Bot confirmed order #1042 and sent PayNow QR.', '2m'],
    ['PS', 'Priya S.', 'Bot answered: "Is the bayam pesticide-free?"', '14m'],
    ['WT', 'Wei Jie T.', 'Bot sent payment reminder.', '1h']
  ];
  $('[data-chats]').innerHTML = chats.map(([av, n, p, t]) =>
    `<div class="chat-row"><span class="av">${av}</span><div><b>${n}</b><p>${p}</p></div><small>${t}</small></div>`).join('');

  const stock = [['Kai Lan', 42, 60], ['Cherry Tomato', 18, 40], ['Bayam', 30, 32], ['Xiao Bai Cai', 12, 25]];
  $('[data-stock]').innerHTML = stock.map(([n, s, t]) =>
    `<div class="stock-row"><div><b>${n}</b><span>${s} / ${t} kg sold</span></div><div class="meter"><i style="width:${s / t * 100}%"></i></div></div>`).join('');

  $('[data-broadcast]').addEventListener('click', () => toast('Harvest alert sent to 214 customers'));
}

function shopper(user) {
  const STAGE_AT = [0, 100, 250, 450, 700]; // water needed to reach each stage
  const key = `ec_tree_${user.email}`;
  const today = new Date().toDateString();
  const state = EC.read(key, { water: 140, lastCheckin: null, streak: 2, boxes: 0 });
  const save = () => EC.write(key, state);

  const art = $('[data-tree-art]'), label = $('[data-tree-label]'), meter = $('[data-tree-meter]'),
        info = $('[data-tree-info]'), waterEl = $('[data-water]'), checkBtn = $('[data-checkin]'), harvestBtn = $('[data-harvest]');

  function render() {
    const stage = STAGE_AT.filter(v => state.water >= v).length - 1;
    const next = STAGE_AT[stage + 1];
    drawTree(art, stage);
    label.textContent = TREE_STAGES[stage];
    meter.style.width = Math.min(100, state.water / STAGE_AT[4] * 100) + '%';
    info.textContent = next ? `${next - state.water} water to ${TREE_STAGES[stage + 1]}` : 'Fully grown! Claim your produce box.';
    waterEl.textContent = state.water;
    $('[data-streak]').textContent = state.streak;
    $('[data-boxes]').textContent = state.boxes;
    const done = state.lastCheckin === today;
    checkBtn.disabled = done; checkBtn.textContent = done ? 'Checked in ✓' : 'Check in +5';
    harvestBtn.hidden = !!next;
  }
  const add = (n, msg) => { state.water += n; save(); render(); toast(msg); };

  checkBtn.addEventListener('click', () => {
    if (state.lastCheckin === today) return;
    state.lastCheckin = today; state.streak += 1;
    const bonus = state.streak % 7 === 0 ? 20 : 0;
    add(5 + bonus, bonus ? `+${5 + bonus} water · 7-day streak bonus!` : '+5 water · see you tomorrow');
  });
  $('[data-invite]').addEventListener('click', async () => {
    const link = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}register.html?role=shopper`;
    try { await navigator.clipboard.writeText(link); toast('Invite link copied · +50 water when they order'); }
    catch { toast('Invite: ' + link); }
  });
  harvestBtn.addEventListener('click', () => {
    state.water = 0; state.boxes += 1; save(); render();
    toast('🎁 Produce box claimed! A new seed is planted.');
  });

  const produce = [
    ['Kai Lan', 'Kranji Greens', 2.8, 3.9], ['Bayam', 'Kranji Greens', 2.5, 3.4], ['Cherry Tomato', 'Neo Tiew Hydro', 4.2, 5.9],
    ['Butterhead', 'Lim Chu Kang Leafy', 3.0, 4.2], ['Basil', 'Tengah Herb Lab', 2.2, 3.5], ['Chye Sim', 'Punggol Rooftop', 2.4, 3.2]
  ];
  $('[data-produce]').innerHTML = produce.map(([n, f, p, s], i) => `
    <div class="produce"><b>${n}</b><span>${f}</span>
      <div class="price-row"><strong>$${p.toFixed(2)}</strong><s>$${s.toFixed(2)}</s></div>
      <button class="btn btn-ghost btn-sm" data-order="${i}">Order on WhatsApp</button></div>`).join('');
  document.querySelectorAll('[data-order]').forEach(b => b.addEventListener('click', () =>
    add(30, `Order sent to ${produce[b.dataset.order][1]} · +30 water`)));

  const orders = [['#1042', 'Kranji Greens', '$9.80', 'ok', 'Delivered'], ['#0987', 'Neo Tiew Hydro', '$12.60', 'ok', 'Delivered'], ['#1051', 'Tengah Herb Lab', '$6.60', 'go', 'On the way']];
  $('[data-my-orders]').innerHTML = orders.map(([id, f, a, c, s]) => `<tr><td>${id}</td><td>${f}</td><td>${a}</td><td><span class="badge ${c}">${s}</span></td></tr>`).join('');

  render();
}
