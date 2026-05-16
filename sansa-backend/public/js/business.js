(function () {
  function jsPDF() {
    return window.jspdf?.jsPDF;
  }

  function addWatermark(doc) {
    doc.setTextColor(170, 170, 170);
    doc.setFontSize(14);
    doc.text('SANSA FREE PLAN', 135, 285);
    doc.setTextColor(20, 20, 20);
  }

  window.generateInvoice = function generateInvoice() {
    const PDF = jsPDF();
    if (!PDF) return alert('jsPDF not loaded. Check internet/CDN.');
    if (!window.checkUsage()) return;
    const customer = document.getElementById('invoiceCustomer')?.value || 'Customer';
    const description = document.getElementById('itemDescription')?.value || 'Business service';
    const qty = Number(document.getElementById('itemQty')?.value || 1);
    const price = Number(document.getElementById('itemPrice')?.value || 0);
    const subtotal = qty * price;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    const doc = new PDF();
    doc.setFontSize(22);
    doc.text('SANSA Invoice', 14, 18);
    doc.setFontSize(12);
    doc.text(`Invoice No: INV-${Date.now().toString().slice(-6)}`, 14, 32);
    doc.text(`Customer: ${customer}`, 14, 42);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 52);
    doc.line(14, 60, 196, 60);
    doc.text('Description', 14, 72);
    doc.text('Qty', 112, 72);
    doc.text('Price', 134, 72);
    doc.text('Amount', 164, 72);
    doc.text(description, 14, 84);
    doc.text(String(qty), 112, 84);
    doc.text(`₹${price.toFixed(2)}`, 134, 84);
    doc.text(`₹${subtotal.toFixed(2)}`, 164, 84);
    doc.line(14, 94, 196, 94);
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 130, 108);
    doc.text(`GST 18%: ₹${gst.toFixed(2)}`, 130, 120);
    doc.setFontSize(15);
    doc.text(`Total: ₹${total.toFixed(2)}`, 130, 136);
    doc.setFontSize(10);
    doc.text('Payment: UPI/Razorpay link can be attached.', 14, 158);
    addWatermark(doc);
    doc.save('sansa-invoice.pdf');

    const preview = document.getElementById('invoicePreview');
    if (preview) {
      preview.textContent = `Customer: ${customer}\nSubtotal: ₹${subtotal.toFixed(2)}\nGST 18%: ₹${gst.toFixed(2)}\nTotal: ₹${total.toFixed(2)}`;
    }
  };

  window.generatePaymentLink = function generatePaymentLink() {
    alert('Payment link: https://rzp.io/l/sansa-test');
  };

  window.gstReport = function gstReport() {
    alert('GST Report: Sales: ₹10,000, Input Tax Credit: ₹1,800, Net Payable: ₹1,800');
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateInvoiceBtn')?.addEventListener('click', window.generateInvoice);
    document.getElementById('paymentLinkBtn')?.addEventListener('click', window.generatePaymentLink);
    document.getElementById('gstReportBtn')?.addEventListener('click', window.gstReport);
    document.querySelectorAll('[data-payment-demo]').forEach((button) => {
      button.addEventListener('click', window.generatePaymentLink);
    });
    document.querySelectorAll('[data-proof-demo]').forEach((button) => {
      button.addEventListener('click', () => alert('Payment proof: demo receipt verified.'));
    });
  });
})();
