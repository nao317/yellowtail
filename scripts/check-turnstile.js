// Ensures that when a site key is provided at build-time, the server secret is also configured.
const siteKey = process.env.VITE_TURNSTILE_SITE_KEY
const secret = process.env.TURNSTILE_SECRET_KEY
const env = process.env.NODE_ENV || 'development'

if (env === 'production' || process.env.CHECK_TURNSTILE === '1') {
  if (siteKey && !secret) {
    console.error('[check-turnstile] VITE_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET_KEY is not.')
    console.error('Set TURNSTILE_SECRET_KEY in your production environment to enable Turnstile verification.')
    process.exit(1)
  }
}

// exit 0 when ok
process.exit(0)
