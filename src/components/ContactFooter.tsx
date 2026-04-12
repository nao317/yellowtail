import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Aurora from './Aurora'
import './ContactFooter.css'

type ContactStatus = 'idle' | 'sending' | 'success' | 'error'

type ContactForm = {
  name: string
  email: string
  message: string
}

function readOptionalEnv(name: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[name]
  return value?.trim() ?? ''
}

export default function ContactFooter() {
  const endpoint = readOptionalEnv('VITE_CONTACT_FORM_ENDPOINT')

  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<ContactStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const isSubmitting = status === 'sending'

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim() && form.email.trim() && form.message.trim())
  }, [form.email, form.message, form.name])

  const subject = `お問い合わせ: ${form.name.trim() || '匿名ユーザー'}`

  async function sendByEndpoint() {
    if (!endpoint) {
      throw new Error('送信先エンドポイントが未設定です')
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        message: form.message,
        _subject: subject,
        _replyto: form.email,
      }),
    })

    if (!response.ok) {
      throw new Error('送信APIからエラーが返されました')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit || isSubmitting) {
      return
    }

    setStatus('sending')
    setStatusMessage('送信中です...')

    try {
      await sendByEndpoint()
      setStatus('success')
      setStatusMessage('送信が完了しました。確認後に返信します。')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
      if (!endpoint) {
        setStatusMessage('送信設定が未完了です。管理者にお問い合わせください。')
        return
      }

      setStatusMessage('送信に失敗しました。時間をおいて再試行してください。')
    }
  }

  return (
    <footer className="contact-footer" aria-labelledby="contact-footer-title">
      <div className="contact-footer__aurora" aria-hidden="true">
        <Aurora
          colorStops={['#0e0103', '#041324', '#6b5b7a']}
          amplitude={0.85}
          blend={0.4}
          speed={0.8}
          maxDpr={1.4}
          mobileMaxDpr={0.9}
          desktopFps={48}
          mobileFps={24}
          pauseWhenOffscreen
        />
      </div>
      <div className="contact-footer__inner">
        <h2 id="contact-footer-title">お問い合わせ</h2>
        <p className="contact-footer__lead">
          案件のご相談、共同開発のご連絡は下のフォームからどうぞ。
        </p>
        {!endpoint && (
          <p className="contact-footer__notice" role="alert">
            現在このフォームは送信設定が未完了です。管理者が設定後に利用できます。
          </p>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-form__field" htmlFor="contact-name">
            お名前
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              autoComplete="name"
              required
            />
          </label>

          <label className="contact-form__field" htmlFor="contact-email">
            メールアドレス
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </label>

          <label className="contact-form__field" htmlFor="contact-message">
            お問い合わせ内容
            <textarea
              id="contact-message"
              rows={6}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
            />
          </label>

          <button className="contact-form__submit" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? '送信中...' : '送信する'}
          </button>

          {status !== 'idle' && (
            <p className={`contact-form__status contact-form__status--${status}`} role="status" aria-live="polite">
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </footer>
  )
}
