import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase/client'

const ADMIN_EMAIL = 'country.gentleman.0317@gmail.com'

type AuthContextValue = {
	session: Session | null
	user: User | null
	isLoading: boolean
	isAdmin: boolean
	canManagePosts: boolean
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type Props = {
	children: ReactNode
}

export function AuthProviders({ children }: Props) {
	const [session, setSession] = useState<Session | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		let isActive = true

		supabase.auth.getSession().then(({ data }) => {
			if (!isActive) return
			setSession(data.session ?? null)
			setIsLoading(false)
		})

		const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession)
			setIsLoading(false)
		})

		return () => {
			isActive = false
			listener.subscription.unsubscribe()
		}
	}, [])

	const value = useMemo<AuthContextValue>(() => {
		const user = session?.user ?? null
		const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL

		return {
			session,
			user,
			isLoading,
			isAdmin,
			canManagePosts: Boolean(session && isAdmin),
			signIn: async (email: string, password: string) => {
				const { data, error } = await supabase.auth.signInWithPassword({ email, password })

				if (error) {
					throw new Error(error.message)
				}

				const signedInEmail = data.user?.email?.toLowerCase()
				if (signedInEmail !== ADMIN_EMAIL) {
					await supabase.auth.signOut()
					throw new Error('管理者アカウントではありません')
				}
			},
			signOut: async () => {
				const { error } = await supabase.auth.signOut()
				if (error) {
					throw new Error(error.message)
				}
			},
		}
	}, [isLoading, session])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error('useAuth must be used within AuthProviders')
	}

	return context
}
