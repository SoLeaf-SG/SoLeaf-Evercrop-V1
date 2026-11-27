const inventory = [
  { name: 'Bok choy', category: 'Leafy greens', size: '250 g', packs: 18, price: 3.2, icon: '🥬', tip: 'Stir-fry with garlic.' },
  { name: 'Cherry tomatoes', category: 'Tomatoes', size: '200 g', packs: 4, price: 4.8, icon: '🍅', tip: 'Toss into a salad or roast on the vine.' },
  { name: 'Mixed salad greens', category: 'Leafy greens', size: '150 g', packs: 12, price: 4.5, icon: '🥗', tip: 'Dress with lime and a little sesame oil.' },
  { name: 'Cucumbers', category: 'Cucurbits', size: '400 g', packs: 10, price: 2.8, icon: '🥒', tip: 'Smash and dress with rice vinegar.' },
  { name: 'Kailan', category: 'Leafy greens', size: '250 g', packs: 0, price: 3.6, icon: '🥬', tip: 'Steam and serve with oyster sauce.' },
  { name: 'Thai basil', category: 'Herbs', size: '50 g', packs: 5, price: 2.5, icon: '🌿', tip: 'Stir into a hot pan just before serving.' }
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
    <div class="produce-top"><span aria-hidden="true" class="produce-icon">${item.icon}</span>${badge(item)}</div>
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

const demoBanner = document.querySelector('#stock-demo');
const demoRole = new URLSearchParams(window.location.search).get('demo');
demoBanner.hidden = demoRole !== (farmView ? 'farm' : 'customer');
