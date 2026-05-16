const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');
const { query } = require('./db');
const { embedText } = require('./ai');

function splitIntoChunks(text, size = 2800) {
  const clean = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!clean) return [];

  const paragraphs = clean.split(/\n\s*\n/);
  const chunks = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if ((current + '\n\n' + paragraph).length > size && current) {
      chunks.push(current.trim());
      current = '';
    }

    if (paragraph.length > size) {
      for (let index = 0; index < paragraph.length; index += size) {
        chunks.push(paragraph.slice(index, index + size).trim());
      }
      continue;
    }

    current += `${current ? '\n\n' : ''}${paragraph}`;
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function makeKeywords(text) {
  const stop = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'your', 'have', 'will', 'can', 'are']);
  const counts = new Map();
  const words = String(text || '').toLowerCase().match(/[\p{L}\p{N}_]{3,}/gu) || [];

  for (const word of words) {
    if (stop.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([word]) => word)
    .join(', ');
}

function runPythonExtractor(filePath) {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || 'python3';
    const script = path.join(__dirname, '..', '..', 'python', 'process_document.py');
    const child = spawn(pythonBin, [script, filePath], { windowsHide: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python extractor failed with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error('Python extractor returned invalid JSON.'));
      }
    });
  });
}

async function processUpload(file, metadata) {
  const title = metadata.title || file.originalname;
  const category = metadata.category || 'general';

  const docResult = await query(
    `INSERT INTO documents (title, category, original_name, stored_name, mime_type, status)
     VALUES ($1, $2, $3, $4, $5, 'processing')
     RETURNING id`,
    [title, category, file.originalname, file.filename, file.mimetype]
  );
  const documentId = docResult.rows[0].id;

  try {
    const extraction = await runPythonExtractor(file.path);
    const chunks = splitIntoChunks(extraction.text);

    if (!chunks.length) {
      throw new Error('No readable text found in the uploaded file.');
    }

    for (let index = 0; index < chunks.length; index += 1) {
      const content = chunks[index];
      const embedding = await embedText(`${title}\n${category}\n${content}`);
      await query(
        `INSERT INTO knowledge_chunks (document_id, title, category, content, keywords, embedding_json, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')`,
        [
          documentId,
          `${title} - Section ${index + 1}`,
          category,
          content,
          makeKeywords(`${title} ${category} ${content}`),
          embedding ? JSON.stringify(embedding) : null,
        ]
      );
    }

    await query(`UPDATE documents SET status = 'active', updated_at = NOW() WHERE id = $1`, [documentId]);

    return { documentId, chunks: chunks.length, chars: extraction.text.length };
  } catch (error) {
    await query(`UPDATE documents SET status = 'error', error = $2, updated_at = NOW() WHERE id = $1`, [
      documentId,
      error.message,
    ]);
    throw error;
  }
}

module.exports = { processUpload, splitIntoChunks };
