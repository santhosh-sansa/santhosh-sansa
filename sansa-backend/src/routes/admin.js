const path = require('path');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middleware/auth');
const { processUpload } = require('../services/documents');
const { searchKnowledge } = require('../services/search');
const { query } = require('../services/db');
const { embedText } = require('../services/ai');
const { readPublicSettings, writePublicSettings } = require('../services/publicSettings');
const { subscriptionRevenueSummary } = require('../services/subscriptions');
const { engineStatus } = require('../services/realToolEngine');
const { skillCatalog, skillStatus } = require('../services/skillEngine');
const { liveAuditStatus } = require('../services/liveAudit');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_MB || 25) * 1024 * 1024,
  },
});

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - SANSA AI Admin</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="admin-body">${body}</body>
</html>`;
}

function h(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function adminShell(content) {
  return page(
    'Admin',
    `<aside class="admin-side">
      <div class="brand-mark">A</div>
      <a href="/admin">Dashboard</a>
      <a href="/admin/live-audit">Live Audit</a>
      <a href="/admin/engine">Tool Engine</a>
      <a href="/admin/skills">Skill Engine</a>
      <a href="/admin/public-settings">Public Settings</a>
      <a href="/admin/test">Search Test</a>
      <a href="/">Public App</a>
      <form method="post" action="/admin/logout"><button>Logout</button></form>
    </aside>
    <main class="admin-main">${content}</main>`
  );
}

function checked(value) {
  return value ? ' checked' : '';
}

function settingCheckbox(name, label, value) {
  return `<label class="setting-check"><input type="checkbox" name="${h(name)}"${checked(value)}> ${h(label)}</label>`;
}

function publicSettingsForm(settings, saved = false) {
  const toolLabels = {
    dashboard: 'Dashboard',
    onboarding: 'Onboarding',
    growth: 'Growth',
    payments: 'Payments',
    cfo: 'AI CFO',
    creative: 'Creative AI',
    products: 'Products',
    skills: 'Skill Hub',
    realEngine: 'Tool Engine',
    assistant: 'AI Assistant',
    accountant: 'AI Accountant',
    profile: 'Business Profile',
    items: 'Customers & Items',
    document: 'PDF Builder',
    history: 'Invoice History',
    quote: 'Quotation',
    brain: 'AI Document Brain',
    reminders: 'Auto Reminders',
    expenses: 'OCR Expenses',
    reports: 'GST Reports',
    share: 'Share / WhatsApp',
  };
  const serviceLabels = {
    career: 'Resume PDF',
    legal: 'Legal PDF',
    invoice: 'Invoice PDF',
  };

  return adminShell(`
    <header class="admin-head">
      <div>
        <p class="eyebrow">PUBLIC CONTROL</p>
        <h1>Public App Settings</h1>
        <p>Choose only the options public users should see. Edit names and hero text from admin.</p>
        ${saved ? '<p class="muted">Saved. Refresh public website to see changes.</p>' : ''}
      </div>
    </header>

    <form class="panel" method="post" action="/admin/public-settings">
      <h2>Hero Text</h2>
      <input name="hero_pill" value="${h(settings.hero.pill)}" placeholder="Hero pill">
      <input name="hero_title" value="${h(settings.hero.title)}" placeholder="Hero title">
      <textarea name="hero_subtitle" placeholder="Hero subtitle">${h(settings.hero.subtitle)}</textarea>
      <h2>PDF Platform Hub</h2>
      <input name="platform_pill" value="${h(settings.platform?.pill || '')}" placeholder="Platform pill">
      <input name="platform_title" value="${h(settings.platform?.title || '')}" placeholder="Platform title">
      <textarea name="platform_subtitle" placeholder="Platform subtitle">${h(settings.platform?.subtitle || '')}</textarea>
      <p class="muted">Admin button is hidden from the public website. Open admin directly with /admin/.</p>
      ${settingCheckbox('quick_tools', 'Show Quick PDF tools on public home', settings.quickTools)}
      ${settingCheckbox('platform_hub', 'Show Adobe-style PDF platform hub', settings.platformHub)}
      ${settingCheckbox('pricing', 'Show freemium pricing and subscription plans', settings.pricing !== false)}

      <h2>Public PDF Services</h2>
      <div class="admin-settings-grid">
        ${Object.entries(serviceLabels).map(([key, label]) => settingCheckbox(`service_${key}`, label, settings.services[key]?.enabled)).join('')}
      </div>
      ${Object.entries(serviceLabels).map(([key, label]) => `
        <h3>${h(label)} Text</h3>
        <input name="service_${key}_label" value="${h(settings.services[key]?.label || label)}" placeholder="${h(label)} button">
        <input name="service_${key}_title" value="${h(settings.services[key]?.title || label)}" placeholder="${h(label)} title">
        <input name="service_${key}_note" value="${h(settings.services[key]?.note || '')}" placeholder="${h(label)} note">
        <input name="service_${key}_price" value="${h(settings.services[key]?.price || '')}" placeholder="${h(label)} price">
      `).join('')}

      <h2>Public Option Tabs</h2>
      <div class="admin-settings-grid">
        ${Object.entries(toolLabels).map(([key, label]) => settingCheckbox(`tool_${key}`, label, settings.tools[key]?.enabled)).join('')}
      </div>
      ${Object.entries(toolLabels).map(([key, label]) => `
        <input name="tool_${key}_label" value="${h(settings.tools[key]?.label || label)}" placeholder="${h(label)} label">
      `).join('')}

      <h2>Visual Platform Cards</h2>
      <div class="admin-settings-grid">
        ${Object.entries(settings.features || {}).map(([key, item]) => settingCheckbox(`feature_${key}`, item.title || key, item.enabled)).join('')}
      </div>
      ${Object.entries(settings.features || {}).map(([key, item]) => `
        <h3>${h(item.title || key)}</h3>
        <input name="feature_${key}_title" value="${h(item.title || '')}" placeholder="Feature title">
        <input name="feature_${key}_note" value="${h(item.note || '')}" placeholder="Feature note">
      `).join('')}

      <button type="submit">Save Public Settings</button>
    </form>
  `);
}

router.get('/login', (req, res) => {
  res.send(
    page(
      'Login',
      `<main class="login-screen">
        <form class="login-card" method="post" action="/admin/login">
          <div class="brand-mark">A</div>
          <h1>Admin Login</h1>
          <input name="username" placeholder="Username" required>
          <input name="password" type="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
      </main>`
    )
  );
});

router.post('/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const adminUsername = process.env.ADMIN_USERNAME || 'admin@sansa';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-password';
  const passwordMatchesHash = adminPassword.startsWith('$2') ? bcrypt.compareSync(password, adminPassword) : false;
  const ok = username === adminUsername && (password === adminPassword || passwordMatchesHash);

  if (!ok) return res.redirect('/admin/login?error=1');

  req.session.adminUser = username;
  return res.redirect('/admin');
});

router.post('/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/public-settings', requireAdmin, async (req, res, next) => {
  try {
    res.send(publicSettingsForm(await readPublicSettings(), req.query.saved === '1'));
  } catch (error) {
    next(error);
  }
});

router.post('/public-settings', requireAdmin, async (req, res, next) => {
  try {
    const current = await readPublicSettings();
    const body = req.body || {};
    const settings = {
      ...current,
      hero: {
        pill: String(body.hero_pill || '').trim() || current.hero.pill,
        title: String(body.hero_title || '').trim() || current.hero.title,
        subtitle: String(body.hero_subtitle || '').trim() || current.hero.subtitle,
      },
      platform: {
        pill: String(body.platform_pill || '').trim() || current.platform?.pill,
        title: String(body.platform_title || '').trim() || current.platform?.title,
        subtitle: String(body.platform_subtitle || '').trim() || current.platform?.subtitle,
      },
      showAdminButton: false,
      quickTools: body.quick_tools === 'on',
      platformHub: body.platform_hub === 'on',
      pricing: body.pricing === 'on',
      services: { ...current.services },
      tools: { ...current.tools },
      features: { ...current.features },
    };

    Object.keys(settings.services).forEach((key) => {
      settings.services[key] = {
        ...settings.services[key],
        enabled: body[`service_${key}`] === 'on',
        label: String(body[`service_${key}_label`] || settings.services[key].label || '').trim(),
        title: String(body[`service_${key}_title`] || settings.services[key].title || '').trim(),
        note: String(body[`service_${key}_note`] || settings.services[key].note || '').trim(),
        price: String(body[`service_${key}_price`] || settings.services[key].price || '').trim(),
      };
    });

    Object.keys(settings.tools).forEach((key) => {
      settings.tools[key] = {
        ...settings.tools[key],
        enabled: body[`tool_${key}`] === 'on',
        label: String(body[`tool_${key}_label`] || settings.tools[key].label || '').trim(),
      };
    });

    Object.keys(settings.features || {}).forEach((key) => {
      settings.features[key] = {
        ...settings.features[key],
        enabled: body[`feature_${key}`] === 'on',
        title: String(body[`feature_${key}_title`] || settings.features[key].title || '').trim(),
        note: String(body[`feature_${key}_note`] || settings.features[key].note || '').trim(),
      };
    });

    await writePublicSettings(settings);
    res.redirect('/admin/public-settings?saved=1');
  } catch (error) {
    next(error);
  }
});

router.get('/engine', requireAdmin, (req, res) => {
  const status = engineStatus();
  const envRows = Object.entries(status.env)
    .filter(([, value]) => typeof value === 'boolean')
    .map(([key, value]) => `<div><span>${h(key)}</span><strong>${value ? 'Ready' : 'Missing'}</strong></div>`)
    .join('');
  const actionRows = status.catalog
    .map((item) => `<tr><td>${h(item.title)}</td><td>${h(item.group)}</td><td>${h(item.endpoint)}</td><td>${h(item.id)}</td></tr>`)
    .join('');
  res.send(adminShell(`
    <header class="admin-head">
      <div>
        <p class="eyebrow">REAL TOOL ENGINE</p>
        <h1>All Options Working Control</h1>
        <p>Every public menu, card, footer link, app switcher item, search route, and PDF tool is mapped to a SANSA internal workspace or API-ready fallback.</p>
      </div>
    </header>
    <section class="admin-health-grid">
      <div><span>Total Actions</span><strong>${Number(status.totalActions || 0)}</strong></div>
      <div><span>cPanel Safe</span><strong>${status.cpanelSafe ? 'Yes' : 'No'}</strong></div>
      <div><span>API Ready</span><strong>${status.apiReady ? 'Yes' : 'No'}</strong></div>
      <div><span>Groups</span><strong>${h(status.groups.join(', '))}</strong></div>
    </section>
    <section class="panel">
      <h2>Provider Key Status</h2>
      <p class="muted">Missing keys never break the public site. Add keys in MilesWeb Node app environment to turn fallback flows into provider-backed flows.</p>
      <div class="admin-health-grid">${envRows}</div>
      <pre>OPENAI_API_KEY
PDFCO_API_KEY or CLOUDCONVERT_API_KEY or CONVERTAPI_SECRET
RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET
WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID
SANSA_ENABLE_LIVE_PDF_ENGINE=true</pre>
    </section>
    <section class="panel">
      <h2>Public Option Coverage</h2>
      <table><thead><tr><th>Option</th><th>Group</th><th>Endpoint</th><th>Action key</th></tr></thead><tbody>${actionRows}</tbody></table>
    </section>
  `));
});

router.get('/skills', requireAdmin, (req, res) => {
  const status = skillStatus();
  const envRows = Object.entries(status.providers)
    .map(([key, value]) => `<div><span>${h(key)}</span><strong>${value ? 'Ready' : 'Fallback'}</strong></div>`)
    .join('');
  const skillRows = skillCatalog()
    .map((item) => `<tr><td>${h(item.title)}</td><td>${h(item.group)}</td><td>${h(item.provider)}</td><td>${h(item.id)}</td></tr>`)
    .join('');
  res.send(adminShell(`
    <header class="admin-head">
      <div>
        <p class="eyebrow">SANSA SKILL ENGINE</p>
        <h1>Imported Skills Control</h1>
        <p>DOCX, PDF, PPTX, XLSX, Speech, OpenAI, VectorEngine, AI SDK, Agent, Theme, Diagram, Design Review, and PDF.co skills are attached to SANSA as working internal tools.</p>
      </div>
    </header>
    <section class="admin-health-grid">
      <div><span>Total Skills</span><strong>${Number(status.skills || 0)}</strong></div>
      <div><span>Mode</span><strong>${h(status.mode)}</strong></div>
      <div><span>API Ready</span><strong>${status.apiReady ? 'Yes' : 'No'}</strong></div>
      <div><span>Fallback</span><strong>Always On</strong></div>
    </section>
    <section class="panel">
      <h2>Provider Key Status</h2>
      <p class="muted">Add keys in MilesWeb Node app environment. Missing keys return useful cPanel-safe outputs instead of errors.</p>
      <div class="admin-health-grid">${envRows}</div>
      <pre>OPENAI_API_KEY
PDFCO_API_KEY or PDFCO_TOKEN
VECTORENGINE_API_KEY or VECTOR_ENGINE_API_KEY
VECTORENGINE_API_URL=https://api.vectorengine.ai
ANTHROPIC_API_KEY
VERCEL_AI_GATEWAY_API_KEY</pre>
    </section>
    <section class="panel">
      <h2>Skill Coverage</h2>
      <table><thead><tr><th>Skill</th><th>Group</th><th>Provider</th><th>Key</th></tr></thead><tbody>${skillRows}</tbody></table>
    </section>
  `));
});

router.get('/live-audit', requireAdmin, (req, res) => {
  const status = liveAuditStatus();
  const providerRows = Object.entries(status.providers)
    .map(([key, value]) => `<div><span>${h(key)}</span><strong>${value ? 'Ready' : 'Fallback'}</strong></div>`)
    .join('');
  const notes = status.providerNotes.length
    ? status.providerNotes.map((note) => `<li>${h(note)}</li>`).join('')
    : '<li>All known provider keys are ready.</li>';
  const missing = status.frontend.missingActions.length
    ? status.frontend.missingActions.map((action) => `<li>${h(action)}</li>`).join('')
    : '<li>No hard missing public actions found.</li>';
  const fallback = status.frontend.fallbackCoveredActions.length
    ? status.frontend.fallbackCoveredActions.map((action) => `<li>${h(action)}</li>`).join('')
    : '<li>No unknown skill/tool fallback actions found.</li>';

  res.send(adminShell(`
    <header class="admin-head">
      <div>
        <p class="eyebrow">LIVE OPTION AUDIT</p>
        <h1>SANSA All Options Health</h1>
        <p>Top menu, PDF cards, app switcher, footer, Skill Hub, Tool Runner, provider keys, and backend routes are checked here.</p>
      </div>
    </header>
    <section class="admin-health-grid">
      <div><span>Health</span><strong>${h(status.health)}</strong></div>
      <div><span>Public Actions</span><strong>${Number(status.frontend.templateActions || 0)}</strong></div>
      <div><span>Engine Actions</span><strong>${Number(status.backend.engineActions || 0)}</strong></div>
      <div><span>Skills</span><strong>${Number(status.backend.skills || 0)}</strong></div>
      <div><span>PDF Tools</span><strong>${Number(status.backend.pdfTools || 0)}</strong></div>
      <div><span>cPanel Safe</span><strong>${status.cpanelSafe ? 'Yes' : 'No'}</strong></div>
    </section>
    <section class="panel">
      <h2>Provider Status</h2>
      <p class="muted">Ready means env value exists. Fallback means the public option still opens, but real provider output may need a real key or enabled live mode.</p>
      <div class="admin-health-grid">${providerRows}</div>
      <ul class="mini-list">${notes}</ul>
    </section>
    <section class="panel">
      <h2>Missing / Fallback Action Scan</h2>
      <h3>Hard Missing Actions</h3>
      <ul class="mini-list">${missing}</ul>
      <h3>Fallback-Covered Skill/Tool Actions</h3>
      <ul class="mini-list">${fallback}</ul>
    </section>
    <section class="panel">
      <h2>Deploy Test Links</h2>
      <pre>https://api.sansaai.in/health
https://api.sansaai.in/api/live-audit/status
https://api.sansaai.in/api/engine/status
https://api.sansaai.in/api/skills/status
https://sansaai.in/?v=sansa-live-all-options-fix-audit-2026-v1</pre>
    </section>
  `));
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const docs = await query(`SELECT * FROM documents ORDER BY created_at DESC LIMIT 30`);
    const logs = await query(`SELECT * FROM chat_logs ORDER BY created_at DESC LIMIT 20`);
    const manual = await query(`SELECT * FROM manual_teachings ORDER BY created_at DESC LIMIT 20`);
    const memories = await query(`SELECT * FROM ai_memories WHERE status = 'active' ORDER BY updated_at DESC LIMIT 20`);
    const subscriptions = await subscriptionRevenueSummary();

    res.send(
      adminShell(`
        <header class="admin-head">
          <div>
            <p class="eyebrow">SANSA AI</p>
            <h1>Super Intelligence Admin</h1>
            <p>Upload documents, manually teach answers, test search quality, and monitor user questions.</p>
          </div>
        </header>

        <section class="admin-health-grid">
          <div><span>Paid Revenue</span><strong>Rs.${Number(subscriptions.paidRevenue || 0).toFixed(2)}</strong></div>
          <div><span>Active Paid</span><strong>${Number(subscriptions.activePaid || 0)}</strong></div>
          <div><span>Pending Plans</span><strong>${Number(subscriptions.pending || 0)}</strong></div>
          <div><span>Total Records</span><strong>${Number(subscriptions.totalSubscriptions || 0)}</strong></div>
        </section>

        <section class="admin-grid">
          <form class="panel" method="post" action="/admin/upload" enctype="multipart/form-data">
            <h2>Knowledge Upload</h2>
            <input name="title" placeholder="Document title" required>
            <input name="category" placeholder="Category, example: gold, refund, payroll" value="general">
            <input name="document" type="file" required>
            <button type="submit">Upload & Process</button>
            <p class="muted">PDF, Word, Excel, PPT, TXT, CSV, HTML, JSON, code files are accepted when Python libraries are installed.</p>
          </form>

          <form class="panel" method="post" action="/admin/teach">
            <h2>Manual Teaching</h2>
            <input name="question" placeholder="Question / intent" required>
            <textarea name="answer" placeholder="Correct answer" required></textarea>
            <input name="category" placeholder="Category" value="manual">
            <button type="submit">Save Teaching</button>
          </form>
        </section>

        <section class="panel">
          <h2>Subscription Control</h2>
          <p class="muted">Public users see free and paid plans. Real money should go through Razorpay/UPI links; card or bank passwords are never stored in SANSA.</p>
          <table><thead><tr><th>Plan</th><th>Status</th><th>Amount</th><th>Invoice</th><th>Provider</th></tr></thead>
          <tbody>${subscriptions.latest
            .map(
              (item) =>
                `<tr><td>${h(item.planName || item.planId)}</td><td>${h(item.status)}</td><td>Rs.${Number(item.amount || 0).toFixed(2)}</td><td>${h(item.invoiceNumber || '')}</td><td>${h(item.provider || '')}</td></tr>`
            )
            .join('') || '<tr><td colspan="5">No subscription records yet.</td></tr>'}</tbody></table>
        </section>

        <section class="panel">
          <h2>Files</h2>
          <table><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Error</th></tr></thead>
          <tbody>${docs.rows
            .map(
              (doc) =>
                `<tr><td>${h(doc.title)}</td><td>${h(doc.category)}</td><td>${h(doc.status)}</td><td>${h(doc.error || '')}</td></tr>`
            )
            .join('')}</tbody></table>
        </section>

        <section class="admin-grid">
          <div class="panel">
            <h2>Manual Items</h2>
            <table><tbody>${manual.rows
              .map((item) => `<tr><td>${h(item.question)}</td><td>${h(item.category)}</td></tr>`)
              .join('')}</tbody></table>
          </div>
          <div class="panel">
            <h2>AI Memories</h2>
            <table><tbody>${memories.rows
              .map((item) => `<tr><td>${h(item.content)}</td><td>${h(item.memory_type)}</td></tr>`)
              .join('')}</tbody></table>
          </div>
        </section>

        <section class="admin-grid">
          <div class="panel">
            <h2>User Logs</h2>
            <table><tbody>${logs.rows
              .map((log) => `<tr><td>${h(log.user_message)}</td><td>${Number(log.context_count)} sources</td></tr>`)
              .join('')}</tbody></table>
          </div>
        </section>
      `)
    );
  } catch (error) {
    next(error);
  }
});

router.post('/upload', requireAdmin, upload.single('document'), async (req, res, next) => {
  try {
    await processUpload(req.file, req.body);
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

router.post('/teach', requireAdmin, async (req, res, next) => {
  try {
    const question = String(req.body.question || '').trim();
    const answer = String(req.body.answer || '').trim();
    const category = String(req.body.category || 'manual').trim();

    const manual = await query(
      `INSERT INTO manual_teachings (question, answer, category, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id`,
      [question, answer, category]
    );

    const embedding = await embedText(`${question}\n${answer}`);
    await query(
      `INSERT INTO knowledge_chunks (title, category, content, keywords, embedding_json, status)
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      [
        `Manual Teaching #${manual.rows[0].id}`,
        category,
        `Question: ${question}\n\nAnswer: ${answer}`,
        question,
        embedding ? JSON.stringify(embedding) : null,
      ]
    );

    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

router.get('/test', requireAdmin, (req, res) => {
  res.send(
    adminShell(`<section class="panel test-panel">
      <h1>Search Testing</h1>
      <textarea id="testQuestion" placeholder="Type a user question"></textarea>
      <button id="testBtn">Test Search</button>
      <pre id="testOutput"></pre>
    </section>
    <script src="/admin-test.js"></script>`)
  );
});

router.post('/test', requireAdmin, async (req, res, next) => {
  try {
    const results = await searchKnowledge(String(req.body.message || ''), 12);
    res.json({ ok: true, results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
