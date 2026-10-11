import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import {
  attachDiaryImage,
  createDiary,
  deleteDiary,
  deleteDiaryImage,
  getDiary,
  listDiaries,
  listPeople,
  updateDiary,
  uploadImage,
} from '../api/resources'
import type { Diary, DiaryImage, Person } from '../types'
import { DiaryView, type DiaryFormState } from '../presentation/diary/DiaryView'

function localDate(): string {
  const date = new Date()
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '日記の読み込みに失敗しました。'
}

const emptyForm = (): DiaryFormState => ({ content: '', diaryDate: localDate(), personIds: [], files: [] })

export function DiaryContainer() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<DiaryFormState>(emptyForm)
  const [personFilter, setPersonFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageSubmitting, setImageSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadDiaries = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listDiaries({
        personId: personFilter ? Number(personFilter) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setDiaries(result)
      setError('')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [personFilter, startDate, endDate])

  useEffect(() => {
    void Promise.all([listPeople(), loadDiaries()])
      .then(([peopleResponse]) => setPeople(peopleResponse))
      .catch((caught) => setError(errorMessage(caught)))
  }, [loadDiaries])

  function resetForm() {
    setForm(emptyForm())
    setEditingId(null)
  }

  function selectDiary(diary: Diary) {
    setSelectedDiary(diary)
    void getDiary(diary.id)
      .then(setSelectedDiary)
      .catch((caught) => setError(errorMessage(caught)))
  }

  function editDiary(diary: Diary) {
    setEditingId(diary.id)
    setForm({
      content: diary.content,
      diaryDate: diary.diary_date,
      personIds: diary.people.map((person) => person.id),
      files: [],
    })
    setSelectedDiary(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function togglePerson(personId: number) {
    setForm((current) => ({
      ...current,
      personIds: current.personIds.includes(personId)
        ? current.personIds.filter((id) => id !== personId)
        : [...current.personIds, personId],
    }))
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      if (editingId === null) {
        const images = await Promise.all(form.files.map(async (file, index) => {
          const uploaded = await uploadImage(file)
          return { storage_path: uploaded.storage_path, display_order: index }
        }))
        const diary = await createDiary({
          content: form.content,
          diary_date: form.diaryDate,
          person_ids: form.personIds,
          images,
        })
        setDiaries((current) => [diary, ...current])
        setSelectedDiary(diary)
      } else {
        const diary = await updateDiary(editingId, {
          content: form.content,
          diary_date: form.diaryDate,
          person_ids: form.personIds,
        })
        setDiaries((current) => current.map((item) => item.id === diary.id ? diary : item))
        setSelectedDiary(diary)
      }
      resetForm()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function removeDiary(diary: Diary) {
    if (!window.confirm('このDiaryを削除しますか？')) return
    try {
      await deleteDiary(diary.id)
      setDiaries((current) => current.filter((item) => item.id !== diary.id))
      setSelectedDiary(null)
      if (editingId === diary.id) resetForm()
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  async function addImage(file: File) {
    if (!selectedDiary) return
    setImageSubmitting(true)
    setError('')
    try {
      const uploaded = await uploadImage(file)
      const image = await attachDiaryImage(selectedDiary.id, {
        storage_path: uploaded.storage_path,
        display_order: selectedDiary.images.length,
      })
      const updated = { ...selectedDiary, images: [...selectedDiary.images, image] }
      setSelectedDiary(updated)
      setDiaries((current) => current.map((diary) => diary.id === updated.id ? updated : diary))
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setImageSubmitting(false)
    }
  }

  async function removeImage(image: DiaryImage) {
    if (!selectedDiary) return
    try {
      await deleteDiaryImage(selectedDiary.id, image.id)
      const updated = { ...selectedDiary, images: selectedDiary.images.filter((item) => item.id !== image.id) }
      setSelectedDiary(updated)
      setDiaries((current) => current.map((diary) => diary.id === updated.id ? updated : diary))
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  return (
    <DiaryView
      diaries={diaries}
      people={people}
      selectedDiary={selectedDiary}
      editingId={editingId}
      form={form}
      personFilter={personFilter}
      startDate={startDate}
      endDate={endDate}
      loading={loading}
      submitting={submitting}
      imageSubmitting={imageSubmitting}
      error={error}
      onFormChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
      onTogglePerson={togglePerson}
      onSelectDiary={selectDiary}
      onEditDiary={editDiary}
      onDeleteDiary={(diary) => { void removeDiary(diary) }}
      onCloseDetail={() => setSelectedDiary(null)}
      onResetForm={resetForm}
      onSubmit={() => { void submit() }}
      onAddImage={(file) => { void addImage(file) }}
      onDeleteImage={(image) => { void removeImage(image) }}
      onPersonFilterChange={setPersonFilter}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onApplyFilters={() => { void loadDiaries() }}
    />
  )
}
