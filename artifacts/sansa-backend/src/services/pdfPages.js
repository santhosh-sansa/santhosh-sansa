const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

/** Per-file cap for merge/split/watermark/reorder (below multer field limit). */
const PDF_TOOL_MAX_BYTES = 12 * 1024 * 1024;

function assertPdfToolBuffer(buffer, label = 'PDF') {
  if (!buffer || !buffer.length) {
    const err = new Error(`${label} file is empty or missing.`);
    err.status = 400;
    throw err;
  }
  if (buffer.length > PDF_TOOL_MAX_BYTES) {
    const mb = Math.round(PDF_TOOL_MAX_BYTES / (1024 * 1024));
    const err = new Error(`${label} exceeds ${mb} MB. Compress or split the file first.`);
    err.status = 413;
    throw err;
  }
}

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

function parseReorderIndices(orderSpec, pageCount) {
  const parts = String(orderSpec || '')
    .split(/[\s,]+/)
    .map((x) => parseInt(x, 10))
    .filter((n) => Number.isFinite(n));
  if (parts.length !== pageCount) {
    const err = new Error(
      `Reorder needs exactly ${pageCount} comma-separated 0-based indices (one per page), e.g. 2,0,1 for 3 pages.`,
    );
    err.status = 422;
    throw err;
  }
  const seen = new Set();
  for (const p of parts) {
    if (p < 0 || p >= pageCount || seen.has(p)) {
      const err = new Error('Reorder indices must be a permutation of every page index (0 … n−1), each once.');
      err.status = 422;
      throw err;
    }
    seen.add(p);
  }
  return parts;
}

async function mergePdfBuffers(buffers) {
  if (!buffers || buffers.length < 2) {
    const err = new Error('At least two PDF buffers are required.');
    err.status = 422;
    throw err;
  }
  buffers.forEach((buf, i) => assertPdfToolBuffer(buf, `PDF ${i + 1}`));
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const copied = await merged.copyPages(doc, doc.getPageIndices());
    copied.forEach((page) => merged.addPage(page));
  }
  return Buffer.from(await merged.save());
}

async function splitPdfBuffer(buffer, pageSpec) {
  assertPdfToolBuffer(buffer);
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

async function watermarkPdfBuffer(buffer, text) {
  assertPdfToolBuffer(buffer);
  const doc = await PDFDocument.load(buffer);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const label = String(text || 'SANSA').trim().slice(0, 120) || 'SANSA';
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.min(42, Math.max(18, width / 18));
    page.drawText(label, {
      x: width * 0.18,
      y: height * 0.45,
      size,
      font,
      color: rgb(0.72, 0.15, 0.12),
      opacity: 0.28,
      rotate: degrees(-32),
    });
  }
  return Buffer.from(await doc.save());
}

async function reorderPdfBuffer(buffer, orderSpec) {
  assertPdfToolBuffer(buffer);
  const src = await PDFDocument.load(buffer);
  const n = src.getPageCount();
  const order = parseReorderIndices(orderSpec, n);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, order);
  copied.forEach((page) => out.addPage(page));
  return Buffer.from(await out.save());
}

module.exports = {
  PDF_TOOL_MAX_BYTES,
  assertPdfToolBuffer,
  mergePdfBuffers,
  splitPdfBuffer,
  watermarkPdfBuffer,
  reorderPdfBuffer,
  parsePageIndices,
};
