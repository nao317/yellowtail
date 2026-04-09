import { Link, Outlet } from 'react-router-dom'

export default function RootLayout() {
    return (
        <>
            <header style={{ borderBottom: '1px solid #ddd', padding: '12px 20px' }}>
                <nav style={{ display: 'flex', gap: 12 }}>
                    <Link to="/">Home</Link>
                    <Link to="/posts">Posts</Link>
                </nav>
            </header>

            <Outlet />
        </>
    )
}
