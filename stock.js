const inventory = [
  { name: 'Bok choy', category: 'Leafy greens', size: '250 g', packs: 18, price: 3.2, tip: 'Stir-fry with garlic.' },
  { name: 'Cherry tomatoes', category: 'Tomatoes', size: '200 g', packs: 4, price: 4.8, tip: 'Toss into a salad or roast on the vine.' },
  { name: 'Mixed salad greens', category: 'Leafy greens', size: '150 g', packs: 12, price: 4.5, tip: 'Dress with lime and a little sesame oil.' },
  { name: 'Cucumbers', category: 'Vegetables', size: '400 g', packs: 10, price: 2.8, tip: 'Smash and dress with rice vinegar.' },
  { name: 'Kailan', category: 'Leafy greens', size: '250 g', packs: 0, price: 3.6, tip: 'Steam and serve with oyster sauce.' },
  { name: 'Thai basil', category: 'Herbs', size: '50 g', packs: 5, price: 2.5, tip: 'Stir into a hot pan just before serving.' }
];

const search = document.querySelector('#stock-search');
const filter = document.querySelector('#stock-filter');
const results = document.querySelector('#stock-list');
const count = document.querySelector('#stock-count');
const empty = document.querySelector('#stock-empty');
const summary = document.querySelector('#stock-summary');
const farmView = document.body.dataset.stockView === 'farm';
const dollars = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', currencyDisplay: 'code' });

function statusOf(item) {
  if (item.packs === 0) return 'out';
  return item.packs <= 5 ? 'low' : 'available';
}

const statusLabels = { available: 'In stock', low: 'Low stock', out: 'Sold out' };

function badge(item) {
  const status = statusOf(item);
  return `<span class="stock-badge ${status}">${statusLabels[status]}</span>`;
}

function farmRow(item) {
  return `<tr>
    <th scope="row">${item.name}<small>${item.category}</small></th>
    <td>${item.size}</td><td class="stock-quantity">${item.packs}</td>
    <td>${dollars.format(item.price)}</td><td>${badge(item)}</td>
  </tr>`;
}

function shopCard(item) {
  return `<li class="produce-card" data-produce="${item.category}">
    <div class="produce-top"><span class="produce-category">${item.category}</span>${badge(item)}</div>
    <div class="produce-details">
      <div class="produce-title"><h3>${item.name}</h3><strong class="produce-price">${dollars.format(item.price)}</strong></div>
      <p class="produce-meta">Garden Row Farm · ${item.size} per pack</p>
      <p class="produce-tip">${item.tip}</p>
    </div>
  </li>`;
}

function renderStock() {
  const query = search.value.trim().toLowerCase();
  const matches = inventory.filter((item) => {
    const status = statusOf(item);
    const matchesFilter = filter.value === 'all' || filter.value === status
      || (filter.value === 'available' && item.packs > 0);
    return matchesFilter && `${item.name} ${item.category}`.toLowerCase().includes(query);
  });
  // All rendered values come from the sample inventory, never from the search field.
  results.innerHTML = matches.map(farmView ? farmRow : shopCard).join('');
  count.textContent = `${matches.length} of ${inventory.length} items`;
  empty.hidden = matches.length > 0;
}

if (summary) {
  const totals = [
    ['Available packs', inventory.reduce((total, item) => total + item.packs, 0)],
    ['Low-stock items', inventory.filter((item) => statusOf(item) === 'low').length],
    ['Sold-out items', inventory.filter((item) => statusOf(item) === 'out').length]
  ];
  summary.innerHTML = totals.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
}

search.addEventListener('input', renderStock);
filter.addEventListener('change', renderStock);
renderStock();


const overviewDescription = document.querySelector('#overview-description');
const overviewList = document.querySelector('#overview-list');
const inStock = inventory.filter((item) => item.packs > 0);
const stockToWatch = inventory.filter((item) => statusOf(item) !== 'available')
  .sort((left, right) => left.packs - right.packs);

if (farmView) {
  overviewDescription.textContent = stockToWatch.length
    ? 'Items that are sold out or have five packs or fewer remaining.'
    : 'All items have more than five packs available.';
  overviewList.innerHTML = stockToWatch.map((item) => `<li>
    <div><strong>${item.name}</strong><small>${item.packs} packs left · ${item.size} per pack</small></div>
    ${badge(item)}
  </li>`).join('');
} else {
  overviewDescription.textContent = inStock.length
    ? `${inStock.length} varieties in stock at Garden Row Farm.`
    : 'Check back for the next harvest.';
  overviewList.innerHTML = inStock.slice(0, 3).map((item) => `<li>
    <div><strong>${item.name}</strong><small>${item.size} per pack</small></div>
    <strong class="overview-price">${dollars.format(item.price)}</strong>
  </li>`).join('');
}

const portalLinks = document.querySelectorAll('.portal-sidebar nav a[href^="#"]');

function showPortalPage() {
  const active = Array.from(portalLinks).some((link) => link.hash === window.location.hash)
    ? window.location.hash : '#overview';
  for (const link of portalLinks) {
    document.getElementById(link.hash.slice(1)).hidden = link.hash !== active;
    if (link.hash === active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#customer-main') return;
  showPortalPage();
  if (!farmView) {
    const heading = document.querySelector('.portal-workspace > :not([hidden]) h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
showPortalPage();
