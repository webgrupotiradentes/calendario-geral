import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface PdfCalendarGeneratorProps {
  events: CalendarEvent[];
  categories: Category[];
}

function hslToRgb(hslStr: string): [number, number, number] {
  const parts = hslStr.trim().split(/[\s,/]+/).map(Number);
  const h = (parts[0] || 0) / 360;
  const s = (parts[1] || 0) / 100;
  const l = (parts[2] || 0) / 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

const MONTH_NAMES_PT = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];
const MONTH_NAMES_CAP = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DAY_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Dark navy blue - matches reference image
const NAVY: [number, number, number] = [13, 38, 73];

export function PdfCalendarGenerator({ events, categories }: PdfCalendarGeneratorProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentYear = new Date().getFullYear();

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const generatePdf = async () => {
    if (events.length === 0) {
      toast.error('Não há eventos para gerar o PDF.');
      return;
    }

    setIsGenerating(true);
    toast.loading('Gerando PDF...', { id: 'pdf-toast' });

    try {
      const { jsPDF } = await import('jspdf');

      // A3 portrait: 297 × 420 mm
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a3' });
      const pageW = 297;
      const pageH = 420;
      const margin = 10;

      // Filter events
      let filteredEvents = events;
      if (selectedCategoryIds.length > 0) {
        filteredEvents = filteredEvents.filter(e => selectedCategoryIds.includes(e.categoryId));
      }

      const activeCategories = selectedCategoryIds.length > 0
        ? categories.filter(c => selectedCategoryIds.includes(c.id))
        : categories.filter(c => filteredEvents.some(e => e.categoryId === c.id));

      // ─── White background ───
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, 'F');
      // ─── Header ───
      const titleH = 25;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...NAVY);
      
      let title = `CALENDÁRIO ${currentYear}`;
      if (selectedCategoryIds.length === 1) {
        const cat = categories.find(c => c.id === selectedCategoryIds[0]);
        if (cat) title = `CALENDÁRIO ${cat.name.toUpperCase()} ${currentYear}`;
      } else if (selectedCategoryIds.length > 1) {
        title = `CALENDÁRIO ${currentYear} — CATEGORIAS SELECIONADAS`;
      }
      
      doc.text(title, margin, 18);

      // ─── Calendar grid: 4 cols × 3 rows ───
      const cols = 4;
      const rows = 3;
      const gapX = 4.5;
      const gapY = 4.5;
      const calTop = titleH;

      const panelH = pageH * 0.38; // Slightly smaller panel
      const calAreaH = pageH - calTop - panelH - 10;
      const cellW = (pageW - margin * 2 - gapX * (cols - 1)) / cols;
      const cellH = (calAreaH - gapY * (rows - 1)) / rows;

      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const col = monthIdx % cols;
        const row = Math.floor(monthIdx / cols);
        const x = margin + col * (cellW + gapX);
        const y = calTop + row * (cellH + gapY);

        // Month container
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230, 235, 245);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, cellW, cellH, 1.5, 1.5, 'FD');

        // Month Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...NAVY);
        doc.text(MONTH_NAMES_PT[monthIdx], x + 5, y + 8);

        // Day Headers
        const dayW = (cellW - 6) / 7;
        const dayHeaderY = y + 14;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(140, 150, 170);
        for (let d = 0; d < 7; d++) {
          doc.text(DAY_HEADERS[d], x + 3 + d * dayW + dayW / 2, dayHeaderY, { align: 'center' });
        }

        // Days
          const firstDay = new Date(currentYear, monthIdx, 1);
        const startDow = firstDay.getDay();
        const daysInMonth = new Date(currentYear, monthIdx + 1, 0).getDate();
        const dayCellH = (cellH - 20) / 6;
        const dayCellY = dayHeaderY + 5;

        for (let day = 1; day <= daysInMonth; day++) {
          const dow = (startDow + day - 1) % 7;
          const week = Math.floor((startDow + day - 1) / 7);
          const dx = x + 3 + dow * dayW;
          const dy = dayCellY + week * dayCellH;
          
          // Much smaller and softer badge
          const sz = Math.min(dayW, dayCellH) * 0.72;

          const dateStr = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvts = filteredEvents.filter(e => dateStr >= e.date && dateStr <= (e.endDate || e.date));

          if (dayEvts.length > 0) {
            const cat = categories.find(c => c.id === dayEvts[0].categoryId);
            if (cat) {
              const [r, g, b] = hslToRgb(cat.color);
              doc.setFillColor(r, g, b);
              // Circular/High-rounded badge for softness
              doc.roundedRect(dx + (dayW - sz) / 2, dy - sz * 0.7, sz, sz, sz/2, sz/2, 'F');
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(5);
              doc.setTextColor(255, 255, 255);
              doc.text(String(day), dx + dayW / 2, dy - sz * 0.1, { align: 'center' });
            }
          } else {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5);
            doc.setTextColor(70, 80, 100);
            doc.text(String(day), dx + dayW / 2, dy - sz * 0.1, { align: 'center' });
          }
        }
      }

      // ─── Events Panel ───
      const panelY = pageH - panelH;
      // Smooth out categories legend just above panel
      if (activeCategories.length > 0) {
        const legY = panelY - 6;
        let legX = margin + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text('LEGENDA:', legX, legY);
        legX += 16;

        activeCategories.forEach(cat => {
          const [r, g, b] = hslToRgb(cat.color);
          doc.setFillColor(r, g, b);
          doc.roundedRect(legX, legY - 3, 3, 3, 0.8, 0.8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(60, 70, 90);
          doc.text(cat.name, legX + 4.5, legY - 0.5);
          legX += doc.getTextWidth(cat.name) + 12;
        });
      }

      doc.setFillColor(...NAVY);
      doc.roundedRect(margin, panelY, pageW - margin * 2, panelH - margin, 3, 3, 'F');

      const eventsByMonth: Record<number, typeof filteredEvents> = {};
      filteredEvents.forEach(evt => {
        const m = Number(evt.date.slice(5, 7)) - 1;
        if (!eventsByMonth[m]) eventsByMonth[m] = [];
        if (!eventsByMonth[m].find(e => e.id === evt.id)) eventsByMonth[m].push(evt);
      });

      const sortedMonths = Object.keys(eventsByMonth).map(Number).sort((a, b) => a - b);

      if (sortedMonths.length > 0) {
        const half = Math.ceil(sortedMonths.length / 2);
        const leftMonths = sortedMonths.slice(0, half);
        const rightMonths = sortedMonths.slice(half);

        const colW = (pageW - margin * 2 - 15) / 2;
        const badgeSz = 7;
        const rowH = 7;

        const drawColumn = (months: number[], startX: number) => {
          let yPos = panelY + 12;
          const maxY = panelY + panelH - 15;

          months.forEach(month => {
            const monthEvts = eventsByMonth[month].sort((a, b) => a.date.localeCompare(b.date));
            if (yPos + 10 > maxY) return;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text(MONTH_NAMES_CAP[month], startX + 5, yPos);
            yPos += 8;

            monthEvts.forEach(evt => {
              if (yPos + rowH > maxY) return;
              const cat = categories.find(c => c.id === evt.categoryId);
              const dayNum = evt.date.split('-')[2];

              if (cat) {
                const [r, g, b] = hslToRgb(cat.color);
                doc.setFillColor(r, g, b);
                doc.roundedRect(startX + 5, yPos - badgeSz * 0.75, badgeSz, badgeSz, 1.2, 1.2, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(255, 255, 255);
                doc.text(dayNum, startX + 5 + badgeSz / 2, yPos - 0.5, { align: 'center' });
              }

              doc.setFont('helvetica', 'bold');
              doc.setFontSize(7.5);
              doc.setTextColor(255, 255, 255);
              const maxTitleW = colW - badgeSz - 10;
              const titleText = evt.title || 'Evento';
              const truncatedTitle = doc.getTextWidth(titleText) > maxTitleW 
                ? titleText.substring(0, Math.floor(maxTitleW / 2)) + '...'
                : titleText;
              
              doc.text(truncatedTitle, startX + badgeSz + 10, yPos - 0.5);
              
              if (evt.link) {
                doc.setDrawColor(255, 255, 255);
                doc.setLineWidth(0.1);
                const tw = doc.getTextWidth(truncatedTitle);
                doc.line(startX + badgeSz + 10, yPos + 0.5, startX + badgeSz + 10 + tw, yPos + 0.5);
              }
              
              yPos += rowH;
            });

            yPos += 5;
          });
        };

        drawColumn(leftMonths, margin + 5);
        drawColumn(rightMonths, margin + colW + 10);
      }

      // ─── Category legend (just above the panel) ───
      if (activeCategories.length > 0) {
        const legY = panelY - 4.5;
        let legX = margin;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(40, 50, 70);
        doc.text('LEGENDA:', legX, legY);
        legX += 20;

        activeCategories.forEach(cat => {
          const [r, g, b] = hslToRgb(cat.color);
          doc.setFillColor(r, g, b);
          doc.roundedRect(legX, legY - 3.5, 3.5, 3.5, 0.6, 0.6, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(40, 50, 70);
          doc.text(cat.name, legX + 5, legY);
          legX += doc.getTextWidth(cat.name) + 12;
        });
      }

      // ─── Footer inside dark panel ───
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(4.5);
      doc.setTextColor(120, 150, 190);
      doc.text('Universidade Tiradentes · Calendário Acadêmico', pageW - margin, pageH - 4, { align: 'right' });

      // ─── Save ───
      const suffix = selectedCategoryIds.length > 0
        ? `-${activeCategories.map(c => c.name.toLowerCase().replace(/\s/g, '-')).join('-')}`
        : '';
      doc.save(`calendario-${currentYear}${suffix}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: 'pdf-toast' });
      setIsOpen(false);

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erro ao gerar PDF. Verifique o console.', { id: 'pdf-toast' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gerar PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Gerar Calendário em PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Filtrar por Categoria
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
              {/* All categories option */}
              <button
                onClick={() => setSelectedCategoryIds([])}
                className={cn(
                  'flex items-center gap-2.5 w-full p-2.5 rounded-xl text-sm transition-all',
                  selectedCategoryIds.length === 0
                    ? 'bg-primary/10 border border-primary/30 text-primary font-semibold'
                    : 'bg-muted/50 hover:bg-muted text-foreground'
                )}
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0" />
                <span>Todas as categorias</span>
                {selectedCategoryIds.length === 0 && (
                  <span className="ml-auto text-[10px] font-bold text-primary">✓</span>
                )}
              </button>

              {categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2.5 w-full p-2.5 rounded-xl text-sm transition-all',
                      isSelected
                        ? 'border font-semibold bg-opacity-10'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    )}
                    style={isSelected ? {
                      backgroundColor: `hsl(${category.color} / 0.1)`,
                      borderColor: `hsl(${category.color} / 0.4)`,
                      color: `hsl(${category.color})`,
                    } : undefined}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 transition-transform"
                      style={{ backgroundColor: `hsl(${category.color})`, transform: isSelected ? 'scale(1.2)' : 'scale(1)' }}
                    />
                    <span>{category.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold" style={{ color: `hsl(${category.color})` }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/40">
            <FileDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formato A3 retrato com 12 meses e painel de eventos no estilo institucional.
            </p>
          </div>

          <Button
            onClick={generatePdf}
            disabled={isGenerating}
            className="w-full rounded-xl h-11 font-semibold"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Gerando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Baixar PDF
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
