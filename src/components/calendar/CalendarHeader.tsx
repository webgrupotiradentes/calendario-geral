import { ChevronLeft, ChevronRight, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarViewType } from './ViewSelector';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onClear: () => void;
  viewType?: CalendarViewType;
}

export function CalendarHeader({
  currentDate, onPreviousMonth, onNextMonth, onToday, onClear, viewType = 'month',
}: CalendarHeaderProps) {
  const getHeaderText = () => {
    switch (viewType) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
      case 'week': {
        const ws = startOfWeek(currentDate, { locale: ptBR });
        const we = endOfWeek(currentDate, { locale: ptBR });
        return `${format(ws, 'd MMM', { locale: ptBR })} – ${format(we, 'd MMM yyyy', { locale: ptBR })}`;
      }
      case 'day':
        return format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR });
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 mb-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group transition-all duration-300 hover:scale-110">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">
            Visão {viewType === 'month' ? 'Mensal' : viewType === 'week' ? 'Semanal' : viewType === 'day' ? 'Diária' : 'Anual'}
          </p>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight capitalize text-foreground animate-reveal">
          {getHeaderText()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center p-1.5 bg-muted/40 backdrop-blur-sm rounded-full border border-border/40 transition-all duration-300 hover:shadow-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="h-9 w-9 rounded-full hover:bg-background transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-9 px-4 text-xs font-black uppercase tracking-widest rounded-full hover:bg-background transition-all duration-200 mx-1"
          >
            Hoje
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-9 w-9 rounded-full hover:bg-background transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onClear}
          title="Resetar Calendário"
          className="h-12 w-12 rounded-2xl border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-300"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
