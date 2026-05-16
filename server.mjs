import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')

const app = express()
app.use(express.json())

const tokenStore = new Map()

function now() {
  return Date.now()
}

function createServerToken(ttlSeconds = 86400) {
  const token = `${now().toString(36)}${Math.random().toString(36).slice(2)}`
  tokenStore.set(token, now() + ttlSeconds * 1000)
  return token
}

function consumeServerToken(token) {
  const expiresAt = tokenStore.get(token)
  if (!expiresAt) return false
  if (now() > expiresAt) {
    tokenStore.delete(token)
    return false
  }
  tokenStore.delete(token)
  return true
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').map(s => s.trim()).reduce((acc, entry) => {
    const idx = entry.indexOf('=')
    if (idx !== -1) acc[entry.slice(0, idx)] = decodeURIComponent(entry.slice(idx + 1))
    return acc
  }, {})
}

async function verifyTurnstileToken(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is not configured')

  const form = new URLSearchParams()
  form.append('secret', secret)
  form.append('response', token)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  if (!res.ok) {
    return { success: false, error_codes: [`http_${res.status}`] }
  }

  return await res.json()
}

function isSecureRequest(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https'
}

function setVerifiedCookie(res, token, secure) {
  const cookie = [
    `turnstile_verified=${encodeURIComponent(token)}`,
    'Path=/',
    'Max-Age=86400',
    'HttpOnly',
    'SameSite=Strict',
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ')
  res.setHeader('Set-Cookie', cookie)
}

app.post('/api/verify-turnstile', async (req, res) => {
  const { token } = req.body ?? {}
  if (!token) return res.status(400).json({ success: false, error: 'missing token' })

  try {
    const result = await verifyTurnstileToken(token)
    if (!result.success) return res.status(400).json({ success: false, result })

    const serverToken = createServerToken()
    setVerifiedCookie(res, serverToken, isSecureRequest(req))
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/api/contact', async (req, res) => {
  const { name, email, message, token } = req.body ?? {}
  if (!name || !email || !message) return res.status(400).json({ success: false, error: 'missing fields' })

  const cookies = parseCookies(req.headers.cookie || '')
  if (cookies.turnstile_verified && consumeServerToken(cookies.turnstile_verified)) {
    return res.json({ success: true })
  }

  if (!token) return res.status(403).json({ success: false, error: 'missing turnstile token' })

  try {
    const result = await verifyTurnstileToken(token)
    if (!result.success) return res.status(403).json({ success: false, result })
    const serverToken = createServerToken()
    setVerifiedCookie(res, serverToken, isSecureRequest(req))
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

app.use(express.static(distDir))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(distDir, 'index.html'))
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
