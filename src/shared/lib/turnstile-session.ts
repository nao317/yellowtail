const STORAGE_KEY = 'turnstile_client_verified_until'
const COOKIE_NAME = 'turnstile_client_verified_until'

function getCookieValue(name: string): string | null {
  const match = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(name.length + 1))
}

export function markTurnstileClientVerified(ttlMs = 24 * 60 * 60 * 1000) {
  const expiresAt = String(Date.now() + ttlMs)
  try {
    localStorage.setItem(STORAGE_KEY, expiresAt)
  } catch {
    // ignore storage failures
  }

  const maxAge = Math.max(1, Math.floor(ttlMs / 1000))
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(expiresAt)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function hasTurnstileClientVerified() {
  const cookieValue = getCookieValue(COOKIE_NAME)
  const storageValue = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })()

  const expiresAt = Number(cookieValue || storageValue || 0)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export function clearTurnstileClientVerified() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}
