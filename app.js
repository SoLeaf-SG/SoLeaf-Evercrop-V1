const demo = document.querySelector('#demo');
const messages = document.querySelector('#messages');
const replies = document.querySelector('#replies');
const grow = document.querySelector('#grow');
const pointsLabel = document.querySelector('#points');
const progress = document.querySelector('#progress');
const stage = document.querySelector('#stage');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const plant = document.querySelector('#plant');
const { grow: growTree, water: waterTree } = window.evercropTree;
let points = 0;

function addPoints() {
  points = Math.min(points + 25, 100);
  const [name, key] = points >= 100 ? ['Full tree', 'grown']
    : points >= 50 ? ['Sapling', 'sapling'] : ['Seedling', 'sprout'];
  waterTree();
  growTree(key);
  stage.textContent = name;
  progress.value = points;
  pointsLabel.textContent = `${points} / 100 pts`;
  if (points === 100) {
    stage.textContent = 'Full tree · free harvest pack unlocked!';
    grow.textContent = 'Tree fully grown 🎉';
    grow.disabled = true;
  }
}

if (plant) growTree('sprout');

// ---------- Hero phone: a WhatsApp conversation that plays on a loop ----------
const waChat = document.querySelector('#wa-chat');
const waStatus = document.querySelector('#wa-status');
const heroToast = document.querySelector('#hero-toast');
const TICKS = '<svg class="wa-ticks" viewBox="0 0 18 11"><path d="M1 6l3 3 6-7M7 9l1 1 8-9"/></svg>';
const SCRIPT = [
  { from: 'in', text: 'Morning! 🌱 Picked today:\nBok choy · S$2.20\nCherry tomatoes · S$4.50\nKailan · S$2.00' },
  { from: 'out', text: '2 bok choy + 1 tomatoes please!' },
  { from: 'in', text: 'Done ✅ Total S$8.90\nPickup Sat, 9am at the farm.' }
];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function bubble(msg) {
  const el = document.createElement('div');
  el.className = `wa-msg ${msg.from}`;
  el.innerHTML = `<span></span><small>9:41${msg.from === 'out' ? TICKS : ''}</small>`;
  el.firstChild.textContent = msg.text;
  waChat.append(el);
  if (!reduceMotion) el.animate([{ opacity: 0, transform: 'translateY(10px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
  return el;
}

async function playChat() {
  for (;;) {
    waChat.replaceChildren();
    heroToast.classList.remove('show');
    const date = document.createElement('p');
    date.className = 'wa-date';
    date.textContent = 'Today';
    waChat.append(date);
    for (const msg of SCRIPT) {
      if (msg.from === 'in') {
        waStatus.textContent = 'typing…';
        const typing = bubble({ from: 'in typing', text: '' });
        typing.firstChild.innerHTML = '<i></i><i></i><i></i>';
        await wait(1400);
        typing.remove();
        waStatus.textContent = 'online';
        bubble(msg);
        await wait(1500);
      } else {
        const sent = bubble(msg);
        await wait(900);
        sent.classList.add('read');
        await wait(700);
      }
    }
    heroToast.classList.add('show');
    await wait(5000);
  }
}

if (waChat) {
  if (reduceMotion) {
    waChat.innerHTML = '<p class="wa-date">Today</p>';
    SCRIPT.forEach((msg) => bubble(msg).classList.add('read'));
    heroToast.classList.add('show');
  } else {
    playChat();
  }
}

const shopping = {
  message: 'Hi! Want to see what’s fresh from the farm today?',
  options: [['See today’s harvest', {
    message: 'Today’s harvest box has bok choy, cherry tomatoes and mixed greens for S$12.',
    options: [['Order a harvest box', {
      message: 'Would you like to pick up your box or have it delivered?',
      options: [
        ['Farm pickup', { message: 'Order preview complete for farm pickup. You earned 25 points!', reward: true }],
        ['Delivery', { message: 'Order preview complete with delivery selected. You earned 25 points!', reward: true }]
      ]
    }]]
  }]]
};

const farmSales = {
  message: 'See how Evercrop can handle everyday sales messages while you grow.',
  options: [
    ['Show a stock question', { message: 'Customer: Do you have bok choy today?\n\nAssistant: Yes, bok choy is available in today’s harvest box. Want to reserve one?' }],
    ['Show order handoff', { message: 'Order summary: 1 harvest box, S$12, pickup Saturday. The farm has the details it needs to prepare the box.' }]
  ]
};

function appendMessage(content, outgoing = false) {
  const bubble = document.createElement('p');
  bubble.textContent = content;
  if (outgoing) bubble.classList.add('outgoing');
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function showStep(step, start) {
  appendMessage(step.message);
  if (step.reward) addPoints();
  const options = step.options ?? [['Start again', start]];
  replies.replaceChildren();
  for (const [label, next] of options) {
    const button = document.createElement('button');
    button.className = 'button secondary';
    button.textContent = label;
    button.addEventListener('click', () => {
      if (next === start) {
        messages.replaceChildren();
      } else {
        appendMessage(label, true);
      }
      showStep(next, start);
      replies.querySelector('button').focus({ preventScroll: true });
    });
    replies.append(button);
  }
}

for (const trigger of document.querySelectorAll('[data-chat]')) {
  trigger.addEventListener('click', () => {
    const start = trigger.dataset.chat === 'shop' ? shopping : farmSales;
    messages.replaceChildren();
    showStep(start, start);
    demo.showModal();
  });
}

grow.addEventListener('click', addPoints);
