import React from 'react'

export default function TeamPage() {
  const owners = [
    {
      name: 'Your Name', // Replace with actual name
      title: 'Owner',
      bio: 'Brief bio about your role and background.',
      image: '/images/placeholder-avatar.png', // Placeholder image
      socials: {
        instagram: '#', // Replace with actual links
        linkedin: '#',
      },
    },
    {
      name: 'Reina', // Replace with actual name
      title: 'Owner',
      bio: 'Brief bio about Reina\'s role and background.',
      image: '/images/placeholder-avatar.png', // Placeholder image
      socials: {
        instagram: '#', // Replace with actual links
        linkedin: '#',
      },
    },
  ]

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
        <a
          href="/contact"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition mt-4"
        >
          Contact Us
        </a>
      </section>
    </section>
  )
}
