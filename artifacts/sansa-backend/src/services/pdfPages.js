const { PDFDocument } = require('pdf-lib');

function parsePageIndices(spec, pageCount) {
  const s = String(spec || '').trim();
  if (!s || s === '*') return Array.from({ length: pageCount }, (_, i) => i);
  const out = new Set();
  for (const part of s.split(/[\s,]+/).filter(Boolean)) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map((x) => parseInt(x, 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const lo = Math.max(0, Math.min(a, b));
      const hi = Math.min(pageCount - 1, Math.max(a, b));
      for (let i = lo; i <= hi; i += 1) out.add(i);
    } else {
      const n = parseInt(part, 10);
      if (Number.isFinite(n) && n >= 0 && n < pageCount) out.add(n);
    }
  }
  return Array.from(out).sort((x, y) => x - y);
}

async function mergePdfBuffers(buffers) {
  if (!buffers || buffers.length < 2) {
    const err = new Error('At least two PDF buffers are required.');
    err.status = 422;
    throw err;
  }
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const copied = await merged.copyPages(doc, doc.getPageIndices());
    copied.forEach((page) => merged.addPage(page));
  }
  return Buffer.from(await merged.save());
}

async function splitPdfBuffer(buffer, pageSpec) {
  const src = await PDFDocument.load(buffer);
  const n = src.getPageCount();
  const indices = parsePageIndices(pageSpec, n);
  if (!indices.length) {
    const err = new Error('No valid pages in spec. Use 0-based indices like 0 or 0-2.');
    err.status = 422;
    throw err;
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  copied.forEach((page) => out.addPage(page));
  return Buffer.from(await out.save());
}

module.exports = {
  mergePdfBuffers,
  splitPdfBuffer,
  parsePageIndices,
};
