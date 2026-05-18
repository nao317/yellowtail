import { verifyTurnstileToken } from '../lib/turnstile'
import { createServerToken, validateAndConsumeServerToken } from './turnstile-store'
import { isLocalHostName } from '../shared/lib/host'

function parseCookie(header?: string) {
  if (!header) return {}
  return header.split(';').map(s => s.trim()).reduce((acc: any, cur) => {
    const idx = cur.indexOf('=')
    if (idx === -1) return acc
    acc[cur.slice(0, idx)] = cur.slice(idx + 1)
    return acc
  }, {})
}

// Express-compatible middleware (keeps types `any` to avoid devDependency on @types/express)
export function expressTurnstileMiddleware(req: any, res: any, next: any) {
  if (isLocalHostName(req.headers?.host)) return next()

  const cookies = parseCookie(req.headers?.cookie)
  const serverToken = cookies?.turnstile_verified
  if (serverToken) {
    if (validateAndConsumeServerToken(serverToken)) return next()
    return res.status(403).json({ success: false, error: 'invalid or expired turnstile token' })
  }

  const cfToken = req.body?.token || req.headers?.['x-turnstile-token']
  if (!cfToken) return res.status(403).json({ success: false, error: 'missing turnstile token' })

  verifyTurnstileToken(cfToken)
    .then((result) => {
      if (!result.success) return res.status(403).json({ success: false, result })
      const serverToken = createServerToken(60 * 60 * 24)
      const cookie = `turnstile_verified=${serverToken}; Path=/; Max-Age=${60 * 60 * 24}; HttpOnly; Secure; SameSite=Strict`
      if (typeof res.cookie === 'function') {
        res.cookie('turnstile_verified', serverToken, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
      } else if (typeof res.setHeader === 'function') {
        res.setHeader('Set-Cookie', cookie)
      }
      next()
    })
    .catch((err) => {
      console.error('Turnstile verification error:', err)
      return res.status(500).json({ success: false, error: 'turnstile verification error' })
    })
}

// Generic helper for serverless frameworks: throws if invalid. Accepts either server token or CF token.
export async function requireTurnstile(providedToken?: string, cookieHeader?: string, hostHeader?: string) {
  if (isLocalHostName(hostHeader)) return true

  const cookies = parseCookie(cookieHeader)
  const serverToken = cookies?.turnstile_verified
  if (serverToken && validateAndConsumeServerToken(serverToken)) return true

  if (!providedToken) throw new Error('missing turnstile token')
  const result = await verifyTurnstileToken(providedToken)
  if (!result.success) throw new Error('turnstile verification failed')
  return true
}
