"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react"

import { PreviewCard, PREVIEW_WIDTH, PREVIEW_HEIGHT } from "./preview-card"
import { baseUrl } from "app/lib/profile"

const OFFSET_Y = 40

const SITE_HOST = new URL(baseUrl).host

/**
 * Turns an href into something worth putting on a generated card, so links
 * without a screenshot still get a preview instead of nothing.
 */
const describeHref = (href: string): { title: string; footer: string } => {
  if (href.startsWith("mailto:")) return { title: href.slice(7), footer: "email" }
  if (href.startsWith("/")) return { title: href.replace(/^\//, ""), footer: SITE_HOST }
  try {
    const { host, pathname } = new URL(href)
    const clean = host.replace(/^www\./, "")
    return { title: clean, footer: pathname === "/" ? "" : pathname }
  } catch {
    return { title: href, footer: "" }
  }
}

const useCursorPreview = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [mounted, setMounted] = useState(false)
  const prevX = useRef<number | null>(null)

  useEffect(() => setMounted(true), [])

  const motionTop = useMotionValue(0)
  const motionLeft = useMotionValue(0)
  const motionRotate = useMotionValue(0)

  const springTop = useSpring(motionTop, { stiffness: 300, damping: 30 })
  const springLeft = useSpring(motionLeft, { stiffness: 300, damping: 30 })
  const springRotate = useSpring(motionRotate, { stiffness: 300, damping: 20 })

  const onMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // jump so the card appears at the cursor instead of springing in from 0,0
    motionTop.jump(e.clientY - PREVIEW_HEIGHT - OFFSET_Y)
    motionLeft.jump(e.clientX - PREVIEW_WIDTH / 2)
    setShowPreview(true)
    prevX.current = null
  }

  const onMouseLeave = () => {
    setShowPreview(false)
    prevX.current = null
    motionRotate.set(0)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    motionTop.set(e.clientY - PREVIEW_HEIGHT - OFFSET_Y)
    motionLeft.set(e.clientX - PREVIEW_WIDTH / 2)

    // tilt the card based on horizontal cursor velocity
    if (prevX.current !== null) {
      const deltaX = e.clientX - prevX.current
      motionRotate.set(Math.max(-15, Math.min(15, deltaX * 1.2)))
    }
    prevX.current = e.clientX
  }

  return {
    mounted,
    showPreview,
    springTop,
    springLeft,
    springRotate,
    handlers: { onMouseEnter, onMouseLeave, onMouseMove },
  }
}

type CursorPreview = ReturnType<typeof useCursorPreview>

const PreviewPortal = ({
  cursor,
  preload,
  children,
}: {
  cursor: CursorPreview
  preload?: React.ReactNode
  children: React.ReactNode
}) => {
  if (!cursor.mounted) return null

  return createPortal(
    <>
      {/* Preload: rendered hidden so the browser fetches and caches assets on mount */}
      {preload && (
        <div
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}
        >
          {preload}
        </div>
      )}

      <AnimatePresence>
        {cursor.showPreview && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            style={{
              position: "fixed",
              top: cursor.springTop,
              left: cursor.springLeft,
              rotate: cursor.springRotate,
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <div className="bg-background border border-border rounded-2xl shadow-lg p-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

interface HoverLinkPreviewProps {
  href: string
  /** A screenshot. Omit and a card is generated from the href instead. */
  previewImage?: string
  imageAlt?: string
  /** Headline for the generated card. Defaults to the link's hostname. */
  previewTitle?: string
  className?: string
  children: React.ReactNode
}

// External link (new tab) with a hover preview card.
const HoverLinkPreview = ({
  href,
  previewImage,
  imageAlt = "Link preview",
  previewTitle,
  className,
  children,
}: HoverLinkPreviewProps) => {
  const cursor = useCursorPreview()

  const described = describeHref(href)

  // A screenshot when one exists, otherwise a generated card — every link
  // gets a preview, with or without image assets on disk.
  const preview = previewImage ? (
    <Image
      src={previewImage}
      alt={imageAlt}
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      draggable={false}
      className="w-48 h-28 object-cover rounded-md"
    />
  ) : (
    <PreviewCard title={previewTitle ?? described.title} footer={described.footer} seed={href} />
  )

  const isInternal = href.startsWith("/")

  return (
    <>
      <a
        href={href}
        {...(isInternal ? {} : { target: "_blank", rel: "noopener" })}
        className={className}
        {...cursor.handlers}
      >
        {children}
      </a>

      {/* Only images need preloading; generated cards are inline SVG. */}
      <PreviewPortal cursor={cursor} preload={previewImage ? preview : undefined}>
        {preview}
      </PreviewPortal>
    </>
  )
}

interface HoverPreviewLinkProps {
  href: string
  preview: React.ReactNode
  className?: string
  children: React.ReactNode
}

// Internal navigation (Next Link, same tab) with an arbitrary preview node.
const HoverPreviewLink = ({
  href,
  preview,
  className,
  children,
}: HoverPreviewLinkProps) => {
  const cursor = useCursorPreview()

  return (
    <>
      <Link href={href} className={className} {...cursor.handlers}>
        {children}
      </Link>

      <PreviewPortal cursor={cursor}>{preview}</PreviewPortal>
    </>
  )
}

export { HoverLinkPreview, HoverPreviewLink }
