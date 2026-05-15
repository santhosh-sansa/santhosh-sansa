const SANSA_HOST = window.location.hostname.replace(/^www\./, '');
const SANSA_API_BASE = SANSA_HOST === '127.0.0.1' || SANSA_HOST === 'localhost'
  ? ''
  : SANSA_HOST === 'sansaai.in'
    ? 'https://api.sansaai.in'
    : window.location.hostname === 'api.sansaai.in'
      ? ''
      : 'https://api.sansaai.in';

window.__SANSA_CONFIG__ = window.__SANSA_CONFIG__ || {
  apiBaseUrl: SANSA_API_BASE,
  adminUrl: 'https://api.sansaai.in/admin/',
};
