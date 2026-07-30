import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { HoverPreviewLink } from './hover-link-preview'
import { PreviewCard } from './preview-card'
import { baseUrl } from 'app/lib/profile'

const SITE_HOST = new URL(baseUrl).host

type BlogPostsProps = {
  limit?: number
}

export function BlogPosts({ limit }: BlogPostsProps) {
  let allBlogs = getBlogPosts()

  let sortedBlogs = [...allBlogs].sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

  // 1. Calculate if we actually need the button
  // It only shows if a limit exists AND we have more posts than that limit
  const showViewAll = limit && allBlogs.length > limit

  // 2. Slice the array
  let displayedBlogs = limit ? sortedBlogs.slice(0, limit) : sortedBlogs

  return (
    <div className="flex flex-col gap-figma-inside-gap">
      {displayedBlogs.map((post) => (
        <HoverPreviewLink
          key={post.slug}
          className="flex flex-col gap-figma-inside-gap group"
          href={`/blog/${post.slug}`}
          preview={
            <PreviewCard
              title={post.metadata.title}
              eyebrow={formatDate(post.metadata.publishedAt, false)}
              footer={SITE_HOST}
              seed={post.slug}
            />
          }
        >
          <div className="w-full grid grid-cols-[8rem_1fr] md:grid-cols-[9rem_1fr] items-baseline gap-2">
            <p className="text-muted-foreground tabular-nums">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-foreground tracking-tight underline hover:decoration-muted-foreground underline-offset-4">
              {post.metadata.title}
            </p>
          </div>
        </HoverPreviewLink>
      ))}

      {/* 3. Use the calculated boolean here */}
      {showViewAll && (
        <Link
          href="/blog"
          className="inline-flex items-center underline hover:decoration-muted-foreground underline-offset-4"
        >
          Read all writings
        </Link>
      )}
    </div>
  )
}