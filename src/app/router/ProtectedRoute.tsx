import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProviders'

export default function ProtectedRoute() {
	const { canManagePosts, isLoading } = useAuth()
	const location = useLocation()

	if (isLoading) {
		return <div style={{ padding: '120px 24px', textAlign: 'center' }}>管理者認証を確認しています…</div>
	}

	if (!canManagePosts) {
		return <Navigate to="/admin/login" replace state={{ from: location }} />
	}

	return <Outlet />
}
