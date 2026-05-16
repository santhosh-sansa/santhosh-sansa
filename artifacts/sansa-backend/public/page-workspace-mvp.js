/**
 * Rich MVP panels for page.html?page=payments | hrms | pdf-studio
 * (Runs after page-shell.js basic metadata render.)
 */
(function () {
  function apiBase() {
    return window.__SANSA_CONFIG__?.apiBaseUrl || 'https://api.sansaai.in';
  }

  function pageKey() {
    const params = new URLSearchParams(location.search);
    return params.get('page') || document.body.dataset.page || 'products';
  }

  const MVP = new Set(['payments', 'hrms', 'pdf-studio']);

  async function fetchJson(path, options) {
    const res = await fetch(`${apiBase()}${path}`, { credentials: 'include', ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || res.statusText);
    return data;
  }

  async function downloadHrmsCsv(kind) {
    const res = await fetch(`${apiBase()}/api/hrms/export?kind=${encodeURIComponent(kind)}`, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || res.statusText);
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = kind === 'attendance' ? 'hrms-attendance.csv' : 'hrms-employees.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function mountPayments(root) {
    fetchJson('/api/payments/config')
      .then((c) => {
        const upi = c.defaultUpi || '';
        const input = root.querySelector('[data-pay-upi]');
        if (input && upi) input.value = upi;
        const hint = root.querySelector('[data-pay-keys-hint]');
        if (hint) {
          hint.textContent = c.razorpayReady
            ? 'Razorpay keys detected — payment links and orders use live API.'
            : 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server for Razorpay link + order APIs.';
        }
      })
      .catch(() => {});

    async function refreshLedger() {
      const box = root.querySelector('[data-pay-ledger]');
      box.textContent = 'Loading…';
      try {
        const d = await fetchJson('/api/payments/ledger');
        const rows = d.ledger || [];
        if (!rows.length) {
          box.textContent = 'No payment events yet.';
          return;
        }
        box.innerHTML = `<table class="mvp-table"><thead><tr><th>When</th><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows
          .map(
            (r) =>
              `<tr><td>${(r.createdAt || '').slice(0, 19)}</td><td>${r.invoiceNumber || ''}</td><td>${r.customerName || ''}</td><td>₹${Number(
                r.amount || 0,
              ).toFixed(2)}</td><td>${r.status || ''}</td></tr>`,
          )
          .join('')}</tbody></table>`;
      } catch (e) {
        box.textContent = e.message;
      }
    }

    root.querySelector('[data-pay-refresh]').addEventListener('click', refreshLedger);
    root.querySelector('[data-pay-create]').addEventListener('click', async () => {
      const out = root.querySelector('[data-pay-out]');
      out.textContent = 'Creating…';
      try {
        const body = {
          amount: Number(root.querySelector('[data-pay-amount]').value || 0),
          customerName: root.querySelector('[data-pay-customer]').value.trim(),
          invoiceNumber: root.querySelector('[data-pay-invoice]').value.trim(),
          upiId: root.querySelector('[data-pay-upi]').value.trim(),
          provider: root.querySelector('[data-pay-provider]').value,
        };
        const d = await fetchJson('/api/payments/create-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        out.innerHTML = `<p><strong>Provider:</strong> ${d.provider}</p><p><strong>Invoice:</strong> ${d.invoiceNumber}</p><p><a href="${d.paymentUrl}" target="_blank" rel="noopener">Open payment link</a></p><p class="mvp-muted">UPI link uses pa/pn/am/cu/tn fields; open on a device with a UPI app.</p>`;
        await refreshLedger();
      } catch (e) {
        out.textContent = e.message;
      }
    });

    root.querySelector('[data-pay-order]').addEventListener('click', async () => {
      const out = root.querySelector('[data-pay-order-out]');
      out.textContent = 'Creating order…';
      try {
        const d = await fetchJson('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(root.querySelector('[data-pay-amount]').value || 0),
            customerName: root.querySelector('[data-pay-customer]').value.trim(),
            invoiceNumber: root.querySelector('[data-pay-invoice]').value.trim(),
          }),
        });
        out.innerHTML = `<p><strong>Order ID:</strong> <code>${d.orderId}</code></p><p><strong>Key (checkout):</strong> <code>${d.keyId}</code></p><p class="mvp-muted">Use Razorpay Standard Checkout or mobile SDK with this order_id. Ledger records status <code>order_created</code>.</p>`;
        await refreshLedger();
      } catch (e) {
        out.textContent = e.message;
      }
    });

    root.querySelector('[data-pay-mark]').addEventListener('click', async () => {
      const out = root.querySelector('[data-pay-out]');
      try {
        await fetchJson('/api/payments/mark-paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: root.querySelector('[data-pay-invoice]').value.trim(),
            customerName: root.querySelector('[data-pay-customer]').value.trim(),
            amount: Number(root.querySelector('[data-pay-amount]').value || 0),
          }),
        });
        out.textContent = 'Marked as paid (demo ledger).';
        await refreshLedger();
      } catch (e) {
        out.textContent = e.message;
      }
    });

    refreshLedger();
  }

  function mountHrms(root) {
    async function loadEmployees() {
      const d = await fetchJson('/api/hrms/employees');
      const tbody = root.querySelector('[data-hrms-emp-body]');
      tbody.innerHTML = (d.employees || [])
        .map(
          (e) =>
            `<tr><td>${e.name}</td><td>${e.role}</td><td>${e.department}</td><td>${e.joinedAt}</td><td><button type="button" class="mvp-mini" data-del="${e.id}">Remove</button></td></tr>`,
        )
        .join('') || '<tr><td colspan="5">No employees yet.</td></tr>';
      tbody.querySelectorAll('[data-del]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await fetch(`${apiBase()}/api/hrms/employees/${encodeURIComponent(btn.dataset.del)}`, { method: 'DELETE', credentials: 'include' });
          await loadEmployees();
          await loadAttendance();
          await loadLeave();
        });
      });
      const sel = root.querySelector('[data-hrms-att-emp]');
      const stubSel = root.querySelector('[data-hrms-stub-emp]');
      const opts = (d.employees || []).map((e) => `<option value="${e.id}">${e.name}</option>`).join('');
      sel.innerHTML = opts;
      stubSel.innerHTML = opts;
    }

    async function loadAttendance() {
      const d = await fetchJson('/api/hrms/attendance');
      const tbody = root.querySelector('[data-hrms-att-body]');
      tbody.innerHTML = (d.rows || [])
        .map((r) => `<tr><td>${r.date}</td><td>${r.employeeId}</td><td>${r.status}</td><td>${r.note || ''}</td></tr>`)
        .join('') || '<tr><td colspan="4">No attendance rows yet.</td></tr>';
    }

    async function loadLeave() {
      const box = root.querySelector('[data-hrms-leave-body]');
      box.innerHTML = '<tr><td colspan="6">Loading…</td></tr>';
      try {
        const year = root.querySelector('[data-hrms-leave-year]').value.trim() || new Date().getFullYear();
        const d = await fetchJson(`/api/hrms/leave-balance?year=${encodeURIComponent(year)}`);
        const rows = d.rows || [];
        box.innerHTML =
          rows
            .map(
              (r) =>
                `<tr><td>${r.name}</td><td>${r.daysPresent}</td><td>${r.daysLeave}</td><td>${r.daysAbsent}</td><td>${r.leaveTaken}</td><td>${r.leaveBalance}</td></tr>`,
            )
            .join('') || '<tr><td colspan="6">No employees.</td></tr>';
      } catch (e) {
        box.innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
      }
    }

    root.querySelector('[data-hrms-csv-emp]').addEventListener('click', async () => {
      try {
        await downloadHrmsCsv('employees');
      } catch (e) {
        alert(e.message);
      }
    });
    root.querySelector('[data-hrms-csv-att]').addEventListener('click', async () => {
      try {
        await downloadHrmsCsv('attendance');
      } catch (e) {
        alert(e.message);
      }
    });

    root.querySelector('[data-hrms-add]').addEventListener('click', async () => {
      await fetchJson('/api/hrms/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: root.querySelector('[data-hrms-name]').value,
          role: root.querySelector('[data-hrms-role]').value,
          department: root.querySelector('[data-hrms-dept]').value,
        }),
      });
      await loadEmployees();
      await loadAttendance();
      await loadLeave();
    });

    root.querySelector('[data-hrms-att-add]').addEventListener('click', async () => {
      await fetchJson('/api/hrms/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: root.querySelector('[data-hrms-att-emp]').value,
          date: root.querySelector('[data-hrms-att-date]').value,
          status: root.querySelector('[data-hrms-att-status]').value,
          note: root.querySelector('[data-hrms-att-note]').value,
        }),
      });
      await loadAttendance();
      await loadLeave();
    });

    root.querySelector('[data-hrms-leave-refresh]').addEventListener('click', () => loadLeave());

    root.querySelector('[data-hrms-stub-run]').addEventListener('click', async () => {
      const out = root.querySelector('[data-hrms-stub-out]');
      out.textContent = 'Loading…';
      try {
        const emp = root.querySelector('[data-hrms-stub-emp]').value;
        const month = root.querySelector('[data-hrms-stub-month]').value.trim();
        const rate = root.querySelector('[data-hrms-stub-rate]').value.trim();
        const q = new URLSearchParams({ employeeId: emp, month });
        if (rate) q.set('dailyRate', rate);
        const d = await fetchJson(`/api/hrms/payroll-stub?${q}`);
        out.textContent = JSON.stringify(d, null, 2);
      } catch (e) {
        out.textContent = e.message;
      }
    });

    const dInput = root.querySelector('[data-hrms-att-date]');
    if (dInput && !dInput.value) dInput.value = new Date().toISOString().slice(0, 10);
    const yInput = root.querySelector('[data-hrms-leave-year]');
    if (yInput && !yInput.value) yInput.value = String(new Date().getFullYear());
    const mInput = root.querySelector('[data-hrms-stub-month]');
    if (mInput && !mInput.value) mInput.value = new Date().toISOString().slice(0, 7);

    loadEmployees().catch((e) => {
      root.querySelector('[data-hrms-emp-body]').innerHTML = `<tr><td colspan="5">${e.message}</td></tr>`;
    });
    loadAttendance().catch(() => {});
    loadLeave().catch(() => {});
  }

  async function pdfToolError(res, fallback) {
    const ct = res.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) {
      const err = await res.json().catch(() => ({}));
      return err.error || err.message || fallback;
    }
    return fallback || res.statusText;
  }

  function mountPdf(root) {
    const outEl = () => root.querySelector('[data-pdf-out]');

    root.querySelector('[data-pdf-merge]').addEventListener('click', async () => {
      const files = root.querySelector('[data-pdf-merge-files]').files;
      if (files.length < 2) {
        outEl().textContent = 'Choose at least 2 PDF files.';
        return;
      }
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('pdfs', f));
      const res = await fetch(`${apiBase()}/api/tools/pdf-merge`, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        outEl().textContent = await pdfToolError(res, res.statusText);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sansa-merge.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
      outEl().textContent = 'Merged PDF downloaded.';
    });

    root.querySelector('[data-pdf-split]').addEventListener('click', async () => {
      const f = root.querySelector('[data-pdf-split-file]').files[0];
      if (!f) {
        outEl().textContent = 'Choose one PDF.';
        return;
      }
      const fd = new FormData();
      fd.append('pdf', f);
      fd.append('pages', root.querySelector('[data-pdf-split-pages]').value.trim() || '0');
      const res = await fetch(`${apiBase()}/api/tools/pdf-split`, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        outEl().textContent = await pdfToolError(res, res.statusText);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sansa-split.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
      outEl().textContent = 'Split PDF downloaded.';
    });

    root.querySelector('[data-pdf-watermark]').addEventListener('click', async () => {
      const f = root.querySelector('[data-pdf-watermark-file]').files[0];
      if (!f) {
        outEl().textContent = 'Choose one PDF for watermark.';
        return;
      }
      const fd = new FormData();
      fd.append('pdf', f);
      fd.append('text', root.querySelector('[data-pdf-watermark-text]').value.trim() || 'SANSA');
      const res = await fetch(`${apiBase()}/api/tools/pdf-watermark`, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        outEl().textContent = await pdfToolError(res, res.statusText);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sansa-watermark.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
      outEl().textContent = 'Watermarked PDF downloaded.';
    });

    root.querySelector('[data-pdf-reorder]').addEventListener('click', async () => {
      const f = root.querySelector('[data-pdf-reorder-file]').files[0];
      if (!f) {
        outEl().textContent = 'Choose one PDF to reorder.';
        return;
      }
      const order = root.querySelector('[data-pdf-reorder-order]').value.trim();
      if (!order) {
        outEl().textContent = 'Enter new page order (comma-separated indices).';
        return;
      }
      const fd = new FormData();
      fd.append('pdf', f);
      fd.append('order', order);
      const res = await fetch(`${apiBase()}/api/tools/pdf-reorder`, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        outEl().textContent = await pdfToolError(res, res.statusText);
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sansa-reorder.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
      outEl().textContent = 'Reordered PDF downloaded.';
    });

    root.querySelector('[data-pdf-extract]').addEventListener('click', async () => {
      const f = root.querySelector('[data-pdf-extract-file]').files[0];
      if (!f) {
        outEl().textContent = 'Choose one PDF.';
        return;
      }
      const fd = new FormData();
      fd.append('pdf', f);
      const res = await fetch(`${apiBase()}/api/tools/pdf-to-text`, { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      root.querySelector('[data-pdf-text]').value = data.text || data.error || 'No text';
      outEl().textContent = data.ok ? `Extracted ${data.chars || 0} characters.` : data.error || 'Failed';
    });
  }

  function shell(key) {
    if (key === 'payments') {
      return `
        <div class="mvp-grid">
          <section class="mvp-panel">
            <h3>Create payment link</h3>
            <p class="mvp-muted" data-pay-keys-hint></p>
            <label>Amount (INR)<input type="number" data-pay-amount min="1" step="0.01" value="500"></label>
            <label>Customer<input type="text" data-pay-customer placeholder="Customer name"></label>
            <label>Invoice #<input type="text" data-pay-invoice placeholder="INV-001"></label>
            <label>UPI ID (pa)<input type="text" data-pay-upi placeholder="name@paytm"></label>
            <label>Provider
              <select data-pay-provider><option value="upi">UPI deep link</option><option value="razorpay">Razorpay link (needs keys)</option></select>
            </label>
            <button type="button" class="route-button primary" data-pay-create>Create link</button>
            <button type="button" class="route-button" data-pay-mark>Mark paid (demo)</button>
            <pre class="mvp-pre" data-pay-out></pre>
          </section>
          <section class="mvp-panel">
            <h3>Razorpay order</h3>
            <p class="mvp-muted">Creates a server-side Order (amount + receipt). Webhook still updates ledger on paid events.</p>
            <button type="button" class="route-button primary" data-pay-order>Create Razorpay order</button>
            <pre class="mvp-pre" data-pay-order-out></pre>
          </section>
          <section class="mvp-panel mvp-span2">
            <h3>Ledger <button type="button" class="route-button" data-pay-refresh>Refresh</button></h3>
            <div data-pay-ledger class="mvp-ledger"></div>
          </section>
        </div>`;
    }
    if (key === 'hrms') {
      return `
        <div class="mvp-grid">
          <section class="mvp-panel">
            <h3>Add employee</h3>
            <label>Name<input type="text" data-hrms-name></label>
            <label>Role<input type="text" data-hrms-role value="Staff"></label>
            <label>Department<input type="text" data-hrms-dept value="General"></label>
            <button type="button" class="route-button primary" data-hrms-add>Save employee</button>
          </section>
          <section class="mvp-panel">
            <h3>Employees</h3>
            <div class="mvp-inline">
              <button type="button" class="route-button" data-hrms-csv-emp>Employees CSV</button>
              <button type="button" class="route-button" data-hrms-csv-att>Attendance CSV</button>
            </div>
            <table class="mvp-table"><thead><tr><th>Name</th><th>Role</th><th>Dept</th><th>Joined</th><th></th></tr></thead><tbody data-hrms-emp-body></tbody></table>
          </section>
          <section class="mvp-panel">
            <h3>Leave balance (demo)</h3>
            <p class="mvp-muted">Counts attendance rows in the selected calendar year. Balance = 12 − leave days.</p>
            <div class="mvp-inline">
              <label>Year<input type="number" class="mvp-w-6" data-hrms-leave-year min="2000" max="2100"></label>
              <button type="button" class="route-button" data-hrms-leave-refresh>Refresh</button>
            </div>
            <table class="mvp-table"><thead><tr><th>Name</th><th>Present</th><th>Leave</th><th>Absent</th><th>Leave used</th><th>Balance</th></tr></thead><tbody data-hrms-leave-body></tbody></table>
          </section>
          <section class="mvp-panel">
            <h3>Payroll stub (demo)</h3>
            <p class="mvp-muted">JSON summary from attendance × optional daily rate (<code>?dailyRate=</code> or <code>SANSA_PAYROLL_DEMO_DAILY</code>).</p>
            <div class="mvp-inline">
              <select data-hrms-stub-emp></select>
              <label>Month<input type="month" data-hrms-stub-month></label>
              <label>Daily ₹<input type="number" class="mvp-w-6" data-hrms-stub-rate min="0" step="1" placeholder="opt"></label>
              <button type="button" class="route-button primary" data-hrms-stub-run>Load stub</button>
            </div>
            <pre class="mvp-pre" data-hrms-stub-out></pre>
          </section>
          <section class="mvp-panel mvp-span2">
            <h3>Attendance</h3>
            <div class="mvp-inline">
              <select data-hrms-att-emp></select>
              <input type="date" data-hrms-att-date>
              <select data-hrms-att-status><option>present</option><option>leave</option><option>absent</option></select>
              <input type="text" data-hrms-att-note placeholder="Note">
              <button type="button" class="route-button" data-hrms-att-add>Add row</button>
            </div>
            <table class="mvp-table"><thead><tr><th>Date</th><th>Employee id</th><th>Status</th><th>Note</th></tr></thead><tbody data-hrms-att-body></tbody></table>
          </section>
        </div>`;
    }
    if (key === 'pdf-studio') {
      return `
        <div class="mvp-grid">
          <section class="mvp-panel">
            <h3>Merge PDFs</h3>
            <p class="mvp-muted">2+ PDFs. Each file max ~12 MB for tool processing (15 MB upload cap).</p>
            <input type="file" data-pdf-merge-files accept="application/pdf,.pdf" multiple>
            <button type="button" class="route-button primary" data-pdf-merge>Merge & download</button>
          </section>
          <section class="mvp-panel">
            <h3>Split PDF (pages)</h3>
            <p class="mvp-muted">0-based: <code>0</code>, <code>0-2</code>, or <code>0,2,4</code></p>
            <input type="file" data-pdf-split-file accept="application/pdf,.pdf">
            <label>Pages<input type="text" data-pdf-split-pages value="0" placeholder="0-1"></label>
            <button type="button" class="route-button primary" data-pdf-split>Split & download</button>
          </section>
          <section class="mvp-panel">
            <h3>Watermark PDF</h3>
            <p class="mvp-muted">Diagonal text on every page (light red, semi-transparent).</p>
            <input type="file" data-pdf-watermark-file accept="application/pdf,.pdf">
            <label>Text<input type="text" data-pdf-watermark-text value="SANSA" placeholder="Watermark"></label>
            <button type="button" class="route-button primary" data-pdf-watermark>Watermark & download</button>
          </section>
          <section class="mvp-panel">
            <h3>Reorder pages</h3>
            <p class="mvp-muted">Comma list = new order of <em>all</em> pages (0-based). Example 3 pages: <code>2,0,1</code></p>
            <input type="file" data-pdf-reorder-file accept="application/pdf,.pdf">
            <label>New order<input type="text" data-pdf-reorder-order placeholder="2,0,1"></label>
            <button type="button" class="route-button primary" data-pdf-reorder>Reorder & download</button>
          </section>
          <section class="mvp-panel mvp-span2">
            <h3>PDF → text</h3>
            <input type="file" data-pdf-extract-file accept="application/pdf,.pdf">
            <button type="button" class="route-button" data-pdf-extract>Extract text</button>
            <textarea data-pdf-text rows="8" readonly placeholder="Extracted text…"></textarea>
          </section>
          <p class="mvp-span2 mvp-muted" data-pdf-out></p>
        </div>`;
    }
    return '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const key = pageKey();
    if (!MVP.has(key)) return;
    const host = document.querySelector('.route-workspace');
    if (!host) return;
    const html = shell(key);
    if (!html) return;
    host.innerHTML = `<article class="route-workspace-card mvp-wrap">${html}</article>`;
    const runBtn = document.querySelector('[data-page-action]');
    if (runBtn) runBtn.style.display = 'none';
    const root = host.querySelector('.mvp-wrap');
    if (key === 'payments') mountPayments(root);
    if (key === 'hrms') mountHrms(root);
    if (key === 'pdf-studio') mountPdf(root);
  });
})();
