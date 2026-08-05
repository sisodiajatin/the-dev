import BoxedText from './boxed-text'
import KineticText from './kinetic-text'
import { homepage, identity } from 'app/lib/profile'

// Measured against the real font rather than guessed: "Jatin Sisodia" renders
// 5.32em wide in Playfair italic semibold, and the column's inner width is
// 640px — so ~120px is where it would start overflowing on one line, and ~61px
// is the ceiling at a 375px viewport. The clamp stays clear of both:
//   320px -> 48px   375px -> 48px   768px -> 84px   1280px+ -> 104px
// An inline style rather than an arbitrary Tailwind class because this project
// is still on a Tailwind 4 alpha, and clamp() in an arbitrary value is exactly
// the kind of thing that silently no-ops there.
const NAME_SIZE = 'clamp(3rem, 11vw, 6.5rem)'

const MainHeader = () => {
  return (
    <section>
      <div className="flex flex-col gap-figma-inside-gap">
        {/* The name gets the full column. Tight leading and negative tracking
            because display sizes need both — defaults that look right at 16px
            look loose at 100px. */}
        <h1
          className="font-semibold italic leading-[0.9] tracking-[-0.03em]"
          style={{ fontSize: NAME_SIZE }}
        >
          {identity.name}
        </h1>

        {identity.nativeName && (
          <p className="font-normal italic text-muted-foreground -mt-1">
            {identity.nativeName}
          </p>
        )}

        {/* Everything else sits under the name: supporting detail on the left,
            location holding the right edge. */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-figma-inside-gap">
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
          </div>

          <div className="shrink-0 text-right">
            {identity.location.native && (
              <p className="font-normal italic">{identity.location.native}</p>
            )}
            <p className="font-normal italic">{identity.location.english}</p>
          </div>
        </div>

        {identity.handle && <p className="sr-only">@{identity.handle}</p>}
      </div>
    </section>
  )
}

export default MainHeader
