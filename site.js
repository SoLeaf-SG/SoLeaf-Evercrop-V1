const backTop = document.querySelector('.back-top');
const pageHeader = document.querySelector('#top');

function updateHeaderHeight() {
  document.documentElement.style.setProperty('--header-height', `${pageHeader.offsetHeight}px`);
}

updateHeaderHeight();
new ResizeObserver(updateHeaderHeight).observe(pageHeader);

function updateBackTop() {
  backTop.hidden = window.scrollY <= 320;
}

window.addEventListener('scroll', updateBackTop, { passive: true });
updateBackTop();

backTop.addEventListener('click', () => {
  pageHeader.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const result = document.querySelector('#contact-result');
  const draft = document.querySelector('#contact-draft');
  const value = (id) => document.getElementById(id).value.trim();

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const subject = value('topic') + ' · Evercrop';
    const body = `${value('contact-message')}\n\n${value('contact-name')}\n${value('contact-email')}`;
    draft.href = `mailto:${contactForm.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    draft.hidden = false;
    result.textContent = 'Draft ready. Open it in your email app to send it.';
    draft.focus();
  });

  contactForm.addEventListener('input', () => {
    draft.hidden = true;
    draft.removeAttribute('href');
    result.textContent = '';
  });
}
