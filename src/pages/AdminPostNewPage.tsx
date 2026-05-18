import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ImagePlus } from 'lucide-react'
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
	const [file, setFile] = useState<File | null>(null)
	const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
	const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<Array<{ file: File; url: string }>>([])

	useEffect(() => {
		if (!file) {
			setFilePreviewUrl(null)
			return
		}

		const previewUrl = URL.createObjectURL(file)
		setFilePreviewUrl(previewUrl)
		return () => URL.revokeObjectURL(previewUrl)
	}, [file])

	useEffect(() => {
		if (attachmentFiles.length === 0) {
			setAttachmentPreviewUrls([])
			return
		}

		const previewUrls = attachmentFiles.map((attachmentFile) => ({ file: attachmentFile, url: URL.createObjectURL(attachmentFile) }))
		setAttachmentPreviewUrls(previewUrls)
		return () => {
			previewUrls.forEach(({ url }) => URL.revokeObjectURL(url))
		}
	}, [attachmentFiles])

	async function uploadFileForPost(id: string, file: File) {
		const bucket = 'posts'
		const path = `posts/${id}/${Date.now()}_${file.name}`
		const { error } = await supabase.storage.from(bucket).upload(path, file)
		if (error) {
			if (error.message.includes('row-level security policy')) {
				throw new Error('画像アップロードに失敗しました。Supabase Storage の posts バケットで INSERT ポリシーを設定してください。')
			}
			throw error
		}
		const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
		return urlData.publicUrl
	}

	async function uploadFilesForPost(id: string, files: File[]) {
		return Promise.all(files.map(async (attachmentFile) => ({ file: attachmentFile, url: await uploadFileForPost(id, attachmentFile) })))
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setErrorMessage(null)

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		const slug = form.slug.trim() || normalizeSlug(form.title)
		setIsUploading(true)

		try {
			let thumbnail: string | null = form.thumbnail_url.trim() || null
			let content = form.content.trim()
			if (file) {
				thumbnail = await uploadFileForPost(id, file)
			}

			if (attachmentFiles.length > 0) {
				const uploadedAttachments = await uploadFilesForPost(id, attachmentFiles)
				content = [content, ...uploadedAttachments.map(({ url }, index) => `![添付画像 ${index + 1}](${url})`)]
					.filter(Boolean)
					.join('\n\n')
			}

			const payload = {
				id,
				title: form.title.trim(),
				slug,
				content,
				thumbnail_url: thumbnail,
				is_published: form.is_published,
				published_at: form.is_published ? now : null,
				created_at: now,
				updated_at: now,
			}

			const { error } = await supabase.from('posts').insert(payload)
			if (error) throw error

			navigate(`/admin/posts/${id}/edit`, { replace: true })
		} catch (err) {
			setErrorMessage((err as Error).message)
		} finally {
			setIsUploading(false)
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
					<span>サムネイル (画像ファイルを選択 または URL)</span>
					<div className="post-editor__upload-row">
						<label className="post-editor__upload-button">
							<ImagePlus size={16} aria-hidden="true" />
							<span>{file ? '画像を変更' : '画像を挿入'}</span>
							<input className="post-editor__file-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
						</label>
						{file && <span className="post-editor__file-name">{file.name}</span>}
					</div>
					<input placeholder="または画像URLを直接入力" value={form.thumbnail_url} onChange={(event) => setForm((current) => ({ ...current, thumbnail_url: event.target.value }))} />
					{(filePreviewUrl || form.thumbnail_url.trim()) && (
						<img className="post-editor__thumbnail-preview" src={filePreviewUrl ?? form.thumbnail_url.trim()} alt="サムネイルプレビュー" />
					)}
				</label>

				<label className="post-editor__field">
					<span>添付画像 (複数可)</span>
					<div className="post-editor__upload-row">
						<label className="post-editor__upload-button">
							<ImagePlus size={16} aria-hidden="true" />
							<span>{attachmentFiles.length > 0 ? `${attachmentFiles.length}枚選択中` : '画像を複数選択'}</span>
							<input className="post-editor__file-input" type="file" accept="image/*" multiple onChange={(event) => setAttachmentFiles(Array.from(event.target.files ?? []))} />
						</label>
					</div>
					{attachmentPreviewUrls.length > 0 && (
						<div className="post-editor__attachment-preview-grid">
							{attachmentPreviewUrls.map(({ file: attachmentFile, url }) => (
								<div key={`${attachmentFile.name}-${attachmentFile.lastModified}`} className="post-editor__attachment-preview-item">
									<img className="post-editor__attachment-preview-image" src={url} alt={attachmentFile.name} />
									<span>{attachmentFile.name}</span>
								</div>
							))}
						</div>
					)}
					<p className="post-editor__hint">保存すると本文の末尾に Markdown 画像として追加されます。</p>
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
					<button type="submit" className="post-editor__submit" disabled={isUploading}>
						{isUploading ? '作成中…' : '作成する'}
					</button>
					{errorMessage && <p role="alert" className="post-editor__hint">{errorMessage}</p>}
				</div>
			</form>
		</section>
	)
}
