import type { ReactNode } from 'react'
import type { User } from '../../types'

export type DashboardSection = 'diaries' | 'people' | 'groups'

type DashboardViewProps = {
  user: User
  section: DashboardSection
  error: string
  children: ReactNode
  onSectionChange: (section: DashboardSection) => void
  onLogout: () => void
}

const navigation: { key: DashboardSection; label: string; caption: string }[] = [
  { key: 'diaries', label: '日記', caption: 'DIARIES' },
  { key: 'people', label: '人物', caption: 'PEOPLE' },
  { key: 'groups', label: 'グループ', caption: 'GROUPS' },
]

export function DashboardView({
  user,
  section,
  error,
  children,
  onSectionChange,
  onLogout,
}: DashboardViewProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-mark">
            <span className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation"><path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 1 6 17V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M6 7h9.5A2.5 2.5 0 0 1 18 9.5M9 8.5v8" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
            </span>
            <span className="brand-copy"><strong>Tuduki</strong><small>自分と他人を記録する日記</small></span>
          </div>
          <div className="header-actions">
            <span className="header-user">{user.email}</span>
            <button className="header-button" type="button" onClick={onLogout} aria-label="ログアウト">ログアウト</button>
            <button className="new-diary-button" type="button" onClick={() => onSectionChange('diaries')}>＋ <span>新しい日記</span></button>
          </div>
        </div>
        <nav className="tab-nav" aria-label="メインメニュー">
          <div className="header-inner tab-nav-inner">
            {navigation.map((item) => (
              <button
                className={`tab-item ${section === item.key ? 'active' : ''}`}
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
              >
                <span className="tab-icon" aria-hidden="true">{item.key === 'diaries' ? '▤' : item.key === 'people' ? '○' : '▦'}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="content-area">
        {error && <div className="global-error">{error}</div>}
        {children}
      </main>
      <footer className="site-footer">Tuduki — 記録を残す行為を、楽しく。</footer>
    </div>
  )
}
