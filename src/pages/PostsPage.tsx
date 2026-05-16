import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import { Link } from 'react-router-dom'

type Post = {
  id: string
  title: string
  content?: string
  created_at?: string
  slug?: string
}

async function fetchPosts(): Promise<Post[]> {
  const { data, error, status, statusText } = await supabase
    .from('posts')
    .select('id, title, content, created_at, slug')
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
      const retry = await supabase.from('posts').select('id, title, content, created_at, slug')
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
    <main style={{ padding: 24, paddingTop: 88 }}>
      <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
        {/* top heading removed by design */}

        {isLoading && <p>読み込み中…</p>}
        {isError && <p role="alert">取得エラー: {(error as Error).message}</p>}

        {!isLoading && !isError && posts && (
          <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
            {posts.map((p) => (
              <li key={p.id}>
                <section className="profile-card">
                  <div className="profile-card-content">
                    <h2 style={{ margin: 0 }}>
                      <Link to={`/posts/${encodeURIComponent(p.slug ?? p.id)}`}>{p.title}</Link>
                    </h2>
                    {p.content && <p style={{ margin: '8px 0 0' }}>{p.content}</p>}
                    {p.created_at && <small style={{ color: 'var(--text)', display: 'block', marginTop: 8 }}>{new Date(p.created_at).toLocaleString()}</small>}
                  </div>
                </section>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
