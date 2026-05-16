const fs = require('fs');
const path = require('path');
const { actionCatalog } = require('./realToolEngine');
const { toolCatalog, providerStatus } = require('./toolWorkflows');
const { skillCatalog, skillStatus } = require('./skillEngine');
const { creativeStatus } = require('./creativeTools');

const publicIndexPath = path.join(__dirname, '..', '..', 'public', 'index.html');

function unique(values = []) {
  return [...new Set(values.filter(Boolean))].sort();
}

function extractMatches(source, pattern) {
  const matches = [];
  let match;
  while ((match = pattern.exec(source))) {
    matches.push(match[1]);
  }
  return unique(matches);
}

function readPublicIndex() {
  try {
    return fs.readFileSync(publicIndexPath, 'utf8');
  } catch (error) {
    return '';
  }
}

function envProviders() {
  const pdf = providerStatus();
  const skills = skillStatus();
  const creative = creativeStatus();
  const providers = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    pdfco: Boolean(process.env.PDFCO_API_KEY || process.env.PDFCO_TOKEN),
    cloudconvert: Boolean(process.env.CLOUDCONVERT_API_KEY),
    convertapi: Boolean(process.env.CONVERTAPI_SECRET || process.env.CONVERTAPI_API_SECRET),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    whatsapp: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    vectorengine: Boolean(process.env.VECTORENGINE_API_KEY || process.env.VECTOR_ENGINE_API_KEY),
    vercelGateway: Boolean(process.env.VERCEL_AI_GATEWAY_API_KEY),
    livePdfEngine: String(process.env.SANSA_ENABLE_LIVE_PDF_ENGINE || '').toLowerCase() === 'true',
  };
  return { providers, pdf, skills, creative };
}

function actionCoverage(templateActions = []) {
  const engineActions = actionCatalog();
  const engineIds = new Set(engineActions.map((item) => item.id));
  const skillIds = new Set(skillCatalog().map((skill) => `skill-${skill.id}`));
  const toolIds = new Set(toolCatalog().map((tool) => `tool-${tool.id}`));
  const covered = [];
  const fallbackCovered = [];
  const missing = [];

  templateActions.forEach((id) => {
    if (engineIds.has(id) || skillIds.has(id) || toolIds.has(id)) {
      covered.push(id);
    } else if (id.startsWith('skill-') || id.startsWith('tool-')) {
      fallbackCovered.push(id);
    } else {
      missing.push(id);
    }
  });

  return {
    totalTemplateActions: templateActions.length,
    covered: unique(covered),
    fallbackCovered: unique(fallbackCovered),
    missing: unique(missing),
    engineActions,
  };
}

function providerNotes(providers) {
  const notes = [];
  if (!providers.openai) notes.push('OpenAI missing: image, speech, and OpenAI knowledge tools stay in fallback mode.');
  if (!providers.livePdfEngine) notes.push('SANSA_ENABLE_LIVE_PDF_ENGINE is not true: PDF provider keys are detected but file conversion stays cPanel-safe fallback unless enabled.');
  if (!providers.pdfco && !providers.cloudconvert && !providers.convertapi) notes.push('PDF provider missing: merge/split/compress/convert return workflow reports only.');
  if (!providers.razorpay) notes.push('Razorpay missing or dummy: live payment links stay fallback/UPI mode.');
  if (!providers.whatsapp) notes.push('WhatsApp token/phone ID missing or dummy: automatic WhatsApp send stays message-copy mode.');
  if (!providers.vectorengine) notes.push('VectorEngine missing: RAG/vector search stays local/free-search fallback.');
  if (!providers.anthropic) notes.push('Anthropic missing: Claude-style imported skills stay fallback.');
  return notes;
}

function liveAuditStatus() {
  const html = readPublicIndex();
  const templateActions = extractMatches(html, /data-template-action="([^"]+)"/g);
  const toolTabs = extractMatches(html, /data-tool-tab="([^"]+)"/g);
  const publicFeatures = extractMatches(html, /data-public-feature="([^"]+)"/g);
  const coverage = actionCoverage(templateActions);
  const env = envProviders();
  const notes = providerNotes(env.providers);
  const hardMissing = coverage.missing.filter((id) => !['products'].includes(id));
  const health = hardMissing.length ? 'needs-mapping' : notes.length ? 'working-with-fallbacks' : 'live-ready';

  return {
    ok: true,
    name: 'SANSA Live All Options Fix Audit 2026',
    health,
    cpanelSafe: true,
    apiReady: true,
    frontend: {
      templateActions: coverage.totalTemplateActions,
      toolTabs: toolTabs.length,
      publicFeatures: publicFeatures.length,
      missingActions: hardMissing,
      fallbackCoveredActions: coverage.fallbackCovered,
    },
    backend: {
      engineActions: coverage.engineActions.length,
      pdfTools: toolCatalog().length,
      skills: skillCatalog().length,
      routes: [
        '/api/live-audit/status',
        '/api/engine/status',
        '/api/skills/status',
        '/api/smithery/status',
        '/api/smithery/catalog',
        '/api/platform/status',
        '/api/platform/catalog',
        '/api/tools/engine-status',
        '/admin/live-audit',
      ],
    },
    providers: env.providers,
    providerNotes: notes,
    nextSteps: [
      'Upload latest frontend/backend zips and restart Node app.',
      'Open /api/live-audit/status after restart.',
      'Open /admin/live-audit to see option coverage and provider mode.',
      'Add real provider keys for tools that must generate binary files or send live messages.',
      'Keep fallback enabled so no public option shows a blank page or 404.',
    ],
  };
}

module.exports = {
  liveAuditStatus,
};
