// Marketing site: no sign-in / register chrome; tools run as anonymous guest (see SANSA_PUBLIC_AI on API).
// Spread first so we never let a pre-set __SANSA_CONFIG__ re-enable login on sansaai.in unless explicitly requested.
const SANSA_HOST = window.location.hostname.replace(/^www\./, '');
const SANSA_API_BASE = SANSA_HOST === '127.0.0.1' || SANSA_HOST === 'localhost'
  ? ''
  : SANSA_HOST === 'sansaai.in'
    ? 'https://api.sansaai.in'
    : window.location.hostname === 'api.sansaai.in'
      ? ''
      : 'https://api.sansaai.in';

window.__SANSA_CONFIG__ = {
  ...(window.__SANSA_CONFIG__ || {}),
  apiBaseUrl: SANSA_API_BASE,
  adminUrl: 'https://api.sansaai.in/admin/',
};

const explicitShowAccounts = window.__SANSA_SHOW_ACCOUNT_UI__ === true;
const explicitHide = typeof window.__SANSA_HIDE_ACCOUNT_UI__ === 'boolean' ? window.__SANSA_HIDE_ACCOUNT_UI__ : null;

if (SANSA_HOST === 'sansaai.in' && !explicitShowAccounts) {
  window.__SANSA_CONFIG__.hideAccountUi = explicitHide !== null ? explicitHide : true;
} else if (explicitHide !== null) {
  window.__SANSA_CONFIG__.hideAccountUi = explicitHide;
} else {
  window.__SANSA_CONFIG__.hideAccountUi = Boolean(window.__SANSA_CONFIG__.hideAccountUi);
}
