const SANSA_HOST = window.location.hostname.replace(/^www\./, '');
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const SANSA_API_BASE = IS_LOCAL
  ? ''
  : SANSA_HOST === 'sansaai.in'
    ? 'https://api.sansaai.in'
    : window.location.hostname === 'api.sansaai.in'
      ? ''
      : 'https://api.sansaai.in';

const existing = window.__SANSA_CONFIG__ && typeof window.__SANSA_CONFIG__ === 'object' ? window.__SANSA_CONFIG__ : {};
window.__SANSA_CONFIG__ = {
  apiBaseUrl: SANSA_API_BASE,
  adminUrl: IS_LOCAL ? '/admin/' : 'https://api.sansaai.in/admin/',
  ...existing,
};
