(function () {
  const config = window.__SANSA_CONFIG__ || window.SANSA_CONFIG || {};
  const API_BASE = String(config.apiBaseUrl || config.apiBase || '').replace(/\/$/, '');
  const apiUrl = (path) => `${API_BASE}${path}`;
  const state = {
    user: null,
    admin: null,
    apps: [],
    plans: {},
    settings: {},
    currentCategory: 'all',
    currentPlanTab: 'individuals',
  };

  const pdfStudio = {
    text: '',
    fileName: '',
    summary: '',
    chatReply: '',
  };

  const businessOs = {
    lastInvoicePayload: null,
  };

  const categoryLabels = {
    all: 'All apps',
    beta: 'Beta',
    photo: 'Photo',
    'acrobat-pdf': 'Acrobat & PDF',
    'graphic-design': 'Graphic design',
    video: 'Video',
    illustration: 'Illustration',
    '3d-ar': '3D & AR',
    business: 'Business',
    hrms: 'HRMS',
    payments: 'Payments',
    assistant: 'AI Assistant',
    'cc-services': 'CC Services',
  };

  const menuData = {
    creativity: {
      title: 'Creativity & Design',
      columns: [
        ['Shop for', ['What is SANSA Cloud?', 'Photographers', 'Individuals', 'Business', 'Students and teachers']],
        ['Featured products', ['SANSA Image Studio', 'SANSA Video Studio', 'SANSA Express', 'SANSA Vector Designer', 'SANSA Stock']],
        ['AI-powered content creation', ['AI Image Generator', 'AI Video Editor', 'AI Photo Editing', 'AI Translation', 'AI Music Generator']],
      ],
      promo: 'More savings for students and creators.',
    },
    pdf: {
      title: 'PDF & E-signatures',
      columns: [
        ['Products', ['SANSA PDF Studio', 'SANSA Acrobat Pro Tools', 'AI Assistant for PDF', 'E-signature', 'PDF Reader']],
        ['Shop for', ['Business', 'Student & Teachers', 'Home & Personal', 'Government', 'Non-profits']],
        ['Online tools', ['Edit PDF', 'Chat with PDF', 'PDF to Word', 'Compress PDF', 'Merge PDF']],
      ],
      promo: 'Trusted PDF tools with AI summaries.',
    },
    marketing: {
      title: 'Marketing & Commerce',
      columns: [
        ["What's new", ['Brand Intelligence', 'Engagement Intelligence', 'Content Marketing', 'Campaign Automation']],
        ['AI & agents', ['Brand Concierge', 'LLM Optimizer', 'Journey Optimizer', 'Real-Time CDP']],
        ['Content & workflow', ['SANSA Business OS', 'Analytics', 'Payments', 'Customer Portal']],
      ],
      promo: 'Find a product for business growth.',
    },
    hrms: {
      title: 'HRMS',
      columns: [
        ['Core HR', ['Employee records', 'Attendance', 'Leave management', 'Payroll ready data']],
        ['Automation', ['Offer letters', 'Document requests', 'AI HR assistant', 'Approval flows']],
        ['Insights', ['Team dashboard', 'Compliance reminders', 'Hiring pipeline', 'Reports']],
      ],
      promo: 'Run HR workflows with AI assistance.',
    },
    support: {
      title: 'Help & Support',
      columns: [
        ['Help and Community', ['Help Centre', 'Enterprise Support', 'SANSA Community', 'Developer resources']],
        ['Common tasks', ['Manage my account', 'Manage my plan', 'Provider status', 'Download and install']],
        ['Learning resources', ['SANSA Learn', 'Creative tutorials', 'PDF tutorials', 'Admin guide']],
      ],
      promo: 'Make social content and documents faster.',
    },
  };

  const aiTools = [
    {
      id: 'image',
      name: 'AI Image Generator',
      icon: 'IMG',
      desc: 'Generate an original SANSA preview image from a prompt.',
      endpoint: '/api/ai/generate-image',
      fields: [
        { name: 'prompt', type: 'textarea', placeholder: 'A premium Tamil business poster for a new AI launch' },
        { name: 'style', type: 'select', options: ['cinematic', 'realistic', 'poster', 'minimal', 'neon'] },
      ],
    },
    {
      id: 'video',
      name: 'AI Video Editor',
      icon: 'VID',
      desc: 'Upload a video and apply a SANSA fallback processing workflow.',
      endpoint: '/api/ai/edit-video',
      fileField: 'video',
      fields: [
        { name: 'video', type: 'file', accept: 'video/*' },
        { name: 'effect', type: 'select', options: ['cinematic', 'social-cut', 'clean-up', 'subtitle-ready'] },
      ],
    },
    {
      id: 'photo',
      name: 'AI Photo Editing',
      icon: 'PIC',
      desc: 'Enhance or transform an uploaded image with provider-ready fallback output.',
      endpoint: '/api/ai/edit-photo',
      fileField: 'photo',
      fields: [
        { name: 'photo', type: 'file', accept: 'image/*' },
        { name: 'effect', type: 'select', options: ['enhance', 'background-ready', 'color-pop', 'product-clean'] },
      ],
    },
    {
      id: 'translate',
      name: 'AI Video Translation',
      icon: 'TR',
      desc: 'Create a subtitle translation draft for uploaded or hosted videos.',
      endpoint: '/api/ai/translate-video',
      fields: [
        { name: 'videoUrl', type: 'text', placeholder: 'Paste video URL or file name' },
        { name: 'targetLanguage', type: 'select', options: ['ta', 'hi', 'te', 'ml', 'en'] },
      ],
    },
    {
      id: 'sound',
      name: 'AI Sound Effects',
      icon: 'SFX',
      desc: 'Generate a downloadable local audio placeholder for sound design.',
      endpoint: '/api/ai/generate-sound',
      fields: [
        { name: 'description', type: 'textarea', placeholder: 'Fast whoosh for app intro' },
        { name: 'duration', type: 'number', placeholder: '5' },
      ],
    },
    {
      id: 'music',
      name: 'AI Music Generator',
      icon: 'MUS',
      desc: 'Create a short local music track placeholder with credits tracking.',
      endpoint: '/api/ai/generate-music',
      fields: [
        { name: 'prompt', type: 'textarea', placeholder: 'Modern corporate intro with warm synths' },
        { name: 'genre', type: 'select', options: ['ambient', 'electronic', 'classical', 'cinematic'] },
      ],
    },
    {
      id: 'assistant',
      name: 'AI Assistant',
      icon: 'AI',
      desc: 'Ask SANSA to suggest a creative workflow or product setup.',
      endpoint: '/api/ai/assistant',
      fields: [
        { name: 'message', type: 'textarea', placeholder: 'Plan a marketing poster, PDF quote and WhatsApp campaign' },
      ],
    },
  ];

  const appToolMap = {
    'creative-studio': 'image',
    'firefly-generator': 'image',
    express: 'assistant',
    'image-studio': 'photo',
    'video-studio': 'video',
    'pdf-studio': 'assistant',
    'acrobat-pro': 'assistant',
    stock: 'image',
    illustrator: 'image',
    lightroom: 'photo',
    'substance-3d': 'image',
    hrms: 'assistant',
    'business-os': 'assistant',
    assistant: 'assistant',
    payments: 'assistant',
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const h = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));

  async function request(path, options = {}) {
    const res = await fetch(apiUrl(path), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false || data.success === false) {
      throw new Error(data.error || data.message || data.errors?.[0]?.msg || 'Request failed.');
    }
    return data;
  }

  function showMessage(target, text, type = 'error') {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    el.className = `message ${type}`;
    el.textContent = text;
    el.classList.remove('hidden');
    window.setTimeout(() => el.classList.add('hidden'), 4200);
  }

  function showBrowseOnlyNotice(message, ms = 8000) {
    const n = $('#browseOnlyNotice');
    if (!n) return;
    n.textContent = message;
    n.classList.remove('hidden');
    window.clearTimeout(window.__sansaBrowseNoticeTimer);
    window.__sansaBrowseNoticeTimer = window.setTimeout(() => n.classList.add('hidden'), ms);
  }

  async function init() {
    bindEvents();
    await Promise.allSettled([loadMe(), loadAdmin(), loadPlatform(), loadApps(), loadPlans()]);
    renderAll();
    document.body.classList.toggle('sansa-hide-public-auth', Boolean(config.hideAccountUi));
    routeFromHash();
  }

  async function loadMe() {
    try {
      const data = await request('/api/auth/me');
      state.user = data.user || null;
    } catch (error) {
      state.user = null;
      console.warn('SANSA /api/auth/me failed:', error.message);
    }
  }

  async function loadAdmin() {
    try {
      const data = await request('/api/admin/me');
      state.admin = data.admin || null;
    } catch (error) {
      state.admin = null;
      console.warn('SANSA /api/admin/me failed:', error.message);
    }
  }

  async function loadPlatform() {
    try {
      const data = await request('/api/platform/settings');
      state.settings = data.settings || {};
      return;
    } catch (error) {
      const publicSettings = await request('/api/public-settings').catch(() => ({ settings: {} }));
      state.settings = publicSettings.settings || {};
    }
  }

  async function loadApps(category = state.currentCategory) {
    const data = await request(`/api/apps/${encodeURIComponent(category)}`);
    state.apps = data.apps || [];
  }

  async function loadPlans() {
    const data = await request('/api/plans');
    state.plans = data.tabs || {};
  }

  function renderAll() {
    renderSettings();
    renderStoryCards();
    renderCategoryTabs();
    renderApps();
    renderPricingTabs();
    renderPricing();
    renderSwitcher();
    renderProfile();
    renderWorkspace();
    renderAuthState();
    if (state.admin) renderAdminFields();
  }

  function renderSettings() {
    const settings = state.settings || {};
    const promo = settings.promo || {};
    const hero = settings.hero || {};
    $('#promoBar').innerHTML = `<strong>${h(promo.label || 'Launch offer:')}</strong> ${h(promo.text || 'Start SANSA Creative Cloud-style workspace with free AI credits.')}${
      config.hideAccountUi
        ? ''
        : ` <button type="button" class="promo-button" data-open-auth="register">${h(promo.cta || 'Start free')}</button>`
    }`;
    $('#heroTitle').textContent = hero.title || 'Create something new with SANSA AI.';
    $('#heroSubtitle').textContent = hero.subtitle || 'Design visuals, edit PDFs, automate HR, manage payments and run AI workflows in one SANSA workspace.';
  }

  function renderStoryCards() {
    const stories = [
      ['yellow', 'Save on SANSA Creative Pro', 'Get image, PDF, video, HRMS and business tools with one account.', 'apps'],
      ['dark', 'Get it done with PDF Studio', 'Upload, extract text, summarise and download in one workflow.', 'pdf-studio'],
      ['blue', 'New AI models ready', 'Connect provider keys later and keep fallback tools available now.', 'apps'],
    ];
    $('#storyGrid').innerHTML = stories.map(([tone, title, body, route]) => `
      <article class="story-card ${tone}">
        <div><h3>${h(title)}</h3><p>${h(body)}</p></div>
        <button class="${tone === 'yellow' ? 'outline-dark' : 'outline-light'}" data-route="${h(route)}">${tone === 'dark' ? 'Open PDF Studio' : 'Explore'}</button>
      </article>
    `).join('');
  }

  function renderCategoryTabs() {
    $('#categoryTabs').innerHTML = Object.entries(categoryLabels).map(([id, label]) => `
      <button class="${state.currentCategory === id ? 'active' : ''}" data-category="${h(id)}">${h(label)}</button>
    `).join('');
  }

  function renderApps() {
    const apps = state.apps.length ? state.apps : [];
    $('#appsGrid').innerHTML = apps.map((app) => `
      <article class="app-card">
        <span class="app-badge" style="background:${h(app.color || '#111')}">${h(app.short || app.icon || 'AI')}</span>
        <h3>${h(app.name)}</h3>
        <p>${h(app.description)}</p>
        <footer>
          <span class="pill">${h(app.status || 'Ready')}</span>
          <button class="ghost-button" data-open-app="${h(app.id)}">${h(app.cta || app.action || 'Open')}</button>
        </footer>
      </article>
    `).join('');
  }

  function renderPricingTabs() {
    const labels = {
      individuals: 'Individuals',
      business: 'Business',
      students: 'Students & Teachers',
      schools: 'Schools & Universities',
    };
    $('#pricingTabs').innerHTML = Object.keys(labels).map((id) => `
      <button class="${state.currentPlanTab === id ? 'active' : ''}" data-plan-tab="${h(id)}">${h(labels[id])}</button>
    `).join('');
  }

  function renderPricing() {
    const plans = state.plans[state.currentPlanTab] || [];
    $('#pricingGrid').innerHTML = plans.map((plan, index) => `
      <article class="plan-card ${index === 0 ? 'featured' : ''}">
        <span class="app-badge">${h(plan.short || 'SA')}</span>
        <h3>${h(plan.name)}</h3>
        <div class="price">${h(plan.priceText || (plan.price === 'Call' ? 'Call' : `Rs ${plan.price || 0}/mo`))}</div>
        <p>${h(plan.description || '')}</p>
        <ul class="features">${(plan.features || []).map((feature) => `<li>${h(feature)}</li>`).join('')}</ul>
        <footer>
          <span class="pill">Secure checkout</span>
          <button class="primary-button" data-checkout="${h(plan.id || 'free')}">${h(plan.cta || 'Buy now')}</button>
        </footer>
      </article>
    `).join('');
  }

  function renderSwitcher() {
    const visibleApps = (state.apps || []).slice(0, 11);
    $('#appSwitcher').innerHTML = `
      <h3>Web Apps</h3>
      <div class="app-switcher-grid">
        ${visibleApps.map((app) => `
          <button class="switcher-app" data-open-app="${h(app.id)}">
            <span class="app-badge" style="background:${h(app.color || '#111')}">${h(app.short || app.icon || 'AI')}</span>
            <span>${h(app.name.replace(/^SANSA\s+/, ''))}</span>
          </button>
        `).join('')}
        <button class="switcher-app" data-route="apps"><span class="app-badge">...</span><span>All apps</span></button>
      </div>
    `;
  }

  function renderProfile() {
    const user = state.user;
    if (!user) return;
    $('#profileMenu').innerHTML = `
      <div class="profile-card">
        <h3>${h(user.name || user.fullName || 'SANSA User')}</h3>
        <p>${h(user.email || '')}</p>
        <small>${h(user.plan || user.planId || 'Free')} plan / ${h(user.credits ?? 0)} credits</small>
        <a href="#dashboard">Manage account</a>
      </div>
      <a href="#pricing">View all plans</a>
      ${state.admin ? '<button type="button" id="openAdminPanel">Admin control</button>' : ''}
      <button type="button" id="logoutBtn">Sign out</button>
    `;
  }

  function renderWorkspace() {
    const cards = (state.apps || []).slice(0, 6);
    $('#workspaceCards').innerHTML = cards.map((app) => `
      <article class="workspace-card">
        <span class="app-badge" style="background:${h(app.color || '#111')}">${h(app.short || app.icon || 'AI')}</span>
        <h3>${h(app.name)}</h3>
        <p>${h(app.description)}</p>
      </article>
    `).join('');
    renderAiTools();
    loadAiHistory().catch(() => {});
  }

  function renderAiTools() {
    const container = $('#aiToolsGrid');
    if (!container) return;
    container.innerHTML = aiTools.map((tool) => `
      <article class="ai-tool-card">
        <span class="app-badge">${h(tool.icon)}</span>
        <h3>${h(tool.name)}</h3>
        <p>${h(tool.desc)}</p>
        <form data-ai-form="${h(tool.id)}">
          ${tool.fields.map((field) => {
            if (field.type === 'textarea') return `<textarea name="${h(field.name)}" placeholder="${h(field.placeholder || '')}" required></textarea>`;
            if (field.type === 'select') return `<select name="${h(field.name)}">${field.options.map((option) => `<option value="${h(option)}">${h(option)}</option>`).join('')}</select>`;
            if (field.type === 'file') return `<input type="file" name="${h(field.name)}" accept="${h(field.accept || '*')}" required>`;
            return `<input type="${h(field.type || 'text')}" name="${h(field.name)}" placeholder="${h(field.placeholder || '')}">`;
          }).join('')}
          <button class="primary-button full" type="submit">Run tool</button>
        </form>
        <div class="tool-result hidden" id="result-${h(tool.id)}"></div>
      </article>
    `).join('');
  }

  function renderAiResult(toolId, data) {
    const result = $(`#result-${CSS.escape(toolId)}`);
    if (!result) return;
    result.classList.remove('hidden');
    if (data.imageUrl) {
      result.innerHTML = `<strong>Ready</strong><img src="${h(data.imageUrl)}" alt="Generated image">`;
    } else if (data.videoUrl) {
      result.innerHTML = `<strong>Video ready</strong><video controls src="${h(data.videoUrl)}"></video>`;
    } else if (data.soundUrl || data.musicUrl) {
      result.innerHTML = `<strong>Audio ready</strong><audio controls src="${h(data.soundUrl || data.musicUrl)}"></audio>`;
    } else {
      result.innerHTML = `<strong>Output</strong><p class="tool-output-text">${h(data.reply || data.translatedSubtitles || data.message || 'Completed')}</p>`;
    }
  }

  async function loadAiHistory() {
    if (!state.user || !$('#aiHistory')) return;
    const data = await request('/api/ai/history');
    const history = data.history || [];
    $('#aiHistory').innerHTML = `
      <h3>Recent AI outputs</h3>
      ${history.length ? history.slice(0, 6).map((item) => `
        <div class="history-row">
          <span>${h(item.type || 'ai')}</span>
          <small>${h(item.prompt || item.resultText || 'SANSA output')}</small>
        </div>
      `).join('') : '<p>No AI outputs yet.</p>'}
    `;
  }

  async function handleAiSubmit(event) {
    const form = event.target.closest('[data-ai-form]');
    if (!form) return;
    event.preventDefault();
    if (!state.user) {
      openAuth('login');
      return;
    }
    const tool = aiTools.find((item) => item.id === form.dataset.aiForm);
    if (!tool) return;
    const button = form.querySelector('button[type="submit"]');
    const previous = button.textContent;
    button.textContent = 'Running...';
    button.disabled = true;
    try {
      const formData = new FormData(form);
      const options = { method: 'POST', credentials: 'include' };
      if (tool.fileField) {
        options.body = formData;
      } else {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(Object.fromEntries(formData.entries()));
      }
      const res = await fetch(apiUrl(tool.endpoint), options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false || data.success === false) throw new Error(data.error || data.message || 'Tool failed.');
      if (data.remainingCredits !== undefined) state.user.credits = data.remainingCredits;
      renderAiResult(tool.id, data);
      renderProfile();
      await loadAiHistory();
    } catch (error) {
      renderAiResult(tool.id, { message: error.message });
    } finally {
      button.textContent = previous;
      button.disabled = false;
    }
  }

  function renderAuthState() {
    const user = state.user;
    $('#signinButton').classList.toggle('hidden', Boolean(user) || Boolean(config.hideAccountUi));
    $('#profileButton').classList.toggle('hidden', !user);
    if (user) {
      const label = String(user.name || user.fullName || user.email || 'SA').trim();
      $('#profileButton').textContent = label.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    }
  }

  function renderAdminFields() {
    const settings = state.settings || {};
    $('#adminPromoText').value = settings.promo?.text || '';
    $('#adminHeroTitle').value = settings.hero?.title || '';
    $('#adminHeroSubtitle').value = settings.hero?.subtitle || '';
  }

  async function renderAdminUsers() {
    await renderAdminStats();
    const data = await request('/api/admin/users');
    $('#adminUsers').innerHTML = (data.users || []).map((user) => `
      <div class="user-row">
        <div><strong>${h(user.name || user.fullName || user.fullname || user.email)}</strong><br><small>${h(user.email)} / ${h(user.status || 'active')}</small></div>
        <select data-user-plan="${h(user.id)}">
          ${['Free', 'Starter', 'Business', 'Pro', 'lifetime'].map((plan) => `<option value="${plan}" ${plan.toLowerCase() === String(user.plan || user.planId || 'Free').toLowerCase() ? 'selected' : ''}>${plan}</option>`).join('')}
        </select>
        <input type="number" min="0" data-user-credits="${h(user.id)}" value="${h(user.credits ?? 0)}" aria-label="Credits">
        <select data-user-status="${h(user.id)}">
          ${['active', 'suspended'].map((status) => `<option value="${status}" ${status === (user.status || 'active') ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
        <button class="ghost-button" data-save-user="${h(user.id)}">Save</button>
        <button class="ghost-button" data-add-credit="${h(user.id)}">+10</button>
        <button class="danger-button" data-delete-user="${h(user.id)}">Delete</button>
      </div>
    `).join('');
  }

  async function renderAdminStats() {
    const target = $('#adminStats');
    if (!target) return;
    const data = await request('/api/admin/stats').catch(() => ({ stats: {} }));
    const stats = data.stats || {};
    target.innerHTML = `
      <div class="stat-card"><strong>${h(stats.totalUsers ?? 0)}</strong><span>Total users</span></div>
      <div class="stat-card"><strong>${h(stats.activeUsers ?? 0)}</strong><span>Active users</span></div>
      <div class="stat-card"><strong>${h(stats.totalCredits ?? 0)}</strong><span>Total credits</span></div>
      <div class="stat-card"><strong>${h(stats.planDistribution?.Pro ?? 0)}</strong><span>Pro plans</span></div>
    `;
  }

  function openAuth(tab = 'login') {
    if (config.hideAccountUi) {
      showBrowseOnlyNotice(
        'Sign-in and new accounts are turned off on this marketing site. Use PDF Studio or Business OS from All apps without logging in.',
      );
      return;
    }
    $('#authModal').classList.remove('hidden');
    switchAuthTab(tab);
    $('#loginEmail')?.focus();
  }

  function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    $$('[data-auth-tab]').forEach((button) => button.classList.toggle('active', button.dataset.authTab === tab));
    $('#loginForm').classList.toggle('hidden', !isLogin);
    $('#registerForm').classList.toggle('hidden', isLogin);
  }

  function closePopups() {
    $('#megaMenu').classList.add('hidden');
    $('#appSwitcher').classList.add('hidden');
    $('#profileMenu').classList.add('hidden');
    $$('.nav-link').forEach((button) => button.classList.remove('active'));
  }

  function openMega(menuId) {
    const data = menuData[menuId];
    if (!data) return;
    const menu = $('#megaMenu');
    menu.innerHTML = `
      <div class="mega-inner">
        ${data.columns.map(([heading, items]) => `
          <div class="mega-column">
            <h3>${h(heading)}</h3>
            ${items.map((item) => `<a class="mega-link" href="#apps">${h(item)}<small>${h(data.title)}</small></a>`).join('')}
          </div>
        `).join('')}
        <div class="mega-promo">
          <img src="sansa-logo.png" alt="">
          <strong>${h(data.promo)}</strong>
          <button class="primary-button" data-route="pricing">Learn more</button>
        </div>
      </div>
    `;
    menu.classList.remove('hidden');
  }

  function showView(view) {
    const isDashboard = view === 'dashboard';
    $('#homeView').classList.toggle('hidden', view !== 'home');
    $('#storyGrid').classList.toggle('hidden', view !== 'home');
    $('#appsView').classList.toggle('hidden', view !== 'home' && view !== 'apps');
    $('#pricingView').classList.toggle('hidden', view !== 'pricing');
    $('#pdfStudioView').classList.toggle('hidden', view !== 'pdf-studio');
    $('#businessOsView').classList.toggle('hidden', view !== 'business-os');
    $('#dashboardView').classList.toggle('hidden', !isDashboard);
    window.location.hash = view === 'home' ? '#home' : `#${view}`;
    closePopups();
    if (view === 'business-os') window.queueMicrotask(() => refreshBusinessOsView());
  }

  function openDashboardTool(appId) {
    showView('dashboard');
    window.requestAnimationFrame(() => {
      const toolId = appToolMap[appId] || 'assistant';
      const form = document.querySelector(`[data-ai-form="${CSS.escape(toolId)}"]`);
      const card = form?.closest('.ai-tool-card') || $('#aiToolsGrid');
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form?.querySelector('textarea, input, select')?.focus();
    });
  }

  function routeFromHash() {
    const raw = (window.location.hash.replace('#', '') || 'home').trim();
    const view = raw === 'pdf-studio' ? 'pdf-studio' : raw === 'business-os' ? 'business-os' : raw;
    if (view === 'pricing' || view === 'apps' || view === 'dashboard' || view === 'pdf-studio' || view === 'business-os') showView(view);
    else showView('home');
  }

  function pdfStudioShow(msg, type = 'error') {
    showMessage('#pdfStudioMessage', msg, type);
  }

  async function handlePdfStudioExtract() {
    const input = $('#pdfStudioFile');
    const file = input?.files?.[0];
    if (!file) {
      pdfStudioShow('Choose a PDF file first.', 'error');
      return;
    }
    const button = $('#pdfStudioExtractBtn');
    const prev = button.textContent;
    button.textContent = 'Extracting...';
    button.disabled = true;
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await fetch(apiUrl('/api/tools/pdf-to-text'), { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || data.message || 'Extract failed.');
      if (!data.text) throw new Error(data.error || 'No text extracted.');
      pdfStudio.text = data.text;
      pdfStudio.fileName = data.file || file.name;
      pdfStudio.summary = '';
      pdfStudio.chatReply = '';
      $('#pdfStudioFileMeta').textContent = `${pdfStudio.fileName} · ${data.chars || data.text.length} characters`;
      const preview = data.text.length > 5000 ? `${data.text.slice(0, 5000)}\n\n… (${data.text.length} characters total)` : data.text;
      $('#pdfStudioRawPreview').value = preview;
      $('#pdfStudioSummaryOut').value = '';
      $('#pdfStudioChatOut').value = '';
      $('#pdfStudioQuestion').value = '';
      pdfStudioShow('Text extracted. You can summarise or ask a question.', 'success');
    } catch (e) {
      pdfStudioShow(e.message || 'Extract failed.', 'error');
    } finally {
      button.textContent = prev;
      button.disabled = false;
    }
  }

  async function handlePdfStudioSummarize() {
    if (!pdfStudio.text) {
      pdfStudioShow('Extract a PDF first.', 'error');
      return;
    }
    const button = $('#pdfStudioSummarizeBtn');
    const prev = button.textContent;
    button.textContent = 'Working...';
    button.disabled = true;
    try {
      const res = await fetch(apiUrl('/api/tools/pdf-studio/summarize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: pdfStudio.text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Summary failed.');
      pdfStudio.summary = data.summary || '';
      $('#pdfStudioSummaryOut').value = pdfStudio.summary;
      pdfStudioShow('Summary ready.', 'success');
    } catch (e) {
      pdfStudioShow(e.message || 'Summary failed.', 'error');
    } finally {
      button.textContent = prev;
      button.disabled = false;
    }
  }

  async function handlePdfStudioChat() {
    if (!pdfStudio.text) {
      pdfStudioShow('Extract a PDF first.', 'error');
      return;
    }
    const message = $('#pdfStudioQuestion').value.trim();
    const button = $('#pdfStudioChatBtn');
    const prev = button.textContent;
    button.textContent = 'Searching...';
    button.disabled = true;
    try {
      const res = await fetch(apiUrl('/api/tools/pdf-studio/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: pdfStudio.text, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Chat failed.');
      pdfStudio.chatReply = data.reply || '';
      $('#pdfStudioChatOut').value = pdfStudio.chatReply;
      pdfStudioShow(message ? 'Answer updated.' : 'Overview generated.', 'success');
    } catch (e) {
      pdfStudioShow(e.message || 'Chat failed.', 'error');
    } finally {
      button.textContent = prev;
      button.disabled = false;
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handlePdfStudioDownloadTxt() {
    const text = pdfStudio.summary || $('#pdfStudioSummaryOut').value.trim();
    if (!text) {
      pdfStudioShow('Generate a summary first.', 'error');
      return;
    }
    const base = (pdfStudio.fileName || 'sansa-document').replace(/\.pdf$/i, '');
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${base}-summary.txt`);
    pdfStudioShow('Download started.', 'success');
  }

  async function handlePdfStudioDownloadPdf() {
    const text = pdfStudio.summary || $('#pdfStudioSummaryOut').value.trim();
    if (!text) {
      pdfStudioShow('Generate a summary first.', 'error');
      return;
    }
    const title = `${(pdfStudio.fileName || 'SANSA').replace(/\.pdf$/i, '')} — summary`.slice(0, 110);
    try {
      const res = await fetch(apiUrl('/api/tools/text-to-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'PDF export failed.');
      }
      const blob = await res.blob();
      const base = (pdfStudio.fileName || 'sansa-document').replace(/\.pdf$/i, '');
      downloadBlob(blob, `${base}-summary.pdf`);
      pdfStudioShow('PDF download started.', 'success');
    } catch (e) {
      pdfStudioShow(e.message || 'PDF export failed.', 'error');
    }
  }

  function businessOsShow(msg, type = 'error') {
    showMessage('#businessOsMessage', msg, type);
  }

  function bosToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function collectBusinessInvoicePayload() {
    const invoiceItems = [
      {
        name: $('#bosItem1Name').value.trim(),
        qty: $('#bosItem1Qty').value,
        rate: $('#bosItem1Rate').value,
        tax: $('#bosItem1Tax').value,
        hsn: $('#bosItem1Hsn').value.trim(),
      },
      {
        name: $('#bosItem2Name').value.trim(),
        qty: $('#bosItem2Qty').value,
        rate: $('#bosItem2Rate').value,
        tax: $('#bosItem2Tax').value,
        hsn: $('#bosItem2Hsn').value.trim(),
      },
    ].filter((row) => row.name);
    return {
      service: 'invoice',
      templateType: $('#bosTemplate').value || 'gst-invoice',
      designTemplate: 'modern',
      personName: $('#bosCustomerName').value.trim(),
      contact: $('#bosCustomerContact').value.trim(),
      details: '',
      extraDetails: $('#bosTerms').value.trim(),
      businessProfile: {
        name: $('#bosBusinessName').value.trim(),
        contact: $('#bosContact').value.trim(),
        taxId: $('#bosGstin').value.trim(),
        payment: $('#bosUpi').value.trim(),
        address: $('#bosAddress').value.trim(),
        terms: $('#bosTerms').value.trim(),
      },
      customerDetails: {
        name: $('#bosCustomerName').value.trim(),
        contact: $('#bosCustomerContact').value.trim(),
        taxId: $('#bosCustomerGstin').value.trim(),
        address: '',
      },
      invoiceItems,
      invoiceTotals: {
        discount: Number($('#bosDiscount').value || 0),
        splitMode: $('#bosSplitMode').value,
      },
      invoiceMeta: {
        invoiceNumber: $('#bosInvoiceNo').value.trim(),
        invoiceDate: $('#bosInvoiceDate').value.trim(),
        dueDate: $('#bosDueDate').value.trim(),
        status: $('#bosPayStatus').value,
        paidAmount: Number($('#bosPaidAmount').value || 0),
      },
    };
  }

  async function refreshBusinessLedger() {
    const target = $('#bosLedgerOut');
    if (!target) return;
    try {
      const data = await request('/api/payments/ledger');
      const rows = data.ledger || [];
      if (!rows.length) {
        target.innerHTML = '<p class="muted">No payment rows yet.</p>';
        return;
      }
      target.innerHTML = rows.slice(0, 12).map((row) => `
        <div class="bos-ledger-row">
          <span>${h(row.invoiceNumber || row.customerName || 'Payment')}</span>
          <span>${h(String(row.amount ?? ''))}</span>
          <span>${h(row.status || '')}</span>
        </div>
      `).join('');
    } catch (e) {
      target.innerHTML = `<p class="muted">${h(e.message)}</p>`;
    }
  }

  async function refreshBusinessOsView() {
    const dateInput = $('#bosInvoiceDate');
    if (dateInput && !dateInput.value) dateInput.value = bosToday();

    const hint = $('#bosProfileHint');
    if (hint) {
      hint.textContent = state.user
        ? 'Profile saves to your SANSA account when you click Save.'
        : 'Sign in to save your business profile.';
    }

    if (state.user) {
      try {
        const data = await request('/api/business/setup');
        const s = data.setup || {};
        $('#bosBusinessName').value = s.businessName || '';
        $('#bosContact').value = s.contact || '';
        $('#bosGstin').value = s.gstin || '';
        $('#bosUpi').value = s.upi || '';
      } catch (e) {
        /* ignore */
      }
    }

    await refreshBusinessLedger();
  }

  async function handleBosPreview() {
    const button = $('#bosPreviewBtn');
    const prev = button.textContent;
    button.textContent = '…';
    button.disabled = true;
    try {
      const payload = collectBusinessInvoicePayload();
      if (!payload.invoiceItems.length) {
        businessOsShow('Add at least one line item with a name.', 'error');
        return;
      }
      const res = await fetch(apiUrl('/api/tools/business-os/invoice-preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Preview failed.');
      businessOs.lastInvoicePayload = payload;
      $('#bosPreviewOut').value = data.draft || '';
      $('#bosUpiOut').textContent = data.paymentUrl
        ? `UPI deep link: ${data.paymentUrl}`
        : 'Add a UPI id (e.g. shop@paytm) in the payment field to generate a pay link.';
      businessOsShow('Draft ready.', 'success');
    } catch (e) {
      businessOsShow(e.message || 'Preview failed.', 'error');
    } finally {
      button.textContent = prev;
      button.disabled = false;
    }
  }

  async function handleBosPdf() {
    const payload = businessOs.lastInvoicePayload || collectBusinessInvoicePayload();
    if (!payload.invoiceItems.length) {
      businessOsShow('Add line items, then Preview or download.', 'error');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/services/pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'PDF failed.');
      }
      const blob = await res.blob();
      const inv = payload.invoiceMeta?.invoiceNumber || `sansa-${Date.now()}`;
      const name = String(inv).replace(/[^\w.-]+/g, '-');
      downloadBlob(blob, `${name}.pdf`);
      businessOsShow('Invoice PDF downloaded.', 'success');
    } catch (e) {
      businessOsShow(e.message || 'PDF failed.', 'error');
    }
  }

  async function handleBosSaveProfile() {
    if (!state.user) {
      openAuth('login');
      businessOsShow('Please sign in to save your profile.', 'error');
      return;
    }
    try {
      await request('/api/business/setup', {
        method: 'POST',
        body: JSON.stringify({
          businessName: $('#bosBusinessName').value.trim(),
          contact: $('#bosContact').value.trim(),
          gstin: $('#bosGstin').value.trim(),
          upi: $('#bosUpi').value.trim(),
        }),
      });
      businessOsShow('Business profile saved.', 'success');
    } catch (e) {
      businessOsShow(e.message || 'Save failed.', 'error');
    }
  }

  async function handleBosGst() {
    try {
      const res = await fetch(apiUrl('/api/tools/business-os/gst-estimate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          taxableSales: Number($('#bosGstSales').value || 0),
          gstRate: Number($('#bosGstRate').value || 18),
          inputTaxCredit: Number($('#bosGstItc').value || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || 'GST estimate failed.');
      $('#bosGstOut').textContent = [
        `Taxable sales: Rs.${Number(data.taxableSales).toFixed(2)}`,
        `GST @ ${data.gstRate}%: Rs.${Number(data.outputTax).toFixed(2)}`,
        `Input tax credit: Rs.${Number(data.inputTaxCredit).toFixed(2)}`,
        `Net payable (output − ITC): Rs.${Number(data.netPayable).toFixed(2)}`,
        '',
        'Note: illustrative only; consult your CA for filing.',
      ].join('\n');
      businessOsShow('GST estimate updated.', 'success');
    } catch (e) {
      businessOsShow(e.message || 'GST estimate failed.', 'error');
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;
    try {
      if (email.toLowerCase().startsWith('admin')) {
        const admin = await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: email, password }) });
        state.admin = admin.admin;
        await loadPlatform();
        renderAll();
        $('#authModal').classList.add('hidden');
        $('#adminPanel').classList.remove('hidden');
        await renderAdminUsers();
        return;
      }
      const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      state.user = data.user;
      $('#authModal').classList.add('hidden');
      renderAll();
      showView('dashboard');
    } catch (error) {
      showMessage('#authMessage', error.message, 'error');
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const password = $('#regPassword').value;
    if (password !== $('#regConfirm').value) {
      showMessage('#authMessage', 'Passwords do not match.', 'error');
      return;
    }
    try {
      const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: $('#regName').value.trim(),
          fullName: $('#regName').value.trim(),
          email: $('#regEmail').value.trim(),
          mobile: $('#regMobile').value.trim(),
          password,
          userType: $('#regUserType').value,
        }),
      });
      state.user = data.user;
      $('#authModal').classList.add('hidden');
      renderAll();
      showView('dashboard');
    } catch (error) {
      showMessage('#authMessage', error.message, 'error');
    }
  }

  async function handleSocialLogin(provider) {
    try {
      let clientId = localStorage.getItem('sansa_social_client_id');
      if (!clientId) {
        clientId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('sansa_social_client_id', clientId);
      }
      showMessage('#authMessage', `${provider} sign-in connecting...`, 'success');
      const data = await request('/api/auth/social', {
        method: 'POST',
        body: JSON.stringify({ provider, clientId }),
      });
      state.user = data.user;
      $('#authModal').classList.add('hidden');
      renderAll();
      showView('dashboard');
    } catch (error) {
      showMessage('#authMessage', error.message || `${provider} sign-in failed.`, 'error');
    }
  }

  async function logout() {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    await request('/api/admin/logout', { method: 'POST' }).catch(() => {});
    state.user = null;
    state.admin = null;
    renderAll();
    showView('home');
  }

  async function checkout(planId) {
    try {
      const data = await request('/api/subscription/checkout', { method: 'POST', body: JSON.stringify({ planId }) });
      const checkout = data.checkout || data;
      const url = checkout.paymentUrl;
      if (url) window.open(url, '_blank', 'noopener');
      else showMessage('#authMessage', 'Free plan activated.', 'success');
    } catch (error) {
      if (config.hideAccountUi) {
        showBrowseOnlyNotice(error.message || 'Checkout needs the full workspace with accounts enabled.', 9000);
      } else {
        showMessage('#authMessage', error.message, 'error');
        openAuth(state.user ? 'login' : 'register');
      }
    }
  }

  function bindEvents() {
    document.addEventListener('click', async (event) => {
      const authButton = event.target.closest('[data-open-auth]');
      if (authButton) openAuth(authButton.dataset.openAuth);

      const routeButton = event.target.closest('[data-route]');
      if (routeButton) showView(routeButton.dataset.route);

      const menuButton = event.target.closest('[data-menu]');
      if (menuButton) {
        const open = menuButton.classList.contains('active');
        closePopups();
        if (!open) {
          menuButton.classList.add('active');
          openMega(menuButton.dataset.menu);
        }
      }

      const categoryButton = event.target.closest('[data-category]');
      if (categoryButton) {
        state.currentCategory = categoryButton.dataset.category;
        await loadApps(state.currentCategory);
        renderCategoryTabs();
        renderApps();
      }

      const planButton = event.target.closest('[data-plan-tab]');
      if (planButton) {
        state.currentPlanTab = planButton.dataset.planTab;
        renderPricingTabs();
        renderPricing();
      }

      const checkoutButton = event.target.closest('[data-checkout]');
      if (checkoutButton) checkout(checkoutButton.dataset.checkout);

      const openApp = event.target.closest('[data-open-app]');
      if (openApp) {
        const appId = openApp.dataset.openApp;
        if (appId === 'pdf-studio') {
          showView('pdf-studio');
          return;
        }
        if (appId === 'business-os') {
          showView('business-os');
          return;
        }
        if (!state.user) openAuth('login');
        else openDashboardTool(appId);
      }

      const social = event.target.closest('[data-social]');
      if (social) await handleSocialLogin(social.dataset.social);

      const saveUser = event.target.closest('[data-save-user]');
      if (saveUser) {
        const id = saveUser.dataset.saveUser;
        const plan = $(`[data-user-plan="${CSS.escape(id)}"]`)?.value || 'Free';
        const credits = Number($(`[data-user-credits="${CSS.escape(id)}"]`)?.value || 0);
        const status = $(`[data-user-status="${CSS.escape(id)}"]`)?.value || 'active';
        await request(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ plan, planId: plan, credits, status }) });
        showMessage('#adminStatus', 'User updated.', 'success');
        await renderAdminUsers();
      }

      const addCredit = event.target.closest('[data-add-credit]');
      if (addCredit) {
        await request(`/api/admin/users/${encodeURIComponent(addCredit.dataset.addCredit)}/add-credits`, {
          method: 'POST',
          body: JSON.stringify({ credits: 10 }),
        });
        showMessage('#adminStatus', 'Credits added.', 'success');
        await renderAdminUsers();
      }

      const deleteUserButton = event.target.closest('[data-delete-user]');
      if (deleteUserButton && window.confirm('Delete this user?')) {
        await request(`/api/admin/users/${encodeURIComponent(deleteUserButton.dataset.deleteUser)}`, { method: 'DELETE' });
        showMessage('#adminStatus', 'User deleted.', 'success');
        await renderAdminUsers();
      }
    });

    $('#appSwitcherBtn').addEventListener('click', () => {
      $('#appSwitcher').classList.toggle('hidden');
      $('#profileMenu').classList.add('hidden');
      $('#megaMenu').classList.add('hidden');
    });
    $('#profileButton').addEventListener('click', () => {
      $('#profileMenu').classList.toggle('hidden');
      $('#appSwitcher').classList.add('hidden');
      $('#megaMenu').classList.add('hidden');
    });
    $('#closeAuth').addEventListener('click', () => $('#authModal').classList.add('hidden'));
    $('#closeAdmin').addEventListener('click', () => $('#adminPanel').classList.add('hidden'));
    $('#loginForm').addEventListener('submit', handleLogin);
    $('#registerForm').addEventListener('submit', handleRegister);
    document.addEventListener('submit', handleAiSubmit);
    $('#guestDemoBtn').addEventListener('click', async () => {
      $('#loginEmail').value = 'demo@sansaai.in';
      $('#loginPassword').value = 'demo123';
      $('#loginForm').requestSubmit();
    });
    $('#saveAdminSettings').addEventListener('click', async () => {
      try {
        const data = await request('/api/admin/settings', {
          method: 'POST',
          body: JSON.stringify({
            promo: { text: $('#adminPromoText').value },
            hero: { title: $('#adminHeroTitle').value, subtitle: $('#adminHeroSubtitle').value },
          }),
        });
        state.settings = data.settings;
        renderSettings();
        showMessage('#adminStatus', 'Settings saved.', 'success');
      } catch (error) {
        showMessage('#adminStatus', error.message, 'error');
      }
    });
    $('#refreshUsers').addEventListener('click', () => renderAdminUsers().catch((error) => showMessage('#adminStatus', error.message, 'error')));
    window.addEventListener('hashchange', routeFromHash);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePopups();
    });
    $('#pdfStudioExtractBtn')?.addEventListener('click', handlePdfStudioExtract);
    $('#pdfStudioSummarizeBtn')?.addEventListener('click', handlePdfStudioSummarize);
    $('#pdfStudioChatBtn')?.addEventListener('click', handlePdfStudioChat);
    $('#pdfStudioDownloadTxt')?.addEventListener('click', handlePdfStudioDownloadTxt);
    $('#pdfStudioDownloadPdf')?.addEventListener('click', handlePdfStudioDownloadPdf);
    $('#bosPreviewBtn')?.addEventListener('click', handleBosPreview);
    $('#bosPdfBtn')?.addEventListener('click', handleBosPdf);
    $('#bosSaveProfileBtn')?.addEventListener('click', handleBosSaveProfile);
    $('#bosRefreshLedgerBtn')?.addEventListener('click', refreshBusinessLedger);
    $('#bosGstCalcBtn')?.addEventListener('click', handleBosGst);
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header, .mega-menu, .app-switcher, .profile-menu')) closePopups();
      if (event.target.closest('#logoutBtn')) logout();
      if (event.target.closest('#openAdminPanel')) {
        $('#adminPanel').classList.remove('hidden');
        renderAdminFields();
        renderAdminUsers().catch((error) => showMessage('#adminStatus', error.message, 'error'));
      }
    });
  }

  init().catch((error) => {
    console.error(error);
    showMessage('#authMessage', 'SANSA platform failed to initialise. Please restart backend app.', 'error');
  });
}());
