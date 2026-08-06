import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getProjects } from 'app/projects/utils'
import BoxedText from './boxed-text'
import { HoverPreviewLink } from './hover-link-preview'
import { PreviewCard, PREVIEW_WIDTH, PREVIEW_HEIGHT } from './preview-card'

type ProjectsProps = {
  limit?: number
}

export function Projects({ limit }: ProjectsProps) {
  let allProjects = getProjects()

  let sortedProjects = [...allProjects].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  )

  let displayedProjects = limit ? sortedProjects.slice(0, limit) : sortedProjects

  return (
    <div className="flex flex-col gap-figma-inside-gap">
      {displayedProjects.map((project) => {
        const techStack = project.metadata.tech
          ? project.metadata.tech.split(',').map((t) => t.trim())
          : []

        const thumb = project.metadata.thumbnail ?? project.metadata.image

        const rowClassName =
          'group flex flex-col md:flex-row md:gap-figma-inside-gap items-start'
        const rowContent = (
          <>
            <div className="w-full md:w-52 shrink-0 relative aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
              {thumb && (
                <Image
                  src={thumb}
                  alt={project.metadata.title}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 208px"
                />
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0 gap-1">
              <div className="flex justify-between items-baseline gap-2">
                <h2 className="font-semibold tracking-tight text-foreground underline decoration-foreground/40 group-hover:decoration-muted-foreground underline-offset-4 transition-[text-decoration-color]">
                  {project.metadata.title}
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline text-muted-foreground opacity-70 md:hidden"
                  >
                    →
                  </span>
                </h2>
                <p className="text-muted-foreground tabular-nums shrink-0 text-sm">
                  {formatDate(project.metadata.publishedAt)}
                </p>
              </div>

              <p className="text-muted-foreground line-clamp-2">
                {project.metadata.summary}
              </p>

              <div className="flex flex-wrap gap-2 mt-1">
                {techStack.map((tech) => (
                  <BoxedText key={tech} text={tech} />
                ))}
              </div>
            </div>
          </>
        )

        const preview = thumb ? (
          <Image
            src={thumb}
            alt={project.metadata.title}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            draggable={false}
            className="w-48 h-28 object-cover rounded-md"
          />
        ) : (
          <PreviewCard
            title={project.metadata.title}
            eyebrow={formatDate(project.metadata.publishedAt)}
            footer={techStack[0]}
            seed={project.slug}
          />
        )

        const externalUrl = project.metadata.externalUrl

        return (
          <HoverPreviewLink
            key={project.slug}
            className={rowClassName}
            href={externalUrl ?? `/projects/${project.slug}`}
            external={Boolean(externalUrl)}
            preview={preview}
          >
            {rowContent}
          </HoverPreviewLink>
        )
      })}

      {limit != null && allProjects.length > limit && (
        <Link
          href="/projects"
          className="inline-flex items-center underline hover:decoration-muted-foreground underline-offset-4"
        >
          View all projects
        </Link>
      )}
    </div>
  )
}
