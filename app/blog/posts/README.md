# Writing

One `.mdx` file per piece. The filename is the URL slug, so `my-post.mdx` is
served at `/blog/my-post`. Only `.mdx` files are picked up — this README is
ignored.

## Frontmatter

```mdx
---
title: 'Your title'
publishedAt: '2026-07-29'
summary: 'One or two sentences. Used in search results, the RSS feed and the hover card.'
image: '/posts/optional-cover.webp'
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | |
| `publishedAt` | yes | `YYYY-MM-DD`, or a full `YYYY-MM-DDTHH:MM:SS` when you need two posts on the same day to sort correctly. A future date sorts to the top of everything — check the year. |
| `summary` | yes | |
| `image` | no | Leave it out and an OG image is generated from the title. |
| `externalUrl` | no | See below. |

## Writing published somewhere else

Set `externalUrl` and the piece is listed here but links straight to the
original — no page is built for it, and it stays out of the sitemap:

```mdx
---
title: 'Something I wrote on dev.to'
publishedAt: '2026-01-14T07:48:39'
summary: 'What it is about.'
externalUrl: 'https://dev.to/sisodiajatin/some-slug'
---
```

The listing shows the host next to the title (`dev.to ↗`), the RSS item points
at the original, and /llms.txt notes where it was published. The
body of the file is never rendered, so keep it to a note about where it lives.

## What you can write

Standard markdown plus GitHub-flavoured tables. Inline `code`, **bold**,
*italic*, links, blockquotes and fenced code blocks all render, and code keeps
its real casing even though the rest of the site is lowercased. Headings get
anchor links automatically.

MDX does not accept HTML comments — use `{/* like this */}`.
