(function () {
  function jsPDF() {
    return window.jspdf?.jsPDF;
  }

  function addWatermark(doc) {
    doc.setTextColor(170, 170, 170);
    doc.setFontSize(14);
    doc.text('SANSA FREE PLAN', 135, 285, { angle: 0 });
    doc.setTextColor(20, 20, 20);
  }

  function savePdf(doc, filename) {
    if (!window.checkUsage()) return;
    addWatermark(doc);
    doc.save(filename);
  }

  function writeWrappedText(doc, text, x = 14, y = 20) {
    const lines = doc.splitTextToSize(text || 'SANSA PDF document', 180);
    let cursorY = y;
    lines.forEach((line) => {
      if (cursorY > 280) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, x, cursorY);
      cursorY += 8;
    });
  }

  window.createPDF = function createPDF() {
    const PDF = jsPDF();
    if (!PDF) return alert('jsPDF not loaded. Check internet/CDN.');
    const text = document.getElementById('createPdfText')?.value || 'SANSA sample PDF';
    const doc = new PDF();
    doc.setFontSize(18);
    doc.text('SANSA Create PDF', 14, 14);
    doc.setFontSize(12);
    writeWrappedText(doc, text, 14, 28);
    savePdf(doc, 'sansa-create-pdf.pdf');
  };

  window.textToPDF = function textToPDF() {
    const PDF = jsPDF();
    if (!PDF) return alert('jsPDF not loaded. Check internet/CDN.');
    const text = document.getElementById('textToPdfInput')?.value || 'SANSA Text to PDF';
    const doc = new PDF();
    doc.setFontSize(18);
    doc.text('SANSA Text to PDF', 14, 14);
    doc.setFontSize(12);
    writeWrappedText(doc, text, 14, 28);
    savePdf(doc, 'sansa-text-to-pdf.pdf');
  };

  window.imageToPDF = async function imageToPDF() {
    const PDF = jsPDF();
    if (!PDF) return alert('jsPDF not loaded. Check internet/CDN.');
    const input = document.getElementById('imageToPdfInput');
    const files = Array.from(input?.files || []);
    if (!files.length) return alert('Please choose JPG/PNG images.');
    const doc = new PDF();
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);
      if (index > 0) doc.addPage();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const ratio = Math.min((pageWidth - 20) / img.width, (pageHeight - 30) / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;
      doc.text(`SANSA Image ${index + 1}`, 10, 12);
      doc.addImage(dataUrl, file.type === 'image/png' ? 'PNG' : 'JPEG', 10, 20, width, height);
    }
    savePdf(doc, 'sansa-images.pdf');
  };

  window.pdfToText = async function pdfToText() {
    if (!window.pdfjsLib) return alert('pdf.js not loaded. Check internet/CDN.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const file = document.getElementById('pdfToTextInput')?.files?.[0];
    const output = document.getElementById('pdfTextOutput');
    if (!file) return alert('Please upload a PDF.');
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(' '));
    }
    if (output) output.value = pages.join('\n\n');
    alert(`PDF text extracted from ${pdf.numPages} page(s).`);
  };

  window.mergePDFs = function mergePDFs() {
    const count = document.getElementById('mergePdfInput')?.files?.length || 0;
    alert(count >= 2 ? `Merge feature - PRO version. ${count} PDFs selected.` : 'Choose at least 2 PDFs. Merge feature is PRO version.');
  };

  window.splitPDF = function splitPDF() {
    const file = document.getElementById('splitPdfInput')?.files?.[0];
    const pages = document.getElementById('splitPagesInput')?.value || '1';
    if (!file) return alert('Please choose a PDF to split.');
    alert(`Split PDF simulated. File: ${file.name}. Pages requested: ${pages}. PRO backend can create extracted file.`);
  };

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createPdfBtn')?.addEventListener('click', window.createPDF);
    document.getElementById('textToPdfBtn')?.addEventListener('click', window.textToPDF);
    document.getElementById('imageToPdfBtn')?.addEventListener('click', window.imageToPDF);
    document.getElementById('pdfToTextBtn')?.addEventListener('click', window.pdfToText);
    document.getElementById('mergePdfBtn')?.addEventListener('click', window.mergePDFs);
    document.getElementById('splitPdfBtn')?.addEventListener('click', window.splitPDF);
  });
})();
