import BoxedText from './boxed-text'
import KineticText from './kinetic-text'
import { homepage, identity } from 'app/lib/profile'

const MainHeader = () => {
  return (
    <section>
      <div className="flex justify-between items-start gap-figma-inside-gap">
        <div className="flex flex-col gap-figma-inside-gap">
          <h1 className="font-semibold italic">
            {identity.name}
            {identity.nativeName && (
              <>
                {' ~ '}
                <span className="text-xs inline-flex align-bottom leading-4">
                  {identity.nativeName}
                </span>
              </>
            )}
          </h1>

          {identity.tags.length > 0 && (
            <div className="font-semibold italic text-sm">
              {/* Middle dots rather than commas: the chip sets tight
                  tracking, and comma-joined tags run together. */}
              <BoxedText text={identity.tags.join(' · ')} />
            </div>
          )}

          <p className="italic">
            {homepage.tagline}{' '}
            <KineticText words={homepage.taglineWords} />
          </p>

          {identity.handle && <p className="sr-only">@{identity.handle}</p>}
        </div>

        <div className="text-right shrink-0">
          {identity.location.native && (
            <p className="font-normal italic">{identity.location.native}</p>
          )}
          <p className="font-normal italic">{identity.location.english}</p>
        </div>
      </div>
    </section>
  )
}

export default MainHeader
