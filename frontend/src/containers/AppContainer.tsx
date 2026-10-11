import { useEffect, useState } from 'react'
import { getCurrentUser, ApiError } from '../api/client'
import { signOut } from '../api/resources'
import type { User } from '../types'
import { AuthContainer } from './AuthContainer'
import { DashboardContainer } from './DashboardContainer'

export function AppContainer() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentUser<User>()
      .then(setUser)
      .catch((caught) => {
        if (caught instanceof ApiError && caught.status === 401) return
        setError('APIに接続できません。Dockerコンテナが起動しているか確認してください。')
      })
      .finally(() => setChecking(false))
  }, [])

  async function logout() {
    try {
      await signOut()
    } finally {
      setUser(null)
    }
  }

  if (checking) {
    return <div className="loading-screen">Tudukiを準備しています…</div>
  }

  if (!user) {
    return <AuthContainer onAuthenticated={setUser} />
  }

  return <DashboardContainer user={user} error={error} onLogout={logout} />
}
