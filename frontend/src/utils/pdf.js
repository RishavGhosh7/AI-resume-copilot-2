import { jsPDF } from 'jspdf';

function wrapLines(doc, text, maxWidth) {
  const rawLines = String(text || '').replace(/\r/g, '').split('\n');
  const out = [];
  for (const line of rawLines) {
    if (!line.trim()) {
      out.push('');
      continue;
    }
    const wrapped = doc.splitTextToSize(line, maxWidth);
    out.push(...wrapped);
  }
  return out;
}

export function downloadResumePdf({
  title = 'resume',
  resumeText,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 48;
  const marginY = 54;
  const maxWidth = pageWidth - marginX * 2;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);

  const lines = wrapLines(doc, resumeText, maxWidth);

  let y = marginY;
  const lineHeight = 15;

  for (const line of lines) {
    if (y + lineHeight > pageHeight - marginY) {
      doc.addPage();
      y = marginY;
    }
    doc.text(line, marginX, y);
    y += lineHeight;
  }

  const safe = String(title || 'resume')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  doc.save(`${safe || 'resume'}.pdf`);
}

