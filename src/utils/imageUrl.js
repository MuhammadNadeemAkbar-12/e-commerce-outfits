/**
 * Shared image URL utility.
 *
 * The backend stores avatar / product-image paths as root-relative strings:
 *   /storage/avatars/filename.jpg
 *   /storage/products/filename.jpg
 *
 * This utility prepends the real backend origin so every component gets a
 * working absolute URL regardless of where the app is hosted.
 */

const BACKEND_ORIGIN = (() => {
  try {
    // axios baseURL is 'http://13.60.78.97/api' → origin is 'http://13.60.78.97'
    const { origin } = new URL(
      import.meta.env.VITE_API_BASE_URL || 'http://13.60.78.97/api'
    )
    return origin
  } catch {
    return 'http://13.60.78.97'
  }
})()

/**
 * Convert any path returned by the backend into a usable <img> src.
 * Returns '' if path is empty so callers can apply a fallback.
 */
export function resolveUrl(path) {
  if (!path) return ''
  // Already absolute
  if (/^https?:\/\//i.test(path)) {
    // Replace localhost / 127.0.0.1 with the real origin
    return path.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      BACKEND_ORIGIN
    )
  }
  if (path.startsWith('blob:') || path.startsWith('data:')) return path
  // Root-relative  e.g. /storage/avatars/xyz.jpg
  return path.startsWith('/')
    ? `${BACKEND_ORIGIN}${path}`
    : `${BACKEND_ORIGIN}/${path}`
}

// ── Avatar helpers (initials + color for fallback) ─────────────────────────
const AVATAR_COLORS = [
  '#1976D2', '#388E3C', '#7B1FA2', '#F57C00',
  '#C2185B', '#0097A7', '#5D4037', '#455A64',
]

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
