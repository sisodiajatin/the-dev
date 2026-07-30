'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const LINK_CLASS = 'underline hover:decoration-muted-foreground underline-offset-4'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <h1 className="font-semibold italic">something broke</h1>
      <p className="text-muted-foreground">
        that&apos;s on me, not you. try again, or head back home.
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className={LINK_CLASS}>
          try again
        </button>
        <Link href="/" className={LINK_CLASS}>
          go home
        </Link>
      </div>
    </section>
  )
}
