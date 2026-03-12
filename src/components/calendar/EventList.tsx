import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, Category } from '@/types/calendar';
import { EventCard } from './EventCard';
import { CalendarX, Sparkles } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  activeCategories: string[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function EventList({ events, categories, selectedDate, activeCategories, onEventClick }: EventListProps) {
  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const formatDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredEvents = events.filter(event => {
    const matchesCat = activeCategories.length === 0 || activeCategories.includes(event.categoryId);
    
    if (selectedDate) {
      const sel = formatDateString(selectedDate);
      return matchesCat && sel >= event.date && sel <= (event.endDate || event.date);
    }
    
    // When showing "Próximos Eventos", only show from today onwards
    const today = formatDateString(new Date());
    const isUpcoming = (event.endDate || event.date) >= today;
    
    return matchesCat && isUpcoming;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-[var(--shadow-card)] animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-primary/60" />
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {selectedDate 
            ? `Eventos — ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`
            : 'Próximos Eventos'
          }
        </h3>
        <span className="ml-auto text-[10px] font-bold text-muted-foreground/50 bg-muted/60 px-2 py-0.5 rounded-full">
          {sortedEvents.length}
        </span>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <CalendarX className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground/60">
            {selectedDate ? 'Nenhum evento nesta data' : 'Nenhum evento encontrado'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {sortedEvents.map((event, i) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <EventCard
                event={event}
                category={getCategoryById(event.categoryId)}
                onClick={() => onEventClick?.(event)}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
