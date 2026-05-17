import { Link } from 'react-router-dom'
import { Home, FileText, PencilLine, LogIn, LogOut } from 'lucide-react'
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
          <Link to="/admin/login" className="liquid-link" aria-label="Admin login">
            <LogIn size={18} />
          </Link>
        )}
        {!isLoading && canManagePosts && (
          <>
            <Link to="/admin/posts/new" className="liquid-link" aria-label="Create post">
              <PencilLine size={18} />
            </Link>
            <Link to="/admin/posts" className="liquid-link" aria-label="Admin posts">
              <FileText size={18} />
            </Link>
            <button type="button" className="liquid-link" onClick={() => void signOut()} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
