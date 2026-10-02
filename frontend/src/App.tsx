import { FormEvent, useEffect, useState } from 'react'

type Diary = {
  id: number
  content: string
  diary_date: string
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'

function App() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(apiUrl + '/diaries')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('読み込みに失敗しました')))
      .then(setDiaries)
      .catch(() => setError('API に接続できません。Docker コンテナが起動しているか確認してください。'))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(apiUrl + '/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          content,
          diary_date: new Date().toISOString().slice(0, 10),
        }),
      })

      if (!response.ok) throw new Error('保存に失敗しました')
      const diary = await response.json() as Diary
      setDiaries((current) => [diary, ...current])
      setContent('')
    } catch {
      setError('保存に失敗しました。入力内容と API の状態を確認してください。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">TUDUKI / DAILY NOTES</p>
        <h1>今日の続きを、<em>一行</em>から。</h1>
        <p className="lead">考えたこと、残したいこと。小さな記録を静かに積み重ねます。</p>
      </header>

      <section className="workspace">
        <form className="diary-form" onSubmit={submit}>
          <label htmlFor="content">本文</label>
          <textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="ここに記録を残す" rows={7} required />
          <button type="submit" disabled={saving}>{saving ? '保存中…' : '記録を保存する'}</button>
          {error && <p className="error">{error}</p>}
        </form>

        <section className="diaries" aria-labelledby="diaries-title">
          <div className="section-heading">
            <p className="eyebrow">ARCHIVE</p>
            <h2 id="diaries-title">これまでの日記</h2>
          </div>
          {diaries.length === 0 && !error && <p className="empty">まだ日記がありません。最初の一件を書いてみましょう。</p>}
          <div className="diary-list">
            {diaries.map((diary) => (
              <article className="diary-card" key={diary.id}>
                <time>{diary.diary_date}</time>
                <p>{diary.content}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
