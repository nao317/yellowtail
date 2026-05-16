import { useQuery } from '@tanstack/react-query'
import { fetchAdminProfile } from '../lib/profile'
import TypeText from '../components/TypeText'
import ContactForm from '../components/ContactForm'

export default function HomePage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['profile', 'admin'],
        queryFn: fetchAdminProfile,
    })

    return (
        <main className="home">
            <section className="profile-hero">
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

                {/* 自己紹介ブロック（白背景） */}
                <section className="profile-card" aria-labelledby="profile-title">
                    <div className="profile-card-content">
                        <h1 id="profile-title">自己紹介</h1>
                        {isLoading && <p>プロフィールを読み込み中です</p>}
                        {isError && (
                            <p role="alert">
                                プロフィールの取得に失敗しました {(error as Error).message}
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

                {/* お問い合わせブロック（自己紹介と同じ白ブロック） */}
                <section className="profile-card" aria-labelledby="contact-title" style={{ marginTop: 24 }}>
                    <div className="profile-card-content">
                        <ContactForm plain />
                    </div>
                </section>
            </section>
        </main>
    )
}
