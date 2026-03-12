import { useMemo } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: Category[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  activeCategories: string[];
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarGrid({
  currentDate, events, categories, selectedDate, onSelectDate, onEventClick, activeCategories,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR });
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const getEventsForDay = (day: Date) => {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, '0');
    const d = String(day.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    return events.filter(event => {
      const isInRange = dateStr >= event.date && dateStr <= (event.endDate || event.date);
      const matchesCat = activeCategories.length === 0 || activeCategories.includes(event.categoryId);
      return isInRange && matchesCat;
    });
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-[var(--shadow-card)] animate-fade-in">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/30">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-[11px] font-bold py-3 uppercase tracking-widest",
              i === 0 ? "text-destructive/60" : "text-muted-foreground/70"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          const isSunday = day.getDay() === 0;

          return (
            <div
              key={index}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 border-b border-r border-border/20 transition-all duration-200 text-left group cursor-pointer",
                "hover:bg-primary/[0.03]",
                !isCurrentMonth && "opacity-25",
                isSelected && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20",
              )}
              style={{
                animationDelay: `${(index % 7) * 20}ms`,
              }}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-all duration-200",
                  "group-hover:scale-110",
                  isDayToday && "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25",
                  isSelected && !isDayToday && "bg-secondary text-secondary-foreground font-semibold",
                  !isDayToday && !isSelected && isSunday && "text-destructive/70",
                  !isDayToday && !isSelected && !isSunday && "text-foreground"
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Event indicators */}
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const category = getCategoryById(event.categoryId);
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="w-full text-[10px] leading-tight font-semibold px-1.5 py-[3px] rounded-md truncate text-left transition-all duration-150 hover:brightness-90 active:scale-95 hover:shadow-sm"
                      style={{
                        backgroundColor: category ? `hsl(${category.color} / 0.12)` : 'hsl(var(--muted))',
                        color: category ? `hsl(${category.color})` : 'hsl(var(--muted-foreground))',
                        borderLeft: category ? `2px solid hsl(${category.color} / 0.5)` : 'none',
                      }}
                    >
                      {event.title}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-primary/60 font-bold px-1.5 block">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
