# Personal site

Portfolio, blog, and project index. Next.js App Router, MDX content, and an
on-site AI assistant that answers questions about you using only the facts you
publish.

## Start here

Everything personal lives in one file: **[`app/lib/profile.ts`](app/lib/profile.ts)**.

Your name, role, location, links, employment history, bio, SEO copy and the
knowledge given to the AI assistant are all defined there. No component hardcodes
a personal detail — change a value once and it propagates to the homepage,
metadata, OG images, RSS, JSON-LD, `/llms.txt` and the chat.

Search that file for `TODO` to find every placeholder that still needs your data.

## Running locally

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

The AI chat needs a Google Generative AI key to respond; everything else works
without any environment variables. Copy `.env.example` to `.env` and fill in what
you need.

## Adding content

| What | Where |
| --- | --- |
| Blog post | `app/blog/posts/<slug>.mdx` |
| Project | `app/projects/content/<slug>.mdx` |
| Images, resume, logos | `public/` — see [`public/README.md`](public/README.md) |

Both content types use the same frontmatter shape (`title`, `publishedAt`,
`summary`, optional `image`; projects add `tech`). The starter files in each
directory document the details — delete them once you have real content.

## Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Styling** — Tailwind CSS v4
- **Content** — MDX via `next-mdx-remote`, GitHub-flavoured markdown
- **AI chat** — Vercel AI SDK + Google Gemini, rate-limited with Upstash Redis
- **SEO** — sitemap, robots, RSS, JSON-LD, on-demand OG images
- **Analytics** — Vercel Analytics + Speed Insights, optional Google Analytics

## Deploying

Set the environment variables from `.env.example`, then point
`baseUrl` in `app/lib/profile.ts` at your real domain before the first deploy —
it is what canonical URLs, the sitemap, RSS and OG images are built from.

## Credits

Built on the open-source portfolio by
[Sagar Tamang](https://github.com/SAGAR-TAMANG/sagartamang.com), MIT licensed.
The original copyright notice is retained in [`license.txt`](license.txt) as the
license requires.

## License

MIT.
