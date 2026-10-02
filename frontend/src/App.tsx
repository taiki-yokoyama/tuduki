import { FormEvent, useEffect, useState } from 'react'

type Diary = {
  id: number
  content: string
  diary_date: string
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'
const apiOrigin = apiUrl.replace(/\/api\/?$/, '')

type user = {
  id: number
  email: string
}

function App() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [currentUser, setCurrentUser] = useState<user | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)

  useEffect(() => {
    fetch(apiUrl + '/auth/me', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(async (response) => response.ok ? response.json() : null)
      .then(async (data: { user: user } | null) => {
        if (!data) return
        setCurrentUser(data.user)
        const response = await fetch(apiUrl + '/diaries', { credentials: 'include', headers: { Accept: 'application/json' } })
        if (!response.ok) throw new Error('読み込みに失敗しました')
        setDiaries(await response.json() as Diary[])
      })
      .catch(() => setError('API に接続できません。Docker コンテナが起動しているか確認してください。'))
  }, [])

  async function csrf() {
    await fetch(apiOrigin + '/sanctum/csrf-cookie', { credentials: 'include' })
  }

  function xsrfToken() {
    return document.cookie.split('; ').find((cookie) => cookie.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? ''
  }

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setAuthenticating(true)

    try {
      await csrf()
      const response = await fetch(apiUrl + `/auth/${authMode}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken()),
        },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) throw new Error('認証に失敗しました')
      const data = await response.json() as { user: user }
      setCurrentUser(data.user)
      setPassword('')
      const diariesResponse = await fetch(apiUrl + '/diaries', { credentials: 'include', headers: { Accept: 'application/json' } })
      setDiaries(await diariesResponse.json() as Diary[])
    } catch {
      setError('認証に失敗しました。メールアドレスとパスワードを確認してください。')
    } finally {
      setAuthenticating(false)
    }
  }

  async function signOut() {
    await csrf()
    await fetch(apiUrl + '/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken()) },
    })
    setCurrentUser(null)
    setDiaries([])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(apiUrl + '/diaries', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken()),
        },
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
        {!currentUser ? (
          <form className="diary-form" onSubmit={authenticate}>
            <label htmlFor="email">メールアドレス</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">パスワード</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            <button type="submit" disabled={authenticating}>{authenticating ? '処理中…' : authMode === 'sign-in' ? 'ログインする' : '登録する'}</button>
            <button type="button" onClick={() => setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in')}>
              {authMode === 'sign-in' ? '新規登録はこちら' : 'ログインはこちら'}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        ) : (
          <>
            <p>{currentUser.email} でログイン中</p>
            <button type="button" onClick={signOut}>ログアウト</button>
            <form className="diary-form" onSubmit={submit}>
          <label htmlFor="content">本文</label>
          <textarea id="content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="ここに記録を残す" rows={7} required />
          <button type="submit" disabled={saving}>{saving ? '保存中…' : '記録を保存する'}</button>
          {error && <p className="error">{error}</p>}
            </form>
          </>
        )}

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
