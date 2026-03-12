import { CalendarDays, CalendarRange, Calendar, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarViewType = 'month' | 'week' | 'day' | 'year';

interface ViewSelectorProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const views: { type: CalendarViewType; label: string; icon: React.ReactNode }[] = [
  { type: 'month', label: 'Mês', icon: <Calendar className="w-3.5 h-3.5" /> },
  { type: 'week', label: 'Semana', icon: <CalendarRange className="w-3.5 h-3.5" /> },
  { type: 'day', label: 'Dia', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { type: 'year', label: 'Ano', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
];

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-border/40 bg-muted/40 p-0.5 gap-0.5">
      {views.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onViewChange(type)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
            currentView === type
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
