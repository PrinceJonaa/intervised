import React from 'react';
import PrimaryButton from '../components/PrimaryButton';

export default function ServicesPage() {
  return (
    <section className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">Our Services</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-lg sm:text-xl">Creative Services</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            Videography, photography, music production, and more to bring your vision to life.
          </p>
          {/* Add a link to a potential sub-page or just keep it as a category overview */}
          {/* <a href="/services/creative" className="text-blue-600 hover:underline">Learn More</a> */}
        </div>

        <div className="p-5 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-lg sm:text-xl">Tech & Automation</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            AI bots, OBS setup, automation consulting, and technical solutions.
          </p>
        </div>

        <div className="p-5 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-lg sm:text-xl">Captions & Content</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            High-quality captions, VCDF packs, hooks, and hashtags to boost your content.
          </p>
        </div>

        <div className="p-5 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-lg sm:text-xl">Social Media Services</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            Instagram growth strategies, scheduling, and optimization.
          </p>
        </div>

        <div className="p-5 sm:p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-lg sm:text-xl">Ministry Tech</h3>
          <p className="text-gray-700 text-sm sm:text-base">
            Specialized tech solutions for churches, including livestreams and kid kits.
          </p>
        </div>
      </div>

      <section className="text-center mt-6 sm:mt-8">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4">Ready to get started?</h3>
        <PrimaryButton href="/booking">Book a Service</PrimaryButton>
      </section>
    </section>
  )
}
