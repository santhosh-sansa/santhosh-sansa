const fs = require('fs/promises');
const path = require('path');

const settingsPath = path.join(__dirname, '..', '..', 'data', 'public-settings.json');

const defaultSettings = {
  hero: {
    pill: 'SANSA PDF GENERATOR',
    title: 'Sansa AI PDF Studio',
    subtitle: 'Create clean Resume, Legal, and Invoice PDFs from simple Tamil or English details.',
  },
  showAdminButton: false,
  quickTools: true,
  platformHub: true,
  pricing: true,
  platform: {
    pill: 'SANSA PDF PLATFORM',
    title: 'All PDF tools in one clean workspace',
    subtitle: 'Upload, create, convert, scan, sign, and share documents from a visual tool hub.',
  },
  services: {
    career: { enabled: true, label: 'Resume PDF', title: 'Career AI', note: 'Tamil details to professional English resume PDF.', price: 'From Rs.49' },
    legal: { enabled: true, label: 'Legal PDF', title: 'Legal Docs', note: 'Agreement, affidavit, notice, and petition drafts.', price: 'From Rs.29' },
    invoice: { enabled: true, label: 'Invoice PDF', title: 'Invoice', note: 'Customer bill with items, totals, tax, and payment notes.', price: 'From Rs.19' },
  },
  tools: {
    dashboard: { enabled: true, label: 'Dashboard' },
    onboarding: { enabled: true, label: 'Onboarding' },
    growth: { enabled: true, label: 'Growth' },
    payments: { enabled: true, label: 'Payments' },
    cfo: { enabled: true, label: 'AI CFO' },
    creative: { enabled: true, label: 'Creative AI' },
    products: { enabled: true, label: 'Products' },
    skills: { enabled: true, label: 'Skill Hub' },
    realEngine: { enabled: true, label: 'Tool Engine' },
    assistant: { enabled: true, label: 'AI Assistant' },
    accountant: { enabled: true, label: 'AI Accountant' },
    profile: { enabled: true, label: 'Business' },
    items: { enabled: true, label: 'Customers & Items' },
    document: { enabled: true, label: 'PDF Builder' },
    history: { enabled: true, label: 'History' },
    quote: { enabled: true, label: 'Quotation' },
    brain: { enabled: true, label: 'AI Brain' },
    reminders: { enabled: true, label: 'Reminders' },
    expenses: { enabled: true, label: 'OCR Expenses' },
    reports: { enabled: true, label: 'GST Reports' },
    share: { enabled: true, label: 'Share' },
  },
  features: {
    'create-pdf': { enabled: true, title: 'Create PDF', note: 'Resume, legal, invoice, quotation.' },
    'text-pdf': { enabled: true, title: 'Text to PDF', note: 'Paste text and download PDF.' },
    'image-pdf': { enabled: true, title: 'Image to PDF', note: 'Photos and images to print PDF.' },
    'jpg-pdf': { enabled: true, title: 'JPG to PDF', note: 'Turn customer photos into PDF pages.' },
    'pdf-text': { enabled: true, title: 'PDF to Text', note: 'Extract readable text from PDFs.' },
    'pdf-word': { enabled: true, title: 'PDF to Word', note: 'Extract text for Word editing.' },
    'word-pdf': { enabled: true, title: 'Word to PDF', note: 'Paste document text and export PDF.' },
    'pdf-excel': { enabled: true, title: 'PDF to Excel', note: 'Extract table text for spreadsheet use.' },
    'pdf-ppt': { enabled: true, title: 'PDF to PPT', note: 'Analyze PDF and prepare slide notes.' },
    'merge-pdf': { enabled: true, title: 'Merge PDF', note: 'Collect pages into one workflow.' },
    'split-pdf': { enabled: true, title: 'Split PDF', note: 'Prepare separate page exports.' },
    'compress-pdf': { enabled: true, title: 'Compress PDF', note: 'Optimize files before sharing.' },
    'organize-pages': { enabled: true, title: 'Organize Pages', note: 'Rotate, reorder, extract, prepare.' },
    'rotate-pages': { enabled: true, title: 'Rotate Pages', note: 'Prepare rotated pages for export.' },
    'extract-pages': { enabled: true, title: 'Extract Pages', note: 'Keep only the pages you need.' },
    'page-numbers': { enabled: true, title: 'Add Page Numbers', note: 'Prepare numbered business PDFs.' },
    'protect-pdf': { enabled: true, title: 'Protect PDF', note: 'Watermark and review-safe export.' },
    'watermark-pdf': { enabled: true, title: 'Add Watermark', note: 'Add SANSA/business watermark.' },
    'compare-pdf': { enabled: true, title: 'Compare PDFs', note: 'Use AI Brain to compare key points.' },
    'redact-pdf': { enabled: true, title: 'Redact PDF', note: 'Find sensitive fields before sharing.' },
    'fill-sign': { enabled: true, title: 'Fill & Sign', note: 'Share, collect proof, WhatsApp.' },
    'request-sign': { enabled: true, title: 'Request Signatures', note: 'Send portal/WhatsApp signing flow.' },
    'ai-analyze': { enabled: true, title: 'AI Analyze PDF', note: 'Summary, key points, mistakes.' },
    'scan-ocr': { enabled: true, title: 'Scan & OCR', note: 'Read bills, resumes, legal PDFs.' },
    'invoice-tool': { enabled: true, title: 'Invoice PDF', note: 'GST bill, UPI QR, customer portal.' },
    'payment-link': { enabled: true, title: 'Payment Link', note: 'UPI/Razorpay link and reminder.' },
    'cfo-dashboard': { enabled: true, title: 'AI CFO Dashboard', note: 'Profit, GST, unpaid, cashflow.' },
    'gst-report': { enabled: true, title: 'GST Report', note: 'Sales tax, input tax, net payable.' },
    'customer-portal': { enabled: true, title: 'Customer Portal', note: 'Invoice view, pay, proof upload.' },
    'resume-tool': { enabled: true, title: 'Resume PDF', note: 'Tamil details to professional resume.' },
    'legal-tool': { enabled: true, title: 'Legal PDF', note: 'Agreement, affidavit, notice drafts.' },
    edit: { enabled: true, title: 'Edit & Create PDF', note: 'Resume, invoice, legal, quotation.' },
    convert: { enabled: true, title: 'Convert to PDF', note: 'Text and images to print-ready PDF.' },
    ocr: { enabled: true, title: 'OCR & Document Brain', note: 'Extract text, summary, risks, missing fields.' },
    sign: { enabled: true, title: 'Sign & Share', note: 'UPI QR, WhatsApp, proof collection.' },
    finance: { enabled: true, title: 'Business Finance', note: 'Dashboard, GST, cashflow, fraud alerts.' },
    collect: { enabled: true, title: 'Collect Payment', note: 'Payment links, reminders, customer ledger.' },
  },
};

function mergeSettings(saved = {}) {
  return {
    ...defaultSettings,
    ...saved,
    hero: { ...defaultSettings.hero, ...(saved.hero || {}) },
    platform: { ...defaultSettings.platform, ...(saved.platform || {}) },
    services: {
      ...defaultSettings.services,
      ...(saved.services || {}),
    },
    tools: {
      ...defaultSettings.tools,
      ...(saved.tools || {}),
    },
    features: {
      ...defaultSettings.features,
      ...(saved.features || {}),
    },
  };
}

async function readPublicSettings() {
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    return mergeSettings(JSON.parse(raw));
  } catch (error) {
    return mergeSettings();
  }
}

async function writePublicSettings(settings) {
  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  const merged = mergeSettings(settings);
  await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2));
  return merged;
}

module.exports = { defaultSettings, readPublicSettings, writePublicSettings };
