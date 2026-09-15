'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, FolderPlus, UserPlus, Users } from 'lucide-react';
import type { Person, Group } from '@/lib/types';
import { AVATAR_COLORS, GROUP_COLORS } from '@/lib/types';
import {
  createPerson,
  updatePerson,
  deletePerson,
  createGroup,
  deleteGroup,
} from '@/lib/data';
import { PersonAvatar } from './person-avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PeopleManagerProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  people: Person[];
  groups: Group[];
}

export function PeopleManager({ open, onClose, onChanged, people, groups }: PeopleManagerProps) {
  const [tab, setTab] = useState<'people' | 'groups'>('people');
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [personName, setPersonName] = useState('');
  const [personGroupId, setPersonGroupId] = useState<string>('');
  const [personAvatarColor, setPersonAvatarColor] = useState<string>('black');
  const [personNotes, setPersonNotes] = useState('');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personSaving, setPersonSaving] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState<string>('black');
  const [groupSaving, setGroupSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setShowPersonForm(false);
      setShowGroupForm(false);
      setEditingPerson(null);
    }
  }, [open]);

  const resetPersonForm = () => {
    setPersonName('');
    setPersonGroupId('');
    setPersonAvatarColor('black');
    setPersonNotes('');
    setEditingPerson(null);
    setShowPersonForm(false);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setPersonName(person.name);
    setPersonGroupId(person.group_id ?? '');
    setPersonAvatarColor(person.avatar_color);
    setPersonNotes(person.notes ?? '');
    setShowPersonForm(true);
  };

  const handleSavePerson = async () => {
    if (!personName.trim()) {
      toast({ title: '名前を入力してください', variant: 'destructive' });
      return;
    }
    setPersonSaving(true);
    try {
      if (editingPerson) {
        await updatePerson(editingPerson.id, {
          name: personName.trim(),
          group_id: personGroupId || null,
          avatar_color: personAvatarColor,
          notes: personNotes.trim() || null,
        });
        toast({ title: '人物を更新しました' });
      } else {
        await createPerson(personName.trim(), personGroupId || null, personAvatarColor, personNotes.trim());
        toast({ title: '人物を追加しました' });
      }
      onChanged();
      resetPersonForm();
    } catch {
      toast({ title: '保存に失敗しました', variant: 'destructive' });
    } finally {
      setPersonSaving(false);
    }
  };

  const handleDeletePerson = async (person: Person) => {
    if (!confirm(`「${person.name}」を削除しますか？この人物のタグ付けも解除されます。`)) return;
    try {
      await deletePerson(person.id);
      toast({ title: '人物を削除しました' });
      onChanged();
    } catch {
      toast({ title: '削除に失敗しました', variant: 'destructive' });
    }
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      toast({ title: 'グループ名を入力してください', variant: 'destructive' });
      return;
    }
    setGroupSaving(true);
    try {
      await createGroup(groupName.trim(), groupColor, groups.length);
      toast({ title: 'グループを作成しました' });
      setGroupName('');
      setGroupColor('black');
      setShowGroupForm(false);
      onChanged();
    } catch {
      toast({ title: '作成に失敗しました', variant: 'destructive' });
    } finally {
      setGroupSaving(false);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    const count = people.filter((p) => p.group_id === group.id).length;
    const msg = count > 0
      ? `「${group.name}」を削除しますか？${count}人のグループ分けが解除されます（人物自体は残ります）。`
      : `「${group.name}」を削除しますか？`;
    if (!confirm(msg)) return;
    try {
      await deleteGroup(group.id);
      toast({ title: 'グループを削除しました' });
      onChanged();
    } catch {
      toast({ title: '削除に失敗しました', variant: 'destructive' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 rounded-md w-full max-w-2xl my-0 sm:my-8 p-5 sm:p-6 animate-fade-in-up max-h-[100vh] sm:max-h-[90vh] overflow-y-auto shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink">ひととグループ</h2>
          <button onClick={onClose} className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-gray-200">
          <button
            onClick={() => setTab('people')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-px',
              tab === 'people' ? 'border-yellow font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            <UserPlus className="w-4 h-4" />
            ひと ({people.length})
          </button>
          <button
            onClick={() => setTab('groups')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-px',
              tab === 'groups' ? 'border-yellow font-bold text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            <Users className="w-4 h-4" />
            グループ ({groups.length})
          </button>
        </div>

        {/* People tab */}
        {tab === 'people' && (
          <div>
            {!showPersonForm ? (
              <button
                onClick={() => setShowPersonForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-sm border border-dashed border-gray-300 text-sm text-ink-muted hover:border-ink hover:text-ink transition-colors mb-3"
              >
                <Plus className="w-4 h-4" />
                ひとを追加
              </button>
            ) : (
              <div className="border border-gray-200 rounded-md p-4 mb-3 animate-fade-in-up">
                <h3 className="text-sm font-bold text-ink mb-3">
                  {editingPerson ? 'ひとを編集' : '新しいひと'}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">名前</label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="山田太郎"
                      className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">グループ</label>
                    <select
                      value={personGroupId}
                      onChange={(e) => setPersonGroupId(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
                    >
                      <option value="">なし</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">アバター色</label>
                    <div className="flex gap-1.5">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setPersonAvatarColor(color)}
                          className={cn(
                            'w-7 h-7 rounded-full avatar-' + color,
                            personAvatarColor === color && 'ring-2 ring-ink ring-offset-2'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">メモ</label>
                    <textarea
                      value={personNotes}
                      onChange={(e) => setPersonNotes(e.target.value)}
                      placeholder="この人の特徴、趣味、関係性など..."
                      rows={2}
                      className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={resetPersonForm} className="px-3 py-1.5 rounded-sm text-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors">
                    キャンセル
                  </button>
                  <button
                    onClick={handleSavePerson}
                    disabled={personSaving}
                    className="px-4 py-1.5 rounded-sm bg-yellow text-ink text-sm font-bold hover:bg-yellow-dark transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {personSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {editingPerson ? '更新' : '追加'}
                  </button>
                </div>
              </div>
            )}

            {/* People list */}
            <div className="space-y-1.5">
              {people.length === 0 && !showPersonForm && (
                <p className="text-center text-sm text-ink-muted py-6">
                  まだ人がいません。「ひとを追加」から始めましょう。
                </p>
              )}
              {people.map((person) => {
                const group = groups.find((g) => g.id === person.group_id);
                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-2.5 rounded-sm border border-gray-200 hover:border-gray-300 transition-colors group"
                  >
                    <PersonAvatar person={person} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{person.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {group && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 text-ink-muted">
                            {group.name}
                          </span>
                        )}
                        {person.notes && (
                          <span className="text-xs text-ink-faint truncate">{person.notes}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditPerson(person)}
                        className="px-2 py-1 rounded-sm text-xs text-ink-muted hover:bg-gray-100 hover:text-ink transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person)}
                        className="p-1.5 rounded-sm hover:bg-gray-100 text-ink-muted hover:text-ink transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Groups tab */}
        {tab === 'groups' && (
          <div>
            {!showGroupForm ? (
              <button
                onClick={() => setShowGroupForm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-sm border border-dashed border-gray-300 text-sm text-ink-muted hover:border-ink hover:text-ink transition-colors mb-3"
              >
                <FolderPlus className="w-4 h-4" />
                グループを作成
              </button>
            ) : (
              <div className="border border-gray-200 rounded-md p-4 mb-3 animate-fade-in-up">
                <h3 className="text-sm font-bold text-ink mb-3">新しいグループ</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">グループ名</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="家族、仕事、友人..."
                      className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">カラー</label>
                    <div className="flex gap-1.5">
                      {GROUP_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setGroupColor(color)}
                          className={cn(
                            'w-7 h-7 rounded-full avatar-' + color,
                            groupColor === color && 'ring-2 ring-ink ring-offset-2'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setShowGroupForm(false)} className="px-3 py-1.5 rounded-sm text-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors">
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveGroup}
                    disabled={groupSaving}
                    className="px-4 py-1.5 rounded-sm bg-yellow text-ink text-sm font-bold hover:bg-yellow-dark transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {groupSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    作成
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {groups.length === 0 && !showGroupForm && (
                <p className="text-center text-sm text-ink-muted py-6">
                  グループを作成して、人を整理しましょう。
                </p>
              )}
              {groups.map((group) => {
                const count = people.filter((p) => p.group_id === group.id).length;
                return (
                  <div
                    key={group.id}
                    className="flex items-center gap-3 p-3 rounded-sm border border-gray-200 hover:border-gray-300 transition-colors group"
                  >
                    <div className={cn('w-8 h-8 rounded-sm avatar-' + group.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink">{group.name}</p>
                      <p className="text-xs text-ink-faint">{count}人</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="p-1.5 rounded-sm hover:bg-gray-100 text-ink-muted hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
