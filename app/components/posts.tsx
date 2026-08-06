import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { HoverPreviewLink } from './hover-link-preview'
import { PreviewCard } from './preview-card'
import { baseUrl } from 'app/lib/profile'

const SITE_HOST = new URL(baseUrl).host

/** 'https://dev.to/user/slug' -> 'dev.to' */
const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return SITE_HOST
  }
}

type BlogPostsProps = {
  limit?: number
}

export function BlogPosts({ limit }: BlogPostsProps) {
  const allBlogs = getBlogPosts()

  const sortedBlogs = [...allBlogs].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  )

  // Only offer "read all" when the limit is actually hiding something.
  const showViewAll = limit != null && allBlogs.length > limit
  const displayedBlogs = limit ? sortedBlogs.slice(0, limit) : sortedBlogs

  return (
    <div className="flex flex-col gap-figma-inside-gap">
      {displayedBlogs.map((post) => {
        const { externalUrl, title, publishedAt } = post.metadata
        // Pieces published elsewhere link straight to the original — there is
        // no page for them on this site.
        const href = externalUrl ?? `/blog/${post.slug}`
        const host = externalUrl ? hostOf(externalUrl) : SITE_HOST

        return (
          <HoverPreviewLink
            key={post.slug}
            className="flex flex-col gap-figma-inside-gap group"
            href={href}
            external={Boolean(externalUrl)}
            preview={
              <PreviewCard
                title={title}
                eyebrow={formatDate(publishedAt)}
                footer={host}
                seed={post.slug}
              />
            }
          >
            <div className="w-full grid grid-cols-[8rem_1fr] md:grid-cols-[9rem_1fr] items-baseline gap-2">
              <p className="text-muted-foreground tabular-nums">
                {formatDate(publishedAt)}
              </p>
              <p className="text-foreground tracking-tight underline hover:decoration-muted-foreground underline-offset-4">
                {title}
                {externalUrl && (
                  <span className="ml-1.5 text-xs text-muted-foreground no-underline whitespace-nowrap">
                    {host} ↗
                  </span>
                )}
              </p>
            </div>
          </HoverPreviewLink>
        )
      })}

      {showViewAll && (
        <Link
          href="/blog"
          className="inline-flex items-center underline hover:decoration-muted-foreground underline-offset-4"
        >
          Read all writing
        </Link>
      )}
    </div>
  )
}
