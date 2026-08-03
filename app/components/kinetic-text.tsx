'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

type KineticTextProps = {
  /** Words cycled in place. */
  words: readonly string[]
  /** Milliseconds each word is held. */
  interval?: number
  className?: string
}

/**
 * Swaps a word in place on a timer.
 *
 * Rebuilt natively rather than importing Framer's Kinetic Text Swapper: that
 * module resolves bare "framer" / "framer-motion" specifiers that only exist
 * inside Framer's runtime, and would mean fetching third-party JS on every
 * page load.
 */
export default function KineticText({ words, interval = 2500, className }: KineticTextProps) {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || words.length < 2) return

    let id: ReturnType<typeof setInterval> | undefined

    // Only cycle while the tab is actually being looked at. Timers keep firing
    // in a background tab but exit animations do not (they run on rAF, which
    // is suspended), so the index would race ahead of what is painted and the
    // text would jump on return.
    const start = () => {
      if (id === undefined) {
        id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
      }
    }
    const stop = () => {
      clearInterval(id)
      id = undefined
    }

    const sync = () => (document.hidden ? stop() : start())

    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reduceMotion, words.length, interval])

  // With motion turned down, cycling text is exactly the kind of thing the
  // setting exists to stop — fall back to the full phrase, which says the
  // same thing without moving.
  if (reduceMotion || words.length < 2) {
    return <span className={className}>{formatList(words)}</span>
  }

  // The longest word reserves the width, so swapping never reflows the line.
  // It sits at the end of the tagline, so the reserved space reads as nothing
  // more than trailing whitespace.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '')

  return (
    <span className={`relative inline-block align-bottom ${className ?? ''}`}>
      {/* Screen readers get the whole list once, instead of a word that keeps
          changing under them. */}
      <span className="sr-only">{formatList(words)}</span>

      <span aria-hidden="true" className="invisible whitespace-nowrap">
        {longest}
      </span>

      <span aria-hidden="true" className="absolute inset-0 flex items-end">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={words[index]}
            className="whitespace-nowrap"
            initial={{ opacity: 0, y: '0.35em', filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: '-0.35em', filter: 'blur(4px)' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

/** ['a','b','c'] -> 'a, b, and c' */
function formatList(words: readonly string[]): string {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]
  return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`
}
