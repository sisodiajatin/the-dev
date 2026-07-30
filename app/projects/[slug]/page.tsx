import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getProjects } from 'app/projects/utils'
import { localOnly } from 'app/lib/mdx-content'
import { baseUrl, identity } from 'app/lib/profile'
import BoxedText from 'app/components/boxed-text'

type PageProps = { params: Promise<{ slug: string }> }

// Mirrors the blog: an entry with `externalUrl` is listed but never given a
// page here, so it must stay out of the route table and the lookup.
const localProjects = () => localOnly(getProjects())

export async function generateStaticParams() {
  return localProjects().map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata | undefined> {
  const { slug } = await params
  const post = localProjects().find((p) => p.slug === slug)
  if (!post) return

  const { title, publishedAt, summary, image } = post.metadata
  const ogImage = image
    ? `${baseUrl}${image}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description: summary,
    alternates: { canonical: `${baseUrl}/projects/${post.slug}` },
    openGraph: {
      title,
      description: summary,
      type: 'article',
      publishedTime: publishedAt,
      url: `${baseUrl}/projects/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: summary,
      images: [ogImage],
    },
  }
}

export default async function Project({ params }: PageProps) {
  const { slug } = await params
  const post = localProjects().find((p) => p.slug === slug)

  if (!post) notFound()

  // "Next.js, React" -> ["Next.js", "React"]
  const techStack = post.metadata.tech
    ? post.metadata.tech.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `${baseUrl}${post.metadata.image}`
      : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
    url: `${baseUrl}/projects/${post.slug}`,
    author: { '@type': 'Person', name: identity.name, url: baseUrl },
  }

  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="title font-semibold text-2xl tracking-tighter">{post.metadata.title}</h1>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-muted-foreground">{formatDate(post.metadata.publishedAt)}</p>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground underline hover:text-foreground underline-offset-4"
        >
          all projects
        </Link>
      </div>

      {post.metadata.image && (
        <div>
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            width={800}
            height={400}
            className="rounded-lg border border-border"
          />
        </div>
      )}

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {techStack.map((tech) => (
            <BoxedText key={tech} text={tech} />
          ))}
        </div>
      )}

      <article className="prose prose-headings:font-semibold">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
