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

// 44x44 is the minimum comfortable touch target; the icon inside stays 16px.
const ICON_LINK_CLASS =
  'flex h-11 w-11 items-center justify-center transition-colors text-muted-foreground hover:text-foreground'

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

      {/* 44x44 hit areas rather than the bare 16px icons — the icons stay the
          same size, the tappable box around them does not. Pulled left so the
          first icon still lines up with the text column. */}
      <ul className="relative z-10 mt-6 -ml-3.5 flex flex-row gap-2">
        {socials.map((link) => (
          <li key={link.name}>
            <a
              className={ICON_LINK_CLASS}
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
            className={ICON_LINK_CLASS}
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

      {/*
        Required, not decorative: Skiper UI's free tier makes visible
        attribution a licence condition, and the crowd behind this footer is
        theirs. Open Peeps is CC0 and needs no credit, but it costs nothing to
        give one. Drop this only if you move to Skiper UI Pro.
      */}
      {/* /75 not /60: at 12px this needs 4.5:1 against the page, and 60%
          opacity landed at 3.43:1. 75% measures 4.89:1 and still reads as
          quieter than the line above it. */}
      <p className="relative z-10 mt-2 text-muted-foreground/75 text-xs">
        crowd effect by{' '}
        <a
          className="underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-muted-foreground"
          rel="noopener"
          target="_blank"
          href="https://skiper-ui.com"
        >
          skiper ui
        </a>
        , illustrations by{' '}
        <a
          className="underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-muted-foreground"
          rel="noopener"
          target="_blank"
          href="https://www.openpeeps.com"
        >
          open peeps
        </a>
      </p>
    </footer>
  )
}
