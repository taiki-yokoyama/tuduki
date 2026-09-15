import { supabase, STORAGE_BUCKET } from './supabase';
import type { Entry, EntryWithRelations, Person, Group, EntryImage } from './types';

// ============ Groups ============

export async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createGroup(name: string, color: string, sortOrder = 0): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, color, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw error;
}

// ============ People ============

export async function fetchPeople(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*, group:groups(*)')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createPerson(
  name: string,
  groupId: string | null,
  avatarColor: string,
  notes?: string
): Promise<Person> {
  const { data, error } = await supabase
    .from('people')
    .insert({ name, group_id: groupId, avatar_color: avatarColor, notes: notes ?? null })
    .select('*, group:groups(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function updatePerson(
  id: string,
  updates: { name?: string; group_id?: string | null; avatar_color?: string; notes?: string | null }
): Promise<Person> {
  const { data, error } = await supabase
    .from('people')
    .update(updates)
    .eq('id', id)
    .select('*, group:groups(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function deletePerson(id: string): Promise<void> {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}

// ============ Entries ============

export async function fetchAllEntries(): Promise<EntryWithRelations[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*, people:entry_people(person:people(*, group:groups(*))), images:entry_images(*)')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(transformEntry);
}

export async function fetchEntriesByPerson(personId: string): Promise<EntryWithRelations[]> {
  const { data: entryPeople, error: epError } = await supabase
    .from('entry_people')
    .select('entry_id')
    .eq('person_id', personId);
  if (epError) throw epError;

  const entryIds = (entryPeople ?? []).map((ep) => ep.entry_id);
  if (entryIds.length === 0) return [];

  const { data, error } = await supabase
    .from('entries')
    .select('*, people:entry_people(person:people(*, group:groups(*))), images:entry_images(*)')
    .in('id', entryIds)
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(transformEntry);
}

export async function fetchEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<EntryWithRelations[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*, people:entry_people(person:people(*, group:groups(*))), images:entry_images(*)')
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(transformEntry);
}

export async function createEntry(
  title: string,
  content: string,
  mood: string | null,
  entryDate: string,
  personIds: string[],
  images: { path: string; displayOrder: number }[]
): Promise<Entry> {
  const { data: entry, error } = await supabase
    .from('entries')
    .insert({ title, content, mood, entry_date: entryDate })
    .select()
    .single();
  if (error) throw error;

  if (personIds.length > 0) {
    const { error: epError } = await supabase
      .from('entry_people')
      .insert(personIds.map((pid) => ({ entry_id: entry.id, person_id: pid })));
    if (epError) throw epError;
  }

  if (images.length > 0) {
    const { error: imgError } = await supabase
      .from('entry_images')
      .insert(images.map((img) => ({ entry_id: entry.id, storage_path: img.path, display_order: img.displayOrder })));
    if (imgError) throw imgError;
  }

  return entry;
}

export async function updateEntry(
  id: string,
  updates: { title?: string; content?: string; mood?: string | null; entry_date?: string }
): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

export async function setEntryPeople(entryId: string, personIds: string[]): Promise<void> {
  const { error: delError } = await supabase
    .from('entry_people')
    .delete()
    .eq('entry_id', entryId);
  if (delError) throw delError;

  if (personIds.length > 0) {
    const { error: insError } = await supabase
      .from('entry_people')
      .insert(personIds.map((pid) => ({ entry_id: entryId, person_id: pid })));
    if (insError) throw insError;
  }
}

// ============ Images ============

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export function getImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteImage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
  if (error) throw error;
}

// ============ Helpers ============

function transformEntry(raw: any): EntryWithRelations {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    mood: raw.mood,
    entry_date: raw.entry_date,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    people: (raw.people ?? []).map((p: any) => p.person).filter(Boolean),
    images: (raw.images ?? []).sort((a: EntryImage, b: EntryImage) => a.display_order - b.display_order),
  };
}
