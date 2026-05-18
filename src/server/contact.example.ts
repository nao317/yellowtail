import { requireTurnstile } from './turnstile-middleware'
import { supabaseAdmin } from '../lib/supabase/admin'

// Example server handler to receive contact submissions, verify Turnstile, and insert via service role.
export async function contactHandler(req: any, res: any) {
  const { name, email, message, token } = req.body ?? {}
  if (!name || !email || !message) return res.status(400).json({ success: false, error: 'missing fields' })

  try {
    await requireTurnstile(token, req.headers?.cookie, req.headers?.host)
  } catch (err) {
    return res.status(403).json({ success: false, error: 'turnstile verification failed' })
  }

  try {
    const { error } = await supabaseAdmin.from('contacts').insert({ name, email, message })
    if (error) return res.status(500).json({ success: false, error: error.message })
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: (err as Error).message })
  }
}

export default contactHandler
