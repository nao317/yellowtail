import { verifyTurnstileToken } from '../lib/turnstile'

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
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: (err as Error).message })
  }
}

export default verifyTurnstileHandler
