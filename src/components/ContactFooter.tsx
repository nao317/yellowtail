import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import Aurora from './Aurora'
import './ContactFooter.css'

type ContactForm = {
  name: string
  email: string
  message: string
}

export default function ContactFooter() {
  const [state, handleFormspreeSubmit] = useForm('xpqkakkg')

  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
  })
  const isSubmitting = state.submitting

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim() && form.email.trim() && form.message.trim())
  }, [form.email, form.message, form.name])

  const subject = `お問い合わせ: ${form.name.trim() || '匿名ユーザー'}`

  useEffect(() => {
    if (state.succeeded) {
      setForm({ name: '', email: '', message: '' })
    }
  }, [state.succeeded])

  function hasErrors(): boolean {
    if (!state.errors) {
      return false
    }
    return Array.isArray(state.errors) ? state.errors.length > 0 : true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit || isSubmitting) {
      return
    }

    await handleFormspreeSubmit(event)
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

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-form__field" htmlFor="contact-name">
            お名前
            <input
              id="contact-name"
              name="name"
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
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </label>
          <ValidationError className="contact-form__status contact-form__status--error" field="email" errors={state.errors} />

          <label className="contact-form__field" htmlFor="contact-message">
            お問い合わせ内容
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
            />
          </label>
          <ValidationError className="contact-form__status contact-form__status--error" field="message" errors={state.errors} />

          <input type="hidden" name="_subject" value={subject} />
          <input type="hidden" name="_replyto" value={form.email} />

          <button className="contact-form__submit" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? '送信中...' : '送信する'}
          </button>

          {isSubmitting && (
            <p className="contact-form__status contact-form__status--sending" role="status" aria-live="polite">
              送信中です...
            </p>
          )}

          {state.succeeded && (
            <p className="contact-form__status contact-form__status--success" role="status" aria-live="polite">
              送信が完了しました。確認後に返信します。
            </p>
          )}

          {!isSubmitting && !state.succeeded && hasErrors() && (
            <p className="contact-form__status contact-form__status--error" role="status" aria-live="polite">
              送信に失敗しました。時間をおいて再試行してください。
            </p>
          )}
        </form>
      </div>
    </footer>
  )
}
