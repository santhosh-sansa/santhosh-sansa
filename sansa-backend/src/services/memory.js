const { query } = require('./db');

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function makeKeywords(text) {
  const stop = new Set([
    'the',
    'and',
    'for',
    'with',
    'this',
    'that',
    'from',
    'your',
    'have',
    'will',
    'can',
    'are',
    'enna',
    'naan',
    'nanga',
    'unga',
    'iruku',
    'panna',
  ]);
  const words = normalizeText(text).toLowerCase().match(/[\p{L}\p{N}_]{3,}/gu) || [];
  return [...new Set(words.filter((word) => !stop.has(word)))].slice(0, 20).join(', ');
}

function inferMemoryType(message) {
  const text = message.toLowerCase();
  if (/(price|pricing|amount|cost|rate|salary|expense|profit|revenue|budget|vilai|selavu)/i.test(text)) {
    return 'finance';
  }
  if (/(customer|client|lead|sales|order|support|refund|complaint|vadikkaiyalar|customeru)/i.test(text)) {
    return 'customer';
  }
  if (/(product|service|offer|plan|feature|website|app|ai|tool)/i.test(text)) {
    return 'product';
  }
  return 'business';
}

function shouldRemember(message) {
  const text = message.toLowerCase();
  const directMemory = /(remember|note this|save this|don't forget|do not forget|nyabagam|marakkatha|marakkadhe)/i.test(text);
  const businessFact =
    /(my business|our business|my company|our company|my ai|our ai|my website|our website|my product|our product|my price|our price|en business|en ai|en website|ennoda business|ennoda ai|ennoda website)/i.test(
      text
    );
  return directMemory || businessFact;
}

async function saveMemoryFromMessage(message) {
  const content = normalizeText(message);
  if (!content || content.length < 12 || !shouldRemember(content)) {
    return null;
  }

  const memoryType = inferMemoryType(content);
  const title = `${memoryType[0].toUpperCase()}${memoryType.slice(1)} memory`;
  const keywords = makeKeywords(content);

  const existing = await query(
    `SELECT id FROM ai_memories
     WHERE status = 'active' AND lower(content) = lower($1)
     LIMIT 1`,
    [content]
  );

  if (existing.rows.length) {
    return existing.rows[0];
  }

  const result = await query(
    `INSERT INTO ai_memories (memory_type, title, content, keywords, importance, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id`,
    [memoryType, title, content, keywords, 4]
  );

  return result.rows[0] || null;
}

async function searchMemories(question, limit = 6) {
  const terms = normalizeText(question)
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .filter((word) => word.length >= 2)
    .slice(0, 12);

  if (!terms.length) return [];

  const result = await query(
    `SELECT id, title, memory_type AS category, content,
            ts_rank(to_tsvector('simple', title || ' ' || content || ' ' || keywords), plainto_tsquery('simple', $1)) AS score
     FROM ai_memories
     WHERE status = 'active'
       AND (
         to_tsvector('simple', title || ' ' || content || ' ' || keywords) @@ plainto_tsquery('simple', $1)
         OR title ILIKE $2
         OR content ILIKE $2
         OR keywords ILIKE $2
       )
     ORDER BY importance DESC, score DESC, updated_at DESC
     LIMIT $3`,
    [terms.join(' '), `%${terms[0]}%`, limit]
  );

  return result.rows.map((row) => ({
    ...row,
    type: 'memory',
  }));
}

module.exports = { saveMemoryFromMessage, searchMemories };
