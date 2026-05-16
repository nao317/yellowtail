import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../app/providers/AuthProviders'

export default function AdminLoginPage() {
	const { signIn, isAdmin, isLoading } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin/posts'
	const [email, setEmail] = useState('country.gentleman.0317@gmail.com')
	const [password, setPassword] = useState('')
	const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	useEffect(() => {
		if (!isLoading && isAdmin) {
			navigate(from, { replace: true })
		}
	}, [from, isAdmin, isLoading, navigate])

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setStatus('submitting')
		setErrorMessage(null)

		try {
			await signIn(email, password)
			navigate(from, { replace: true })
		} catch (error) {
			setErrorMessage((error as Error).message)
		} finally {
			setStatus('idle')
		}
	}

	return (
		<main className="admin-login">
			<section className="admin-login__card">
				<p className="admin-shell__eyebrow">Admin Login</p>
				<h1 className="admin-shell__title">管理者ログイン</h1>
				<p className="admin-login__message">投稿作成は管理者アカウントのみ利用できます。</p>

				<form className="admin-login__form" onSubmit={handleSubmit}>
					<label className="admin-login__field">
						<span>メールアドレス</span>
						<input
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							type="email"
							autoComplete="email"
							required
						/>
					</label>

					<label className="admin-login__field">
						<span>パスワード</span>
						<input
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							type="password"
							autoComplete="current-password"
							required
						/>
					</label>

					<button type="submit" className="admin-login__submit admin-login__submit--icon" disabled={status === 'submitting'}>
						<LogIn size={18} />
						<span>{status === 'submitting' ? 'ログイン中…' : 'ログイン'}</span>
					</button>
				</form>

				{errorMessage && <p className="admin-login__error" role="alert">{errorMessage}</p>}
			</section>
		</main>
	)
}
