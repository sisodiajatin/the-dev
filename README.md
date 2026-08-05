# Personal site

Portfolio, blog, and project index. Next.js App Router with MDX content.

## Start here

Everything personal lives in one file: **[`app/lib/profile.ts`](app/lib/profile.ts)**.

Your name, role, location, links, employment history, bio, SEO copy and the
machine-readable dossier at `/llms.txt` are all defined there. No component
hardcodes a personal detail — change a value once and it propagates to the
homepage, metadata, OG images, RSS and JSON-LD.

Search that file for `TODO` to find every placeholder that still needs your data.

## Running locally

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

No environment variables are required. Copy `.env.example` to `.env` if you want
Google Analytics.

> **Don't delete `.next/` while `npm run dev` is running.** Turbopack keeps a
> persistent cache database in there; pulling it out from under a live dev
> server corrupts it, and the server keeps running while serving nothing but
> `Internal Server Error`. Stop the dev server first, then `rm -rf .next`, then
> start it again. Same applies to running `npm run build` alongside `npm run
> dev` — they share `.next/`.

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
- **SEO** — sitemap, robots, RSS, JSON-LD, on-demand OG images, `/llms.txt`
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
"# the-dev" 
