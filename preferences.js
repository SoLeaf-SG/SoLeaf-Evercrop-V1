(() => {
  const field = (id) => document.getElementById(id);
  const preferencesForm = field('preferences-form');
  const profileForm = field('profile-form');
  const dialog = field('profile-dialog');
  const availableOnly = field('available-only');
  const promotions = field('prefer-promotions');
  const picks = field('prefer-picks');
  const language = field('prefer-language');
  const profileError = field('profile-error');
  const preferencesStatus = field('preferences-status');
  const profileFields = ['name', 'email', 'mobile', 'street', 'unit', 'postal'];

  let shopper;
  let storageKey;
  let settings;

  function savedSettings() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || 'null') ?? {
        available: !shopper && localStorage.getItem('evercrop.shop.availableOnly') === 'true'
      };
    } catch {
      return {};
    }
  }

  function save(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
    settings = next;
  }

  function profile() {
    return { name: shopper?.name || 'Evercrop shopper', email: shopper?.email || '', ...settings.profile };
  }

  function renderAvatar(prefix, data) {
    const image = field(prefix + '-image');
    const initials = field(prefix + '-initials');
    initials.textContent = data.name.trim().split(/\s+/).slice(0, 2)
      .map((word) => Array.from(word)[0]?.toLocaleUpperCase()).join('') || 'EC';
    if (data.photo) image.src = data.photo;
    else image.removeAttribute('src');
    image.hidden = !data.photo;
    initials.hidden = Boolean(data.photo);
  }

  function renderProfile() {
    const data = profile();
    renderAvatar('profile', data);
    field('profile-name').textContent = data.name;
    field('profile-contact').textContent = [data.email, data.mobile].filter(Boolean).join(' · ') || 'No contact details added';
    field('profile-address').textContent = [data.street, data.unit, data.postal].filter(Boolean).join(', ') || 'No delivery address added';
  }

  function renderPreferences() {
    availableOnly.checked = Boolean(settings.available);
    promotions.checked = Boolean(settings.promotions);
    picks.checked = Boolean(settings.picks);
    language.value = settings.language || 'en';
    if (!language.value) language.value = 'en';
    filter.value = availableOnly.checked ? 'available' : 'all';
    renderStock();

    const rows = [
      ['WhatsApp promotions', promotions.checked ? 'On' : 'Off'],
      ['Personalised picks', picks.checked ? 'On' : 'Off'],
      ['Preferred language', language.selectedOptions[0].textContent],
      ['Catalogue default', availableOnly.checked ? 'Available only' : 'All produce']
    ];
    field('preference-summary-list').replaceChildren(...rows.map(([label, value]) => {
      const item = document.createElement('li');
      const title = document.createElement('span');
      const detail = document.createElement('strong');
      title.textContent = label;
      detail.textContent = value;
      item.append(title, detail);
      return item;
    }));
    field('preference-updated').textContent = settings.updated
      ? `Saved on this device · ${new Date(settings.updated).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })}`
      : 'Preferences are saved on this device.';
  }

  function load(account) {
    const nextKey = account ? `evercrop.shop.settings:${account.email}` : 'evercrop.shop.settings:guest';
    if (nextKey === storageKey) return;
    if (dialog.open) dialog.close();
    shopper = account;
    storageKey = nextKey;
    settings = savedSettings();
    preferencesStatus.textContent = '';
    renderPreferences();
    renderProfile();
  }

  preferencesForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      save({
        ...settings,
        available: availableOnly.checked,
        promotions: promotions.checked,
        picks: picks.checked,
        language: language.value,
        updated: new Date().toISOString()
      });
      renderPreferences();
      preferencesStatus.textContent = 'Preferences saved.';
    } catch {
      preferencesStatus.textContent = 'Your browser could not save these preferences.';
    }
  });
  preferencesForm.addEventListener('input', () => { preferencesStatus.textContent = ''; });

  field('open-profile').addEventListener('click', () => {
    const data = profile();
    profileForm.reset();
    for (const name of profileFields) field('edit-' + name).value = data[name] || '';
    renderAvatar('edit', data);
    profileError.textContent = '';
    dialog.showModal();
  });
  field('cancel-profile').addEventListener('click', () => dialog.close());

  async function squarePhoto(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error('Choose a JPG or PNG under 5 MB.');
    }
    let image;
    try {
      image = await createImageBitmap(file);
    } catch {
      throw new Error('This photo could not be opened. Try another JPG or PNG.');
    }
    try {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 192;
      canvas.getContext('2d').drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 192, 192);
      return canvas.toDataURL('image/jpeg', 0.86);
    } finally {
      image.close();
    }
  }

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.submitter || profileForm.querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true;
    profileError.textContent = '';
    try {
      const identity = storageKey;
      const details = Object.fromEntries(profileFields.map((name) => [name, field('edit-' + name).value.trim()]));
      if (!details.name) throw new Error('Enter a display name.');
      const file = field('profile-upload').files[0];
      const photo = file ? await squarePhoto(file) : profile().photo;
      if (!dialog.open || identity !== storageKey) return;
      save({ ...settings, profile: { ...details, photo } });
      renderProfile();
      dialog.close();
    } catch (error) {
      profileError.textContent = error instanceof DOMException ? 'Your browser could not save this profile.' : error.message;
    } finally {
      submit.disabled = false;
    }
  });

  load(null);
  window.addEventListener('evercrop:shopper', (event) => load(event.detail));
})();
