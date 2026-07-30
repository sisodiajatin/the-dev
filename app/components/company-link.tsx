import Image from 'next/image'
import { HoverLinkPreview } from './hover-link-preview'
import type { Role } from 'app/lib/profile'

const LINK_CLASS =
  'underline hover:decoration-muted-foreground underline-offset-4 hover:text-foreground transition-colors'

/**
 * A company name, optionally wrapped in the little inverted-favicon chip and
 * optionally carrying a hover screenshot. Degrades cleanly all the way down to
 * plain text when the role has no url, favicon or preview.
 */
export default function CompanyLink({ role, chip = false }: { role: Role; chip?: boolean }) {
  if (!role.url) return <>{role.company}</>

  const link = (
    <HoverLinkPreview
      href={role.url}
      previewImage={role.preview}
      imageAlt={`${role.company} preview`}
      previewTitle={role.company}
      className={chip && role.favicon ? undefined : LINK_CLASS}
    >
      {role.company}
    </HoverLinkPreview>
  )

  if (!chip || !role.favicon) return link

  return (
    <span className="inline-flex align-middle gap-0.5 bg-white text-black rounded-sm px-0.5 py-0 hover:cursor-pointer hover:bg-white/90 active:bg-white/70 transition leading-4">
      <Image className="invert" src={role.favicon} alt="" height={12} width={12} />
      {link}
    </span>
  )
}
