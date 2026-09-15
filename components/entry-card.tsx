'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { EntryWithRelations } from '@/lib/types';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/types';
import { formatDate, getWeekdayLabel } from '@/lib/date-utils';
import { PersonAvatar } from './person-avatar';
import { EntryImageGallery } from './entry-image-gallery';
import { cn } from '@/lib/utils';

interface EntryCardProps {
  entry: EntryWithRelations;
  onEdit?: (entry: EntryWithRelations) => void;
  onDelete?: (entry: EntryWithRelations) => void;
  onPersonClick?: (personId: string) => void;
  compact?: boolean;
}

export function EntryCard({ entry, onEdit, onDelete, onPersonClick, compact }: EntryCardProps) {
  return (
    <article
      className={cn(
        'bg-white border border-gray-200 rounded-md p-4 sm:p-5 group transition-colors hover:border-gray-300 animate-fade-in-up',
        compact && 'p-3 sm:p-4'
      )}
    >
      {/* Date + Mood header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-ink">
            {formatDate(entry.entry_date)}
          </span>
          <span className="text-xs text-ink-muted">
            ({getWeekdayLabel(entry.entry_date)})
          </span>
        </div>
        {entry.mood && (
          <div className="flex items-center gap-1 text-xs text-ink-muted">
            <span className="text-base">{MOOD_EMOJIS[entry.mood] ?? ''}</span>
            <span className="hidden sm:inline">{MOOD_LABELS[entry.mood] ?? entry.mood}</span>
          </div>
        )}
      </div>

      {/* Title */}
      {entry.title && (
        <h3 className="text-lg font-bold text-ink mb-1.5 leading-snug">
          {entry.title}
        </h3>
      )}

      {/* Content */}
      {entry.content && (
        <p className={cn('text-sm text-ink-light leading-relaxed whitespace-pre-wrap', compact ? 'line-clamp-3' : '')}>
          {entry.content}
        </p>
      )}

      {/* Images */}
      {entry.images && entry.images.length > 0 && (
        <div className="mt-3">
          <EntryImageGallery
            storagePaths={entry.images.map((img) => img.storage_path)}
          />
        </div>
      )}

      {/* Tagged people */}
      {entry.people && entry.people.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-faint">一緒にいた人</span>
          {entry.people.map((person) => (
            <button
              key={person.id}
              onClick={() => onPersonClick?.(person.id)}
              className="flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <PersonAvatar person={person} size="sm" />
              <span className="text-xs font-medium text-ink">{person.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(entry)}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
            >
              <Pencil className="w-3 h-3" />
              編集
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(entry)}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink ml-auto transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              削除
            </button>
          )}
        </div>
      )}
    </article>
  );
}
