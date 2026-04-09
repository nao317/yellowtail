import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import type { Profile, ProfileRow } from '../features/profile/type'

async function fetchAdminProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
    .from('profiles')
    .select('id, username, role, created_at')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle<ProfileRow>()
    
    if (error) {
        throw new Error(error.message)
    }

    if (!data) {
        return null
    }

    return {
        id: data.id,
        username: data.role,
        role: data.role,
        createdAt: data.created_at,
    }
}

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }).format(new Date(iso))
}

export default function HomePage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['profile', 'admin'],
        queryFn: fetchAdminProfile,
    })

    return (
        <main className="home">
            <section className="profile-card" aria-labelledby="profile-title">
                <h1 id="profile-title">プロフィール</h1>
                {isLoading && <p>プロフィールを読み込み中です</p>}
                {isError && (
                    <p role="alert">
                        プロフィールの取得に失敗しました
                        {' '}
                        {(error as Error).message}
                    </p>
                )}

                {!isLoading && !isError && !data && (
                    <p>表示できるプロフィールがまだありません</p>
                )}
                {!isLoading && !isError && data && (
                    <dl className="profile-grid">
                        <div>
                            <dt>ユーザー名</dt>
                            <dd>{data.username}</dd>   
                        </div>
                        <div>
                            <dt>ロール</dt>
                            <dd>{data.role}</dd>
                        </div>
                        <div>
                            <dt>登録日</dt>
                            <dd>{formatDate(data.createdAt)}</dd>
                        </div>
                    </dl>
                )}
            </section>
        </main>
    )
}
