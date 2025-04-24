import React from 'react'

export default function ServicesPage() {
  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Our Services</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-xl">Creative Services</h3>
          <p className="text-gray-700">
            Videography, photography, music production, and more to bring your vision to life.
          </p>
          {/* Add a link to a potential sub-page or just keep it as a category overview */}
          {/* <a href="/services/creative" className="text-blue-600 hover:underline">Learn More</a> */}
        </div>

        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-xl">Tech & Automation</h3>
          <p className="text-gray-700">
            AI bots, OBS setup, automation consulting, and technical solutions.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-xl">Captions & Content</h3>
          <p className="text-gray-700">
            High-quality captions, VCDF packs, hooks, and hashtags to boost your content.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-xl">Social Media Services</h3>
          <p className="text-gray-700">
            Instagram growth strategies, scheduling, and optimization.
          </p>
        </div>

        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition space-y-2">
          <h3 className="font-semibold text-xl">Ministry Tech</h3>
          <p className="text-gray-700">
            Specialized tech solutions for churches, including livestreams and kid kits.
          </p>
        </div>
      </div>

      <section className="text-center mt-8">
        <h3 className="text-2xl font-semibold mb-4">Ready to get started?</h3>
        <a
          href="/booking"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Book a Service
        </a>
      </section>
    </section>
  )
}
