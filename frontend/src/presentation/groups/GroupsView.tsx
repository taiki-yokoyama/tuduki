import type { Group } from '../../types'

type GroupsViewProps = {
  groups: Group[]
  name: string
  color: string
  sortOrder: string
  loading: boolean
  submitting: boolean
  error: string
  onNameChange: (value: string) => void
  onColorChange: (value: string) => void
  onSortOrderChange: (value: string) => void
  onSubmit: () => void
  onDelete: (group: Group) => void
}

const colors = ['indigo', 'yellow', 'gray-1', 'gray-2', 'gray-3', 'gray-4', 'blue', 'green', 'rose']

export function GroupsView({
  groups,
  name,
  color,
  sortOrder,
  loading,
  submitting,
  error,
  onNameChange,
  onColorChange,
  onSortOrderChange,
  onSubmit,
  onDelete,
}: GroupsViewProps) {
  return (
    <section className="page-section">
      <header className="page-heading">
        <div>
          <p className="eyebrow">GROUPS / ORGANIZE PEOPLE</p>
          <h1>人とのつながりを、<em>分類する。</em></h1>
          <p className="page-lead">あなたのルールでPersonを整理するGroupを作成できます。</p>
        </div>
        <div className="count-badge"><strong>{groups.length}</strong><span>groups</span></div>
      </header>
      <div className="management-grid">
        <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
          <div className="section-kicker">NEW GROUP</div>
          <h2>グループを追加</h2>
          <label htmlFor="group-name">グループ名</label>
          <input id="group-name" value={name} onChange={(event) => onNameChange(event.target.value)} maxLength={255} required placeholder="例：家族、仕事" />
          <div className="form-row">
            <div>
              <label htmlFor="group-color">カラー</label>
              <select id="group-color" value={color} onChange={(event) => onColorChange(event.target.value)}>
                {colors.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="group-sort">並び順</label>
              <input id="group-sort" type="number" min="0" value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value)} />
            </div>
          </div>
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '作成中…' : 'グループを作成'}</button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="panel list-panel">
          <div className="panel-heading"><div><div className="section-kicker">YOUR COLLECTION</div><h2>グループ一覧</h2></div></div>
          {loading ? <p className="muted">読み込み中…</p> : groups.length === 0 ? <p className="empty-state">まだグループがありません。</p> : (
            <div className="group-list">
              {groups.map((group) => (
                <article className="group-row" key={group.id}>
                  <span className={`color-swatch color-${group.color.replace(/[^a-z0-9-]/gi, '-')}`} />
                  <div><strong>{group.name}</strong><small>並び順 {group.sort_order}</small></div>
                  <button className="icon-button danger" type="button" aria-label={`${group.name}を削除`} onClick={() => onDelete(group)}>削除</button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
