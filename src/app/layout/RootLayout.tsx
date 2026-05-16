import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../../components/Header'
import { env } from '../../shared/lib/env'
import { hasTurnstileClientVerified } from '../../shared/lib/turnstile-session'

export default function RootLayout() {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const requires = Boolean(env.turnstileSiteKey)
        if (!requires) return

        if (!hasTurnstileClientVerified() && location.pathname !== '/challenge') {
            const next = encodeURIComponent(location.pathname + location.search)
            navigate(`/challenge?next=${next}`, { replace: true })
        }
    }, [location.pathname, location.search, navigate])

    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}
