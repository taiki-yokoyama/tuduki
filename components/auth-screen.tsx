'use client';

import { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください。');
      return;
    }

    setSubmitting(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: authError } = await fn(email.trim(), password);

    if (authError) {
      if (authError.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (authError.includes('already registered')) {
        setError('このメールアドレスは既に登録されています。');
      } else {
        setError(authError);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-md bg-yellow flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-ink" strokeWidth={2.5} />
          </div>
          <h1 className="font-logo text-2xl text-ink">Memora</h1>
          <p className="text-xs text-ink-faint mt-1">自分と他人を記録する日記</p>
        </div>

        {/* Form card */}
        <div className="border border-gray-200 rounded-md p-6">
          {/* Tab switch */}
          <div className="flex border-b border-gray-200 mb-5">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px',
                mode === 'signin' ? 'border-yellow text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              )}
            >
              ログイン
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px',
                mode === 'signup' ? 'border-yellow text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              )}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full bg-white border border-gray-300 rounded-sm px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-sm bg-yellow text-ink text-sm font-bold hover:bg-yellow-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  処理中...
                </>
              ) : (
                mode === 'signin' ? 'ログイン' : 'アカウントを作成'
              )}
            </button>
          </form>
        </div>

        <p className="text-xs text-ink-faint text-center mt-4">
          {mode === 'signin' ? 'アカウントがない場合は「新規登録」から作成できます。' : '登録するとすぐに利用を開始できます。'}
        </p>
      </div>
    </div>
  );
}
