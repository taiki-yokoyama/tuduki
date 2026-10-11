import { request } from './client'
import type { Diary, DiaryImage, Group, Person, User } from '../types'

export async function signIn(email: string, password: string): Promise<User> {
  const response = await request<{ user: User }>('/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return response.user
}

export async function signUp(email: string, password: string): Promise<User> {
  const response = await request<{ user: User }>('/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return response.user
}

export async function signOut(): Promise<void> {
  await request<void>('/auth/sign-out', { method: 'POST' })
}

export function listGroups(): Promise<Group[]> {
  return request<Group[]>('/groups')
}

export function createGroup(input: Pick<Group, 'name' | 'color' | 'sort_order'>): Promise<Group> {
  return request<Group>('/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteGroup(id: number): Promise<void> {
  return request<void>(`/groups/${id}`, { method: 'DELETE' })
}

export function listPeople(groupId?: number): Promise<Person[]> {
  const query = groupId ? `?group_id=${groupId}` : ''
  return request<Person[]>(`/people${query}`)
}

export function createPerson(input: {
  name: string
  group_id: number | null
  notes: string | null
  avatar_color: string
  image_url: string | null
}): Promise<Person> {
  return request<Person>('/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updatePerson(id: number, input: Partial<{
  name: string
  group_id: number | null
  notes: string | null
  avatar_color: string
  image_url: string | null
}>): Promise<Person> {
  return request<Person>(`/people/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function listDiaries(filters: {
  personId?: number
  startDate?: string
  endDate?: string
} = {}): Promise<Diary[]> {
  const params = new URLSearchParams()
  if (filters.personId) params.set('person_id', String(filters.personId))
  if (filters.startDate) params.set('start_date', filters.startDate)
  if (filters.endDate) params.set('end_date', filters.endDate)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request<Diary[]>(`/diaries${query}`)
}

export function getDiary(id: number): Promise<Diary> {
  return request<Diary>(`/diaries/${id}`)
}

export function createDiary(input: {
  content: string
  diary_date: string
  person_ids: number[]
  images: { storage_path: string; display_order: number }[]
}): Promise<Diary> {
  return request<Diary>('/diaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateDiary(id: number, input: {
  content?: string
  diary_date?: string
  person_ids?: number[]
}): Promise<Diary> {
  return request<Diary>(`/diaries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteDiary(id: number): Promise<void> {
  return request<void>(`/diaries/${id}`, { method: 'DELETE' })
}

export async function uploadImage(file: File): Promise<{ storage_path: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  return request<{ storage_path: string; url: string }>('/images', {
    method: 'POST',
    body: formData,
  })
}

export function listDiaryImages(diaryId: number): Promise<DiaryImage[]> {
  return request<DiaryImage[]>(`/diaries/${diaryId}/images`)
}

export function attachDiaryImage(
  diaryId: number,
  input: { storage_path: string; display_order: number },
): Promise<DiaryImage> {
  return request<DiaryImage>(`/diaries/${diaryId}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteDiaryImage(diaryId: number, imageId: number): Promise<void> {
  return request<void>(`/diaries/${diaryId}/images/${imageId}`, { method: 'DELETE' })
}
