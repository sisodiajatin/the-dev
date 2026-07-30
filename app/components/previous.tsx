import Image from 'next/image'
import CompanyLink from './company-link'
import { homepage } from 'app/lib/profile'

const Previous = () => {
  const { previous } = homepage

  if (previous.length === 0) return null

  return (
    <section>
      <div className="flex flex-col gap-figma-inside-gap">
        <h2 className="font-semibold italic">Previous</h2>

        {previous.map((role) => (
          <div key={`${role.company}-${role.title}`} className="flex items-center justify-start gap-2">
            {role.favicon && <Image src={role.favicon} alt="" height={12} width={12} />}
            <p>
              <CompanyLink role={role} />
              {' ~ '}
              {role.title}
              {role.location ? ` [${role.location}]` : ''}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Previous
