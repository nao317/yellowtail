import { useNavigate, useLocation } from 'react-router-dom'
import Turnstile from '../components/ui/turnstile'
import { env } from '../shared/lib/env'
import { markTurnstileClientVerified } from '../shared/lib/turnstile-session'
import { isLocalHostName } from '../shared/lib/host'

export default function ChallengePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const next = params.get('next') || '/'
  const isLocalHost = isLocalHostName(window.location.hostname)
  const shouldUseTurnstile = Boolean(env.turnstileEnabled && env.turnstileSiteKey && !isLocalHost)

  async function handleVerify(token: string) {
    try {
      // Verify on server to ensure secret is used
      const res = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 404) {
        markTurnstileClientVerified()
        navigate(next)
        return
      }
      if (!res.ok || !data.success) throw new Error('verification failed')

      markTurnstileClientVerified()

      navigate(next)
    } catch (err) {
      console.error(err)
      alert('Turnstile 検証に失敗しました。再試行してください。')
    }
  }

  return (
    <div
      style={{
        padding: '120px 24px 24px',
        maxWidth: 720,
        margin: '0 auto',
        textAlign: 'center',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <h1>サイト閲覧の確認</h1>
      <p>自動化されたアクセスを防ぐため、簡単な確認をお願いします。</p>
      {shouldUseTurnstile ? (
        <div style={{ marginTop: 20 }}>
          <Turnstile onVerify={handleVerify} />
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          <p>Turnstile はローカル環境では無効です。チェックをスキップして表示します。</p>
        </div>
      )}
    </div>
  )
}
