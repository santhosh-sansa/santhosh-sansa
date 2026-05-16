const fs = require('fs/promises');
const path = require('path');
const { pool, query } = require('./db');
const { createPaymentLink } = require('./payments');

const dataDir = path.join(__dirname, '..', '..', 'data');
const subscriptionsPath = path.join(dataDir, 'subscriptions.json');

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    dailyPdfLimit: 2,
    watermark: true,
    badge: 'Start free',
    features: ['2 PDF downloads per day', 'SANSA watermark', 'Basic PDF tools', 'Public trial access'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    interval: 'month',
    dailyPdfLimit: 50,
    watermark: false,
    badge: 'Best starter',
    features: ['50 PDF downloads per day', 'No watermark', 'Invoice + Resume + Legal PDFs', 'UPI payment links'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 499,
    interval: 'month',
    dailyPdfLimit: 250,
    watermark: false,
    badge: 'Business',
    features: ['250 PDF downloads per day', 'AI CFO dashboard', 'WhatsApp reminders', 'Customer ledger'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    interval: 'month',
    dailyPdfLimit: 1000,
    watermark: false,
    badge: 'Power user',
    features: ['1000 PDF downloads per day', 'OCR + document brain', 'Advanced reports', 'Priority workflow tools'],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 2999,
    interval: 'one-time',
    dailyPdfLimit: 1000,
    watermark: false,
    badge: 'One-time',
    features: ['One-time access', 'No watermark', 'Business tools included', 'Long-term owner plan'],
  },
];

function planById(planId) {
  return plans.find((plan) => plan.id === String(planId || '').toLowerCase()) || plans[0];
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function userKey(userId = 'guest') {
  return String(userId || 'guest');
}

function addPlanExpiry(plan) {
  const now = new Date();
  if (plan.id === 'free') return null;
  if (plan.interval === 'one-time') {
    now.setFullYear(now.getFullYear() + 10);
    return now.toISOString();
  }
  now.setDate(now.getDate() + 30);
  return now.toISOString();
}

function isActiveRecord(record) {
  if (!record || record.status !== 'active') return false;
  if (!record.expiresAt) return true;
  return new Date(record.expiresAt).getTime() > Date.now();
}

function normalizeRecord(record = {}) {
  const plan = planById(record.planId || record.plan_id);
  return {
    id: String(record.id || `sub-${Date.now()}`),
    userId: userKey(record.userId || record.user_id),
    planId: plan.id,
    planName: plan.name,
    status: String(record.status || 'free'),
    amount: numberValue(record.amount),
    provider: String(record.provider || ''),
    paymentUrl: String(record.paymentUrl || record.payment_url || ''),
    invoiceNumber: String(record.invoiceNumber || record.invoice_number || ''),
    startsAt: record.startsAt || record.starts_at || new Date().toISOString(),
    expiresAt: record.expiresAt || record.expires_at || null,
    createdAt: record.createdAt || record.created_at || new Date().toISOString(),
    updatedAt: record.updatedAt || record.updated_at || new Date().toISOString(),
    eventJson: record.eventJson || record.event_json || {},
    plan,
    limits: {
      dailyPdfLimit: plan.dailyPdfLimit,
      watermark: plan.watermark,
    },
  };
}

function freeStatus(userId = 'guest') {
  const plan = planById('free');
  return normalizeRecord({
    id: `free-${userKey(userId)}`,
    userId,
    planId: plan.id,
    status: 'active',
    amount: 0,
    startsAt: new Date().toISOString(),
    expiresAt: null,
  });
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

async function listLocalSubscriptions() {
  const items = await readJson(subscriptionsPath, []);
  return Array.isArray(items) ? items : [];
}

async function saveLocalSubscription(record) {
  const items = await listLocalSubscriptions();
  const index = items.findIndex((item) => item.id === record.id);
  if (index >= 0) items[index] = record;
  else items.unshift(record);
  await writeJson(subscriptionsPath, items.slice(0, 2000));
  return record;
}

async function saveSubscription(record) {
  const safe = normalizeRecord(record);

  if (pool && /^\d+$/.test(safe.userId)) {
    const result = await query(
      `INSERT INTO subscriptions
        (user_id, plan_id, status, amount, provider, payment_url, invoice_number, starts_at, expires_at, event_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id, plan_id, status, amount, provider, payment_url, invoice_number, starts_at, expires_at, event_json, created_at, updated_at`,
      [
        Number(safe.userId),
        safe.planId,
        safe.status,
        safe.amount,
        safe.provider,
        safe.paymentUrl,
        safe.invoiceNumber,
        safe.startsAt,
        safe.expiresAt,
        JSON.stringify(safe.eventJson || {}),
      ]
    );
    return normalizeRecord(result.rows[0]);
  }

  return saveLocalSubscription(safe);
}

async function subscriptionStatus(userId = 'guest') {
  const key = userKey(userId);

  if (pool && /^\d+$/.test(key)) {
    const result = await query(
      `SELECT id, user_id, plan_id, status, amount, provider, payment_url, invoice_number, starts_at, expires_at, event_json, created_at, updated_at
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [Number(key)]
    );
    const active = result.rows.map(normalizeRecord).find(isActiveRecord);
    return active || freeStatus(key);
  }

  const active = (await listLocalSubscriptions())
    .filter((item) => userKey(item.userId) === key || (key === 'guest' && userKey(item.userId) === 'guest'))
    .map(normalizeRecord)
    .find(isActiveRecord);
  return active || freeStatus(key);
}

async function hasPaidSubscription(userId = 'guest') {
  const status = await subscriptionStatus(userId);
  return status.status === 'active' && status.planId !== 'free' && !status.limits.watermark;
}

async function createSubscriptionCheckout(payload = {}, userId = 'guest') {
  const plan = planById(payload.planId);
  if (plan.id === 'free') {
    const record = await saveSubscription({
      userId,
      planId: 'free',
      status: 'active',
      amount: 0,
      provider: 'free',
      eventJson: { source: 'free-plan' },
    });
    return { ok: true, plan, subscription: record, paymentUrl: '' };
  }

  const invoiceNumber = `SUB-${plan.id.toUpperCase()}-${Date.now()}`;
  const provider = String(payload.provider || 'razorpay').toLowerCase();
  const payment = await createPaymentLink(
    {
      provider,
      amount: plan.price,
      invoiceNumber,
      customerName: payload.customerName || 'SANSA Customer',
      customerEmail: payload.customerEmail || '',
      customerPhone: payload.customerPhone || '',
      businessName: 'SANSA AI',
      upiId: payload.upiId || process.env.SANSA_UPI_ID || '',
    },
    userId
  );

  const subscription = await saveSubscription({
    userId,
    planId: plan.id,
    status: 'pending',
    amount: plan.price,
    provider: payment.provider,
    paymentUrl: payment.paymentUrl,
    invoiceNumber,
    startsAt: new Date().toISOString(),
    expiresAt: addPlanExpiry(plan),
    eventJson: { source: 'checkout', payment },
  });

  return { ok: true, plan, subscription, paymentUrl: payment.paymentUrl, payment };
}

async function activateSubscription(userId = 'guest', planId = 'starter', source = 'manual', eventJson = {}) {
  const plan = planById(planId);
  if (plan.id === 'free') return subscriptionStatus(userId);
  return saveSubscription({
    userId,
    planId: plan.id,
    status: 'active',
    amount: plan.price,
    provider: source,
    invoiceNumber: eventJson.invoiceNumber || '',
    paymentUrl: eventJson.paymentUrl || '',
    startsAt: new Date().toISOString(),
    expiresAt: addPlanExpiry(plan),
    eventJson: { source, ...eventJson },
  });
}

async function activateSubscriptionByInvoice(invoiceNumber = '', eventJson = {}) {
  const invoice = String(invoiceNumber || '').trim();
  if (!invoice) return null;

  if (pool) {
    const found = await query(
      `SELECT id, user_id, plan_id, amount, provider, payment_url, invoice_number, starts_at, expires_at, event_json
       FROM subscriptions
       WHERE invoice_number = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [invoice]
    );
    if (!found.rows.length) return null;
    const row = normalizeRecord(found.rows[0]);
    const plan = planById(row.planId);
    const updated = await query(
      `UPDATE subscriptions
       SET status = 'active', starts_at = NOW(), expires_at = $2, event_json = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id, plan_id, status, amount, provider, payment_url, invoice_number, starts_at, expires_at, event_json, created_at, updated_at`,
      [Number(row.id), addPlanExpiry(plan), JSON.stringify({ ...row.eventJson, activatedBy: 'webhook', webhook: eventJson })]
    );
    return normalizeRecord(updated.rows[0]);
  }

  const items = await listLocalSubscriptions();
  const index = items.findIndex((item) => String(item.invoiceNumber || '') === invoice);
  if (index === -1) return null;
  const item = normalizeRecord(items[index]);
  items[index] = {
    ...item,
    status: 'active',
    startsAt: new Date().toISOString(),
    expiresAt: addPlanExpiry(planById(item.planId)),
    updatedAt: new Date().toISOString(),
    eventJson: { ...item.eventJson, activatedBy: 'webhook', webhook: eventJson },
  };
  await writeJson(subscriptionsPath, items);
  return normalizeRecord(items[index]);
}

async function subscriptionRevenueSummary() {
  let records = [];
  if (pool) {
    const result = await query(
      `SELECT id, user_id, plan_id, status, amount, provider, payment_url, invoice_number, starts_at, expires_at, event_json, created_at, updated_at
       FROM subscriptions
       ORDER BY created_at DESC
       LIMIT 500`
    );
    records = result.rows.map(normalizeRecord);
  } else {
    records = (await listLocalSubscriptions()).map(normalizeRecord);
  }

  const activePaid = records.filter((record) => isActiveRecord(record) && record.planId !== 'free');
  const pending = records.filter((record) => record.status === 'pending');
  const paidRevenue = records
    .filter((record) => record.status === 'active' && record.planId !== 'free')
    .reduce((sum, record) => sum + numberValue(record.amount), 0);

  return {
    totalSubscriptions: records.length,
    activePaid: activePaid.length,
    pending: pending.length,
    paidRevenue,
    latest: records.slice(0, 20),
    plans,
  };
}

module.exports = {
  plans,
  planById,
  subscriptionStatus,
  hasPaidSubscription,
  createSubscriptionCheckout,
  activateSubscription,
  activateSubscriptionByInvoice,
  subscriptionRevenueSummary,
};
