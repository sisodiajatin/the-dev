import { Projects } from './projects'
import { getProjects } from 'app/projects/utils'

const Builds = () => {
  // Nothing shipped yet — skip the heading rather than show an empty section.
  if (getProjects().length === 0) return null

  return (
    <section>
      <div className="flex flex-col gap-figma-inside-gap">
        <h2 className="font-semibold italic">Builds</h2>
        <Projects limit={3} />
      </div>
    </section>
  )
}

export default Builds
