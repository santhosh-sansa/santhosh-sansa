const SANSA_PAGES = {
  'creative-studio': {
    title: 'SANSA Creative Studio',
    pill: 'CREATIVITY & DESIGN',
    intro: 'Poster, logo, invitation, banner, thumbnail, Tamil design and AI content workflows in one free SANSA workspace.',
    action: 'creative-image',
    endpoint: '/api/engine/run',
    features: ['AI Image Generator', 'Poster Maker', 'Logo Maker', 'WhatsApp Status', 'YouTube Thumbnail', 'Brand Kit'],
  },
  'video-studio': {
    title: 'SANSA Video Studio',
    pill: 'VIDEO WORKSPACE',
    intro: 'Create storyboard, caption plan, video script, translation notes and production checklist without paid AI keys.',
    action: 'creative-video',
    endpoint: '/api/engine/run',
    features: ['AI Video Editor', 'Shot Planner', 'Caption Writer', 'Tamil Translation', 'Sound Brief', 'Export Plan'],
  },
  'image-studio': {
    title: 'SANSA Image Studio',
    pill: 'PHOTO EDITING',
    intro: 'Photoshop-style prompt editing, background notes, product image briefs and social creative outputs.',
    action: 'creative-photo',
    endpoint: '/api/engine/run',
    features: ['Photo Edit Prompt', 'Product Cleanup', 'Offer Banner', 'Crop Guide', 'Color Direction', 'Export Checklist'],
  },
  'photo-organizer': {
    title: 'SANSA Photo Organizer',
    pill: 'PHOTO TO PDF',
    intro: 'Organize customer images, prepare print-ready PDF layout and keep local fallback tools ready.',
    action: 'image-pdf',
    endpoint: '/api/engine/run',
    features: ['Image to PDF', 'JPG to PDF', 'Photo Notes', 'Print Layout', 'Customer Upload', 'Download Workflow'],
  },
  'pdf-studio': {
    title: 'SANSA PDF Studio',
    pill: 'PDF & E-SIGNATURES',
    intro: 'Create, convert, organize, OCR, sign, watermark, compare and redact PDFs with cPanel-safe backend workflows.',
    action: 'tool-edit',
    endpoint: '/api/tools/engine-status',
    features: ['Create PDF', 'Merge PDF', 'Split PDF', 'Compress PDF', 'PDF to Word', 'PDF OCR'],
  },
  'skill-hub': {
    title: 'SANSA Skill Hub',
    pill: 'SKILLS ENGINE',
    intro: 'Run PDF, DOCX, PPTX, XLSX, speech, VectorEngine, automation and design skills from one catalog.',
    action: 'skill-pdf',
    endpoint: '/api/skills/status',
    features: ['PDF.co', 'DOCX Builder', 'PPTX Builder', 'XLSX Builder', 'Speech Studio', 'VectorEngine'],
  },
  'smithery-marketplace': {
    title: 'SANSA Smithery Skill Marketplace',
    pill: 'SKILL MARKETPLACE',
    intro: 'Smithery-style MCP skill packs mapped into SANSA-owned PDF, design, creative, business, HRMS, RAG and support workflows.',
    action: 'smithery-pdf-office-suite',
    endpoint: '/api/smithery/status',
    features: ['PDF Office Pack', 'Design Review Pack', 'Creative Media Pack', 'Business Finance Pack', 'HRMS Pack', 'RAG Knowledge Pack'],
  },
  'business-os': {
    title: 'SANSA Business OS',
    pill: 'BUSINESS & COMMERCE',
    intro: 'Invoices, GST, UPI/Razorpay payment links, customer ledger, payment reminders and AI CFO dashboard.',
    action: 'business-os',
    endpoint: '/api/engine/run',
    features: ['Invoice PDF', 'Quotation', 'GST Report', 'AI CFO', 'Customer Ledger', 'Payment Reminder'],
  },
  'payments': {
    title: 'SANSA Payments',
    pill: 'PAYMENT COLLECTION',
    intro: 'Create payment links, WhatsApp reminders, proof collection and verified webhook status workflow.',
    action: 'payments',
    endpoint: '/api/engine/run',
    features: ['Payment Link', 'UPI Notes', 'Razorpay Ready', 'Webhook Status', 'Reminder Flow', 'Proof Upload'],
  },
  'hrms': {
    title: 'SANSA HRMS',
    pill: 'HR MANAGEMENT',
    intro: 'Employee master, attendance, payroll notes, leave, offer letters, warnings and HR dashboard.',
    action: 'hrms',
    endpoint: '/api/engine/run',
    features: ['Employee Master', 'Attendance', 'Payroll', 'Leave', 'Offer Letter', 'HR Dashboard'],
  },
  'ai-assistant': {
    title: 'SANSA AI Assistant',
    pill: 'BUSINESS AI',
    intro: 'Business-focused assistant modes for HR, finance, legal, marketing, student, document and Tamil workflows.',
    action: 'assistant',
    endpoint: '/api/engine/run',
    features: ['Tamil Assistant', 'Finance Mode', 'Legal Mode', 'Document Brain', 'Student Mode', 'Voice Notes'],
  },
  'products': {
    title: 'SANSA Products',
    pill: 'ALL APPS',
    intro: 'Explore the full SANSA suite: Creative Studio, PDF Studio, HRMS, Business OS, AI Assistant and Payments.',
    action: 'products',
    endpoint: '/api/engine/status',
    features: ['Creative Studio', 'PDF Studio', 'HRMS', 'Business OS', 'AI Assistant', 'Payments'],
  },
  'pricing': {
    title: 'Plans and Pricing',
    pill: 'FREE FIRST',
    intro: 'Start free with daily PDF limits. Upgrade later for no watermark, higher downloads and business automation.',
    action: 'pricing',
    endpoint: '/api/engine/run',
    features: ['Free', 'Starter', 'Business', 'Pro', 'Razorpay Ready', 'Usage Limits'],
  },
  'help': {
    title: 'SANSA Help Centre',
    pill: 'HELP & SUPPORT',
    intro: 'Find setup, cPanel upload, cache refresh, backend status and product support workflows.',
    action: 'assistant',
    endpoint: '/api/live-audit/status',
    features: ['Setup Guide', 'Backend Health', 'Upload Help', 'Cache Refresh', 'Support Ticket', 'Community'],
  },
  'login': {
    title: 'SANSA Login',
    pill: 'ACCOUNT',
    intro: 'Public users can login/register from the homepage dropdown. Admin credentials open the protected editor.',
    action: 'account',
    endpoint: '/api/admin/me',
    features: ['Public Login', 'Register', 'Logout', 'Admin Editor', 'Session Check', 'Secure Cookies'],
  },
  'register': {
    title: 'SANSA Register',
    pill: 'CREATE ACCOUNT',
    intro: 'Create a public business account with name, email, mobile, password and user type validation.',
    action: 'account',
    endpoint: '/api/auth/me',
    features: ['Full Name', 'Email', 'Mobile', 'Password', 'Confirm Password', 'User Type'],
  },
  'stock': {
    title: 'SANSA Stock',
    pill: 'ASSET LIBRARY',
    intro: 'Reusable business visuals, generated assets, brand-safe creative notes and license planning.',
    action: 'product-stock',
    endpoint: '/api/engine/run',
    features: ['Business Assets', 'Poster Ideas', 'Product Images', 'License Notes', 'Brand Kit', 'Download Plan'],
  },
  'sign': {
    title: 'SANSA Sign',
    pill: 'E-SIGNATURES',
    intro: 'Signature request, customer proof, WhatsApp share, portal status and safe PDF handoff workflow.',
    action: 'share',
    endpoint: '/api/engine/run',
    features: ['Fill & Sign', 'Request Signature', 'Proof Upload', 'WhatsApp Share', 'Portal View', 'Audit Notes'],
  },
  'gst-reports': {
    title: 'GST Reports',
    pill: 'TAX WORKSPACE',
    intro: 'Sales tax, input tax, net payable, invoice history and accountant summary in one place.',
    action: 'reports',
    endpoint: '/api/engine/run',
    features: ['Sales Tax', 'Input Credit', 'Net Payable', 'CSV Export', 'Invoice History', 'Accountant Notes'],
  },
  'status': {
    title: 'SANSA Status Centre',
    pill: 'SYSTEM STATUS',
    intro: 'Check backend health, API readiness, provider mode and missing action coverage before deployment.',
    action: 'product-status',
    endpoint: '/api/live-audit/status',
    features: ['Health', 'Live Audit', 'Engine Status', 'Skill Status', 'Provider Check', 'Fallback Mode'],
  },
  'download-install': {
    title: 'Download and Install',
    pill: 'DEPLOY GUIDE',
    intro: 'Upload frontend to public_html, backend to Node app root, run install, restart and hard refresh.',
    action: 'product-download-install',
    endpoint: '/api/live-audit/status',
    features: ['cPanel Upload', 'Node Restart', 'Cache Refresh', 'PWA Install', 'Env Check', 'DNS Check'],
  },
  'enterprise-support': {
    title: 'Enterprise Support',
    pill: 'LARGE TEAM SUPPORT',
    intro: 'Large account setup, onboarding checklist, roles, support plan and deployment help.',
    action: 'product-enterprise-support',
    endpoint: '/api/engine/run',
    features: ['Onboarding', 'Roles', 'Support Plan', 'Audit Logs', 'API Keys', 'Team Setup'],
  },
  'fonts': {
    title: 'SANSA Fonts',
    pill: 'BRAND TYPE',
    intro: 'Brand font choices, PDF readability, invoice style and export-safe typography guide.',
    action: 'product-fonts',
    endpoint: '/api/engine/run',
    features: ['Invoice Font', 'Tamil + English', 'Readability', 'PDF Export', 'Brand Guide', 'Style Preset'],
  },
  'portfolio': {
    title: 'SANSA Portfolio',
    pill: 'SHOWCASE',
    intro: 'Create business portfolio samples, service PDFs, product pages and share-ready links.',
    action: 'product-portfolio',
    endpoint: '/api/engine/run',
    features: ['Portfolio PDF', 'Service Page', 'Product Sheet', 'Client Link', 'Brand Assets', 'Share Notes'],
  },
  'about': {
    title: 'About SANSA',
    pill: 'PLATFORM OVERVIEW',
    intro: 'SANSA combines Adobe-style creativity, Acrobat-style PDF, Zoho-style business, AI assistant and HRMS.',
    action: 'product-about',
    endpoint: '/api/engine/status',
    features: ['Creative', 'PDF', 'Business', 'AI', 'HRMS', 'Payments'],
  },
  'trust': {
    title: 'SANSA Trust Centre',
    pill: 'SECURITY',
    intro: 'Public sessions, admin protection, webhook notes, provider status and deployment safety.',
    action: 'product-trust',
    endpoint: '/api/live-audit/status',
    features: ['HTTPS', 'Admin Session', 'Webhook Verify', 'Audit Trail', 'Fallback Mode', 'API Keys'],
  },
  'nonprofits': {
    title: 'SANSA for Non-profits',
    pill: 'SPECIAL PLANS',
    intro: 'Discounted document, payment, report and community workflow for non-profit teams.',
    action: 'product-nonprofits',
    endpoint: '/api/engine/run',
    features: ['Discount Plan', 'Donation PDF', 'Reports', 'Payment Proof', 'Volunteers', 'Support'],
  },
  'students-teachers': {
    title: 'SANSA for Students and Teachers',
    pill: 'EDUCATION',
    intro: 'Resume, notes, assignments, PDF conversion, poster, learning and document assistant workflows.',
    action: 'resume',
    endpoint: '/api/engine/run',
    features: ['Resume PDF', 'Notes PDF', 'Poster', 'Document Brain', 'Assignments', 'Learning Help'],
  },
  'individuals': {
    title: 'SANSA for Individuals',
    pill: 'PERSONAL TOOLS',
    intro: 'Resume, legal draft, PDF conversion, image to PDF and AI document helper for everyday users.',
    action: 'resume',
    endpoint: '/api/engine/run',
    features: ['Resume', 'Legal Draft', 'Text to PDF', 'Image to PDF', 'PDF OCR', 'AI Summary'],
  },
};

function apiBase() {
  return window.__SANSA_CONFIG__?.apiBaseUrl || 'https://api.sansaai.in';
}

function currentPageKey() {
  const params = new URLSearchParams(location.search);
  return params.get('page') || document.body.dataset.page || location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'products';
}

function pageConfig() {
  return SANSA_PAGES[currentPageKey()] || SANSA_PAGES.products;
}

function renderPage() {
  const config = pageConfig();
  document.title = `${config.title} | SANSA`;
  document.querySelector('[data-page-pill]').textContent = config.pill;
  document.querySelector('[data-page-title]').textContent = config.title;
  document.querySelector('[data-page-intro]').textContent = config.intro;
  document.querySelector('[data-page-action]').textContent = `Run ${config.title}`;
  document.querySelector('[data-page-output]').textContent = 'Backend not checked yet.';
  const grid = document.querySelector('[data-feature-grid]');
  grid.innerHTML = config.features.map((feature) => `
    <article>
      <span>${feature.slice(0, 2).toUpperCase()}</span>
      <strong>${feature}</strong>
      <small>Ready as SANSA fallback workflow. Provider keys can upgrade output later.</small>
    </article>
  `).join('');
}

async function callPageBackend() {
  const config = pageConfig();
  const output = document.querySelector('[data-page-output]');
  output.textContent = 'Connecting to SANSA backend...';
  try {
    const url = `${apiBase()}${config.endpoint}`;
    const request = currentPageKey() === 'smithery-marketplace'
      ? fetch(`${apiBase()}/api/smithery/catalog`, { credentials: 'include' })
      : config.endpoint.endsWith('/run')
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: config.action,
            input: `${config.title} page opened from SANSA Adobe-style route.`,
            context: 'page-route',
          }),
        })
      : fetch(url, { credentials: 'include' });
    const response = await request;
    const data = await response.json().catch(() => ({}));
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    output.textContent = `Backend fallback ready. ${error.message}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderPage();
  document.querySelector('[data-page-action]')?.addEventListener('click', callPageBackend);
  document.querySelector('[data-status-action]')?.addEventListener('click', callPageBackend);
});
