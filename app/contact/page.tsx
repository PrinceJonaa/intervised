import React from 'react'

export default function ContactPage() {
  return (
    <section className="max-w-2xl mx-auto space-y-6 sm:space-y-8 text-center px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Contact Us</h2>

      <p className="text-base sm:text-lg text-gray-700">
        We'd love to hear from you! Reach out to us via phone or email.
      </p>

      <div className="space-y-3 sm:space-y-4">
        <p className="text-lg sm:text-xl font-semibold">
          Phone: <a href="tel:+13475040351" className="text-blue-600 hover:underline">347-504-0351</a>
        </p>
        <p className="text-lg sm:text-xl font-semibold">
          Email: <a href="mailto:intervised.llc@gmail.com" className="text-blue-600 hover:underline break-all">intervised.llc@gmail.com</a>
        </p>
      </div>

      {/* Simple Contact Form Placeholder */}
      <div className="mt-6 sm:mt-8 p-5 sm:p-6 border rounded-lg shadow-sm space-y-4 text-left">
        <h3 className="text-xl sm:text-2xl font-semibold text-center">Send us a Message</h3>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="w-full sm:w-auto inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
