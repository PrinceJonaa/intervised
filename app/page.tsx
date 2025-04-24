import React from 'react'

export default function HomePage() {
  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">
        Creative + Tech Services for Creators, Ministries, and Brands
      </h2>

      <div className="flex justify-center space-x-6">
        <a
          href="/booking"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Book a Service
        </a>
        <a
          href="/team"
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          Meet the Team
        </a>
        <a
          href="/services"
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
        >
          Explore Services
        </a>
      </div>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Our Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 border rounded shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg">Creative</h4>
            <p>Videography, photography, music production</p>
          </div>
          <div className="p-4 border rounded shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg">Tech</h4>
            <p>AI bots, OBS setup, automation consulting</p>
          </div>
          <div className="p-4 border rounded shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg">Captions & Content</h4>
            <p>Captions, VCDF packs, hooks, hashtags</p>
          </div>
          <div className="p-4 border rounded shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg">Social</h4>
            <p>Instagram growth, scheduling, optimization</p>
          </div>
          <div className="p-4 border rounded shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg">Ministry</h4>
            <p>Church tech, livestreams, kid kits</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Book a Service</h3>
        <p>
          Ready to get started?{' '}
          <a
            href="/booking"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book your service here
          </a>
          .
        </p>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Latest Blog Posts</h3>
        <p>Coming soon...</p>
      </section>
    </section>
  )
}
