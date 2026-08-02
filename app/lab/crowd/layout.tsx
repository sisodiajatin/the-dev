import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crowd canvas — lab',
  // A scratch page for evaluating an effect. Nothing to index.
  robots: { index: false, follow: false },
}

export default function CrowdLabLayout({ children }: { children: React.ReactNode }) {
  // Breaks out of the root layout's centred, lowercased column.
  return (
    <div className="fixed inset-0 overflow-hidden normal-case" style={{ maxWidth: 'none' }}>
      {children}
    </div>
  )
}
