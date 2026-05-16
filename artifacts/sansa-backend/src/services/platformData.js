const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const settingsPath = path.join(dataDir, 'platform-settings.json');

const apps = [
  { id: 'creative-studio', name: 'SANSA Creative Studio', icon: 'CS', category: 'all', family: 'featured', description: 'Poster, logo, invitation, banner, thumbnail and brand kit workspace.', action: 'Open', price: 'Use for free', enabled: true },
  { id: 'firefly-generator', name: 'SANSA Firefly Generator', icon: 'Fi', category: 'photo', family: 'generative', description: 'Prompt to image, video plan, sound, music and translation workflows.', action: 'Use for free', price: 'Free credits', enabled: true },
  { id: 'express', name: 'SANSA Express', icon: 'Ex', category: 'graphic-design', family: 'featured', description: 'All-in-one design, video, photo and PDF app for small business.', action: 'Use for free', price: 'Free', enabled: true },
  { id: 'image-studio', name: 'Image Studio', icon: 'Ps', category: 'photo', family: 'featured', description: 'Photoshop-style image editing, cleanup and export workflow.', action: 'Free trial', price: 'Starter', enabled: true },
  { id: 'video-studio', name: 'Video Studio', icon: 'Pr', category: 'video', family: 'featured', description: 'Premiere-style storyboards, captions, shot lists and edit plans.', action: 'Free trial', price: 'Starter', enabled: true },
  { id: 'pdf-studio', name: 'SANSA PDF Studio', icon: 'PDF', category: 'acrobat-pdf', family: 'pdf', description: 'Create, convert, compress, sign, OCR and analyze PDF files.', action: 'Open', price: 'Free', enabled: true },
  { id: 'acrobat-pro', name: 'SANSA Acrobat Pro', icon: 'Ac', category: 'acrobat-pdf', family: 'pdf', description: 'Premium PDF tools with no watermark and higher limits.', action: 'Buy', price: 'Rs 499/mo', enabled: true },
  { id: 'stock', name: 'SANSA Stock', icon: 'St', category: 'cc-services', family: 'assets', description: 'Reusable prompt, brand image and campaign asset library.', action: 'Open', price: 'Included', enabled: true },
  { id: 'illustrator', name: 'Vector Designer', icon: 'Ai', category: 'illustration', family: 'design', description: 'Illustration, icon and vector-style design planning.', action: 'Free trial', price: 'Starter', enabled: true },
  { id: 'lightroom', name: 'Photo Organizer', icon: 'Lr', category: 'photo', family: 'photo', description: 'Photo to PDF, cleanup, print layouts and gallery organization.', action: 'Free trial', price: 'Starter', enabled: true },
  { id: 'substance-3d', name: '3D Product Studio', icon: '3D', category: '3d-ar', family: '3d', description: '3D/AR product scene planning and render brief generator.', action: 'Open', price: 'Business', enabled: true },
  { id: 'hrms', name: 'SANSA HRMS', icon: 'HR', category: 'business', family: 'hrms', description: 'Employee, attendance, payroll, letters and HR workflows.', action: 'Open', price: 'Business', enabled: true },
  { id: 'business-os', name: 'SANSA Business OS', icon: 'OS', category: 'business', family: 'business', description: 'Invoices, GST, payments, ledger, OCR expenses and AI CFO.', action: 'Open', price: 'Business', enabled: true },
  { id: 'assistant', name: 'SANSA AI Assistant', icon: 'AI', category: 'cc-services', family: 'assistant', description: 'Tamil/Tanglish business assistant for documents and operations.', action: 'Open', price: 'Included', enabled: true },
  { id: 'payments', name: 'SANSA Payments', icon: 'Pay', category: 'business', family: 'payments', description: 'UPI/Razorpay-ready links, reminders and payment status.', action: 'Open', price: 'Business', enabled: true },
];

const plans = {
  individuals: [
    { id: 'free', name: 'Free', price: 0, interval: 'forever', badge: 'Start free', description: 'Basic public access with watermark and starter credits.', features: ['2 PDF downloads per day', 'SANSA watermark', 'Creative fallback previews', 'Community support'] },
    { id: 'starter', name: 'Starter', price: 199, interval: 'month', badge: 'Best starter', description: 'For freelancers and small creators.', features: ['50 PDF downloads/day', 'No watermark', 'Invoice and quotation tools', 'UPI payment links'] },
    { id: 'business', name: 'Business', price: 499, interval: 'month', badge: 'Popular', description: 'For shops, teams and service businesses.', features: ['250 PDF downloads/day', 'AI CFO dashboard', 'Customer ledger', 'WhatsApp reminder copy'] },
    { id: 'pro', name: 'Pro', price: 999, interval: 'month', badge: 'Power user', description: 'Advanced document, OCR and automation workflows.', features: ['1000 PDF downloads/day', 'OCR and document brain', 'Advanced reports', 'Priority workflows'] },
  ],
  business: [
    { id: 'team-standard', name: 'Creative Cloud Standard for Teams', price: 3187, interval: 'license/month', badge: 'Best value', description: 'SANSA team suite for small business.', features: ['Role control', 'Shared brand kit', 'Business admin dashboard', 'Team PDF limits'] },
    { id: 'team-pro', name: 'Creative Cloud Pro for Teams', price: 4405, interval: 'license/month', badge: '47% off first year', description: 'Higher credits and business controls.', features: ['AI credits/month', 'Advanced admin', 'Team activity logs', 'Priority support'] },
    { id: 'acrobat-business', name: 'SANSA Acrobat Business', price: 2013, interval: 'license/month', badge: 'PDF teams', description: 'PDF conversion, e-sign and document controls.', features: ['PDF tools', 'E-sign workflow', 'Document audit', 'Team storage plan'] },
  ],
  students: [
    { id: 'student-pro', name: 'Student Creative Pro', price: 398.99, interval: 'month', badge: 'Great value', description: 'Affordable creative + PDF suite for learning.', features: ['Creative tools', 'Portfolio templates', 'PDF builder', 'Tutorial workflows'] },
  ],
  schools: [
    { id: 'student-pack', name: 'Per Student Pack', price: 'Call', interval: 'department', badge: 'Education', description: 'For departments of 100 students or more.', features: ['100 GB storage plan', 'Institutional control', 'Reassign licences', 'Consultation request'] },
    { id: 'institution', name: 'Institution-wide Licence', price: 'Call', interval: 'campus', badge: 'Campus', description: 'Broad access for students and faculty.', features: ['Faculty access', 'Consolidated billing', 'Deployment plan', 'Consultation request'] },
  ],
};

const defaultSettings = {
  promo: {
    label: 'Launch offer:',
    text: 'Save over 55% for the first year on SANSA Creative Pro.',
    cta: 'Save now',
  },
  hero: {
    title: 'Create something new with SANSA AI.',
    subtitle: 'Get creative, PDF, business and AI tools in one SANSA workspace.',
    price: 'Start free. Upgrade from Rs 199/mo.',
    primary: 'Free trial',
    secondary: 'Save today',
  },
  enabledFamilies: ['featured', 'generative', 'pdf', 'business', 'hrms', 'assistant', 'payments'],
};

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

async function readPlatformSettings() {
  return { ...defaultSettings, ...(await readJson(settingsPath, {})) };
}

async function writePlatformSettings(settings = {}) {
  const current = await readPlatformSettings();
  const next = {
    ...current,
    ...settings,
    promo: { ...(current.promo || {}), ...(settings.promo || {}) },
    hero: { ...(current.hero || {}), ...(settings.hero || {}) },
  };
  await writeJson(settingsPath, next);
  return next;
}

async function getApps(category = 'all') {
  const settings = await readPlatformSettings();
  const key = String(category || 'all').toLowerCase();
  return apps.filter((app) => app.enabled !== false)
    .filter((app) => key === 'all' || app.category === key || app.family === key);
}

module.exports = {
  apps,
  plans,
  readPlatformSettings,
  writePlatformSettings,
  getApps,
};
