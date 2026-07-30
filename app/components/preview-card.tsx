// A generated stand-in for a screenshot: the gradient and decorative shapes are
// derived from a seed string, so every link gets its own stable look without
// shipping any image assets. Used by the hover previews across the site.
//
// Must match the card dimensions in hover-link-preview.tsx (w-48 h-28).
export const PREVIEW_WIDTH = 192
export const PREVIEW_HEIGHT = 112

// Deterministic, so the server render and the client hydration always agree.
const hashString = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const MAX_LINE_CHARS = 24
const MAX_LINES = 3

const wrapTitle = (title: string) => {
  const lines: string[] = []
  let line = ''

  for (const word of title.split(/\s+/)) {
    if (line && (line + ' ' + word).length > MAX_LINE_CHARS) {
      lines.push(line)
      line = word
    } else {
      line = line ? line + ' ' + word : word
    }
  }
  if (line) lines.push(line)

  if (lines.length > MAX_LINES) {
    return [...lines.slice(0, MAX_LINES - 1), lines[MAX_LINES - 1] + '…']
  }
  return lines
}

type PreviewCardProps = {
  /** Headline on the card. */
  title: string
  /** Small line above the title — a date, a domain, a label. */
  eyebrow?: string
  /** Small line in the bottom-right corner. */
  footer?: string
  /**
   * Drives the gradient and shapes. Pass something stable and unique per link
   * (a slug or an href) so each card looks different but never changes.
   */
  seed: string
}

export function PreviewCard({ title, eyebrow, footer, seed }: PreviewCardProps) {
  const hash = hashString(seed)
  const hue1 = hash % 360
  const hue2 = (hue1 + 60 + ((hash >> 3) % 120)) % 360
  const gradientId = `preview-gradient-${hash}`

  const circles = [0, 1, 2].map((i) => ({
    cx: (hash >> (i * 4)) % PREVIEW_WIDTH,
    cy: (hash >> (i * 5 + 2)) % PREVIEW_HEIGHT,
    r: 24 + ((hash >> (i * 3)) % 36),
  }))

  const lines = wrapTitle(title)
  // Push the title down only when there is an eyebrow above it.
  const titleTop = eyebrow ? 46 : 34

  return (
    <svg
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      // Purely decorative: the card repeats the link text it hovers over, and
      // motion's exit can leave the node mounted at opacity 0, so keep it out
      // of the accessibility tree entirely.
      aria-hidden="true"
      data-preview-card={title}
      className="w-48 h-28 rounded-md"
      style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue1}, 50%, 28%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2}, 55%, 14%)`} />
        </linearGradient>
      </defs>

      <rect width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} fill={`url(#${gradientId})`} />

      {circles.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="white" opacity={0.05} />
      ))}

      {eyebrow && (
        <text x="14" y="24" fontSize="9" fill="rgba(255,255,255,0.65)">
          {eyebrow}
        </text>
      )}

      {lines.map((line, i) => (
        <text key={i} x="14" y={titleTop + i * 16} fontSize="12" fontWeight="600" fill="white">
          {line}
        </text>
      ))}

      {footer && (
        <text
          x={PREVIEW_WIDTH - 12}
          y={PREVIEW_HEIGHT - 10}
          textAnchor="end"
          fontSize="8"
          fill="rgba(255,255,255,0.45)"
        >
          {footer}
        </text>
      )}
    </svg>
  )
}
