import type * as React from 'react'
import type { IconType } from 'react-icons'
import {
  SiX,
  SiGithub,
  SiLinkedin,
  SiInstagram,
  SiYoutube,
  SiGooglescholar,
} from 'react-icons/si'
import { activeLinks, identity, linkLabels, links, repoUrl, type LinkKey } from 'app/lib/profile'
import CrowdCanvas from './crowd-canvas'

function RssIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" {...props}>
      <path d="M4 11a9 9 0 0 1 9 9" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }} />
      <path d="M4 4a16 16 0 0 1 16 16" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }} />
      <circle cx="5" cy="19" r="1" />
    </svg>
  )
}

// Only the keys that make sense as a footer icon — resume and booking live in
// the contact block instead.
const SOCIAL_ICONS: Partial<Record<LinkKey, IconType>> = {
  instagram: SiInstagram,
  x: SiX,
  github: SiGithub,
  linkedin: SiLinkedin,
  youtube: SiYoutube,
  scholar: SiGooglescholar,
}

const LINK_CLASS =
  'underline decoration-foreground hover:decoration-muted-foreground underline-offset-4'

// Fades the crowd in from the top and back out at the feet, so figures are
// never cut off by a hard edge.
const MASK = 'linear-gradient(to bottom, transparent, #000 45%, #000 72%, transparent)'

export default function Footer() {
  const socials = activeLinks
    .filter((key) => SOCIAL_ICONS[key])
    .map((key) => ({ name: key, url: links[key] as string, Icon: SOCIAL_ICONS[key] as IconType }))

  return (
    <footer className="relative pb-24">
      {/*
        Full-bleed crowd behind the footer. Blending is doing the work here:
        the figures are shrunk, drained of colour to sit a shade above the
        page background, and dissolved at both edges so nothing hard-clips —
        they walk out of the dark and back into it.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 left-1/2 z-0 h-56 w-screen -translate-x-1/2 overflow-hidden"
        style={{
          maskImage: MASK,
          WebkitMaskImage: MASK,
          // The Open Peeps sheet is already black-and-white, so grayscale is a
          // no-op today — it is here so a colour sheet would still blend if the
          // artwork is ever swapped. brightness pulls the white fills down to a
          // grey that sits just above the page background.
          filter: 'grayscale(1) brightness(0.75)',
          opacity: 0.45,
        }}
      >
        <CrowdCanvas
          src="/images/peeps/all-peeps.png"
          columns={15}
          rows={7}
          scale={0.35}
          className="absolute bottom-0 h-full w-full"
        />
      </div>

      <ul className="relative z-10 mt-8 flex flex-row space-x-4">
        {socials.map((link) => (
          <li key={link.name}>
            <a
              className="flex items-center transition-all text-muted-foreground hover:text-foreground"
              rel="noopener"
              target="_blank"
              href={link.url}
              aria-label={linkLabels[link.name]}
            >
              <link.Icon aria-hidden="true" focusable="false" />
            </a>
          </li>
        ))}
        <li>
          <a
            className="flex items-center transition-all text-muted-foreground hover:text-foreground"
            href="/rss"
            aria-label="rss"
          >
            <RssIcon aria-hidden="true" focusable="false" />
          </a>
        </li>
      </ul>

      <p className="relative z-10 mt-8 text-muted-foreground text-sm">
        © {new Date().getFullYear()} {identity.name} | MIT licensed |{' '}
        <a className={LINK_CLASS} rel="noopener" target="_blank" href={repoUrl}>
          source
        </a>
      </p>
    </footer>
  )
}
