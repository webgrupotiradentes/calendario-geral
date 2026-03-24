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
    <div className="inline-flex items-center rounded-3xl border border-border/20 bg-muted/40 backdrop-blur-md p-1 gap-1">
      {views.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onViewChange(type)}
          className={cn(
            "flex items-center gap-2 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
            currentView === type
              ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-background/80"
          )}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
