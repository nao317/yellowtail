import { Link } from 'react-router-dom'
import { Home, FileText, PencilLine, LogIn, LayoutGrid, LogOut } from 'lucide-react'
import { useAuth } from '../app/providers/AuthProviders'
import './Header.css'

export default function Header() {
  const { canManagePosts, isLoading, signOut } = useAuth()

  return (
    <header className="liquid-header" aria-label="Main navigation">
      <div className="liquid-header__inner">
        <Link to="/" className="liquid-link" aria-label="Home">
          <Home size={20} />
        </Link>
        <Link to="/posts" className="liquid-link" aria-label="Posts">
          <FileText size={20} />
        </Link>
        {!isLoading && !canManagePosts && (
          <Link to="/admin/login" className="liquid-link liquid-link--button liquid-link--icon" aria-label="管理者ログイン" title="管理者ログイン">
            <LogIn size={18} />
          </Link>
        )}
        {!isLoading && canManagePosts && (
          <>
            <Link to="/admin/posts/new" className="liquid-link liquid-link--button liquid-link--accent liquid-link--icon" aria-label="投稿を作成" title="投稿を作成">
              <PencilLine size={18} />
            </Link>
            <Link to="/admin/posts" className="liquid-link liquid-link--button liquid-link--icon" aria-label="管理画面" title="管理画面">
              <LayoutGrid size={18} />
            </Link>
            <button
              type="button"
              className="liquid-link liquid-link--button liquid-link--ghost liquid-link--icon"
              onClick={() => void signOut()}
              aria-label="ログアウト"
              title="ログアウト"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
