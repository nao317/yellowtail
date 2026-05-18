import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

type Props = {
  content: string
  className?: string
  preview?: boolean
}

type ActiveImage = {
  src: string
  alt: string
}

const PREVIEW_CHAR_LIMIT = 300

export default function MarkdownContent({ content, className, preview = false }: Props) {
  const displayContent = preview && content.length > PREVIEW_CHAR_LIMIT
    ? content.slice(0, PREVIEW_CHAR_LIMIT) + ' ...'
    : content
  const isPreviewTruncated = preview && content.length > PREVIEW_CHAR_LIMIT
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null)

  useEffect(() => {
    if (!activeImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeImage])

  const components = useMemo(
    () => ({
      img({ src, alt, ...props }: any) {
        if (!src) return null

        const imageAlt = alt || '画像'
        if (preview) {
          return <img className="markdown-content__image markdown-content__image--preview" src={src} alt={imageAlt} loading="lazy" {...props} />
        }

        return (
          <button
            type="button"
            className="markdown-content__image-button"
            onClick={() => setActiveImage({ src, alt: imageAlt })}
            aria-label={`${imageAlt} を拡大表示`}
          >
            <img className="markdown-content__image" src={src} alt={imageAlt} loading="lazy" {...props} />
          </button>
        )
      },
      code({ inline, className: codeClassName, children, ...props }: any) {
        if (inline) {
          return (
            <code className="markdown-content__inline-code" {...props}>
              {children}
            </code>
          )
        }

        return (
          <code className={`markdown-content__code-block ${codeClassName ?? ''}`.trim()} {...props}>
            {children}
          </code>
        )
      },
      pre({ children }: any) {
        return <pre className="markdown-content__pre">{children}</pre>
      },
      a({ href, children, ...props }: any) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...props}>
            {children}
          </a>
        )
      },
    }),
    [preview],
  )

  return (
    <>
      <div className={['markdown-content', preview ? 'markdown-content--preview' : '', className].filter(Boolean).join(' ')} data-truncated={isPreviewTruncated ? 'true' : 'false'}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
          {displayContent}
        </ReactMarkdown>
      </div>

      {activeImage && !preview && (
        <div className="markdown-content__overlay" role="presentation" onClick={() => setActiveImage(null)}>
          <button
            type="button"
            className="markdown-content__close"
            onClick={() => setActiveImage(null)}
            aria-label="画像ビューアを閉じる"
          >
            閉じる
          </button>
          <img
            className="markdown-content__modal-image"
            src={activeImage.src}
            alt={activeImage.alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
