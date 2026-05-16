export async function onRequestPost(context: any) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const { name, email, message, token } = body ?? {}

  if (!name || !email || !message) {
    return Response.json({ success: false, error: 'missing fields' }, { status: 400 })
  }

  const cookieHeader = request.headers.get('Cookie') || ''
  const hasVerifiedCookie = /(?:^|;\s*)turnstile_verified=/.test(cookieHeader)

  if (!hasVerifiedCookie) {
    if (!token) {
      return Response.json({ success: false, error: 'missing turnstile token' }, { status: 403 })
    }

    const secret = env?.TURNSTILE_SECRET_KEY
    if (!secret) {
      return Response.json({ success: false, error: 'TURNSTILE_SECRET_KEY is not configured' }, { status: 500 })
    }

    const form = new URLSearchParams()
    form.set('secret', secret)
    form.set('response', token)

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })

    const result = await verify.json().catch(() => ({ success: false }))
    if (!verify.ok || !result.success) {
      return Response.json({ success: false, result }, { status: 403 })
    }
  }

  // Keep the API concrete but avoid depending on a specific backend here.
  // If you want to persist contacts, wire this to your own storage/database.
  return Response.json({ success: true })
}
