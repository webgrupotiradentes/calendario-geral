import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { parseYmdToLocalDate } from '@/lib/date';

interface EventCardProps {
  event: CalendarEvent;
  category?: Category;
  onClick?: () => void;
  compact?: boolean;
}

export function EventCard({ event, category, onClick, compact = false }: EventCardProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-3 rounded-xl transition-all duration-200",
          "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 active:scale-[0.99]",
          "border border-border/30 bg-card group"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-8 rounded-full flex-shrink-0 transition-all duration-200 group-hover:h-9"
            style={category ? { backgroundColor: `hsl(${category.color})` } : {}}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
              {event.title}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {format(parseYmdToLocalDate(event.date), "d 'de' MMM", { locale: ptBR })}
              {event.macroName && (
                <span className="text-muted-foreground/60"> · {event.macroName}</span>
              )}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl transition-all duration-200",
        "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 active:scale-[0.99]",
        "border border-border/30 bg-card group"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-1 h-full min-h-[50px] rounded-full flex-shrink-0 transition-all duration-200"
          style={category ? { backgroundColor: `hsl(${category.color})` } : {}}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {category && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `hsl(${category.color} / 0.12)`,
                  color: `hsl(${category.color})`,
                }}
              >
                {category.name}
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
            {event.title}
          </h4>
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5">{event.description}</p>
          )}

          <div className="flex flex-wrap gap-2.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>
                {format(parseYmdToLocalDate(event.date), "d 'de' MMMM", { locale: ptBR })}
                {event.endDate && ` — ${format(parseYmdToLocalDate(event.endDate), "d 'de' MMMM", { locale: ptBR })}`}
              </span>
            </div>
            {(event.macroName || event.microName) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{[event.macroName, event.microName].filter(Boolean).join(' · ')}</span>
              </div>
            )}
            {!event.allDay && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Horário específico</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
