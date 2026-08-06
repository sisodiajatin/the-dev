import MainHeader from './components/header'
import Current from './components/current'
import Previous from './components/previous'
import Writings from './components/writings'
import Builds from './components/builds'
import Contact from './components/contact'
import Reveal from './components/reveal'
import { baseUrl, dossier, homepage, identity, sameAs } from './lib/profile'

export default function Page() {
  const knowsAbout = Object.values(dossier.skills).flat()

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.name,
    ...(identity.handle ? { alternateName: [identity.handle, `@${identity.handle}`] } : {}),
    url: baseUrl,
    image: `${baseUrl}/icon`,
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
      <Reveal index={0}>
        <MainHeader />
      </Reveal>
      <Reveal index={1}>
        <Current />
      </Reveal>
      <Reveal index={2}>
        <Previous />
      </Reveal>
      <Reveal index={3}>
        <Writings />
      </Reveal>
      <Reveal index={4}>
        <Builds />
      </Reveal>
      <Reveal index={5}>
        <Contact />
      </Reveal>
    </div>
  )
}
