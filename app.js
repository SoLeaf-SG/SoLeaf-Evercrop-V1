const demo = document.querySelector('#demo');
const messages = document.querySelector('#messages');
const replies = document.querySelector('#replies');
const grow = document.querySelector('#grow');
const pointsLabel = document.querySelector('#points');
const progress = document.querySelector('#progress');
const stage = document.querySelector('#stage');
const tree = document.querySelector('#tree');
let points = 0;

function addPoints() {
  points = Math.min(points + 25, 100);
  const [name, symbol] = points >= 100 ? ['Full canopy', '🌳']
    : points >= 50 ? ['Sapling', '🌿'] : ['Seedling', '🌱'];
  stage.textContent = name;
  tree.textContent = symbol;
  progress.value = points;
  pointsLabel.textContent = `${points} / 100 pts`;
  if (points === 100) {
    grow.textContent = 'Tree fully grown';
    grow.disabled = true;
  }
}

const shopping = {
  message: 'Hi! Want to see what’s fresh from the farm today?',
  options: [['See today’s harvest', {
    message: 'Today’s sample harvest box has bok choy, cherry tomatoes and mixed greens for S$12.',
    options: [['Order a harvest box', {
      message: 'Would you like to pick up your box or have it delivered?',
      options: [
        ['Farm pickup', { message: 'Sample order complete for farm pickup. You earned 25 demo points!', reward: true }],
        ['Delivery', { message: 'Sample order complete with delivery selected. You earned 25 demo points!', reward: true }]
      ]
    }]]
  }]]
};

const farmSales = {
  message: 'See how Evercrop can handle everyday sales messages while you grow.',
  options: [
    ['Show a stock question', { message: 'Customer: Do you have bok choy today?\n\nAssistant: Yes, bok choy is available in today’s harvest box. Want to reserve one?' }],
    ['Show order handoff', { message: 'Sample order for the farm: 1 harvest box, S$12, pickup Saturday. The farm has the details it needs to prepare the box.' }]
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
