'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import type { EntryWithRelations, Person, Group } from '@/lib/types';
import { fetchEntriesByPerson } from '@/lib/data';
import { PersonAvatar } from './person-avatar';
import { EntryCard } from './entry-card';
import { ScrollRevealWrapper } from './scroll-reveal-wrapper';
import { cn } from '@/lib/utils';

interface PeopleViewProps {
  people: Person[];
  groups: Group[];
  allEntries: EntryWithRelations[];
  onEditEntry: (entry: EntryWithRelations) => void;
  onDeleteEntry: (entry: EntryWithRelations) => void;
  initialPersonId?: string | null;
}

export function PeopleView({
  people,
  groups,
  allEntries,
  onEditEntry,
  onDeleteEntry,
  initialPersonId,
}: PeopleViewProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(initialPersonId ?? null);

  useEffect(() => {
    if (initialPersonId) {
      setSelectedPersonId(initialPersonId);
    }
  }, [initialPersonId]);

  const [personEntries, setPersonEntries] = useState<EntryWithRelations[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const entryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of allEntries) {
      for (const person of entry.people ?? []) {
        counts.set(person.id, (counts.get(person.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [allEntries]);

  const peopleByGroup = useMemo(() => {
    const grouped = new Map<string | null, Person[]>();
    for (const person of people) {
      const gid = person.group_id;
      if (!grouped.has(gid)) grouped.set(gid, []);
      grouped.get(gid)!.push(person);
    }
    return grouped;
  }, [people]);

  useEffect(() => {
    if (selectedPersonId) {
      setLoadingEntries(true);
      fetchEntriesByPerson(selectedPersonId)
        .then((entries) => setPersonEntries(entries))
        .catch(() => setPersonEntries([]))
        .finally(() => setLoadingEntries(false));
    } else {
      setPersonEntries([]);
    }
  }, [selectedPersonId]);

  const selectedPerson = people.find((p) => p.id === selectedPersonId);
  const selectedPersonGroup = selectedPerson
    ? groups.find((g) => g.id === selectedPerson.group_id)
    : null;

  // Person detail view
  if (selectedPerson) {
    return (
      <ScrollRevealWrapper>
        <div className="space-y-5">
          {/* Person header */}
          <div className="border border-gray-200 rounded-md p-5 sm:p-6 reveal">
            <button
              onClick={() => setSelectedPersonId(null)}
              className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ひと一覧に戻る
            </button>

            <div className="flex items-center gap-4">
              <PersonAvatar person={selectedPerson} size="lg" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-ink">
                  {selectedPerson.name}
                </h2>
                {selectedPersonGroup && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 rounded-sm text-ink-muted">
                    {selectedPersonGroup.name}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-ink">
                  {entryCounts.get(selectedPerson.id) ?? 0}
                </div>
                <div className="text-xs text-ink-faint">件の記録</div>
              </div>
            </div>

            {selectedPerson.notes && (
              <p className="mt-4 text-sm text-ink-light leading-relaxed border-t border-gray-100 pt-3">
                {selectedPerson.notes}
              </p>
            )}
          </div>

          {/* Person timeline */}
          <div className="reveal">
            <h3 className="text-base font-bold text-ink mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-ink-muted" />
              この人との記録
            </h3>

            {loadingEntries ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-md h-32 shimmer" />
                ))}
              </div>
            ) : personEntries.length === 0 ? (
              <p className="text-sm text-ink-muted py-8 text-center border border-gray-200 rounded-md bg-gray-50">
                この人との日記はまだありません
              </p>
            ) : (
              <div className="space-y-3">
                {personEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={onEditEntry}
                    onDelete={onDeleteEntry}
                    onPersonClick={(pid) => setSelectedPersonId(pid)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollRevealWrapper>
    );
  }

  // People grid view
  const ungrouped = peopleByGroup.get(null) ?? [];
  const sortedGroups = [...groups].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ScrollRevealWrapper>
      <div className="space-y-8">
        {people.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-muted mb-4">
              まだ人が登録されていません。
            </p>
            <p className="text-xs text-ink-faint">
              右上の設定アイコンから、よく会う人を追加できます。
            </p>
          </div>
        ) : (
          <>
            {/* Grouped people */}
            {sortedGroups.map((group) => {
              const groupPeople = peopleByGroup.get(group.id) ?? [];
              if (groupPeople.length === 0) return null;
              return (
                <div key={group.id} className="reveal">
                  <div className="flex items-baseline gap-2 mb-3">
                    <h3 className="text-base font-bold text-ink">{group.name}</h3>
                    <span className="text-xs text-ink-faint">{groupPeople.length}人</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupPeople.map((person) => (
                      <PersonCard
                        key={person.id}
                        person={person}
                        entryCount={entryCounts.get(person.id) ?? 0}
                        onClick={() => setSelectedPersonId(person.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Ungrouped */}
            {ungrouped.length > 0 && (
              <div className="reveal">
                {sortedGroups.length > 0 && (
                  <div className="flex items-baseline gap-2 mb-3">
                    <h3 className="text-base font-bold text-ink-muted">その他</h3>
                    <span className="text-xs text-ink-faint">{ungrouped.length}人</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ungrouped.map((person) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      entryCount={entryCounts.get(person.id) ?? 0}
                      onClick={() => setSelectedPersonId(person.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ScrollRevealWrapper>
  );
}

function PersonCard({
  person,
  entryCount,
  onClick,
}: {
  person: Person;
  entryCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-gray-200 rounded-md p-4 flex items-center gap-3 text-left hover:border-gray-300 hover:bg-gray-50 transition-colors animate-fade-in-up"
    >
      <PersonAvatar person={person} size="md" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-ink truncate">{person.name}</h4>
        {person.notes ? (
          <p className="text-xs text-ink-muted truncate mt-0.5">{person.notes}</p>
        ) : (
          <p className="text-xs text-ink-faint mt-0.5">メモなし</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <span className="text-sm font-bold text-ink">{entryCount}</span>
        <span className="text-xs text-ink-faint ml-1">件</span>
      </div>
    </button>
  );
}
