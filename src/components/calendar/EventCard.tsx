import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { parseYmdToLocalDate, formatTimeToCustom } from '@/lib/date';

interface EventCardProps {
  event: CalendarEvent;
  category?: Category;
  onClick?: () => void;
  compact?: boolean;
}

export function EventCard({ event, category, onClick, compact = false }: EventCardProps) {
  const isDayToday = isToday(parseYmdToLocalDate(event.date));

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-4 sm:p-5 rounded-3xl transition-all duration-500",
          "hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.98]",
          "border border-border/20 bg-background/40 hover:bg-background/80 group",
          isDayToday && "pulse-today ring-2 ring-primary/20 bg-primary/[0.02]"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center min-w-[54px] h-[54px] rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-sm border border-border/10">
            <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">
              {format(parseYmdToLocalDate(event.date), "MMM", { locale: ptBR })}
            </span>
            <span className="text-xl font-black leading-none tracking-tighter">
              {format(parseYmdToLocalDate(event.date), "d")}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              {event.title}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/80">
              {!event.allDay && event.startTime && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md flex items-center gap-1 leading-none">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTimeToCustom(event.startTime)}
                </span>
              )}
              {event.macroName && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {event.macroName}
                </span>
              )}
            </div>
          </div>

          <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-6 sm:p-8 rounded-[2.5rem] transition-all duration-500",
        "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 active:scale-[0.99]",
        "border border-border/20 bg-background/50 backdrop-blur-sm group overflow-hidden relative",
        isDayToday && "pulse-today ring-4 ring-primary/10"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 relative z-10">
        <div
          className="w-1.5 h-full min-h-[80px] rounded-full flex-shrink-0 transition-all duration-700 group-hover:h-full group-hover:shadow-[0_0_20px_white]"
          style={category ? { backgroundColor: `hsl(${category.color})` } : {}}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {category && (
              <span
                className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm"
                style={{
                  backgroundColor: `hsl(${category.color} / 0.1)`,
                  color: `hsl(${category.color})`,
                  border: `1px solid hsl(${category.color} / 0.2)`
                }}
              >
                {category.name}
              </span>
            )}
            {isDayToday && (
              <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
                Hoje
              </span>
            )}
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-500 tracking-tight leading-tight">
            {event.title}
          </h4>
          
          {event.description && (
            <p className="text-sm font-medium text-muted-foreground/80 line-clamp-2 mb-6 max-w-2xl leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-[12px] font-bold text-muted-foreground transition-colors group-hover:text-muted-foreground/90">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-2xl group-hover:bg-primary/5 transition-all duration-500">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>
                {format(parseYmdToLocalDate(event.date), "d 'de' MMMM", { locale: ptBR })}
                {event.endDate && ` — ${format(parseYmdToLocalDate(event.endDate), "d 'de' MMMM", { locale: ptBR })}`}
              </span>
            </div>

            {!event.allDay && event.startTime && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-2xl group-hover:bg-primary/5 transition-all duration-500">
                <Clock className="w-4 h-4 text-primary" />
                <span>{formatTimeToCustom(event.startTime)}{event.endTime && ` às ${formatTimeToCustom(event.endTime)}`}</span>
              </div>
            )}

            {(event.macroName || event.microName) && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-2xl group-hover:bg-primary/5 transition-all duration-500">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{[event.macroName, event.microName].filter(Boolean).join(' · ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 -u-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-all group-hover:scale-150 group-hover:bg-primary/10 duration-700" />
    </button>
  );
}
