import type { Metadata } from 'next'
import { BlogPosts } from 'app/components/posts'
import { baseUrl, blogMeta } from 'app/lib/profile'

export const metadata: Metadata = {
  title: blogMeta.title,
  description: blogMeta.description,
  alternates: { canonical: `${baseUrl}/blog` },
}

export default function Page() {
  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <h1 className="font-semibold italic">Writing</h1>
      <BlogPosts />
    </section>
  )
}
