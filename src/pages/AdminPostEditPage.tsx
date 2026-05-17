import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
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
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const filePreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  const fetchPost = async (): Promise<Post | null> => {
    if (!id) return null
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, content, thumbnail_url, is_published, created_at, updated_at, published_at')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ?? null
  }

  const { data: post, isLoading, isError, error } = useQuery({ queryKey: ['admin-post', id], queryFn: fetchPost, enabled: Boolean(id) })

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
    if (initialForm) setForm(initialForm)
  }, [initialForm])

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    }
  }, [filePreviewUrl])

  const updatePost = useMutation({
    mutationFn: async (values: PostFormValues) => {
      if (!id) throw new Error('投稿IDが見つかりません')
      const now = new Date().toISOString()
      const slug = values.slug.trim() || normalizeSlug(values.title)
      const payload = {
        title: values.title.trim(),
        slug,
        content: values.content.trim(),
        thumbnail_url: values.thumbnail_url?.trim() || null,
        is_published: values.is_published,
        published_at: values.is_published ? post?.published_at ?? now : null,
        updated_at: now,
      }
      const { error } = await supabase.from('posts').update(payload).eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => navigate('/admin/posts'),
  })

  async function uploadFileForPost(id: string, file: File) {
    const bucket = 'posts'
    const path = `posts/${id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from(bucket).upload(path, file)
    if (error) throw error
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    if (!form) return

    setIsUploading(true)
    try {
      let thumbnail = form.thumbnail_url.trim() || null
      if (file && id) {
        try {
          thumbnail = await uploadFileForPost(id, file)
        } catch (err) {
          console.error('upload error', err)
        }
      }

      await updatePost.mutateAsync({ ...form, thumbnail_url: thumbnail ?? '' })
    } catch (submitError) {
      setErrorMessage((submitError as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!window.confirm('この投稿を削除してもよろしいですか？この操作は取り消せません。')) return

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      alert('削除に失敗しました: ' + error.message)
      return
    }
    navigate('/admin/posts')
  }

  if (isLoading) return <p>投稿を読み込み中です…</p>
  if (isError) return <p role="alert">{(error as Error).message}</p>
  if (!post || !form) return <p>投稿が見つかりません。</p>

  return (
    <section className="post-editor">
      <div>
        <p className="admin-shell__eyebrow">Edit Post</p>
        <h2 style={{ margin: 0 }}>{post.title}</h2>
      </div>

      <form className="post-editor__grid" onSubmit={handleSubmit}>
        <label className="post-editor__field">
          <span>タイトル</span>
          <input value={form.title} onChange={(e) => setForm((c) => (c ? { ...c, title: e.target.value } : c))} required />
        </label>

        <label className="post-editor__field">
          <span>スラッグ</span>
          <input value={form.slug} onChange={(e) => setForm((c) => (c ? { ...c, slug: e.target.value } : c))} />
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
          <input value={form.thumbnail_url} onChange={(e) => setForm((c) => (c ? { ...c, thumbnail_url: e.target.value } : c))} placeholder="または画像URLを直接入力" />
          {(filePreviewUrl || form.thumbnail_url.trim()) && (
            <img className="post-editor__thumbnail-preview" src={filePreviewUrl ?? form.thumbnail_url.trim()} alt="サムネイルプレビュー" />
          )}
        </label>

        <label className="post-editor__field">
          <span>本文</span>
          <textarea value={form.content} onChange={(e) => setForm((c) => (c ? { ...c, content: e.target.value } : c))} required />
        </label>

        <label className="post-editor__field post-editor__field--inline">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((c) => (c ? { ...c, is_published: e.target.checked } : c))} />
          <span>公開する</span>
        </label>

        <div className="post-editor__status">
          <button type="submit" className="post-editor__submit" disabled={isUploading || updatePost.isPending}>{isUploading || updatePost.isPending ? '保存中…' : '保存する'}</button>
          <button type="button" className="post-editor__submit" style={{ marginLeft: 8, background: '#b91c1c' }} onClick={() => void handleDelete()}>削除する</button>
          {errorMessage && <p role="alert" className="post-editor__hint">{errorMessage}</p>}
        </div>
      </form>
    </section>
  )
}
