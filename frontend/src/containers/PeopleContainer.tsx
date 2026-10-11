import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { createPerson, listGroups, listPeople, updatePerson } from '../api/resources'
import type { Group, Person } from '../types'
import { PeopleView } from '../presentation/people/PeopleView'

type PersonForm = {
  name: string
  groupId: string
  notes: string
  avatarColor: string
  imageUrl: string
}

const emptyForm: PersonForm = { name: '', groupId: '', notes: '', avatarColor: 'indigo', imageUrl: '' }

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '人物の読み込みに失敗しました。'
}

export function PeopleContainer() {
  const [people, setPeople] = useState<Person[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [form, setForm] = useState<PersonForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filterGroupId, setFilterGroupId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [peopleResponse, groupsResponse] = await Promise.all([listPeople(), listGroups()])
      setPeople(peopleResponse)
      setGroups(groupsResponse)
      setError('')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const visiblePeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return people.filter((person) => {
      const matchesGroup = !filterGroupId || String(person.group_id) === filterGroupId
      const matchesSearch = !query || `${person.name} ${person.notes ?? ''}`.toLocaleLowerCase().includes(query)
      return matchesGroup && matchesSearch
    })
  }, [people, filterGroupId, search])

  function edit(person: Person) {
    setEditingId(person.id)
    setForm({
      name: person.name,
      groupId: person.group_id ? String(person.group_id) : '',
      notes: person.notes ?? '',
      avatarColor: person.avatar_color,
      imageUrl: person.image_url ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    const input = {
      name: form.name.trim(),
      group_id: form.groupId ? Number(form.groupId) : null,
      notes: form.notes.trim() || null,
      avatar_color: form.avatarColor,
      image_url: form.imageUrl.trim() || null,
    }

    try {
      const saved = editingId === null
        ? await createPerson(input)
        : await updatePerson(editingId, input)
      setPeople((current) => editingId === null
        ? [...current, saved].sort((a, b) => a.name.localeCompare(b.name))
        : current.map((person) => person.id === saved.id ? saved : person))
      resetForm()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PeopleView
      people={visiblePeople}
      groups={groups}
      form={form}
      editingId={editingId}
      filterGroupId={filterGroupId}
      search={search}
      loading={loading}
      submitting={submitting}
      error={error}
      onFormChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
      onEdit={edit}
      onReset={resetForm}
      onSubmit={() => { void submit() }}
      onFilterGroupChange={setFilterGroupId}
      onSearchChange={setSearch}
    />
  )
}
