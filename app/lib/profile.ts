// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE.
//
//  It is the single source of truth for every personal detail on this site.
//  No other file hardcodes a name, a link, a job, or a bio — they all read
//  from here. Change a value once and it updates the homepage, the metadata,
//  the OG images, the RSS feed, the JSON-LD and /llms.txt.
//
//  Populated from SWE_Resume_Jatin.pdf. Anything still marked TODO is either
//  not on the resume or is a judgement call left to you.
// ─────────────────────────────────────────────────────────────────────────────

/** Production origin, no trailing slash. Used for canonical URLs everywhere. */
export const baseUrl = 'https://jatin-sisodia.dev'

/** Where this site's source lives. Shown in the footer. */
// TODO: point at this repo specifically once you've pushed it.
export const repoUrl = 'https://github.com/sisodiajatin'

// ── Identity ─────────────────────────────────────────────────────────────────

export const identity = {
  name: 'Jatin Sisodia',

  /**
   * Optional second rendering of your name in another script — the original
   * template showed one in Devanagari. Set to undefined to hide it.
   */
  nativeName: undefined as string | undefined,

  /** Handle used across socials, without the @. Undefined hides all @-mentions. */
  // TODO: set this if you use a consistent handle (it drives the Twitter card
  // attribution and the OG image byline).
  handle: undefined as string | undefined,

  /** One-line role. Appears in metadata, OG images and JSON-LD. */
  role: 'Software Engineer',

  // NOTE: this is the address on your resume. Your git config uses
  // sisodia1999@gmail.com — switch it back if that's the one you want public.
  email: 'jatinsisodiausa@gmail.com',

  location: {
    native: undefined as string | undefined,
    english: 'Worcester, MA',
  },

  /**
   * The chip under your name. Concrete technologies read better here than
   * disciplines — "backend, full-stack, apis, cloud" describes a very large
   * number of people, whereas a named stack is scannable and is what a
   * recruiter is actually searching for.
   *
   * NOTE: c++ is on your resume under Languages, but unlike the other three
   * nothing on this site backs it up — no project, no job, no repo. c#/.net is
   * the opposite: production work at WebCraft-IT. Worth shipping a C++ project
   * so the tag has something behind it if a recruiter follows through.
   *
   * Alternatives, if you'd rather aim somewhere else:
   *   ['c#/.net', 'python', 'react', 'aws']         — leads with your evidenced production stack
   *   ['python', 'typescript', 'react', 'docker']   — leans web/product
   *   ['apis', 'real-time systems', 'ai tooling']   — what you build, not what with
   *   ['backend', 'full-stack', 'apis', 'cloud']    — the previous, generic set
   */
  tags: ['c++', 'python', 'react', 'aws'],
} as const

// ── Links ────────────────────────────────────────────────────────────────────
//
// Every entry is optional. Set one to undefined and it vanishes from the
// footer and the contact block.

export const links: Partial<Record<LinkKey, string>> = {
  github: 'https://github.com/sisodiajatin',
  // NOTE: unverified. Your resume links here, but the GitHub URL next to it
  // pointed at an account that isn't yours — worth double-checking this one too.
  linkedin: 'https://linkedin.com/in/jatin-sisodia',
  x: undefined,
  instagram: undefined,
  youtube: undefined,
  scholar: undefined,
  resume: '/resume.pdf',
  // TODO: add a Cal.com / Calendly link if you want visitors to book time.
  booking: undefined,
}

export type LinkKey =
  | 'github'
  | 'linkedin'
  | 'x'
  | 'instagram'
  | 'youtube'
  | 'scholar'
  | 'resume'
  | 'booking'

/** Accessible names for each link, used by the footer icons. */
export const linkLabels: Record<LinkKey, string> = {
  github: 'Open GitHub',
  linkedin: 'Open LinkedIn',
  x: 'Open X (Twitter)',
  instagram: 'Open Instagram',
  youtube: 'Watch YouTube',
  scholar: 'Open Google Scholar',
  resume: 'View Resume',
  booking: 'Book a Call',
}

/** Just the links that are actually set, in display order. */
export const activeLinks = (
  ['github', 'linkedin', 'x', 'instagram', 'youtube', 'scholar', 'resume', 'booking'] as const
).filter((key): key is LinkKey => Boolean(links[key]))

/** Absolute profile URLs for the `sameAs` field in Person JSON-LD. */
export const sameAs = (['github', 'linkedin', 'x', 'instagram', 'youtube', 'scholar'] as const)
  .map((key) => links[key])
  .filter((url): url is string => Boolean(url))

// ── Homepage copy ────────────────────────────────────────────────────────────

export type Role = {
  company: string
  url?: string
  /** e.g. '/logos/acme.svg' — drop the file in public/ first. */
  favicon?: string
  /** e.g. '/previews/acme.webp' — shows on hover. Omit for a plain link. */
  preview?: string
  title: string
  location?: string
}

export const homepage = {
  /** Static first half of the short line under your name. */
  tagline: 'i build',

  /**
   * Words cycled in place after the tagline. Two or more animates; one (or
   * none) renders as plain text, as does a visitor with reduced motion — they
   * get the full phrase "apis, platforms, and real-time systems" instead.
   */
  taglineWords: ['apis', 'platforms', 'real-time systems'] as readonly string[],

  /**
   * Your current position. Left undefined — your resume shows the MS at WPI
   * finishing May 2026 with no overlapping role.
   */
  // TODO: fill this in when you start somewhere, then the "Current" heading
  // reappears automatically.
  current: undefined as Role | undefined,

  /** Free-text paragraphs. Each string is one <p>. The main "about me". */
  about: [
    'software engineer with an ms in computer science from worcester polytechnic institute, and production experience building rest apis, full-stack platforms, and real-time systems in c#/asp.net, python, node.js, and react.',
    // Inferred from the resume: the WPI MS ran to May 2026 and no role overlaps
    // it. Rewrite this in your own words — it is the first thing a recruiter reads.
    'recently finished my ms at wpi. currently building side projects and open to software engineering roles.',
  ] as readonly string[],

  /** Past positions, newest first. */
  previous: [
    {
      company: 'WebCraft-IT',
      title: 'software developer',
      // TODO: add `url` and a `/previews/*.webp` screenshot to get the hover card.
    },
    {
      company: 'Travel Junction Indo',
      title: 'web developer',
    },
  ] as Role[],

  /** Heading + copy for the contact block. */
  contact: {
    heading: 'Contact',
    blurb: 'for roles, contract work, or anything else, reach me at',
  },
} as const

// ── SEO ──────────────────────────────────────────────────────────────────────

const displayHandle = identity.handle ? ` (@${identity.handle})` : ''

export const seo = {
  titleDefault: `${identity.name}${displayHandle} | ${identity.role}`,
  titleTemplate: `%s | ${identity.name}`,
  description:
    'Jatin Sisodia — Software Engineer in Worcester, MA. MS in Computer Science from WPI. ' +
    'Builds REST APIs, full-stack platforms, and real-time systems with C#/ASP.NET, Python, Node.js, and React.',
  keywords: [
    'Jatin Sisodia',
    'Software Engineer',
    'Worcester MA',
    'C#',
    'ASP.NET',
    'Python',
    'Node.js',
    'React',
    'REST API',
    'WPI',
  ],
  siteName: identity.name,
  twitterHandle: identity.handle ? `@${identity.handle}` : undefined,
} as const

export const blogMeta = {
  title: `Writing — ${identity.name}`,
  description: `Notes and build logs by ${identity.name}, software engineer.`,
} as const

export const projectsMeta = {
  title: `Projects — ${identity.name}`,
  description: `Things ${identity.name} has built — AI tooling, real-time systems, and search infrastructure.`,
} as const

// ── Long-form context for /llms.txt ───────────────────────────────────────
//
// Served verbatim at /llms.txt: a machine-readable summary of you for search
// engines, AI crawlers and anything else that wants the facts without scraping
// the HTML. Every section is optional — leave a list empty and its heading is
// skipped entirely rather than emitted blank.
//
// IMPORTANT: only put true things here. It is published as-is.

export const dossier = {
  summary:
    'Software Engineer with an MS in Computer Science from Worcester Polytechnic Institute and production ' +
    'experience building REST APIs, full-stack platforms, and real-time systems using C#/ASP.NET, Python, ' +
    'Node.js, and React. Based in Worcester, Massachusetts.',

  experience: [
    'WebCraft-IT — Software Developer, Aug 2023–Jun 2024. Built 10+ modules of a commodity trading platform ' +
      'across the full SDLC in C#, ASP.NET and PHP, supporting 5,000+ daily transactions. Designed the SQL Server ' +
      'schema and built 15+ REST APIs hosted on AWS EC2 to automate data integration across platform modules.',
    'Travel Junction Indo — Web Developer, Apr 2023. Launched a WordPress site with custom theme development and ' +
      'payment gateway integration, digitising the booking workflow. Improved mobile responsiveness, page load ' +
      'time and on-page SEO.',
  ] as string[],

  education: [
    'Worcester Polytechnic Institute (Worcester, MA) — MS, Computer Science, Aug 2024–May 2026. GPA 3.5/4.0.',
    'Medicaps University (Indore, India) — B.Tech, Computer Science, Aug 2019–May 2023. GPA 3.2/4.0.',
  ] as string[],

  skills: {
    Languages: ['C#', 'Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'C/C++'],
    Frontend: ['React.js', 'Angular', 'Vue.js', 'D3.js', 'Chart.js', 'Tailwind CSS', 'Framer Motion'],
    Backend: ['ASP.NET', 'Node.js', 'Express.js', 'Flask', 'FastAPI', 'Spring Boot'],
    Databases: ['SQL Server', 'MySQL', 'MongoDB', 'SQLite', 'Elasticsearch'],
    'Cloud & DevOps': ['Docker', 'Kubernetes', 'AWS EC2', 'Azure Functions', 'CI/CD', 'Git'],
  } as Record<string, string[]>,

  /** Papers, talks, patents. Nothing on the resume. */
  publications: [] as string[],

  /** Clubs, chapters, volunteering. Nothing on the resume. */
  leadership: [] as string[],
} as const
