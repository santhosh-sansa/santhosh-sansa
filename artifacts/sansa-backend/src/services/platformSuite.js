const FREE_MODE = String(process.env.USE_OPENAI || '').toLowerCase() !== 'true' || !process.env.OPENAI_API_KEY;

const products = [
  {
    id: 'creative-studio',
    icon: 'CS',
    title: 'SANSA Creative Studio',
    category: 'creative',
    tagline: 'Adobe Express + Firefly style creator for Indian business content.',
    features: ['AI image generator', 'Poster maker', 'Logo maker', 'WhatsApp status creator', 'YouTube thumbnail maker', 'Brand kit'],
    action: 'creative-image',
    freeMode: 'Canvas preview, poster copy, brand kit notes, downloadable text plan and browser-safe design workflow.',
    providerMode: 'OpenAI/Gemini/image API can be connected later for real image generation.',
  },
  {
    id: 'pdf-studio',
    icon: 'PDF',
    title: 'SANSA PDF Studio',
    category: 'pdf',
    tagline: 'Acrobat-style PDF create, convert, sign, OCR and AI summary workspace.',
    features: ['PDF create', 'Merge/split/compress', 'PDF to Word', 'Word to PDF', 'OCR', 'E-signature', 'AI PDF summary'],
    action: 'document',
    freeMode: 'Text/Image to PDF, PDF text extraction, tool runner reports, watermark/page/sign workflows with fallback.',
    providerMode: 'PDF.co, CloudConvert or ConvertAPI can generate real binary conversions when keys are added.',
  },
  {
    id: 'hrms',
    icon: 'HR',
    title: 'SANSA HRMS',
    category: 'hrms',
    tagline: 'Employee, attendance, payroll, letters and HR dashboard for companies.',
    features: ['Employee master', 'Attendance', 'Payroll', 'Leave', 'Recruitment', 'Offer letter', 'Exit process'],
    action: 'hrms',
    freeMode: 'Local HR templates, payroll checklist, attendance CSV plan, offer/warning/exit letter drafts.',
    providerMode: 'Database + WhatsApp/email APIs can be connected later for live employee portal.',
  },
  {
    id: 'business-os',
    icon: 'OS',
    title: 'SANSA Business OS',
    category: 'business',
    tagline: 'Invoice, GST, payments, customer ledger, OCR expense and AI CFO.',
    features: ['Invoice', 'Quotation', 'GST report', 'Payment reminders', 'UPI link', 'Expense OCR', 'Profit dashboard'],
    action: 'dashboard',
    freeMode: 'Invoice drafts, GST summary, ledger views, payment reminder copy and CFO fallback analysis.',
    providerMode: 'Razorpay/WhatsApp/OCR APIs can be connected later for live automation.',
  },
  {
    id: 'ai-assistant',
    icon: 'AI',
    title: 'SANSA AI Assistant',
    category: 'assistant',
    tagline: 'Business-focused ChatGPT-style assistant with Tamil/Tanglish modes.',
    features: ['HR mode', 'Finance mode', 'Legal mode', 'Marketing mode', 'Coding mode', 'Student mode', 'Document assistant'],
    action: 'assistant',
    freeMode: 'Built-in SANSA knowledge, local routing, free search mode and structured fallback answers.',
    providerMode: 'OpenAI/Gemini/Claude can be connected later for stronger reasoning.',
  },
  {
    id: 'payments',
    icon: 'PAY',
    title: 'SANSA Payments',
    category: 'business',
    tagline: 'UPI/Razorpay links, paid status, reminders and customer proof collection.',
    features: ['UPI note', 'Payment link', 'Webhook status', 'Reminder text', 'Customer portal', 'Audit log'],
    action: 'payments',
    freeMode: 'UPI/payment message generation, customer portal copy, ledger fallback and status notes.',
    providerMode: 'Razorpay key + webhook secret enables live payment links and verified paid status.',
  },
];

const adminControls = [
  'User create / block / delete',
  'User plan, PDF limit and AI credit control',
  'Product enable / disable',
  'Pricing and coupon edit',
  'Template upload and homepage banner edit',
  'AI prompt and provider mode control',
  'API key readiness checker',
  'Login history, audit trail and error logs',
  'Database backup plan',
  'Role model: Super Admin, Manager, Support, Finance',
];

const roadmap = [
  'Phase 1: Login, register, dashboard, admin panel, pricing, PDF tools.',
  'Phase 2: AI chat, PDF summary, invoice, payment link, OCR.',
  'Phase 3: HRMS, payroll, attendance, offer letter, appraisal.',
  'Phase 4: Creative Studio, poster maker, image generator, video script generator.',
  'Phase 5: Mobile PWA, WhatsApp integration, API marketplace, enterprise plan.',
];

const databaseTables = [
  'users',
  'roles',
  'products',
  'subscriptions',
  'payments',
  'ai_usage',
  'pdf_files',
  'templates',
  'invoices',
  'customers',
  'employees',
  'attendance',
  'payroll',
  'support_tickets',
  'admin_logs',
  'settings',
];

function platformStatus() {
  return {
    ok: true,
    name: 'SANSA Adobe + Acrobat + Zoho + AI + HRMS Platform',
    freeFirst: true,
    openaiRequired: false,
    mode: FREE_MODE ? 'free-local-fallback' : 'provider-ready',
    products: products.length,
    providers: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      pdf: Boolean(process.env.PDFCO_API_KEY || process.env.CLOUDCONVERT_API_KEY || process.env.CONVERTAPI_SECRET),
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      whatsapp: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      vectorengine: Boolean(process.env.VECTORENGINE_API_KEY || process.env.VECTOR_ENGINE_API_KEY),
    },
    note: 'No OpenAI key required. Missing paid providers use cPanel-safe fallback workflows.',
  };
}

function platformCatalog() {
  return {
    ok: true,
    status: platformStatus(),
    products,
    adminControls,
    roadmap,
    databaseTables,
  };
}

function productById(id = '') {
  const key = String(id || '').trim().toLowerCase();
  return products.find((product) => product.id === key) || products.find((product) => product.id === 'business-os');
}

function runPlatformProduct(body = {}) {
  const product = productById(body.productId || body.id);
  const prompt = String(body.prompt || '').trim() || product.tagline;
  const status = platformStatus();
  return {
    ok: true,
    productId: product.id,
    title: product.title,
    action: product.action,
    fallback: status.mode === 'free-local-fallback',
    apiReady: true,
    filename: `${product.id}-sansa-platform-plan.txt`,
    text: [
      `${product.title} - SANSA Free Working Plan`,
      '',
      `Request: ${prompt}`,
      `Category: ${product.category}`,
      '',
      'Main features:',
      ...product.features.map((feature) => `- ${feature}`),
      '',
      'Free mode now:',
      `- ${product.freeMode}`,
      '',
      'Provider upgrade later:',
      `- ${product.providerMode}`,
      '',
      'Admin control:',
      '- Enable/disable product, edit labels/pricing/templates, watch usage and audit logs.',
      '',
      'Current provider status:',
      `- OpenAI: ${status.providers.openai ? 'configured' : 'not required / fallback active'}`,
      `- PDF engine: ${status.providers.pdf ? 'configured' : 'fallback active'}`,
      `- Razorpay: ${status.providers.razorpay ? 'configured' : 'fallback active'}`,
      `- WhatsApp: ${status.providers.whatsapp ? 'configured' : 'fallback active'}`,
    ].join('\n'),
  };
}

module.exports = {
  platformCatalog,
  platformStatus,
  runPlatformProduct,
};
