import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { localOnly } from 'app/lib/mdx-content'
import { baseUrl, identity, sameAs } from 'app/lib/profile'

type PageProps = { params: Promise<{ slug: string }> }

// Posts published elsewhere are listed but never given a page here, so they
// must not appear in the route table or the lookup below.
const localPosts = () => localOnly(getBlogPosts())

export async function generateStaticParams() {
  return localPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata | undefined> {
  const { slug } = await params
  const post = localPosts().find((p) => p.slug === slug)
  if (!post) return

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata

  const ogImage = image
    ? `${baseUrl}${image}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({ params }: PageProps) {
  const { slug } = await params
  const post = localPosts().find((p) => p.slug === slug)

  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `${baseUrl}${post.metadata.image}`
      : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
    url: `${baseUrl}/blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: identity.name,
      url: baseUrl,
      ...(sameAs.length ? { sameAs } : {}),
    },
  }

  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="title font-semibold italic tracking-tight">{post.metadata.title}</h1>
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{formatDate(post.metadata.publishedAt)}</p>
        <Link
          href="/blog"
          className="text-muted-foreground underline hover:text-foreground underline-offset-4"
        >
          all writing
        </Link>
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
