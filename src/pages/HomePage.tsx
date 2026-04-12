import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import type { Profile, ProfileRow } from '../features/profile/type'
import Silk from '../components/Silk'
import TypeText from '../components/TypeText'

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
                    <TypeText
                        text={["Hi, there!", "Welcome to my portfolio.", "I'm in my third year at Kyutech"]}
                        typingSpeed={130}
                        pauseDuration={10000}
                        showCursor
                        cursorCharacter="_"
                        cursorClassName="hero-cursor"
                        deletingSpeed={100}
                        cursorBlinkDuration={0.7}
                    />
                </header>
                <section className="profile-card" aria-labelledby="profile-title">
                    <div className="profile-card-content">
                        <h1 id="profile-title">自己紹介</h1>
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
                                    <dt>名前</dt>
                                    <dd>奥村　直</dd>
                                </div>
                                <div>
                                    <dt>ハンドルネーム</dt>
                                    <dd>{data.username}</dd>
                                </div>
                                <div>
                                    <dt>大学・学部・学科</dt>
                                    <dd>九州工業大学情報工学部知的システム工学科</dd>
                                </div>
                                <div>
                                    <dt>所属サークル</dt>
                                    <dd>C3／競技プログラミングサークル／Kyutech Code Lab</dd>
                                </div>
                            </dl>
                        )}
                    </div>
                </section>
            </section>
        </main>
    )
}
