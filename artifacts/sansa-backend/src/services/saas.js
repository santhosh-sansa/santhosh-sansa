const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('./db');

const dataDir = path.join(__dirname, '..', '..', 'data');
const usersPath = path.join(dataDir, 'saas-users.json');
const setupPath = path.join(dataDir, 'business-setups.json');
const eventsPath = path.join(dataDir, 'audit-events.json');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function publicUser(user = {}) {
  const planId = String(user.plan_id || user.planId || user.plan || 'free').trim();
  const displayName = String(user.name || user.fullname || user.fullName || '').trim();
  return {
    id: String(user.id || ''),
    email: normalizeEmail(user.email),
    name: displayName,
    fullName: displayName,
    fullname: displayName,
    mobile: String(user.mobile || '').trim(),
    userType: String(user.user_type || user.userType || '').trim(),
    planId,
    plan: user.plan || planId,
    credits: Number.isFinite(Number(user.credits)) ? Number(user.credits) : 50,
    role: user.role || 'owner',
    status: user.status || 'active',
    createdAt: user.created_at || user.createdAt || '',
    updatedAt: user.updated_at || user.updatedAt || '',
  };
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

function warnNonCriticalWrite(error, label) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`SANSA ${label} skipped: ${error.message}`);
  }
}

async function dbFindUser(email) {
  if (!pool) return null;
  const result = await query(
    `SELECT id, email, name, mobile, user_type, plan_id, credits, password_hash, role, status
     FROM app_users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

async function fileFindUser(email) {
  const users = await readJson(usersPath, []);
  return users.find((user) => normalizeEmail(user.email) === email) || null;
}

async function ensureFileDemoUser(email) {
  const normalized = normalizeEmail(email);
  if (normalized !== 'demo@sansaai.in' && normalized !== 'demo@sansai.in') return null;
  const users = await readJson(usersPath, []);
  const existing = users.find((user) => normalizeEmail(user.email) === normalized);
  if (existing) return existing;
  const user = {
    id: `local-demo-${Date.now()}`,
    email: normalized,
    name: 'SANSA Demo User',
    fullname: 'SANSA Demo User',
    mobile: '9999999999',
    userType: 'business-owner',
    user_type: 'business-owner',
    planId: 'Free',
    plan_id: 'Free',
    plan: 'Free',
    credits: 50,
    password_hash: await bcrypt.hash('demo123', 10),
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  users.unshift(user);
  await writeJson(usersPath, users.slice(0, 500));
  return user;
}

async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  return (await dbFindUser(normalized)) || (await fileFindUser(normalized)) || (await ensureFileDemoUser(normalized));
}

async function registerUser({ email, password, name, fullName, fullname, mobile, userType }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !String(password || '').trim()) {
    const error = new Error('Email and password are required.');
    error.status = 422;
    throw error;
  }
  if (await findUserByEmail(normalized)) {
    const error = new Error('Account already exists. Use login.');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  if (pool) {
    const result = await query(
      `INSERT INTO app_users (email, name, mobile, user_type, plan_id, credits, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'free', 50, $5, 'owner', 'active')
       RETURNING id, email, name, mobile, user_type, plan_id, credits, role, status`,
      [normalized, String(name || fullName || fullname || '').trim(), String(mobile || '').trim(), String(userType || 'business-owner').trim(), passwordHash]
    );
    return publicUser(result.rows[0]);
  }

  const users = await readJson(usersPath, []);
  const user = {
    id: `local-${Date.now()}`,
      email: normalized,
      name: String(name || fullName || fullname || '').trim(),
      mobile: String(mobile || '').trim(),
      userType: String(userType || 'business-owner').trim(),
      planId: 'free',
      plan: 'Free',
      credits: 50,
      password_hash: passwordHash,
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  users.unshift(user);
  await writeJson(usersPath, users.slice(0, 500));
  return publicUser(user);
}

async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user || user.status === 'blocked') {
    const error = new Error('Invalid login.');
    error.status = 401;
    throw error;
  }
  const ok = await bcrypt.compare(String(password || ''), user.password_hash || '');
  if (!ok) {
    const error = new Error('Invalid login.');
    error.status = 401;
    throw error;
  }
  return publicUser(user);
}

async function socialLoginUser({ provider, clientId }) {
  const providerKey = String(provider || '').trim().toLowerCase();
  const providerNames = {
    google: 'Google',
    facebook: 'Facebook',
    apple: 'Apple',
    microsoft: 'Microsoft',
  };
  if (!providerNames[providerKey]) {
    const error = new Error('Unsupported sign-in provider.');
    error.status = 422;
    throw error;
  }

  const safeClientId = String(clientId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40) || `guest-${Date.now()}`;
  const email = `public-${providerKey}-${safeClientId}@sansaai.in`;
  const existing = await findUserByEmail(email);
  if (existing && existing.status !== 'blocked') return publicUser(existing);

  const passwordHash = await bcrypt.hash(`sansa-${providerKey}-${Date.now()}`, 10);
  const displayName = `${providerNames[providerKey]} Public User`;
  if (pool) {
    const result = await query(
      `INSERT INTO app_users (email, name, mobile, user_type, plan_id, credits, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'free', 50, $5, 'owner', 'active')
       RETURNING id, email, name, mobile, user_type, plan_id, credits, role, status`,
      [email, displayName, '0000000000', `${providerKey}-public`, passwordHash]
    );
    return publicUser(result.rows[0]);
  }

  const users = await readJson(usersPath, []);
  const user = {
    id: `social-${providerKey}-${Date.now()}`,
    email,
    name: displayName,
    fullname: displayName,
    mobile: '0000000000',
    userType: `${providerKey}-public`,
    user_type: `${providerKey}-public`,
    planId: 'free',
    plan_id: 'free',
    plan: 'Free',
    credits: 50,
    password_hash: passwordHash,
    authProvider: providerKey,
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  users.unshift(user);
  await writeJson(usersPath, users.slice(0, 500));
  return publicUser(user);
}

async function saveBusinessSetup(userId, setup) {
  const safeSetup = {
    businessName: String(setup.businessName || '').trim(),
    contact: String(setup.contact || '').trim(),
    gstin: String(setup.gstin || '').trim(),
    upi: String(setup.upi || '').trim(),
    industry: String(setup.industry || '').trim(),
    language: String(setup.language || 'Tamil + English').trim(),
    invoiceStyle: String(setup.invoiceStyle || 'Modern Pro').trim(),
    updatedAt: new Date().toISOString(),
  };

  if (pool && /^\d+$/.test(String(userId))) {
    await query(
      `INSERT INTO business_setups (user_id, setup_json)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET setup_json = EXCLUDED.setup_json, updated_at = NOW()`,
      [Number(userId), JSON.stringify(safeSetup)]
    );
  } else {
    const setups = await readJson(setupPath, {});
    setups[String(userId)] = safeSetup;
    await writeJson(setupPath, setups);
  }

  return safeSetup;
}

async function getBusinessSetup(userId) {
  if (pool && /^\d+$/.test(String(userId))) {
    const result = await query(
      `SELECT setup_json FROM business_setups WHERE user_id = $1 LIMIT 1`,
      [Number(userId)]
    );
    return result.rows[0]?.setup_json || {};
  }
  const setups = await readJson(setupPath, {});
  return setups[String(userId)] || {};
}

async function recordAuditEvent(userId, eventName, data = {}) {
  const event = {
    userId: String(userId || 'guest'),
    eventName: String(eventName || 'event').slice(0, 80),
    data,
    createdAt: new Date().toISOString(),
  };

  if (pool && /^\d+$/.test(String(userId))) {
    try {
      await query(
        `INSERT INTO audit_events (user_id, event_name, event_json)
         VALUES ($1, $2, $3)`,
        [Number(userId), event.eventName, JSON.stringify(data)]
      );
    } catch (error) {
      warnNonCriticalWrite(error, 'audit database write');
    }
    return event;
  }

  try {
    const events = await readJson(eventsPath, []);
    events.unshift(event);
    await writeJson(eventsPath, events.slice(0, 1000));
  } catch (error) {
    warnNonCriticalWrite(error, 'audit file write');
  }
  return event;
}

async function growthSummary(userId) {
  const events = await readJson(eventsPath, []);
  const ownedEvents = events.filter((event) => !userId || event.userId === String(userId));
  const commands = ownedEvents.filter((event) => event.eventName === 'command').length;
  const onboarding = await getBusinessSetup(userId || 'guest');
  return {
    commands,
    events: ownedEvents.length,
    onboardingComplete: Boolean(onboarding.businessName),
    lastEventAt: ownedEvents[0]?.createdAt || '',
  };
}

async function listUsers() {
  if (pool) {
    const result = await query(
      `SELECT id, email, name, mobile, user_type, plan_id, credits, role, status, created_at, updated_at
       FROM app_users
       ORDER BY created_at DESC
       LIMIT 500`
    );
    return result.rows.map(publicUser);
  }

  const users = await readJson(usersPath, []);
  return users.map(publicUser);
}

async function updateUser(userId, patch = {}) {
  const safe = {
    status: patch.status ? String(patch.status).trim() : undefined,
    role: patch.role ? String(patch.role).trim() : undefined,
    planId: patch.planId || patch.plan_id || patch.plan ? String(patch.planId || patch.plan_id || patch.plan).trim() : undefined,
    credits: patch.credits === undefined ? undefined : Number(patch.credits),
    userType: patch.userType || patch.user_type ? String(patch.userType || patch.user_type).trim() : undefined,
    name: patch.name || patch.fullName || patch.fullname ? String(patch.name || patch.fullName || patch.fullname).trim() : undefined,
    mobile: patch.mobile ? String(patch.mobile).trim() : undefined,
  };

  if (pool && /^\d+$/.test(String(userId))) {
    const fields = [];
    const values = [];
    if (safe.status) { values.push(safe.status); fields.push(`status = $${values.length}`); }
    if (safe.role) { values.push(safe.role); fields.push(`role = $${values.length}`); }
    if (safe.planId) { values.push(safe.planId); fields.push(`plan_id = $${values.length}`); }
    if (Number.isFinite(safe.credits)) { values.push(safe.credits); fields.push(`credits = $${values.length}`); }
    if (safe.userType) { values.push(safe.userType); fields.push(`user_type = $${values.length}`); }
    if (safe.name) { values.push(safe.name); fields.push(`name = $${values.length}`); }
    if (safe.mobile) { values.push(safe.mobile); fields.push(`mobile = $${values.length}`); }
    if (!fields.length) return null;
    values.push(Number(userId));
    const result = await query(
      `UPDATE app_users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, email, name, mobile, user_type, plan_id, credits, role, status`,
      values
    );
    return result.rows[0] ? publicUser(result.rows[0]) : null;
  }

  const users = await readJson(usersPath, []);
  const index = users.findIndex((user) => String(user.id) === String(userId));
  if (index < 0) return null;
  users[index] = {
    ...users[index],
    status: safe.status || users[index].status || 'active',
    role: safe.role || users[index].role || 'owner',
    planId: safe.planId || users[index].planId || users[index].plan_id || 'free',
    plan_id: safe.planId || users[index].plan_id || users[index].planId || 'free',
    plan: safe.planId || users[index].plan || users[index].planId || 'free',
    credits: Number.isFinite(safe.credits) ? safe.credits : users[index].credits,
    userType: safe.userType || users[index].userType || users[index].user_type || 'business-owner',
    user_type: safe.userType || users[index].user_type || users[index].userType || 'business-owner',
    name: safe.name || users[index].name || users[index].fullname || '',
    fullname: safe.name || users[index].fullname || users[index].name || '',
    mobile: safe.mobile || users[index].mobile || '',
    updatedAt: new Date().toISOString(),
  };
  await writeJson(usersPath, users);
  return publicUser(users[index]);
}

async function deleteUser(userId) {
  if (pool && /^\d+$/.test(String(userId))) {
    const result = await query('DELETE FROM app_users WHERE id = $1 RETURNING id', [Number(userId)]);
    return Boolean(result.rows[0]);
  }

  const users = await readJson(usersPath, []);
  const next = users.filter((user) => String(user.id) !== String(userId));
  if (next.length === users.length) return false;
  await writeJson(usersPath, next);
  return true;
}

async function addUserCredits(userId, amount) {
  const creditsToAdd = Number(amount);
  if (!Number.isFinite(creditsToAdd)) {
    const error = new Error('Credits must be a valid number.');
    error.status = 422;
    throw error;
  }

  if (pool && /^\d+$/.test(String(userId))) {
    const result = await query(
      `UPDATE app_users
       SET credits = credits + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, name, mobile, user_type, plan_id, credits, role, status`,
      [creditsToAdd, Number(userId)]
    );
    return result.rows[0] ? publicUser(result.rows[0]) : null;
  }

  const users = await readJson(usersPath, []);
  const index = users.findIndex((user) => String(user.id) === String(userId));
  if (index < 0) return null;
  const current = Number.isFinite(Number(users[index].credits)) ? Number(users[index].credits) : 0;
  users[index].credits = current + creditsToAdd;
  users[index].updatedAt = new Date().toISOString();
  await writeJson(usersPath, users);
  return publicUser(users[index]);
}

async function adminStats() {
  const users = await listUsers();
  const activeUsers = users.filter((user) => user.status !== 'suspended' && user.status !== 'blocked');
  const planDistribution = users.reduce((acc, user) => {
    const key = String(user.planId || user.plan || 'free');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    suspendedUsers: users.length - activeUsers.length,
    totalCredits: users.reduce((sum, user) => sum + (Number(user.credits) || 0), 0),
    planDistribution,
    recentRegistrations: users.slice(0, 10).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      planId: user.planId,
      createdAt: user.createdAt,
    })),
  };
}

module.exports = {
  publicUser,
  registerUser,
  loginUser,
  socialLoginUser,
  saveBusinessSetup,
  getBusinessSetup,
  recordAuditEvent,
  growthSummary,
  listUsers,
  updateUser,
  deleteUser,
  addUserCredits,
  adminStats,
};
