import { FormEvent, useEffect, useState } from 'react'

type Entry = {
  id: number
  title: string
  body: string
  written_at: string
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${apiUrl}/entries`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('読み込みに失敗しました')))
      .then(setEntries)
      .catch(() => setError('API に接続できません。Docker コンテナが起動しているか確認してください。'))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`${apiUrl}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          title,
          body,
          written_at: new Date().toISOString().slice(0, 10),
        }),
      })

      if (!response.ok) throw new Error('保存に失敗しました')
      const entry = await response.json() as Entry
      setEntries((current) => [entry, ...current])
      setTitle('')
      setBody('')
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
        <form className="entry-form" onSubmit={submit}>
          <label htmlFor="title">タイトル</label>
          <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="今日の気づき" required maxLength={120} />
          <label htmlFor="body">本文</label>
          <textarea id="body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="ここに記録を残す" rows={7} required />
          <button type="submit" disabled={saving}>{saving ? '保存中…' : '記録を保存する'}</button>
          {error && <p className="error">{error}</p>}
        </form>

        <section className="entries" aria-labelledby="entries-title">
          <div className="section-heading">
            <p className="eyebrow">ARCHIVE</p>
            <h2 id="entries-title">これまでの記録</h2>
          </div>
          {entries.length === 0 && !error && <p className="empty">まだ記録がありません。最初の一件を書いてみましょう。</p>}
          <div className="entry-list">
            {entries.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <time>{entry.written_at}</time>
                <h3>{entry.title}</h3>
                <p>{entry.body}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
