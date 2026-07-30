import { getBlogPosts } from 'app/blog/utils'
import { getProjects } from 'app/projects/utils'
import { localOnly } from 'app/lib/mdx-content'
import { baseUrl } from 'app/lib/profile'

// Re-exported for the modules that historically imported baseUrl from here.
// New code should import it from app/lib/profile.
export { baseUrl }

export default async function sitemap() {
  // Only pages that exist on this domain — writing hosted elsewhere has no
  // URL here to submit.
  const blogs = localOnly(getBlogPosts()).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  const projects = localOnly(getProjects()).map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.metadata.publishedAt,
  }))

  const routes = ['', '/blog', '/projects'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...projects]
}
