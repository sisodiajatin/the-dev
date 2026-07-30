import path from 'path'
import { readContentDir, type ContentEntry } from 'app/lib/mdx-content'

export { formatDate } from 'app/lib/mdx-content'
export type { ContentEntry, ContentMetadata } from 'app/lib/mdx-content'

const POSTS_DIR = path.join(process.cwd(), 'app', 'blog', 'posts')

export function getBlogPosts(): ContentEntry[] {
  return readContentDir(POSTS_DIR)
}
