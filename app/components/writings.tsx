import { BlogPosts } from './posts'
import { getBlogPosts } from 'app/blog/utils'

const Writings = () => {
  // Nothing published yet — skip the heading rather than show an empty section.
  if (getBlogPosts().length === 0) return null

  return (
    <section>
      <div className="flex flex-col gap-figma-inside-gap">
        <h2 className="font-semibold italic">Writings</h2>
        <BlogPosts limit={3} />
      </div>
    </section>
  )
}

export default Writings
