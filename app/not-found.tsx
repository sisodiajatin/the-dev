import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'not found',
  robots: { index: false, follow: true },
}

const LINK_CLASS = 'underline hover:decoration-muted-foreground underline-offset-4'

export default function NotFound() {
  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <h1 className="font-semibold italic">404 — not found</h1>
      <p className="text-muted-foreground">this page doesn&apos;t exist.</p>
      <div className="flex gap-4">
        <Link href="/" className={LINK_CLASS}>
          home
        </Link>
        <Link href="/blog" className={LINK_CLASS}>
          writing
        </Link>
        <Link href="/projects" className={LINK_CLASS}>
          projects
        </Link>
      </div>
    </section>
  )
}
