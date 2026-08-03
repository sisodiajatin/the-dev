# public/

Static files served from the site root. A file at `public/resume.pdf` is reachable
at `/resume.pdf`.

The previous owner's images were removed during the rebrand. Nothing here is
required for the site to build — every asset below is optional and the UI degrades
cleanly without it.

## What you probably want to add

| Path | What it does | Wire it up in |
| --- | --- | --- |
| `app/icon.png` | Favicon (Next.js picks it up automatically; 512×512 PNG) | nothing — just add the file |
| `app/apple-icon.png` | iOS home-screen icon (180×180 PNG) | nothing — just add the file |
| `public/resume.pdf` | Your resume | set `links.resume = '/resume.pdf'` in `app/lib/profile.ts` |
| `public/logos/<company>.svg` | Small favicon beside a job entry | `favicon` on the role in `app/lib/profile.ts` |
| `public/previews/<company>.webp` | Screenshot shown on link hover (192×112) | `preview` on the role in `app/lib/profile.ts` |
| `public/images/<slug>.png` | Project cover image | `image` in the project's frontmatter |
| `public/images/<slug>.png` | Post cover image | `image` in the post's frontmatter |

Cover images can be any aspect ratio — the real dimensions are read from the
file header at build time (`app/lib/image-size.ts`), so the page reserves the
right box and the image is never squashed. PNG, JPEG and WebP are supported.
Name the file after the slug and avoid spaces, so the URL needs no escaping.

## What you do *not* need

There is no static `og-image.png`. Open Graph images are generated on demand by
`app/og/route.tsx` from whatever is in `app/lib/profile.ts`, so they stay in sync
with your name and role automatically.
