import React from 'react'

export default function ContactPage() {
  return (
    <section className="max-w-2xl mx-auto space-y-8 text-center">
      <h2 className="text-3xl font-bold">Contact Us</h2>

      <p className="text-lg text-gray-700">
        We'd love to hear from you! Reach out to us via phone or email.
      </p>

      <div className="space-y-4">
        <p className="text-xl font-semibold">
          Phone: <a href="tel:+13475040351" className="text-blue-600 hover:underline">347-504-0351</a>
        </p>
        <p className="text-xl font-semibold">
          Email: <a href="mailto:intervised.llc@gmail.com" className="text-blue-600 hover:underline">intervised.llc@gmail.com</a>
        </p>
      </div>

      {/* Simple Contact Form Placeholder */}
      <div className="mt-8 p-6 border rounded-lg shadow-sm space-y-4 text-left">
        <h3 className="text-2xl font-semibold text-center">Send us a Message</h3>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
