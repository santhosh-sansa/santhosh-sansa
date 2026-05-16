const BUILTIN_KNOWLEDGE = [
  {
    id: 'sansa-answer-engine-method',
    title: 'How SANSA AI Answer Engine Works',
    category: 'sansa-system',
    keywords:
      'answer engine sansa ai tamil tanglish training data real time search current trends compare sources business advice',
    content: [
      'SANSA AI answer method:',
      '1. First use built-in training knowledge and admin taught data for stable topics such as business models, tech stack, marketing, pricing, product strategy, and app planning.',
      '2. If the question needs current information such as 2026 trends, latest revenue numbers, market reports, competitors, funding, product rankings, law changes, or live prices, use web search when enabled.',
      '3. Compare multiple signals instead of copying one source. Separate hype from practical opportunity.',
      '4. Adapt the answer to the user context: India, Tamil Nadu, Tamil/Tanglish users, solo founder, low budget, website/app first, fast launch.',
      '5. Give direct answer first, then ranking, reason, revenue model, MVP features, launch plan, risks, and next step.',
      '6. Reply in the user language. If the user asks in Tanglish, answer in simple Tanglish/Tamil.',
      '7. Do not pretend that a number is verified if it is only an estimate. Say estimate, assumption, or needs verification.',
    ].join('\n'),
  },
  {
    id: 'best-full-time-business-filter',
    title: 'Best Full-Time Website/App Business Filter for Sansa AI',
    category: 'business-strategy',
    keywords:
      'best business full time website app high return india tamil nadu solo founder resume legal invoice shopkeeper interview',
    content: [
      'For a solo founder in Tamil Nadu who wants fast revenue from a website/app, rank ideas by: speed to launch, payment willingness, low legal risk, low support burden, repeat demand, marketing ease, and ability to use AI.',
      'Recommended order:',
      '1. Sansa Career AI: Resume builder, cover letter, LinkedIn optimizer, interview Q&A. Best first business because it is low risk, easy to build, and can earn from students and job seekers quickly.',
      '2. Sansa Legal Docs: Rental agreement, affidavit, legal notice draft, loan agreement, complaint petition. Strong lifetime demand, but needs legal disclaimer and lawyer-reviewed templates.',
      '3. Sansa Invoice PDF: Simple invoices, GST invoices, service bills, and payment receipts for shops and freelancers.',
      '4. Sansa Shop Accounts: Daily accounts, credit reminders, profit report. Strong long-term retention but needs local sales/support.',
      '5. AI Interview Platform: High value B2B product, but complex because companies need trust, voice AI quality, data privacy, and sales cycle.',
      'Best launch bundle: Resume PDF + Legal PDF + Invoice PDF inside one Sansa PDF Studio.',
    ].join('\n'),
  },
  {
    id: 'sansa-career-ai-product',
    title: 'Sansa Career AI Product Blueprint',
    category: 'business-product',
    keywords:
      'sansa career ai resume builder linkedin optimizer cover letter interview questions ats score tamil english pricing mvp',
    content: [
      'Sansa Career AI is the best first paid product.',
      'Target users: freshers, college students, ITI/polytechnic students, job seekers, Gulf job applicants, Tamil users in India/Singapore/Malaysia/Canada.',
      'Core promise: Speak or type in Tamil, get professional English resume and job tools.',
      'MVP features:',
      '- Tamil/Text input to English resume',
      '- ATS-friendly resume preview',
      '- PDF download',
      '- Cover letter generator',
      '- LinkedIn headline and About section',
      '- Interview Q&A for selected job role',
      'Pricing:',
      '- Free: 1 preview with watermark',
      '- Rs.49: Resume PDF',
      '- Rs.99: Resume + cover letter',
      '- Rs.199: Resume + LinkedIn + interview Q&A',
      '- Rs.999: Lifetime plan',
      'Marketing:',
      '- YouTube videos: Tamil resume tips, how to make resume in Tamil, fresher resume format',
      '- College WhatsApp groups and placement officers',
      '- Instagram reels showing Tamil input to English resume transformation',
      '- Affiliate to browsing centers and resume typing shops',
    ].join('\n'),
  },
  {
    id: 'sansa-legal-docs-product',
    title: 'Sansa Legal Docs Product Blueprint',
    category: 'business-product',
    keywords:
      'sansa legal docs rental agreement affidavit legal notice loan agreement police complaint government application draft disclaimer',
    content: [
      'Sansa Legal Docs should be positioned as draft preparation, not legal advice.',
      'Must show disclaimer: This is only a document drafting tool, not legal advice. Please consult a licensed advocate for legal opinion.',
      'MVP document types:',
      '- Rental Agreement Draft',
      '- Affidavit Draft',
      '- Name Change Affidavit',
      '- Legal Notice Draft',
      '- Loan Agreement Draft',
      '- Police Complaint Petition',
      '- RTI Application',
      '- Address Proof Declaration',
      'Revenue:',
      '- Rs.29 to Rs.99 per draft/PDF',
      '- Advocate review add-on Rs.199+',
      '- Notary/stamp/e-sign integrations only after proper partner setup',
      'Trust requirements:',
      '- Lawyer-reviewed templates',
      '- State-wise notes where needed',
      '- Clear draft-only label',
      '- Simple mobile form',
    ].join('\n'),
  },
  {
    id: 'sansa-invoice-pdf-product',
    title: 'Sansa Invoice PDF Product Blueprint',
    category: 'business-product',
    keywords:
      'invoice pdf generator gst invoice service bill payment receipt shop freelancer tamil english pricing',
    content: [
      'Invoice PDF Generator is a simple daily-use product with fast sales potential.',
      'Target users: shops, freelancers, service providers, browsing centers, local businesses, and small agencies.',
      'MVP features:',
      '- Simple invoice format',
      '- GST invoice format',
      '- Service bill format',
      '- Payment receipt format',
      '- Business name, customer name, invoice number, due date, and payment terms',
      '- Browser Save as PDF export',
      'Pricing:',
      '- Rs.19 simple invoice PDF',
      '- Rs.49 GST invoice or premium invoice PDF',
      'Marketing:',
      '- WhatsApp share examples for small shops',
      '- YouTube Shorts/Reels: invoice create panna easy method in Tamil',
      '- Affiliate to browsing centers, accountants, and local service providers',
    ].join('\n'),
  },
  {
    id: 'ai-services-hub-architecture',
    title: 'Sansa AI Services Hub Architecture',
    category: 'technical-plan',
    keywords:
      'ai services hub architecture modules intent detection api pdf payment razorpay voice tamil sansa',
    content: [
      'Sansa AI Services Hub structure:',
      'User asks in chat or clicks a module.',
      'Intent detection routes request to Resume PDF, Legal PDF, Invoice PDF, Shop Accounts, or Interview.',
      'Module asks required questions.',
      'Template engine generates draft.',
      'Preview is free.',
      'Payment unlocks final PDF/Word/share link.',
      'Suggested technical modules:',
      '- Frontend: HTML/CSS/JS or React/Next.js',
      '- Backend: Node.js Express APIs',
      '- Answer layer: free local knowledge + optional public web search',
      '- Knowledge: built-in knowledge + admin taught documents + optional web search',
      '- PDF: browser print first, later server-side PDF',
      '- Payment: Razorpay',
      '- Voice: Web Speech API for Tamil input',
      '- Database: PostgreSQL for users, documents, payments, logs',
    ].join('\n'),
  },
  {
    id: 'answer-format-business-advice',
    title: 'Preferred Business Advice Answer Format',
    category: 'sansa-system',
    keywords:
      'business answer format tamil ranking revenue mvp marketing risks final recommendation',
    content: [
      'When user asks for business advice, SANSA should answer in this format:',
      '1. Direct answer: best option and why.',
      '2. Ranking table or short ranking list.',
      '3. MVP features to build first.',
      '4. Revenue model with realistic price points.',
      '5. Marketing plan for Tamil Nadu/India.',
      '6. Risks and legal/trust warnings.',
      '7. Next 7-day action plan.',
      'Keep language simple. Avoid overpromising guaranteed income. Use “potential”, “estimate”, and “test first” where appropriate.',
    ].join('\n'),
  },
  {
    id: 'sansa-all-tools-working-knowledge-2026',
    title: 'SANSA All Tools Working Knowledge 2026',
    category: 'sansa-system',
    keywords:
      'all tools working pdf word excel ppt merge split compress organize rotate extract page numbers protect watermark compare redact creative ai image video photo translate sound music invoice payment gst cfo support trust students government nonprofits',
    content: [
      'SANSA public site behavior: every visible menu, card, footer link, app switcher item, product card, and search suggestion should open an internal SANSA workspace.',
      'Creative AI tools: AI Image Generator, AI Video Editor, AI Photo Editing, AI Video Translation, AI Sound Effects Generator, and AI Music Generator open Creative AI with inputs, model/settings, generate, result preview, copy/download, backend API call, and local fallback.',
      'PDF tool runner tools: PDF to Word, PDF to Excel, PDF to PPT, Word to PDF, Merge PDF, Split PDF, Compress PDF, Organize Pages, Rotate Pages, Extract Pages, Add Page Numbers, Protect PDF, Add Watermark, Compare PDFs, and Redact PDF open SANSA Tool Runner.',
      'Tool Runner API shape: POST /api/tools/pdf-workflow or /api/tools/document-workflow with { toolId, prompt, fileName, fileType, options }. Response includes { ok, toolId, title, type, text, filename, fallback, apiReady, nextSteps }.',
      'Business tools: invoice creates GST/service bill drafts, payments creates UPI/Razorpay-ready links and WhatsApp reminders, GST reports summarize sales/input/net tax, AI CFO reports sales/profit/pending/cashflow, customer portal shares invoice/payment proof.',
      'Support/product knowledge: students use resume/legal/PDF tools; business uses invoice/payment/GST/CFO; government/non-profit use document and pricing workflows; Trust Centre explains hidden admin, session login, audit log, no node_modules package, cPanel-safe fallback.',
      'Search routing examples: merge pdf opens Merge PDF runner, redact opens Redact PDF runner, gst opens GST Reports, payment link opens Payments, ai image opens Creative Image, resume opens PDF Builder, trust centre opens Product Center Trust.',
      'cPanel-safe promise: no native binary dependency is required for the public site to work. Advanced file engines can be connected later through the same APIs, but missing keys must return useful demo/fallback output.',
    ].join('\n'),
  },
  {
    id: 'sansa-real-tool-engine-admin-pro-2026',
    title: 'SANSA Real Tool Engine Admin Pro 2026',
    category: 'sansa-system',
    keywords:
      'real tool engine admin pro every option working top menu footer app switcher product support trust api keys provider status pdfco cloudconvert convertapi openai razorpay whatsapp cpanel safe',
    content: [
      'SANSA Real Tool Engine Admin Pro maps every visible public action to a SANSA internal workspace and backend action record.',
      'Public endpoint /api/engine/catalog lists all action keys. /api/engine/run returns a working action report for any top menu, footer, app switcher, product, support, pricing, creative, PDF, or business option. /api/engine/status returns action coverage and provider readiness.',
      'Admin endpoint /admin/engine shows all option coverage, API key status, cPanel-safe mode, groups, endpoint mapping, and missing provider keys.',
      'Real provider keys: OPENAI_API_KEY for AI text/image-style tasks, PDFCO_API_KEY or CLOUDCONVERT_API_KEY or CONVERTAPI_SECRET for real PDF binary conversion, RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for payment links, WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID for WhatsApp reminders.',
      'Missing API keys must never break the public site. The engine returns useful fallback output with next steps, copy/download support, and backend audit logging.',
      'Deployment freshness: sync frontend into backend public, bump CSS/JS cache version, upload zips to MilesWeb, run NPM install for backend, restart Node app, then hard refresh with version query.',
    ].join('\n'),
  },
];

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .filter((word) => word.length >= 2);
}

function scoreKnowledge(question, item) {
  const terms = tokenize(question);
  const haystack = `${item.title} ${item.category} ${item.keywords} ${item.content}`.toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function searchBuiltinKnowledge(question, limit = 6) {
  return BUILTIN_KNOWLEDGE.map((item) => ({
    ...item,
    score: scoreKnowledge(question, item),
    type: 'builtin',
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { BUILTIN_KNOWLEDGE, searchBuiltinKnowledge };
