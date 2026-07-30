import { tool, type InferUITools, type UIDataTypes, type UIMessage } from "ai"
import { z } from "zod"
import { PROFILE_LINKS, type ProfileLinkKey } from "./profile-links"
import { identity } from "./profile"

// Only the links that are actually configured. `email` is always present, so
// this is never empty — which matters because z.enum needs a non-empty tuple.
const PROFILE_LINK_KEYS = Object.keys(PROFILE_LINKS) as [ProfileLinkKey, ...ProfileLinkKey[]]

const FIRST_NAME = identity.name.split(" ")[0]

export const chatTools = {
  // No execute — the client renders this tool call as a button.
  showLinkButton: tool({
    description:
      `Display a clickable button that opens one of ${FIRST_NAME}'s profiles or pages. ` +
      `Call this whenever the user asks for a social profile, a resume, an email address, ` +
      `or to book a call. Available targets: ${PROFILE_LINK_KEYS.join(", ")}.`,
    inputSchema: z.object({
      target: z.enum(PROFILE_LINK_KEYS),
    }),
  }),
}

export type ChatMessage = UIMessage<unknown, UIDataTypes, InferUITools<typeof chatTools>>
