import React from 'react';
import PrimaryButton from './components/PrimaryButton';

export default function HomePage() {
  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">
        Creative + Tech Services for Creators, Ministries, and Brands
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
        <PrimaryButton href="/booking">Book a Service</PrimaryButton>
        <PrimaryButton
          href="/team"
          className="bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300 shadow-gray-400"
        >
          Meet the Team
        </PrimaryButton>
        <PrimaryButton
          href="/services"
          className="bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300 shadow-gray-400"
        >
          Explore Services
        </PrimaryButton>
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
        <div className="text-center">
          <p className="mb-4">Ready to get started?</p>
          <PrimaryButton href="/booking" target="_blank" rel="noopener noreferrer">
            Book your service here
          </PrimaryButton>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Latest Blog Posts</h3>
        <p>Coming soon...</p>
      </section>
    </section>
  )
}
