import { Link } from 'react-router-dom'
import { Home, FileText } from 'lucide-react'
import './Header.css'

export default function Header() {
  return (
    <header className="liquid-header" aria-label="Main navigation">
      <div className="liquid-header__inner">
        <Link to="/" className="liquid-link" aria-label="Home">
          <Home size={20} />
        </Link>
        <Link to="/posts" className="liquid-link" aria-label="Posts">
          <FileText size={20} />
        </Link>
      </div>
    </header>
  )
}
