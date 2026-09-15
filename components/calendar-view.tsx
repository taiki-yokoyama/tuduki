'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EntryWithRelations } from '@/lib/types';
import {
  getCalendarDays,
  getMonthLabel,
  isToday,
  WEEKDAYS_JA,
  formatDate,
} from '@/lib/date-utils';
import { EntryCard } from './entry-card';
import { ScrollRevealWrapper } from './scroll-reveal-wrapper';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  entries: EntryWithRelations[];
  onEditEntry: (entry: EntryWithRelations) => void;
  onDeleteEntry: (entry: EntryWithRelations) => void;
  onPersonClick: (personId: string) => void;
}

export function CalendarView({ entries, onEditEntry, onDeleteEntry, onPersonClick }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, EntryWithRelations[]>();
    for (const entry of entries) {
      if (!map.has(entry.entry_date)) map.set(entry.entry_date, []);
      map.get(entry.entry_date)!.push(entry);
    }
    return map;
  }, [entries]);

  const monthEntries = useMemo(() => {
    return entries.filter((e) => {
      const d = new Date(e.entry_date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [entries, year, month]);

  const selectedEntries = selectedDate
    ? entriesByDate.get(selectedDate) ?? []
    : monthEntries;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(null);
  };

  return (
    <ScrollRevealWrapper>
      <div className="space-y-6">
        {/* Calendar */}
        <div className="border border-gray-200 rounded-md p-4 sm:p-5 reveal">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink">
              {getMonthLabel(year, month)}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToday}
                className="px-2.5 py-1 text-xs text-ink-muted hover:text-ink hover:bg-gray-100 rounded-sm transition-colors font-medium"
              >
                今日
              </button>
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {WEEKDAYS_JA.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  'text-center text-xs py-2 font-medium',
                  idx === 0 ? 'text-ink-faint' : idx === 6 ? 'text-ink-faint' : 'text-ink-muted'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-sm overflow-hidden">
            {calendarDays.map((day, idx) => {
              const dayEntries = entriesByDate.get(day.date) ?? [];
              const hasEntries = dayEntries.length > 0;
              const isSelected = selectedDate === day.date;
              const todayFlag = isToday(day.date);

              return (
                <button
                  key={idx}
                  onClick={() => hasEntries ? setSelectedDate(isSelected ? null : day.date) : null}
                  disabled={!hasEntries}
                  className={cn(
                    'relative aspect-square flex flex-col items-center justify-center bg-white text-sm transition-colors',
                    !day.isCurrentMonth && 'bg-gray-50 text-ink-faint',
                    hasEntries && day.isCurrentMonth && 'hover:bg-gray-50 cursor-pointer',
                    !hasEntries && '!cursor-default',
                    isSelected && 'bg-yellow font-bold',
                    todayFlag && !isSelected && 'bg-gray-100',
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    isSelected ? 'text-ink font-bold' : hasEntries ? 'text-ink font-medium' : 'text-ink-faint',
                    todayFlag && !isSelected && 'font-bold',
                  )}>
                    {day.day}
                  </span>

                  {/* Entry dots */}
                  {hasEntries && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEntries.length <= 3 ? (
                        dayEntries.map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-1 h-1 rounded-full',
                              isSelected ? 'bg-ink' : 'bg-yellow'
                            )}
                          />
                        ))
                      ) : (
                        <span className="text-[9px] font-bold text-ink-muted">
                          {dayEntries.length}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Today indicator */}
                  {todayFlag && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-ink" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date / month entries */}
        <div className="reveal">
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-base font-bold text-ink">
              {selectedDate
                ? formatDate(selectedDate)
                : `${getMonthLabel(year, month)}の記録`}
            </h3>
            <span className="text-xs text-ink-faint">{selectedEntries.length}件</span>
          </div>

          {selectedEntries.length === 0 ? (
            <p className="text-sm text-ink-muted py-8 text-center border border-gray-200 rounded-md bg-gray-50">
              {selectedDate ? 'この日の日記はありません' : 'この月の日記はありません'}
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                  onPersonClick={onPersonClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollRevealWrapper>
  );
}
