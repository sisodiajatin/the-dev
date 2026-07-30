import { ImageResponse } from 'next/og'
import { baseUrl, identity } from 'app/lib/profile'

const SITE_HOST = new URL(baseUrl).host
const BYLINE = identity.handle ? `@${identity.handle}` : identity.name

// Long titles blow out the layout and let anyone mint a giant image via the
// query string, so cap it.
const MAX_TITLE_LENGTH = 120

export function GET(request: Request) {
  const url = new URL(request.url)
  const raw = url.searchParams.get('title') || identity.name
  const title = raw.length > MAX_TITLE_LENGTH ? `${raw.slice(0, MAX_TITLE_LENGTH)}…` : raw

  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full justify-between bg-black text-white p-16"
        style={{ fontFamily: 'serif' }}
      >
        <div tw="flex flex-col">
          <div tw="flex items-center mb-4">
            <span tw="text-lg text-neutral-400">{SITE_HOST}</span>
          </div>
          <h2 tw="flex flex-col text-5xl font-bold tracking-tight text-left leading-tight">
            {title}
          </h2>
        </div>
        <div tw="flex items-center justify-between w-full">
          <div tw="flex items-center">
            <span tw="text-2xl font-bold text-white">{BYLINE}</span>
            <span tw="text-xl text-neutral-400 ml-4">{identity.role}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  )
}
