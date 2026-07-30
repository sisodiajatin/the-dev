// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE.
//
//  It is the single source of truth for every personal detail on this site.
//  No other file hardcodes a name, a link, a job, or a bio — they all read
//  from here. Change a value once and it updates the homepage, the metadata,
//  the OG images, the RSS feed, the JSON-LD, /llms.txt and the AI chat.
//
//  Anything marked TODO is a placeholder that still needs your real data.
//  Leave a field as `undefined` (or drop it from a list) and the UI will
//  simply not render it — nothing breaks.
// ─────────────────────────────────────────────────────────────────────────────

/** Production origin, no trailing slash. Used for canonical URLs everywhere. */
// TODO: point this at your real domain before deploying.
export const baseUrl = 'https://example.com'

/** Where this site's source lives. Shown in the footer. */
// TODO: your repo.
export const repoUrl = 'https://github.com/sisodiajatin'

// ── Identity ─────────────────────────────────────────────────────────────────

export const identity = {
  /** Full name, as you want it to appear in metadata and JSON-LD. */
  // NOTE: inferred from your git config (`sisodiajatin` / sisodia1999@gmail.com).
  // TODO: correct this if the spelling or order is wrong.
  name: 'Jatin Sisodia',

  /**
   * Optional second rendering of your name — the original template showed the
   * owner's name in Devanagari next to the Latin one. Set to `undefined` to
   * hide it.
   */
  // TODO: set your own, or leave undefined.
  nativeName: undefined as string | undefined,

  /** Handle used across socials, without the @. Set to undefined if you don't use one. */
  // TODO
  handle: undefined as string | undefined,

  /** One-line role. Appears in metadata, OG images and JSON-LD. */
  // TODO
  role: 'Software Engineer',

  email: 'sisodia1999@gmail.com',

  location: {
    /** Optional native-script rendering of your city. */
    native: undefined as string | undefined,
    // TODO
    english: 'India',
  },

  /** Small chips under your name on the homepage. Keep them short. */
  // TODO
  tags: ['engineering', 'web', 'ai'],
} as const

// ── Links ────────────────────────────────────────────────────────────────────
//
// Every entry is optional. Delete or set to undefined the ones you don't use
// and they vanish from the footer, the contact block and the AI chat buttons.

export const links: Partial<Record<LinkKey, string>> = {
  // TODO: replace with your own profiles; delete the rest.
  github: 'https://github.com/sisodiajatin',
  linkedin: undefined,
  x: undefined,
  instagram: undefined,
  youtube: undefined,
  scholar: undefined,
  /** Path or URL to a resume PDF. Drop a file at public/resume.pdf to enable. */
  resume: undefined,
  /** Cal.com / Calendly / etc. */
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

/** Human labels for each link, used by the footer and the AI chat buttons. */
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
  /** Short line under your name. Rendered with "build" and "fast" emphasised. */
  // TODO
  tagline: 'i build things for the web',

  /** Your current position. Set to `undefined` to hide the whole section. */
  // TODO
  current: {
    company: 'TODO: current employer',
    url: undefined,
    title: 'TODO: your title',
  } as Role | undefined,

  /**
   * Free-text paragraphs after the current role. Each string is one <p>.
   * This is the main "about me" on the homepage.
   */
  // TODO: write these in your own voice.
  about: [
    'TODO: a sentence or two about what you work on and what you care about.',
    'TODO: something human — hobbies, interests, what you read.',
  ] as readonly string[],

  /** Past positions, newest first. Empty array hides the section. */
  // TODO
  previous: [] as Role[],

  /** Heading + copy for the contact block. */
  contact: {
    heading: 'Contact',
    // TODO
    blurb: 'for work, collaborations, or anything else, reach me at',
  },
} as const

// ── SEO ──────────────────────────────────────────────────────────────────────

const displayHandle = identity.handle ? ` (@${identity.handle})` : ''

export const seo = {
  titleDefault: `${identity.name}${displayHandle} | ${identity.role}`,
  titleTemplate: `%s | ${identity.name}`,
  // TODO: write a real 150-160 character description; this one is generic.
  description: `${identity.name} — ${identity.role} based in ${identity.location.english}. Projects, writing, and things I've built.`,
  /** Keywords are a weak signal but harmless. Keep them honest. */
  // TODO
  keywords: [identity.name, identity.role, identity.location.english].filter(Boolean),
  siteName: identity.name,
  /** Twitter card attribution. Only used if `handle` is set. */
  twitterHandle: identity.handle ? `@${identity.handle}` : undefined,
} as const

export const blogMeta = {
  // TODO
  title: `Writing — ${identity.name}`,
  description: `Notes, tutorials and build logs by ${identity.name}.`,
} as const

export const projectsMeta = {
  // TODO
  title: `Projects — ${identity.name}`,
  description: `Things ${identity.name} has built.`,
} as const

// ── Long-form context for /llms.txt and the AI chat ──────────────────────────
//
// This is what the on-site AI assistant is allowed to know about you, and what
// gets served at /llms.txt. Every section is optional — leave a list empty and
// its heading is skipped entirely, so the assistant never sees a blank section
// it might try to fill in.
//
// IMPORTANT: only put true things here. The assistant is instructed to treat
// this as its single source of truth and will repeat it verbatim to visitors.

export const dossier = {
  /** One-paragraph summary. Shown at the top of /llms.txt. */
  // TODO
  summary: `TODO: one paragraph introducing yourself — what you do, where, and what you're known for.`,

  /** Newest first. Format: 'Company (Location) — Title, Start–End. What you did.' */
  // TODO
  experience: [] as string[],

  /** Format: 'Institution — Degree (Years). Any distinction.' */
  // TODO
  education: [] as string[],

  /** Grouped skills. Delete groups you don't need. */
  // TODO
  skills: {} as Record<string, string[]>,

  /** Papers, talks, patents. Leave empty if not applicable. */
  // TODO
  publications: [] as string[],

  /** Clubs, chapters, volunteering. Leave empty if not applicable. */
  // TODO
  leadership: [] as string[],
} as const
