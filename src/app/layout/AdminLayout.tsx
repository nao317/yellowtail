import { Link, Outlet } from 'react-router-dom'
import { FilePenLine, List, LogOut } from 'lucide-react'
import { useAuth } from '../providers/AuthProviders'

export default function AdminLayout() {
	const { signOut } = useAuth()

	return (
		<main className="admin-shell">
			<section className="admin-shell__panel">
				<header className="admin-shell__header">
					<div>
						<p className="admin-shell__eyebrow">Admin</p>
						<h1 className="admin-shell__title">投稿管理</h1>
						<p className="admin-shell__subtitle">管理者としてログイン中です</p>
					</div>
					<div className="admin-shell__actions">
						<Link to="/admin/posts" className="admin-shell__button admin-shell__button--ghost admin-shell__button--icon" aria-label="投稿一覧" title="投稿一覧">
							<List size={18} />
						</Link>
						<Link to="/admin/posts/new" className="admin-shell__button admin-shell__button--icon" aria-label="投稿を作成" title="投稿を作成">
							<FilePenLine size={18} />
						</Link>
						<button
							type="button"
							className="admin-shell__button admin-shell__button--ghost admin-shell__button--icon"
							onClick={() => void signOut()}
							aria-label="ログアウト"
							title="ログアウト"
						>
							<LogOut size={18} />
						</button>
					</div>
				</header>

				<Outlet />
			</section>
		</main>
	)
}
