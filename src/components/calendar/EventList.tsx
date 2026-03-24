import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, Category } from '@/types/calendar';
import { EventCard } from './EventCard';
import { CalendarX, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EventListProps {
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  activeCategories: string[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function EventList({ events, categories, selectedDate, activeCategories, onEventClick, className }: EventListProps) {
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
    <div className={cn(
      "rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-md p-6 sm:p-8 shadow-xl animate-reveal flex flex-col",
      className
    )} style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-4 mb-6 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-black tracking-tight text-foreground leading-none mb-1">
            {selectedDate
              ? `${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`
              : 'Próximas Datas'
            }
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {selectedDate ? 'Eventos selecionados' : 'Destaques'}
          </p>
        </div>
        <span className="ml-auto text-[11px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full ring-1 ring-primary/20">
          {sortedEvents.length}
        </span>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40 flex-1">
          <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-4 transition-all hover:scale-110">
            <CalendarX className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-bold text-muted-foreground mb-1">Vazio por aqui</h4>
          <p className="text-sm font-medium text-muted-foreground/60 max-w-[240px]">
            {selectedDate ? 'Não encontramos eventos para esta data' : 'Sua agenda está livre por enquanto'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 hide-scrollbar flex-1">
          {sortedEvents.map((event, i) => (
            <div
              key={event.id}
              className="animate-reveal"
              style={{ animationDelay: `${300 + (i * 100)}ms` }}
            >
              <EventCard
                event={event}
                category={getCategoryById(event.categoryId)}
                onClick={() => onEventClick?.(event)}
                compact
              />
            </div>
          ))}

          <div className="pt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
              Fim dos resultados recentes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
