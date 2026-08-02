'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

type Peep = {
  image: HTMLImageElement
  rect: [number, number, number, number]
  width: number
  height: number
  x: number
  y: number
  anchorY: number
  scaleX: number
  walk: gsap.core.Timeline | null
}

type Stage = { width: number; height: number }

type CrowdCanvasProps = {
  /** Sprite sheet URL. */
  src: string
  /** Figures across the sheet. */
  columns?: number
  /** Figures down the sheet. */
  rows?: number
  className?: string
}

const randomRange = (min: number, max: number) => min + Math.random() * (max - min)
const randomIndex = (array: unknown[]) => (randomRange(0, array.length) | 0)

/**
 * A crowd of sprite-sheet figures walking across a canvas.
 *
 * Adapted from Skiper UI's Skiper39, itself adapted from
 * https://codepen.io/zadvorsky/pen/xxwbBQV. Attribution to Skiper UI is
 * required by its free-tier licence — see the note in app/lab/crowd/page.tsx.
 */
export default function CrowdCanvas({
  src,
  columns = 15,
  rows = 7,
  className,
}: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // A screenful of perpetual motion is exactly what this setting exists for.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stage: Stage = { width: 0, height: 0 }
    const allPeeps: Peep[] = []
    const availablePeeps: Peep[] = []
    const crowd: Peep[] = []

    const img = new Image()
    let disposed = false

    const drawPeep = (peep: Peep) => {
      ctx.save()
      ctx.translate(peep.x, peep.y)
      ctx.scale(peep.scaleX, 1)
      ctx.drawImage(peep.image, ...peep.rect, 0, 0, peep.width, peep.height)
      ctx.restore()
    }

    const resetPeep = (peep: Peep) => {
      const facingRight = Math.random() > 0.5
      // Bias figures towards the bottom of the stage so the crowd reads as
      // depth rather than a flat band.
      const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
      const startY = stage.height - peep.height + offsetY

      const startX = facingRight ? -peep.width : stage.width + peep.width
      const endX = facingRight ? stage.width : -peep.width
      peep.scaleX = facingRight ? 1 : -1

      peep.x = startX
      peep.y = startY
      peep.anchorY = startY

      return { startY, endX }
    }

    const walk = (peep: Peep) => {
      const { startY, endX } = resetPeep(peep)
      const xDuration = 10
      const yDuration = 0.25

      const tl = gsap.timeline()
      tl.timeScale(randomRange(0.5, 1.5))
      tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0)
      // The vertical bob that sells it as walking rather than sliding.
      tl.to(
        peep,
        { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 },
        0
      )
      return tl
    }

    const addPeepToCrowd = (): Peep | null => {
      if (availablePeeps.length === 0) return null

      const peep = availablePeeps.splice(randomIndex(availablePeeps), 1)[0]
      peep.walk = walk(peep).eventCallback('onComplete', () => {
        if (disposed) return
        const i = crowd.indexOf(peep)
        if (i !== -1) crowd.splice(i, 1)
        availablePeeps.push(peep)
        addPeepToCrowd()
      })

      crowd.push(peep)
      // Painter's algorithm: lower on the stage means nearer the viewer.
      crowd.sort((a, b) => a.anchorY - b.anchorY)
      return peep
    }

    const initCrowd = () => {
      while (availablePeeps.length) {
        const peep = addPeepToCrowd()
        if (!peep || !peep.walk) break
        // Scatter starting positions so the stage begins full.
        peep.walk.progress(Math.random())
        if (reduceMotion) peep.walk.pause()
      }
    }

    const render = () => {
      if (disposed) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      crowd.forEach(drawPeep)
      ctx.restore()
    }

    const resize = () => {
      stage.width = canvas.clientWidth
      stage.height = canvas.clientHeight
      canvas.width = stage.width * window.devicePixelRatio
      canvas.height = stage.height * window.devicePixelRatio

      crowd.forEach((peep) => peep.walk?.kill())
      crowd.length = 0
      availablePeeps.length = 0
      availablePeeps.push(...allPeeps)
      initCrowd()
      // Paint immediately rather than waiting for the next ticker frame,
      // so there is no blank canvas on load or mid-resize.
      render()
    }

    const createPeeps = () => {
      const { naturalWidth, naturalHeight } = img
      const cellWidth = naturalWidth / columns
      const cellHeight = naturalHeight / rows

      for (let i = 0; i < columns * rows; i++) {
        allPeeps.push({
          image: img,
          rect: [
            (i % columns) * cellWidth,
            ((i / columns) | 0) * cellHeight,
            cellWidth,
            cellHeight,
          ],
          width: cellWidth,
          height: cellHeight,
          x: 0,
          y: 0,
          anchorY: 0,
          scaleX: 1,
          walk: null,
        })
      }
    }

    // Rebuilding the crowd on every resize event is expensive; wait for the
    // drag to settle.
    let resizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 150)
    }

    img.onload = () => {
      if (disposed) return
      createPeeps()
      resize()
      gsap.ticker.add(render)
      window.addEventListener('resize', handleResize)
    }
    img.onerror = () => {
      console.error(`CrowdCanvas: could not load sprite sheet "${src}"`)
    }
    img.src = src

    return () => {
      disposed = true
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      gsap.ticker.remove(render)
      crowd.forEach((peep) => peep.walk?.kill())
      img.onload = null
      img.onerror = null
    }
  }, [src, columns, rows])

  // Decorative: conveys nothing a screen reader needs.
  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
