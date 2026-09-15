'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { TimelineView } from '@/components/timeline-view';
import { CalendarView } from '@/components/calendar-view';
import { PeopleView } from '@/components/people-view';
import { EntryEditor } from '@/components/entry-editor';
import { PeopleManager } from '@/components/people-manager';
import { AuthScreen } from '@/components/auth-screen';
import { useAuth } from '@/lib/auth-context';
import { fetchAllEntries, fetchPeople, fetchGroups, deleteEntry } from '@/lib/data';
import type { EntryWithRelations, Person, Group } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Tab = 'timeline' | 'calendar' | 'people';

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [tab, setTab] = useState<Tab>('timeline');
  const [entries, setEntries] = useState<EntryWithRelations[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryWithRelations | null>(null);
  const [peopleManagerOpen, setPeopleManagerOpen] = useState(false);
  const [navigateToPerson, setNavigateToPerson] = useState<string | null>(null);

  const { toast } = useToast();

  const loadAll = useCallback(async () => {
    try {
      const [e, p, g] = await Promise.all([
        fetchAllEntries(),
        fetchPeople(),
        fetchGroups(),
      ]);
      setEntries(e);
      setPeople(p);
      setGroups(g);
    } catch {
      toast({
        title: 'データの読み込みに失敗しました',
        description: 'ページをリロードしてください。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadAll();
    } else {
      setLoading(false);
    }
  }, [user, loadAll]);

  const handleNewEntry = () => {
    setEditingEntry(null);
    setEditorOpen(true);
  };

  const handleEditEntry = (entry: EntryWithRelations) => {
    setEditingEntry(entry);
    setEditorOpen(true);
  };

  const handleDeleteEntry = async (entry: EntryWithRelations) => {
    if (!confirm('この日記を削除しますか？')) return;
    try {
      await deleteEntry(entry.id);
      toast({ title: '日記を削除しました' });
      loadAll();
    } catch {
      toast({ title: '削除に失敗しました', variant: 'destructive' });
    }
  };

  const handlePersonClick = (personId: string) => {
    setTab('people');
    setNavigateToPerson(personId);
  };

  const handleEditorSaved = () => {
    loadAll();
  };

  const handlePeopleChanged = () => {
    loadAll();
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'ログアウトしました' });
  };

  // Show auth screen while checking session or when not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-md bg-yellow flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-ink" strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'timeline', label: 'タイムライン', icon: BookOpen },
    { id: 'calendar', label: 'カレンダー', icon: Calendar },
    { id: 'people', label: 'ひとの記録', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-yellow flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-ink" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-logo text-lg text-ink leading-none">Memora</h1>
                <p className="text-[10px] text-ink-faint mt-0.5 hidden sm:block">
                  自分と他人を記録する日記
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPeopleManagerOpen(true)}
                className="p-2 rounded-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors"
                title="設定"
              >
                <Settings className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleNewEntry}
                className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-yellow text-ink text-sm font-bold hover:bg-yellow-dark transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">新しい日記</span>
                <span className="sm:hidden">日記</span>
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex items-center gap-1 -mb-px">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors',
                  tab === id
                    ? 'border-yellow font-bold text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink'
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Stats bar */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-baseline gap-5 text-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">{entries.length}</span>
            <span className="text-ink-muted">日記</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">{people.length}</span>
            <span className="text-ink-muted">人</span>
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-ink">{groups.length}</span>
            <span className="text-ink-muted">グループ</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-[60vh]">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md h-40 shimmer" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'timeline' && (
              <TimelineView
                entries={entries}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onPersonClick={handlePersonClick}
              />
            )}
            {tab === 'calendar' && (
              <CalendarView
                entries={entries}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onPersonClick={handlePersonClick}
              />
            )}
            {tab === 'people' && (
              <PeopleView
                people={people}
                groups={groups}
                allEntries={entries}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                initialPersonId={navigateToPerson}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-8 border-t border-gray-100">
        <p className="text-xs text-ink-faint text-center">
          Memora — 記録を残す行為を、楽しく。
        </p>
      </footer>

      {/* Entry editor */}
      <EntryEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={handleEditorSaved}
        people={people}
        groups={groups}
        editingEntry={editingEntry}
      />

      {/* People manager */}
      <PeopleManager
        open={peopleManagerOpen}
        onClose={() => setPeopleManagerOpen(false)}
        onChanged={handlePeopleChanged}
        people={people}
        groups={groups}
      />

      {/* Floating action button (mobile) */}
      <button
        onClick={handleNewEntry}
        className="fixed bottom-5 right-5 sm:hidden w-12 h-12 rounded-md bg-yellow flex items-center justify-center z-30 shadow-md"
      >
        <Plus className="w-6 h-6 text-ink" strokeWidth={2.5} />
      </button>
    </div>
  );
}
