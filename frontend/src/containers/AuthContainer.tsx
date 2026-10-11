import { FormEvent, useState } from 'react'
import { ApiError } from '../api/client'
import { signIn, signUp } from '../api/resources'
import type { User } from '../types'
import { AuthView } from '../presentation/auth/AuthView'

type AuthMode = 'sign-in' | 'sign-up'

type AuthContainerProps = {
  onAuthenticated: (user: User) => void
}

export function AuthContainer({ onAuthenticated }: AuthContainerProps) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = mode === 'sign-in'
        ? await signIn(email, password)
        : await signUp(email, password)
      setPassword('')
      onAuthenticated(user)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'APIに接続できませんでした。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthView
      mode={mode}
      email={email}
      password={password}
      error={error}
      submitting={submitting}
      onModeChange={setMode}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
    />
  )
}
