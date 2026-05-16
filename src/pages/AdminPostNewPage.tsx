import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { PostFormValues } from '../features/posts/type'
import { supabase } from '../lib/supabase/client'

function normalizeSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

export default function AdminPostNewPage() {
	const navigate = useNavigate()
	const [form, setForm] = useState<PostFormValues>({
		title: '',
		slug: '',
		content: '',
		thumbnail_url: '',
		is_published: false,
	})
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const createPost = useMutation({
		mutationFn: async (values: PostFormValues) => {
			const now = new Date().toISOString()
			const id = crypto.randomUUID()
			const slug = values.slug.trim() || normalizeSlug(values.title)
			const payload = {
				id,
				title: values.title.trim(),
				slug,
				content: values.content.trim(),
				thumbnail_url: values.thumbnail_url.trim() || null,
				is_published: values.is_published,
				published_at: values.is_published ? now : null,
				created_at: now,
				updated_at: now,
			}

			const { error } = await supabase.from('posts').insert(payload)
			if (error) {
				throw new Error(error.message)
			}

			return { id }
		},
		onSuccess: (data) => {
			navigate(`/admin/posts/${data.id}/edit`, { replace: true })
		},
	})

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setErrorMessage(null)

		try {
			await createPost.mutateAsync(form)
		} catch (error) {
			setErrorMessage((error as Error).message)
		}
	}

	return (
		<section className="post-editor">
			<div>
				<p className="admin-shell__eyebrow">New Post</p>
				<h2 style={{ margin: 0 }}>投稿を作成</h2>
			</div>

			<form className="post-editor__grid" onSubmit={handleSubmit}>
				<label className="post-editor__field">
					<span>タイトル</span>
					<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
				</label>

				<label className="post-editor__field">
					<span>スラッグ</span>
					<input
						value={form.slug}
						onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
						placeholder="空欄ならタイトルから自動生成"
					/>
				</label>

				<label className="post-editor__field">
					<span>サムネイルURL</span>
					<input value={form.thumbnail_url} onChange={(event) => setForm((current) => ({ ...current, thumbnail_url: event.target.value }))} />
				</label>

				<label className="post-editor__field">
					<span>本文</span>
					<textarea value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} required />
				</label>

				<label className="post-editor__field post-editor__field--inline">
					<input
						type="checkbox"
						checked={form.is_published}
						onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))}
					/>
					<span>公開する</span>
				</label>

				<div className="post-editor__status">
					<button type="submit" className="post-editor__submit" disabled={createPost.isPending}>
						{createPost.isPending ? '作成中…' : '作成する'}
					</button>
					{errorMessage && <p role="alert" className="post-editor__hint">{errorMessage}</p>}
				</div>
			</form>
		</section>
	)
}
