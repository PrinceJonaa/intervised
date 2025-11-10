'use client'

import React from 'react';

export default function TeamPage() {
  const owners = [
    {
      name: 'Prince Jona',
      title: 'Co-Founder & Tech Visionary',
      bio: 'Artist, technologist, and seeker of truth. Jona exists at the threshold between aesthetics and systems — fluent in both AI frameworks and sonic storytelling. From music production to automation architecture, he builds bridges that make technology feel human and sacred. His work is proof that code and creativity are not opposites, but collaborators in the second coming of presence.',
      image: '/images/jona-avatar.jpg',
      socials: {
        instagram: 'https://instagram.com/princejonaa',
        website: 'https://princejona.com',
        email: 'jonathanbonner128@gmail.com',
      },
    },
    {
      name: 'Reina Hondo',
      title: 'Co-Founder & Creative Catalyst',
      bio: 'Multi-instrumentalist, storyteller, and spiritual curator from Queens. Classically trained (piano, violin, viola, flute, drums), Reina bridges elevated artistry with street-level authenticity. She weaves worship, narrative, and sonic identity into cohesive brand experiences — creating music, visuals, and moments that resonate with purpose. Her gift is making art feel like breath.',
      image: '/images/reina-avatar.jpg',
      socials: {
        instagram: 'https://instagram.com/challenges_inlife',
        spotify: 'https://open.spotify.com/artist/2p9CF5W95kYJx6qLNGH4lV',
        email: 'reina.hondo@gmail.com',
      },
    },
  ]

  return (
    <section className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Meet the Intercessors</h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We are <span className="font-semibold text-deep-blue">Intervised</span> — mutually envisioned. 
          A collaborative intelligence where creativity and systems thinking meet to bridge vision and execution.
        </p>
      </div>

      <section className="mt-8 sm:mt-12">
        <h3 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center text-deep-blue px-4">Founders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {owners.map((person, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3 sm:space-y-4 p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gradient-to-br from-deep-blue to-light-gold flex items-center justify-center flex-shrink-0">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex'
                    }
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-white text-6xl font-bold">
                  {person.name.split(' ')[0][0]}
                </div>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900">{person.name}</h4>
              <p className="text-deep-blue font-semibold text-xs sm:text-sm uppercase tracking-wide">{person.title}</p>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed px-2">{person.bio}</p>
                            {person.socials && (
                <div className="flex gap-3 sm:gap-6 justify-center mt-3 sm:mt-4 flex-wrap">
                  {person.socials.instagram && (
                    <a
                      href={`https://instagram.com/${person.socials.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-deep-blue hover:text-light-gold transition-colors font-medium text-sm sm:text-base"
                    >
                      📷 Instagram
                    </a>
                  )}
                  {person.socials.spotify && (
                    <a
                      href={person.socials.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-deep-blue hover:text-light-gold transition-colors font-medium text-sm sm:text-base"
                    >
                      🎵 Spotify
                    </a>
                  )}
                  {person.socials.email && (
                    <a
                      href={`mailto:${person.socials.email}`}
                      className="text-deep-blue hover:text-light-gold transition-colors font-medium text-sm sm:text-base"
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

      <section className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-r from-deep-blue to-blue-900 text-white rounded-lg text-center space-y-3 sm:space-y-4">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">Our Philosophy</h3>
        <p className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          We believe creativity and technology are not opposites — they are collaborators. 
          Intervised exists to <span className="font-bold text-light-gold">midwife coherence</span>, 
          bringing sacred and systemic projects into reality with resonance, clarity, and trust.
        </p>
        <p className="text-sm sm:text-base max-w-2xl mx-auto text-gray-300">
          From worship content to AI automation, church tech to viral reels — we serve as the bridge 
          between what you envision and what exists.
        </p>
      </section>

      <section className="mt-8 sm:mt-12 text-center space-y-4 sm:space-y-6">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-deep-blue">Want to Collaborate?</h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto px-4">
          Whether you're a creator, ministry, or brand — we'd love to help bring your vision into form.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <a
            href="/booking"
            className="inline-block bg-deep-blue text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-deep-blue-hover transition-colors shadow-lg text-sm sm:text-base"
          >
            Book a Session
          </a>
          <a
            href="/contact"
            className="inline-block bg-light-gold text-gray-900 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-medium-gold transition-colors shadow-lg text-sm sm:text-base"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </section>
  )
}
