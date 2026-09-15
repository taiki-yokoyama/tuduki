export interface Group {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  group_id: string | null;
  notes: string | null;
  avatar_color: string;
  created_at: string;
  group?: Group | null;
}

export interface EntryImage {
  id: string;
  entry_id: string;
  storage_path: string;
  display_order: number;
}

export interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
  people?: Person[];
  images?: EntryImage[];
}

export interface EntryWithRelations extends Entry {
  people: Person[];
  images: EntryImage[];
}

export const AVATAR_COLORS = [
  'black',
  'yellow',
  'gray-1',
  'gray-2',
  'gray-3',
  'gray-4',
] as const;

export const GROUP_COLORS = [
  'black',
  'yellow',
  'gray-1',
  'gray-2',
  'gray-3',
  'gray-4',
] as const;

export const MOODS = [
  { value: 'joyful', label: '嬉しい', emoji: '😊' },
  { value: 'calm', label: '穏やか', emoji: '😌' },
  { value: 'thoughtful', label: '考え中', emoji: '🤔' },
  { value: 'neutral', label: '普通', emoji: '😐' },
  { value: 'tired', label: '疲れた', emoji: '😮‍💨' },
] as const;

export const MOOD_LABELS: Record<string, string> = {
  joyful: '嬉しい',
  calm: '穏やか',
  thoughtful: '考え中',
  neutral: '普通',
  tired: '疲れた',
};

export const MOOD_EMOJIS: Record<string, string> = {
  joyful: '😊',
  calm: '😌',
  thoughtful: '🤔',
  neutral: '😐',
  tired: '😮‍💨',
};
