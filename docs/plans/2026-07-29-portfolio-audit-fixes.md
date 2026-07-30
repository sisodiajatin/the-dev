# Portfolio Audit Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix every defect found in the 2026-07-29 scan of `sagartamang.com`, remove dead code, and put a minimal safety net (tests, lint, security headers) under the repo.

**Architecture:** The site is a Next.js 16 App Router project with zero tests, zero lint config, and no `next.config`. Content lives in MDX files read from disk at build time by two near-identical `utils.ts` modules. This plan (a) adds a Vitest harness so pure logic can be TDD'd, (b) fixes confirmed user-visible bugs, (c) collapses the duplicated MDX plumbing into one shared module, (d) deletes dead code, and (e) adds the missing config layer. Phases are ordered so later tasks build on earlier ones — **do not reorder**.

**Tech Stack:** Next.js 16.1.6 (Turbopack, App Router), React 19, TypeScript 5 (`strict: false`), Tailwind CSS `4.0.0-alpha.13`, MDX via `next-mdx-remote/rsc`, Vercel AI SDK 6 + `@ai-sdk/google`, Upstash Redis rate limiting, `motion`, `streamdown`. Test runner added by this plan: Vitest.

---

## Scan evidence (what was actually verified, not guessed)

All of the following were reproduced on 2026-07-29 against a clean `npm install` + `npm run build` + `npx next start`:

| # | Finding | Evidence |
|---|---|---|
| 1 | Heading anchors containing inline markdown render as `object-object` | `curl localhost/blog/groww-python-mcp` → `<h3 id="step-3-install-object-object-python-package-manager">` |
| 2 | A blog post is dated **2027-07-05**, one year in the future | Top item of `/rss`: `<pubDate>Mon, 05 Jul 2027</pubDate>` for `ai-for-investment-decisions` |
| 3 | Headings starting with an emoji get a leading-hyphen id | `<h2 id="-video-guide">`, `<h2 id="-contributing">` |
| 4 | Upstash Redis is constructed at module scope and warns on every build worker | Build log: `[Upstash Redis] Unable to find environment variable: UPSTASH_REDIS_REST_URL` ×2 |
| 5 | No security headers; `X-Powered-By: Next.js` is exposed | `curl -D -` on `/` shows no `X-Content-Type-Options`, `Referrer-Policy`, or `X-Frame-Options` |
| 6 | RSS has no `<guid>`, `<language>`, `<lastBuildDate>`, or atom self-link | `curl localhost/rss` |
| 7 | `app/components/nav.tsx` (`Navbar`) is never imported | `grep -rn "Navbar" app` → only its own definition |
| 8 | 5 unused icon components in `footer.tsx` | `GithubIcon`, `XIcon`, `InstagramIcon`, `ScholarIcon`, `LinkedinIcon` defined, never referenced (the file uses `react-icons/si` instead) |
| 9 | 7 unreferenced files in `public/` | `personal-desk.html`, `previews/{calcom,composio,leapx,successscholar,twospoon}.svg`, `projects/mockup-zod.webp` |
| 10 | `app/blog/utils.ts` and `app/projects/utils.ts` are ~90% identical | Both define `parseFrontmatter`, `getMDXFiles`, `readMDXFile`, `getMDXData`, `formatDate` |
| 11 | `noImplicitAny` produces 25 errors across 6 files | `npx tsc --noEmit --noImplicitAny` |
| 12 | Tailwind is pinned to a pre-release from 2024 | `4.0.0-alpha.13` installed; `4.3.3` is current stable |

`npm run build` **passes** and `npx tsc --noEmit` **passes** under the current (loose) config. Nothing in this plan is fixing a broken build — it is fixing correctness, duplication, and missing guardrails.

---

## Ground rules for the engineer

- **Commit after every task.** The commit command is written out for you.
- **Run `npm run build` before every commit** from Task 6 onward. It is the only integration test this repo has.
- The shell is PowerShell on Windows, but a Bash tool is available. All commands below are written for **Bash**.
- Do not add dependencies beyond the ones named in this plan.
- Tasks tagged **[DECISION]** change something a visitor can see. Ask the repo owner before doing them.

---

# Phase 0 — Safety net

### Task 1: Add a Vitest harness

There is no test runner. Every later task that touches pure logic depends on this one.

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/harness.test.ts`
- Modify: `package.json` (scripts + devDependencies)

**Step 1: Install Vitest**

```bash
npm install --save-dev vitest@4
```

Expected: `added N packages`, exit 0.

**Step 2: Create the config**

Create `vitest.config.ts`:

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Mirrors the `baseUrl: "."` in tsconfig.json so tests can import
    // `app/lib/...` exactly the way the app does.
    alias: {
      app: path.resolve(__dirname, 'app'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
```

**Step 3: Add the scripts**

In `package.json`, add to `"scripts"`:

```json
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
```

**Step 4: Write a failing harness test**

Create `tests/harness.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('test harness', () => {
  it('resolves the `app` alias', async () => {
    const { PROFILE_LINKS } = await import('app/lib/profile-links')
    expect(PROFILE_LINKS.github.url).toBe('https://github.com/SAGAR-TAMANG')
  })
})
```

**Step 5: Run it**

```bash
npm test
```

Expected: `Test Files  1 passed (1)`, `Tests  1 passed (1)`.

If the alias fails to resolve you will see `Cannot find module 'app/lib/profile-links'` — that means `vitest.config.ts` was not picked up. Check the filename.

**Step 6: Commit**

```bash
git add vitest.config.ts tests/harness.test.ts package.json package-lock.json && git commit -m "test: add vitest harness"
```

---

# Phase 1 — Confirmed correctness bugs

### Task 2: Fix the future-dated blog post

`app/blog/posts/ai-for-investment-decisions.mdx` is dated `2027-07-05`. Today is `2026-07-29`. It sorts first in the blog index, the homepage "Writings" block, the RSS feed, and the sitemap. It is almost certainly a typo for `2026-07-05` — **confirm with the owner before changing the year**, then add a test so it cannot happen again.

**Files:**
- Modify: `app/blog/posts/ai-for-investment-decisions.mdx:3` (the `publishedAt` line)
- Create: `tests/content-dates.test.ts`

**Step 1: Write the failing test**

Create `tests/content-dates.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getBlogPosts } from 'app/blog/utils'
import { getProjects } from 'app/projects/utils'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

describe('content frontmatter dates', () => {
  const all = [
    ...getBlogPosts().map((p) => ({ kind: 'blog', ...p })),
    ...getProjects().map((p) => ({ kind: 'project', ...p })),
  ]

  it('are all well-formed ISO dates', () => {
    const bad = all
      .filter((p) => !ISO_DATE.test(p.metadata.publishedAt))
      .map((p) => `${p.kind}/${p.slug}: ${p.metadata.publishedAt}`)
    expect(bad).toEqual([])
  })

  it('are never in the future', () => {
    const today = new Date().toISOString().slice(0, 10)
    const future = all
      .filter((p) => p.metadata.publishedAt > today)
      .map((p) => `${p.kind}/${p.slug}: ${p.metadata.publishedAt}`)
    expect(future).toEqual([])
  })
})
```

**Step 2: Run it to verify it fails**

```bash
npx vitest run tests/content-dates.test.ts
```

Expected: FAIL on `are never in the future` with
`- []` vs `+ [ "blog/ai-for-investment-decisions: 2027-07-05" ]`.

**Step 3: Fix the date**

In `app/blog/posts/ai-for-investment-decisions.mdx`, change:

```
publishedAt: '2027-07-05'
```

to:

```
publishedAt: '2026-07-05'
```

**Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/content-dates.test.ts
```

Expected: `Tests  2 passed (2)`.

**Step 5: Commit**

```bash
git add app/blog/posts/ai-for-investment-decisions.mdx tests/content-dates.test.ts && git commit -m "fix(blog): correct future publish date on ai-for-investment-decisions"
```

---

### Task 3: Fix `[object Object]` heading anchors

`createHeading` in `app/components/mdx.tsx:69` calls `slugify(children)`. When a heading contains inline markdown, `children` is an array of React nodes, and `String(array)` stringifies elements as `[object Object]`. Three headings across two posts hit this today.

`slugify` cannot be tested where it lives — `mdx.tsx` imports `next-mdx-remote/rsc`, which does not load in a plain Node test environment. Extract it first.

**Files:**
- Create: `app/lib/slugify.ts`
- Create: `tests/slugify.test.ts`
- Modify: `app/components/mdx.tsx` (delete the local `slugify`, import the shared one)

**Step 1: Write the failing test**

Create `tests/slugify.test.ts`:

```ts
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { childrenToText, slugify } from 'app/lib/slugify'

describe('childrenToText', () => {
  it('passes through plain strings', () => {
    expect(childrenToText('Hello World')).toBe('Hello World')
  })

  it('flattens nested React elements down to their text', () => {
    const node = [
      'Step 3: Install ',
      React.createElement('code', { key: 'c' }, 'uv'),
      ' (Python Package Manager)',
    ]
    expect(childrenToText(node)).toBe('Step 3: Install uv (Python Package Manager)')
  })

  it('ignores null, undefined and booleans', () => {
    expect(childrenToText([null, 'a', undefined, false, 'b'])).toBe('ab')
  })
})

describe('slugify', () => {
  it('slugifies a plain heading', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('slugifies a heading containing inline code', () => {
    const node = [
      'Step 3: Install ',
      React.createElement('code', { key: 'c' }, 'uv'),
      ' (Python Package Manager)',
    ]
    expect(slugify(node)).toBe('step-3-install-uv-python-package-manager')
  })

  it('does not leave a leading hyphen when a heading starts with an emoji', () => {
    expect(slugify('🎥 Video Guide')).toBe('video-guide')
  })

  it('expands ampersands', () => {
    expect(slugify('AI & ML')).toBe('ai-and-ml')
  })
})
```

**Step 2: Run it to verify it fails**

```bash
npx vitest run tests/slugify.test.ts
```

Expected: FAIL with `Failed to resolve import "app/lib/slugify"`.

**Step 3: Write the implementation**

Create `app/lib/slugify.ts`:

```ts
import * as React from 'react'

// Flattens a React node tree to the plain text a reader actually sees.
// MDX headings that contain inline markdown (`code`, **bold**, links) arrive
// as arrays of elements, and stringifying those directly yields
// "[object Object]" inside the anchor id.
export function childrenToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(childrenToText).join('')
  if (React.isValidElement(node)) {
    return childrenToText((node.props as { children?: React.ReactNode }).children)
  }
  return ''
}

export function slugify(input: React.ReactNode): string {
  return childrenToText(input)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/&/g, '-and-') // & → "and"
    .replace(/[^\w\-]+/g, '') // drop punctuation, emoji, etc.
    .replace(/\-\-+/g, '-') // collapse runs of hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}
```

**Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/slugify.test.ts
```

Expected: `Tests  7 passed (7)`.

**Step 5: Use it in `mdx.tsx`**

In `app/components/mdx.tsx`:

1. Add the import next to the other imports at the top:

```ts
import { slugify } from 'app/lib/slugify'
```

2. Delete the entire local `slugify` function (currently lines 56–65) — the one starting `function slugify(str) {`.

Leave `createHeading` otherwise untouched; it already calls `slugify(children)`.

**Step 6: Verify end-to-end against the real rendered page**

```bash
npm run build && npx next start -p 3111 &
sleep 8
curl -s http://localhost:3111/blog/groww-python-mcp | grep -o '<h[1-6] id="[^"]*"'
kill %1
```

Expected: **no `object-object` anywhere**, and specifically:

```
<h3 id="step-3-install-uv-python-package-manager"
<h3 id="step-5-configure-your-env-file"
<h2 id="video-guide"
<h2 id="contributing"
```

(Before the fix these read `step-3-install-object-object-python-package-manager` and `-video-guide`.)

**Step 7: Commit**

```bash
git add app/lib/slugify.ts tests/slugify.test.ts app/components/mdx.tsx && git commit -m "fix(mdx): derive heading anchors from heading text, not React nodes"
```

> **Note for the owner:** this changes existing anchor URLs (`#-video-guide` → `#video-guide`). Any external deep links to those fragments will land at the top of the page instead. The old ids were malformed, so this is worth it, but say so in the commit body if you care about it.

---

### Task 4: Make JSON-LD image URLs absolute

Both detail pages emit a **relative** URL in their JSON-LD when a post has no `image` in frontmatter. Schema.org consumers require absolute URLs. The `<meta>` tags on the same pages already do it correctly, so this is purely an inconsistency in the structured data.

**Files:**
- Modify: `app/blog/[slug]/page.tsx:83-85`
- Modify: `app/projects/[slug]/page.tsx:72-74`

**Step 1: Fix the blog page**

In `app/blog/[slug]/page.tsx`, inside the JSON-LD object, change:

```ts
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
```

to:

```ts
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
```

**Step 2: Fix the projects page the same way**

In `app/projects/[slug]/page.tsx`, apply the identical change. While you are in that object, also add the missing canonical `url` field so it matches the blog page — insert directly after the `image:` line:

```ts
            url: `${baseUrl}/projects/${post.slug}`,
```

**Step 3: Verify**

```bash
npm run build && npx next start -p 3111 &
sleep 8
curl -s http://localhost:3111/blog/do-it-now | grep -o '"image":"[^"]*"'
curl -s http://localhost:3111/projects/ultron | grep -o '"url":"[^"]*"'
kill %1
```

Expected: every `"image"` value starts with `https://sagartamang.com`, and the project page now emits a `"url"`.

**Step 4: Commit**

```bash
git add "app/blog/[slug]/page.tsx" "app/projects/[slug]/page.tsx" && git commit -m "fix(seo): use absolute URLs in JSON-LD image and add project canonical url"
```

---

### Task 5: Only show "View all projects" when there are more projects

`app/components/projects.tsx:106` renders the link whenever `limit` is truthy. `app/components/posts.tsx:23` already does this correctly with a `showViewAll` guard. Make them consistent.

**Files:**
- Modify: `app/components/projects.tsx`

**Step 1: Add the guard**

In `app/components/projects.tsx`, directly after the `sortedProjects` assignment, add:

```ts
  // Only offer "view all" when the limit is actually hiding something
  const showViewAll = limit != null && allProjects.length > limit
```

**Step 2: Use it**

Change:

```tsx
      {limit && (
        <Link
          href="/projects"
```

to:

```tsx
      {showViewAll && (
        <Link
          href="/projects"
```

**Step 3: Verify**

```bash
npm run build
```

Expected: build passes. The homepage still shows the link (24 projects, `limit={1}`); the behaviour only differs once the limit stops hiding anything.

**Step 4: Commit**

```bash
git add app/components/projects.tsx && git commit -m "fix(projects): hide 'view all' link when the limit hides nothing"
```

---

# Phase 2 — Kill the duplication, stop re-reading the disk

### Task 6: Extract one shared MDX content module

`app/blog/utils.ts` and `app/projects/utils.ts` are the same file twice: identical `parseFrontmatter`, `getMDXFiles`, `readMDXFile`, `getMDXData`, and `formatDate`. The only differences are the directory and one extra `tech` field in the project type. `app/projects/[slug]/page.tsx:3` already imports `formatDate` from the *blog* module, which is a symptom of the confusion.

Two latent problems get fixed here at the same time:
- `parseFrontmatter` does `match![1]` — a file without frontmatter throws `Cannot read properties of null` with no indication of which file. Make it a named error.
- The frontmatter regex is unanchored, so a stray `---` before the real block would win. Anchor it. (Verified: all 50 content files start with `---`, so this is safe.)

**Files:**
- Create: `app/lib/mdx-content.ts`
- Create: `tests/mdx-content.test.ts`
- Rewrite: `app/blog/utils.ts`
- Rewrite: `app/projects/utils.ts`

**Step 1: Write the failing test**

Create `tests/mdx-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatDate, parseFrontmatter } from 'app/lib/mdx-content'

describe('parseFrontmatter', () => {
  it('reads keys and separates the body', () => {
    const { metadata, content } = parseFrontmatter(
      `---\ntitle: 'Hello'\npublishedAt: '2026-01-02'\nsummary: 'A post'\n---\n\nBody text.`
    )
    expect(metadata.title).toBe('Hello')
    expect(metadata.publishedAt).toBe('2026-01-02')
    expect(metadata.summary).toBe('A post')
    expect(content).toBe('Body text.')
  })

  it('keeps colons that appear inside a value', () => {
    const { metadata } = parseFrontmatter(
      `---\ntitle: 'Nepal: The Great Himalayas'\n---\n\nBody.`
    )
    expect(metadata.title).toBe('Nepal: The Great Himalayas')
  })

  it('handles CRLF line endings', () => {
    const { metadata } = parseFrontmatter(
      `---\r\ntitle: 'Windows'\r\npublishedAt: '2026-01-02'\r\n---\r\n\r\nBody.`
    )
    expect(metadata.title).toBe('Windows')
    expect(metadata.publishedAt).toBe('2026-01-02')
  })

  it('throws a useful error when frontmatter is missing', () => {
    expect(() => parseFrontmatter('no frontmatter here')).toThrow(/frontmatter/i)
  })
})

describe('formatDate', () => {
  it('formats an ISO date in long form', () => {
    expect(formatDate('2026-01-02')).toBe('January 2, 2026')
  })
})
```

**Step 2: Run it to verify it fails**

```bash
npx vitest run tests/mdx-content.test.ts
```

Expected: FAIL with `Failed to resolve import "app/lib/mdx-content"`.

**Step 3: Write the shared module**

Create `app/lib/mdx-content.ts`:

```ts
import fs from 'fs'
import path from 'path'

export type ContentMetadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  /** Comma-separated tech list; projects only. */
  tech?: string
}

export type ContentEntry = {
  metadata: ContentMetadata
  slug: string
  content: string
}

// Anchored to the start of the file so a `---` divider inside the body can
// never be mistaken for the frontmatter block.
const FRONTMATTER_RE = /^---\s*([\s\S]*?)\s*---/

export function parseFrontmatter(fileContent: string): {
  metadata: ContentMetadata
  content: string
} {
  const match = FRONTMATTER_RE.exec(fileContent)
  if (!match) {
    throw new Error('Missing frontmatter block: file must start with a `---` fenced block')
  }

  const metadata: Partial<ContentMetadata> = {}
  for (const line of match[1].trim().split(/\r?\n/)) {
    const [key, ...valueParts] = line.split(': ')
    if (valueParts.length === 0) continue
    const value = valueParts.join(': ').trim().replace(/^['"](.*)['"]$/, '$1')
    metadata[key.trim() as keyof ContentMetadata] = value
  }

  return {
    metadata: metadata as ContentMetadata,
    content: fileContent.replace(FRONTMATTER_RE, '').trim(),
  }
}

export function readContentDir(dir: string): ContentEntry[] {
  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file) === '.mdx')
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      try {
        const { metadata, content } = parseFrontmatter(raw)
        return { metadata, content, slug: path.basename(file, path.extname(file)) }
      } catch (err) {
        throw new Error(`${path.join(dir, file)}: ${(err as Error).message}`)
      }
    })
}

export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date()
  const iso = date.includes('T') ? date : `${date}T00:00:00`
  const targetDate = new Date(iso)

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) return fullDate

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  let relative: string
  if (yearsAgo > 0) relative = `${yearsAgo}y ago`
  else if (monthsAgo > 0) relative = `${monthsAgo}mo ago`
  else if (daysAgo > 0) relative = `${daysAgo}d ago`
  else relative = 'Today'

  return `${fullDate} (${relative})`
}
```

> The relative-date arithmetic is copied verbatim from the existing code. It is wrong across year boundaries (2025-12-01 reports "1y ago"), but **nothing calls it with `includeRelative = true`** — every call site passes `false`. Do not fix it here; see "Deliberately not doing" at the bottom.

**Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/mdx-content.test.ts
```

Expected: `Tests  5 passed (5)`.

**Step 5: Reduce `app/blog/utils.ts` to a thin wrapper**

Replace the **entire contents** of `app/blog/utils.ts` with:

```ts
import path from 'path'
import { readContentDir, type ContentEntry } from 'app/lib/mdx-content'

export { formatDate } from 'app/lib/mdx-content'
export type { ContentEntry, ContentMetadata } from 'app/lib/mdx-content'

const POSTS_DIR = path.join(process.cwd(), 'app', 'blog', 'posts')

export function getBlogPosts(): ContentEntry[] {
  return readContentDir(POSTS_DIR)
}
```

**Step 6: Reduce `app/projects/utils.ts` the same way**

Replace the **entire contents** of `app/projects/utils.ts` with:

```ts
import path from 'path'
import { readContentDir, type ContentEntry } from 'app/lib/mdx-content'

export { formatDate } from 'app/lib/mdx-content'
export type { ContentEntry, ContentMetadata } from 'app/lib/mdx-content'

const PROJECTS_DIR = path.join(process.cwd(), 'app', 'projects', 'content')

export function getProjects(): ContentEntry[] {
  return readContentDir(PROJECTS_DIR)
}
```

**Step 7: Point the projects detail page at the right module**

`app/projects/[slug]/page.tsx:3` currently reads `import { formatDate } from 'app/blog/utils'`. Change it to:

```ts
import { formatDate } from 'app/projects/utils'
```

**Step 8: Verify nothing else imported the deleted internals**

```bash
grep -rn "getMDXData\|readMDXFile\|getMDXFiles" app tests
```

Expected: **no output**.

**Step 9: Full verification**

```bash
npm test && npx tsc --noEmit && npm run build
```

Expected: all tests pass, typecheck clean, build emits the same 65 static pages as before (26 blog + 24 project routes).

**Step 10: Commit**

```bash
git add app/lib/mdx-content.ts tests/mdx-content.test.ts app/blog/utils.ts app/projects/utils.ts "app/projects/[slug]/page.tsx" && git commit -m "refactor(content): extract shared MDX frontmatter module"
```

---

### Task 7: Cache content reads and stop mutating the shared array

`getBlogPosts()` reads and parses all 26 MDX files from disk on **every** call. During a build that is `generateStaticParams` + `generateMetadata` × 26 + `page` × 26 + sitemap + rss + homepage — well over 50 full directory scans. At runtime, `/llms.txt` and every `POST /api/chat` re-read all 50 files through `getLLMContext()`.

Caching is only safe once the callers stop mutating the result. `app/components/posts.tsx:15` and `app/components/projects.tsx:14` both call `.sort()` **in place** on the returned array. Fix the mutation first, then cache.

**Files:**
- Modify: `app/components/posts.tsx`
- Modify: `app/components/projects.tsx`
- Modify: `app/lib/mdx-content.ts`
- Modify: `tests/mdx-content.test.ts`

**Step 1: Stop the in-place sorts**

In `app/components/posts.tsx`, change:

```ts
  let sortedBlogs = allBlogs.sort((a, b) => {
```

to:

```ts
  let sortedBlogs = [...allBlogs].sort((a, b) => {
```

In `app/components/projects.tsx`, change:

```ts
  let sortedProjects = allProjects.sort((a, b) => {
```

to:

```ts
  let sortedProjects = [...allProjects].sort((a, b) => {
```

**Step 2: Check for any other in-place sort of shared content**

```bash
grep -rn "getBlogPosts()\|getProjects()" app | grep -v "app/blog/utils.ts\|app/projects/utils.ts"
```

Review each hit. `app/rss/route.ts:19` does `allBlogs.sort(...)` on the result of `await getBlogPosts()` — change that one to `[...allBlogs].sort(...)` too. `app/lib/get-llm-context.ts` already copies (`[...items].sort`), leave it.

**Step 3: Write the failing cache test**

Append to `tests/mdx-content.test.ts`:

```ts
import { readContentDir } from 'app/lib/mdx-content'
import path from 'node:path'

describe('readContentDir', () => {
  const dir = path.join(process.cwd(), 'app', 'blog', 'posts')

  it('returns a fresh array each call so callers cannot corrupt the cache', () => {
    const a = readContentDir(dir)
    const b = readContentDir(dir)
    expect(a).not.toBe(b)
    expect(a.length).toBe(b.length)
    a.sort(() => -1) // mutate the copy
    expect(readContentDir(dir).length).toBe(b.length)
  })
})
```

**Step 4: Run it — it should pass already (uncached), which is the point**

```bash
npx vitest run tests/mdx-content.test.ts
```

Expected: PASS. This test is the guard that the caching in the next step does not break the contract.

**Step 5: Add production-only caching**

In `app/lib/mdx-content.ts`, add above `readContentDir`:

```ts
// Content is baked into the deployment, so re-reading it per request is pure
// waste in production. In development we deliberately skip the cache so
// editing an .mdx file still hot-reloads.
const CACHE_ENABLED = process.env.NODE_ENV === 'production'
const cache = new Map<string, ContentEntry[]>()
```

Then rename the existing function to `readContentDirUncached` and add the cached wrapper:

```ts
export function readContentDir(dir: string): ContentEntry[] {
  if (!CACHE_ENABLED) return readContentDirUncached(dir)

  let entries = cache.get(dir)
  if (!entries) {
    entries = readContentDirUncached(dir)
    cache.set(dir, entries)
  }
  // Hand out a copy — callers sort and slice the result.
  return [...entries]
}

function readContentDirUncached(dir: string): ContentEntry[] {
  // ...existing body...
}
```

**Step 6: Verify the test still passes and the build is unchanged**

```bash
npm test && npm run build
```

Expected: tests pass; the build output still lists 26 blog and 24 project routes. Watch the "Generating static pages" line — it should be at least as fast as before.

**Step 7: Commit**

```bash
git add app/lib/mdx-content.ts app/components/posts.tsx app/components/projects.tsx app/rss/route.ts tests/mdx-content.test.ts && git commit -m "perf(content): cache MDX reads in production and stop in-place sorts"
```

---

# Phase 3 — Harden the public API route

### Task 8: Lazy Redis, validated input, validate-before-ratelimit

Three problems in `app/api/chat/route.ts`:

1. `Redis.fromEnv()` runs at **module scope** (line 16). Every build worker that touches the route logs four `[Upstash Redis] Unable to find environment variable` warnings, and the graceful `if (process.env.UPSTASH_...)` guard further down is doing nothing to prevent it.
2. `const { messages } = await req.json()` is **unvalidated**. Malformed JSON, a missing `messages` key, or a non-array all produce an unhandled throw → 500 on a public endpoint. `messages[messages.length - 1]` on `undefined` is a `TypeError`.
3. The rate limit is **consumed before validation**, so a malformed request burns one of the visitor's 10 daily calls.

`zod` is already a dependency.

**Files:**
- Modify: `app/api/chat/route.ts`

**Step 1: Make the Redis client lazy**

Replace lines 15–19:

```ts
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
  analytics: true,
});
```

with:

```ts
const RATE_LIMITING_ENABLED = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Built on first use, not at import time — otherwise every build worker that
// merely *touches* this module logs "Unable to find environment variable".
let ratelimit: Ratelimit | null = null;
function getRatelimit(): Ratelimit {
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
      analytics: true,
    });
  }
  return ratelimit;
}
```

**Step 2: Add a request schema**

Below the imports, add:

```ts
const RequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(50),
});
```

and add `import { z } from "zod";` to the imports.

**Step 3: Reorder the handler — parse and validate first, then rate limit**

Restructure `POST` so the body is:

```ts
export async function POST(req: Request) {
  // ── 1. Parse and validate before spending anything ────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid request body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid request body." }, { status: 400 });
  }
  const messages = parsed.data.messages as any[];

  // ── 2. Input length protection (500 chars) ────────────────────
  const latestMessage = messages[messages.length - 1] as
    | { content?: string; parts?: { type: string; text: string }[] }
    | undefined;
  const latestText =
    latestMessage?.content ??
    latestMessage?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("") ??
    "";
  if (latestText.length > 500) {
    return Response.json(
      { error: "message too long. please keep it under 500 characters." },
      { status: 400 }
    );
  }

  // ── 3. Rate limit (only now that the request is known-good) ───
  const headersList = await headers();
  const ip =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  let remaining = 0;
  if (RATE_LIMITING_ENABLED) {
    const { success, limit, remaining: rateRemaining, reset } =
      await getRatelimit().limit(`chat_limit_${ip}`);
    remaining = rateRemaining;

    if (!success) {
      return Response.json(
        { error: "daily limit reached. come back tomorrow! 🌙", remaining: 0 },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(DAILY_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  }

  // ── 4. everything below here is unchanged ─────────────────────
  //   convertToModelMessages(...) / systemPrompt / streamText(...)
```

Keep the rest of the function (context-window slice, system prompt, `streamText`, response headers) exactly as it is, but change the final header guard from `if (process.env.UPSTASH_REDIS_REST_URL)` to `if (RATE_LIMITING_ENABLED)`.

Delete the four `console.log` blocks guarded by `NODE_ENV === "development"` — they were scaffolding for the Upstash setup and are noise now.

**Step 4: Verify the build no longer logs Upstash warnings**

```bash
npm run build 2>&1 | grep -i upstash
```

Expected: **no output**. (Before this task it printed four warnings twice.)

**Step 5: Verify the endpoint rejects garbage**

```bash
npx next start -p 3111 &
sleep 8
echo "--- empty body ---";   curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3111/api/chat -H 'content-type: application/json' -d ''
echo "--- wrong shape ---";  curl -s -w "\n%{http_code}\n" -X POST http://localhost:3111/api/chat -H 'content-type: application/json' -d '{"foo":1}'
echo "--- too long ---";     curl -s -w "\n%{http_code}\n" -X POST http://localhost:3111/api/chat -H 'content-type: application/json' -d "{\"messages\":[{\"role\":\"user\",\"content\":\"$(printf 'a%.0s' {1..600})\"}]}"
kill %1
```

Expected: `400`, `{"error":"invalid request body."}` `400`, `{"error":"message too long..."}` `400`. None of them 500.

**Step 6: Commit**

```bash
git add app/api/chat/route.ts && git commit -m "fix(api): lazy-init redis, validate chat input, rate-limit after validation"
```

---

# Phase 4 — Delete what nothing uses

### Task 9: Remove dead components

**Files:**
- Delete: `app/components/nav.tsx`
- Modify: `app/components/footer.tsx`

**Step 1: Confirm `Navbar` is unreferenced**

```bash
grep -rn "Navbar\|components/nav" app tests
```

Expected: only `app/components/nav.tsx` itself. If anything else appears, **stop** and report it.

**Step 2: Delete it**

```bash
git rm app/components/nav.tsx
```

> If the owner wants site navigation later (see "Open questions"), this file is in git history and can be restored with `git show HEAD~1:app/components/nav.tsx`.

**Step 3: Remove the five unused icon components from `footer.tsx`**

`footer.tsx` defines `GithubIcon`, `XIcon`, `InstagramIcon`, `ScholarIcon`, and `LinkedinIcon` (~60 lines of inline SVG paths) but the `socialLinks` array uses `react-icons/si` instead. Only `RssIcon` is actually used.

Delete those five function declarations. Keep `RssIcon`, the `socialLinks` array, and the default export.

**Step 4: Confirm nothing broke**

```bash
grep -n "GithubIcon\|XIcon\|InstagramIcon\|ScholarIcon\|LinkedinIcon" app/components/footer.tsx
```

Expected: no output.

```bash
npm run build && npx tsc --noEmit
```

Expected: both pass.

**Step 5: Visually confirm the footer still has six icons**

```bash
npx next start -p 3111 &
sleep 8
curl -s http://localhost:3111/ | grep -o 'aria-label="[a-z]*"' | sort -u
kill %1
```

Expected: `instagram`, `x`, `github`, `linkedin`, `scholar`, `rss`, plus `source-code` and `sagar-tamang`.

**Step 6: Commit**

```bash
git add -A app/components && git commit -m "chore: remove unused Navbar and duplicate footer icon components"
```

---

### Task 10: Remove unreferenced public assets

Seven files in `public/` are referenced by nothing in `app/`:

| File | Why it is dead |
|---|---|
| `public/previews/calcom.svg` | superseded by `calcom.webp` |
| `public/previews/composio.svg` | superseded by `composio.webp` |
| `public/previews/leapx.svg` | superseded by `leapx.webp` |
| `public/previews/successscholar.svg` | the SuccessScholar block in `previous.tsx` is commented out |
| `public/previews/twospoon.svg` | superseded by `twospoon.webp` |
| `public/projects/mockup-zod.webp` | `zod-nepse.mdx` uses `mockup-zod-2.webp` |
| `public/personal-desk.html` | duplicates the `/personal-desk` route |

`public/previews/google-scholar.svg` and `public/previews/resume.svg` **are** used (`current.tsx`, `contact.tsx`) — do not touch them.

`public/personal-desk.html` is different from the others: it is a **publicly reachable URL** (`sagartamang.com/personal-desk.html`) that may be linked from outside. Delete it *and* add a redirect rather than leaving a 404.

**Files:**
- Delete: the seven files above
- Modify: `next.config.ts` (created in Task 12 — **do Task 12 first if you want the redirect in the same commit**, otherwise leave `personal-desk.html` for now and revisit)

**Step 1: Re-verify each file is unreferenced**

```bash
for f in previews/calcom.svg previews/composio.svg previews/leapx.svg previews/successscholar.svg previews/twospoon.svg projects/mockup-zod.webp personal-desk.html; do
  echo "--- $f"
  grep -rn "$(basename $f)" app README.md || echo "    unreferenced"
done
```

Expected: `unreferenced` under all seven.

**Step 2: Delete the six safe ones**

```bash
git rm public/previews/calcom.svg public/previews/composio.svg public/previews/leapx.svg public/previews/successscholar.svg public/previews/twospoon.svg public/projects/mockup-zod.webp
```

**Step 3: Handle `personal-desk.html`**

Only after Task 12 exists:

```bash
git rm public/personal-desk.html
```

and add to `next.config.ts`:

```ts
  async redirects() {
    return [
      { source: '/personal-desk.html', destination: '/personal-desk', permanent: true },
    ]
  },
```

**Step 4: Verify**

```bash
npm run build && npx next start -p 3111 &
sleep 8
curl -s -o /dev/null -w "personal-desk.html -> %{http_code} %{redirect_url}\n" http://localhost:3111/personal-desk.html
curl -s -o /dev/null -w "twospoon.webp -> %{http_code}\n" http://localhost:3111/previews/twospoon.webp
kill %1
```

Expected: `308` with `redirect_url` ending `/personal-desk`; `200` for the still-used webp.

**Step 5: Commit**

```bash
git add -A public next.config.ts && git commit -m "chore: drop unreferenced public assets, redirect legacy personal-desk.html"
```

---

### Task 11: **[DECISION]** Non-functional controls in the chat input

`app/components/ai-chat-input.tsx` renders four controls that do nothing:

| Control | Line | State |
|---|---|---|
| Paperclip "Attach file" | `~144-151` | no `onClick` at all |
| Mic "Voice input" | `~198-205` | no `onClick` at all |
| "Think" toggle | `~241-260` | flips `thinkActive`, which only changes its own styling |
| "DeepSearch" toggle | `~262-295` | flips `deepSearchActive`, which only animates its own width |

Neither toggle is read by `handleSubmit`, and `onSendMessage` only ever forwards the raw text. `POST /api/chat` has no parameter for either. All four are `tabIndex={-1}` on the buttons, so they are also keyboard-unreachable — a visitor on a screen reader gets buttons they cannot activate that would do nothing anyway.

**This is a visual design decision. Ask the owner which they want:**

- **(a) Remove them** — recommended. Non-functional affordances in a portfolio's flagship interactive element undercut the "I build fast" claim more than they decorate it.
- **(b) Wire "Think" up** — pass a `think: boolean` through `sendMessage({ text, metadata })`, read it in the route, and switch `model` to `gemini-2.5-pro` or raise `maxOutputTokens`. This is a real feature, not a cleanup — it deserves its own plan.
- **(c) Leave them** — if they are deliberate visual homage to the ChatGPT/Grok input bar, keep them but at minimum remove `tabIndex={-1}` is *wrong* too; instead give them `aria-hidden="true"` and `disabled` so assistive tech skips them honestly.

**If (a) is chosen:**

**Files:**
- Modify: `app/components/ai-chat-input.tsx`

**Step 1:** Delete the Paperclip button (`~144-151`) and the Mic button (`~198-205`).
**Step 2:** Delete the entire "Expanded Controls" `motion.div` block (`~219` to its closing tag) containing both toggles.
**Step 3:** Delete the now-unused `thinkActive` / `deepSearchActive` state (`~27-28`) and trim the `lucide-react` import to just `Send`.
**Step 4:** Delete the now-unused `containerVariants` "expanded" height if it only existed to make room for the toggle row — check whether the collapsed/expanded animation still looks right.

**Step 5: Verify**

```bash
npx tsc --noEmit && npm run build && npm run dev
```

Then open `http://localhost:3000`, click the chat bar, and confirm: it still expands, the placeholder still cycles, sending a message still works, and no empty gap is left where the toggle row was.

**Step 6: Commit**

```bash
git add app/components/ai-chat-input.tsx && git commit -m "chore(chat): remove non-functional input controls"
```

---

# Phase 5 — The missing config layer

### Task 12: Add `next.config.ts` with security headers

There is **no `next.config`** in this repo at all. Consequences confirmed by `curl -D -`: no `X-Content-Type-Options`, no `Referrer-Policy`, no `X-Frame-Options`, and `X-Powered-By: Next.js` is advertised.

**Files:**
- Create: `next.config.ts`

**Step 1: Create the config**

```ts
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Stops *this* site being framed. Does not affect the superspl.at iframe
  // that /personal-desk embeds — that is an outbound frame, not an inbound one.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Only the capabilities the site genuinely never uses. `fullscreen` and
  // `xr-spatial-tracking` are deliberately left alone — /personal-desk needs them.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
```

**Step 2: Verify**

```bash
npm run build && npx next start -p 3111 &
sleep 8
curl -s -D - -o /dev/null http://localhost:3111/ | grep -iE "x-content-type|referrer-policy|x-frame|permissions-policy|x-powered-by"
kill %1
```

Expected: the four security headers present, and **no** `X-Powered-By` line.

**Step 3: Verify `/personal-desk` still renders the 3D viewer**

```bash
npm run dev
```

Open `http://localhost:3000/personal-desk`. The Gaussian splat viewer must still load and be interactive. If it does not, the `Permissions-Policy` is too tight — remove entries until it works and note which one was the culprit.

**Step 4: Commit**

```bash
git add next.config.ts && git commit -m "feat: add next.config with security headers"
```

> **Deliberately not adding a CSP here.** The site loads Google Fonts, Google Analytics, Vercel Analytics, Vercel Speed Insights, and an external iframe. A strict CSP would need a `Content-Security-Policy-Report-Only` rollout with real traffic before enforcement. That is its own project.

---

### Task 13: Add ESLint

`package.json` has no `lint` script and there is no ESLint config anywhere. Nothing catches an unused import or a missing hook dependency.

**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json`

**Step 1: Install**

```bash
npm install --save-dev eslint eslint-config-next
```

**Step 2: Create `eslint.config.mjs`**

```js
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  ...compat.extends('next/core-web-vitals'),
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
]
```

If `@eslint/eslintrc` is not pulled in transitively, install it: `npm install --save-dev @eslint/eslintrc`.

**Step 3: Add the script**

```json
    "lint": "eslint ."
```

**Step 4: Run it and triage**

```bash
npm run lint
```

Expect warnings, not a clean sheet. **Fix only the errors and the trivially-correct warnings in this task** (unused imports, missing `alt`, missing `key`). Anything that needs judgement — especially `react-hooks/exhaustive-deps` in `special-text.tsx`, which has hand-tuned dependency arrays — gets an inline `// eslint-disable-next-line` with a one-line reason, **not** a blind "fix".

**Step 5: Verify**

```bash
npm run lint && npm run build
```

Expected: lint exits 0, build passes.

**Step 6: Commit**

```bash
git add eslint.config.mjs package.json package-lock.json && git commit -m "chore: add eslint with next/core-web-vitals"
```

---

### Task 14: Tighten `tsconfig.json`

Two problems:
- `"target": "es5"` contradicts `.browserslistrc`, which explicitly declares Chrome/Firefox/Edge ≥111 and Safari ≥16.4 in order to *skip* legacy transforms.
- `"strict": false` with only `strictNullChecks` on. `npx tsc --noEmit --noImplicitAny` reported **25 errors across 6 files** before Phase 2; Tasks 3 and 6 already eliminated the `utils.ts` and `slugify` ones, so roughly **17 remain**.

**Do this task after Tasks 3 and 6**, or you will fix code that is about to be deleted.

**Files:**
- Modify: `tsconfig.json`
- Modify: `app/components/mdx.tsx` (the bulk of the remaining errors)
- Modify: `app/layout.tsx`
- Modify: `app/blog/[slug]/page.tsx`, `app/projects/[slug]/page.tsx`

**Step 1: Get the current error list**

```bash
npx tsc --noEmit --noImplicitAny 2>&1 | grep "error TS"
```

Write down the count. That is your target: zero.

**Step 2: Bump the target**

In `tsconfig.json`, change `"target": "es5"` to `"target": "ES2022"`.

**Step 3: Type the page params**

In both `app/blog/[slug]/page.tsx` and `app/projects/[slug]/page.tsx`, replace the two untyped `{ params }` bindings in each file:

```ts
type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps) {
export default async function Blog({ params }: PageProps) {
```

(Use `Project` instead of `Blog` for the projects file.)

**Step 4: Type `cx` in `layout.tsx`**

```ts
const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')
```

**Step 5: Type `mdx.tsx`**

This file has ~14 of the errors. Add types to each component:

```ts
type TableData = { headers: string[]; rows: string[][] }
function Table({ data }: { data: TableData }) { ... }

function CustomLink({ href = '', ...props }: React.ComponentProps<'a'>) { ... }

function RoundedImage(props: React.ComponentProps<typeof Image>) { ... }

function Code({ children, ...props }: { children: string } & React.ComponentProps<'code'>) { ... }

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Heading = ({ children }: { children: React.ReactNode }) => { ... }
}

export function CustomMDX(props: React.ComponentProps<typeof MDXRemote>) { ... }
```

While typing `CustomLink`, note that the current implementation would throw on a link with no `href` (`href.startsWith` on `undefined`). The `href = ''` default fixes that as a side effect — keep it.

**Step 6: Turn on the flag**

In `tsconfig.json`, add `"noImplicitAny": true`.

> Do **not** set `"strict": true` in this task. That also turns on `strictFunctionTypes`, `strictBindCallApply`, and `useUnknownInCatchVariables`, which will cascade into the AI SDK and motion typings. `noImplicitAny` is the high-value 80%.

**Step 7: Verify**

```bash
npx tsc --noEmit && npm test && npm run build
```

Expected: all three clean.

**Step 8: Commit**

```bash
git add tsconfig.json app/components/mdx.tsx app/layout.tsx "app/blog/[slug]/page.tsx" "app/projects/[slug]/page.tsx" && git commit -m "chore(ts): target ES2022 and enable noImplicitAny"
```

---

# Phase 6 — Feed and page polish

### Task 15: Make the RSS feed spec-compliant

`curl localhost/rss` shows a feed missing several elements that readers rely on. Without `<guid>`, some aggregators re-notify on every fetch when a title changes.

**Files:**
- Modify: `app/rss/route.ts`
- Create: `tests/rss.test.ts`

**Step 1: Write the failing test**

Create `tests/rss.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { GET } from 'app/rss/route'

describe('/rss', () => {
  it('emits a well-formed channel with the required elements', async () => {
    const xml = await (await GET()).text()

    expect(xml).toContain('<language>en-us</language>')
    expect(xml).toContain('<lastBuildDate>')
    expect(xml).toContain('atom:link')
    expect(xml).toContain('<guid isPermaLink="true">')
  })

  it('gives every item a guid matching its link', async () => {
    const xml = await (await GET()).text()
    const links = [...xml.matchAll(/<link>(https:\/\/sagartamang\.com\/blog\/[^<]+)<\/link>/g)]
    const guids = [...xml.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)]
    expect(guids.length).toBe(links.length)
    expect(guids.length).toBeGreaterThan(20)
  })

  it('sorts newest first', async () => {
    const xml = await (await GET()).text()
    const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) =>
      new Date(m[1]).getTime()
    )
    const sorted = [...dates].sort((a, b) => b - a)
    expect(dates).toEqual(sorted)
  })
})
```

**Step 2: Run it to verify it fails**

```bash
npx vitest run tests/rss.test.ts
```

Expected: FAIL on `<language>en-us</language>` not being found.

**Step 3: Rewrite the route**

Replace the body of `GET` in `app/rss/route.ts`:

```ts
export async function GET() {
  const allBlogs = [...getBlogPosts()].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  )

  const itemsXml = allBlogs
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`
      return `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description>${escapeXml(post.metadata.summary || '')}</description>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`
    })
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>sagar_builds — Sagar Tamang's Blog</title>
        <link>${baseUrl}</link>
        <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
        <language>en-us</language>
        <lastBuildDate>${new Date(
          allBlogs[0]?.metadata.publishedAt ?? Date.now()
        ).toUTCString()}</lastBuildDate>
        <description>Technical tutorials, build logs, and AI engineering insights by Sagar Tamang (@sagar_builds). AI on Android, MCP servers, Python, Next.js, and more.</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

Note the sort comparator change: the original returned only `-1` or `1` and never `0`, which is not a valid comparator. Also note the previous `Content-Type: text/xml` becomes `application/rss+xml`.

**Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/rss.test.ts
```

Expected: `Tests  3 passed (3)`.

**Step 5: Eyeball the real output**

```bash
npm run build && npx next start -p 3111 &
sleep 8
curl -s http://localhost:3111/rss | head -20
kill %1
```

**Step 6: Commit**

```bash
git add app/rss/route.ts tests/rss.test.ts && git commit -m "fix(rss): add guid, language, lastBuildDate and atom self-link"
```

---

### Task 16: Error boundary, 404 metadata, iframe title

Three small gaps:
- No `error.tsx` anywhere — a thrown error in any server component shows Next's default error screen, not the site's.
- `app/not-found.tsx` has no `metadata` export and is the only page in Title Case on a site whose `<body>` is `lowercase`. (The CSS `text-transform` already lowercases it visually, so this is cosmetic in the source only — but it also has no link back to the homepage, which matters because **the site has no navigation bar at all**.)
- `app/personal-desk/page.tsx` renders an `<iframe>` with no `title` attribute — a WCAG 4.1.2 failure.

**Files:**
- Create: `app/error.tsx`
- Modify: `app/not-found.tsx`
- Modify: `app/personal-desk/page.tsx`

**Step 1: Add the error boundary**

Create `app/error.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <h1 className="font-semibold italic">something broke</h1>
      <p className="text-muted-foreground">
        that&apos;s on me, not you. try again, or head back home.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="underline hover:decoration-muted-foreground underline-offset-4"
        >
          try again
        </button>
        <Link
          href="/"
          className="underline hover:decoration-muted-foreground underline-offset-4"
        >
          go home
        </Link>
      </div>
    </section>
  )
}
```

**Step 2: Improve the 404**

Replace `app/not-found.tsx`:

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className="flex flex-col gap-figma-inside-gap">
      <h1 className="font-semibold italic">404 — not found</h1>
      <p className="text-muted-foreground">
        this page doesn&apos;t exist.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="underline hover:decoration-muted-foreground underline-offset-4">
          home
        </Link>
        <Link href="/blog" className="underline hover:decoration-muted-foreground underline-offset-4">
          writings
        </Link>
        <Link href="/projects" className="underline hover:decoration-muted-foreground underline-offset-4">
          builds
        </Link>
      </div>
    </section>
  )
}
```

**Step 3: Title the iframe**

In `app/personal-desk/page.tsx`, add to the `<iframe>`:

```tsx
      title="3D Gaussian splat scan of Sagar Tamang's desk"
```

**Step 4: Verify**

```bash
npm run build && npx next start -p 3111 &
sleep 8
curl -s -o /dev/null -w "404 status: %{http_code}\n" http://localhost:3111/this-does-not-exist
curl -s http://localhost:3111/this-does-not-exist | grep -o "404 — not found"
curl -s http://localhost:3111/personal-desk | grep -o 'title="3D Gaussian[^"]*"'
kill %1
```

Expected: `404`, the heading text, and the iframe title.

**Step 5: Commit**

```bash
git add app/error.tsx app/not-found.tsx app/personal-desk/page.tsx && git commit -m "feat: add error boundary, improve 404, title the splat iframe"
```

---

# Phase 7 — The risky one

### Task 17: **[DECISION]** Upgrade Tailwind off the 2024 alpha

`tailwindcss` and `@tailwindcss/postcss` are pinned to `4.0.0-alpha.13`. Current stable is `4.3.3`. The alpha is why `app/components/ai-message-list.tsx:18` carries this workaround comment:

> "Tailwind 4 alpha can't scan node_modules (@source landed later), so Streamdown's built-in classes never make it into the CSS."

**Do this in its own branch, and do not batch it with anything else.** The `@theme` block syntax changed between the alpha and stable — in particular stable uses `--font-<name>`, not `--font-family-<name>`, and `app/global.css:9-10` uses the alpha spelling.

**Files:**
- Modify: `package.json`
- Modify: `app/global.css`
- Possibly modify: `app/components/boxed-text.tsx`, `app/components/special-text.tsx`

**Step 1: Capture a visual baseline first**

```bash
git checkout -b chore/tailwind-stable
npm run build && npx next start -p 3111
```

Screenshot, at minimum, at both mobile (375px) and desktop widths:
`/`, `/blog`, `/projects`, `/blog/groww-python-mcp` (tables + code blocks), `/projects/ultron` (image + tech chips), and the homepage with the chat bar open and a message rendered.

Save them to `docs/plans/tailwind-baseline/`. You will diff against these.

**Step 2: Upgrade**

```bash
npm install tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3
```

**Step 3: Fix the `@theme` font variables**

In `app/global.css`, change:

```css
  --font-family-serif: var(--font-playfair);
  --font-family-sans: var(--font-manrope);
```

to:

```css
  --font-serif: var(--font-playfair);
  --font-sans: var(--font-manrope);
```

**Step 4: Audit the suspect utilities**

These are non-default utilities the alpha may have accepted differently. Check each renders:

| Utility | Where | What to check |
|---|---|---|
| `border-1` | `boxed-text.tsx` | the 1px chip border is still visible |
| `h-4.5` | `special-text.tsx` | the thinking text does not jump vertically |
| `gap-figma-inside-gap` / `gap-figma-outside-gap` | everywhere | the 16px / 40px rhythm is intact |
| `font-serif` / `font-sans` | `layout.tsx`, `home-chat-bar.tsx` | Playfair on the page, Manrope in the chat |
| `decoration-[0.1em]` | `global.css:82` | prose link underlines |

**Step 5: Rebuild and diff**

```bash
npm run build && npx next start -p 3111
```

Re-shoot the same screenshots and compare. **Any difference is a regression until proven otherwise.**

**Step 6: Consider removing the Streamdown workaround**

Stable Tailwind supports `@source`. If you want Streamdown's own styles back, add to `global.css`:

```css
@source "../node_modules/streamdown/dist";
```

**Recommendation: don't.** The `markdownComponents` overrides in `ai-message-list.tsx` are deliberate design choices (bold → semibold italic, italic → underline, matching `header.tsx`), not a workaround for missing styles. Adding `@source` would grow the CSS bundle and risk Streamdown's defaults competing with them. Just update the stale comment at line 18 to say the overrides are intentional.

**Step 7: Commit**

```bash
git add package.json package-lock.json app/global.css app/components/ai-message-list.tsx && git commit -m "chore(deps): move tailwind off 4.0.0-alpha.13 to stable 4.3.3"
```

**Step 8: Merge only after a visual sign-off from the owner.**

---

# Deliberately not doing

Recorded so the next person does not think these were missed:

| Item | Why not |
|---|---|
| Fixing `formatDate`'s relative arithmetic | It reports "1y ago" for a date 8 months back across a year boundary — but **no call site passes `includeRelative = true`**. Fixing dead code is churn. Delete the branch instead, if anything. |
| Adding a site navigation bar | `nav.tsx` existed and was never wired up (Task 9 deletes it). Adding nav is a **design decision** — right now `/blog/some-post` has no link home except the footer, which also has none. Raise it with the owner; it is a feature, not a fix. |
| `<Footer />` rendering inside `<main>` in `layout.tsx` | Semantically the footer should be a sibling of `main`, not a child. Real, but purely cosmetic to a parser, and moving it changes the `max-w-2xl mx-auto` layout. Needs a visual check — bundle it with Task 17's screenshot pass if you want it. |
| A Content-Security-Policy | Needs a report-only rollout against real traffic. See the note under Task 12. |
| `"strict": true` | Cascades into AI SDK and `motion` typings. Task 14 takes the 80% (`noImplicitAny`). |
| `HomeChatBar` shipping JS on every route | It returns `null` when `pathname !== "/"`, but the hooks run first so the chunk still loads site-wide. The heavy markdown chunk is already lazy + idle-prefetched, so the remaining cost is small. Measure before optimising. |
| Two projects sharing `pi-logo-mockup.webp` | `ssb-feynman` and one other use the same mockup image. That is a content decision, not a bug. |
| Rate limit counting all 5 context messages | The 500-char cap only checks the newest message, so a crafted 5×499-char history is possible. `slice(-5)` bounds the blast radius and `maxOutputTokens: 400` bounds the cost. Not worth the complexity. |

---

# Open questions for the owner

1. **Task 2** — was `2027-07-05` meant to be `2026-07-05`?
2. **Task 11** — remove, wire up, or keep the Paperclip / Mic / Think / DeepSearch controls?
3. **Task 17** — is a Tailwind stable upgrade in scope right now, or deferred?
4. **Not-doing list** — do you want site navigation? Right now a reader who lands on a blog post from Google has no in-page way to reach the homepage.
5. **Task 3** — existing heading anchors change (`#-video-guide` → `#video-guide`). Any external links to those fragments you care about?
