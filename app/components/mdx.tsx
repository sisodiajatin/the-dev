import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import remarkGfm from 'remark-gfm'
import React from 'react'
import { slugify } from 'app/lib/slugify'

type TableData = { headers: React.ReactNode[]; rows: React.ReactNode[][] }

// For hand-rolled tables in MDX (`<Table data={...} />`). Markdown pipe tables
// go through remark-gfm and render as ordinary <table> elements instead.
function Table({ data }: { data: TableData }) {
  return (
    <table>
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// `ref` is omitted because ComponentProps<'a'> types it as a legacy string ref,
// which next/link's modern Ref signature rejects when the rest is spread in.
function CustomLink({ href, children, ...props }: Omit<React.ComponentProps<'a'>, 'ref'>) {
  // A malformed markdown link like `[text]()` yields an empty href. Render it
  // as plain text rather than a new-tab link to nowhere.
  if (!href) {
    return <a {...props}>{children}</a>
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener" {...props}>
      {children}
    </a>
  )
}

// `<Image />` used explicitly in MDX, where the author supplies width/height
// and gets the full next/image treatment.
function RoundedImage(props: React.ComponentProps<typeof Image>) {
  return <Image {...props} alt={props.alt} className="rounded-lg" />
}

// Markdown image syntax — `![alt](/path.webp)`. There are no intrinsic
// dimensions to hand next/image, so this stays a native <img>, but it still
// gets lazy loading and the same rounded styling.
function MarkdownImage({ alt, ...props }: React.ComponentProps<'img'>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={alt ?? ''} loading="lazy" decoding="async" className="rounded-lg" />
}

function Code({ children, ...props }: React.ComponentProps<'code'>) {
  // sugar-high only understands strings. Inline code is always a string, but
  // guard anyway so a nested node can never blow up the whole page.
  if (typeof children !== 'string') {
    return <code {...props}>{children}</code>
  }
  return <code {...props} dangerouslySetInnerHTML={{ __html: highlight(children) }} />
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Heading = ({ children }: { children?: React.ReactNode }) => {
    const slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  img: MarkdownImage,
  a: CustomLink,
  code: Code,
  Table,
}

export function CustomMDX(props: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  )
}
