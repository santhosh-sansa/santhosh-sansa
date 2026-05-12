const fs = require('fs/promises');
const path = require('path');
const { pool, query } = require('./db');

const dataDir = path.join(__dirname, '..', '..', 'data');
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const usersPath = path.join(dataDir, 'saas-users.json');
const generationsPath = path.join(dataDir, 'generations.json');

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

function cleanName(name) {
  return String(name || 'upload.bin').replace(/[^a-z0-9._-]+/gi, '-').slice(-90);
}

async function ensureUploads() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

async function consumeCredits(user, cost = 1) {
  const userId = user?.id;
  const spend = Math.max(0, Number(cost) || 0);
  if (!userId || spend === 0) return Number(user?.credits || 0);

  if (pool && /^\d+$/.test(String(userId))) {
    const result = await query(
      `UPDATE app_users
       SET credits = credits - $1, updated_at = NOW()
       WHERE id = $2 AND credits >= $1
       RETURNING credits`,
      [spend, Number(userId)]
    );
    if (!result.rows[0]) {
      const error = new Error('Insufficient credits. Upgrade plan or ask admin to add credits.');
      error.status = 402;
      throw error;
    }
    return Number(result.rows[0].credits);
  }

  const users = await readJson(usersPath, []);
  const index = users.findIndex((item) => String(item.id) === String(userId));
  if (index < 0) {
    const error = new Error('User record not found.');
    error.status = 404;
    throw error;
  }
  const current = Number.isFinite(Number(users[index].credits)) ? Number(users[index].credits) : 0;
  if (current < spend) {
    const error = new Error('Insufficient credits. Upgrade plan or ask admin to add credits.');
    error.status = 402;
    throw error;
  }
  users[index].credits = current - spend;
  users[index].updatedAt = new Date().toISOString();
  await writeJson(usersPath, users);
  return users[index].credits;
}

async function recordGeneration(userId, payload) {
  const record = {
    id: `gen-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    userId: String(userId || 'guest'),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  const generations = await readJson(generationsPath, []);
  generations.unshift(record);
  await writeJson(generationsPath, generations.slice(0, 1200));
  return record;
}

async function listGenerations(userId) {
  const generations = await readJson(generationsPath, []);
  return generations.filter((item) => item.userId === String(userId)).slice(0, 50);
}

function buildImageDataUrl(prompt, style = 'cinematic', size = '1024x1024') {
  const [widthRaw, heightRaw] = String(size).split('x');
  const width = Math.min(Math.max(parseInt(widthRaw, 10) || 1024, 512), 1536);
  const height = Math.min(Math.max(parseInt(heightRaw, 10) || 1024, 512), 1536);
  const safePrompt = String(prompt || 'SANSA AI image').slice(0, 180)
    .replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const palette = {
    cinematic: ['#111827', '#2f64ff', '#ff3366'],
    anime: ['#201047', '#ff67c4', '#7dd3fc'],
    realistic: ['#122016', '#86ef8f', '#fef3c7'],
    abstract: ['#1d1230', '#ffdd55', '#22d3ee'],
  }[style] || ['#101828', '#38bdf8', '#f43f5e'];
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${palette[0]}"/>
      <stop offset=".52" stop-color="${palette[1]}"/>
      <stop offset="1" stop-color="${palette[2]}"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${width * 0.24}" cy="${height * 0.32}" r="${Math.min(width, height) * 0.2}" fill="#fff" opacity=".22" filter="url(#blur)"/>
  <circle cx="${width * 0.78}" cy="${height * 0.68}" r="${Math.min(width, height) * 0.26}" fill="#000" opacity=".25" filter="url(#blur)"/>
  <path d="M${width * 0.1} ${height * 0.75} C ${width * 0.32} ${height * 0.35}, ${width * 0.6} ${height * 0.95}, ${width * 0.9} ${height * 0.22}" fill="none" stroke="#fff" stroke-width="10" opacity=".55"/>
  <rect x="${width * 0.08}" y="${height * 0.68}" width="${width * 0.84}" height="${height * 0.22}" rx="28" fill="#0b1020" opacity=".72"/>
  <text x="${width * 0.12}" y="${height * 0.75}" font-family="Inter, Arial, sans-serif" font-size="${Math.max(28, width / 28)}" font-weight="800" fill="#fff">SANSA AI Generated</text>
  <foreignObject x="${width * 0.12}" y="${height * 0.78}" width="${width * 0.76}" height="${height * 0.1}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:${Math.max(18, width / 48)}px;color:white;line-height:1.35">${safePrompt}</div>
  </foreignObject>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function copyUploadedFile(file, prefix) {
  if (!file?.path) {
    const error = new Error('Upload file is required.');
    error.status = 422;
    throw error;
  }
  await ensureUploads();
  const outputName = `${prefix}-${Date.now()}-${cleanName(file.originalname)}`;
  const outputPath = path.join(uploadsDir, outputName);
  await fs.copyFile(file.path, outputPath);
  await fs.unlink(file.path).catch(() => {});
  return `/uploads/${outputName}`;
}

function toneBuffer({ seconds = 3, baseFreq = 440, sweep = false } = {}) {
  const sampleRate = 44100;
  const samples = Math.max(1, Math.floor(sampleRate * seconds));
  const bytesPerSample = 2;
  const dataSize = samples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const freq = sweep ? baseFreq + Math.sin(t * 3.2) * 160 + (i / samples) * 110 : baseFreq;
    const envelope = Math.min(1, i / 2205, (samples - i) / 4410);
    const value = Math.sin(2 * Math.PI * freq * t) * 0.32 * envelope;
    buffer.writeInt16LE(Math.max(-1, Math.min(1, value)) * 32767, 44 + i * 2);
  }
  return buffer;
}

async function createToneFile(prefix, options) {
  await ensureUploads();
  const fileName = `${prefix}-${Date.now()}.wav`;
  await fs.writeFile(path.join(uploadsDir, fileName), toneBuffer({
    seconds: Number(options?.seconds ?? options?.duration ?? options?.length ?? 3),
    baseFreq: Number(options?.baseFreq ?? options?.frequency ?? 440),
    sweep: options?.sweep ?? true,
  }));
  return `/uploads/${fileName}`;
}

function buildAssistantReply(message) {
  const input = String(message || '').trim();
  return `SANSA AI Assistant ready. I can help with image prompts, video plans, PDF workflows, HRMS, payments and business automation. Your request: "${input.slice(0, 220)}"`;
}

module.exports = {
  consumeCredits,
  recordGeneration,
  listGenerations,
  buildImageDataUrl,
  copyUploadedFile,
  createToneFile,
  buildAssistantReply,
};
