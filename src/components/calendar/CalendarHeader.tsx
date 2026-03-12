import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight capitalize text-foreground">
          {getHeaderText()}
        </h2>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-7 text-xs font-semibold rounded-full px-3 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-xs font-medium rounded-full px-2.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-0.5 bg-muted/50 rounded-full p-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          className="h-8 w-8 rounded-full hover:bg-background transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-8 w-8 rounded-full hover:bg-background transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
