import path from 'path'
import { readContentDir, type ContentEntry } from 'app/lib/mdx-content'

export { formatDate } from 'app/lib/mdx-content'
export type { ContentEntry, ContentMetadata } from 'app/lib/mdx-content'

const PROJECTS_DIR = path.join(process.cwd(), 'app', 'projects', 'content')

export function getProjects(): ContentEntry[] {
  return readContentDir(PROJECTS_DIR)
}
