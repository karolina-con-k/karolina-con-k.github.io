/* LANGUAGE SWITCHER (EN / ES / CAT)

   English is written in the HTML. When Spanish or Catalan is chosen, each
   text that has a translation in js/translations.js is swapped; texts
   without one stay as they are. The choice is remembered between pages and
   visits. On a first visit, a device set to Spanish or Catalan opens the
   site in that language.
*/

(function () {
  const LANGS = ['en', 'es', 'ca'];

  // Texts that can be translated (project titles and names are left out)
  const SELECTOR = [
    'h2:not(.project-nav-title)',
    'h3',
    'p',
    '.project-tag',
    '.footer-tags',
    '.filter-category:not(.filter-toggle)',
    '.filter-toggle-label',
  ].join(', ');

  const normalise = (html) => html.replace(/\s+/g, ' ').trim();

  // English text → { es, ca }
  const dictionary = new Map();
  (window.TRANSLATIONS || []).forEach((entry) => dictionary.set(normalise(entry.en), entry));

  // Remember each element's original English, so switching back is exact.
  // data-en keeps the plain English text (the filters use it to compare)
  const elements = [...document.querySelectorAll(SELECTOR)]
    .filter((el) => !el.querySelector('video, svg, img') && el.textContent.trim())
    .map((el) => {
      el.dataset.en = el.textContent.trim();
      return { el, html: el.innerHTML, key: normalise(el.innerHTML) };
    });

  function setLanguage(lang) {
    if (!LANGS.includes(lang)) lang = 'en';

    elements.forEach(({ el, html, key }) => {
      const entry = dictionary.get(key);
      el.innerHTML = lang !== 'en' && entry && entry[lang] ? entry[lang] : html;
    });

    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-switch button').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.lang === lang);
    });

    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  function initialLanguage() {
    try {
      const saved = localStorage.getItem('lang');
      if (LANGS.includes(saved)) return saved;
    } catch (e) {}
    const device = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase());
    for (const l of device) {
      if (l.startsWith('ca')) return 'ca';
      if (l.startsWith('es')) return 'es';
      if (l.startsWith('en')) return 'en';
    }
    return 'en';
  }

  // Tapping the current language opens / closes the switcher (for touch
  // screens, where there's no hover). Tapping another one picks it and closes
  document.querySelectorAll('.lang-switch').forEach((switcher) => {
    switcher.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.getAttribute('aria-pressed') === 'true') {
          switcher.classList.toggle('is-open');
        } else {
          setLanguage(button.dataset.lang);
          switcher.classList.remove('is-open');
          button.blur();
        }
      });
    });
  });

  // Tapping anywhere else closes it
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.lang-switch.is-open').forEach((switcher) => {
      if (!switcher.contains(e.target)) switcher.classList.remove('is-open');
    });
  });

  setLanguage(initialLanguage());
})();
