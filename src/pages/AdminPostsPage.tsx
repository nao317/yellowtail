import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { Post } from '../features/posts/type'
import { supabase } from '../lib/supabase/client'

async function fetchAdminPosts(): Promise<Post[]> {
	const { data, error } = await supabase
		.from('posts')
		.select('id, title, slug, content, excerpt, thumbnail_url, is_published, created_at, updated_at, published_at')
		.order('created_at', { ascending: false })

	if (error) {
		throw new Error(error.message)
	}

	return data ?? []
}

export default function AdminPostsPage() {
	const { data: posts, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['admin-posts'],
		queryFn: fetchAdminPosts,
	})

	return (
		<section className="admin-posts">
			{isLoading && <p>投稿を読み込み中です…</p>}
			{isError && <p role="alert">{(error as Error).message}</p>}

			{!isLoading && !isError && posts?.length === 0 && <p>投稿がまだありません。</p>}

			{!isLoading && !isError && posts && posts.length > 0 && posts.map((post) => (
				<article key={post.id} className="admin-posts__item">
					<header>
						<h2 style={{ margin: 0 }}>{post.title}</h2>
						<div className="admin-posts__meta">
							<span>{post.slug ?? post.id}</span>
							<span>{post.is_published ? '公開中' : '下書き'}</span>
							{post.created_at && <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString()}</time>}
						</div>
					</header>

					{post.excerpt && <p>{post.excerpt}</p>}

					<div className="admin-posts__actions">
						<Link to={`/admin/posts/${post.id}/edit`} className="admin-posts__link">
							編集
						</Link>
						<Link to={`/posts/${encodeURIComponent(post.slug ?? post.id)}`} className="admin-posts__link">
							公開ページ
						</Link>
						<button type="button" className="admin-posts__link admin-posts__danger" onClick={() => void refetch()}>
							更新
						</button>
					</div>
				</article>
			))}
		</section>
	)
}
