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
import { activeLinks, identity, links, repoUrl, type LinkKey } from 'app/lib/profile'

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

export default function Footer() {
  const socials = activeLinks
    .filter((key) => SOCIAL_ICONS[key])
    .map((key) => ({ name: key, url: links[key] as string, Icon: SOCIAL_ICONS[key] as IconType }))

  return (
    <footer>
      <ul className="mt-8 flex flex-row space-x-4">
        {socials.map((link) => (
          <li key={link.name}>
            <a
              className="flex items-center transition-all text-muted-foreground hover:text-foreground"
              rel="noopener"
              target="_blank"
              href={link.url}
              aria-label={link.name}
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

      <p className="mt-8 text-muted-foreground text-sm">
        © {new Date().getFullYear()} {identity.name} | MIT licensed |{' '}
        <a className={LINK_CLASS} rel="noopener" target="_blank" href={repoUrl}>
          source
        </a>
      </p>
    </footer>
  )
}
