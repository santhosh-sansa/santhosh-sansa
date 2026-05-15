const smitherySkillPacks = [
  {
    id: 'smithery-pdf-office-suite',
    title: 'PDF + Office Automation Pack',
    category: 'Documents',
    mapsTo: ['pdf', 'pdfco', 'docx', 'pptx', 'xlsx'],
    endpoint: '/api/skills/run',
    description: 'PDF, DOCX, PPTX, XLSX, OCR, conversion, report and spreadsheet workflows for SANSA PDF Studio.',
    env: ['PDFCO_API_KEY', 'CONVERTAPI_SECRET', 'OPENAI_API_KEY'],
  },
  {
    id: 'smithery-design-review-pack',
    title: 'Design Review + Theme Factory Pack',
    category: 'Design',
    mapsTo: ['frontend-design', 'web-design-reviewer', 'theme-factory'],
    endpoint: '/api/skills/run',
    description: 'Frontend design, page quality review, theme tokens and responsive layout checklist for SANSA public pages.',
    env: ['OPENAI_API_KEY'],
  },
  {
    id: 'smithery-creative-media-pack',
    title: 'Creative Media Pack',
    category: 'Creative',
    mapsTo: ['creative-image', 'creative-video', 'creative-photo', 'creative-translate', 'creative-sound', 'creative-music'],
    endpoint: '/api/engine/run',
    description: 'AI image, video plan, photo edit, translation, sound effect and music workflow mapped to SANSA Creative Studio.',
    env: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  {
    id: 'smithery-business-finance-pack',
    title: 'Business Finance Pack',
    category: 'Business',
    mapsTo: ['invoice', 'payments', 'reports', 'cfo', 'dashboard', 'quote'],
    endpoint: '/api/engine/run',
    description: 'Invoices, GST, payment reminders, CFO summary, quotation and customer ledger workflows.',
    env: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  {
    id: 'smithery-hrms-operations-pack',
    title: 'HRMS Operations Pack',
    category: 'HRMS',
    mapsTo: ['hrms', 'document', 'skill-docx', 'skill-automation-recommender'],
    endpoint: '/api/engine/run',
    description: 'Employee master, attendance, payroll notes, offer letters, warning letters and HR automation workflows.',
    env: ['OPENAI_API_KEY'],
  },
  {
    id: 'smithery-rag-knowledge-pack',
    title: 'RAG Knowledge + Vector Search Pack',
    category: 'AI Knowledge',
    mapsTo: ['skill-vectorengine', 'skill-openai-knowledge', 'brain', 'assistant'],
    endpoint: '/api/skills/run',
    description: 'VectorEngine, document brain, knowledge assistant and support search flows for SANSA AI.',
    env: ['VECTORENGINE_API_KEY', 'VECTOR_ENGINE_API_KEY', 'OPENAI_API_KEY'],
  },
  {
    id: 'smithery-agent-builder-pack',
    title: 'Agent Builder Pack',
    category: 'Developer AI',
    mapsTo: ['skill-agent-development', 'skill-creator', 'skill-ai-sdk', 'skill-automation-recommender'],
    endpoint: '/api/skills/run',
    description: 'Agent prompts, skill blueprints, AI SDK route plans and automation recommendations.',
    env: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'VERCEL_AI_GATEWAY_API_KEY'],
  },
  {
    id: 'smithery-support-deploy-pack',
    title: 'Support + Deploy Pack',
    category: 'Support',
    mapsTo: ['product-download-install', 'product-status', 'product-enterprise-support', 'assistant'],
    endpoint: '/api/engine/run',
    description: 'cPanel deploy guide, live audit status, provider readiness, cache refresh and customer support workflows.',
    env: ['ADMIN_USERNAME', 'ADMIN_PASSWORD'],
  },
];

function hasAnyEnv(keys = []) {
  return keys.some((key) => Boolean(process.env[key]));
}

function smitheryStatus() {
  const enabled = smitherySkillPacks.filter((pack) => hasAnyEnv(pack.env)).length;
  return {
    ok: true,
    name: 'SANSA Smithery Skill Marketplace',
    mode: 'own-implementation',
    note: 'Smithery-style marketplace mapping is implemented as SANSA-owned skill packs; no third-party code is copied.',
    packs: smitherySkillPacks.length,
    providerReadyPacks: enabled,
    fallbackPacks: smitherySkillPacks.length - enabled,
    categories: [...new Set(smitherySkillPacks.map((pack) => pack.category))],
  };
}

function smitheryCatalog() {
  return {
    ...smitheryStatus(),
    packs: smitherySkillPacks.map((pack) => ({
      ...pack,
      providerConfigured: hasAnyEnv(pack.env),
      fallback: !hasAnyEnv(pack.env),
      installState: 'attached-to-sansa',
    })),
  };
}

function smitheryPackById(packId = '') {
  return smitherySkillPacks.find((pack) => pack.id === String(packId).trim()) || smitherySkillPacks[0];
}

function runSmitheryPack(body = {}) {
  const pack = smitheryPackById(body.packId || body.id);
  const prompt = String(body.prompt || body.details || '').trim() || `Run ${pack.title} for SANSA.`;
  const providerConfigured = hasAnyEnv(pack.env);
  return {
    ok: true,
    packId: pack.id,
    title: pack.title,
    category: pack.category,
    providerConfigured,
    fallback: !providerConfigured,
    endpoint: pack.endpoint,
    mappedActions: pack.mapsTo,
    filename: `${pack.id}-sansa-smithery-plan.txt`,
    text: [
      `SANSA Smithery Skill Pack - ${pack.title}`,
      '',
      `Request: ${prompt}`,
      `Category: ${pack.category}`,
      `Provider mode: ${providerConfigured ? 'API keys detected' : 'fallback / API-ready'}`,
      '',
      'What is attached to SANSA:',
      ...pack.mapsTo.map((action) => `- ${action}`),
      '',
      'How it works:',
      `1. Frontend opens the matching SANSA workspace.`,
      `2. Backend receives prompt/file details through ${pack.endpoint}.`,
      '3. If provider keys are available, live API mode can be enabled.',
      '4. If keys are missing, cPanel-safe fallback output still works.',
      '',
      'Implementation safety:',
      '- This is a SANSA-owned implementation inspired by marketplace categories.',
      '- Third-party skill source code is not copied.',
      '- API keys stay only in backend environment variables.',
    ].join('\n'),
    nextSteps: [
      'Open Skill Hub from the public site.',
      'Choose the matching SANSA skill/tool and run it.',
      'Add provider keys later for live binary/API outputs.',
    ],
  };
}

module.exports = {
  smitheryCatalog,
  smitheryStatus,
  runSmitheryPack,
};
