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
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactForm.reset();
    result.textContent = 'Enquiry complete. Your message stayed on this page.';
  });
  contactForm.addEventListener('input', () => {
    result.textContent = '';
  });
}
