export function isLocalHostName(hostname?: string | null) {
  if (!hostname) return false

  const normalized = hostname.trim().toLowerCase()
  const withoutPort = normalized.startsWith('[')
    ? normalized.slice(1, normalized.indexOf(']') > 0 ? normalized.indexOf(']') : undefined)
    : normalized.includes(':') && normalized.indexOf(':') === normalized.lastIndexOf(':')
      ? normalized.split(':', 1)[0]
      : normalized

  return (
    withoutPort === 'localhost' ||
    withoutPort === '127.0.0.1' ||
    withoutPort === '::1' ||
    withoutPort === '0.0.0.0' ||
    withoutPort.endsWith('.local')
  )
}
