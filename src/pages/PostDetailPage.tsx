import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase/client'
import MarkdownContent from '../components/MarkdownContent'

export default function PostDetailPage() {
  const { slug } = useParams()

  const fetchPost = async () => {
    if (!slug) return null
    const { data, error, status } = await supabase
      .from('posts')
      .select('id, title, content, created_at, thumbnail_url, is_published, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[supabase.posts.detail] error', { error, status })
      throw error
    }
    return data
  }

  const { data: post, isLoading, isError } = useQuery({ queryKey: ['post', slug], queryFn: fetchPost, enabled: !!slug })
  const markdownContent = useMemo(() => {
    if (!post) return ''

    return [post.thumbnail_url ? `![${post.title}](${post.thumbnail_url})` : '', post.content ?? '']
      .filter(Boolean)
      .join('\n\n')
  }, [post])

  if (isLoading) return <div>Loading…</div>
  if (isError) return <div>投稿の読み込みでエラーが発生しました。</div>
  if (!post) return <div>投稿が見つかりません。</div>

  return (
    <main className="content-page content-page--post-detail">
      <div className="content-page__inner">
        <p className="post-detail-back-link-wrap">
          <Link to="/posts" className="post-detail-back-link">
            ← 投稿一覧に戻る
          </Link>
        </p>
        <section className="profile-card">
          <div className="profile-card-content">
            <h1 className="post-detail__title">{post.title}</h1>
            <div style={{ marginTop: 24 }}>
              <MarkdownContent content={markdownContent} className="post-detail__markdown" />
            </div>
            <footer style={{ marginTop: 24, color: 'var(--text-muted)' }}>{post.created_at && new Date(post.created_at).toLocaleString()}</footer>
          </div>
        </section>
      </div>
    </main>
  )
}
