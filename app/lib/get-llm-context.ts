import { getBlogPosts } from 'app/blog/utils'
import { getProjects } from 'app/projects/utils'
import { baseUrl, dossier, identity, links, homepage } from 'app/lib/profile'

const truncate = (str: string, maxLen: number) =>
  str.length > maxLen ? str.slice(0, maxLen) + '...' : str

const sortByDateDesc = <T extends { metadata: { publishedAt: string } }>(items: T[]) =>
  [...items].sort((a, b) => b.metadata.publishedAt.localeCompare(a.metadata.publishedAt))

/** Renders `## Heading` + body, or nothing at all when the body is empty. */
function section(heading: string, body: string): string {
  const trimmed = body.trim()
  return trimmed ? `\n## ${heading}\n\n${trimmed}\n` : ''
}

function bullets(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

/**
 * The single body of knowledge the on-site assistant is given, also served
 * verbatim at /llms.txt.
 *
 * Empty sections are omitted rather than emitted blank — a heading with
 * nothing under it invites the model to invent filler.
 */
export async function getLLMContext(): Promise<string> {
  const blogs = sortByDateDesc(getBlogPosts())
  const projects = sortByDateDesc(getProjects())

  const contactLines = [
    `- Website: ${baseUrl}`,
    `- Email: ${identity.email}`,
    ...(Object.keys(links) as (keyof typeof links)[])
      .filter((key) => links[key])
      // Site-relative links (e.g. /resume.pdf) are useless to an LLM reading
      // this file out of band — make every URL absolute.
      .map((key) => {
        const url = links[key] as string
        const absolute = url.startsWith('/') ? `${baseUrl}${url}` : url
        return `- ${key[0].toUpperCase()}${key.slice(1)}: ${absolute}`
      }),
  ].join('\n')

  const skillLines = Object.entries(dossier.skills)
    .map(([group, values]) => `- ${group}: ${values.join(', ')}`)
    .join('\n')

  const projectLines = projects
    .map(
      (p) =>
        `- ${truncate(p.metadata.title, 60)}: ${truncate(p.metadata.summary, 150)}` +
        (p.metadata.tech ? ` (Tech: ${p.metadata.tech})` : '') +
        ` [URL: ${baseUrl}/projects/${p.slug}]`
    )
    .join('\n')

  const blogLines = blogs
    .map(
      (b) =>
        `- ${truncate(b.metadata.title, 60)} (${b.metadata.publishedAt}): ` +
        `${truncate(b.metadata.summary, 150)} [URL: ${baseUrl}/blog/${b.slug}]`
    )
    .join('\n')

  const currentRole = homepage.current
    ? `${identity.role} at ${homepage.current.company}. `
    : ''

  return [
    `# ${identity.name}`,
    ``,
    `> ${currentRole}${dossier.summary}`,
    ``,
    contactLines,
    section('Experience', bullets(dossier.experience)),
    section('Education', bullets(dossier.education)),
    section('Technical Skills', skillLines),
    section('Research & Publications', bullets(dossier.publications)),
    section('Leadership', bullets(dossier.leadership)),
    section('Projects', projectLines),
    section('Writing', blogLines),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
