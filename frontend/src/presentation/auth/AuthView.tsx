import type { FormEvent } from 'react'

type AuthMode = 'sign-in' | 'sign-up'

type AuthViewProps = {
  mode: AuthMode
  email: string
  password: string
  error: string
  submitting: boolean
  onModeChange: (mode: AuthMode) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function AuthView({
  mode,
  email,
  password,
  error,
  submitting,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthViewProps) {
  const signInMode = mode === 'sign-in'

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation"><path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 1 6 17V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M6 7h9.5A2.5 2.5 0 0 1 18 9.5M9 8.5v8" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
          </span>
          <h1>Tuduki</h1>
          <p>自分と他人を記録する日記</p>
        </div>
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="auth-tabs" role="tablist" aria-label="認証メニュー">
            <button className={signInMode ? 'active' : ''} type="button" onClick={() => { onModeChange('sign-in') }}>
              ログイン
            </button>
            <button className={!signInMode ? 'active' : ''} type="button" onClick={() => { onModeChange('sign-up') }}>
              新規登録
            </button>
          </div>
          <div className="auth-fields">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              autoComplete={signInMode ? 'current-password' : 'new-password'}
              minLength={8}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="8文字以上"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? '処理中…' : signInMode ? 'ログイン' : 'アカウントを作成'}
          </button>
        </form>
        <p className="auth-hint">{signInMode ? 'アカウントがない場合は「新規登録」から作成できます。' : '登録するとすぐに利用を開始できます。'}</p>
      </div>
    </main>
  )
}
