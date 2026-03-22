import { jsPDF } from 'jspdf';

const LINK_COLOR = [0, 102, 204];
const LINE_HEIGHT = 13;
const BULLET_INDENT = 14;
const PAGE_MARGIN = 48;

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

/** Split "a **bold** word" into [{ bold, text }] preserving spaces. */
function parseBoldSegments(str) {
  const s = String(str || '');
  const segments = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      segments.push({ bold: false, text: s.slice(last, m.index) });
    }
    segments.push({ bold: true, text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    segments.push({ bold: false, text: s.slice(last) });
  }
  if (segments.length === 0) {
    return [{ bold: false, text: s }];
  }
  return segments;
}

/** Break segments into word tokens with bold flag. */
function segmentsToWords(segments) {
  const words = [];
  for (const seg of segments) {
    const parts = String(seg.text).split(/(\s+)/);
    for (const p of parts) {
      if (p) words.push({ bold: seg.bold, text: p });
    }
  }
  return words;
}

/**
 * Draw a paragraph starting at (x, y) with optional first-line indent; returns next y.
 */
function drawWrappedRichText(doc, words, x, y, maxWidth, firstLineExtraIndent = 0) {
  if (!words.length) return y;

  let line = [];
  let lineWidth = 0;
  const lines = [];
  const indent = firstLineExtraIndent;

  function flushLine() {
    if (line.length) {
      lines.push(line);
      line = [];
      lineWidth = 0;
    }
  }

  for (const w of words) {
    doc.setFont('times', w.bold ? 'bold' : 'normal');
    const tw = doc.getTextWidth(w.text);
    const isFirstLine = lines.length === 0 && line.length === 0;
    const lineMax = maxWidth - (isFirstLine ? indent : 0);
    const testWidth = lineWidth + tw;
    if (testWidth > lineMax && line.length) {
      flushLine();
      doc.setFont('times', w.bold ? 'bold' : 'normal');
      const tw2 = doc.getTextWidth(w.text);
      line = [w];
      lineWidth = tw2;
    } else if (testWidth > lineMax && !line.length) {
      line.push(w);
      lineWidth = tw;
      flushLine();
    } else {
      line.push(w);
      lineWidth = testWidth;
    }
  }
  flushLine();

  for (let li = 0; li < lines.length; li++) {
    let cx = x + (li === 0 ? indent : 0);
    for (const w of lines[li]) {
      doc.setFont('times', w.bold ? 'bold' : 'normal');
      doc.text(w.text, cx, y);
      cx += doc.getTextWidth(w.text);
    }
    y += LINE_HEIGHT;
  }
  return y;
}

function drawSectionRule(doc, marginX, pageWidth, y) {
  const lineY = y + 3;
  doc.setDrawColor(40);
  doc.setLineWidth(0.4);
  doc.line(marginX, lineY, pageWidth - marginX, lineY);
  return lineY + 10;
}

function ensureSpace(doc, y, needed, pageHeight) {
  if (y + needed <= pageHeight - PAGE_MARGIN) return y;
  doc.addPage();
  return PAGE_MARGIN;
}

function hasStructuredContent(structured) {
  if (!structured || typeof structured !== 'object') return false;
  const h = structured.header || {};
  if (String(h.fullName || '').trim()) return true;
  if (Array.isArray(structured.education) && structured.education.length) return true;
  if (Array.isArray(structured.skills) && structured.skills.length) return true;
  if (Array.isArray(structured.experience) && structured.experience.length) return true;
  if (Array.isArray(structured.projects) && structured.projects.length) return true;
  return false;
}

function drawHeader(doc, header, pageWidth, marginX, marginY) {
  let y = marginY;
  const name = String(header.fullName || '').trim().toUpperCase();
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(name || 'YOUR NAME', pageWidth / 2, y, { align: 'center' });
  y += 22;

  doc.setFontSize(10.5);
  doc.setFont('times', 'normal');
  const phone = String(header.phone || '').trim();
  const location = String(header.location || '').trim();
  const contactBits = [phone, location].filter(Boolean);
  if (contactBits.length) {
    doc.text(contactBits.join(' · '), pageWidth / 2, y, { align: 'center' });
    y += LINE_HEIGHT;
  }

  const links = [];
  const email = String(header.email || '').trim();
  if (email) links.push({ label: 'Email', display: email });
  const li = String(header.linkedin || '').trim();
  if (li) links.push({ label: 'LinkedIn', display: li.replace(/^https?:\/\//i, '') });
  const gh = String(header.github || '').trim();
  if (gh) links.push({ label: 'GitHub', display: gh.replace(/^https?:\/\//i, '') });

  if (links.length) {
    doc.setFontSize(10);
    const parts = [];
    let totalW = 0;
    const sep = '  ·  ';
    doc.setFont('times', 'normal');
    for (let i = 0; i < links.length; i++) {
      const piece = `${links[i].label}: ${links[i].display}`;
      parts.push(piece);
      totalW += doc.getTextWidth(piece);
      if (i < links.length - 1) totalW += doc.getTextWidth(sep);
    }
    let cx = (pageWidth - totalW) / 2;
    for (let i = 0; i < links.length; i++) {
      const { label, display } = links[i];
      doc.setTextColor(0, 0, 0);
      doc.text(`${label}: `, cx, y);
      cx += doc.getTextWidth(`${label}: `);
      doc.setTextColor(...LINK_COLOR);
      doc.text(display, cx, y);
      cx += doc.getTextWidth(display);
      doc.setTextColor(0, 0, 0);
      if (i < links.length - 1) {
        doc.text(sep, cx, y);
        cx += doc.getTextWidth(sep);
      }
    }
    y += LINE_HEIGHT + 4;
  }

  return y + 6;
}

function drawSectionTitle(doc, title, marginX, pageWidth, y) {
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(String(title).toUpperCase(), marginX, y);
  return drawSectionRule(doc, marginX, pageWidth, y);
}

function drawEducation(doc, entries, marginX, pageWidth, maxWidth, pageHeight, startY) {
  let y = startY;
  doc.setFontSize(10);
  for (const ed of entries) {
    const degree = String(ed.degree || ed.program || '').trim();
    const status = String(ed.dateOrStatus || ed.status || '').trim();
    const inst = String(ed.institution || '').trim();
    const loc = String(ed.location || '').trim();
    const line2 = [inst, loc].filter(Boolean).join(', ');

    y = ensureSpace(doc, y, 36, pageHeight);
    doc.setFont('times', 'bold');
    const left = degree;
    doc.text(left, marginX, y);
    if (status) {
      doc.setFont('times', 'normal');
      const w = doc.getTextWidth(status);
      doc.text(status, pageWidth - marginX - w, y);
    }
    y += LINE_HEIGHT;
    if (line2) {
      doc.setFont('times', 'normal');
      doc.text(line2, marginX, y);
      y += LINE_HEIGHT;
    }
    y += 4;
  }
  return y;
}

function drawSkills(doc, skills, marginX, pageWidth, maxWidth, pageHeight, startY) {
  const cols = 3;
  const gap = 10;
  const colW = (maxWidth - gap * (cols - 1)) / cols;
  let y = startY;
  const list = Array.isArray(skills) ? skills : [];

  for (let i = 0; i < list.length; i += cols) {
    const row = list.slice(i, i + cols);
    const heights = row.map((cat) => {
      const body = (Array.isArray(cat.items) ? cat.items : []).join(', ');
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      const titleH = LINE_HEIGHT;
      doc.setFont('times', 'normal');
      const wrapped = doc.splitTextToSize(body, colW);
      const bodyH = Math.max(1, wrapped.length) * (LINE_HEIGHT - 1);
      return titleH + bodyH;
    });
    const rowH = Math.max(0, ...heights) + 8;
    y = ensureSpace(doc, y, rowH, pageHeight);

    let colY = y;
    for (let c = 0; c < row.length; c++) {
      const cat = row[c];
      const x = marginX + c * (colW + gap);
      let cy = colY;
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text(String(cat.category || '').trim(), x, cy);
      cy += LINE_HEIGHT - 2;
      doc.setFont('times', 'normal');
      const wrapped = doc.splitTextToSize((Array.isArray(cat.items) ? cat.items : []).join(', '), colW);
      for (const line of wrapped) {
        doc.text(line, x, cy);
        cy += LINE_HEIGHT - 1;
      }
    }
    y = colY + rowH;
  }
  return y;
}

function drawExperience(doc, jobs, marginX, pageWidth, maxWidth, pageHeight, startY) {
  let y = startY;
  doc.setFontSize(10);
  for (const job of jobs) {
    const title = String(job.title || '').trim();
    const company = String(job.company || '').trim();
    const dateRange = String(job.dateRange || '').trim();
    const headLeft = [title, company].filter(Boolean).join(title && company ? ' — ' : '');
    y = ensureSpace(doc, y, 28, pageHeight);
    doc.setFont('times', 'bold');
    doc.text(headLeft, marginX, y);
    if (dateRange) {
      doc.setFont('times', 'normal');
      const w = doc.getTextWidth(dateRange);
      doc.text(dateRange, pageWidth - marginX - w, y);
    }
    y += LINE_HEIGHT + 2;

    const bullets = Array.isArray(job.bullets) ? job.bullets : [];
    for (const b of bullets) {
      const words = segmentsToWords(parseBoldSegments(b));
      y = ensureSpace(doc, y, LINE_HEIGHT * 2, pageHeight);
      doc.setFont('times', 'normal');
      doc.text('•', marginX, y);
      y = drawWrappedRichText(doc, words, marginX + 6, y, maxWidth - 6, BULLET_INDENT);
      y += 2;
    }
    y += 6;
  }
  return y;
}

function drawProjects(doc, projects, marginX, pageWidth, maxWidth, pageHeight, startY) {
  let y = startY;
  doc.setFontSize(10);
  for (const proj of projects) {
    const name = String(proj.name || '').trim();
    const link = proj.link && typeof proj.link === 'object' ? proj.link : {};
    const label = String(link.label || '').trim();
    const url = String(link.url || '').trim();
    y = ensureSpace(doc, y, 24, pageHeight);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(name, marginX, y);
    if (label || url) {
      const rightText = label && url ? `${label}` : label || url;
      doc.setFont('times', 'normal');
      doc.setTextColor(...LINK_COLOR);
      const w = doc.getTextWidth(rightText);
      doc.text(rightText, pageWidth - marginX - w, y);
      doc.setTextColor(0, 0, 0);
    }
    y += LINE_HEIGHT + 2;

    const bullets = Array.isArray(proj.bullets) ? proj.bullets : [];
    for (const b of bullets) {
      const words = segmentsToWords(parseBoldSegments(b));
      y = ensureSpace(doc, y, LINE_HEIGHT * 2, pageHeight);
      doc.text('•', marginX, y);
      y = drawWrappedRichText(doc, words, marginX + 6, y, maxWidth - 6, BULLET_INDENT);
      y += 2;
    }
    y += 6;
  }
  return y;
}

export function downloadStructuredResumePdf({ title = 'resume', structured }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const marginY = 48;
  const maxWidth = pageWidth - marginX * 2;

  let y = drawHeader(doc, structured.header || {}, pageWidth, marginX, marginY);

  const education = structured.education || [];
  if (education.length) {
    y = ensureSpace(doc, y, 40, pageHeight);
    y = drawSectionTitle(doc, 'Education', marginX, pageWidth, y);
    y = drawEducation(doc, education, marginX, pageWidth, maxWidth, pageHeight, y);
  }

  const skills = structured.skills || [];
  if (skills.length) {
    y = ensureSpace(doc, y, 40, pageHeight);
    y = drawSectionTitle(doc, 'Skills', marginX, pageWidth, y);
    y = drawSkills(doc, skills, marginX, pageWidth, maxWidth, pageHeight, y);
  }

  const experience = structured.experience || [];
  const projects = structured.projects || [];

  if (experience.length) {
    y = ensureSpace(doc, y, 40, pageHeight);
    y = drawSectionTitle(doc, 'Experience', marginX, pageWidth, y);
    y = drawExperience(doc, experience, marginX, pageWidth, maxWidth, pageHeight, y);
  }

  if (projects.length) {
    y = ensureSpace(doc, y, 40, pageHeight);
    y = drawSectionTitle(doc, 'Projects', marginX, pageWidth, y);
    drawProjects(doc, projects, marginX, pageWidth, maxWidth, pageHeight, y);
  }

  const safe = String(title || 'resume')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`${safe || 'resume'}.pdf`);
}

/**
 * Download resume as PDF. Prefers structured layout (classic single-column + skills grid) when provided.
 */
export function downloadResumePdf({ title = 'resume', resumeText, structured }) {
  if (hasStructuredContent(structured)) {
    downloadStructuredResumePdf({ title, structured });
    return;
  }

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
