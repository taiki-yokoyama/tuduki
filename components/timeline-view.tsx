'use client';

import { useMemo } from 'react';
import type { EntryWithRelations } from '@/lib/types';
import { groupEntriesByDate } from '@/lib/date-utils';
import { EntryCard } from './entry-card';
import { ScrollRevealWrapper } from './scroll-reveal-wrapper';
import { Plus } from 'lucide-react';

interface TimelineViewProps {
  entries: EntryWithRelations[];
  onEditEntry: (entry: EntryWithRelations) => void;
  onDeleteEntry: (entry: EntryWithRelations) => void;
  onPersonClick: (personId: string) => void;
}

export function TimelineView({ entries, onEditEntry, onDeleteEntry, onPersonClick }: TimelineViewProps) {
  const grouped = useMemo(() => groupEntriesByDate(entries), [entries]);

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-ink-muted mb-4">
          まだ日記がありません。今日の出来事を記録してみましょう。
        </p>
        <p className="text-xs text-ink-faint">
          右上の「新しい日記」ボタンから投稿できます。
        </p>
      </div>
    );
  }

  const dates = Array.from(grouped.keys());

  return (
    <ScrollRevealWrapper>
      <div className="space-y-8">
        {dates.map((date) => {
          const dayEntries = grouped.get(date)!;
          const d = new Date(date + 'T00:00:00');
          return (
            <div key={date} className="reveal">
              {/* Date header */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="inline-block bg-yellow px-2 py-0.5 text-sm font-bold text-ink rounded-sm">
                  {d.getMonth() + 1}月{d.getDate()}日
                </span>
                <span className="text-xs text-ink-muted">
                  {['日','月','火','水','木','金','土'][d.getDay()]}
                </span>
                <span className="text-xs text-ink-faint">
                  {dayEntries.length}件
                </span>
              </div>

              {/* Entries for this date */}
              <div className="space-y-3 pl-3 border-l-2 border-gray-100">
                {dayEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={onEditEntry}
                    onDelete={onDeleteEntry}
                    onPersonClick={onPersonClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollRevealWrapper>
  );
}
