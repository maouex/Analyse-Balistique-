import jsPDF from 'jspdf';
import type { AnalysisStats, Impact, Point, CircleConfig, ImpactStyle } from '../types';
import { renderExport } from './canvas-renderer';

interface PdfExportData {
  stats: AnalysisStats;
  impacts: Impact[];
  center: Point;
  circle1: CircleConfig;
  circle2: CircleConfig;
  impactStyle: ImpactStyle;
  pixelsPerCm: number;
  munitionName?: string;
  calibre?: string;
  distance?: string;
  fusil?: string;
  choke?: string;
  date?: string;
}

const GREEN = [0, 255, 65] as const;
const DARK = [10, 14, 10] as const;
const GRAY = [120, 140, 120] as const;
const WHITE = [220, 235, 220] as const;

export function generatePdfReport(data: PdfExportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 15;
  const contentW = W - margin * 2;
  let y = margin;

  // ─── Background ───
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 297, 'F');

  // ─── Header ───
  doc.setFillColor(15, 20, 15);
  doc.rect(0, 0, 210, 32, 'F');

  // Green accent line
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, 31, W - margin, 31);

  doc.setFont('courier', 'bold');
  doc.setTextColor(...GREEN);
  doc.setFontSize(18);
  doc.text('S.A.G.', margin, y + 8);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('SYSTÈME D\'ANALYSE DE GROUPEMENT', margin, y + 13);

  doc.setFontSize(8);
  doc.setTextColor(...GREEN);
  doc.text(`RAPPORT D'ANALYSE BALISTIQUE`, W - margin, y + 8, { align: 'right' });
  doc.setTextColor(...GRAY);
  doc.text(data.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), W - margin, y + 13, { align: 'right' });

  y = 38;

  // ─── Munition Info Block ───
  doc.setFillColor(15, 22, 15);
  doc.rect(margin, y, contentW, 20, 'F');
  doc.setDrawColor(0, 255, 65, 30);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentW, 20, 'S');

  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text('INFORMATIONS MUNITION', margin + 4, y + 5);
  doc.setDrawColor(...GREEN);
  doc.line(margin + 4, y + 6.5, margin + 50, y + 6.5);

  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  const col1 = margin + 4;
  const col2 = margin + contentW / 3;
  const col3 = margin + (contentW * 2) / 3;
  const infoY = y + 12;

  drawInfoPair(doc, col1, infoY, 'Munition', data.munitionName || '—');
  drawInfoPair(doc, col2, infoY, 'Calibre', data.calibre || '—');
  drawInfoPair(doc, col3, infoY, 'Distance', data.distance ? `${data.distance}m` : '—');
  drawInfoPair(doc, col1, infoY + 5, 'Fusil', data.fusil || '—');
  drawInfoPair(doc, col2, infoY + 5, 'Choke', data.choke || '—');
  drawInfoPair(doc, col3, infoY + 5, 'Impacts', String(data.impacts.length));

  y += 25;

  // ─── Score Section ───
  const score = data.stats.score;
  const scoreColor = score >= 80 ? GREEN : score >= 60 ? [0, 200, 60] as const : score >= 40 ? [255, 170, 0] as const : [255, 68, 68] as const;

  doc.setFillColor(15, 22, 15);
  doc.rect(margin, y, contentW / 2 - 2, 30, 'F');
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW / 2 - 2, 30, 'S');

  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text('SCORE GLOBAL', margin + 4, y + 5);

  doc.setFontSize(32);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(String(Math.round(score)), margin + 4, y + 20);

  doc.setFontSize(8);
  doc.text('/100', margin + 28, y + 20);

  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text(data.stats.scoreLabel, margin + 4, y + 27);

  // ─── Dispersion Stats ───
  const statsX = margin + contentW / 2 + 2;
  const statsW = contentW / 2 - 2;
  doc.setFillColor(15, 22, 15);
  doc.rect(statsX, y, statsW, 30, 'F');
  doc.setDrawColor(0, 255, 65, 30);
  doc.setLineWidth(0.2);
  doc.rect(statsX, y, statsW, 30, 'S');

  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text('DISPERSION', statsX + 4, y + 5);

  const statsList = [
    { label: 'R90', value: `${data.stats.dispersion.r90.toFixed(1)} cm` },
    { label: 'Dist. moy.', value: `${data.stats.distances.mean.toFixed(1)} cm` },
    { label: 'Écart-type', value: `${data.stats.distances.stdDev.toFixed(1)} cm` },
    { label: 'CV', value: `${(data.stats.distances.cv * 100).toFixed(0)}%` },
  ];

  doc.setFontSize(8);
  statsList.forEach((s, i) => {
    const sY = y + 11 + i * 5;
    doc.setTextColor(...GRAY);
    doc.text(s.label, statsX + 4, sY);
    doc.setTextColor(...WHITE);
    doc.text(s.value, statsX + statsW - 4, sY, { align: 'right' });
  });

  y += 35;

  // ─── Zone Analysis ───
  doc.setFillColor(15, 22, 15);
  doc.rect(margin, y, contentW, 22, 'F');
  doc.setDrawColor(0, 255, 65, 30);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentW, 22, 'S');

  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text('RÉPARTITION PAR ZONE', margin + 4, y + 5);

  const zones = data.stats.zones;
  const zoneW = contentW / 3;
  const zoneColors = [GREEN, [255, 170, 0] as const, [255, 68, 68] as const];
  const zoneLabels = [
    `Zone 1 (${data.circle1.diameterCm}cm)`,
    `Zone 2 (${data.circle2.diameterCm}cm)`,
    'Hors zones',
  ];

  zones.forEach((z: { count: number; percentage: number }, i: number) => {
    const zx = margin + i * zoneW + 4;
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(zoneLabels[i], zx, y + 11);

    doc.setFontSize(14);
    doc.setTextColor(zoneColors[i][0], zoneColors[i][1], zoneColors[i][2]);
    doc.text(`${z.percentage.toFixed(0)}%`, zx, y + 19);

    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.text(`${z.count} imp.`, zx + 22, y + 19);
  });

  y += 27;

  // ─── Target Image ───
  const imageCanvas = renderExport({
    center: data.center,
    impacts: data.impacts,
    circle1: data.circle1,
    circle2: data.circle2,
    impactStyle: data.impactStyle,
    pixelsPerCm: data.pixelsPerCm,
    ellipse: data.stats.ellipse,
    showCircle1: true,
    showCircle2: true,
    showImpacts: true,
    showNumbers: true,
    showEllipse: true,
    circle1Color: data.circle1.color,
    circle2Color: data.circle2.color,
    impactColor: data.impactStyle.color,
    ellipseColor: data.impactStyle.ellipseColor,
  });

  const imgData = imageCanvas.toDataURL('image/png');
  const imgW = contentW;
  const aspectRatio = imageCanvas.height / imageCanvas.width;
  const imgH = Math.min(imgW * aspectRatio, 120);

  doc.setFillColor(5, 8, 5);
  doc.rect(margin, y, contentW, imgH + 4, 'F');
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, imgH + 4, 'S');

  doc.addImage(imgData, 'PNG', margin + 2, y + 2, contentW - 4, imgH);

  y += imgH + 8;

  // ─── Footer ───
  if (y < 270) {
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.3);
    doc.line(margin, 285, W - margin, 285);

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('Généré par S.A.G. — Système d\'Analyse de Groupement', margin, 290);
    doc.setTextColor(...GREEN);
    doc.text('CONFIDENTIEL', W - margin, 290, { align: 'right' });
  }

  doc.save(`rapport-balistique-${Date.now()}.pdf`);
}

function drawInfoPair(doc: jsPDF, x: number, y: number, label: string, value: string) {
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(label.toUpperCase(), x, y);
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text(value, x, y + 4);
}
