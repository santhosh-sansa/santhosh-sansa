# SANSA Functional Website

SANSA is a working SaaS website demo for PDF tools, AI analysis, invoices, GST, payments, customer portal and AI CFO dashboard.

## Files

- `index.html` - main website and all tool cards
- `invoice.html` - GST invoice PDF generator
- `cfo-dashboard.html` - AI CFO dashboard with localStorage values
- `customer-portal.html` - static customer invoice portal
- `css/style.css` - responsive styling
- `js/main.js` - usage limits, mobile menu and command center
- `js/pdf-tools.js` - jsPDF and pdf.js PDF tools
- `js/ai-features.js` - simulated AI analysis and CFO logic
- `js/business.js` - invoice, payment link and GST logic
- `backend/server.js` - optional Express backend API

## How to Run Without Backend

Open `index.html` in a browser. The main tools work in the browser using CDN libraries:

- jsPDF for PDF creation
- pdf.js for PDF text extraction
- localStorage for free plan limits and dashboard data

## How to Run With Backend

```bash
cd backend
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Working Features

- Create PDF from user text
- Text to PDF
- Image to PDF
- PDF to Text
- Merge PDF simulated PRO alert
- Split PDF simulated alert
- AI Analyze PDF simulated summary
- Document Brain mock sentiment/topic analysis
- AI CFO dashboard saved in localStorage
- Invoice PDF with 18% GST calculation
- Razorpay test payment link alert
- GST report alert
- Customer portal static invoices
- Command Center routing
- Free plan: 2 PDF downloads per day
- Watermark on free plan PDFs
- Upgrade buttons alert Razorpay-ready message
- All PRO buttons have event listeners
- Mobile responsive hamburger menu

## Deployment

For static hosting, upload all files except `backend/node_modules`.

For Node hosting, upload the full folder and run the backend with:

```bash
node backend/server.js
```
