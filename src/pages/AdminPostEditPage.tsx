import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import type { Post, PostFormValues } from '../features/posts/type'
import { supabase } from '../lib/supabase/client'

function normalizeSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

export default function AdminPostEditPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [form, setForm] = useState<PostFormValues | null>(null)

	const fetchPost = async (): Promise<Post | null> => {
		if (!id) return null

		const { data, error } = await supabase
			.from('posts')
			.select('id, title, slug, content, thumbnail_url, is_published, created_at, updated_at, published_at')
			.eq('id', id)
			.maybeSingle()

		if (error) {
			throw new Error(error.message)
		}

		return data ?? null
	}

	const { data: post, isLoading, isError, error } = useQuery({
		queryKey: ['admin-post', id],
		queryFn: fetchPost,
		enabled: Boolean(id),
	})

	const initialForm = useMemo<PostFormValues | null>(() => {
		if (!post) return null

		return {
			title: post.title ?? '',
			slug: post.slug ?? '',
			content: post.content ?? '',
			thumbnail_url: post.thumbnail_url ?? '',
			is_published: Boolean(post.is_published),
		}
	}, [post])

	useEffect(() => {
		if (initialForm) {
			setForm(initialForm)
		}
	}, [initialForm])

	const updatePost = useMutation({
		mutationFn: async (values: PostFormValues) => {
			if (!id) throw new Error('投稿IDが見つかりません')

			const now = new Date().toISOString()
			const slug = values.slug.trim() || normalizeSlug(values.title)
			const payload = {
				title: values.title.trim(),
				slug,
				content: values.content.trim(),
				thumbnail_url: values.thumbnail_url.trim() || null,
				is_published: values.is_published,
				published_at: values.is_published ? post?.published_at ?? now : null,
				updated_at: now,
			}

			const { error } = await supabase.from('posts').update(payload).eq('id', id)
			if (error) {
				throw new Error(error.message)
			}
		},
		onSuccess: () => {
			navigate('/admin/posts')
		},
	})

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setErrorMessage(null)

		if (!form) return

		try {
			await updatePost.mutateAsync(form)
		} catch (submitError) {
			setErrorMessage((submitError as Error).message)
		}
	}

	if (isLoading) {
		return <p>投稿を読み込み中です…</p>
	}

	if (isError) {
		return <p role="alert">{(error as Error).message}</p>
	}

	if (!post || !form) {
		return <p>投稿が見つかりません。</p>
	}

	return (
		<section className="post-editor">
			<div>
				<p className="admin-shell__eyebrow">Edit Post</p>
				<h2 style={{ margin: 0 }}>{post.title}</h2>
			</div>

			<form className="post-editor__grid" onSubmit={handleSubmit}>
				<label className="post-editor__field">
					<span>タイトル</span>
					<input
						value={form.title}
						onChange={(event) => setForm((current) => (current ? { ...current, title: event.target.value } : current))}
						required
					/>
				</label>

				<label className="post-editor__field">
					<span>スラッグ</span>
					<input
						value={form.slug}
						onChange={(event) => setForm((current) => (current ? { ...current, slug: event.target.value } : current))}
					/>
				</label>

				<label className="post-editor__field">
					<span>サムネイルURL</span>
					<input
						value={form.thumbnail_url}
						onChange={(event) => setForm((current) => (current ? { ...current, thumbnail_url: event.target.value } : current))}
					/>
				</label>

				<label className="post-editor__field">
					<span>本文</span>
					<textarea
						value={form.content}
						onChange={(event) => setForm((current) => (current ? { ...current, content: event.target.value } : current))}
						required
					/>
				</label>

				<label className="post-editor__field post-editor__field--inline">
					<input
						type="checkbox"
						checked={form.is_published}
						onChange={(event) => setForm((current) => (current ? { ...current, is_published: event.target.checked } : current))}
					/>
					<span>公開する</span>
				</label>

				<div className="post-editor__status">
					<button type="submit" className="post-editor__submit" disabled={updatePost.isPending}>
						{updatePost.isPending ? '保存中…' : '保存する'}
					</button>
					{errorMessage && <p role="alert" className="post-editor__hint">{errorMessage}</p>}
				</div>
			</form>
		</section>
	)
}
