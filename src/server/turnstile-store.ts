// Simple in-memory token store for short-lived server-issued tokens.
// Not suitable for multi-instance deployments; replace with Redis or similar in production.
const store = new Map<string, number>()

export function createServerToken(ttlSeconds = 60 * 60 * 24) {
  const token = cryptoRandom()
  const expiresAt = Date.now() + ttlSeconds * 1000
  store.set(token, expiresAt)
  return token
}

export function validateAndConsumeServerToken(token: string) {
  const expiresAt = store.get(token)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    store.delete(token)
    return false
  }
  // consume to prevent reuse
  store.delete(token)
  return true
}

function cryptoRandom() {
  // simple unique token generator. Not cryptographically strong but OK for short-lived tokens.
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
