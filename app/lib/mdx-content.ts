import fs from 'fs'
import path from 'path'

export type ContentMetadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  /** Comma-separated tech list; projects only. */
  tech?: string
  /**
   * Set when the piece lives somewhere else (dev.to, a company blog). The
   * entry still appears in listings and the RSS feed, but no page is built
   * for it and the link goes straight to the original.
   */
  externalUrl?: string
}

export type ContentEntry = {
  metadata: ContentMetadata
  slug: string
  content: string
}

/** Entries that have a page on this site (i.e. everything not hosted elsewhere). */
export function localOnly(entries: ContentEntry[]): ContentEntry[] {
  return entries.filter((e) => !e.metadata.externalUrl)
}

// Anchored to the start of the file so a `---` divider inside the body can
// never be mistaken for the frontmatter block.
const FRONTMATTER_RE = /^---\s*([\s\S]*?)\s*---/

export function parseFrontmatter(fileContent: string): {
  metadata: ContentMetadata
  content: string
} {
  const match = FRONTMATTER_RE.exec(fileContent)
  if (!match) {
    throw new Error('Missing frontmatter block: file must start with a `---` fenced block')
  }

  const metadata: Partial<ContentMetadata> = {}
  for (const line of match[1].trim().split(/\r?\n/)) {
    const [key, ...valueParts] = line.split(': ')
    if (valueParts.length === 0) continue
    const value = valueParts.join(': ').trim().replace(/^['"](.*)['"]$/, '$1')
    metadata[key.trim() as keyof ContentMetadata] = value
  }

  return {
    metadata: metadata as ContentMetadata,
    content: fileContent.replace(FRONTMATTER_RE, '').trim(),
  }
}

// Content is baked into the deployment, so re-reading it per request is pure
// waste in production. In development the cache is skipped so editing an .mdx
// file still hot-reloads.
const CACHE_ENABLED = process.env.NODE_ENV === 'production'
const cache = new Map<string, ContentEntry[]>()

function readContentDirUncached(dir: string): ContentEntry[] {
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file) === '.mdx')
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      try {
        const { metadata, content } = parseFrontmatter(raw)
        return { metadata, content, slug: path.basename(file, path.extname(file)) }
      } catch (err) {
        throw new Error(`${path.join(dir, file)}: ${(err as Error).message}`)
      }
    })
}

export function readContentDir(dir: string): ContentEntry[] {
  if (!CACHE_ENABLED) return readContentDirUncached(dir)

  let entries = cache.get(dir)
  if (!entries) {
    entries = readContentDirUncached(dir)
    cache.set(dir, entries)
  }
  // Hand out a copy — callers sort and slice the result.
  return [...entries]
}

export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date()
  const iso = date.includes('T') ? date : `${date}T00:00:00`
  const targetDate = new Date(iso)

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) return fullDate

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  let relative: string
  if (yearsAgo > 0) relative = `${yearsAgo}y ago`
  else if (monthsAgo > 0) relative = `${monthsAgo}mo ago`
  else if (daysAgo > 0) relative = `${daysAgo}d ago`
  else relative = 'Today'

  return `${fullDate} (${relative})`
}
