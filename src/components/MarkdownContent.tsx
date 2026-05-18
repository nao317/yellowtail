import { useEffect, useMemo, useRef, useState } from 'react'
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

function extractImagesFromMarkdown(text: string) {
  const images: ActiveImage[] = []
  const cleaned = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    images.push({ src, alt: alt || '画像' })
    return ''
  })
  return { images, cleaned: cleaned.trim() }
}

export default function MarkdownContent({ content, className, preview = false }: Props) {
  const { images, cleaned } = useMemo(() => extractImagesFromMarkdown(content), [content])
  const displayContent = preview && cleaned.length > PREVIEW_CHAR_LIMIT
    ? cleaned.slice(0, PREVIEW_CHAR_LIMIT) + ' ...'
    : cleaned
  const isPreviewTruncated = preview && cleaned.length > PREVIEW_CHAR_LIMIT
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const getActiveIndex = () => (activeImage ? images.findIndex((i) => i.src === activeImage.src) : -1)
  const showPrev = () => {
    const idx = getActiveIndex()
    if (idx > 0) setActiveImage(images[idx - 1])
  }
  const showNext = () => {
    const idx = getActiveIndex()
    if (idx >= 0 && idx < images.length - 1) setActiveImage(images[idx + 1])
  }

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
          return <img className="markdown-content__image markdown-content__image--preview" src={src} alt={imageAlt} loading="lazy" {...props} onClick={() => setActiveImage({ src, alt: imageAlt })} />
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
      {preview && images.length > 0 && (
        <div className="markdown-carousel">
          <button
            type="button"
            className="markdown-carousel__prev"
            aria-label="前の画像"
            onClick={() => {
              if (!trackRef.current) return
              trackRef.current.scrollBy({ left: -trackRef.current.clientWidth, behavior: 'smooth' })
            }}
          >
            {'<'}
          </button>

          <div className="markdown-carousel__track" ref={trackRef}>
            {images.map((img) => (
              <div key={img.src} className="markdown-carousel__item">
                <img src={img.src} alt={img.alt} className="markdown-carousel__img" onClick={() => setActiveImage(img)} />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="markdown-carousel__next"
            aria-label="次の画像"
            onClick={() => {
              if (!trackRef.current) return
              trackRef.current.scrollBy({ left: trackRef.current.clientWidth, behavior: 'smooth' })
            }}
          >
            {'>'}
          </button>
        </div>
      )}

      <div className={['markdown-content', preview ? 'markdown-content--preview' : '', className].filter(Boolean).join(' ')} data-truncated={isPreviewTruncated ? 'true' : 'false'}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
          {displayContent}
        </ReactMarkdown>
      </div>

      {activeImage && (
        <div className="markdown-content__overlay" role="presentation" onClick={() => setActiveImage(null)}>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="markdown-content__overlay-prev"
                aria-label="前の画像"
                onClick={(e) => {
                  e.stopPropagation()
                  showPrev()
                }}
              >
                {'<'}
              </button>
              <button
                type="button"
                className="markdown-content__overlay-next"
                aria-label="次の画像"
                onClick={(e) => {
                  e.stopPropagation()
                  showNext()
                }}
              >
                {'>'}
              </button>
            </>
          )}
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
