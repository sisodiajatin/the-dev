import CompanyLink from './company-link'
import { homepage } from 'app/lib/profile'

const Current = () => {
  const { current, about } = homepage

  if (!current && about.length === 0) return null

  return (
    <section>
      <div className="flex flex-col gap-figma-inside-gap">
        {/* "Current" only makes sense when there is a role under it. */}
        <h2 className="font-semibold italic">{current ? 'Current' : 'About'}</h2>

        {current && (
          <p>
            {current.title} at <CompanyLink role={current} chip />
            {current.location ? ` [${current.location}]` : ''}.
          </p>
        )}

        {about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}

export default Current
