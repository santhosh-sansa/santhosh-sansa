const MAX_INPUT = 120_000;

function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function splitSentences(text) {
  const t = normalizeText(text);
  if (!t) return [];
  return t
    .split(/(?<=[.!?।])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function extractiveSummary(text, maxLength = 2000) {
  const sentences = splitSentences(text);
  if (!sentences.length) {
    const flat = normalizeText(text);
    const summary = flat.slice(0, maxLength);
    return { summary, bullets: summary ? [summary.slice(0, 200)] : [] };
  }
  const bullets = sentences.slice(0, 6).map((s) => (s.length > 160 ? `${s.slice(0, 157)}...` : s));
  let summary = '';
  for (const sentence of sentences) {
    if (summary.length + sentence.length + 1 > maxLength) break;
    summary += `${summary ? ' ' : ''}${sentence}`;
  }
  return { summary: summary || sentences[0].slice(0, maxLength), bullets };
}

function scoreParagraphs(text, question) {
  const qTokens = String(question || '')
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  const paras = normalizeText(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);
  if (!paras.length) {
    const one = normalizeText(text);
    return one ? [{ p: one, score: 1 }] : [];
  }
  return paras
    .map((p) => {
      const pl = p.toLowerCase();
      let score = 0;
      for (const w of qTokens) {
        if (pl.includes(w)) score += 3;
      }
      score += Math.min(p.length / 400, 2);
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
}

function chatFromDocument(text, message) {
  const msg = String(message || '').trim();
  if (!msg) {
    const { summary, bullets } = extractiveSummary(text, 1800);
    return {
      reply: summary ? `Quick overview:\n\n${summary}` : 'No extractable text to summarize.',
      bullets,
    };
  }
  const ranked = scoreParagraphs(text, msg);
  const top = ranked.filter((r) => r.score > 0).slice(0, 3).map((r) => r.p);
  if (top.length) {
    return {
      reply: `Most relevant passages for “${msg}”:\n\n${top.join('\n\n—\n\n')}`,
      bullets: top.map((t) => (t.length > 200 ? `${t.slice(0, 197)}...` : t)),
    };
  }
  const { summary, bullets } = extractiveSummary(text, 2000);
  return {
    reply: `No strong keyword match for “${msg}”. Summary instead:\n\n${summary}`,
    bullets,
  };
}

function truncateForStudio(text) {
  return normalizeText(text).slice(0, MAX_INPUT);
}

module.exports = {
  MAX_INPUT,
  extractiveSummary,
  chatFromDocument,
  truncateForStudio,
};
