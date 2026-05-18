import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import { Link } from 'react-router-dom'
import MarkdownContent from '../components/MarkdownContent'

type Post = {
  id: string
  title: string
  content?: string
  created_at?: string
  slug?: string
  thumbnail_url?: string | null
}

async function fetchPosts(): Promise<Post[]> {
  const { data, error, status, statusText } = await supabase
    .from('posts')
    .select('id, title, content, created_at, slug, thumbnail_url')
    .order('created_at', { ascending: false })

  if (error) {
    // Log full error for debugging and include response fields in thrown error
    // so the UI / console shows PostgREST details (column missing, policy, etc.)
    // eslint-disable-next-line no-console
    console.error('[supabase.posts] error', { error, status, statusText, errorJson: JSON.stringify(error) })

    // If server rejects the order clause (400), try again without ordering to help isolate the issue.
    if (status === 400) {
      // eslint-disable-next-line no-console
      console.warn('[supabase.posts] retrying without order due to 400')
      const retry = await supabase.from('posts').select('id, title, content, created_at, slug, thumbnail_url')
      if (retry.error) {
        console.error('[supabase.posts] retry error', { retry })
        const msg = `${retry.error.message || 'Unknown error'} (status=${retry.status})`
        throw new Error(msg)
      }
      return retry.data ?? []
    }

    const msg = `${error.message || 'Unknown error'} (status=${status})` + (error.details ? `: ${error.details}` : '')
    throw new Error(msg)
  }

  return data ?? []
}

export default function PostsPage() {
  const { data: posts, isLoading, isError, error } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })

  return (
    <main className="home content-page content-page--posts">
      <section className="profile-hero">
        <div className="content-page__inner">
          {/* top heading removed by design */}

          {isLoading && <p>読み込み中…</p>}
          {isError && <p role="alert">取得エラー: {(error as Error).message}</p>}

          {!isLoading && !isError && posts && (
            <ul className="posts-list">
              {posts.map((p) => (
                <li key={p.id}>
                  <section className="profile-card">
                    <div className="profile-card-content">
                      {p.thumbnail_url && (
                        <Link className="posts-list__thumb-link" to={`/posts/${encodeURIComponent(p.slug ?? p.id)}`}>
                          <img className="posts-list__thumb" src={p.thumbnail_url} alt={`${p.title} のサムネイル`} loading="lazy" />
                        </Link>
                      )}
                      <h2 className="posts-list__title">
                        <Link to={`/posts/${encodeURIComponent(p.slug ?? p.id)}`}>{p.title}</Link>
                      </h2>
                      {p.content && (
                        <div className="posts-list__preview">
                          <MarkdownContent content={p.content} preview />
                        </div>
                      )}
                      {p.created_at && <small style={{ color: 'var(--text)', display: 'block', marginTop: 8 }}>{new Date(p.created_at).toLocaleString()}</small>}
                    </div>
                  </section>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
