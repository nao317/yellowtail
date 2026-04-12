import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import type { Profile, ProfileRow } from '../features/profile/type'
import Silk from '../components/Silk'

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
        username: data.username,
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
            <section className="profile-hero">
                <div className="profile-card-bg" aria-hidden="true">
                    <Silk
                        speed={2.2}
                        scale={1.0}
                        color="#514c5459"
                        noiseIntensity={0.5}
                        rotation={0.6}
                    />
                </div>
                <header className="profile-page-header">
                    <h1>Portfolio</h1>
                </header>
                <section className="profile-card" aria-labelledby="profile-title">
                    <div className="profile-card-content">
                        <h1 id="profile-title">Profile</h1>
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
                                    <dt>ニックネーム</dt>
                                    <dd>{data.username}</dd>
                                </div>
                                <div>
                                    <dt>
                                        このサイトを作った日
                                    </dt>
                                    <dd>{formatDate(data.createdAt)}</dd>
                                </div>
                            </dl>
                        )}
                    </div>
                </section>
            </section>
        </main>
    )
}
