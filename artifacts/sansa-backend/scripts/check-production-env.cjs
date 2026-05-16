#!/usr/bin/env node
/**
 * Sanity-check env before / after deploy. Loads .env from package root if present.
 *
 * - Default: print warnings, exit 0 (does not block `npm start`).
 * - Strict: set SANSA_FAIL_ON_WEAK_PRODUCTION=1 with NODE_ENV=production to exit 1
 *   when SESSION_SECRET or ADMIN_PASSWORD are still at unsafe defaults.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const strict = String(process.env.SANSA_FAIL_ON_WEAK_PRODUCTION || '') === '1';

const session = String(process.env.SESSION_SECRET || '').trim();
const adminPass = String(process.env.ADMIN_PASSWORD || '').trim();

const BAD_SESSION = new Set([
  '',
  'change-this-session-secret',
  'change-this-long-random-secret',
  'REPLACE_WITH_OPENSSL_RAND_BASE64_48',
]);

const WEAK_ADMIN = new Set(['', 'Admin@123', 'change-this-password', 'REPLACE_WITH_STRONG_PASSWORD']);

const problems = [];

if (!session || BAD_SESSION.has(session) || session.length < 32) {
  problems.push(
    'SESSION_SECRET must be a random string of at least 32 characters (not a placeholder). Example: openssl rand -base64 48',
  );
}

if (WEAK_ADMIN.has(adminPass)) {
  problems.push(
    'ADMIN_PASSWORD must be set to a strong unique value (not Admin@123 or the placeholder).',
  );
}

const cors = String(process.env.CORS_ORIGINS || '').trim();
if (isProd && !cors) {
  problems.push('CORS_ORIGINS should list every browser origin that calls this API (comma-separated).');
}

const base = String(process.env.APP_BASE_URL || '').trim();
if (isProd && !base.startsWith('https://')) {
  problems.push('APP_BASE_URL should be your public https site URL (e.g. https://sansaai.in).');
}

if (problems.length) {
  console.error('\nSANSA environment check — action needed:\n');
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
  console.error('');
  if (isProd && strict) {
    console.error('Exiting with code 1 (SANSA_FAIL_ON_WEAK_PRODUCTION=1 and NODE_ENV=production).\n');
    process.exit(1);
  }
  if (isProd) {
    console.warn(
      'Tip: fix the items above on MilesWeb (Node.js app → Environment Variables), then restart.\n',
    );
  }
} else {
  console.log('SANSA environment check: core secrets look OK for this configuration.\n');
}
