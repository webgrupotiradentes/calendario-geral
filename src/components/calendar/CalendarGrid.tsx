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
    <div className="rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl animate-reveal">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted/20 border-b border-border/40">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-[10px] font-black py-4 uppercase tracking-[0.2em]",
              i === 0 ? "text-destructive/50" : "text-muted-foreground/50"
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
                "relative min-h-[70px] xs:min-h-[90px] md:min-h-[110px] 2xl:min-h-[130px] p-1.5 sm:p-2 border-b border-r border-border/10 transition-all duration-300 text-left group cursor-pointer",
                "hover:bg-primary/[0.04]",
                !isCurrentMonth && "opacity-20 translate-y-[-1px]",
                isSelected && "bg-primary/[0.08] shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 xs:w-8 xs:h-8 rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-black transition-all duration-500",
                    "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-lg",
                    isDayToday && "bg-primary text-primary-foreground font-black shadow-xl shadow-primary/30 ring-4 ring-primary/10",
                    isSelected && !isDayToday && "bg-foreground text-background font-black scale-105 shadow-lg",
                    !isDayToday && !isSelected && isSunday && "text-destructive/60",
                    !isDayToday && !isSelected && !isSunday && "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {format(day, 'd')}
                </span>
                
                {dayEvents.length > 0 && (
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event, i) => {
                      const category = getCategoryById(event.categoryId);
                      return (
                        <div 
                          key={event.id}
                          className="w-2.5 h-2.5 rounded-full ring-2 ring-background transition-all duration-300 group-hover:scale-125"
                          style={{ 
                            backgroundColor: category ? `hsl(${category.color})` : 'hsl(var(--muted))',
                            zIndex: 3 - i
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Event names (for desktop) */}
              <div className="hidden sm:block space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const category = getCategoryById(event.categoryId);
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="w-full text-[9px] leading-tight font-bold px-2 py-1.5 rounded-xl truncate text-left transition-all duration-300 border border-transparent hover:border-border/40 hover:glass-card active:scale-95 group/event"
                      style={{
                        backgroundColor: category ? `hsl(${category.color} / 0.1)` : 'hsl(var(--muted))',
                        color: category ? `hsl(${category.color})` : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-1 h-1 rounded-full flex-shrink-0 animate-pulse" 
                          style={{ backgroundColor: category ? `hsl(${category.color})` : 'currentColor' }} 
                        />
                        {event.title}
                      </div>
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/60 pl-1 mt-1 transition-all group-hover:text-primary">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
