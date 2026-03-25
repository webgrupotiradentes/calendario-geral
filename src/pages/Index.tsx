import { useState, useCallback } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, addYears, subYears } from 'date-fns';
import { X, ChevronDown, Filter, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventList } from '@/components/calendar/EventList';
import { EventDetailModal } from '@/components/calendar/EventDetailModal';
import { SearchBar } from '@/components/calendar/SearchBar';
import { ViewSelector, CalendarViewType } from '@/components/calendar/ViewSelector';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { YearView } from '@/components/calendar/YearView';
import { PdfCalendarGenerator } from '@/components/calendar/PdfCalendarGenerator';
import { SEO } from '@/components/layout/SEO';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCategories } from '@/hooks/useCategories';
import { useMacros } from '@/hooks/useMacros';
import { useMicros } from '@/hooks/useMicros';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const { events, filterEvents, isLoading: eventsLoading } = useCalendarEvents();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { macros, isLoading: macrosLoading } = useMacros();
  const { micros, isLoading: microsLoading } = useMicros();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeMacros, setActiveMacros] = useState<string[]>([]);
  const [activeMicro, setActiveMicro] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewType>('month');

  const isLoading = eventsLoading || categoriesLoading || macrosLoading || microsLoading;

  // Filter micros based on selected macros (if any)
  const availableMicros = activeMacros.length > 0
    ? micros.filter(m => activeMacros.includes(m.macroId))
    : micros;

  const handlePrevious = useCallback(() => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'month': return subMonths(prev, 1);
        case 'week': return subWeeks(prev, 1);
        case 'day': return subDays(prev, 1);
        case 'year': return subYears(prev, 1);
      }
    });
  }, [currentView]);

  const handleNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'month': return addMonths(prev, 1);
        case 'week': return addWeeks(prev, 1);
        case 'day': return addDays(prev, 1);
        case 'year': return addYears(prev, 1);
      }
    });
  }, [currentView]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setActiveCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const handleToggleMacro = useCallback((macroId: string) => {
    setActiveMacros(prev =>
      prev.includes(macroId) ? prev.filter(m => m !== macroId) : [...prev, macroId]
    );
    // Clear active micro when toggling macros to avoid invalid micro selections
    setActiveMicro(undefined);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  }, []);

  const clearAllFilters = () => {
    setActiveCategories([]);
    setActiveMacros([]);
    setActiveMicro(undefined);
    setSearchQuery('');
  };

  const handleClearCalendar = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setCurrentView('month');
    clearAllFilters();
  }, []);

  const hasActiveFilters = activeCategories.length > 0 || activeMacros.length > 0 || activeMicro || searchQuery;

  const filteredEvents = filterEvents(activeCategories, searchQuery, activeMacros, activeMicro);
  const selectedCategory = selectedEvent ? categories.find(c => c.id === selectedEvent.categoryId) : undefined;

  if (isLoading && events.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-[6px] border-primary/20 border-t-primary rounded-3xl animate-spin mb-6" />
          <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground/60 animate-pulse">Sincronizando</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary selection:text-primary-foreground">
      <SEO
        title="Calendário Acadêmico"
        description="Confira todas as datas importantes do calendário acadêmico da Universidade Tiradentes (UNIT, FITS, UNIT PE). Acompanhe provas, feriados e eventos acadêmicos."
        keywords="UNIT, FITS, UNIT PE, calendário acadêmico, calendário unit, datas provas, feriados unit"
        schemaMarkup={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "Universidade Tiradentes",
              "url": "https://www.unit.br",
              "logo": "https://www.unit.br/hubfs/Unit%20Universidade%20Tiradentes%20June2017/images/unit-logo.png"
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Calendário Geral",
                "item": "https://www.unit.br/calendario"
              }]
            }
          ]
        }}
      />
      <Header />

      <main className="mx-auto px-4 sm:px-10 lg:px-16 py-8 relative w-full max-w-[1700px]">
        {/* ── Editorial Header ────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16 animate-reveal">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 leading-none">
              UNIT | Centro | FITS | TIC
            </p>
            <h1 className="text-3xl xs:text-5xl md:text-6xl 2xl:text-7xl font-black tracking-tighter leading-[0.9] text-foreground mb-6">
              Calendário
              <span className="gradient-text"> Geral </span>
            </h1>
            <p className="text-xl font-medium text-muted-foreground/80 leading-relaxed max-w-2xl">
              Acompanhe todas as datas importantes do ano letivo
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="p-1 px-4 glass rounded-full flex items-center gap-3 shadow-xl shadow-primary/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap hidden xs:inline">PDF:</span>
              <PdfCalendarGenerator events={events} categories={categories} />
            </div>
            <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {/* ── Filtering Sidebar/Bar ────────────────────────────────── */}
        <div className="mb-10 animate-reveal" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-wrap items-center gap-3 p-2 bg-muted/40 backdrop-blur-lg rounded-[1.5rem] sm:rounded-[2.5rem] border border-border/20 shadow-sm w-full">

            {/* Search with custom wrapper */}
            <div className="relative group w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" />
              <SearchBar value={searchQuery} onChange={setSearchQuery} className="pl-12 w-full h-11 sm:h-12 bg-background/50 border-none rounded-xl sm:rounded-2xl" />
            </div>

            <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />

            {/* Categories */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center h-12 gap-3 px-6 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300',
                    activeCategories.length > 0
                      ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20'
                      : 'bg-background/50 text-muted-foreground border-border/40 hover:bg-background'
                  )}
                >
                  <Filter className="w-4 h-4" />
                  Categorias
                  {activeCategories.length > 0 && (
                    <span className="ml-1 bg-white/20 rounded-lg px-2 py-1 leading-none">
                      {activeCategories.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 glass-card p-2 mt-2">
                <div className="px-2 py-2 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Filtrar por Categoria</p>
                </div>
                {categories.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat.id}
                    checked={activeCategories.includes(cat.id)}
                    onCheckedChange={() => handleToggleCategory(cat.id)}
                    className="gap-3 rounded-lg py-3 focus:bg-primary focus:text-primary-foreground"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `hsl(${cat.color})`, boxShadow: `0 0 10px hsl(${cat.color}/0.3)` }}
                    />
                    <span className="font-bold">{cat.name}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* IES Selectors */}
            <div className="flex bg-background/40 p-1 rounded-2xl border border-border/30 gap-1 overflow-x-auto hide-scrollbar max-w-full">
              {macros.map(mac => {
                const isActive = activeMacros.includes(mac.id);
                return (
                  <button
                    key={mac.id}
                    onClick={() => handleToggleMacro(mac.id)}
                    className={cn(
                      'relative h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.05]'
                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-background/80'
                    )}
                  >
                    {mac.name}
                  </button>
                );
              })}
            </div>

            {/* Locations dropdown */}
            {micros.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center h-12 gap-3 px-6 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300',
                      activeMicro
                        ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20'
                        : 'bg-background/50 text-muted-foreground border-border/40 hover:bg-background'
                    )}
                  >
                    Local
                    {activeMicro && (
                      <span className="ml-1 text-[10px] bg-white/20 rounded-lg px-2 py-1 leading-none max-w-[100px] truncate">
                        {micros.find(m => m.id === activeMicro)?.name}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 glass-card p-2 mt-2">
                  <div className="px-2 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Selecionar Unidade/Local</p>
                  </div>
                  {activeMicro && (
                    <>
                      <DropdownMenuItem onClick={() => setActiveMicro(undefined)} className="rounded-lg text-destructive font-bold text-xs">
                        Limpar seleção
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="opacity-40" />
                    </>
                  )}
                  {availableMicros.map(micro => (
                    <DropdownMenuCheckboxItem
                      key={micro.id}
                      checked={activeMicro === micro.id}
                      onCheckedChange={() => setActiveMicro(activeMicro === micro.id ? undefined : micro.id)}
                      className="rounded-lg py-3 focus:bg-primary focus:text-primary-foreground"
                    >
                      <span className="font-bold">{micro.name}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all duration-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Calendar Section ────────────────────────────────────── */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-4 sm:gap-8 items-end">
          <div className="2xl:col-span-3 flex flex-col">
            <div className="flex-shrink-0">
              <CalendarHeader
                currentDate={currentDate}
                onPreviousMonth={handlePrevious}
                onNextMonth={handleNext}
                onToday={handleToday}
                onClear={handleClearCalendar}
                viewType={currentView}
              />
            </div>

            <div className="relative group flex-1">
              {/* Decorators */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700" />

              <div className="relative z-10 h-full">
                {currentView === 'month' && (
                  <CalendarGrid
                    currentDate={currentDate}
                    events={filteredEvents}
                    categories={categories}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onEventClick={setSelectedEvent}
                    activeCategories={activeCategories}
                  />
                )}

                {currentView === 'week' && (
                  <WeekView
                    currentDate={currentDate}
                    events={filteredEvents}
                    categories={categories}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    activeCategories={activeCategories}
                    onEventClick={setSelectedEvent}
                  />
                )}

                {currentView === 'day' && (
                  <DayView
                    currentDate={currentDate}
                    events={filteredEvents}
                    categories={categories}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    activeCategories={activeCategories}
                    onEventClick={setSelectedEvent}
                  />
                )}

                {currentView === 'year' && (
                  <YearView
                    currentDate={currentDate}
                    events={filteredEvents}
                    onDateClick={(date) => {
                      handleSelectDate(date);
                      setCurrentView('day');
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar Event List ────────────────────────────────── */}
          <div className="2xl:col-span-1">
            <EventList
              events={filteredEvents}
              categories={categories}
              selectedDate={selectedDate}
              activeCategories={activeCategories}
              onEventClick={setSelectedEvent}
              className="2xl:sticky 2xl:top-28 h-auto 2xl:h-[calc(100vh-140px)] min-h-[500px] 2xl:min-h-[600px] max-h-[800px]"
            />
          </div>
        </div>
      </main>

      <EventDetailModal
        event={selectedEvent}
        category={selectedCategory}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

    </div>
  );
};

export default Index;
