(() => {
  const accountsKey = 'evercrop.demo.accounts';
  const sessionKey = 'evercrop.demo.session';
  const field = (id) => document.getElementById(id);
  const form = field('account-form');
  const resetForm = field('reset-form');
  const status = field('account-status');
  const view = document.body.dataset.accountView;
  let resetRequest;

  function accounts() {
    return JSON.parse(localStorage.getItem(accountsKey) || '[]');
  }

  function saveAccounts(records) {
    localStorage.setItem(accountsKey, JSON.stringify(records));
  }

  function emailAddress() {
    return field('account-email').value.trim().toLowerCase();
  }

  async function passwordHash(password, salt) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({
      name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt), iterations: 600000
    }, key, 256);
    return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function newPassword() {
    const password = field('account-password').value;
    if (password !== field('account-confirm').value) throw new Error('Passwords must match.');
    if (password.length < 8) throw new Error('Use at least 8 characters for your password.');
    return password;
  }

  async function credentials(password) {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
    return { salt, hash: await passwordHash(password, salt), version: crypto.randomUUID() };
  }

  function enterShop(account) {
    sessionStorage.setItem(sessionKey, JSON.stringify({ email: account.email, version: account.version }));
    window.location.assign('shop.html');
  }

  function handleSubmit(target, action) {
    target.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = target.querySelector('[type="submit"]');
      if (submit.disabled) return;
      submit.disabled = true;
      status.textContent = '';
      try {
        if (!globalThis.crypto?.subtle) throw new Error('Open Evercrop on localhost or HTTPS to use accounts.');
        await action();
      } catch (error) {
        status.textContent = error instanceof DOMException || error instanceof SyntaxError
          ? 'Account storage is unavailable. Try a regular browser window.'
          : error.message;
      } finally {
        submit.disabled = false;
      }
    });
  }

  async function register() {
    const name = field('account-name').value.trim();
    if (!name) throw new Error('Enter your name.');
    const email = emailAddress();
    const password = newPassword();
    const details = await credentials(password);
    const records = accounts();
    if (records.some((account) => account.email === email)) {
      throw new Error('This email already has an account. Sign in or reset your password.');
    }
    const account = { name, email, ...details };
    records.push(account);
    saveAccounts(records);
    enterShop(account);
  }

  async function signIn() {
    const email = emailAddress();
    const account = accounts().find((record) => record.email === email);
    const password = field('account-password').value;
    if (!account || await passwordHash(password, account.salt) !== account.hash) {
      throw new Error('The email or password is incorrect.');
    }
    enterShop(account);
  }

  function requestReset() {
    const account = accounts().find((record) => record.email === emailAddress());
    if (!account) throw new Error('No account with that email exists in this browser.');
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    const code = String(100000 + random % 900000);
    resetRequest = { email: account.email, version: account.version, code, expires: Date.now() + 600000 };
    field('reset-code').textContent = `Reset code: ${code}. It expires in 10 minutes.`;
    form.hidden = true;
    resetForm.hidden = false;
    field('account-code').focus();
  }

  async function resetPassword() {
    const request = resetRequest;
    if (!request || Date.now() >= request.expires) throw new Error('Request a new reset code to continue.');
    if (field('account-code').value !== request.code) throw new Error('Enter the reset code shown above.');
    const details = await credentials(newPassword());
    if (resetRequest !== request) return;
    const records = accounts();
    const account = records.find((record) => record.email === request.email && record.version === request.version);
    if (!account) throw new Error('This reset request is no longer valid. Request a new code.');
    Object.assign(account, details);
    saveAccounts(records);
    const session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
    if (session?.email === account.email) sessionStorage.removeItem(sessionKey);
    resetRequest = undefined;
    resetForm.reset();
    field('reset-code').textContent = '';
    resetForm.hidden = true;
    status.textContent = 'Password updated. Use your new password to sign in.';
    document.querySelector('.account-footer a').focus();
  }

  function showShopAccount() {
    const signInLink = field('shop-sign-in');
    const signOut = field('shop-sign-out');
    const welcome = field('shop-account');
    const accountLink = field('shop-account-link');
    if (!signInLink && !signOut) return;

    function render() {
      let account;
      try {
        const session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
        account = session && accounts().find((record) => record.email === session.email && record.version === session.version);
      } catch {
        // The public stock view remains usable when browser storage is unavailable.
      }
      if (signInLink) signInLink.hidden = Boolean(account);
      if (accountLink) accountLink.hidden = !account;
      if (welcome) {
        window.dispatchEvent(new CustomEvent('evercrop:shopper', { detail: account ? { name: account.name, email: account.email } : null }));
        welcome.hidden = !account;
        welcome.textContent = account ? `Signed in as ${account.name}.` : '';
      }
    }

    signOut?.addEventListener('click', () => {
      sessionStorage.removeItem(sessionKey);
    });
    window.addEventListener('pageshow', render);
    window.addEventListener('storage', render);
    render();
  }

  if (form) {
    handleSubmit(form, { login: signIn, register, 'forgot-password': requestReset }[view]);
  }
  if (resetForm) {
    handleSubmit(resetForm, resetPassword);
    field('reset-restart').addEventListener('click', () => {
      resetRequest = undefined;
      resetForm.reset();
      field('reset-code').textContent = '';
      resetForm.hidden = true;
      form.hidden = false;
      status.textContent = '';
      field('account-email').focus();
    });
  }
  showShopAccount();
})();
