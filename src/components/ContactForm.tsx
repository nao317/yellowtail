import { useState } from 'react'
import { supabase } from '../lib/supabase/client'
import Turnstile from './ui/turnstile'
import { env } from '../shared/lib/env'
import './ContactForm.css'

type ContactFormProps = {
    plain?: boolean
}

export default function ContactForm({ plain = false }: ContactFormProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('sending')
        setErrorMsg(null)

        const requiresTurnstile = Boolean(env.turnstileSiteKey)
        if (requiresTurnstile && !turnstileToken) {
            setStatus('error')
            setErrorMsg('Turnstileの検証が完了していません。')
            return
        }

        try {
            if (requiresTurnstile) {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message, token: turnstileToken }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok || !data.success) {
                    throw new Error(data?.error || 'サーバ送信に失敗しました')
                }
            } else {
                const { error } = await supabase.from('contacts').insert({ name, email, message })
                if (error) throw error
            }
            setStatus('success')
            setName('')
            setEmail('')
            setMessage('')
            setTurnstileToken(null)
        } catch (err) {
            setStatus('error')
            setErrorMsg((err as Error).message)
        }
    }

    return (
        <form
            className={plain ? 'contact-form contact-form--plain' : 'contact-form'}
            onSubmit={handleSubmit}
            aria-labelledby="contact-title"
        >
            {!plain && <div className="contact-form-inner">
                <h2 id="contact-title">お問い合わせ</h2>
            </div>}

            {plain && <h3 id="contact-title" className="contact-inline-title">お問い合わせ</h3>}

            <label>
                <span className="label-text">お名前</span>
                <input value={name} onChange={e => setName(e.target.value)} required />
            </label>

            <label>
                <span className="label-text">メールアドレス</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>

            <label>
                <span className="label-text">メッセージ</span>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required />
            </label>

            <div className="contact-actions">
                <button type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? '送信中...' : '送信する'}
                </button>
                {status === 'success' && <p className="success">送信が完了しました。ありがとうございました。</p>}
                {status === 'error' && <p role="alert" className="error">送信に失敗しました: {errorMsg}</p>}
            </div>
            <div style={{ marginTop: 12 }}>
                <Turnstile onVerify={(token) => setTurnstileToken(token)} />
            </div>
        </form>
    )
}
