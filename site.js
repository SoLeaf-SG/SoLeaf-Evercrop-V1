/* EverCrop — shared public-site behaviour: icons, header/footer, chat demo, tree, map */

const ICONS = {
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  tree: '<path d="M12 22v-7"/><path d="M9 15h6"/><path d="M12 3a5 5 0 0 0-5 5 4 4 0 0 0-2 7h14a4 4 0 0 0-2-7 5 5 0 0 0-5-5Z"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  bot: '<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
function paintIcons(root = document) {
  root.querySelectorAll('i[data-i]').forEach(el => { el.outerHTML = icon(el.dataset.i); });
}

const LOGO = `<a href="index.html" class="logo" aria-label="EverCrop home"><span class="logo-mark">${icon('sprout')}</span>EverCrop</a>`;

function renderChrome() {
  const page = document.body.dataset.page;
  const header = document.querySelector('[data-header]');
  if (header) {
    const links = [['index.html', 'Home', 'home'], ['farms.html', 'For Farms', 'farms'], ['shoppers.html', 'For Shoppers', 'shoppers'], ['contact.html', 'Contact', 'contact']];
    header.outerHTML = `
    <header class="header">
      <div class="container">
        ${LOGO}
        <nav class="nav" aria-label="Main">
          ${links.map(([href, label, key]) => `<a href="${href}"${key === page ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          <a href="login.html" class="nav-login">Log in</a>
        </nav>
        <div class="header-cta">
          <a href="login.html" class="btn btn-ghost btn-sm">Log in</a>
          <a href="register.html" class="btn btn-primary btn-sm">Get started</a>
          <button class="menu-btn" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
        </div>
      </div>
    </header>`;
    const h = document.querySelector('.header');
    const btn = h.querySelector('.menu-btn');
    btn.addEventListener('click', () => {
      const open = h.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.innerHTML = icon(open ? 'close' : 'menu');
    });
  }
  const footer = document.querySelector('[data-footer]');
  if (footer) {
    footer.outerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div style="display:grid;gap:16px;align-content:start">
            ${LOGO}
            <p class="muted" style="max-width:34ch;font-size:15px">Farm-direct sales on WhatsApp. A SoLeaf product, made in Singapore.</p>
          </div>
          <div><h4>Product</h4><ul><li><a href="farms.html">For Farms</a></li><li><a href="shoppers.html">For Shoppers</a></li><li><a href="shoppers.html#tree">Grow a Tree</a></li></ul></div>
          <div><h4>Portal</h4><ul><li><a href="login.html">Log in</a></li><li><a href="register.html">Create account</a></li><li><a href="forgot-password.html">Reset password</a></li></ul></div>
          <div><h4>Company</h4><ul><li><a href="contact.html">Contact</a></li><li><a href="terms.html">Terms</a></li><li><a href="privacy.html">Privacy</a></li></ul></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} SoLeaf. All rights reserved.</span><span>Singapore</span></div>
      </div>
    </footer>`;
  }
}

/* Reveal on scroll */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
}

/* WhatsApp chat demo — plays a scripted order, then loops */
const CHAT = [
  { from: 'out', html: 'Hi! What\'s fresh this week?' },
  { from: 'in', html: 'Morning! 🌱 Harvested today at Kranji Greens:<div class="chips"><span>Kai Lan $2.80</span><span>Bayam $2.50</span><span>Cherry Tomato $4.20</span></div>' },
  { from: 'out', html: '2 Kai Lan and 1 Cherry Tomato please' },
  { from: 'in', html: 'Here\'s your order:<div class="order"><div><span>Kai Lan × 2</span><span>$5.60</span></div><div><span>Cherry Tomato × 1</span><span>$4.20</span></div><div class="total"><span>Total</span><span>$9.80</span></div></div>Delivery or pickup on Saturday?' },
  { from: 'out', html: 'Delivery please 👍' },
  { from: 'in', html: 'Confirmed ✅ PayNow QR sent.<br>+30 💧 added to your tree!' }
];
function initChat() {
  const body = document.querySelector('[data-chat]');
  if (!body) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const time = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const add = (m) => {
    const el = document.createElement('div');
    el.className = `msg ${m.from}`;
    el.innerHTML = `${m.html}<small>${time()}${m.from === 'out' ? ' ✓✓' : ''}</small>`;
    body.appendChild(el);
  };
  const scrollDown = () => body.scrollTo({ top: body.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  if (reduce) { CHAT.forEach(add); scrollDown(); return; }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function loop() {
    for (;;) {
      body.innerHTML = '';
      for (const m of CHAT) {
        if (m.from === 'in') {
          const t = document.createElement('div');
          t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
          body.appendChild(t); scrollDown(); await wait(1200); t.remove();
        } else await wait(900);
        add(m); scrollDown(); await wait(1400);
      }
      await wait(4000);
    }
  })();
}

/* Tree — 5 growth stages, shared by home preview and shopper portal */
const TREE_STAGES = ['Seed', 'Sprout', 'Sapling', 'Young tree', 'Fruiting tree'];
const TREE_SVG = `
<svg class="tree-svg" viewBox="0 0 220 220" aria-hidden="true">
  <defs>
    <radialGradient id="tg" cx="50%" cy="40%"><stop offset="0" stop-color="#b8f34a"/><stop offset="1" stop-color="#3f8460"/></radialGradient>
  </defs>
  <ellipse cx="110" cy="196" rx="70" ry="10" fill="rgba(184,243,74,.12)"/>
  <path d="M60 192 Q110 176 160 192 Z" fill="#5b4632"/>
  <g class="part" data-stage="0"><ellipse cx="110" cy="186" rx="7" ry="5" fill="#8a6f4d"/></g>
  <g class="part" data-stage="1"><path d="M110 188 V164" stroke="#7fbf6a" stroke-width="4" stroke-linecap="round"/><path d="M110 170 Q96 160 92 148 Q106 150 110 168Z M110 166 Q124 154 130 144 Q132 160 110 166Z" fill="#9be15d"/></g>
  <g class="part" data-stage="2"><path d="M110 190 V130" stroke="#6b5139" stroke-width="7" stroke-linecap="round"/><circle cx="110" cy="122" r="26" fill="url(#tg)"/></g>
  <g class="part" data-stage="3"><path d="M110 190 V110 M110 140 L84 118 M110 130 L138 108" stroke="#6b5139" stroke-width="9" stroke-linecap="round"/><circle cx="110" cy="86" r="44" fill="url(#tg)"/><circle cx="74" cy="110" r="26" fill="url(#tg)"/><circle cx="146" cy="104" r="28" fill="url(#tg)"/></g>
  <g class="part" data-stage="4"><circle cx="96" cy="74" r="7" fill="#ff7a59"/><circle cx="128" cy="92" r="7" fill="#ff7a59"/><circle cx="72" cy="110" r="6" fill="#ffc857"/><circle cx="150" cy="104" r="6" fill="#ff7a59"/><circle cx="114" cy="56" r="6" fill="#ffc857"/></g>
</svg>`;
function drawTree(container, stage) {
  if (!container.querySelector('.tree-svg')) container.insertAdjacentHTML('afterbegin', TREE_SVG);
  container.querySelectorAll('.part').forEach(p => {
    const s = +p.dataset.stage;
    // seed only shows at stage 0; sprout only at 1; trunk/canopy stack from 2 up
    const visible = s === 4 ? stage >= 4 : s >= 2 ? stage === s || (s === 3 && stage === 4) : stage === s;
    p.classList.toggle('hidden', !visible);
  });
}
function initTreePreview() {
  const box = document.querySelector('[data-tree-preview]');
  if (!box) return;
  const art = box.querySelector('[data-tree-art]'), label = box.querySelector('[data-tree-label]'),
        meter = box.querySelector('.meter i'), pct = box.querySelector('[data-tree-pct]');
  let stage = 0;
  const step = () => {
    drawTree(art, stage);
    const p = Math.round(stage / 4 * 100);
    label.textContent = TREE_STAGES[stage];
    meter.style.width = p + '%';
    pct.textContent = p === 100 ? 'Ready to harvest 🎁' : `${p}% grown`;
    stage = (stage + 1) % 5;
  };
  step();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(step, 2200);
}

/* Farm map */
const FARMS = [
  { id: 'kranji', name: 'Kranji Greens', area: 'Kranji', x: 214, y: 72, produce: ['Kai Lan', 'Bayam', 'Xiao Bai Cai'] },
  { id: 'lck', name: 'Lim Chu Kang Leafy Co.', area: 'Lim Chu Kang', x: 150, y: 92, produce: ['Lettuce', 'Kale'] },
  { id: 'neotiew', name: 'Neo Tiew Hydro Farm', area: 'Neo Tiew', x: 118, y: 128, produce: ['Cherry Tomato', 'Herbs'] },
  { id: 'tengah', name: 'Tengah Herb Lab', area: 'Sungei Tengah', x: 178, y: 146, produce: ['Basil', 'Mint', 'Microgreens'] },
  { id: 'punggol', name: 'Punggol Rooftop Farm', area: 'Punggol', x: 446, y: 102, produce: ['Chye Sim', 'Spinach'] }
];
function initMap() {
  const map = document.querySelector('[data-map]');
  if (!map) return;
  const list = document.querySelector('[data-farm-list]');
  // shortcut: hand-drawn Singapore outline, not to scale — swap for a real map (Leaflet/OneMap) when farms are live
  map.innerHTML = `
  <svg viewBox="0 0 600 320" role="img" aria-label="Map of Singapore with partner farms">
    <path class="island" d="M34 168 C40 140 70 120 100 104 C130 86 160 66 196 58 C226 50 250 40 276 46 C300 52 318 66 344 70 C380 74 410 68 446 76 C486 84 520 104 548 128 C566 144 572 166 556 182 C536 198 500 200 470 206 C440 212 420 232 388 246 C352 262 314 276 276 274 C240 272 214 256 186 246 C150 234 116 236 86 226 C58 216 30 198 34 168 Z"/>
    <path class="island" d="M488 60 C504 54 528 56 540 64 C536 74 512 76 494 72 Z"/>
    <path class="island" d="M560 92 C572 86 588 90 590 102 C584 112 568 110 560 104 Z"/>
    <text x="290" y="180" fill="rgba(238,243,236,.25)" font-family="Manrope" font-weight="700" font-size="14" letter-spacing="6" text-anchor="middle">SINGAPORE</text>
    ${FARMS.map(f => `<g class="pin" data-id="${f.id}" tabindex="0" role="button" aria-label="${f.name}, ${f.area}">
      <circle class="ring" cx="${f.x}" cy="${f.y}" r="8"/><circle class="dot" cx="${f.x}" cy="${f.y}" r="7"/></g>`).join('')}
  </svg>`;
  if (list) list.innerHTML = FARMS.map(f => `
    <button class="farm-item card" data-id="${f.id}">
      <b>${f.name}</b><span>${f.area}</span>
      <div class="farm-tags">${f.produce.map(p => `<i>${p}</i>`).join('')}</div>
    </button>`).join('');
  const select = id => document.querySelectorAll('[data-id]').forEach(el => el.classList.toggle('active', el.dataset.id === id));
  document.querySelectorAll('.pin, .farm-item').forEach(el => {
    el.addEventListener('click', () => select(el.dataset.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(el.dataset.id); } });
  });
  select(FARMS[0].id);
}

/* Scroll-to-top button, every page */
function initToTop() {
  const b = document.createElement('button');
  b.className = 'to-top'; b.setAttribute('aria-label', 'Back to top'); b.innerHTML = icon('up');
  b.addEventListener('click', () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  document.body.appendChild(b);
  const update = () => b.classList.toggle('show', scrollY > 480);
  addEventListener('scroll', update, { passive: true });
  update();
}

/* Help chatbot, public pages only.
   shortcut: keyword matching, not real AI — swap reply() for an API call when the bot backend exists. */
const BOT_REPLIES = [
  [/price|pricing|cost|plan|subscri|fee/, 'Farms start on the 3-month <b>Starter</b> plan at S$29/month, then <b>Growth</b> at S$59/month for full access. Shoppers use EverCrop for free. <a href="farms.html#pricing">See plans</a>'],
  [/(join|sign|register|list|sell).*farm|farm.*(join|sign|register)|i (run|own|have) a farm|join as/, 'Great! Register your farm and you could be taking WhatsApp orders in about 10 minutes. <a href="register.html?role=farm">Register your farm</a>'],
  [/tree|water|reward|point|game|free/, 'Every order adds <b>+30 water</b> to your tree, daily check-ins +5, and each friend you invite +50. A fully grown tree gets you a free produce box! <a href="shoppers.html#tree">How it works</a>'],
  [/order|buy|how.*(work|shop)/, 'Just message a farm on WhatsApp. Our AI shows what\'s fresh, builds your order and sends a PayNow QR. No app needed.'],
  [/deliver|pickup|pick up|ship/, 'Each farm sets its own delivery and pickup options. The chatbot shows the ones available when you order.'],
  [/where|location|map|near/, 'Our partner farms are across Singapore, mostly around Kranji and Lim Chu Kang. <a href="index.html#farms">See the farm map</a>'],
  [/cheap|lower|save|why/, 'You buy straight from the grower, so there\'s no wholesaler or retailer markup. Fresher produce, fairer price.'],
  [/contact|human|person|email|talk|support/, 'You can reach our team at <a href="mailto:soleaf.co@gmail.com">soleaf.co@gmail.com</a> or through the <a href="contact.html">contact page</a>.'],
  [/^(hi|hello|hey|yo)\b/, 'Hi there! 👋 Ask me about ordering, prices, tree rewards or joining as a farm.']
];
const BOT_QUICK = ['How do I order?', 'Farm pricing', 'Tree rewards', 'Join as a farm'];
const reply = text => (BOT_REPLIES.find(([re]) => re.test(text.toLowerCase())) || [, 'I\'m still learning! Try one of the topics below, or <a href="contact.html">contact our team</a>.'])[1];

function initBot() {
  if (!document.querySelector('.header')) return; // public pages render the site header; the shopper portal mounts its own
  mountBot({ quick: BOT_QUICK, reply, greeting: 'Hi! 👋 I\'m the EverCrop assistant. How can I help you today?' });
}

/* Floating chat widget, shared by the public site and the shopper portal */
function mountBot({ title = 'EverCrop Assistant', status = 'Usually replies instantly', placeholder = 'Ask a question…', quick, reply, greeting }) {
  document.body.classList.add('has-bot');
  document.body.insertAdjacentHTML('beforeend', `
    <button class="bot-launch" aria-label="Open chat assistant" aria-expanded="false">${icon('chat')}</button>
    <section class="bot" role="dialog" aria-label="${title}">
      <div class="bot-head">
        <span class="wa-avatar">${icon('sprout')}</span>
        <div><b>${title}</b><span>${status}</span></div>
        <button class="bot-close" aria-label="Close chat">${icon('close')}</button>
      </div>
      <div class="bot-body" aria-live="polite"></div>
      <div class="bot-quick">${quick.map(q => `<button type="button">${q}</button>`).join('')}</div>
      <form class="bot-form"><input name="q" placeholder="${placeholder}" autocomplete="off" aria-label="Your message"><button aria-label="Send">${icon('send')}</button></form>
    </section>`);
  const panel = document.querySelector('.bot'), launch = document.querySelector('.bot-launch'),
        body = panel.querySelector('.bot-body'), form = panel.querySelector('.bot-form');
  const say = (html, from, isText) => {
    const m = document.createElement('div');
    m.className = `bot-msg ${from}`;
    isText ? m.textContent = html : m.innerHTML = html; // user text is never parsed as HTML
    body.appendChild(m); body.scrollTop = body.scrollHeight;
  };
  const ask = q => {
    q = q.trim(); if (!q) return;
    say(q, 'out', true);
    const t = document.createElement('div');
    t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    setTimeout(() => { t.remove(); say(reply(q), 'in'); }, 700);
  };
  const toggle = open => {
    panel.classList.toggle('open', open);
    launch.setAttribute('aria-expanded', open);
    launch.innerHTML = icon(open ? 'close' : 'chat');
    if (open) {
      if (!body.children.length) say(typeof greeting === 'function' ? greeting() : greeting, 'in');
      form.q.focus();
    }
  };
  launch.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  panel.querySelector('.bot-close').addEventListener('click', () => { toggle(false); launch.focus(); });
  panel.querySelectorAll('.bot-quick button').forEach(b => b.addEventListener('click', () => ask(b.textContent)));
  form.addEventListener('submit', e => { e.preventDefault(); ask(form.q.value); form.reset(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) toggle(false); });
}

renderChrome();
paintIcons();
initReveal();
initChat();
initTreePreview();
initMap();
initToTop();
initBot();
