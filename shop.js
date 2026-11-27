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

  function ask(question) {
    if (!question.trim()) return;
    const outgoing = document.createElement('p');
    outgoing.className = 'customer-question';
    outgoing.textContent = question.trim();
    const reply = document.createElement('p');
    reply.textContent = answer(question);
    messages.append(outgoing, reply);
    messages.scrollTop = messages.scrollHeight;
    questionInput.value = '';
    questionInput.focus({ preventScroll: true });
  }

  document.querySelector('#ask-form').addEventListener('submit', (event) => {
    event.preventDefault();
    ask(questionInput.value);
  });
  for (const button of document.querySelectorAll('.ask-prompts button')) {
    button.addEventListener('click', () => ask(button.textContent));
  }

})();
