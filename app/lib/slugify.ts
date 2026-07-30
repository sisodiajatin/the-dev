import * as React from 'react'

// Flattens a React node tree to the plain text a reader actually sees.
// MDX headings that contain inline markdown (`code`, **bold**, links) arrive
// as arrays of elements, and stringifying those directly yields
// "[object Object]" inside the anchor id.
export function childrenToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(childrenToText).join('')
  if (React.isValidElement(node)) {
    return childrenToText((node.props as { children?: React.ReactNode }).children)
  }
  return ''
}

export function slugify(input: React.ReactNode): string {
  return childrenToText(input)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/&/g, '-and-') // & → "and"
    .replace(/[^\w\-]+/g, '') // drop punctuation, emoji, etc.
    .replace(/\-\-+/g, '-') // collapse runs of hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}
