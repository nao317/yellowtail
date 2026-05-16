import { useEffect, useRef } from 'react'
import { env } from '../../shared/lib/env'

type Props = {
  onVerify: (token: string) => void
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

export default function Turnstile({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

    function ensureScript(): Promise<void> {
      return new Promise((resolve) => {
        if ((window as any).turnstile) return resolve()
        const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
        if (existing) {
          existing.addEventListener('load', () => resolve())
          return
        }
        const s = document.createElement('script')
        s.src = SCRIPT_SRC
        s.async = true
        s.defer = true
        s.onload = () => resolve()
        document.head.appendChild(s)
      })
    }

    ensureScript().then(() => {
      if (!mounted) return
      const sitekey = env.turnstileSiteKey
      const el = containerRef.current
      if (!el) return
      try {
        ;(window as any).turnstile.render(el, {
          sitekey,
          callback: (token: string) => onVerify(token),
        })
      } catch (e) {
        // fallback: element may already have been auto-rendered
      }
    })

    return () => {
      mounted = false
    }
  }, [onVerify])

  return <div ref={containerRef} />
}
