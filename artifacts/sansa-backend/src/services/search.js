const { query } = require('./db');
const { searchBuiltinKnowledge } = require('./builtinKnowledge');

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .filter((word) => word.length >= 2);
}

function scoreText(question, item) {
  const terms = tokenize(question);
  const haystack = `${item.title || ''} ${item.category || ''} ${item.keywords || ''} ${item.content || ''}`.toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

async function databaseKnowledge(question, limit) {
  const chunks = await query(
    `SELECT id, title, category, content, keywords, 'knowledge' AS type
     FROM knowledge_chunks
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT 120`
  );
  const manual = await query(
    `SELECT id, question AS title, category, answer AS content, question AS keywords, 'manual' AS type
     FROM manual_teachings
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT 80`
  );

  return [...chunks.rows, ...manual.rows]
    .map((item) => ({ ...item, score: scoreText(question, item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function searchKnowledge(question, limit = 8) {
  const text = String(question || '').trim();
  if (!text) return [];

  const builtin = searchBuiltinKnowledge(text, limit);
  const database = await databaseKnowledge(text, limit).catch(() => []);

  return [...database, ...builtin]
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, limit);
}

module.exports = { searchKnowledge };
