import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Minimal monogram favicon — black square, white italic J. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          fontSize: 20,
          fontStyle: 'italic',
          fontWeight: 600,
          fontFamily: 'Georgia, serif',
        }}
      >
        J
      </div>
    ),
    { ...size }
  )
}
