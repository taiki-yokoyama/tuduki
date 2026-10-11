import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { createGroup, deleteGroup, listGroups } from '../api/resources'
import type { Group } from '../types'
import { GroupsView } from '../presentation/groups/GroupsView'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'グループの読み込みに失敗しました。'
}

export function GroupsContainer() {
  const [groups, setGroups] = useState<Group[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('indigo')
  const [sortOrder, setSortOrder] = useState('0')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setGroups(await listGroups())
      setError('')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function submit() {
    if (!name.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const group = await createGroup({
        name: name.trim(),
        color,
        sort_order: Number(sortOrder) || 0,
      })
      setGroups((current) => [...current, group].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id))
      setName('')
      setSortOrder('0')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(group: Group) {
    if (!window.confirm(`「${group.name}」を削除しますか？人物のグループ紐付けは解除されます。`)) return
    try {
      await deleteGroup(group.id)
      setGroups((current) => current.filter((item) => item.id !== group.id))
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  return (
    <GroupsView
      groups={groups}
      name={name}
      color={color}
      sortOrder={sortOrder}
      loading={loading}
      submitting={submitting}
      error={error}
      onNameChange={setName}
      onColorChange={setColor}
      onSortOrderChange={setSortOrder}
      onSubmit={() => { void submit() }}
      onDelete={(group) => { void remove(group) }}
    />
  )
}
