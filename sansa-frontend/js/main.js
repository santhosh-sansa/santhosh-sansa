(function () {
  const DAILY_LIMIT = 2;
  const USAGE_KEY = 'sansa_pdf_usage_v1';

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function readUsage() {
    const fallback = { date: todayKey(), count: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem(USAGE_KEY) || 'null') || fallback;
      if (saved.date !== todayKey()) return fallback;
      return { date: saved.date, count: Number(saved.count || 0) };
    } catch (error) {
      return fallback;
    }
  }

  function writeUsage(usage) {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    updateUsageDisplay();
  }

  window.checkUsage = function checkUsage() {
    const usage = readUsage();
    const left = Math.max(0, DAILY_LIMIT - usage.count);
    if (left <= 0) {
      alert('Free plan limit reached. Upgrade for more PDF downloads.');
      return false;
    }
    usage.count += 1;
    writeUsage(usage);
    return true;
  };

  window.getDownloadsLeft = function getDownloadsLeft() {
    const usage = readUsage();
    return Math.max(0, DAILY_LIMIT - usage.count);
  };

  function updateUsageDisplay() {
    document.querySelectorAll('#downloadsLeft').forEach((node) => {
      node.textContent = `Today left: ${window.getDownloadsLeft()} downloads`;
    });
  }

  function handleCommand() {
    const input = document.getElementById('commandInput');
    const output = document.getElementById('commandOutput');
    const command = String(input?.value || '').trim().toLowerCase();
    if (!command) {
      if (output) output.textContent = 'Type pending payments, GST report, create invoice, or AI CFO.';
      return;
    }
    if (command.includes('pending')) {
      alert('Pending payments: ₹0 pending in demo. Customer portal has sample invoices.');
      location.href = 'customer-portal.html';
    } else if (command.includes('gst')) {
      window.gstReport?.();
    } else if (command.includes('invoice')) {
      location.href = 'invoice.html';
    } else if (command.includes('cfo')) {
      location.href = 'cfo-dashboard.html';
    } else {
      if (output) output.textContent = 'No exact match. Try: GST report, create invoice, AI CFO, pending payments.';
    }
  }

  function bindBaseEvents() {
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
      document.getElementById('mainNav')?.classList.toggle('open');
    });

    document.getElementById('commandRun')?.addEventListener('click', handleCommand);
    document.getElementById('commandInput')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleCommand();
    });

    document.querySelectorAll('[data-upgrade]').forEach((button) => {
      button.addEventListener('click', () => alert('Payment integration ready - connect Razorpay'));
    });

    document.querySelectorAll('[data-pro-tool]').forEach((button) => {
      button.addEventListener('click', () => {
        alert(`${button.dataset.proTool} will be available in PRO version`);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateUsageDisplay();
    bindBaseEvents();
  });
})();
