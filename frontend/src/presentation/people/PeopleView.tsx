import type { FormEvent } from 'react'
import type { Group, Person } from '../../types'

export type PersonFormState = {
  name: string
  groupId: string
  notes: string
  avatarColor: string
  imageUrl: string
}

type PeopleViewProps = {
  people: Person[]
  groups: Group[]
  form: PersonFormState
  editingId: number | null
  filterGroupId: string
  search: string
  loading: boolean
  submitting: boolean
  error: string
  onFormChange: (key: keyof PersonFormState, value: string) => void
  onEdit: (person: Person) => void
  onReset: () => void
  onSubmit: () => void
  onFilterGroupChange: (value: string) => void
  onSearchChange: (value: string) => void
}

const avatarColors = ['indigo', 'yellow', 'gray-1', 'gray-2', 'gray-3', 'gray-4', 'rose', 'green']

export function PeopleView({
  people,
  groups,
  form,
  editingId,
  filterGroupId,
  search,
  loading,
  submitting,
  error,
  onFormChange,
  onEdit,
  onReset,
  onSubmit,
  onFilterGroupChange,
  onSearchChange,
}: PeopleViewProps) {
  return (
    <section className="page-section">
      <header className="page-heading">
        <div>
          <p className="eyebrow">PEOPLE / YOUR CIRCLE</p>
          <h1>大切な人を、<em>覚えておく。</em></h1>
          <p className="page-lead">日記に登場する人のことを、あなたの言葉で残せます。</p>
        </div>
        <div className="count-badge"><strong>{people.length}</strong><span>people</span></div>
      </header>
      <div className="management-grid people-grid">
        <form className="panel form-panel" onSubmit={(event: FormEvent) => { event.preventDefault(); onSubmit() }}>
          <div className="section-kicker">{editingId === null ? 'NEW PERSON' : 'EDIT PERSON'}</div>
          <h2>{editingId === null ? '人物を追加' : '人物を編集'}</h2>
          <label htmlFor="person-name">名前</label>
          <input id="person-name" value={form.name} maxLength={20} onChange={(event) => onFormChange('name', event.target.value)} required placeholder="例：山田花子" />
          <label htmlFor="person-group">グループ</label>
          <select id="person-group" value={form.groupId} onChange={(event) => onFormChange('groupId', event.target.value)}>
            <option value="">未分類</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
          <label htmlFor="person-notes">メモ</label>
          <textarea id="person-notes" rows={4} value={form.notes} onChange={(event) => onFormChange('notes', event.target.value)} placeholder="出身、趣味、印象など" />
          <div className="form-row">
            <div>
              <label htmlFor="person-color">カラー</label>
              <select id="person-color" value={form.avatarColor} onChange={(event) => onFormChange('avatarColor', event.target.value)}>
                {avatarColors.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="person-image">画像URL</label>
              <input id="person-image" type="url" value={form.imageUrl} onChange={(event) => onFormChange('imageUrl', event.target.value)} placeholder="任意" />
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '保存中…' : editingId === null ? '人物を追加' : '変更を保存'}</button>
          {editingId !== null && <button className="secondary-button" type="button" onClick={onReset}>キャンセル</button>}
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="panel list-panel">
          <div className="panel-heading people-toolbar">
            <div><div className="section-kicker">YOUR CIRCLE</div><h2>人物一覧</h2></div>
            <div className="toolbar-controls">
              <input aria-label="人物を検索" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="検索" />
              <select aria-label="グループで絞り込み" value={filterGroupId} onChange={(event) => onFilterGroupChange(event.target.value)}>
                <option value="">すべてのGroup</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </div>
          </div>
          {loading ? <p className="muted">読み込み中…</p> : people.length === 0 ? <p className="empty-state">条件に一致するPersonがいません。</p> : (
            <div className="person-list">
              {people.map((person) => (
                <article className="person-row" key={person.id}>
                  <span className={`avatar color-${person.avatar_color.replace(/[^a-z0-9-]/gi, '-')}`}>{person.name.slice(0, 1)}</span>
                  <div className="person-main"><strong>{person.name}</strong><small>{person.group?.name ?? '未分類'}</small>{person.notes && <p>{person.notes}</p>}</div>
                  <button className="icon-button" type="button" onClick={() => onEdit(person)}>編集</button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
