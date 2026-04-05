const LANGUAGES = [
  { code: 'en', name: '🇬🇧 English' },
  { code: 'af', name: '🇿🇦 Afrikaans' },
  { code: 'sq', name: '🇦🇱 Albanian' },
  { code: 'ar', name: '🇸🇦 Arabic' },
  { code: 'hy', name: '🇦🇲 Armenian' },
  { code: 'az', name: '🇦🇿 Azerbaijani' },
  { code: 'bn', name: '🇧🇩 Bengali' },
  { code: 'bs', name: '🇧🇦 Bosnian' },
  { code: 'bg', name: '🇧🇬 Bulgarian' },
  { code: 'zh-CN', name: '🇨🇳 Chinese (Simplified)' },
  { code: 'zh-TW', name: '🇹🇼 Chinese (Traditional)' },
  { code: 'hr', name: '🇭🇷 Croatian' },
  { code: 'cs', name: '🇨🇿 Czech' },
  { code: 'da', name: '🇩🇰 Danish' },
  { code: 'nl', name: '🇳🇱 Dutch' },
  { code: 'et', name: '🇪🇪 Estonian' },
  { code: 'fi', name: '🇫🇮 Finnish' },
  { code: 'fr', name: '🇫🇷 French' },
  { code: 'ka', name: '🇬🇪 Georgian' },
  { code: 'de', name: '🇩🇪 German' },
  { code: 'el', name: '🇬🇷 Greek' },
  { code: 'gu', name: '🇮🇳 Gujarati' },
  { code: 'ht', name: '🇭🇹 Haitian Creole' },
  { code: 'he', name: '🇮🇱 Hebrew' },
  { code: 'hi', name: '🇮🇳 Hindi' },
  { code: 'hu', name: '🇭🇺 Hungarian' },
  { code: 'is', name: '🇮🇸 Icelandic' },
  { code: 'id', name: '🇮🇩 Indonesian' },
  { code: 'ga', name: '🇮🇪 Irish' },
  { code: 'it', name: '🇮🇹 Italian' },
  { code: 'ja', name: '🇯🇵 Japanese' },
  { code: 'kn', name: '🇮🇳 Kannada' },
  { code: 'kk', name: '🇰🇿 Kazakh' },
  { code: 'ko', name: '🇰🇷 Korean' },
  { code: 'lv', name: '🇱🇻 Latvian' },
  { code: 'lt', name: '🇱🇹 Lithuanian' },
  { code: 'mk', name: '🇲🇰 Macedonian' },
  { code: 'ms', name: '🇲🇾 Malay' },
  { code: 'ml', name: '🇮🇳 Malayalam' },
  { code: 'mt', name: '🇲🇹 Maltese' },
  { code: 'mr', name: '🇮🇳 Marathi' },
  { code: 'mn', name: '🇲🇳 Mongolian' },
  { code: 'ne', name: '🇳🇵 Nepali' },
  { code: 'no', name: '🇳🇴 Norwegian' },
  { code: 'fa', name: '🇮🇷 Persian' },
  { code: 'pl', name: '🇵🇱 Polish' },
  { code: 'pt', name: '🇵🇹 Portuguese' },
  { code: 'pa', name: '🇮🇳 Punjabi' },
  { code: 'ro', name: '🇷🇴 Romanian' },
  { code: 'ru', name: '🇷🇺 Russian' },
  { code: 'sr', name: '🇷🇸 Serbian' },
  { code: 'sk', name: '🇸🇰 Slovak' },
  { code: 'sl', name: '🇸🇮 Slovenian' },
  { code: 'es', name: '🇪🇸 Spanish' },
  { code: 'sw', name: '🇰🇪 Swahili' },
  { code: 'sv', name: '🇸🇪 Swedish' },
  { code: 'tl', name: '🇵🇭 Filipino' },
  { code: 'ta', name: '🇮🇳 Tamil' },
  { code: 'te', name: '🇮🇳 Telugu' },
  { code: 'th', name: '🇹🇭 Thai' },
  { code: 'tr', name: '🇹🇷 Turkish' },
  { code: 'uk', name: '🇺🇦 Ukrainian' },
  { code: 'ur', name: '🇵🇰 Urdu' },
  { code: 'vi', name: '🇻🇳 Vietnamese' },
  { code: 'cy', name: '🏴 Welsh' },
];

// Set cookie helper — sets on both root and current domain
function setGoogTransCookie(code) {
  const val = code === 'en' ? '' : `/en/${code}`;
  const expires = code === 'en' ? 'Thu, 01 Jan 1970 00:00:00 GMT' : '';
  const expStr = expires ? `; expires=${expires}` : '';
  document.cookie = `googtrans=${val}; path=/${expStr}`;
  document.cookie = `googtrans=${val}; domain=${location.hostname}; path=/${expStr}`;
}

// Read current lang from cookie
function getCurrentLang() {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : 'en';
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: LANGUAGES.map(l => l.code).join(','),
    autoDisplay: false
  }, 'google_translate_element');
}

function buildLangSelector() {
  // Inject Google Translate script into head
  if (!document.getElementById('gt-script')) {
    const s = document.createElement('script');
    s.id = 'gt-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(s);
  }

  const currentCode = getCurrentLang();
  const currentLang = LANGUAGES.find(l => l.code === currentCode) || LANGUAGES[0];
  const label = currentCode === 'en' ? 'EN' : currentCode.toUpperCase().slice(0, 2);

  const wrapper = document.createElement('div');
  wrapper.id = 'lang-selector';
  wrapper.innerHTML = `
    <button id="lang-btn" onclick="toggleLangMenu()" title="Translate">
      🌐 <span id="lang-current">${label}</span> ▾
    </button>
    <div id="lang-menu">
      <input id="lang-search" type="text" placeholder="🔍 Search language..." oninput="filterLangs(this.value)" autocomplete="off"/>
      <div id="lang-list"></div>
    </div>
    <div id="google_translate_element" style="display:none;"></div>
  `;
  document.body.appendChild(wrapper);

  renderLangList(LANGUAGES, currentCode);

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) document.getElementById('lang-menu').classList.remove('open');
  });
}

function renderLangList(langs, activeLang) {
  const current = activeLang || getCurrentLang();
  document.getElementById('lang-list').innerHTML = langs.map(l =>
    `<div class="lang-item${l.code === current ? ' active' : ''}" onclick="selectLang('${l.code}')">${l.name}</div>`
  ).join('');
}

function filterLangs(q) {
  renderLangList(LANGUAGES.filter(l => l.name.toLowerCase().includes(q.toLowerCase())));
}

function toggleLangMenu() {
  const menu = document.getElementById('lang-menu');
  menu.classList.toggle('open');
  if (menu.classList.contains('open')) {
    document.getElementById('lang-search').value = '';
    renderLangList(LANGUAGES, getCurrentLang());
    setTimeout(() => document.getElementById('lang-search').focus(), 50);
  }
}

function selectLang(code) {
  document.getElementById('lang-menu').classList.remove('open');

  if (code === 'en') {
    // Reset to English — clear cookie and reload
    setGoogTransCookie('en');
    location.reload();
    return;
  }

  document.getElementById('lang-current').textContent = code.toUpperCase().slice(0, 2);

  // Try using the live Google Translate widget first
  function tryWidget(attempts) {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
      setGoogTransCookie(code); // also save so it persists on next page
    } else if (attempts > 0) {
      setTimeout(() => tryWidget(attempts - 1), 200);
    } else {
      // Widget never loaded — use cookie + reload (100% reliable fallback)
      setGoogTransCookie(code);
      location.reload();
    }
  }
  tryWidget(15);
}

document.addEventListener('DOMContentLoaded', buildLangSelector);
