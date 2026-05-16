const TOOL_CATALOG = [
  {
    id: 'edit',
    title: 'Edit PDF',
    icon: 'EDIT',
    category: 'edit',
    input: 'Upload a PDF or paste the page changes you want.',
    sample: 'Invoice PDF-la logo add pannu, footer-la UPI ID add pannu, page 2 remove pannu.',
    output: 'Edit checklist, page change plan, export-safe notes.',
    nextSteps: ['Review page order', 'Apply watermark or footer', 'Export with browser Save as PDF'],
  },
  {
    id: 'pdf-word',
    title: 'PDF to Word',
    icon: 'DOC',
    category: 'convert',
    input: 'Upload PDF or paste extracted text.',
    sample: 'Rental agreement PDF text-ai Word edit format-la convert pannu.',
    output: 'Word-ready editable text structure with headings.',
    nextSteps: ['Copy editable text', 'Paste into Word or Docs', 'Check formatting before sharing'],
  },
  {
    id: 'pdf-excel',
    title: 'PDF to Excel',
    icon: 'XLS',
    category: 'convert',
    input: 'Upload bill/table PDF or paste rows.',
    sample: 'Invoice table-la item, qty, rate, GST, total columns create pannu.',
    output: 'CSV-style table extraction plan.',
    nextSteps: ['Copy table text', 'Paste into Excel', 'Verify totals and GST columns'],
  },
  {
    id: 'pdf-ppt',
    title: 'PDF to PPT',
    icon: 'PPT',
    category: 'convert',
    input: 'Upload PDF or paste document text.',
    sample: 'Business proposal PDF-ai 5 slide presentation notes-a convert pannu.',
    output: 'Slide outline, title, bullets, speaker notes.',
    nextSteps: ['Copy slide outline', 'Create slides', 'Add brand logo and visuals'],
  },
  {
    id: 'word-pdf',
    title: 'Word to PDF',
    icon: 'W2P',
    category: 'convert',
    input: 'Paste Word/document text.',
    sample: 'Service agreement text-ai clean PDF layout-ku prepare pannu.',
    output: 'Print-ready PDF layout instructions.',
    nextSteps: ['Paste into Text to PDF', 'Preview spacing', 'Download or print as PDF'],
  },
  {
    id: 'merge',
    title: 'Merge PDF',
    icon: 'MRG',
    category: 'organize',
    input: 'Upload multiple files or list desired order.',
    sample: 'Invoice, payment proof, delivery note ellam one customer PDF-a merge pannu.',
    output: 'Merge order and final document checklist.',
    nextSteps: ['Name files in order', 'Open each in print layout', 'Save combined PDF'],
  },
  {
    id: 'split',
    title: 'Split PDF',
    icon: 'SPL',
    category: 'organize',
    input: 'Upload PDF and describe page ranges.',
    sample: 'Page 1 invoice, page 2 terms, page 3 proof separate files-a split pannu.',
    output: 'Split plan with page ranges and filenames.',
    nextSteps: ['Mark required page ranges', 'Export each range', 'Share only needed file'],
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    icon: 'CMP',
    category: 'organize',
    input: 'Upload file or describe target size.',
    sample: 'WhatsApp-la send panna invoice PDF size reduce pannu.',
    output: 'Compression checklist without native binary dependency.',
    nextSteps: ['Remove unused pages', 'Downscale images before PDF', 'Export using browser compression'],
  },
  {
    id: 'organize',
    title: 'Organize Pages',
    icon: 'ORG',
    category: 'organize',
    input: 'Describe page order and actions.',
    sample: 'Quotation first, terms second, payment QR last page-la arrange pannu.',
    output: 'Page order, rotate/extract checklist.',
    nextSteps: ['Confirm page order', 'Rotate wrong pages', 'Export final sequence'],
  },
  {
    id: 'rotate',
    title: 'Rotate Pages',
    icon: 'ROT',
    category: 'organize',
    input: 'Mention pages and direction.',
    sample: 'Scanned bill page 2 right side rotate panni readable-a pannu.',
    output: 'Rotation instructions and quality checklist.',
    nextSteps: ['Identify page numbers', 'Rotate before export', 'Check mobile preview'],
  },
  {
    id: 'extract',
    title: 'Extract Pages',
    icon: 'EXT',
    category: 'organize',
    input: 'Mention pages to keep.',
    sample: 'Only signed page and payment proof page extract pannu.',
    output: 'Extraction plan and output file names.',
    nextSteps: ['Choose pages to keep', 'Remove private pages', 'Export customer-safe copy'],
  },
  {
    id: 'page-numbers',
    title: 'Add Page Numbers',
    icon: '123',
    category: 'edit',
    input: 'Choose position and starting number.',
    sample: 'Legal agreement-ku bottom center page number add pannu.',
    output: 'Page numbering layout plan.',
    nextSteps: ['Choose footer style', 'Start from cover or page 1', 'Preview before signing'],
  },
  {
    id: 'protect',
    title: 'Protect PDF',
    icon: 'SEC',
    category: 'edit',
    input: 'Describe what must be protected.',
    sample: 'Invoice PDF share panna watermark add panni edit-proof notes ready pannu.',
    output: 'Protection plan, watermark, sharing warnings.',
    nextSteps: ['Add visible watermark', 'Avoid raw editable files', 'Share portal/payment link'],
  },
  {
    id: 'watermark',
    title: 'Add Watermark',
    icon: 'WM',
    category: 'edit',
    input: 'Enter watermark text and placement.',
    sample: 'SANSA DIGITAL SERVICES - unpaid nu diagonal watermark add pannu.',
    output: 'Watermark copy, opacity, placement plan.',
    nextSteps: ['Pick watermark text', 'Set light opacity', 'Export review copy'],
  },
  {
    id: 'compare',
    title: 'Compare PDFs',
    icon: 'CMP',
    category: 'ai',
    input: 'Paste both document texts or upload names.',
    sample: 'Old quote and new quote compare panni price changes list pannu.',
    output: 'Difference report and risk notes.',
    nextSteps: ['Compare amount/date/customer fields', 'Check missing clauses', 'Approve latest version'],
  },
  {
    id: 'redact',
    title: 'Redact PDF',
    icon: 'RED',
    category: 'ai',
    input: 'Paste text and mention sensitive fields.',
    sample: 'Phone, GSTIN, bank details hide panna redaction checklist pannu.',
    output: 'Sensitive field list and redaction plan.',
    nextSteps: ['Find private values', 'Replace with blocks/hidden text', 'Export customer-safe copy'],
  },
];

function normalizeToolId(toolId = '') {
  const clean = String(toolId || '').replace(/^tool-/, '').trim().toLowerCase();
  const aliases = {
    'pdf-to-word': 'pdf-word',
    'pdf-to-excel': 'pdf-excel',
    'pdf-to-ppt': 'pdf-ppt',
    'word-to-pdf': 'word-pdf',
    'merge-pdf': 'merge',
    'split-pdf': 'split',
    'compress-pdf': 'compress',
    'organize-pages': 'organize',
    'rotate-pages': 'rotate',
    'extract-pages': 'extract',
    'protect-pdf': 'protect',
    'watermark-pdf': 'watermark',
    'compare-pdf': 'compare',
    'redact-pdf': 'redact',
  };
  return aliases[clean] || clean || 'edit';
}

function toolById(toolId) {
  const id = normalizeToolId(toolId);
  return TOOL_CATALOG.find((tool) => tool.id === id) || TOOL_CATALOG[0];
}

function safeText(value, fallback = '') {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function providerStatus() {
  const providers = {
    pdfco: Boolean(process.env.PDFCO_API_KEY),
    cloudconvert: Boolean(process.env.CLOUDCONVERT_API_KEY),
    convertapi: Boolean(process.env.CONVERTAPI_SECRET || process.env.CONVERTAPI_API_SECRET),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };
  const preferred = String(process.env.SANSA_PDF_ENGINE || '').trim().toLowerCase()
    || (providers.pdfco ? 'pdfco' : '')
    || (providers.cloudconvert ? 'cloudconvert' : '')
    || (providers.convertapi ? 'convertapi' : '')
    || 'fallback';
  const liveEnabled = String(process.env.SANSA_ENABLE_LIVE_PDF_ENGINE || '').toLowerCase() === 'true';
  return {
    ok: true,
    providers,
    preferred,
    liveEnabled,
    cpanelSafe: true,
    apiReady: true,
    requiredEnv: [
      'PDFCO_API_KEY',
      'CLOUDCONVERT_API_KEY',
      'CONVERTAPI_SECRET',
      'OPENAI_API_KEY',
      'SANSA_ENABLE_LIVE_PDF_ENGINE=true',
    ],
  };
}

function uploadedFiles(files = [], body = {}) {
  const list = Array.isArray(files) ? files : files ? [files] : [];
  if (list.length) {
    return list.map((file) => ({
      name: safeText(file.originalname || file.filename, 'uploaded-file'),
      type: safeText(file.mimetype, 'application/octet-stream'),
      size: Number(file.size || 0),
    }));
  }
  const names = safeText(body.fileName, '');
  if (!names) return [];
  return names.split(',').map((name) => ({
    name: safeText(name, 'uploaded-file'),
    type: safeText(body.fileType, 'provided by browser'),
    size: 0,
  }));
}

function formatBytes(value = 0) {
  const bytes = Number(value || 0);
  if (!bytes) return 'size not available';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function providerPlan(tool, files, status) {
  const fileLine = files.length
    ? files.map((file, index) => `${index + 1}. ${file.name} - ${file.type} - ${formatBytes(file.size)}`).join('\n')
    : 'No binary file uploaded. Text/details mode will be used.';
  const configured = status.providers.pdfco || status.providers.cloudconvert || status.providers.convertapi;
  return {
    configured,
    provider: status.preferred,
    text: [
      'Real engine status:',
      `- Preferred provider: ${status.preferred}`,
      `- Live engine enabled: ${status.liveEnabled ? 'yes' : 'no'}`,
      `- Provider key configured: ${configured ? 'yes' : 'no'}`,
      '',
      'Uploaded files:',
      fileLine,
      '',
      'Real API hook:',
      `- Tool ID: ${tool.id}`,
      `- Tool category: ${tool.category}`,
      '- Request supports multipart files plus { toolId, prompt, options }.',
      '- When provider keys are added, this same endpoint can return a processed file URL.',
      '- In cPanel-safe mode, SANSA avoids heavy native binaries and keeps a useful fallback report.',
    ].join('\n'),
  };
}

function multiline(items) {
  return items.filter(Boolean).join('\n');
}

function buildWorkflow(kind, body = {}, files = []) {
  const tool = toolById(body.toolId);
  const prompt = safeText(body.prompt, tool.sample);
  const inputFiles = uploadedFiles(files, body);
  const fileName = inputFiles.length ? inputFiles.map((file) => file.name).join(', ') : safeText(body.fileName, 'No file uploaded');
  const fileType = inputFiles.length ? inputFiles.map((file) => file.type).join(', ') : safeText(body.fileType, 'text/details only');
  const options = body.options && typeof body.options === 'object' ? body.options : {};
  const outputName = `${tool.id.replace(/[^a-z0-9]+/gi, '-')}-sansa-workflow.txt`;
  const status = providerStatus();
  const realPlan = providerPlan(tool, inputFiles, status);
  const text = multiline([
    `SANSA ${tool.title} - Working Workflow`,
    '',
    `Input received: ${prompt}`,
    `File: ${fileName} (${fileType})`,
    `Mode: ${kind === 'document' ? 'Document workflow' : 'PDF workflow'}`,
    `Option: ${safeText(options.mode || options.quality || options.layout, 'cPanel-safe fallback')}`,
    '',
    'What SANSA can generate now:',
    `- ${tool.output}`,
    '- A copy-ready report for customer, accountant, or internal team review.',
    '- A browser/export-safe checklist that does not require native server binaries.',
    '',
    'Generated action report:',
    `1. Read the user requirement and classify it as ${tool.category}.`,
    `2. Prepare the ${tool.title} result using uploaded file name or pasted text.`,
    '3. Add business-safe checks: customer name, amount, date, GST/tax fields, privacy fields, and sharing status.',
    '4. Return output as editable text/report now; real provider/native engine can be connected later through this same API shape.',
    '',
    'Recommended next steps:',
    ...tool.nextSteps.map((step, index) => `${index + 1}. ${step}`),
    '',
    realPlan.text,
    '',
    'Tamil/Tanglish sample:',
    tool.sample,
    '',
    'API-ready note: POST body supports { toolId, prompt, fileName, fileType, options } and multipart uploads as files[]. If a provider engine is enabled, this endpoint can return the real file URL without changing the frontend.',
  ]);

  return {
    ok: true,
    toolId: tool.id,
    title: tool.title,
    type: kind === 'document' ? 'document-workflow' : 'pdf-workflow',
    text,
    filename: outputName,
    fallback: !realPlan.configured || !status.liveEnabled,
    apiReady: true,
    engine: status.preferred,
    providerConfigured: realPlan.configured,
    realEngineReady: Boolean(realPlan.configured && status.liveEnabled),
    cpanelSafe: true,
    files: inputFiles,
    nextSteps: tool.nextSteps,
  };
}

async function buildPdfWorkflow(body = {}, files = []) {
  return buildWorkflow('pdf', body, files);
}

async function buildDocumentWorkflow(body = {}, files = []) {
  return buildWorkflow('document', body, files);
}

function toolCatalog() {
  return TOOL_CATALOG.map((tool) => ({ ...tool }));
}

module.exports = {
  TOOL_CATALOG,
  toolCatalog,
  buildPdfWorkflow,
  buildDocumentWorkflow,
  providerStatus,
  normalizeToolId,
};
