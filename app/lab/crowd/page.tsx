'use client'

import { useState } from 'react'
import Link from 'next/link'
import CrowdCanvas from 'app/components/crowd-canvas'

/**
 * Scratch page for judging the crowd effect before deciding whether it earns
 * a place on the site. Not linked from anywhere and marked noindex.
 *
 * The effect is adapted from Skiper UI's Skiper39, itself adapted from
 * https://codepen.io/zadvorsky/pen/xxwbBQV. Skiper UI's free tier REQUIRES
 * visible attribution — if this ships, that credit has to ship with it.
 */
export default function CrowdLabPage() {
  const [dark, setDark] = useState(true)

  return (
    <div
      className={`relative h-full w-full transition-colors duration-300 ${
        dark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Stand-in for the real page content, so the crowd can be judged
          against something rather than an empty stage. */}
      <div className="absolute left-1/2 top-20 z-10 w-full max-w-2xl -translate-x-1/2 px-6">
        <h1 className="font-serif text-2xl font-semibold italic">Jatin Sisodia</h1>
        <p className="mt-3 font-serif italic opacity-80">
          i build apis, platforms, and real-time systems
        </p>
        <p className="mt-6 max-w-md font-serif text-sm opacity-60">
          software engineer with an ms in computer science from worcester polytechnic
          institute.
        </p>
      </div>

      <div className="absolute right-6 top-6 z-20 flex items-center gap-3 text-xs">
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded border border-current px-3 py-1.5 opacity-70 transition-opacity hover:opacity-100"
        >
          {dark ? 'try on white' : 'try on black'}
        </button>
        <Link href="/" className="underline underline-offset-4 opacity-50 hover:opacity-100">
          back
        </Link>
      </div>

      <CrowdCanvas
        src="/images/peeps/all-peeps.png"
        columns={15}
        rows={7}
        className="absolute bottom-0 h-[80vh] w-full"
      />

      <p className="absolute bottom-3 left-6 z-20 text-[11px] opacity-40">
        illustrations by openpeeps.com (CC0) · effect adapted from Skiper UI
      </p>
    </div>
  )
}
