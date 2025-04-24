import React from 'react'

export default function BookingPage() {
  return (
    <section className="max-w-2xl mx-auto space-y-8 text-center">
      <h2 className="text-3xl font-bold">Book a Service</h2>

      <p className="text-lg text-gray-700">
        Ready to schedule your service? Click the button below to access our booking portal.
      </p>

      <a
        href="https://square.site/book/YOUR_SQUARE_BOOKING_LINK_HERE" // Replace with actual Square booking link
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
      >
        Go to Booking Portal
      </a>

      <p className="text-sm text-gray-500">
        (This link will take you to our external Square booking page for now.)
      </p>
    </section>
  )
}
