const { toolCatalog } = require('./toolWorkflows');
const { creativeStatus } = require('./creativeTools');

const ACTIONS = [
  ['account', 'Owner Account', 'auth', 'Open owner login/register, session check, and business profile setup.', '/api/auth/login'],
  ['assistant', 'AI Assistant', 'assistant', 'Route Tamil/Tanglish/English commands to invoice, PDF, GST, payment, and CFO workflows.', '/api/ask'],
  ['brain', 'AI Document Brain', 'ai', 'Summarize, compare, detect missing fields, and prepare next action from document text.', '/api/ask'],
  ['cfo', 'AI CFO Dashboard', 'business', 'Analyze sales, pending amount, profit, GST, and next collection action.', '/api/analytics/summary'],
  ['creative-image', 'AI Image Generator', 'creative', 'Prompt to image preview with model/settings controls and download.', '/api/creative/image'],
  ['creative-video', 'AI Video Editor', 'creative', 'Storyboard, shot plan, caption plan, and video workflow output.', '/api/creative/video'],
  ['creative-photo', 'AI Photo Editing', 'creative', 'Upload/photo prompt workflow with PNG export fallback.', '/api/creative/photo-edit'],
  ['creative-translate', 'AI Video Translation', 'creative', 'Transcript or media to subtitle-ready translation output.', '/api/creative/translate'],
  ['creative-sound', 'AI Sound Effects Generator', 'creative', 'Prompt to short WAV sound effect preview.', '/api/creative/sound'],
  ['creative-music', 'AI Music Generator', 'creative', 'Prompt to soundtrack WAV preview and usage notes.', '/api/creative/music'],
  ['dashboard', 'Business Dashboard Pro', 'business', 'Sales, profit, pending, quotes, bank matches, and health cards.', '/api/analytics/summary'],
  ['document', 'PDF Builder', 'pdf', 'Resume, legal, invoice, quotation, and document export workflows.', '/api/services/draft'],
  ['image-pdf', 'Image to PDF', 'pdf', 'Image upload to print-ready PDF layout workflow.', '/api/tools/text-to-pdf'],
  ['invoice', 'Invoice PDF', 'business', 'GST/service invoice, UPI QR, status, customer portal, and history.', '/api/services/draft'],
  ['legal', 'Legal PDF', 'pdf', 'Agreement, affidavit, notice, petition, and review-safe legal drafts.', '/api/services/draft'],
  ['payments', 'Payment Automation', 'business', 'UPI/Razorpay payment link, WhatsApp reminder, ledger, and paid status.', '/api/payments/create-link'],
  ['pdf-text', 'PDF to Text', 'pdf', 'PDF upload to extracted text and copy/download workflow.', '/api/tools/pdf-to-text'],
  ['pricing', 'Plans and Pricing', 'commerce', 'Free, Starter, Business, Pro checkout and subscription status.', '/api/subscription/plans'],
  ['products', 'Product Center', 'product', 'Searchable product catalog with action launch and plan copy.', '/api/engine/catalog'],
  ['quote', 'Quotation', 'business', 'Quotation builder, terms, share text, and invoice conversion.', '/api/services/draft'],
  ['reminders', 'Auto Reminders', 'business', 'Pending invoice reminders, WhatsApp message queue, and due-date actions.', '/api/payments/ledger'],
  ['reports', 'GST Reports', 'business', 'Sales tax, input tax, net payable, CSV export, and accountant summary.', '/api/analytics/summary'],
  ['resume', 'Resume PDF', 'pdf', 'Tamil details to professional resume and career PDF workflow.', '/api/services/draft'],
  ['share', 'Customer Portal / Sign', 'business', 'Customer portal, UPI QR, WhatsApp share, payment proof, and signing flow.', '/api/payments/create-link'],
  ['skills', 'SANSA Skill Hub', 'skills', 'Imported PDF, DOCX, PPTX, XLSX, speech, VectorEngine, OpenAI, design, and automation skills as working tools.', '/api/skills/catalog'],
  ['text-pdf', 'Text to PDF', 'pdf', 'Paste text and export browser-safe PDF.', '/api/tools/text-to-pdf'],
  ['hrms', 'SANSA HRMS', 'hrms', 'Employee master, attendance, payroll, leave, recruitment, offer letters, warning letters, exit process, and HR dashboard.', '/api/platform/run'],
  ['creative-studio', 'SANSA Creative Studio', 'creative', 'AI image, poster, logo, social post, invitation, banner, thumbnail and brand kit workflows with free fallback.', '/api/platform/run'],
  ['pdf-studio', 'SANSA PDF Studio', 'pdf', 'Acrobat-style create, edit, convert, OCR, sign, watermark, page tools and AI document summary.', '/api/platform/run'],
  ['business-os', 'SANSA Business OS', 'business', 'Invoice, quotation, GST, payment reminder, customer ledger, expense OCR, profit dashboard and AI CFO.', '/api/platform/run'],
  ['sansa-payments', 'SANSA Payments', 'commerce', 'UPI/Razorpay payment links, verified webhook status, reminder text, customer proof and audit log.', '/api/platform/run'],
  ['product-about', 'About SANSA', 'support', 'Company/product overview and platform positioning.', '/api/engine/run'],
  ['product-download-install', 'Download and Install', 'support', 'PWA install, cPanel upload, cache refresh, and restart guide.', '/api/engine/run'],
  ['product-enterprise-support', 'Enterprise Support', 'support', 'Large-team setup, onboarding checklist, roles, and support plan.', '/api/engine/run'],
  ['product-fonts', 'Fonts', 'creative', 'Brand font choices, PDF readability, and export style guide.', '/api/engine/run'],
  ['product-nonprofits', 'Non-profits', 'commerce', 'Discounted document/payment workflows for non-profit teams.', '/api/engine/run'],
  ['product-portfolio', 'Portfolio', 'creative', 'Create portfolio samples, business PDFs, and share-ready links.', '/api/engine/run'],
  ['product-status', 'Status Center', 'support', 'Health checks, backend API readiness, deployment status, and incident notes.', '/api/engine/status'],
  ['product-stock', 'Stock Assets', 'creative', 'Reusable business visuals, generated assets, and license-safe asset planning.', '/api/engine/run'],
  ['product-trust', 'Trust Centre', 'security', 'Admin hidden from public, sessions, audit log, API keys, and cPanel-safe packaging.', '/api/engine/status'],
];

function normalizeAction(action = '') {
  const clean = String(action || '').trim().toLowerCase();
  if (clean.startsWith('tool-')) return clean;
  return clean || 'assistant';
}

function pdfToolAction(action) {
  if (!String(action).startsWith('tool-')) return null;
  const id = String(action).slice(5);
  const tool = toolCatalog().find((item) => item.id === id);
  if (!tool) return null;
  return {
    id: action,
    title: tool.title,
    group: 'pdf-tool-runner',
    description: `${tool.title} opens SANSA Tool Runner with upload/details, backend API call, fallback report, copy, and download.`,
    endpoint: '/api/tools/pdf-workflow',
    inputNeeded: tool.input,
    output: tool.output,
    samples: [tool.sample],
    nextSteps: tool.nextSteps,
  };
}

function actionCatalog() {
  const base = ACTIONS.map(([id, title, group, description, endpoint]) => ({
    id,
    title,
    group,
    description,
    endpoint,
  }));
  const toolActions = toolCatalog().map((tool) => ({
    id: `tool-${tool.id}`,
    title: tool.title,
    group: 'pdf-tool-runner',
    description: `${tool.title} opens SANSA Tool Runner with upload/details, output preview, copy, and download.`,
    endpoint: tool.id === 'word-pdf' ? '/api/tools/document-workflow' : '/api/tools/pdf-workflow',
  }));
  return [...base, ...toolActions];
}

function actionById(action = '') {
  const id = normalizeAction(action);
  return pdfToolAction(id) || actionCatalog().find((item) => item.id === id) || actionCatalog().find((item) => item.id === 'assistant');
}

function envStatus() {
  const creative = creativeStatus();
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    pdfco: Boolean(process.env.PDFCO_API_KEY),
    cloudconvert: Boolean(process.env.CLOUDCONVERT_API_KEY),
    convertapi: Boolean(process.env.CONVERTAPI_SECRET || process.env.CONVERTAPI_API_SECRET),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    whatsapp: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    livePdfEngine: String(process.env.SANSA_ENABLE_LIVE_PDF_ENGINE || '').toLowerCase() === 'true',
    creative,
  };
}

function buildRealActionOutput(body = {}) {
  const action = actionById(body.action || body.toolId || body.id);
  const prompt = String(body.prompt || '').trim() || action.description;
  const status = envStatus();
  const providerReady = status.openai || status.pdfco || status.cloudconvert || status.convertapi || status.razorpay || status.whatsapp;
  const nextSteps = [
    `Open ${action.title} internal workspace.`,
    'Collect required input from the user: file, text, customer, amount, language, or settings.',
    `Call backend endpoint ${action.endpoint}.`,
    providerReady ? 'Use configured provider keys when available.' : 'Use cPanel-safe demo fallback because provider keys are not configured.',
    'Return preview/report plus copy/download/share action.',
  ];

  return {
    ok: true,
    action: action.id,
    title: action.title,
    group: action.group,
    endpoint: action.endpoint,
    fallback: !providerReady,
    apiReady: true,
    providerReady,
    text: [
      `SANSA Real Tool Engine - ${action.title}`,
      '',
      `User request: ${prompt}`,
      `Action key: ${action.id}`,
      `Internal endpoint: ${action.endpoint}`,
      '',
      'What this option does:',
      action.description,
      '',
      'Working behavior:',
      '- Opens a SANSA internal workspace instead of an external/dead link.',
      '- Shows required input, useful samples, generated output, copy/download/share actions.',
      '- Uses backend API hooks and cPanel-safe fallback when provider keys are missing.',
      '',
      'Provider readiness:',
      `- OpenAI: ${status.openai ? 'configured' : 'missing'}`,
      `- PDF engine: ${status.pdfco || status.cloudconvert || status.convertapi ? 'configured' : 'missing'}`,
      `- Razorpay: ${status.razorpay ? 'configured' : 'missing'}`,
      `- WhatsApp: ${status.whatsapp ? 'configured' : 'missing'}`,
      '',
      'Next steps:',
      ...nextSteps.map((step, index) => `${index + 1}. ${step}`),
    ].join('\n'),
    filename: `${action.id.replace(/[^a-z0-9]+/gi, '-')}-real-tool-engine.txt`,
    nextSteps,
  };
}

function engineStatus() {
  const catalog = actionCatalog();
  const status = envStatus();
  return {
    ok: true,
    name: 'SANSA Real Tool Engine Admin Pro 2026',
    totalActions: catalog.length,
    groups: [...new Set(catalog.map((item) => item.group))],
    env: status,
    apiReady: true,
    cpanelSafe: true,
    catalog,
  };
}

module.exports = {
  actionCatalog,
  actionById,
  buildRealActionOutput,
  engineStatus,
};
