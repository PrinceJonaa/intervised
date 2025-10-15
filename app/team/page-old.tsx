import React from 'react';

export default function TeamPage() {
  const owners = [
    {
      name: 'Jona Bonner',
      title: 'Co-Founder & Tech Visionary',
      bio: 'Bridge-builder between creativity and systems. Jona architects the technical infrastructure that brings sacred and innovative projects into form—from AI automation to livestream production. His gift is making complex technology feel human and accessible.',
      image: '/images/jona-avatar.png',
      socials: {
        instagram: 'https://instagram.com/jonathanbonner',
        email: 'jonathanbonner128@gmail.com',
      },
    },
    {
      name: 'Reina Hondo',
      title: 'Co-Founder & Creative Catalyst',
      bio: 'Storyteller and spiritual curator. Reina weaves narrative, worship, and visual artistry into cohesive brand experiences. She sees the sacred in every frame and ensures that creativity serves purpose, connection, and awakening.',
      image: '/images/reina-avatar.png',
      socials: {
        instagram: 'https://instagram.com/reinahondo',
        email: 'reina.hondo@gmail.com',
      },
    },
  ]

  return (
    <section className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Meet the Intercessors</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We are <span className="font-semibold text-deep-blue">Intervised</span> — mutually envisioned. 
          A collaborative intelligence where creativity and systems thinking meet to bridge vision and execution.
        </p>
      </div>

      <section className="mt-12">
        <h3 className="text-2xl font-semibold mb-8 text-center text-deep-blue">Founders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {owners.map((person, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-deep-blue to-light-gold flex items-center justify-center text-white text-6xl font-bold">
                {person.name.split(' ')[0][0]}
              </div>
              <h4 className="text-2xl font-bold text-gray-900">{person.name}</h4>
              <p className="text-deep-blue font-semibold text-sm uppercase tracking-wide">{person.title}</p>
              <p className="text-gray-700 leading-relaxed">{person.bio}</p>
              {person.socials && (
                <div className="flex space-x-4 pt-4">
                  {person.socials.instagram && (
                    <a
                      href={person.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-deep-blue hover:text-light-gold transition-colors font-medium"
                    >
                      📱 Instagram
                    </a>
                  )}
                  {person.socials.email && (
                    <a
                      href={`mailto:${person.socials.email}`}
                      className="text-deep-blue hover:text-light-gold transition-colors font-medium"
                    >
                      ✉️ Email
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 p-8 bg-gradient-to-r from-deep-blue to-blue-900 text-white rounded-lg text-center space-y-4">
        <h3 className="text-2xl font-bold">Our Philosophy</h3>
        <p className="text-lg max-w-3xl mx-auto leading-relaxed">
          We believe creativity and technology are not opposites — they are collaborators. 
          Intervised exists to <span className="font-bold text-light-gold">midwife coherence</span>, 
          bringing sacred and systemic projects into reality with resonance, clarity, and trust.
        </p>
        <p className="text-md max-w-2xl mx-auto text-gray-300">
          From worship content to AI automation, church tech to viral reels — we serve as the bridge 
          between what you envision and what exists.
        </p>
      </section>

      <section className="mt-12 text-center space-y-6">
        <h3 className="text-2xl font-semibold text-deep-blue">Want to Collaborate?</h3>
        <p className="text-gray-600 max-w-xl mx-auto">
          Whether you're a creator, ministry, or brand — we'd love to help bring your vision into form.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/booking"
            className="inline-block bg-deep-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-deep-blue-hover transition-colors shadow-lg"
          >
            Book a Session
          </a>
          <a
            href="/contact"
            className="inline-block bg-light-gold text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-medium-gold transition-colors shadow-lg"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </section>
  )
}

  const collaborators = [
    {
      name: 'Collaborator Name 1', // Replace with actual name
      title: 'Role',
      bio: 'Brief description of their contribution.',
      image: '/images/placeholder-avatar.png', // Placeholder image
    },
    {
      name: 'Collaborator Name 2', // Replace with actual name
      title: 'Role',
      bio: 'Brief description of their contribution.',
      image: '/images/placeholder-avatar.png', // Placeholder image
    },
  ]

  const partners = [
    {
      name: 'Partner Name 1', // Replace with actual name
      description: 'Brief description of the partnership.',
      logo: '/images/placeholder-logo.png', // Placeholder image
    },
  ]

  return (
    <section className="max-w-4xl mx-auto space-y-12">
      <h2 className="text-3xl font-bold text-center">Meet the Team</h2>

      <section>
        <h3 className="text-2xl font-semibold mb-6">Owners</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {owners.map((person, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <img
                src={person.image}
                alt={person.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              <h4 className="text-xl font-semibold">{person.name}</h4>
              <p className="text-blue-600 font-medium">{person.title}</p>
              <p className="text-gray-700">{person.bio}</p>
              {person.socials && (
                <div className="flex space-x-4">
                  {person.socials.instagram && (
                    <a
                      href={person.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Instagram
                    </a>
                  )}
                  {person.socials.linkedin && (
                    <a
                      href={person.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-6">Collaborators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collaborators.map((person, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <img
                src={person.image}
                alt={person.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <h4 className="text-lg font-semibold">{person.name}</h4>
              <p className="text-blue-600 font-medium">{person.title}</p>
              <p className="text-gray-700">{person.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-6">Partners</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map((partner, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-24 h-24 object-contain"
              />
              <h4 className="text-lg font-semibold">{partner.name}</h4>
              <p className="text-gray-700">{partner.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center mt-12">
        <h3 className="text-2xl font-semibold mb-4">Want to work with us?</h3>
        <p className="text-lg text-gray-700">
          If you're interested in collaborating or partnering, please reach out!
        </p>
        {/* Replace with actual form link or DM link */}
        <PrimaryButton href="/contact" className="mt-4">
          Contact Us
        </PrimaryButton>
      </section>
    </section>
  )
}
