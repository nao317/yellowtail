import { useEffect, useRef } from 'react'
import { env } from '../../shared/lib/env'

type Props = {
  onVerify: (token: string) => void
}

export default function Turnstile({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sitekey = env.turnstileSiteKey
    if (!sitekey) return

    let mounted = true
    const ready = (window as any).turnstile?.ready
    const render = () => {
      if (!mounted) return
      const el = containerRef.current
      if (!el || !(window as any).turnstile) return
      try {
        ;(window as any).turnstile.render(el, {
          sitekey,
          callback: (token: string) => onVerify(token),
        })
      } catch {
        // keep the widget from crashing the page if the script has already rendered elsewhere
      }
    }

    if (typeof ready === 'function') {
      ready(render)
    } else {
      render()
    }

    return () => {
      mounted = false
    }
  }, [onVerify])

  return <div ref={containerRef} />
}
