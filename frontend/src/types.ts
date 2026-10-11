export type User = {
  id: number
  email: string
  created_at: string
}

export type Group = {
  id: number
  name: string
  color: string
  sort_order: number
  created_at: string
}

export type Person = {
  id: number
  name: string
  group_id: number | null
  notes: string | null
  avatar_color: string
  image_url: string | null
  created_at: string
  group: Group | null
}

export type DiaryImage = {
  id: number
  diary_id: number
  storage_path: string
  display_order: number
  url: string
}

export type Diary = {
  id: number
  content: string
  diary_date: string
  created_at: string
  updated_at: string
  people: Person[]
  images: DiaryImage[]
}

export type ValidationErrors = Record<string, string[]>

export type ApiErrorShape = {
  message: string
  errors?: ValidationErrors
}
