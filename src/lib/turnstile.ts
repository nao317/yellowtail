type VerifyResult = {
  success: boolean
  'challenge_ts'?: string
  hostname?: string
  error_codes?: string[]
}

export async function verifyTurnstileToken(token: string, secret?: string): Promise<VerifyResult> {
  const key = secret ?? (globalThis as any).process?.env?.TURNSTILE_SECRET_KEY
  if (!key) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured on the server')
  }

  const form = new URLSearchParams()
  form.append('secret', key)
  form.append('response', token)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  if (!res.ok) {
    return { success: false, error_codes: [`http_${res.status}`] }
  }

  const data = (await res.json()) as VerifyResult
  return data
}

export async function verifyTurnstileTokenOrThrow(token: string, secret?: string) {
  const result = await verifyTurnstileToken(token, secret)
  if (!result.success) throw new Error('Turnstile verification failed')
  return result
}
