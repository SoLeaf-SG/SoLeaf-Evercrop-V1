/* EverCrop — prototype auth (browser-only).
   shortcut: accounts live in localStorage with a SHA-256 hash — NOT real security; replace with a backend before any real user data. */

const USERS_KEY = 'ec_users', SESSION_KEY = 'ec_session';
const DEMO = [
  { email: 'farm@demo.sg', name: 'Mei Ling Tan', role: 'farm', farm: 'Kranji Greens', password: 'evercrop123' },
  { email: 'shopper@demo.sg', name: 'Aaron Lim', role: 'shopper', password: 'evercrop123' }
];

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked: session won't persist */ } };
async function hash(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function users() {
  const u = read(USERS_KEY, {});
  for (const d of DEMO) if (!u[d.email]) { const { password, ...rest } = d; u[d.email] = { ...rest, pw: await hash(password) }; }
  write(USERS_KEY, u);
  return u;
}
const portalFor = role => role === 'farm' ? 'portal-farm.html' : 'portal-shopper.html';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(input, msg) {
  const err = input.closest('.field').querySelector('.err');
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (err) err.textContent = msg || '';
  return !msg;
}
function note(form, msg, isError) {
  const n = form.querySelector('[data-note]');
  n.hidden = !msg; n.textContent = msg || ''; n.classList.toggle('error', !!isError);
}

/* Role toggle (register + login) */
function initRole(form) {
  const btns = form.querySelectorAll('.role-toggle button');
  if (!btns.length) return () => 'shopper';
  let role = new URLSearchParams(location.search).get('role') === 'farm' ? 'farm' : 'shopper';
  const apply = () => {
    btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.role === role));
    form.querySelectorAll('[data-farm-only]').forEach(el => {
      el.hidden = role !== 'farm';
      el.querySelectorAll('input').forEach(i => i.required = role === 'farm');
    });
  };
  btns.forEach(b => b.addEventListener('click', () => { role = b.dataset.role; apply(); }));
  apply();
  return () => role;
}

async function onLogin(form) {
  const email = form.email.value.trim().toLowerCase(), pw = form.password.value;
  let ok = setError(form.email, EMAIL_RE.test(email) ? '' : 'Enter a valid email address.');
  ok = setError(form.password, pw ? '' : 'Enter your password.') && ok;
  if (!ok) return;
  const u = (await users())[email];
  if (!u || u.pw !== await hash(pw)) return note(form, 'Email or password is incorrect.', true);
  write(SESSION_KEY, { email, remember: form.remember?.checked });
  location.href = portalFor(u.role);
}

async function onRegister(form, getRole) {
  const role = getRole();
  const name = form.name.value.trim(), email = form.email.value.trim().toLowerCase(), pw = form.password.value;
  let ok = setError(form.name, name ? '' : 'Enter your name.');
  if (role === 'farm') ok = setError(form.farm, form.farm.value.trim() ? '' : 'Enter your farm name.') && ok;
  ok = setError(form.email, EMAIL_RE.test(email) ? '' : 'Enter a valid email address.') && ok;
  ok = setError(form.password, pw.length >= 8 ? '' : 'Use at least 8 characters.') && ok;
  ok = setError(form.confirm, form.confirm.value === pw ? '' : 'Passwords do not match.') && ok;
  if (!form.terms.checked) { note(form, 'Please accept the terms to continue.', true); return; }
  if (!ok) return;
  const all = await users();
  if (all[email]) return setError(form.email, 'An account with this email already exists.');
  all[email] = { email, name, role, farm: role === 'farm' ? form.farm.value.trim() : undefined, pw: await hash(pw) };
  write(USERS_KEY, all);
  write(SESSION_KEY, { email });
  location.href = portalFor(role);
}

async function onForgot(form) {
  const email = form.email.value.trim().toLowerCase();
  if (!setError(form.email, EMAIL_RE.test(email) ? '' : 'Enter a valid email address.')) return;
  // Same message whether or not the account exists, so emails can't be probed.
  note(form, `If ${email} has an EverCrop account, a reset link is on its way. Check your inbox.`);
  form.querySelector('button[type=submit]').textContent = 'Resend link';
}

function onContact(form) {
  const email = form.email.value.trim();
  let ok = setError(form.name, form.name.value.trim() ? '' : 'Enter your name.');
  ok = setError(form.email, EMAIL_RE.test(email) ? '' : 'Enter a valid email address.') && ok;
  ok = setError(form.message, form.message.value.trim().length >= 10 ? '' : 'Tell us a little more (10+ characters).') && ok;
  if (!ok) return;
  // shortcut: nothing is sent — wire to a form backend (e.g. Formspree or own API) before launch
  note(form, `Thanks, ${form.name.value.trim().split(' ')[0]}! We'll reply to ${email} within one working day.`);
  form.reset();
}

/* Password visibility */
document.querySelectorAll('[data-toggle-pw]').forEach(b => b.addEventListener('click', () => {
  const i = b.parentElement.querySelector('input');
  const show = i.type === 'password';
  i.type = show ? 'text' : 'password';
  b.textContent = show ? 'Hide' : 'Show';
  b.setAttribute('aria-pressed', show);
}));

const form = document.querySelector('form[data-form]');
if (form) {
  const getRole = initRole(form);
  form.addEventListener('submit', e => {
    e.preventDefault(); note(form, '');
    ({ login: onLogin, register: onRegister, forgot: onForgot, contact: onContact })[form.dataset.form](form, getRole);
  });
  form.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', () => setError(i, '')));
}

/* Used by portal pages */
window.EC = {
  async current() { const s = read(SESSION_KEY, null); return s && (await users())[s.email] || null; },
  logout() { localStorage.removeItem(SESSION_KEY); location.href = 'login.html'; },
  read, write
};
