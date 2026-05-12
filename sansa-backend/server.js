const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.join(__dirname, '..');

app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(root));

app.get('/health', (req, res) => {
  res.json({ ok: true, app: 'SANSA functional demo', time: new Date().toISOString() });
});

app.post('/api/generate-pdf', (req, res) => {
  const text = String(req.body?.text || 'SANSA PDF content');
  res.json({
    ok: true,
    message: 'Frontend jsPDF generates the downloadable PDF. Backend received text successfully.',
    text,
    watermark: 'SANSA FREE PLAN',
  });
});

app.post('/api/extract-text', (req, res) => {
  res.json({
    ok: true,
    message: 'Frontend pdf.js extracts text in this demo. Backend endpoint is ready for server-side extraction.',
    text: 'Sample extracted text from uploaded PDF.',
  });
});

app.get('/api/invoice', (req, res) => {
  const subtotal = 10000;
  const gst = subtotal * 0.18;
  res.json({
    ok: true,
    invoiceNo: 'INV-DEMO-1001',
    customer: 'Demo Customer',
    subtotal,
    gst,
    total: subtotal + gst,
  });
});

app.get('/api/cfo', (req, res) => {
  res.json({
    ok: true,
    sales: 0,
    profit: 0,
    pending: 0,
    insight: 'Start by creating invoices and tracking payments.',
  });
});

app.get('/api/gst-report', (req, res) => {
  res.json({
    ok: true,
    sales: 10000,
    inputTaxCredit: 1800,
    netPayable: 1800,
  });
});

app.listen(port, () => {
  console.log(`SANSA website running at http://localhost:${port}`);
});
