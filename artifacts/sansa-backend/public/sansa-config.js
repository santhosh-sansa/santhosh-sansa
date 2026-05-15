const SANSA_HOST = window.location.hostname.replace(/^www\./, '');
const SANSA_API_BASE = SANSA_HOST === '127.0.0.1' || SANSA_HOST === 'localhost'
  ? ''
  : SANSA_HOST === 'sansaai.in'
    ? 'https://api.sansaai.in'
    : window.location.hostname === 'api.sansaai.in'
      ? ''
      : 'https://api.sansaai.in';

/** Set `window.__SANSA_HIDE_ACCOUNT_UI__ = false` before this script to force accounts UI on sansaai.in. */
const SANSA_DEFAULT_HIDE_ACCOUNTS =
  typeof window.__SANSA_HIDE_ACCOUNT_UI__ === 'boolean'
    ? window.__SANSA_HIDE_ACCOUNT_UI__
    : SANSA_HOST === 'sansaai.in';

window.__SANSA_CONFIG__ = {
  apiBaseUrl: SANSA_API_BASE,
  adminUrl: 'https://api.sansaai.in/admin/',
  hideAccountUi: SANSA_DEFAULT_HIDE_ACCOUNTS,
  ...(window.__SANSA_CONFIG__ || {}),
};
