function safeText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 1400);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const OPENAI_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
const REPLICATE_VIDEO_MODEL = process.env.REPLICATE_VIDEO_MODEL || '';
const REPLICATE_SOUND_MODEL = process.env.REPLICATE_SOUND_MODEL || '';
const REPLICATE_MUSIC_MODEL = process.env.REPLICATE_MUSIC_MODEL || '';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const CREDIT_COSTS = { image: 1, photo: 1, translate: 1, sound: 2, music: 3, video: 5 };

function apiMode(extra = {}) {
  return {
    apiReady: true,
    provider: 'demo-fallback',
    fallback: true,
    configured: {
      openai: Boolean(OPENAI_API_KEY),
      replicate: Boolean(REPLICATE_API_TOKEN),
      google: Boolean(GOOGLE_AI_API_KEY),
    },
    ...extra,
  };
}

function creativeStatus() {
  return {
    apiReady: true,
    realApiReady: true,
    fallback: true,
    providers: {
      openai: Boolean(OPENAI_API_KEY),
      replicate: Boolean(REPLICATE_API_TOKEN),
      google: Boolean(GOOGLE_AI_API_KEY),
    },
    models: {
      openaiImage: OPENAI_IMAGE_MODEL,
      openaiText: OPENAI_TEXT_MODEL,
      replicateVideo: REPLICATE_VIDEO_MODEL ? 'configured' : '',
      replicateSound: REPLICATE_SOUND_MODEL ? 'configured' : '',
      replicateMusic: REPLICATE_MUSIC_MODEL ? 'configured' : '',
    },
    modes: [
      { id: 'image', endpoint: '/api/creative/image', cost: CREDIT_COSTS.image, provider: OPENAI_API_KEY ? 'openai' : 'demo-fallback' },
      { id: 'video', endpoint: '/api/creative/video', cost: CREDIT_COSTS.video, provider: REPLICATE_API_TOKEN && REPLICATE_VIDEO_MODEL ? 'replicate' : 'demo-fallback' },
      { id: 'photo', endpoint: '/api/creative/photo-edit', cost: CREDIT_COSTS.photo, provider: OPENAI_API_KEY ? 'openai' : 'demo-fallback' },
      { id: 'translate', endpoint: '/api/creative/translate', cost: CREDIT_COSTS.translate, provider: OPENAI_API_KEY ? 'openai' : 'demo-fallback' },
      { id: 'sound', endpoint: '/api/creative/sound', cost: CREDIT_COSTS.sound, provider: REPLICATE_API_TOKEN && REPLICATE_SOUND_MODEL ? 'replicate' : 'demo-fallback' },
      { id: 'music', endpoint: '/api/creative/music', cost: CREDIT_COSTS.music, provider: REPLICATE_API_TOKEN && REPLICATE_MUSIC_MODEL ? 'replicate' : 'demo-fallback' },
    ],
  };
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || data.detail || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function openAiSize(aspectRatio = 'auto') {
  const ratio = aspectRatio === 'auto' ? '1:1' : aspectRatio;
  if (ratio === '16:9' || ratio === '21:9' || ratio === '4:3') return '1536x1024';
  if (ratio === '9:16') return '1024x1536';
  return '1024x1024';
}

async function tryOpenAiImage(body = {}) {
  if (!OPENAI_API_KEY) return null;
  const prompt = [
    safeText(body.prompt, 'SANSA AI business creative'),
    `Brand: SANSA AI. Style: ${safeText(body.style, 'Commercial clean')}.`,
    'Create a clean, commercial-safe, Sansa-branded website or business visual. Do not include Adobe branding.',
  ].join('\n');
  const data = await postJson(
    'https://api.openai.com/v1/images/generations',
    {
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: openAiSize(body.aspectRatio),
      n: 1,
    },
    { Authorization: `Bearer ${OPENAI_API_KEY}` }
  );
  const item = data.data?.[0] || {};
  if (item.b64_json) {
    return {
      ok: true,
      type: 'image',
      dataUrl: `data:image/png;base64,${item.b64_json}`,
      filename: 'sansa-ai-image.png',
      text: `SANSA Image Generator\nProvider: OpenAI ${OPENAI_IMAGE_MODEL}\nPrompt: ${safeText(body.prompt)}`,
      ...apiMode({ provider: 'openai', fallback: false }),
    };
  }
  if (item.url) {
    return {
      ok: true,
      type: 'image',
      dataUrl: item.url,
      filename: 'sansa-ai-image.png',
      text: `SANSA Image Generator\nProvider: OpenAI ${OPENAI_IMAGE_MODEL}\nPrompt: ${safeText(body.prompt)}`,
      ...apiMode({ provider: 'openai', fallback: false }),
    };
  }
  return null;
}

async function tryOpenAiText(kind, body = {}, fallbackText = '') {
  if (!OPENAI_API_KEY) return null;
  const prompt = [
    `You are SANSA AI ${kind}.`,
    'Return concise, practical output for the SANSA app. Do not mention Adobe.',
    `User prompt/transcript: ${safeText(body.prompt, fallbackText)}`,
    `Settings: model=${safeText(body.model)}, style=${safeText(body.style)}, language=${safeText(body.language)}, duration=${safeText(body.duration)}.`,
  ].join('\n');
  const data = await postJson(
    'https://api.openai.com/v1/responses',
    {
      model: OPENAI_TEXT_MODEL,
      input: prompt,
      max_output_tokens: 900,
    },
    { Authorization: `Bearer ${OPENAI_API_KEY}` }
  );
  const text = data.output_text
    || data.output?.flatMap((item) => item.content || []).map((part) => part.text || '').join('\n').trim();
  return text ? { text, provider: 'openai', model: OPENAI_TEXT_MODEL } : null;
}

async function tryReplicatePrediction(kind, body = {}) {
  const version = {
    video: REPLICATE_VIDEO_MODEL,
    sound: REPLICATE_SOUND_MODEL,
    music: REPLICATE_MUSIC_MODEL,
  }[kind];
  if (!REPLICATE_API_TOKEN || !version) return null;
  const data = await postJson(
    'https://api.replicate.com/v1/predictions',
    {
      version,
      input: {
        prompt: safeText(body.prompt, kind === 'music' ? 'modern business soundtrack' : 'SANSA business creative'),
        duration: Number(body.duration || (kind === 'music' ? 12 : 8)),
        aspect_ratio: body.aspectRatio || '16:9',
        resolution: body.resolution || '720p',
      },
    },
    {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      Prefer: 'wait=3',
    }
  );
  const output = Array.isArray(data.output) ? data.output[0] : data.output;
  return {
    ok: true,
    type: kind === 'video' ? 'storyboard' : kind,
    providerUrl: data.urls?.get || data.urls?.stream || '',
    dataUrl: typeof output === 'string' ? output : '',
    text: [
      `SANSA ${kind.toUpperCase()} API JOB`,
      `Provider: Replicate`,
      `Status: ${data.status || 'submitted'}`,
      `Prompt: ${safeText(body.prompt)}`,
      data.urls?.get ? `Track: ${data.urls.get}` : '',
    ].filter(Boolean).join('\n'),
    filename: kind === 'video' ? 'sansa-video-api-job.txt' : `sansa-${kind}-api-job.txt`,
    ...apiMode({ provider: 'replicate', fallback: false, jobStatus: data.status || 'submitted' }),
  };
}

function escapeXml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char]));
}

function seededNumber(text) {
  let hash = 2166136261;
  for (const char of String(text || 'SANSA')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function creativeSize(aspectRatio = 'auto') {
  const ratio = aspectRatio === 'auto' ? '16:9' : aspectRatio;
  const sizes = {
    '1:1': [900, 900],
    '16:9': [1280, 720],
    '9:16': [720, 1280],
    '4:3': [1120, 840],
    '21:9': [1400, 600],
  };
  const [width, height] = sizes[ratio] || sizes['16:9'];
  return { width, height };
}

function creativePalette(prompt) {
  const palettes = [
    ['#ff3158', '#3b63ff', '#8ef5c5', '#fff2a8'],
    ['#111827', '#00c2ff', '#f7f7f7', '#ffcf33'],
    ['#ff6a00', '#a100ff', '#ffe45c', '#0b1020'],
    ['#f5f5f5', '#0f62fe', '#141414', '#7cf2ff'],
    ['#0f172a', '#22c55e', '#facc15', '#f8fafc'],
  ];
  return palettes[seededNumber(prompt) % palettes.length];
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

async function buildImage(body = {}) {
  try {
    const real = await tryOpenAiImage(body);
    if (real) return real;
  } catch (error) {
    const fallback = buildDemoImage(body);
    return { ...fallback, warning: `OpenAI image fallback: ${error.message}`, ...apiMode() };
  }
  return { ...buildDemoImage(body), ...apiMode() };
}

function buildDemoImage(body = {}) {
  const prompt = safeText(body.prompt, 'SANSA AI business creative');
  const { width, height } = creativeSize(body.aspectRatio);
  const [a, b, c, d] = creativePalette(prompt);
  const seed = seededNumber(prompt);
  const title = escapeXml(prompt).slice(0, 90);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset=".55" stop-color="${b}"/>
          <stop offset="1" stop-color="${c}"/>
        </linearGradient>
        <filter id="soft"><feDropShadow dx="0" dy="18" stdDeviation="28" flood-color="#000" flood-opacity=".28"/></filter>
      </defs>
      <rect width="100%" height="100%" rx="${Math.round(width * .04)}" fill="url(#bg)"/>
      <circle cx="${width * .78}" cy="${height * .22}" r="${height * .22}" fill="${d}" opacity=".9"/>
      <circle cx="${width * .15}" cy="${height * .78}" r="${height * .18}" fill="#fff" opacity=".25"/>
      <g filter="url(#soft)">
        <rect x="${width * .1}" y="${height * .16}" width="${width * .48}" height="${height * .6}" rx="34" fill="rgba(255,255,255,.92)"/>
        <rect x="${width * .14}" y="${height * .24}" width="${width * .28}" height="18" rx="9" fill="${b}"/>
        <rect x="${width * .14}" y="${height * .32}" width="${width * .36}" height="16" rx="8" fill="#101827" opacity=".18"/>
        <rect x="${width * .14}" y="${height * .39}" width="${width * .32}" height="16" rx="8" fill="#101827" opacity=".18"/>
        <rect x="${width * .14}" y="${height * .54}" width="${width * .24}" height="${height * .13}" rx="22" fill="${a}"/>
      </g>
      <g transform="translate(${width * .61} ${height * .42})">
        <path d="M0 -130 L92 108 L-92 108 Z" fill="#050505" opacity=".92"/>
        <path d="M0 -80 L45 72 L-45 72 Z" fill="#fff" opacity=".96"/>
        <path d="M-16 18 C22 36 52 66 58 104 C18 118 -32 116 -70 96 Z" fill="#050505"/>
      </g>
      <text x="${width * .1}" y="${height * .86}" font-family="Arial, sans-serif" font-size="${Math.max(30, width * .043)}" font-weight="900" fill="#111827">SANSA AI</text>
      <text x="${width * .1}" y="${height * .92}" font-family="Arial, sans-serif" font-size="${Math.max(18, width * .022)}" fill="#111827">${title}</text>
      <text x="${width * .77}" y="${height * .88}" font-family="Arial, sans-serif" font-size="16" fill="#111827">Seed ${String(seed).slice(0, 6)}</text>
    </svg>`;
  return {
    ok: true,
    type: 'image',
    dataUrl: svgDataUrl(svg),
    filename: 'sansa-ai-image.svg',
    text: [
      'SANSA Image Generator',
      `Prompt: ${prompt}`,
      `Model: ${safeText(body.model, 'SANSA Firefly 2026')}`,
      `Aspect: ${safeText(body.aspectRatio, '16:9')}`,
      `Style: ${safeText(body.style, 'Commercial clean')}`,
    ].join('\n'),
  };
}

async function buildVideoPlan(body = {}) {
  try {
    const realJob = await tryReplicatePrediction('video', body);
    if (realJob) return realJob;
    const realText = await tryOpenAiText('video editor', body, 'SANSA AI product demo');
    if (realText) {
      const prompt = safeText(body.prompt, 'SANSA AI product demo');
      const scenes = realText.text.split(/\n+/).filter(Boolean).slice(0, 8).map((line, index) => ({
        title: `Scene ${index + 1}`,
        text: line.replace(/^\d+[\).:-]?\s*/, ''),
      }));
      return {
        ok: true,
        type: 'storyboard',
        scenes: scenes.length ? scenes : [{ title: 'Storyboard', text: realText.text }],
        text: `SANSA AI VIDEO EDITOR\nProvider: OpenAI ${realText.model}\n\n${realText.text}`,
        filename: 'sansa-video-storyboard.txt',
        ...apiMode({ provider: 'openai', fallback: false }),
      };
    }
  } catch (error) {
    const fallback = buildDemoVideoPlan(body);
    return { ...fallback, warning: `Creative video fallback: ${error.message}`, ...apiMode() };
  }
  return { ...buildDemoVideoPlan(body), ...apiMode() };
}

function buildDemoVideoPlan(body = {}) {
  const prompt = safeText(body.prompt, 'SANSA AI product demo');
  const duration = Math.max(4, Number(body.duration || 8));
  const scenes = [
    { title: 'Hook', text: `Open with the business problem: ${prompt}` },
    { title: 'Create', text: 'Show SANSA creating the document, design, caption, or invoice from one prompt.' },
    { title: 'Automate', text: 'Show payment link, share action, translation, or customer workflow.' },
    { title: 'Result', text: 'End with clear download/share CTA and brand-safe visual.' },
  ];
  const text = [
    'SANSA AI VIDEO EDITOR',
    `Prompt: ${prompt}`,
    `Model: ${safeText(body.model, 'SANSA Veo Video')}`,
    `Aspect: ${safeText(body.aspectRatio, '16:9')}`,
    `Resolution: ${safeText(body.resolution, '720p')}`,
    `Duration: ${duration} seconds`,
    '',
    ...scenes.map((scene, index) => `${index + 1}. ${scene.title} (${Math.round(duration / scenes.length)}s): ${scene.text}`),
    '',
    'Caption: Create business content faster with SANSA AI.',
  ].join('\n');
  return { ok: true, type: 'storyboard', scenes, text, filename: 'sansa-video-storyboard.txt' };
}

function translateLine(line, language) {
  const prefix = {
    Tamil: 'Tamil/Tanglish',
    Hindi: 'Hindi',
    English: 'English',
    Spanish: 'Spanish',
    French: 'French',
    German: 'German',
    Japanese: 'Japanese',
  }[language] || language || 'Translation';
  const clean = safeText(line);
  if (!clean) return '';
  const maps = {
    Tamil: [['welcome', 'Vanakkam'], ['invoice', 'invoice'], ['payment', 'payment'], ['download', 'download']],
    Hindi: [['welcome', 'Namaste'], ['invoice', 'invoice'], ['payment', 'payment'], ['download', 'download']],
  };
  let translated = clean;
  (maps[language] || []).forEach(([from, to]) => {
    translated = translated.replace(new RegExp(from, 'ig'), to);
  });
  return `[${prefix}] ${translated}`;
}

async function buildTranslation(body = {}) {
  try {
    const realText = await tryOpenAiText('video translation and subtitle generator', body, 'Welcome to SANSA AI.');
    if (realText) {
      return {
        ok: true,
        type: 'translation',
        text: `SANSA VIDEO TRANSLATION\nProvider: OpenAI ${realText.model}\nTarget: ${safeText(body.language, 'Tamil')}\nFile: ${safeText(body.fileName, 'No media uploaded')}\n\n${realText.text}`,
        filename: `sansa-${safeText(body.language, 'translation').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-subtitles.txt`,
        ...apiMode({ provider: 'openai', fallback: false }),
      };
    }
  } catch (error) {
    const fallback = buildDemoTranslation(body);
    return { ...fallback, warning: `Translation fallback: ${error.message}`, ...apiMode() };
  }
  return { ...buildDemoTranslation(body), ...apiMode() };
}

function buildDemoTranslation(body = {}) {
  const input = safeText(body.prompt, 'Welcome to SANSA AI. Create invoice, collect payment, and download PDF.');
  const language = safeText(body.language, 'Tamil');
  const lines = input.split(/\n+/).map((line) => translateLine(line, language)).filter(Boolean);
  const srt = lines.map((line, index) => {
    const start = String(index * 4).padStart(2, '0');
    const end = String(index * 4 + 3).padStart(2, '0');
    return `${index + 1}\n00:00:${start},000 --> 00:00:${end},000\n${line}`;
  }).join('\n\n');
  return {
    ok: true,
    type: 'translation',
    text: `SANSA VIDEO TRANSLATION\nTarget: ${language}\nFile: ${safeText(body.fileName, 'No media uploaded')}\n\n${lines.join('\n')}\n\nSRT:\n${srt}`,
    filename: `sansa-${language.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-subtitles.srt`,
  };
}

function wavDataUrl(samples, sampleRate = 22050) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff), 44 + index * 2);
  });
  return `data:audio/wav;base64,${buffer.toString('base64')}`;
}

async function buildAudio(body = {}, kind = 'sound') {
  try {
    const realJob = await tryReplicatePrediction(kind, body);
    if (realJob) return realJob;
  } catch (error) {
    const fallback = buildDemoAudio(body, kind);
    return { ...fallback, warning: `Audio provider fallback: ${error.message}`, ...apiMode() };
  }
  return { ...buildDemoAudio(body, kind), ...apiMode() };
}

function buildDemoAudio(body = {}, kind = 'sound') {
  const prompt = safeText(body.prompt, kind === 'music' ? 'modern business soundtrack' : 'clean success sound');
  const sampleRate = 22050;
  const duration = Math.min(kind === 'music' ? 18 : 8, Math.max(2, Number(body.duration || (kind === 'music' ? 12 : 4))));
  const total = Math.floor(sampleRate * duration);
  const seed = seededNumber(`${prompt}${body.style}${kind}`);
  const base = kind === 'music' ? 220 + (seed % 160) : 360 + (seed % 520);
  const samples = [];
  for (let i = 0; i < total; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t * 4) * Math.max(0, 1 - t / duration);
    const pulse = Math.sin(2 * Math.PI * base * t);
    const harmonic = Math.sin(2 * Math.PI * (base * 1.5) * t) * .35;
    const rhythm = kind === 'music' ? Math.sin(2 * Math.PI * (2 + (seed % 3)) * t) * .18 : Math.sin(2 * Math.PI * (8 + (seed % 8)) * t) * .16;
    samples.push((pulse * .42 + harmonic + rhythm) * envelope);
  }
  return {
    ok: true,
    type: kind === 'music' ? 'music' : 'sound',
    dataUrl: wavDataUrl(samples, sampleRate),
    waveform: Array.from({ length: 48 }, (_, index) => 18 + ((seed + index * 31) % 82)),
    filename: kind === 'music' ? 'sansa-music.wav' : 'sansa-sound-effect.wav',
    text: `SANSA ${kind === 'music' ? 'MUSIC GENERATOR' : 'SOUND EFFECTS'}\nPrompt: ${prompt}\nDuration: ${duration}s\nStyle: ${safeText(body.style, 'Commercial clean')}`,
  };
}

async function buildPhotoEdit(body = {}) {
  try {
    const realText = await tryOpenAiText('photo editing prompt assistant', body, 'Edit this image for SANSA business use.');
    if (realText) {
      const base = buildDemoImage({ ...body, prompt: safeText(body.prompt, 'Edited SANSA image preview') });
      return {
        ...base,
        filename: 'sansa-photo-edit.svg',
        text: `SANSA PHOTO EDITING\nProvider: OpenAI ${realText.model}\nFile: ${safeText(body.fileName, 'No image uploaded')}\n\n${realText.text}`,
        ...apiMode({ provider: 'openai', fallback: false }),
      };
    }
  } catch (error) {
    const fallback = buildDemoPhotoEdit(body);
    return { ...fallback, warning: `Photo edit fallback: ${error.message}`, ...apiMode() };
  }
  return { ...buildDemoPhotoEdit(body), ...apiMode() };
}

function buildDemoPhotoEdit(body = {}) {
  const base = buildDemoImage({
    ...body,
    prompt: safeText(body.prompt, 'Edited SANSA image preview'),
  });
  return {
    ...base,
    filename: 'sansa-photo-edit.svg',
    text: `SANSA PHOTO EDITING\nFile: ${safeText(body.fileName, 'No image uploaded')}\nEdit: ${safeText(body.prompt, body.style || 'Clean premium edit')}`,
  };
}

module.exports = {
  creativeStatus,
  buildImage,
  buildVideoPlan,
  buildPhotoEdit,
  buildTranslation,
  buildSound: (body) => buildAudio(body, 'sound'),
  buildMusic: (body) => buildAudio(body, 'music'),
};
