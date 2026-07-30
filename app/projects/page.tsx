import type { Metadata } from 'next'
import { Projects } from 'app/components/projects'
import { baseUrl, projectsMeta } from 'app/lib/profile'

export const metadata: Metadata = {
  title: projectsMeta.title,
  description: projectsMeta.description,
  alternates: { canonical: `${baseUrl}/projects` },
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold mb-8">Projects</h1>
      <Projects />
    </section>
  )
}
