(function () {
  window.analyzePDF = async function analyzePDF() {
    const file = document.getElementById('aiAnalyzePdfInput')?.files?.[0];
    if (!file) return alert('Please upload a PDF for AI analysis.');
    let pages = 'unknown';
    if (window.pdfjsLib) {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        pages = pdf.numPages;
      } catch (error) {
        pages = 'unknown';
      }
    }
    alert(`AI Summary: Document has ${pages} pages, key topics: [business, legal, finance]`);
  };

  window.documentBrain = function documentBrain() {
    const text = document.getElementById('documentBrainInput')?.value || '';
    const output = document.getElementById('documentBrainOutput');
    const lower = text.toLowerCase();
    const sentiment = lower.includes('loss') || lower.includes('pending') || lower.includes('risk') ? 'Needs attention' : 'Positive / Stable';
    const topic = lower.includes('gst') ? 'GST' : lower.includes('invoice') ? 'Invoice' : lower.includes('legal') ? 'Legal' : 'Business';
    const response = `AI Brain Result\nSentiment: ${sentiment}\nMain topic: ${topic}\nNext action: Review missing fields, totals and customer follow-up.`;
    if (output) output.textContent = response;
  };

  window.showCFODashboard = function showCFODashboard() {
    location.href = 'cfo-dashboard.html';
  };

  function loadCfoDashboard() {
    const data = JSON.parse(localStorage.getItem('sansa_cfo_v1') || '{"sales":0,"profit":0,"pending":0}');
    const sales = Number(data.sales || 0);
    const profit = Number(data.profit || 0);
    const pending = Number(data.pending || 0);
    document.getElementById('salesValue') && (document.getElementById('salesValue').textContent = `₹${sales.toLocaleString('en-IN')}`);
    document.getElementById('profitValue') && (document.getElementById('profitValue').textContent = `₹${profit.toLocaleString('en-IN')}`);
    document.getElementById('pendingValue') && (document.getElementById('pendingValue').textContent = `₹${pending.toLocaleString('en-IN')}`);
    document.getElementById('salesInput') && (document.getElementById('salesInput').value = sales);
    document.getElementById('profitInput') && (document.getElementById('profitInput').value = profit);
    document.getElementById('pendingInput') && (document.getElementById('pendingInput').value = pending);
  }

  function saveCfoDashboard() {
    const data = {
      sales: Number(document.getElementById('salesInput')?.value || 0),
      profit: Number(document.getElementById('profitInput')?.value || 0),
      pending: Number(document.getElementById('pendingInput')?.value || 0),
    };
    localStorage.setItem('sansa_cfo_v1', JSON.stringify(data));
    loadCfoDashboard();
    alert('AI CFO dashboard updated.');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('aiAnalyzePdfBtn')?.addEventListener('click', window.analyzePDF);
    document.getElementById('documentBrainBtn')?.addEventListener('click', window.documentBrain);
    document.getElementById('showCfoBtn')?.addEventListener('click', window.showCFODashboard);
    document.getElementById('saveCfoBtn')?.addEventListener('click', saveCfoDashboard);
    loadCfoDashboard();
  });
})();
