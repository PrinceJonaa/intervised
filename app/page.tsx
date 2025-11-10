import React from 'react';
import PrimaryButton from './components/PrimaryButton';

export default function HomePage() {
  return (
    <section className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center leading-tight px-2">
        Creative + Tech Services for Creators, Ministries, and Brands
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 px-2">
        <PrimaryButton href="/booking" className="w-full sm:w-auto">Book a Service</PrimaryButton>
        <PrimaryButton
          href="/team"
          className="w-full sm:w-auto bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300 shadow-gray-400"
        >
          Meet the Team
        </PrimaryButton>
        <PrimaryButton
          href="/services"
          className="w-full sm:w-auto bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300 shadow-gray-400"
        >
          Explore Services
        </PrimaryButton>
      </div>

      <section>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 px-2">Our Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-base sm:text-lg mb-2">Creative</h4>
            <p className="text-sm sm:text-base text-gray-600">Videography, photography, music production</p>
          </div>
          <div className="p-4 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-base sm:text-lg mb-2">Tech</h4>
            <p className="text-sm sm:text-base text-gray-600">AI bots, OBS setup, automation consulting</p>
          </div>
          <div className="p-4 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-base sm:text-lg mb-2">Captions & Content</h4>
            <p className="text-sm sm:text-base text-gray-600">Captions, VCDF packs, hooks, hashtags</p>
          </div>
          <div className="p-4 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-base sm:text-lg mb-2">Social</h4>
            <p className="text-sm sm:text-base text-gray-600">Instagram growth, scheduling, optimization</p>
          </div>
          <div className="p-4 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-base sm:text-lg mb-2">Ministry</h4>
            <p className="text-sm sm:text-base text-gray-600">Church tech, livestreams, kid kits</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 px-2">Book a Service</h3>
        <div className="text-center">
          <p className="mb-4 text-sm sm:text-base text-gray-700">Ready to get started?</p>
          <PrimaryButton href="/booking" target="_blank" rel="noopener noreferrer">
            Book your service here
          </PrimaryButton>
        </div>
      </section>

      <section>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 px-2">Latest Blog Posts</h3>
        <p className="text-sm sm:text-base text-gray-700 px-2">Coming soon...</p>
      </section>
    </section>
  )
}
