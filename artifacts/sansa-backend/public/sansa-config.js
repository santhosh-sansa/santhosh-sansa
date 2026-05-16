const SANSA_HOST = window.location.hostname.replace(/^www\./, '');
const SANSA_API_BASE = SANSA_HOST === '127.0.0.1' || SANSA_HOST === 'localhost'
  ? ''
  : SANSA_HOST === 'sansaai.in'
    ? 'https://api.sansaai.in'
    : window.location.hostname === 'api.sansaai.in'
      ? ''
      : 'https://api.sansaai.in';

// Marketing site: no sign-in / register chrome; tools run as anonymous guest (see SANSA_PUBLIC_AI on API).
const SANSA_DEFAULT_HIDE_AUTH =
  typeof window.__SANSA_HIDE_ACCOUNT_UI__ === 'boolean'
    ? window.__SANSA_HIDE_ACCOUNT_UI__
    : SANSA_HOST === 'sansaai.in';

window.__SANSA_CONFIG__ = {
  apiBaseUrl: SANSA_API_BASE,
  adminUrl: 'https://api.sansaai.in/admin/',
  hideAccountUi: SANSA_DEFAULT_HIDE_AUTH,
  ...(window.__SANSA_CONFIG__ || {}),
};
