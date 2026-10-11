import type { ChangeEvent, FormEvent } from 'react'
import type { Diary, DiaryImage, Person } from '../../types'

export type DiaryFormState = {
  content: string
  diaryDate: string
  personIds: number[]
  files: File[]
}

type DiaryViewProps = {
  diaries: Diary[]
  people: Person[]
  selectedDiary: Diary | null
  editingId: number | null
  form: DiaryFormState
  personFilter: string
  startDate: string
  endDate: string
  loading: boolean
  submitting: boolean
  imageSubmitting: boolean
  error: string
  onFormChange: (key: keyof DiaryFormState, value: string | number[] | File[]) => void
  onTogglePerson: (personId: number) => void
  onSelectDiary: (diary: Diary) => void
  onEditDiary: (diary: Diary) => void
  onDeleteDiary: (diary: Diary) => void
  onCloseDetail: () => void
  onResetForm: () => void
  onSubmit: () => void
  onAddImage: (file: File) => void
  onDeleteImage: (image: DiaryImage) => void
  onPersonFilterChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onApplyFilters: () => void
}

export function DiaryView({
  diaries,
  people,
  selectedDiary,
  editingId,
  form,
  personFilter,
  startDate,
  endDate,
  loading,
  submitting,
  imageSubmitting,
  error,
  onFormChange,
  onTogglePerson,
  onSelectDiary,
  onEditDiary,
  onDeleteDiary,
  onCloseDetail,
  onResetForm,
  onSubmit,
  onAddImage,
  onDeleteImage,
  onPersonFilterChange,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
}: DiaryViewProps) {
  const fileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    onFormChange('files', files.slice(0, 3))
  }

  return (
    <section className="page-section diary-section">
      <header className="page-heading diary-heading">
        <div>
          <p className="eyebrow">DIARY / YOUR CONTINUING STORY</p>
          <h1>今日の続きを、<em>書き留める。</em></h1>
          <p className="page-lead">気持ちや出来事を、あとから読み返せる形にします。</p>
        </div>
        <div className="count-badge"><strong>{diaries.length}</strong><span>diaries</span></div>
      </header>
      <div className="diary-layout">
        <form className="panel diary-composer" onSubmit={(event: FormEvent) => { event.preventDefault(); onSubmit() }}>
          <div className="section-kicker">{editingId === null ? 'NEW DIARY' : 'EDIT DIARY'}</div>
          <div className="composer-title-row"><h2>{editingId === null ? '今日の記録' : 'Diaryを編集'}</h2>{editingId !== null && <button className="small-link" type="button" onClick={onResetForm}>新規作成へ</button>}</div>
          <label htmlFor="diary-date">日付</label>
          <input id="diary-date" type="date" value={form.diaryDate} onChange={(event) => onFormChange('diaryDate', event.target.value)} required />
          <label htmlFor="diary-content">本文</label>
          <textarea id="diary-content" rows={8} value={form.content} onChange={(event) => onFormChange('content', event.target.value)} placeholder="今日あったこと、考えたこと…" required />
          <label>一緒にいたPerson</label>
          <div className="person-picker">
            {people.length === 0 ? <span className="muted">Personを先に登録してください。</span> : people.map((person) => (
              <button className={`person-option ${form.personIds.includes(person.id) ? 'selected' : ''}`} key={person.id} type="button" onClick={() => onTogglePerson(person.id)}>
                <span className={`avatar avatar-tiny color-${person.avatar_color.replace(/[^a-z0-9-]/gi, '-')}`}>{person.name.slice(0, 1)}</span>{person.name}
              </button>
            ))}
          </div>
          {editingId === null && <>
            <label htmlFor="diary-files">画像（最大3枚）</label>
            <input id="diary-files" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={fileChange} />
            {form.files.length > 0 && <p className="file-hint">{form.files.map((file) => file.name).join('、')}</p>}
          </>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '保存中…' : editingId === null ? 'Diaryを保存' : '変更を保存'}</button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="diary-archive">
          <div className="archive-toolbar">
            <div><div className="section-kicker">ARCHIVE</div><h2>これまでのDiary</h2></div>
            <div className="filter-row">
              <select aria-label="Personで絞り込み" value={personFilter} onChange={(event) => onPersonFilterChange(event.target.value)}>
                <option value="">すべてのPerson</option>
                {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
              <input aria-label="開始日" type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} />
              <span>—</span>
              <input aria-label="終了日" type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} />
              <button className="filter-button" type="button" onClick={onApplyFilters}>絞り込む</button>
            </div>
          </div>
          {loading ? <p className="muted">読み込み中…</p> : diaries.length === 0 ? <p className="empty-state">まだDiaryがありません。</p> : (
            <div className="diary-list">
              {diaries.map((diary) => (
                <article className="diary-card" key={diary.id} onClick={() => onSelectDiary(diary)}>
                  <div className="diary-card-top"><time>{diary.diary_date}</time><span>{diary.images.length > 0 ? `▧ ${diary.images.length}` : ''}</span></div>
                  <p>{diary.content}</p>
                  <div className="diary-card-bottom"><div className="avatar-stack">{diary.people.slice(0, 4).map((person) => <span className={`avatar avatar-tiny color-${person.avatar_color.replace(/[^a-z0-9-]/gi, '-')}`} key={person.id}>{person.name.slice(0, 1)}</span>)}</div><span className="view-link">開く →</span></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedDiary && <DiaryDetailView diary={selectedDiary} imageSubmitting={imageSubmitting} onClose={onCloseDetail} onEdit={onEditDiary} onDelete={onDeleteDiary} onAddImage={onAddImage} onDeleteImage={onDeleteImage} />}
    </section>
  )
}

type DiaryDetailProps = {
  diary: Diary
  imageSubmitting: boolean
  onClose: () => void
  onEdit: (diary: Diary) => void
  onDelete: (diary: Diary) => void
  onAddImage: (file: File) => void
  onDeleteImage: (image: DiaryImage) => void
}

function DiaryDetailView({ diary, imageSubmitting, onClose, onEdit, onDelete, onAddImage, onDeleteImage }: DiaryDetailProps) {
  return (
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label="Diary詳細" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header"><div><div className="section-kicker">DIARY DETAIL</div><time>{diary.diary_date}</time></div><button className="close-button" type="button" onClick={onClose}>×</button></div>
        <p className="detail-content">{diary.content}</p>
        {diary.people.length > 0 && <div className="detail-block"><div className="detail-label">一緒にいたPerson</div><div className="tag-list">{diary.people.map((person) => <span className="tag" key={person.id}>{person.name}</span>)}</div></div>}
        <div className="detail-block"><div className="detail-label">画像</div><div className="image-grid">{diary.images.map((image) => <figure key={image.id}><img src={image.url} alt="Diaryに添付された画像" /><button className="image-remove" type="button" onClick={() => onDeleteImage(image)}>×</button></figure>)}</div>{diary.images.length < 3 && <label className="upload-more">{imageSubmitting ? 'アップロード中…' : '+ 画像を追加'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={imageSubmitting} onChange={(event) => { const file = event.target.files?.[0]; if (file) onAddImage(file); event.target.value = '' }} /></label>}</div>
        <div className="drawer-actions"><button className="secondary-button" type="button" onClick={() => onEdit(diary)}>編集する</button><button className="danger-button" type="button" onClick={() => onDelete(diary)}>削除する</button></div>
      </aside>
    </div>
  )
}
