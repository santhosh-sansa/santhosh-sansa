const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { pool, query } = require('./db');

const dataDir = path.join(__dirname, '..', '..', 'data');
const paymentEventsPath = path.join(dataDir, 'payment-events.json');

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function cleanText(value, fallback = '') {
  return String(value || fallback).trim();
}

function extractUpiId(text) {
  const match = String(text || '').match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

function buildUpiUrl({ upiId, businessName, amount, invoiceNumber }) {
  const pa = extractUpiId(upiId) || String(upiId || '').trim();
  if (!pa) return '';
  const pn = cleanText(businessName, 'SANSA Business').slice(0, 50) || 'SANSA';
  const am = numberValue(amount).toFixed(2);
  const tn = `INV ${cleanText(invoiceNumber, 'NA')}`.replace(/\s+/g, ' ').trim().slice(0, 80);
  const params = new URLSearchParams({
    pa,
    pn,
    am,
    cu: 'INR',
    tn: tn || 'Payment',
  });
  return `upi://pay?${params.toString()}`;
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

async function storePaymentEvent(event) {
  const safeEvent = {
    id: event.id || `payevt-${Date.now()}`,
    userId: String(event.userId || 'guest'),
    provider: cleanText(event.provider, 'upi'),
    invoiceNumber: cleanText(event.invoiceNumber),
    customerName: cleanText(event.customerName),
    amount: numberValue(event.amount),
    status: cleanText(event.status, 'created'),
    paymentUrl: cleanText(event.paymentUrl),
    eventJson: event.eventJson || {},
    createdAt: event.createdAt || new Date().toISOString(),
  };

  if (pool && /^\d+$/.test(safeEvent.userId)) {
    const result = await query(
      `INSERT INTO payment_events (user_id, provider, invoice_number, customer_name, amount, status, payment_url, event_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, provider, invoice_number, customer_name, amount, status, payment_url, created_at`,
      [
        Number(safeEvent.userId),
        safeEvent.provider,
        safeEvent.invoiceNumber,
        safeEvent.customerName,
        safeEvent.amount,
        safeEvent.status,
        safeEvent.paymentUrl,
        JSON.stringify(safeEvent.eventJson),
      ]
    );
    const row = result.rows[0];
    return {
      id: String(row.id),
      provider: row.provider,
      invoiceNumber: row.invoice_number,
      customerName: row.customer_name,
      amount: numberValue(row.amount),
      status: row.status,
      paymentUrl: row.payment_url,
      createdAt: row.created_at,
    };
  }

  const events = await readJson(paymentEventsPath, []);
  events.unshift(safeEvent);
  await writeJson(paymentEventsPath, events.slice(0, 1000));
  return safeEvent;
}

async function createRazorpayPaymentLink(payload) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;

  const amount = Math.max(100, Math.round(numberValue(payload.amount) * 100));
  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      accept_partial: false,
      reference_id: cleanText(payload.invoiceNumber, `SANSA-${Date.now()}`).slice(0, 40),
      description: `Payment for invoice ${cleanText(payload.invoiceNumber)}`,
      customer: {
        name: cleanText(payload.customerName, 'Customer'),
        contact: cleanText(payload.customerPhone),
        email: cleanText(payload.customerEmail),
      },
      notify: { sms: false, email: false },
      callback_url: cleanText(process.env.RAZORPAY_CALLBACK_URL),
      callback_method: 'get',
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.description || 'Razorpay payment link failed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

async function createRazorpayOrder(payload = {}, userId = 'guest') {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const err = new Error('Razorpay keys are not configured on this server.');
    err.status = 503;
    throw err;
  }
  const amountRupees = numberValue(payload.amount);
  if (!amountRupees) {
    const err = new Error('Amount is required.');
    err.status = 422;
    throw err;
  }
  const amountPaise = Math.max(100, Math.round(amountRupees * 100));
  const invoiceNumber = cleanText(payload.invoiceNumber, `SANSA-${Date.now()}`);
  const receipt = cleanText(payload.receipt || invoiceNumber, `rcpt_${Date.now()}`)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 40);
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        invoiceNumber,
        customerName: cleanText(payload.customerName, 'Customer'),
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error?.description || 'Razorpay order creation failed.');
    err.status = response.status >= 400 && response.status < 500 ? response.status : 502;
    throw err;
  }
  const event = await storePaymentEvent({
    userId,
    provider: 'razorpay',
    invoiceNumber,
    customerName: cleanText(payload.customerName, 'Customer'),
    amount: amountRupees,
    status: 'order_created',
    paymentUrl: '',
    eventJson: { source: 'create-order', orderId: data.id, currency: data.currency, amountPaise: data.amount },
  });
  return {
    ok: true,
    orderId: data.id,
    amount: amountRupees,
    amountPaise: data.amount,
    currency: data.currency || 'INR',
    receipt: data.receipt,
    keyId,
    invoiceNumber,
    event,
  };
}

async function createPaymentLink(payload = {}, userId = 'guest') {
  const amount = numberValue(payload.amount);
  if (!amount) {
    const error = new Error('Amount is required.');
    error.status = 422;
    throw error;
  }

  const provider = cleanText(payload.provider, 'upi');
  const invoiceNumber = cleanText(payload.invoiceNumber, `SANSA-${Date.now()}`);
  const customerName = cleanText(payload.customerName, 'Customer');
  const upiId = extractUpiId(payload.upiId || payload.paymentNote);
  let paymentUrl = buildUpiUrl({
    upiId,
    businessName: cleanText(payload.businessName, 'SANSA Business'),
    amount,
    invoiceNumber,
  });
  let razorpay = null;
  let finalProvider = upiId ? 'upi' : 'demo';

  if (provider === 'razorpay') {
    razorpay = await createRazorpayPaymentLink({ ...payload, amount, invoiceNumber, customerName });
    if (razorpay?.short_url) {
      paymentUrl = razorpay.short_url;
      finalProvider = 'razorpay';
    }
  }

  if (!paymentUrl) {
    paymentUrl = `https://pay.sansa.local/invoice/${encodeURIComponent(invoiceNumber)}?amount=${amount.toFixed(2)}`;
  }

  const event = await storePaymentEvent({
    userId,
    provider: finalProvider,
    invoiceNumber,
    customerName,
    amount,
    status: 'created',
    paymentUrl,
    eventJson: { provider, razorpayId: razorpay?.id || '', source: 'create-link' },
  });

  return {
    ok: true,
    provider: finalProvider,
    invoiceNumber,
    customerName,
    amount,
    paymentUrl,
    event,
    razorpay,
  };
}

function verifyRazorpayWebhook(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return { ok: true, skipped: true };
  if (!signature || !rawBody) return { ok: false, skipped: false };
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (Buffer.byteLength(expected) !== Buffer.byteLength(String(signature))) {
    return { ok: false, skipped: false };
  }
  return {
    ok: crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature))),
    skipped: false,
  };
}

async function recordWebhookPayment(body = {}, userId = 'guest') {
  const payload = body.payload || {};
  const paymentLink = payload.payment_link?.entity || {};
  const payment = payload.payment?.entity || {};
  const invoiceNumber = paymentLink.reference_id || payment.notes?.invoiceNumber || body.reference_id || '';
  const amount = numberValue(paymentLink.amount_paid || payment.amount || body.amount) / (numberValue(paymentLink.amount_paid || payment.amount || 0) > 1000 ? 100 : 1);
  const status = /paid|captured/i.test(`${paymentLink.status || ''} ${payment.status || ''} ${body.event || ''}`) ? 'paid' : cleanText(paymentLink.status || payment.status || 'received');

  return storePaymentEvent({
    userId,
    provider: 'razorpay',
    invoiceNumber,
    customerName: paymentLink.customer?.name || payment.email || '',
    amount,
    status,
    paymentUrl: paymentLink.short_url || '',
    eventJson: body,
  });
}

async function paymentLedger(userId = 'guest') {
  if (pool && /^\d+$/.test(String(userId))) {
    const result = await query(
      `SELECT id, provider, invoice_number, customer_name, amount, status, payment_url, created_at
       FROM payment_events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [Number(userId)]
    );
    return result.rows.map((row) => ({
      id: String(row.id),
      provider: row.provider,
      invoiceNumber: row.invoice_number,
      customerName: row.customer_name,
      amount: numberValue(row.amount),
      status: row.status,
      paymentUrl: row.payment_url,
      createdAt: row.created_at,
    }));
  }

  const events = await readJson(paymentEventsPath, []);
  return events
    .filter((event) => !userId || event.userId === String(userId) || event.userId === 'guest')
    .slice(0, 100);
}

async function paymentSummary(userId = 'guest') {
  const ledger = await paymentLedger(userId);
  const paid = ledger.filter((item) => item.status === 'paid').reduce((sum, item) => sum + numberValue(item.amount), 0);
  const created = ledger.filter((item) => item.status === 'created').reduce((sum, item) => sum + numberValue(item.amount), 0);
  return {
    links: ledger.length,
    paid,
    created,
    successRate: ledger.length ? Math.round((ledger.filter((item) => item.status === 'paid').length / ledger.length) * 100) : 0,
    latest: ledger[0] || null,
  };
}

module.exports = {
  buildUpiUrl,
  createPaymentLink,
  createRazorpayOrder,
  verifyRazorpayWebhook,
  recordWebhookPayment,
  storePaymentEvent,
  paymentLedger,
  paymentSummary,
};
