import { getBlogPosts } from 'app/blog/utils'
import { baseUrl, blogMeta } from 'app/lib/profile'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function GET() {
  const allBlogs = [...getBlogPosts()].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  )

  const itemsXml = allBlogs
    .map((post) => {
      // Externally-hosted pieces point at the original, not a page we don't have.
      const url = post.metadata.externalUrl ?? `${baseUrl}/blog/${post.slug}`
      return `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description>${escapeXml(post.metadata.summary || '')}</description>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`
    })
    .join('\n')

  const lastBuildDate = new Date(
    allBlogs[0]?.metadata.publishedAt ?? Date.now()
  ).toUTCString()

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(blogMeta.title)}</title>
        <link>${baseUrl}</link>
        <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
        <language>en-us</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        <description>${escapeXml(blogMeta.description)}</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
