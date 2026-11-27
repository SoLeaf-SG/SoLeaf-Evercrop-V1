// Evercrop public help chat: a floating button plus a scripted FAQ assistant.
// shortcut: keyword matching, not a real AI model; swap matchAnswer() for an API call when the backend exists.
(() => {
  const FAQ = [
    { keys: ['what is', 'evercrop', 'about', 'who are'], answer: 'Evercrop lets you buy fresh veg straight from Singapore farms by chatting with them on WhatsApp — no middleman, and every order grows your virtual tree.' },
    { keys: ['order', 'buy', 'how do i', 'how to'], answer: 'Message the farm on WhatsApp, pick what you want from today’s harvest, and the farm’s assistant confirms your order and total. That’s it — no app to download.' },
    { keys: ['price', 'cheap', 'cost', 'expensive', 'save'], answer: 'You pay the farm’s own price. Because there’s no wholesaler or supermarket in between, it’s usually lower than retail.' },
    { keys: ['deliver', 'pickup', 'pick up', 'collect', 'shipping'], answer: 'Each farm sets its own options — most offer pickup at the farm, and some deliver. The assistant tells you what’s available when you order.' },
    { keys: ['pay', 'paynow', 'payment', 'cash', 'card'], answer: 'You pay the farm directly, usually by PayNow or at pickup. Evercrop doesn’t take a cut from shoppers.' },
    { keys: ['point', 'tree', 'reward', 'free', 'harvest pack'], answer: 'Every order earns points that water your virtual tree. Grow it to full size (100 points) and the farm sends you a free harvest pack.', link: ['Try the tree', 'index.html#rewards'] },
    { keys: ['which farm', 'where', 'location', 'near'], answer: 'We’re starting with a small group of farms around Lim Chu Kang, Kranji and Sungei Tengah. More are joining during our pilot.' },
    { keys: ['farm', 'sell', 'grower', 'join', 'pilot', 'subscription', 'partner'], answer: 'Farms get an AI sales assistant on WhatsApp that answers stock and price questions 24/7 and turns chats into orders. We’re onboarding pilot farms now.', link: ['Join the pilot', 'contact.html'] },
    { keys: ['account', 'sign up', 'register', 'login', 'sign in'], answer: 'Create a free shopper account to track orders and grow your tree.', link: ['Create account', 'register.html'] },
    { keys: ['human', 'contact', 'email', 'talk', 'help', 'support'], answer: 'Happy to connect you with the SoLeaf team.', link: ['Contact us', 'contact.html'] },
    { keys: ['hi', 'hello', 'hey'], answer: 'Hi there! 👋 Ask me anything about ordering, prices, rewards or selling as a farm.' }
  ];
  const FALLBACK = { answer: 'Good question — I don’t have that one yet. Our team can help.', link: ['Contact us', 'contact.html'] };
  const CHIPS = ['What is Evercrop?', 'How do I order?', 'How do points work?', 'I run a farm'];

  function matchAnswer(text) {
    const q = text.toLowerCase();
    // Score by number of keyword hits so "how do I order" beats a lone "hi".
    let best = null;
    let bestScore = 0;
    for (const item of FAQ) {
      const score = item.keys.filter((k) => (k.length <= 3 ? new RegExp(`\\b${k}\\b`).test(q) : q.includes(k))).length;
      if (score > bestScore) [best, bestScore] = [item, score];
    }
    return best || FALLBACK;
  }

  // Self-check: core routing stays correct as the FAQ list changes.
  console.assert(matchAnswer('How do I order veg?') === FAQ[1], 'faq-bot: order routing');
  console.assert(matchAnswer('I own a farm, can I sell?') === FAQ[7], 'faq-bot: farm routing');
  console.assert(matchAnswer('zzz') === FALLBACK, 'faq-bot: fallback');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('has-help');

  const fab = document.createElement('button');
  fab.className = 'help-fab';
  fab.type = 'button';
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'help-panel');
  fab.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg><span class="sr-only">Ask Evercrop</span>';

  const panel = document.createElement('section');
  panel.className = 'help-panel';
  panel.id = 'help-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Ask Evercrop');
  panel.innerHTML = `
    <header class="help-head">
      <span class="help-av" aria-hidden="true">E</span>
      <div><b>Ask Evercrop</b><small>Usually replies instantly</small></div>
      <button class="help-close" type="button" aria-label="Close chat">×</button>
    </header>
    <div class="help-log" role="log" aria-live="polite"></div>
    <div class="help-chips"></div>
    <form class="help-form">
      <label class="sr-only" for="help-input">Your question</label>
      <input id="help-input" autocomplete="off" maxlength="200" placeholder="Ask a question…">
      <button type="submit" aria-label="Send"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
    </form>`;
  document.body.append(panel, fab);

  const log = panel.querySelector('.help-log');
  const chips = panel.querySelector('.help-chips');
  const form = panel.querySelector('.help-form');
  const input = panel.querySelector('#help-input');

  function say(text, from, link) {
    const msg = document.createElement('div');
    msg.className = `help-msg ${from}`;
    msg.textContent = text;
    if (link) {
      const a = document.createElement('a');
      a.href = link[1];
      a.textContent = `${link[0]} →`;
      msg.append(document.createElement('br'), a);
    }
    log.append(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  }

  function ask(question) {
    say(question, 'me');
    const typing = say('', 'bot typing');
    typing.innerHTML = '<i></i><i></i><i></i>';
    const reply = matchAnswer(question);
    setTimeout(() => {
      typing.remove();
      say(reply.answer, 'bot', reply.link);
    }, reduceMotion ? 0 : 650);
  }

  for (const label of CHIPS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = label;
    chip.addEventListener('click', () => ask(label));
    chips.append(chip);
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    fab.classList.toggle('open', open);
    if (open) {
      if (!log.childElementCount) say('Hi! 👋 I’m the Evercrop assistant. What would you like to know?', 'bot');
      input.focus();
    }
  }

  fab.addEventListener('click', () => setOpen(panel.hidden));
  panel.querySelector('.help-close').addEventListener('click', () => {
    setOpen(false);
    fab.focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      fab.focus();
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = '';
    ask(question);
  });
})();
