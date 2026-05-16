import { verifyTurnstileToken } from '../lib/turnstile'
import { createServerToken } from './turnstile-store'

// Example handler you can wire into your server framework.
// This avoids importing framework-specific types so it stays portable.
export async function verifyTurnstileHandler(req: any, res: any) {
  const { token } = req.body ?? {}
  if (!token) return res.status(400).json({ success: false, error: 'missing token' })

  const secret = (globalThis as any).process?.env?.TURNSTILE_SECRET_KEY
  if (!secret) return res.status(500).json({ success: false, error: 'server misconfigured' })

  try {
    const result = await verifyTurnstileToken(token, secret)
    if (!result.success) return res.status(400).json({ success: false, result })

    // create a short-lived server token and set HttpOnly cookie
    const serverToken = createServerToken(60 * 60 * 24)
    const cookie = `turnstile_verified=${serverToken}; Path=/; Max-Age=${60 * 60 * 24}; HttpOnly; Secure; SameSite=Strict`
    if (typeof res.cookie === 'function') {
      // express
      res.cookie('turnstile_verified', serverToken, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
      return res.json({ success: true })
    }
    if (typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', cookie)
    }
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: (err as Error).message })
  }
}

export default verifyTurnstileHandler
