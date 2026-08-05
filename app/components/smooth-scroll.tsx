'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Smooth scrolling, site-wide. Renders nothing.
 *
 * Lenis drives its own rAF loop (`autoRaf`) and scrolls the real document, so
 * IntersectionObserver, anchor links and the browser's own scroll position all
 * keep working — the footer crowd still starts and stops on visibility.
 *
 * Deliberately off for anyone who asked for reduced motion: hijacking scroll
 * physics is exactly the kind of thing that setting is meant to stop, and the
 * preference is honoured live rather than only at load.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null

    const sync = () => {
      if (query.matches) {
        lenis?.destroy()
        lenis = null
        return
      }
      if (lenis) return
      lenis = new Lenis({
        // Shorter than the 1.2 default: this site is barely two screens tall,
        // and a long glide just reads as input lag.
        duration: 0.9,
        // Lets in-page "#heading" links glide instead of jumping, which the
        // anchor links on every blog heading rely on.
        anchors: true,
        autoRaf: true,
      })
    }

    sync()
    query.addEventListener('change', sync)

    return () => {
      query.removeEventListener('change', sync)
      lenis?.destroy()
    }
  }, [])

  return null
}
