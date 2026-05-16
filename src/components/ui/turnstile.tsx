import { useEffect, useRef } from 'react'
import { env } from '../../shared/lib/env'

type Props = {
  onVerify: (token: string) => void
}

export default function Turnstile({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | number | null>(null)
  const onVerifyRef = useRef(onVerify)

  onVerifyRef.current = onVerify

  useEffect(() => {
    const sitekey = env.turnstileSiteKey
    const hostname = window.location.hostname
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')
    if (!env.turnstileEnabled || !sitekey || isLocalHost) return

    const turnstile = (window as any).turnstile
    if (!turnstile || !containerRef.current || widgetIdRef.current !== null) return

    const render = () => {
      const el = containerRef.current
      if (!el || !(window as any).turnstile || widgetIdRef.current !== null) return
      if (el.dataset.turnstileRendered === 'true') return
      try {
        widgetIdRef.current = (window as any).turnstile.render(el, {
          sitekey,
          callback: (token: string) => onVerifyRef.current(token),
        })
        el.dataset.turnstileRendered = 'true'
      } catch {
        // keep the widget from crashing the page if the script has already rendered elsewhere
      }
    }

    render()

    return () => {
      const widgetId = widgetIdRef.current
      const currentTurnstile = (window as any).turnstile
      if (widgetId !== null && currentTurnstile?.remove) {
        try {
          currentTurnstile.remove(widgetId)
        } catch {
          // ignore cleanup failures during unmount/HMR
        }
      }
      if (containerRef.current) {
        delete containerRef.current.dataset.turnstileRendered
      }
      widgetIdRef.current = null
    }
  }, [])

  return <div ref={containerRef} />
}
