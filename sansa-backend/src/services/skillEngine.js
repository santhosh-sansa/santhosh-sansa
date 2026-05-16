const crypto = require('crypto');

const skillCatalog = [
  {
    id: 'pdf',
    title: 'PDF Skill Engine',
    icon: 'PDF',
    group: 'Documents',
    provider: 'PDF.co / OpenAI optional',
    env: ['PDFCO_API_KEY', 'OPENAI_API_KEY'],
    accepts: '.pdf, text, page ranges',
    action: 'Extract, merge, split, rotate, watermark, protect, redact and OCR workflow.',
    samples: ['invoice PDF text extract pannu', 'agreement pages 1-3 split pannu', 'unpaid watermark add pannu'],
  },
  {
    id: 'pdfco',
    title: 'PDF.co API Connector',
    icon: 'CO',
    group: 'Provider API',
    provider: 'PDF.co',
    env: ['PDFCO_API_KEY', 'PDFCO_TOKEN'],
    accepts: 'PDF URL or uploaded file name',
    action: 'PDF to text, CSV, merge, split and automation request builder.',
    samples: ['PDF.co OCR request build pannu', 'PDF to CSV API payload create pannu'],
  },
  {
    id: 'docx',
    title: 'DOCX Word Builder',
    icon: 'DOC',
    group: 'Documents',
    provider: 'OpenAI optional',
    env: ['OPENAI_API_KEY'],
    accepts: '.docx, text, report details',
    action: 'Word report, memo, letter, table of contents and edit checklist.',
    samples: ['GST report Word document create pannu', 'business proposal docx outline pannu'],
  },
  {
    id: 'pptx',
    title: 'PPTX Presentation Builder',
    icon: 'PPT',
    group: 'Documents',
    provider: 'OpenAI optional',
    env: ['OPENAI_API_KEY'],
    accepts: '.pptx, topic, slide count',
    action: 'Pitch deck outline, slide notes, speaker notes and design direction.',
    samples: ['invoice app pitch deck 8 slides', 'school project presentation create pannu'],
  },
  {
    id: 'xlsx',
    title: 'XLSX Spreadsheet Builder',
    icon: 'XLS',
    group: 'Documents',
    provider: 'OpenAI optional',
    env: ['OPENAI_API_KEY'],
    accepts: '.xlsx, CSV, table details',
    action: 'CSV table, formulas, ledger columns, GST summaries and import-ready output.',
    samples: ['customer ledger xlsx columns create pannu', 'GST sales purchase table pannu'],
  },
  {
    id: 'speech',
    title: 'OpenAI Speech Studio',
    icon: 'VO',
    group: 'Audio',
    provider: 'OpenAI Audio',
    env: ['OPENAI_API_KEY'],
    accepts: 'Text, voice, style, batch lines',
    action: 'TTS voiceover script, API request plan and disclosure-ready narration output.',
    samples: ['Tamil invoice reminder voiceover', 'product demo English narration'],
  },
  {
    id: 'openai-knowledge',
    title: 'OpenAI Knowledge Assistant',
    icon: 'OA',
    group: 'Developer AI',
    provider: 'OpenAI Docs / API',
    env: ['OPENAI_API_KEY'],
    accepts: 'API question, feature plan, model requirement',
    action: 'Responses API, tools, streaming, Realtime, auth and model implementation guidance.',
    samples: ['OpenAI image API epti connect pannu', 'Responses API streaming route create pannu'],
  },
  {
    id: 'vectorengine',
    title: 'VectorEngine AI Connector',
    icon: 'VE',
    group: 'Developer AI',
    provider: 'VectorEngine AI',
    env: ['VECTORENGINE_API_KEY', 'VECTOR_ENGINE_API_KEY'],
    accepts: 'Vector search, RAG, knowledge base, API token',
    action: 'VectorEngine token status, backend-only API plan, RAG workflow, embeddings/search routing and cPanel env checklist.',
    samples: ['VectorEngine API key status check pannu', 'Sansa knowledge search-ku VectorEngine RAG plan create pannu'],
  },
  {
    id: 'ai-sdk',
    title: 'Vercel AI SDK Builder',
    icon: 'SDK',
    group: 'Developer AI',
    provider: 'Vercel AI SDK',
    env: ['OPENAI_API_KEY', 'VERCEL_AI_GATEWAY_API_KEY'],
    accepts: 'Agent/chatbot/RAG feature request',
    action: 'AI SDK route, chat UI, tool calling, structured output and streaming plan.',
    samples: ['AI chatbot route code plan', 'tool calling agent architecture pannu'],
  },
  {
    id: 'agent-development',
    title: 'Agent Development Studio',
    icon: 'AG',
    group: 'Developer AI',
    provider: 'Local knowledge',
    env: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'],
    accepts: 'Agent name, role, trigger, tools',
    action: 'Agent frontmatter, system prompt, trigger rules, tool permissions and test cases.',
    samples: ['invoice reviewer agent create pannu', 'support agent system prompt build pannu'],
  },
  {
    id: 'skill-creator',
    title: 'Skill Creator',
    icon: 'SK',
    group: 'Developer AI',
    provider: 'Local knowledge',
    env: ['OPENAI_API_KEY'],
    accepts: 'Skill goal, trigger, workflow',
    action: 'SKILL.md blueprint with description, workflow, examples, safety and tests.',
    samples: ['GST filing skill create pannu', 'PDF automation skill write pannu'],
  },
  {
    id: 'automation-recommender',
    title: 'Automation Recommender',
    icon: 'AUTO',
    group: 'Operations',
    provider: 'Local knowledge',
    env: ['OPENAI_API_KEY'],
    accepts: 'Project type, repeated tasks, pain points',
    action: 'Hooks, agents, skills, MCP, plugin and deployment automation recommendations.',
    samples: ['Sansa site-ku automation recommend pannu', 'cPanel deployment checklist auto pannu'],
  },
  {
    id: 'theme-factory',
    title: 'Theme Factory',
    icon: 'CSS',
    group: 'Design',
    provider: 'Local knowledge',
    env: ['OPENAI_API_KEY'],
    accepts: 'Brand, audience, color direction',
    action: 'CSS variables, typography, spacing, component states and theme rollout plan.',
    samples: ['Adobe white Sansa theme refine pannu', 'premium invoice dashboard theme create pannu'],
  },
  {
    id: 'frontend-design',
    title: 'Frontend Design Builder',
    icon: 'UI',
    group: 'Design',
    provider: 'Local knowledge',
    env: ['OPENAI_API_KEY'],
    accepts: 'Page/component requirement',
    action: 'Production UI spec, layout system, responsive rules and implementation checklist.',
    samples: ['Sansa admin panel strong UI plan', 'mobile PDF tool page design pannu'],
  },
  {
    id: 'web-design-reviewer',
    title: 'Web Design Reviewer',
    icon: 'REV',
    group: 'Design',
    provider: 'Browser optional',
    env: ['OPENAI_API_KEY'],
    accepts: 'Website URL or screenshot notes',
    action: 'Visual QA report for spacing, text overflow, hierarchy, mobile and accessibility.',
    samples: ['sansaai.in design review pannu', 'admin panel overlap issues find pannu'],
  },
  {
    id: 'excalidraw-diagram',
    title: 'Excalidraw Diagram Generator',
    icon: 'DRAW',
    group: 'Visuals',
    provider: 'Local JSON',
    env: ['OPENAI_API_KEY'],
    accepts: 'Diagram description',
    action: 'Flowchart, architecture, mind map and ER diagram plan with Excalidraw JSON skeleton.',
    samples: ['invoice to payment workflow diagram', 'Sansa backend architecture draw pannu'],
  },
];

function skillById(skillId) {
  const id = String(skillId || '').trim().toLowerCase();
  return skillCatalog.find((skill) => skill.id === id) || skillCatalog[0];
}

function hasAnyEnv(keys = []) {
  return keys.some((key) => Boolean(process.env[key]));
}

function skillStatus() {
  return {
    ok: true,
    mode: 'cPanel-safe skill engine',
    apiReady: true,
    skills: skillCatalog.length,
    providers: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      pdfco: Boolean(process.env.PDFCO_API_KEY || process.env.PDFCO_TOKEN),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      vercelGateway: Boolean(process.env.VERCEL_AI_GATEWAY_API_KEY),
      vectorengine: Boolean(process.env.VECTORENGINE_API_KEY || process.env.VECTOR_ENGINE_API_KEY),
    },
  };
}

function compactFileList(files = [], body = {}) {
  const fromFiles = (files || []).map((file) => ({
    name: file.originalname || file.filename || 'uploaded-file',
    type: file.mimetype || 'application/octet-stream',
    size: file.size || 0,
  }));
  if (fromFiles.length) return fromFiles;
  const fileName = String(body.fileName || '').trim();
  if (!fileName) return [];
  return fileName.split(',').map((name) => ({ name: name.trim(), type: body.fileType || 'unknown', size: 0 })).filter((item) => item.name);
}

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildCsv(prompt) {
  const rows = [
    ['Date', 'Customer', 'Document', 'Amount', 'GST', 'Status'],
    ['2026-05-11', 'Sample Customer', 'Invoice', '5000', '900', 'Pending'],
    ['2026-05-11', 'Demo Client', 'Payment', '2500', '450', 'Paid'],
  ];
  if (/ledger|customer/i.test(prompt)) {
    rows[0] = ['Customer', 'Total Billed', 'Paid', 'Pending', 'Last Payment', 'Next Action'];
    rows[1] = ['Raj Kumar', '5900', '0', '5900', '-', 'Send WhatsApp reminder'];
    rows[2] = ['Sansa Demo', '11800', '11800', '0', '2026-05-11', 'Send receipt'];
  }
  return rows.map((row) => row.join(',')).join('\n');
}

function buildExcalidrawJson(prompt) {
  const labels = ['Start', 'Upload or type details', 'SANSA AI processes', 'Preview output', 'Copy / Download'];
  const elements = labels.map((label, index) => ({
    id: crypto.createHash('md5').update(`${label}-${index}`).digest('hex').slice(0, 12),
    type: 'rectangle',
    x: 80 + index * 220,
    y: 120,
    width: 160,
    height: 70,
    angle: 0,
    strokeColor: '#111827',
    backgroundColor: index === 2 ? '#dbeafe' : '#ffffff',
    seed: index + 100,
    version: 1,
    versionNonce: index + 200,
    isDeleted: false,
    boundElements: [],
    updated: 1,
    link: null,
    locked: false,
  }));
  return JSON.stringify({
    type: 'excalidraw',
    version: 2,
    source: 'SANSA AI Skill Hub',
    appState: { viewBackgroundColor: '#ffffff' },
    elements,
    files: {},
    prompt,
  }, null, 2);
}

function workflowFor(skill, prompt, files, options = {}) {
  const fileSummary = files.length
    ? files.map((file) => `${file.name} (${file.type || 'unknown'}, ${file.size || 0} bytes)`).join(', ')
    : 'No file uploaded';
  const lines = [
    `SANSA ${skill.title} - Working Skill Output`,
    '',
    `Skill: ${skill.id}`,
    `Group: ${skill.group}`,
    `Provider: ${skill.provider}`,
    `Input accepted: ${skill.accepts}`,
    `Files: ${fileSummary}`,
    `Request: ${prompt || skill.samples[0]}`,
    '',
    'What this tool does now:',
    `- ${skill.action}`,
    '- Opens inside SANSA, accepts prompt/file input, returns useful output, copy and download.',
    '- Runs safely on cPanel without heavy native binaries.',
    '- Provider/API hooks are ready; when keys are missing, fallback output keeps the public site working.',
    '',
  ];

  if (skill.id === 'xlsx') {
    lines.push('Generated CSV preview:', buildCsv(prompt), '');
  } else if (skill.id === 'excalidraw-diagram') {
    lines.push('Generated Excalidraw JSON skeleton:', buildExcalidrawJson(prompt), '');
  } else if (skill.id === 'agent-development') {
    const agentName = String(options.agentName || prompt || 'sansa-specialist-agent').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sansa-agent';
    lines.push(
      'Agent blueprint:',
      '---',
      `name: ${agentName.slice(0, 50)}`,
      `description: Use this agent when ${prompt || 'a SANSA workflow needs autonomous analysis and a clear output plan'}.`,
      'model: inherit',
      'tools: ["Read", "Grep", "Write"]',
      '---',
      '',
      'Responsibilities:',
      '1. Understand the requested SANSA workflow.',
      '2. Gather only needed files/context.',
      '3. Produce a focused implementation or review result.',
      ''
    );
  } else if (skill.id === 'skill-creator') {
    lines.push(
      'SKILL.md blueprint:',
      '---',
      `name: ${String(prompt || 'sansa-skill').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) || 'sansa-skill'}`,
      `description: Use when the user needs ${prompt || 'a repeatable SANSA workflow'}.`,
      '---',
      '',
      '# Workflow',
      '1. Collect input and constraints.',
      '2. Run SANSA cPanel-safe workflow.',
      '3. Return preview, copy, download and next steps.',
      ''
    );
  } else if (skill.id === 'speech') {
    lines.push(
      'Voiceover script:',
      prompt || 'Vanakkam. Your SANSA invoice is ready. Please review the bill and complete payment using the secure link.',
      '',
      'API-ready request:',
      'Model: gpt-4o-mini-tts',
      'Voice: cedar or marin',
      'Output: mp3 or wav',
      'Disclosure: This voice is AI-generated.',
      ''
    );
  } else if (skill.id === 'openai-knowledge') {
    lines.push(
      'OpenAI implementation checklist:',
      '1. Put OPENAI_API_KEY in MilesWeb Node app environment.',
      '2. Use backend route only; do not expose keys in frontend.',
      '3. Use Responses API for text/tool workflows and image/audio APIs for media workflows.',
      '4. Keep fallback responses for demo mode.',
      ''
    );
  } else if (skill.id === 'vectorengine') {
    lines.push(
      'VectorEngine AI implementation checklist:',
      '1. Put VECTORENGINE_API_KEY in MilesWeb Node app environment.',
      '2. Optional alias supported: VECTOR_ENGINE_API_KEY.',
      '3. Keep token only in backend env; never paste it into frontend JavaScript.',
      '4. Restart MilesWeb Node app after saving env variables.',
      '5. Use backend route as the only place that calls https://api.vectorengine.ai.',
      '',
      'Backend access pattern:',
      'const vectorKey = process.env.VECTORENGINE_API_KEY || process.env.VECTOR_ENGINE_API_KEY;',
      'const vectorBaseUrl = process.env.VECTORENGINE_API_URL || "https://api.vectorengine.ai";',
      '',
      'SANSA use cases:',
      '- Store website/admin knowledge as searchable vectors.',
      '- Search uploaded PDF/DOCX text before answering.',
      '- Power AI Document Brain, Skill Hub, support answers and product search.',
      '- Fall back to local knowledge/free search when the key is missing.',
      ''
    );
  } else if (skill.id === 'ai-sdk') {
    lines.push(
      'AI SDK implementation plan:',
      '1. Add server route for generate/stream output.',
      '2. Keep provider key in backend env.',
      '3. Add tool calling schema for invoice, PDF, payment and GST actions.',
      '4. Typecheck after adding package-specific code.',
      ''
    );
  } else if (skill.id === 'theme-factory' || skill.id === 'frontend-design') {
    lines.push(
      'Design output:',
      'CSS tokens:',
      '--sansa-bg: #ffffff;',
      '--sansa-ink: #111827;',
      '--sansa-accent: #3366ff;',
      '--sansa-warn: #ffdf5d;',
      '--sansa-radius: 8px;',
      '',
      'Implementation: keep dense business tools readable, reduce text blocks, add icon-led actions, verify mobile spacing.',
      ''
    );
  } else if (skill.id === 'web-design-reviewer') {
    lines.push(
      'Review checklist:',
      '1. Check first viewport: brand, main CTA, login card, no overlap.',
      '2. Check all menu dropdowns and tool tabs.',
      '3. Check mobile text wrapping and button hit targets.',
      '4. Check white template has enough spacing and no old dark style leaks.',
      ''
    );
  } else if (skill.id === 'pdfco') {
    lines.push(
      'PDF.co API-ready payload examples:',
      'PDF to text: POST https://api.pdf.co/v1/pdf/convert/to/text with x-api-key.',
      'Merge PDF: POST https://api.pdf.co/v1/pdf/merge with comma-separated URLs.',
      'Split PDF: POST https://api.pdf.co/v1/pdf/split with pages/ranges.',
      ''
    );
  }

  lines.push(
    'Next steps:',
    '1. Review generated output.',
    '2. Copy or download the result.',
    '3. Add provider key in backend env for live API processing.',
    '4. Restart MilesWeb Node app after env changes.'
  );
  return lines.join('\n');
}

async function runSkillWorkflow(body = {}, files = []) {
  const skill = skillById(body.skillId || body.id);
  const prompt = String(body.prompt || body.details || '').trim();
  const uploadedFiles = compactFileList(files, body);
  let options = body.options || {};
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options || '{}');
    } catch (error) {
      options = { mode: options };
    }
  }
  const providerConfigured = hasAnyEnv(skill.env);
  return {
    ok: true,
    skillId: skill.id,
    title: skill.title,
    type: 'sansa-skill-workflow',
    group: skill.group,
    provider: skill.provider,
    providerConfigured,
    fallback: !providerConfigured,
    apiReady: true,
    filename: `${skill.id}-sansa-skill-output.txt`,
    nextSteps: [
      'Use this output in the matching SANSA workspace.',
      'Add API keys in MilesWeb environment for live provider mode.',
      'Keep fallback enabled so public users never see broken options.',
    ],
    text: workflowFor(skill, prompt, uploadedFiles, options),
  };
}

module.exports = {
  skillCatalog: () => skillCatalog,
  skillById,
  skillStatus,
  runSkillWorkflow,
};
