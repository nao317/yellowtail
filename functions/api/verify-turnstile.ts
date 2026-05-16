export async function onRequestPost(context: any) {
  const { request, env } = context
  const body = await request.json().catch(() => ({}))
  const token = body?.token

  if (!token) {
    return Response.json({ success: false, error: 'missing token' }, { status: 400 })
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

  const serverToken = crypto.randomUUID()
  const headers = new Headers({ 'Content-Type': 'application/json' })
  headers.append('Set-Cookie', `turnstile_verified=${serverToken}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`)

  return new Response(JSON.stringify({ success: true }), { status: 200, headers })
}
