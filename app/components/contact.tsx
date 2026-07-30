import { HoverLinkPreview } from './hover-link-preview'
import { homepage, identity, links } from 'app/lib/profile'

const LINK_CLASS =
  'underline hover:decoration-muted-foreground underline-offset-4 hover:text-foreground transition-colors'

const Contact = () => {
  return (
    <section>
      <div className="flex flex-col gap-figma-inside-gap">
        <h2 className="font-semibold italic">{homepage.contact.heading}</h2>

        <p>
          {homepage.contact.blurb}{' '}
          <a href={`mailto:${identity.email}`} className={LINK_CLASS}>
            {identity.email}
          </a>
          .
        </p>

        {links.resume && (
          <p>
            or just read my{' '}
            <HoverLinkPreview
              href={links.resume}
              imageAlt="Resume preview"
              previewTitle={`${identity.name} — resume`}
              className={LINK_CLASS}
            >
              resume
            </HoverLinkPreview>
            .
          </p>
        )}

        {links.booking && (
          <p>
            or just chat with me —{' '}
            <HoverLinkPreview
              href={links.booking}
              imageAlt="Booking preview"
              previewTitle="book a time"
              className={LINK_CLASS}
            >
              book a time
            </HoverLinkPreview>
            .
          </p>
        )}
      </div>
    </section>
  )
}

export default Contact
