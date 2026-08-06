'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'home' },
  { href: '/blog', label: 'writing' },
  { href: '/projects', label: 'projects' },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Nav() {
  const pathname = usePathname()

  // Homepage is the one-page portfolio — nav only helps on inner routes.
  if (pathname === '/') return null

  return (
    <nav aria-label="site" className="mb-figma-outside-gap font-sans text-sm not-italic tracking-tight">
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = isActive(pathname, href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'text-foreground underline decoration-accent-solid underline-offset-4 decoration-2 transition-[text-decoration-color] duration-200'
                    : 'text-muted-foreground underline decoration-transparent underline-offset-4 hover:text-foreground hover:decoration-muted-foreground transition-colors duration-200'
                }
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
