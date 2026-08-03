import fs from 'fs'
import path from 'path'

export type ImageSize = { width: number; height: number }

/**
 * Reads the pixel dimensions out of an image header.
 *
 * next/image needs real width/height to reserve the right box. Passing a fixed
 * guess either distorts the image or, with `h-auto`, shifts the layout the
 * moment it decodes. Content images come from frontmatter as a plain string
 * path, so they cannot be statically imported — hence reading the header.
 *
 * Supports PNG, JPEG and WebP, which covers everything the site serves.
 */
export function readImageSize(publicPath: string): ImageSize | null {
  if (!publicPath.startsWith('/')) return null

  const file = path.join(process.cwd(), 'public', publicPath.slice(1))
  let buf: Buffer
  try {
    // Only the header matters, but this runs at build time over a handful of
    // files, so a whole-file read is simpler than juggling file descriptors.
    buf = fs.readFileSync(file).subarray(0, 65536)
  } catch {
    // A typo'd path would otherwise ship a broken image with nothing to show
    // for it — the page still renders, but say so while developing.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`readImageSize: no file at public${publicPath}`)
    }
    return null
  }

  return pngSize(buf) ?? webpSize(buf) ?? jpegSize(buf)
}

function pngSize(b: Buffer): ImageSize | null {
  // 8-byte signature, then the IHDR chunk: length, 'IHDR', width, height.
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null
  if (b.toString('ascii', 12, 16) !== 'IHDR') return null
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
}

function webpSize(b: Buffer): ImageSize | null {
  if (b.length < 30) return null
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null

  const format = b.toString('ascii', 12, 16)

  if (format === 'VP8X') {
    // 4 flag bytes, then canvas width-1 and height-1 as 24-bit little-endian.
    return {
      width: (b.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (b.readUIntLE(27, 3) & 0xffffff) + 1,
    }
  }

  if (format === 'VP8 ') {
    // Lossy: 3-byte frame tag, 3-byte start code, then 14-bit dimensions.
    if (b.readUIntLE(23, 3) !== 0x2a019d) return null
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }
  }

  if (format === 'VP8L') {
    // Lossless: 0x2f signature, then 14 bits width-1 and 14 bits height-1.
    if (b[20] !== 0x2f) return null
    const bits = b.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }

  return null
}

function jpegSize(b: Buffer): ImageSize | null {
  if (b.length < 4 || b.readUInt16BE(0) !== 0xffd8) return null

  let offset = 2
  while (offset + 9 < b.length) {
    if (b[offset] !== 0xff) {
      offset++
      continue
    }
    const marker = b[offset + 1]
    // SOF0-SOF15 carry the frame dimensions; DHT/JPG/DAC are not frame headers.
    const isFrameHeader =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isFrameHeader) {
      return { height: b.readUInt16BE(offset + 5), width: b.readUInt16BE(offset + 7) }
    }
    offset += 2 + b.readUInt16BE(offset + 2)
  }
  return null
}
