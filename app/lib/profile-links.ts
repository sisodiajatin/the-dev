// The links the chat AI is allowed to surface as buttons. Built from
// app/lib/profile.ts so there is exactly one place to edit them, and
// constrained to a fixed key set so the model can never emit an arbitrary
// URL — it only picks a key.
import { identity, links, linkLabels, type LinkKey } from './profile'

export type ProfileLinkKey = LinkKey | 'email'

type ProfileLink = { label: string; url: string }

function buildProfileLinks(): Partial<Record<ProfileLinkKey, ProfileLink>> {
  const entries: Partial<Record<ProfileLinkKey, ProfileLink>> = {}

  for (const key of Object.keys(linkLabels) as LinkKey[]) {
    const url = links[key]
    if (url) entries[key] = { label: linkLabels[key], url }
  }

  // Email is always available — it is the one contact route the site guarantees.
  entries.email = { label: `Email ${identity.name.split(' ')[0]}`, url: `mailto:${identity.email}` }

  return entries
}

export const PROFILE_LINKS = buildProfileLinks()
