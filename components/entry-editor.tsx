'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import type { EntryWithRelations, Person, Group } from '@/lib/types';
import { MOODS } from '@/lib/types';
import { todayString } from '@/lib/date-utils';
import {
  createEntry,
  updateEntry,
  setEntryPeople,
  uploadImage,
  deleteImage,
} from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { PersonAvatar } from './person-avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EntryEditorProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  people: Person[];
  groups: Group[];
  editingEntry?: EntryWithRelations | null;
}

interface UploadedImage {
  path: string;
  url: string;
  file?: File;
  existing?: boolean;
}

export function EntryEditor({
  open,
  onClose,
  onSaved,
  people,
  groups,
  editingEntry,
}: EntryEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('');
  const [entryDate, setEntryDate] = useState(todayString());
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const { toast } = useToast();

  const isEditing = !!editingEntry;

  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setTitle(editingEntry.title);
        setContent(editingEntry.content);
        setMood(editingEntry.mood ?? '');
        setEntryDate(editingEntry.entry_date);
        setSelectedPersonIds(editingEntry.people?.map((p) => p.id) ?? []);
        setImages(
          (editingEntry.images ?? []).map((img) => ({
            path: img.storage_path,
            url: '',
            existing: true,
          }))
        );
      } else {
        setTitle('');
        setContent('');
        setMood('');
        setEntryDate(todayString());
        setSelectedPersonIds([]);
        setImages([]);
      }
      setGroupFilter('all');
    }
  }, [open, editingEntry]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newImages: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const path = await uploadImage(file);
        newImages.push({ path, url: '', file });
      }
      setImages((prev) => [...prev, ...newImages]);
    } catch {
      toast({
        title: 'アップロードエラー',
        description: '画像のアップロードに失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const removeImage = async (index: number) => {
    const img = images[index];
    if (img.existing) {
      try { await deleteImage(img.path); } catch { /* ignore */ }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePerson = (personId: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSave = async () => {
    if (!content.trim() && !title.trim()) {
      toast({
        title: '入力不足',
        description: 'タイトルまたは本文を入力してください。',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingEntry) {
        await updateEntry(editingEntry.id, {
          title: title.trim(),
          content: content.trim(),
          mood: mood || null,
          entry_date: entryDate,
        });
        await setEntryPeople(editingEntry.id, selectedPersonIds);

        const existingPaths = images.filter((i) => i.existing).map((i) => i.path);
        const newImages = images.filter((i) => !i.existing);

        const oldPaths = (editingEntry.images ?? []).map((i) => i.storage_path);
        const removedPaths = oldPaths.filter((p) => !existingPaths.includes(p));
        if (removedPaths.length > 0) {
          await supabase.from('entry_images').delete().in('storage_path', removedPaths);
        }

        if (newImages.length > 0) {
          await supabase.from('entry_images').insert(
            newImages.map((img, idx) => ({
              entry_id: editingEntry.id,
              storage_path: img.path,
              display_order: existingPaths.length + idx,
            }))
          );
        }
      } else {
        await createEntry(
          title.trim(),
          content.trim(),
          mood || null,
          entryDate,
          selectedPersonIds,
          images.map((img, idx) => ({ path: img.path, displayOrder: idx }))
        );
      }

      toast({ title: isEditing ? '日記を更新しました' : '日記を投稿しました' });
      onSaved();
      onClose();
    } catch {
      toast({
        title: '保存エラー',
        description: '保存に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const filteredPeople =
    groupFilter === 'all'
      ? people
      : people.filter((p) => p.group_id === groupFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 rounded-md w-full max-w-2xl my-0 sm:my-8 p-5 sm:p-6 animate-fade-in-up max-h-[100vh] sm:max-h-[90vh] overflow-y-auto shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink">
            {isEditing ? '日記を編集' : '新しい日記'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-ink mb-1.5">日付</label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        {/* Mood */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-ink mb-1.5">気分</label>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(mood === m.value ? '' : m.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-sm transition-colors',
                  mood === m.value
                    ? 'bg-yellow border-yellow text-ink font-bold'
                    : 'bg-white border-gray-300 text-ink-muted hover:border-gray-400'
                )}
              >
                <span className="text-base">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-ink mb-1.5">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="今日のタイトル..."
            className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-ink mb-1.5">本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="何があった？誰と会った？どんな気持ちだった？"
            rows={6}
            className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Image upload */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-ink mb-1.5">画像</label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-sm overflow-hidden border border-gray-200 group/img">
                <img
                  src={img.url || getImagePreviewUrl(img.path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-sm bg-black/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-sm border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-ink hover:bg-gray-50 transition-colors">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-ink-muted animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4 text-ink-muted mb-0.5" />
                  <span className="text-[10px] text-ink-muted">追加</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Person tagging */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-ink mb-1.5">
            一緒にいた人
          </label>

          {groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              <button
                onClick={() => setGroupFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-sm text-xs transition-colors',
                  groupFilter === 'all'
                    ? 'bg-ink text-white font-bold'
                    : 'bg-gray-100 text-ink-muted hover:bg-gray-200'
                )}
              >
                全て
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGroupFilter(g.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-sm text-xs transition-colors',
                    groupFilter === g.id
                      ? 'bg-ink text-white font-bold'
                      : 'bg-gray-100 text-ink-muted hover:bg-gray-200'
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {people.length === 0 ? (
            <p className="text-sm text-ink-muted py-3 text-center border border-dashed border-gray-200 rounded-sm">
              まず設定から人を追加してください
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filteredPeople.map((person) => {
                const selected = selectedPersonIds.includes(person.id);
                return (
                  <button
                    key={person.id}
                    onClick={() => togglePerson(person.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-sm pl-1 pr-2.5 py-1 border text-sm transition-colors',
                      selected
                        ? 'bg-yellow border-yellow'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <PersonAvatar person={person} size="sm" />
                    <span className={cn('text-xs', selected ? 'text-ink font-bold' : 'text-ink-light')}>
                      {person.name}
                    </span>
                    {selected && <Plus className="w-3 h-3 text-ink rotate-45" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-sm text-sm text-ink-muted hover:text-ink hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-sm bg-yellow text-ink text-sm font-bold hover:bg-yellow-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              isEditing ? '更新する' : '投稿する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getImagePreviewUrl(path: string): string {
  const { data } = supabase.storage.from('entry-images').getPublicUrl(path);
  return data.publicUrl;
}
