(() => {
  const questionInput = document.querySelector('#ask-question');
  const messages = document.querySelector('#ask-messages');

  function answer(question) {
    const text = question.toLowerCase();
    const item = inventory.find((produce) => text.includes(produce.name.toLowerCase()))
      ?? inventory.find((produce) => produce.name.toLowerCase().split(' ')
        .some((word) => word.length > 3 && text.includes(word)));

    if (item) {
      return `${item.name} costs ${dollars.format(item.price)} per ${item.size} pack. ${statusLabels[statusOf(item)]}. ${item.tip}`;
    }
    if (/fresh|stock|available|harvest/.test(text)) {
      return inStock.length
        ? `In stock at Garden Row Farm: ${inStock.map((produce) => produce.name).join(', ')}.`
        : 'Nothing is in stock right now. Check back for the next harvest.';
    }
    if (/cook|recipe|dinner|meal/.test(text) && inStock.length) {
      return `Try ${inStock[0].name.toLowerCase()}. ${inStock[0].tip}`;
    }
    return 'I can look up stock, prices, pack sizes, and cooking ideas. Try asking about bok choy or cherry tomatoes.';
  }

  // Farm portal version: answers business questions from the live demo orders and stock.
  function farmAnswer(question) {
    const text = question.toLowerCase();
    const item = inventory.find((produce) => text.includes(produce.name.toLowerCase()));
    if (item) return `${item.name}: ${item.packs} packs left at ${dollars.format(item.price)} per ${item.size} pack (${statusLabels[statusOf(item)].toLowerCase()}).`;
    if (/low|run|sold out|restock|stock/.test(text)) {
      const watch = inventory.filter((produce) => statusOf(produce) !== 'available');
      return watch.length
        ? `Running low: ${watch.map((produce) => `${produce.name} (${produce.packs} left)`).join(', ')}. Update them in Inventory.`
        : 'Everything has more than five packs. Nothing to restock yet.';
    }
    if (/sale|sell|sold|revenue|money|make|earn|today/.test(text) && !/best|top|popular/.test(text)) {
      const today = orders.filter((order) => order.time.startsWith('Today'));
      return `Today you have ${today.length} WhatsApp orders worth ${dollars.format(today.reduce((sum, order) => sum + orderTotal(order), 0))}.`;
    }
    if (/best|top|popular/.test(text)) {
      const totals = {};
      for (const order of orders) for (const [name, qty] of order.items) totals[name] = (totals[name] || 0) + qty;
      const [name, qty] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || [];
      return name ? `${name} is your best seller so far, with ${qty} packs ordered.` : 'No orders yet to compare.';
    }
    if (/order|new|pack|pickup|deliver/.test(text)) {
      const fresh = orders.filter((order) => order.status === 'new');
      return fresh.length
        ? `${fresh.length} new order${fresh.length > 1 ? 's' : ''} to pack: ${fresh.map((order) => `${order.customer} (${order.method})`).join(', ')}.`
        : 'No new orders right now. Everything is packed.';
    }
    return 'I can tell you what’s running low, today’s sales, new orders, or your best seller. Try one of the buttons above.';
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = () => new Date().toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

  // One chat row: bot rows get the avatar, every bubble gets a timestamp.
  function bubble(text, from) {
    const row = document.createElement('div');
    row.className = `ask-msg ${from}`;
    if (from === 'bot') row.innerHTML = '<span class="ask-av" aria-hidden="true">E</span>';
    const body = document.createElement('p');
    body.textContent = text;
    const time = document.createElement('small');
    time.textContent = clock();
    body.append(time);
    row.append(body);
    messages.append(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  function ask(question) {
    if (!question.trim()) return;
    bubble(question.trim(), 'me');
    const typing = bubble('', 'bot');
    typing.classList.add('typing');
    typing.querySelector('p').innerHTML = '<i></i><i></i><i></i>';
    const reply = (farmView ? farmAnswer : answer)(question);
    setTimeout(() => {
      typing.remove();
      bubble(reply, 'bot');
    }, reduceMotion ? 0 : 600);
    questionInput.value = '';
    questionInput.focus({ preventScroll: true });
  }

  bubble(messages.dataset.greeting, 'bot');

  document.querySelector('#ask-form').addEventListener('submit', (event) => {
    event.preventDefault();
    ask(questionInput.value);
  });
  for (const button of document.querySelectorAll('.ask-prompts button')) {
    button.addEventListener('click', () => ask(button.textContent));
  }

})();
