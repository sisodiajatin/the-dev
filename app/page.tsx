import MainHeader from './components/header'
import Current from './components/current'
import Previous from './components/previous'
import Writings from './components/writings'
import Builds from './components/builds'
import Contact from './components/contact'
import { baseUrl, dossier, homepage, identity, sameAs } from './lib/profile'

export default function Page() {
  const knowsAbout = Object.values(dossier.skills).flat()

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.name,
    ...(identity.handle ? { alternateName: [identity.handle, `@${identity.handle}`] } : {}),
    url: baseUrl,
    image: `${baseUrl}/icon.png`,
    jobTitle: identity.role,
    ...(homepage.current
      ? {
          worksFor: {
            '@type': 'Organization',
            name: homepage.current.company,
            ...(homepage.current.url ? { url: homepage.current.url } : {}),
          },
        }
      : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }

  return (
    <div className="flex flex-col gap-figma-outside-gap">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <MainHeader />
      <Current />
      <Previous />
      <Writings />
      <Builds />
      <Contact />
    </div>
  )
}
